"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface CardDealerProps {
  numberOfPlayers: number;
  autoStart?: boolean;
  onComplete?: () => void;
}

export function CardDealer({ 
  numberOfPlayers, 
  autoStart = false, 
  onComplete 
}: CardDealerProps) {
  const [isDealing, setIsDealing] = useState(autoStart);
  const [dealtCards, setDealtCards] = useState<number[]>([]);
  
  // Calculate positions for dealing cards
  const getPositionForPlayer = (playerIndex: number, totalPlayers: number) => {
    if (totalPlayers <= 0) return { x: 0, y: 0 };
    
    // Start from top position with offset (matches PokerTable)
    const startAngle = -Math.PI / 2;
    
    // Divide the circle into even angles
    const angle = startAngle + (playerIndex / totalPlayers) * 2 * Math.PI;
    
    // Elliptical positions (same as in PokerTable)
    const xRadius = 150;
    const yRadius = 100;
    
    return {
      x: Math.cos(angle) * xRadius,
      y: Math.sin(angle) * yRadius,
    };
  };
  
  // Deal cards animation
  useEffect(() => {
    if (!isDealing) return;
    
    const cleanupTimeouts: NodeJS.Timeout[] = [];
    
    // Deal 2 cards to each player
    const totalCards = numberOfPlayers * 2;
    
    // Deal cards one by one with delay
    for (let i = 0; i < totalCards; i++) {
      const timeout = setTimeout(() => {
        setDealtCards(prev => [...prev, i]);
        
        // If this is the last card, call onComplete
        if (i === totalCards - 1) {
          const completeTimeout = setTimeout(() => {
            onComplete?.();
          }, 500);
          cleanupTimeouts.push(completeTimeout);
        }
      }, i * 250); // Slightly faster dealing
      
      cleanupTimeouts.push(timeout);
    }
    
    return () => {
      cleanupTimeouts.forEach(timeout => clearTimeout(timeout));
      setDealtCards([]);
    };
  }, [isDealing, numberOfPlayers, onComplete]);
  
  const startDealing = () => {
    setDealtCards([]);
    setIsDealing(true);
  };
  
  return (
    <div className="relative w-full h-[180px] flex items-center justify-center">
      {/* Dealer position (center) */}
      <div className="absolute z-10">
        {!isDealing ? (
          <motion.button
            onClick={startDealing}
            className="px-3 py-1 bg-primary hover:bg-primary/90 text-white rounded-md text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Deal Cards
          </motion.button>
        ) : (
          <div className="relative w-14 h-20">
            <Image
              src="/images/poker/card-background.svg"
              alt="Card Deck"
              fill
              className="object-contain drop-shadow-md"
            />
          </div>
        )}
      </div>
      
      {/* Dealt cards animation */}
      <AnimatePresence>
        {dealtCards.map((cardIndex) => {
          // Calculate which player gets this card
          const playerIndex = Math.floor(cardIndex / 2);
          // Calculate position
          const position = getPositionForPlayer(playerIndex, numberOfPlayers);
          // Slight offset for second card
          const isSecondCard = cardIndex % 2 === 1;
          const xOffset = isSecondCard ? 7 : -7;
          
          return (
            <motion.div
              key={cardIndex}
              className="absolute z-0"
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={{ 
                x: position.x + xOffset, 
                y: position.y, 
                rotate: isSecondCard ? 5 : -5,
                opacity: 0.7
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25,
                duration: 0.2
              }}
            >
              <div className="relative w-10 h-14">
                <Image
                  src="/images/poker/card-background.svg"
                  alt="Playing Card"
                  fill
                  className="object-contain drop-shadow-md"
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
} 