"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { ActiveGame } from "../components/ActiveGame";
import { useGameStore } from "@/store/game";
import { updatePlayerStats, addPlayer, updateFinalStacks } from "@/lib/firebase/firebaseUtils";

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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
    const unsubscribe = subscribe(id);
    return () => unsubscribe();
  }, [id, subscribe]);

  const handlePlayerUpdate = async (username: string, field: string, value: number) => {
    // Update local state optimistically
    update(`players.${username}.${field}`, value);
    
    // Update Firestore
    try {
      await updatePlayerStats(id, username, field, value);
    } catch (error) {
      console.error('Error updating player:', error);
      // TODO: Roll back optimistic update if needed
    }
  };

  const handleRequestSettlement = async (results: Record<string, number>) => {
    try {
      if (!game) return;
      
      // Calculate results for each player and store in game state
      const playerResults: Record<string, number> = {};
      Object.entries(results).forEach(([username, finalStack]) => {
        const player = game.players[username];
        const outOfPocket = player.buyInInitial + player.addBuyIns - player.cashOuts;
        playerResults[username] = finalStack - outOfPocket;
        
        // Store final stack in local state
        update(`players.${username}.finalStack`, finalStack);
      });
      
      // First update Firestore with final stack values
      await updateFinalStacks(id, results);
      
      // Then navigate to settlement page
      router.push(`/game/${id}/settle`);
    } catch (error) {
      console.error('Error preparing settlement:', error);
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
      await addPlayer(id, username, buyInAmount);
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
      gameId={id}
      onUpdatePlayer={handlePlayerUpdate}
      onRequestSettlement={handleRequestSettlement}
      onAddPlayer={handleAddPlayer}
    />
  );
}
