import React, { useState } from 'react';
import FightScorer from './FightScorer.jsx';
import ParticipantSelector from './ParticipantSelector.jsx';

/**
 * Componente para usar el FightScorer de forma independiente
 * Permite ingresar nombres manualmente o seleccionar desde la API de socios
 * sin estar vinculado a ningún torneo específico
 */
export default function IndependentFightScorer({ onClose }) {
  // Estados para el formulario de configuración
  const [selectedSocios, setSelectedSocios] = useState([]);
  const [fighter1Name, setFighter1Name] = useState('');
  const [fighter2Name, setFighter2Name] = useState('');
  const [fightDuration, setFightDuration] = useState(300); // 5 minutos por defecto
  const [showScorer, setShowScorer] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [error, setError] = useState('');
  const [inputMode, setInputMode] = useState('manual'); // 'manual' o 'socios'

  // Categoría ficticia para el FightScorer
  const mockCategoria = {
    id: 'independent',
    nombre: 'Lucha Independiente',
    duracion_segundos: fightDuration
  };

  // Validar que los participantes estén configurados
  const handleStartFight = () => {
    if (inputMode === 'manual') {
      if (!fighter1Name.trim()) {
        setError('Debes ingresar el nombre del primer luchador');
        return;
      }
      if (!fighter2Name.trim()) {
        setError('Debes ingresar el nombre del segundo luchador');
        return;
      }
      if (fighter1Name.trim() === fighter2Name.trim()) {
        setError('Los luchadores no pueden tener el mismo nombre');
        return;
      }
    } else {
      if (selectedSocios.length < 2) {
        setError('Debes seleccionar dos participantes');
        return;
      }
    }
    
    setError('');
    setShowScorer(true);
  };

  // Manejar selección de participantes desde socios
  const handleSelectParticipants = (socios) => {
    setSelectedSocios(socios);
    setShowSelector(false);
    setError('');
  };

  // Cambiar modo de entrada
  const handleModeChange = (mode) => {
    setInputMode(mode);
    setError('');
    // Limpiar datos del modo anterior
    if (mode === 'manual') {
      setSelectedSocios([]);
    } else {
      setFighter1Name('');
      setFighter2Name('');
    }
  };

  // Cerrar el marcador y volver al formulario
  const handleCloseScorer = () => {
    setShowScorer(false);
  };

  // Cerrar completamente el componente
  const handleClose = () => {
    if (onClose) onClose();
  };

  // Si el marcador está activo, mostrar el FightScorer
  if (showScorer) {
    let participante1Nombre, participante2Nombre;
    
    if (inputMode === 'manual') {
      participante1Nombre = fighter1Name.trim();
      participante2Nombre = fighter2Name.trim();
    } else {
      participante1Nombre = selectedSocios[0]?.nombre || selectedSocios[0]?.nombre_completo || 'Participante 1';
      participante2Nombre = selectedSocios[1]?.nombre || selectedSocios[1]?.nombre_completo || 'Participante 2';
    }

    return (
      <FightScorer 
        categoria={mockCategoria}
        onClose={handleCloseScorer}
        // Pasar los nombres personalizados al FightScorer
        customFighters={{
          participante1_nombre: participante1Nombre,
          participante2_nombre: participante2Nombre
        }}
      />
    );
  }

  // Si el selector está activo, mostrar el selector de participantes
  if (showSelector) {
    return (
      <ParticipantSelector
        onSelect={handleSelectParticipants}
        onClose={() => setShowSelector(false)}
        title="Seleccionar Participantes"
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">🥊 Lucha Independiente</h3>
          <button 
            className="text-2xl text-gray-500 hover:text-gray-700 transition-colors" 
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Información */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>💡 Información:</strong> Esta herramienta te permite usar el marcador 
              de forma independiente. Puedes ingresar nombres manualmente o seleccionar desde la base de datos de socios. 
              Los resultados no se guardarán en la base de datos.
            </p>
          </div>

          {/* Selector de modo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Modo de entrada de participantes
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleModeChange('manual')}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  inputMode === 'manual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ✏️ Manual
              </button>
              <button
                onClick={() => handleModeChange('socios')}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  inputMode === 'socios'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                👥 Desde Socios
              </button>
            </div>
          </div>

          {/* Formulario de configuración */}
          <div className="space-y-4">
            {inputMode === 'manual' ? (
              // Modo manual - inputs de texto
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Luchador 1 (Azul) *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre del primer luchador"
                    value={fighter1Name}
                    onChange={(e) => setFighter1Name(e.target.value)}
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Luchador 2 (Rojo) *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Nombre del segundo luchador"
                    value={fighter2Name}
                    onChange={(e) => setFighter2Name(e.target.value)}
                    maxLength={50}
                  />
                </div>
              </>
            ) : (
              // Modo socios - selector de participantes
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participantes *
                </label>
                {selectedSocios.length === 0 ? (
                  <button
                    onClick={() => setShowSelector(true)}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                  >
                    👥 Seleccionar participantes desde socios
                  </button>
                ) : (
                  <div className="space-y-2">
                    {selectedSocios.map((socio, index) => (
                      <div key={socio.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-800">
                            {socio.nombre || socio.nombre_completo}
                          </span>
                          {socio.cinturon && (
                            <span className="text-sm text-gray-600 ml-2">({socio.cinturon})</span>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedSocios(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowSelector(true)}
                      className="w-full px-3 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      ✏️ Cambiar participantes
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Duración de la lucha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración de la lucha
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={fightDuration}
                onChange={(e) => setFightDuration(Number(e.target.value))}
              >
                <option value={180}>3 minutos</option>
                <option value={300}>5 minutos</option>
                <option value={420}>7 minutos</option>
                <option value={600}>10 minutos</option>
                <option value={900}>15 minutos</option>
              </select>
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <button
              className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleStartFight}
              disabled={
                inputMode === 'manual' 
                  ? (!fighter1Name.trim() || !fighter2Name.trim())
                  : selectedSocios.length < 2
              }
            >
              🥊 Iniciar Lucha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
