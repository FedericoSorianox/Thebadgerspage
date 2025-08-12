#!/bin/bash

# Script para migrar imágenes a Cloudinary
# The Badgers Page - Migración de imágenes

echo "🌩️ MIGRACIÓN DE IMÁGENES A CLOUDINARY"
echo "====================================="

API_BASE="https://thebadgerspage.onrender.com"
AUTH_HEADER="Authorization: Basic $(echo -n 'admin:password123' | base64)"

echo ""
echo "1️⃣ Verificando configuración de Cloudinary..."

# Verificar que el endpoint de migración existe
response=$(curl -s -w "%{http_code}" -o /tmp/cloudinary_test.json "$API_BASE/api/test-cloudinary/" \
    -H "$AUTH_HEADER")

if [ "$response" = "200" ]; then
    echo "✅ Cloudinary configurado correctamente"
else
    echo "❌ Error en configuración de Cloudinary (código: $response)"
    echo "   Verifica las variables de entorno CLOUDINARY_*"
fi

echo ""
echo "2️⃣ Iniciando migración de imágenes existentes..."

# Intentar migrar imágenes existentes
response=$(curl -s -w "%{http_code}" -o /tmp/migration_result.json "$API_BASE/api/migrate-existing-images/" \
    -H "$AUTH_HEADER" \
    -H "Content-Type: application/json" \
    -X POST)

if [ "$response" = "200" ]; then
    echo "✅ Migración iniciada correctamente"
    if command -v jq >/dev/null 2>&1; then
        echo "   - Resultado: $(jq -r .message /tmp/migration_result.json 2>/dev/null || echo 'Ver detalles en los logs')"
    fi
else
    echo "❌ Error en migración (código: $response)"
    echo "   - Revisa los logs del servidor"
fi

echo ""
echo "3️⃣ Limpiando imágenes de Unsplash..."

# Limpiar imágenes de Unsplash (que son de ejemplo)
response=$(curl -s -w "%{http_code}" -o /tmp/cleanup_result.json "$API_BASE/api/cleanup-unsplash/" \
    -H "$AUTH_HEADER" \
    -X POST)

if [ "$response" = "200" ]; then
    echo "✅ Limpieza completada"
    if command -v jq >/dev/null 2>&1; then
        echo "   - $(jq -r .message /tmp/cleanup_result.json 2>/dev/null || echo 'Ver logs para detalles')"
    fi
else
    echo "⚠️ Limpieza no completada (código: $response)"
fi

echo ""
echo "4️⃣ Verificando estado post-migración..."

# Verificar las primeras imágenes para ver si tienen URLs de Cloudinary
response=$(curl -s -w "%{http_code}" -o /tmp/galeria_check.json "$API_BASE/api/galeria/")

if [ "$response" = "200" ]; then
    echo "✅ Galería accesible"
    
    # Verificar URLs
    if command -v jq >/dev/null 2>&1; then
        cloudinary_count=$(jq '[.[] | select(.url | contains("cloudinary"))] | length' /tmp/galeria_check.json 2>/dev/null || echo "0")
        total_count=$(jq '. | length' /tmp/galeria_check.json 2>/dev/null || echo "?")
        
        echo "   - Total de imágenes: $total_count"
        echo "   - Imágenes en Cloudinary: $cloudinary_count"
        
        if [ "$cloudinary_count" -gt "0" ]; then
            echo "   ✅ Migración exitosa - Imágenes ahora en Cloudinary"
        else
            echo "   ⚠️ Las imágenes aún no están en Cloudinary"
        fi
    fi
else
    echo "❌ Error accediendo a galería (código: $response)"
fi

echo ""
echo "🎯 PASOS SIGUIENTES:"
echo "==================="
echo "1. Verifica en la galería: https://thebadgerspage.onrender.com/galeria"
echo "2. Las imágenes deberían cargarse desde res.cloudinary.com"
echo "3. Si ves URLs locales, espera unos minutos para la migración"
echo "4. Sube nuevas imágenes para probar que van directamente a Cloudinary"

echo ""
echo "📋 CONFIGURACIÓN CLOUDINARY REQUERIDA:"
echo "- CLOUDINARY_CLOUD_NAME=tu_cloud_name"
echo "- CLOUDINARY_API_KEY=tu_api_key"  
echo "- CLOUDINARY_API_SECRET=tu_api_secret"

# Limpiar archivos temporales
rm -f /tmp/cloudinary_test.json /tmp/migration_result.json /tmp/cleanup_result.json /tmp/galeria_check.json

echo ""
echo "Estado: ✅ Script completado"
echo "Revisa los resultados y verifica la galería web"
