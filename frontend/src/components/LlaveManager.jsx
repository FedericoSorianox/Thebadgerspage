import React, { useState, useEffect } from 'react';
import { llaveAPI, luchaAPI } from '../services/api-new.js';

export default function LlaveManager({ categoria, onClose }) {
  const [llave, setLlave] = useState(null);
  const [luchas, setLuchas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estados para el editor de lucha
  const [selectedLucha, setSelectedLucha] = useState(null)
  const [cronometroActivo, setCronometroActivo] = useState(false);
  const [cronometroInterval, setCronometroInterval] = useState(null);

  const loadLlave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const llaveData = await llaveAPI.getByCategoria(categoria.id);
      setLlave(llaveData);
      
      if (llaveData) {
        const luchasData = await luchaAPI.getByCategoria(categoria.id);
        setLuchas(luchasData || []);
      }
    } catch (err) {
      console.error('Error loading llave:', err);
      setError(err.message || 'Error al cargar la llave');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoria) {
      loadLlave();
    }
  }, [categoria]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Limpiar interval del cronómetro al desmontar
    return () => {
      if (cronometroInterval) {
        clearInterval(cronometroInterval);
      }
    };
  }, [cronometroInterval]);

  const handleGenerarLlave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await llaveAPI.generar(categoria.id);
      setSuccess('¡Llave generada exitosamente!');
      
      await loadLlave();
    } catch (err) {
      console.error('Error generando llave:', err);
      setError(err.message || 'Error al generar la llave');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerarLlave = async () => {
    if (!confirm('¿Estás seguro? Esto eliminará la llave actual y todas las luchas en progreso.')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await llaveAPI.regenerar(categoria.id);
      setSuccess('¡Llave regenerada exitosamente!');
      
      await loadLlave();
    } catch (err) {
      console.error('Error regenerando llave:', err);
      setError(err.message || 'Error al regenerar la llave');
    } finally {
      setLoading(false);
    }
  };

  const UNUSED_FORMAT_TIME = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${minutos}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEditarLucha = (lucha) => {
    // En el editor simplificado no usamos el cronómetro ni marcador
    if (cronometroInterval) {
      clearInterval(cronometroInterval);
    }
    setCronometroInterval(null);
    setCronometroActivo(false);
    setSelectedLucha(lucha);
  };

  const UNUSED_HANDLE_TOGGLE_CRONOMETRO = async () => {
    if (!selectedLucha) return;
    
    try {
      if (cronometroActivo) {
        // Pausar cronómetro
        clearInterval(cronometroInterval);
        setCronometroInterval(null);
        setCronometroActivo(false);
        
        // Actualizar estado a pausada
        await luchaAPI.update(selectedLucha.id, { 
          estado: 'pausada',
          tiempo_transcurrido: selectedLucha.tiempo_transcurrido 
        });
        
      } else {
        // Iniciar cronómetro
        setCronometroActivo(true);
        
        // Si es la primera vez, cambiar estado a en_progreso
        //if (selectedLucha.estado === 'pendiente') {
        //  await luchaAPI.update(selectedLucha.id, { estado: 'en_progreso' });
        //  setSelectedLucha(prev => ({ ...prev, estado: 'en_progreso' }));
        //}
        
        const interval = setInterval(() => {
          setSelectedLucha(prev => {
            const nuevoTiempo = prev.tiempo_transcurrido + 1;
            if (nuevoTiempo >= prev.duracion_segundos) {
              // Tiempo agotado
              clearInterval(interval);
              setCronometroInterval(null);
              setCronometroActivo(false);
              return { ...prev, tiempo_transcurrido: nuevoTiempo };
            }
            return { ...prev, tiempo_transcurrido: nuevoTiempo };
          });
        }, 1000);
        
        setCronometroInterval(interval);
      }
    } catch (err) {
      console.error('Error con cronómetro:', err);
      setError(err.message);
    }
  };

  const UNUSED_HANDLE_SUMAR_PUNTO = async (tipo, participante) => {
    if (!selectedLucha) return;
    
    const campo = `${tipo}_${participante}`;
    const nuevoValor = (selectedLucha[campo] || 0) + 1;
    
    try {
      const updateData = { [campo]: nuevoValor };
      await luchaAPI.update(selectedLucha.id, updateData);
      
      setSelectedLucha(prev => ({
        ...prev,
        [campo]: nuevoValor,
        [`puntos_${participante}`]: participante === 'p1' ? 
          UNUSED_CALCULAR_PUNTOS(prev, 'p1', tipo, nuevoValor) : 
          UNUSED_CALCULAR_PUNTOS(prev, 'p2', tipo, nuevoValor)
      }));
      
    } catch (err) {
      console.error('Error sumando punto:', err);
      setError(err.message);
    }
  };

  const UNUSED_HANDLE_SUMAR_VENTAJA = async (participante) => {
    if (!selectedLucha) return;
    
    const campo = `ventajas_${participante}`;
    const nuevoValor = (selectedLucha[campo] || 0) + 1;
    
    try {
      await luchaAPI.update(selectedLucha.id, { [campo]: nuevoValor });
      setSelectedLucha(prev => ({ ...prev, [campo]: nuevoValor }));
    } catch (err) {
      console.error('Error sumando ventaja:', err);
      setError(err.message);
    }
  };

  const UNUSED_HANDLE_SUMAR_PENALIZACION = async (participante) => {
    if (!selectedLucha) return;
    
    const campo = `penalizaciones_${participante}`;
    const nuevoValor = (selectedLucha[campo] || 0) + 1;
    
    try {
      await luchaAPI.update(selectedLucha.id, { [campo]: nuevoValor });
      setSelectedLucha(prev => ({ ...prev, [campo]: nuevoValor }));
    } catch (err) {
      console.error('Error sumando penalización:', err);
      setError(err.message);
    }
  };

  const UNUSED_CALCULAR_PUNTOS = (lucha, participante, tipoModificado = null, valorModificado = null) => {
    const montadas = tipoModificado === 'montadas' && participante === tipoModificado.split('_')[1] ? 
      valorModificado : (lucha[`montadas_${participante}`] || 0);
    const guardas = tipoModificado === 'guardas_pasadas' && participante === tipoModificado.split('_')[1] ? 
      valorModificado : (lucha[`guardas_pasadas_${participante}`] || 0);
    const rodillazos = tipoModificado === 'rodillazos' && participante === tipoModificado.split('_')[1] ? 
      valorModificado : (lucha[`rodillazos_${participante}`] || 0);
    const derribos = tipoModificado === 'derribos' && participante === tipoModificado.split('_')[1] ? 
      valorModificado : (lucha[`derribos_${participante}`] || 0);
    
    return montadas * 4 + guardas * 3 + (rodillazos + derribos) * 2;
  };

  const UNUSED_HANDLE_FINALIZAR_LUCHA = async (tipoVictoria, ganadorId = null, detalle = '') => {
    if (!selectedLucha) return;
    
    try {
      // Parar cronómetro si está activo
      if (cronometroInterval) {
        clearInterval(cronometroInterval);
        setCronometroInterval(null);
        setCronometroActivo(false);
      }
      
      const updateData = {
        tipo_victoria: tipoVictoria,
        resultado_detalle: detalle
      };
      
      // Determinar ganador automáticamente por puntos si no se especifica
      if (!ganadorId && tipoVictoria === 'puntos') {
        const puntosP1 = UNUSED_CALCULAR_PUNTOS(selectedLucha, 'p1');
        const puntosP2 = UNUSED_CALCULAR_PUNTOS(selectedLucha, 'p2');
        
        if (puntosP1 > puntosP2) {
          ganadorId = selectedLucha.participante1.id;
        } else if (puntosP2 > puntosP1) {
          ganadorId = selectedLucha.participante2.id;
        } else {
          // Empate, revisar ventajas
          const ventajasP1 = selectedLucha.ventajas_p1 || 0;
          const ventajasP2 = selectedLucha.ventajas_p2 || 0;
          
          if (ventajasP1 > ventajasP2) {
            ganadorId = selectedLucha.participante1.id;
          } else if (ventajasP2 > ventajasP1) {
            ganadorId = selectedLucha.participante2.id;
          }
          // Si siguen empatados, no se asigna ganador automáticamente
        }
      }
      
      const payloadFinalizar = ganadorId ? { ...updateData, ganador_id: Number(ganadorId) } : updateData;
      await luchaAPI.finalizar(selectedLucha.id, payloadFinalizar);
      setSuccess('¡Lucha finalizada exitosamente!');
      
      // Promocionar automáticamente al ganador a la siguiente ronda en la estructura de la llave
      try {
        if (!ganadorId && tipoVictoria !== 'puntos') {
          // Si no se calculó ganador por puntos, intentar deducirlo desde selectedLucha.ganador
          ganadorId = selectedLucha.ganador?.id || selectedLucha.ganador || null;
        }
        if (ganadorId && llave && llave.estructura && Array.isArray(llave.estructura.rondas)) {
          const estructuraNueva = JSON.parse(JSON.stringify(llave.estructura));
          const rondas = estructuraNueva.rondas || [];
          const currentRoundIdx = rondas.findIndex(r => r.nombre === selectedLucha.ronda);
          const nextRoundIdx = currentRoundIdx >= 0 ? currentRoundIdx + 1 : -1;
          if (nextRoundIdx >= 0 && nextRoundIdx < rondas.length) {
            const luchasRondaActual = rondas[currentRoundIdx]?.luchas || [];
            // Intentar localizar posición por campo posicion_llave o por coincidencia de IDs
            let pos = typeof selectedLucha.posicion_llave === 'number' ? selectedLucha.posicion_llave : -1;
            if (pos < 0) {
              const p1Id = selectedLucha.participante1?.id || selectedLucha.participante1;
              const p2Id = selectedLucha.participante2?.id || selectedLucha.participante2;
              pos = luchasRondaActual.findIndex(l => {
                const e1 = l?.participante1?.id;
                const e2 = l?.participante2?.id;
                return e1 === p1Id && e2 === p2Id;
              });
            }
            if (pos >= 0) {
              const destFightIdx = Math.floor(pos / 2);
              const destSlot = (pos % 2 === 0) ? 'participante1' : 'participante2';
              const nextRound = rondas[nextRoundIdx];
              const nextFight = nextRound?.luchas?.[destFightIdx];
              if (nextFight) {
                // Construir objeto de ganador con info visible
                let ganadorNombre = '';
                let ganadorAcademia = '';
                if (ganadorId === (selectedLucha.participante1?.id || selectedLucha.participante1)) {
                  ganadorNombre = selectedLucha.participante1_nombre || selectedLucha.participante1?.nombre || '';
                  ganadorAcademia = selectedLucha.participante1_academia || '';
                } else {
                  ganadorNombre = selectedLucha.participante2_nombre || selectedLucha.participante2?.nombre || '';
                  ganadorAcademia = selectedLucha.participante2_academia || '';
                }
                nextFight[destSlot] = { id: Number(ganadorId), nombre: ganadorNombre, academia: ganadorAcademia };
                await llaveAPI.update(llave.id, { estructura: estructuraNueva });
              }
            }
          }
        }
      } catch (promErr) {
        console.warn('No se pudo promocionar automáticamente al ganador:', promErr);
      }

      // Recargar datos
      await loadLlave();
      setSelectedLucha(null);
      
    } catch (err) {
      console.error('Error finalizando lucha:', err);
      setError(err.message);
    }
  };

  const renderLlaveVisualization = () => {
    if (!llave || !llave.estructura || !llave.estructura.rondas) {
      return <div className="text-gray-500">No hay llave generada</div>;
    }
    
    const rondas = llave.estructura.rondas;
    const gridTemplate = `repeat(${rondas.length}, minmax(220px, 1fr))`;

    return (
      <div className="llave-visualization">
        <h4 className="text-lg font-semibold mb-4">Llave del Torneo</h4>
        <div className="bracket" style={{ display: 'grid', gridTemplateColumns: gridTemplate, gap: 16, overflowX: 'auto' }}>
          {rondas.map((ronda, rondaIdx) => (
            <div key={rondaIdx} className="bracket-column">
              <div className="bracket-round-title">{ronda.nombre}</div>
              <div className="bracket-column-matches">
                {ronda.luchas.map((lucha, luchaIdx) => {
                  const luchaReal = Array.isArray(luchas) ? luchas.find(l => {
                    const p1Id = l.participante1?.id || l.participante1;
                    const p2Id = l.participante2?.id || l.participante2;
                    const eP1Id = lucha.participante1?.id;
                    const eP2Id = lucha.participante2?.id;
                    return p1Id === eP1Id && p2Id === eP2Id;
                  }) : null;
                  const p1 = lucha.participante1;
                  const p2 = lucha.participante2;
                  const isBye = p2 && p2.bye;
                  return (
                    <div key={luchaIdx} className={`bracket-match ${isBye ? 'is-bye' : ''}`}>
                      <div className="bracket-player">
                        <span>{p1 ? p1.nombre : 'TBD'}</span>
                      </div>
                      <div className="bracket-player">
                        <span>{p2 ? (isBye ? 'BYE' : p2.nombre) : 'TBD'}</span>
                      </div>
                      <div className="bracket-actions">
                        {luchaReal && !isBye && (
                          <button onClick={() => handleEditarLucha(luchaReal)} className="btn btn-small btn-primary">Editar</button>
                        )}
                        {lucha.ganador && (
                          <div className="bracket-winner">🏆 {lucha.ganador.nombre}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Editor simplificado: reacomodar manualmente luchas (mover/intercambiar), sin scorer
  const moveFight = async (fromIndex, toIndex) => {
    if (!llave || !llave.estructura) return;
    const estructuraNueva = JSON.parse(JSON.stringify(llave.estructura));
    const rondas = estructuraNueva.rondas || [];
    const roundIdx = rondas.findIndex(r => r.nombre === selectedLucha.ronda);
    if (roundIdx < 0) return;
    const fights = rondas[roundIdx].luchas || [];
    if (toIndex < 0 || toIndex >= fights.length) return;
    const [removed] = fights.splice(fromIndex, 1);
    fights.splice(toIndex, 0, removed);
    // Actualizar posicion_llave para las luchas reales afectadas (si existen)
    try {
      for (let i = 0; i < fights.length; i++) {
        const card = fights[i];
        const real = Array.isArray(luchas) ? luchas.find(lx => {
          const p1 = lx.participante1?.id || lx.participante1;
          const p2 = lx.participante2?.id || lx.participante2;
          return p1 === (card?.participante1?.id) && p2 === (card?.participante2?.id) && lx.ronda === rondas[roundIdx].nombre;
        }) : null;
        if (real && real.posicion_llave !== i) {
          await luchaAPI.update(real.id, { posicion_llave: i });
        }
      }
    } catch (e) {
      console.warn('No se pudo actualizar posicion_llave:', e);
    }
    await llaveAPI.update(llave.id, { estructura: estructuraNueva });
    setLlave({ ...llave, estructura: estructuraNueva });
    await loadLlave();
  };

  const swapFights = async (indexA, indexB) => {
    if (!llave || !llave.estructura) return;
    const estructuraNueva = JSON.parse(JSON.stringify(llave.estructura));
    const rondas = estructuraNueva.rondas || [];
    const roundIdx = rondas.findIndex(r => r.nombre === selectedLucha.ronda);
    if (roundIdx < 0) return;
    const fights = rondas[roundIdx].luchas || [];
    if (indexA < 0 || indexB < 0 || indexA >= fights.length || indexB >= fights.length) return;
    const tmp = fights[indexA];
    fights[indexA] = fights[indexB];
    fights[indexB] = tmp;
    try {
      // Recalcular y persistir posicion_llave
      for (let i = 0; i < fights.length; i++) {
        const card = fights[i];
        const real = Array.isArray(luchas) ? luchas.find(lx => {
          const p1 = lx.participante1?.id || lx.participante1;
          const p2 = lx.participante2?.id || lx.participante2;
          return p1 === (card?.participante1?.id) && p2 === (card?.participante2?.id) && lx.ronda === rondas[roundIdx].nombre;
        }) : null;
        if (real && real.posicion_llave !== i) {
          await luchaAPI.update(real.id, { posicion_llave: i });
        }
      }
    } catch (e) {
      console.warn('No se pudo actualizar posicion_llave (swap):', e);
    }
    await llaveAPI.update(llave.id, { estructura: estructuraNueva });
    setLlave({ ...llave, estructura: estructuraNueva });
    await loadLlave();
  };

  const renderLuchaEditor = () => {
    if (!selectedLucha) return null;
    
    const roundFights = (llave?.estructura?.rondas?.find(r => r.nombre === selectedLucha.ronda)?.luchas) || [];
    const idxActual = roundFights.findIndex(l => {
      const p1 = selectedLucha.participante1?.id || selectedLucha.participante1;
      const p2 = selectedLucha.participante2?.id || selectedLucha.participante2;
      return l?.participante1?.id === p1 && l?.participante2?.id === p2;
    });
    
    return (
      <div className="lucha-editor border-t-2 pt-4 mt-4">
        <h4 className="text-lg font-semibold mb-2">Reordenar lucha</h4>
        <p className="text-sm text-gray-600 mb-4">{selectedLucha.participante1.nombre} vs {selectedLucha.participante2.nombre} — {selectedLucha.ronda}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => moveFight(idxActual, idxActual - 1)} className="px-3 py-2 bg-gray-200 rounded">↑ Mover arriba</button>
          <button onClick={() => moveFight(idxActual, idxActual + 1)} className="px-3 py-2 bg-gray-200 rounded">↓ Mover abajo</button>
          {idxActual > 0 && (
            <button onClick={() => swapFights(idxActual, idxActual - 1)} className="px-3 py-2 bg-gray-200 rounded">⇄ Intercambiar con anterior</button>
          )}
          {idxActual < roundFights.length - 1 && (
            <button onClick={() => swapFights(idxActual, idxActual + 1)} className="px-3 py-2 bg-gray-200 rounded">⇄ Intercambiar con siguiente</button>
          )}
          <button onClick={() => setSelectedLucha(null)} className="px-3 py-2 bg-gray-600 text-white rounded">Cerrar</button>
        </div>
        <div className="text-xs text-gray-500">Al reordenar se actualiza la posición en la llave y se sincronizan las luchas reales vinculadas.</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="llave-manager p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Llave - {categoria.nombre}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2">Cargando llave...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="llave-manager p-4 border rounded-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Llave - {categoria.nombre}</h3>
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ✕
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span>{error}</span>
          <button onClick={loadLlave} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">Reintentar</button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {!llave && (
        <div className="text-center py-8">
          <p className="mb-4">No hay llave generada para esta categoría</p>
          <button
            onClick={handleGenerarLlave}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 font-semibold"
          >
            Generar Llave
          </button>
        </div>
      )}
      
      {llave && (
        <div>
          <div className="flex space-x-4 mb-6">
            <button
              onClick={handleRegenerarLlave}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              disabled={llave.bloqueada}
            >
              Regenerar Llave
            </button>
            
            <div className="flex items-center space-x-2 text-sm">
              <span>Estado:</span>
              <span className={`px-2 py-1 rounded text-white ${
                llave.finalizada ? 'bg-green-500' : 
                llave.bloqueada ? 'bg-red-500' : 'bg-blue-500'
              }`}>
                {llave.finalizada ? 'Finalizada' : 
                 llave.bloqueada ? 'Bloqueada' : 'Activa'}
              </span>
            </div>
          </div>
          
          {renderLlaveVisualization()}
          {renderLuchaEditor()}
        </div>
      )}
    </div>
  );
}