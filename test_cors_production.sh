#!/bin/bash

echo "🔍 Testing CORS configuration in production..."
echo "========================================"

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
