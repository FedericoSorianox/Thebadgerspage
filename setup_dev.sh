#!/bin/bash

# Script para configurar el entorno de desarrollo
# Uso: ./setup_dev.sh [dev|prod]

set -e

function setup_dev() {
    echo "🚀 Configurando entorno de DESARROLLO..."
    
    # Configurar backend para desarrollo
    cd backend
    export USE_SQLITE=true
    python setup_dev_environment.py
    cd ..
    
    # Configurar frontend para desarrollo
    cd frontend
    node setup_dev.js dev
    cd ..
    
    echo ""
    echo "✅ Entorno de DESARROLLO configurado"
    echo ""
    echo "Para ejecutar:"
    echo "1. Backend: cd backend && export USE_SQLITE=true && python manage.py runserver"
    echo "2. Frontend: cd frontend && npm run dev"
    echo ""
    echo "Para volver a producción: ./setup_dev.sh prod"
}

function setup_prod() {
    echo "🌐 Configurando entorno de PRODUCCIÓN..."
    
    # Configurar frontend para producción
    cd frontend
    node setup_dev.js prod
    cd ..
    
    echo ""
    echo "✅ Entorno de PRODUCCIÓN configurado"
    echo ""
    echo "Para volver a desarrollo: ./setup_dev.sh dev"
}

# Verificar argumentos
case "$1" in
    "dev")
        setup_dev
        ;;
    "prod")
        setup_prod
        ;;
    *)
        echo "Uso: ./setup_dev.sh [dev|prod]"
        echo ""
        echo "  dev  - Configurar para desarrollo (imágenes de ejemplo)"
        echo "  prod - Configurar para producción (imágenes reales)"
        echo ""
        echo "Ejemplos:"
        echo "  ./setup_dev.sh dev   # Para desarrollo"
        echo "  ./setup_dev.sh prod  # Para producción"
        ;;
esac 