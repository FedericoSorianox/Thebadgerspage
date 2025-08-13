#!/bin/bash

# Diagnóstico de CORS en producción
echo "🔍 Diagnóstico de CORS para producción..."
echo ""

# Test 1: Verificar que el backend responde
echo "1️⃣ Testing backend availability..."
curl -I https://thebadgerspage.onrender.com/api/galeria/ 2>/dev/null | head -1

# Test 2: Verificar headers CORS con preflight
echo ""
echo "2️⃣ Testing CORS preflight from the-badgers.com..."
curl -H "Origin: https://the-badgers.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: authorization,content-type" \
     -X OPTIONS \
     -I https://thebadgerspage.onrender.com/api/galeria/ 2>/dev/null

# Test 3: Verificar headers CORS con GET request
echo ""
echo "3️⃣ Testing actual GET request with CORS headers..."
curl -H "Origin: https://the-badgers.com" \
     -H "Content-Type: application/json" \
     -X GET \
     -I https://thebadgerspage.onrender.com/api/galeria/ 2>/dev/null

echo ""
echo "✅ Diagnosis complete!"
echo ""
echo "📋 What to look for:"
echo "- Status: 200 OK (or 404/500 but not connection errors)"
echo "- Access-Control-Allow-Origin: https://the-badgers.com"
echo "- Access-Control-Allow-Credentials: true"
echo "- Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"
echo ""
echo "🌐 If you don't see these headers, the deployment may still be in progress"
