import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Room, Message, GameData, RoomSettings } from '../types';


export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [socketId, setSocketId] = useState<string>('');  
  const [votingCountdown, setVotingCountdown] = useState<number>(0);
  const [voteSelectionsCount, setVoteSelectionsCount] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  useEffect(() => {
    // Connect to server
    const serverUrl = import.meta.env.VITE_API_URL || 
      (import.meta.env.PROD 
        ? 'https://impostorlol-production.up.railway.app'  // Replace with your Railway URL
        : 'http://localhost:3001');

    socketRef.current = io(serverUrl);

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to server with ID:', socket.id);
      setConnected(true);
      setSocketId(socket.id || '');
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    // Game events
    socket.on('room-created', (data) => {
      console.log('Room created:', data.roomId);
      setRoom(data.room);
      setMessages([]);
    });

    socket.on('room-joined', (roomData) => {
      console.log('Joined room:', roomData.id);
      setRoom(roomData);
      setMessages(roomData.messages || []);
    });

    socket.on('room-updated', (roomData) => {
      setRoom(roomData);
    });

    // New voting events
    socket.on('vote-selection-updated', (data) => {
      setVoteSelectionsCount({ current: data.selectionsCount, total: data.totalPlayers });
    });


    socket.on('voting-countdown', (countdown) => {
      setVotingCountdown(countdown);
    });

    socket.on('game-started', (data) => {
      console.log('Game started. Champion:', data.champion, 'Is impostor:', data.isImpostor);
      setGameData(data);
    });

    socket.on('message-received', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('voting-started', () => {
      console.log('Voting started');
    });

    socket.on('vote-cast', (playerId) => {
      console.log('Vote cast by:', playerId);
    });

    socket.on('voting-results', (result) => {
      console.log('Voting results:', result);
      // You can handle voting results here, maybe show a modal
    });

    socket.on('game-ended', (data) => {
      console.log('Game ended:', data);
      // Handle game end
    });

    socket.on('error', (errorMessage) => {
      console.error('Socket error:', errorMessage);
      setError(errorMessage);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Socket methods
  const createRoom = (nickname: string, profileIcon: string, settings: Partial<RoomSettings> = {}) => {
    if (socketRef.current) {
      socketRef.current.emit('create-room', { ...settings, nickname, profileIcon });
    }
  };

  const joinRoom = (roomId: string, nickname: string, profileIcon: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-room', { roomId, nickname, profileIcon });
    }
  };

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room');
      setRoom(null);
      setGameData(null);
      setMessages([]);
      setVotingCountdown(0);
      setVoteSelectionsCount({ current: 0, total: 0 });
    }
  };

  const startGame = () => {
    if (socketRef.current) {
      socketRef.current.emit('start-game');
    }
  };

  const updateSettings = (settings: Partial<RoomSettings>) => {
    if (socketRef.current) {
      socketRef.current.emit('update-settings', settings);
    }
  };

  const sendMessage = (content: string) => {
    if (socketRef.current) {
      socketRef.current.emit('send-message', content);
    }
  };

  const selectVote = (targetId: string | null) => {
    if (socketRef.current) {
      socketRef.current.emit('select-vote', targetId);
    }
  };

  const finalizeVoting = () => {
    if (socketRef.current) {
      socketRef.current.emit('finalize-voting');
    }
  };

  const startVoting = () => {
    if (socketRef.current) {
      socketRef.current.emit('start-voting');
    }
  };

  const kickPlayer = (playerId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('kick-player', playerId);
    }
  };

  const resetGame = () => {
    if (socketRef.current) {
      socketRef.current.emit('reset-game');
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    connected,
    room,
    gameData,
    messages,
    error,
    socketId,
    votingCountdown,
    voteSelectionsCount,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    updateSettings,
    sendMessage,
    selectVote,
    finalizeVoting,
    startVoting,
    kickPlayer,
    resetGame,
    clearError
  };
};
