"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import theme from "@/theme/theme";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

const MAX_RETRIES = 10; // Maximum number of retries to fetch settlement
const RETRY_DELAY = 2000; // Delay between retries in milliseconds

export default function EndGamePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [settlement, setSettlement] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchSettlement = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const gameRef = doc(db, "games", params.id);
      console.log("Fetching settlement data for gameId:", params.id);
      const gameDoc = await getDoc(gameRef);
      
      if (gameDoc.exists()) {
        const gameData = gameDoc.data();
        console.log("Game document data:", gameData);
        if (gameData.settlement) {
          console.log("Settlement found:", gameData.settlement);
          setSettlement(gameData.settlement);
          setLoading(false);
        } else {
          console.error("No settlement field in game document");
          if (retryCount < MAX_RETRIES) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, RETRY_DELAY);
          } else {
            setError("Settlement not found after multiple attempts");
            setLoading(false);
          }
        }
      } else {
        console.error("Game document not found");
        setError("Game not found.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching settlement:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load settlement data.";
      setError(errorMessage);
      setLoading(false);
    }
  }, [params.id, retryCount]);

  useEffect(() => {
    if (params.id) {
      fetchSettlement();
    }
  }, [params.id, retryCount, fetchSettlement]);

  const handleHomeClick = () => {
    router.push('/game/lobby');
  };

  const handleRetryClick = () => {
    setRetryCount(prev => prev + 1);
  };
  
  const handleBackToGameClick = () => {
    router.push(`/game/${params.id}`);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6">
      <Card 
        className="flex-grow mb-4"
        style={{ borderColor: theme.colors.primary + "33" }}
      >
        <CardHeader className="pb-4">
          <CardTitle 
            className="text-2xl font-bold"
            style={{ color: theme.colors.primary }}
          >
            Suggested Settlement
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col gap-4">
              <div 
                className="rounded-lg p-4 bg-rose-50 text-rose-700 border border-rose-200"
              >
                {error}
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleRetryClick} 
                  variant="outline"
                  className="flex-1"
                  style={{ borderColor: theme.colors.primary + "4D", color: theme.colors.primary }}
                >
                  Retry
                </Button>
                <Button 
                  onClick={handleBackToGameClick}
                  variant="outline"
                  className="flex-1"
                  style={{ borderColor: theme.colors.primary + "4D", color: theme.colors.primary }}
                >
                  Back to Game
                </Button>
              </div>
            </div>
          ) : settlement ? (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono">
              {settlement.split('\n').map((line, index) => {
                // Find arrow symbol and amount for styling
                const parts = line.match(/(.*?)(->)(.*?)(\$\d+(\.\d+)?)/);
                
                if (parts) {
                  const [_, from, arrow, to, amount] = parts;
                  return (
                    <div key={index} className="flex items-center mb-3 last:mb-0">
                      <div 
                        className="flex-grow font-medium"
                        style={{ color: theme.colors.primary }}
                      >
                        {from.trim()}
                      </div>
                      <div className="mx-2 text-slate-500">→</div>
                      <div 
                        className="flex-grow font-medium"
                        style={{ color: theme.colors.primary }}
                      >
                        {to.trim()}
                      </div>
                      <div 
                        className="ml-4 font-semibold"
                        style={{ color: theme.colors.success }}
                      >
                        {amount}
                      </div>
                    </div>
                  );
                }
                
                return <p key={index} className="mb-3 last:mb-0">{line}</p>;
              })}
            </div>
          ) : (
            <p className="text-slate-500 italic text-center">No settlement data available.</p>
          )}
        </CardContent>
      </Card>

      <Button 
        onClick={handleHomeClick}
        className="w-full"
        style={{ backgroundColor: theme.colors.primary }}
      >
        <Home className="w-4 h-4 mr-2" />
        Back to Home
      </Button>
    </div>
  );
}
