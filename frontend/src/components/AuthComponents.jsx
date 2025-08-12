import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

// Componente de login
export const LoginComponent = () => {
    const { login, error } = useAuth();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        const result = await login(credentials.username, credentials.password);
        
        if (result.success) {
            // El contexto ya actualizará el estado
            setCredentials({ username: '', password: '' });
        }
        
        setIsLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="max-w-md mx-auto bg-black/20 backdrop-blur-sm border border-cyan-400/30 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
                Iniciar Sesión
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-cyan-300 mb-2">
                        Usuario
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 bg-black/50 border border-cyan-400/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        placeholder="Ingresa tu usuario"
                    />
                </div>
                
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-cyan-300 mb-2">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 bg-black/50 border border-cyan-400/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        placeholder="Ingresa tu contraseña"
                    />
                </div>
                
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                        <p className="text-red-200 text-sm">{error}</p>
                    </div>
                )}
                
                <button
                    type="submit"
                    disabled={isLoading || !credentials.username || !credentials.password}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
            </form>
        </div>
    );
};

// Componente protegido que requiere autenticación
export const ProtectedComponent = ({ children, fallback = null }) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <div className="text-center text-white p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                <p>Verificando autenticación...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return fallback || <LoginComponent />;
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
                        {user?.is_staff && (
                            <span className="ml-2 bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                ADMIN
                            </span>
                        )}
                    </div>
                    <UserMenu />
                </div>
            </div>
            {children}
        </div>
    );
};

// Menú de usuario
const UserMenu = () => {
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
                ⚙️
            </button>
            
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-cyan-400/50 rounded-lg shadow-lg z-10">
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-white hover:bg-cyan-500/20 transition-colors rounded-lg"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            )}
        </div>
    );
};
