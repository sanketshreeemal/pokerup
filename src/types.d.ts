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