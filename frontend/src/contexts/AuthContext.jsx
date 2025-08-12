import React, { useState, useEffect, createContext, useContext } from 'react';
import authService from '../services/authService.js';

// Contexto de autenticación
const AuthContext = createContext();

// Hook para usar el contexto de autenticación
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};

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
