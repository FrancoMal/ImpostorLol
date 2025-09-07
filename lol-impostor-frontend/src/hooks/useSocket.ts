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

  useEffect(() => {
    // Connect to server
    const serverUrl = import.meta.env.VITE_API_URL || 
      (import.meta.env.PROD 
        ? 'impostorlol-production.up.railway.app'  // Replace with your Railway URL
        : 'http://localhost:3001');

    socketRef.current = io(serverUrl);

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
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
  const createRoom = (nickname: string, settings: Partial<RoomSettings> = {}) => {
    if (socketRef.current) {
      socketRef.current.emit('create-room', { ...settings, nickname });
    }
  };

  const joinRoom = (roomId: string, nickname: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-room', { roomId, nickname });
    }
  };

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room');
      setRoom(null);
      setGameData(null);
      setMessages([]);
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

  const castVote = (targetId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('cast-vote', targetId);
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

  const clearError = () => {
    setError(null);
  };

  return {
    connected,
    room,
    gameData,
    messages,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    updateSettings,
    sendMessage,
    castVote,
    startVoting,
    kickPlayer,
    clearError
  };
};
