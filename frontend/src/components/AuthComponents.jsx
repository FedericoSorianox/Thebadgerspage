import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth.js';

// Componente de login modal elegante
export const LoginModal = ({ isOpen, onClose, title = "Iniciar Sesión" }) => {
    const { login, error } = useAuth();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await login(credentials.username, credentials.password);

        if (result.success) {
            setCredentials({ username: '', password: '' });
            onClose();
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

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setCredentials({ username: '', password: '' });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border border-cyan-400/30 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 relative animate-fade-in">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-cyan-400 hover:text-white transition-colors"
                    aria-label="Cerrar"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
                    <p className="text-cyan-300 text-sm">Ingresa tus credenciales para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-cyan-300 mb-3">
                            Usuario
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={credentials.username}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-black/50 border border-cyan-400/50 rounded-lg text-white placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                                placeholder="Ingresa tu usuario"
                            />
                            <svg className="absolute right-3 top-3.5 h-5 w-5 text-cyan-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-cyan-300 mb-3">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-black/50 border border-cyan-400/50 rounded-lg text-white placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                                placeholder="Ingresa tu contraseña"
                            />
                            <svg className="absolute right-3 top-3.5 h-5 w-5 text-cyan-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-200 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !credentials.username || !credentials.password}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Iniciando sesión...
                            </div>
                        ) : (
                            'Iniciar Sesión'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-cyan-400/70 text-xs">
                        Acceso restringido a administradores
                    </p>
                </div>
            </div>
        </div>
    );
};

// Componente de login simple (versión inline)
export const LoginComponent = () => {
    const { login, error } = useAuth();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await login(credentials.username, credentials.password);

        if (result.success) {
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
        <div className="max-w-md mx-auto bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border border-cyan-400/30 p-8 rounded-2xl shadow-xl">
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
                        className="w-full px-3 py-2 bg-black/50 border border-cyan-400/50 rounded-lg text-white placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
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
                        className="w-full px-3 py-2 bg-black/50 border border-cyan-400/50 rounded-lg text-white placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
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
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all"
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
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Abrir modal automáticamente cuando no está autenticado y terminó de cargar
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            setShowLoginModal(true);
        }
    }, [isLoading, isAuthenticated]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-400 mx-auto mb-6"></div>
                    <p className="text-white text-xl font-semibold">Verificando autenticación...</p>
                    <p className="text-cyan-300 text-sm mt-2">Por favor espera un momento</p>
                </div>
            </div>
        );
    }

    // Verificar permisos de admin incluso si está autenticado
    const hasAdminPermissions = user && (user.is_staff || user.is_superuser);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="bg-black/20 backdrop-blur-sm border border-cyan-400/30 rounded-2xl p-8 shadow-2xl">
                        <div className="mb-6">
                            <svg className="w-16 h-16 text-cyan-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <h2 className="text-2xl font-bold text-white mb-2">Acceso Restringido</h2>
                            <p className="text-cyan-300 text-sm">
                                Esta sección requiere permisos de administrador.
                            </p>
                        </div>

                        <button
                            onClick={() => setShowLoginModal(true)}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            Iniciar Sesión
                        </button>

                        <p className="text-cyan-400/70 text-xs mt-4">
                            Solo personal autorizado puede acceder a esta sección.
                        </p>
                    </div>
                </div>

                <LoginModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    title="Acceso Administrativo Requerido"
                />
            </div>
        );
    }

    // Si está autenticado pero no tiene permisos de admin
    if (!hasAdminPermissions) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="bg-black/20 backdrop-blur-sm border border-red-400/30 rounded-2xl p-8 shadow-2xl">
                        <div className="mb-6">
                            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <h2 className="text-2xl font-bold text-white mb-2">Permisos Insuficientes</h2>
                            <p className="text-red-300 text-sm">
                                No tienes permisos de administrador para acceder a esta sección.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <p className="text-cyan-300 text-sm">
                                Usuario: <span className="font-semibold">{user?.username}</span>
                            </p>
                            <p className="text-cyan-400/70 text-xs">
                                Contacta al administrador del sistema para obtener permisos.
                            </p>
                        </div>

                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full mt-6 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                        >
                            Volver al Inicio
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header con info del usuario autenticado */}
            <div className="bg-gradient-to-r from-slate-900/90 via-blue-900/90 to-indigo-900/90 backdrop-blur-sm border-b border-cyan-400/30 p-4 mb-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center">
                    <div className="text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-sm text-cyan-300">Conectado como:</span>
                                <div className="font-semibold text-white">
                                    {user?.first_name || user?.username || 'Usuario'}
                                    {user?.is_staff && (
                                        <span className="ml-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded text-xs font-medium">
                                            ADMIN
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
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
