"use client"

import { SidebarTrigger } from "@/components/ui/sidebar";
import theme from "@/theme/theme";

export function FloatingSidebarTrigger() {
  return (
    <div className="fixed top-4 left-4 z-50 md:hidden">
      <div className="rounded-full p-1" style={{ 
        backgroundColor: theme.colors.background,
        boxShadow: theme.shadows.sm
      }}>
        <SidebarTrigger className="h-8 w-8" />
      </div>
    </div>
  );
} 