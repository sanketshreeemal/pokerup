Product Requirements Document (PRD): Gemini AI Poker Settlement Integration
Project Name: Poker Nights AI Settlement Feature



1. Introduction
This document outlines the requirements and implementation plan for integrating Google Gemini 1.5 Flash model via Vertex AI into the existing Poker Nights application. The goal is to provide users with an AI-powered solution to efficiently settle debts and credits among players at the end of a poker game, minimizing the number of transactions.

2. Project Goal
To enhance the Poker Nights application by enabling AI-driven settlement calculations, offering a quick, fair, and optimized method for players to settle up their final balances.

3. Current State & Technology Stack
Frontend: React (Next.js), Tailwind CSS, Shadcn UI components.
Backend/Services: Google Authentication, Firebase (Firestore, Cloud Functions).
Hosting: Google Cloud Platform.
Existing Cloud Functions: One Cloud Function already enabled.

4. New Feature: AI Settlement
4.1. User Flow
User plays poker and inputs player names and their final net positions (positive for owed, negative for owes) into the Poker Nights application.
User navigates to the "Settle Up" page.
User clicks a button (e.g., "Calculate AI Settlement").
The application displays a loading indicator (spinner/skeleton) while the AI processes the request.
The application securely sends the player data (net positions) and any optional natural language instructions to a backend Cloud Function.
The Cloud Function securely calls the Google Gemini 1.5 Flash model on Vertex AI with the player data and a fixed prompt.
The Gemini model processes the request and returns a simplified settlement plan (e.g., "Player A -> Player B $X").
The Cloud Function sends this settlement plan back to the Next.js application.
The Next.js application displays the AI-generated settlement plan to the user in a Shadcn component.
4.2. Core Functionality
Input Data Collection: Gather player names and their net_position (positive for owed, negative for owes) from the application's Firestore data. 
    Already have a firebase function that reads the backend data to provide a summary in the @settle page - can feed the same to the cloud function
        const summaries = game.playerUsernames.map(username => {
      const player = game.players[username];
      const outOfPocket = player.buyInInitial + player.addBuyIns - player.cashOuts;
      // Ensure finalStack is a number, default to outOfPocket if not available
      const finalStack = typeof player.finalStack === 'number' ? player.finalStack : outOfPocket;
      const netPosition = finalStack - outOfPocket;

      return {
        username,
        outOfPocket,
        finalStack,
        netPosition
      };
    });
User Instructions: Allow users to input additional natural language instructions (e.g., "Player C can only pay Player B").
Secure Backend Call: Utilize an HTTPS Callable Cloud Function to act as a secure intermediary between the frontend and Vertex AI.
Vertex AI Integration: Call the Gemini 1.5 Flash model on Vertex AI with the formatted player data and a custom prompt.
Settlement Logic (AI-driven): The Gemini model will determine the minimum number of transactions required to settle all player debts/credits.
Output Presentation: Display the settlement plan in a clear, human-readable format.

5. Technical Specifications
5.1. Google Cloud Services
Vertex AI: Specifically the Gemini 2.0 Flash model.
Cloud Functions: To host the backend logic for interacting with Vertex AI.
Firebase Firestore: For storing player data.
Identity and Access Management (IAM): For secure authentication between services.
5.2. Data Formats
Input to Cloud Function (from Next.js) Dummy example data:
    {
    "players": [
        { "name": "Player A", "net_position": 100 },
        { "name": "Player B", "net_position": -50 },
        { "name": "Player C", "net_position": -50 }
    ],
    "instructions": "Player A owes Player B, Player C owes Player A." // Optional, can be empty string
    }
Input to Gemini Model (within Cloud Function):
The prompt sent to Gemini will combine a fixed instruction part with the JSON player data and any user-provided instructions.

Fixed Prompt Part:
    "You are an AI assistant designed to calculate the most efficient way to settle poker debts.
    You will be provided with a JSON array of players, where each player has a 'name' and a 'net_position'.
    A positive 'net_position' means the player is owed that amount. A negative 'net_position' means the player owes that amount.
    Your goal is to find the minimum number of transactions to settle all players.
    Present your output in the format 'Player A -> Player B X', with each transaction on a new line.
    Do not include any introductory or concluding remarks, just the transactions."

