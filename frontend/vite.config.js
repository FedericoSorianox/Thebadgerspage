import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirige las peticiones de /api/productos a la API externa en Render
      '/api/productos': {
        target: 'https://thebadgersadmin.onrender.com',
        changeOrigin: true,
        secure: false,
        // La ruta se mantiene como /api/productos, que es lo que espera el backend externo
      },
      // El proxy para /admin y otras rutas de /api ya no son necesarios
    }
  }
})
