// Configuración de API para desarrollo local sin autenticación
// Este archivo usa los endpoints de desarrollo (/api/dev/...) que no requieren autenticación

const API_BASE_URL = 'http://127.0.0.1:8000';

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

// =================== SERVICIOS DE GALERÍA (DESARROLLO) ===================

export const galeriaAPI = {
    // Obtener items de galería
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/api/galeria/items/`, createApiConfig());
        return handleResponse(response);
    },

    // Subir archivo (usando endpoint de desarrollo)
    upload: async (formData) => {
        const response = await fetch(`${API_BASE_URL}/api/dev/galeria/upload/`, {
            method: 'POST',
            body: formData, // No incluir Content-Type para multipart/form-data
        });
        return handleResponse(response);
    },

    // Verificar estado del endpoint de desarrollo
    checkDevStatus: async () => {
        const response = await fetch(`${API_BASE_URL}/api/dev/galeria/upload/`, createApiConfig('GET'));
        return handleResponse(response);
    },
};

// =================== SERVICIOS DE AUTENTICACIÓN (DESARROLLO) ===================

export const authAPI = {
    // Login simulado en desarrollo
    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/api/dev/auth/login/`, createApiConfig('POST', credentials));
        return handleResponse(response);
    },

    // Verificar estado de autenticación (siempre false en desarrollo)
    checkStatus: async () => {
        const response = await fetch(`${API_BASE_URL}/api/dev/auth/status/`, createApiConfig('GET'));
        return handleResponse(response);
    },

    // Logout simulado
    logout: async () => {
        return { message: 'Logout simulado en desarrollo' };
    },
};

// =================== SERVICIOS DE TORNEOS (SIN AUTENTICACIÓN) ===================

export const torneoAPI = {
    // Obtener todos los torneos
    getAll: async () => {
        const url = `${API_BASE_URL}/api/torneo/torneos/`;
        const response = await fetch(url, createApiConfig());
        const data = await handleResponse(response);
        
        // Manejar formato {results: [...]}
        if (data && data.results && Array.isArray(data.results)) {
            return data.results;
        } else if (Array.isArray(data)) {
            return data;
        }
        return [];
    },

    // Obtener un torneo específico
    getById: async (id) => {
        const url = `${API_BASE_URL}/api/torneo/torneos/${id}/`;
        const response = await fetch(url, createApiConfig());
        return handleResponse(response);
    },

    // Crear nuevo torneo
    create: async (torneoData) => {
        const url = `${API_BASE_URL}/api/torneo/torneos/`;
        const response = await fetch(url, createApiConfig('POST', torneoData));
        return handleResponse(response);
    },

    // Actualizar torneo
    update: async (id, torneoData) => {
        const url = `${API_BASE_URL}/api/torneo/torneos/${id}/`;
        const response = await fetch(url, createApiConfig('PUT', torneoData));
        return handleResponse(response);
    },

    // Eliminar torneo
    delete: async (id) => {
        const url = `${API_BASE_URL}/api/torneo/torneos/${id}/`;
        const response = await fetch(url, createApiConfig('DELETE'));
        return response.ok;
    },
};

// =================== SERVICIOS DE CATEGORÍAS ===================

export const categoriaAPI = {
    // Obtener todas las categorías
    getAll: async (torneoId = null) => {
        const url = torneoId 
            ? `${API_BASE_URL}/api/torneo/categorias/?torneo=${torneoId}`
            : `${API_BASE_URL}/api/torneo/categorias/`;
        const response = await fetch(url, createApiConfig());
        const data = await handleResponse(response);
        
        if (data && data.results && Array.isArray(data.results)) {
            return data.results;
        } else if (Array.isArray(data)) {
            return data;
        }
        return [];
    },

    // Crear nueva categoría
    create: async (categoriaData) => {
        const response = await fetch(`${API_BASE_URL}/api/torneo/categorias/`, createApiConfig('POST', categoriaData));
        return handleResponse(response);
    },

    // Actualizar categoría
    update: async (id, categoriaData) => {
        const response = await fetch(`${API_BASE_URL}/api/torneo/categorias/${id}/`, createApiConfig('PUT', categoriaData));
        return handleResponse(response);
    },

    // Eliminar categoría
    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/api/torneo/categorias/${id}/`, createApiConfig('DELETE'));
        return response.ok;
    },
};

// =================== SERVICIOS DE PARTICIPANTES ===================

export const participanteAPI = {
    // Obtener participantes
    getAll: async (categoriaId = null, torneoId = null) => {
        let url = `${API_BASE_URL}/api/torneo/participantes/`;
        if (categoriaId) {
            url = `${API_BASE_URL}/api/torneo/participantes/?categoria=${categoriaId}`;
        } else if (torneoId) {
            url = `${API_BASE_URL}/api/torneo/participantes/?torneo=${torneoId}`;
        }
        const response = await fetch(url, createApiConfig());
        const data = await handleResponse(response);
        
        if (data && data.results && Array.isArray(data.results)) {
            return data.results;
        } else if (Array.isArray(data)) {
            return data;
        }
        return [];
    },

    // Crear nuevo participante
    create: async (participanteData) => {
        const response = await fetch(`${API_BASE_URL}/api/torneo/participantes/`, createApiConfig('POST', participanteData));
        return handleResponse(response);
    },

    // Actualizar participante
    update: async (id, participanteData) => {
        const response = await fetch(`${API_BASE_URL}/api/torneo/participantes/${id}/`, createApiConfig('PUT', participanteData));
        return handleResponse(response);
    },

    // Eliminar participante
    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/api/torneo/participantes/${id}/`, createApiConfig('DELETE'));
        return response.ok;
    },
};

