"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Player } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { PokerTable } from "./PokerTable";
import { Game } from "@/types";
import { useGameStore } from "@/app/context-mgmt/gameStore";

interface GameSetupProps {
  onStart: (gameName: string, players: Player[]) => void;
  existingGame?: Game;
}

export function GameSetup({ onStart, existingGame }: GameSetupProps) {
  const [gameName, setGameName] = useState<string>(existingGame?.name || "");
  const [players, setPlayers] = useState<Player[]>(
    existingGame && existingGame.players && existingGame.players.length > 0
      ? existingGame.players
      : [createEmptyPlayer(), createEmptyPlayer(), createEmptyPlayer()]
  );

  function createEmptyPlayer(): Player {
    return {
      id: uuidv4(),
      name: "",
      initialBuyIn: 0,
      additionalBuyIns: [],
      buyOuts: [],
      totalBuyIn: 0,
    };
  }

  const updatePlayer = (index: number, field: keyof Player, value: string | number) => {
    const updatedPlayers = [...players];
    
    if (field === 'initialBuyIn') {
      const numValue = Number(value);
      updatedPlayers[index] = {
        ...updatedPlayers[index],
        [field]: numValue,
        totalBuyIn: numValue
      };
    } else {
      updatedPlayers[index] = {
        ...updatedPlayers[index],
        [field]: value
      };
    }
    
    setPlayers(updatedPlayers);
  };

  const addPlayer = () => {
    setPlayers([...players, createEmptyPlayer()]);
  };

  const removePlayer = (index: number) => {
    if (players.length <= 1) return; // Keep at least one player
    const updatedPlayers = [...players];
    updatedPlayers.splice(index, 1);
    setPlayers(updatedPlayers);
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    // Validate form
    if (!gameName.trim()) return;
    
    const filledPlayers = players.filter(
      player => player.name.trim() && player.initialBuyIn > 0
    );
    
    if (filledPlayers.length < (existingGame ? 1 : 2)) return; // Need at least 2 players for new game, 1 for adding
    
    onStart(gameName, filledPlayers);
  };

  const isFormValid = () => {
    if (!gameName.trim()) return false;
    
    const validPlayers = players.filter(
      player => player.name.trim() && player.initialBuyIn > 0
    );
    
    return validPlayers.length >= (existingGame ? 1 : 2);
  };

  // Get only valid players for table display
  const validPlayers = players.filter(
    player => player.name.trim() && player.initialBuyIn > 0
  );

  // Update the button text based on whether we're adding players or starting a new game
  const buttonText = existingGame ? "Add Players" : "Let's Play!";

  return (
    <div className="flex flex-col h-[100vh]">
      <motion.div 
        className="relative z-10 w-full max-w-4xl mx-auto px-4 py-1 sm:py-2 md:py-3 flex flex-col flex-grow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full border-primary/20 shadow-md flex flex-col flex-grow">
          <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/5 py-3">
            <CardTitle className="text-xl text-primary font-bold">
              {existingGame ? `Add Players to "${existingGame.name}"` : "New Poker Game"}
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
            <CardContent className="pt-3 sm:pt-4 flex-grow flex flex-col space-y-2 sm:space-y-3">
              <div className="space-y-2 sm:space-y-3 flex-grow flex flex-col">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="game-name" className="text-lg font-semibold text-primary">
                    Game Name
                  </Label>
                  <Input
                    id="game-name"
                    placeholder="Saturday Night Poker"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    className="w-full border-primary/30 focus:border-primary focus:ring-primary"
                  />
                </div>

                {/* Interactive Poker Table with Player Avatars */}
                {validPlayers.length > 0 && (
                  <PokerTable players={validPlayers} />
                )}
                
                <div className="space-y-1 sm:space-y-2 flex-grow flex flex-col">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold text-primary">
                      Players
                    </Label>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      {players.filter(p => p.name && p.initialBuyIn > 0).length} Players
                    </Badge>
                  </div>
                  
                  <ScrollArea className="flex-grow h-[25vh] sm:h-[200px] rounded-md border border-primary/20 p-3 sm:p-4">
                    <div className="space-y-4">
                      {players.map((player, index) => (
                        <motion.div 
                          key={player.id} 
                          className="space-y-2 pb-2 border-b last:border-0 border-primary/10"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`player-name-${index}`} className="text-sm font-medium text-primary">
                              Player {index + 1}
                            </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100/50"
                                    onClick={() => removePlayer(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Remove player</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          
                          <div className="flex gap-3">
                            <div className="w-2/3">
                              <Input
                                id={`player-name-${index}`}
                                placeholder="Player name"
                                value={player.name}
                                onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                              />
                            </div>
                            <div className="relative w-1/3">
                              <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                                $
                              </span>
                              <Input
                                type="number"
                                placeholder="Buy-in"
                                min="0"
                                step="0.01"
                                value={player.initialBuyIn || ""}
                                onChange={(e) => updatePlayer(index, 'initialBuyIn', e.target.value)}
                                className="pl-7"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full border-primary/30 hover:bg-primary/5 text-primary"
                      onClick={addPlayer}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Player
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="sticky bottom-0 border-t border-primary/20 p-4 bg-primary/5 mt-auto">
              <div className="text-sm text-primary/70 flex-1">
                {existingGame 
                  ? "Add one or more players to the game" 
                  : "Takes at least 2 to play!"}
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  type="submit" 
                  disabled={!isFormValid()}
                >
                  {buttonText}
                </Button>
              </motion.div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
} 