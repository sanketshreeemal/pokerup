"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, DollarSign, ArrowLeft, ArrowRight, Timer, PlusCircle } from "lucide-react";
import { GamePlayerCard } from "./GamePlayerCard";
import theme from "@/theme/theme";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { GameDoc } from "@/store/game";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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
  };
  
  const handleFinalStackChange = (username: string, amount: number) => {
    setFinalStacks(prev => ({
      ...prev,
      [username]: amount
    }));
  };
  
  const handleSettlement = () => {
    onRequestSettlement(finalStacks);
  };

  const allStacksEntered = () => {
    return Object.keys(finalStacks).length === game.playerUsernames.length;
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

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      <Card 
        className="w-full flex flex-col h-full relative"
        style={{ borderColor: theme.colors.primary + "33" }}
      >
        <CardHeader 
          className="pb-3 flex-shrink-0"
          style={{ 
            background: `linear-gradient(to right, ${theme.colors.primary}33, ${theme.colors.primary}0D)`
          }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div className="pr-32">
                <CardTitle 
                  className="text-3xl font-bold break-words"
                  style={{ color: theme.colors.primary }}
                >
                  {game.name}
                </CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-1" style={{ color: theme.colors.primary + "B3" }} />
                  <span>{formatDate(game.createdAt)}</span>
                </CardDescription>
                
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

            <div className="flex gap-4 flex-wrap mt-2">
              <Badge 
                variant="outline" 
                className="flex items-center font-large"
                style={{ 
                  backgroundColor: theme.colors.primary + "1A",
                  borderColor: theme.colors.primary + "4D",
                  color: theme.colors.primary
                }}
              >
                ${totalBuyIn.toFixed(0)}
              </Badge>
              <Badge 
                variant="outline" 
                className="font-large"
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
        </CardHeader>
        
        <CardContent className="pt-4 flex-grow flex flex-col overflow-hidden">
          <div className="mb-4 flex-shrink-0">
            <h2 
              className="text-xl font-semibold"
              style={{ color: theme.colors.primary }}
            >
              Players
            </h2>
          </div>
          
          <div className="flex-grow overflow-hidden">
            <ScrollArea className="h-[calc(100%-1rem)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 pr-4">
                {game.playerUsernames.map((username) => (
                  <GamePlayerCard
                    key={username}
                    player={{
                      username,
                      ...game.players[username]
                    }}
                    isEditable={!isSettling}
                    isSettling={isSettling}
                    onUpdate={(field, value) => handlePlayerUpdate(username, field, value)}
                    onFinalStackChange={(amount) => handleFinalStackChange(username, amount)}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
        
        <div 
          className="px-4 py-3 flex justify-between"
          style={{ 
            borderColor: theme.colors.primary + "33",
            backgroundColor: theme.colors.primary + "0D"
          }}
        >
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
                disabled={!allStacksEntered()}
              >
                <span>Settle Up</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          ) : (
            <>
              <Dialog open={showAddPlayerDialog} onOpenChange={(open) => {
                setShowAddPlayerDialog(open);
                if (!open) setAlert(null);
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
                <DialogContent className="sm:max-w-[85%] md:max-w-[500px] rounded-lg p-4">
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

                  <div className="grid gap-3 py-2">
                    <div className="flex gap-3">
                      <Input
                        placeholder="username"
                        value={newPlayerUsername}
                        onChange={(e) => setNewPlayerUsername(e.target.value.toLowerCase())}
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
                          $
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
      </Card>
    </div>
  );
} 