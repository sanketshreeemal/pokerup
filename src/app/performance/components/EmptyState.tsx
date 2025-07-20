import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LineChart, TrendingUp, Target, PlayCircle } from "lucide-react";
import theme from "@/theme/theme";

export function EmptyState() {
  const router = useRouter();

  const handleCreateGame = () => {
    router.push('/game/lobby');
  };

  return (
    <div className="h-full flex flex-col items-center justify-start pt-0 p-4">
      <Card className="max-w-2xl w-full text-center border-none shadow-none">
        <CardContent className="p-4">
          {/* Title and description */}
          <h1 
            className="text-2xl font-bold mb-4"
            style={{ color: theme.colors.primary }}
          >
            Start Your Poker Journey
          </h1>
          
          <p className="text-lg text-slate-600 mb-3">
            Your performance summary awaits! Once you start playing, 
            you&apos;ll see insights here.
          </p>

          {/* Features preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <div className="p-2">
              <LineChart 
                className="h-12 w-12 mx-auto mb-2"
                style={{ color: theme.colors.primary }}
              />
              <h3 className="font-bold text-slate-800 mb-1">Cumulative Winnings</h3>
              <p className="text-base text-slate-600">
                Track your net winnings over time across all your games
              </p>
            </div>
            
            <div className="p-2">
              <TrendingUp 
                className="h-12 w-12 mx-auto mb-2"
                style={{ color: theme.colors.accent }}
              />
              <h3 className="font-bold text-slate-800 mb-1">Performance Trends</h3>
              <p className="text-base text-slate-600">
                Analyze your monthly stats, win rates, and game patterns
              </p>
            </div>
            
            <div className="p-2">
              <Target 
                className="h-12 w-12 mx-auto mb-2"
                style={{ color: theme.colors.secondary }}
              />
              <h3 className="font-bold text-slate-800 mb-1">Detailed Insights</h3>
              <p className="text-base text-slate-600">
                ROI analysis, biggest wins/losses, and personalized statistics
              </p>
            </div>
          </div>

          {/* Call to action buttons */}
          <div className="flex justify-center">
            <Button
              onClick={handleCreateGame}
              className="flex items-center gap-2 px-6 py-3"
              style={{ 
                backgroundColor: theme.colors.primary,
                color: theme.colors.surface 
              }}
            >
              <PlayCircle className="h-5 w-5" />
              Host Your First Game
            </Button>
          </div>

          {/* Motivational note */}
          <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: theme.colors.background }}>
            <p className="text-sm text-slate-600">
              <strong style={{ color: theme.colors.primary }}>Pro Tip:</strong> 
              The more games you play with friends, the more detailed and valuable your analytics become. 
              Start tracking your performance today!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 