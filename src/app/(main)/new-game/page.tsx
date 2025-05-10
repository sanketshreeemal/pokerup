/**
 * New Game Page Component
 * 
 * This is the main game management page that handles the entire poker game lifecycle:
 * 1. Game Setup: Initial configuration of players and game settings
 * 2. Active Game: Real-time game state management and player interactions
 * 3. Game Settlement: Final calculations and game completion
 * 
 * The page uses a state machine pattern to manage different game phases:
 * - "setup": Initial game configuration
 * - "playing": Active game state
 * - "settlement": Game completion and settlement
 * 
 * Key Features:
 * - Player management (add/remove/update players)
 * - Game state persistence
 * - Real-time updates
 * - Settlement calculations
 * 
 * @component
 */

"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Game, Player, GameState, Settlement } from "@/types";
import { GameSetup } from "@/app/(main)/new-game/components/GameSetup";
import { GameTable } from "@/app/(main)/new-game/components/GameTable";
import { GameSettlement } from "@/app/(main)/new-game/components/GameSettlement";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/lib/hooks/use-toast";
import { RotateCw } from "lucide-react";
import { useGameStore } from "@/app/context-mgmt/gameStore";

export default function PlayGame() {
  // Game state management
  const [uiGameState, setUiGameState] = useState<GameState>("setup");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Get game actions and state from Zustand store
  const storeSetCurrentGame = useGameStore((state) => state.setCurrentGame);
  const storeAddPlayer = useGameStore((state) => state.addPlayer);
  const storeUpdatePlayer = useGameStore((state) => state.updatePlayer);
  const storeSetPlayers = useGameStore((state) => state.setPlayers);
  const currentGame = useGameStore((state) => state.currentGame);
  const storeSaveSettlement = useGameStore((state) => state.saveSettlement);

  const { toast } = useToast();
  const [isAddingPlayersMode, setIsAddingPlayersMode] = useState<boolean>(false);
  const [pendingFinalStacks, setPendingFinalStacks] = useState<Record<string, number> | null>(null);

  // Effect to transition UI state when currentGame appears in store (after new game creation or loading)
  useEffect(() => {
    if (currentGame && currentGame.id) {
      setUiGameState("playing");
      setIsLoading(false);
    } else {
      // If no currentGame, ensure we are in setup unless explicitly loading
      // This handles resetting to setup after a game is completed/cleared from store
      if (!isLoading) {
        setUiGameState("setup");
      }
    }
  }, [currentGame, isLoading]);

  // Check for existing game on mount (Placeholder - to be potentially removed or integrated with store hydration)
  useEffect(() => {
    // Simulating initial load. If we were loading a game from URL param or localStorage, this would be different.
    // For now, we assume a fresh start or that gameStore might be hydrated elsewhere.
    const timer = setTimeout(() => {
      setIsLoading(false); 
      // If currentGame is already in the store (e.g. from a previous session via persisted store),
      // the other useEffect will handle setting uiGameState to "playing".
      // Otherwise, it will default to "setup".
    }, 500); // Reduced timeout
    return () => clearTimeout(timer);
  }, []);

  /**
   * Handles the start of a new game or adding players to an existing game
   * @param gameName - Name of the game
   * @param players - Array of players to add
   */
  const handleStartGame = async (gameName: string, players: Player[]) => {
    if (isAddingPlayersMode) {
      // Add players to an existing game
      if (currentGame && currentGame.id) {
        // Filter out players that might already exist by name (or ID if available and stable)
        // For simplicity, let's assume new players from GameSetup are truly new for now.
        // The store's `setPlayers` is better if GameSetup provides the *full* list of players.
        // If GameSetup provides only *new* players to add:
        // const updatedPlayers = [...currentGame.players, ...players.map(p => ({...p, id: uuidv4(), additionalBuyIns: [], buyOuts: [], totalBuyIn: p.initialBuyIn}))];
        // await storeSetPlayers(updatedPlayers); // This would update the whole list

        // If GameSetup gives a list of *only the new players to be added*, then iterate and call storeAddPlayer
        // However, our current GameSetup provides a list of *all* players it's aware of.
        // So, it's better to update the entire player list in the store.
        
        // We need to make sure the players from GameSetup have proper IDs and full structure
        const newPlayerList = players.map(p => ({
          ...createEmptyPlayer(), // Get defaults for missing fields
          ...p, // Override with data from GameSetup
          id: p.id || uuidv4(), // Ensure ID
        }));
        
        try {
          await storeSetPlayers(newPlayerList); // Use setPlayers to update the list in Firebase
          setUiGameState("playing");
          setIsAddingPlayersMode(false);
          toast({
            title: "Players updated!",
            description: `Player list has been updated for "${gameName}"`,
          });
        } catch (error) {
          console.error("Error updating players:", error);
          toast({
            title: "Error",
            description: "Could not update players. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "No active game to add players to.",
          variant: "destructive",
        });
      }
    } else {
      // Create a new game
      try {
        await storeSetCurrentGame({ name: gameName, players });
        // currentGame from store will update via useEffect, changing uiGameState to "playing"
        toast({
          title: "Game started!",
          description: `${players.length} players have joined "${gameName}"`,
        });
      } catch (error) {
        console.error("Error starting game:", error);
        toast({
          title: "Error",
          description: "Could not start the game. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Helper to ensure new players have all required fields from Player type
  function createEmptyPlayer(): Omit<Player, 'name' | 'initialBuyIn'> {
    return {
      id: uuidv4(),
      additionalBuyIns: [],
      buyOuts: [],
      totalBuyIn: 0,
    };
  }

  /**
   * Updates a player's information in the game state
   * @param updatedPlayer - The player object with updated information
   */
  const handleUpdatePlayer = async (updatedPlayer: Player) => {
    // Player updates are now handled directly by PlayerCard calling useGameStore().updatePlayer
    // This function can be simplified or ensure it uses the store if called from GameTable directly
    try {
      await storeUpdatePlayer(updatedPlayer);
      // Optional: toast notification if needed, though PlayerCard might handle its own feedback
    } catch (error) {
      console.error("Error updating player:", error);
      toast({
        title: "Error",
        description: `Could not update ${updatedPlayer.name}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  /**
   * Initiates the game settlement process
   * @param finalStacks - The final chip counts for each player from GameTable
   */
  const handleRequestSettlement = (finalStacks: Record<string, number>) => {
    setPendingFinalStacks(finalStacks);
    setUiGameState("settlement");
  };

  /**
   * Completes the game settlement and resets the game state
   * @param settlementData - The final settlement data from GameSettlement
   */
  const handleCompleteSettlement = async (settlementData: Settlement) => {
    if (!currentGame || !currentGame.id) {
      toast({
        title: "Error",
        description: "No active game to settle.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Include the final player stacks that were captured from GameTable
      const fullSettlementData: Settlement = {
        ...settlementData,
        finalPlayerStacks: pendingFinalStacks 
          ? Object.entries(pendingFinalStacks).map(([playerId, finalStack]) => ({ playerId, finalStack }))
          : [],
        timestamp: Date.now(),
      };

      await storeSaveSettlement(fullSettlementData);
      
      toast({
        title: "Game Settled!",
        description: "Settlement has been saved. Ready for a new game.",
      });
      
      setUiGameState("setup"); 
      setIsAddingPlayersMode(false);
      setPendingFinalStacks(null);

    } catch (error) {
      console.error("Error saving settlement:", error);
      toast({
        title: "Error Settling Game",
        description: "Could not save settlement details. Please try again.",
        variant: "destructive",
      });
    }
  };

  /**
   * Cancels the settlement process and returns to the game
   */
  const handleCancelSettlement = () => {
    setUiGameState("playing");
  };

  /**
   * Initiates the process of adding new players to an existing game
   * (Called from GameTable when user wants to add more players to the *current* game)
   */
  const handleAddPlayerMode = () => {
    setIsAddingPlayersMode(true);
    setUiGameState("setup");
  };

  // Loading state
  if (isLoading && !currentGame) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <RotateCw className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  // Main render with conditional components based on game state
  return (
    <div className="space-y-6">
      {uiGameState === "setup" && (
        <GameSetup 
          onStart={handleStartGame} 
          existingGame={isAddingPlayersMode && currentGame ? currentGame : undefined}
        />
      )}
      
      {uiGameState === "playing" && currentGame && (
        <GameTable 
          game={currentGame}
          onUpdatePlayer={handleUpdatePlayer}
          onRequestSettlement={handleRequestSettlement}
          onAddPlayer={handleAddPlayerMode}
        />
      )}
      
      {uiGameState === "settlement" && currentGame && (
        <GameSettlement
          game={currentGame}
          initialFinalStacks={pendingFinalStacks}
          onCompleteSettlement={handleCompleteSettlement}
          onCancel={handleCancelSettlement}
        />
      )}
    </div>
  );
} 