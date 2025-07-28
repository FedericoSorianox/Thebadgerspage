#!/bin/bash

echo "🚀 Iniciando deployment de The Badgers Page..."

# Ir al directorio del frontend
cd frontend

echo "📦 Instalando dependencias del frontend..."
npm install

echo "🔨 Construyendo el frontend..."
npm run build

echo "📁 Copiando build al backend..."
cp -r dist/* ../backend/frontend_build/

# Ir al directorio del backend
cd ../backend

echo "🔧 Configurando backend para producción..."

# Si estás en un entorno de producción, descomentarás estas líneas:
# export DEBUG=false
# export USE_SQLITE=false

echo "✅ Deployment completado!"
echo "🌐 Ahora puedes hacer push a tu repositorio y Render se encargará del resto."
echo ""
echo "📝 Resumen de cambios:"
echo "   - ✅ Agregado proxy para productos en /api/productos/"
echo "   - ✅ Configuración de CORS actualizada"
echo "   - ✅ Frontend actualizado para usar el proxy local"
echo "   - ✅ Eliminado error de CORS"
echo ""
echo "🔍 Para probar localmente:"
echo "   cd backend && python3 manage.py runserver"
