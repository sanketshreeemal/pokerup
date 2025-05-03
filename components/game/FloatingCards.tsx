"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function FloatingCards() {
  // Define random positions for the floating cards - reduced to just two
  const cards = [
    { id: 1, rotation: 10, delay: 0, xPosition: "15%", yPosition: "15%" },
    { id: 2, rotation: -8, delay: 1.5, xPosition: "85%", yPosition: "20%" },
  ];
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {cards.map((card) => (
        <motion.div
          key={card.id}
          className="absolute z-0"
          style={{ 
            top: card.yPosition,
            left: card.xPosition,
            rotate: `${card.rotation}deg`,
          }}
          initial={{ opacity: 0 }}
          animate={{
            y: [0, -10, 0, 10, 0],
            x: [0, 5, 0, -5, 0],
            opacity: 0.03,
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            delay: card.delay,
            ease: "easeInOut",
          }}
        >
          <div className="relative w-14 h-20">
            <Image
              src="/images/poker/card-background.svg"
              alt="Playing Card"
              fill
              className="object-contain opacity-50"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
} 