import React, { useState, useEffect } from 'react';
import authService from '../services/authService.js';
import { AuthContext } from './AuthContextDefinition.js';

// Proveedor de autenticación
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Verificar autenticación al cargar
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            setIsLoading(true);

            // Primero verificar el sistema de localStorage (doble click login)
            const storedUser = localStorage.getItem('badgers_user');
            const storedPass = localStorage.getItem('badgers_pass');

            if (storedUser && storedPass) {
                // Verificar credenciales con el backend usando autenticación básica
                try {
                    const token = btoa(`${storedUser}:${storedPass}`);
                    const response = await fetch(`${import.meta.env.PROD ? 'https://thebadgerspage.onrender.com' : 'http://127.0.0.1:8000'}/api/galeria/upload/`, {
                        method: 'GET',
                        headers: { Authorization: `Basic ${token}` }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.ok) {
                            // Credenciales válidas, crear objeto user
                            setUser({
                                username: storedUser,
                                is_staff: true, // Asumimos que si llega aquí es admin
                                is_superuser: true
                            });
                            setIsAuthenticated(true);
                            setError(null);
                            setIsLoading(false);
                            return;
                        }
                    }
                } catch (error) {
                    console.warn('Error verificando credenciales localStorage:', error);
                }
            }

            // Si no hay credenciales de localStorage válidas, verificar el sistema de tokens
            const authStatus = await authService.checkAuthStatus();

            if (authStatus.authenticated) {
                setUser(authStatus.user);
                setIsAuthenticated(true);
                setError(null);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            setUser(null);
            setIsAuthenticated(false);
            setError('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            setError(null);
            const data = await authService.login(username, password);

            setUser(data.user);
            setIsAuthenticated(true);

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Error en login:', error);
            setError(error.message);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            // Limpiar también las credenciales del sistema localStorage
            localStorage.removeItem('badgers_user');
            localStorage.removeItem('badgers_pass');

            setUser(null);
            setIsAuthenticated(false);
            setError(null);
        }
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        checkAuth,
        isAdmin: () => authService.isAdmin(),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Solo exportamos el componente AuthProvider
// El hook useAuth se encuentra en /hooks/useAuth.js
