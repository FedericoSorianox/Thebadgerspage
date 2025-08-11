import React from 'react';

// Versión de producción - conecta con Django
const API_BASE_URL = import.meta.env.PROD 
    ? 'https://thebadgerspage.onrender.com' 
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
            const storedUser = localStorage.getItem('badgers_user');
            const storedPass = localStorage.getItem('badgers_pass');
            
            if (!storedUser || !storedPass) {
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            // Verificar credenciales usando el endpoint de upload (requiere auth)
            const response = await fetch(`${API_BASE_URL}/api/galeria/upload/`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa(`${storedUser}:${storedPass}`)
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser({ username: userData.user });
                setIsAuthenticated(true);
            } else {
                // Credenciales inválidas, limpiar localStorage
                localStorage.removeItem('badgers_user');
                localStorage.removeItem('badgers_pass');
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            localStorage.removeItem('badgers_user');
            localStorage.removeItem('badgers_pass');
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (username, password) => {
        try {
            // Verificar credenciales
            const response = await fetch(`${API_BASE_URL}/api/galeria/upload/`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                }
            });

            if (response.ok) {
                const userData = await response.json();
                localStorage.setItem('badgers_user', username);
                localStorage.setItem('badgers_pass', password);
                setUser({ username: userData.user });
                setIsAuthenticated(true);
                return { success: true };
            } else {
                return { success: false, error: 'Credenciales inválidas' };
            }
        } catch (error) {
            console.error('Error during login:', error);
            return { success: false, error: 'Error de conexión' };
        }
    };

    const handleLogout = async () => {
        localStorage.removeItem('badgers_user');
        localStorage.removeItem('badgers_pass');
        setIsAuthenticated(false);
        setUser(null);
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
                <LoginForm onLogin={handleLogin} />
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

// Componente de formulario de login
const LoginForm = ({ onLogin }) => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await onLogin(username, password);
        
        if (!result.success) {
            setError(result.error);
        }
        
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 max-w-xs w-full p-6 mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-4">Iniciar Sesión</h2>
            
            <input 
                type="text" 
                placeholder="Usuario" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full mb-3 px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:border-cyan-400 focus:outline-none"
                required
                autoFocus 
            />
            
            <input 
                type="password" 
                placeholder="Contraseña" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mb-3 px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:border-cyan-400 focus:outline-none"
                required
            />
            
            {error && <div className="text-red-300 text-sm mb-3 text-center">{error}</div>}
            
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
            >
                {loading ? 'Verificando...' : 'Entrar'}
            </button>
        </form>
    );
};
