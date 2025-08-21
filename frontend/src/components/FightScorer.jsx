import React, { useEffect, useMemo, useState } from 'react';
import { luchaAPI } from '../services/api-new.js';

export default function FightScorer({ categoria, onClose, initialLuchaId = null }) {
  const [luchas, setLuchas] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Eliminamos bloqueos por “working” para tener UI siempre reactiva
  const [timerId, setTimerId] = useState(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [selectedWinnerId, setSelectedWinnerId] = useState(null);

  const current = luchas[currentIdx] || null;

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">Marcador — {categoria.nombre}</h3>
          <button className="text-2xl text-gray-500" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="mb-3 text-red-600" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap: 8 }}>
            <span>{error}</span>
            <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded" onClick={load}>Reintentar</button>
          </div>
        )}

        <div className="text-center mb-4">
          <div className="text-3xl font-extrabold">{fmt(current.duracion_segundos - (current.tiempo_transcurrido || 0))}</div>
          <div className="mt-2">
            <button onClick={toggleTimer} className={`px-4 py-2 rounded text-white ${current.estado === 'en_progreso' ? 'bg-black hover:bg-black' : 'bg-black hover:bg-green-700'}`}>
              {current.estado === 'en_progreso' ? 'Pausar' : 'Iniciar'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* P1 */}
          <div className="border rounded-xl p-4">
            <div className="text-center text-lg font-semibold mb-2">{current.participante1_nombre || current.participante1?.nombre || 'P1'}</div>
            <div className="text-center text-4xl font-black text-blue-600 mb-4">{calcPoints.p1}</div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => addDelta('montadas_p1', +1)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">+4</button>
              <button onClick={() => addDelta('guardas_pasadas_p1', +1)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">+3</button>
              <button onClick={() => addDelta('rodillazos_p1', +1)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">+2</button>
              <button onClick={() => addDelta('derribos_p1', +1)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">+2</button>
              <button onClick={() => addDelta('ventajas_p1', +1)} className="bg-green-200 hover:bg-yellow-600 text-white px-3 py-2 rounded">Vent +1</button>
              <button onClick={() => addDelta('penalizaciones_p1', +1)} className="bg-red-200 hover:bg-red-200 text-white px-3 py-2 rounded">Pen -1</button>
              <button onClick={() => addDelta('montadas_p1', -1)} className="bg-gray-200 px-3 py-2 rounded">-4</button>
              <button onClick={() => addDelta('guardas_pasadas_p1', -1)} className="bg-gray-200 px-3 py-2 rounded">-3</button>
              <button onClick={() => addDelta('rodillazos_p1', -1)} className="bg-gray-200 px-3 py-2 rounded">-2</button>
              <button onClick={() => addDelta('derribos_p1', -1)} className="bg-gray-200 px-3 py-2 rounded">-2</button>
              <button onClick={() => addDelta('ventajas_p1', -1)} className="bg-green-200 px-3 py-2 rounded">Vent -1</button>
              <button onClick={() => addDelta('penalizaciones_p1', -1)} className="bg-red-200 px-3 py-2 rounded">Pen +1</button>
            </div>
          </div>

          {/* P2 */}
          <div className="border rounded-xl p-4">
            <div className="text-center text-lg font-semibold mb-2">{current.participante2_nombre || current.participante2?.nombre || 'P2'}</div>
            <div className="text-center text-4xl font-black text-red-600 mb-4">{calcPoints.p2}</div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => addDelta('montadas_p2', +1)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded">+4</button>
              <button onClick={() => addDelta('guardas_pasadas_p2', +1)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded">+3</button>
              <button onClick={() => addDelta('rodillazos_p2', +1)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded">+2</button>
              <button onClick={() => addDelta('derribos_p2', +1)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded">+2</button>
              <button onClick={() => addDelta('ventajas_p2', +1)} className="bg-green-200 hover:bg-yellow-600 text-white px-3 py-2 rounded">Vent +1</button>
              <button onClick={() => addDelta('penalizaciones_p2', +1)} className="bg-red-200 hover:bg-red-200 text-white px-3 py-2 rounded">Pen -1</button>
              <button onClick={() => addDelta('montadas_p2', -1)} className="bg-gray-200 px-3 py-2 rounded">-4</button>
              <button onClick={() => addDelta('guardas_pasadas_p2', -1)} className="bg-gray-200 px-3 py-2 rounded">-3</button>
              <button onClick={() => addDelta('rodillazos_p2', -1)} className="bg-gray-200 px-3 py-2 rounded">-2</button>
              <button onClick={() => addDelta('derribos_p2', -1)} className="bg-gray-200 px-3 py-2 rounded">-2</button>
              <button onClick={() => addDelta('ventajas_p2', -1)} className="bg-green-200 px-3 py-2 rounded">Vent -1</button>
              <button onClick={() => addDelta('penalizaciones_p2', -1)} className="bg-red-200 px-3 py-2 rounded">Pen +1</button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="flex gap-2">
            <button disabled={currentIdx <= 0} onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} className="px-3 py-2 bg-gray-200 rounded">◀︎ Anterior</button>
            <button disabled={currentIdx >= luchas.length - 1} onClick={() => setCurrentIdx(Math.min(luchas.length - 1, currentIdx + 1))} className="px-3 py-2 bg-gray-200 rounded">Siguiente ▶︎</button>
          </div>
          <div className="flex gap-2">
            <button onClick={finalize} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold">Finalizar</button>
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">Cerrar</button>
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


