// Servicios API para el sistema de torneo BJJ
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.PROD ? 'https://thebadgerspage.onrender.com' : 'http://127.0.0.1:8000');

const TORNEO_API_URL = `${API_BASE_URL}/api/torneo`;

// Configuración base para fetch
const apiConfig = {
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
    },
    credentials: 'include', // Para incluir cookies de sesión
};

// Función para crear configuración con autenticación básica
const createAuthConfig = (loginUser, loginPass) => {
    const config = { ...apiConfig };
    if (loginUser && loginPass) {
        config.headers = {
            ...config.headers,
            'Authorization': 'Basic ' + btoa(`${loginUser}:${loginPass}`)
        };
    }
    return config;
};

// Función para obtener cookie CSRF
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Función helper para manejo de respuestas
async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
    }
    return response.json();
}

// =================== SERVICIOS DE TORNEOS ===================

export const torneoAPI = {
    // Obtener todos los torneos
    getAll: async () => {
        const response = await fetch(`${TORNEO_API_URL}/torneos/`, {
            method: 'GET',
            ...apiConfig,
        });
        return handleResponse(response);
    },

    // Obtener un torneo específico
    getById: async (id) => {
        const response = await fetch(`${TORNEO_API_URL}/torneos/${id}/`, {
            method: 'GET',
            ...apiConfig,
        });
        return handleResponse(response);
    },

    // Crear nuevo torneo
    create: async (torneoData, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass ? createAuthConfig(loginUser, loginPass) : apiConfig;
        const response = await fetch(`${TORNEO_API_URL}/torneos/`, {
            method: 'POST',
            ...config,
            body: JSON.stringify(torneoData),
        });
        return handleResponse(response);
    },

    // Actualizar torneo
    update: async (id, torneoData, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass ? createAuthConfig(loginUser, loginPass) : apiConfig;
        const response = await fetch(`${TORNEO_API_URL}/torneos/${id}/`, {
            method: 'PUT',
            ...config,
            body: JSON.stringify(torneoData),
        });
        return handleResponse(response);
    },

    // Eliminar torneo
    delete: async (id, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass ? createAuthConfig(loginUser, loginPass) : apiConfig;
        const response = await fetch(`${TORNEO_API_URL}/torneos/${id}/`, {
            method: 'DELETE',
            ...config,
        });
        return response.ok;
    },

    // Activar torneo
    activar: async (id, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass ? createAuthConfig(loginUser, loginPass) : apiConfig;
        const response = await fetch(`${TORNEO_API_URL}/torneos/${id}/activar/`, {
            method: 'POST',
            ...config,
        });
        return handleResponse(response);
    },

    // Finalizar torneo
    finalizar: async (id, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass ? createAuthConfig(loginUser, loginPass) : apiConfig;
        const response = await fetch(`${TORNEO_API_URL}/torneos/${id}/finalizar/`, {
            method: 'POST',
            ...config,
        });
        return handleResponse(response);
    },
};

// =================== SERVICIOS DE CATEGORÍAS ===================

export const categoriaAPI = {
    // Obtener todas las categorías (opcionalmente filtradas por torneo)
    getAll: async (torneoId = null) => {
        const url = torneoId
            ? `${TORNEO_API_URL}/categorias/?torneo=${torneoId}`
            : `${TORNEO_API_URL}/categorias/`;
        const response = await fetch(url, {
            method: 'GET',
            ...apiConfig,
        });
        return handleResponse(response);
    },

    // Crear nueva categoría
    create: async (categoriaData, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass ? createAuthConfig(loginUser, loginPass) : apiConfig;
        const response = await fetch(`${TORNEO_API_URL}/categorias/`, {
            method: 'POST',
            ...config,
            body: JSON.stringify(categoriaData),
        });
        return handleResponse(response);
    },

    // Actualizar categoría
    update: async (id, categoriaData, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass ? createAuthConfig(loginUser, loginPass) : apiConfig;
        const response = await fetch(`${TORNEO_API_URL}/categorias/${id}/`, {
            method: 'PUT',
            ...config,
            body: JSON.stringify(categoriaData),
        });
        return handleResponse(response);
    },

    // Eliminar categoría
    delete: async (id, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass ? createAuthConfig(loginUser, loginPass) : apiConfig;
        const response = await fetch(`${TORNEO_API_URL}/categorias/${id}/`, {
            method: 'DELETE',
            ...config,
        });
        return response.ok;
    },

    // Cerrar inscripciones
    cerrarInscripciones: async (id, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass ? createAuthConfig(loginUser, loginPass) : apiConfig;
        const response = await fetch(`${TORNEO_API_URL}/categorias/${id}/cerrar_inscripciones/`, {
            method: 'POST',
            ...config,
        });
        return handleResponse(response);
    },
};

