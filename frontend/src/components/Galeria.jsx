import React, { useEffect, useState, useCallback, useRef } from 'react';

// Galería completa solo para visualización
export default function Galeria({ API_BASE }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null); // item seleccionado (img o video)
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);
  const inFlightRef = useRef(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [user, setUser] = useState(localStorage.getItem('badgers_user') || '');
  const [pass, setPass] = useState(localStorage.getItem('badgers_pass') || '');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  const base = API_BASE || (import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://thebadgerspage.onrender.com' : 'http://127.0.0.1:8000'));


  const fetchPage = useCallback(async (reset=false) => {
    if (inFlightRef.current) return; // evitar llamadas concurrentes/loop
    inFlightRef.current = true;
    const params = new URLSearchParams();
    if (!reset && cursor) params.set('cursor', cursor);
    params.set('limit', '24');
    const url = `${base}/api/galeria/items/?${params.toString()}`;
    try {
      setLoading(true);
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setItems(prev => reset ? data.results : [...prev, ...data.results]);
      setCursor(data.next_cursor);
      setHasMore(Boolean(data.next_cursor));
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [base, cursor]);

  const authHeader = useCallback(() => {
    if (!user || !pass) return {};
    const token = btoa(`${user}:${pass}`);
    return { 'Authorization': `Basic ${token}` };
  }, [user, pass]);

  const validateAdmin = useCallback(async () => {
    try {
      const r = await fetch(`${base}/api/galeria/upload/`, { method: 'GET', headers: { ...authHeader() }});
      if (!r.ok) throw new Error('Credenciales inválidas');
      setIsAdmin(true);
      localStorage.setItem('badgers_user', user);
      localStorage.setItem('badgers_pass', pass);
      return true;
    } catch (e) {
      setIsAdmin(false);
      setUploadMsg(e.message);
      return false;
    }
  }, [base, authHeader, user, pass]);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadMsg('Subiendo...');
    for (const file of files) {
      const fd = new FormData();
      fd.append('nombre', file.name.replace(/\.[^.]+$/, ''));
      fd.append('archivo', file);
      try {
        const r = await fetch(`${base}/api/galeria/upload/`, { method: 'POST', headers: { ...authHeader() }, body: fd });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        // Prepend nuevo item
        setItems(prev => [{ id: data.id, url: data.url, nombre: file.name, tipo: file.type.startsWith('video')?'video':'img', fecha: new Date().toISOString() }, ...prev]);
        setUploadMsg(`Subido: ${file.name}`);
      } catch (e) {
        setUploadMsg(`Error subiendo ${file.name}: ${e.message}`);
      }
    }
    setUploading(false);
  };

  useEffect(() => {
    setCursor(null); setHasMore(true); setItems([]);
    fetchPage(true);
  }, [fetchPage]);

  useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e => {
        if (e.isIntersecting) fetchPage();
      });
    }, { rootMargin: '800px' });
    io.observe(el);
    return () => io.disconnect();
  }, [fetchPage, hasMore, loading]);



  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans pt-32 flex flex-col items-center px-2">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Galería</h2>

      {/* Toggle admin + uploader */}
      <div className="mb-4 w-full max-w-6xl flex items-center justify-between">
        <div />
        <button className="px-3 py-1 rounded bg-slate-700 text-white" onClick={()=>setShowAdminPanel(v=>!v)}>
          {showAdminPanel?'Ocultar Admin':'Modo Admin'}
        </button>
      </div>

      {showAdminPanel && (
        <div className="mb-4 w-full max-w-6xl flex items-center justify-between">
          {!isAdmin ? (
            <div className="flex items-center gap-2 text-sm">
              <input className="px-2 py-1" placeholder="Usuario" value={user} onChange={(e)=>setUser(e.target.value)} style={{border:'1px solid #ddd', borderRadius:6}} />
              <input className="px-2 py-1" placeholder="Contraseña" type="password" value={pass} onChange={(e)=>setPass(e.target.value)} style={{border:'1px solid #ddd', borderRadius:6}} />
              <button className="px-3 py-1 rounded bg-slate-800 text-white" onClick={validateAdmin}>Validar Admin</button>
            </div>
          ) : (
            <button className="px-3 py-1 rounded bg-emerald-600 text-white" onClick={()=>setShowUploader(v=>!v)}>{showUploader?'Cerrar Uploader':'Subir'}</button>
          )}
        </div>
      )}

      {isAdmin && showUploader && (
        <div className="w-full max-w-6xl mb-4 p-4 border rounded-xl bg-white">
          <div className="text-sm text-slate-700 mb-2">Arrastra y suelta archivos aquí o haz clic para seleccionar</div>
          <label className="block w-full p-6 text-center border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-50">
            <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e)=> handleFiles([...e.target.files])} />
            <span className="text-slate-600">Seleccionar archivos</span>
          </label>
          {uploading && <div className="mt-2 text-sm text-slate-600">{uploadMsg}</div>}
          {!uploading && uploadMsg && <div className="mt-2 text-sm text-slate-600">{uploadMsg}</div>}
        </div>
      )}
      
      {/* Debug info in development */}
      {!import.meta.env.PROD && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded text-sm">
          <p>🔍 DEBUG: API Base: {base}</p>
          <p>🔍 DEBUG: Items count: {items.length}</p>
          {/* <p>🔍 DEBUG: Logged in: {loginValidated ? 'Yes' : 'No'}</p> */}
          {error && <p>🔍 DEBUG: Error: {error}</p>}
        </div>
      )}
      
      {loading && <p className="text-lg text-slate-600">Cargando galería...</p>}
      {error && !loading && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded text-sm text-red-700">
          Error cargando imágenes: {error}. Mostrando contenido de ejemplo.
        </div>
      )}
      
      {/* Masonry */}
      <div className="max-w-6xl w-full columns-1 sm:columns-2 md:columns-3 gap-4 [column-fill:_balance]"><div className="[&>*]:mb-4">
        {items.map((it) => (
          <div key={it.id || it.nombre} className="break-inside-avoid bg-white rounded-xl shadow hover:shadow-lg overflow-hidden">
            {it.tipo==='video' ? (
              <video src={it.url} muted playsInline controls={false} autoPlay={false}
                     className="w-full h-auto cursor-pointer"
                     onMouseEnter={(e)=>{ try{ e.currentTarget.play(); }catch(_){} }}
                     onMouseLeave={(e)=>{ try{ e.currentTarget.pause(); e.currentTarget.currentTime=0; }catch(_){} }}
                     onClick={()=> setSelected(it) } />
            ) : (
              <img src={it.url} alt={it.nombre} loading="lazy" decoding="async"
                   className="w-full h-auto cursor-pointer"
                   onClick={()=> setSelected(it) } />
            )}
            <div className="p-3 flex items-center justify-between text-sm text-slate-700">
              <span className="font-medium truncate">{it.nombre}</span>
              <span className="text-xs text-slate-500">{(it.fecha||'').split('T')[0]}</span>
            </div>
          </div>
        ))}
      </div></div>

      {/* Sentinel para infinite scroll */}
      {hasMore && (
        <div ref={sentinelRef} className="w-full h-10" />
      )}

      {!loading && items.length === 0 && (
        <div className="text-center text-slate-600 mt-8 mb-8">
          <p className="text-lg">No hay imágenes en la galería aún.</p>
          <p className="text-sm mt-2">Las imágenes aparecerán aquí cuando se suban al sistema.</p>
        </div>
      )}

      {/* Modal de Zoom para Imágenes */}
      {selected && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div className="max-w-4xl max-h-full relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-white text-2xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-all"
            >
              ×
            </button>
            {selected.tipo==='video' ? (
              <video src={selected.url} className="max-w-full max-h-full rounded-lg" controls autoPlay onClick={(e)=>e.stopPropagation()} />
            ) : (
              <img
                src={selected.url}
                alt={selected.nombre}
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg">
              <h3 className="font-semibold">{selected.nombre}</h3>
              {selected.fecha && (
                <p className="text-sm opacity-75">{selected.fecha}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
