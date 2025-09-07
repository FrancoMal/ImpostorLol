# 🏗️ Architecture Documentation - LoL Impostor

Documentación técnica completa de la arquitectura del sistema.

## 📊 System Overview

```
┌─────────────────────────┐    HTTP/WebSocket    ┌──────────────────────────┐
│    React Frontend       │◄────────────────────►│    Node.js Backend       │
│                         │                      │                          │
│ ┌─────────────────────┐ │                      │ ┌──────────────────────┐ │
│ │   Game Components   │ │                      │ │    Room Manager      │ │
│ │ • HomePage          │ │                      │ │ • Create/Join rooms  │ │
│ │ • GameRoom          │ │                      │ │ • Player management  │ │
│ │ • Chat UI           │ │   Socket.io Events   │ │ • Game state logic   │ │
│ │ • Voting Interface  │ │◄────────────────────►│ │ • Voting system      │ │
│ └─────────────────────┘ │                      │ └──────────────────────┘ │
│                         │                      │                          │
│ ┌─────────────────────┐ │                      │ ┌──────────────────────┐ │
│ │   Custom Hooks      │ │                      │ │   Game Services      │ │
│ │ • useSocket         │ │                      │ │ • Champion Service   │ │
│ │ • Real-time state   │ │                      │ │ • Message handling   │ │
│ └─────────────────────┘ │                      │ │ • Vote processing    │ │
│                         │                      │ └──────────────────────┘ │
└─────────────────────────┘                      └──────────────────────────┘
```

## 🎯 Tech Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 18+ |
| **TypeScript** | Type Safety | 5+ |
| **Vite** | Build Tool | 7+ |
| **Bootstrap** | CSS Framework | 5+ |
| **Socket.io Client** | Real-time Communication | 4+ |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime Environment | 18+ |
| **Express** | HTTP Server | 4+ |
| **Socket.io** | WebSocket Server | 4+ |
| **TypeScript** | Type Safety | 5+ |
| **UUID** | Unique ID Generation | 9+ |

### Data Layer
| Component | Type | Purpose |
|-----------|------|---------|
| **In-Memory Store** | RAM | Game state, rooms, players |
| **JSON Files** | Static | Champion data |
| **Data Dragon API** | External | Champion images |

---

## 🔄 Data Flow Architecture

### 1. Room Creation Flow
```
User Input → Frontend Validation → Socket Emit → Backend RoomManager 
→ Generate Room ID → Store in Memory → Broadcast Room Created → Update UI
```

### 2. Game State Flow
```
Host Start Game → Random Champion Selection → Impostor Assignment 
→ Broadcast Game Started → Individual Player Data → Update UI State
```

### 3. Chat Message Flow
```
User Message → Frontend Validation → Socket Emit → Backend Validation 
→ Store Message → Broadcast to Room → Update Chat UI
```

### 4. Voting Flow
```
Vote Cast → Anonymous Storage → Check All Voted → Process Results 
→ Reveal Votes → Update Game State → Check Win Conditions
```

---

## 💾 Data Models

### Core Entities

#### Room
```typescript
interface Room {
  id: string;                    // 6-character unique ID
  hostId: string;               // Socket ID of host
  settings: RoomSettings;       // Game configuration
  players: Player[];            // Connected players
  gameState: GameState;         // Current game phase
  champion?: string;            // Assigned champion
  messages: Message[];          // Chat history
  votes: Vote[];               // Voting data
  votingRound: number;         // Current voting round
  createdAt: Date;             // Creation timestamp
  lastActivity: Date;          // Last interaction
}
```

#### Player
```typescript
interface Player {
  id: string;                   // Socket ID
  nickname: string;             // Display name
  isHost: boolean;             // Host privileges
  isImpostor: boolean;         // Role assignment
  isConnected: boolean;        // Connection status
  joinedAt: Date;              // Join timestamp
  lastSeen: Date;              // Last activity
}
```

#### Game States
```typescript
type GameState = 
  | 'WAITING'      // Lobby, waiting for players
  | 'STARTING'     // Assigning roles
  | 'DISCUSSION'   // Giving hints phase
  | 'VOTING'       // Voting phase
  | 'REVEAL'       // Showing results
  | 'FINISHED';    // Game over
```

---

## 🔌 Socket.io Events Architecture

### Client → Server Events
```typescript
interface ClientEvents {
  'create-room': (settings: Partial<RoomSettings>) => void;
  'join-room': (data: { roomId: string; nickname: string }) => void;
  'leave-room': () => void;
  'start-game': () => void;
  'send-message': (content: string) => void;
  'cast-vote': (targetId: string) => void;
  'kick-player': (playerId: string) => void;
  'update-settings': (settings: Partial<RoomSettings>) => void;
}
```

### Server → Client Events
```typescript
interface ServerEvents {
  'room-created': (data: { roomId: string; room: Room }) => void;
  'room-joined': (room: Room) => void;
  'room-updated': (room: Room) => void;
  'game-started': (data: { champion: string; isImpostor: boolean }) => void;
  'message-received': (message: Message) => void;
  'voting-results': (result: VotingResult) => void;
  'game-ended': (data: { winner: string; reason: string }) => void;
  'error': (error: string) => void;
}
```

---

## ⚙️ Component Architecture

### Frontend Component Hierarchy
```
App
├── HomePage
│   ├── CreateRoomForm
│   └── JoinRoomForm
└── GameRoom
    ├── Header
    │   ├── RoomInfo
    │   └── HostControls
    ├── PlayerPanel
    │   ├── ChampionDisplay
    │   └── PlayerList
    ├── ChatPanel
    │   ├── MessageList
    │   └── MessageInput
    └── VotingPanel
        └── PlayerVoteButtons
```

