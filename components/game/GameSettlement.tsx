"use client";

import { useState } from "react";
import { Game, Settlement } from "@/types/game";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, DollarSign, RotateCw, Clock } from "lucide-react";

interface GameSettlementProps {
  game: Game;
  onCompleteSettlement: (settlement: Settlement) => void;
  onCancel: () => void;
}

export function GameSettlement({ game, onCompleteSettlement, onCancel }: GameSettlementProps) {
  const [instructions, setInstructions] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [settlement, setSettlement] = useState<Settlement | null>(null);
  
  // This simulates the AI calculation, would be replaced with actual GPT-4o API call
  const calculateSettlement = () => {
    setIsCalculating(true);
    
    // Simulate API delay
    setTimeout(() => {
      // This is fake data for now - in reality we'd call the GPT API
      const fakeTransfers = [];
      
      // Create some sample transfers (this would be computed by the AI)
      // This is just a placeholder to demonstrate the UI
      const players = [...game.players];
      
      // If there are at least 2 players, create sample settlements
      if (players.length >= 2) {
        fakeTransfers.push({
          from: players[0].id,
          to: players[1].id,
          amount: 25,
        });
        
        if (players.length >= 3) {
          fakeTransfers.push({
            from: players[0].id,
            to: players[2].id,
            amount: 15,
          });
        }
      }
      
      const calculatedSettlement: Settlement = {
        instructions,
        transfers: fakeTransfers,
        timestamp: Date.now(),
      };
      
      setSettlement(calculatedSettlement);
      setIsCalculating(false);
    }, 2000);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settlement) {
      calculateSettlement();
    } else {
      onCompleteSettlement(settlement);
    }
  };
  
  const findPlayerName = (playerId: string): string => {
    const player = game.players.find(p => p.id === playerId);
    return player ? player.name : "Unknown Player";
  };
  
  const formatTime = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
    }).format(new Date(timestamp));
  };

  return (
    <Card className="w-full border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/5">
        <CardTitle className="text-xl text-primary">Settle Up: {game.name}</CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-6">
          {!settlement ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instructions" className="text-primary">
                  Special Settlement Instructions (Optional)
                </Label>
                <Textarea
                  id="instructions"
                  placeholder="e.g., 'Player A owes Player B $20 from last week' or 'Player C should only pay half'"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="min-h-32 border-primary/30 focus:border-primary focus:ring-primary"
                />
                <p className="text-sm text-primary/70">
                  Add any special cases or previous debts that should be considered when calculating who pays whom.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary">Settlement Results</h3>
                <div className="flex items-center gap-2 text-sm text-primary/70">
                  <Clock className="h-4 w-4" />
                  <span>Calculated at {formatTime(settlement.timestamp)}</span>
                </div>
              </div>
              
              {settlement.transfers.length > 0 ? (
                <div className="space-y-4">
                  {settlement.transfers.map((transfer, index) => (
                    <Card key={index} className="overflow-hidden border-primary/20">
                      <CardContent className="p-4 gap-4 grid grid-cols-[1fr,auto,1fr]">
                        <div className="text-right font-medium text-primary">
                          {findPlayerName(transfer.from)}
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <ArrowRight className="h-5 w-5 text-primary" />
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                            <DollarSign className="h-3 w-3 mr-0.5" />
                            {transfer.amount.toFixed(2)}
                          </Badge>
                        </div>
                        <div className="font-medium text-primary">
                          {findPlayerName(transfer.to)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4 text-center text-primary">
                    Everyone is settled up! No payments needed.
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t border-primary/20 p-4 bg-primary/5">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-primary/30 hover:bg-primary/5 text-primary"
          >
            {settlement ? "Back to Game" : "Cancel"}
          </Button>
          <Button 
            type="submit" 
            disabled={isCalculating}
          >
            {isCalculating ? (
              <>
                <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                Calculating...
              </>
            ) : !settlement ? (
              "Calculate Settlement"
            ) : (
              "Finalize Game"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 