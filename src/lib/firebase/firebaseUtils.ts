import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

/**
 * Creates or overwrites a document with a specified ID.
 * @param collectionName The name of the collection.
 * @param id The ID of the document.
 * @param data The data to set in the document.
 */
export const setDocumentWithId = (collectionName: string, id: string, data: any) => {
  return setDoc(doc(db, collectionName, id), data);
}

/**
 * Retrieves a single document by its ID from a collection.
 * @param collectionName The name of the collection.
 * @param id The ID of the document.
 * @returns The document data if it exists, otherwise null.
 */
export const getDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    console.warn(`No document found at ${collectionName}/${id}`);
    return null;
  }
};

/**
 * Retrieves all documents from a collection.
 * @param collectionName The name of the collection.
 * @returns An array of documents with their IDs.
 */
export const getCollection = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Updates specific fields of a document.
 * @param collectionName The name of the collection.
 * @param id The ID of the document to update.
 * @param data An object containing the fields to update.
 */
export const updateDocumentFields = (collectionName: string, id: string, data: Partial<any>) => {
  return updateDoc(doc(db, collectionName, id), data);
}

/**
 * Deletes a document from a collection.
 * @param collectionName The name of the collection.
 * @param id The ID of the document to delete.
 */
export const deleteDocumentPermanently = (collectionName: string, id: string) => {
  return deleteDoc(doc(db, collectionName, id));
}

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
