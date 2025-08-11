import React from 'react';

// Sistema de autenticación completo - Desarrollo y Producción
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.PROD ? 'https://thebadgerspage.onrender.com' : 'http://127.0.0.1:8000');

const IS_DEVELOPMENT = !import.meta.env.PROD;

export const AuthChecker = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [user, setUser] = React.useState(null);
    const [error, setError] = React.useState(null);

    // Verificar autenticación al cargar
    React.useEffect(() => {
        if (IS_DEVELOPMENT) {
            // En desarrollo, usar localStorage
            const authStatus = localStorage.getItem('bjj-auth') === 'true';
            const userData = localStorage.getItem('bjj-user');
            
            setIsAuthenticated(authStatus);
            if (userData) {
                setUser(JSON.parse(userData));
            }
            setIsLoading(false);
        } else {
            // En producción, verificar con el backend
            checkAuthStatus();
        }
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                setIsAuthenticated(true);
                setError(null);
            } else {
                setIsAuthenticated(false);
                setError('No autenticado');
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            setIsAuthenticated(false);
            setError('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = () => {
        if (IS_DEVELOPMENT) {
            // Simulación para desarrollo
            const mockUser = {
                username: 'admin_dev',
                email: 'admin@thebadgers.uy',
                first_name: 'Administrador',
                last_name: 'BJJ'
            };
            
            setIsAuthenticated(true);
            setUser(mockUser);
            localStorage.setItem('bjj-auth', 'true');
            localStorage.setItem('bjj-user', JSON.stringify(mockUser));
        } else {
            // Redirigir al login de Django en producción
            window.location.href = `${API_BASE_URL}/admin/login/?next=${window.location.pathname}`;
        }
    };

    const handleLogout = async () => {
        if (IS_DEVELOPMENT) {
            // Logout para desarrollo
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('bjj-auth');
            localStorage.removeItem('bjj-user');
        } else {
            // Logout para producción
            try {
                await fetch(`${API_BASE_URL}/admin/logout/`, {
                    method: 'POST',
                    credentials: 'include',
                });
                setIsAuthenticated(false);
                setUser(null);
                window.location.reload();
            } catch (error) {
                console.error('Error logging out:', error);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="text-center text-white p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                <p>Verificando autenticación...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="text-center text-white p-8">
                <h3 className="text-xl font-bold mb-4">
                    {IS_DEVELOPMENT ? 'Acceso al Sistema de Torneo' : 'Autenticación Requerida'}
                </h3>
                <p className="mb-4">
                    {IS_DEVELOPMENT 
                        ? 'Haz clic en el botón para acceder al sistema de torneo BJJ.'
                        : 'Para acceder al sistema de torneo debes estar autenticado.'
                    }
                </p>
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                        <p className="text-red-200 text-sm">{error}</p>
                    </div>
                )}
                <button
                    onClick={handleLogin}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                    {IS_DEVELOPMENT ? 'Acceder al Sistema' : 'Iniciar Sesión'}
                </button>
                {!IS_DEVELOPMENT && (
                    <p className="text-sm text-cyan-200 mt-4">
                        Se abrirá el sistema de login del administrador.
                    </p>
                )}
            </div>
        );
    }

    return (
        <div>
            {/* Header con info del usuario autenticado */}
            <div className="bg-black/20 backdrop-blur-sm border-b border-cyan-400/30 p-4 mb-4 rounded-lg">
                <div className="flex justify-between items-center">
                    <div className="text-white">
                        <span className="text-sm">Conectado como: </span>
                        <span className="font-semibold text-cyan-300">
                            {user?.first_name || user?.username || 'Usuario'}
                        </span>
                        {IS_DEVELOPMENT && (
                            <span className="ml-2 bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs">
                                DEV
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
            {children}
        </div>
    );
};