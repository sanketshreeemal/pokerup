import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  runTransaction,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { UsernameReservationResponse, PlayerData, GameCardData, PlayerDetail } from "../../types";

// Auth functions
export const logoutUser = () => signOut(auth);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

// Firestore functions
export const addDocument = (collectionName: string, data: any) =>
  addDoc(collection(db, collectionName), data);

export const getDocuments = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateDocument = (collectionName: string, id: string, data: any) =>
  updateDoc(doc(db, collectionName, id), data);

export const deleteDocument = (collectionName: string, id: string) =>
  deleteDoc(doc(db, collectionName, id));

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// Check if user has username
export async function checkUserHasUsername(uid: string): Promise<boolean> {
  try {
    const playerDoc = await getDoc(doc(db, "players", uid));
    if (!playerDoc.exists()) {
      console.error("Player document not found for uid:", uid);
      return false;
    }
    const data = playerDoc.data() as PlayerData;
    return data.username !== null;
  } catch (error) {
    console.error("Error checking username:", error);
    return false;
  }
}

// Username Reservation
export async function reserveUsername(uid: string, username: string): Promise<UsernameReservationResponse> {
  username = username.trim().toLowerCase();
  
  if (!username || username.length < 6 || username.length > 20 || !/^[a-z0-9_]+$/.test(username) || username.includes(' ')) {
    throw new Error("Username must be 6-20 characters long and contain only lowercase letters, numbers, and underscores. No spaces allowed.");
  }
  
  const usernameRef = doc(db, "usernames", username);
  const playerRef = doc(db, "players", uid);

  return runTransaction(db, async (txn) => {
    const usernameDoc = await txn.get(usernameRef);
    if (usernameDoc.exists()) {
      throw new Error("Username already taken. Please choose another.");
    }

    const playerDoc = await txn.get(playerRef);
    if (!playerDoc.exists()) {
      throw new Error("Player document does not exist. Cannot reserve username.");
    }

    if (playerDoc.data()?.username) {
      throw new Error("Player already has a username.");
    }

    txn.set(usernameRef, { uid });
    txn.update(playerRef, { username: username });
    return { success: true, username: username };
  });
}

// All game related functions that create, update and delete collections, docuemnts, fields etc go below here. 

// Game-related functions
interface CreateGameParams {
  name: string;
  currency: string; 
  hostUsername: string;
  players: Record<string, number>; // Map of username to initial buy-in amount
}

/**
 * Creates a new poker game
 * @param params Object containing game parameters
 * @returns Object with gameId
 */
export async function createGame(params: CreateGameParams): Promise<{ gameId: string }> {
  // Validate inputs
  if (!params.name || params.name.trim() === '') {
    throw new Error('Game name is required');
  }
  
  if (params.name.length > 40) {
    throw new Error('Game name must be 40 characters or less');
  }
  
  const validCurrencies = ['USD', 'CAD', 'EUR', 'GBP', 'INR'];
  if (!validCurrencies.includes(params.currency)) {
    throw new Error('Invalid currency. Supported currencies: ' + validCurrencies.join(', '));
  }
  
  if (!params.hostUsername) {
    throw new Error('Host username is required');
  }
  
  // Validate players
  const playerUsernames = Object.keys(params.players);
  if (playerUsernames.length === 0) {
    throw new Error('At least one player is required');
  }
  
  // Create players map with PlayerStats for each player
  const players: Record<string, {
    buyInInitial: number;
    addBuyIns: number;
    cashOuts: number;
  }> = {};
  
  playerUsernames.forEach(username => {
    const buyInAmount = params.players[username];
    if (typeof buyInAmount !== 'number' || buyInAmount <= 0) {
      throw new Error(`Invalid buy-in amount for player ${username}`);
    }
    
    players[username] = {
      buyInInitial: buyInAmount,
      addBuyIns: 0,
      cashOuts: 0
    };
  });
  
  // Create game document
  const gameData = {
    name: params.name.trim(),
    currency: params.currency,
    status: 'active',
    hostUsername: params.hostUsername,
    createdAt: serverTimestamp(),
    playerUsernames,
    players
  };
  
  try {
    const docRef = await addDoc(collection(db, 'games'), gameData);
    return { gameId: docRef.id };
  } catch (error) {
    console.error('Error creating game:', error);
    throw new Error('Failed to create game. Please try again.');
  }
}

/**
 * Updates a player's stats in a game
 * @param gameId The ID of the game
 * @param username The username of the player
 * @param field The field to update (buyInInitial, addBuyIns, cashOuts)
 * @param value The new value
 */
export async function updatePlayerStats(
  gameId: string,
  username: string,
  field: string,
  value: number
): Promise<void> {
  try {
    await updateDoc(doc(db, 'games', gameId), {
      [`players.${username}.${field}`]: value
    });
  } catch (error) {
    console.error('Error updating player stats:', error);
    throw new Error('Failed to update player stats. Please try again.');
  }
}

