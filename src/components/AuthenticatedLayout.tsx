"use client"

import { useAuth } from "@/lib/hooks/useAuth";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TopBar } from "@/components/TopBar";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user, loading } = useAuth();

  // Don't render sidebar/topbar during loading or if user is not authenticated
  if (loading || !user) {
    return <>{children}</>;
  }

  // Render with sidebar and top bar for authenticated users
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col w-full">
          <TopBar />
          <div className="flex-1 flex flex-col items-center w-full min-h-0" style={{ height: "calc(100vh - 3rem)" }}>
            <div className="w-full max-w-7xl h-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
} 