Combined Prompt Structure (example):
    const prompt = `
    ${fixedPromptPart}

    Here are the players:
    ${JSON.stringify(playersData, null, 2)}

    Special instructions:
    ${userInstructions}
    `;

Output from Gemini Model (example):
    Player B -> Player A $50
    Player C -> Player A $50
This string will be parsed and displayed directly by the frontend.

5.3. Error Handling
Frontend: Display a user-friendly error message (e.g., "Failed to calculate settlement. Please try again.") and hide the loading indicator.
Cloud Function: Implement try-catch blocks for API calls, logging errors to Cloud Logging. Return appropriate HTTP error codes (e.g., 500 for server error, 400 for bad request) to the frontend.
Vertex AI: Handle potential QuotaExceeded or RateLimitExceeded errors from Vertex AI, returning a specific message to the user if encountered. Rate limits are not currently set, but will be something to think about in the future after the implementation works in development. 

5.4. Security Considerations
No API Keys on Frontend: Never expose Google Cloud API keys or service account credentials directly in the Next.js frontend code. All sensitive operations must happen within the secure Cloud Function.

6. Implementation Phases and Steps

// --- Existing Imports (keep these!) ---
import * as functions from 'firebase-functions'; // If using v1 functions
import { onRequest } from 'firebase-functions/v2/https'; // Or v2 imports
import * as logger from 'firebase-functions/logger';
// ... other imports for your existing functions (firebase-admin, etc.) ...

// --- New Imports for Vertex AI ---
import { VertexAI } from '@google-cloud/vertexai'; // This library must be installed in functions/

// functions/index.js
const functions = require('firebase-functions');
const { VertexAI } = require('@google-cloud/vertexai');

// Initialize Vertex AI
const project = 'poker-nights-17bed'; // Your Google Cloud Project ID - can use ENV variable
const location = 'us-central1'; // Your chosen region (match Step 1.1)

const vertexAI = new VertexAI({ project, location });
const generativeModel = vertexAI.get  generativeModel({
  model: 'gemini-1.5-flash', // The specific Gemini model you want to use
  generationConfig: {
    temperature: 0.2, // Adjust as needed for creativity vs. determinism
    topK: 40,
    topP: 0.95,
  },
  // You might add safety settings here if needed:
  // safetySettings: [
  //   {
  //     category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
  //     threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  //   },
  //   // ... other categories
  // ],
});

exports.settlePokerPlayers = functions.https.onCall(async (data, context) => {
  // 1. Authentication (optional but recommended for production)
  // if (!context.auth) {
  //   throw new functions.https.HttpsError(
  //     'unauthenticated',
  //     'The function must be called while authenticated.'
  //   );
  // }

  // 2. Input Validation (basic for now, enhance later if needed)
  const players = data.players;
  const instructions = data.instructions || ''; // Default to empty string if no instructions

  if (!Array.isArray(players) || players.length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Player data is missing or invalid.'
    );
  }

  // Ensure players have 'name' and 'net_position'
  for (const player of players) {
    if (typeof player.name !== 'string' || typeof player.net_position !== 'number') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Each player must have a string name and a numeric net_position.'
      );
    }
  }

  // 3. Construct the prompt for Gemini
  const fixedPromptPart = `You are an AI assistant designed to calculate the most efficient way to settle poker debts.
  You will be provided with a JSON array of players, where each player has a 'name' and a 'net_position'.
  A positive 'net_position' means the player is owed that amount. A negative 'net_position' means the player owes that amount.
  Your goal is to find the minimum number of transactions to settle all players.
  Present your output in the format 'Player A -> Player B $X', with each transaction on a new line.
  Do not include any introductory or concluding remarks, just the transactions.`;

  const fullPrompt = `
  ${fixedPromptPart}

  Here are the players:
  ${JSON.stringify(players, null, 2)}

  Special instructions:
  ${instructions}
  `;

  functions.logger.info('Sending prompt to Gemini:', fullPrompt); // Log the prompt for debugging

  try {
    // 4. Make the call to Vertex AI
    const result = await generativeModel.generateContent(fullPrompt);
    const responseText = result.response.candidates[0].content.parts[0].text;

    functions.logger.info('Gemini response:', responseText); // Log the response

    // 5. Return the result to the frontend
    return { settlement: responseText };

  } catch (error) {
    functions.logger.error('Error calling Gemini API:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get settlement from AI. Please try again later.',
      error.message // Include original error message for debugging (remove for production if sensitive)
    );
  }
});

