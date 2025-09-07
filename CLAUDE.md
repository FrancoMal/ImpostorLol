# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LoL Impostor is a real-time multiplayer impostor game inspired by Among Us but using League of Legends champions. Players give hints about their assigned champion to identify and vote out the impostor who doesn't know the champion.

## Development Commands

### Quick Start
```bash
# Install all dependencies
npm run install:all

# Run both servers concurrently
npm run dev

# Build everything for production
npm run build

# Test production builds locally
npm run prod:test

# Check if build is ready for deployment
npm run deploy:check
```

### Backend Only
```bash
cd lol-impostor-backend
npm run dev          # Development server (port 3001)
npm run build        # TypeScript compilation
npm start            # Production server
```

### Frontend Only
```bash
cd lol-impostor-frontend
npm run dev          # Development server (port 5173)
npm run build        # Vite build for production
npm run preview      # Preview production build
```

## Architecture Overview

### Core System Design
- **Monorepo Structure**: Separate backend and frontend in sibling directories
- **Real-time Communication**: Socket.io for bidirectional client-server events
- **In-memory State**: No database - all game state stored in memory via RoomManager
- **Stateless Sessions**: Players identified by socket IDs, no persistent accounts

### Backend Architecture (`lol-impostor-backend/`)
- **server.ts**: Main Express + Socket.io server with event handlers
- **RoomManager.ts**: Core game logic class managing rooms, players, votes, and state transitions
- **types.ts**: Shared TypeScript interfaces for game entities (Room, Player, Vote, etc.)
- **champions.ts**: Static champion data and utilities for random selection

### Frontend Architecture (`lol-impostor-frontend/`)
- **useSocket.ts**: Custom hook managing Socket.io connection and real-time state
- **App.tsx**: Main app component handling view routing (home/room)
- **HomePage.tsx**: Room creation/joining interface
- **GameRoom.tsx**: Main game interface with chat, voting, and player management

### Game State Flow
1. **Room Creation**: Host creates room with 6-character ID, configures settings
2. **Player Join**: Players join via room code, stored as connected players
3. **Game Start**: Random champion assigned to non-impostors, impostors get no champion
4. **Discussion Phase**: Players chat to give hints about their champion
5. **Voting Phase**: Anonymous voting to eliminate suspected impostors
6. **Result Processing**: Vote counting, tie handling, win condition checking

### Key Data Models
- **Room**: Contains players, settings, game state, messages, votes
- **Player**: Socket ID, nickname, role flags (host/impostor), connection status
- **GameState**: Enum progression: WAITING → STARTING → DISCUSSION → VOTING → REVEAL → FINISHED
- **Vote**: Anonymous vote storage with round tracking for tie resolution

### Socket.io Event System
Real-time bidirectional events handle all game interactions:
- Room management: create-room, join-room, leave-room
- Game control: start-game, update-settings, kick-player
- Communication: send-message, message-received
- Voting: cast-vote, voting-started, voting-results

### Environment Configuration
- **Development**: Backend on :3001, frontend on :5173, permissive CORS
- **Production**: Environment variables control CORS origins and API URLs
- **VITE_API_URL**: Frontend environment variable for backend connection
- **CORS_ORIGINS**: Backend environment variable for allowed origins

### Deployment Architecture
- **Backend**: Railway with NODE_ENV=production and CORS_ORIGINS configured
- **Frontend**: Vercel with VITE_API_URL pointing to Railway backend
- **Build Process**: TypeScript compilation for backend, Vite build for frontend

### Champion Integration
- **Static Data**: 169 champions from champions.json
- **Image Loading**: Data Dragon API URLs with fallback for failed loads
- **Random Selection**: Single champion assigned to all non-impostors per game

### Error Handling Patterns
- Socket connection failures trigger automatic reconnection
- CORS issues resolved via environment variable configuration
- Room cleanup happens automatically for inactive rooms
- Player disconnection allows reconnection if enabled in room settings