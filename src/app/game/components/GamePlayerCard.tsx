"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, MinusCircle, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import theme from "@/theme/theme";
import { PlayerStats } from "@/store/game";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

interface GamePlayerCardProps {
  player: PlayerStats & { username: string };
  isEditable: boolean;
  isSettling?: boolean;
  onUpdate: (field: keyof PlayerStats, value: number) => void;
  onFinalStackChange?: (amount: number) => void;
}

export function GamePlayerCard({ 
  player, 
  isEditable, 
  isSettling = false,
  onUpdate,
  onFinalStackChange 
}: GamePlayerCardProps) {
  const [buyInAmount, setBuyInAmount] = useState<string>("");
  const [buyOutAmount, setBuyOutAmount] = useState<string>("");
  const [finalStack, setFinalStack] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>(player.username);
  
  // Fetch display name on mount
  useEffect(() => {
    async function fetchDisplayName() {
      try {
        const playerDoc = await getDoc(doc(db, "players", player.username));
        if (playerDoc.exists()) {
          const data = playerDoc.data();
          if (data.displayName) {
            setDisplayName(data.displayName);
          }
        }
      } catch (error) {
        console.error("Error fetching display name:", error);
        // Fallback to username is already handled since it's the default state
      }
    }
    
    fetchDisplayName();
  }, [player.username]);

  // Generate avatar seed from username
  const avatarSeed = player.username.slice(0, 8);
  const avatarUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${avatarSeed}`;
  
  // Calculate total amount
  const calculateTotalBuyIn = () => {
    return player.buyInInitial + player.addBuyIns - player.cashOuts;
  };

  const handleFinalStackChange = (value: string) => {
    setFinalStack(value);
    const amount = Number(value);
    if (!isNaN(amount) && onFinalStackChange) {
      onFinalStackChange(amount);
    }
  };

  const handleAddBuyIn = () => {
    if (!buyInAmount || isNaN(Number(buyInAmount)) || Number(buyInAmount) <= 0) return;
    
    const newAddBuyIns = player.addBuyIns + Number(buyInAmount);
    onUpdate('addBuyIns', newAddBuyIns);
    setBuyInAmount("");
  };

  const handleBuyOut = () => {
    if (!buyOutAmount || isNaN(Number(buyOutAmount)) || Number(buyOutAmount) <= 0) return;
    
    // Don't allow buy outs greater than the current total
    const currentTotal = calculateTotalBuyIn();
    if (Number(buyOutAmount) > currentTotal) return;
    
    const newCashOuts = player.cashOuts + Number(buyOutAmount);
    onUpdate('cashOuts', newCashOuts);
    setBuyOutAmount("");
  };

  return (
    <Card 
      className="w-full overflow-hidden transition-all hover:shadow-md"
      style={{ borderColor: theme.colors.primary + "33" }}
    >
      <CardHeader 
        className="pb-1 pt-2 px-4"
        style={{ 
          background: `linear-gradient(to right, ${theme.colors.primary}33, ${theme.colors.primary}0D)`
        }}
      >
        <CardTitle className="flex items-center gap-3">
          <Avatar 
            className="h-8 w-8"
            style={{ 
              borderWidth: 2,
              borderColor: theme.colors.primary + "33"
            }}
          >
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback 
              style={{ 
                backgroundColor: theme.colors.primary + "1A",
                color: theme.colors.primary
              }}
            >
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex items-center justify-between">
            <span style={{ color: theme.colors.primary }} className="font-semibold text-lg">
              {displayName}
            </span>
            <Badge 
              variant="outline" 
              className="font-mono px-2.5 py-1.5 text-base"
              style={{ 
                backgroundColor: theme.colors.primary + "1A",
                borderColor: theme.colors.primary + "4D",
                color: theme.colors.primary
              }}
            >
              ${calculateTotalBuyIn().toFixed(0)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between text-[1.1rem]">
          <span style={{ color: theme.colors.textSecondary }}>Initial Buy-in:</span>
          <span style={{ color: theme.colors.primary }} className="font-medium text-[1.1rem]">
            ${player.buyInInitial.toFixed(0)}
          </span>
        </div>
        
        {player.addBuyIns > 0 && (
          <div className="flex items-center justify-between text-[1.1rem]">
            <span style={{ color: theme.colors.textSecondary }}>Additional Buy-ins:</span>
            <span style={{ color: theme.colors.primary }} className="font-medium text-[1.1rem]">
              ${player.addBuyIns.toFixed(0)}
            </span>
          </div>
        )}
        
        {player.cashOuts > 0 && (
          <div className="flex items-center justify-between text-[1.1rem]">
            <span style={{ color: theme.colors.textSecondary }}>Buy-outs:</span>
            <span style={{ color: theme.colors.error }} className="font-medium text-[1.1rem]">
              -${player.cashOuts.toFixed(0)}
            </span>
          </div>
        )}

        {isSettling && (
          <div 
            className="mt-4 p-3 rounded-lg"
            style={{ 
              backgroundColor: theme.colors.primary + "0D",
              borderColor: theme.colors.primary + "33",
              border: "1px solid"
            }}
          >
            <label 
              className="block text-[1.1rem] font-medium mb-1"
              style={{ color: theme.colors.primary }}
            >
              Final Stack
            </label>
            <div className="relative">
              <span 
                className="absolute inset-y-0 left-3 flex items-center text-[1.1rem]"
                style={{ color: theme.colors.primary + "99" }}
              >
                $
              </span>
              <Input
                type="number"
                placeholder="Enter final amount"
                value={finalStack}
                onChange={(e) => handleFinalStackChange(e.target.value)}
                className="pl-7"
                style={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.5)",
                  borderColor: theme.colors.primary + "4D",
                  color: theme.colors.primary
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
      
      {isEditable && !isSettling && (
        <CardFooter className="flex gap-2 pt-0 pb-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 hover:bg-red-50"
                style={{ 
                  backgroundColor: theme.colors.primary + "0D",
                  borderColor: theme.colors.primary + "4D",
                  color: theme.colors.primary
                }}
              >
                <PlusCircle className="mr-1 h-4 w-4 text-red-500" />
                Buy In
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[85%] md:max-w-[500px] rounded-lg p-4">
              <DialogHeader className="pb-2">
                <DialogTitle>Add Buy In for {displayName}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" style={{ color: theme.colors.primary }} />
                  <Input
                    type="number"
                    placeholder="Amount"
                    min="1"
                    step="0.01"
                    value={buyInAmount}
                    onChange={(e) => setBuyInAmount(e.target.value)}
                    className="col-span-3"
                    style={{ 
                      borderColor: theme.colors.primary + "4D",
                      color: theme.colors.primary
                    }}
                  />
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
                <DialogClose asChild>
                  <Button 
                    onClick={handleAddBuyIn}
                    style={{ backgroundColor: theme.colors.error }}
                  >
                    Add Buy In
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 hover:bg-green-50"
                style={{ 
                  backgroundColor: theme.colors.primary + "0D",
                  borderColor: theme.colors.primary + "4D",
                  color: theme.colors.primary
                }}
              >
                <MinusCircle className="mr-1 h-4 w-4 text-green-500" />
                Buy Out
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[85%] md:max-w-[500px] rounded-lg p-4">
              <DialogHeader className="pb-2">
                <DialogTitle>Cash Out for {displayName}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" style={{ color: theme.colors.primary }} />
                  <Input
                    type="number"
                    placeholder="Amount"
                    min="1"
                    max={calculateTotalBuyIn()}
                    step="0.01"
                    value={buyOutAmount}
                    onChange={(e) => setBuyOutAmount(e.target.value)}
                    className="col-span-3"
                    style={{ 
                      borderColor: theme.colors.primary + "4D",
                      color: theme.colors.primary
                    }}
                  />
                </div>
                <p 
                  className="text-sm"
                  style={{ color: theme.colors.primary + "B3" }}
                >
                  Maximum cash out: ${calculateTotalBuyIn().toFixed(0)}
                </p>
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
                <DialogClose asChild>
                  <Button 
                    onClick={handleBuyOut}
                    disabled={Number(buyOutAmount) > calculateTotalBuyIn()}
                    style={{ backgroundColor: theme.colors.success }}
                  >
                    Cash Out
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      )}
    </Card>
  );
} 