#!/bin/bash
set -e

echo "🚀 Iniciando build..."

# Verificar si estamos en el directorio correcto
if [ ! -d "frontend" ]; then
    echo "❌ Error: No se encuentra el directorio frontend"
    echo "📁 Contenido del directorio actual:"
    ls -la
    exit 1
fi

# Build del frontend
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install

echo "🔨 Compilando frontend..."
npm run build

echo "📁 Copiando build al backend..."
cp -r dist/* ../backend/frontend_build/

# Volver al directorio raíz
cd ..

# Si es un Web Service, instalar dependencias de Python
if [ -f "backend/requirements.txt" ]; then
    echo "🐍 Instalando dependencias de Python..."
    cd backend
    pip install -r requirements.txt
    
    echo "📂 Recolectando archivos estáticos..."
    python manage.py collectstatic --noinput
    
    echo "✅ Build completado exitosamente!"
else
    echo "✅ Build del frontend completado!"
fi 