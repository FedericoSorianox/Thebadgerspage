import React, { useEffect, useState } from 'react';

// Galería completa con login, upload y visualización
export default function Galeria({ API_BASE, isLoggedIn, loginUser, loginPass, setShowLogin, handleLogin, handleLogout, loginError, showLogin, setLoginPass }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadName, setUploadName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // Para el modal de zoom

  // Login state
  const [localLoginUser, setLocalLoginUser] = useState(loginUser || '');
  const [localLoginPass, setLocalLoginPass] = useState(loginPass || '');
  const [showLoginForm, setShowLoginForm] = useState(showLogin || false);
  const [loginValidated, setLoginValidated] = useState(false); // Estado real de login

  const base = API_BASE || (import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://thebadgerspage.onrender.com' : 'http://127.0.0.1:8000'));

  const loadGallery = () => {
    console.log('🔍 Galeria DEBUG - API Base:', base);
    console.log('🔍 Galeria DEBUG - Full URL:', `${base}/api/galeria/`);
    
    setLoading(true);
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
        // Fallback: mostrar imágenes de placeholder solo si no hay datos
        setItems([
          { id: 1, nombre: 'Ejemplo 1', url: 'https://picsum.photos/800/600?random=1' },
          { id: 2, nombre: 'Ejemplo 2', url: 'https://picsum.photos/800/600?random=2' },
          { id: 3, nombre: 'Ejemplo 3', url: 'https://picsum.photos/800/600?random=3' },
          { id: 4, nombre: 'Ejemplo 4', url: 'https://picsum.photos/800/600?random=4' },
        ]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGallery();
  }, [base]);

  const handleLocalLogin = async () => {
    if (!localLoginUser || !localLoginPass) {
      alert('Por favor ingresa usuario y contraseña');
      return;
    }

    console.log('🔍 Login attempt:', { user: localLoginUser, pass: localLoginPass });
    console.log('🔍 Expected:', { user: 'admin', pass: 'admin123' });

    // Validación simplificada con credenciales fijas
    if (localLoginUser.trim() === 'admin' && localLoginPass.trim() === 'admin123') {
      console.log('✅ Login successful with fixed credentials');
      setLoginValidated(true);
      setShowLoginForm(false);
      if (handleLogin) handleLogin();
      
      // También verificar con el servidor usando el formato JSON que espera
      try {
        const response = await fetch(`${base}/api/auth/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'admin',
            password: 'admin123'
          })
        });
        
        if (response.ok) {
          console.log('✅ Server validation successful');
        } else {
          console.log('⚠️ Server validation failed but continuing with local validation');
        }
      } catch (error) {
        console.log('⚠️ Server check failed but continuing with local validation:', error);
      }
    } else {
      console.log('❌ Login failed - invalid credentials');
      console.log('❌ User match:', localLoginUser.trim() === 'admin');
      console.log('❌ Pass match:', localLoginPass.trim() === 'admin123');
      alert('Credenciales incorrectas. Usuario: admin, Contraseña: admin123');
      setLoginValidated(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !uploadName.trim()) {
      alert('Por favor selecciona un archivo y agrega un nombre');
      return;
    }

    if (!loginValidated) {
      alert('Debes estar logueado para subir imágenes');
      setShowLoginForm(true);
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('archivo', selectedFile);
      formData.append('nombre', uploadName);
      formData.append('username', 'admin');
      formData.append('password', 'admin123');
      
      const response = await fetch(`${base}/api/galeria/upload/`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Upload successful:', result);
        
        // Limpiar formulario
        setSelectedFile(null);
        setUploadName('');
        
        // Recargar galería
        loadGallery();
        
        alert('¡Imagen subida exitosamente!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir archivo');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert(`Error al subir imagen: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans pt-32 flex flex-col items-center px-2">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">Galería</h2>
      
      {/* Debug info in development */}
      {!import.meta.env.PROD && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded text-sm">
          <p>🔍 DEBUG: API Base: {base}</p>
          <p>🔍 DEBUG: Items count: {items.length}</p>
          <p>🔍 DEBUG: Logged in: {loginValidated ? 'Yes' : 'No'}</p>
          {error && <p>🔍 DEBUG: Error: {error}</p>}
        </div>
      )}
      
      {loading && <p className="text-lg text-slate-600">Cargando galería...</p>}
      {error && !loading && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded text-sm text-red-700">
          Error cargando imágenes: {error}. Mostrando contenido de ejemplo.
        </div>
      )}
      
      {/* Galería de Imágenes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl w-full mb-8">
        {items.map((it) => (
          <div key={it.id || it.nombre} className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
            <img 
              src={it.url} 
              alt={it.nombre} 
              className="w-full h-48 object-cover rounded-lg mb-3 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedImage(it)}
              onError={(e) => {
                console.log('🔍 Image load error:', it.url);
                e.target.src = 'https://picsum.photos/800/600?random=' + (it.id || Math.random());
              }}
            />
            <div className="text-sm font-medium text-slate-700">{it.nombre}</div>
            {it.fecha && (
              <div className="text-xs text-slate-500 mt-1">{it.fecha}</div>
            )}
          </div>
        ))}
      </div>

      {!loading && items.length === 0 && (
        <div className="text-center text-slate-600 mt-8 mb-8">
          <p className="text-lg">No hay imágenes en la galería aún.</p>
          <p className="text-sm mt-2">Las imágenes aparecerán aquí cuando se suban al sistema.</p>
        </div>
      )}

      {/* Login/Upload Section - ABAJO */}
      <div className="w-full max-w-4xl">
        {!loginValidated ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Acceso para Administradores</h3>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <p><strong>Credenciales de acceso:</strong></p>
              <p>Usuario: <code className="bg-blue-100 px-1 rounded">admin</code></p>
              <p>Contraseña: <code className="bg-blue-100 px-1 rounded">admin123</code></p>
            </div>
            {!showLoginForm ? (
              <button
                onClick={() => setShowLoginForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Iniciar Sesión para Subir Imágenes
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Usuario:</label>
                  <input
                    type="text"
                    value={localLoginUser}
                    onChange={(e) => setLocalLoginUser(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="admin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña:</label>
                  <input
                    type="password"
                    value={localLoginPass}
                    onChange={(e) => setLocalLoginPass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="admin123"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleLocalLogin();
                      }
                    }}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleLocalLogin}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => setShowLoginForm(false)}
                    className="bg-slate-500 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-800">Subir Nueva Imagen</h3>
              <div className="text-sm text-slate-600">
                Conectado como: <span className="font-medium">admin</span>
                <button
                  onClick={() => {
                    setLocalLoginUser('');
                    setLocalLoginPass('');
                    setShowLoginForm(false);
                    setLoginValidated(false);
                  }}
                  className="ml-2 text-red-600 hover:text-red-700"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la imagen:</label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Clase de BJJ - Enero 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Seleccionar archivo:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleFileUpload}
                disabled={uploading || !selectedFile || !uploadName.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {uploading ? 'Subiendo...' : 'Subir Imagen'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Zoom para Imágenes */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full relative">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white text-2xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-all"
            >
              ×
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.nombre}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg">
              <h3 className="font-semibold">{selectedImage.nombre}</h3>
              {selectedImage.fecha && (
                <p className="text-sm opacity-75">{selectedImage.fecha}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
