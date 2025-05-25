"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PokerGameCard from "./components/gameCard";
import theme from "@/theme/theme";
import { Plus, Filter, SortDesc, Grid, List } from "lucide-react";
import { fetchUserGames, transformGameDataForCard, getUsernameByUID } from "@/lib/firebase/firebaseUtils";
import type { GameCardData } from "@/types";

export default function GameHistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [displayMode, setDisplayMode] = useState<"list" | "grid">("grid");
  const [games, setGames] = useState<GameCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Fetch user's username
  useEffect(() => {
    async function getUsername() {
      if (!user) return;
      
      try {
        const fetchedUsername = await getUsernameByUID(user.uid);
        setUsername(fetchedUsername);
      } catch (err) {
        console.error('Error fetching username:', err);
        setError('Failed to load username. Please try again.');
      }
    }
    
    if (user) {
      getUsername();
    }
  }, [user]);

  // Fetch user's games when username is available
  useEffect(() => {
    async function loadGames() {
      if (!username) return;
      
      try {
        setIsLoading(true);
        const fetchedGames = await fetchUserGames(username);
        
        // Transform the games for display
        const transformedGames = fetchedGames.map(game => 
          transformGameDataForCard(game.data, game.id, username)
        );
        
        setGames(transformedGames);
      } catch (err) {
        console.error('Error loading games:', err);
        setError('Failed to load games. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (username) {
      loadGames();
    }
  }, [username]);

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="h-full bg-slate-50">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        
        {/* Header with title and actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 
            className="text-2xl font-bold text-slate-800"
          >
            Game History
          </h1>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="rounded-lg p-4 mb-6 bg-rose-50 text-rose-700 border border-rose-200">
            {error}
          </div>
        )}
        
        {/* Empty state */}
        {!error && games.length === 0 && (
          <div 
            className="rounded-lg p-8 text-center bg-white shadow-md border border-slate-200"
          >
            <h3 className="text-lg font-semibold mb-2 text-slate-800">No games yet</h3>
            <p className="text-center mb-6 text-slate-500">
              Your game history will appear here after you&apos;ve played some games.
            </p>
            <button 
              className="px-4 py-2 rounded-md text-sm font-medium bg-teal-600 text-white"
              onClick={() => router.push('/game/lobby')}
            >
              Record Your First Game
            </button>
          </div>
        )}
        
        {/* Game cards grid or list */}
        {games.length > 0 && (
          <div className={`${displayMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}`}>
            {/* Display game cards */}
            {games.map((gameData) => (
              <div key={gameData.id} className={displayMode === "list" ? "w-full" : ""}>
                <PokerGameCard gameData={gameData} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 