import { create } from 'zustand';
import { Game, Player, Settlement } from '@/types';
import { 
  setDocumentWithId, 
  updateDocumentFields 
} from '../../lib/firebase/firebaseUtils';
import { v4 as uuidv4 } from 'uuid';

interface GameState {
  currentGame: Game | null;
  setCurrentGame: (gameData: Omit<Game, 'id' | 'date' | 'state' | 'players'> & { name: string, players: Player[] }) => Promise<void>;
  addPlayer: (playerData: Omit<Player, 'id' | 'totalBuyIn' | 'additionalBuyIns' | 'buyOuts'> & {name: string, initialBuyIn: number}) => Promise<void>;
  updatePlayer: (updatedPlayer: Player) => Promise<void>;
  removePlayer: (playerId: string) => Promise<void>;
  setPlayers: (players: Player[]) => Promise<void>;
  updateGameName: (newName: string) => Promise<void>;
  saveSettlement: (settlementData: Settlement) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentGame: null,
  
  setCurrentGame: async (gameSetupData) => {
    const newGame: Game = {
      id: uuidv4(),
      name: gameSetupData.name,
      date: new Date(),
      players: gameSetupData.players.map(p => ({
        ...p,
        id: p.id || uuidv4(),
        additionalBuyIns: p.additionalBuyIns || [],
        buyOuts: p.buyOuts || [],
        totalBuyIn: p.initialBuyIn
      })),
      state: 'playing',
    };

    try {
      await setDocumentWithId('games', newGame.id, newGame);
      set({ currentGame: newGame });
      console.log('Game created and saved to Firebase with ID:', newGame.id, newGame);
    } catch (error) {
      console.error("Error creating game in Firebase:", error);
      throw error;
    }
  },
  
  addPlayer: async (playerData) => {
    const state = get();
    if (!state.currentGame || !state.currentGame.id) {
      console.error("Cannot add player: no current game or game ID.");
      throw new Error("Cannot add player: no current game or game ID.");
    }

    const newPlayer: Player = {
      id: uuidv4(),
      name: playerData.name,
      initialBuyIn: playerData.initialBuyIn,
      additionalBuyIns: [],
      buyOuts: [],
      totalBuyIn: playerData.initialBuyIn,
    };
    
    const updatedPlayers = [...state.currentGame.players, newPlayer];
    
    try {
      await updateDocumentFields('games', state.currentGame.id, { players: updatedPlayers });
      set({
        currentGame: {
          ...state.currentGame,
          players: updatedPlayers,
        },
      });
      console.log('Player added to game and Firebase updated:', newPlayer);
    } catch (error) {
      console.error(`Error adding player to game ${state.currentGame.id}:`, error);
      throw error;
    }
  },
  
  updatePlayer: async (updatedCompletePlayer) => {
    const state = get();
    if (!state.currentGame || !state.currentGame.id) {
      console.error("Cannot update player: no current game or game ID.");
      throw new Error("Cannot update player: no current game or game ID.");
    }
    
    const newPlayers = state.currentGame.players.map((player) =>
      player.id === updatedCompletePlayer.id ? updatedCompletePlayer : player
    );
    
    try {
      await updateDocumentFields('games', state.currentGame.id, { players: newPlayers });
      set({
        currentGame: { ...state.currentGame, players: newPlayers },
      });
      console.log(`Player ${updatedCompletePlayer.id} updated in Firebase.`);
    } catch (error) {
      console.error(`Error updating player ${updatedCompletePlayer.id} in Firebase:`, error);
      throw error;
    }
  },
  
  removePlayer: async (playerId) => {
    const state = get();
    if (!state.currentGame || !state.currentGame.id) {
      console.error("Cannot remove player: no current game or game ID.");
      throw new Error("Cannot remove player: no current game or game ID.");
    }
    
    const updatedPlayers = state.currentGame.players.filter((player) => player.id !== playerId);
    
    try {
      await updateDocumentFields('games', state.currentGame.id, { players: updatedPlayers });
      set({
        currentGame: { ...state.currentGame, players: updatedPlayers },
      });
      console.log(`Player ${playerId} removed from game and Firebase updated.`);
    } catch (error) {
      console.error(`Error removing player ${playerId} from Firebase:`, error);
      throw error;
    }
  },

  setPlayers: async (players) => {
    const state = get();
    if (!state.currentGame || !state.currentGame.id) {
      console.error("Cannot set players: no current game or game ID.");
      throw new Error("Cannot set players: no current game or game ID.");
    }
    const validatedPlayers = players.map(p => ({
      ...p,
      id: p.id || uuidv4(),
      additionalBuyIns: p.additionalBuyIns || [],
      buyOuts: p.buyOuts || [],
      totalBuyIn: p.initialBuyIn + 
                  (p.additionalBuyIns?.reduce((sum, bi) => sum + bi.amount, 0) || 0) -
                  (p.buyOuts?.reduce((sum, bo) => sum + bo.amount, 0) || 0)
    }));

    try {
      await updateDocumentFields('games', state.currentGame.id, { players: validatedPlayers });
      set(prevState => ({
        currentGame: prevState.currentGame ? { ...prevState.currentGame, players: validatedPlayers } : null
      }));
      console.log(`Game ${state.currentGame.id} players updated in Firebase.`);
    } catch (error) {
      console.error(`Error setting players for game ${state.currentGame.id} in Firebase:`, error);
      throw error;
    }
  },

  updateGameName: async (newName: string) => {
    const state = get();
    if (!state.currentGame || !state.currentGame.id) {
      console.error("Cannot update game name: no current game or game ID.");
      throw new Error("Cannot update game name: no current game or game ID.");
    }
    try {
      await updateDocumentFields('games', state.currentGame.id, { name: newName });
      set(prevState => ({
        currentGame: prevState.currentGame ? { ...prevState.currentGame, name: newName } : null
      }));
      console.log(`Game ${state.currentGame.id} name updated to "${newName}" in Firebase.`);
    } catch (error) {
      console.error(`Error updating game name for ${state.currentGame.id} in Firebase:`, error);
      throw error;
    }
  },

  saveSettlement: async (settlementData: Settlement) => {
    const state = get();
    if (!state.currentGame || !state.currentGame.id) {
      console.error("Cannot save settlement: no current game or game ID.");
      throw new Error("Cannot save settlement: no current game or game ID.");
    }

    const gameUpdates: Partial<Game> = {
      settlement: settlementData,
      state: 'settlement'
    };

    try {
      await updateDocumentFields('games', state.currentGame.id, gameUpdates);
      set(prevState => ({
        currentGame: prevState.currentGame 
          ? { ...prevState.currentGame, ...gameUpdates } 
          : null
      }));
      console.log(`Game ${state.currentGame.id} settlement saved to Firebase.`);
    } catch (error) {
      console.error(`Error saving settlement for game ${state.currentGame.id} in Firebase:`, error);
      throw error;
    }
  },
})); 