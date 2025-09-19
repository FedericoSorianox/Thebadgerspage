#!/bin/bash
set -e

echo "🚀 Iniciando build de producción para The Badgers Page..."
echo "========================================================"

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

echo "🔧 Configurando variables de entorno para producción..."
# Asegurar que el frontend sepa usar la URL correcta del backend
export VITE_API_BASE_URL="https://thebadgerspage.onrender.com"

echo "🔨 Compilando frontend con configuración de producción..."
npm run build

echo "📁 Copiando build al backend..."
if [ -d "dist" ]; then
    cp -r dist/* ../backend/frontend_build/
    echo "✅ Frontend copiado correctamente"
    echo "   📄 Archivos copiados:"
    ls -la ../backend/frontend_build/ | head -10
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

    echo "🔧 Verificando configuración..."
    python manage.py check --settings=core.settings_render

    echo "✅ Build completado exitosamente!"
    echo ""
    echo "🎯 Configuración de producción aplicada:"
    echo "   🌐 Frontend: the-badgers.com"
    echo "   🚀 Backend: thebadgerspage.onrender.com"
    echo "   🔐 CORS: Configurado para ambos dominios"
    echo "   📸 Galería: Pública con eliminación para admins"
    echo ""
    echo "🚀 ¡Listo para deploy en Render!"
else
    echo "❌ Error: requirements.txt no encontrado"
    exit 1
fi 