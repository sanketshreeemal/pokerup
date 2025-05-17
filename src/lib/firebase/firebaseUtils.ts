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
