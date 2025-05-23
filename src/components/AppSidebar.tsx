"use client"

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  useSidebar
} from "@/components/ui/sidebar";
import { PlusCircle, History, BarChart2, Users, LogOut, AlertCircle, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import theme from "@/theme/theme";
import { useEffect, useRef } from "react";
import { useActiveGame } from "@/lib/hooks/useActiveGame";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { setOpen, open, isMobile, setOpenMobile, openMobile } = useSidebar();
  const previousPathnameRef = useRef(pathname);
  const { activeGame, loading: activeGameLoading, isInActiveGame } = useActiveGame();

  // Close sidebar on actual route change
  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      if (isMobile) {
        if (openMobile) {
          setOpenMobile(false);
        }
      } else {
        if (open) {
          setOpen(false);
        }
      }
    }
    previousPathnameRef.current = pathname;
  }, [pathname, isMobile, openMobile, setOpenMobile, open, setOpen]);

  // Navigation items
  const navItems = [
    {
      title: "New Game",
      icon: PlusCircle,
      url: "/game/lobby",
      isActive: pathname === "/game/lobby",
      disabled: !!activeGame
    },
    {
      title: "Game History",
      icon: History,
      url: "/game-history",
      isActive: pathname === "/game-history"
    },
    {
      title: "Performance",
      icon: BarChart2,
      url: "/performance",
      isActive: pathname === "/performance"
    },
    {
      title: "Friends",
      icon: Users,
      url: "#",
      isActive: false
    }
  ];

  const handleNavigation = (url: string, disabled = false) => {
    if (disabled) return;
    
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
    if (url !== "#") { // Avoid navigation for placeholder URLs
      router.push(url);
    }
  };

  const handleSignOut = async () => {
    try {
      if (isMobile) {
        setOpenMobile(false);
      } else {
        setOpen(false);
      }
      await signOut();
      router.push("/"); // Redirect to root (auth) page
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleBackToGame = () => {
    if (!activeGame) return;
    
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
    
    router.push(`/game/${activeGame.id}`);
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.displayName) return "?";
    return user.displayName
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        {user && (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
              <AvatarFallback style={{ backgroundColor: theme.colors.primary }}>
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        {activeGame && !isInActiveGame && (
          <SidebarGroup>
            <SidebarGroupContent>
              <Button
                onClick={handleBackToGame}
                className="w-full mb-2 mt-1"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <span>Back to Game</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={item.isActive}
                    onClick={() => handleNavigation(item.url, item.disabled)}
                    className={`text-base ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  
                  {item.disabled && (
                    <div 
                      className="flex items-center ml-9 text-xs font-medium mt-1"
                      style={{ color: theme.colors.error }}
                    >
                      <span>Game in Progress</span>
                    </div>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-md p-2 text-left text-base hover:bg-sidebar-accent"
          style={{ color: theme.colors.error }}
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
} 