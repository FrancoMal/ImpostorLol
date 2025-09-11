import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './RoomManager';
import { GameEvents } from './types';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? (process.env.CORS_ORIGINS || 'https://impostor-lol.vercel.app').split(',')
      : ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.CORS_ORIGINS || 'https://impostor-lol.vercel.app').split(',')
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

const roomManager = new RoomManager();

// Health check endpoint
app.get('/health', (req, res) => {
  const rooms = roomManager.getRooms();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    activeRooms: rooms.length,
    totalPlayers: rooms.reduce((sum, room) => sum + room.players.filter(p => p.isConnected).length, 0)
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  
  let currentRoomId: string | null = null;
  let playerId: string = socket.id;

  // Create room
  socket.on('create-room', (settings) => {
    try {
      if (currentRoomId) {
        socket.emit('error', 'Already in a room');
        return;
      }

      const nickname = settings.nickname || 'Host';
      const profileIcon = settings.profileIcon || '0.png';
      const room = roomManager.createRoom(playerId, nickname, profileIcon, settings);
      currentRoomId = room.id;
      
      socket.join(room.id);
      socket.emit('room-created', { roomId: room.id, room });
      
      console.log(`Room created: ${room.id} by ${nickname}`);
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', 'Failed to create room');
    }
  });

  // Join room
  socket.on('join-room', (data) => {
    try {
      const { roomId, nickname, profileIcon } = data;
      
      if (currentRoomId) {
        socket.emit('error', 'Already in a room');
        return;
      }

      const room = roomManager.joinRoom(roomId, playerId, nickname, profileIcon || '0.png');
      if (!room) {
        socket.emit('error', 'Room not found or full');
        return;
      }

      currentRoomId = roomId;
      socket.join(roomId);
      
      // Notify player they joined
      socket.emit('room-joined', room);
      
      // Notify others in room
      socket.to(roomId).emit('player-joined', room.players.find(p => p.id === playerId));
      socket.to(roomId).emit('room-updated', room);
      
      console.log(`${nickname} joined room ${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', 'Failed to join room');
    }
  });

  // Leave room
  socket.on('leave-room', () => {
    if (currentRoomId) {
      handlePlayerLeave();
    }
  });

  // Kick player (host only)
  socket.on('kick-player', (targetPlayerId) => {
    try {
      if (!currentRoomId) {
        socket.emit('error', 'Not in a room');
        return;
      }

      const success = roomManager.kickPlayer(currentRoomId, playerId, targetPlayerId);
      if (!success) {
        socket.emit('error', 'Cannot kick player');
        return;
      }

      const room = roomManager.getRoom(currentRoomId);
      if (room) {
        // Notify kicked player
        io.to(targetPlayerId).emit('player-kicked', targetPlayerId);
        
        // Notify room
        io.to(currentRoomId).emit('player-left', targetPlayerId);
        io.to(currentRoomId).emit('room-updated', room);
        
        console.log(`Player ${targetPlayerId} kicked from room ${currentRoomId}`);
      }
    } catch (error) {
      console.error('Error kicking player:', error);
      socket.emit('error', 'Failed to kick player');
    }
  });

  // Update room settings (host only)
  socket.on('update-settings', (settings) => {
    try {
      if (!currentRoomId) {
        socket.emit('error', 'Not in a room');
        return;
      }

      const success = roomManager.updateSettings(currentRoomId, playerId, settings);
      if (!success) {
        socket.emit('error', 'Cannot update settings');
        return;
      }

      const room = roomManager.getRoom(currentRoomId);
      if (room) {
        io.to(currentRoomId).emit('room-updated', room);
        console.log(`Settings updated for room ${currentRoomId}`);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      socket.emit('error', 'Failed to update settings');
    }
  });

  // Start game (host only)
  socket.on('start-game', () => {
    try {
      if (!currentRoomId) {
        socket.emit('error', 'Not in a room');
        return;
      }

      const result = roomManager.startGame(currentRoomId, playerId);
      if (!result.success) {
        socket.emit('error', result.error || 'Failed to start game');
        return;
      }

      const room = roomManager.getRoom(currentRoomId);
      if (room) {
        // Send individual game data to each player
        room.players.filter(p => p.isConnected).forEach(player => {
          io.to(player.id).emit('game-started', {
            champion: room.champion!,
            isImpostor: player.isImpostor
          });
        });

        // Update room state for everyone
        io.to(currentRoomId).emit('room-updated', room);
        
        console.log(`Game started in room ${currentRoomId} with champion: ${room.champion}`);
      }
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('error', 'Failed to start game');
    }
  });

  // Send chat message
  socket.on('send-message', (content) => {
    try {
      if (!currentRoomId) {
        socket.emit('error', 'Not in a room');
        return;
      }

      const message = roomManager.addMessage(currentRoomId, playerId, content);
      if (!message) {
        socket.emit('error', 'Failed to send message');
        return;
      }

      io.to(currentRoomId).emit('message-received', message);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  // Select vote (temporary selection)
  socket.on('select-vote', (targetId) => {
    try {
      if (!currentRoomId) {
        socket.emit('error', 'Not in a room');
        return;
      }

      const result = roomManager.selectVote(currentRoomId, playerId, targetId);
      if (!result.success) {
        socket.emit('error', 'Failed to select vote');
        return;
      }

      // Notify room about vote selection update
      io.to(currentRoomId).emit('vote-selection-updated', {
        playerId,
        targetId,
        selectionsCount: result.selectionsCount,
        totalPlayers: result.totalPlayers
      });

      // Notify if voting is ready to finalize
      io.to(currentRoomId).emit('voting-ready-to-finalize', result.readyToFinalize);

    } catch (error) {
      console.error('Error selecting vote:', error);
      socket.emit('error', 'Failed to select vote');
    }
  });

  // Finalize voting (host only)
  socket.on('finalize-voting', () => {
    try {
      if (!currentRoomId) {
        socket.emit('error', 'Not in a room');
        return;
      }

      const result = roomManager.finalizeVoting(currentRoomId, playerId);
      if (!result.success) {
        socket.emit('error', result.error || 'Failed to finalize voting');
        return;
      }

      const room = roomManager.getRoom(currentRoomId);
      if (room) {
        // Start countdown
        let countdown = 3;
        io.to(currentRoomId).emit('voting-countdown', countdown);
        
        const countdownInterval = setInterval(() => {
          countdown--;
          if (countdown > 0) {
            io.to(currentRoomId).emit('voting-countdown', countdown);
          } else {
            clearInterval(countdownInterval);
            
            // Process votes after countdown
            const votingResult = roomManager.processVotes(currentRoomId);
            if (votingResult) {
              io.to(currentRoomId).emit('voting-results', votingResult);
              io.to(currentRoomId).emit('room-updated', room);
              
              // Check if game ended
              if (room.gameState === 'FINISHED') {
                const remainingImpostors = room.players.filter(p => p.isImpostor && p.isConnected && !p.isEliminated);
                const winner = remainingImpostors.length === 0 ? 'innocents' : 'impostors';
                const reason = remainingImpostors.length === 0 ? 'All impostors eliminated' : 'Impostors equal or outnumber innocents';
                
                io.to(currentRoomId).emit('game-ended', { winner, reason });
              }
            }
          }
        }, 1000);
      }

    } catch (error) {
      console.error('Error finalizing voting:', error);
      socket.emit('error', 'Failed to finalize voting');
    }
  });

  // Manual voting start (for host or when timer expires)
  socket.on('start-voting', () => {
    try {
      if (!currentRoomId) {
        socket.emit('error', 'Not in a room');
        return;
      }

      const room = roomManager.getRoom(currentRoomId);
      if (!room || (room.hostId !== playerId && room.gameState !== 'DISCUSSION')) {
        socket.emit('error', 'Cannot start voting');
        return;
      }

      const success = roomManager.startVoting(currentRoomId);
      if (success) {
        io.to(currentRoomId).emit('voting-started');
        io.to(currentRoomId).emit('room-updated', room);
      }
    } catch (error) {
      console.error('Error starting voting:', error);
      socket.emit('error', 'Failed to start voting');
    }
  });

  // Reset game (host only)
  socket.on('reset-game', () => {
    try {
      if (!currentRoomId) {
        socket.emit('error', 'Not in a room');
        return;
      }

      const result = roomManager.resetGame(currentRoomId, playerId);
      if (!result.success) {
        socket.emit('error', result.error || 'Failed to reset game');
        return;
      }

      const room = roomManager.getRoom(currentRoomId);
      if (room) {
        io.to(currentRoomId).emit('game-reset');
        io.to(currentRoomId).emit('room-updated', room);
        console.log(`Game reset in room ${currentRoomId}`);
      }
    } catch (error) {
      console.error('Error resetting game:', error);
      socket.emit('error', 'Failed to reset game');
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    handlePlayerLeave();
  });

  function handlePlayerLeave() {
    if (currentRoomId) {
      const success = roomManager.leaveRoom(currentRoomId, playerId);
      
      if (success) {
        const room = roomManager.getRoom(currentRoomId);
        if (room) {
          socket.to(currentRoomId).emit('player-left', playerId);
          socket.to(currentRoomId).emit('room-updated', room);
        }
      }
      
      socket.leave(currentRoomId);
      currentRoomId = null;
    }
  }
});

// Cleanup inactive rooms every hour
setInterval(() => {
  const deletedCount = roomManager.cleanupInactiveRooms(24);
  if (deletedCount > 0) {
    console.log(`Cleaned up ${deletedCount} inactive rooms`);
  }
}, 60 * 60 * 1000);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 LoL Impostor server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});