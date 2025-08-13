import React, { useEffect, useState } from 'react';

// Galería pública con login básico solo para subir (mantiene compatibilidad actual)
export default function Galeria({ API_BASE }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = API_BASE || (import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://thebadgerspage.onrender.com' : 'http://127.0.0.1:8000'));
    fetch(`${base}/api/galeria/`)
      .then(r => r.json())
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [API_BASE]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans pt-32 flex flex-col items-center px-2">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">Galería</h2>
      {loading && <p>Cargando...</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl w-full">
        {items.map((it) => (
          <div key={it.id || it.nombre} className="bg-white rounded-lg shadow p-2">
            <img src={it.url} alt={it.nombre} className="w-full h-48 object-cover rounded" />
            <div className="mt-2 text-sm text-slate-700">{it.nombre}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
