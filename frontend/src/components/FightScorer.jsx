import React, { useEffect, useMemo, useState } from 'react';
import { luchaAPI } from '../services/api-new.js';
import './FightScorer.css';

export default function FightScorer({ categoria, onClose, initialLuchaId = null, customFighters = null }) {
  const [luchas, setLuchas] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      <div className={`${customFighters ? 'w-full h-full' : 'rounded-2xl w-full max-w-6xl'} shadow-2xl flex flex-col fight-scorer-content bg-white`}>
        
        {/* CABECERA NEGRA CON LOGO (como IBJJF) */}
        <div className="bg-black text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold">🥋</div>
            <div className="text-center">
              <div className="text-xl font-bold">THE BADGERS</div>
              <div className="text-sm opacity-80">BRAZILIAN JIU-JITSU ACADEMY</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {customFighters && (
              <button 
                className="text-white hover:text-gray-300 transition-colors text-2xl p-2 rounded hover:bg-gray-800 fullscreen-toggle" 
                onClick={toggleFullScreen}
                title={isFullScreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {isFullScreen ? '⛶' : '⛶'}
              </button>
            )}
            <button className="text-white hover:text-gray-300 transition-colors text-3xl" onClick={onClose}>×</button>
          </div>
        </div>

        {/* SECCIÓN CENTRAL - COMPETIDORES */}
        <div className="flex-1 flex">
          {/* COMPETIDOR 1 - FONDO BLANCO */}
          <div className="flex-1 bg-white text-black p-6 flex flex-col">
            <div className="text-center mb-4">
              <div className="text-sm text-gray-600 mb-1">Academia</div>
              <div className="text-lg font-semibold">The Badgers</div>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-3xl font-bold">{current.participante1_nombre || current.participante1?.nombre || 'Competidor 1'}</div>
            </div>

            {/* CONTADORES DE PUNTUACIÓN */}
            <div className="flex justify-center gap-4 mb-6">
              {/* PUNTOS */}
              <div className="bg-gray-600 text-white rounded-lg p-4 text-center min-w-[80px]">
                <div className="text-2xl font-bold">{calcPoints.p1}</div>
                <div className="text-xs">PUNTOS</div>
              </div>
              
              {/* VENTAJAS */}
              <div className="bg-yellow-500 text-black rounded-lg p-4 text-center min-w-[80px]">
                <div className="text-2xl font-bold">{current.ventajas_p1 || 0}</div>
                <div className="text-xs">VENTAJAS</div>
              </div>
              
              {/* PENALIZACIONES */}
              <div className="bg-red-600 text-white rounded-lg p-4 text-center min-w-[80px]">
                <div className="text-2xl font-bold">{current.penalizaciones_p1 || 0}</div>
                <div className="text-xs">PENALIZ.</div>
              </div>
            </div>

            {/* BOTONES DE CONTROL */}
            <div className="grid grid-cols-3 gap-2 text-sm">
              <button onClick={() => addDelta('montadas_p1', +1)} className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2">Montada +4</button>
              <button onClick={() => addDelta('guardas_pasadas_p1', +1)} className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2">Guardia +3</button>
              <button onClick={() => addDelta('rodillazos_p1', +1)} className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2">Rodilla +2</button>
              <button onClick={() => addDelta('derribos_p1', +1)} className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2">Derribo +2</button>
              <button onClick={() => addDelta('ventajas_p1', +1)} className="bg-yellow-500 hover:bg-yellow-600 text-black rounded p-2">Ventaja +1</button>
              <button onClick={() => addDelta('penalizaciones_p1', +1)} className="bg-red-600 hover:bg-red-700 text-white rounded p-2">Penal. +1</button>
              
              {/* BOTONES DE RESTA */}
              <button onClick={() => addDelta('montadas_p1', -1)} className="bg-gray-300 hover:bg-gray-400 text-black rounded p-2">Montada -1</button>
              <button onClick={() => addDelta('guardas_pasadas_p1', -1)} className="bg-gray-300 hover:bg-gray-400 text-black rounded p-2">Guardia -1</button>
              <button onClick={() => addDelta('rodillazos_p1', -1)} className="bg-gray-300 hover:bg-gray-400 text-black rounded p-2">Rodilla -1</button>
              <button onClick={() => addDelta('derribos_p1', -1)} className="bg-gray-300 hover:bg-gray-400 text-black rounded p-2">Derribo -1</button>
              <button onClick={() => addDelta('ventajas_p1', -1)} className="bg-gray-300 hover:bg-gray-400 text-black rounded p-2">Ventaja -1</button>
              <button onClick={() => addDelta('penalizaciones_p1', -1)} className="bg-gray-300 hover:bg-gray-400 text-black rounded p-2">Penal. -1</button>
            </div>
          </div>

          {/* COMPETIDOR 2 - FONDO AZUL OSCURO */}
          <div className="flex-1 bg-blue-900 text-white p-6 flex flex-col">
            <div className="text-center mb-4">
              <div className="text-sm text-blue-200 mb-1">Academia</div>
              <div className="text-lg font-semibold">The Badgers</div>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-3xl font-bold">{current.participante2_nombre || current.participante2?.nombre || 'Competidor 2'}</div>
            </div>

            {/* CONTADORES DE PUNTUACIÓN */}
            <div className="flex justify-center gap-4 mb-6">
              {/* PUNTOS */}
              <div className="bg-green-600 text-white rounded-lg p-4 text-center min-w-[80px]">
                <div className="text-2xl font-bold">{calcPoints.p2}</div>
                <div className="text-xs">PUNTOS</div>
              </div>
              
              {/* VENTAJAS */}
              <div className="bg-yellow-500 text-black rounded-lg p-4 text-center min-w-[80px]">
                <div className="text-2xl font-bold">{current.ventajas_p2 || 0}</div>
                <div className="text-xs">VENTAJAS</div>
              </div>
              
              {/* PENALIZACIONES */}
              <div className="bg-red-600 text-white rounded-lg p-4 text-center min-w-[80px]">
                <div className="text-2xl font-bold">{current.penalizaciones_p2 || 0}</div>
                <div className="text-xs">PENALIZ.</div>
              </div>
            </div>

            {/* BOTONES DE CONTROL */}
            <div className="grid grid-cols-3 gap-2 text-sm">
              <button onClick={() => addDelta('montadas_p2', +1)} className="bg-red-600 hover:bg-red-700 text-white rounded p-2">Montada +4</button>
              <button onClick={() => addDelta('guardas_pasadas_p2', +1)} className="bg-red-600 hover:bg-red-700 text-white rounded p-2">Guardia +3</button>
              <button onClick={() => addDelta('rodillazos_p2', +1)} className="bg-red-600 hover:bg-red-700 text-white rounded p-2">Rodilla +2</button>
              <button onClick={() => addDelta('derribos_p2', +1)} className="bg-red-600 hover:bg-red-700 text-white rounded p-2">Derribo +2</button>
              <button onClick={() => addDelta('ventajas_p2', +1)} className="bg-yellow-500 hover:bg-yellow-600 text-black rounded p-2">Ventaja +1</button>
              <button onClick={() => addDelta('penalizaciones_p2', +1)} className="bg-red-600 hover:bg-red-700 text-white rounded p-2">Penal. +1</button>
              
              {/* BOTONES DE RESTA */}
              <button onClick={() => addDelta('montadas_p2', -1)} className="bg-gray-300 hover:bg-gray-400 text-black rounded p-2">Montada -1</button>
              <button onClick={() => addDelta('guardas_pasadas_p2', -1)} className="bg-gray-300 hover:bg-gray-400 text-black rounded p-2">Guardia -1</button>
              <button onClick={() => addDelta('rodillazos_p2', -1)} className="bg-gray-300 hover:bg-gray-400 text-black rounded p-2">Rodilla -1</button>
              <button onClick={() => addDelta('derribos_p2', -1)} className="bg-gray-300 hover:bg-gray-400 text-black rounded p-2">Derribo -1</button>
              <button onClick={() => addDelta('ventajas_p2', -1)} className="bg-gray-300 hover:bg-gray-400 text-black rounded p-2">Ventaja -1</button>
              <button onClick={() => addDelta('penalizaciones_p2', -1)} className="bg-gray-300 hover:bg-gray-400 text-black rounded p-2">Penal. -1</button>
            </div>
          </div>
        </div>

        {/* SECCIÓN INFERIOR - INFORMACIÓN DEL COMBATE Y TEMPORIZADOR */}
        <div className="bg-black text-white p-6 flex justify-between items-center">
          {/* LADO IZQUIERDO - INFORMACIÓN DEL COMBATE */}
          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-sm text-gray-400">MAT</div>
              <div className="text-2xl font-bold text-yellow-400">1</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">FIGHT</div>
              <div className="text-2xl font-bold text-yellow-400">{currentIdx + 1}</div>
            </div>
          </div>

          {/* CENTRO - CATEGORÍA Y ETAPA */}
          <div className="text-center">
            <div className="text-lg font-semibold mb-1">{categoria.nombre}</div>
            <div className="text-2xl font-bold text-yellow-400">EN PROGRESO</div>
          </div>

          {/* LADO DERECHO - TEMPORIZADOR Y CONTROLES */}
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">
              {fmt(current.duracion_segundos - (current.tiempo_transcurrido || 0))}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={toggleTimer} 
                className={`px-4 py-2 rounded font-semibold ${
                  current.estado === 'en_progreso' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {current.estado === 'en_progreso' ? 'PAUSAR' : 'INICIAR'}
              </button>
              <button 
                onClick={finalize} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
              >
                FINALIZAR
              </button>
            </div>
          </div>
        </div>

        {/* BOTONES DE NAVEGACIÓN (solo si no es lucha independiente) */}
        {!customFighters && (
          <div className="bg-gray-100 p-4 flex justify-between items-center">
            <div className="flex gap-2">
              <button 
                disabled={currentIdx <= 0} 
                onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} 
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
              >
                ◀︎ Anterior
              </button>
              <button 
                disabled={currentIdx >= luchas.length - 1} 
                onClick={() => setCurrentIdx(Math.min(luchas.length - 1, currentIdx + 1))} 
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
              >
                Siguiente ▶︎
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Lucha {currentIdx + 1} de {luchas.length}
            </div>
          </div>
        )}
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