// =================== SERVICIOS DE LLAVES ===================

export const llaveAPI = {
    // Obtener llaves de una categoría
    getAll: async (categoriaId) => {
        const response = await fetch(`${API_BASE_URL}/api/torneo/llaves/?categoria=${categoriaId}`, createApiConfig());
        const data = await handleResponse(response);
        
        if (data && Array.isArray(data.results)) {
            return data.results;
        } else if (Array.isArray(data)) {
            return data;
        }
        return [];
    },

    // Obtener llave por categoría
    getByCategoria: async (categoriaId) => {
        const response = await fetch(`${API_BASE_URL}/api/torneo/llaves/?categoria=${categoriaId}`, createApiConfig());
        const data = await handleResponse(response);
        
        if (data && Array.isArray(data.results)) {
            return data.results.length > 0 ? data.results[0] : null;
        } else if (Array.isArray(data)) {
            return data.length > 0 ? data[0] : null;
        }
        return null;
    },

    // Crear nueva llave
    create: async (llaveData) => {
        const response = await fetch(`${API_BASE_URL}/api/torneo/llaves/`, createApiConfig('POST', llaveData));
        return handleResponse(response);
    },

    // Generar llave automáticamente
    generar: async (categoriaId) => {
        const response = await fetch(`${API_BASE_URL}/api/torneo/llaves/generar/${categoriaId}/`, createApiConfig('POST'));
        return handleResponse(response);
    },
};

// =================== SERVICIOS DE LUCHAS ===================

export const luchaAPI = {
    // Obtener luchas de una llave
    getAll: async (llaveId = null) => {
        const url = llaveId 
            ? `${API_BASE_URL}/api/torneo/luchas/?llave=${llaveId}`
            : `${API_BASE_URL}/api/torneo/luchas/`;
        const response = await fetch(url, createApiConfig());
        return handleResponse(response);
    },

    // Obtener luchas por categoría
    getByCategoria: async (categoriaId) => {
        const response = await fetch(`${API_BASE_URL}/api/torneo/luchas/?categoria=${categoriaId}`, createApiConfig());
        const data = await handleResponse(response);
        
        if (data && Array.isArray(data.results)) {
            return data.results;
        } else if (Array.isArray(data)) {
            return data;
        }
        return [];
    },

    // Crear nueva lucha
    create: async (luchaData) => {
        const response = await fetch(`${API_BASE_URL}/api/torneo/luchas/`, createApiConfig('POST', luchaData));
        return handleResponse(response);
    },

    // Actualizar lucha
    update: async (id, luchaData) => {
        const response = await fetch(`${API_BASE_URL}/api/torneo/luchas/${id}/`, createApiConfig('PATCH', luchaData));
        return handleResponse(response);
    },

    // Finalizar lucha con resultados
    finalizar: async (id, resultados) => {
        const response = await fetch(`${API_BASE_URL}/api/torneo/luchas/${id}/finalizar/`, createApiConfig('POST', resultados));
        return handleResponse(response);
    },
};

// Exportación por defecto
const DevAPI = {
    galeriaAPI,
    authAPI,
    torneoAPI,
    categoriaAPI,
    participanteAPI,
    llaveAPI,
    luchaAPI,
};

export default DevAPI;
