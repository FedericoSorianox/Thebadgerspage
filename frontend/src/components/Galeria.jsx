import React, { useEffect, useState, useCallback, useRef } from 'react';

// CONFIGURACIÓN DE CLOUDINARY
// Asegúrate de que coincida con lo que configuraste en n8n
const CLOUD_NAME = 'dczcabe7j';
const TAG = 'galeria_web'; // La etiqueta que n8n pone a las fotos
const LIST_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAG}.json`;

export default function Galeria() {
  const [items, setItems] = useState([]); // Items visibles en pantalla
  const [allItems, setAllItems] = useState([]); // Todos los items descargados de Cloudinary
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null); // Modal
  const [hasMore, setHasMore] = useState(true);
  const [loadedImages, setLoadedImages] = useState(new Set()); // Evitar titileo

  // Referencias para el scroll infinito
  const sentinelRef = useRef(null);
  const itemsPerPage = 12; // Cantidad de fotos a añadir al hacer scroll
  const pageRef = useRef(1);

  // 1. CARGA INICIAL DESDE CLOUDINARY
  useEffect(() => {
    const fetchCloudinaryData = async () => {
      try {
        setLoading(true);
        const response = await fetch(LIST_URL);

        if (!response.ok) {
          // Si falla, es probable que la opción "Resource List" no esté habilitada en Security Settings
          throw new Error('No se pudo obtener la lista. Verifica permisos en Cloudinary (Security > Restricted image types > Resource list).');
        }

        const data = await response.json();

        // Transformar datos de Cloudinary al formato que usa tu galería
        const mappedItems = data.resources.map(img => ({
          id: img.public_id,
          // Construimos la URL pública
          url: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v${img.version}/${img.public_id}.${img.format}`,
          nombre: img.public_id.split('/').pop(), // Usamos el ID como nombre base
          // Detectar si es video basado en el formato
          tipo: ['mp4', 'mov', 'webm', 'avi'].includes(img.format) ? 'video' : 'img',
          fecha: img.created_at, // Cloudinary devuelve la fecha de creación
          version: img.version,
          format: img.format
        }));

        // Ordenar por fecha (más nuevo primero) si es necesario
        // mappedItems.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        setAllItems(mappedItems);

        // Cargar los primeros items
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

  // 2. FUNCIÓN PARA CARGAR MÁS (Scroll Infinito Local)
  const loadMoreItems = useCallback(() => {
    if (items.length >= allItems.length) {
      setHasMore(false);
      return;
    }

    const nextPage = pageRef.current + 1;
    const nextItems = allItems.slice(0, nextPage * itemsPerPage);

    setItems(nextItems);
    pageRef.current = nextPage;

    if (nextItems.length >= allItems.length) {
      setHasMore(false);
    }
  }, [items.length, allItems]);

  // 3. INTERSECTION OBSERVER (Detectar scroll al fondo)
  useEffect(() => {
    if (!hasMore || loading || allItems.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMoreItems();
      }
    }, { rootMargin: '400px' });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadMoreItems, allItems]);

  // Manejadores visuales
  const handleImageLoad = useCallback((imageId) => {
    setLoadedImages(prev => new Set([...prev, imageId]));
  }, []);

  const isImageLoaded = useCallback((imageId) => {
    return loadedImages.has(imageId);
  }, [loadedImages]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans pt-32 pb-8 flex flex-col items-center px-2">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8">Galería</h2>

      {/* Estados de carga y error */}
      {loading && items.length === 0 && (
        <div className="text-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">Conectando con Cloudinary...</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded text-sm text-red-700 max-w-2xl">
          Error cargando galería: {error}
        </div>
      )}

      {/* GRID MASONRY */}
      <div className="max-w-6xl w-full columns-1 sm:columns-2 md:columns-3 gap-4 [column-fill:_balance]">
        <div className="[&>*]:mb-4">
          {items.map((it) => (
            <div key={it.id} className="break-inside-avoid bg-white rounded-xl shadow hover:shadow-lg overflow-hidden relative group transition-transform duration-300 hover:scale-[1.01]">

              {it.tipo === 'video' ? (
                <video
                  src={it.url}
                  className="w-full h-auto cursor-pointer"
                  controls={false}
                  muted
                  onMouseEnter={(e) => e.target.play()}
                  onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                  onClick={() => setSelected(it)}
                />
              ) : (
                <div className="relative w-full h-auto min-h-[150px]">
                  {/* Placeholder / Skeleton */}
                  {!isImageLoaded(it.id) && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
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

              {/* Info overlay (opcional) */}
              <div className="p-3 bg-white">
                {/* Limpiamos el nombre para que no se vea la extensión o rutas largas */}
                <p className="text-xs text-slate-500 truncate capitalize">
                  {it.nombre.replace(/[_-]/g, ' ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sentinel para infinite scroll */}
      {hasMore && !loading && (
        <div ref={sentinelRef} className="w-full h-20 flex justify-center items-center mt-4">
          <div className="animate-pulse text-slate-400">Cargando más fotos...</div>
        </div>
      )}

      {!loading && items.length === 0 && !error && (
        <div className="text-center text-slate-600 mt-8 mb-8">
          <p className="text-lg">No se encontraron imágenes con la etiqueta: <strong>{TAG}</strong></p>
          <p className="text-sm mt-2">Sube imágenes usando tu workflow de n8n para verlas aquí.</p>
        </div>
      )}

      {/* MODAL / LIGHTBOX */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-50 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {selected.tipo === 'video' ? (
              <video
                src={selected.url}
                className="max-w-full max-h-full rounded-md shadow-2xl"
                controls
                autoPlay
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img
                src={selected.url}
                alt={selected.nombre}
                className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}