#!/bin/bash

# Deploy production with CORS fix
echo "🚀 Deploying production with CORS fix..."

# Verificar que estamos en la rama correcta
echo "📝 Checking git status..."
git status

# Hacer commit de los cambios de CORS
echo "💾 Committing CORS fixes..."
git add .
git commit -m "Fix CORS configuration for production"

# Push a GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ CORS fixes deployed!"
echo ""
echo "🔧 Changes made:"
echo "- Updated CORS_ALLOWED_ORIGINS in settings_production.py"
echo "- Added CORS_ALLOWED_METHODS"
echo "- Added CORS_ALLOWED_HEADERS"
echo "- Added CORS_PREFLIGHT_MAX_AGE"
echo "- Added CORS_EXPOSE_HEADERS"
echo ""
echo "🌐 Your app will redeploy automatically on Render"
echo "⏰ Wait 5-10 minutes for the deployment to complete"
echo ""
echo "🧪 After deployment, test these URLs:"
echo "- https://the-badgers.com/galeria"
echo "- https://the-badgers.com/api/galeria/"
echo ""
echo "🔍 Check the browser console for any remaining CORS errors"
