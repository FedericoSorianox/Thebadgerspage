#!/bin/bash

echo "🔥 INTENSIVE CORS DEBUGGING - Production"
echo "========================================"
echo ""

echo "🚀 Deployment Status:"
echo "- Custom CORS middleware added"
echo "- CORS_ALLOW_ALL_ORIGINS = True (temporary)"
echo "- Manual CORS headers in views"
echo "- OPTIONS request handling added"
echo ""

echo "⏰ Waiting for deployment (60 seconds)..."
sleep 10

echo ""
echo "🧪 Testing CORS with multiple methods..."
echo ""

# Test 1: Basic API availability
echo "1️⃣ Basic API test:"
curl -s -o /dev/null -w "Status: %{http_code}\n" https://thebadgerspage.onrender.com/api/galeria/

# Test 2: OPTIONS preflight from the-badgers.com
echo ""
echo "2️⃣ OPTIONS preflight from the-badgers.com:"
curl -X OPTIONS \
  -H "Origin: https://the-badgers.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v https://thebadgerspage.onrender.com/api/galeria/ 2>&1 | grep -E "(HTTP/|Access-Control|X-Custom-CORS|X-Allowed-Origin)" | head -10

# Test 3: Actual GET request
echo ""  
echo "3️⃣ GET request with Origin header:"
curl -X GET \
  -H "Origin: https://the-badgers.com" \
  -H "Content-Type: application/json" \
  -v https://thebadgerspage.onrender.com/api/galeria/ 2>&1 | grep -E "(HTTP/|Access-Control|X-Custom-CORS)" | head -10

# Test 4: Test without origin
echo ""
echo "4️⃣ Request without Origin (should use fallback):"
curl -X GET \
  -H "Content-Type: application/json" \
  -v https://thebadgerspage.onrender.com/api/galeria/ 2>&1 | grep -E "(HTTP/|Access-Control|X-Custom-CORS)" | head -5

echo ""
echo "🎯 What to look for:"
echo "✅ Status: 200 OK"
echo "✅ Access-Control-Allow-Origin: https://the-badgers.com"
echo "✅ Access-Control-Allow-Credentials: true" 
echo "✅ X-Custom-CORS: enabled (indicates our middleware is working)"
echo "✅ X-Allowed-Origin: https://the-badgers.com (shows origin was recognized)"
echo ""
echo "❌ If you still see CORS errors:"
echo "   - Check browser console for specific error messages"
echo "   - Verify the request is going to the correct API URL"
echo "   - Check if there are redirect chains causing issues"
echo ""
echo "🌐 Test in browser: https://the-badgers.com/galeria"
