import React, { useEffect, useState, useCallback } from 'react';
import { torneoAPI, categoriaAPI, participanteAPI, llaveAPI } from '../services/api-new.js';
import LlaveManager from './LlaveManager.jsx';
import FightScorer from './FightScorer.jsx';
import './TorneoDashboard.css';
import './TorneoDashboard-llaves.css';

export default function TorneoDashboardSimple() {
  // Estados principales
  const [torneos, setTorneos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  
  const [activeTorneo, setActiveTorneo] = useState(null);
  const [activeCategoria, setActiveCategoria] = useState(null);
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isWorking, setIsWorking] = useState(false);
  
  // Estados para controlar secciones expandidas
  const [expandedSections, setExpandedSections] = useState({
    torneos: true,
    categorias: false,
    participantes: false,
    llaves: false
  });
  
  // Estados para el gestor de llaves
  const [showLlaveManager, setShowLlaveManager] = useState(false);
  const [showScorer, setShowScorer] = useState(false);
  
  // Estados para formularios
  const [torneoForm, setTorneoForm] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    ubicacion: ''
  });
  
  const [participanteForm, setParticipanteForm] = useState({
    nombre: '',
    cinturon: 'blanca',
    academia: 'The Badgers',
    peso: ''
  });

  // Funciones de carga
  const loadTorneos = useCallback(async () => {
    try {
      setError(null);
      const data = await torneoAPI.getAll();
      const torneosArray = Array.isArray(data) ? data : [];
      setTorneos(torneosArray);
      
      if (torneosArray.length && !activeTorneo) {
        setActiveTorneo(torneosArray[0]);
      }
    } catch (e) {
      console.error('[TorneoDashboard] Error al cargar torneos:', e);
      setError(e.message);
    }
  }, [activeTorneo]);

  const loadCategorias = useCallback(async (torneoId) => {
    try {
      setError(null);
      const data = await categoriaAPI.getAll(torneoId);
      const categoriasArray = Array.isArray(data) ? data : [];
      setCategorias(categoriasArray);
    } catch (e) {
      console.error('[TorneoDashboard] Error al cargar categorías:', e);
      setError(e.message);
      setCategorias([]);
    }
  }, []);

  const loadParticipantes = useCallback(async (categoriaId) => {
    try {
      setError(null);
      console.log('[TorneoDashboard] Cargando participantes para categoría ID:', categoriaId);
      const data = await participanteAPI.getAll(categoriaId);
      console.log('[TorneoDashboard] Datos recibidos del API:', data);
      const participantesArray = Array.isArray(data) ? data : [];
      setParticipantes(participantesArray);
    } catch (e) {
      console.error('[TorneoDashboard] Error al cargar participantes:', e);
      setError(e.message);
      setParticipantes([]);
    }
  }, []);

  // Efectos
  useEffect(() => {
    loadTorneos();
  }, [loadTorneos]);

  useEffect(() => {
    if (activeTorneo) {
      loadCategorias(activeTorneo.id);
    }
  }, [activeTorneo, loadCategorias]);

  useEffect(() => {
    if (activeCategoria) {
      loadParticipantes(activeCategoria.id);
    }
  }, [activeCategoria, loadParticipantes]);

  // Handlers
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSelectTorneo = async (torneo) => {
    setActiveTorneo(torneo);
    setActiveCategoria(null);
    setParticipantes([]);
  };

  const handleSelectCategoria = async (categoria) => {
    setActiveCategoria(categoria);
    await loadParticipantes(categoria.id);
  };

  const handleCreateTorneo = async (e) => {
    e.preventDefault();
    if (!torneoForm.nombre.trim()) {
      setError('El nombre del torneo es obligatorio');
      return;
    }
    
    try {
      setIsWorking(true);
      setError(null);
      await torneoAPI.create(torneoForm);
      setSuccess('¡Torneo creado exitosamente con todas las categorías!');
      setTorneoForm({
        nombre: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        ubicacion: ''
      });
      await loadTorneos();
    } catch (e) {
      setError(e.message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleCreateParticipante = async (e) => {
    e.preventDefault();
    
    if (!participanteForm.nombre.trim()) {
      setError('El nombre del participante es obligatorio');
      return;
    }
    
    if (!activeTorneo) {
      setError('Debe seleccionar un torneo');
      return;
    }
    
    try {
      setIsWorking(true);
      setError(null);
      
      const participanteData = {
        nombre: participanteForm.nombre.trim(),
        cinturon: participanteForm.cinturon,
        academia: participanteForm.academia.trim() || 'The Badgers',
        torneo: activeTorneo.id
      };
      
      // Agregar peso solo si se proporcionó
      if (participanteForm.peso && !isNaN(parseFloat(participanteForm.peso))) {
        participanteData.peso = parseFloat(participanteForm.peso);
      }
      
      await participanteAPI.create(participanteData);
      setSuccess('¡Participante registrado exitosamente!');
      setParticipanteForm({
        nombre: '',
        cinturon: 'blanca',
        academia: 'The Badgers',
        peso: ''
      });
      
      // Recargar categorías para actualizar conteos
      await loadCategorias(activeTorneo.id);
      
      // Si hay una categoría activa, recargar sus participantes
      if (activeCategoria) {
        await loadParticipantes(activeCategoria.id);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsWorking(false);
    }
  };

  // Renderizado
  const renderTorneoForm = () => (
    <form onSubmit={handleCreateTorneo} className="form-container">
      <div className="form-group">
        <label className="form-label">Nombre del Torneo *</label>
        <input
          type="text"
          className="form-input"
          value={torneoForm.nombre}
          onChange={(e) => setTorneoForm(prev => ({ ...prev, nombre: e.target.value }))}
          placeholder="Copa The Badgers 2024"
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Descripción</label>
        <textarea
          className="form-input"
          value={torneoForm.descripcion}
          onChange={(e) => setTorneoForm(prev => ({ ...prev, descripcion: e.target.value }))}
          placeholder="Descripción del torneo..."
          rows="3"
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Fecha Inicio *</label>
          <input
            type="date"
            className="form-input"
            value={torneoForm.fecha_inicio}
            onChange={(e) => setTorneoForm(prev => ({ ...prev, fecha_inicio: e.target.value }))}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Fecha Fin *</label>
          <input
            type="date"
            className="form-input"
            value={torneoForm.fecha_fin}
            onChange={(e) => setTorneoForm(prev => ({ ...prev, fecha_fin: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">Ubicación</label>
        <input
          type="text"
          className="form-input"
          value={torneoForm.ubicacion}
          onChange={(e) => setTorneoForm(prev => ({ ...prev, ubicacion: e.target.value }))}
          placeholder="The Badgers Academy"
        />
      </div>
      
      <button type="submit" className="form-submit" disabled={isWorking}>
        {isWorking ? 'Creando...' : 'Crear Torneo'}
      </button>
    </form>
  );

  const renderParticipanteForm = () => (
    <form onSubmit={handleCreateParticipante} className="form-container">
      <div className="form-group">
        <label className="form-label">Nombre Completo *</label>
        <input
          type="text"
          className="form-input"
          value={participanteForm.nombre}
          onChange={(e) => setParticipanteForm(prev => ({ ...prev, nombre: e.target.value }))}
          placeholder="Juan Pérez"
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Cinturón *</label>
        <select
          className="form-select"
          value={participanteForm.cinturon}
          onChange={(e) => setParticipanteForm(prev => ({ ...prev, cinturon: e.target.value }))}
          required
        >
          <option value="blanca">Blanca</option>
          <option value="azul">Azul</option>
          <option value="violeta">Violeta</option>
          <option value="marron">Marrón</option>
          <option value="negro">Negro</option>
        </select>
      </div>
      
      <div className="form-group">
        <label className="form-label">Academia *</label>
        <input
          type="text"
          className="form-input"
          value={participanteForm.academia}
          onChange={(e) => setParticipanteForm(prev => ({ ...prev, academia: e.target.value }))}
          placeholder="The Badgers"
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Peso (kg) - Opcional</label>
        <select
          className="form-input form-select"
          value={participanteForm.peso}
          onChange={(e) => setParticipanteForm(prev => ({ ...prev, peso: e.target.value }))}
        >
          <option value="">Seleccionar categoría de peso...</option>
          <optgroup label="Categorías Masculinas">
            <option value="56">Gallo - Hasta 56kg</option>
            <option value="62">Pluma - Hasta 62kg</option>
            <option value="69">Liviano - Hasta 69kg</option>
            <option value="77">Welter - Hasta 77kg</option>
            <option value="85">Medio - Hasta 85kg</option>
            <option value="94">Medio Pesado - Hasta 94kg</option>
            <option value="102">Pesado - Hasta 102kg</option>
            <option value="110">Super Pesado - Más de 102kg</option>
          </optgroup>
          <optgroup label="Categorías Femeninas">
            <option value="48.5">Palha - Hasta 48.5kg</option>
            <option value="53.5">Mosca - Hasta 53.5kg</option>
            <option value="58.5">Gallo - Hasta 58.5kg</option>
            <option value="64">Pluma - Hasta 64kg</option>
            <option value="69.5">Liviano - Hasta 69.5kg</option>
            <option value="75.5">Welter - Hasta 75.5kg</option>
            <option value="82">Medio - Hasta 82kg</option>
            <option value="90">Pesado - Más de 82kg</option>
          </optgroup>
        </select>
        <small className="form-help">
          Selecciona la categoría de peso correspondiente. Se usa para asignar automáticamente a las categorías correctas.
        </small>
      </div>
      
      <button type="submit" className="form-submit" disabled={isWorking || !activeTorneo}>
        {isWorking ? 'Registrando...' : 'Registrar Participante'}
      </button>
      
      {!activeTorneo && (
        <p className="form-warning">Selecciona un torneo primero</p>
      )}
    </form>
  );

  return (
    <div className="torneo-dashboard">
      <div className="dashboard-header">
        <h1>🥋 Sistema de Gestión de Torneos BJJ</h1>
        <p>Gestiona categorías, participantes, llaves y luchas de manera automática y profesional</p>
        {activeTorneo && (
          <div className="torneo-active-info">
            <span className="active-badge">🏆 Torneo Activo</span>
            <span className="torneo-name">{activeTorneo.nombre}</span>
          </div>
        )}
      </div>

      {/* BARRA COMPACTA: SELECCIÓN RÁPIDA */}
      <div className="section" style={{ marginTop: 12 }}>
        <div className="section-content" style={{ paddingTop: 12 }}>
          <div className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="content-column">
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <label className="form-label">Torneo</label>
                  <select
                    className="form-select"
                    value={activeTorneo?.id || ''}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const t = torneos.find(tt => tt.id === id) || null;
                      setActiveTorneo(t);
                      setActiveCategoria(null);
                      if (t) loadCategorias(t.id);
                    }}
                  >
                    <option value="">Seleccionar...</option>
                    {torneos.map(t => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Categoría</label>
                  <select
                    className="form-select"
                    value={activeCategoria?.id || ''}
                    onChange={async (e) => {
                      const id = Number(e.target.value);
                      const c = categorias.find(cc => cc.id === id) || null;
                      setActiveCategoria(c);
                      if (c) await loadParticipantes(c.id);
                    }}
                    disabled={!activeTorneo}
                  >
                    <option value="">Seleccionar...</option>
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                {activeCategoria && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    {!(activeCategoria.llaves_count > 0) && (
                      <button
                        className="btn btn-primary"
                        onClick={async () => {
                          try {
                            setIsWorking(true);
                            await llaveAPI.generar(activeCategoria.id);
                            await loadCategorias(activeTorneo.id);
                            setSuccess('¡Llave generada exitosamente!');
                          } catch (e) {
                            setError(e.message);
                          } finally {
                            setIsWorking(false);
                          }
                        }}
                        disabled={isWorking}
                      >
                        🎯 Generar Llave
                      </button>
                    )}
                    {activeCategoria.llaves_count > 0 && (
                      <>
                        <button className="btn btn-success" onClick={() => setShowLlaveManager(true)}>⚔️ Gestionar Luchas</button>
                        <button className="btn btn-primary" onClick={() => setShowScorer(true)}>▶️ COMENZAR</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS PRINCIPALES */}
      <div className="section" style={{ marginTop: 10 }}>
        <div className="section-content" style={{ paddingTop: 0 }}>
          <div className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="content-column">
              <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e5e7eb' }}>
                <button className={`btn ${expandedSections.torneos ? 'btn-primary' : ''}`} onClick={() => setExpandedSections({ torneos: true, categorias: false, participantes: false, llaves: false })}>🏆 Torneo</button>
                <button className={`btn ${expandedSections.categorias ? 'btn-primary' : ''}`} onClick={() => setExpandedSections({ torneos: false, categorias: true, participantes: false, llaves: false })}>🏷️ Categorías</button>
                <button className={`btn ${expandedSections.participantes ? 'btn-primary' : ''}`} onClick={() => setExpandedSections({ torneos: false, categorias: false, participantes: true, llaves: false })}>👥 Participantes</button>
                <button className={`btn ${expandedSections.llaves ? 'btn-primary' : ''}`} onClick={() => setExpandedSections({ torneos: false, categorias: false, participantes: false, llaves: true })}>🗂️ Llaves / Luchas</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL DE ACCIONES RÁPIDAS (solo en tab Llaves/Luchas) */}
      {activeTorneo && expandedSections.llaves && (
        <div className="quick-actions-panel">
          <h3>⚡ Acciones Rápidas</h3>
          <div className="quick-actions-grid">
            <div className="quick-action-card" onClick={() => toggleSection('participantes')}>
              <div className="action-icon">👥</div>
              <div className="action-text">
                <h4>Registrar Participante</h4>
                <p>Agregar nuevo luchador</p>
              </div>
            </div>
            
            <div className="quick-action-card" onClick={() => toggleSection('categorias')}>
              <div className="action-icon">🏷️</div>
              <div className="action-text">
                <h4>Ver Categorías</h4>
                <p>Explorar {categorias.length} categorías</p>
              </div>
            </div>
            
            {categorias.some(c => (c.participantes_count || 0) >= 2) && (
              <div 
                className="quick-action-card action-highlight"
                onClick={() => {
                  const categoriaConParticipantes = categorias.find(c => (c.participantes_count || 0) >= 2);
                  if (categoriaConParticipantes) {
                    setActiveCategoria(categoriaConParticipantes);
                    setShowLlaveManager(true);
                  }
                }}
              >
                <div className="action-icon">🏆</div>
                <div className="action-text">
                  <h4>Generar Llaves</h4>
                  <p>Crear eliminatorias</p>
                </div>
              </div>
            )}

            {categorias.some(c => (c.llaves_count || 0) > 0) && (
              <div 
                className="quick-action-card action-primary"
                onClick={() => {
                  const categoriaConLlaves = categorias.find(c => (c.llaves_count || 0) > 0);
                  if (categoriaConLlaves) {
                    setActiveCategoria(categoriaConLlaves);
                    setShowLlaveManager(true);
                  }
                }}
              >
                <div className="action-icon">⚔️</div>
                <div className="action-text">
                  <h4>Ver Luchas</h4>
                  <p>Sistema de puntuación</p>
                </div>
              </div>
            )}
            
            <div className="quick-action-card" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
              <div className="action-icon">📊</div>
              <div className="action-text">
                <h4>Ver Estadísticas</h4>
                <p>Resumen del torneo</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LUCHAS ACTIVAS (solo en tab Llaves/Luchas) */}
      {activeTorneo && expandedSections.llaves && categorias.some(c => (c.luchas_pendientes || 0) > 0 || (c.llaves_count || 0) > 0) && (
        <div className="active-fights-panel">
          <h3>⚔️ Luchas Disponibles</h3>
          <p>Haz clic en una categoría para comenzar las luchas</p>
          <div className="active-fights-grid">
            {categorias
              .filter(c => (c.luchas_pendientes || 0) > 0 || (c.llaves_count || 0) > 0)
              .map(categoria => (
                <div 
                  key={categoria.id} 
                  className="fight-category-card"
                  onClick={() => {
                    setActiveCategoria(categoria);
                    setShowScorer(true);
                  }}
                >
                  <div className="fight-icon">🥊</div>
                  <div className="fight-info">
                    <h4>{categoria.nombre}</h4>
                    <p>{categoria.luchas_pendientes || 0} luchas pendientes</p>
                    <div className="fight-status">
                      <span className="participants-count">👥 {categoria.participantes_count} participantes</span>
                    </div>
                  </div>
                  <div className="fight-action">
                    <button 
                      className="btn btn-fight"
                      onClick={(e) => { e.stopPropagation(); setActiveCategoria(categoria); setShowScorer(true); }}
                    >
                      ▶️ COMENZAR
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          ✅ {success}
        </div>
      )}

      {/* SECCIÓN TORNEOS (solo tab Torneos) */}
      {expandedSections.torneos && (
      <div className="section">
        <div className="section-header" onClick={() => toggleSection('torneos')}>
          <h2>🏆 Torneos ({torneos.length})</h2>
          <span className={`expand-icon ${expandedSections.torneos ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>

        {expandedSections.torneos && (
          <div className="section-content">
            <div className="content-grid">
              <div className="content-column">
                <h3>Crear Nuevo Torneo</h3>
                <p className="form-description">
                  Al crear un torneo, se generan automáticamente todas las categorías por cinturón y nivel.
                </p>
                {renderTorneoForm()}
              </div>

              <div className="content-column">
                <h3>Torneos Existentes</h3>
                <div className="items-list">
                  {torneos.map(torneo => (
                    <div
                      key={torneo.id}
                      className={`item-card ${activeTorneo?.id === torneo.id ? 'active' : ''}`}
                      onClick={() => handleSelectTorneo(torneo)}
                    >
                      <h4>{torneo.nombre}</h4>
                      <p>{torneo.fecha_inicio} - {torneo.fecha_fin}</p>
                      <span className={`status status-${torneo.estado}`}>
                        {torneo.estado}
                      </span>
                    </div>
                  ))}
                  {torneos.length === 0 && (
                    <p className="empty-state">No hay torneos creados</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* SECCIÓN CATEGORÍAS (solo tab Categorías) */}
      {activeTorneo && expandedSections.categorias && (
        <div className="section">
          <div className="section-header" onClick={() => toggleSection('categorias')}>
            <h2>🏷️ Categorías de "{activeTorneo.nombre}" ({categorias.length})</h2>
            <span className={`expand-icon ${expandedSections.categorias ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>

          {expandedSections.categorias && (
            <div className="section-content">
              <div className="categories-info">
                <p>🎯 <strong>Categorías automáticas creadas:</strong></p>
                <p>✅ Principiante/Intermedio/Avanzado GI y No GI (hasta 70kg, hasta 80kg, +80kg)</p>
                <p>✅ Por cinturones: Blanca, Azul, Violeta, Marrón, Negro (hasta 70kg, hasta 80kg, +80kg)</p>
              </div>
              
              <div className="categories-grid">
                {categorias.map(categoria => (
                  <div
                    key={categoria.id}
                    className={`category-card ${activeCategoria?.id === categoria.id ? 'active' : ''}`}
                  >
                    <div onClick={() => handleSelectCategoria(categoria)} style={{ cursor: 'pointer' }}>
                      <h4>{categoria.nombre}</h4>
                      <div className="category-info">
                        <span className="participant-count">
                          👥 {categoria.participantes_count || 0} participantes
                        </span>
                        <span className={`category-status status-${categoria.estado}`}>
                          {categoria.estado}
                        </span>
                      </div>
                    </div>
                    
                    {/* Botones de gestión de llave - MEJORADOS */}
                    <div className="category-actions mt-3">
                      <div className="llave-status-info mb-2">
                        {categoria.llaves_count > 0 ? (
                          <div className="llave-status-indicator">
                            <span className="status-badge status-llaves-generadas">
                              🗂️ {categoria.llaves_count} llave(s) generada(s)
                            </span>
                            <span className="status-badge status-luchas">
                              ⚔️ {categoria.luchas_pendientes || 0} luchas pendientes
                            </span>
                          </div>
                        ) : (
                          <span className="status-badge status-sin-llaves">
                            📋 Sin llaves generadas
                          </span>
                        )}
                      </div>
                      
                      <div className="llave-action-buttons">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCategoria(categoria);
                            setShowLlaveManager(true);
                          }}
                          className={`btn ${
                            (categoria.participantes_count || 0) >= 2 ? 
                              categoria.llaves_count > 0 ? 'btn-success btn-prominent-large' : 'btn-primary btn-prominent'
                              : 'btn-disabled'
                          }`}
                          disabled={(categoria.participantes_count || 0) < 2}
                        >
                          {categoria.llaves_count > 0 ? (
                            <>⚔️ GESTIONAR LUCHAS</>
                          ) : (
                            <>🎯 Generar Llave</>
                          )}
                        </button>
                        
                        {(categoria.participantes_count || 0) < 2 ? (
                          <small className="text-warning block mt-1">
                            ⚠️ Mínimo 2 participantes requeridos
                          </small>
                        ) : categoria.llaves_count > 0 ? (
                          <small className="text-success block mt-1">
                            ✅ Listo para gestionar luchas
                          </small>
                        ) : (
                          <small className="text-info block mt-1">
                            🎲 {categoria.participantes_count} participantes listos
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN PARTICIPANTES (solo tab Participantes) */}
      {activeTorneo && expandedSections.participantes && (
        <div className="section">
          <div className="section-header" onClick={() => toggleSection('participantes')}>
            <h2>👥 Participantes</h2>
            <span className={`expand-icon ${expandedSections.participantes ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>

          {expandedSections.participantes && (
            <div className="section-content">
              <div className="content-grid">
                <div className="content-column">
                  <h3>Registrar Participante</h3>
                  <p className="form-description">
                    Solo necesitas nombre, cinturón y academia. La categoría se asigna automáticamente según el peso.
                  </p>
                  {renderParticipanteForm()}
                </div>

                <div className="content-column">
                  <h3>Participantes {activeCategoria ? `en "${activeCategoria.nombre}"` : 'del Torneo'}</h3>
                  <div className="participants-list">
                    {participantes.map(participante => (
                      <div key={participante.id} className="participant-card">
                        <div className="participant-info">
                          <h4>{participante.nombre}</h4>
                          <p>🏛️ {participante.academia}</p>
                          <p>🥋 {participante.cinturon}</p>
                          {participante.peso && <p>⚖️ {participante.peso}kg</p>}
                          {participante.categoria_actual_nombre && (
                            <p>🏷️ {participante.categoria_actual_nombre}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {participantes.length === 0 && (
                      <p className="empty-state">
                        {activeCategoria 
                          ? 'No hay participantes en esta categoría' 
                          : 'Selecciona una categoría para ver sus participantes'
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GESTOR DE LLAVES Y LUCHAS */}
      {showLlaveManager && activeCategoria && (
        <div className="overlay">
          <LlaveManager 
            categoria={activeCategoria}
            onClose={() => setShowLlaveManager(false)}
          />
        </div>
      )}

      {/* MARCADOR (FightScorer) */}
      {showScorer && activeCategoria && (
        <FightScorer categoria={activeCategoria} onClose={() => setShowScorer(false)} />
      )}

      {/* SECCIÓN DE ESTADÍSTICAS (solo tab Torneos) */}
      {activeTorneo && expandedSections.torneos && (
        <div className="stats-section">
          <h3>📊 Estadísticas del Torneo</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <div className="stat-number">{categorias.length}</div>
                <div className="stat-label">Categorías</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-number">
                  {categorias.reduce((sum, c) => sum + (c.participantes_count || 0), 0)}
                </div>
                <div className="stat-label">Participantes</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🗂️</div>
              <div className="stat-content">
                <div className="stat-number">
                  {categorias.reduce((sum, c) => sum + (c.llaves_count || 0), 0)}
                </div>
                <div className="stat-label">Llaves Generadas</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⚔️</div>
              <div className="stat-content">
                <div className="stat-number">
                  {categorias.reduce((sum, c) => sum + (c.luchas_pendientes || 0), 0)}
                </div>
                <div className="stat-label">Luchas Pendientes</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-number">
                  {categorias.filter(c => (c.participantes_count || 0) >= 2).length}
                </div>
                <div className="stat-label">Listas para Luchas</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-number">
                  {Math.round((categorias.filter(c => (c.participantes_count || 0) >= 2).length / Math.max(categorias.length, 1)) * 100)}%
                </div>
                <div className="stat-label">Progreso</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
