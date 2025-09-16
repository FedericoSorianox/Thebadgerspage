#!/bin/bash
set -e

echo "🚀 Iniciando build de producción..."

# Verificar si estamos en el directorio correcto
if [ ! -d "frontend" ]; then
    echo "❌ Error: No se encuentra el directorio frontend"
    echo "📁 Contenido del directorio actual:"
    ls -la
    exit 1
fi

# Crear directorio para el build del frontend si no existe
mkdir -p backend/frontend_build

# Build del frontend
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm ci --only=production

echo "🔨 Compilando frontend..."
npm run build

echo "📁 Copiando build al backend..."
if [ -d "dist" ]; then
    cp -r dist/* ../backend/frontend_build/
    echo "✅ Frontend copiado correctamente"
else
    echo "❌ Error: Directorio dist no encontrado"
    exit 1
fi

# Volver al directorio raíz
cd ..

# Instalar dependencias de Python
if [ -f "backend/requirements.txt" ]; then
    echo "🐍 Instalando dependencias de Python..."
    cd backend

    # Instalar dependencias sin cache para reducir tamaño
    pip install --no-cache-dir -r requirements.txt

    echo "📂 Recolectando archivos estáticos..."
    python manage.py collectstatic --noinput --clear

    echo "✅ Build completado exitosamente!"
else
    echo "❌ Error: requirements.txt no encontrado"
    exit 1
fi 