"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowLeft } from "lucide-react";
import theme from "@/theme/theme";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { completeGameWithTimer, updateFinalStacks } from "@/lib/firebase/firebaseUtils";

interface PlayerSummary {
  username: string;
  outOfPocket: number;
  finalStack: number;
  netPosition: number;
}

function PlayerSummaryCard({ player }: { player: PlayerSummary }) {
  return (
    <Card 
      className="w-full overflow-hidden transition-all hover:shadow-md mb-4"
      style={{ borderColor: theme.colors.primary + "33" }}
    >
      <CardHeader 
        className="pb-2 pt-3 px-4"
        style={{ 
          background: `linear-gradient(to right, ${theme.colors.primary}33, ${theme.colors.primary}0D)`
        }}
      >
        <CardTitle className="flex items-center justify-between">
          <span style={{ color: theme.colors.primary }} className="font-semibold text-lg">
            {player.username}
          </span>
          <span 
            className={`font-mono text-lg font-semibold ${
              player.netPosition >= 0 ? "text-success" : "text-error"
            }`}
          >
            {player.netPosition >= 0 ? "+" : ""}{player.netPosition.toFixed(2)}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-2 pb-3 grid grid-cols-2 gap-2">
        <div>
          <span style={{ color: theme.colors.textSecondary }} className="text-sm">
            Out of Pocket
          </span>
          <p style={{ color: theme.colors.primary }} className="font-mono text-base font-medium">
            ${player.outOfPocket.toFixed(2)}
          </p>
        </div>
        <div>
          <span style={{ color: theme.colors.textSecondary }} className="text-sm">
            Final Stack
          </span>
          <p style={{ color: theme.colors.primary }} className="font-mono text-base font-medium">
            ${player.finalStack.toFixed(2)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettlePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { doc: game, loading, subscribe } = useGameStore();
  const [settling, setSettling] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  useEffect(() => {
    const unsubscribe = subscribe(params.id);
    return () => unsubscribe();
  }, [params.id, subscribe]);

  const handleBackToGame = () => {
    router.push(`/game/${params.id}`);
  };
  
  const handleAiSettleUp = async () => {
    if (!game) return;
    
    try {
      setSettling(true);
      
      // Extract hours and minutes from the timer
      let hours = 0;
      let minutes = 0;
      
      // Try to find any player timer data in localStorage
      const timerData = localStorage.getItem(`game_${params.id}_timer`);
      if (timerData) {
        const { hours: storedHours, minutes: storedMinutes } = JSON.parse(timerData);
        hours = parseInt(storedHours, 10);
        minutes = parseInt(storedMinutes, 10);
      }
      
      // Get final stacks
      const finalStacks: Record<string, number> = {};
      game.playerUsernames.forEach(username => {
        const player = game.players[username];
        finalStacks[username] = player.finalStack || 0;
      });
      
      // Update final stacks and mark the game as complete
      await updateFinalStacks(params.id, finalStacks);
      await completeGameWithTimer(params.id, hours, minutes);
      
      setIsCompleted(true);
      setConfirmationMessage("Game completed! Redirecting to settle up...");
      
      // Navigate to end-game page after a brief delay
      setTimeout(() => {
        router.push(`/game/${params.id}/end-game`);
      }, 1500);
    } catch (error) {
      console.error('Error completing game:', error);
      setSettling(false);
      setConfirmationMessage("Failed to complete game. Please try again.");
    }
  };

  if (loading || !game) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const playerSummaries: PlayerSummary[] = game.playerUsernames.map(username => {
    const player = game.players[username];
    const outOfPocket = player.buyInInitial + player.addBuyIns - player.cashOuts;
    const finalStack = player.finalStack || 0;
    const netPosition = finalStack - outOfPocket;

    return {
      username,
      outOfPocket,
      finalStack,
      netPosition
    };
  });

  return (
    <div className="flex flex-col min-h-[calc(100vh-2rem)] p-6 gap-4">
      <Card 
        className="w-full flex-grow-0"
        style={{ borderColor: theme.colors.primary + "33" }}
      >
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle 
            className="text-xl font-bold"
            style={{ color: theme.colors.primary }}
          >
            Game Summary
          </CardTitle>
          <Button
            variant="outline"
            className="flex items-center"
            style={{ 
              borderColor: theme.colors.primary + "4D",
              color: theme.colors.primary
            }}
            onClick={handleBackToGame}
            disabled={isCompleted}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Game
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(65vh-6rem)] pr-4">
            {playerSummaries.map((player) => (
              <PlayerSummaryCard key={player.username} player={player} />
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card 
        className="w-full flex flex-col"
        style={{ borderColor: theme.colors.primary + "33" }}
      >
        <CardHeader className="pb-2">
          <CardTitle 
            className="text-xl font-bold"
            style={{ color: theme.colors.primary }}
          >
            Settlement Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 h-[calc(25vh-4rem)]">
          <Textarea 
            placeholder="Any specific instructions for the AI?"
            className="flex-grow"
          />
          <Button 
            className="w-full"
            style={{ backgroundColor: theme.colors.primary }}
            onClick={handleAiSettleUp}
            disabled={settling || isCompleted}
          >
            {settling ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                Completing Game...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {isCompleted ? "Game Completed" : "Settle With AI"}
              </>
            )}
          </Button>
          {!isCompleted && (
            <p className="text-xs text-center" style={{ color: theme.colors.textSecondary }}>
              Click to finish the game
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
