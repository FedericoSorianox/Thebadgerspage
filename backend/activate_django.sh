#!/bin/bash

# Script para activar el entorno de desarrollo Django
# Uso: source ./activate_django.sh

echo "🔄 Activando entorno virtual..."
source venv/bin/activate

echo "⚙️ Configurando variables de entorno..."
export DJANGO_SETTINGS_MODULE=core.settings

echo "✅ Entorno Django configurado correctamente!"
echo "📁 Directorio actual: $(pwd)"
echo "🐍 Python: $(which python)"
echo "🎯 DJANGO_SETTINGS_MODULE: $DJANGO_SETTINGS_MODULE"

echo ""
echo "💡 Comandos útiles:"
echo "   python manage.py runserver    # Ejecutar servidor"
echo "   python manage.py check        # Verificar configuración"
echo "   python manage.py shell        # Shell interactivo"
echo "   python manage.py migrate      # Aplicar migraciones"
