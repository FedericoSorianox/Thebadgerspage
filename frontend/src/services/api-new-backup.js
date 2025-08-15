// Servicios API para el sistema de torneo BJJ

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.PROD ? 'https://thebadgerspage.onrender.com' : 'http://127.0.0.1:8000');

const TORNEO_API_URL = `${API_BASE_URL}/api/torneo`;

// Configuración base para fetch sin autenticación
const createApiConfig = (method = 'GET', data = null) => {
    const config = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    return config;
};

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
        const response = await fetch(`${TORNEO_API_URL}/torneos/`, createApiConfig());
        return handleResponse(response);
    },

    // Obtener un torneo específico
    getById: async (id) => {
        const response = await fetch(`${TORNEO_API_URL}/torneos/${id}/`, createApiConfig());
        return handleResponse(response);
    },

    // Crear nuevo torneo
    create: async (torneoData) => {
        const response = await fetch(`${TORNEO_API_URL}/torneos/`, createApiConfig('POST', torneoData));
        return handleResponse(response);
    },

    // Actualizar torneo
    update: async (id, torneoData) => {
        const response = await fetch(`${TORNEO_API_URL}/torneos/${id}/`, createApiConfig('PUT', torneoData));
        return handleResponse(response);
    },

    // Eliminar torneo
    delete: async (id) => {
        const response = await fetch(`${TORNEO_API_URL}/torneos/${id}/`, createApiConfig('DELETE'));
        return response.ok;
    },

    // Activar torneo
    activar: async (id) => {
        const response = await fetch(`${TORNEO_API_URL}/torneos/${id}/activar/`, createApiConfig('POST'));
        return handleResponse(response);
    },

    // Finalizar torneo
    finalizar: async (id) => {
        const response = await fetch(`${TORNEO_API_URL}/torneos/${id}/finalizar/`, createApiConfig('POST'));
        return handleResponse(response);
    },
};

// =================== SERVICIOS DE CATEGORÍAS ===================

export const categoriaAPI = {
    // Obtener todas las categorías o filtradas por torneo
    getAll: async (torneoId = null) => {
        const url = torneoId 
            ? `${TORNEO_API_URL}/categorias/?torneo=${torneoId}`
            : `${TORNEO_API_URL}/categorias/`;
        const response = await fetch(url, createApiConfig());
        return handleResponse(response);
    },

    // Crear nueva categoría
    create: async (categoriaData, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass 
            ? createAuthConfig(loginUser, loginPass, 'POST', categoriaData)
            : createApiConfig('POST', categoriaData);
        const response = await fetch(`${TORNEO_API_URL}/categorias/`, config);
        return handleResponse(response);
    },

    // Actualizar categoría
    update: async (id, categoriaData, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass 
            ? createAuthConfig(loginUser, loginPass, 'PUT', categoriaData)
            : createApiConfig('PUT', categoriaData);
        const response = await fetch(`${TORNEO_API_URL}/categorias/${id}/`, config);
        return handleResponse(response);
    },

    // Eliminar categoría
    delete: async (id, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass 
            ? createAuthConfig(loginUser, loginPass, 'DELETE')
            : createApiConfig('DELETE');
        const response = await fetch(`${TORNEO_API_URL}/categorias/${id}/`, config);
        return response.ok;
    },

    // Cerrar inscripciones
    cerrarInscripciones: async (id, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass 
            ? createAuthConfig(loginUser, loginPass, 'POST')
            : createApiConfig('POST');
        const response = await fetch(`${TORNEO_API_URL}/categorias/${id}/cerrar_inscripciones/`, config);
        return handleResponse(response);
    },
};

// =================== SERVICIOS DE PARTICIPANTES ===================

