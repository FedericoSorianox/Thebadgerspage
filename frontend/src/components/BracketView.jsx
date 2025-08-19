import React, { useEffect, useState } from 'react';
import { llaveAPI, luchaAPI, participanteAPI } from '../services/api-new.js';

export default function BracketView({ categoria, onManage }) {
  const [llave, setLlave] = useState(null);
  const [luchas, setLuchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dragData, setDragData] = useState(null); // { tipo: 'participante'|'slot', data: {...} }
  const [catalogo, setCatalogo] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const l = await llaveAPI.getByCategoria(categoria.id);
        const lu = await luchaAPI.getByCategoria(categoria.id);
        const all = await participanteAPI.getAll(null, categoria.torneo);
        if (!mounted) return;
        setLlave(l);
        const luchasArray = Array.isArray(lu?.results) ? lu.results : Array.isArray(lu) ? lu : [];
        setLuchas(luchasArray);
        setCatalogo(Array.isArray(all?.results) ? all.results : Array.isArray(all) ? all : []);
      } catch (e) {
        if (!mounted) return;
        setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [categoria?.id]);

  if (loading) return <div className="text-sm text-gray-500">Cargando llave…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
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
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-lg font-semibold">Llave - {categoria.nombre}</h4>
        {onManage && (
          <button className="btn btn-primary" onClick={onManage}>⚙️ Gestionar</button>
        )}
      </div>
      {/* Bandeja de participantes para DnD */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
        {catalogo.map(p => (
          <div key={p.id} className="participant-card" draggable
               onDragStart={(e)=>{ try{ e.dataTransfer.setData('participant-id', String(p.id)); e.dataTransfer.effectAllowed='move'; }catch(_){ } }}
               style={{ cursor:'grab' }}>
            <div className="participant-info">
              <strong>{p.nombre}</strong>
              <div className="text-xs">{p.academia} • {p.cinturon}{p.peso?` • ${p.peso}kg`:''}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="bracket" style={{ display: 'grid', gridTemplateColumns: gridTemplate, gap: 16, overflowX: 'auto' }}>
        {rondas.map((ronda, rondaIdx) => (
          <div key={rondaIdx} className="bracket-column">
            <div className="bracket-round-title">{ronda.nombre}</div>
            <div className="bracket-column-matches">
              {ronda.luchas.map((lucha, luchaIdx) => {
                const r = Array.isArray(luchas) ? luchas.find(l => {
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
                  <div key={luchaIdx} className={`bracket-match ${isBye ? 'is-bye' : ''}`}
                       onDragOver={(e)=>e.preventDefault()}
                       onDrop={async (e)=>{
                         e.preventDefault();
                         let pid = null;
                         try{ pid = e.dataTransfer.getData('participant-id'); }catch(_){ }
                         if (!pid) return;
                         try{
                           const slot = e.target.getAttribute('data-slot');
                           if(!slot) return;
                           if(r){
                             await luchaAPI.update(r.id, { [slot==='p1'?'participante1':'participante2']: Number(pid) });
                           }
                         }catch(err){
                           // noop visual, errors se ignoran aquí
                         }
                       }}>
                    <div className="bracket-player" draggable
                         onDragStart={()=>setDragData({tipo:'slot', data:{matchId:r?.id, slot:'p1'}})}
                         data-slot="p1">
                      <span>{p1 ? p1.nombre : 'TBD'}</span>
                      <span className="text-xs text-gray-500">{r ? (r.puntos_p1 || 0) : 0}</span>
                    </div>
                    <div className="bracket-player" draggable
                         onDragStart={()=>setDragData({tipo:'slot', data:{matchId:r?.id, slot:'p2'}})}
                         data-slot="p2">
                      <span>{p2 ? (isBye ? 'BYE' : p2.nombre) : 'TBD'}</span>
                      <span className="text-xs text-gray-500">{r ? (r.puntos_p2 || 0) : 0}</span>
                    </div>
                    {lucha.ganador && (
                      <div className="bracket-winner">🏆 {lucha.ganador.nombre}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-2">Tip: arrastra un participante desde la lista y suéltalo sobre P1/P2.</div>
    </div>
  );
}


