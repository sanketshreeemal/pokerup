// components/SignInWithEmailPassword.tsx
// Only need this in development to test the emulators - Delete once in production
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";

export default function SignInWithEmailPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSignIn}
      className="flex flex-col space-y-4 text-left w-full max-w-xs mx-auto"
    >
      <input
        type="email"
        placeholder="Email"
        value={email}
        className="p-2 border rounded text-black"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        className="p-2 border rounded text-black"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        type="submit"
        className="bg-primary text-white p-2 rounded hover:bg-primaryVariant"
      >
        Sign in with Email
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}
