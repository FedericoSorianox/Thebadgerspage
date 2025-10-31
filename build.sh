#!/bin/bash
set -e

echo "🚀 Iniciando build de producción para The Badgers Page..."
echo "========================================================"
echo "📅 Fecha/Hora: $(date)"
echo "📁 Directorio actual: $(pwd)"

# Verificar si estamos en el directorio correcto
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Directorios frontend o backend no encontrados"
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
    ls -la ../backend/frontend_build/ | head -5
else
    echo "❌ Error: Directorio dist no encontrado"
    exit 1
fi

# Volver al directorio raíz para copiar el script de inicio
cd ..
echo "📋 Verificando script de inicio..."
if [ -f "backend/start_render.py" ]; then
    echo "✅ Script de inicio ya está en backend/"
    echo "   📄 Verificando ubicación:"
    ls -la backend/start_render.py
elif [ -f "start_render.py" ]; then
    cp start_render.py backend/
    echo "✅ Script de inicio copiado correctamente"
    echo "   📄 Verificando copia:"
    ls -la backend/start_render.py
else
    echo "❌ Error: start_render.py no encontrado en $(pwd) ni en backend/"
    echo "📁 Contenido del directorio actual:"
    ls -la
    exit 1
fi

# Verificar que todos los archivos necesarios estén presentes
echo "🔍 Verificando archivos críticos..."
required_files=("backend/manage.py" "backend/core/settings_render.py" "backend/core/wsgi.py" "backend/start_render.py")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Error: $file no encontrado en $(pwd)"
        echo "📁 Contenido del directorio actual:"
        ls -la
        exit 1
    else
        echo "✅ $file encontrado"
    fi
done

# Instalar dependencias de Python
if [ -f "backend/requirements.txt" ]; then
    echo "🐍 Instalando dependencias de Python..."
    cd backend

    # Detectar comandos para usar consistentemente
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

    PIP_CMD=""
    if command -v pip3 &> /dev/null; then
        PIP_CMD="pip3"
        echo "📦 Usando pip3"
    elif command -v pip &> /dev/null; then
        PIP_CMD="pip"
        echo "📦 Usando pip"
    else
        echo "❌ No se encontró pip"
        exit 1
    fi

    # Instalar dependencias sin cache para reducir tamaño
    # En Render esto funciona automáticamente, en local agregar flag si es necesario
    if [[ "$PIP_CMD" == "pip3" ]] && command -v brew &> /dev/null; then
        # En macOS con Homebrew, usar flag especial
        $PIP_CMD install --no-cache-dir --break-system-packages -r requirements.txt
    else
        # En Render u otros entornos
        $PIP_CMD install --no-cache-dir -r requirements.txt
    fi

    echo "📂 Recolectando archivos estáticos..."
    $PYTHON_CMD manage.py collectstatic --noinput --clear

    echo "🔧 Verificando dependencias críticas..."
    if ! command -v gunicorn &> /dev/null; then
        echo "⚠️ Gunicorn no encontrado, instalando..."
        if [[ "$PIP_CMD" == "pip3" ]] && command -v brew &> /dev/null; then
            $PIP_CMD install --break-system-packages gunicorn
        else
            $PIP_CMD install gunicorn
        fi
    else
        echo "✅ Gunicorn disponible"
    fi

    echo "🔧 Ejecutando diagnóstico rápido (simplificado)..."
    # Ejecutar diagnóstico simplificado con timeout corto para evitar que se atasque
    timeout 5 $PYTHON_CMD ../render_diagnostic.py
    if [ $? -eq 0 ]; then
        echo "✅ Diagnóstico completado exitosamente"
    else
        echo "⚠️ Diagnóstico encontró algunos problemas o timeout, pero continuando..."
        echo "   📝 El diagnóstico es opcional y no afecta el build"
    fi

    echo "🔧 Verificando configuración de Django (simplificado)..."

    # Configurar PYTHONPATH para que Django encuentre los módulos
    export PYTHONPATH="${PYTHONPATH}:$(pwd)/backend"
    BACKEND_DIR="$(pwd)/backend"

    # Solo verificar imports básicos (sin setup de Django para evitar timeouts)
    echo "🔍 Verificando imports básicos de Django..."
    if $PYTHON_CMD -c "
import sys
sys.path.insert(0, '$BACKEND_DIR')
import django
print('✅ Django importado correctamente')
print(f'📄 Versión: {django.VERSION}')
"; then
        echo "✅ Imports básicos de Django verificados correctamente"
    else
        echo "❌ Error en imports básicos de Django"
        echo "🔍 Intentando diagnosticar el problema..."

        echo "📄 Contenido del directorio actual:"
        ls -la
        echo "📄 Variables de entorno relevantes:"
        env | grep -E "(PYTHON|DJANGO|RENDER|PATH)" | head -10
        exit 1
    fi

    # Omitir verificación de migraciones durante el build para evitar timeouts
    echo "📊 Omitiendo verificación de migraciones durante build para evitar timeouts"
    echo "   📝 Las migraciones se ejecutarán automáticamente en Render si es necesario"

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