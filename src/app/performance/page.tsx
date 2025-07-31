// use this page for performance analytics

"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAnalytics } from "@/lib/hooks/useAnalytics";
import { getUsernameByUID, checkUserHasUsername, reserveUsername } from "@/lib/firebase/firebaseUtils";
import theme from "@/theme/theme";
import { UsernameDialog } from "@/components/UsernameDialog";

// Import our beautiful analytics components
import { StatCard } from "@/app/performance/components/StatCard";
import { CumulativeWinningsChart } from "@/app/performance/components/CumulativeWinningsChart";
import { WinLossDistribution } from "@/app/performance/components/WinLossDistribution";
import { RecentPerformanceTable } from "@/app/performance/components/RecentPerformanceTable";
import { EmptyState } from "@/app/performance/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import icons for stat cards
import { 
  Clock, 
  Target, 
  DollarSign,
  Award,
  Activity
} from "lucide-react";

export default function PerformancePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [loadingUsername, setLoadingUsername] = useState(true);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  
  const { analyticsData, isLoading: analyticsLoading, error } = useAnalytics(username);

  // Handle user setup and username fetching
  useEffect(() => {
    const handleUserSetup = async () => {
      if (user) {
        setLoadingUsername(true);
        const hasUsername = await checkUserHasUsername(user.uid);
        if (hasUsername) {
          try {
            const userUsername = await getUsernameByUID(user.uid);
            setUsername(userUsername);
          } catch (err) {
            console.error("Error fetching username after check:", err);
            // This might happen if the player doc exists but username field is missing
            setShowUsernameDialog(true);
          }
        } else {
          // This is a new user, prompt for username
          setShowUsernameDialog(true);
        }
        setLoadingUsername(false);
      }
    };

    if (!loading && user) {
      handleUserSetup();
    } else if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  const handleUsernameSubmit = async (newUsername: string) => {
    if (!user) return;
    try {
      await reserveUsername(user.uid, newUsername);
      setUsername(newUsername); // Optimistically update state to trigger analytics fetch
      // Allow success message to show before closing
      await new Promise(resolve => setTimeout(resolve, 3000));
      setShowUsernameDialog(false);
    } catch (error) {
      console.error("Error setting username:", error);
      throw error; // Re-throw to be handled by the dialog's error component
    }
  };

  // Debug analytics data
  useEffect(() => {
    console.log("Debug: Analytics data changed:", {
      username,
      analyticsData,
      isLoading: analyticsLoading,
      error
    });
  }, [username, analyticsData, analyticsLoading, error]);
  
  // Loading state
  if (loading || loadingUsername) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-600">Loading your analytics...</p>
      </div>
    );
  }

  // Redirect if not authenticated (should be handled by useEffect, but as a safeguard)
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
        <EmptyState />
      </div>
    );
  }

  // Main dashboard
  if (!analyticsData) {
    // Don't render the empty state if the username dialog is open,
    // as analytics data is expected to be missing.
    if (showUsernameDialog) {
      return (
         <UsernameDialog
          isOpen={showUsernameDialog}
          onClose={() => setShowUsernameDialog(false)}
          onSubmit={handleUsernameSubmit}
        />
      )
    }
    return null;
  }

  // Get primary currency (assuming most games use the same currency)
  const primaryCurrency = "USD"; // Default fallback, could be enhanced to detect from user data

  return (
    <>
      <UsernameDialog
        isOpen={showUsernameDialog}
        onClose={() => setShowUsernameDialog(false)}
        onSubmit={handleUsernameSubmit}
      />
      <div className="h-full bg-slate-50">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          
        {/* Header */}
        <div className="mb-4">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: theme.colors.primary }}
          >
            Performance
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
            title="Biggest Games"
            value={0} // Not used when dualValue is provided
            currency={primaryCurrency}
            icon={Award}
            subtitle="Best / Worst Game"
            className="col-span-1"
            dualValue={{
              leftValue: analyticsData.biggestWin,
              rightValue: analyticsData.biggestLoss
            }}
          />
        </div>

        {/* Charts Section */}
        <div className="space-y-8">
          
          {/* Main Cumulative Winnings Chart */}
          <CumulativeWinningsChart 
            data={analyticsData.cumulativeWinnings} 
            currency={primaryCurrency}
            totalPotSize={analyticsData.totalPotSize}
          />

          {/* Recent Performance Table */}
          <RecentPerformanceTable 
            data={analyticsData.recentPerformance} 
            currency={primaryCurrency}
          />

          {/* Win/Loss Distribution Chart */}
          <WinLossDistribution 
            data={analyticsData.winLossDistribution}
          />
        </div>
      </div>
    </div>
    </>
  );
}