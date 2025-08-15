#!/bin/bash
# Script para desplegar los arreglos de CORS a producción

echo "🚀 Desplegando arreglos de CORS a producción..."

# Verificar que estamos en el directorio correcto
if [ ! -f "deploy_production.sh" ]; then
    echo "❌ Error: No se encontró deploy_production.sh. Ejecutar desde el directorio raíz del proyecto."
    exit 1
fi

echo "📦 Construyendo frontend con configuración de producción..."
cd frontend
npm run build
cd ..

echo "🚀 Ejecutando despliegue a producción..."
./deploy_production.sh

echo ""
echo "✅ Arreglos de CORS desplegados a producción"
echo ""
echo "🔍 Verificar en:"
echo "- https://thebadgerspage.onrender.com/api/torneo/torneos/"
echo "- https://the-badgers.com/api/torneo/torneos/ (si está configurado)"
echo ""
echo "Para verificar CORS:"
echo "1. Abrir DevTools en the-badgers.com"
echo "2. Ejecutar en consola:"
echo "   fetch('/api/torneo/torneos/').then(r=>r.json()).then(console.log)"
