#!/bin/bash
# Despliegue urgente de arreglos CORS

echo "🚨 Despliegue urgente de arreglos CORS..."

# Verificar que el build esté actualizado
cd frontend
if [ ! -f "dist/index.html" ]; then
    echo "⚠️  Construyendo frontend..."
    npm run build
fi

cd ..

# Copiar frontend compilado al backend
echo "📦 Copiando frontend al backend..."
rm -rf backend/frontend_build/*
cp -r frontend/dist/* backend/frontend_build/

# Ejecutar deployment a producción
echo "🚀 Desplegando a Render..."
if [ -f "deploy_production.sh" ]; then
    ./deploy_production.sh
else
    echo "⚠️  deploy_production.sh no encontrado, usando comando directo..."
    git add .
    git commit -m "Fix CORS for torneos API - Emergency deployment"
    git push origin main
fi

echo ""
echo "✅ Despliegue de emergencia completado"
echo ""
echo "🔍 Verificar en 2-3 minutos en:"
echo "   https://the-badgers.com/torneo"
echo ""
echo "💡 Los logs de debug aparecerán en la consola del navegador"
