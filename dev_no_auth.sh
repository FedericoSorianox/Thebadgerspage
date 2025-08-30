#!/bin/bash

# Script para desarrollo sin autenticación
echo "🚀 Iniciando desarrollo sin autenticación para The Badgers Page..."

# Función para limpiar procesos al salir
cleanup() {
    echo "🛑 Deteniendo servidores..."
    pkill -f "python manage.py runserver"
    pkill -f "npm run dev"
    exit 0
}

# Capturar Ctrl+C para limpiar procesos
trap cleanup SIGINT

# Verificar que esté en modo desarrollo
echo "🔧 Verificando configuración de desarrollo..."

# Verificar backend
if [ ! -f "backend/core/dev_views.py" ]; then
    echo "❌ Error: No se encontró el archivo de endpoints de desarrollo"
    exit 1
fi

# Verificar frontend
if [ ! -f "frontend/src/services/dev-api.js" ]; then
    echo "❌ Error: No se encontró el archivo de API de desarrollo"
    exit 1
fi

echo "✅ Configuración de desarrollo verificada"

# Iniciar backend en segundo plano
echo "📡 Iniciando servidor backend (Django) con endpoints de desarrollo..."
cd backend
source venv/bin/activate
USE_SQLITE=true python manage.py runserver 8000 &
BACKEND_PID=$!

# Esperar un momento para que el backend se inicie
sleep 3

# Verificar que el backend esté funcionando
if curl -s http://localhost:8000/api/dev/galeria/upload/ > /dev/null; then
    echo "✅ Backend iniciado correctamente"
else
    echo "❌ Error: No se pudo conectar al backend"
    exit 1
fi

# Iniciar frontend en segundo plano
echo "🎨 Iniciando servidor frontend (React) con API de desarrollo..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Esperar un momento para que el frontend se inicie
sleep 5

echo ""
echo "✅ Servidores iniciados exitosamente:"
echo "   - Backend: http://localhost:8000"
echo "   - Frontend: http://localhost:5173"
echo "   - API: http://localhost:8000/api/"
echo "   - API Dev: http://localhost:8000/api/dev/"
echo ""
echo "🔧 Endpoints de desarrollo disponibles:"
echo "   - GET  /api/dev/galeria/upload/ - Verificar estado"
echo "   - POST /api/dev/galeria/upload/ - Subir archivos (sin auth)"
echo "   - GET  /api/dev/auth/status/ - Estado de autenticación"
echo "   - POST /api/dev/auth/login/ - Login simulado"
echo ""
echo "📝 Notas:"
echo "   - No se requiere autenticación para ninguna operación"
echo "   - Los archivos se guardan localmente en backend/media/"
echo "   - Para cambiar a modo producción, edita frontend/src/services/api-config.js"
echo ""
echo "Presiona Ctrl+C para detener los servidores"

# Mantener el script ejecutándose
wait
