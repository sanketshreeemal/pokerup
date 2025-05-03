"use client";

import { motion } from "framer-motion";
import { PokerChip } from "./PokerChip";

interface ChipStackProps {
  total: number;
  maxChips?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ChipStack({ total, maxChips = 5, size = "sm", className = "" }: ChipStackProps) {
  if (total <= 0) return null;
  
  // Function to break down the total into denominations
  const getChipDenominations = (total: number) => {
    const denominations = [1000, 500, 100, 50, 25, 10, 5, 1];
    let remaining = total;
    const chips: number[] = [];
    
    denominations.forEach(denom => {
      while (remaining >= denom && chips.length < maxChips) {
        chips.push(denom);
        remaining -= denom;
      }
    });
    
    // If we still have remainder but hit max chips, adjust the last chip
    if (remaining > 0 && chips.length === maxChips) {
      chips[chips.length - 1] += remaining;
    }
    
    // If we have room and remainder, add it as the smallest chip
    if (remaining > 0 && chips.length < maxChips) {
      chips.push(remaining);
    }
    
    return chips.slice(0, maxChips);
  };
  
  const chips = getChipDenominations(total);
  
  return (
    <div className={`relative ${className}`}>
      {chips.map((value, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ 
            zIndex: chips.length - index,
            bottom: `${index * 4}px`
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 15 }}
        >
          <PokerChip value={value} size={size} />
        </motion.div>
      ))}
    </div>
  );
} 