// =================== SERVICIOS DE PARTICIPANTES ===================

export const participanteAPI = {
    // Obtener todos los participantes (opcionalmente filtrados por categoría)
    getAll: async (categoriaId = null) => {
        const url = categoriaId
            ? `${TORNEO_API_URL}/participantes/?categoria=${categoriaId}`
            : `${TORNEO_API_URL}/participantes/`;
        const response = await fetch(url, {
            method: 'GET',
            ...apiConfig,
        });
        return handleResponse(response);
    },

    // Crear nuevo participante
    create: async (participanteData, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass ? createAuthConfig(loginUser, loginPass) : apiConfig;
        const response = await fetch(`${TORNEO_API_URL}/participantes/`, {
            method: 'POST',
            ...config,
            body: JSON.stringify(participanteData),
        });
        return handleResponse(response);
    },

    // Actualizar participante
    update: async (id, participanteData, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass ? createAuthConfig(loginUser, loginPass) : apiConfig;
        const response = await fetch(`${TORNEO_API_URL}/participantes/${id}/`, {
            method: 'PUT',
            ...config,
            body: JSON.stringify(participanteData),
        });
        return handleResponse(response);
    },

    // Eliminar participante
    delete: async (id, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass ? createAuthConfig(loginUser, loginPass) : apiConfig;
        const response = await fetch(`${TORNEO_API_URL}/participantes/${id}/`, {
            method: 'DELETE',
            ...config,
        });
        return response.ok;
    },

    // Desactivar participante
    desactivar: async (id) => {
        const response = await fetch(`${API_BASE_URL}/participantes/${id}/desactivar/`, {
            method: 'POST',
            ...apiConfig,
        });
        return handleResponse(response);
    },
};

// =================== SERVICIOS DE LLAVES ===================

