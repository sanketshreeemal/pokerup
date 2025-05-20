"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FloatingSidebarTrigger } from "@/components/FloatingSidebarTrigger";
import theme from "@/theme/theme";

export default function PerformancePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <FloatingSidebarTrigger />
      
      <h1 
        className="text-2xl font-bold mb-6"
        style={{ color: theme.colors.textPrimary }}
      >
        Performance Statistics
      </h1>
      
      <div 
        className="rounded-lg p-6 shadow-md"
        style={{ 
          backgroundColor: theme.colors.surface,
          boxShadow: theme.shadows.card
        }}
      >
        <p className="text-center text-gray-500 py-8">
          Your performance statistics will appear here once you&apos;ve played more games.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div 
            className="rounded-lg p-4 text-center"
            style={{ backgroundColor: theme.colors.background }}
          >
            <h3 className="text-lg font-medium mb-2">Games Played</h3>
            <p className="text-3xl font-bold" style={{ color: theme.colors.primary }}>0</p>
          </div>
          
          <div 
            className="rounded-lg p-4 text-center"
            style={{ backgroundColor: theme.colors.background }}
          >
            <h3 className="text-lg font-medium mb-2">Win Rate</h3>
            <p className="text-3xl font-bold" style={{ color: theme.colors.primary }}>0%</p>
          </div>
          
          <div 
            className="rounded-lg p-4 text-center"
            style={{ backgroundColor: theme.colors.background }}
          >
            <h3 className="text-lg font-medium mb-2">Net Profit</h3>
            <p className="text-3xl font-bold" style={{ color: theme.colors.primary }}>$0</p>
          </div>
        </div>
      </div>
    </div>
  );
}