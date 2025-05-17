import "./globals.css";
import { AuthProvider } from "../lib/contexts/AuthContext";
import type { Metadata } from "next";

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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
