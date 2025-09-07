import { useState, useEffect, useRef } from 'react';
import type { Room, GameData, Message } from '../types';
import { getChampionImageUrl, FALLBACK_CHAMPION_IMAGE } from '../utils/champions';
import { getProfileIconUrl } from '../utils/profileIcons';

interface GameRoomProps {
  room: Room;
  gameData: GameData | null;
  messages: Message[];
  onLeaveRoom: () => void;
  onStartGame: () => void;
  onUpdateSettings: (settings: any) => void;
  onSendMessage: (message: string) => void;
  onCastVote: (targetId: string) => void;
  onStartVoting: () => void;
  onKickPlayer: (playerId: string) => void;
  currentPlayerId: string;
}

export const GameRoom = ({ 
  room, 
  gameData, 
  messages, 
  onLeaveRoom, 
  onStartGame, 
  onUpdateSettings,
  onSendMessage,
  onCastVote,
  onStartVoting,
  onKickPlayer,
  currentPlayerId
}: GameRoomProps) => {
  const [message, setMessage] = useState('');
  const [selectedVote, setSelectedVote] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(room.settings);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentPlayer = room.players.find(p => p.id === currentPlayerId);
  const isHost = currentPlayer?.isHost || false;
  const connectedPlayers = room.players.filter(p => p.isConnected);
  const activePlayers = connectedPlayers.filter(p => !p.isEliminated);
  const isSpectator = currentPlayer?.isEliminated || false;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleVote = (targetId: string) => {
    setSelectedVote(targetId);
    onCastVote(targetId);
  };

  const handleUpdateSettings = () => {
    onUpdateSettings(settings);
    setShowSettings(false);
  };

  const getGameStateText = () => {
    switch (room.gameState) {
      case 'WAITING': return 'Esperando jugadores...';
      case 'STARTING': return 'Iniciando partida...';
      case 'DISCUSSION': return 'Tiempo de discusión';
      case 'VOTING': return 'Votación en curso';
      case 'REVEAL': return 'Revelando resultados';
      case 'FINISHED': return 'Partida terminada';
      default: return room.gameState;
    }
  };

  const canStartGame = isHost && room.gameState === 'WAITING' && activePlayers.length >= 3;
  const canVote = room.gameState === 'VOTING' && gameData && !isSpectator;
  const canStartVoting = isHost && room.gameState === 'DISCUSSION';
  const canChat = room.gameState === 'DISCUSSION' && !isSpectator;

  return (
    <div className="container-fluid min-vh-100 bg-dark text-light">
      {/* Header */}
      <div className="row border-bottom border-secondary py-3">
        <div className="col-md-6">
          <h4 className="mb-0">
            <i className="bi bi-door-open me-2"></i>
            Sala: <span className="text-warning">{room.id}</span>
          </h4>
          <small className="text-muted">{getGameStateText()}</small>
        </div>
        <div className="col-md-6 text-end">
          {/* Debug Info - Remove in production */}
          <small className="text-muted me-3">
            Debug: PlayerId={currentPlayerId?.substring(0,8)}... | GameState={room.gameState} | Messages={messages.length}
          </small>
          <div className="btn-group">
            <button 
              className="btn btn-outline-info btn-sm"
              onClick={() => navigator.clipboard.writeText(room.id)}
            >
              <i className="bi bi-clipboard"></i> Copiar ID
            </button>
            {isHost && (
              <button 
                className="btn btn-outline-warning btn-sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <i className="bi bi-gear"></i> Settings
              </button>
            )}
            <button className="btn btn-outline-danger btn-sm" onClick={onLeaveRoom}>
              <i className="bi bi-box-arrow-left"></i> Salir
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="row mt-3">
          <div className="col-12">
            <div className="card bg-secondary">
              <div className="card-body">
                <h6>Configuración de Sala</h6>
                <div className="row">
                  <div className="col-md-3">
                    <label className="form-label">Max Jugadores</label>
                    <select 
                      className="form-select form-select-sm"
                      value={settings.maxPlayers}
                      onChange={(e) => setSettings(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
                      disabled={room.gameState !== 'WAITING'}
                    >
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                      <option value={6}>6</option>
                      <option value={7}>7</option>
                      <option value={8}>8</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Impostores</label>
                    <select 
                      className="form-select form-select-sm"
                      value={settings.impostorCount}
                      onChange={(e) => setSettings(prev => ({ ...prev, impostorCount: parseInt(e.target.value) }))}
                      disabled={room.gameState !== 'WAITING'}
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Tiempo Discusión (min)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={settings.discussionTime || ''}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        discussionTime: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                      placeholder="Sin límite"
                      min={1}
                      max={30}
                    />
                  </div>
                  <div className="col-md-3 d-flex align-items-end">
                    <button className="btn btn-primary btn-sm" onClick={handleUpdateSettings}>
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row mt-3">
        {/* Left Panel - Players & Champion Info */}
        <div className="col-md-4">
          {/* Spectator Mode Alert */}
          {isSpectator && (
            <div className="alert alert-info mb-3">
              <h6 className="alert-heading">
                <i className="bi bi-eye"></i> Modo Espectador
              </h6>
              <p className="mb-0">Has sido eliminado. Puedes seguir viendo el juego pero no puedes participar.</p>
            </div>
          )}

          {/* Champion Info */}
          {gameData && !isSpectator && (
            <div className="card bg-secondary mb-3">
              <div className="card-body text-center">
                {gameData.isImpostor ? (
                  <div>
                    <h5 className="text-danger">
                      <i className="bi bi-exclamation-triangle"></i> ERES EL IMPOSTOR
                    </h5>
                    <p className="text-muted">¡Oculta tu identidad!</p>
                  </div>
                ) : (
                  <div>
                    <img 
                      src={getChampionImageUrl(gameData.champion)}
                      alt={gameData.champion}
                      className="img-fluid rounded mb-2"
                      style={{ maxWidth: '80px' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_CHAMPION_IMAGE;
                      }}
                    />
                    <h6 className="text-success">{gameData.champion}</h6>
                    <small className="text-muted">Da pistas sobre este campeón</small>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Players List */}
          <div className="card bg-secondary">
            <div className="card-header">
              <h6 className="mb-0">
                Jugadores ({connectedPlayers.length}/{room.settings.maxPlayers})
              </h6>
            </div>
            <div className="card-body">
              {connectedPlayers.map(player => (
                <div key={player.id} className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <img 
                      src={getProfileIconUrl(player.profileIcon || '0.png')}
                      alt={`${player.nickname} icon`}
                      className="rounded-circle me-2"
                      style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                    />
                    <div>
                      <span className={`badge me-2 ${player.id === currentPlayerId ? 'bg-primary' : 'bg-secondary'}`}>
                        {player.nickname}
                      </span>
                      {player.isHost && <i className="bi bi-star-fill text-warning"></i>}
                      {player.isEliminated && (
                        <span className="badge bg-danger ms-1">
                          <i className="bi bi-eye"></i> Espectador
                        </span>
                      )}
                    </div>
                  </div>
                  {isHost && player.id !== currentPlayerId && !player.isEliminated && (
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => onKickPlayer(player.id)}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Game Controls */}
          {room.gameState === 'WAITING' && canStartGame && (
            <div className="d-grid mt-3">
              <button className="btn btn-success" onClick={onStartGame}>
                <i className="bi bi-play-fill"></i> Iniciar Partida
              </button>
            </div>
          )}

          {canStartVoting && (
            <div className="d-grid mt-3">
              <button className="btn btn-warning" onClick={onStartVoting}>
                <i className="bi bi-hand-index"></i> Iniciar Votación
              </button>
            </div>
          )}
        </div>

        {/* Center Panel - Chat */}
        <div className="col-md-5">
          <div className="card bg-secondary h-100">
            <div className="card-header">
              <h6 className="mb-0">Chat</h6>
            </div>
            <div className="card-body p-0 d-flex flex-column" style={{ height: '400px' }}>
              <div className="flex-grow-1 overflow-auto p-3">
                {messages.length === 0 ? (
                  <div className="text-muted text-center p-3">
                    {room.gameState === 'DISCUSSION' 
                      ? '¡Empieza a dar pistas sobre tu campeón!' 
                      : 'Los mensajes aparecerán aquí durante la discusión'
                    }
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className="mb-2">
                      <strong className={msg.type === 'system' ? 'text-info' : 'text-warning'}>
                        {msg.playerNickname}{msg.type === 'chat' ? ':' : ''}
                      </strong>
                      <span className="ms-2">{msg.content}</span>
                      <small className="text-muted ms-2">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </small>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {canChat && (
                <form onSubmit={handleSendMessage} className="p-3 border-top">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Escribe una pista..."
                      maxLength={200}
                    />
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-send"></i>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Voting */}
        <div className="col-md-3">
          {canVote && (
            <div className="card bg-secondary">
              <div className="card-header">
                <h6 className="mb-0">Votar para Expulsar</h6>
              </div>
              <div className="card-body">
                {activePlayers.map(player => (
                  <button
                    key={player.id}
                    className={`btn w-100 mb-2 ${
                      selectedVote === player.id 
                        ? 'btn-danger' 
                        : 'btn-outline-danger'
                    }`}
                    onClick={() => handleVote(player.id)}
                    disabled={selectedVote !== '' || player.id === currentPlayerId}
                  >
                    <div className="d-flex align-items-center justify-content-center">
                      <img 
                        src={getProfileIconUrl(player.profileIcon || '0.png')}
                        alt={`${player.nickname} icon`}
                        className="rounded-circle me-2"
                        style={{ width: '24px', height: '24px', objectFit: 'cover' }}
                      />
                      {player.nickname}
                      {player.isHost && <i className="bi bi-star-fill ms-2"></i>}
                      {player.id === currentPlayerId && <span className="ms-2 text-muted">(Tú)</span>}
                    </div>
                  </button>
                ))}
                
                {selectedVote && (
                  <div className="alert alert-info mt-3">
                    <small>Votaste por expulsar a: <strong>{activePlayers.find(p => p.id === selectedVote)?.nickname}</strong></small>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="container-fluid border-top border-secondary mt-4 py-3">
        <div className="row text-center">
          <div className="col-md-6 text-md-start mb-2 mb-md-0">
            <small className="text-muted">
              <i className="bi bi-tag"></i> LoL Impostor v1.0
            </small>
          </div>
          <div className="col-md-6 text-md-end">
            <small className="text-muted">
              by{' '}
              <a 
                href="https://github.com/FrancoMal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-decoration-none text-warning"
              >
                <i className="bi bi-github"></i> FrancoMal
              </a>
            </small>
          </div>
        </div>
      </footer>
    </div>
  );
};