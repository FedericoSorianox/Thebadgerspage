import React, { useEffect, useState } from 'react';
import API, { torneoAPI, categoriaAPI } from '../services/api-new.js';
import './TorneoDashboard.css';

export default function TorneoDashboard() {
  const [torneos, setTorneos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [activeTorneo, setActiveTorneo] = useState(null);
  const [error, setError] = useState(null);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    loadTorneos();
  }, []);

  async function loadTorneos() {
    console.log('[TorneoDashboard] 🚀 loadTorneos iniciado');
    try {
      setError(null);
      console.log('[TorneoDashboard] 📡 Llamando torneoAPI.getAll()...');
      const data = await torneoAPI.getAll();
      console.log('[TorneoDashboard] 📦 Datos recibidos:', data);
      console.log('[TorneoDashboard] 🔍 Tipo de datos:', typeof data);
      console.log('[TorneoDashboard] 📏 Longitud:', data?.length);
      
      // Forzar que sea un array válido
      const torneosArray = Array.isArray(data) ? data : [];
      console.log('[TorneoDashboard] 📋 Array final:', torneosArray);
      
      setTorneos(torneosArray);
      if (torneosArray.length) {
        console.log('[TorneoDashboard] 🎯 Seleccionando primer torneo:', torneosArray[0]);
        setActiveTorneo(torneosArray[0]);
        const cats = await categoriaAPI.getAll(torneosArray[0].id);
        console.log('[TorneoDashboard] 📊 Categorías cargadas:', cats);
        setCategorias(cats);
      } else {
        console.log('[TorneoDashboard] ⚠️ No hay torneos disponibles');
        setActiveTorneo(null);
        setCategorias([]);
      }
    } catch (e) {
      console.error('[TorneoDashboard] 💥 ERROR al cargar torneos:', e);
      setError(e.message);
    }
  }

  async function handleSelectTorneo(t) {
    setActiveTorneo(t);
    try {
      setError(null);
      const cats = await categoriaAPI.getAll(t.id);
      setCategorias(cats);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeleteTorneo(id) {
    if (!confirm('¿Seguro que deseas eliminar este torneo? Esta acción no se puede deshacer.')) return;
    try {
      setIsWorking(true);
      const ok = await torneoAPI.delete(id);
      if (!ok) throw new Error('No se pudo eliminar el torneo');
      await loadTorneos();
    } catch (e) {
      setError(e.message);
    } finally {
      setIsWorking(false);
    }
  }

  async function handleDeleteCategoria(id) {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      setIsWorking(true);
      const ok = await categoriaAPI.delete(id);
      if (!ok) throw new Error('No se pudo eliminar la categoría');
      if (activeTorneo) {
        const cats = await categoriaAPI.getAll(activeTorneo.id);
        setCategorias(cats);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsWorking(false);
    }
  }

  async function handleCerrarInscripciones(id) {
    if (!confirm('¿Cerrar inscripciones de esta categoría?')) return;
    try {
      setIsWorking(true);
      await categoriaAPI.cerrarInscripciones(id);
      if (activeTorneo) {
        const cats = await categoriaAPI.getAll(activeTorneo.id);
        setCategorias(cats);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <div className="torneo-container">
      {/* Header del torneo */}
      <div className="torneo-header">
        <h1 className="torneo-title">Sistema de Torneo BJJ</h1>
      </div>

      {/* DEBUG INFO */}
      <div className="debug-info">
        <div>🔍 DEBUG: Torneos cargados: {torneos.length}</div>
        <div>🎯 Torneo activo: {activeTorneo ? activeTorneo.nombre : 'ninguno'}</div>
        <div>📊 Categorías: {categorias.length}</div>
        {error && <div>❌ Error: {error}</div>}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* Lista de Torneos */}
      {torneos.length === 0 ? (
        <div className="empty-state">
          <h3>No hay torneos disponibles</h3>
          <p>⚠️ No se han cargado torneos aún...</p>
        </div>
      ) : (
        <div className="torneo-list">
          <h2 style={{marginBottom: '20px', color: '#2c3e50'}}>Torneos Disponibles</h2>
          {torneos.map(t => (
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
                    onClick={async ()=>{ try{ setIsWorking(true); await torneoAPI.activar(t.id); await loadTorneos(); } catch(e){ setError(e.message);} finally{ setIsWorking(false);} }}
                    className="btn-action btn-activar"
                    title="Activar torneo"
                  >
                    Activar
                  </button>
                )}
                {t.estado !== 'finalizado' && (
                  <button
                    disabled={isWorking}
                    onClick={async ()=>{ if(!confirm('¿Finalizar este torneo?')) return; try{ setIsWorking(true); await torneoAPI.finalizar(t.id); await loadTorneos(); } catch(e){ setError(e.message);} finally{ setIsWorking(false);} }}
                    className="btn-action btn-finalizar"
                    title="Finalizar torneo"
                  >
                    Finalizar
                  </button>
                )}
                <button
                  disabled={isWorking}
                  onClick={() => handleDeleteTorneo(t.id)}
                  className="btn-action btn-eliminar"
                  title="Eliminar torneo"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTorneo && (
        <div className="categorias-section">
          <h2 className="categorias-title">Categorías de "{activeTorneo.nombre}"</h2>
          {categorias.length === 0 ? (
            <div className="empty-state">
              <h3>No hay categorías disponibles</h3>
              <p>Este torneo aún no tiene categorías registradas.</p>
            </div>
          ) : (
            categorias.map(c => (
              <div key={c.id} className="categoria-card">
                <div className="categoria-info">
                  <div className="categoria-details">
                    <span className="categoria-belt">{c.nombre}</span>
                    <span className="categoria-weight">
                      {` — ${c.grupo_edad} — ${c.genero} — ${c.cinturon} — ${c.peso_minimo}-${c.peso_maximo} kg`}
                    </span>
                  </div>
                  <div className={`categoria-status ${c.estado === 'abierta' ? 'inscripciones-abiertas' : 'inscripciones-cerradas'}`}>
                    {c.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                  </div>
                  <div className="torneo-actions">
                    <button
                      disabled={isWorking}
                      onClick={() => handleDeleteCategoria(c.id)}
                      className="btn-action btn-eliminar"
                    >
                      Eliminar
                    </button>
                    {c.estado === 'abierta' && (
                      <button
                        disabled={isWorking}
                        onClick={() => handleCerrarInscripciones(c.id)}
                        className="btn-action btn-cerrar"
                      >
                        Cerrar inscripciones
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
