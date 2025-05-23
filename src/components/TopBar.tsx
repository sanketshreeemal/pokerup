"use client"

import { SidebarTrigger } from "@/components/ui/sidebar";
import theme from "@/theme/theme";

export function TopBar() {
  return (
    <div 
      className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{ borderColor: theme.colors.primary + "20" }}
    >
      <div className="flex h-12 items-center justify-between px-4">
        {/* Left side - Sidebar trigger */}
        <div className="flex items-center">
          <SidebarTrigger className="h-8 w-8" />
        </div>
        
        {/* Center - App name */}
        <div className="flex-1 flex justify-center">
          <h1 
            className="text-lg font-bold tracking-tight"
            style={{ color: theme.colors.primary }}
          >
            PokerUp
          </h1>
        </div>
        
        {/* Right side - Empty for now, can add user actions later */}
        <div className="w-8"></div>
      </div>
    </div>
  );
} 