export const llaveAPI = {
    // Obtener todas las llaves (opcionalmente filtradas por categoría)
    getAll: async (categoriaId = null) => {
        const url = categoriaId
            ? `${API_BASE_URL}/llaves/?categoria=${categoriaId}`
            : `${API_BASE_URL}/llaves/`;
        const response = await fetch(url, {
            method: 'GET',
            ...apiConfig,
        });
        return handleResponse(response);
    },

    // Obtener llave específica
    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/llaves/${id}/`, {
            method: 'GET',
            ...apiConfig,
        });
        return handleResponse(response);
    },

    // Crear nueva llave
    create: async (llaveData) => {
        const response = await fetch(`${API_BASE_URL}/llaves/`, {
            method: 'POST',
            ...apiConfig,
            body: JSON.stringify(llaveData),
        });
        return handleResponse(response);
    },

    // Actualizar llave
    update: async (id, llaveData) => {
        const response = await fetch(`${API_BASE_URL}/llaves/${id}/`, {
            method: 'PUT',
            ...apiConfig,
            body: JSON.stringify(llaveData),
        });
        return handleResponse(response);
    },

    // Generar llave automática
    generarAutomatica: async (id) => {
        const response = await fetch(`${API_BASE_URL}/llaves/${id}/generar_automatica/`, {
            method: 'POST',
            ...apiConfig,
        });
        return handleResponse(response);
    },

    // Bloquear llave
    bloquear: async (id) => {
        const response = await fetch(`${API_BASE_URL}/llaves/${id}/bloquear/`, {
            method: 'POST',
            ...apiConfig,
        });
        return handleResponse(response);
    },

    // Desbloquear llave
    desbloquear: async (id) => {
        const response = await fetch(`${API_BASE_URL}/llaves/${id}/desbloquear/`, {
            method: 'POST',
            ...apiConfig,
        });
        return handleResponse(response);
    },
};

// =================== SERVICIOS DE LUCHAS ===================

export const luchaAPI = {
    // Obtener todas las luchas (opcionalmente filtradas por categoría)
    getAll: async (categoriaId = null) => {
        const url = categoriaId
            ? `${API_BASE_URL}/luchas/?categoria=${categoriaId}`
            : `${API_BASE_URL}/luchas/`;
        const response = await fetch(url, {
            method: 'GET',
            ...apiConfig,
        });
        return handleResponse(response);
    },

    // Obtener luchas disponibles para judging
    getDisponibles: async (categoriaId = null) => {
        const url = categoriaId
            ? `${API_BASE_URL}/luchas-disponibles/?categoria=${categoriaId}`
            : `${API_BASE_URL}/luchas-disponibles/`;
        const response = await fetch(url, {
            method: 'GET',
            ...apiConfig,
        });
        return handleResponse(response);
    },

    // Crear nueva lucha
    create: async (luchaData) => {
        const response = await fetch(`${API_BASE_URL}/luchas/`, {
            method: 'POST',
            ...apiConfig,
            body: JSON.stringify(luchaData),
        });
        return handleResponse(response);
    },

    // Actualizar lucha
    update: async (id, luchaData) => {
        const response = await fetch(`${API_BASE_URL}/luchas/${id}/`, {
            method: 'PUT',
            ...apiConfig,
            body: JSON.stringify(luchaData),
        });
        return handleResponse(response);
    },

    // Iniciar lucha
    iniciar: async (id) => {
        const response = await fetch(`${API_BASE_URL}/luchas/${id}/iniciar/`, {
            method: 'POST',
            ...apiConfig,
        });
        return handleResponse(response);
    },

    // Pausar lucha
    pausar: async (id) => {
        const response = await fetch(`${API_BASE_URL}/luchas/${id}/pausar/`, {
            method: 'POST',
            ...apiConfig,
        });
        return handleResponse(response);
    },

    // Finalizar lucha
    finalizar: async (id, resultadoData) => {
        const response = await fetch(`${API_BASE_URL}/luchas/${id}/finalizar/`, {
            method: 'POST',
            ...apiConfig,
            body: JSON.stringify(resultadoData),
        });
        return handleResponse(response);
    },

    // Actualizar puntuación en tiempo real
    actualizarPuntuacion: async (id, puntuacionData) => {
        const response = await fetch(`${API_BASE_URL}/luchas/${id}/actualizar_puntuacion/`, {
            method: 'POST',
            ...apiConfig,
            body: JSON.stringify(puntuacionData),
        });
        return handleResponse(response);
    },
};

// =================== SERVICIOS AUXILIARES ===================

export const apiUtils = {
    // Verificar conectividad con la API
    checkConnection: async () => {
        try {
            const response = await fetch('http://localhost:8000/api/', {
                method: 'GET',
                ...apiConfig,
            });
            return response.ok;
        } catch (error) {
            console.error('Error connecting to API:', error);
            return false;
        }
    },

    // Manejar errores de API de forma centralizada
    handleError: (error) => {
        console.error('API Error:', error);
        // Aquí puedes agregar lógica para mostrar notificaciones al usuario
        return {
            success: false,
            message: error.message || 'Error de conexión con el servidor',
        };
    },
};
