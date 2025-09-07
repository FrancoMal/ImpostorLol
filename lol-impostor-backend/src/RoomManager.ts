import { v4 as uuidv4 } from 'uuid';
import { Room, Player, RoomSettings, Vote, VotingResult, Message, GameState } from './types';
import { getRandomChampion } from './champions';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  createRoom(hostId: string, hostNickname: string, settings: Partial<RoomSettings>): Room {
    const roomId = this.generateRoomId();
    
    const defaultSettings: RoomSettings = {
      maxPlayers: 6,
      impostorCount: 1,
      discussionTime: undefined, // No timer by default
      votingTime: undefined, // No timer by default
      allowReconnect: true,
      revealVotesImmediately: true
    };

    const host: Player = {
      id: hostId,
      nickname: hostNickname,
      isHost: true,
      isImpostor: false,
      isConnected: true,
      joinedAt: new Date(),
      lastSeen: new Date()
    };

    const room: Room = {
      id: roomId,
      hostId,
      settings: { ...defaultSettings, ...settings },
      players: [host],
      gameState: 'WAITING',
      messages: [],
      votes: [],
      votingRound: 0,
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(roomId: string, playerId: string, nickname: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Check if player is reconnecting
    const existingPlayer = room.players.find(p => p.id === playerId);
    if (existingPlayer && room.settings.allowReconnect) {
      existingPlayer.isConnected = true;
      existingPlayer.lastSeen = new Date();
      room.lastActivity = new Date();
      return room;
    }

    // Check room capacity
    if (room.players.length >= room.settings.maxPlayers) {
      return null;
    }

    // Check if game is in progress (unless reconnecting)
    if (room.gameState !== 'WAITING' && !existingPlayer) {
      return null;
    }

    // Add new player
    const newPlayer: Player = {
      id: playerId,
      nickname,
      isHost: false,
      isImpostor: false,
      isConnected: true,
      joinedAt: new Date(),
      lastSeen: new Date()
    };

    room.players.push(newPlayer);
    room.lastActivity = new Date();
    return room;
  }

  leaveRoom(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    if (room.settings.allowReconnect && room.gameState !== 'WAITING') {
      // Mark as disconnected but keep in room
      player.isConnected = false;
      player.lastSeen = new Date();
    } else {
      // Remove player completely
      room.players = room.players.filter(p => p.id !== playerId);
    }

    // If host left and there are other players, make someone else host
    if (player.isHost && room.players.length > 0) {
      const newHost = room.players.find(p => p.isConnected);
      if (newHost) {
        newHost.isHost = true;
        room.hostId = newHost.id;
      }
    }

    // Delete room if empty
    if (room.players.length === 0 || !room.players.some(p => p.isConnected)) {
      this.rooms.delete(roomId);
      return true;
    }

    room.lastActivity = new Date();
    return true;
  }

  kickPlayer(roomId: string, hostId: string, targetPlayerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId) return false;

    room.players = room.players.filter(p => p.id !== targetPlayerId);
    room.lastActivity = new Date();
    return true;
  }

  updateSettings(roomId: string, hostId: string, settings: Partial<RoomSettings>): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId || room.gameState !== 'WAITING') return false;

    room.settings = { ...room.settings, ...settings };
    room.lastActivity = new Date();
    return true;
  }

  startGame(roomId: string, hostId: string): { success: boolean; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId) {
      return { success: false, error: 'Room not found or not host' };
    }

    if (room.gameState !== 'WAITING') {
      return { success: false, error: 'Game already in progress' };
    }

    const activePlayers = room.players.filter(p => p.isConnected);
    if (activePlayers.length < 3) {
      return { success: false, error: 'Need at least 3 players to start' };
    }

    if (activePlayers.length < room.settings.impostorCount + 1) {
      return { success: false, error: 'Not enough players for the number of impostors' };
    }

    // Assign champion to non-impostors
    room.champion = getRandomChampion();

    // Reset game state
    room.gameState = 'STARTING';
    room.votes = [];
    room.votingRound = 0;

    // Randomly assign impostors
    const shuffledPlayers = [...activePlayers].sort(() => Math.random() - 0.5);
    const impostors = shuffledPlayers.slice(0, room.settings.impostorCount);
    
    // Reset impostor status for all players
    room.players.forEach(p => p.isImpostor = false);
    impostors.forEach(p => p.isImpostor = true);

    room.gameState = 'DISCUSSION';
    room.lastActivity = new Date();

    return { success: true };
  }

  addMessage(roomId: string, playerId: string, content: string): Message | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.find(p => p.id === playerId && p.isConnected);
    if (!player) return null;

    const message: Message = {
      id: uuidv4(),
      playerId,
      playerNickname: player.nickname,
      content,
      timestamp: new Date(),
      type: 'chat'
    };

    room.messages.push(message);
    room.lastActivity = new Date();

    // Keep only last 100 messages
    if (room.messages.length > 100) {
      room.messages = room.messages.slice(-100);
    }

    return message;
  }

  startVoting(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'DISCUSSION') return false;

    room.gameState = 'VOTING';
    room.votingRound++;
    room.votes = room.votes.filter(v => v.round < room.votingRound); // Clear current round votes
    room.lastActivity = new Date();
    return true;
  }

  castVote(roomId: string, playerId: string, targetId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'VOTING') return false;

    const voter = room.players.find(p => p.id === playerId && p.isConnected);
    const target = room.players.find(p => p.id === targetId && p.isConnected);
    if (!voter || !target) return false;

    // Remove existing vote from this player for this round
    room.votes = room.votes.filter(v => !(v.playerId === playerId && v.round === room.votingRound));

    // Add new vote
    const vote: Vote = {
      playerId,
      targetId,
      round: room.votingRound,
      timestamp: new Date()
    };

    room.votes.push(vote);
    room.lastActivity = new Date();
    return true;
  }

  processVotes(roomId: string): VotingResult | null {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'VOTING') return null;

    const currentVotes = room.votes.filter(v => v.round === room.votingRound);
    const activePlayers = room.players.filter(p => p.isConnected);

    // Count votes
    const voteCounts: { [playerId: string]: number } = {};
    activePlayers.forEach(p => voteCounts[p.id] = 0);

    currentVotes.forEach(vote => {
      voteCounts[vote.targetId] = (voteCounts[vote.targetId] || 0) + 1;
    });

    // Find player(s) with most votes
    const maxVotes = Math.max(...Object.values(voteCounts));
    const playersWithMaxVotes = Object.keys(voteCounts).filter(id => voteCounts[id] === maxVotes);

    // Create result
    const votes = currentVotes.map(vote => {
      const voter = room.players.find(p => p.id === vote.playerId);
      const target = room.players.find(p => p.id === vote.targetId);
      return {
        player: voter?.nickname || 'Unknown',
        votedFor: target?.nickname || 'Unknown'
      };
    });

    const result: VotingResult = {
      votes,
      voteCounts,
      isTie: playersWithMaxVotes.length > 1 || maxVotes === 0,
      newRound: false,
      eliminated: undefined
    };

    room.gameState = 'REVEAL';

    if (!result.isTie && playersWithMaxVotes.length === 1) {
      const eliminatedPlayer = room.players.find(p => p.id === playersWithMaxVotes[0]);
      if (eliminatedPlayer) {
        result.eliminated = eliminatedPlayer.nickname;
        
        // Remove eliminated player
        room.players = room.players.filter(p => p.id !== eliminatedPlayer.id);

        // Check win conditions
        const remainingPlayers = room.players.filter(p => p.isConnected);
        const remainingImpostors = remainingPlayers.filter(p => p.isImpostor);
        
        if (remainingImpostors.length === 0) {
          // Innocents win
          room.gameState = 'FINISHED';
        } else if (remainingImpostors.length >= remainingPlayers.length - remainingImpostors.length) {
          // Impostors win
          room.gameState = 'FINISHED';
        } else {
          // Game continues
          room.gameState = 'DISCUSSION';
        }
      }
    } else {
      // Tie or no votes, new voting round
      result.newRound = true;
      room.gameState = 'DISCUSSION';
    }

    room.lastActivity = new Date();
    return result;
  }

  getRoom(roomId: string): Room | null {
    return this.rooms.get(roomId) || null;
  }

  getRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  cleanupInactiveRooms(maxInactiveHours: number = 24): number {
    const cutoffTime = new Date(Date.now() - maxInactiveHours * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [roomId, room] of this.rooms.entries()) {
      if (room.lastActivity < cutoffTime || !room.players.some(p => p.isConnected)) {
        this.rooms.delete(roomId);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  private generateRoomId(): string {
    // Generate a 6-character room ID
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Ensure uniqueness
    if (this.rooms.has(result)) {
      return this.generateRoomId();
    }
    
    return result;
  }
}