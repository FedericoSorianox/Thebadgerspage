#!/bin/bash

# Script para iniciar el entorno de desarrollo
echo "🚀 Iniciando entorno de desarrollo para The Badgers Page..."

# Función para limpiar procesos al salir
cleanup() {
    echo "🛑 Deteniendo servidores..."
    pkill -f "python manage.py runserver"
    pkill -f "npm run dev"
    exit 0
}

# Capturar Ctrl+C para limpiar procesos
trap cleanup SIGINT

# Iniciar backend en segundo plano
echo "📡 Iniciando servidor backend (Django)..."
cd backend
source venv/bin/activate
USE_SQLITE=true python manage.py runserver 8000 &
BACKEND_PID=$!

# Esperar un momento para que el backend se inicie
sleep 3

# Iniciar frontend en segundo plano
echo "🎨 Iniciando servidor frontend (React)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Servidores iniciados:"
echo "   - Backend: http://localhost:8000"
echo "   - Frontend: http://localhost:5173"
echo "   - API: http://localhost:8000/api/"
echo ""
echo "Presiona Ctrl+C para detener los servidores"

# Mantener el script ejecutándose
wait
