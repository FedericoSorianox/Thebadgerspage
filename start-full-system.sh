#!/bin/bash

# 🥋 Script de Inicio Completo - The Badgers Sistema de Torneos BJJ
# Inicia MongoDB, Backend Django y Frontend React automáticamente

echo "🥋 Iniciando Sistema Completo de Torneos BJJ - The Badgers"
echo "======================================================="

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo todos los servicios..."
    pkill -f "python manage.py runserver" 2>/dev/null
    pkill -f "npm run dev" 2>/dev/null
    docker-compose down 2>/dev/null
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Instálalo desde https://www.docker.com/"
    exit 1
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado."
    exit 1
fi

echo "🐳 Iniciando MongoDB con Docker Compose..."
docker-compose up -d mongodb

# Esperar a que MongoDB esté listo
echo "⏳ Esperando que MongoDB esté listo..."
sleep 10

# Verificar que MongoDB esté funcionando
if ! docker ps | grep -q thebadgers_mongodb; then
    echo "❌ Error: MongoDB no se inició correctamente"
    exit 1
fi

echo "✅ MongoDB iniciado correctamente"

# Configurar backend
echo "🔧 Configurando backend Django..."
cd backend

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    cat > .env << EOF
# Configuración de MongoDB
MONGODB_URI=mongodb://thebadgers_user:badgers_password_2025@localhost:27017/thebadgers_torneos
MONGODB_DB_NAME=thebadgers_torneos

# Configuración de Django
DEBUG=True
SECRET_KEY=django-insecure-dev-secret-key-123456789
USE_SQLITE=True

# Configuración de API
VITE_API_BASE_URL=http://localhost:8000
EOF
    echo "✅ Archivo .env creado"
fi

# Verificar dependencias de Python
echo "🐍 Verificando dependencias de Python..."
python3 -c "import pymongo" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "📦 Instalando dependencias de Python..."
    pip3 install --break-system-packages pymongo motor
fi

echo "🚀 Iniciando servidor backend Django..."
python3 manage.py runserver 8000 &
BACKEND_PID=$!

# Esperar un poco para que el backend inicie
sleep 5

# Verificar que el backend esté funcionando
if curl -s http://localhost:8000/api/ > /dev/null; then
    echo "✅ Backend funcionando en http://localhost:8000"
else
    echo "❌ Error: Backend no responde"
    exit 1
fi

# Configurar frontend
echo "⚛️ Configurando frontend React..."
cd ../frontend

# Verificar que las dependencias estén instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias de Node.js..."
    npm install
fi

echo "🎨 Iniciando servidor frontend React..."
npm run dev &
FRONTEND_PID=$!

# Esperar un poco para que el frontend inicie
sleep 8

echo ""
echo "🎉 ¡Sistema iniciado exitosamente!"
echo "==================================="
echo ""
echo "📍 URLs del sistema:"
echo "   🌐 Aplicación:    http://localhost:5173"
echo "   🥋 Torneos BJJ:   http://localhost:5173/torneo"
echo "   🔧 Backend API:   http://localhost:8000"
echo "   📊 MongoDB Admin: http://localhost:8081"
echo ""
echo "👤 Credenciales MongoDB Admin:"
echo "   Usuario: admin"
echo "   Contraseña: express123"
echo ""
echo "📝 Para acceder como administrador:"
echo "   1. Ir a http://localhost:5173"
echo "   2. Hacer doble click en el logo"
echo "   3. Usuario: admin (o cualquier usuario de Django)"
echo "   4. Contraseña: admin123 (o la contraseña correspondiente)"
echo ""
echo "🛑 Presiona Ctrl+C para detener todos los servicios"
echo ""

# Mantener el script ejecutándose
wait
