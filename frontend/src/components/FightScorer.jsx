import React, { useEffect, useMemo, useState } from 'react';
import { luchaAPI } from '../services/api-new.js';
import './FightScorer.css';

export default function FightScorer({ categoria, onClose, initialLuchaId = null, customFighters = null }) {
  const [luchas, setLuchas] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Eliminamos bloqueos por “working” para tener UI siempre reactiva
  const [timerId, setTimerId] = useState(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [selectedWinnerId, setSelectedWinnerId] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const current = luchas[currentIdx] || null;

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Si es una lucha independiente, crear una lucha ficticia
      if (customFighters) {
        const mockLucha = {
          id: 'independent-fight',
          estado: 'pendiente',
          duracion_segundos: categoria.duracion_segundos || 300,
          tiempo_transcurrido: 0,
          participante1_nombre: customFighters.participante1_nombre,
          participante2_nombre: customFighters.participante2_nombre,
          participante1: { id: 1, nombre: customFighters.participante1_nombre },
          participante2: { id: 2, nombre: customFighters.participante2_nombre },
          // Inicializar todos los contadores en 0
          montadas_p1: 0, guardas_pasadas_p1: 0, rodillazos_p1: 0, derribos_p1: 0, ventajas_p1: 0, penalizaciones_p1: 0,
          montadas_p2: 0, guardas_pasadas_p2: 0, rodillazos_p2: 0, derribos_p2: 0, ventajas_p2: 0, penalizaciones_p2: 0
        };
        setLuchas([mockLucha]);
        setCurrentIdx(0);
      } else {
        // Cargar luchas desde el API como antes
        const data = await luchaAPI.getByCategoria(categoria.id);
        const arr = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
        // Orden: en_progreso -> pendiente -> pausada -> finalizada
        const order = { en_progreso: 0, pendiente: 1, pausada: 2, finalizada: 3 };
        arr.sort((a, b) => (order[a.estado] ?? 9) - (order[b.estado] ?? 9));
        setLuchas(arr);
        if (initialLuchaId) {
          const idx = arr.findIndex(l => l.id === initialLuchaId);
          setCurrentIdx(idx >= 0 ? idx : 0);
        } else {
          const firstIdx = arr.findIndex(l => l.estado !== 'finalizada');
          setCurrentIdx(firstIdx >= 0 ? firstIdx : 0);
        }
      }
    } catch (e) {
      setError(e.message || 'Error cargando luchas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshCurrent = async () => {
    if (!current) return;
    try {
      const fresh = await luchaAPI.getById(current.id);
      // Preservar tiempo local mientras esté en progreso para evitar reinicios visuales
      setLuchas(prev => prev.map((l, i) => {
        if (i !== currentIdx) return l;
        if (l.estado === 'en_progreso') {
          return { ...fresh, tiempo_transcurrido: l.tiempo_transcurrido };
        }
        return fresh;
      }));
    } catch {
      // noop
    }
  };

  const calcPoints = useMemo(() => {
    if (!current) return { p1: 0, p2: 0 };
    const p1 = (current.montadas_p1 || 0) * 4 + (current.guardas_pasadas_p1 || 0) * 3 + ((current.rodillazos_p1 || 0) + (current.derribos_p1 || 0)) * 2;
    const p2 = (current.montadas_p2 || 0) * 4 + (current.guardas_pasadas_p2 || 0) * 3 + ((current.rodillazos_p2 || 0) + (current.derribos_p2 || 0)) * 2;
    return { p1, p2 };
  }, [current]);

  const addDelta = async (field, delta) => {
    if (!current) return;
    const prevValue = current[field] || 0;
    const nextValue = Math.max(0, prevValue + delta);
    // Actualización optimista inmediata
    setLuchas(prev => prev.map((l, i) => i === currentIdx ? { ...l, [field]: nextValue } : l));
    
    // Si es una lucha independiente, no hacer llamadas al API
    if (customFighters) {
      return;
    }
    
    try {
      await luchaAPI.update(current.id, { [field]: nextValue });
      // No esperamos el refresh para no trabar el UI; refresco silencioso
      refreshCurrent();
    } catch (e) {
      // Rollback si el servidor falla
      setLuchas(prev => prev.map((l, i) => i === currentIdx ? { ...l, [field]: prevValue } : l));
      setError(e.message);
    }
  };

  const toggleTimer = async () => {
    if (!current) return;
    const prevEstado = current.estado;
    const nextEstado = prevEstado === 'pendiente'
      ? 'en_progreso'
      : prevEstado === 'en_progreso'
      ? 'pausada'
      : 'en_progreso';

    // Optimista: cambiar estado local de inmediato
    setLuchas(prev => prev.map((l, i) => i === currentIdx ? { ...l, estado: nextEstado } : l));

    // Gestionar timer local inmediatamente
    if (nextEstado === 'en_progreso') {
      if (timerId) clearInterval(timerId);
      const id = setInterval(() => {
        // Incrementar todas las luchas en progreso (por si cambia el índice)
        setLuchas(prev => prev.map(l => l.estado === 'en_progreso' ? { ...l, tiempo_transcurrido: (l.tiempo_transcurrido || 0) + 1 } : l));
      }, 1000);
      setTimerId(id);
    } else {
      if (timerId) {
        clearInterval(timerId);
        setTimerId(null);
      }
    }

    // Si es una lucha independiente, no hacer llamadas al API
    if (customFighters) {
      return;
    }

    // Enviar al backend en segundo plano y hacer rollback si falla
    try {
      if (prevEstado === 'pendiente') {
        await luchaAPI.update(current.id, { estado: 'en_progreso' });
      } else if (prevEstado === 'en_progreso') {
        await luchaAPI.update(current.id, { estado: 'pausada', tiempo_transcurrido: current.tiempo_transcurrido });
      } else if (prevEstado === 'pausada') {
        await luchaAPI.update(current.id, { estado: 'en_progreso' });
      }
      // Refresco no bloqueante
      refreshCurrent();
    } catch (e) {
      // Rollback de estado y timer
      setLuchas(prev => prev.map((l, i) => i === currentIdx ? { ...l, estado: prevEstado } : l));
      if (prevEstado === 'en_progreso') {
        if (!timerId) {
          const id = setInterval(() => {
            setLuchas(prev => prev.map(lu => lu.estado === 'en_progreso' ? { ...lu, tiempo_transcurrido: (lu.tiempo_transcurrido || 0) + 1 } : lu));
          }, 1000);
          setTimerId(id);
        }
      } else {
        if (timerId) {
          clearInterval(timerId);
          setTimerId(null);
        }
      }
      setError(e.message);
    }
  };

  const finalize = async () => {
    if (!current) return;
    setSelectedWinnerId(null);
    setShowFinishModal(true);
  };

  const confirmFinalize = async () => {
    if (!current) return;
    // Optimista: marcar finalizada y asignar ganador localmente
    const winnerId = selectedWinnerId ? Number(selectedWinnerId) : null;
    setLuchas(prev => prev.map((l, i) => i === currentIdx ? {
      ...l,
      estado: 'finalizada',
      ganador: winnerId || l.ganador,
      ganador_nombre: winnerId ? (winnerId === (l.participante1?.id || l.participante1) ? (l.participante1_nombre || l.participante1?.nombre) : (l.participante2_nombre || l.participante2?.nombre)) : l.ganador_nombre
    } : l));
    setShowFinishModal(false);
    if (timerId) { clearInterval(timerId); setTimerId(null); }

    // Si es una lucha independiente, solo cerrar
    if (customFighters) {
      if (onClose) onClose();
      return;
    }

    try {
      const payload = winnerId ? { ganador_id: winnerId, tipo_victoria: 'puntos' } : {};
      await luchaAPI.finalizar(current.id, payload);
      // Refrescar en background
      load();
      if (onClose) onClose();
    } catch (e) {
      // Rollback si falla
      setError(e.message || 'Error al finalizar la lucha');
      await refreshCurrent();
    }
  };

  const fmt = (s) => {
    const m = Math.floor((s || 0) / 60);
    const sec = (s || 0) % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  // Funciones para manejar pantalla completa
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch(err => {
        console.log('Error al entrar en pantalla completa:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullScreen(false);
      }).catch(err => {
        console.log('Error al salir de pantalla completa:', err);
      });
    }
  };

  // Detectar cambios en el estado de pantalla completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-3xl text-center">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap: 8 }}>
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span>Cargando…</span>
          </div>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-3xl text-center">
          <h3 className="text-xl font-bold mb-3">No hay luchas disponibles</h3>
          <button className="px-4 py-2 bg-gray-600 text-white rounded" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 ${customFighters ? 'bg-black' : 'bg-black/70'} ${customFighters ? '' : 'flex items-center justify-center'} z-50 ${isFullScreen ? 'fight-scorer-fullscreen' : ''}`}>
      <div className={`bg-white ${customFighters ? 'w-full h-full' : 'rounded-2xl w-full max-w-3xl flex items-center justify-center'} shadow-2xl flex flex-col fight-scorer-content`}>
        <div className={`flex justify-between items-center ${customFighters ? 'p-8' : 'p-4'} ${customFighters ? 'mb-8' : 'mb-3'}`}>
          <h3 className={`font-bold ${customFighters ? 'text-4xl' : 'text-xl'}`}>Marcador — {categoria.nombre}</h3>
          <div className="flex items-center gap-2">
            {/* Botón de pantalla completa solo para luchas independientes */}
            {customFighters && (
              <button 
                className={`text-gray-500 hover:text-gray-700 transition-colors ${customFighters ? 'text-2xl' : 'text-xl'} p-2 rounded hover:bg-gray-100 fullscreen-toggle`} 
                onClick={toggleFullScreen}
                title={isFullScreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {isFullScreen ? '⛶' : '⛶'}
              </button>
            )}
            <button className={`text-gray-500 hover:text-gray-700 transition-colors ${customFighters ? 'text-4xl' : 'text-xl'}`} onClick={onClose}>×</button>
          </div>
        </div>

        <div className={`flex-1 ${customFighters ? 'px-8 flex flex-col' : 'px-4'}`}>
          {error && (
            <div className="mb-3 text-red-600" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap: 8 }}>
              <span>{error}</span>
              <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded" onClick={load}>Reintentar</button>
            </div>
          )}

          <div className={`text-center ${customFighters ? 'mb-8 flex-shrink-0' : 'mb-3'}`}>
            <div className={`font-extrabold timer ${customFighters ? 'text-6xl' : 'text-2xl'}`}>{fmt(current.duracion_segundos - (current.tiempo_transcurrido || 0))}</div>
            <div className="mt-2">
              <button onClick={toggleTimer} className={`px-4 py-2 rounded text-white ${customFighters ? 'text-lg' : ''} ${current.estado === 'en_progreso' ? 'bg-black hover:bg-black' : 'bg-black hover:bg-green-700'}`}>
                {current.estado === 'en_progreso' ? 'Pausar' : 'Iniciar'}
              </button>
            </div>
          </div>

          <div className={`grid grid-cols-2 gap-4 ${customFighters ? 'gap-8 flex-1' : ''}`}>
          {/* P1 */}
          <div className={`border rounded-xl ${customFighters ? 'p-8 flex flex-col' : 'p-3'}`}>
            <div className={`text-center font-semibold mb-2 fighter-name ${customFighters ? 'text-2xl' : 'text-base'} ${customFighters ? 'flex-shrink-0' : ''}`}>{current.participante1_nombre || current.participante1?.nombre || 'P1'}</div>
            <div className={`text-center font-black text-blue-600 mb-3 score ${customFighters ? 'text-7xl' : 'text-3xl'} ${customFighters ? 'flex-shrink-0' : ''}`}>{calcPoints.p1}</div>
            <div className={`grid grid-cols-3 ${customFighters ? 'gap-4 flex-1' : 'gap-2'}`}>
              <button onClick={() => addDelta('montadas_p1', +1)} className={`bg-blue-600 hover:bg-blue-700 text-white rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>+4</button>
              <button onClick={() => addDelta('guardas_pasadas_p1', +1)} className={`bg-blue-600 hover:bg-blue-700 text-white rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>+3</button>
              <button onClick={() => addDelta('rodillazos_p1', +1)} className={`bg-blue-600 hover:bg-blue-700 text-white rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>+2</button>
              <button onClick={() => addDelta('derribos_p1', +1)} className={`bg-blue-600 hover:bg-blue-700 text-white rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>+2</button>
              <button onClick={() => addDelta('ventajas_p1', +1)} className={`bg-green-200 hover:bg-yellow-600 text-white rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>Vent +1</button>
              <button onClick={() => addDelta('penalizaciones_p1', +1)} className={`bg-red-200 hover:bg-red-200 text-white rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>Pen -1</button>
              <button onClick={() => addDelta('montadas_p1', -1)} className={`bg-gray-200 rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>-4</button>
              <button onClick={() => addDelta('guardas_pasadas_p1', -1)} className={`bg-gray-200 rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>-3</button>
              <button onClick={() => addDelta('rodillazos_p1', -1)} className={`bg-gray-200 rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>-2</button>
              <button onClick={() => addDelta('derribos_p1', -1)} className={`bg-gray-200 rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>-2</button>
              <button onClick={() => addDelta('ventajas_p1', -1)} className={`bg-green-200 rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>Vent -1</button>
              <button onClick={() => addDelta('penalizaciones_p1', -1)} className={`bg-red-200 rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>Pen +1</button>
            </div>
          </div>

          {/* P2 */}
          <div className={`border rounded-xl ${customFighters ? 'p-8 flex flex-col' : 'p-3'}`}>
            <div className={`text-center font-semibold mb-2 fighter-name ${customFighters ? 'text-2xl' : 'text-base'} ${customFighters ? 'flex-shrink-0' : ''}`}>{current.participante2_nombre || current.participante2?.nombre || 'P2'}</div>
            <div className={`text-center font-black text-red-600 mb-3 score ${customFighters ? 'text-7xl' : 'text-3xl'} ${customFighters ? 'flex-shrink-0' : ''}`}>{calcPoints.p2}</div>
            <div className={`grid grid-cols-3 ${customFighters ? 'gap-4 flex-1' : 'gap-2'}`}>
              <button onClick={() => addDelta('montadas_p2', +1)} className={`bg-red-600 hover:bg-red-700 text-white rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>+4</button>
              <button onClick={() => addDelta('guardas_pasadas_p2', +1)} className={`bg-red-600 hover:bg-red-700 text-white rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>+3</button>
              <button onClick={() => addDelta('rodillazos_p2', +1)} className={`bg-red-600 hover:bg-red-700 text-white rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>+2</button>
              <button onClick={() => addDelta('derribos_p2', +1)} className={`bg-red-600 hover:bg-red-700 text-white rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>+2</button>
              <button onClick={() => addDelta('ventajas_p2', +1)} className={`bg-green-200 hover:bg-yellow-600 text-white rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>Vent +1</button>
              <button onClick={() => addDelta('penalizaciones_p2', +1)} className={`bg-red-200 hover:bg-red-200 text-white rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>Pen -1</button>
              <button onClick={() => addDelta('montadas_p2', -1)} className={`bg-gray-200 rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>-4</button>
              <button onClick={() => addDelta('guardas_pasadas_p2', -1)} className={`bg-gray-200 rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>-3</button>
              <button onClick={() => addDelta('rodillazos_p2', -1)} className={`bg-gray-200 rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>-2</button>
              <button onClick={() => addDelta('derribos_p2', -1)} className={`bg-gray-200 rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>-2</button>
              <button onClick={() => addDelta('ventajas_p2', -1)} className={`bg-green-200 rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>Vent -1</button>
              <button onClick={() => addDelta('penalizaciones_p2', -1)} className={`bg-red-200 rounded ${customFighters ? 'px-4 py-3 text-lg' : 'px-3 py-2'}`}>Pen +1</button>
            </div>
          </div>
        </div>
      </div>

      <div className={`flex justify-between items-center ${customFighters ? 'p-8' : 'p-4'} ${customFighters ? 'mt-8' : 'mt-4'}`}>
          {/* Solo mostrar botones de navegación si no es una lucha independiente */}
          {!customFighters && (
            <div className="flex gap-2">
              <button disabled={currentIdx <= 0} onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} className="px-3 py-2 bg-gray-200 rounded">◀︎ Anterior</button>
              <button disabled={currentIdx >= luchas.length - 1} onClick={() => setCurrentIdx(Math.min(luchas.length - 1, currentIdx + 1))} className="px-3 py-2 bg-gray-200 rounded">Siguiente ▶︎</button>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={finalize} className={`bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold ${customFighters ? 'px-6 py-3 text-lg' : 'px-4 py-2'}`}>Finalizar</button>
            <button onClick={onClose} className={`bg-gray-600 hover:bg-gray-700 text-white rounded ${customFighters ? 'px-6 py-3 text-lg' : 'px-4 py-2'}`}>Cerrar</button>
          </div>
        </div>
      </div>
      {/* Modal seleccionar ganador */}
      {showFinishModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">Seleccionar ganador</h4>
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="winner"
                  value={(current.participante1?.id ?? current.participante1) || ''}
                  onChange={() => setSelectedWinnerId(current.participante1?.id ?? current.participante1)}
                />
                <span>{current.participante1_nombre || current.participante1?.nombre || 'P1'}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="winner"
                  value={(current.participante2?.id ?? current.participante2) || ''}
                  onChange={() => setSelectedWinnerId(current.participante2?.id ?? current.participante2)}
                />
                <span>{current.participante2_nombre || current.participante2?.nombre || 'P2'}</span>
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => setShowFinishModal(false)}>Cancelar</button>
              <button disabled={!selectedWinnerId} className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={confirmFinalize}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


