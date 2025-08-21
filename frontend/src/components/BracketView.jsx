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
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={onManage}>⚙️ Gestionar</button>
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
          <button className="btn btn-primary absolute right-0" onClick={onManage}>⚙️ Gestionar</button>
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
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer) {
                        e.dataTransfer.dropEffect = 'move';
                      }
                      e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.7)';
                      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.06)';
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      
                      let pid = null;
                      try {
                        pid = e.dataTransfer.getData('participant-id') || e.dataTransfer.getData('text/plain');
                      } catch {
                        return;
                      }
                      if (!pid) return;
                      const fromLuchaIdRaw = e.dataTransfer.getData('from-lucha-id');
                      const fromSlot = e.dataTransfer.getData('from-slot');
                      
                      try {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const y = e.clientY - rect.top;
                        const isTopHalf = y < rect.height / 2;
                        const slot = isTopHalf ? 'participante1' : 'participante2';
                        
                        if (r) {
                          const pidNum = Number(pid);
                          const currentSlotParticipantId = (r[slot]?.id || r[slot]) ?? null;
                          if (currentSlotParticipantId === pidNum) {
                            return;
                          }

                          const previoDestino = (r[slot]?.id || r[slot]) ?? null;

                          // 1) Asignar el participante arrastrado al destino
                          await luchaAPI.update(r.id, { [slot]: pidNum });

                          // 2) Si hay origen (drag desde otra casilla), completar swap
                          if (fromLuchaIdRaw && fromSlot) {
                            const fromLuchaId = Number(fromLuchaIdRaw);
                            // Si había alguien en el destino, lo llevamos al origen; si no, dejamos origen vacío
                            if (previoDestino && previoDestino !== pidNum) {
                              const payload = {};
                              payload[fromSlot] = previoDestino;
                              await luchaAPI.update(fromLuchaId, payload);
                            }
                          }

                          // 3) Mantener sincronizada la estructura de la llave para promoción automática
                          try {
                            const estructuraNueva = JSON.parse(JSON.stringify(llave.estructura));
                            const dest = estructuraNueva?.rondas?.[rondaIdx]?.luchas?.[luchaIdx];
                            if (dest) {
                              // Obtener datos del participante arrastrado (nombre/academia) desde la lucha origen
                              let nombre = '';
                              let academia = '';
                              const fromLucha = Array.isArray(luchas) ? luchas.find(lx => lx.id === Number(fromLuchaIdRaw)) : null;
                              if (fromLucha) {
                                if (fromSlot === 'participante1') {
                                  nombre = fromLucha.participante1_nombre || '';
                                  academia = fromLucha.participante1_academia || '';
                                } else if (fromSlot === 'participante2') {
                                  nombre = fromLucha.participante2_nombre || '';
                                  academia = fromLucha.participante2_academia || '';
                                }
                              }
                              dest[slot] = { id: pidNum, nombre, academia };

                              // Si hubo swap, actualizar origen en estructura
                              if (fromLucha) {
                                const srcRondaIdx = estructuraNueva.rondas.findIndex(rr => rr.nombre === fromLucha.ronda);
                                if (srcRondaIdx >= 0) {
                                  const src = estructuraNueva.rondas[srcRondaIdx].luchas?.[fromLucha.posicion_llave];
                                  if (src) {
                                    if (previoDestino && previoDestino !== pidNum) {
                                      // Datos del que estaba en destino
                                      const prevNombre = slot === 'participante1' ? (r.participante1_nombre || '') : (r.participante2_nombre || '');
                                      const prevAcademia = slot === 'participante1' ? (r.participante1_academia || '') : (r.participante2_academia || '');
                                      src[fromSlot] = { id: previoDestino, nombre: prevNombre, academia: prevAcademia };
                                    } else {
                                      src[fromSlot] = null;
                                    }
                                  }
                                }
                              }
                            }
                            await llaveAPI.update(llave.id, { estructura: estructuraNueva });
                          } catch (syncErr) {
                            console.warn('No se pudo sincronizar estructura de llave:', syncErr);
                          }
                          // Refrescar datos sin recargar toda la página
                          try {
                            const [refLuchas, refLlave] = await Promise.all([
                              luchaAPI.getByCategoria(categoria.id),
                              llaveAPI.getByCategoria(categoria.id)
                            ]);
                            const arr = Array.isArray(refLuchas?.results) ? refLuchas.results : Array.isArray(refLuchas) ? refLuchas : [];
                            setLuchas(arr);
                            if (refLlave) setLlave(refLlave);
                          } catch (eRefresh) {
                            console.warn('Refresh DnD falló, considere recargar manualmente:', eRefresh);
                          }
                        } else {
                          // Si no existe aún la Lucha de ese cuadro (p.ej., Semifinal vacía),
                          // intentar crearla solo si ambos participantes quedan definidos.
                          const pidNum = Number(pid);
                          const otroId = slot === 'participante1'
                            ? (lucha.participante2?.id || null)
                            : (lucha.participante1?.id || null);
                          const nuevoP1 = slot === 'participante1' ? pidNum : otroId;
                          const nuevoP2 = slot === 'participante2' ? pidNum : otroId;

                          if (nuevoP1 && nuevoP2) {
                            await luchaAPI.create({
                              categoria: categoria.id,
                              participante1: nuevoP1,
                              participante2: nuevoP2,
                              ronda: ronda.nombre,
                              posicion_llave: luchaIdx,
                            });
                            // Actualizar estructura también
                            try {
                              const estructuraNueva = JSON.parse(JSON.stringify(llave.estructura));
                              const dest = estructuraNueva?.rondas?.[rondaIdx]?.luchas?.[luchaIdx];
                              if (dest) {
                                // Intentar obtener datos de ambos participantes desde las luchas de origen si existen
                                let p1Nombre = '';
                                let p1Academia = '';
                                let p2Nombre = '';
                                let p2Academia = '';
                                const l1 = Array.isArray(luchas) ? luchas.find(lx => (lx.participante1 === nuevoP1 || lx.participante2 === nuevoP1)) : null;
                                if (l1) {
                                  if (l1.participante1 === nuevoP1) { p1Nombre = l1.participante1_nombre || ''; p1Academia = l1.participante1_academia || ''; }
                                  if (l1.participante2 === nuevoP1) { p1Nombre = l1.participante2_nombre || ''; p1Academia = l1.participante2_academia || ''; }
                                }
                                const l2 = Array.isArray(luchas) ? luchas.find(lx => (lx.participante1 === nuevoP2 || lx.participante2 === nuevoP2)) : null;
                                if (l2) {
                                  if (l2.participante1 === nuevoP2) { p2Nombre = l2.participante1_nombre || ''; p2Academia = l2.participante1_academia || ''; }
                                  if (l2.participante2 === nuevoP2) { p2Nombre = l2.participante2_nombre || ''; p2Academia = l2.participante2_academia || ''; }
                                }
                                dest.participante1 = { id: nuevoP1, nombre: p1Nombre, academia: p1Academia };
                                dest.participante2 = { id: nuevoP2, nombre: p2Nombre, academia: p2Academia };
                              }
                              await llaveAPI.update(llave.id, { estructura: estructuraNueva });
                            } catch (eSync) {
                              console.warn('Sync semifinals/finals fallo:', eSync);
                            }
                            // Actualizar estados locales sin recargar
                            try {
                              const [refLuchas, refLlave] = await Promise.all([
                                luchaAPI.getByCategoria(categoria.id),
                                llaveAPI.getByCategoria(categoria.id)
                              ]);
                              const arr = Array.isArray(refLuchas?.results) ? refLuchas.results : Array.isArray(refLuchas) ? refLuchas : [];
                              setLuchas(arr);
                              if (refLlave) setLlave(refLlave);
                            } catch (eRefresh2) {
                              console.warn('Refresh post-create falló:', eRefresh2);
                            }
                          }
                        }
                      } catch (error) {
                        console.error('Error al actualizar lucha:', error);
                      }
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
                        {/* Estado */}
                        <span style={{
                          backgroundColor: r.estado === 'finalizada' ? '#059669' : (r.estado === 'en_progreso' ? '#2563eb' : '#6b7280'),
                          color: 'white',
                          borderRadius: '999px',
                          padding: '2px 8px',
                          fontSize: '0.65rem',
                          fontWeight: 600
                        }}>
                          {r.estado || 'pendiente'}
                        </span>
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
                              borderRadius: 6,
                              padding: '4px 8px',
                              fontSize: '0.7rem',
                              cursor: 'pointer'
                            }}
                            title="Comenzar lucha"
                          >
                            Comenzar
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
                              background: '#e5e7eb',
                              color: '#111827',
                              border: 'none',
                              borderRadius: 6,
                              padding: '4px 8px',
                              fontSize: '0.7rem',
                              cursor: 'pointer'
                            }}
                            title="Reiniciar lucha"
                          >
                            Reiniciar
                          </button>
                          </>
                        )}
                        {r.estado !== 'pendiente' && hayEnProgreso && r.estado !== 'en_progreso' && (
                          <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Otra lucha en curso</span>
                        )}
                      </div>
                    )}
                    <div 
                      className="bracket-player" 
                      data-slot="p1"
                      draggable={!!p1}
                      onDragStart={(e) => {
                        if (!p1) return;
                        const dt = e.dataTransfer;
                        if (!dt) return;
                        const id = p1.id || p1;
                        dt.setData('participant-id', String(id));
                        dt.setData('text/plain', String(id));
                        dt.setData('from-slot', 'participante1');
                        if (r?.id) dt.setData('from-lucha-id', String(r.id));
                        dt.effectAllowed = 'move';
                        e.currentTarget.style.opacity = '0.6';
                      }}
                      onDragEnd={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      style={{
                        padding: '8px 12px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        minHeight: '40px',
                        backgroundColor: p1 ? '#ecfdf5' : '#f9fafb',
                        cursor: p1 ? 'grab' : 'default'
                      }}
                    >
                      <span style={{ color: '#111827', fontWeight: p1 ? '600' : '400' }}>
                        {p1 ? p1.nombre : 'Arrastra participante aquí'}
                      </span>
                      <span className="text-xs" style={{ color: '#6b7280' }}>
                        {r ? (r.puntos_p1 || 0) : 0}
                      </span>
                    </div>
                    
                    <div 
                      className="bracket-player" 
                      data-slot="p2"
                      draggable={!!p2 && !isBye}
                      onDragStart={(e) => {
                        if (!p2 || isBye) return;
                        const dt = e.dataTransfer;
                        if (!dt) return;
                        const id = p2.id || p2;
                        dt.setData('participant-id', String(id));
                        dt.setData('text/plain', String(id));
                        dt.setData('from-slot', 'participante2');
                        if (r?.id) dt.setData('from-lucha-id', String(r.id));
                        dt.effectAllowed = 'move';
                        e.currentTarget.style.opacity = '0.6';
                      }}
                      onDragEnd={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      style={{
                        padding: '8px 12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        minHeight: '40px',
                        backgroundColor: p2 ? '#ecfdf5' : '#f9fafb',
                        cursor: p2 && !isBye ? 'grab' : 'default'
                      }}
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
        💡 <strong>Instrucciones:</strong> Arrastra cualquier nombre de una casilla a otra en el diagrama para reordenar. Suelta en la mitad superior para P1 y en la inferior para P2.
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


