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

  const formatTime = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${minutos}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEditarLucha = (lucha) => {
    // Parar cronómetro si está activo
    if (cronometroInterval) {
      clearInterval(cronometroInterval);
      setCronometroInterval(null);
      setCronometroActivo(false);
    }
    
    setSelectedLucha(lucha);
  };

  const handleToggleCronometro = async () => {
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
        if (selectedLucha.estado === 'pendiente') {
          await luchaAPI.update(selectedLucha.id, { estado: 'en_progreso' });
          setSelectedLucha(prev => ({ ...prev, estado: 'en_progreso' }));
        }
        
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

  const handleSumarPunto = async (tipo, participante) => {
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
          calcularPuntos(prev, 'p1', tipo, nuevoValor) : 
          calcularPuntos(prev, 'p2', tipo, nuevoValor)
      }));
      
    } catch (err) {
      console.error('Error sumando punto:', err);
      setError(err.message);
    }
  };

  const handleSumarVentaja = async (participante) => {
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

  const handleSumarPenalizacion = async (participante) => {
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

  const calcularPuntos = (lucha, participante, tipoModificado = null, valorModificado = null) => {
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

  const handleFinalizarLucha = async (tipoVictoria, ganadorId = null, detalle = '') => {
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
        const puntosP1 = calcularPuntos(selectedLucha, 'p1');
        const puntosP2 = calcularPuntos(selectedLucha, 'p2');
        
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

  const renderLuchaEditor = () => {
    if (!selectedLucha) return null;
    
    const tiempoRestante = selectedLucha.duracion_segundos - selectedLucha.tiempo_transcurrido;
    const puntosP1 = calcularPuntos(selectedLucha, 'p1');
    const puntosP2 = calcularPuntos(selectedLucha, 'p2');
    
    return (
      <div className="lucha-editor border-t-2 pt-4 mt-4">
        <h4 className="text-lg font-semibold mb-4">
          Editando Lucha: {selectedLucha.participante1.nombre} vs {selectedLucha.participante2.nombre}
        </h4>
        
        {/* Cronómetro */}
        <div className="cronometro mb-6 text-center">
          <div className="text-3xl font-bold mb-2">
            {formatTime(Math.max(0, tiempoRestante))}
          </div>
          <div className="space-x-2">
            <button
              onClick={handleToggleCronometro}
              className={`px-4 py-2 rounded font-semibold ${
                cronometroActivo 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {cronometroActivo ? 'PAUSAR' : 'INICIAR'}
            </button>
            <button
              onClick={() => setSelectedLucha(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cerrar
            </button>
          </div>
        </div>
        
        {/* Marcador */}
        <div className="marcador grid grid-cols-2 gap-6 mb-6">
          {/* Participante 1 */}
          <div className="participante-1 border rounded p-4">
            <h5 className="font-semibold text-center mb-3">{selectedLucha.participante1.nombre}</h5>
            
            <div className="puntos text-center mb-3">
              <div className="text-2xl font-bold text-blue-600">{puntosP1} puntos</div>
              <div className="text-sm text-gray-600">
                Ventajas: {selectedLucha.ventajas_p1 || 0} | Penalizaciones: {selectedLucha.penalizaciones_p1 || 0}
              </div>
            </div>
            
            <div className="acciones space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleSumarPunto('montadas', 'p1')}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Montada (4pts) [{selectedLucha.montadas_p1 || 0}]
                </button>
                <button 
                  onClick={() => handleSumarPunto('guardas_pasadas', 'p1')}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Guarda (3pts) [{selectedLucha.guardas_pasadas_p1 || 0}]
                </button>
                <button 
                  onClick={() => handleSumarPunto('rodillazos', 'p1')}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Rodillazo (2pts) [{selectedLucha.rodillazos_p1 || 0}]
                </button>
                <button 
                  onClick={() => handleSumarPunto('derribos', 'p1')}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Derribo (2pts) [{selectedLucha.derribos_p1 || 0}]
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleSumarVentaja('p1')}
                  className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  Ventaja
                </button>
                <button 
                  onClick={() => handleSumarPenalizacion('p1')}
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                >
                  Penalización
                </button>
              </div>
            </div>
          </div>
          
          {/* Participante 2 */}
          <div className="participante-2 border rounded p-4">
            <h5 className="font-semibold text-center mb-3">{selectedLucha.participante2.nombre}</h5>
            
            <div className="puntos text-center mb-3">
              <div className="text-2xl font-bold text-green-600">{puntosP2} puntos</div>
              <div className="text-sm text-gray-600">
                Ventajas: {selectedLucha.ventajas_p2 || 0} | Penalizaciones: {selectedLucha.penalizaciones_p2 || 0}
              </div>
            </div>
            
            <div className="acciones space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleSumarPunto('montadas', 'p2')}
                  className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                >
                  Montada (4pts) [{selectedLucha.montadas_p2 || 0}]
                </button>
                <button 
                  onClick={() => handleSumarPunto('guardas_pasadas', 'p2')}
                  className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                >
                  Guarda (3pts) [{selectedLucha.guardas_pasadas_p2 || 0}]
                </button>
                <button 
                  onClick={() => handleSumarPunto('rodillazos', 'p2')}
                  className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                >
                  Rodillazo (2pts) [{selectedLucha.rodillazos_p2 || 0}]
                </button>
                <button 
                  onClick={() => handleSumarPunto('derribos', 'p2')}
                  className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                >
                  Derribo (2pts) [{selectedLucha.derribos_p2 || 0}]
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleSumarVentaja('p2')}
                  className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  Ventaja
                </button>
                <button 
                  onClick={() => handleSumarPenalizacion('p2')}
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                >
                  Penalización
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Finalizar lucha */}
        <div className="finalizar-lucha">
          <h6 className="font-medium mb-2">Finalizar Lucha:</h6>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => handleFinalizarLucha('puntos')}
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
            >
              Por Puntos
            </button>
            <button
              onClick={() => {
                const detalle = prompt('¿Qué tipo de sumisión?');
                if (detalle) {
                  const ganador = prompt('¿Quién ganó? 1 o 2') === '1' ? 
                    selectedLucha.participante1.id : selectedLucha.participante2.id;
                  handleFinalizarLucha('sumision', ganador, detalle);
                }
              }}
              className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700"
            >
              Por Sumisión
            </button>
            <button
              onClick={() => handleFinalizarLucha('ventajas')}
              className="bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700"
            >
              Por Ventajas
            </button>
            <button
              onClick={() => {
                const ganador = prompt('¿Quién ganó por penalización? 1 o 2') === '1' ? 
                  selectedLucha.participante1.id : selectedLucha.participante2.id;
                handleFinalizarLucha('penalizacion', ganador);
              }}
              className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
            >
              Por Penalización
            </button>
          </div>
        </div>
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