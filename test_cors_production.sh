#!/bin/bash
# Test de CORS en producción - Versión actualizada

echo "🧪 Probando CORS en producción..."

# Test del endpoint de torneos con headers CORS
test_cors() {
    local url=$1
    local origin=$2
    
    echo ""
    echo "🔍 Probando: $url"
    echo "Origin: $origin"
    
    # Test OPTIONS (preflight)
    echo "📋 OPTIONS request:"
    curl -s -X OPTIONS \
        -H "Origin: $origin" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -v "$url" 2>&1 | grep -E "(Access-Control|HTTP/)"
    
    echo ""
    echo "📋 GET request:"
    # Test GET real
    curl -s -X GET \
        -H "Origin: $origin" \
        -v "$url" 2>&1 | grep -E "(Access-Control|HTTP/)" | head -5
}

# URLs a probar
API_BASE="https://thebadgerspage.onrender.com"
ORIGINS=(
    "https://the-badgers.com"
    "https://www.the-badgers.com"
)

# Probar cada origen
for origin in "${ORIGINS[@]}"; do
    test_cors "$API_BASE/api/torneo/torneos/" "$origin"
done

echo ""
echo "🌐 Para probar manualmente en el navegador:"
echo "1. Ir a https://the-badgers.com/torneo"
echo "2. Abrir DevTools (F12)"
echo "3. Ver logs en la consola"
echo "4. Verificar Network tab para requests exitosas"

# Test OPTIONS request to check CORS headers
echo "1. Testing OPTIONS request to API:"
curl -X OPTIONS \
  -H "Origin: https://the-badgers.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v https://thebadgerspage.onrender.com/api/galeria/ 2>&1 | grep -E "(Access-Control|HTTP/)"

echo ""
echo "2. Testing GET request from the-badgers.com origin:"
curl -X GET \
  -H "Origin: https://the-badgers.com" \
  -H "Content-Type: application/json" \
  -v https://thebadgerspage.onrender.com/api/galeria/ 2>&1 | grep -E "(Access-Control|HTTP/)" | head -10

echo ""
echo "3. Testing API endpoint availability:"
curl -s -o /dev/null -w "Status: %{http_code}\n" https://thebadgerspage.onrender.com/api/galeria/

echo ""
echo "4. Testing frontend URL:"
curl -s -o /dev/null -w "Frontend Status: %{http_code}\n" https://the-badgers.com/

echo ""
echo "✅ CORS test complete!"
echo ""
echo "🌐 If all tests show 200 status and proper Access-Control headers,"
echo "   the CORS issue should be resolved."
echo ""
echo "🔧 If issues persist, check:"
echo "   - Render deployment logs"
echo "   - Browser developer console"
echo "   - Network tab in browser dev tools"
