#!/bin/bash

echo "🔍 DEBUGGING API URL ISSUE"
echo "=========================="
echo ""

echo "📁 Checking environment files:"
echo ""
echo "📄 .env.production content:"
cat /Users/fede/Thebadgerspage/frontend/.env.production
echo ""

echo "📄 .env.development content:"
if [ -f "/Users/fede/Thebadgerspage/frontend/.env.development" ]; then
    cat /Users/fede/Thebadgerspage/frontend/.env.development
else
    echo "No .env.development file found"
fi
echo ""

echo "🔧 Frontend build configuration:"
echo "Current API_BASE in App.jsx:"
grep -n "API_BASE" /Users/fede/Thebadgerspage/frontend/src/App.jsx
echo ""

echo "🔧 AuthService configuration:"
head -5 /Users/fede/Thebadgerspage/frontend/src/services/authService.js
echo ""

echo "🧪 Testing current build with environment variables:"
cd /Users/fede/Thebadgerspage/frontend

echo "Building with production environment..."
npm run build 2>/dev/null

echo ""
echo "📦 Checking built files for API URLs:"
if [ -d "dist" ]; then
    echo "Looking for the-badgers.com in dist files:"
    grep -r "the-badgers.com" dist/ 2>/dev/null || echo "No the-badgers.com found in dist files"
    echo ""
    echo "Looking for thebadgerspage.onrender.com in dist files:"
    grep -r "thebadgerspage.onrender.com" dist/ 2>/dev/null || echo "No thebadgerspage.onrender.com found in dist files"
else
    echo "No dist directory found, build may have failed"
fi

echo ""
echo "🎯 SOLUTION:"
echo "The issue is likely in Render's environment variables."
echo "Check that VITE_API_BASE_URL is set to 'https://thebadgerspage.onrender.com' in Render dashboard."
