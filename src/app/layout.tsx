import "./globals.css";
import { AuthProvider } from "../lib/contexts/AuthContext";
import type { Metadata } from "next";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "PokerUp - Play Poker. We'll do the rest.",
  description: "The all-in-one poker tracker built for game-night legends. Host seamless private poker games with real-time tracking, AI-powered settlement, and comprehensive analytics.",
  keywords: ["poker", "poker tracker", "private poker games", "poker analytics", "AI settlement", "game night", "poker companion", "poker automation", "poker settlement", "poker bookkeeping"],
  authors: [{ name: "PokerUp Team" }],
  creator: "PokerUp",
  publisher: "PokerUp",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.pokerup.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "PokerUp - Play Poker. We'll do the rest.",
    description: "PokerUp automates your games, from in-game tracking to AI settlements and performance. Focus on playing, not bookkeeping.",
    url: 'https://www.pokerup.app',
    siteName: 'PokerUp',
    images: [
      {
        url: '/og-image.png', // You'll need to add this image
        width: 1200,
        height: 630,
        alt: 'PokerUp - Play Poker. We\'ll do the rest.',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "PokerUp - Play Poker. We'll do the rest.",
    description: "PokerUp automates your games, from in-game tracking to AI settlements and performance. Focus on playing, not bookkeeping.",
    images: ['/og-image.png'], // Same image as OpenGraph
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when you have them
    // google: 'your-google-verification-code',
    // bing: 'your-bing-verification-code',
  },
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
