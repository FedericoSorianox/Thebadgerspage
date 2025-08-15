#!/bin/bash
"""
Script de emergency deployment para forzar actualización del frontend
"""

echo "🚀 EMERGENCY DEPLOYMENT - Forzando rebuild completo"

# Timestamp para evitar cache
TIMESTAMP=$(date +%s)
echo "📅 Timestamp: $TIMESTAMP"

cd frontend

# Limpiar cache de vite
echo "🧹 Limpiando cache..."
rm -rf node_modules/.vite
rm -rf dist

# Rebuild forzado
echo "🔨 Rebuild con timestamp..."
VITE_BUILD_TIMESTAMP=$TIMESTAMP npm run build

# Copiar al backend
echo "📁 Copiando al backend..."
cd ..
rm -rf backend/frontend_build
cp -r frontend/dist backend/frontend_build

# Git commit y push
echo "📤 Subiendo a git..."
git add -A
git commit -m "EMERGENCY: Rebuild frontend forzado - timestamp $TIMESTAMP"
git push

echo "✅ Deploy completado. Esperando propagación en Render..."
echo "🌐 Prueba la página en unos minutos: https://the-badgers.com/torneo"
