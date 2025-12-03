import React, { useEffect, useState, useCallback, useRef } from 'react';

// CONFIGURACIÓN DE CLOUDINARY
const CLOUD_NAME = 'dczcabe7j';
const TAG = 'galeria_web';
const LIST_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAG}.json`;

export default function Galeria() {
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadedImages, setLoadedImages] = useState(new Set());

  const sentinelRef = useRef(null);
  const itemsPerPage = 12;
  const pageRef = useRef(1);

  // --- NUEVA FUNCIÓN: Extraer nombre del archivo (Formato: Nombre_ID) ---
  const getAuthorName = (publicId) => {
    try {
      // 1. Quitamos carpetas si las hay
      const filename = publicId.split('/').pop();
      // 2. Separamos por el guion bajo "_" que configuramos en n8n
      const parts = filename.split('_');

      // Si logramos separar algo (ej: "Juan" y "1234")
      if (parts.length > 1) {
        // Devolvemos la primera parte (el nombre)
        // Le ponemos mayúscula inicial por si acaso
        const name = parts[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
      }
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchCloudinaryData = async () => {
      try {
        setLoading(true);
        const response = await fetch(LIST_URL);

        if (!response.ok) {
          throw new Error('No se pudo obtener la lista. Verifica permisos en Cloudinary.');
        }

        const data = await response.json();

        const mappedItems = data.resources.map(img => {
          // Detectamos el autor aquí
          const autorDetectado = getAuthorName(img.public_id);

          return {
            id: img.public_id,
            url: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v${img.version}/${img.public_id}.${img.format}`,
            // Si hay autor, el nombre es bonito. Si no, usamos el ID limpio
            nombre: autorDetectado ? `Foto de ${autorDetectado}` : img.public_id.replace(/[_-]/g, ' '),
            autor: autorDetectado, // Guardamos el autor en una variable aparte
            tipo: ['mp4', 'mov', 'webm', 'avi'].includes(img.format) ? 'video' : 'img',
            fecha: img.created_at,
            version: img.version,
            format: img.format
          }
        });

        // Ordenar: Más recientes primero
        mappedItems.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        setAllItems(mappedItems);
        setItems(mappedItems.slice(0, itemsPerPage));
        setHasMore(mappedItems.length > itemsPerPage);

      } catch (e) {
        console.error("Error Cloudinary:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCloudinaryData();
  }, []);

  const loadMoreItems = useCallback(() => {
    if (items.length >= allItems.length) {
      setHasMore(false);
      return;
    }
    const nextPage = pageRef.current + 1;
    const nextItems = allItems.slice(0, nextPage * itemsPerPage);
    setItems(nextItems);
    pageRef.current = nextPage;
    if (nextItems.length >= allItems.length) setHasMore(false);
  }, [items.length, allItems]);

  useEffect(() => {
    if (!hasMore || loading || allItems.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMoreItems();
    }, { rootMargin: '400px' });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMoreItems, allItems]);

  const handleImageLoad = useCallback((imageId) => {
    setLoadedImages(prev => new Set([...prev, imageId]));
  }, []);

  const isImageLoaded = useCallback((imageId) => {
    return loadedImages.has(imageId);
  }, [loadedImages]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans pt-32 pb-8 flex flex-col items-center px-2">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8">Galería de Alumnos</h2>

      {loading && items.length === 0 && (
        <div className="text-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">Cargando fotos...</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded text-sm text-red-700 max-w-2xl">
          Error: {error}
        </div>
      )}

      <div className="max-w-6xl w-full columns-1 sm:columns-2 md:columns-3 gap-4 [column-fill:_balance]">
        <div className="[&>*]:mb-4">
          {items.map((it) => (
            <div key={it.id} className="break-inside-avoid bg-white rounded-xl shadow hover:shadow-lg overflow-hidden relative group transition-transform duration-300 hover:scale-[1.01]">

              {it.tipo === 'video' ? (
                <div className="relative">
                  {/* Etiqueta de Video pequeña */}
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider z-10 pointer-events-none">
                    Video
                  </div>
                  <video
                    src={it.url}
                    className="w-full h-auto cursor-pointer bg-black"
                    muted
                    loop
                    onMouseEnter={(e) => e.target.play()}
                    onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                    onClick={() => setSelected(it)}
                  />
                </div>
              ) : (
                <div className="relative w-full h-auto min-h-[150px]">
                  {!isImageLoaded(it.id) && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  <img
                    src={it.url}
                    alt={it.nombre}
                    loading="lazy"
                    className={`w-full h-auto cursor-pointer transition-opacity duration-500 ${isImageLoaded(it.id) ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => handleImageLoad(it.id)}
                    onClick={() => setSelected(it)}
                  />
                </div>
              )}

              {/* BARRA INFERIOR CON EL NOMBRE DEL ALUMNO */}
              <div className="p-3 bg-white border-t border-slate-50 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                  {/* Inicial del nombre o icono si no hay nombre */}
                  {it.autor ? it.autor.charAt(0) : '📷'}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-800 truncate">
                    {it.autor ? it.autor : 'Badgers'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(it.fecha).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {hasMore && !loading && (
        <div ref={sentinelRef} className="w-full h-20 flex justify-center items-center mt-4">
          <div className="animate-pulse text-slate-400 text-sm">Cargando más recuerdos...</div>
        </div>
      )}

      {/* MODAL */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-all"
            >
              ✕
            </button>

            {selected.tipo === 'video' ? (
              <video
                src={selected.url}
                className="max-w-full max-h-[80vh] rounded shadow-2xl"
                controls
                autoPlay
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img
                src={selected.url}
                alt={selected.nombre}
                className="max-w-full max-h-[80vh] object-contain rounded shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {/* Título en el Modal */}
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-white tracking-wide">
                {selected.autor ? `Foto de ${selected.autor}` : selected.nombre}
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}