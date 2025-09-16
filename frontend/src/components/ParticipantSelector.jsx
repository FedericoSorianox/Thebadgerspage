import React, { useState, useEffect } from 'react';
import { sociosAPI } from '../services/api-new.js';

/**
 * Componente para seleccionar participantes desde la API de socios
 * Permite buscar y seleccionar socios para usar en el FightScorer
 */
export default function ParticipantSelector({ onSelect, onClose, title = "Seleccionar Participantes" }) {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [selectedSocios, setSelectedSocios] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Verificar autenticación al montar el componente
  useEffect(() => {
    checkAuthAndLoadSocios();
  }, []);

  // Verificar autenticación y cargar socios
  const checkAuthAndLoadSocios = async () => {
    const username = localStorage.getItem('badgers_user');
    const password = localStorage.getItem('badgers_pass');
    
    if (!username || !password) {
      setShowAuth(true);
      return;
    }
    
    await loadSocios();
  };

  // Manejar autenticación
  const handleAuth = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
    
    if (!username || !password) {
      setAuthError('Debes ingresar usuario y contraseña');
      return;
    }
    
    setAuthLoading(true);
    setAuthError('');
    
    try {
      // Guardar credenciales temporalmente
      localStorage.setItem('badgers_user', username);
      localStorage.setItem('badgers_pass', password);
      
      // Probar la autenticación intentando cargar socios
      await loadSocios();
      setShowAuth(false);
    } catch (err) {
      setAuthError('Credenciales inválidas. Verifica tu usuario y contraseña.');
      // Limpiar credenciales inválidas
      localStorage.removeItem('badgers_user');
      localStorage.removeItem('badgers_pass');
    } finally {
      setAuthLoading(false);
    }
  };

  // Cargar socios desde la API
  const loadSocios = async (search = '') => {
    try {
      setLoading(true);
      setError('');
      const data = await sociosAPI.getAll(search);
      // Asumiendo que la API devuelve un array o un objeto con results
      const sociosList = Array.isArray(data) ? data : (data.results || []);
      setSocios(sociosList);
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('credenciales')) {
        // Error de autenticación
        localStorage.removeItem('badgers_user');
        localStorage.removeItem('badgers_pass');
        setShowAuth(true);
        setAuthError('Credenciales inválidas. Ingresa nuevamente.');
      } else {
        setError('Error al cargar los socios: ' + err.message);
        console.error('Error loading socios:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Buscar socios
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    
    // Debounce para evitar muchas llamadas a la API
    clearTimeout(searchTerm);
    setTimeout(() => {
      loadSocios(query);
    }, 300);
  };

  // Seleccionar/deseleccionar un socio
  const toggleSocio = (socio) => {
    setSelectedSocios(prev => {
      const isSelected = prev.find(s => s.id === socio.id);
      if (isSelected) {
        return prev.filter(s => s.id !== socio.id);
      } else {
        return [...prev, socio];
      }
    });
  };

  // Confirmar selección
  const handleConfirm = () => {
    if (selectedSocios.length >= 2) {
      onSelect(selectedSocios.slice(0, 2)); // Solo tomar los primeros 2
    }
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
    loadSocios('');
  };

  // Si necesita autenticación, mostrar formulario de login
  if (showAuth) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">🔐 Autenticación</h3>
            <button 
              className="text-2xl text-gray-500 hover:text-gray-700 transition-colors" 
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>💡 Información:</strong> Necesitas autenticarte para acceder a la lista de socios. 
              Usa las mismas credenciales que usas para el panel de administración.
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                name="username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tu usuario"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tu contraseña"
                required
              />
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{authError}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                disabled={authLoading}
              >
                {authLoading ? 'Verificando...' : '🔐 Iniciar Sesión'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          <button 
            className="text-2xl text-gray-500 hover:text-gray-700 transition-colors" 
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Información */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>💡 Información:</strong> Selecciona dos socios de la lista para usar en el marcador. 
            Los socios se obtienen desde la base de datos de The Badgers.
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
              placeholder="Buscar socios por nombre..."
              value={searchTerm}
              onChange={handleSearch}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Lista de socios */}
        <div className="flex-1 overflow-y-auto mb-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3">Cargando socios...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          ) : socios.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No se encontraron socios con ese nombre' : 'No hay socios disponibles'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {socios.map((socio) => {
                const isSelected = selectedSocios.find(s => s.id === socio.id);
                return (
                  <div
                    key={socio.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleSocio(socio)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {socio.nombre || socio.nombre_completo || 'Sin nombre'}
                        </h4>
                        {socio.cinturon && (
                          <p className="text-sm text-gray-600">Cinturón: {socio.cinturon}</p>
                        )}
                        {socio.categoria && (
                          <p className="text-sm text-gray-600">Categoría: {socio.categoria}</p>
                        )}
                      </div>
                      <div className="ml-3">
                        {isSelected ? (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Información de selección */}
        {selectedSocios.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm">
              <strong>Seleccionados:</strong> {selectedSocios.map(s => s.nombre || s.nombre_completo).join(', ')}
              {selectedSocios.length > 2 && (
                <span className="text-orange-600"> (Solo se usarán los primeros 2)</span>
              )}
            </p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleConfirm}
            disabled={selectedSocios.length < 2}
          >
            🥊 Usar Seleccionados ({selectedSocios.length}/2)
          </button>
        </div>
      </div>
    </div>
  );
}
