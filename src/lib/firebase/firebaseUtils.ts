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
import type { UsernameReservationResponse, PlayerData } from "../../types";

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
  
  if (!username || username.length < 6 || username.length > 20 || !/^[a-z0-9_]+$/.test(username)) {
    throw new Error("Username must be 6-20 characters long and contain only lowercase letters, numbers, and underscores.");
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
