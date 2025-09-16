import React, { useEffect, useState, useCallback, useRef } from 'react';
import { categoriaAPI, participanteAPI, llaveAPI } from '../services/api-new.js';
import LlaveManager from './LlaveManager.jsx';
import FightScorer from './FightScorer.jsx';
import BracketView from './BracketView.jsx';
import IndependentFightScorer from './IndependentFightScorer.jsx';
import './TorneoDashboard.css';
import './TorneoDashboard-llaves.css';

export default function TorneoDashboardSimple() {
  // Estados principales
  const [categorias, setCategorias] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  
  const [activeCategoria, setActiveCategoria] = useState(null);
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isWorking, setIsWorking] = useState(false);
  // Estados de carga/errores por sección
  const [isLoadingCategorias, setIsLoadingCategorias] = useState(false);
  const [isLoadingParticipantes, setIsLoadingParticipantes] = useState(false);
  const [errorCategorias, setErrorCategorias] = useState(null);
  const [errorParticipantes, setErrorParticipantes] = useState(null);
  
  // Estados para controlar secciones expandidas
  const [expandedSections, setExpandedSections] = useState({
    categorias: true,
    participantes: false,
    llaves: false,
    independent: false
  });
  
  // Estados para el gestor de llaves
  const [showLlaveManager, setShowLlaveManager] = useState(false);
  const [showScorer, setShowScorer] = useState(false);
  const [showIndependentScorer, setShowIndependentScorer] = useState(false);
  // Estado para modal de edición de participante
  const [showParticipanteModal, setShowParticipanteModal] = useState(false);
  const [participanteEdit, setParticipanteEdit] = useState(null);
  const [participanteEditForm, setParticipanteEditForm] = useState({
    nombre: '',
    academia: 'The Badgers',
    cinturon: 'blanca',
    peso: '',
    categoria_asignada: ''
  });
  const lastActionRef = useRef(null);
  
  // Estados para formularios
  const [participanteForm, setParticipanteForm] = useState({
    nombre: '',
    cinturon: 'blanca',
    academia: 'The Badgers',
    peso: ''
  });



  const loadCategorias = useCallback(async () => {
    try {
      setError(null);
      setErrorCategorias(null);
      setIsLoadingCategorias(true);
      const data = await categoriaAPI.getAll();
      const categoriasArray = Array.isArray(data) ? data : [];
      setCategorias(categoriasArray);
    } catch (e) {
      console.error('[TorneoDashboard] Error al cargar categorías:', e);
      setError(e.message);
      setErrorCategorias(e.message);
      setCategorias([]);
    } finally {
      setIsLoadingCategorias(false);
    }
  }, []);

  const loadParticipantes = useCallback(async (categoriaId) => {
    try {
      setError(null);
      setErrorParticipantes(null);
      setIsLoadingParticipantes(true);
      console.log('[TorneoDashboard] Cargando participantes para categoría ID:', categoriaId);
      const data = await participanteAPI.getAll(categoriaId);
      console.log('[TorneoDashboard] Datos recibidos del API:', data);
      const participantesArray = Array.isArray(data) ? data : [];
      setParticipantes(participantesArray);
    } catch (e) {
      console.error('[TorneoDashboard] Error al cargar participantes:', e);
      setError(e.message);
      setErrorParticipantes(e.message);
      setParticipantes([]);
    } finally {
      setIsLoadingParticipantes(false);
    }
  }, []);



  // Efectos
  // Cargar datos al montar el componente
  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  useEffect(() => {
    if (expandedSections.participantes && activeCategoria) {
      loadParticipantes(activeCategoria.id);
    }
  }, [expandedSections.participantes, activeCategoria, loadParticipantes]);

  // Handlers
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };



  const handleSelectCategoria = async (categoria) => {
    setActiveCategoria(categoria);
    await loadParticipantes(categoria.id);
  };

  // Abrir modal de edición de participante
  const openParticipanteModal = (p) => {
    setParticipanteEdit(p);
    setParticipanteEditForm({
      nombre: p?.nombre || '',
      academia: p?.academia || 'The Badgers',
      cinturon: p?.cinturon || 'blanca',
      peso: typeof p?.peso === 'number' ? String(p.peso) : (p?.peso || ''),
      categoria_asignada: p?.categoria_asignada || ''
    });
    setShowParticipanteModal(true);
  };

  const closeParticipanteModal = () => {
    setShowParticipanteModal(false);
    setParticipanteEdit(null);
  };

  const handleSaveParticipante = async (e) => {
    e?.preventDefault?.();
    if (!participanteEdit) return;
    try {
      setIsWorking(true);
      const payload = {
        nombre: (participanteEditForm.nombre || '').trim(),
        academia: (participanteEditForm.academia || '').trim() || 'The Badgers',
        cinturon: (participanteEditForm.cinturon || 'blanca').trim(),
      };
      if (participanteEditForm.peso !== '' && !isNaN(parseFloat(participanteEditForm.peso))) {
        payload.peso = parseFloat(participanteEditForm.peso);
      }
      if (participanteEditForm.categoria_asignada) {
        payload.categoria_asignada = participanteEditForm.categoria_asignada;
      } else {
        payload.categoria_asignada = null;
      }
      await participanteAPI.update(participanteEdit.id, payload);
      if (activeCategoria) {
        await loadParticipantes(activeCategoria.id);
      }
      setSuccess('Participante actualizado');
      closeParticipanteModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsWorking(false);
    }
  };

  // Cargar participantes al abrir detalle de categoría en pestaña Llaves
  useEffect(() => {
    if (expandedSections.llaves && activeCategoria) {
      loadParticipantes(activeCategoria.id);
    }
  }, [expandedSections.llaves, activeCategoria, loadParticipantes]);





  const handleCreateParticipante = async (e) => {
    e.preventDefault();
    
    if (!participanteForm.nombre.trim()) {
      setError('El nombre del participante es obligatorio');
      return;
    }
    
    try {
      setIsWorking(true);
      setError(null);
      
      const participanteData = {
        nombre: participanteForm.nombre.trim(),
        cinturon: participanteForm.cinturon,
        academia: participanteForm.academia.trim() || 'The Badgers'
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
      await loadCategorias();
      
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
            <option value="56">Hasta 57kg</option>
            <option value="62">Hasta 64kg</option>
            <option value="69">Hasta 76kg</option>
            <option value="77">Hasta 82kg</option>
            <option value="85">Hasta 88kg</option>
            <option value="94">Hasta 93kg</option>
          </optgroup>
        </select>
        <small className="form-help">
          Selecciona la categoría de peso correspondiente. Se usa para asignar automáticamente a las categorías correctas.
        </small>
      </div>
      
      <button type="submit" className="form-submit" disabled={isWorking}>
        {isWorking ? 'Registrando...' : 'Registrar Participante'}
      </button>
    </form>
  );

  return (
    <div className="torneo-dashboard">
      <div className="dashboard-header">
        <h1>🥋 Sistema de Gestión BJJ</h1>
        <p>Gestiona categorías, participantes, llaves y luchas de manera automática y profesional</p>
      </div>

      {/* BARRA COMPACTA OCULTA por requerimiento */}

      {/* TABS PRINCIPALES */}
      <div className="section" style={{ marginTop: 10 }}>
        <div className="section-content" style={{ paddingTop: 0 }}>
          <div className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="content-column">
              <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e5e7eb' }}>
                <button className={`btn ${expandedSections.categorias ? 'btn-primary' : ''}`} onClick={() => setExpandedSections({ categorias: true, participantes: false, llaves: false, independent: false })}>🏷️ Categorías</button>
                <button className={`btn ${expandedSections.participantes ? 'btn-primary' : ''}`} onClick={() => setExpandedSections({ categorias: false, participantes: true, llaves: false, independent: false })}>👥 Participantes</button>
                <button className={`btn ${expandedSections.llaves ? 'btn-primary' : ''}`} onClick={() => setExpandedSections({ categorias: false, participantes: false, llaves: true, independent: false })}>🗂️ Llaves / Luchas</button>
                <button className={`btn ${expandedSections.independent ? 'btn-primary' : ''}`} onClick={() => setExpandedSections({ categorias: false, participantes: false, llaves: false, independent: true })}>🥊 Lucha Independiente</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas ocultas en tab Llaves/Luchas según pedido */}

      {/* BRACKET en la pestaña Llaves/Luchas */}
      {expandedSections.llaves && (
        <div className="section">
          <div className="section-content">
            {activeCategoria ? (
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <h3>🗂️ {activeCategoria.nombre}</h3>
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="btn" onClick={()=>setActiveCategoria(null)}>Volver</button>
                    <button
                      className="btn btn-primary"
                      disabled={isWorking || (participantes.length < 2)}
                      onClick={async ()=>{
                        try {
                          setIsWorking(true);
                          await llaveAPI.generar(activeCategoria.id);
                          await loadCategorias();
                          setSuccess('Llave generada aleatoriamente');
                          setShowLlaveManager(true);
                        } catch (e) {
                          setError(e.message);
                        } finally {
                          setIsWorking(false);
                        }
                      }}
                    >
                      🎲 Armar llaves random
                    </button>
                  </div>
                </div>

                <div className="participants-list">
                  {isLoadingParticipantes ? (
                    <div className="empty-state" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span>Cargando participantes...</span>
                    </div>
                  ) : errorParticipantes ? (
                    <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>❌ {errorParticipantes}</div>
                      {activeCategoria && (
                        <button className="btn" onClick={() => loadParticipantes(activeCategoria.id)}>Reintentar</button>
                      )}
                    </div>
                  ) : (
                    <>
                      {participantes.map(p => (
                        <div key={p.id} className="participant-card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div className="participant-info">
                            <h4>{p.nombre}</h4>
                            <p>🏛️ {p.academia} • 🥋 {p.cinturon}{p.peso?` • ⚖️ ${p.peso}kg`:''}</p>
                          </div>
                          <div className="torneo-actions" style={{ display:'flex', gap:8 }}>
                            <button className="btn btn-action" onClick={() => openParticipanteModal(p)}>Editar</button>
                            <button className="btn btn-action btn-eliminar" onClick={async (e)=>{
                              e.preventDefault();
                              if (!confirm('¿Eliminar participante?')) return;
                              const doDel = async () => {
                                try {
                                  setIsWorking(true);
                                  const ok = await participanteAPI.delete(p.id);
                                  if (!ok) throw new Error('No se pudo eliminar');
                                  await loadParticipantes(activeCategoria.id);
                                  setSuccess('Participante eliminado');
                                  lastActionRef.current = null;
                                } catch (err) {
                                  setError(err.message);
                                  lastActionRef.current = doDel;
                                } finally {
                                  setIsWorking(false);
                                }
                              };
                              await doDel();
                            }}>Eliminar</button>
                          </div>
                        </div>
                      ))}
                      {participantes.length === 0 && (
                        <p className="empty-state">No hay participantes asignados a esta categoría</p>
                      )}
                    </>
                  )}
                </div>

                {(activeCategoria.llaves_count || 0) > 0 && (
                  <div style={{ marginTop:16 }}>
                    <BracketView categoria={activeCategoria} onManage={() => setShowLlaveManager(true)} />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="active-fights-grid">
                  {categorias.filter(c=> (c.participantes_count || 0) > 0).map(categoria => (
                    <div 
                      key={categoria.id} 
                      className="fight-category-card"
                      onClick={() => setActiveCategoria(categoria)}
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
                        <button className="btn btn-fight" onClick={(e) => { e.stopPropagation(); setActiveCategoria(categoria); }}>
                          {(categoria.llaves_count || 0) > 0 ? 'Ver Llave' : 'Seleccionar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {categorias.filter(c=> (c.participantes_count || 0) > 0).length === 0 && (
                  <p className="empty-state">No hay categorías con participantes aún</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span>❌ {error}</span>
          {lastActionRef.current && (
            <button className="btn" onClick={() => { const fn = lastActionRef.current; fn && fn(); }}>Reintentar</button>
          )}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          ✅ {success}
        </div>
      )}



      {/* SECCIÓN CATEGORÍAS */}
      {expandedSections.categorias && (
        <div className="section">
          <div className="section-header" onClick={() => toggleSection('categorias')}>
            <h2>🏷️ Categorías ({categorias.length})</h2>
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
                {isLoadingCategorias ? (
                  <div className="empty-state" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span>Cargando categorías...</span>
                  </div>
                ) : errorCategorias ? (
                  <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>❌ {errorCategorias}</div>
                    <button className="btn" onClick={() => loadCategorias()}>Reintentar</button>
                  </div>
                ) : categorias.map(categoria => (
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
      {expandedSections.participantes && (
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
                  <h3>Participantes del Torneo</h3>
                  <div className="participants-list">
                    {isLoadingParticipantes ? (
                      <div className="empty-state" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span>Cargando participantes...</span>
                      </div>
                    ) : errorParticipantes ? (
                      <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span>❌ {errorParticipantes}</span>
                        <button className="btn" onClick={() => loadParticipantes()}>Reintentar</button>
                      </div>
                    ) : (
                      <>
                        {participantes.map(p => (
                          <div key={p.id} className="participant-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => openParticipanteModal(p)}>
                            <div className="participant-info">
                              <h4>{p.nombre}</h4>
                              <p>🏛️ {p.academia} • 🥋 {p.cinturon}{p.peso ? ` • ⚖️ ${p.peso}kg` : ''}</p>
                            </div>
                            <div className="torneo-actions" style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-action" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openParticipanteModal(p); }}>Editar</button>
                              <button className="btn btn-action btn-eliminar" onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!confirm('¿Eliminar participante?')) return;
                                try {
                                  setIsWorking(true);
                                  const ok = await participanteAPI.delete(p.id);
                                  if (!ok) throw new Error('No se pudo eliminar');
                                  await loadParticipantes();
                                  setSuccess('Participante eliminado');
                                } catch (err) {
                                  setError(err.message);
                                } finally {
                                  setIsWorking(false);
                                }
                              }}>Eliminar</button>
                            </div>
                          </div>
                        ))}
                        {participantes.length === 0 && (
                          <p className="empty-state">
                            No hay participantes registrados
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN LUCHA INDEPENDIENTE (solo tab Lucha Independiente) */}
      {expandedSections.independent && (
        <div className="section">
          <div className="section-header" onClick={() => toggleSection('independent')}>
            <h2>🥊 Lucha Independiente</h2>
            <span className={`expand-icon ${expandedSections.independent ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>

          {expandedSections.independent && (
            <div className="section-content">
              <div className="content-grid">
                <div className="content-column">
                  <h3>Marcador Independiente</h3>
                  <p className="form-description">
                    Usa el marcador de forma independiente, sin estar vinculado a ningún torneo. 
                    Perfecto para luchas de entrenamiento, exhibiciones o eventos informales.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-blue-800 mb-2">✨ Características:</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Ingresa manualmente los nombres de los luchadores</li>
                      <li>• Selecciona la duración de la lucha (3, 5, 7, 10 o 15 minutos)</li>
                      <li>• Marcador completo con todos los puntos del BJJ</li>
                      <li>• Cronómetro en tiempo real</li>
                      <li>• Los resultados no se guardan en la base de datos</li>
                    </ul>
                  </div>

                  <button 
                    className="btn btn-primary btn-prominent-large"
                    onClick={() => setShowIndependentScorer(true)}
                    style={{ fontSize: '1.1rem', padding: '12px 24px' }}
                  >
                    🥊 Iniciar Lucha Independiente
                  </button>
                </div>

                <div className="content-column">
                  <h3>Información del Marcador</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">📊 Sistema de Puntos BJJ:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Montada:</span>
                        <span className="text-green-600 font-bold">+4 puntos</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Guardia pasada:</span>
                        <span className="text-green-600 font-bold">+3 puntos</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Rodillazo:</span>
                        <span className="text-green-600 font-bold">+2 puntos</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Derribo:</span>
                        <span className="text-green-600 font-bold">+2 puntos</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Ventaja:</span>
                        <span className="text-yellow-600 font-bold">+1 punto</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Penalización:</span>
                        <span className="text-red-600 font-bold">-1 punto</span>
                      </div>
                    </div>
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

      {/* FIGHTSCORER INDEPENDIENTE */}
      {showIndependentScorer && (
        <IndependentFightScorer onClose={() => setShowIndependentScorer(false)} />
      )}

      {/* MODAL EDICIÓN PARTICIPANTE */}
      {showParticipanteModal && participanteEdit && (
        <div className="overlay" onClick={closeParticipanteModal}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              padding: 20,
              maxWidth: 420,
              width: '90%',
              margin: '60px auto',
              borderRadius: 12,
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}
          >
            <h3 style={{ marginTop: 0 }}>Editar Participante</h3>
            <form onSubmit={handleSaveParticipante} className="form-container">
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-input"
                  value={participanteEditForm.nombre}
                  onChange={(e) => setParticipanteEditForm(prev => ({ ...prev, nombre: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Academia</label>
                <input
                  type="text"
                  className="form-input"
                  value={participanteEditForm.academia}
                  onChange={(e) => setParticipanteEditForm(prev => ({ ...prev, academia: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cinturón</label>
                <select
                  className="form-select"
                  value={participanteEditForm.cinturon}
                  onChange={(e) => setParticipanteEditForm(prev => ({ ...prev, cinturon: e.target.value }))}
                >
                  <option value="blanca">Blanca</option>
                  <option value="azul">Azul</option>
                  <option value="violeta">Violeta</option>
                  <option value="marron">Marrón</option>
                  <option value="negro">Negro</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Categoría asignada</label>
                <select
                  className="form-select"
                  value={participanteEditForm.categoria_asignada || ''}
                  onChange={(e)=> setParticipanteEditForm(prev => ({ ...prev, categoria_asignada: e.target.value ? Number(e.target.value) : '' }))}
                >
                  <option value="">Sin asignar</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={participanteEditForm.peso}
                  onChange={(e) => setParticipanteEditForm(prev => ({ ...prev, peso: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={closeParticipanteModal} disabled={isWorking}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={isWorking}>{isWorking ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Estadísticas ocultas según pedido */}
    </div>
  );
}
