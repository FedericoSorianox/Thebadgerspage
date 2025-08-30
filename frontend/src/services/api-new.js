// Servicios API para el sistema de torneo BJJ (simplificado sin autenticación)

// Base API: Configuración dinámica para desarrollo y producción
const API_BASE_URL = import.meta.env.PROD ? 'https://thebadgerspage.onrender.com' : 'http://127.0.0.1:8000';

const TORNEO_API_URL = `${API_BASE_URL}/api/torneo`;

// Log de configuración para debug
console.log('[API Config]', {
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
    isProduction: import.meta.env.PROD,
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
    // Obtener todas las categorías
    getAll: async () => {
        const url = `${TORNEO_API_URL}/categorias/`;
        console.log(`[categoriaAPI.getAll] 📡 URL: ${url}`);
        const response = await fetch(url, createApiConfig());
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`HTTP ${response.status}: ${error}`);
        }
        
        const data = await response.json();
        console.log(`[categoriaAPI.getAll] 📦 Raw data:`, data);
        
        // Manejar formato {results: [...]}
        if (data && data.results && Array.isArray(data.results)) {
            console.log(`[categoriaAPI.getAll] ✅ Returning results array:`, data.results);
            return data.results;
        }
        
        // Si ya es un array, devolverlo tal como está
        if (Array.isArray(data)) {
            console.log(`[categoriaAPI.getAll] ✅ Data is already array:`, data);
            return data;
        }
        
        // Fallback: devolver array vacío
        console.log(`[categoriaAPI.getAll] ⚠️ Unexpected format, returning empty array`);
        return [];
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
    // Obtener participantes (por categoría)
    getAll: async (categoriaId = null) => {
        let url = `${TORNEO_API_URL}/participantes/`;
        if (categoriaId) {
            url = `${TORNEO_API_URL}/participantes/?categoria=${categoriaId}`;
        }
        console.log('[participanteAPI.getAll] URL construida:', url);
        console.log('[participanteAPI.getAll] Categoria ID recibido:', categoriaId);
        const response = await fetch(url, createApiConfig());
        console.log('[participanteAPI.getAll] Response status:', response.status);
        const data = await handleResponse(response);
        console.log('[participanteAPI.getAll] Data recibida:', data);
        if (data && data.results && Array.isArray(data.results)) return data.results;
        if (Array.isArray(data)) return data;
        return [];
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
        const data = await handleResponse(response);
        // Soportar tanto {results: [...]} como arrays directos
        if (data && Array.isArray(data.results)) return data.results;
        if (Array.isArray(data)) return data;
        return [];
    },

    // Obtener llave por categoría
    getByCategoria: async (categoriaId) => {
        const response = await fetch(`${TORNEO_API_URL}/llaves/?categoria=${categoriaId}`, createApiConfig());
        const data = await handleResponse(response);
        // La API puede devolver {results:[...]} o un array directo
        if (data && Array.isArray(data.results)) {
            return data.results.length > 0 ? data.results[0] : null;
        }
        if (Array.isArray(data)) {
            return data.length > 0 ? data[0] : null;
        }
        return null;
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

    // Actualizar llave (parcial)
    update: async (id, llaveData) => {
        const response = await fetch(`${TORNEO_API_URL}/llaves/${id}/`, createApiConfig('PATCH', llaveData));
        return handleResponse(response);
    },

    // Generar llave automáticamente
    generar: async (categoriaId) => {
        const response = await fetch(`${TORNEO_API_URL}/llaves/generar/${categoriaId}/`, createApiConfig('POST'));
        return handleResponse(response);
    },

    // Regenerar llave automáticamente
    regenerar: async (categoriaId) => {
        const response = await fetch(`${TORNEO_API_URL}/llaves/regenerar/${categoriaId}/`, createApiConfig('POST'));
        return handleResponse(response);
    },
    
    // Verificar promociones automáticas
    verificarPromociones: async (llaveId) => {
        const response = await fetch(`${TORNEO_API_URL}/llaves/${llaveId}/verificar_promociones/`, createApiConfig('POST'));
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

    // Obtener luchas por categoría
    getByCategoria: async (categoriaId) => {
        const response = await fetch(`${TORNEO_API_URL}/luchas/?categoria=${categoriaId}`, createApiConfig());
        const data = await handleResponse(response);
        if (data && Array.isArray(data.results)) return data.results;
        if (Array.isArray(data)) return data;
        return [];
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

    // Actualizar lucha (parcial)
    update: async (id, luchaData) => {
        const cfg = createApiConfig('PATCH', luchaData);
        const response = await fetch(`${TORNEO_API_URL}/luchas/${id}/`, cfg);
        return handleResponse(response);
    },

    // Eliminar lucha
    delete: async (id) => {
        const response = await fetch(`${TORNEO_API_URL}/luchas/${id}/`, createApiConfig('DELETE'));
        return response.ok;
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
    
    // Obtener luchas por categoría
    getByCategoria: async (categoriaId) => {
        const response = await fetch(`${TORNEO_API_URL}/luchas/?categoria=${categoriaId}`, createApiConfig());
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
