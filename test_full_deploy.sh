#!/bin/bash
set -e

echo "🧪 Probando proceso completo de deploy..."
echo "=========================================="

# Simular entorno de Render
export RENDER=1
export PORT=8000
export DEBUG=false
export DJANGO_SETTINGS_MODULE=core.settings_render
export SECRET_KEY=test-secret-key-for-testing

echo "🌐 Variables de entorno simuladas:"
echo "   RENDER: $RENDER"
echo "   PORT: $PORT"
echo "   DEBUG: $DEBUG"
echo "   DJANGO_SETTINGS_MODULE: $DJANGO_SETTINGS_MODULE"

# Cambiar a directorio backend
cd backend

echo ""
echo "🔍 Verificando estructura del proyecto..."
if [ ! -f "manage.py" ]; then
    echo "❌ manage.py no encontrado"
    exit 1
fi

if [ ! -f "core/settings_render.py" ]; then
    echo "❌ core/settings_render.py no encontrado"
    exit 1
fi

if [ ! -f "../start_render.py" ]; then
    echo "❌ start_render.py no encontrado"
    exit 1
fi

echo "✅ Estructura del proyecto correcta"

echo ""
echo "🔧 Probando configuración de Django..."
python3 manage.py check --settings=core.settings_render
echo "✅ Configuración de Django correcta"

echo ""
echo "📊 Probando migraciones..."
python3 manage.py showmigrations --settings=core.settings_render
echo "✅ Migraciones verificadas"

echo ""
echo "📂 Probando collectstatic..."
python3 manage.py collectstatic --noinput --clear --settings=core.settings_render
echo "✅ Collectstatic completado"

echo ""
echo "🚀 Probando script de inicio (simulado)..."
# Solo verificar que el script se puede importar, no ejecutarlo completamente
python3 -c "import sys; sys.path.insert(0, '..'); import start_render; print('✅ Script de inicio importado correctamente')"
echo "✅ Script de inicio verificado"

echo ""
echo "🎉 ¡Todas las pruebas pasaron exitosamente!"
echo ""
echo "📋 Resumen de verificación:"
echo "   ✅ Estructura del proyecto"
echo "   ✅ Configuración de Django"
echo "   ✅ Migraciones"
echo "   ✅ Collectstatic"
echo "   ✅ Script de inicio"
echo ""
echo "🚀 El deploy debería funcionar correctamente en Render"
