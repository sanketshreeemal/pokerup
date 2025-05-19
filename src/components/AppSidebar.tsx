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
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { PlusCircle, History, BarChart2, Users, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import theme from "@/theme/theme";
import { useEffect, useRef } from "react";

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { setOpen, open, isMobile, setOpenMobile, openMobile } = useSidebar();
  const previousPathnameRef = useRef(pathname);

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
      isActive: pathname === "/game/lobby"
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

  const handleNavigation = (url: string) => {
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
        <div className="absolute top-4 right-4">
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={item.isActive}
                    onClick={() => handleNavigation(item.url)}
                    className="text-base" // Increased font size
                  >
                    <item.icon className="h-5 w-5" /> {/* Increased icon size */}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-md p-2 text-left text-base hover:bg-sidebar-accent" // Increased font size
          style={{ color: theme.colors.error }}
        >
          <LogOut className="h-5 w-5" /> {/* Increased icon size */}
          <span>Sign Out</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
} 