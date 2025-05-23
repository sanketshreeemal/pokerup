import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { BarChart3, TrendingUp, Target, PlayCircle } from "lucide-react";
import theme from "@/theme/theme";

export function EmptyState() {
  const router = useRouter();

  const handleCreateGame = () => {
    router.push('/create-game');
  };

  const handleExploreGames = () => {
    router.push('/game-history');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <Card className="max-w-2xl w-full text-center">
        <CardContent className="p-12">
          {/* Icon illustration */}
          <div className="flex justify-center items-center space-x-4 mb-8">
            <div 
              className="p-4 rounded-full"
              style={{ backgroundColor: `${theme.colors.primary}15` }}
            >
              <BarChart3 
                className="h-8 w-8" 
                style={{ color: theme.colors.primary }}
              />
            </div>
            <div 
              className="p-4 rounded-full"
              style={{ backgroundColor: `${theme.colors.accent}15` }}
            >
              <TrendingUp 
                className="h-8 w-8" 
                style={{ color: theme.colors.accent }}
              />
            </div>
            <div 
              className="p-4 rounded-full"
              style={{ backgroundColor: `${theme.colors.secondary}15` }}
            >
              <Target 
                className="h-8 w-8" 
                style={{ color: theme.colors.secondary }}
              />
            </div>
          </div>

          {/* Title and description */}
          <h1 
            className="text-3xl font-bold mb-4"
            style={{ color: theme.colors.primary }}
          >
            Start Your Poker Journey
          </h1>
          
          <p className="text-lg text-slate-600 mb-6">
            Your performance analytics dashboard awaits! Once you start playing and complete games, 
            you&apos;ll see amazing insights here.
          </p>

          {/* Features preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4">
              <BarChart3 
                className="h-12 w-12 mx-auto mb-3"
                style={{ color: theme.colors.primary }}
              />
              <h3 className="font-semibold text-slate-800 mb-2">Cumulative Winnings</h3>
              <p className="text-sm text-slate-600">
                Track your net winnings over time across all your games
              </p>
            </div>
            
            <div className="p-4">
              <TrendingUp 
                className="h-12 w-12 mx-auto mb-3"
                style={{ color: theme.colors.accent }}
              />
              <h3 className="font-semibold text-slate-800 mb-2">Performance Trends</h3>
              <p className="text-sm text-slate-600">
                Analyze your monthly stats, win rates, and game patterns
              </p>
            </div>
            
            <div className="p-4">
              <Target 
                className="h-12 w-12 mx-auto mb-3"
                style={{ color: theme.colors.secondary }}
              />
              <h3 className="font-semibold text-slate-800 mb-2">Detailed Insights</h3>
              <p className="text-sm text-slate-600">
                ROI analysis, biggest wins/losses, and personalized statistics
              </p>
            </div>
          </div>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleCreateGame}
              className="flex items-center gap-2 px-6 py-3"
              style={{ 
                backgroundColor: theme.colors.primary,
                color: theme.colors.surface 
              }}
            >
              <PlayCircle className="h-5 w-5" />
              Create Your First Game
            </Button>
            
            <Button
              onClick={handleExploreGames}
              variant="outline"
              className="px-6 py-3"
              style={{ 
                borderColor: theme.colors.primary,
                color: theme.colors.primary 
              }}
            >
              Explore Game History
            </Button>
          </div>

          {/* Motivational note */}
          <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: theme.colors.background }}>
            <p className="text-sm text-slate-600">
              <strong style={{ color: theme.colors.primary }}>Pro Tip:</strong> 
              The more games you play and complete, the more detailed and valuable your analytics become. 
              Start tracking your poker journey today!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 