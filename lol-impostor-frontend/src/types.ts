export interface Player {
  id: string;
  nickname: string;
  profileIcon: string; // Icon filename (e.g., "5.png")
  isHost: boolean;
  isImpostor: boolean;
  isConnected: boolean;
  isEliminated: boolean; // New field for spectator mode
  joinedAt: Date;
  lastSeen: Date;
}

export interface Message {
  id: string;
  playerId: string;
  playerNickname: string;
  content: string;
  timestamp: Date;
  type: 'chat' | 'system';
}

export interface Vote {
  playerId: string;
  targetId: string;
  round: number;
  timestamp: Date;
}

export interface VotingResult {
  votes: { player: string; votedFor: string }[];
  eliminated?: string;
  isTie: boolean;
  newRound: boolean;
  voteCounts: { [playerId: string]: number };
}

export interface RoomSettings {
  maxPlayers: number;
  impostorCount: number;
  discussionTime?: number;
  votingTime?: number;
  allowReconnect: boolean;
  revealVotesImmediately: boolean;
}

export type GameState = 
  | 'WAITING'
  | 'STARTING'
  | 'DISCUSSION'
  | 'VOTING'
  | 'REVEAL'
  | 'FINISHED';

export interface Room {
  id: string;
  hostId: string;
  settings: RoomSettings;
  players: Player[];
  gameState: GameState;
  champion?: string;
  messages: Message[];
  votes: Vote[];
  votingRound: number;
  createdAt: Date;
  lastActivity: Date;
}

export interface GameData {
  champion: string;
  isImpostor: boolean;
}