/**
 * Adds a new player to an active game
 * @param gameId The ID of the game
 * @param username The username of the player to add
 * @param buyInAmount The initial buy-in amount
 */
export async function addPlayer(
  gameId: string,
  username: string,
  buyInAmount: number
): Promise<void> {
  try {
    // Get the current game
    const gameDoc = await getDoc(doc(db, 'games', gameId));
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }

    const game = gameDoc.data();
    if (game.status !== 'active') {
      throw new Error('Cannot add player to a completed game');
    }

    if (game.playerUsernames.includes(username)) {
      throw new Error('Player already in game');
    }

    // Add the player
    await updateDoc(doc(db, 'games', gameId), {
      [`players.${username}`]: {
        buyInInitial: buyInAmount,
        addBuyIns: 0,
        cashOuts: 0
      },
      playerUsernames: [...game.playerUsernames, username]
    });
  } catch (error) {
    console.error('Error adding player:', error);
    throw new Error('Failed to add player. Please try again.');
  }
}

/**
 * Updates a game's final stacks without completing it
 * @param gameId The ID of the game
 * @param finalStacks Map of username to final stack amount
 */
export async function updateFinalStacks(
  gameId: string,
  finalStacks: Record<string, number>
): Promise<void> {
  try {
    const updates: Record<string, any> = {};

    Object.entries(finalStacks).forEach(([username, stack]) => {
      updates[`players.${username}.finalStack`] = stack;
    });

    await updateDoc(doc(db, 'games', gameId), updates);
  } catch (error) {
    console.error('Error updating final stacks:', error);
    throw new Error('Failed to update final stacks. Please try again.');
  }
}

/**
 * Completes a game and records final stacks
 * @param gameId The ID of the game
 * @param finalStacks Map of username to final stack amount
 */
export async function completeGame(
  gameId: string,
  finalStacks: Record<string, number>
): Promise<void> {
  try {
    const updates: Record<string, any> = {
      status: 'complete'
    };

    Object.entries(finalStacks).forEach(([username, stack]) => {
      updates[`players.${username}.finalStack`] = stack;
    });

    await updateDoc(doc(db, 'games', gameId), updates);
  } catch (error) {
    console.error('Error completing game:', error);
    throw new Error('Failed to complete game. Please try again.');
  }
}

/**
 * Marks a game as complete with timer data
 * @param gameId The ID of the game
 * @param elapsedHours Hours on the timer
 * @param elapsedMinutes Minutes on the timer
 */
export async function completeGameWithTimer(
  gameId: string,
  elapsedHours: number,
  elapsedMinutes: number
): Promise<void> {
  try {
    // Calculate game duration in minutes
    const totalMinutes = (elapsedHours * 60) + elapsedMinutes;
    const roundedMinutes = Math.round(totalMinutes);
    
    // First check if settlement already exists
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }
    
    const gameData = gameDoc.data();
    const updates: Record<string, any> = {
      status: 'complete',
      gameFinishedAt: serverTimestamp(),
      gameDuration: roundedMinutes
    };

    // Check if settlement exists in Firestore but is missing in the local data
    console.log('Completing game and checking for settlement field:', gameId);
    if (!gameData.settlement) {
      console.log('No settlement field found while completing game');
    } else {
      console.log('Settlement field exists, preserving it during game completion');
    }

    await updateDoc(gameRef, updates);
  } catch (error) {
    console.error('Error completing game:', error);
    throw new Error('Failed to complete game. Please try again.');
  }
}

/**
 * Fetches all games where the user was a participant
 * @param username The username of the user
 * @returns Array of game documents with their IDs
 */
