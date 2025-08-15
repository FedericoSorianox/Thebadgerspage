// Servicios API para el sistema de torneo BJJ (simplificado sin autenticación)

// FORCE RENDER API - HARDCODED para resolver problema de producción
const API_BASE_URL = 'https://thebadgerspage.onrender.com';

const TORNEO_API_URL = `${API_BASE_URL}/api/torneo`;

// Log de configuración para debug
console.log('[API Config - HARDCODED RENDER]', {
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
    API_BASE_URL,
    TORNEO_API_URL
});

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

// COMENTADO: Función de fallback no necesaria por ahora
/*
async function fetchWithFallback(endpoint, config) {
    // ... función comentada
}
*/

// =================== SERVICIOS DE TORNEOS ===================

export const torneoAPI = {
    // Obtener todos los torneos
    getAll: async () => {
        const url = `${API_BASE_URL}/api/torneo/torneos/`;
        console.log(`[torneoAPI.getAll] URL: ${url}`);
        console.log(`[torneoAPI.getAll] Headers:`, createApiConfig().headers);
        
        try {
            const response = await fetch(url, createApiConfig());
            console.log(`[torneoAPI.getAll] Response status: ${response.status}`);
            console.log(`[torneoAPI.getAll] Response headers:`, Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[torneoAPI.getAll] Error response:`, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log(`[torneoAPI.getAll] Success:`, data);
            
            // La API devuelve {count, results}, pero necesitamos solo los resultados
            if (data && data.results) {
                console.log(`[torneoAPI.getAll] Devolviendo results:`, data.results);
                return data.results;
            } else if (Array.isArray(data)) {
                console.log(`[torneoAPI.getAll] Data ya es array:`, data);
                return data;
            } else {
                console.log(`[torneoAPI.getAll] Formato inesperado, devolviendo array vacío`);
                return [];
            }
            
        } catch (error) {
            console.error(`[torneoAPI.getAll] Fetch error:`, error);
            throw error;
        }
    },

    // Obtener un torneo específico
    getById: async (id) => {
        const url = `${API_BASE_URL}/api/torneo/torneos/${id}/`;
        console.log(`[torneoAPI.getById] URL: ${url}`);
        const response = await fetch(url, createApiConfig());
        return handleResponse(response);
    },

    // Crear nuevo torneo
    create: async (torneoData) => {
        const url = `${API_BASE_URL}/api/torneo/torneos/`;
        console.log(`[torneoAPI.create] URL: ${url}`);
        const response = await fetch(url, createApiConfig('POST', torneoData));
        return handleResponse(response);
    },

    // Actualizar torneo
    update: async (id, torneoData) => {
        const url = `${API_BASE_URL}/api/torneo/torneos/${id}/`;
        console.log(`[torneoAPI.update] URL: ${url}`);
        const response = await fetch(url, createApiConfig('PUT', torneoData));
        return handleResponse(response);
    },

    // Eliminar torneo
    delete: async (id) => {
        const url = `${API_BASE_URL}/api/torneo/torneos/${id}/`;
        console.log(`[torneoAPI.delete] URL: ${url}`);
        const response = await fetch(url, createApiConfig('DELETE'));
        return response.ok;
    },

    // Activar torneo
    activar: async (id) => {
        const url = `${API_BASE_URL}/api/torneo/torneos/${id}/activar/`;
        console.log(`[torneoAPI.activar] URL: ${url}`);
        const response = await fetch(url, createApiConfig('POST'));
        return handleResponse(response);
    },

    // Finalizar torneo
    finalizar: async (id) => {
        const url = `${API_BASE_URL}/api/torneo/torneos/${id}/finalizar/`;
        console.log(`[torneoAPI.finalizar] URL: ${url}`);
        const response = await fetch(url, createApiConfig('POST'));
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
    create: async (categoriaData) => {
        const response = await fetch(`${TORNEO_API_URL}/categorias/`, createApiConfig('POST', categoriaData));
        return handleResponse(response);
    },

    // Actualizar categoría
    update: async (id, categoriaData) => {
        const response = await fetch(`${TORNEO_API_URL}/categorias/${id}/`, createApiConfig('PUT', categoriaData));
        return handleResponse(response);
    },

    // Eliminar categoría
    delete: async (id) => {
        const response = await fetch(`${TORNEO_API_URL}/categorias/${id}/`, createApiConfig('DELETE'));
        return response.ok;
    },

    // Cerrar inscripciones
    cerrarInscripciones: async (id) => {
        const response = await fetch(`${TORNEO_API_URL}/categorias/${id}/cerrar_inscripciones/`, createApiConfig('POST'));
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
    create: async (participanteData) => {
        const response = await fetch(`${TORNEO_API_URL}/participantes/`, createApiConfig('POST', participanteData));
        return handleResponse(response);
    },

    // Actualizar participante
    update: async (id, participanteData) => {
        const response = await fetch(`${TORNEO_API_URL}/participantes/${id}/`, createApiConfig('PUT', participanteData));
        return handleResponse(response);
    },

    // Eliminar participante
    delete: async (id) => {
        const response = await fetch(`${TORNEO_API_URL}/participantes/${id}/`, createApiConfig('DELETE'));
        return response.ok;
    },

    // Inscribir participante en categoría
    inscribir: async (participanteId, categoriaId) => {
        const response = await fetch(`${TORNEO_API_URL}/participantes/${participanteId}/inscribir/${categoriaId}/`, createApiConfig('POST'));
        return handleResponse(response);
    },
};

// =================== SERVICIOS DE LLAVES ===================

export const llaveAPI = {
    // Obtener llaves de una categoría
    getAll: async (categoriaId) => {
        const response = await fetch(`${TORNEO_API_URL}/llaves/?categoria=${categoriaId}`, createApiConfig());
        return handleResponse(response);
    },

    // Obtener una llave específica
    getById: async (id) => {
        const response = await fetch(`${TORNEO_API_URL}/llaves/${id}/`, createApiConfig());
        return handleResponse(response);
    },

    // Crear nueva llave
    create: async (llaveData) => {
        const response = await fetch(`${TORNEO_API_URL}/llaves/`, createApiConfig('POST', llaveData));
        return handleResponse(response);
    },

    // Actualizar llave
    update: async (id, llaveData) => {
        const response = await fetch(`${TORNEO_API_URL}/llaves/${id}/`, createApiConfig('PUT', llaveData));
        return handleResponse(response);
    },

    // Generar llave automáticamente
    generar: async (categoriaId) => {
        const response = await fetch(`${TORNEO_API_URL}/llaves/generar/${categoriaId}/`, createApiConfig('POST'));
        return handleResponse(response);
    },
};

// =================== SERVICIOS DE LUCHAS ===================

export const luchaAPI = {
    // Obtener luchas de una llave
    getAll: async (llaveId = null) => {
        const url = llaveId 
            ? `${TORNEO_API_URL}/luchas/?llave=${llaveId}`
            : `${TORNEO_API_URL}/luchas/`;
        const response = await fetch(url, createApiConfig());
        return handleResponse(response);
    },

    // Obtener una lucha específica
    getById: async (id) => {
        const response = await fetch(`${TORNEO_API_URL}/luchas/${id}/`, createApiConfig());
        return handleResponse(response);
    },

    // Crear nueva lucha
    create: async (luchaData) => {
        const response = await fetch(`${TORNEO_API_URL}/luchas/`, createApiConfig('POST', luchaData));
        return handleResponse(response);
    },

    // Actualizar lucha
    update: async (id, luchaData) => {
        const response = await fetch(`${TORNEO_API_URL}/luchas/${id}/`, createApiConfig('PUT', luchaData));
        return handleResponse(response);
    },

    // Iniciar lucha
    iniciar: async (id) => {
        const response = await fetch(`${TORNEO_API_URL}/luchas/${id}/iniciar/`, createApiConfig('POST'));
        return handleResponse(response);
    },

    // Finalizar lucha con resultados
    finalizar: async (id, resultados) => {
        const response = await fetch(`${TORNEO_API_URL}/luchas/${id}/finalizar/`, createApiConfig('POST', resultados));
        return handleResponse(response);
    },
};

// Exportación por defecto para compatibilidad
const API = {
    torneoAPI,
    categoriaAPI,
    participanteAPI,
    llaveAPI,
    luchaAPI,
};

export default API;
