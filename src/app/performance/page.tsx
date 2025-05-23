// use this page for performance analytics

"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAnalytics } from "@/lib/hooks/useAnalytics";
import { getUsernameByUID } from "@/lib/firebase/firebaseUtils";
import theme from "@/theme/theme";

// Import our beautiful analytics components
import { StatCard } from "@/app/performance/components/StatCard";
import { CumulativeWinningsChart } from "@/app/performance/components/CumulativeWinningsChart";
import { WinLossDistribution } from "@/app/performance/components/WinLossDistribution";
import { RecentPerformanceTable } from "@/app/performance/components/RecentPerformanceTable";
import { EmptyState } from "@/app/performance/components/EmptyState";

// Import icons for stat cards
import { 
  Clock, 
  Target, 
  DollarSign,
  Award,
  Activity,
  Timer
} from "lucide-react";

export default function PerformancePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [loadingUsername, setLoadingUsername] = useState(true);
  
  const { analyticsData, isLoading: analyticsLoading, error } = useAnalytics(username);

  // Fetch username
  useEffect(() => {
    async function fetchUsername() {
      if (!user?.uid) {
        console.log("Debug: No user UID found");
        setLoadingUsername(false);
        return;
      }
      
      try {
        console.log("Debug: Fetching username for UID:", user.uid);
        const userUsername = await getUsernameByUID(user.uid);
        console.log("Debug: Retrieved username:", userUsername);
        setUsername(userUsername);
      } catch (error) {
        console.error('Error fetching username:', error);
      } finally {
        setLoadingUsername(false);
      }
    }

    fetchUsername();
  }, [user?.uid]);

  // Debug analytics data
  useEffect(() => {
    console.log("Debug: Analytics data changed:", {
      username,
      analyticsData,
      isLoading: analyticsLoading,
      error
    });
  }, [username, analyticsData, analyticsLoading, error]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Loading state
  if (loading || loadingUsername || analyticsLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-600">Loading your analytics...</p>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null;
  }

  // Error state
  if (error) {
    return (
      <div className="h-full bg-slate-50">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Error Loading Analytics</h1>
            <p className="text-slate-600 text-center">{error}</p>
            <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
              <p><strong>Debug Info:</strong></p>
              <p>Username: {username}</p>
              <p>User UID: {user?.uid}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state for users with no games
  if (analyticsData && analyticsData.totalGames === 0) {
    return (
      <div className="h-full bg-slate-50">
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
          <p><strong>Debug Info:</strong></p>
          <p>Username: {username}</p>
          <p>User UID: {user?.uid}</p>
          <p>Analytics Data: {JSON.stringify(analyticsData, null, 2)}</p>
        </div>
        <EmptyState />
      </div>
    );
  }

  // Main dashboard
  if (!analyticsData) {
    return null;
  }

  // Get primary currency (assuming most games use the same currency)
  const primaryCurrency = "USD"; // Default fallback, could be enhanced to detect from user data

  return (
    <div className="h-full bg-slate-50">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: theme.colors.primary }}
          >
            Performance Analytics
          </h1>
        </div>

        {/* Key Statistics Grid - 2x2 Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <StatCard
            title="Total Winnings"
            value={analyticsData.totalWinnings}
            currency={primaryCurrency}
            icon={DollarSign}
            subtitle={`${analyticsData.completedGames} completed games`}
            className="col-span-1"
          />
          
          <StatCard
            title="Hours Played"
            value={`${analyticsData.totalHoursPlayed}h`}
            icon={Clock}
            subtitle={`${analyticsData.averageGameDuration}h avg per game`}
            className="col-span-1"
          />
          
          <StatCard
            title="Avg per Game"
            value={analyticsData.averageWinningsPerGame}
            currency={primaryCurrency}
            icon={Target}
            subtitle="Per completed game"
            className="col-span-1"
          />
          
          <StatCard
            title="Biggest Win"
            value={analyticsData.biggestWin}
            currency={primaryCurrency}
            icon={Award}
            subtitle="Best single game"
            className="col-span-1"
          />
        </div>

        {/* Charts Section */}
        <div className="space-y-8">
          
          {/* Main Cumulative Winnings Chart */}
          <CumulativeWinningsChart 
            data={analyticsData.cumulativeWinnings} 
            currency={primaryCurrency}
          />

          {/* Two-column layout for medium charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <WinLossDistribution 
              data={analyticsData.winLossDistribution}
            />
            
            {/* Performance Insights Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center mb-4">
                <Activity className="h-5 w-5 mr-2" style={{ color: theme.colors.primary }} />
                <h3 className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                  Performance Insights
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Biggest Loss:</span>
                  <span 
                    className="text-sm font-medium"
                    style={{ color: analyticsData.biggestLoss < 0 ? theme.colors.error : theme.colors.textPrimary }}
                  >
                    {primaryCurrency}{analyticsData.biggestLoss.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Pot Size:</span>
                  <span className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
                    {primaryCurrency}{analyticsData.totalPotSize.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Earnings per Hour:</span>
                  <span className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
                    {primaryCurrency}{analyticsData.totalHoursPlayed > 0 ? 
                      (analyticsData.totalWinnings / analyticsData.totalHoursPlayed).toFixed(2) : 
                      '0'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Win Rate:</span>
                  <span className="text-sm font-medium" style={{ color: theme.colors.success }}>
                    {analyticsData.winRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Performance Table */}
          <RecentPerformanceTable 
            data={analyticsData.recentPerformance} 
            currency={primaryCurrency}
          />

          {/* Time Analysis Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center mb-4">
              <Timer className="h-5 w-5 mr-2" style={{ color: theme.colors.accent }} />
              <h3 className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                Time Analysis
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                  {analyticsData.totalHoursPlayed}h
                </div>
                <div className="text-sm text-slate-600">Total Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                  {analyticsData.averageGameDuration}h
                </div>
                <div className="text-sm text-slate-600">Avg Game Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                  {analyticsData.totalHoursPlayed > 0 ? 
                    (analyticsData.totalWinnings / analyticsData.totalHoursPlayed).toFixed(2) : 
                    '0'
                  }
                </div>
                <div className="text-sm text-slate-600">Earnings per Hour ({primaryCurrency})</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}