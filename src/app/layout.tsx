import "./globals.css";
import { AuthProvider } from "../lib/contexts/AuthContext";
import type { Metadata } from "next";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FloatingSidebarTrigger } from "@/components/FloatingSidebarTrigger";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "PokerUp",
  description: "Your ultimate poker companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <main className="flex-1 flex flex-col items-center w-full">
                <FloatingSidebarTrigger />
                <div className="w-full max-w-7xl">
                  {children}
                </div>
              </main>
            </div>
            <Toaster />
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
