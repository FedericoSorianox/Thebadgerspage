#!/bin/bash

# Script simple para resetear admin en producción (Render)
echo "🔄 Reseteando contraseña del admin con configuraciones regulares..."

cd backend

echo "🔧 Usando core.settings (configuración regular)"

python manage.py shell << 'EOF'
from django.contrib.auth.models import User

# Usar credenciales fijas
username = 'admin'
email = 'admin@thebadgers.uy'
password = 'admin123bjj2025'

print(f"🔍 Buscando usuario: {username}")
print(f"📧 Email objetivo: {email}")

# Mostrar todos los usuarios existentes
print("\n👥 Usuarios existentes en la base de datos:")
for user in User.objects.all():
    print(f"  - {user.username} (staff: {user.is_staff}, superuser: {user.is_superuser}, active: {user.is_active})")

try:
    user = User.objects.get(username=username)
    print(f"\n✅ Usuario encontrado: {user.username}")
    print(f"📊 Estado actual - Staff: {user.is_staff}, Superuser: {user.is_superuser}, Active: {user.is_active}")
    
    user.email = email
    user.set_password(password)
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.save()
    
    print(f"✅ Usuario actualizado exitosamente!")
    print(f"📊 Estado nuevo - Staff: {user.is_staff}, Superuser: {user.is_superuser}, Active: {user.is_active}")
    
except User.DoesNotExist:
    print(f"\n❌ Usuario {username} no existe. Creando...")
    user = User.objects.create_superuser(username, email, password)
    print(f"✅ Superusuario {username} creado exitosamente!")

print("\n🚀 Proceso completado. Intenta hacer login ahora.")
print(f"🌐 URL: https://thebadgerspage.onrender.com/admin/")
print(f"👤 Usuario: {username}")
print(f"🔑 Contraseña: {password}")
EOF

echo "✅ Script completado!"
