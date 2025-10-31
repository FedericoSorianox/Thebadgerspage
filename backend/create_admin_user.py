#!/usr/bin/env python3
"""
Script para crear usuario administrador en producción
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings_render')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

django.setup()

from django.contrib.auth.models import User

def create_admin_user():
    """Crear usuario administrador si no existe"""
    username = 'admin'
    email = 'admin@thebadgers.com'
    password = 'badgers2024!'  # Cambiar por una contraseña segura
    
    # Verificar si el usuario ya existe
    if User.objects.filter(username=username).exists():
        print(f"✅ Usuario '{username}' ya existe")
        user = User.objects.get(username=username)
    else:
        # Crear el usuario
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print(f"✅ Usuario administrador '{username}' creado exitosamente")
    
    print(f"📧 Email: {user.email}")
    print(f"🔑 Username: {user.username}")
    print(f"👑 Es superusuario: {user.is_superuser}")
    print(f"🛡️ Es staff: {user.is_staff}")
    
    return user

if __name__ == '__main__':
    try:
        create_admin_user()
        print("\n🎯 Puedes usar estas credenciales para loguearte:")
        print("   Username: admin")
        print("   Password: badgers2024!")
        print("\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
