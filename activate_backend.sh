#!/bin/bash
# Script para activar el entorno virtual del backend

echo "🔧 Activando entorno virtual del backend..."

# Cambiar al directorio del backend
cd backend

# Activar el entorno virtual
source venv/bin/activate

echo "✅ Entorno virtual activado!"
echo "🐍 Python: $(which python3)"
echo "📦 PyMongo version: $(python3 -c "import pymongo; print(pymongo.__version__)")"

# Verificar que bson esté disponible
python3 -c "from bson import ObjectId; print('✅ BSON disponible')" 2>/dev/null || echo "❌ Error: BSON no disponible"

echo ""
echo "Para desactivar el entorno virtual, ejecuta: deactivate"
