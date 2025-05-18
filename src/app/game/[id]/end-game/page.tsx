"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import theme from "@/theme/theme";

export default function EndGamePage() {
  const router = useRouter();

  const handleHomeClick = () => {
    router.push('/game/lobby');
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6">
      <Card 
        className="flex-grow mb-4"
        style={{ borderColor: theme.colors.primary + "33" }}
      >
        <CardHeader className="pb-4">
          <CardTitle 
            className="text-2xl font-bold"
            style={{ color: theme.colors.primary }}
          >
            Suggested Settlement
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* AI-generated settlement suggestions will go here */}
        </CardContent>
      </Card>

      <Button 
        onClick={handleHomeClick}
        className="w-full"
        style={{ backgroundColor: theme.colors.primary }}
      >
        <Home className="w-4 h-4 mr-2" />
        Back to Home
      </Button>
    </div>
  );
}
