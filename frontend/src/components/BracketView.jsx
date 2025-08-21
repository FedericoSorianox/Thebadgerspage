import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { llaveAPI, luchaAPI } from '../services/api-new.js';
import FightScorer from './FightScorer.jsx';

export default function BracketView({ categoria, onManage }) {
  const auth = useAuth();
  const isAdmin = auth?.isAdmin ? auth.isAdmin() : false;
  const [llave, setLlave] = useState(null);
  const [luchas, setLuchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openScorer, setOpenScorer] = useState(false);
  const [scorerLuchaId, setScorerLuchaId] = useState(null);
  // Sin bandeja: no mantenemos catálogo de participantes

  // Recalcula y sincroniza la estructura de la llave a partir de las luchas actuales
  const recalcEstructura = async () => {
    try {
      const [refLuchas, refLlave] = await Promise.all([
        luchaAPI.getByCategoria(categoria.id),
        llaveAPI.getByCategoria(categoria.id)
      ]);
      const arr = Array.isArray(refLuchas?.results) ? refLuchas.results : Array.isArray(refLuchas) ? refLuchas : [];
      if (refLlave && refLlave.estructura && Array.isArray(refLlave.estructura.rondas)) {
        const estructuraNueva = JSON.parse(JSON.stringify(refLlave.estructura));
        estructuraNueva.rondas.forEach((r, rondaIdx) => {
          (r.luchas || []).forEach((card, luchaIdx) => {
            let real = Array.isArray(arr) ? arr.find(lx => lx.ronda === r.nombre && lx.posicion_llave === luchaIdx) : null;
            if (!real && Array.isArray(arr)) {
              real = arr.find(lx => {
                const p1 = lx.participante1?.id || lx.participante1;
                const p2 = lx.participante2?.id || lx.participante2;
                const e1 = card?.participante1?.id;
                const e2 = card?.participante2?.id;
                return p1 === e1 && p2 === e2 && lx.ronda === r.nombre;
              }) || null;
            }
            if (card && 'ganador' in card) card.ganador = null;
            if (real) {
              const p1Id = real.participante1?.id || real.participante1 || null;
              const p2Id = real.participante2?.id || real.participante2 || null;
              const p1Nombre = real.participante1_nombre || real.participante1?.nombre || '';
              const p2Nombre = real.participante2_nombre || real.participante2?.nombre || '';
              const p1Academia = real.participante1_academia || '';
              const p2Academia = real.participante2_academia || '';
              card.participante1 = p1Id ? { id: p1Id, nombre: p1Nombre, academia: p1Academia } : null;
              card.participante2 = p2Id ? { id: p2Id, nombre: p2Nombre, academia: p2Academia } : null;
            } else if (rondaIdx > 0) {
              const isBye1 = card?.participante1?.bye === true;
              const isBye2 = card?.participante2?.bye === true;
              card.participante1 = isBye1 ? card.participante1 : null;
              card.participante2 = isBye2 ? card.participante2 : null;
            }
          });
        });
        await llaveAPI.update(refLlave.id, { estructura: estructuraNueva });
        setLlave({ ...refLlave, estructura: estructuraNueva });
      } else if (refLlave) {
        setLlave(refLlave);
      }
      setLuchas(arr);
    } catch (e) {
      console.warn('Recalc estructura falló:', e);
    }
  };

  const reload = async () => {
    try {
      setLoading(true);
      setError(null);
      const l = await llaveAPI.getByCategoria(categoria.id);
      const lu = await luchaAPI.getByCategoria(categoria.id);
      setLlave(l);
      const luchasArray = Array.isArray(lu?.results) ? lu.results : Array.isArray(lu) ? lu : [];
      setLuchas(luchasArray);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const l = await llaveAPI.getByCategoria(categoria.id);
        const lu = await luchaAPI.getByCategoria(categoria.id);
        if (!mounted) return;
        setLlave(l);
        const luchasArray = Array.isArray(lu?.results) ? lu.results : Array.isArray(lu) ? lu : [];
        setLuchas(luchasArray);
        // Sin bandeja, no cargamos catálogo de participantes
      } catch (e) {
        if (!mounted) return;
        setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [categoria?.id, categoria?.torneo])

  const hayEnProgreso = Array.isArray(luchas) && luchas.some(l => l.estado === 'en_progreso');

  if (loading) return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      minHeight: 160,
      border: '1px dashed rgba(0,0,0,0.1)',
      borderRadius: 12,
      background: '#fafafa'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#374151', fontSize: 16 }}>
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span>Cargando llave y luchas…</span>
      </div>
    </div>
  );
  if (error) return (
    <div className="text-sm text-red-600" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span>❌ {error}</span>
      <button className="btn btn-primary" onClick={reload}>Reintentar</button>
    </div>
  );
  if (!llave || !llave.estructura || !llave.estructura.rondas) {
    return (
      <div className="llave-visualization">
        <div className="text-gray-600">No hay llave generada para esta categoría.</div>
        {onManage && (
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={onManage}>✏️ Editar</button>
        )}
      </div>
    );
  }

  const rondas = llave.estructura.rondas;
  const gridTemplate = `repeat(${rondas.length}, minmax(220px, 1fr))`;

  return (
    <div className="llave-visualization">
      <div className="flex items-center justify-center mb-6 relative">
        <h4 className="text-3xl font-semibold text-center">{categoria.nombre}</h4>
        {onManage && (
          <button className="btn btn-primary absolute right-0" onClick={onManage}>✏️ Editar</button>
        )}
        <button
          className="btn btn-secondary absolute left-0"
          onClick={async () => {
            const ok = window.confirm('¿Reiniciar TODAS las luchas? Pondrá puntajes en 0 y estado pendiente.');
            if (!ok) return;
            try {
              const payloadBase = {
                estado: 'pendiente',
                cronometro_activo: false,
                tiempo_transcurrido: 0,
                // P1
                puntos_p1: 0, ventajas_p1: 0, penalizaciones_p1: 0,
                montadas_p1: 0, guardas_pasadas_p1: 0, rodillazos_p1: 0, derribos_p1: 0,
                // P2
                puntos_p2: 0, ventajas_p2: 0, penalizaciones_p2: 0,
                montadas_p2: 0, guardas_pasadas_p2: 0, rodillazos_p2: 0, derribos_p2: 0,
                // Resultado
                ganador: null,
                tipo_victoria: '',
                resultado_detalle: '',
                fecha_inicio: null,
                fecha_fin: null,
              };
              const ids = Array.isArray(luchas) ? luchas.map(l => l.id) : [];
              await Promise.all(ids.map(id => luchaAPI.update(id, payloadBase)));
              // Refrescar luchas y llave
              const [refLuchas, refLlave] = await Promise.all([
                luchaAPI.getByCategoria(categoria.id),
                llaveAPI.getByCategoria(categoria.id)
              ]);
              const arr = Array.isArray(refLuchas?.results) ? refLuchas.results : Array.isArray(refLuchas) ? refLuchas : [];
              setLuchas(arr);
              // Sincronizar estructura con participantes actuales de luchas y limpiar ganadores
              if (refLlave && refLlave.estructura && Array.isArray(refLlave.estructura.rondas)) {
                const estructuraNueva = JSON.parse(JSON.stringify(refLlave.estructura));
                estructuraNueva.rondas.forEach((r, rondaIdx) => {
                  const luchasRonda = r.luchas || [];
                  luchasRonda.forEach((card, luchaIdx) => {
                    // Buscar lucha real por ronda y posicion_llave
                    let real = Array.isArray(arr) ? arr.find(lx => lx.ronda === r.nombre && lx.posicion_llave === luchaIdx) : null;
                    if (!real && Array.isArray(arr)) {
                      // Fallback por participantes
                      real = arr.find(lx => {
                        const p1 = lx.participante1?.id || lx.participante1;
                        const p2 = lx.participante2?.id || lx.participante2;
                        const e1 = card?.participante1?.id;
                        const e2 = card?.participante2?.id;
                        return p1 === e1 && p2 === e2 && lx.ronda === r.nombre;
                      }) || null;
                    }
                    // Limpiar ganador siempre
                    if (card && 'ganador' in card) {
                      card.ganador = null;
                    }
                    if (real) {
                      const p1Id = real.participante1?.id || real.participante1 || null;
                      const p2Id = real.participante2?.id || real.participante2 || null;
                      const p1Nombre = real.participante1_nombre || real.participante1?.nombre || '';
                      const p2Nombre = real.participante2_nombre || real.participante2?.nombre || '';
                      const p1Academia = real.participante1_academia || '';
                      const p2Academia = real.participante2_academia || '';
                      card.participante1 = p1Id ? { id: p1Id, nombre: p1Nombre, academia: p1Academia } : null;
                      card.participante2 = p2Id ? { id: p2Id, nombre: p2Nombre, academia: p2Academia } : null;
                    } else if (rondaIdx > 0) {
                      // Si no hay lucha real, limpiar tarjetas de rondas siguientes
                      if (card) {
                        // Mantener BYE si existía explícito
                        const isBye1 = card?.participante1?.bye === true;
                        const isBye2 = card?.participante2?.bye === true;
                        card.participante1 = isBye1 ? card.participante1 : null;
                        card.participante2 = isBye2 ? card.participante2 : null;
                      }
                    }
                  });
                });
                await llaveAPI.update(refLlave.id, { estructura: estructuraNueva });
                setLlave({ ...refLlave, estructura: estructuraNueva });
              } else if (refLlave) {
                setLlave(refLlave);
              }
            } catch (e) {
              console.error('Error al reiniciar luchas:', e);
            }
          }}
        >↺ Reiniciar luchas</button>
        {isAdmin && (
          <button
            className="btn btn-secondary absolute left-40"
            onClick={async () => {
              try {
                // Forzar recalculo/sincronización de estructura desde luchas actuales
                const [refLuchas, refLlave] = await Promise.all([
                  luchaAPI.getByCategoria(categoria.id),
                  llaveAPI.getByCategoria(categoria.id)
                ]);
                const arr = Array.isArray(refLuchas?.results) ? refLuchas.results : Array.isArray(refLuchas) ? refLuchas : [];
                if (refLlave && refLlave.estructura && Array.isArray(refLlave.estructura.rondas)) {
                  const estructuraNueva = JSON.parse(JSON.stringify(refLlave.estructura));
                  estructuraNueva.rondas.forEach((r, rondaIdx) => {
                    (r.luchas || []).forEach((card, luchaIdx) => {
                      let real = Array.isArray(arr) ? arr.find(lx => lx.ronda === r.nombre && lx.posicion_llave === luchaIdx) : null;
                      if (!real && Array.isArray(arr)) {
                        real = arr.find(lx => {
                          const p1 = lx.participante1?.id || lx.participante1;
                          const p2 = lx.participante2?.id || lx.participante2;
                          const e1 = card?.participante1?.id;
                          const e2 = card?.participante2?.id;
                          return p1 === e1 && p2 === e2 && lx.ronda === r.nombre;
                        }) || null;
                      }
                      if (card && 'ganador' in card) card.ganador = null;
                      if (real) {
                        const p1Id = real.participante1?.id || real.participante1 || null;
                        const p2Id = real.participante2?.id || real.participante2 || null;
                        const p1Nombre = real.participante1_nombre || real.participante1?.nombre || '';
                        const p2Nombre = real.participante2_nombre || real.participante2?.nombre || '';
                        const p1Academia = real.participante1_academia || '';
                        const p2Academia = real.participante2_academia || '';
                        card.participante1 = p1Id ? { id: p1Id, nombre: p1Nombre, academia: p1Academia } : null;
                        card.participante2 = p2Id ? { id: p2Id, nombre: p2Nombre, academia: p2Academia } : null;
                      } else if (rondaIdx > 0) {
                        const isBye1 = card?.participante1?.bye === true;
                        const isBye2 = card?.participante2?.bye === true;
                        card.participante1 = isBye1 ? card.participante1 : null;
                        card.participante2 = isBye2 ? card.participante2 : null;
                      }
                    });
                  });
                  await llaveAPI.update(refLlave.id, { estructura: estructuraNueva });
                  setLlave({ ...refLlave, estructura: estructuraNueva });
                  setLuchas(arr);
                }
              } catch (e) {
                console.warn('Recalcular estructura falló:', e);
              }
            }}
          >⟳ Recalcular estructura</button>
        )}
      </div>
      
      {/* Bandeja de participantes eliminada */}

      <div className="bracket" style={{ 
        display: 'grid', 
        gridTemplateColumns: gridTemplate, 
        gap: 16, 
        overflowX: 'auto' 
      }}>
        {rondas.map((ronda, rondaIdx) => (
          <div key={rondaIdx} className="bracket-column">
            <div className="bracket-round-title">{ronda.nombre}</div>
            <div className="bracket-column-matches">
              {ronda.luchas.map((lucha, luchaIdx) => {
                // Intentar mapear la tarjeta del bracket a una Lucha real
                let r = Array.isArray(luchas) ? luchas.find(l => {
                  const p1Id = l.participante1?.id || l.participante1;
                  const p2Id = l.participante2?.id || l.participante2;
                  const eP1Id = lucha.participante1?.id;
                  const eP2Id = lucha.participante2?.id;
                  return p1Id === eP1Id && p2Id === eP2Id;
                }) : null;
                // Fallback por ronda + posicion en la llave (primera ronda y rondas creadas)
                if (!r && Array.isArray(luchas)) {
                  r = luchas.find(lx => lx.ronda === ronda.nombre && lx.posicion_llave === luchaIdx) || null;
                }
                const p1 = lucha.participante1;
                const p2 = lucha.participante2;
                const isBye = p2 && p2.bye;
                
                return (
                  <div 
                    key={luchaIdx} 
                    className={`bracket-match ${isBye ? 'is-bye' : ''}`}
                    style={{
                      position: 'relative',
                      border: '1px solid rgba(0, 0, 0, 0.12)',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Header de acciones/estado */}
                    {r && (
                      <div style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        {/* Estado oculto: badge eliminado para dejar solo iconos */}
                        {/* Botón Comenzar solo si está pendiente */}
                        {r.estado === 'pendiente' && !hayEnProgreso && !openScorer && (
                          <button
                            onClick={async (ev) => {
                              ev.stopPropagation();
                              try {
                                // Abrir marcador sin cambiar estado aún; el botón interno mostrará "Iniciar"
                                setOpenScorer(true);
                                setScorerLuchaId(r.id);
                              } catch (err) {
                                console.error('Error al iniciar lucha:', err);
                              }
                            }}
                            style={{
                              background: 'linear-gradient(90deg,#4f46e5,#3b82f6)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '9999px',
                              width: 28,
                              height: 28,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                              cursor: 'pointer'
                            }}
                            title="Comenzar lucha"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M8 5v14l11-7z"></path>
                            </svg>
                          </button>
                        )}
                        {/* Botón Reiniciar por lucha (también permite reiniciar si está en progreso) */}
                        {(
                          <>
                          <button
                            onClick={async (ev) => {
                              ev.stopPropagation();
                              const enCurso = r.estado === 'en_progreso';
                              const ok = window.confirm(enCurso
                                ? 'Esta lucha está en progreso. ¿Deseas DETENER y REINICIAR (puntajes a 0 y estado pendiente)?'
                                : '¿Reiniciar solo esta lucha?');
                              if (!ok) return;
                              try {
                                const payload = {
                                  estado: 'pendiente',
                                  cronometro_activo: false,
                                  tiempo_transcurrido: 0,
                                  puntos_p1: 0, ventajas_p1: 0, penalizaciones_p1: 0,
                                  montadas_p1: 0, guardas_pasadas_p1: 0, rodillazos_p1: 0, derribos_p1: 0,
                                  puntos_p2: 0, ventajas_p2: 0, penalizaciones_p2: 0,
                                  montadas_p2: 0, guardas_pasadas_p2: 0, rodillazos_p2: 0, derribos_p2: 0,
                                  ganador: null,
                                  tipo_victoria: '',
                                  resultado_detalle: '',
                                  fecha_inicio: null,
                                  fecha_fin: null,
                                };
                                await luchaAPI.update(r.id, payload);
                                // Cerrar el marcador si está abierto
                                setOpenScorer(false);
                                await recalcEstructura();
                              } catch (err) {
                                console.error('Error al reiniciar lucha:', err);
                              }
                            }}
                            style={{
                              background: '#f3f4f6',
                              color: '#111827',
                              border: '1px solid #e5e7eb',
                              borderRadius: '9999px',
                              width: 28,
                              height: 28,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              cursor: 'pointer'
                            }}
                            title="Reiniciar lucha"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M17.65 6.35A7.95 7.95 0 0012 4V1L7 6l5 5V7a5 5 0 11-4.9 6h-2.02A7 7 0 1020 12c0-1.61-.55-3.09-1.47-4.25l-.88.6z"></path>
                            </svg>
                          </button>
                          </>
                        )}
                        {r.estado !== 'pendiente' && hayEnProgreso && r.estado !== 'en_progreso' && (
                          <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Otra lucha en curso</span>
                        )}
                      </div>
                    )}
                    <div 
                      className={`bracket-player ${p1 ? 'has-player' : 'empty'}`}
                      style={{ padding:'8px 12px', borderBottom:'1px solid rgba(255,255,255,0.1)', display:'flex', justifyContent:'space-between', alignItems:'center', minHeight:'40px' }}
                    >
                      <span style={{ color: '#111827', fontWeight: p1 ? '600' : '400' }}>
                        {p1 ? p1.nombre : 'Arrastra participante aquí'}
                      </span>
                      <span className="text-xs" style={{ color: '#6b7280' }}>
                        {r ? (r.puntos_p1 || 0) : 0}
                      </span>
                    </div>
                    
                    <div 
                      className={`bracket-player ${p2 ? 'has-player' : 'empty'}`}
                      style={{ padding:'8px 12px', display:'flex', justifyContent:'space-between', alignItems:'center', minHeight:'40px' }}
                    >
                      <span style={{ color: '#111827', fontWeight: p2 ? '600' : '400' }}>
                        {p2 ? (isBye ? 'BYE' : p2.nombre) : 'Arrastra participante aquí'}
                      </span>
                      <span className="text-xs" style={{ color: '#6b7280' }}>
                        {r ? (r.puntos_p2 || 0) : 0}
                      </span>
                    </div>
                    
                    {r && r.estado === 'finalizada' && (
                      <div className="bracket-winner" style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        backgroundColor: '#f39c12',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        🏆 {r.ganador_nombre || 'Finalizada'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-sm text-center mt-4" style={{ 
        color: '#374151',
        padding: '12px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid rgba(0, 0, 0, 0.1)'
      }}>
        💡 <strong>Instrucciones:</strong> Usa «Editar» para reacomodar luchas manualmente.
      </div>
      {openScorer && (
        <FightScorer
          categoria={categoria}
          initialLuchaId={scorerLuchaId}
          onClose={() => {
            setOpenScorer(false);
            setScorerLuchaId(null);
            // Recalcular para sincronizar cambios posteriores a finalizar o reiniciar
            recalcEstructura();
          }}
        />
      )}
    </div>
  );
}


