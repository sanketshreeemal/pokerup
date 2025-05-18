"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import theme from "@/theme/theme";

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

  useEffect(() => {
    const unsubscribe = subscribe(params.id);
    return () => unsubscribe();
  }, [params.id, subscribe]);

  const handleAiSettleUp = () => {
    router.push(`/game/${params.id}/end-game`);
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
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6 gap-4">
      <Card 
        className="w-full flex-grow-0"
        style={{ borderColor: theme.colors.primary + "33" }}
      >
        <CardHeader className="pb-2">
          <CardTitle 
            className="text-2xl font-bold"
            style={{ color: theme.colors.primary }}
          >
            Game Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(65vh-8rem)] pr-4">
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
            className="text-2xl font-bold"
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
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Use AI to Settle Up
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
