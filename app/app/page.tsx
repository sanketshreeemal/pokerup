"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Game, Player, GameState, Settlement } from "@/types/game";
import { GameSetup } from "@/components/game/GameSetup";
import { GameTable } from "@/components/game/GameTable";
import { GameSettlement } from "@/components/game/GameSettlement";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { RotateCw } from "lucide-react";

export default function PlayGame() {
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

  // Simulate fetching an existing game from Firebase on mount
  useEffect(() => {
    const checkForExistingGame = async () => {
      // This would be replaced with actual Firebase logic
      setTimeout(() => {
        // For demo purposes, simulate that no existing game was found
        setIsLoading(false);
      }, 1000);
    };

    checkForExistingGame();
  }, []);

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

  const handleUpdatePlayer = (updatedPlayer: Player) => {
    setGame(prevGame => {
      const updatedPlayers = prevGame.players.map(player => 
        player.id === updatedPlayer.id ? updatedPlayer : player
      );
      
      const updatedGame = {
        ...prevGame,
        players: updatedPlayers,
      };
      
      // This would save to Firebase in a real implementation
      return updatedGame;
    });
  };

  const handleRequestSettlement = () => {
    setGameState("settlement");
  };

  const handleCompleteSettlement = (settlement: Settlement) => {
    const completedGame = {
      ...game,
      state: "setup", // Reset for next game
      settlement,
    };
    
    // This would save to Firebase in a real implementation
    
    // Reset the UI to start a new game
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

  const handleCancelSettlement = () => {
    setGameState("playing");
  };

  const handleAddPlayer = () => {
    setIsAddingPlayers(true);
    setGameState("setup");
  };

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