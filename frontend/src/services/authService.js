// Nuevo servicio de autenticación con tokens
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.PROD ? 'https://thebadgerspage.onrender.com' : 'http://127.0.0.1:8000');

// FORCE correct API URL in production to avoid wrong environment variable
const FORCED_API_BASE_URL = import.meta.env.PROD ? 'https://thebadgerspage.onrender.com' : API_BASE_URL;

console.log('DEBUG authService API_BASE_URL:', API_BASE_URL);
console.log('DEBUG authService FORCED_API_BASE_URL:', FORCED_API_BASE_URL);

const IS_DEVELOPMENT = !import.meta.env.PROD;

class AuthService {
    constructor() {
        this.token = localStorage.getItem('auth_token');
        this.user = JSON.parse(localStorage.getItem('user_data') || 'null');
    }

    // Configuración de headers con token
    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (this.token) {
            headers['Authorization'] = `Token ${this.token}`;
        }
        
        return headers;
    }

    // Login con credenciales
    async login(username, password) {
        try {
            const response = await fetch(`${FORCED_API_BASE_URL}/api/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error de autenticación');
            }

            const data = await response.json();
            
            // Guardar token y datos del usuario
            this.token = data.token;
            this.user = data.user;
            
            localStorage.setItem('auth_token', this.token);
            localStorage.setItem('user_data', JSON.stringify(this.user));
            
            return data;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    // Logout
    async logout() {
        try {
            if (this.token) {
                await fetch(`${FORCED_API_BASE_URL}/api/auth/logout/`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                });
            }
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            // Limpiar datos locales
            this.token = null;
            this.user = null;
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
        }
    }

    // Verificar estado de autenticación
    async checkAuthStatus() {
        try {
            const response = await fetch(`${FORCED_API_BASE_URL}/api/auth/status/`, {
                headers: this.getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.authenticated && data.user) {
                    this.user = data.user;
                    localStorage.setItem('user_data', JSON.stringify(this.user));
                    return { authenticated: true, user: data.user };
                }
            }
            
            // Si no está autenticado, limpiar datos locales
            this.logout();
            return { authenticated: false };
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            this.logout();
            return { authenticated: false };
        }
    }

    // Obtener información del usuario
    getUser() {
        return this.user;
    }

    // Verificar si está autenticado
    isAuthenticated() {
        return !!(this.token && this.user);
    }

    // Obtener token
    getToken() {
        return this.token;
    }

    // Verificar si el usuario es admin
    isAdmin() {
        return this.user && (this.user.is_staff || this.user.is_superuser);
    }
}

// Crear instancia singleton
const authService = new AuthService();

export default authService;
