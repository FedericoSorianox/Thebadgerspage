// Servicios API para la aplicación

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD ? 'https://thebadgerspage.onrender.com' : 'http://127.0.0.1:8000');

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

// Exportar las funciones para uso en otros módulos
export { createApiConfig, handleResponse, API_BASE_URL };
