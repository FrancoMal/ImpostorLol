import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { GameRoom } from './components/GameRoom';
import { useSocket } from './hooks/useSocket';
import { ThemeProvider } from './contexts/ThemeContext';
import type { RoomSettings } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'room'>('home');
  
  const {
    connected,
    room,
    gameData,
    messages,
    error,
    socketId,
    votingCountdown,
    votingReadyToFinalize,
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
  } = useSocket();


  // Switch to room view when room is available
  useEffect(() => {
    if (room) {
      setCurrentView('room');
    } else {
      setCurrentView('home');
    }
  }, [room]);

  const handleCreateRoom = (nickname: string, profileIcon: string, settings: Partial<RoomSettings>) => {
    createRoom(nickname, profileIcon, settings);
  };

  const handleJoinRoom = (roomId: string, nickname: string, profileIcon: string) => {
    joinRoom(roomId, nickname, profileIcon);
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setCurrentView('home');
  };

  return (
    <ThemeProvider>
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
            onSelectVote={selectVote}
            onFinalizeVoting={finalizeVoting}
            onStartVoting={startVoting}
            onKickPlayer={kickPlayer}
            onResetGame={resetGame}
            currentPlayerId={socketId}
            votingCountdown={votingCountdown}
            votingReadyToFinalize={votingReadyToFinalize}
            voteSelectionsCount={voteSelectionsCount}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;