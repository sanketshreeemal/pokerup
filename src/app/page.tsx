"use client";

import { useEffect, useCallback } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import SignInWithGoogle from "@/components/SignInWithGoogle";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

import asset1 from '@/components/assets/asset-1.png';
import asset2 from '@/components/assets/asset-2.png';
import asset3 from '@/components/assets/asset-3.png';

// Icon Components for App Features
function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0l1.09 3.5L17 2.09l-1.41 3.91L20 7.5l-4.41 1.41L17 13.41l-3.5-1.09L12 16l-1.5-3.68L7 13.41l1.41-4.5L4 7.5l4.41-1.5L7 2.09l3.91 1.41L12 0z"/>
      <path d="M19 8l0.5 2L22 9.5l-2.5 0.5L19 12l-0.5-2L16 9.5l2.5-0.5L19 8z"/>
      <path d="M19 16l0.5 2L22 17.5l-2.5 0.5L19 20l-0.5-2L16 17.5l2.5-0.5L19 16z"/>
    </svg>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
    </svg>
  );
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12,6 12,12 16,14"/>
    </svg>
  );
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/performance');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-background text-textPrimary">
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <header className="px-4 lg:px-6 h-16 flex items-center justify-center bg-white shadow-sm sticky top-0 z-50 border-b">
            <span className="font-bold text-xl text-primary">PokerUp</span>
          </header>

          <main className="flex-1">
            {/* Hero Section */}
            <section className="w-full py-8 md:py-16 lg:py-20 bg-gradient-to-br from-green-50 to-white">
              <div className="container px-4 md:px-6 space-y-12">
                <div className="grid gap-12 lg:grid-cols-1 lg:gap-16 items-center">
                  <div className="flex flex-col justify-center items-center text-center space-y-8">
                    <div className="space-y-6">
                      <h1 className="text-5xl font-bold tracking-tight sm:text-6xl text-primary leading-tight">
                        Play Poker. <br /> We'll do the rest.
                      </h1>
                      <p className="max-w-[600px] text-textSecondary text-base sm:text-lg leading-relaxed">
                        PokerUp automates your games, from in-game tracking to AI settlements and performance. 
                        <br /> Focus on playing, not bookkeeping.
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <SignInWithGoogle />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How to Play Section */}
            <section id="gameplay" className="w-full py-8 md:py-12 lg:py-16 bg-gradient-to-r from-white to-gray-50">
              <div className="container mx-auto px-4 md:px-6 space-y-8">
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                  <div className="space-y-2">
                    <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-lg font-medium text-primary">How to Play</div>
                  </div>
                </div>
                <div className="py-2 relative">
                  {/* Gradient overlays for scroll indication */}
                  <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none md:hidden"></div>
                  <div className="absolute right-0 top-0 w-8 h-full bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none md:hidden"></div>
                  
                  <Carousel 
                    opts={{
                      align: "start",
                      loop: false,
                      skipSnaps: false,
                      dragFree: true,
                    }}
                    plugins={[
                      Autoplay({
                        delay: 4000,
                        stopOnInteraction: true,
                        stopOnMouseEnter: true,
                      }),
                    ]}
                    className="w-full max-w-5xl mx-auto"
                  >
                    <CarouselContent className="-ml-2 md:-ml-4">
                      <CarouselItem className="pl-2 md:pl-4 basis-4/5 md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                          <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 active:scale-105">
                            <CardHeader className="p-0">
                              <Image src={asset1} alt="Set the Stage" className="rounded-t-lg aspect-video object-cover"/>
                            </CardHeader>
                            <CardContent className="p-6 space-y-3">
                              <CardTitle className="text-xl sm:text-2xl text-gray-900">Step 1: Set the Stage</CardTitle>
                              <p className="text-textSecondary text-base leading-relaxed">Log in, set your username, add your friends, and start the game.</p>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                      <CarouselItem className="pl-2 md:pl-4 basis-4/5 md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                          <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 active:scale-105">
                            <CardHeader className="p-0">
                              <Image src={asset2} alt="Track the stakes" className="rounded-t-lg aspect-video object-cover"/>
                            </CardHeader>
                            <CardContent className="p-6 space-y-3">
                              <CardTitle className="text-xl sm:text-2xl text-gray-900">Step 2: Track the stakes</CardTitle>
                              <p className="text-textSecondary text-base leading-relaxed">Effortlessly track buy-ins, re-buys, and player stacks.</p>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                      <CarouselItem className="pl-2 md:pl-4 basis-4/5 md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                          <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 active:scale-105">
                            <CardHeader className="p-0">
                              <Image src={asset3} alt="Use AI to Settle Up" className="rounded-t-lg aspect-video object-cover"/>
                            </CardHeader>
                            <CardContent className="p-6 space-y-3">
                              <CardTitle className="text-xl sm:text-2xl text-gray-900">Step 3: Use AI to Settle Up</CardTitle>
                              <p className="text-textSecondary text-base leading-relaxed">Let us do the math for you, with our suggested payouts.</p>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex" />
                    <CarouselNext className="hidden md:flex" />
                  </Carousel>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section id="features" className="w-full py-8 md:py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-white">
              <div className="container mx-auto px-4 md:px-6 space-y-8">
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                  <div className="space-y-2">
                    <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-lg font-medium text-primary">App Features</div>
                  </div>
                </div>
                <div className="py-2 relative">
                  {/* Gradient overlays for scroll indication */}
                  <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none md:hidden"></div>
                  <div className="absolute right-0 top-0 w-8 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none md:hidden"></div>
                  
                   <Carousel
                    opts={{
                      align: "start",
                      loop: true,
                      skipSnaps: false,
                      dragFree: true,
                    }}
                    plugins={[
                      Autoplay({
                        delay: 3500,
                        stopOnInteraction: true,
                        stopOnMouseEnter: true,
                      }),
                    ]}
                    className="w-full max-w-6xl mx-auto"
                  >
                    <CarouselContent className="-ml-2 md:-ml-4">
                      <CarouselItem className="pl-2 md:pl-4 basis-4/5 md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                          <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-green-50 active:scale-105">
                            <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                              <ActivityIcon className="w-12 h-12 text-primary" />
                              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Real-Time Game Tracking</h3>
                              <p className="text-textSecondary text-base leading-relaxed">Track buy-ins and re-buys, live. No manual tallying.</p>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                       <CarouselItem className="pl-2 md:pl-4 basis-4/5 md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                          <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-green-50 active:scale-105">
                            <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                              <SparklesIcon className="w-12 h-12 text-primary" />
                              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">AI driven Settlement Engine</h3>
                              <p className="text-textSecondary text-base leading-relaxed">Get the simplest way to settle up. Smart, fast, fair.</p>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                       <CarouselItem className="pl-2 md:pl-4 basis-4/5 md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                           <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-green-50 active:scale-105">
                            <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                              <HistoryIcon className="w-12 h-12 text-primary" />
                              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Game History & Analytics</h3>
                              <p className="text-textSecondary text-base leading-relaxed">Every game, every player, every result. Any time.</p>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex" />
                    <CarouselNext className="hidden md:flex" />
                  </Carousel>
                </div>
              </div>
            </section>

            {/* Final CTA Section */}
            <section className="w-full py-8 md:py-12 lg:py-16 bg-gradient-to-r from-primary/5 to-white">
              <div className="container grid items-center justify-center gap-8 px-4 text-center md:px-6">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900">Ready to Start Playing?</h2>
                  <p className="mx-auto max-w-[600px] text-textSecondary text-base sm:text-lg leading-relaxed">
                    Join others who've already elevated their game nights with PokerUp.
                  </p>
                </div>
                <div className="flex justify-center">
                  <SignInWithGoogle />
                </div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="flex flex-col gap-4 sm:flex-row py-8 w-full shrink-0 items-center px-4 md:px-6 border-t bg-gradient-to-r from-gray-50 to-white">
            <p className="text-sm text-textSecondary">&copy; 2024 PokerUp. All rights reserved.</p>
          </footer>
        </div>
      </div>
    );
  }

  return null; // Will redirect via useEffect
} 