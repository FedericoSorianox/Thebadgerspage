#!/bin/bash

# Script para resetear admin en producción (Render)
echo "🔄 Reseteando contraseña del admin en producción..."

cd backend
python manage.py shell --settings=core.settings_production << 'EOF'
from django.contrib.auth.models import User
import os

username = os.environ.get('ADMIN_USERNAME', 'admin')
email = os.environ.get('ADMIN_EMAIL', 'admin@thebadgers.uy')
password = os.environ.get('ADMIN_PASSWORD', 'admin123bjj2025')

print(f"🔍 Buscando usuario: {username}")
print(f"📧 Email objetivo: {email}")
print(f"🔑 Contraseña objetivo: {'*' * len(password)}")

try:
    user = User.objects.get(username=username)
    print(f"✅ Usuario encontrado: {user.username}")
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
    print(f"❌ Usuario {username} no existe. Creando...")
    user = User.objects.create_superuser(username, email, password)
    print(f"✅ Superusuario {username} creado exitosamente!")

print("🚀 Proceso completado. Intenta hacer login ahora.")
EOF

echo "✅ Script completado!"
