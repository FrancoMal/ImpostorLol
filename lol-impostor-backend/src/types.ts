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
  maxPlayers: number; // 3-8
  impostorCount: number; // 1-2
  discussionTime?: number; // optional timer in minutes
  votingTime?: number; // optional timer in minutes
  allowReconnect: boolean;
  revealVotesImmediately: boolean;
}

export type GameState = 
  | 'WAITING'    // Waiting for players to join
  | 'STARTING'   // Game is starting, assigning roles
  | 'DISCUSSION' // Players discussing and giving hints
  | 'VOTING'     // Voting phase
  | 'REVEAL'     // Showing voting results
  | 'FINISHED';  // Game over

export interface Room {
  id: string;
  hostId: string;
  settings: RoomSettings;
  players: Player[];
  gameState: GameState;
  champion?: string; // The champion assigned to non-impostors
  messages: Message[];
  votes: Vote[];
  votingRound: number;
  createdAt: Date;
  lastActivity: Date;
}

export interface GameEvents {
  // Room management
  'create-room': (settings: Partial<RoomSettings>) => void;
  'join-room': (data: { roomId: string; nickname: string }) => void;
  'leave-room': () => void;
  'kick-player': (playerId: string) => void;
  
  // Game control
  'start-game': () => void;
  'update-settings': (settings: Partial<RoomSettings>) => void;
  
  // Chat
  'send-message': (content: string) => void;
  
  // Voting
  'cast-vote': (targetId: string) => void;
  
  // Client events (server to client)
  'room-created': (data: { roomId: string; room: Room }) => void;
  'room-joined': (room: Room) => void;
  'room-updated': (room: Room) => void;
  'player-joined': (player: Player) => void;
  'player-left': (playerId: string) => void;
  'player-kicked': (playerId: string) => void;
  'game-started': (data: { champion: string; isImpostor: boolean }) => void;
  'message-received': (message: Message) => void;
  'voting-started': () => void;
  'vote-cast': (playerId: string) => void;
  'voting-results': (result: VotingResult) => void;
  'game-ended': (data: { winner: 'impostors' | 'innocents'; reason: string }) => void;
  'error': (error: string) => void;
}