export async function fetchUserGames(username: string): Promise<{id: string, data: any}[]> {
  try {
    console.log("Debug fetchUserGames: Starting fetch for username:", username);
    const gamesRef = collection(db, 'games');
    const querySnapshot = await getDocs(gamesRef);
    
    console.log("Debug fetchUserGames: Total games in database:", querySnapshot.size);
    
    const userGames: {id: string, data: any}[] = [];
    
    querySnapshot.forEach((doc) => {
      const gameData = doc.data();
      console.log("Debug fetchUserGames: Checking game:", doc.id, "playerUsernames:", gameData.playerUsernames);
      
      // Check if the user was a participant in this game
      if (gameData.playerUsernames && gameData.playerUsernames.includes(username)) {
        console.log("Debug fetchUserGames: Found matching game:", doc.id);
        userGames.push({
          id: doc.id,
          data: gameData
        });
      } else {
        console.log("Debug fetchUserGames: No match for game:", doc.id, "looking for:", username, "found:", gameData.playerUsernames);
      }
    });
    
    console.log("Debug fetchUserGames: Final user games count:", userGames.length);
    
    // Sort games by createdAt date (newest first)
    return userGames.sort((a, b) => {
      const dateA = a.data.createdAt?.toDate?.() || new Date(0);
      const dateB = b.data.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error fetching user games:', error);
    throw new Error('Failed to fetch games. Please try again.');
  }
}

/**
 * Transforms a Firebase game document into the format needed for game cards
 * @param gameDoc The game document from Firebase
 * @param gameId The ID of the game
 * @param currentUsername The username of the current user
 * @returns Formatted game data for display in a card
 */
export function transformGameDataForCard(
  gameDoc: any, 
  gameId: string, 
  currentUsername: string
): GameCardData {
  const players = gameDoc.players || {};
  const playerUsernames = gameDoc.playerUsernames || [];
  
  // Calculate total pot size
  let potSize = 0;
  Object.values(players).forEach((player: any) => {
    potSize += (player.buyInInitial || 0) + (player.addBuyIns || 0);
  });
  
  // Calculate the current user's stats
  const currentUserStats = players[currentUsername] || {
    buyInInitial: 0,
    addBuyIns: 0,
    cashOuts: 0,
    finalStack: 0
  };
  
  // Calculate net funding (total buy-ins minus cashouts)
  const netFunding = currentUserStats.buyInInitial + currentUserStats.addBuyIns - currentUserStats.cashOuts;
  
  // Calculate winnings (only for completed games)
  let currentUserWinnings = 0;
  if (gameDoc.status === 'complete' && currentUserStats.finalStack !== undefined) {
    currentUserWinnings = currentUserStats.finalStack - netFunding;
  }
  
  // Calculate ROI (only for completed games)
  const roi = gameDoc.status === 'complete' && netFunding > 0 ? (currentUserWinnings / netFunding) * 100 : 0;
  
  // Extract date
  const createdDate = gameDoc.createdAt?.toDate?.() || new Date();
  const dateString = createdDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  // Create player details (only calculate winnings/ROI for completed games)
  const playerDetails: PlayerDetail[] = [];
  playerUsernames.forEach((username: string) => {
    const player = players[username];
    if (!player) return;
    
    const playerNetFunding = player.buyInInitial + player.addBuyIns - player.cashOuts;
    let playerWinnings = 0;
    let playerRoi = 0;
    
    if (gameDoc.status === 'complete' && player.finalStack !== undefined) {
      playerWinnings = player.finalStack - playerNetFunding;
      playerRoi = playerNetFunding > 0 ? (playerWinnings / playerNetFunding) * 100 : 0;
    }
    
    playerDetails.push({
      name: username === currentUsername ? 'You' : username,
      netFunding: playerNetFunding,
      winnings: playerWinnings,
      roi: playerRoi
    });
  });
  
  // Calculate duration from gameDuration field (stored in minutes)
  let durationHours = 0;
  let durationMinutes = 0;
  
  if (gameDoc.gameDuration && typeof gameDoc.gameDuration === 'number') {
    durationHours = Math.floor(gameDoc.gameDuration / 60);
    durationMinutes = gameDoc.gameDuration % 60;
  }
  
  return {
    id: gameId,
    name: gameDoc.name || 'Poker Game',
    date: dateString,
    durationHours,
    durationMinutes,
    potSize,
    players: playerUsernames.length,
    currentUserWinnings,
    roi,
    playerDetails,
    currency: gameDoc.currency || 'USD',
    status: gameDoc.status || 'active'
  };
}

/**
 * Gets a user's username from their UID
 * @param uid The UID of the user
 * @returns The username or null if not found
 */
export async function getUsernameByUID(uid: string): Promise<string | null> {
  try {
    const playerDoc = await getDoc(doc(db, "players", uid));
    if (!playerDoc.exists()) {
      console.error("Player document not found for uid:", uid);
      return null;
    }
    const data = playerDoc.data() as PlayerData;
    return data.username;
  } catch (error) {
    console.error("Error getting username:", error);
    return null;
  }
}

/**
 * Checks if a username exists in the system and returns the player data if found
 * @param username The username to check
 * @returns The player data if the username exists, null otherwise
 */
export async function checkUsernameExists(username: string): Promise<PlayerData | null> {
  try {
    if (!username || username.trim() === '') {
      return null;
    }
    
    // First check if the username document exists
    const usernameDoc = await getDoc(doc(db, "usernames", username.toLowerCase()));
    if (!usernameDoc.exists()) {
      return null;
    }
    
    // If the username exists, get the player document
    const uid = usernameDoc.data().uid;
    const playerDoc = await getDoc(doc(db, "players", uid));
    
    if (!playerDoc.exists()) {
      return null;
    }
    
    return playerDoc.data() as PlayerData;
  } catch (error) {
    console.error("Error checking if username exists:", error);
    return null;
  }
} 
