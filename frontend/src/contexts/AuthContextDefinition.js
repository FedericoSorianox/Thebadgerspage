import { createContext } from 'react';

/**
 * Contexto de autenticación
 * Proporciona el contexto base para el sistema de autenticación
 * Se exporta por separado para cumplir con las reglas de Fast Refresh
 */
export const AuthContext = createContext();
