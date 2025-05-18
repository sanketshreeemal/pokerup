import { create, StateCreator } from 'zustand';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase/firebase';

// Interface matching Firestore game document
export interface PlayerStats {
  buyInInitial: number;
  addBuyIns: number;
  cashOuts: number;
  finalStack?: number; // Only set when game is complete
}

export interface GameDoc {
  name: string;
  currency: string;
  status: 'active' | 'complete';
  hostUsername: string;
  createdAt: any; // Firestore timestamp
  playerUsernames: string[];
  players: Record<string, PlayerStats>;
  settlement?: Record<string, any>; // Added on completion
}

// Store state interface
interface GameState {
  doc: GameDoc | null;
  loading: boolean;
  subscribe: (gameId: string) => () => void;
  clear: () => void;
  update: (fieldPath: string, value: any) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  doc: null,
  loading: true,
  
  // Subscribe to game document updates
  subscribe: (gameId: string) => {
    const unsubscribe = onSnapshot(
      doc(db, 'games', gameId),
      (snapshot) => {
        if (snapshot.exists()) {
          set({ 
            doc: snapshot.data() as GameDoc,
            loading: false
          });
        } else {
          set({ doc: null, loading: false });
        }
      },
      (error) => {
        console.error('Error subscribing to game:', error);
        set({ loading: false });
      }
    );
    
    // Return unsubscribe function for cleanup
    return unsubscribe;
  },
  
  // Clear game state (on unmount)
  clear: () => {
    set({ doc: null, loading: true });
  },
  
  // Update a field in the game document
  update: (fieldPath: string, value: any) => {
    // This will be used to update local state optimistically
    // Actual Firestore updates will be handled by firebaseUtils functions
    set((state: GameState) => {
      if (!state.doc) return state;
      
      // Create a new doc with the updated field
      const newDoc = { ...state.doc };
      
      // Handle nested paths like 'players.alice.buyInInitial'
      const parts = fieldPath.split('.');
      let current: any = newDoc;
      
      // Navigate to the deepest object that contains our target property
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      
      // Set the value
      current[parts[parts.length - 1]] = value;
      
      return { doc: newDoc };
    });
  }
}));

// React hook for components to use
export const useGame = () => useGameStore();