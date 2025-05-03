export type Player = {
  id: string;
  name: string;
  initialBuyIn: number;
  additionalBuyIns: { amount: number; timestamp: number }[];
  buyOuts: { amount: number; timestamp: number }[];
  totalBuyIn: number; // Computed field (sum of initial + all additional buy-ins - buyouts)
};

export type GameState = 'setup' | 'playing' | 'settlement';

export type Settlement = {
  instructions: string;
  transfers: {
    from: string; // Player ID
    to: string; // Player ID
    amount: number;
  }[];
  timestamp: number;
};

export type Game = {
  id: string;
  name: string;
  date: Date;
  players: Player[];
  state: GameState;
  settlement?: Settlement;
}; 