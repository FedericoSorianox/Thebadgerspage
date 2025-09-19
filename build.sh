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

    # Detectar comando Python para usar consistentemente
    PYTHON_CMD=""
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
        echo "🐍 Usando python3"
    elif command -v python &> /dev/null; then
        PYTHON_CMD="python"
        echo "🐍 Usando python"
    else
        echo "❌ No se encontró Python"
        exit 1
    fi

    echo "📂 Recolectando archivos estáticos..."
    $PYTHON_CMD manage.py collectstatic --noinput --clear

    echo "🔧 Verificando dependencias críticas..."
    if ! command -v gunicorn &> /dev/null; then
        echo "⚠️ Gunicorn no encontrado, instalando..."
        pip install gunicorn
    else
        echo "✅ Gunicorn disponible"
    fi

    echo "🔧 Ejecutando diagnóstico completo..."
    if $PYTHON_CMD ../render_diagnostic.py; then
        echo "✅ Diagnóstico completado exitosamente"
    else
        echo "⚠️ Diagnóstico encontró algunos problemas, pero continuando..."
    fi

    echo "🔧 Verificando configuración de Django..."

    echo "🔍 Ejecutando: $PYTHON_CMD manage.py check --settings=core.settings_render"
    if $PYTHON_CMD manage.py check --settings=core.settings_render; then
        echo "✅ Configuración de Django verificada correctamente"
    else
        echo "❌ Error en configuración de Django"
        echo "🔍 Intentando diagnosticar el problema..."
        echo "📄 Contenido del directorio actual:"
        ls -la
        echo "📄 Contenido del directorio backend:"
        ls -la backend/
        echo "📄 Variables de entorno relevantes:"
        env | grep -E "(PYTHON|DJANGO|RENDER)" | head -10
        exit 1
    fi

    echo "📊 Verificando estado de migraciones..."
    $PYTHON_CMD manage.py showmigrations --settings=core.settings_render

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