Next step - Deploy the Cloud function - firebase deploy --only functions:settlePokerPlayers

6. Front End Integration
Implement AI settlement component logic in the button where AI settlement needs to be triggered. Also make sure that the model output is properly presented to the user in the right component/page in the application. The cloud function should be called at the right time to process the infromation, and the user should be sent to the next page as the cloud function produces a model output. 



-------------------

## Debugging the AI Settlement Feature

### Client-Side Debug Logs
The following debug logs have been added to the client-side code to help troubleshoot issues with the AI settlement feature:

1. In the `src/app/game/[id]/settle/page.tsx` file:
   - `console.log("AI Input JSON:", JSON.stringify(aiInput, null, 2))` - Shows the exact JSON input being sent to the cloud function
   - `console.log("Calling settlePokerGame function with gameId:", params.id)` - Logs when the cloud function is being called
   - `console.log("Cloud Function response:", result.data)` - Shows the response from the cloud function
   - `console.log("Manually updated settlement field with:", responseData.settlement)` - Confirms when settlement data is manually updated

2. In the `src/app/game/[id]/end-game/page.tsx` file:
   - `console.log("Fetching settlement data for gameId:", params.id)` - Logs when fetching settlement data
   - `console.log("Game document data:", gameData)` - Shows the game document data retrieved from Firestore
   - `console.log("Settlement found:", gameData.settlement)` - Logs when settlement data is found
   - `console.error("No settlement field in game document")` - Logs when no settlement field is found
   - `console.error("Game document not found")` - Logs when the game document is not found

### Cloud Function Debug Logs
The following debug logs have been added to the cloud function to help troubleshoot issues:

1. In the `functions/src/index.ts` file:
   - `console.log("Sending prompt to Gemini:", fullPrompt)` - Shows the full prompt being sent to the Gemini model
   - `console.log("Calling Gemini API with prompt...")` - Logs when the Gemini API is being called
   - `console.log("Received response from Gemini API:", JSON.stringify(result, null, 2))` - Shows the full response from Gemini
   - `console.log("Gemini response text:", responseText)` - Shows just the text part of the Gemini response
   - `console.log("Updating game document with gameId:", data.gameId)` - Logs when updating the game document
   - `console.log("Auth context present:", !!context.auth)` - Shows if authentication context is present
   - `console.log(`Attempting to update game document with ID: ${data.gameId}`)` - Logs when attempting to update the game document
   - `console.log(`Settlement text to save: ${responseText.substring(0, 50)}${responseText.length > 50 ? '...' : ''}`)` - Shows the first 50 characters of the settlement text being saved
   - `console.log(`Successfully verified settlement was saved to game ${data.gameId}`)` - Confirms when settlement data is successfully saved
   - `console.error(`Failed to verify settlement in game ${data.gameId} after update`)` - Logs when verification of saved settlement fails

### Firestore Utils Debug Logs
1. In the `src/lib/firebase/firebaseUtils.ts` file:
   - `console.log('Completing game and checking for settlement field:', gameId)` - Logs when completing a game
   - `console.log('No settlement field found while completing game')` - Logs when no settlement field is found during game completion
   - `console.log('Settlement field exists, preserving it during game completion')` - Logs when settlement field exists and is being preserved

**Note:** These debug logs should be removed or disabled in production to avoid exposing sensitive information and to improve performance. 