"use client";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import theme from "@/theme/theme";
import { useState } from "react";

interface NewPlayerCardProps {
  playerNumber: number;
  onUpdate: (playerNumber: number, username: string, buyIn: number) => void;
  onDelete?: () => void;
}

export default function NewPlayerCard({
  playerNumber,
  onUpdate,
  onDelete,
}: NewPlayerCardProps) {
  const [username, setUsername] = useState("");
  const [buyIn, setBuyIn] = useState<string>("");

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    onUpdate(playerNumber, newUsername, parseFloat(buyIn) || 0);
  };

  const handleBuyInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBuyIn = e.target.value;
    setBuyIn(newBuyIn);
    onUpdate(playerNumber, username, parseFloat(newBuyIn) || 0);
  };

  return (
    <div className="mb-5">
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-base font-medium" style={{ color: theme.colors.primary }}>
            Player {playerNumber}
          </span>
          
          <button 
            onClick={onDelete} 
            className="flex items-center justify-center w-8 h-8"
            aria-label="Delete player"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke={theme.colors.secondary} 
              strokeWidth="2"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
              <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
            </svg>
          </button>
        </div>
        
        <div className="flex gap-3">
          <Input
            placeholder="Username"
            value={username}
            onChange={handleUsernameChange}
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
              value={buyIn}
              onChange={handleBuyInChange}
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
      <Separator className="mt-4" style={{ backgroundColor: theme.colors.border }} />
    </div>
  );
} 