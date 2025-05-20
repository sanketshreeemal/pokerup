"use client";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import theme from "@/theme/theme";
import { getCurrencySymbol } from "@/theme/theme";
import { useState, useEffect } from "react";
import { checkUsernameExists } from "@/lib/firebase/firebaseUtils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NewPlayerCardProps {
  playerNumber: number;
  onUpdate: (playerNumber: number, username: string, buyIn: number) => void;
  onDelete?: () => void;
  currency: string;
  onUsernameAlert?: (username: string | null) => void;
}

export default function NewPlayerCard({
  playerNumber,
  onUpdate,
  onDelete,
  currency,
  onUsernameAlert
}: NewPlayerCardProps) {
  const [username, setUsername] = useState("");
  const [buyIn, setBuyIn] = useState<string>("");
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [isValidatingUsername, setIsValidatingUsername] = useState(false);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value.toLowerCase();
    setUsername(newUsername);
    // Reset display name and alert when username changes
    if (displayName) setDisplayName(null);
    if (showAlert) {
      setShowAlert(false);
      if (onUsernameAlert) onUsernameAlert(null);
    }
    onUpdate(playerNumber, newUsername, parseFloat(buyIn) || 0);
  };

  const handleUsernameBlur = async () => {
    // Only validate if there's a username
    if (!username || username.trim() === '') {
      setDisplayName(null);
      setShowAlert(false);
      if (onUsernameAlert) onUsernameAlert(null);
      return;
    }
    
    try {
      setIsValidatingUsername(true);
      const playerData = await checkUsernameExists(username);
      
      if (playerData) {
        // Username exists, show display name
        setDisplayName(playerData.displayName);
        setShowAlert(false);
        if (onUsernameAlert) onUsernameAlert(null);
      } else {
        // Username doesn't exist, show alert but don't set display name
        setDisplayName(null);
        setShowAlert(true);
        if (onUsernameAlert) onUsernameAlert(username);
      }
    } catch (error) {
      console.error("Error validating username:", error);
    } finally {
      setIsValidatingUsername(false);
    }
  };

  const handleBuyInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBuyIn = e.target.value;
    setBuyIn(newBuyIn);
    onUpdate(playerNumber, username, parseFloat(newBuyIn) || 0);
  };

  const handleDismissAlert = () => {
    setShowAlert(false);
    if (onUsernameAlert) onUsernameAlert(null);
  };

  // If there's a parent alert handler, don't show the alert in the card
  const shouldShowLocalAlert = showAlert && !onUsernameAlert;

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
        <div className="flex flex-col gap-2">
          <div className="flex gap-3">
            <Input
              placeholder="username"
              value={username}
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
          
          {/* Display name when username is valid */}
          {displayName && (
            <div 
              className="text-sm pl-1"
              style={{ color: theme.colors.textSecondary }}
            >
              {displayName}
            </div>
          )}
          
          {/* Alert for non-existent username - only show if no parent alert handler */}
          {shouldShowLocalAlert && (
            <Alert 
              className="mt-1 py-2 flex items-center justify-between"
              style={{
                backgroundColor: theme.colors.warning + "1A",
                borderColor: theme.colors.warning + "4D",
                color: theme.colors.textPrimary
              }}
            >
              <AlertDescription className="text-xs">
                Request {username} to log into PokerUp for a richer experience.
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
        </div>
      </CardContent>
    </Card>
  );
} 