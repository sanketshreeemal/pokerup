"use client";

import { Button } from "./ui/button";
import { useAuth } from "../lib/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function SignOut() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleSignOut}
      className="bg-red-600 text-white hover:bg-red-700"
    >
      Sign Out
    </Button>
  );
} 