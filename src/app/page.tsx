"use client";

import { useEffect, useCallback } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import theme from "@/theme/theme";
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

import hostGame from '@/components/assets/host-game.png';
import inGame from '@/components/assets/ingame-1.png';
import settlement from '@/components/assets/settlement-1.png';
import winChart from '@/components/assets/win-chart.png';
import gameTrack from '@/components/assets/game-track.png';



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
            <section className="w-full py-4 md:py-8 lg:py-12 bg-gradient-to-br from-green-50 to-white">
              <div className="container px-4 md:px-6 space-y-12">
                <div className="grid gap-12 lg:grid-cols-1 lg:gap-16 items-center">
                  <div className="flex flex-col justify-center items-center text-center space-y-8">
                    <div className="space-y-6">
                      <h1 className="text-5xl font-bold tracking-tight sm:text-6xl text-primary leading-tight">
                        Play Poker. <br /> We&apos;ll do the rest.
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
                              <Image src={hostGame} alt="Set the Stage" className="rounded-t-lg aspect-[5/5.4] object-cover object-top"/>
                            </CardHeader>
                            <CardContent className="p-6 space-y-3" style={{ background: `linear-gradient(to right, ${theme.colors.primary}33, ${theme.colors.primary}0D)` }}>
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
                              <Image src={inGame} alt="Track the stakes" className="rounded-t-lg aspect-[5/5.4] object-cover object-top"/>
                            </CardHeader>
                            <CardContent className="p-6 space-y-3" style={{ background: `linear-gradient(to right, ${theme.colors.primary}33, ${theme.colors.primary}0D)` }}>
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
                              <div className="bg-white rounded-t-lg aspect-[5/5.4]">
                                <Image src={settlement} alt="Use AI to Settle Up" className="w-full h-auto object-contain"/>
                              </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-3" style={{ background: `linear-gradient(to right, ${theme.colors.primary}33, ${theme.colors.primary}0D)` }}>
                              <CardTitle className="text-xl sm:text-2xl text-gray-900">Step 3: Use AI to Settle Up</CardTitle>
                              <p className="text-textSecondary text-base leading-relaxed">Let us do the math for you, with our suggested payouts.</p>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                      <CarouselItem className="pl-2 md:pl-4 basis-4/5 md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                          <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 active:scale-105">
                            <CardHeader className="p-0">
                              <Image src={winChart} alt="Track your performance" className="rounded-t-lg aspect-[5/5.4] object-cover object-top"/>
                            </CardHeader>
                            <CardContent className="p-6 space-y-3" style={{ background: `linear-gradient(to right, ${theme.colors.primary}33, ${theme.colors.primary}0D)` }}>
                              <CardTitle className="text-xl sm:text-2xl text-gray-900">Step 4: Track performance</CardTitle>
                              <p className="text-textSecondary text-base leading-relaxed">Every Game, Every Player, Every Result. Any Time.</p>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                      <CarouselItem className="pl-2 md:pl-4 basis-4/5 md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                          <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 active:scale-105">
                            <CardHeader className="p-0">
                              <Image src={gameTrack} alt="Refer to past games" className="rounded-t-lg aspect-[5/5.4] object-cover object-top"/>
                            </CardHeader>
                            <CardContent className="p-6 space-y-3" style={{ background: `linear-gradient(to right, ${theme.colors.primary}33, ${theme.colors.primary}0D)` }}>
                              <CardTitle className="text-xl sm:text-2xl text-gray-900">Step 5: See past games</CardTitle>
                              <p className="text-textSecondary text-base leading-relaxed">Look back at any game and the results.</p>
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
                    Join others who&apos;ve already elevated their game nights with PokerUp.
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
            <p className="text-sm text-textSecondary">&copy; 2025 PokerUp. All rights reserved.</p>
          </footer>
        </div>
      </div>
    );
  }

  return null; // Will redirect via useEffect
} 