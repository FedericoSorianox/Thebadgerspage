#!/bin/bash

echo "🧪 Probando APIs de producción..."
echo "=================================="

API_BASE="https://thebadgerspage.onrender.com"

echo ""
echo "1. Probando API raíz..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$API_BASE/api/"

echo ""
echo "2. Probando galería items (sin autenticación)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$API_BASE/api/galeria/items/"

echo ""
echo "3. Probando galería items con límite..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$API_BASE/api/galeria/items/?limit=5"

echo ""
echo "4. Probando galería list (legacy)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$API_BASE/api/galeria/"

echo ""
echo "5. Probando CORS preflight..."
curl -s -o /dev/null -w "Status: %{http_code}\n" \
  -X OPTIONS \
  -H "Origin: https://the-badgers.com" \
  -H "Access-Control-Request-Method: GET" \
  "$API_BASE/api/galeria/items/"

echo ""
echo "6. Probando auth status (espera 401)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$API_BASE/api/auth/status/"

echo "7. Probando eliminación de fotos (espera 401 sin token)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" -X DELETE "$API_BASE/api/galeria/delete/1/"

echo ""
echo "✅ Pruebas completadas!"
echo ""
echo "📋 Resumen esperado:"
echo "   - API raíz: 200"
echo "   - Galería items: 200"
echo "   - Galería items con límite: 200"
echo "   - Galería list: 200"
echo "   - CORS preflight: 200"
echo "   - Auth status: 401 (sin token)"
echo "   - Eliminación: 401 (sin token)"
echo ""
echo "🚀 Si todo está en 200 (excepto auth), las correcciones funcionaron!"
echo ""
echo "🎯 Problemas corregidos:"
echo "   ✅ Error 500 en galería items (campos null)"
echo "   ✅ Error 401 en auth endpoints (CORS)"
echo "   ✅ Error de djongo/MongoDB (cambiado a SQLite)"
echo "   ✅ Configuración de URLs de API"
