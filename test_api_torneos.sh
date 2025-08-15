#!/bin/bash
# Script de prueba para verificar que la API funciona correctamente

echo "🧪 Probando endpoints de la API de torneos..."

# Función para probar un endpoint
test_endpoint() {
    local url=$1
    local description=$2
    echo ""
    echo "🔍 Probando: $description"
    echo "URL: $url"
    
    # Usar curl para probar el endpoint
    response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
    http_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ]; then
        echo "✅ OK (HTTP $http_code)"
        echo "Respuesta: $body" | head -c 200
        if [ ${#body} -gt 200 ]; then
            echo "..."
        fi
    else
        echo "❌ Error (HTTP $http_code)"
        echo "Respuesta: $body"
    fi
}

# URL base para pruebas
API_BASE="http://127.0.0.1:8000"

echo "Asegurate de que el servidor Django esté ejecutándose:"
echo "cd backend && source venv/bin/activate && export USE_SQLITE=true && python manage.py runserver"
echo ""

# Probar endpoints básicos
test_endpoint "$API_BASE/api/" "API Root"
test_endpoint "$API_BASE/api/torneo/torneos/" "Lista de torneos"
test_endpoint "$API_BASE/api/torneo/categorias/" "Lista de categorías"
test_endpoint "$API_BASE/api/torneo/participantes/" "Lista de participantes"

echo ""
echo "🔧 Para probar CORS desde el navegador:"
echo "1. Abrir las herramientas de desarrollador"
echo "2. Ir a la consola"
echo "3. Ejecutar:"
echo "   fetch('$API_BASE/api/torneo/torneos/')"
echo "   .then(r => r.json())"
echo "   .then(console.log)"
echo ""
echo "✅ Pruebas completadas"
