"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import SignInWithGoogle from "@/components/SignInWithGoogle";
import theme from "@/theme/theme";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
        <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex flex-col">
          <h1 className="text-4xl font-bold mb-8 text-primary">Welcome to PokerUp</h1>
          <div className="flex flex-col items-center space-y-4">
            <SignInWithGoogle />
          </div>
        </div>
      </main>
    );
  }

  return null; // Will redirect via useEffect
} 