export const participanteAPI = {
    // Obtener participantes de una categoría
    getAll: async (categoriaId = null) => {
        const url = categoriaId 
            ? `${TORNEO_API_URL}/participantes/?categoria=${categoriaId}`
            : `${TORNEO_API_URL}/participantes/`;
        const response = await fetch(url, createApiConfig());
        return handleResponse(response);
    },

    // Crear nuevo participante
    create: async (participanteData, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass 
            ? createAuthConfig(loginUser, loginPass, 'POST', participanteData)
            : createApiConfig('POST', participanteData);
        const response = await fetch(`${TORNEO_API_URL}/participantes/`, config);
        return handleResponse(response);
    },

    // Actualizar participante
    update: async (id, participanteData, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass 
            ? createAuthConfig(loginUser, loginPass, 'PUT', participanteData)
            : createApiConfig('PUT', participanteData);
        const response = await fetch(`${TORNEO_API_URL}/participantes/${id}/`, config);
        return handleResponse(response);
    },

    // Eliminar participante
    delete: async (id, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass 
            ? createAuthConfig(loginUser, loginPass, 'DELETE')
            : createApiConfig('DELETE');
        const response = await fetch(`${TORNEO_API_URL}/participantes/${id}/`, config);
        return response.ok;
    },

    // Desactivar participante
    desactivar: async (id, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass 
            ? createAuthConfig(loginUser, loginPass, 'POST')
            : createApiConfig('POST');
        const response = await fetch(`${TORNEO_API_URL}/participantes/${id}/desactivar/`, config);
        return handleResponse(response);
    },
};

// =================== SERVICIOS DE LLAVES ===================

export const llaveAPI = {
    // Obtener llaves de una categoría
    getAll: async (categoriaId = null) => {
        const url = categoriaId 
            ? `${TORNEO_API_URL}/llaves/?categoria=${categoriaId}`
            : `${TORNEO_API_URL}/llaves/`;
        const response = await fetch(url, createApiConfig());
        return handleResponse(response);
    },

    // Crear nueva llave
    create: async (llaveData, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass 
            ? createAuthConfig(loginUser, loginPass, 'POST', llaveData)
            : createApiConfig('POST', llaveData);
        const response = await fetch(`${TORNEO_API_URL}/llaves/`, config);
        return handleResponse(response);
    },

    // Actualizar llave
    update: async (id, llaveData, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass 
            ? createAuthConfig(loginUser, loginPass, 'PUT', llaveData)
            : createApiConfig('PUT', llaveData);
        const response = await fetch(`${TORNEO_API_URL}/llaves/${id}/`, config);
        return handleResponse(response);
    },

    // Generar llave automática
    generarAutomatica: async (id, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass 
            ? createAuthConfig(loginUser, loginPass, 'POST')
            : createApiConfig('POST');
        const response = await fetch(`${TORNEO_API_URL}/llaves/${id}/generar_automatica/`, config);
        return handleResponse(response);
    },
};

// =================== SERVICIOS DE LUCHAS ===================

export const luchaAPI = {
    // Obtener luchas de una categoría
    getAll: async (categoriaId = null) => {
        const url = categoriaId 
            ? `${TORNEO_API_URL}/luchas/?categoria=${categoriaId}`
            : `${TORNEO_API_URL}/luchas/`;
        const response = await fetch(url, createApiConfig());
        return handleResponse(response);
    },

    // Obtener luchas disponibles
    getDisponibles: async () => {
        const response = await fetch(`${TORNEO_API_URL}/luchas-disponibles/`, createApiConfig());
        return handleResponse(response);
    },

    // Crear nueva lucha
    create: async (luchaData, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass 
            ? createAuthConfig(loginUser, loginPass, 'POST', luchaData)
            : createApiConfig('POST', luchaData);
        const response = await fetch(`${TORNEO_API_URL}/luchas/`, config);
        return handleResponse(response);
    },

    // Actualizar lucha
    update: async (id, luchaData, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass 
            ? createAuthConfig(loginUser, loginPass, 'PUT', luchaData)
            : createApiConfig('PUT', luchaData);
        const response = await fetch(`${TORNEO_API_URL}/luchas/${id}/`, config);
        return handleResponse(response);
    },

    // Iniciar lucha
    iniciar: async (id, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass 
            ? createAuthConfig(loginUser, loginPass, 'POST')
            : createApiConfig('POST');
        const response = await fetch(`${TORNEO_API_URL}/luchas/${id}/iniciar/`, config);
        return handleResponse(response);
    },

    // Finalizar lucha
    finalizar: async (id, resultados, loginUser = null, loginPass = null) => {
        const config = loginUser && loginPass 
            ? createAuthConfig(loginUser, loginPass, 'POST', resultados)
            : createApiConfig('POST', resultados);
        const response = await fetch(`${TORNEO_API_URL}/luchas/${id}/finalizar/`, config);
        return handleResponse(response);
    },
};

// =================== EXPORTAR TODO COMO API ===================

const API = {
    torneoAPI,
    categoriaAPI,
    participanteAPI,
    llaveAPI,
    luchaAPI,
};

export default API;
