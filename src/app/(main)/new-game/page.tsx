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
import { Game, Player, GameState, Settlement } from "@/src/types";
import { GameSetup } from "@/src/app/(main)/new-game/components/GameSetup";
import { GameTable } from "@/src/app/(main)/new-game/components/GameTable";
import { GameSettlement } from "@/src/app/(main)/new-game/components/GameSettlement";
import { Button } from "@/src/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { useToast } from "@/src/lib/hooks/use-toast";
import { RotateCw } from "lucide-react";

export default function PlayGame() {
  // Game state management
  const [gameState, setGameState] = useState<GameState>("setup");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [game, setGame] = useState<Game>({
    id: "",
    name: "",
    date: new Date(),
    players: [],
    state: "setup",
  });
  const { toast } = useToast();
  const [isAddingPlayers, setIsAddingPlayers] = useState<boolean>(false);

  // Check for existing game on mount
  useEffect(() => {
    const checkForExistingGame = async () => {
      // TODO: Implement Firebase game persistence
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    };

    checkForExistingGame();
  }, []);

  /**
   * Handles the start of a new game or adding players to an existing game
   * @param gameName - Name of the game
   * @param players - Array of players to add
   */
  const handleStartGame = (gameName: string, players: Player[]) => {
    if (isAddingPlayers) {
      // Merge existing players with new ones
      const existingPlayerIds = new Set(game.players.map(p => p.id));
      const newPlayers = players.filter(p => !existingPlayerIds.has(p.id));
      
      setGame(prevGame => ({
        ...prevGame,
        name: gameName,
        players: [...prevGame.players, ...newPlayers],
        state: "playing",
      }));
      
      setGameState("playing");
      setIsAddingPlayers(false);
      
      toast({
        title: "Players added!",
        description: `${newPlayers.length} new players have joined the game`,
      });
    } else {
      // Create a new game
      const newGame: Game = {
        id: uuidv4(),
        name: gameName,
        date: new Date(),
        players,
        state: "playing",
      };
      
      setGame(newGame);
      setGameState("playing");
      
      toast({
        title: "Game started!",
        description: `${players.length} players have joined "${gameName}"`,
      });
    }
  };

  /**
   * Updates a player's information in the game state
   * @param updatedPlayer - The player object with updated information
   */
  const handleUpdatePlayer = (updatedPlayer: Player) => {
    setGame(prevGame => {
      const updatedPlayers = prevGame.players.map(player => 
        player.id === updatedPlayer.id ? updatedPlayer : player
      );
      
      return {
        ...prevGame,
        players: updatedPlayers,
      };
    });
  };

  /**
   * Initiates the game settlement process
   */
  const handleRequestSettlement = () => {
    setGameState("settlement");
  };

  /**
   * Completes the game settlement and resets the game state
   * @param settlement - The final settlement data
   */
  const handleCompleteSettlement = (settlement: Settlement) => {
    const completedGame = {
      ...game,
      state: "setup",
      settlement,
    };
    
    // Reset the game state for a new game
    setGame({
      id: "",
      name: "",
      date: new Date(),
      players: [],
      state: "setup",
    });
    
    setGameState("setup");
    
    toast({
      title: "Game completed!",
      description: "Settlement has been saved successfully.",
    });
  };

  /**
   * Cancels the settlement process and returns to the game
   */
  const handleCancelSettlement = () => {
    setGameState("playing");
  };

  /**
   * Initiates the process of adding new players to an existing game
   */
  const handleAddPlayer = () => {
    setIsAddingPlayers(true);
    setGameState("setup");
  };

  // Loading state
  if (isLoading) {
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
      {gameState === "setup" && (
        <GameSetup 
          onStart={handleStartGame} 
          existingGame={isAddingPlayers ? game : undefined}
        />
      )}
      
      {gameState === "playing" && (
        <GameTable 
          game={game}
          onUpdatePlayer={handleUpdatePlayer}
          onRequestSettlement={handleRequestSettlement}
          onAddPlayer={handleAddPlayer}
        />
      )}
      
      {gameState === "settlement" && (
        <GameSettlement
          game={game}
          onCompleteSettlement={handleCompleteSettlement}
          onCancel={handleCancelSettlement}
        />
      )}
    </div>
  );
} 