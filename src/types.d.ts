import { User as FirebaseUser } from "firebase/auth";

interface PlayerData {
  displayName: string;
  email: string;
  photoURL: string;
  username: string | null;
  createdAt: any; // FirebaseFirestore.Timestamp
}

interface UsernameDoc {
  uid: string;
}

interface UsernameReservationResponse {
  success: boolean;
  username: string;
}

interface UsernameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string) => Promise<void>;
}

// Extend Firebase User type
interface User extends FirebaseUser {
  username?: string | null;
}

// Game data interfaces
interface PlayerDetail {
  name: string;
  netFunding: number;
  winnings: number;
  roi: number;
}

interface GameCardData {
  id: string;
  name: string;
  date: string;
  durationHours: number;
  durationMinutes: number;
  potSize: number;
  players: number;
  currentUserWinnings: number;
  roi: number;
  playerDetails: PlayerDetail[];
}

// Internal game structure (matches Firestore)
interface PlayerStats {
  buyInInitial: number;
  addBuyIns: number;
  cashOuts: number;
  finalStack?: number;
}

interface GameDoc {
  name: string;
  currency: string;
  status: 'active' | 'complete';
  hostUsername: string;
  createdAt: any; // Firestore timestamp
  playerUsernames: string[];
  players: Record<string, PlayerStats>;
  settlement?: Record<string, any>; // Added on completion
} 