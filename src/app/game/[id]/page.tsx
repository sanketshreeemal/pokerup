"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { ActiveGame } from "../components/ActiveGame";
import { useGameStore } from "@/store/game";
import { updatePlayerStats, addPlayer, completeGame } from "@/lib/firebase/firebaseUtils";

export default function GamePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { doc: game, loading: gameLoading, subscribe, update } = useGameStore();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Subscribe to game updates
  useEffect(() => {
    const unsubscribe = subscribe(params.id);
    return () => unsubscribe();
  }, [params.id, subscribe]);

  const handlePlayerUpdate = async (username: string, field: string, value: number) => {
    // Update local state optimistically
    update(`players.${username}.${field}`, value);
    
    // Update Firestore
    try {
      await updatePlayerStats(params.id, username, field, value);
    } catch (error) {
      console.error('Error updating player:', error);
      // TODO: Roll back optimistic update if needed
    }
  };

  const handleRequestSettlement = async (results: Record<string, number>) => {
    try {
      if (!game) return;
      
      // Calculate results for each player
      const playerResults: Record<string, number> = {};
      Object.entries(results).forEach(([username, finalStack]) => {
        const player = game.players[username];
        const outOfPocket = player.buyInInitial + player.addBuyIns - player.cashOuts;
        playerResults[username] = finalStack - outOfPocket;
      });

      // Update game document with final stacks
      await completeGame(params.id, results);
      
      // Navigate to settlement page
      router.push(`/game/${params.id}/settle`);
    } catch (error) {
      console.error('Error completing game:', error);
    }
  };

  const handleAddPlayer = async (username: string, buyInAmount: number) => {
    try {
      // Update local state optimistically
      update('playerUsernames', [...(game?.playerUsernames || []), username]);
      update(`players.${username}`, {
        buyInInitial: buyInAmount,
        addBuyIns: 0,
        cashOuts: 0
      });

      // Update Firestore
      await addPlayer(params.id, username, buyInAmount);
    } catch (error) {
      console.error('Error adding player:', error);
      // Roll back optimistic update
      if (game) {
        update('playerUsernames', game.playerUsernames);
        update('players', game.players);
      }
      throw error; // Re-throw to be handled by the dialog
    }
  };

  if (loading || gameLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !game) {
    return null;
  }

  return (
    <ActiveGame
      game={game}
      gameId={params.id}
      onUpdatePlayer={handlePlayerUpdate}
      onRequestSettlement={handleRequestSettlement}
      onAddPlayer={handleAddPlayer}
    />
  );
}
