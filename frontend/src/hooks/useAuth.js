import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContextDefinition';

/**
 * Hook personalizado para acceder al contexto de autenticación
 * Proporciona acceso a las funciones y estado de autenticación
 * 
 * @returns {Object} Objeto con user, isAuthenticated, isLoading, error, login, logout, checkAuth, isAdmin
 * @throws {Error} Si se usa fuera del AuthProvider
 */
const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    
    return context;
};

export default useAuth;
