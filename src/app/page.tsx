"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../lib/hooks/useAuth";
import SignInWithGoogle from "../components/SignInWithGoogle";
import SignOut from "../components/SignOut";
import { UsernameDialog } from "@/components/UsernameDialog";
import { reserveUsername, checkUserHasUsername } from "@/lib/firebase/firebaseUtils";

export default function Home() {
  const { user, loading } = useAuth();
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(true);

  useEffect(() => {
    async function checkUsername() {
      if (user) {
        try {
          setCheckingUsername(true);
          const hasUsername = await checkUserHasUsername(user.uid);
          if (!hasUsername) {
            // Only show dialog after a delay if username is actually needed
            const timer = setTimeout(() => {
              setShowUsernameDialog(true);
            }, 3000);
            return () => clearTimeout(timer);
          }
        } catch (error) {
          console.error("Error checking username:", error);
        } finally {
          setCheckingUsername(false);
        }
      } else {
        setCheckingUsername(false);
      }
    }

    checkUsername();
  }, [user]);

  const handleUsernameSubmit = async (username: string) => {
    if (!user) return;
    await reserveUsername(user.uid, username);
  };

  if (loading || checkingUsername) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-background to-surface">
        <div className="text-center space-y-8">
          <h2 className="text-4xl font-bold text-textPrimary mb-8">Welcome to PokerUp</h2>
          <SignInWithGoogle />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-background to-surface">
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-textPrimary">
          Welcome to the game, {user.displayName}!
        </h2>
        <p className="text-textSecondary">
          Get ready to play some poker!
        </p>
        <div className="mt-8">
          <SignOut />
        </div>
      </div>

      <UsernameDialog
        isOpen={showUsernameDialog}
        onClose={() => setShowUsernameDialog(false)}
        onSubmit={handleUsernameSubmit}
      />
    </main>
  );
}
