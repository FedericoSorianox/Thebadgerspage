#!/bin/bash

# Script para iniciar el entorno de desarrollo
echo "🚀 Iniciando entorno de DESARROLLO..."

# Verificar que esté configurado para desarrollo
if [ ! -f "backend/db.sqlite3" ]; then
    echo "⚠️  No se encontró la base de datos SQLite"
    echo "Ejecuta primero: ./setup_dev.sh dev"
    exit 1
fi

# Iniciar backend en desarrollo
echo "📡 Iniciando backend (puerto 8000)..."
cd backend
export USE_SQLITE=true
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!
cd ..

# Esperar un momento para que el backend inicie
sleep 3

# Iniciar frontend en desarrollo
echo "🎨 Iniciando frontend (puerto 5173)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Entorno de desarrollo iniciado!"
echo ""
echo "🌐 URLs:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  Galería:  http://localhost:5173/galeria"
echo ""
echo "Para detener: Ctrl+C"
echo "Para volver a producción: ./setup_dev.sh prod"

# Esperar a que se presione Ctrl+C
trap "echo ''; echo '🛑 Deteniendo servidores...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

wait 