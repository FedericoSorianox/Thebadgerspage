#!/bin/bash

# Script de despliegue para The Badgers Page
set -e

echo "🚀 Iniciando despliegue..."

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install

# Compilar el frontend
echo "🔨 Compilando frontend..."
npm run build

# Copiar build al backend
echo "📁 Copiando build al backend..."
cp -r dist/* ../backend/frontend_build/

# Volver al directorio raíz
cd ..

# Instalar dependencias del backend
echo "🐍 Instalando dependencias del backend..."
cd backend
pip install -r requirements.txt

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones..."
python manage.py migrate

# Recolectar archivos estáticos
echo "📂 Recolectando archivos estáticos..."
python manage.py collectstatic --noinput

echo "✅ Despliegue completado exitosamente!" 