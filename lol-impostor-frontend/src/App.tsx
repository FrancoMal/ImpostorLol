import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { GameRoom } from './components/GameRoom';
import { useSocket } from './hooks/useSocket';
import type { RoomSettings } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'room'>('home');
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');
  
  const {
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
  } = useSocket();

  // Update current player ID when connected
  useEffect(() => {
    // In a real implementation, you'd get this from the socket connection
    // For now, we'll use a simple approach
    if (connected && !currentPlayerId) {
      setCurrentPlayerId(Math.random().toString(36).substring(7));
    }
  }, [connected, currentPlayerId]);

  // Switch to room view when room is available
  useEffect(() => {
    if (room) {
      setCurrentView('room');
    } else {
      setCurrentView('home');
    }
  }, [room]);

  const handleCreateRoom = (nickname: string, settings: Partial<RoomSettings>) => {
    createRoom(nickname, settings);
  };

  const handleJoinRoom = (roomId: string, nickname: string) => {
    joinRoom(roomId, nickname);
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setCurrentView('home');
  };

  return (
    <div className="App">
      {/* Error Toast */}
      {error && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className="toast show" role="alert">
            <div className="toast-header bg-danger text-white">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong className="me-auto">Error</strong>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={clearError}
              ></button>
            </div>
            <div className="toast-body">
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {currentView === 'home' && (
        <HomePage
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          connected={connected}
        />
      )}

      {currentView === 'room' && room && (
        <GameRoom
          room={room}
          gameData={gameData}
          messages={messages}
          onLeaveRoom={handleLeaveRoom}
          onStartGame={startGame}
          onUpdateSettings={updateSettings}
          onSendMessage={sendMessage}
          onCastVote={castVote}
          onStartVoting={startVoting}
          onKickPlayer={kickPlayer}
          currentPlayerId={currentPlayerId}
        />
      )}
    </div>
  );
}

export default App;