import React, { useEffect, useState, useCallback, useRef } from 'react';
import useAuth from '../hooks/useAuth';
import { LoginModal } from './AuthComponents.jsx';

// Galería completa solo para visualización
export default function Galeria({ API_BASE }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null); // item seleccionado (img o video)
  const cursorRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);
  const inFlightRef = useRef(false);
  const [showUploader, setShowUploader] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Usar el hook de autenticación
  const { isAuthenticated, user, login } = useAuth();

  const base = API_BASE || (import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://thebadgerspage.onrender.com' : 'http://127.0.0.1:8000'));


  const fetchPage = useCallback(async (reset = false) => {
    if (inFlightRef.current) return; // evitar llamadas concurrentes/loop
    inFlightRef.current = true;
    const params = new URLSearchParams();
    const cursorToUse = (!reset && cursorRef.current) ? cursorRef.current : null;
    if (cursorToUse) params.set('cursor', cursorToUse);
    params.set('limit', '24');
    const url = `${base}/api/galeria/items/?${params.toString()}`;
    try {
      setLoading(true);
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setItems(prev => reset ? data.results : [...prev, ...data.results]);
      cursorRef.current = data.next_cursor || null;
      setHasMore(Boolean(data.next_cursor));
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [base]);

  // Función para obtener headers de autenticación con token
  const getAuthHeaders = useCallback(() => {
    if (!isAuthenticated || !user) return {};

    // Para la galería, usamos el token del authService
    const token = localStorage.getItem('auth_token');
    if (token) {
      return { 'Authorization': `Token ${token}` };
    }

    // Fallback al sistema básico si no hay token
    const storedUser = localStorage.getItem('badgers_user');
    const storedPass = localStorage.getItem('badgers_pass');
    if (storedUser && storedPass) {
      const basicToken = btoa(`${storedUser}:${storedPass}`);
      return { 'Authorization': `Basic ${basicToken}` };
    }

    return {};
  }, [isAuthenticated, user]);

  // Verificar si el usuario puede subir archivos
  const canUpload = useCallback(() => {
    return isAuthenticated && user && (user.is_staff || user.is_superuser);
  }, [isAuthenticated, user]);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;

    // Verificar que el usuario tenga permisos para subir
    if (!canUpload()) {
      setUploadMsg('Error: No tienes permisos para subir archivos');
      return;
    }

    setUploading(true);
    setUploadMsg('Subiendo...');

    for (const file of files) {
      const fd = new FormData();
      fd.append('nombre', file.name.replace(/\.[^.]+$/, ''));
      fd.append('archivo', file);

      try {
        const authHeaders = getAuthHeaders();
        const r = await fetch(`${base}/api/galeria/upload/`, {
          method: 'POST',
          headers: authHeaders,
          body: fd
        });

        if (!r.ok) {
          const errorText = await r.text();
          throw new Error(`HTTP ${r.status}: ${errorText}`);
        }

        const data = await r.json();
        // Prepend nuevo item
        setItems(prev => [{
          id: data.id,
          url: data.url,
          nombre: file.name,
          tipo: file.type.startsWith('video') ? 'video' : 'img',
          fecha: new Date().toISOString()
        }, ...prev]);
        setUploadMsg(`✅ Subido: ${file.name}`);
      } catch (e) {
        console.error('Error subiendo archivo:', e);
        setUploadMsg(`❌ Error subiendo ${file.name}: ${e.message}`);
      }
    }
    setUploading(false);
  };

  useEffect(() => {
    // Carga inicial o cuando cambia la base de la API
    setItems([]);
    setHasMore(true);
    cursorRef.current = null;
    fetchPage(true);
  }, [base, fetchPage]);

  // Cerrar uploader si el usuario pierde permisos
  useEffect(() => {
    if (!canUpload()) {
      setShowUploader(false);
    }
  }, [canUpload]);

  useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
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

      {/* Controles de admin: solo si está autenticado como admin */}
      {canUpload() && (
        <div className="mb-4 w-full max-w-6xl flex items-center justify-end">
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
            onClick={() => setShowUploader(v => !v)}
          >
            {showUploader ? 'Cerrar Uploader' : '📤 Subir Fotos'}
          </button>
        </div>
      )}

      {/* Mensaje para usuarios no autenticados */}
      {!isAuthenticated && (
        <div className="mb-4 w-full max-w-6xl flex items-center justify-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-800 font-medium mb-2">¿Quieres subir fotos?</p>
            <p className="text-blue-600 text-sm mb-3">
              Inicia sesión como administrador para acceder a la función de subir archivos.
            </p>
            <button
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
              onClick={() => setShowLoginModal(true)}
            >
              🔐 Iniciar Sesión
            </button>
          </div>
        </div>
      )}

      {/* Uploader solo para admins autenticados */}
      {canUpload() && showUploader && (
        <div className="w-full max-w-6xl mb-4 p-6 border rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-lg">
          <div className="text-sm text-slate-700 mb-4 font-medium">
            📁 Selecciona las imágenes o videos que quieres subir a la galería
          </div>
          <label className="block w-full p-8 text-center border-2 border-dashed border-emerald-300 rounded-xl cursor-pointer hover:bg-emerald-50 transition-all duration-300 hover:border-emerald-400">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => handleFiles([...e.target.files])}
            />
            <div className="text-4xl mb-2">📤</div>
            <span className="text-slate-600 font-medium">Haz clic aquí para seleccionar archivos</span>
            <p className="text-slate-500 text-sm mt-1">o arrastra y suelta archivos aquí</p>
          </label>
          {uploading && (
            <div className="mt-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
              <div className="text-sm text-slate-600">{uploadMsg}</div>
            </div>
          )}
          {!uploading && uploadMsg && (
            <div className={`mt-4 p-3 rounded-lg text-center ${uploadMsg.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
              <div className="text-sm font-medium">{uploadMsg}</div>
            </div>
          )}
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
            {it.tipo === 'video' ? (
              <video src={it.url} muted playsInline controls={false} autoPlay={false}
                className="w-full h-auto cursor-pointer"
                onMouseEnter={(e) => { try { const p = e.currentTarget.play(); if (p && typeof p.catch === 'function') { p.catch(() => { }); } } catch (err) { void err; } }}
                onMouseLeave={(e) => { try { e.currentTarget.pause(); e.currentTarget.currentTime = 0; } catch (err) { void err; } }}
                onClick={() => setSelected(it)} />
            ) : (
              <img src={it.url} alt={it.nombre} loading="lazy" decoding="async"
                className="w-full h-auto cursor-pointer"
                onClick={() => setSelected(it)} />
            )}
            <div className="p-3 flex items-center justify-between text-sm text-slate-700">
              <span className="font-medium truncate">{it.nombre}</span>
              <span className="text-xs text-slate-500">{(it.fecha || '').split('T')[0]}</span>
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
            {selected.tipo === 'video' ? (
              <video src={selected.url} className="max-w-full max-h-full rounded-lg" controls autoPlay onClick={(e) => e.stopPropagation()} />
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

      {/* Modal de Login para subir archivos */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Acceso para Subir Archivos"
      />
    </div>
  );
}
