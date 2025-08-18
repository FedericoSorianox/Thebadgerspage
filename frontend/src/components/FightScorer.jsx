import React, { useEffect, useMemo, useState } from 'react';
import { luchaAPI } from '../services/api-new.js';

export default function FightScorer({ categoria, onClose }) {
  const [luchas, setLuchas] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [working, setWorking] = useState(false);
  const [timerId, setTimerId] = useState(null);

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
      const firstIdx = arr.findIndex(l => l.estado !== 'finalizada');
      setCurrentIdx(firstIdx >= 0 ? firstIdx : 0);
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
      setLuchas(prev => prev.map((l, i) => (i === currentIdx ? fresh : l)));
    } catch (e) {
      // noop
    }
  };

  const calcPoints = useMemo(() => {
    if (!current) return { p1: 0, p2: 0 };
    const p1 = (current.montadas_p1 || 0) * 4 + (current.guardas_pasadas_p1 || 0) * 3 + ((current.rodillazos_p1 || 0) + (current.derribos_p1 || 0)) * 2;
    const p2 = (current.montadas_p2 || 0) * 4 + (current.guardas_pasadas_p2 || 0) * 3 + ((current.rodillazos_p2 || 0) + (current.derribos_p2 || 0)) * 2;
    return { p1, p2 };
  }, [current]);

  const addValue = async (field) => {
    if (!current) return;
    try {
      setWorking(true);
      const value = (current[field] || 0) + 1;
      await luchaAPI.update(current.id, { [field]: value });
      await refreshCurrent();
    } catch (e) {
      setError(e.message);
    } finally {
      setWorking(false);
    }
  };

  const toggleTimer = async () => {
    if (!current) return;
    try {
      setWorking(true);
      if (current.estado === 'pendiente') {
        await luchaAPI.update(current.id, { estado: 'en_progreso' });
      } else if (current.estado === 'en_progreso') {
        await luchaAPI.update(current.id, { estado: 'pausada', tiempo_transcurrido: current.tiempo_transcurrido });
      } else if (current.estado === 'pausada') {
        await luchaAPI.update(current.id, { estado: 'en_progreso' });
      }
      await refreshCurrent();
      if (timerId) {
        clearInterval(timerId);
        setTimerId(null);
      }
      if (current.estado !== 'en_progreso') {
        const id = setInterval(() => {
          setLuchas(prev => prev.map((l, i) => i === currentIdx ? { ...l, tiempo_transcurrido: (l.tiempo_transcurrido || 0) + 1 } : l));
        }, 1000);
        setTimerId(id);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setWorking(false);
    }
  };

  const finalize = async () => {
    if (!current) return;
    try {
      setWorking(true);
      await luchaAPI.finalizar(current.id, {});
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setWorking(false);
      if (timerId) {
        clearInterval(timerId);
        setTimerId(null);
      }
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
        <div className="bg-white rounded-xl p-6 w-full max-w-3xl text-center">Cargando…</div>
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
          <div className="mb-3 text-red-600">{error}</div>
        )}

        <div className="text-center mb-4">
          <div className="text-3xl font-extrabold">{fmt(current.duracion_segundos - (current.tiempo_transcurrido || 0))}</div>
          <div className="mt-2">
            <button disabled={working} onClick={toggleTimer} className={`px-4 py-2 rounded text-white ${current.estado === 'en_progreso' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
              {current.estado === 'en_progreso' ? 'Pausar' : 'Iniciar'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* P1 */}
          <div className="border rounded-xl p-4">
            <div className="text-center text-lg font-semibold mb-2">{current.participante1_nombre || current.participante1?.nombre || 'P1'}</div>
            <div className="text-center text-4xl font-black text-blue-600 mb-4">{calcPoints.p1}</div>
            <div className="grid grid-cols-2 gap-2">
              <button disabled={working} onClick={() => addValue('montadas_p1')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">Montada +4</button>
              <button disabled={working} onClick={() => addValue('guardas_pasadas_p1')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">Guarda +3</button>
              <button disabled={working} onClick={() => addValue('rodillazos_p1')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">Rodillazo +2</button>
              <button disabled={working} onClick={() => addValue('derribos_p1')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">Derribo +2</button>
              <button disabled={working} onClick={() => addValue('ventajas_p1')} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded">Ventaja +1</button>
              <button disabled={working} onClick={() => addValue('penalizaciones_p1')} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded">Penalización +1</button>
            </div>
          </div>

          {/* P2 */}
          <div className="border rounded-xl p-4">
            <div className="text-center text-lg font-semibold mb-2">{current.participante2_nombre || current.participante2?.nombre || 'P2'}</div>
            <div className="text-center text-4xl font-black text-green-600 mb-4">{calcPoints.p2}</div>
            <div className="grid grid-cols-2 gap-2">
              <button disabled={working} onClick={() => addValue('montadas_p2')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded">Montada +4</button>
              <button disabled={working} onClick={() => addValue('guardas_pasadas_p2')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded">Guarda +3</button>
              <button disabled={working} onClick={() => addValue('rodillazos_p2')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded">Rodillazo +2</button>
              <button disabled={working} onClick={() => addValue('derribos_p2')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded">Derribo +2</button>
              <button disabled={working} onClick={() => addValue('ventajas_p2')} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded">Ventaja +1</button>
              <button disabled={working} onClick={() => addValue('penalizaciones_p2')} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded">Penalización +1</button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="flex gap-2">
            <button disabled={currentIdx <= 0} onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} className="px-3 py-2 bg-gray-200 rounded">◀︎ Anterior</button>
            <button disabled={currentIdx >= luchas.length - 1} onClick={() => setCurrentIdx(Math.min(luchas.length - 1, currentIdx + 1))} className="px-3 py-2 bg-gray-200 rounded">Siguiente ▶︎</button>
          </div>
          <div className="flex gap-2">
            <button disabled={working} onClick={finalize} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold">Finalizar</button>
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}


