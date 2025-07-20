"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, DollarSign, ArrowLeft, ArrowRight, Timer, PlusCircle } from "lucide-react";
import { GamePlayerCard } from "./GamePlayerCard";
import theme from "@/theme/theme";
import { getCurrencySymbol } from "@/theme/theme";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { GameDoc } from "@/store/game";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { checkUsernameExists } from "@/lib/firebase/firebaseUtils";

dayjs.extend(duration);

interface ActiveGameProps {
  game: GameDoc;
  gameId: string;
  onUpdatePlayer: (username: string, field: string, value: number) => void;
  onRequestSettlement: (finalStacks: Record<string, number>) => void;
  onAddPlayer: (username: string, buyInAmount: number) => void;
}

export function ActiveGame({ game, gameId, onUpdatePlayer, onRequestSettlement, onAddPlayer }: ActiveGameProps) {
  const [isSettling, setIsSettling] = useState<boolean>(false);
  const [finalStacks, setFinalStacks] = useState<Record<string, number>>({});
  const [elapsedTime, setElapsedTime] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: "00",
    minutes: "00",
    seconds: "00"
  });
  const [colonVisible, setColonVisible] = useState(true);
  const [newPlayerUsername, setNewPlayerUsername] = useState("");
  const [newPlayerBuyIn, setNewPlayerBuyIn] = useState("");
  const [showAddPlayerDialog, setShowAddPlayerDialog] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [showUsernameAlert, setShowUsernameAlert] = useState(false);
  const [isValidatingUsername, setIsValidatingUsername] = useState(false);
  
  // Get currency symbol
  const currencySymbol = getCurrencySymbol(game.currency);
  
  // Calculate game statistics
  const totalPlayers = game.playerUsernames.length;
  const totalBuyIn = Object.values(game.players).reduce((sum, player) => {
    return sum + player.buyInInitial + player.addBuyIns - player.cashOuts;
  }, 0);
  
  // Timer effect
  useEffect(() => {
    const gameStartTime = game.createdAt.toMillis();
    
    const updateTimer = () => {
      const now = Date.now();
      const diffMs = now - gameStartTime;
      
      const durationObj = dayjs.duration(diffMs);
      const hours = String(Math.floor(durationObj.asHours())).padStart(2, '0');
      const minutes = String(durationObj.minutes()).padStart(2, '0');
      const seconds = String(durationObj.seconds()).padStart(2, '0');
      
      setElapsedTime({ hours, minutes, seconds });
      
      // Store the current timer data in localStorage for later use by the settlement page
      localStorage.setItem(`game_${gameId}_timer`, JSON.stringify({ 
        hours, 
        minutes, 
        seconds 
      }));
    };
    
    const blinkColon = () => {
      setColonVisible(prev => !prev);
    };
    
    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    const blinkId = setInterval(blinkColon, 500);
    
    return () => {
      clearInterval(timerId);
      clearInterval(blinkId);
    };
  }, [game.createdAt, gameId]);
  
  // Effect to auto-close dialog after success
  useEffect(() => {
    if (alert?.type === 'success') {
      const timer = setTimeout(() => {
        setShowAddPlayerDialog(false);
        setAlert(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [alert]);
  
  const formatDate = (timestamp: any) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(timestamp.toDate());
  };
  
  const handlePlayerUpdate = (username: string, field: string, value: number) => {
    onUpdatePlayer(username, field, value);
  };
  
  const handleSettleUpClick = () => {
    setIsSettling(true);
    setValidationError(null);
    const stacks: Record<string, number> = {};
    Object.entries(game.players).forEach(([username, stats]) => {
      const totalStack = stats.buyInInitial + stats.addBuyIns - stats.cashOuts;
      stacks[username] = totalStack;
    });
    setFinalStacks(stacks);
  };
  
  const handleKeepPlayingClick = () => {
    setIsSettling(false);
    setFinalStacks({});
    setValidationError(null);
  };
  
  const handleFinalStackChange = (username: string, amount: number) => {
    setFinalStacks(prev => ({
      ...prev,
      [username]: amount
    }));
    // Clear validation error when user makes changes
    setValidationError(null);
  };
  
  const validateFinalStacks = (): boolean => {
    // Calculate total funds in the game
    const totalGameFunds = Object.values(game.players).reduce((sum, player) => {
      return sum + player.buyInInitial + player.addBuyIns - player.cashOuts;
    }, 0);
    
    // Calculate sum of final stacks
    const totalFinalStacks = Object.values(finalStacks).reduce((sum, amount) => sum + amount, 0);
    
    // Compare with a small tolerance for floating-point errors (0.01)
    const difference = totalFinalStacks - totalGameFunds;
    
    if (Math.abs(difference) > 0.01) {
      if (difference > 0) {
        setValidationError(`Final stack total too high by ${currencySymbol}${difference.toFixed(2)}`);
      } else {
        setValidationError(`Final stack total short by ${currencySymbol}${Math.abs(difference).toFixed(2)}`);
      }
      return false;
    }
    
    return true;
  };
  
  const handleSettlement = () => {
    // First check if all stacks are entered
    if (!allStacksEntered()) {
      setValidationError("All players must have a final stack amount");
      return;
    }
    
    // Validate that the sum of final stacks equals the total game funds
    if (!validateFinalStacks()) {
      return;
    }
    
    // If validation passes, proceed to settlement
    onRequestSettlement(finalStacks);
  };

  const allStacksEntered = () => {
    return game.playerUsernames.every(username => {
      const amount = finalStacks[username];
      return amount !== undefined && !isNaN(amount) && amount >= 0;
    });
  };

  const handleAddPlayerSubmit = async () => {
    if (!newPlayerUsername.trim() || !newPlayerBuyIn || Number(newPlayerBuyIn) <= 0) {
      setAlert({
        type: 'error',
        message: 'Please enter a valid username and buy-in amount.'
      });
      return;
    }
    
    try {
      await onAddPlayer(newPlayerUsername.trim(), Number(newPlayerBuyIn));
      setAlert({
        type: 'success',
        message: 'Player added successfully!'
      });
      setNewPlayerUsername("");
      setNewPlayerBuyIn("");
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to add player. Please try again.'
      });
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Filter input to only allow lowercase letters, numbers, and underscores
    const filteredValue = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setNewPlayerUsername(filteredValue);
    // Reset display name and alert when username changes
    setDisplayName(null);
    setShowUsernameAlert(false);
  };

  const handleUsernameBlur = async () => {
    // Only validate if there's a username
    if (!newPlayerUsername || newPlayerUsername.trim() === '') {
      setDisplayName(null);
      setShowUsernameAlert(false);
      return;
    }
    
    try {
      setIsValidatingUsername(true);
      const playerData = await checkUsernameExists(newPlayerUsername);
      
      if (playerData) {
        // Username exists, show display name
        setDisplayName(playerData.displayName);
        setShowUsernameAlert(false);
      } else {
        // Username doesn't exist, show alert but don't set display name
        setDisplayName(null);
        setShowUsernameAlert(true);
      }
    } catch (error) {
      console.error("Error validating username:", error);
    } finally {
      setIsValidatingUsername(false);
    }
  };

  const handleDismissAlert = () => {
    setShowUsernameAlert(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <Card 
        className="w-full flex flex-col h-full relative"
        style={{ borderColor: theme.colors.primary + "33" }}
      >
        {/* Single scrollable area containing both game details and players */}
        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-full">
            {/* Game Details Section - Full width, no padding */}
            <div 
              className="w-full"
              style={{ 
                background: `linear-gradient(to right, ${theme.colors.primary}33, ${theme.colors.primary}0D)`
              }}
            >
              <div className="px-6 py-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div className="pr-32">
                      <h1 
                        className="text-3xl font-bold break-words"
                        style={{ color: theme.colors.primary }}
                      >
                        {game.name}
                      </h1>
                      <div className="flex items-center mt-1 text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" style={{ color: theme.colors.primary + "B3" }} />
                        <span>{formatDate(game.createdAt)}</span>
                      </div>
                      
                      <div className="mt-3 inline-flex items-center">
                        <div 
                          className="relative rounded-md p-1 shadow-md border"
                          style={{ 
                            background: `linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.7))`,
                            borderColor: theme.colors.primary + "33"
                          }}
                        >
                          <div 
                            className="rounded-sm border shadow-inner px-2 py-1"
                            style={{ 
                              backgroundColor: "rgba(0,0,0,0.9)",
                              borderColor: theme.colors.primary + "33"
                            }}
                          >
                            <div className="flex items-center justify-center">
                              <span 
                                className="font-mono text-sm font-bold tracking-widest timer-digit"
                                style={{ color: theme.colors.primary }}
                              >
                                {elapsedTime.hours}
                              </span>
                              <span 
                                className={`font-mono text-sm font-bold mx-0.5 ${colonVisible ? 'opacity-100' : 'opacity-30'}`}
                                style={{ color: theme.colors.primary }}
                              >
                                :
                              </span>
                              <span 
                                className="font-mono text-sm font-bold tracking-widest timer-digit"
                                style={{ color: theme.colors.primary }}
                              >
                                {elapsedTime.minutes}
                              </span>
                              <span 
                                className={`font-mono text-sm font-bold mx-0.5 ${colonVisible ? 'opacity-100' : 'opacity-30'}`}
                                style={{ color: theme.colors.primary }}
                              >
                                :
                              </span>
                              <span 
                                className="font-mono text-sm font-bold tracking-widest timer-digit"
                                style={{ color: theme.colors.primary }}
                              >
                                {elapsedTime.seconds}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 flex-wrap mt-1">
                    <Badge 
                      variant="outline" 
                      className="flex items-center font-large px-2 py-1 text-sm"
                      style={{ 
                        backgroundColor: theme.colors.primary + "1A",
                        borderColor: theme.colors.primary + "4D",
                        color: theme.colors.primary
                      }}
                    >
                      {currencySymbol}{totalBuyIn.toFixed(0)}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="font-large px-2 py-1 text-sm"
                      style={{ 
                        backgroundColor: theme.colors.primary + "0D",
                        borderColor: theme.colors.primary + "4D",
                        color: theme.colors.primary
                      }}
                    >
                      {totalPlayers} Players
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Players Section - With padding */}
            <div className="px-6 pt-4">
              <div className="mb-4">
                <h2 
                  className="text-xl font-semibold"
                  style={{ color: theme.colors.primary }}
                >
                  Players
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
                {game.playerUsernames.map((username) => (
                  <GamePlayerCard
                    key={username}
                    player={{
                      username,
                      ...game.players[username]
                    }}
                    isEditable={!isSettling}
                    isSettling={isSettling}
                    currency={game.currency}
                    onUpdate={(field, value) => handlePlayerUpdate(username, field, value)}
                    onFinalStackChange={(amount) => handleFinalStackChange(username, amount)}
                  />
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
        
        {/* Bottom buttons section - anchored */}
        <div 
          className="px-4 py-3 flex flex-col border-t flex-shrink-0"
          style={{ 
            borderColor: theme.colors.primary + "33",
            backgroundColor: theme.colors.primary + "0D"
          }}
        >
          {validationError && (
            <Alert 
              variant="destructive"
              className="mb-3"
            >
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-between">
            {isSettling ? (
              <>
                <Button 
                  variant="secondary"
                  className="hover:bg-primary/20 border"
                  style={{ 
                    backgroundColor: theme.colors.primary + "1A",
                    borderColor: theme.colors.primary + "4D",
                    color: theme.colors.primary
                  }}
                  onClick={handleKeepPlayingClick}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Keep Playing
                </Button>
                <Button 
                  onClick={handleSettlement}
                  className="ml-auto"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  <span>Settle Up</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </>
            ) : (
              <>
                <Dialog open={showAddPlayerDialog} onOpenChange={(open) => {
                  setShowAddPlayerDialog(open);
                  if (!open) {
                    setAlert(null);
                    setDisplayName(null);
                    setShowUsernameAlert(false);
                    setNewPlayerUsername("");
                    setNewPlayerBuyIn("");
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="hover:bg-primary/20 border"
                      style={{ 
                        backgroundColor: theme.colors.primary + "1A",
                        borderColor: theme.colors.primary + "4D",
                        color: theme.colors.primary
                      }}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Player
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[85%] md:max-w-[300px] rounded-lg p-4">
                    <DialogHeader className="pb-2">
                      <DialogTitle>Add Player</DialogTitle>
                    </DialogHeader>
                    
                    {alert && (
                      <Alert 
                        variant={alert.type === 'error' ? "destructive" : "default"}
                        className="mb-3"
                        style={alert.type === 'success' ? {
                          borderColor: theme.colors.success + "4D",
                          color: theme.colors.success,
                          backgroundColor: theme.colors.success + "0D"
                        } : undefined}
                      >
                        <AlertDescription>
                          {alert.message}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Username alert for non-existent usernames */}
                    {showUsernameAlert && (
                      <Alert 
                        className="mb-3 py-2 flex items-center justify-between"
                        style={{
                          backgroundColor: theme.colors.warning + "1A",
                          borderColor: theme.colors.warning + "4D",
                          color: theme.colors.textPrimary
                        }}
                      >
                        <AlertDescription className="text-xs">
                          Request {newPlayerUsername} to log into PokerUp for a richer experience.
                        </AlertDescription>
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="px-2 py-1 h-6 text-xs"
                          onClick={handleDismissAlert}
                        >
                          Skip
                        </Button>
                      </Alert>
                    )}

                    <div className="grid gap-3 py-2">
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                          <Input
                            placeholder="username"
                            value={newPlayerUsername}
                            onChange={handleUsernameChange}
                            onBlur={handleUsernameBlur}
                            className="flex-1 h-10 rounded-md"
                            style={{
                              backgroundColor: theme.colors.surface,
                              color: theme.components.input.text,
                              border: `1px solid ${theme.components.input.border}`,
                            }}
                          />
                          
                          <div className="relative w-24">
                            <div 
                              className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                              style={{ color: theme.colors.textSecondary }}
                            >
                              {currencySymbol}
                            </div>
                            <Input
                              type="number"
                              placeholder="Buy-in"
                              value={newPlayerBuyIn}
                              onChange={(e) => setNewPlayerBuyIn(e.target.value)}
                              className="w-full pl-7 pr-2 h-10 rounded-md"
                              style={{
                                backgroundColor: theme.colors.surface,
                                color: theme.components.input.text,
                                border: `1px solid ${theme.components.input.border}`,
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Display name when username is valid */}
                        {displayName && (
                          <div 
                            className="text-sm pl-1 -mt-2"
                            style={{ color: theme.colors.textSecondary }}
                          >
                            {displayName}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <DialogClose asChild>
                        <Button 
                          variant="outline"
                          style={{ 
                            borderColor: theme.colors.primary + "4D",
                            color: theme.colors.primary
                          }}
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button 
                        onClick={handleAddPlayerSubmit}
                        disabled={!newPlayerUsername.trim() || !newPlayerBuyIn || Number(newPlayerBuyIn) <= 0}
                        style={{ backgroundColor: theme.colors.primary }}
                      >
                        Add Player
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="default"
                  className="hover:bg-primary/90 text-white ml-auto"
                  style={{ backgroundColor: theme.colors.primary }}
                  onClick={handleSettleUpClick}
                >
                  End Game
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
} 