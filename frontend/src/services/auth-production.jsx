import React from 'react';

// Versión de producción - conecta con Django
const API_BASE_URL = import.meta.env.PROD 
    ? 'https://tu-dominio.com' 
    : 'http://127.0.0.1:8000';

export const AuthChecker = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [user, setUser] = React.useState(null);

    // Verificar autenticación al cargar
    React.useEffect(() => {
        checkAuthStatus();
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
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = () => {
        // Redirigir al login de Django en producción
        window.location.href = `${API_BASE_URL}/admin/login/?next=/torneo`;
    };

    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE_URL}/admin/logout/`, {
                method: 'POST',
                credentials: 'include',
            });
            setIsAuthenticated(false);
            setUser(null);
        } catch (error) {
            console.error('Error logging out:', error);
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
                <h3 className="text-xl font-bold mb-4">Acceso Requerido</h3>
                <p className="mb-4">Para acceder al sistema de torneo debes estar autenticado.</p>
                <button
                    onClick={handleLogin}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                    Iniciar Sesión
                </button>
                <p className="text-sm text-cyan-200 mt-4">
                    Se abrirá el sistema de login del administrador.
                </p>
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
                        <span className="font-semibold text-cyan-300">{user?.username}</span>
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
