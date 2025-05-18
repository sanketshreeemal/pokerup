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
import SignOut from "@/components/SignOut";

interface PlayerData {
  username: string;
  buyInInitial: number;
}

export default function GameLobbyPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
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
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Auto-scroll when a new player is added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
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

  const handleAddPlayer = () => {
    setPlayers([...players, { username: "", buyInInitial: 0 }]);
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
    
    if (validPlayers.length < 1) {
      setFormError("At least one player with a username is required");
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
    <div className="container flex flex-col min-h-screen px-6 py-8 mx-auto max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 
          className="text-2xl font-bold"
          style={{ color: theme.colors.textPrimary }}
        >
          Welcome {user.displayName}, let&apos;s set up the game!
        </h1>
        <SignOut />
      </div>
      
      <div 
        className="flex flex-col flex-grow rounded-lg p-5 shadow-md"
        style={{ 
          backgroundColor: theme.colors.surface,
          boxShadow: theme.shadows.card
        }}
      >
        {formError && (
          <div 
            className="mb-6 p-4 rounded-md" 
            style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', border: `1px solid ${theme.colors.error}` }}
          >
            <p style={{ color: theme.colors.error }}>{formError}</p>
          </div>
        )}
        
        <div className="mb-6">
          <h2 
            className="text-lg font-medium mb-3"
            style={{ color: theme.colors.textPrimary }}
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
            
            <div style={{ width: "100px" }}>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-10 rounded-md" style={{ 
                  borderColor: theme.components.input.border,
                  backgroundColor: theme.colors.surface,
                }}>
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex-grow flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h2 
              className="text-lg font-medium"
              style={{ color: theme.colors.textPrimary }}
            >
              Players
            </h2>
            <div 
              className="px-3 py-1 rounded-full text-sm bg-gray-100"
              style={{ color: theme.colors.textSecondary }}
            >
              {getValidPlayerCount()} Players
            </div>
          </div>
          
          <ScrollArea className="flex-grow rounded-md overflow-hidden mb-5">
            <div ref={scrollAreaRef} className="p-1">
              {players.map((_, index) => (
                <NewPlayerCard
                  key={index}
                  playerNumber={index + 1}
                  onUpdate={handleUpdatePlayer}
                  onDelete={() => handleDeletePlayer(index)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
        
        <div className="flex justify-between items-center mt-auto pt-4">
          <button
            onClick={handleAddPlayer}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: theme.colors.primary,
              border: `1px solid ${theme.colors.primary}`,
            }}
          >
            + Add Player
          </button>
          
          <button
            onClick={handleCreateGame}
            disabled={isCreatingGame}
            className="px-6 py-2 rounded-md text-base font-medium transition-colors"
            style={{
              backgroundColor: theme.components.button.primary.background,
              color: theme.components.button.primary.color,
              boxShadow: theme.components.button.primary.shadow,
              opacity: isCreatingGame ? '0.7' : '1',
              cursor: isCreatingGame ? 'not-allowed' : 'pointer',
            }}
          >
            {isCreatingGame ? 'Creating...' : 'Let\'s Play'}
          </button>
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
