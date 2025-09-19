import React, { useState, useEffect } from 'react';
// import { SingleEliminationBracket, Match, SVGViewer } from '@g-loot/react-tournament-brackets';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';

// API functions for MongoDB
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;

  // Get token from authService
  const token = authService.getToken();

  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const authHeader = `Token ${token}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || `Error ${response.status}`);
  }

  return response.json();
};

// API functions
const api = {
  // Torneos
  getTorneos: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.estado) params.append('estado', filtros.estado);
    return apiCall(`/api/torneo/categorias/?${params}`);
  },

  createTorneo: (torneoData) => apiCall('/api/torneo/categorias/', {
    method: 'POST',
    body: JSON.stringify(torneoData)
  }),

  getTorneo: (id) => apiCall(`/api/torneo/categorias/${id}/`),

  updateTorneo: (id, data) => apiCall(`/api/torneo/categorias/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  deleteTorneo: (id) => apiCall(`/api/torneo/categorias/${id}/`, {
    method: 'DELETE'
  }),

  // Categorías de torneos
  getCategoriasTorneo: () => apiCall('/api/torneo/categorias/'),

  createCategoriaTorneo: (categoriaData) => apiCall('/api/torneo/categorias/', {
    method: 'POST',
    body: JSON.stringify(categoriaData)
  }),

  updateCategoriaTorneo: (categoriaId, categoriaData) => apiCall(`/api/torneo/categorias/${categoriaId}/`, {
    method: 'PUT',
    body: JSON.stringify(categoriaData)
  }),

  deleteCategoriaTorneo: (categoriaId) => apiCall(`/api/torneo/categorias/${categoriaId}/`, {
    method: 'DELETE'
  }),

  // Participantes
  getParticipantes: () => apiCall('/api/torneo/participantes/'),

  createParticipante: (participanteData) => apiCall('/api/torneo/participantes/', {
    method: 'POST',
    body: JSON.stringify(participanteData)
  }),

  // Luchas
  getLuchas: (categoria = null) => {
    const params = categoria ? `?categoria=${categoria}` : '';
    return apiCall(`/api/torneo/luchas/${params}`);
  },

  createLucha: (luchaData) => apiCall('/api/torneo/luchas/', {
    method: 'POST',
    body: JSON.stringify(luchaData)
  }),

  updateLucha: (luchaId, luchaData) => apiCall(`/api/torneo/luchas/${luchaId}/`, {
    method: 'PUT',
    body: JSON.stringify(luchaData)
  }),

  finalizarLucha: (luchaId, data) => apiCall(`/api/torneo/luchas/${luchaId}/finalizar/`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

const TorneoBJJ = () => {
  const { isAuthenticated, isLoading: authLoading, error: authError } = useAuth();

  const [torneos, setTorneos] = useState([]);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vista, setVista] = useState('lista'); // 'lista', 'nuevo', 'bracket', 'participantes', 'luchas'
  const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '' });

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  // Función para mostrar notificaciones
  const mostrarNotificacion = (mensaje, duracion = 3000) => {
    setNotificacion({ mostrar: true, mensaje });
    setTimeout(() => {
      setNotificacion({ mostrar: false, mensaje: '' });
    }, duracion);
  };

  // Cargar torneos al montar el componente
  useEffect(() => {
    if (isAuthenticated) {
      cargarTorneos();
    }
  }, [isAuthenticated]);

  // Verificar autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">Necesitas estar autenticado para acceder a esta página.</p>
          <p className="text-sm text-gray-500">Por favor, inicia sesión como administrador.</p>
          {authError && <p className="text-red-500 mt-2">{authError}</p>}
        </div>
      </div>
    );
  }

  const cargarTorneos = async () => {
    try {
      setLoading(true);
      const response = await api.getTorneos();
      const torneosData = response.torneos || [];

      // Las categorías ya vienen incluidas en la respuesta de la API
      // Solo aseguramos que cada torneo tenga un array de categorías válido
      const torneosConCategorias = torneosData.map(torneo => ({
        ...torneo,
        categorias: Array.isArray(torneo.categorias) ? torneo.categorias : []
      }));

      setTorneos(torneosConCategorias);
    } catch (err) {
      console.error('Error cargando torneos:', err);
      setError('Error al cargar torneos: ' + err.message);

      // Fallback a datos mock si hay error
      const mockTorneos = [
        {
          _id: '1',
          nombre: 'Torneo Invierno 2025',
          fecha: '2025-07-15',
          estado: 'en_progreso',
          categorias: [
            { id: 1, nombre: 'Blanca - Hasta 70kg', estado: 'en_progreso' },
            { id: 2, nombre: 'Azul - Hasta 80kg', estado: 'abierta' }
          ]
        }
      ];
      setTorneos(mockTorneos);
    } finally {
      setLoading(false);
    }
  };

  // Componente para mostrar lista de torneos
  const ListaTorneos = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-cyan-200">Torneos BJJ</h2>
        <button
          onClick={() => setVista('nuevo')}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          Nuevo Torneo
        </button>
      </div>

      {loading ? (
        <div className="text-center text-cyan-100">Cargando torneos...</div>
      ) : error ? (
        <div className="text-center text-red-400">{error}</div>
      ) : torneos.length === 0 ? (
        <div className="text-center text-cyan-100">
          No hay torneos registrados. ¡Crea el primero!
        </div>
      ) : (
        <div className="grid gap-4">
          {torneos.map((torneo) => (
            <div key={torneo._id || torneo.id} className="bg-black/60 rounded-xl p-6 border border-cyan-500/30">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-cyan-200">{torneo.nombre}</h3>
                  <p className="text-cyan-100">Fecha: {new Date(torneo.fecha).toLocaleDateString('es-ES')}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${torneo.estado === 'en_progreso' ? 'bg-green-600 text-white' :
                    torneo.estado === 'finalizado' ? 'bg-gray-600 text-white' :
                      'bg-blue-600 text-white'
                    }`}>
                    {torneo.estado.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setTorneoSeleccionado(torneo);
                      setVista('bracket');
                    }}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Ver Bracket
                  </button>
                  <button
                    onClick={() => {
                      setTorneoSeleccionado(torneo);
                      setVista('participantes');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Participantes
                  </button>
                  <button
                    onClick={() => {
                      setTorneoSeleccionado(torneo);
                      setVista('luchas');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Gestionar Luchas
                  </button>
                  {torneo.estado === 'planificado' && (
                    <button
                      onClick={() => {
                        setTorneoSeleccionado(torneo);
                        setVista('agregar-categoria');
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      + Agregar Categoría
                    </button>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-cyan-200 mb-2">Categorías:</h4>
                <div className="flex flex-wrap gap-2">
                  {(torneo.categorias || []).map((cat) => (
                    <span key={cat.id || cat._id} className="bg-cyan-900/50 text-cyan-100 px-3 py-1 rounded-lg text-sm">
                      {cat.nombre}
                    </span>
                  ))}
                  {(torneo.categorias || []).length === 0 && (
                    <span className="text-cyan-400 text-sm italic">Sin categorías</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Componente para mostrar bracket de torneo
  const BracketView = () => {
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(torneoSeleccionado?.categorias?.[0] || null);
    const [participantes, setParticipantes] = useState([]);
    const [luchas, setLuchas] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Cargar participantes y luchas al montar el componente
    useEffect(() => {
      const cargarDatosCategoria = async () => {
        if (!torneoSeleccionado?._id || !categoriaSeleccionada) return;

        try {
          setCargando(true);

          // Obtener participantes del torneo
          const responseParticipantes = await api.getParticipantes(torneoSeleccionado._id);
          const todosParticipantes = responseParticipantes.participantes || [];

          // Filtrar participantes que pertenecen a la categoría seleccionada
          const participantesCategoria = todosParticipantes.filter(participante => {
            // Lógica para determinar si un participante pertenece a la categoría
            // Por ahora, usaremos una lógica simple basada en cinturón y peso
            if (!participante.cinturon || !participante.peso) return false;

            // Verificar si el cinturón del participante coincide con el tipo de categoría
            const cinturonesCoinciden = participante.cinturon.toLowerCase() === categoriaSeleccionada.tipo_categoria.toLowerCase();

            // Verificar rangos de peso si están definidos
            let pesoCoincide = true;
            if (categoriaSeleccionada.peso_minimo !== null && categoriaSeleccionada.peso_minimo !== undefined) {
              pesoCoincide = pesoCoincide && participante.peso >= categoriaSeleccionada.peso_minimo;
            }
            if (categoriaSeleccionada.peso_maximo !== null && categoriaSeleccionada.peso_maximo !== undefined) {
              pesoCoincide = pesoCoincide && participante.peso <= categoriaSeleccionada.peso_maximo;
            }

            return cinturonesCoinciden && pesoCoincide;
          });

          setParticipantes(participantesCategoria);

          // Generar luchas basadas en los participantes
          const luchasGeneradas = generarLuchas(participantesCategoria);
          setLuchas(luchasGeneradas);

        } catch (error) {
          console.error('Error cargando datos de categoría:', error);
          mostrarNotificacion('Error al cargar datos de la categoría: ' + error.message);
          setParticipantes([]);
          setLuchas([]);
        } finally {
          setCargando(false);
        }
      };

      if (torneoSeleccionado && categoriaSeleccionada) {
        cargarDatosCategoria();
      }
    }, [torneoSeleccionado, categoriaSeleccionada]);

    // Función para generar luchas basadas en participantes
    const generarLuchas = (participantesCategoria) => {
      if (participantesCategoria.length < 2) {
        return [];
      }

      const luchas = [];
      const participantesOrdenados = [...participantesCategoria].sort((a, b) => a.nombre.localeCompare(b.nombre));

      // Generar primera ronda
      for (let i = 0; i < participantesOrdenados.length; i += 2) {
        if (i + 1 < participantesOrdenados.length) {
          luchas.push({
            id: `ronda1_${i}`,
            ronda: 'Primera Ronda',
            participante1: participantesOrdenados[i],
            participante2: participantesOrdenados[i + 1],
            ganador: null,
            estado: 'pendiente',
            puntos1: 0,
            puntos2: 0
          });
        } else {
          // Participante con BYE (si es impar el número)
          luchas.push({
            id: `ronda1_${i}`,
            ronda: 'Primera Ronda',
            participante1: participantesOrdenados[i],
            participante2: null, // BYE
            ganador: participantesOrdenados[i], // Pasa directo
            estado: 'finalizada',
            puntos1: 0,
            puntos2: 0
          });
        }
      }

      // Si hay más de 2 participantes, generar semifinales
      if (participantesOrdenados.length > 2) {
        const semifinalistas = luchas.filter(l => l.ganador).map(l => l.ganador);
        if (semifinalistas.length >= 2) {
          luchas.push({
            id: 'semifinal',
            ronda: 'Semifinal',
            participante1: semifinalistas[0],
            participante2: semifinalistas[1] || null,
            ganador: null,
            estado: 'pendiente',
            puntos1: 0,
            puntos2: 0
          });
        }

        // Generar final si hay suficientes semifinalistas
        if (semifinalistas.length >= 2) {
          luchas.push({
            id: 'final',
            ronda: 'Final',
            participante1: null, // Ganador semifinal 1
            participante2: null, // Ganador semifinal 2
            ganador: null,
            estado: 'pendiente',
            puntos1: 0,
            puntos2: 0
          });
        }
      }

      return luchas;
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-cyan-200">
            Bracket - {torneoSeleccionado?.nombre}
          </h2>
          <button
            onClick={() => setVista('lista')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            ← Volver
          </button>
        </div>

        {/* Selector de categoría */}
        <div className="bg-black/60 rounded-xl p-6 border border-cyan-500/30">
          <h3 className="text-xl font-bold text-cyan-200 mb-4">Seleccionar Categoría</h3>
          <div className="flex flex-wrap gap-3">
            {torneoSeleccionado?.categorias?.map((categoria) => (
              <button
                key={categoria.id}
                onClick={() => setCategoriaSeleccionada(categoria)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${categoriaSeleccionada?.id === categoria.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-cyan-900/50 text-cyan-200 hover:bg-cyan-800/50'
                  }`}
              >
                {categoria.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Información de la categoría */}
        {categoriaSeleccionada && (
          <div className="bg-black/60 rounded-xl p-6 border border-cyan-500/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-cyan-200">Categoría</h4>
                <p className="text-cyan-100 text-xl font-bold">{categoriaSeleccionada.nombre}</p>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-cyan-200">Estado</h4>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${categoriaSeleccionada.estado === 'en_progreso' ? 'bg-green-600 text-white' :
                  categoriaSeleccionada.estado === 'finalizada' ? 'bg-gray-600 text-white' :
                    'bg-blue-600 text-white'
                  }`}>
                  {categoriaSeleccionada.estado?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-cyan-200">Participantes</h4>
                <p className="text-cyan-100 text-xl font-bold">{participantes.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bracket */}
        <div className="bg-black/60 rounded-xl p-6 border border-cyan-500/30">
          <h3 className="text-xl font-bold text-cyan-200 mb-6 text-center">Bracket del Torneo</h3>

          {cargando ? (
            <div className="text-center text-cyan-100 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-2"></div>
              Cargando bracket...
            </div>
          ) : luchas.length === 0 ? (
            <div className="text-center text-cyan-100 py-8">
              {participantes.length === 0
                ? "No hay participantes en esta categoría"
                : "No se pueden generar luchas con menos de 2 participantes"
              }
            </div>
          ) : (
            <div className="space-y-4">
              {luchas.map((lucha) => (
                <div key={lucha.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-cyan-200 font-semibold">{lucha.ronda}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${lucha.estado === 'finalizada' ? 'bg-green-600 text-white' :
                      lucha.estado === 'en_progreso' ? 'bg-blue-600 text-white' :
                        'bg-yellow-600 text-white'
                      }`}>
                      {lucha.estado.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg border-2 ${lucha.ganador && lucha.ganador._id === lucha.participante1?._id
                      ? 'bg-green-900/30 border-green-500'
                      : 'bg-gray-700/30 border-gray-600'
                      }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-cyan-100 font-semibold">{lucha.participante1?.nombre || 'TBD'}</span>
                          {lucha.participante1?.academia && (
                            <div className="text-cyan-300 text-sm">{lucha.participante1.academia}</div>
                          )}
                        </div>
                        <span className="text-cyan-200 font-bold">{lucha.puntos1} pts</span>
                      </div>
                      {lucha.ganador && lucha.ganador._id === lucha.participante1?._id && (
                        <div className="text-green-400 text-sm mt-1">🏆 Ganador</div>
                      )}
                      {lucha.participante2 === null && (
                        <div className="text-yellow-400 text-sm mt-1">📋 BYE</div>
                      )}
                    </div>

                    <div className={`p-3 rounded-lg border-2 ${lucha.ganador && lucha.ganador._id === lucha.participante2?._id
                      ? 'bg-green-900/30 border-green-500'
                      : 'bg-gray-700/30 border-gray-600'
                      }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-cyan-100 font-semibold">{lucha.participante2?.nombre || 'BYE'}</span>
                          {lucha.participante2?.academia && (
                            <div className="text-cyan-300 text-sm">{lucha.participante2.academia}</div>
                          )}
                        </div>
                        <span className="text-cyan-200 font-bold">{lucha.puntos2} pts</span>
                      </div>
                      {lucha.ganador && lucha.ganador._id === lucha.participante2?._id && (
                        <div className="text-green-400 text-sm mt-1">🏆 Ganador</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Componente para gestionar participantes
  const ParticipantesView = () => {
    const [participantes, setParticipantes] = useState([]);
    const [cargandoParticipantes, setCargandoParticipantes] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [participanteEditando, setParticipanteEditando] = useState(null);

    // Cargar participantes al montar el componente
    useEffect(() => {
      cargarParticipantes();
    }, []);

    const cargarParticipantes = async () => {
      if (!torneoSeleccionado?._id) return;

      try {
        setCargandoParticipantes(true);
        const response = await api.getParticipantes(torneoSeleccionado._id);
        setParticipantes(response.participantes || []);
      } catch (error) {
        console.error('Error cargando participantes:', error);
        mostrarNotificacion('Error al cargar participantes: ' + error.message);
        // Fallback a datos mock
        setParticipantes([
          {
            _id: '1',
            nombre: 'Juan Pérez',
            academia: 'The Badgers',
            cinturon: 'azul',
            peso: 75.5,
            categoria_sugerida: 'Azul - Hasta 80kg'
          }
        ]);
      } finally {
        setCargandoParticipantes(false);
      }
    };

    const handleAgregarParticipante = () => {
      setParticipanteEditando(null);
      setMostrarFormulario(true);
    };

    const handleEditarParticipante = (participante) => {
      setParticipanteEditando(participante);
      setMostrarFormulario(true);
    };

    const handleEliminarParticipante = async (id) => {
      if (!window.confirm('¿Estás seguro de que quieres eliminar este participante?')) return;

      try {
        // Por ahora simulamos eliminación local ya que la API no la tiene implementada
        setParticipantes(participantes.filter(p => p._id !== id));
        mostrarNotificacion('Participante eliminado exitosamente');
      } catch (error) {
        console.error('Error eliminando participante:', error);
        mostrarNotificacion('Error eliminando participante: ' + error.message);
      }
    };

    const handleGuardarParticipante = async (nuevoParticipante) => {
      if (!torneoSeleccionado?._id) return;

      try {
        const participanteData = {
          nombre: nuevoParticipante.nombre,
          cinturon: nuevoParticipante.cinturon,
          academia: nuevoParticipante.academia,
          peso: parseFloat(nuevoParticipante.peso) || null
        };

        if (participanteEditando) {
          // Para edición, por ahora solo actualizamos localmente
          setParticipantes(participantes.map(p =>
            p._id === participanteEditando._id ? { ...nuevoParticipante, _id: p._id } : p
          ));
          mostrarNotificacion('Participante actualizado exitosamente');
        } else {
          // Crear nuevo participante
          const response = await api.createParticipante(torneoSeleccionado._id, participanteData);
          setParticipantes([...participantes, response.participante]);
          mostrarNotificacion('Participante agregado exitosamente');
        }

        setMostrarFormulario(false);
        setParticipanteEditando(null);
      } catch (error) {
        console.error('Error guardando participante:', error);
        mostrarNotificacion('Error guardando participante: ' + error.message);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-cyan-200">
            Participantes - {torneoSeleccionado?.nombre}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleAgregarParticipante}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              + Agregar Participante
            </button>
            <button
              onClick={() => setVista('lista')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              ← Volver
            </button>
          </div>
        </div>

        {/* Formulario para agregar/editar participante */}
        {mostrarFormulario && (
          <FormularioParticipante
            participante={participanteEditando}
            onGuardar={handleGuardarParticipante}
            onCancelar={() => {
              setMostrarFormulario(false);
              setParticipanteEditando(null);
            }}
          />
        )}

        {/* Lista de participantes */}
        <div className="bg-black/60 rounded-xl p-6 border border-cyan-500/30">
          <h3 className="text-xl font-bold text-cyan-200 mb-4">
            Lista de Participantes ({participantes.length})
          </h3>

          {cargandoParticipantes ? (
            <div className="text-center text-cyan-100 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-2"></div>
              Cargando participantes...
            </div>
          ) : participantes.length === 0 ? (
            <p className="text-cyan-100">No hay participantes registrados aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-cyan-100">
                <thead>
                  <tr className="border-b border-cyan-500/30">
                    <th className="text-left py-3 px-4">Nombre</th>
                    <th className="text-left py-3 px-4">Academia</th>
                    <th className="text-left py-3 px-4">Cinturón</th>
                    <th className="text-left py-3 px-4">Peso (kg)</th>
                    <th className="text-left py-3 px-4">Categoría</th>
                    <th className="text-center py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {participantes.map((participante) => (
                    <tr key={participante._id} className="border-b border-cyan-500/10 hover:bg-cyan-900/20">
                      <td className="py-3 px-4 font-semibold">{participante.nombre}</td>
                      <td className="py-3 px-4">{participante.academia}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${participante.cinturon === 'blanca' ? 'bg-white text-black' :
                          participante.cinturon === 'azul' ? 'bg-blue-600 text-white' :
                            participante.cinturon === 'violeta' ? 'bg-purple-600 text-white' :
                              participante.cinturon === 'marron' ? 'bg-amber-800 text-white' :
                                'bg-black text-white'
                          }`}>
                          {participante.cinturon.charAt(0).toUpperCase() + participante.cinturon.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">{participante.peso || 'N/A'} kg</td>
                      <td className="py-3 px-4">{participante.categoria_sugerida || 'Sin asignar'}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEditarParticipante(participante)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminarParticipante(participante._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Componente del formulario para participantes
  const FormularioParticipante = ({ participante, onGuardar, onCancelar }) => {
    const [formData, setFormData] = useState({
      nombre: participante?.nombre || '',
      academia: participante?.academia || 'The Badgers',
      cinturon: participante?.cinturon || 'blanca',
      peso: participante?.peso || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();

      // Determinar categoría sugerida
      const determinarCategoria = () => {
        const { cinturon, peso } = formData;
        if (!peso) return 'Sin asignar';

        const sufijo = peso <= 70 ? ' - Hasta 70kg' :
          peso <= 80 ? ' - Hasta 80kg' : ' - Más de 80kg';

        return `${cinturon.charAt(0).toUpperCase() + cinturon.slice(1)}${sufijo}`;
      };

      const nuevoParticipante = {
        ...formData,
        peso: parseFloat(formData.peso),
        categoria: determinarCategoria()
      };

      onGuardar(nuevoParticipante);
    };

    return (
      <div className="bg-black/60 rounded-xl p-6 border border-cyan-500/30">
        <h3 className="text-xl font-bold text-cyan-200 mb-4">
          {participante ? 'Editar Participante' : 'Agregar Nuevo Participante'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-cyan-100 font-semibold mb-2">Nombre *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-cyan-100 font-semibold mb-2">Academia</label>
              <input
                type="text"
                value={formData.academia}
                onChange={(e) => setFormData({ ...formData, academia: e.target.value })}
                className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-cyan-100 font-semibold mb-2">Cinturón *</label>
              <select
                value={formData.cinturon}
                onChange={(e) => setFormData({ ...formData, cinturon: e.target.value })}
                className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                required
              >
                <option value="blanca">Blanca</option>
                <option value="azul">Azul</option>
                <option value="violeta">Violeta</option>
                <option value="marron">Marrón</option>
                <option value="negro">Negro</option>
              </select>
            </div>

            <div>
              <label className="block text-cyan-100 font-semibold mb-2">Peso (kg) *</label>
              <input
                type="number"
                step="0.1"
                value={formData.peso}
                onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                placeholder="75.5"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              {participante ? 'Actualizar' : 'Agregar'}
            </button>
            <button
              type="button"
              onClick={onCancelar}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Componente para gestionar luchas
  const LuchasView = () => {
    const [participantes, setParticipantes] = useState([]);
    const [luchas, setLuchas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [luchaSeleccionada, setLuchaSeleccionada] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [tiempoSeleccionado, setTiempoSeleccionado] = useState(5); // minutos
    const [tiempoRestante, setTiempoRestante] = useState(0);
    const [timerActivo, setTimerActivo] = useState(false);
    const [timerPausado, setTimerPausado] = useState(false);
    const [intervalId, setIntervalId] = useState(null);
    const [ordenInvertido, setOrdenInvertido] = useState(false);
    const [mostrarModalGanador, setMostrarModalGanador] = useState(false);

    // Cargar participantes del torneo
    useEffect(() => {
      const cargarParticipantesTorneo = async () => {
        if (!torneoSeleccionado?._id) return;

        try {
          setCargando(true);
          const response = await api.getParticipantes(torneoSeleccionado._id);
          const participantesData = response.participantes || [];
          setParticipantes(participantesData);

          // Si hay categorías disponibles, seleccionar la primera por defecto
          if (torneoSeleccionado.categorias && torneoSeleccionado.categorias.length > 0) {
            setCategoriaSeleccionada(torneoSeleccionado.categorias[0]);
          }

        } catch (error) {
          console.error('Error cargando participantes:', error);
          mostrarNotificacion('Error al cargar participantes: ' + error.message);
          setParticipantes([]);
        } finally {
          setCargando(false);
        }
      };

      if (torneoSeleccionado) {
        cargarParticipantesTorneo();
      }
    }, [torneoSeleccionado]);

    // Generar luchas basadas en la categoría seleccionada
    useEffect(() => {
      if (categoriaSeleccionada && participantes.length > 0) {
        // Filtrar participantes que pertenecen a esta categoría
        const participantesCategoria = participantes.filter(participante => {
          if (!participante.cinturon || !participante.peso) return false;

          const cinturonesCoinciden = participante.cinturon.toLowerCase() === categoriaSeleccionada.tipo_categoria.toLowerCase();

          let pesoCoincide = true;
          if (categoriaSeleccionada.peso_minimo !== null && categoriaSeleccionada.peso_minimo !== undefined) {
            pesoCoincide = pesoCoincide && participante.peso >= categoriaSeleccionada.peso_minimo;
          }
          if (categoriaSeleccionada.peso_maximo !== null && categoriaSeleccionada.peso_maximo !== undefined) {
            pesoCoincide = pesoCoincide && participante.peso <= categoriaSeleccionada.peso_maximo;
          }

          return cinturonesCoinciden && pesoCoincide;
        });

        if (participantesCategoria.length < 2) {
          setLuchas([]);
          return;
        }

        const luchasGeneradas = [];
        const participantesOrdenados = [...participantesCategoria].sort((a, b) => a.nombre.localeCompare(b.nombre));

        // Crear luchas de primera ronda
        for (let i = 0; i < participantesOrdenados.length; i += 2) {
          if (i + 1 < participantesOrdenados.length) {
            luchasGeneradas.push({
              id: `lucha_${categoriaSeleccionada.id}_${i}`,
              categoria: categoriaSeleccionada.nombre,
              ronda: 'Primera Ronda',
              participante1: participantesOrdenados[i],
              participante2: participantesOrdenados[i + 1],
              estado: 'pendiente',
              tiempo_transcurrido: 0,
              cronometro_activo: false,
              puntos_total_p1: 0,
              ventajas_p1: 0,
              penalizaciones_p1: 0,
              puntos_total_p2: 0,
              ventajas_p2: 0,
              penalizaciones_p2: 0,
              ganador: null,
              tipo_victoria: null
            });
          }
        }

        setLuchas(luchasGeneradas);
      } else {
        setLuchas([]);
      }
    }, [categoriaSeleccionada, participantes]);

    // Limpiar interval cuando el componente se desmonte
    useEffect(() => {
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }, [intervalId]);

    // Ocultar navbar cuando esté en fullscreen
    useEffect(() => {
      if (isFullscreen) {
        document.body.classList.add('hide-navbar');
      } else {
        document.body.classList.remove('hide-navbar');
      }

      // Cleanup al desmontar
      return () => {
        document.body.classList.remove('hide-navbar');
      };
    }, [isFullscreen]);

    // Función para manejar fullscreen
    const toggleFullscreen = () => {
      setIsFullscreen(!isFullscreen);
    };

    // Función para cambiar el orden de los participantes
    const cambiarOrdenParticipantes = () => {
      setOrdenInvertido(!ordenInvertido);
    };

    // Función para iniciar el timer
    const iniciarTimer = () => {
      if (intervalId) {
        clearInterval(intervalId);
      }

      // Si el timer ya estaba corriendo, solo lo reanudamos
      if (timerActivo && timerPausado) {
        setTimerPausado(false);
        const id = setInterval(() => {
          setTiempoRestante(prev => {
            if (prev <= 1) {
              // Timer terminó
              clearInterval(id);
              setTimerActivo(false);
              setTimerPausado(false);
              setIntervalId(null);
              mostrarNotificacion('¡Tiempo terminado!', 5000);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setIntervalId(id);
        return;
      }

      // Nuevo timer
      const tiempoTotal = tiempoSeleccionado * 60; // convertir a segundos
      setTiempoRestante(tiempoTotal);
      setTimerActivo(true);
      setTimerPausado(false);

      const id = setInterval(() => {
        setTiempoRestante(prev => {
          if (prev <= 1) {
            // Timer terminó
            clearInterval(id);
            setTimerActivo(false);
            setTimerPausado(false);
            setIntervalId(null);
            mostrarNotificacion('¡Tiempo terminado! Selecciona el ganador.', 3000);
            setMostrarModalGanador(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setIntervalId(id);
    };

    // Función para pausar el timer
    const pausarTimer = () => {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setTimerPausado(true);
    };

    // Función para detener el timer completamente
    const detenerTimer = () => {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setTimerActivo(false);
      setTimerPausado(false);
    };

    const handleIniciarLucha = (luchaId) => {
      setLuchas(luchas.map(lucha =>
        lucha.id === luchaId
          ? { ...lucha, estado: 'en_progreso', cronometro_activo: true }
          : lucha
      ));
      // Iniciar el timer automáticamente
      iniciarTimer();
    };

    const handleFinalizarLucha = async (luchaId, tipoVictoria, detalle = '', ganadorSeleccionado = null) => {
      detenerTimer(); // Detener el timer cuando se finaliza la lucha

      try {
        const lucha = luchas.find(l => l.id === luchaId);
        if (!lucha) return;

        let ganadorId = null;
        let estadoFinal = 'finalizada';

        if (tipoVictoria === 'puntos') {
          const puntos1 = calcularPuntos(lucha, 1);
          const puntos2 = calcularPuntos(lucha, 2);
          const ventajas1 = lucha.ventajas_p1 || 0;
          const ventajas2 = lucha.ventajas_p2 || 0;
          const penalizaciones1 = lucha.penalizaciones_p1 || 0;
          const penalizaciones2 = lucha.penalizaciones_p2 || 0;

          if (puntos1 > puntos2) {
            ganadorId = lucha.participante1._id || lucha.participante1.id;
          } else if (puntos2 > puntos1) {
            ganadorId = lucha.participante2._id || lucha.participante2.id;
          } else if (ventajas1 > ventajas2) {
            ganadorId = lucha.participante1._id || lucha.participante1.id;
          } else if (ventajas2 > ventajas1) {
            ganadorId = lucha.participante2._id || lucha.participante2.id;
          } else if (penalizaciones1 < penalizaciones2) {
            ganadorId = lucha.participante1._id || lucha.participante1.id;
          } else if (penalizaciones2 < penalizaciones1) {
            ganadorId = lucha.participante2._id || lucha.participante2.id;
          }
        } else if (tipoVictoria === 'tiempo' || tipoVictoria === 'sumision' || tipoVictoria === 'descalificacion' || tipoVictoria === 'wo') {
          // Usar el ganador seleccionado
          if (ganadorSeleccionado) {
            ganadorId = ganadorSeleccionado._id || ganadorSeleccionado.id;
          }
        } else if (tipoVictoria === 'empate') {
          estadoFinal = 'finalizada'; // Empate también finaliza la lucha
          ganadorId = null; // Sin ganador en empate
        }

        // Llamar a la API para finalizar la lucha
        await api.finalizarLucha(luchaId, ganadorId, tipoVictoria, detalle);

        // Actualizar el estado local
        setLuchas(luchas.map(l => {
          if (l.id === luchaId) {
            return {
              ...l,
              estado: estadoFinal,
              cronometro_activo: false,
              ganador: ganadorSeleccionado,
              tipo_victoria: tipoVictoria,
              resultado_detalle: detalle
            };
          }
          return l;
        }));

        // Cerrar el modal después de finalizar la lucha
        setLuchaSeleccionada(null);
        setIsFullscreen(false);
        setMostrarModalGanador(false);
        mostrarNotificacion('Lucha finalizada exitosamente', 3000);

      } catch (error) {
        console.error('Error finalizando lucha:', error);
        mostrarNotificacion('Error al finalizar la lucha: ' + error.message, 5000);
      }
    };

    const actualizarPuntuacion = (luchaId, participante, puntos) => {
      setLuchas(luchas.map(lucha => {
        if (lucha.id === luchaId) {
          const campoPuntos = `puntos_total_p${participante}`;
          const valorActual = lucha[campoPuntos] || 0;
          const nuevoValor = Math.max(0, valorActual + puntos);

          // Actualizar el estado de la lucha seleccionada también
          if (luchaSeleccionada && luchaSeleccionada.id === luchaId) {
            setLuchaSeleccionada(prev => ({
              ...prev,
              [campoPuntos]: nuevoValor
            }));
          }

          return { ...lucha, [campoPuntos]: nuevoValor };
        }
        return lucha;
      }));
    };

    const actualizarVentajas = (luchaId, participante, valor) => {
      setLuchas(luchas.map(lucha => {
        if (lucha.id === luchaId) {
          const campoVentajas = `ventajas_p${participante}`;
          const valorActual = lucha[campoVentajas] || 0;
          const nuevoValor = Math.max(0, valorActual + valor);

          if (luchaSeleccionada && luchaSeleccionada.id === luchaId) {
            setLuchaSeleccionada(prev => ({
              ...prev,
              [campoVentajas]: nuevoValor
            }));
          }

          return { ...lucha, [campoVentajas]: nuevoValor };
        }
        return lucha;
      }));
    };

    const actualizarPenalizaciones = (luchaId, participante, valor) => {
      setLuchas(luchas.map(lucha => {
        if (lucha.id === luchaId) {
          const campoPenalizaciones = `penalizaciones_p${participante}`;
          const valorActual = lucha[campoPenalizaciones] || 0;
          const nuevoValor = Math.max(0, valorActual + valor);

          if (luchaSeleccionada && luchaSeleccionada.id === luchaId) {
            setLuchaSeleccionada(prev => ({
              ...prev,
              [campoPenalizaciones]: nuevoValor
            }));
          }

          return { ...lucha, [campoPenalizaciones]: nuevoValor };
        }
        return lucha;
      }));
    };



    const calcularPuntos = (lucha, participante) => {
      return lucha[`puntos_total_p${participante}`] || 0;
    };

    const formatTiempo = (segundos) => {
      const mins = Math.floor(segundos / 60);
      const secs = segundos % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-cyan-200">
            Sistema de Luchas BJJ - {torneoSeleccionado?.nombre}
          </h2>
          <button
            onClick={() => setVista('lista')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            ← Volver
          </button>
        </div>

        {/* Selector de categoría */}
        {torneoSeleccionado?.categorias && torneoSeleccionado.categorias.length > 0 && (
          <div className="bg-black/60 rounded-xl p-6 border border-cyan-500/30">
            <h3 className="text-xl font-bold text-cyan-200 mb-4">Seleccionar Categoría</h3>
            <div className="flex flex-wrap gap-3">
              {torneoSeleccionado.categorias.map((categoria) => (
                <button
                  key={categoria.id || categoria._id}
                  onClick={() => setCategoriaSeleccionada(categoria)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${categoriaSeleccionada?.id === categoria.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-cyan-900/50 text-cyan-200 hover:bg-cyan-800/50'
                    }`}
                >
                  {categoria.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Información de la categoría seleccionada */}
        {categoriaSeleccionada && (
          <div className="bg-black/60 rounded-xl p-6 border border-cyan-500/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-cyan-200">Categoría</h4>
                <p className="text-cyan-100 text-xl font-bold">{categoriaSeleccionada.nombre}</p>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-cyan-200">Participantes</h4>
                <p className="text-cyan-100 text-xl font-bold">
                  {participantes.filter(p => {
                    if (!p.cinturon || !p.peso) return false;
                    const cinturonesCoinciden = p.cinturon.toLowerCase() === categoriaSeleccionada.tipo_categoria.toLowerCase();
                    let pesoCoincide = true;
                    if (categoriaSeleccionada.peso_minimo !== null && categoriaSeleccionada.peso_minimo !== undefined) {
                      pesoCoincide = pesoCoincide && p.peso >= categoriaSeleccionada.peso_minimo;
                    }
                    if (categoriaSeleccionada.peso_maximo !== null && categoriaSeleccionada.peso_maximo !== undefined) {
                      pesoCoincide = pesoCoincide && p.peso <= categoriaSeleccionada.peso_maximo;
                    }
                    return cinturonesCoinciden && pesoCoincide;
                  }).length}
                </p>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-cyan-200">Luchas</h4>
                <p className="text-cyan-100 text-xl font-bold">{luchas.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Vista detallada de lucha seleccionada */}
        {luchaSeleccionada && (
          <div className={`bg-black rounded-xl border border-cyan-500/30 ${isFullscreen ? 'fixed inset-0 z-50 p-4' : 'p-6'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`${isFullscreen ? 'text-3xl' : 'text-2xl'} font-bold text-cyan-200`}>
                {luchaSeleccionada.participante1.nombre} vs {luchaSeleccionada.participante2.nombre}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  {isFullscreen ? '⛶ Salir Fullscreen' : '⛶ Fullscreen'}
                </button>
                <button
                  onClick={() => {
                    setLuchaSeleccionada(null);
                    setIsFullscreen(false);
                    detenerTimer();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* Selector de tiempo y timer */}
            {luchaSeleccionada.estado === 'pendiente' && (
              <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-600/30">
                <h4 className="text-lg font-semibold text-cyan-200 mb-4">Configuración de Lucha</h4>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex gap-2">
                      <span className="text-cyan-100 font-semibold">Duración:</span>
                      {[3, 5, 6, 7].map(min => (
                        <button
                          key={min}
                          onClick={() => setTiempoSeleccionado(min)}
                          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${tiempoSeleccionado === min
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-700 text-cyan-200 hover:bg-gray-600'
                            }`}
                        >
                          {min} min
                        </button>
                      ))}
                    </div>
                    <div className="text-cyan-100">
                      Tiempo seleccionado: <span className="font-bold text-cyan-300">{tiempoSeleccionado} minutos</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="text-cyan-100 font-semibold">Orden de participantes:</span>
                    <button
                      onClick={cambiarOrdenParticipantes}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${ordenInvertido
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                      🔄 {ordenInvertido ? 'Derecha → Izquierda' : 'Izquierda → Derecha'}
                    </button>
                    <div className="text-cyan-100 text-sm">
                      {ordenInvertido
                        ? `${luchaSeleccionada.participante2.nombre} (azul) vs ${luchaSeleccionada.participante1.nombre} (rojo)`
                        : `${luchaSeleccionada.participante1.nombre} (azul) vs ${luchaSeleccionada.participante2.nombre} (rojo)`
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timer activo */}
            {timerActivo && (
              <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-600/30 text-center">
                <div className={`text-4xl font-bold font-mono ${tiempoRestante <= 30 ? 'text-red-400 animate-pulse' :
                  tiempoRestante <= 60 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                  {formatTiempo(tiempoRestante)}
                </div>
                <div className="text-cyan-100 text-sm mt-2 mb-4">
                  Tiempo restante {timerPausado && '(PAUSADO)'}
                </div>
                <div className="flex justify-center gap-2">
                  {timerPausado ? (
                    <button
                      onClick={iniciarTimer}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      ▶ Reanudar
                    </button>
                  ) : (
                    <button
                      onClick={pausarTimer}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      ⏸ Pausar
                    </button>
                  )}
                  <button
                    onClick={() => {
                      detenerTimer();
                      setMostrarModalGanador(true);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    ⏹ Detener Lucha
                  </button>
                </div>
              </div>
            )}

            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${ordenInvertido ? 'flex-row-reverse' : ''}`}>
              {/* Participante 1 (izquierda) */}
              <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                <h4 className="text-xl font-bold text-blue-200 mb-4 text-center">
                  {ordenInvertido ? luchaSeleccionada.participante2.nombre : luchaSeleccionada.participante1.nombre}
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-blue-800/50 rounded p-2">
                      <div className="text-blue-200 font-semibold">Puntos Totales</div>
                      <div className="text-xl font-bold text-blue-100">{calcularPuntos(luchaSeleccionada, 1)}</div>
                    </div>
                    <div className="bg-blue-800/50 rounded p-2">
                      <div className="text-blue-200 font-semibold">Ventajas</div>
                      <div className="text-xl font-bold text-blue-100">{luchaSeleccionada.ventajas_p1}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Puntos principales */}
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => actualizarPuntuacion(luchaSeleccionada.id, '1', 4)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-3 rounded-lg font-bold text-lg transition-colors">
                        +4
                      </button>
                      <button onClick={() => actualizarPuntuacion(luchaSeleccionada.id, '1', 3)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-3 rounded-lg font-bold text-lg transition-colors">
                        +3
                      </button>
                      <button onClick={() => actualizarPuntuacion(luchaSeleccionada.id, '1', 2)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-3 rounded-lg font-bold text-lg transition-colors">
                        +2
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => actualizarPuntuacion(luchaSeleccionada.id, '1', -4)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-3 rounded-lg font-bold text-lg transition-colors">
                        -4
                      </button>
                      <button onClick={() => actualizarPuntuacion(luchaSeleccionada.id, '1', -3)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-3 rounded-lg font-bold text-lg transition-colors">
                        -3
                      </button>
                      <button onClick={() => actualizarPuntuacion(luchaSeleccionada.id, '1', -2)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-3 rounded-lg font-bold text-lg transition-colors">
                        -2
                      </button>
                    </div>

                    {/* Ventajas */}
                    <div className="flex justify-between items-center bg-blue-900/30 rounded-lg p-2">
                      <span className="text-blue-200 font-semibold">Ventajas</span>
                      <div className="flex gap-2">
                        <button onClick={() => actualizarVentajas(luchaSeleccionada.id, '1', -1)} className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">-1</button>
                        <span className="text-blue-100 font-bold min-w-[30px] text-center">{luchaSeleccionada.ventajas_p1 || 0}</span>
                        <button onClick={() => actualizarVentajas(luchaSeleccionada.id, '1', 1)} className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">+1</button>
                      </div>
                    </div>

                    {/* Penalizaciones */}
                    <div className="flex justify-between items-center bg-red-900/30 rounded-lg p-2">
                      <span className="text-red-400 font-semibold">Penalizaciones</span>
                      <div className="flex gap-2">
                        <button onClick={() => actualizarPenalizaciones(luchaSeleccionada.id, '1', -1)} className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">-1</button>
                        <span className="text-red-400 font-bold min-w-[30px] text-center">{luchaSeleccionada.penalizaciones_p1 || 0}</span>
                        <button onClick={() => actualizarPenalizaciones(luchaSeleccionada.id, '1', 1)} className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">+1</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Participante 2 (derecha) */}
              <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
                <h4 className="text-xl font-bold text-red-200 mb-4 text-center">
                  {ordenInvertido ? luchaSeleccionada.participante1.nombre : luchaSeleccionada.participante2.nombre}
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-red-800/50 rounded p-2">
                      <div className="text-red-200 font-semibold">Puntos Totales</div>
                      <div className="text-xl font-bold text-red-100">{calcularPuntos(luchaSeleccionada, 2)}</div>
                    </div>
                    <div className="bg-red-800/50 rounded p-2">
                      <div className="text-red-200 font-semibold">Ventajas</div>
                      <div className="text-xl font-bold text-red-100">{luchaSeleccionada.ventajas_p2}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Puntos principales */}
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => actualizarPuntuacion(luchaSeleccionada.id, '2', 4)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-3 rounded-lg font-bold text-lg transition-colors">
                        +4
                      </button>
                      <button onClick={() => actualizarPuntuacion(luchaSeleccionada.id, '2', 3)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-3 rounded-lg font-bold text-lg transition-colors">
                        +3
                      </button>
                      <button onClick={() => actualizarPuntuacion(luchaSeleccionada.id, '2', 2)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-3 rounded-lg font-bold text-lg transition-colors">
                        +2
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => actualizarPuntuacion(luchaSeleccionada.id, '2', -4)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-3 rounded-lg font-bold text-lg transition-colors">
                        -4
                      </button>
                      <button onClick={() => actualizarPuntuacion(luchaSeleccionada.id, '2', -3)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-3 rounded-lg font-bold text-lg transition-colors">
                        -3
                      </button>
                      <button onClick={() => actualizarPuntuacion(luchaSeleccionada.id, '2', -2)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-3 rounded-lg font-bold text-lg transition-colors">
                        -2
                      </button>
                    </div>

                    {/* Ventajas */}
                    <div className="flex justify-between items-center bg-blue-900/30 rounded-lg p-2">
                      <span className="text-blue-200 font-semibold">Ventajas</span>
                      <div className="flex gap-2">
                        <button onClick={() => actualizarVentajas(luchaSeleccionada.id, '2', -1)} className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">-1</button>
                        <span className="text-blue-100 font-bold min-w-[30px] text-center">{luchaSeleccionada.ventajas_p2 || 0}</span>
                        <button onClick={() => actualizarVentajas(luchaSeleccionada.id, '2', 1)} className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">+1</button>
                      </div>
                    </div>

                    {/* Penalizaciones */}
                    <div className="flex justify-between items-center bg-red-900/30 rounded-lg p-2">
                      <span className="text-red-400 font-semibold">Penalizaciones</span>
                      <div className="flex gap-2">
                        <button onClick={() => actualizarPenalizaciones(luchaSeleccionada.id, '2', -1)} className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">-1</button>
                        <span className="text-red-400 font-bold min-w-[30px] text-center">{luchaSeleccionada.penalizaciones_p2 || 0}</span>
                        <button onClick={() => actualizarPenalizaciones(luchaSeleccionada.id, '2', 1)} className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">+1</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controles de la lucha */}
            <div className="mt-6 space-y-4">
              {luchaSeleccionada.estado === 'pendiente' && (
                <div className="flex justify-center">
                  <button
                    onClick={() => handleIniciarLucha(luchaSeleccionada.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-colors"
                  >
                    ▶ Iniciar Lucha ({tiempoSeleccionado} min)
                  </button>
                </div>
              )}

              {luchaSeleccionada.estado === 'en_progreso' && (
                <div className="space-y-4">
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleFinalizarLucha(luchaSeleccionada.id, 'puntos')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                    >
                      🏆 Finalizar por Puntos
                    </button>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                    <h4 className="text-lg font-semibold text-cyan-200 mb-4 text-center">Finalizar por Sumisión/Descalificación</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h5 className="text-blue-200 font-semibold text-center">Ganador: {luchaSeleccionada.participante1.nombre}</h5>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const detalle = prompt('Tipo de sumisión:');
                              if (detalle) handleFinalizarLucha(luchaSeleccionada.id, 'sumision', detalle, luchaSeleccionada.participante1);
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                          >
                            🥋 Sumisión
                          </button>
                          <button
                            onClick={() => {
                              const detalle = prompt('Motivo de descalificación:');
                              if (detalle) handleFinalizarLucha(luchaSeleccionada.id, 'descalificacion', detalle, luchaSeleccionada.participante1);
                            }}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                          >
                            🚫 Descalificación
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h5 className="text-red-200 font-semibold text-center">Ganador: {luchaSeleccionada.participante2.nombre}</h5>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const detalle = prompt('Tipo de sumisión:');
                              if (detalle) handleFinalizarLucha(luchaSeleccionada.id, 'sumision', detalle, luchaSeleccionada.participante2);
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                          >
                            🥋 Sumisión
                          </button>
                          <button
                            onClick={() => {
                              const detalle = prompt('Motivo de descalificación:');
                              if (detalle) handleFinalizarLucha(luchaSeleccionada.id, 'descalificacion', detalle, luchaSeleccionada.participante2);
                            }}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                          >
                            🚫 Descalificación
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal de selección de ganador */}
        {mostrarModalGanador && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
            <div className="bg-gray-800 rounded-xl p-6 border border-cyan-500/30 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-cyan-200 mb-6 text-center">Seleccionar Ganador</h3>

              <div className="space-y-4 mb-6">
                <div className="text-center text-cyan-100 mb-4">
                  <div className="text-lg font-semibold mb-2">Puntuación Final:</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-900/30 rounded p-3">
                      <div className="text-blue-200 font-semibold">
                        {ordenInvertido ? luchaSeleccionada.participante2.nombre : luchaSeleccionada.participante1.nombre}
                      </div>
                      <div className="text-xl font-bold text-blue-100">
                        {calcularPuntos(luchaSeleccionada, 1)} pts
                      </div>
                      <div className="text-blue-300">
                        Ventajas: {luchaSeleccionada.ventajas_p1 || 0}
                      </div>
                    </div>
                    <div className="bg-red-900/30 rounded p-3">
                      <div className="text-red-200 font-semibold">
                        {ordenInvertido ? luchaSeleccionada.participante1.nombre : luchaSeleccionada.participante2.nombre}
                      </div>
                      <div className="text-xl font-bold text-red-100">
                        {calcularPuntos(luchaSeleccionada, 2)} pts
                      </div>
                      <div className="text-red-300">
                        Ventajas: {luchaSeleccionada.ventajas_p2 || 0}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-cyan-100 mb-4">¿Quién ganó la lucha?</p>

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => {
                        const ganador = ordenInvertido ? luchaSeleccionada.participante2 : luchaSeleccionada.participante1;
                        handleFinalizarLucha(luchaSeleccionada.id, 'tiempo', 'Victoria por tiempo', ganador);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                    >
                      🏆 {ordenInvertido ? luchaSeleccionada.participante2.nombre : luchaSeleccionada.participante1.nombre}
                    </button>

                    <button
                      onClick={() => {
                        const ganador = ordenInvertido ? luchaSeleccionada.participante1 : luchaSeleccionada.participante2;
                        handleFinalizarLucha(luchaSeleccionada.id, 'tiempo', 'Victoria por tiempo', ganador);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                    >
                      🏆 {ordenInvertido ? luchaSeleccionada.participante1.nombre : luchaSeleccionada.participante2.nombre}
                    </button>

                    <button
                      onClick={() => {
                        handleFinalizarLucha(luchaSeleccionada.id, 'empate', 'Empate por tiempo');
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                    >
                      🤝 Empate
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setMostrarModalGanador(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de luchas */}
        <div className="bg-black/60 rounded-xl p-6 border border-cyan-500/30">
          <h3 className="text-xl font-bold text-cyan-200 mb-4">
            Lista de Luchas ({luchas.length})
          </h3>

          {cargando ? (
            <div className="text-center text-cyan-100 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-2"></div>
              Cargando luchas...
            </div>
          ) : luchas.length === 0 ? (
            <div className="text-center text-cyan-100 py-8">
              {categoriaSeleccionada
                ? `No hay luchas disponibles para la categoría ${categoriaSeleccionada.nombre}`
                : "Selecciona una categoría para ver las luchas"
              }
            </div>
          ) : (
            <div className="space-y-4">
              {luchas.map((lucha) => (
                <div key={lucha.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-4">
                      <span className="text-cyan-200 font-semibold">{lucha.categoria}</span>
                      <span className="text-cyan-100">- {lucha.ronda}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${lucha.estado === 'pendiente' ? 'bg-yellow-600 text-white' :
                        lucha.estado === 'en_progreso' ? 'bg-green-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                        {lucha.estado.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {lucha.estado === 'en_progreso' && (
                        <div className="text-2xl font-bold text-green-400 font-mono">
                          {formatTiempo(lucha.tiempo_transcurrido)}
                        </div>
                      )}

                      <button
                        onClick={() => setLuchaSeleccionada(lucha)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Gestionar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-900/20 rounded p-3 border border-blue-500/30">
                      <div className="text-blue-200 font-semibold mb-1">{lucha.participante1?.nombre || 'TBD'}</div>
                      <div className="text-blue-100 text-sm">{lucha.participante1?.academia || ''}</div>
                      <div className="text-blue-100 text-lg font-bold mt-1">
                        Puntos: {calcularPuntos(lucha, 1)} | Ventajas: {lucha.ventajas_p1 || 0}
                      </div>
                    </div>

                    <div className="bg-red-900/20 rounded p-3 border border-red-500/30">
                      <div className="text-red-200 font-semibold mb-1">{lucha.participante2?.nombre || 'TBD'}</div>
                      <div className="text-red-100 text-sm">{lucha.participante2?.academia || ''}</div>
                      <div className="text-red-100 text-lg font-bold mt-1">
                        Puntos: {calcularPuntos(lucha, 2)} | Ventajas: {lucha.ventajas_p2 || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Componente para crear nuevo torneo
  const NuevoTorneoView = () => {
    const [formData, setFormData] = useState({
      nombre: '',
      fecha: '',
      descripcion: '',
      categorias: []
    });
    const [categoriaActual, setCategoriaActual] = useState({
      nombre: '',
      tipo_categoria: 'blanca',
      peso_minimo: '',
      peso_maximo: ''
    });
    const [creando, setCreando] = useState(false);

    const agregarCategoria = () => {
      if (!categoriaActual.nombre.trim()) {
        mostrarNotificacion('El nombre de la categoría es requerido', 3000);
        return;
      }

      const nuevaCategoria = {
        ...categoriaActual,
        id: Date.now(), // ID temporal
        estado: 'abierta', // Estado por defecto
        peso_minimo: categoriaActual.peso_minimo ? parseFloat(categoriaActual.peso_minimo) : null,
        peso_maximo: categoriaActual.peso_maximo ? parseFloat(categoriaActual.peso_maximo) : null
      };

      setFormData({
        ...formData,
        categorias: [...formData.categorias, nuevaCategoria]
      });

      // Limpiar formulario de categoría
      setCategoriaActual({
        nombre: '',
        tipo_categoria: 'blanca',
        peso_minimo: '',
        peso_maximo: ''
      });

      mostrarNotificacion('Categoría agregada exitosamente');
    };

    const eliminarCategoria = (index) => {
      const nuevasCategorias = formData.categorias.filter((_, i) => i !== index);
      setFormData({ ...formData, categorias: nuevasCategorias });
      mostrarNotificacion('Categoría eliminada');
    };

    const crearTorneo = async () => {
      if (!formData.nombre.trim() || !formData.fecha) {
        mostrarNotificacion('Nombre y fecha son requeridos', 3000);
        return;
      }

      setCreando(true);
      try {
        // Crear torneo sin categorías primero
        const torneoData = {
          nombre: formData.nombre,
          fecha: formData.fecha,
          descripcion: formData.descripcion,
          categorias: [] // El torneo se crea sin categorías inicialmente
        };

        const response = await api.createTorneo(torneoData);
        const torneoId = response.torneo._id;

        // Agregar categorías una por una después de crear el torneo
        if (formData.categorias.length > 0) {
          for (const categoria of formData.categorias) {
            try {
              await api.createCategoriaTorneo(torneoId, {
                nombre: categoria.nombre,
                tipo_categoria: categoria.tipo_categoria,
                peso_minimo: categoria.peso_minimo,
                peso_maximo: categoria.peso_maximo
              });
            } catch (error) {
              console.error('Error creando categoría:', categoria.nombre, error);
              mostrarNotificacion(`Error creando categoría ${categoria.nombre}`, 3000);
            }
          }
        }

        mostrarNotificacion('Torneo creado exitosamente', 5000);

        // Limpiar formulario
        setFormData({
          nombre: '',
          fecha: '',
          descripcion: '',
          categorias: []
        });

        // Volver a la lista y recargar torneos
        setVista('lista');
        await cargarTorneos();

      } catch (error) {
        console.error('Error creando torneo:', error);
        mostrarNotificacion('Error creando torneo: ' + error.message, 5000);
      } finally {
        setCreando(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-cyan-200">Crear Nuevo Torneo</h2>
          <button
            onClick={() => setVista('lista')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            ← Volver
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información básica del torneo */}
          <div className="bg-black/60 rounded-xl p-6 border border-cyan-500/30">
            <h3 className="text-xl font-bold text-cyan-200 mb-4">Información del Torneo</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-cyan-100 font-semibold mb-2">Nombre del Torneo *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                  placeholder="Ej: Campeonato Primavera 2025"
                  required
                />
              </div>

              <div>
                <label className="block text-cyan-100 font-semibold mb-2">Fecha *</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-cyan-100 font-semibold mb-2">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 focus:border-cyan-400 focus:outline-none h-24 resize-none"
                  placeholder="Descripción opcional del torneo..."
                />
              </div>
            </div>
          </div>

          {/* Agregar categorías */}
          <div className="bg-black/60 rounded-xl p-6 border border-cyan-500/30">
            <h3 className="text-xl font-bold text-cyan-200 mb-4">Agregar Categorías</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-cyan-100 font-semibold mb-2">Nombre de Categoría *</label>
                <input
                  type="text"
                  value={categoriaActual.nombre}
                  onChange={(e) => setCategoriaActual({ ...categoriaActual, nombre: e.target.value })}
                  className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                  placeholder="Ej: Blanca - Hasta 70kg"
                />
              </div>

              <div>
                <label className="block text-cyan-100 font-semibold mb-2">Tipo de Categoría</label>
                <select
                  value={categoriaActual.tipo_categoria}
                  onChange={(e) => setCategoriaActual({ ...categoriaActual, tipo_categoria: e.target.value })}
                  className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="blanca">Blanca</option>
                  <option value="azul">Azul</option>
                  <option value="violeta">Violeta</option>
                  <option value="marron">Marrón</option>
                  <option value="negro">Negro</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-cyan-100 font-semibold mb-2">Peso Mínimo (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={categoriaActual.peso_minimo}
                    onChange={(e) => setCategoriaActual({ ...categoriaActual, peso_minimo: e.target.value })}
                    className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                    placeholder="60.0"
                  />
                </div>
                <div>
                  <label className="block text-cyan-100 font-semibold mb-2">Peso Máximo (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={categoriaActual.peso_maximo}
                    onChange={(e) => setCategoriaActual({ ...categoriaActual, peso_maximo: e.target.value })}
                    className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                    placeholder="70.0"
                  />
                </div>
              </div>

              <button
                onClick={agregarCategoria}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                + Agregar Categoría
              </button>
            </div>
          </div>
        </div>

        {/* Lista de categorías agregadas */}
        <div className="bg-black/60 rounded-xl p-6 border border-cyan-500/30">
          <h3 className="text-xl font-bold text-cyan-200 mb-4">
            Categorías Agregadas ({formData.categorias.length})
          </h3>

          {formData.categorias.length === 0 ? (
            <p className="text-cyan-100">No hay categorías agregadas aún.</p>
          ) : (
            <div className="grid gap-3">
              {formData.categorias.map((categoria, index) => (
                <div key={categoria.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-cyan-200 font-semibold">{categoria.nombre}</h4>
                      <p className="text-cyan-100 text-sm">
                        Tipo: {categoria.tipo_categoria} |
                        Peso: {categoria.peso_minimo || 'N/A'} - {categoria.peso_maximo || 'N/A'} kg
                      </p>
                    </div>
                    <button
                      onClick={() => eliminarCategoria(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón crear torneo */}
        <div className="flex justify-center">
          <button
            onClick={crearTorneo}
            disabled={creando}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-colors ${creando
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-cyan-600 hover:bg-cyan-700 text-white'
              }`}
          >
            {creando ? 'Creando Torneo...' : 'Crear Torneo'}
          </button>
        </div>
      </div>
    );
  };

  // Componente para agregar categorías a torneos existentes
  const AgregarCategoriaView = () => {
    const [categoriaActual, setCategoriaActual] = useState({
      nombre: '',
      tipo_categoria: 'blanca',
      peso_minimo: '',
      peso_maximo: ''
    });
    const [agregando, setAgregando] = useState(false);

    const agregarCategoria = async () => {
      if (!categoriaActual.nombre.trim()) {
        mostrarNotificacion('El nombre de la categoría es requerido', 3000);
        return;
      }

      if (!torneoSeleccionado?._id) {
        mostrarNotificacion('No hay torneo seleccionado', 3000);
        return;
      }

      setAgregando(true);
      try {
        const categoriaData = {
          nombre: categoriaActual.nombre,
          tipo_categoria: categoriaActual.tipo_categoria,
          peso_minimo: categoriaActual.peso_minimo ? parseFloat(categoriaActual.peso_minimo) : null,
          peso_maximo: categoriaActual.peso_maximo ? parseFloat(categoriaActual.peso_maximo) : null,
          estado: 'abierta'
        };

        await api.createCategoriaTorneo(torneoSeleccionado._id, categoriaData);

        mostrarNotificacion('Categoría agregada exitosamente', 3000);

        // Limpiar formulario
        setCategoriaActual({
          nombre: '',
          tipo_categoria: 'blanca',
          peso_minimo: '',
          peso_maximo: ''
        });

        // Recargar torneos para actualizar la lista
        await cargarTorneos();

      } catch (error) {
        console.error('Error agregando categoría:', error);
        mostrarNotificacion('Error al agregar categoría: ' + error.message, 5000);
      } finally {
        setAgregando(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-cyan-200">
            Agregar Categoría - {torneoSeleccionado?.nombre}
          </h2>
          <button
            onClick={() => setVista('lista')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            ← Volver
          </button>
        </div>

        {/* Información del torneo */}
        <div className="bg-black/60 rounded-xl p-6 border border-cyan-500/30">
          <h3 className="text-xl font-bold text-cyan-200 mb-4">Información del Torneo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-cyan-100 font-semibold">Nombre:</span>
              <p className="text-cyan-200">{torneoSeleccionado?.nombre}</p>
            </div>
            <div>
              <span className="text-cyan-100 font-semibold">Fecha:</span>
              <p className="text-cyan-200">{new Date(torneoSeleccionado?.fecha).toLocaleDateString('es-ES')}</p>
            </div>
            <div>
              <span className="text-cyan-100 font-semibold">Estado:</span>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${torneoSeleccionado?.estado === 'planificado' ? 'bg-blue-600 text-white' :
                torneoSeleccionado?.estado === 'en_progreso' ? 'bg-green-600 text-white' :
                  'bg-gray-600 text-white'
                }`}>
                {torneoSeleccionado?.estado.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-cyan-100 font-semibold">Categorías existentes:</span>
              <p className="text-cyan-200">{(torneoSeleccionado?.categorias || []).length}</p>
            </div>
          </div>
        </div>

        {/* Formulario para agregar categoría */}
        <div className="bg-black/60 rounded-xl p-6 border border-cyan-500/30">
          <h3 className="text-xl font-bold text-cyan-200 mb-4">Nueva Categoría</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-cyan-100 font-semibold mb-2">Nombre de Categoría *</label>
              <input
                type="text"
                value={categoriaActual.nombre}
                onChange={(e) => setCategoriaActual({ ...categoriaActual, nombre: e.target.value })}
                className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                placeholder="Ej: Blanca - Hasta 70kg"
              />
            </div>

            <div>
              <label className="block text-cyan-100 font-semibold mb-2">Tipo de Categoría</label>
              <select
                value={categoriaActual.tipo_categoria}
                onChange={(e) => setCategoriaActual({ ...categoriaActual, tipo_categoria: e.target.value })}
                className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 focus:border-cyan-400 focus:outline-none"
              >
                <option value="blanca">Blanca</option>
                <option value="azul">Azul</option>
                <option value="violeta">Violeta</option>
                <option value="marron">Marrón</option>
                <option value="negro">Negro</option>
                <option value="principiante_gi">Principiante GI</option>
                <option value="intermedio_gi">Intermedio GI</option>
                <option value="avanzado_gi">Avanzado GI</option>
                <option value="principiante_nogi">Principiante No GI</option>
                <option value="intermedio_nogi">Intermedio No GI</option>
                <option value="avanzado_nogi">Avanzado No GI</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-cyan-100 font-semibold mb-2">Peso Mínimo (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={categoriaActual.peso_minimo}
                  onChange={(e) => setCategoriaActual({ ...categoriaActual, peso_minimo: e.target.value })}
                  className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                  placeholder="50.0"
                />
              </div>
              <div>
                <label className="block text-cyan-100 font-semibold mb-2">Peso Máximo (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={categoriaActual.peso_maximo}
                  onChange={(e) => setCategoriaActual({ ...categoriaActual, peso_maximo: e.target.value })}
                  className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                  placeholder="70.0"
                />
              </div>
            </div>

            <button
              onClick={agregarCategoria}
              disabled={agregando}
              className={`w-full px-6 py-3 rounded-lg font-bold text-lg transition-colors ${agregando
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
            >
              {agregando ? 'Agregando Categoría...' : '+ Agregar Categoría'}
            </button>
          </div>
        </div>

        {/* Lista de categorías existentes */}
        <div className="bg-black/60 rounded-xl p-6 border border-cyan-500/30">
          <h3 className="text-xl font-bold text-cyan-200 mb-4">
            Categorías Existentes ({(torneoSeleccionado?.categorias || []).length})
          </h3>

          {(torneoSeleccionado?.categorias || []).length === 0 ? (
            <p className="text-cyan-100">No hay categorías agregadas aún.</p>
          ) : (
            <div className="grid gap-3">
              {torneoSeleccionado.categorias.map((categoria, index) => (
                <div key={categoria.id || categoria._id || index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-cyan-200 font-semibold">{categoria.nombre}</h4>
                      <p className="text-cyan-100 text-sm">
                        Tipo: {categoria.tipo_categoria} |
                        Peso: {categoria.peso_minimo || 'N/A'} - {categoria.peso_maximo || 'N/A'} kg
                      </p>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${categoria.estado === 'abierta' ? 'bg-green-600 text-white' :
                      categoria.estado === 'cerrada' ? 'bg-red-600 text-white' :
                        'bg-yellow-600 text-white'
                      }`}>
                      {categoria.estado?.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Renderizar según la vista actual
  const renderVista = () => {
    switch (vista) {
      case 'nuevo':
        return <NuevoTorneoView />;
      case 'bracket':
        return <BracketView />;
      case 'participantes':
        return <ParticipantesView />;
      case 'luchas':
        return <LuchasView />;
      case 'agregar-categoria':
        return <AgregarCategoriaView />;
      default:
        return <ListaTorneos />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 font-sans pt-32">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full opacity-30 blur-3xl"></div>
      </div>

      {/* Componente de notificación */}
      {notificacion.mostrar && (
        <div className="fixed top-20 right-4 z-50 max-w-sm">
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg border border-green-500/30 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <p className="text-sm font-semibold">{notificacion.mensaje}</p>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-10">
        {renderVista()}
      </div>
    </div>
  );
};

export default TorneoBJJ;
