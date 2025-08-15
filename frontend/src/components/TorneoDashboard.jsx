import React, { useEffect, useState } from 'react';
import API, { torneoAPI, categoriaAPI } from '../services/api-new.js';

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
    console.log('[TorneoDashboard] loadTorneos iniciado');
    try {
      setError(null);
      console.log('[TorneoDashboard] Llamando torneoAPI.getAll()...');
      const data = await torneoAPI.getAll();
      console.log('[TorneoDashboard] Datos recibidos:', data);
      
      setTorneos(data);
      if (data.length) {
        console.log('[TorneoDashboard] Seleccionando primer torneo:', data[0]);
        setActiveTorneo(data[0]);
        const cats = await categoriaAPI.getAll(data[0].id);
        console.log('[TorneoDashboard] Categorías cargadas:', cats);
        setCategorias(cats);
      } else {
        console.log('[TorneoDashboard] No hay torneos disponibles');
        setActiveTorneo(null);
        setCategorias([]);
      }
    } catch (e) {
      console.error('[TorneoDashboard] Error al cargar torneos:', e);
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
    <div className="bg-black/20 border border-cyan-400/30 rounded-lg p-4">
      {error && <div className="text-red-400 mb-3">{error}</div>}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Torneos</h2>
      </div>
      <ul className="mb-4 list-disc pl-5">
        {torneos.map(t => (
          <li key={t.id} className="mb-1 flex items-center gap-3">
            <button
              className={`underline ${activeTorneo?.id===t.id? 'text-cyan-300':'text-white'}`}
              onClick={() => handleSelectTorneo(t)}
            >
              {t.nombre} {t.estado ? `(${t.estado})` : ''}
            </button>
            <div className="flex items-center gap-2">
              {t.estado !== 'activo' && (
                <button
                  disabled={isWorking}
                  onClick={async ()=>{ try{ setIsWorking(true); await torneoAPI.activar(t.id); await loadTorneos(); } catch(e){ setError(e.message);} finally{ setIsWorking(false);} }}
                  className="text-green-300 hover:text-green-400 text-sm disabled:opacity-50"
                  title="Activar torneo"
                >
                  Activar
                </button>
              )}
              {t.estado !== 'finalizado' && (
                <button
                  disabled={isWorking}
                  onClick={async ()=>{ if(!confirm('¿Finalizar este torneo?')) return; try{ setIsWorking(true); await torneoAPI.finalizar(t.id); await loadTorneos(); } catch(e){ setError(e.message);} finally{ setIsWorking(false);} }}
                  className="text-yellow-300 hover:text-yellow-400 text-sm disabled:opacity-50"
                  title="Finalizar torneo"
                >
                  Finalizar
                </button>
              )}
              <button
                disabled={isWorking}
                onClick={() => handleDeleteTorneo(t.id)}
                className="text-red-300 hover:text-red-400 text-sm disabled:opacity-50"
                title="Eliminar torneo"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {activeTorneo && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Categorías de "{activeTorneo.nombre}"</h3>
          <ul className="list-disc pl-5">
            {categorias.map(c => (
              <li key={c.id} className="mb-1 flex items-center gap-3">
                <span>
                  {c.nombre}
                  {` — ${c.grupo_edad} — ${c.genero} — ${c.cinturon} — ${c.peso_minimo}-${c.peso_maximo} kg`}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={isWorking}
                    onClick={() => handleDeleteCategoria(c.id)}
                    className="text-red-300 hover:text-red-400 text-xs disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                  {c.estado === 'abierta' && (
                    <button
                      disabled={isWorking}
                      onClick={() => handleCerrarInscripciones(c.id)}
                      className="text-yellow-300 hover:text-yellow-400 text-xs disabled:opacity-50"
                    >
                      Cerrar inscripciones
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
