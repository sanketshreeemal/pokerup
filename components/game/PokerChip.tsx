"use client";

import { motion } from "framer-motion";

interface PokerChipProps {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const chipColors = {
  1: { bg: "bg-white", border: "border-gray-400", text: "text-gray-800" },
  5: { bg: "bg-red-600", border: "border-red-800", text: "text-white" },
  10: { bg: "bg-blue-600", border: "border-blue-800", text: "text-white" },
  25: { bg: "bg-green-600", border: "border-green-800", text: "text-white" },
  50: { bg: "bg-orange-500", border: "border-orange-700", text: "text-white" },
  100: { bg: "bg-black", border: "border-gray-700", text: "text-white" },
  500: { bg: "bg-purple-600", border: "border-purple-800", text: "text-white" },
  1000: { bg: "bg-yellow-500", border: "border-yellow-700", text: "text-yellow-900" },
};

export function PokerChip({ value, size = "md", className = "" }: PokerChipProps) {
  // Determine chip color based on value
  const chipValue = Object.keys(chipColors)
    .map(Number)
    .reduce((prev, curr) => {
      return (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
    }, Infinity);
  
  const { bg, border, text } = chipColors[chipValue as keyof typeof chipColors];
  
  // Determine size class
  const sizeClass = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
  }[size];
  
  return (
    <motion.div
      className={`relative rounded-full ${sizeClass} ${bg} ${border} border-4 flex items-center justify-center ${text} font-bold shadow-md ${className}`}
      initial={{ rotate: 0 }}
      whileHover={{ 
        rotate: [0, 15, -15, 0],
        scale: 1.1,
        transition: { duration: 0.5 }
      }}
    >
      <div className="absolute inset-1 rounded-full border-2 border-dashed border-opacity-20"></div>
      <span>${value}</span>
    </motion.div>
  );
} 