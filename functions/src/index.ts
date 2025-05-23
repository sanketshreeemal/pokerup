import * as functionsV1 from "firebase-functions/v1";
import * as admin from "firebase-admin";
import {VertexAI} from "@google-cloud/vertexai";

admin.initializeApp();

interface PlayerData {
  displayName: string;
  email: string;
  photoURL: string;
  username: null;
  createdAt: admin.firestore.FieldValue;
}

export const onUserCreate = functionsV1.auth
  .user()
  .onCreate(async (user: admin.auth.UserRecord) => {
    const playerRef = admin.firestore().doc(`players/${user.uid}`);
    try {
      const playerData: PlayerData = {
        displayName: user.displayName ?? user.email?.split("@")[0] ?? "Player",
        email: user.email ?? "",
        photoURL: user.photoURL ?? "",
        username: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await playerRef.set(playerData);
      console.log(`Created player document for: ${user.uid}`);
    } catch (error: unknown) {
      const errMsg = `Error creating player document for: ${user.uid}`;
      console.error(errMsg, error);
    }
  });

// Add AI settlement calculation function
interface PlayerSettlementData {
  name: string;
  net_position: number;
}

interface SettlementRequest {
  players: PlayerSettlementData[];
  instructions?: string;
  gameId?: string;
}

// Initialize Vertex AI
const project = "poker-nights-17bed"; // Google Cloud Project ID
const location = "us-central1";
const vertexAI = new VertexAI({project, location});

// eslint-disable-next-line max-len
export const settlePokerGame = functionsV1
  .runWith({
    // Ensure adequate timeout for the AI call
    timeoutSeconds: 300,
    memory: "1GB",
  })
  .https.onCall(async (data: SettlementRequest, context: functionsV1.https.CallableContext) => {
  // Validate the request
    if (!data.players || !Array.isArray(data.players) || data.players.length === 0) {
      throw new functionsV1.https.HttpsError(
        "invalid-argument",
        "Player data is missing or invalid."
      );
    }

    // Ensure each player has the required fields
    for (const player of data.players) {
      if (typeof player.name !== "string" || typeof player.net_position !== "number") {
        throw new functionsV1.https.HttpsError(
          "invalid-argument",
          "Each player must have a string name and a numeric net_position."
        );
      }
    }

    // Verify that the sum of all net positions is close to zero
    const sumOfPositions = data.players.reduce((sum, player) => sum + player.net_position, 0);
    if (Math.abs(sumOfPositions) > 0.01) {
      console.warn(`Sum of net positions is not zero: ${sumOfPositions}`);
    }

    try {
    // Construct the prompt for Gemini
    // eslint-disable-next-line max-len
      const fixedPromptPart = `You are a debt-settlement assistant.
    Input: a JSON object with:
    • players: list of {name, net_position}
    • instructions (optional): special rules or pre-existing balances
    Goal: First, ensure all debts are fully settled; second, minimize the number of transactions.
    Output: only lines in the form "<Payer> -> <Receiver> <Amount>", one per line, no extra text.`;

      const instructions = data.instructions || "";
      const fullPrompt = `
${fixedPromptPart}

Here are the players:
${JSON.stringify(data.players, null, 2)}

Special instructions:
${instructions}
`;

      console.log("Sending prompt to Gemini:", fullPrompt);

      // Initialize the Gemini model
      const generativeModel = vertexAI.getGenerativeModel({
        model: "gemini-2.5-flash-preview-05-20",
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
        },
      });

      // Call the Gemini model
      console.log("Calling Gemini API with prompt...");
      const result = await generativeModel.generateContent(fullPrompt);
      console.log("Received response from Gemini API:", JSON.stringify(result, null, 2));

      // eslint-disable-next-line max-len
      if (!result || !result.response || !result.response.candidates || result.response.candidates.length === 0 || !result.response.candidates[0].content || !result.response.candidates[0].content.parts || result.response.candidates[0].content.parts.length === 0) {
        console.error("Invalid or empty response structure from Gemini");
        throw new Error("Received empty or invalid response from Gemini");
      }

      const responseText = result.response.candidates[0].content.parts[0].text;
      if (!responseText || responseText.trim() === "") {
        console.error("Empty text response from Gemini");
        throw new Error("Received empty text response from Gemini");
      }

      console.log("Gemini response text:", responseText);

      // Update the game document with the settlement information
      console.log("Updating game document with gameId:", data.gameId);
      console.log("Auth context present:", !!context.auth);

      // Always try to update document regardless of auth
      if (data.gameId) {
        try {
          const gameRef = admin.firestore().doc(`games/${data.gameId}`);
          console.log(`Attempting to update game document with ID: ${data.gameId}`);
          console.log(`Settlement text to save: ${responseText.substring(0, 50)}${responseText.length > 50 ? "..." : ""}`);

          await gameRef.update({
            settlement: responseText,
            status: "complete",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Verify the update was successful by reading the document back
          const updatedDoc = await gameRef.get();
          const updatedData = updatedDoc.data();
          if (updatedData && updatedData.settlement) {
            console.log(`Successfully verified settlement was saved to game ${data.gameId}`);
          } else {
            console.error(`Failed to verify settlement in game ${data.gameId} after update`);
          }
        } catch (error: unknown) {
          console.error("Error updating game document:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          console.error(`Detailed error updating game ${data.gameId}: ${errorMessage}`);
        // Continue even if we can't update the document
        }
      } else {
        console.error("No gameId provided, cannot update settlement");
      }

      // Return the result
      return {settlement: responseText};
    } catch (error: unknown) {
      console.error("Error calling Gemini API:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new functionsV1.https.HttpsError(
        "internal",
        "Failed to get settlement from AI. Please try again later.",
        errorMessage
      );
    }
  });
