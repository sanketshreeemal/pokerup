"use client";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import theme from "@/theme/theme";
import { useState } from "react";

interface NewPlayerCardProps {
  playerNumber: number;
  onUpdate: (playerNumber: number, username: string, buyIn: number) => void;
  onDelete?: () => void;
  currency: string;
}

export default function NewPlayerCard({
  playerNumber,
  onUpdate,
  onDelete,
  currency
}: NewPlayerCardProps) {
  const [username, setUsername] = useState("");
  const [buyIn, setBuyIn] = useState<string>("");

  const getCurrencySymbol = (currency: string) => {
    return currency === "INR" ? "₹" : "$";
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value.toLowerCase();
    setUsername(newUsername);
    onUpdate(playerNumber, newUsername, parseFloat(buyIn) || 0);
  };

  const handleBuyInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBuyIn = e.target.value;
    setBuyIn(newBuyIn);
    onUpdate(playerNumber, username, parseFloat(newBuyIn) || 0);
  };

  return (
    <Card 
      className="w-full overflow-hidden transition-all hover:shadow-md mb-4"
      style={{ borderColor: theme.colors.primary + "33" }}
    >
      <CardHeader 
        className="pb-1 pt-1 px-3"
        style={{ 
          background: `linear-gradient(to right, ${theme.colors.primary}1A, ${theme.colors.primary}08)`
        }}
      >
        <CardTitle className="flex items-center justify-between">
          <span style={{ color: theme.colors.primary }} className="font-normal text-base">
            Player {playerNumber}
          </span>
          <button 
            onClick={onDelete} 
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-50 transition-colors"
            style={{ color: theme.colors.error }}
            aria-label="Delete player"
          >
            <Trash2 size={18} />
          </button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-2 pb-3">
        <div className="flex gap-3">
          <Input
            placeholder="username"
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
              {getCurrencySymbol(currency)}
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
      </CardContent>
    </Card>
  );
} 