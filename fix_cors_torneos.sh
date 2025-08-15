#!/bin/bash
# Script para desplegar arreglos de CORS para torneos

echo "🔧 Desplegando arreglos de CORS para sistema de torneos..."

# Verificar que estamos en el directorio correcto
if [ ! -f "backend/manage.py" ]; then
    echo "❌ Error: No se encontró manage.py. Ejecutar desde el directorio raíz del proyecto."
    exit 1
fi

# Activar entorno virtual del backend
echo "📦 Activando entorno virtual..."
cd backend
if [ ! -d "venv" ]; then
    echo "⚠️  Creando entorno virtual..."
    python3 -m venv venv
fi

source venv/bin/activate
echo "📋 Instalando dependencias..."
pip install -r requirements.txt

echo "🔍 Verificando configuración Django..."
export USE_SQLITE=true
python manage.py check

echo "🗃️  Ejecutando migraciones..."
python manage.py migrate

echo "✅ Backend configurado correctamente"

cd ..

# Configurar frontend
echo "🎨 Configurando frontend..."
cd frontend

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias de Node.js..."
    npm install
fi

echo "🔧 Construyendo frontend para producción..."
npm run build

cd ..

echo ""
echo "✅ Arreglos de CORS aplicados correctamente"
echo ""
echo "Para probar localmente:"
echo "1. Backend: cd backend && source venv/bin/activate && export USE_SQLITE=true && python manage.py runserver"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "Para desplegar a producción:"
echo "./deploy_production.sh"
