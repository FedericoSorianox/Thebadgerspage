// /frontend/src/services/n8n-api.js
// Este archivo contendrá la configuración para interactuar con los workflows de n8n

const N8N_BASE_URL = 'https://federicosoriano.app.n8n.cloud';

// Función helper para crear la configuración de la petición
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

// Función helper para manejar las respuestas de la API
async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
    }
    return response.json();
}

// =================== SERVICIOS DE GALERÍA (n8n) ===================

export const galeriaAPI = {
    // Obtener todos los ítems de la galería desde n8n
    getAll: async () => {
        // Reemplaza 'WORKFLOW_ID_GALERIA_GET' con el ID de tu workflow de n8n
        const response = await fetch(`${N8N_BASE_URL}/webhook/getimage`, createApiConfig());
        return handleResponse(response);
    },

    // Subir una imagen a la galería a través de n8n
    upload: async (formData) => {
        // Reemplaza 'WORKFLOW_ID_GALERIA_UPLOAD' con el ID de tu workflow de n8n
        const response = await fetch(`${N8N_BASE_URL}/webhook/uploadimage`, {
            method: 'POST',
            body: formData, // El Content-Type será establecido por el navegador para multipart/form-data
        });
        return handleResponse(response);
    },
};

// =================== SERVICIOS DE AUTENTICACIÓN (n8n) ===================

export const authAPI = {
    // Iniciar sesión a través de n8n
    login: async (credentials) => {
        // Reemplaza 'WORKFLOW_ID_LOGIN' con el ID de tu workflow de n8n
        const response = await fetch(`${N8N_BASE_URL}/webhook/TheBagersAuth`, createApiConfig('POST', credentials));
        return handleResponse(response);
    },

    // El logout podría ser manejado localmente en el frontend (borrando el token)
    logout: async () => {
        return Promise.resolve({ message: 'Logout exitoso' });
    },

    // La verificación de estado también dependerá de cómo manejes los tokens con n8n
    checkStatus: async () => {
        // Esto es un ejemplo, ajústalo a tu implementación
        const token = localStorage.getItem('authToken');
        return Promise.resolve({ isAuthenticated: !!token });
    }
};

const API = {
    galeriaAPI,
    authAPI,

};

export default API;
