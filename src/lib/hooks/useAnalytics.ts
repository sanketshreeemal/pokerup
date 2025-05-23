import { useState, useEffect } from 'react';
import { fetchUserGames, transformGameDataForCard } from '../firebase/firebaseUtils';
import type { GameCardData } from '../../types';

export interface AnalyticsData {
  totalGames: number;
  completedGames: number;
  activeGames: number;
  totalWinnings: number;
  totalHoursPlayed: number;
  winRate: number;
  averageWinningsPerGame: number;
  averageGameDuration: number;
  biggestWin: number;
  biggestLoss: number;
  averageROI: number;
  totalPotSize: number;
  gamesThisMonth: number;
  winningsThisMonth: number;
  cumulativeWinnings: Array<{
    gameIndex: number;
    gameName: string;
    date: string;
    winnings: number;
    cumulativeWinnings: number;
  }>;
  recentPerformance: Array<{
    gameName: string;
    date: string;
    winnings: number;
    roi: number;
    duration: string;
  }>;
  monthlyStats: Array<{
    month: string;
    games: number;
    winnings: number;
    hours: number;
  }>;
  winLossDistribution: {
    wins: number;
    losses: number;
    breakeven: number;
  };
}

export function useAnalytics(username: string | null) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!username) {
        console.log("Debug: No username provided to useAnalytics");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Debug: Starting analytics fetch for username:", username);
        setIsLoading(true);
        setError(null);

        const userGames = await fetchUserGames(username);
        console.log("Debug: fetchUserGames returned:", userGames);
        console.log("Debug: Number of games found:", userGames.length);
        
        if (userGames.length === 0) {
          console.log("Debug: No games found, setting empty analytics data");
          setAnalyticsData({
            totalGames: 0,
            completedGames: 0,
            activeGames: 0,
            totalWinnings: 0,
            totalHoursPlayed: 0,
            winRate: 0,
            averageWinningsPerGame: 0,
            averageGameDuration: 0,
            biggestWin: 0,
            biggestLoss: 0,
            averageROI: 0,
            totalPotSize: 0,
            gamesThisMonth: 0,
            winningsThisMonth: 0,
            cumulativeWinnings: [],
            recentPerformance: [],
            monthlyStats: [],
            winLossDistribution: { wins: 0, losses: 0, breakeven: 0 }
          });
          setIsLoading(false);
          return;
        }

        // Transform games to GameCardData format
        console.log("Debug: Transforming games to GameCardData format");
        const games: GameCardData[] = userGames.map(game => 
          transformGameDataForCard(game.data, game.id, username)
        );
        console.log("Debug: Transformed games:", games);

        // Sort games by date (oldest first for cumulative calculations)
        const sortedGames = games.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const completedGames = games.filter(game => game.status === 'complete');
        const activeGames = games.filter(game => game.status === 'active');

        console.log("Debug: Game counts - Total:", games.length, "Completed:", completedGames.length, "Active:", activeGames.length);

        // Calculate cumulative winnings
        let runningTotal = 0;
        const cumulativeWinnings = sortedGames
          .filter(game => game.status === 'complete')
          .map((game, index) => {
            runningTotal += game.currentUserWinnings;
            return {
              gameIndex: index + 1,
              gameName: game.name,
              date: game.date,
              winnings: game.currentUserWinnings,
              cumulativeWinnings: runningTotal
            };
          });

        // Calculate basic stats
        const totalWinnings = completedGames.reduce((sum, game) => sum + game.currentUserWinnings, 0);
        const totalHoursPlayed = games.reduce((sum, game) => sum + game.durationHours + (game.durationMinutes / 60), 0);
        const totalPotSize = games.reduce((sum, game) => sum + game.potSize, 0);

        // Win rate calculation
        const wins = completedGames.filter(game => game.currentUserWinnings > 0).length;
        const losses = completedGames.filter(game => game.currentUserWinnings < 0).length;
        const breakeven = completedGames.filter(game => game.currentUserWinnings === 0).length;
        const winRate = completedGames.length > 0 ? (wins / completedGames.length) * 100 : 0;

        // Average calculations
        const averageWinningsPerGame = completedGames.length > 0 ? totalWinnings / completedGames.length : 0;
        const averageGameDuration = games.length > 0 ? totalHoursPlayed / games.length : 0;
        const averageROI = completedGames.length > 0 ? 
          completedGames.reduce((sum, game) => sum + game.roi, 0) / completedGames.length : 0;

        // Biggest win/loss
        const winnings = completedGames.map(game => game.currentUserWinnings);
        const biggestWin = winnings.length > 0 ? Math.max(...winnings) : 0;
        const biggestLoss = winnings.length > 0 ? Math.min(...winnings) : 0;

        // This month stats
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthGames = games.filter(game => {
          const gameDate = new Date(game.date);
          return gameDate.getMonth() === currentMonth && gameDate.getFullYear() === currentYear;
        });
        const gamesThisMonth = thisMonthGames.length;
        const winningsThisMonth = thisMonthGames
          .filter(game => game.status === 'complete')
          .reduce((sum, game) => sum + game.currentUserWinnings, 0);

        // Recent performance (last 5 completed games)
        const recentPerformance = completedGames
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
          .map(game => ({
            gameName: game.name,
            date: game.date,
            winnings: game.currentUserWinnings,
            roi: game.roi,
            duration: `${game.durationHours}h ${game.durationMinutes}m`
          }));

        // Monthly stats (last 6 months)
        const monthlyStats = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          
          const monthGames = games.filter(game => {
            const gameDate = new Date(game.date);
            return gameDate.getMonth() === date.getMonth() && gameDate.getFullYear() === date.getFullYear();
          });
          
          const monthWinnings = monthGames
            .filter(game => game.status === 'complete')
            .reduce((sum, game) => sum + game.currentUserWinnings, 0);
          
          const monthHours = monthGames.reduce((sum, game) => sum + game.durationHours + (game.durationMinutes / 60), 0);
          
          monthlyStats.push({
            month,
            games: monthGames.length,
            winnings: monthWinnings,
            hours: Math.round(monthHours * 10) / 10
          });
        }

        const finalAnalyticsData = {
          totalGames: games.length,
          completedGames: completedGames.length,
          activeGames: activeGames.length,
          totalWinnings,
          totalHoursPlayed: Math.round(totalHoursPlayed * 10) / 10,
          winRate: Math.round(winRate * 10) / 10,
          averageWinningsPerGame: Math.round(averageWinningsPerGame * 100) / 100,
          averageGameDuration: Math.round(averageGameDuration * 10) / 10,
          biggestWin,
          biggestLoss,
          averageROI: Math.round(averageROI * 10) / 10,
          totalPotSize,
          gamesThisMonth,
          winningsThisMonth,
          cumulativeWinnings,
          recentPerformance,
          monthlyStats,
          winLossDistribution: { wins, losses, breakeven }
        };

        console.log("Debug: Final analytics data:", finalAnalyticsData);
        setAnalyticsData(finalAnalyticsData);

      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, [username]);

  return { analyticsData, isLoading, error };
} 