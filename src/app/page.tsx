"use client";

import { useAuth } from "../lib/hooks/useAuth";
import SignInWithGoogle from "../components/SignInWithGoogle";
import SignOut from "../components/SignOut";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="text-center space-y-8">
          <h2 className="text-4xl font-bold text-white mb-8">Welcome to PokerUp</h2>
          <SignInWithGoogle />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-white">
          Welcome to the game, {user.displayName}!
        </h2>
        <p className="text-gray-300">
          Get ready to play some poker!
        </p>
        <div className="mt-8">
          <SignOut />
        </div>
      </div>
    </main>
  );
}
