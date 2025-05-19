"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import SignInWithGoogle from "@/components/SignInWithGoogle";
import SignInWithEmailPassword from "@/components/SignInWithEmailPass";
import theme from "@/theme/theme";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/game/lobby');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <main 
        className="flex min-h-screen flex-col items-center justify-center p-8"
        style={{ background: theme.colors.gradients.backgroundGradient }}
      >
        <div className="text-center space-y-8">
          <h2 
            className="text-4xl font-bold mb-8"
            style={{ color: theme.colors.textPrimary }}
          >
            Welcome to PokerUp
          </h2>
          <SignInWithGoogle />
          <p style={{ color: theme.colors.textSecondary }} className="text-sm">
            or sign in with test credentials
          </p>
          <SignInWithEmailPassword />
        </div>
      </main>
    );
  }

  return null; // Will redirect via useEffect
} 