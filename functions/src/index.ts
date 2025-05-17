import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";


admin.initializeApp();

interface PlayerData {
  displayName: string;
  email: string;
  photoURL: string;
  username: null;
  createdAt: admin.firestore.FieldValue;
}

export const onUserCreate = functions.auth
  .user()
  .onCreate(async (user: admin.auth.UserRecord) => {
    const playerRef = admin.firestore().doc(`players/${user.uid}`);
    try {
      const playerData: PlayerData = {
        displayName: user.displayName ?? user.email?.split('@')[0] ?? "Player",
        email: user.email ?? "",
        photoURL: user.photoURL ?? "",
        username: null,
        createdAt: Timestamp.now(), // Use FieldValue.serverTimestamp() in production
      };
      await playerRef.set(playerData);
      console.log(`Created player document for: ${user.uid}`);
    } catch (error) {
      const errMsg = `Error creating player document for: ${user.uid}`;
      console.error(errMsg, error);
    }
  });
