import { useState } from 'react';
import type { RoomSettings } from '../types';
import { PROFILE_ICONS, getProfileIconUrl, getRandomProfileIcon } from '../utils/profileIcons';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

interface HomePageProps {
  onCreateRoom: (nickname: string, profileIcon: string, settings: Partial<RoomSettings>) => void;
  onJoinRoom: (roomId: string, nickname: string, profileIcon: string) => void;
  connected: boolean;
}

export const HomePage = ({ onCreateRoom, onJoinRoom, connected }: HomePageProps) => {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(getRandomProfileIcon());
  const [showIconSelector, setShowIconSelector] = useState(false);
  const { isLight } = useTheme();
  const [settings, setSettings] = useState<Partial<RoomSettings>>({
    maxPlayers: 6,
    impostorCount: 1,
    allowReconnect: true,
    revealVotesImmediately: true
  });

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onCreateRoom(nickname.trim(), selectedIcon, settings);
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim() && roomId.trim()) {
      onJoinRoom(roomId.trim().toUpperCase(), nickname.trim(), selectedIcon);
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
    <div className={`container-fluid min-vh-100 d-flex align-items-center justify-content-center ${isLight ? 'bg-light text-dark' : 'bg-dark text-light'}`}>
      <div className="row w-100">
        <div className="col-md-10 col-lg-8 col-xl-6 mx-auto">
          {/* Theme Toggle */}
          <div className="d-flex justify-content-end mb-3">
            <ThemeToggle />
          </div>
          <div className="text-center mb-4">
            <h1 className="display-4 text-warning mb-3">
              <i className="bi bi-lightning-fill"></i> LoL Impostor
            </h1>
            <div className={`card ${isLight ? 'bg-white border' : 'bg-secondary'} mb-4`}>
              <div className="card-body">
                <h5 className="text-warning mb-3">
                  <i className="bi bi-info-circle"></i> Cómo Jugar
                </h5>
                <div className="text-start">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <h6 className={isLight ? 'text-dark' : 'text-light'}>📋 Objetivo</h6>
                      <p className={`${isLight ? 'text-dark' : 'text-light'} small mb-3`}>
                        <strong className="text-success">Inocentes:</strong> Identifica y vota para expulsar a todos los impostores<br/>
                        <strong className="text-danger">Impostores:</strong> Permanece oculto y evita ser descubierto
                      </p>

                      <h6 className={isLight ? 'text-dark' : 'text-light'}>🎯 Mecánica</h6>
                      <div className={`${isLight ? 'text-dark' : 'text-light'} small`}>
                        <p className="mb-1">• Cada inocente recibe un <strong>campeón secreto</strong> de League of Legends</p>
                        <p className="mb-1">• Los impostores <strong>no saben qué campeón tienen</strong></p>
                        <p className="mb-1">• Durante la discusión, da <strong>pistas sobre tu campeón</strong></p>
                        <p className="mb-0">• Vota para expulsar a quien creas que es impostor</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6 className={isLight ? 'text-dark' : 'text-light'}>🏆 Victoria</h6>
                      <p className={`${isLight ? 'text-dark' : 'text-light'} small mb-3`}>
                        <strong className="text-success">Inocentes ganan:</strong> Eliminan a todos los impostores<br/>
                        <strong className="text-danger">Impostores ganan:</strong> Igualan o superan en número a los inocentes
                      </p>

                      <h6 className={isLight ? 'text-dark' : 'text-light'}>⚡ Consejos</h6>
                      <div className={`${isLight ? 'text-dark' : 'text-light'} small`}>
                        <p className="mb-1">• Da pistas <strong>específicas</strong> pero no obvias sobre tu campeón</p>
                        <p className="mb-1">• Observa quién da pistas <strong>vagas o incorrectas</strong></p>
                        <p className="mb-0">• Los eliminados se convierten en <strong>espectadores</strong></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`card ${isLight ? 'bg-white border' : 'bg-secondary'}`}>
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

                  <div className="mb-3">
                    <label className="form-label text-light">Imagen de Perfil</label>
                    <div className="d-flex align-items-center">
                      <img 
                        src={getProfileIconUrl(selectedIcon)}
                        alt="Profile"
                        className="rounded-circle me-3"
                        style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                      />
                      <button 
                        type="button"
                        className="btn btn-outline-light btn-sm"
                        onClick={() => setShowIconSelector(!showIconSelector)}
                      >
                        <i className="bi bi-image"></i> Cambiar
                      </button>
                    </div>
                    
                    {showIconSelector && (
                      <div className="mt-3">
                        <div className="row g-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {PROFILE_ICONS.map((icon) => (
                            <div key={icon} className="col-3 col-sm-2">
                              <img
                                src={getProfileIconUrl(icon)}
                                alt={`Icon ${icon}`}
                                className={`img-fluid rounded-circle border cursor-pointer ${selectedIcon === icon ? 'border-primary border-3' : 'border-secondary'}`}
                                style={{ width: '48px', height: '48px', objectFit: 'cover', cursor: 'pointer' }}
                                onClick={() => {
                                  setSelectedIcon(icon);
                                  setShowIconSelector(false);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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

                  <div className="mb-3">
                    <label className="form-label text-light">Imagen de Perfil</label>
                    <div className="d-flex align-items-center">
                      <img 
                        src={getProfileIconUrl(selectedIcon)}
                        alt="Profile"
                        className="rounded-circle me-3"
                        style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                      />
                      <button 
                        type="button"
                        className="btn btn-outline-light btn-sm"
                        onClick={() => setShowIconSelector(!showIconSelector)}
                      >
                        <i className="bi bi-image"></i> Cambiar
                      </button>
                    </div>
                    
                    {showIconSelector && (
                      <div className="mt-3">
                        <div className="row g-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {PROFILE_ICONS.map((icon) => (
                            <div key={icon} className="col-3 col-sm-2">
                              <img
                                src={getProfileIconUrl(icon)}
                                alt={`Icon ${icon}`}
                                className={`img-fluid rounded-circle border cursor-pointer ${selectedIcon === icon ? 'border-primary border-3' : 'border-secondary'}`}
                                style={{ width: '48px', height: '48px', objectFit: 'cover', cursor: 'pointer' }}
                                onClick={() => {
                                  setSelectedIcon(icon);
                                  setShowIconSelector(false);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
            <small className={`${isLight ? 'text-muted' : 'text-light opacity-75'}`}>
              <i className="bi bi-controller"></i> ¡Buena suerte detective!
            </small>
          </div>

          {/* Footer */}
          <footer className={`text-center mt-4 py-3 border-top ${isLight ? 'border-secondary' : 'border-secondary'}`}>
            <div className="row">
              <div className="col-md-6 text-md-start text-center mb-2 mb-md-0">
                <small className={`${isLight ? 'text-muted' : 'text-light opacity-75'}`}>
                  <i className="bi bi-tag"></i> Versión 1.2
                </small>
              </div>
              <div className="col-md-6 text-md-end text-center">
                <small className={`${isLight ? 'text-muted' : 'text-light opacity-75'}`}>
                  Desarrollado por{' '}
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
      </div>
    </div>
  );
};