"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Menu, ChevronLeft, ChevronRight, PlayCircle, History, BarChart2, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type NavItem = {
  title: string;
  path: string;
  icon: ReactNode;
};

const navItems: NavItem[] = [
  {
    title: "Play a Game",
    path: "/app",
    icon: <PlayCircle className="h-5 w-5" />,
  },
  {
    title: "Past Games",
    path: "/app/games",
    icon: <History className="h-5 w-5" />,
  },
  {
    title: "Performance",
    path: "/app/performance",
    icon: <BarChart2 className="h-5 w-5" />,
  },
];

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isNavItemActive = (path: string) => pathname === path;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar for desktop */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-card transition-all duration-300",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex items-center justify-between p-4 h-16">
          <div className={cn("flex items-center gap-3", !isSidebarOpen && "justify-center w-full")}>
            <div className="relative h-8 w-8 flex-shrink-0">
              <Image 
                src="/logo.svg" 
                alt="PokerUp"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
            {isSidebarOpen && <h1 className="text-lg font-semibold">PokerUp</h1>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(!isSidebarOpen && "hidden")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(isSidebarOpen && "hidden")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        <Separator />
        
        <div className="flex-1 overflow-auto py-4">
          <nav className="flex flex-col gap-1 px-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isNavItemActive(item.path) ? "secondary" : "ghost"}
                className={cn(
                  "justify-start h-10",
                  !isSidebarOpen && "justify-center px-2"
                )}
                onClick={() => router.push(item.path)}
              >
                {item.icon}
                {isSidebarOpen && <span className="ml-2">{item.title}</span>}
              </Button>
            ))}
          </nav>
        </div>
        
        <Separator />
        
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="" alt="User" />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            {isSidebarOpen && <div className="text-sm font-medium">User Profile</div>}
          </div>
        </div>
      </aside>

      {/* Mobile sidebar with hamburger menu */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-10">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex items-center p-4 h-16">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8">
                <Image 
                  src="/logo.svg" 
                  alt="PokerUp"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
              <h1 className="text-lg font-semibold">PokerUp</h1>
            </div>
          </div>
          
          <Separator />
          
          <div className="py-4">
            <nav className="flex flex-col gap-1 px-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isNavItemActive(item.path) ? "secondary" : "ghost"}
                  className="justify-start h-10"
                  onClick={() => {
                    router.push(item.path);
                    // Close the sheet when a navigation item is clicked
                    document.body.click();
                  }}
                >
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                </Button>
              ))}
            </nav>
          </div>
          
          <Separator />
          
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="" alt="User" />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="text-sm font-medium">User Profile</div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-muted/20">
        <div className="md:hidden flex items-center justify-center h-16 border-b bg-card">
          <div className="relative h-8 w-8">
            <Image 
              src="/logo.svg" 
              alt="PokerUp"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
          <h1 className="text-lg font-semibold ml-3">PokerUp</h1>
        </div>
        <div className="container py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
} 