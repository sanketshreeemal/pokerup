import { create } from 'zustand';
import { Game, Player } from '@/src/types';

interface GameState {
  currentGame: Game | null;
  setCurrentGame: (game: Game) => void;
  addPlayer: (player: Player) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  removePlayer: (playerId: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentGame: null,
  
  setCurrentGame: (game) => set({ currentGame: game }),
  
  addPlayer: (player) => set((state) => {
    if (!state.currentGame) return state;
    
    return {
      currentGame: {
        ...state.currentGame,
        players: [...state.currentGame.players, player],
      },
    };
  }),
  
  updatePlayer: (playerId, updates) => set((state) => {
    if (!state.currentGame) return state;
    
    return {
      currentGame: {
        ...state.currentGame,
        players: state.currentGame.players.map((player) =>
          player.id === playerId ? { ...player, ...updates } : player
        ),
      },
    };
  }),
  
  removePlayer: (playerId) => set((state) => {
    if (!state.currentGame) return state;
    
    return {
      currentGame: {
        ...state.currentGame,
        players: state.currentGame.players.filter((player) => player.id !== playerId),
      },
    };
  }),
})); 