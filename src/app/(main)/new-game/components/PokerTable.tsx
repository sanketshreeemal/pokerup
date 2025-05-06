"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Player } from "@/src/types";
// import { PlayerSpot } from "./PlayerSpot";
import { useGameStore } from "@/src/context-mgmt/gameStore";
import { CardDealer } from "./CardDealer";

interface PokerTableProps {
  players: Player[];
}

export function PokerTable({ players }: PokerTableProps) {
  const [visiblePlayers, setVisiblePlayers] = useState<Player[]>([]);
  const [showDealer, setShowDealer] = useState(false);
  const [dealingComplete, setDealingComplete] = useState(false);

  useEffect(() => {
    // Reset visible players when players prop changes
    setVisiblePlayers([]);
    setShowDealer(false);
    setDealingComplete(false);
    
    // Add players one by one with a delay to create a sequential animation effect
    const validPlayers = players.filter(player => player.name && player.initialBuyIn > 0);
    
    if (validPlayers.length === 0) return;
    
    // Use a more reliable way to add players with timeouts
    const timeouts: NodeJS.Timeout[] = [];
    
    validPlayers.forEach((player, index) => {
      const timeout = setTimeout(() => {
        setVisiblePlayers(prev => {
          // Prevent duplicate players
          if (prev.some(p => p.id === player.id)) return prev;
          return [...prev, player];
        });
        
        // Show dealer after all players are visible
        if (index === validPlayers.length - 1) {
          setTimeout(() => setShowDealer(true), 500);
        }
      }, index * 300);
      
      timeouts.push(timeout);
    });
    
    return () => {
      // Clear all timeouts when component unmounts
      timeouts.forEach(timeout => clearTimeout(timeout));
      setVisiblePlayers([]);
    };
  }, [players]);

  // Calculate positions around the table for each player
  const getPlayerPosition = (index: number, total: number) => {
    if (total === 0) return { x: 0, y: 0 };
    
    // Offset the starting angle to distribute players more evenly
    const startAngle = -Math.PI / 2; // Start from top
    
    // Divide the table into even segments
    const angle = startAngle + (index / total) * 2 * Math.PI;
    
    // Elliptical table positions (slightly wider than tall)
    const xRadius = 120;
    const yRadius = 80;
    
    return {
      x: Math.cos(angle) * xRadius,
      y: Math.sin(angle) * yRadius,
    };
  };

  const handleDealingComplete = () => {
    setDealingComplete(true);
  };

  return (
    <div className="relative w-full h-[240px] flex items-center justify-center my-4">
      {/* Table background with felt texture */}
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <div className="relative w-[320px] h-[200px]">
          <Image 
            src="/images/poker/poker-table.svg"
            alt="Poker Table"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
      
      {/* Players positioned around the table */}
      <AnimatePresence>
        {visiblePlayers.map((player, index) => {
          const position = getPlayerPosition(index, visiblePlayers.length);
          
          return (
            <motion.div
              key={player.id}
              className="absolute"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: position.x, 
                y: position.y 
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                duration: 0.5
              }}
            >
              <Avatar className="h-12 w-12 border-2 border-primary/30 shadow-lg">
                <AvatarFallback className="bg-primary-foreground text-primary font-bold">
                  {player.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {/* Card dealer for animations */}
      {showDealer && visiblePlayers.length >= 2 && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-auto">
          <CardDealer 
            numberOfPlayers={visiblePlayers.length} 
            onComplete={handleDealingComplete}
          />
        </div>
      )}
      
      {/* Center message */}
      <AnimatePresence>
        {dealingComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="absolute z-20"
          >
            <div className="bg-primary/70 px-3 py-1 rounded-md text-sm text-white backdrop-blur-sm font-medium">
              The Game Is On!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 