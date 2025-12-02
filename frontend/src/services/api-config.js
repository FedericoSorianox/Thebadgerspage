// Configuración para cambiar entre API de desarrollo y producción
// Para usar la API de desarrollo (sin autenticación), cambia USE_DEV_API a true

export const USE_DEV_API = true; // Cambiar a false para usar la API de n8n

// Importar las APIs correspondientes
let API;

if (USE_DEV_API) {
    console.log('🔧 Usando API de desarrollo (sin autenticación)');
    API = await import('./dev-api.js');
} else {
    console.log('🚀 Usando API de n8n');
    API = await import('./n8n-api.js');
}

export default API.default;
export const {
    galeriaAPI,
    authAPI,
    torneoAPI,
    categoriaAPI,
    participanteAPI,
    llaveAPI,
    luchaAPI,
} = API.default;
