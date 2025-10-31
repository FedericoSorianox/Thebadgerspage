#!/bin/bash
set -euo pipefail

echo "🚀 Iniciando build de producción para The Badgers Page..."
echo "========================================================"
echo "📅 Fecha/Hora: $(date)"
echo "📁 Directorio actual: $(pwd)"

# Project root
PROJECT_ROOT="$(pwd)"
echo "📌 PROJECT_ROOT: $PROJECT_ROOT"

# Verificar si estamos en el directorio correcto
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Directorios frontend o backend no encontrados"
    echo "📁 Contenido del directorio actual:"
    ls -la
    exit 1
fi

# Validar variables críticas (Cloudinary) — fallar temprano si no están
required_env_vars=( "CLOUDINARY_CLOUD_NAME" "CLOUDINARY_API_KEY" "CLOUDINARY_API_SECRET" )
missing_vars=()
for v in "${required_env_vars[@]}"; do
  if [ -z "${!v:-}" ]; then
    missing_vars+=("$v")
  fi
done
if [ ${#missing_vars[@]} -ne 0 ]; then
  echo "⚠️  Atención: faltan variables de entorno críticas para Cloudinary: ${missing_vars[*]}"
  echo "   Estas variables deben estar configuradas en Render (Service -> Environment)."
  # No hacemos exit 1 automáticamente para no romper CI en caso de que uses otro storage,
  # pero dejamos una advertencia bien visible.
fi

# --- FRONTEND BUILD ---
echo "📦 Preparando build del frontend..."
cd "$PROJECT_ROOT/frontend"

# Usar npm ci (sin --only=production) para asegurarnos de que se instalen devDeps necesarios para el build
echo "📥 Instalando dependencias del frontend (npm ci)..."
npm ci

echo "🔧 Configurando variables de entorno para producción (frontend)..."
# Si usás VITE o similar, preferible pasar la variable desde Render; aquí la dejamos por si es necesario
export VITE_API_BASE_URL="${VITE_API_BASE_URL:-https://thebadgerspage.onrender.com}"

echo "🔨 Compilando frontend..."
npm run build

# Copiar build al backend
echo "📁 Copiando build al backend/frontend_build..."
mkdir -p "$PROJECT_ROOT/backend/frontend_build"
if [ -d "dist" ]; then
    cp -r dist/* "$PROJECT_ROOT/backend/frontend_build/"
    echo "✅ Frontend copiado correctamente"
    echo "   📄 Archivos copiados (preview):"
    ls -la "$PROJECT_ROOT/backend/frontend_build/" | head -5 || true
else
    echo "❌ Error: directorio dist no encontrado en frontend"
    exit 1
fi

# Volver al root
cd "$PROJECT_ROOT"

# Manejo de start_render.py
echo "📋 Verificando script de inicio..."
if [ -f "backend/start_render.py" ]; then
    echo "✅ Script de inicio ya está en backend/"
elif [ -f "start_render.py" ]; then
    cp start_render.py backend/
    echo "✅ Script de inicio copiado correctamente a backend/"
else
    echo "⚠️ start_render.py no encontrado (no crítico, pero verificar)"
fi

# Verificar archivos críticos
echo "🔍 Verificando archivos críticos..."
required_files=("backend/manage.py" "backend/core/settings_render.py" "backend/core/wsgi.py")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Error: $file no encontrado"
        echo "📁 Contenido del directorio backend:"
        ls -la backend || true
        exit 1
    else
        echo "✅ $file encontrado"
    fi
done

# --- BACKEND (Python) ---
cd "$PROJECT_ROOT/backend"

# Detectar python / pip
PYTHON_CMD=""
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ No se encontró Python"
    exit 1
fi
PIP_CMD=""
if command -v pip3 &> /dev/null; then
    PIP_CMD="pip3"
elif command -v pip &> /dev/null; then
    PIP_CMD="pip"
else
    echo "❌ No se encontró pip"
    exit 1
fi
echo "🐍 Usando $PYTHON_CMD y $PIP_CMD"

# Instalar dependencias (sin cache)
if [ -f "requirements.txt" ]; then
    echo "📦 Instalando dependencias de Python..."
    $PIP_CMD install --no-cache-dir -r requirements.txt
else
    echo "❌ requirements.txt no encontrado en backend/"
    exit 1
fi

# IMPORTANTE: No usar collectstatic --clear (evita eliminar archivos persistentes).
# collectstatic es necesario para static files, pero --clear puede borrar media si hay mala configuración.
echo "📂 Recolectando archivos estáticos (collectstatic --noinput)..."
$PYTHON_CMD manage.py collectstatic --noinput

# Verificar Gunicorn (no crítico)
if ! command -v gunicorn &> /dev/null; then
    echo "⚠️ Gunicorn no encontrado, instalando..."
    $PIP_CMD install gunicorn
else
    echo "✅ Gunicorn disponible"
fi

# Ajustar PYTHONPATH para los checks (usar path absoluto correcto)
export PYTHONPATH="${PYTHONPATH:-}:$PROJECT_ROOT/backend"
echo "🔧 PYTHONPATH ajustado: $PYTHONPATH"

# Ejecutar un chequeo ligero de Django (import)
echo "🔧 Verificando imports básicos de Django..."
if $PYTHON_CMD - <<PYCODE
import sys
sys.path.insert(0, "$PROJECT_ROOT/backend")
try:
    import django
    print("✅ Django importado:", django.get_version())
except Exception as e:
    print("❌ Error importando Django:", e)
    raise
PYCODE
then
    echo "✅ Imports básicos verificados"
else
    echo "❌ Falló verificación de imports de Django"
    exit 1
fi

echo ""
echo "✅ Build completado exitosamente!"
echo "   👉 Nota: si tus uploads se guardan en disco local, recuerda que Render usa filesystem efímero."
echo "   👉 Asegurate de usar Cloudinary (DEFAULT_FILE_STORAGE) o un bucket externo para media."
echo ""
