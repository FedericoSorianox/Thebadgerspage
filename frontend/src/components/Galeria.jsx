import React, { useEffect, useState } from 'react';

// Galería pública con login básico solo para subir (mantiene compatibilidad actual)
export default function Galeria({ API_BASE }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const base = API_BASE || (import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://thebadgerspage.onrender.com' : 'http://127.0.0.1:8000'));
    
    console.log('🔍 Galeria DEBUG - API Base:', base);
    console.log('🔍 Galeria DEBUG - Full URL:', `${base}/api/galeria/`);
    
    fetch(`${base}/api/galeria/`)
      .then(r => {
        console.log('🔍 Galeria DEBUG - Response status:', r.status);
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`);
        }
        return r.json();
      })
      .then(data => {
        console.log('🔍 Galeria DEBUG - Data received:', data);
        console.log('🔍 Galeria DEBUG - Items count:', data.length);
        setItems(data);
        setError(null);
      })
      .catch(err => {
        console.error('🔍 Galeria DEBUG - Error:', err);
        setError(err.message);
        // Fallback: mostrar imágenes de placeholder
        setItems([
          { id: 1, nombre: 'Ejemplo 1', url: 'https://picsum.photos/800/600?random=1' },
          { id: 2, nombre: 'Ejemplo 2', url: 'https://picsum.photos/800/600?random=2' },
          { id: 3, nombre: 'Ejemplo 3', url: 'https://picsum.photos/800/600?random=3' },
          { id: 4, nombre: 'Ejemplo 4', url: 'https://picsum.photos/800/600?random=4' },
        ]);
      })
      .finally(() => setLoading(false));
  }, [API_BASE]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans pt-32 flex flex-col items-center px-2">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">Galería</h2>
      
      {/* Debug info in development */}
      {!import.meta.env.PROD && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded text-sm">
          <p>🔍 DEBUG: API Base: {API_BASE}</p>
          <p>🔍 DEBUG: Items count: {items.length}</p>
          {error && <p>🔍 DEBUG: Error: {error}</p>}
        </div>
      )}
      
      {loading && <p className="text-lg text-slate-600">Cargando galería...</p>}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded text-sm text-red-700">
          Error cargando imágenes: {error}. Mostrando contenido de ejemplo.
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl w-full">
        {items.map((it) => (
          <div key={it.id || it.nombre} className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
            <img 
              src={it.url} 
              alt={it.nombre} 
              className="w-full h-48 object-cover rounded-lg mb-3"
              onError={(e) => {
                console.log('🔍 Image load error:', it.url);
                e.target.src = 'https://picsum.photos/800/600?random=' + (it.id || Math.random());
              }}
            />
            <div className="text-sm font-medium text-slate-700">{it.nombre}</div>
          </div>
        ))}
      </div>
      
      {!loading && items.length === 0 && (
        <div className="text-center text-slate-600 mt-8">
          <p className="text-lg">No hay imágenes en la galería aún.</p>
          <p className="text-sm mt-2">Las imágenes aparecerán aquí cuando se suban al sistema.</p>
        </div>
      )}
    </div>
  );
}
