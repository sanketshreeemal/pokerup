import "./globals.css";
import { AuthProvider } from "../lib/contexts/AuthContext";
import type { Metadata } from "next";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
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
          <AuthenticatedLayout>
            {children}
          </AuthenticatedLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
