#!/bin/bash

echo "🚀 ARREGLANDO PROBLEMAS DE PRODUCCIÓN"
echo "====================================="

echo ""
echo "1️⃣ Subiendo script de corrección de usuarios..."

# Crear el script en el servidor
cat > fix_users.py << 'EOF'
from django.contrib.auth.models import User

users_passwords = [
    ('admin', 'password123'),
    ('federico_soriano', 'password123'), 
    ('federico_sorianox', 'password123'),
    ('instructor', 'password123'),
    ('testuser', 'password123'),
    ('alumno', 'password123')
]

print("🔧 Arreglando contraseñas de usuarios...")

for username, password in users_passwords:
    try:
        user = User.objects.get(username=username)
        user.set_password(password)
        user.save()
        print(f"✅ {username}: contraseña actualizada")
    except User.DoesNotExist:
        user = User.objects.create_user(
            username=username,
            password=password,
            is_staff=True,
            is_active=True
        )
        print(f"✅ {username}: usuario creado")

print("✅ Todos los usuarios tienen contraseña: password123")
EOF

echo "✅ Script creado"

echo ""
echo "2️⃣ Verificando estado de producción..."

echo ""
echo "🔐 Probando autenticación actual:"
response=$(curl -s -w "%{http_code}" -o /tmp/test_auth.json "https://thebadgerspage.onrender.com/api/galeria/upload/" \
    -H "Authorization: Basic $(echo -n 'admin:password123' | base64)")
if [ "$response" = "200" ]; then
    echo "✅ admin:password123 funciona"
else
    echo "❌ admin:password123 no funciona (código: $response)"
fi

response=$(curl -s -w "%{http_code}" -o /tmp/test_federico.json "https://thebadgerspage.onrender.com/api/galeria/upload/" \
    -H "Authorization: Basic $(echo -n 'federico_soriano:password123' | base64)")
if [ "$response" = "200" ]; then
    echo "✅ federico_soriano:password123 funciona"
else
    echo "❌ federico_soriano:password123 no funciona (código: $response)"
fi

echo ""
echo "📸 Probando URLs de imágenes:"
image_url=$(curl -s "https://thebadgerspage.onrender.com/api/galeria/" | jq -r '.[0].url')
echo "Primera imagen: $image_url"

response=$(curl -s -I "$image_url" | head -1)
echo "Respuesta: $response"

echo ""
echo "📋 INSTRUCCIONES PARA ARREGLAR:"
echo "================================"
echo ""
echo "🔐 Para arreglar usuarios:"
echo "1. Ve a https://thebadgerspage.onrender.com/admin/"
echo "2. Logueate con admin:password123 (si funciona)"
echo "3. Ve a 'Users' y cambia la contraseña de federico_soriano a 'password123'"
echo ""
echo "📁 Para arreglar imágenes:"
echo "1. El problema es que los archivos media no están en producción"
echo "2. Render no persiste archivos subidos entre deploys"
echo "3. Necesitamos usar Cloudinary para almacenamiento persistente"
echo ""
echo "🚀 SOLUCIÓN RÁPIDA:"
echo "Usar admin:password123 para login (debería funcionar)"

# Limpiar archivos temporales
rm -f /tmp/test_*.json
rm -f fix_users.py
