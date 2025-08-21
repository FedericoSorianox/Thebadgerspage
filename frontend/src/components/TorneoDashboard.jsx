import React, { useEffect, useState, useCallback, useRef } from 'react';
import { torneoAPI, categoriaAPI, participanteAPI, llaveAPI, luchaAPI } from '../services/api-new.js';
import './TorneoDashboard.css';

export default function TorneoDashboard() {
  // Estados principales
  const [torneos, setTorneos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [llaves, setLlaves] = useState([]);
  
  const [activeTorneo, setActiveTorneo] = useState(null);
  const [activeCategoria, setActiveCategoria] = useState(null);
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isWorking, setIsWorking] = useState(false);
  // Carga por sección
  const [isLoadingTorneos, setIsLoadingTorneos] = useState(false);
  const [isLoadingCategorias, setIsLoadingCategorias] = useState(false);
  const [isLoadingParticipantes, setIsLoadingParticipantes] = useState(false);
  const [isLoadingLlaves, setIsLoadingLlaves] = useState(false);
  // Errores por sección
  const [errorTorneos, setErrorTorneos] = useState(null);
  const [errorCategorias, setErrorCategorias] = useState(null);
  const [errorParticipantes, setErrorParticipantes] = useState(null);
  const [errorLlaves, setErrorLlaves] = useState(null);
  // Última acción para reintentar
  const lastActionRef = useRef(null);
  
  // Estados para controlar secciones expandidas
  const [expandedSections, setExpandedSections] = useState({
    torneos: true,
    categorias: false,
    participantes: false,
    llaves: false
  });
  
  // Estados para formularios
  const [torneoForm, setTorneoForm] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    ubicacion: ''
  });
  
  const [categoriaForm, setCategoriaForm] = useState({
    nombre: '',
    cinturon: '',
    peso_maximo: ''
  });
  
  const [participanteForm, setParticipanteForm] = useState({
    nombre: '',
    apellido: '',
    peso: '',
    edad: '',
    cinturon: 'blanca',
    genero: 'masculino',
    academia: 'The Badgers',
    categoria: ''
  });

  // Funciones de carga con useCallback para evitar warnings
  const loadTorneos = useCallback(async () => {
    try {
      setError(null);
      setErrorTorneos(null);
      setIsLoadingTorneos(true);
      const data = await torneoAPI.getAll();
      const torneosArray = Array.isArray(data) ? data : [];
      setTorneos(torneosArray);
      
      if (torneosArray.length && !activeTorneo) {
        setActiveTorneo(torneosArray[0]);
      }
    } catch (e) {
      console.error('[TorneoDashboard] Error al cargar torneos:', e);
      setError(e.message);
      setErrorTorneos(e.message);
    } finally {
      setIsLoadingTorneos(false);
    }
  }, [activeTorneo]);

  const loadCategorias = useCallback(async (torneoId) => {
    try {
      setError(null);
      setErrorCategorias(null);
      setIsLoadingCategorias(true);
      const data = await categoriaAPI.getAll(torneoId);
      const categoriasArray = Array.isArray(data) ? data : [];
      setCategorias(categoriasArray);
    } catch (e) {
      console.error('[TorneoDashboard] Error al cargar categorías:', e);
      setError(e.message);
      setErrorCategorias(e.message);
      setCategorias([]); // Asegurar que siempre sea un array
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
      console.log('[TorneoDashboard] Tipo de datos:', typeof data);
      console.log('[TorneoDashboard] Es array?:', Array.isArray(data));
      if (Array.isArray(data)) {
        console.log('[TorneoDashboard] Número de participantes:', data.length);
        console.log('[TorneoDashboard] Primer participante:', data[0]);
      }
      const participantesArray = Array.isArray(data) ? data : [];
      setParticipantes(participantesArray);
      console.log('[TorneoDashboard] Participantes establecidos en estado:', participantesArray.length);
    } catch (e) {
      console.error('[TorneoDashboard] Error al cargar participantes:', e);
      setError(e.message);
      setErrorParticipantes(e.message);
      setParticipantes([]); // Asegurar que siempre sea un array
    } finally {
      setIsLoadingParticipantes(false);
    }
  }, []);

  const loadLlaves = useCallback(async (categoriaId) => {
    try {
      setError(null);
      setErrorLlaves(null);
      setIsLoadingLlaves(true);
      const data = await llaveAPI.getAll(categoriaId);
      const llavesArray = Array.isArray(data) ? data : [];
      setLlaves(llavesArray);
    } catch (e) {
      console.error('[TorneoDashboard] Error al cargar llaves:', e);
      setError(e.message);
      setErrorLlaves(e.message);
      setLlaves([]); // Asegurar que siempre sea un array
    } finally {
      setIsLoadingLlaves(false);
    }
  }, []);

  useEffect(() => {
    loadTorneos();
  }, [loadTorneos]);

  useEffect(() => {
    if (activeTorneo) {
      loadCategorias(activeTorneo.id);
    }
  }, [activeTorneo, loadCategorias]);

  // Handlers de selección
  const handleSelectTorneo = async (t) => {
    setActiveTorneo(t);
    setActiveCategoria(null);
    clearMessages();
  };

  const handleSelectCategoria = async (categoria) => {
    setActiveCategoria(categoria);
    setParticipanteForm(prev => ({ ...prev, categoria: categoria.id }));
    await loadParticipantes(categoria.id);
    await loadLlaves(categoria.id);
    clearMessages();
  };

  // Funciones de creación
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
      setSuccess('¡Torneo creado exitosamente!');
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

  const handleCreateCategoria = async (e) => {
    e.preventDefault();
    if (!categoriaForm.nombre.trim()) {
      setError('El nombre de la categoría es obligatorio');
      return;
    }
    
    try {
      setIsWorking(true);
      setError(null);
      // Crear objeto con solo los campos necesarios
      const categoriaData = {
        nombre: categoriaForm.nombre.trim(),
        torneo: activeTorneo.id
      };
      
      // Agregar campos opcionales solo si tienen valor
      if (categoriaForm.cinturon && categoriaForm.cinturon.trim()) {
        categoriaData.cinturon = categoriaForm.cinturon;
      }
      if (categoriaForm.peso_maximo && !isNaN(parseFloat(categoriaForm.peso_maximo))) {
        categoriaData.peso_maximo = parseFloat(categoriaForm.peso_maximo);
      }
      
      await categoriaAPI.create(categoriaData);
      setSuccess('¡Categoría creada exitosamente!');
      setCategoriaForm({
        nombre: '',
        cinturon: '',
        peso_maximo: ''
      });
      if (activeTorneo) await loadCategorias(activeTorneo.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleCreateParticipante = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!participanteForm.nombre.trim() || !participanteForm.apellido.trim()) {
      setError('Nombre y apellido son obligatorios');
      return;
    }
    
    if (!participanteForm.categoria) {
      setError('Debe seleccionar una categoría');
      return;
    }
    
    if (!participanteForm.peso || isNaN(parseFloat(participanteForm.peso))) {
      setError('El peso debe ser un número válido');
      return;
    }
    
    if (!participanteForm.edad || isNaN(parseInt(participanteForm.edad))) {
      setError('La edad debe ser un número válido');
      return;
    }
    
    try {
      setIsWorking(true);
      setError(null);
      
      // Calcular fecha de nacimiento a partir de la edad
      const today = new Date();
      const edad = parseInt(participanteForm.edad);
      const fechaNacimiento = new Date(today.getFullYear() - edad, today.getMonth(), today.getDate());
      
      const participanteData = {
        nombre: participanteForm.nombre.trim(),
        apellido: participanteForm.apellido.trim(),
        peso: parseFloat(participanteForm.peso),
        fecha_nacimiento: fechaNacimiento.toISOString().split('T')[0],
        cinturon: participanteForm.cinturon || 'blanca',
        genero: participanteForm.genero || 'masculino',
        academia: participanteForm.academia.trim() || 'The Badgers',
        categoria: parseInt(participanteForm.categoria),
        activo: true  // Asegurar que el participante esté activo
      };
      
      console.log('Enviando participante:', participanteData);
      
      await participanteAPI.create(participanteData);
      setSuccess('¡Participante registrado exitosamente!');
      
      // Resetear formulario
      setParticipanteForm({
        nombre: '',
        apellido: '',
        peso: '',
        edad: '',
        cinturon: 'blanca',
        genero: 'masculino',
        academia: 'The Badgers',
        categoria: activeCategoria?.id || ''
      });
      
      if (activeCategoria) await loadParticipantes(activeCategoria.id);
    } catch (e) {
      console.error('Error creando participante:', e);
      setError(`Error al crear participante: ${e.message}`);
    } finally {
      setIsWorking(false);
    }
  };

  // Funciones de eliminación
  const handleDeleteTorneo = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este torneo? Esta acción no se puede deshacer.')) return;
    try {
      setIsWorking(true);
      const ok = await torneoAPI.delete(id);
      if (!ok) throw new Error('No se pudo eliminar el torneo');
      setSuccess('Torneo eliminado exitosamente');
      await loadTorneos();
    } catch (e) {
      setError(e.message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleDeleteCategoria = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      setIsWorking(true);
      const ok = await categoriaAPI.delete(id);
      if (!ok) throw new Error('No se pudo eliminar la categoría');
      setSuccess('Categoría eliminada exitosamente');
      if (activeTorneo) await loadCategorias(activeTorneo.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleDeleteParticipante = async (id) => {
    if (!confirm('¿Eliminar este participante?')) return;
    try {
      setIsWorking(true);
      const ok = await participanteAPI.delete(id);
      if (!ok) throw new Error('No se pudo eliminar el participante');
      setSuccess('Participante eliminado exitosamente');
      if (activeCategoria) await loadParticipantes(activeCategoria.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsWorking(false);
    }
  };

  // Otras funciones
  const handleCerrarInscripciones = async (id) => {
    if (!confirm('¿Cerrar inscripciones de esta categoría?')) return;
    try {
      setIsWorking(true);
      await categoriaAPI.cerrarInscripciones(id);
      setSuccess('Inscripciones cerradas exitosamente');
      if (activeTorneo) await loadCategorias(activeTorneo.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsWorking(false);
    }
  };


  const generateLlaves = async (categoriaId) => {
    if (!confirm('¿Generar las llaves para esta categoría? Esto organizará automáticamente los enfrentamientos.')) return;
    try {
      setIsWorking(true);
      setError(null);
      
      // Obtener participantes de la categoría
      const participantesCategoria = participantes.filter(p => p.categoria === categoriaId);
      
      if (participantesCategoria.length < 2) {
        setError('Se necesitan al menos 2 participantes para generar llaves');
        return;
      }
      
      // Generar estructura de llave (eliminación simple)
      const estructura = generateBracketStructure(participantesCategoria);
      
      // Crear la llave en el backend
      const llaveData = {
        categoria: categoriaId,
        estructura: estructura
      };
      
      await llaveAPI.create(llaveData);
      setSuccess('¡Llaves generadas exitosamente!');
      await loadLlaves(categoriaId);
      
    } catch (e) {
      setError(e.message);
    } finally {
      setIsWorking(false);
    }
  };

  const generateBracketStructure = (participantes) => {
    // Mezclar participantes aleatoriamente
    const shuffled = [...participantes].sort(() => Math.random() - 0.5);
    
    // Crear primera ronda
    const firstRound = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      const lucha = {
        participante1: shuffled[i],
        participante2: shuffled[i + 1] || null, // null = BYE
        ronda: 'Primera',
        estado: 'pendiente',
        ganador: shuffled[i + 1] ? null : shuffled[i] // Si hay BYE, ganador automático
      };
      firstRound.push(lucha);
    }
    
    return {
      rondas: [firstRound],
      participantes: shuffled,
      estado: 'generada'
    };
  };


  const iniciarLucha = async (lucha) => {
    try {
      setIsWorking(true);
      setError(null);
      
      // Crear la lucha en el backend
      const luchaData = {
        categoria: activeCategoria.id,
        participante1: lucha.participante1.id,
        participante2: lucha.participante2?.id,
        ronda: lucha.ronda,
        estado: 'en_progreso',
        duracion_segundos: 300, // 5 minutos por defecto
        tiempo_transcurrido: 0
      };
      
      await luchaAPI.create(luchaData);
      setSuccess('¡Lucha iniciada!');
      
      // Recargar llaves para actualizar estado
      await loadLlaves(activeCategoria.id);
      
    } catch (e) {
      setError(e.message);
    } finally {
      setIsWorking(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Componentes de renderizado
  const renderSectionHeader = (title, section, icon) => (
    <div className="section-header" onClick={() => toggleSection(section)}>
      <h3>{icon} {title}</h3>
      <span className={`section-toggle ${expandedSections[section] ? 'open' : ''}`}>▼</span>
    </div>
  );

  const renderTorneoForm = () => (
    <form onSubmit={handleCreateTorneo} className="form-container">
      <div className="form-group">
        <label className="form-label">Nombre *</label>
        <input
          type="text"
          className="form-input"
          value={torneoForm.nombre}
          onChange={(e) => setTorneoForm(prev => ({ ...prev, nombre: e.target.value }))}
          placeholder="Torneo BJJ 2025"
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Ubicación</label>
        <input
          type="text"
          className="form-input"
          value={torneoForm.ubicacion}
          onChange={(e) => setTorneoForm(prev => ({ ...prev, ubicacion: e.target.value }))}
          placeholder="Gimnasio The Badgers"
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Fecha Inicio</label>
        <input
          type="date"
          className="form-input"
          value={torneoForm.fecha_inicio}
          onChange={(e) => setTorneoForm(prev => ({ ...prev, fecha_inicio: e.target.value }))}
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Fecha Fin</label>
        <input
          type="date"
          className="form-input"
          value={torneoForm.fecha_fin}
          onChange={(e) => setTorneoForm(prev => ({ ...prev, fecha_fin: e.target.value }))}
        />
      </div>
      
      <div className="form-group full-width">
        <label className="form-label">Descripción</label>
        <textarea
          className="form-input"
          value={torneoForm.descripcion}
          onChange={(e) => setTorneoForm(prev => ({ ...prev, descripcion: e.target.value }))}
          placeholder="Descripción del torneo..."
          rows="3"
        />
      </div>
      
      <div className="form-group">
        <button type="submit" disabled={isWorking} className="btn-primary">
          {isWorking ? '⏳ Creando...' : '✨ Crear Torneo'}
        </button>
      </div>
    </form>
  );

  const renderCategoriaForm = () => (
    <form onSubmit={handleCreateCategoria} className="form-container">
      <div className="form-group">
        <label className="form-label">Nombre *</label>
        <input
          type="text"
          className="form-input"
          value={categoriaForm.nombre}
          onChange={(e) => setCategoriaForm(prev => ({ ...prev, nombre: e.target.value }))}
          placeholder="Adulto Azul"
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Cinturón</label>
        <select
          className="form-select"
          value={categoriaForm.cinturon}
          onChange={(e) => setCategoriaForm(prev => ({ ...prev, cinturon: e.target.value }))}
        >
          <option value="">Seleccionar cinturón (opcional)</option>
          <option value="blanca">Blanca</option>
          <option value="azul">Azul</option>
          <option value="purpura">Púrpura</option>
          <option value="marron">Marrón</option>
          <option value="negra">Negra</option>
        </select>
      </div>
      
      <div className="form-group">
        <label className="form-label">Peso Máximo (kg)</label>
        <input
          type="number"
          className="form-input"
          value={categoriaForm.peso_maximo}
          onChange={(e) => setCategoriaForm(prev => ({ ...prev, peso_maximo: e.target.value }))}
          placeholder="80"
          min="0"
          step="0.1"
        />
      </div>
      
      <div className="form-group">
        <button type="submit" disabled={isWorking} className="btn-primary">
          {isWorking ? '⏳ Creando...' : '🏷️ Crear Categoría'}
        </button>
      </div>
    </form>
  );

  const renderParticipanteForm = () => (
    <form onSubmit={handleCreateParticipante} className="form-container">
      <div className="form-group">
        <label className="form-label">Nombre *</label>
        <input
          type="text"
          className="form-input"
          value={participanteForm.nombre}
          onChange={(e) => setParticipanteForm(prev => ({ ...prev, nombre: e.target.value }))}
          placeholder="Juan"
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Apellido *</label>
        <input
          type="text"
          className="form-input"
          value={participanteForm.apellido}
          onChange={(e) => setParticipanteForm(prev => ({ ...prev, apellido: e.target.value }))}
          placeholder="Pérez"
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Peso (kg)</label>
        <input
          type="number"
          className="form-input"
          value={participanteForm.peso}
          onChange={(e) => setParticipanteForm(prev => ({ ...prev, peso: e.target.value }))}
          placeholder="75.5"
          min="0"
          step="0.1"
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Edad</label>
        <input
          type="number"
          className="form-input"
          value={participanteForm.edad}
          onChange={(e) => setParticipanteForm(prev => ({ ...prev, edad: e.target.value }))}
          placeholder="25"
          min="1"
          max="100"
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Cinturón</label>
        <select
          className="form-select"
          value={participanteForm.cinturon}
          onChange={(e) => setParticipanteForm(prev => ({ ...prev, cinturon: e.target.value }))}
        >
          <option value="blanca">Blanca</option>
          <option value="azul">Azul</option>
          <option value="purpura">Púrpura</option>
          <option value="marron">Marrón</option>
          <option value="negra">Negra</option>
        </select>
      </div>
      
      <div className="form-group">
        <label className="form-label">Academia</label>
        <input
          type="text"
          className="form-input"
          value={participanteForm.academia}
          onChange={(e) => setParticipanteForm(prev => ({ ...prev, academia: e.target.value }))}
          placeholder="The Badgers"
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Género</label>
        <select
          className="form-select"
          value={participanteForm.genero}
          onChange={(e) => setParticipanteForm(prev => ({ ...prev, genero: e.target.value }))}
        >
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
        </select>
      </div>
      
      <div className="form-group">
        <label className="form-label">Categoría</label>
        <select
          className="form-select"
          value={participanteForm.categoria}
          onChange={(e) => setParticipanteForm(prev => ({ ...prev, categoria: e.target.value }))}
          disabled={!!activeCategoria}
        >
          <option value="">Seleccionar categoría</option>
          {Array.isArray(categorias) && categorias.map(c => (
            <option key={c.id} value={c.id}>
              {c.nombre} - {c.cinturon} {c.peso_maximo && `(hasta ${c.peso_maximo}kg)`}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <button type="submit" disabled={isWorking} className="btn-primary">
          {isWorking ? '⏳ Registrando...' : '👤 Registrar Participante'}
        </button>
      </div>
    </form>
  );

  // Render principal
  try {
    return (
      <div className="torneo-container">
        {/* Header */}
        <div className="torneo-header">
          <h1 className="torneo-title">Sistema de Gestión de Torneos BJJ</h1>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {lastActionRef.current && (
                <button onClick={() => { const fn = lastActionRef.current; fn && fn(); }} className="btn-action">Reintentar</button>
              )}
              <button onClick={() => { setError(null); lastActionRef.current = null; }} className="btn-close">×</button>
            </div>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            <strong>Éxito:</strong> {success}
            <button onClick={() => setSuccess(null)} className="btn-close">×</button>
          </div>
        )}

      {/* Sección Torneos */}
      <div className="management-section">
        {renderSectionHeader('Gestión de Torneos', 'torneos', '🏆')}
        {expandedSections.torneos && (
          <div className="section-content">
            {renderTorneoForm()}
            
            <div className="torneo-list">
              <h4>Torneos Existentes ({torneos.length})</h4>
              {isLoadingTorneos ? (
                <div className="empty-state" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span>Cargando torneos...</span>
                </div>
              ) : errorTorneos ? (
                <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong>Error:</strong> {errorTorneos}
                  </div>
                  <button className="btn-action" onClick={() => loadTorneos()}>Reintentar</button>
                </div>
              ) : torneos.length === 0 ? (
                <div className="empty-state">
                  <p>No hay torneos creados aún</p>
                </div>
              ) : (
                Array.isArray(torneos) && torneos.map(t => (
                  <div key={t.id} className={`torneo-item ${activeTorneo?.id === t.id ? 'active' : ''}`}>
                    <div
                      className={`torneo-name ${activeTorneo?.id === t.id ? 'active' : ''}`}
                      onClick={() => handleSelectTorneo(t)}
                    >
                      {t.nombre} {t.estado ? `(${t.estado})` : ''}
                    </div>
                    <div className="torneo-actions">
                      {t.estado !== 'activo' && (
                        <button
                          disabled={isWorking}
                          onClick={async ()=>{ 
                            const doActivate = async () => { 
                              try{ 
                                setIsWorking(true); 
                                await torneoAPI.activar(t.id); 
                                await loadTorneos(); 
                                setSuccess('Torneo activado exitosamente');
                                lastActionRef.current = null;
                              } catch(e){ 
                                setError(e.message);
                                lastActionRef.current = doActivate;
                              } finally{ 
                                setIsWorking(false);
                              } 
                            };
                            await doActivate();
                          }}
                          className="btn-action btn-activar"
                        >
                          {isWorking ? '⏳' : 'Activar'}
                        </button>
                      )}
                      {t.estado !== 'finalizado' && (
                        <button
                          disabled={isWorking}
                          onClick={async ()=>{ 
                            if(!confirm('¿Finalizar este torneo?')) return; 
                            const doFinalize = async () => {
                              try{ 
                                setIsWorking(true); 
                                await torneoAPI.finalizar(t.id); 
                                await loadTorneos(); 
                                setSuccess('Torneo finalizado exitosamente');
                                lastActionRef.current = null;
                              } catch(e){ 
                                setError(e.message);
                                lastActionRef.current = doFinalize;
                              } finally{ 
                                setIsWorking(false);
                              } 
                            };
                            await doFinalize();
                          }}
                          className="btn-action btn-finalizar"
                        >
                          {isWorking ? '⏳' : 'Finalizar'}
                        </button>
                      )}
                      <button
                        disabled={isWorking}
                        onClick={async () => {
                          const doDelete = async () => {
                            try {
                              await handleDeleteTorneo(t.id);
                              lastActionRef.current = null;
                            } catch (e) {
                              // handleDeleteTorneo ya setea error; solo guardamos retry
                            } finally {
                              lastActionRef.current = doDelete;
                            }
                          };
                          await doDelete();
                        }}
                        className="btn-action btn-eliminar"
                      >
                        {isWorking ? '⏳' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sección Categorías */}
      {activeTorneo && (
        <div className="management-section">
          {renderSectionHeader(`Categorías de "${activeTorneo.nombre}"`, 'categorias', '🏷️')}
          {expandedSections.categorias && (
            <div className="section-content">
              {renderCategoriaForm()}
              
              <div className="categoria-list">
                <h4>Categorías Existentes ({categorias.length})</h4>
                {isLoadingCategorias ? (
                  <div className="empty-state" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span>Cargando categorías...</span>
                  </div>
                ) : errorCategorias ? (
                  <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong>Error:</strong> {errorCategorias}
                    </div>
                    {activeTorneo && (
                      <button className="btn-action" onClick={() => loadCategorias(activeTorneo.id)}>Reintentar</button>
                    )}
                  </div>
                ) : categorias.length === 0 ? (
                  <div className="empty-state">
                    <p>No hay categorías creadas para este torneo</p>
                  </div>
                ) : (
                  Array.isArray(categorias) && categorias.map(c => (
                    <div key={c.id} className="categoria-card">
                      <div className="categoria-info">
                        <div 
                          className="categoria-details"
                          onClick={() => handleSelectCategoria(c)}
                          style={{cursor: 'pointer'}}
                        >
                          <span className="categoria-belt">{c.nombre}</span>
                          <div className="categoria-weight">
                            {c.cinturon} {c.peso_maximo && `— hasta ${c.peso_maximo} kg`}
                          </div>
                        </div>
                        <div className={`categoria-status ${c.estado === 'abierta' ? 'inscripciones-abiertas' : 'inscripciones-cerradas'}`}>
                          {c.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                        </div>
                        <div className="torneo-actions">
                          <button
                            disabled={isWorking}
                            onClick={async () => {
                              const doDeleteCat = async () => {
                                try {
                                  await handleDeleteCategoria(c.id);
                                  lastActionRef.current = null;
                                } catch (e) {
                                  // handleDeleteCategoria ya setea error
                                } finally {
                                  lastActionRef.current = doDeleteCat;
                                }
                              };
                              await doDeleteCat();
                            }}
                            className="btn-action btn-eliminar"
                          >
                            {isWorking ? '⏳' : 'Eliminar'}
                          </button>
                          {c.estado === 'abierta' && (
                            <button
                              disabled={isWorking}
                              onClick={async () => {
                                const doClose = async () => {
                                  try {
                                    await handleCerrarInscripciones(c.id);
                                    lastActionRef.current = null;
                                  } catch (e) {
                                  } finally {
                                    lastActionRef.current = doClose;
                                  }
                                };
                                await doClose();
                              }}
                              className="btn-action btn-cerrar"
                            >
                              {isWorking ? '⏳' : 'Cerrar'}
                            </button>
                          )}
                          <button
                            disabled={isWorking}
                            onClick={async () => {
                              const doGen = async () => {
                                try { await generateLlaves(c.id); lastActionRef.current = null; } catch (e) { } finally { lastActionRef.current = doGen; }
                              };
                              await doGen();
                            }}
                            className="btn-action btn-generar"
                          >
                            {isWorking ? '⏳' : 'Generar Llaves'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sección Participantes */}
      {activeCategoria && (
        <div className="management-section">
          {renderSectionHeader(`Participantes de "${activeCategoria.nombre}"`, 'participantes', '👤')}
          {expandedSections.participantes && (
            <div className="section-content">
              {renderParticipanteForm()}
              
              <div className="participantes-list">
                <h4>Participantes Registrados ({participantes.length})</h4>
                {isLoadingParticipantes ? (
                  <div className="empty-state" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span>Cargando participantes...</span>
                  </div>
                ) : errorParticipantes ? (
                  <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong>Error:</strong> {errorParticipantes}
                    </div>
                    {activeCategoria && (
                      <button className="btn-action" onClick={() => loadParticipantes(activeCategoria.id)}>Reintentar</button>
                    )}
                  </div>
                ) : participantes.length === 0 ? (
                  <div className="empty-state">
                    <p>No hay participantes registrados en esta categoría</p>
                  </div>
                ) : (
                  Array.isArray(participantes) && participantes.map(p => (
                    <div key={p.id} className="participant-card">
                      <div className="participant-info">
                        <div>{p.nombre} {p.apellido}</div>
                        <div className="participant-details">
                          {p.peso && `${p.peso}kg`} {p.peso && p.edad && '•'} {p.edad && `${p.edad} años`} {(p.peso || p.edad) && p.cinturon && '•'} {p.cinturon} {p.cinturon && p.academia && '•'} {p.academia}
                        </div>
                      </div>
                      <button
                        disabled={isWorking}
                        onClick={async () => {
                          const doDel = async () => { try { await handleDeleteParticipante(p.id); lastActionRef.current = null; } catch (e) {} finally { lastActionRef.current = doDel; } };
                          await doDel();
                        }}
                        className="btn-action btn-eliminar"
                      >
                        {isWorking ? '⏳' : 'Eliminar'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sección Llaves y Luchas */}
      {activeCategoria && (
        <div className="management-section">
          {renderSectionHeader(`Llaves de "${activeCategoria.nombre}"`, 'llaves', '🗂️')}
          {expandedSections.llaves && (
            <div className="section-content">
              <div className="form-container">
                <div className="form-group">
                  <button 
                    onClick={async () => { const doGenAuto = async () => { try { await generateLlaves(activeCategoria.id); lastActionRef.current = null; } catch(e) {} finally { lastActionRef.current = doGenAuto; } }; await doGenAuto(); }}
                    disabled={isWorking || participantes.length < 2}
                    className="btn-primary"
                  >
                    {isWorking ? '⏳ Generando...' : '🎯 Generar Llave Automática'}
                  </button>
                  {participantes.length < 2 && (
                    <small className="help-text">Se necesitan al menos 2 participantes</small>
                  )}
                </div>
              </div>
              
              <div className="llaves-list">
                <h4>Llaves Generadas ({llaves.length})</h4>
                {isLoadingLlaves ? (
                  <div className="empty-state" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span>Cargando llaves...</span>
                  </div>
                ) : errorLlaves ? (
                  <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong>Error:</strong> {errorLlaves}
                    </div>
                    {activeCategoria && (
                      <button className="btn-action" onClick={() => loadLlaves(activeCategoria.id)}>Reintentar</button>
                    )}
                  </div>
                ) : llaves.length === 0 ? (
                  <div className="empty-state">
                    <p>No hay llaves generadas para esta categoría</p>
                  </div>
                ) : (
                  Array.isArray(llaves) && llaves.map(llave => (
                    <div key={llave.id} className="bracket-container">
                      <div className="bracket-header">
                        <h5>Llave - {llave.categoria_nombre}</h5>
                        <div className="bracket-status">
                          Estado: {llave.estructura?.estado || 'En progreso'}
                        </div>
                      </div>
                      
                      {llave.estructura?.rondas && Array.isArray(llave.estructura.rondas) && llave.estructura.rondas.length > 0 && (
                        <div className="bracket-rounds">
                          {llave.estructura.rondas.map((ronda, roundIndex) => (
                            <div key={roundIndex} className="round-container">
                              <h6>Ronda {roundIndex + 1}</h6>
                              <div className="fights-container">
                                {Array.isArray(ronda) && ronda.map((lucha, fightIndex) => (
                                  <div key={fightIndex} className="fight-card">
                                    <div className="fight-header">
                                      <span className="fight-round">{lucha.ronda}</span>
                                      <span className={`fight-status status-${lucha.estado}`}>
                                        {lucha.estado}
                                      </span>
                                    </div>
                                    
                                    <div className="fighters">
                                      <div className="fighter">
                                        <span className="fighter-name">
                                          {lucha.participante1?.nombre} {lucha.participante1?.apellido}
                                        </span>
                                        <span className="fighter-score">
                                          {lucha.puntos_p1 || 0} pts
                                        </span>
                                      </div>
                                      
                                      <div className="vs-divider">VS</div>
                                      
                                      <div className="fighter">
                                        <span className="fighter-name">
                                          {lucha.participante2 ? 
                                            `${lucha.participante2.nombre} ${lucha.participante2.apellido}` : 
                                            'BYE'
                                          }
                                        </span>
                                        <span className="fighter-score">
                                          {lucha.puntos_p2 || 0} pts
                                        </span>
                                      </div>
                                    </div>
                                    
                                    {lucha.ganador && (
                                      <div className="winner-banner">
                                        🏆 Ganador: {lucha.ganador.nombre} {lucha.ganador.apellido}
                                      </div>
                                    )}
                                    
                                    {lucha.estado === 'pendiente' && lucha.participante2 && (
                                      <div className="fight-actions">
                                        <button 
                                          className="btn-small btn-iniciar"
                                          onClick={async () => { const doStart = async () => { try { await iniciarLucha(lucha); lastActionRef.current = null; } catch (e) {} finally { lastActionRef.current = doStart; } }; await doStart(); }}
                                        >
                                          Iniciar Lucha
                                        </button>
                                      </div>
                                    )}
                                    
                                    {lucha.estado === 'en_progreso' && (
                                      <div className="fight-timer">
                                        <div className="timer-display">
                                          {formatTime(lucha.tiempo_transcurrido || 0)} / {formatTime(lucha.duracion_segundos || 300)}
                                        </div>
                                        <div className="timer-controls">
                                          <button className="btn-small">Pausa</button>
                                          <button className="btn-small">Finalizar</button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
  } catch (error) {
    console.error('Error rendering TorneoDashboard:', error);
    return (
      <div className="torneo-container">
        <div className="torneo-header">
          <h1 className="torneo-title">Sistema de Gestión de Torneos BJJ</h1>
        </div>
        <div className="alert alert-error">
          <strong>Error:</strong> Hubo un problema cargando la aplicación. Recarga la página.
          <details>
            <summary>Detalles técnicos</summary>
            <pre>{error.toString()}</pre>
          </details>
        </div>
      </div>
    );
  }
}
