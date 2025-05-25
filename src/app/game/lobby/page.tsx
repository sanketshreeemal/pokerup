"use client";

// This is the lobby page - has all the functionality that lets the user (or host in this case) start a game.
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import theme from "@/theme/theme";
import { useState, useEffect, useRef } from "react";
import NewPlayerCard from "../components/NewPlayerCard";
import { useRouter } from "next/navigation";
import { createGame, checkUserHasUsername, reserveUsername } from "@/lib/firebase/firebaseUtils";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/lib/hooks/useAuth";
import { UsernameDialog } from "@/components/UsernameDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface PlayerData {
  username: string;
  buyInInitial: number;
}

export default function GameLobbyPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [gameName, setGameName] = useState("");
  const [currency, setCurrency] = useState("CAD");
  const [players, setPlayers] = useState<PlayerData[]>([
    { username: "", buyInInitial: 0 },
    { username: "", buyInInitial: 0 },
    { username: "", buyInInitial: 0 },
  ]);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [gameNameError, setGameNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [usernameAlert, setUsernameAlert] = useState<{username: string} | null>(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Auto-scroll when a new player is added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [players.length]);

  // Check if user has a username
  useEffect(() => {
    async function checkUsername() {
      if (user) {
        try {
          setCheckingUsername(true);
          const hasUsername = await checkUserHasUsername(user.uid);
          if (!hasUsername) {
            // Only show dialog after a delay if username is actually needed
            const timer = setTimeout(() => {
              setShowUsernameDialog(true);
            }, 3000);
            return () => clearTimeout(timer);
          }
        } catch (error) {
          console.error("Error checking username:", error);
        } finally {
          setCheckingUsername(false);
        }
      }
    }

    if (user) {
      checkUsername();
    }
  }, [user]);

  const handleUsernameSubmit = async (username: string) => {
    if (!user) return;
    try {
      await reserveUsername(user.uid, username);
      // Keep dialog open for 3 seconds to show success message
      await new Promise(resolve => setTimeout(resolve, 3000));
      setShowUsernameDialog(false);
    } catch (error) {
      console.error("Error setting username:", error);
      throw error; // Re-throw to be handled by the dialog's error handling
    }
  };

  const validateGameName = (name: string): boolean => {
    if (!name.trim()) {
      setGameNameError("Game name is required");
      return false;
    }
    
    if (name.length > 40) {
      setGameNameError("Game name must be 40 characters or less");
      return false;
    }
    
    setGameNameError(null);
    return true;
  };

  const handleGameNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setGameName(name);
    validateGameName(name);
  };

  const handleGameNameBlur = () => {
    validateGameName(gameName);
  };

  const handleUpdatePlayer = (playerNumber: number, username: string, buyIn: number) => {
    const updatedPlayers = [...players];
    updatedPlayers[playerNumber - 1] = { username, buyInInitial: buyIn };
    setPlayers(updatedPlayers);
  };

  // Function to handle username alerts from NewPlayerCard components
  const handleUsernameAlert = (username: string | null) => {
    if (username) {
      setUsernameAlert({ username });
    } else {
      setUsernameAlert(null);
    }
  };

  const handleAddPlayer = () => {
    setPlayers([...players, { username: "", buyInInitial: 0 }]);
    
    // Auto-scroll to bottom after adding player
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, 100); // Small delay to ensure the new player card is rendered
  };

  const handleDeletePlayer = (index: number) => {
    const updatedPlayers = [...players];
    updatedPlayers.splice(index, 1);
    setPlayers(updatedPlayers);
  };

  const getValidPlayerCount = () => {
    return players.filter(player => player.username.trim() !== "").length;
  };

  const validateForm = (): boolean => {
    // Reset form error
    setFormError(null);
    
    // Validate game name
    if (!validateGameName(gameName)) {
      return false;
    }
    
    // Filter out empty player entries
    const validPlayers = players.filter(player => player.username.trim() !== "");
    
    if (validPlayers.length < 2) {
      setFormError("Takes at least 2 to play!");
      return false;
    }
    
    // Check if all players have valid buy-in amounts
    const invalidPlayers = validPlayers.filter(player => player.buyInInitial <= 0);
    if (invalidPlayers.length > 0) {
      setFormError("All players must have a buy-in amount greater than 0");
      return false;
    }
    
    // Check for duplicate usernames
    const usernames = validPlayers.map(player => player.username);
    const uniqueUsernames = new Set(usernames);
    if (usernames.length !== uniqueUsernames.size) {
      setFormError("Each player must have a unique username");
      return false;
    }
    
    return true;
  };

  const handleCreateGame = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user) {
      setFormError("You must be logged in to create a game");
      return;
    }

    // Get the user's username from the players collection
    try {
      const playerDoc = await getDoc(doc(db, "players", user.uid));
      if (!playerDoc.exists()) {
        setFormError("Player document not found. Please try signing out and back in.");
        return;
      }

      const playerData = playerDoc.data();
      if (!playerData.username) {
        setFormError("Please set your username before creating a game");
        setShowUsernameDialog(true);
        return;
      }

      // Filter out empty player entries
      const validPlayers = players.filter(player => player.username.trim() !== "");
      
      // Convert players array to the format expected by createGame
      const playersMap: Record<string, number> = {};
      validPlayers.forEach(player => {
        playersMap[player.username] = player.buyInInitial;
      });

      try {
        setIsCreatingGame(true);
        
        const result = await createGame({
          name: gameName,
          currency,
          hostUsername: playerData.username, // Use the actual username from the players collection
          players: playersMap
        });
        
        // Navigate to the game page
        router.push(`/game/${result.gameId}`);
      } catch (error) {
        console.error("Error creating game:", error);
        setFormError(error instanceof Error ? error.message : "Failed to create game. Please try again.");
      } finally {
        setIsCreatingGame(false);
      }
    } catch (error) {
      console.error("Error getting player data:", error);
      setFormError("Failed to get player data. Please try again.");
    }
  };

  if (loading || checkingUsername) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col px-1 mx-auto max-w-lg">
      
      <div className="flex justify-between items-center mb-0 flex-shrink-0 px-6 py-2">
        <h1 
          className="text-xl font-semibold"
          style={{ color: theme.colors.primary }}
        >
          Host a Game, {user.displayName?.split(' ')[0] || user.displayName}!
        </h1>
      </div>
      
      <div 
        className="flex flex-col flex-1 shadow-none border-0 overflow-hidden"
        style={{ 
          backgroundColor: theme.colors.surface,
        }}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-1 space-y-1 flex-shrink-0">
            <div>
              <h2 
                className="text-lg font-medium mt-0 mb-0"
                style={{ color: theme.colors.primary }}
              >
                Game Name
              </h2>
              
              <div className="flex flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Saturday Night Poker"
                    value={gameName}
                    onChange={handleGameNameChange}
                    onBlur={handleGameNameBlur}
                    className="w-full px-3 h-10 rounded-md"
                    style={{
                      backgroundColor: theme.colors.surface,
                      color: theme.components.input.text,
                      border: `1px solid ${gameNameError ? theme.colors.error : theme.components.input.border}`,
                    }}
                  />
                  {gameNameError && (
                    <p className="mt-1 text-xs" style={{ color: theme.colors.error }}>
                      {gameNameError}
                    </p>
                  )}
                </div>
                
                <div style={{ width: "80px" }}>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger 
                      className="h-10 rounded-md" 
                      style={{ 
                        borderColor: theme.components.input.border,
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.primary,
                        opacity: 1
                      }}
                    >
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent 
                      className="min-w-[5rem] p-0 bg-white" 
                      style={{ 
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.components.input.border,
                      }}
                    >
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <h2 
                className="text-lg font-medium mt-2 mb-0"
                style={{ color: theme.colors.primary }}
              >
                Players
              </h2>
              
              {/* Username alert - show above the scroll area */}
              {usernameAlert && (
                <Alert 
                  className="mb-3 py-2 flex items-center justify-between"
                  style={{
                    backgroundColor: theme.colors.warning + "1A",
                    borderColor: theme.colors.warning + "4D",
                    color: theme.colors.textPrimary
                  }}
                >
                  <AlertDescription className="text-sm">
                    Request {usernameAlert.username} to log into PokerUp for a richer experience.
                  </AlertDescription>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="px-2 py-1 h-6 text-xs"
                    onClick={() => setUsernameAlert(null)}
                  >
                    Skip
                  </Button>
                </Alert>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <div 
              ref={scrollAreaRef}
              className="h-full overflow-y-auto px-4 py-2"
              style={{
                backgroundColor: theme.colors.surface + "4D",
                borderTop: `1px solid ${theme.colors.border}`,
                borderBottom: `1px solid ${theme.colors.border}`,
              }}
            >
              {players.map((_, index) => (
                <NewPlayerCard
                  key={index}
                  playerNumber={index + 1}
                  onUpdate={handleUpdatePlayer}
                  onDelete={() => handleDeletePlayer(index)}
                  currency={currency}
                  onUsernameAlert={handleUsernameAlert}
                />
              ))}
              
              {formError && (
                <Alert 
                  variant="destructive" 
                  className="mx-0 mb-2 px-2 py-2"
                  style={{ 
                    backgroundColor: theme.colors.error + "1A",
                    borderColor: theme.colors.error,
                    color: theme.colors.error
                  }}
                >
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
          
          <div className="px-6 py-4 bg-white flex justify-between items-center flex-shrink-0">
            <Button
              onClick={handleAddPlayer}
              variant="outline"
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'transparent',
                color: theme.colors.primary,
                border: `1px solid ${theme.colors.primary}`,
              }}
            >
              + Add Player
            </Button>
            
            <Button
              onClick={handleCreateGame}
              disabled={isCreatingGame}
              className="px-6 py-2 rounded-md text-base font-medium transition-colors"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.components.button.primary.color,
                opacity: isCreatingGame ? '0.7' : '1',
                cursor: isCreatingGame ? 'not-allowed' : 'pointer',
              }}
            >
              {isCreatingGame ? 'Creating...' : 'Let\'s Play'}
            </Button>
          </div>
        </div>
      </div>

      <UsernameDialog
        isOpen={showUsernameDialog}
        onClose={() => setShowUsernameDialog(false)}
        onSubmit={handleUsernameSubmit}
      />
    </div>
  );
}
