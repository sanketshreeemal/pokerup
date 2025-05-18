"use client";

import { useState } from "react";
import { Player } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, MinusCircle, Wallet, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

interface PlayerCardProps {
  player: Player;
  isEditable: boolean;
  isSettling?: boolean;
  onUpdate: (updatedPlayer: Player) => void;
  onFinalStackChange?: (amount: number) => void;
}

export function PlayerCard({ 
  player, 
  isEditable, 
  isSettling = false,
  onUpdate,
  onFinalStackChange 
}: PlayerCardProps) {
  const [buyInAmount, setBuyInAmount] = useState<string>("");
  const [buyOutAmount, setBuyOutAmount] = useState<string>("");
  const [finalStack, setFinalStack] = useState<string>("");
  
  // Generate a consistent avatar seed for each player
  const avatarSeed = player.id.slice(0, 8);
  const avatarUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${avatarSeed}`;
  
  // Calculate the total amount
  const calculateTotalBuyIn = () => {
    const initialAmount = player.initialBuyIn || 0;
    const additionalAmount = player.additionalBuyIns.reduce((sum, item) => sum + item.amount, 0);
    const buyOutAmount = player.buyOuts.reduce((sum, item) => sum + item.amount, 0);
    return initialAmount + additionalAmount - buyOutAmount;
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
    
    const updatedPlayer = {
      ...player,
      additionalBuyIns: [
        ...player.additionalBuyIns,
        { amount: Number(buyInAmount), timestamp: Date.now() }
      ],
      totalBuyIn: player.totalBuyIn + Number(buyInAmount)
    };
    
    onUpdate(updatedPlayer);
    setBuyInAmount("");
  };

  const handleBuyOut = () => {
    if (!buyOutAmount || isNaN(Number(buyOutAmount)) || Number(buyOutAmount) <= 0) return;
    
    // Don't allow buy outs greater than the current total
    const currentTotal = calculateTotalBuyIn();
    if (Number(buyOutAmount) > currentTotal) return;
    
    const updatedPlayer = {
      ...player,
      buyOuts: [
        ...player.buyOuts,
        { amount: Number(buyOutAmount), timestamp: Date.now() }
      ],
      totalBuyIn: player.totalBuyIn - Number(buyOutAmount)
    };
    
    onUpdate(updatedPlayer);
    setBuyOutAmount("");
  };

  return (
    <Card className="w-full overflow-hidden transition-all hover:shadow-md border-primary/20">
      <CardHeader className="pb-1 pt-2 px-4 bg-gradient-to-r from-primary/20 to-primary/5">
        <CardTitle className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border-2 border-primary/20">
            <AvatarImage src={avatarUrl} alt={player.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {player.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex items-center justify-between">
            <span className="text-primary font-semibold text-lg">{player.name}</span>
            <Badge variant="outline" className="font-mono px-2.5 py-1.5 bg-primary/10 border-primary/30 text-primary text-base">
              ${calculateTotalBuyIn().toFixed(2)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between text-[1.1rem] text-muted-foreground">
          <span>Initial Buy-in:</span>
          <span className="font-medium text-primary text-[1.1rem]">${player.initialBuyIn.toFixed(2)}</span>
        </div>
        
        {player.additionalBuyIns.length > 0 && (
          <div className="flex items-center justify-between text-[1.1rem] text-muted-foreground">
            <span>Additional Buy-ins:</span>
            <span className="font-medium text-primary text-[1.1rem]">
              ${player.additionalBuyIns.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
            </span>
          </div>
        )}
        
        {player.buyOuts.length > 0 && (
          <div className="flex items-center justify-between text-[1.1rem] text-muted-foreground">
            <span>Buy-outs:</span>
            <span className="font-medium text-rose-500 text-[1.1rem]">
              -${player.buyOuts.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
            </span>
          </div>
        )}

        {isSettling && (
          <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <label className="block text-[1.1rem] font-medium text-primary mb-1">
              Final Stack
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-primary/60 text-[1.1rem]">
                $
              </span>
              <Input
                type="number"
                placeholder="Enter final amount"
                value={finalStack}
                onChange={(e) => handleFinalStackChange(e.target.value)}
                className="pl-7 bg-white/50 border-primary/30 focus:border-primary focus:ring-primary"
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
                className="flex-1 bg-primary/5 hover:bg-red-50 border-primary/30 text-primary"
              >
                <PlusCircle className="mr-1 h-4 w-4 text-red-500" />
                Buy In
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Buy In for {player.name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <Input
                    type="number"
                    placeholder="Amount"
                    min="1"
                    step="0.01"
                    value={buyInAmount}
                    onChange={(e) => setBuyInAmount(e.target.value)}
                    className="col-span-3 border-primary/30 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline" className="border-primary/30 hover:bg-primary/5">
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleAddBuyIn} className="bg-red-500 hover:bg-red-600">
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
                className="flex-1 bg-primary/5 hover:bg-green-50 border-primary/30 text-primary"
              >
                <MinusCircle className="mr-1 h-4 w-4 text-green-500" />
                Buy Out
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cash Out for {player.name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <Input
                    type="number"
                    placeholder="Amount"
                    min="1"
                    max={calculateTotalBuyIn()}
                    step="0.01"
                    value={buyOutAmount}
                    onChange={(e) => setBuyOutAmount(e.target.value)}
                    className="col-span-3 border-primary/30 focus:border-primary focus:ring-primary"
                  />
                </div>
                <p className="text-sm text-primary/70">
                  Maximum cash out: ${calculateTotalBuyIn().toFixed(2)}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline" className="border-primary/30 hover:bg-primary/5">
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button 
                    onClick={handleBuyOut}
                    disabled={Number(buyOutAmount) > calculateTotalBuyIn()}
                    className="bg-green-500 hover:bg-green-600"
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