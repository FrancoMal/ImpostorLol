import { useState } from 'react';
import type { RoomSettings } from '../types';

interface HomePageProps {
  onCreateRoom: (nickname: string, settings: Partial<RoomSettings>) => void;
  onJoinRoom: (roomId: string, nickname: string) => void;
  connected: boolean;
}

export const HomePage = ({ onCreateRoom, onJoinRoom, connected }: HomePageProps) => {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');
  const [settings, setSettings] = useState<Partial<RoomSettings>>({
    maxPlayers: 6,
    impostorCount: 1,
    allowReconnect: true,
    revealVotesImmediately: true
  });

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onCreateRoom(nickname.trim(), settings);
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim() && roomId.trim()) {
      onJoinRoom(roomId.trim().toUpperCase(), nickname.trim());
    }
  };

  if (!connected) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Connecting to server...</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-dark">
      <div className="row w-100">
        <div className="col-md-8 col-lg-6 col-xl-4 mx-auto">
          <div className="text-center mb-5">
            <h1 className="display-4 text-warning mb-3">
              <i className="bi bi-lightning-fill"></i> LoL Impostor
            </h1>
            <p className="lead text-light">
              ¿Puedes descubrir al impostor antes de que te descubran?
            </p>
          </div>

          <div className="card bg-secondary">
            <div className="card-body">
              {!showCreateRoom && !showJoinRoom && (
                <div className="d-grid gap-3">
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={() => setShowCreateRoom(true)}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Crear Sala
                  </button>
                  <button 
                    className="btn btn-success btn-lg"
                    onClick={() => setShowJoinRoom(true)}
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Unirse a Sala
                  </button>
                </div>
              )}

              {showCreateRoom && (
                <form onSubmit={handleCreateRoom}>
                  <h5 className="text-light mb-3">Crear Nueva Sala</h5>
                  
                  <div className="mb-3">
                    <label className="form-label text-light">Tu Nickname</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Ingresa tu nombre"
                      maxLength={20}
                      required
                    />
                  </div>

                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label text-light">Max Jugadores</label>
                      <select 
                        className="form-select"
                        value={settings.maxPlayers}
                        onChange={(e) => setSettings(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
                      >
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={6}>6</option>
                        <option value={7}>7</option>
                        <option value={8}>8</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label text-light">Impostores</label>
                      <select 
                        className="form-select"
                        value={settings.impostorCount}
                        onChange={(e) => setSettings(prev => ({ ...prev, impostorCount: parseInt(e.target.value) }))}
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                      </select>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary">
                      Crear Sala
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowCreateRoom(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {showJoinRoom && (
                <form onSubmit={handleJoinRoom}>
                  <h5 className="text-light mb-3">Unirse a Sala</h5>
                  
                  <div className="mb-3">
                    <label className="form-label text-light">Código de Sala</label>
                    <input 
                      type="text"
                      className="form-control text-uppercase"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                      placeholder="Ej: ABC123"
                      maxLength={6}
                      pattern="[A-Z0-9]{6}"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-light">Tu Nickname</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Ingresa tu nombre"
                      maxLength={20}
                      required
                    />
                  </div>

                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-success">
                      Unirse
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowJoinRoom(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="text-center mt-4">
            <small className="text-muted">
              Juego inspirado en Among Us con campeones de League of Legends
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};