### Backend Service Architecture
```
Server (Express + Socket.io)
├── RoomManager
│   ├── createRoom()
│   ├── joinRoom()
│   ├── leaveRoom()
│   └── cleanupRooms()
├── GameLogic
│   ├── startGame()
│   ├── assignRoles()
│   ├── processVotes()
│   └── checkWinConditions()
└── MessageHandler
    ├── validateMessage()
    ├── broadcastMessage()
    └── storeMessage()
```

---

## 🔒 Security Architecture

### Input Validation
- **Client-side**: Form validation, length limits
- **Server-side**: Content sanitization, rate limiting
- **Type safety**: TypeScript interfaces

### Authentication & Authorization
- **No user accounts**: Session-based with socket IDs
- **Host privileges**: Validated by socket ID matching
- **Room access**: 6-character room codes

### Data Protection
- **CORS**: Configured for specific domains
- **No sensitive data**: No passwords or personal info
- **Memory storage**: No persistent data storage

---

## 📈 Performance Architecture

### Frontend Optimization
- **Component memoization**: React.memo for performance
- **Virtual scrolling**: Chat message optimization
- **Image lazy loading**: Champion avatars
- **Bundle splitting**: Vite code splitting

### Backend Optimization
- **In-memory storage**: Fast read/write operations
- **Event batching**: Efficient Socket.io broadcasting
- **Room cleanup**: Automatic inactive room deletion
- **Connection pooling**: Socket connection reuse

### Scalability Considerations
```
Single Instance Limits:
├── Memory: ~1GB (thousands of rooms)
├── Connections: ~10K concurrent sockets
├── Bandwidth: ~100MB/s with full load
└── CPU: ~2 cores for real-time processing

Horizontal Scaling Options:
├── Redis Adapter: Multi-instance Socket.io
├── Load Balancer: Distribute connections
├── Database: Persistent room storage
└── CDN: Static asset delivery
```

---

## 🚀 Deployment Architecture

### Development Environment
```
Local Machine
├── Backend: localhost:3001
├── Frontend: localhost:5173
├── Hot Reload: Enabled
└── CORS: Permissive
```

### Production Environment
```
Railway (Backend)               Vercel (Frontend)
├── Auto-deploy from Git       ├── Auto-deploy from Git
├── Environment variables       ├── CDN distribution
├── HTTPS certificates         ├── HTTPS certificates
├── Custom domains             ├── Custom domains
└── Monitoring & logs          └── Analytics & monitoring
```

### CI/CD Pipeline
```
Git Push → GitHub Actions → Build & Test → Deploy
├── TypeScript compilation
├── Security scanning
├── Performance testing
└── Automated deployment
```

---

## 🔍 Monitoring & Analytics

### Backend Monitoring
- **Railway Dashboard**: CPU, memory, network usage
- **Application logs**: Error tracking, performance metrics
- **Socket.io events**: Connection statistics
- **Room analytics**: Active rooms, player counts

### Frontend Monitoring
- **Vercel Analytics**: Page views, performance metrics
- **Error tracking**: JavaScript errors, API failures
- **User experience**: Core Web Vitals
- **Network performance**: Load times, bundle sizes

---

## 🧪 Testing Strategy

### Unit Testing
- **Backend**: Game logic, room management
- **Frontend**: Components, hooks, utilities
- **Coverage target**: >80% code coverage

### Integration Testing
- **Socket.io events**: Full event flow testing
- **Game scenarios**: Complete game simulation
- **Error handling**: Network failures, edge cases

### Performance Testing
- **Load testing**: Multiple concurrent rooms
- **Stress testing**: Maximum player capacity
- **Memory leaks**: Long-running instance testing

---

## 🔄 State Management

### Frontend State
```typescript
// Global App State
const [currentView, setCurrentView] = useState<'home' | 'room'>('home');
const [currentPlayerId, setCurrentPlayerId] = useState<string>('');

// Socket Hook State
const [connected, setConnected] = useState(false);
const [room, setRoom] = useState<Room | null>(null);
const [gameData, setGameData] = useState<GameData | null>(null);
const [messages, setMessages] = useState<Message[]>([]);
```

### Backend State
```typescript
// In-Memory Room Store
private rooms: Map<string, Room> = new Map();

// Per-Socket State
let currentRoomId: string | null = null;
let playerId: string = socket.id;
```

---

## 🌐 Network Architecture

### Protocol Usage
- **HTTP**: Initial page load, health checks
- **WebSocket**: Real-time game communication
- **HTTPS/WSS**: Production encryption

### Data Serialization
- **JSON**: All message payloads
- **TypeScript**: Compile-time type checking
- **Compression**: Gzip for HTTP responses

### Connection Management
- **Reconnection**: Automatic with exponential backoff
- **Heartbeat**: Socket.io ping/pong mechanism
- **Timeout**: Configurable connection timeouts
- **Cleanup**: Automatic disconnect handling

---

## 📝 Error Handling Architecture

### Error Categories
1. **Network Errors**: Connection failures, timeouts
2. **Validation Errors**: Invalid input, malformed data
3. **Game Logic Errors**: Invalid state transitions
4. **System Errors**: Memory, CPU, storage issues

### Error Recovery
```typescript
// Frontend Error Boundary
const [error, setError] = useState<string | null>(null);
const clearError = () => setError(null);

// Backend Error Handling
socket.on('error', (error: string) => {
  console.error('Socket error:', error);
  // Attempt reconnection or graceful degradation
});
```

---

Esta arquitectura está diseñada para ser **simple, escalable y mantenible**, perfecta para un juego multijugador casual como LoL Impostor. 🎮