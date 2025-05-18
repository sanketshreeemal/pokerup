"use client";

import { useEffect } from "react";
import { useAuth } from "../lib/hooks/useAuth";
import SignInWithGoogle from "../components/SignInWithGoogle";
import SignInWithEmailPassword from "@/components/SignInWithEmailPass";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/game/lobby');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-background to-surface">
      <div className="text-center space-y-8">
        <h2 className="text-4xl font-bold text-textPrimary mb-8">Welcome to PokerUp</h2>
        <SignInWithGoogle />
        <p className="text-textSecondary text-sm">or sign in with test credentials</p>
        <SignInWithEmailPassword />
      </div>
    </main>
  );
}
