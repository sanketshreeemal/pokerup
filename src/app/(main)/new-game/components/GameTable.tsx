"use client";

import { useState, useEffect, useRef } from "react";
import { Player, Game } from "@/types";
import { PlayerCard } from "./PlayerCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Clock, DollarSign, ArrowLeft, Timer, PlusCircle } from "lucide-react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

interface GameTableProps {
  game: Game;
  onUpdatePlayer: (updatedPlayer: Player) => void;
  onRequestSettlement: (finalStacks: Record<string, number>) => void;
  onAddPlayer: () => void;
}

export function GameTable({ game, onUpdatePlayer, onRequestSettlement, onAddPlayer }: GameTableProps) {
  const [isSettling, setIsSettling] = useState<boolean>(false);
  const [finalStacks, setFinalStacks] = useState<Record<string, number>>({});
  const [elapsedTime, setElapsedTime] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: "00",
    minutes: "00",
    seconds: "00"
  });
  const [colonVisible, setColonVisible] = useState(true);
  
  // Calculate game statistics
  const totalPlayers = game.players.length;
  const totalBuyIn = game.players.reduce((sum, player) => sum + player.totalBuyIn, 0);
  
  // Timer effect
  useEffect(() => {
    const gameStartTime = new Date(game.date).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const diffMs = now - gameStartTime;
      
      // Format the time difference as HH:MM:SS
      const durationObj = dayjs.duration(diffMs);
      const hours = String(Math.floor(durationObj.asHours())).padStart(2, '0');
      const minutes = String(durationObj.minutes()).padStart(2, '0');
      const seconds = String(durationObj.seconds()).padStart(2, '0');
      
      setElapsedTime({ hours, minutes, seconds });
    };
    
    // Blink the colon every second for digital clock effect
    const blinkColon = () => {
      setColonVisible(prev => !prev);
    };
    
    // Initial update
    updateTimer();
    
    // Update the timer every second
    const timerId = setInterval(updateTimer, 1000);
    
    // Blink the colon every 500ms
    const blinkId = setInterval(blinkColon, 500);
    
    return () => {
      clearInterval(timerId);
      clearInterval(blinkId);
    };
  }, [game.date]);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };
  
  const handlePlayerUpdate = (updatedPlayer: Player) => {
    onUpdatePlayer(updatedPlayer);
  };
  
  const handleSettleUpClick = () => {
    setIsSettling(true);
    
    // Initialize final stacks with current buy-in amounts
    const stacks: Record<string, number> = {};
    game.players.forEach(player => {
      stacks[player.id] = player.totalBuyIn;
    });
    setFinalStacks(stacks);
  };
  
  const handleKeepPlayingClick = () => {
    setIsSettling(false);
    setFinalStacks({});
  };
  
  const handleFinalStackChange = (playerId: string, amount: number) => {
    setFinalStacks(prev => ({
      ...prev,
      [playerId]: amount
    }));
  };
  
  const handleSettlement = () => {
    onRequestSettlement(finalStacks);
  };

  const allStacksEntered = () => {
    // For now, we'll just check if there are any values defined
    // Later we can add proper validation
    return Object.keys(finalStacks).length === game.players.length;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <Card className="w-full border-primary/20 flex flex-col h-full relative">
        <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/5 pb-3 flex-shrink-0">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div className="pr-32">
                <CardTitle className="text-3xl text-primary font-bold break-words">
                  {game.name}
                </CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-1 text-primary/70" />
                  <span>{formatDate(game.date)}</span>
                </CardDescription>
                
                {/* Digital Timer Display - Repositioned inside the header */}
                <div className="mt-3 inline-flex items-center">
                  <div className="relative bg-gradient-to-b from-black/90 to-black/70 rounded-md p-1 shadow-md border border-primary/20">
                    <div className="bg-black/90 rounded-sm border border-primary/20 shadow-inner px-2 py-1">
                      <div className="flex items-center justify-center">
                        <span className="font-mono text-sm font-bold text-primary tracking-widest timer-digit">
                          {elapsedTime.hours}
                        </span>
                        <span className={`font-mono text-sm font-bold text-primary mx-0.5 ${colonVisible ? 'opacity-100' : 'opacity-30'}`}>
                          :
                        </span>
                        <span className="font-mono text-sm font-bold text-primary tracking-widest timer-digit">
                          {elapsedTime.minutes}
                        </span>
                        <span className={`font-mono text-sm font-bold text-primary mx-0.5 ${colonVisible ? 'opacity-100' : 'opacity-30'}`}>
                          :
                        </span>
                        <span className="font-mono text-sm font-bold text-primary tracking-widest timer-digit">
                          {elapsedTime.seconds}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap mt-2">
              <Badge variant="outline" className="flex items-center font-medium text-primary bg-primary/10 border-primary/30">
                <DollarSign className="h-3.5 w-3.5 mr-1" />
                ${totalBuyIn.toFixed(2)}
              </Badge>
              <Badge variant="outline" className="font-medium bg-primary/5 text-primary border-primary/30">
                {totalPlayers} Players
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        {/* Fixed position action buttons */}
        <div className="absolute right-6 top-6 flex flex-col gap-2">
          {isSettling ? (
            <Button 
              variant="secondary"
              className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary"
              onClick={handleKeepPlayingClick}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Keep Playing
            </Button>
          ) : (
            <>
              <Button 
                variant="default"
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={handleSettleUpClick}
              >
                Settle Up
              </Button>
              <Button 
                variant="outline"
                className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary"
                onClick={onAddPlayer}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Player
              </Button>
            </>
          )}
        </div>
        
        <CardContent className="pt-4 flex-grow flex flex-col overflow-hidden">
          <div className="mb-4 flex-shrink-0">
            <h2 className="text-xl font-semibold text-primary">Players</h2>
          </div>
          
          <div className="flex-grow overflow-hidden">
            <ScrollArea className="h-[calc(100%-1rem)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 pr-4">
                {game.players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isEditable={!isSettling}
                    isSettling={isSettling}
                    onUpdate={handlePlayerUpdate}
                    onFinalStackChange={(amount) => handleFinalStackChange(player.id, amount)}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
        
        {isSettling && (
          <div className="px-4 py-3 border-t border-primary/20 bg-primary/5">
            <Button 
              onClick={handleSettlement}
              className="w-full"
            >
              <span>Continue to Settlement</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
} 