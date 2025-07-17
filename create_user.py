#!/usr/bin/env python3
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.append('/Users/fede/Thebadgerspage/backend')
django.setup()

from django.contrib.auth.models import User

# Crear usuario
username = 'federico_sorianox'
password = 'evRWh0Z7'

if User.objects.filter(username=username).exists():
    print(f"⚠️  El usuario {username} ya existe")
    user = User.objects.get(username=username)
    user.set_password(password)
    user.save()
    print(f"✅ Contraseña actualizada para {username}")
else:
    user = User.objects.create_user(
        username=username,
        password=password,
        email='federico@example.com'
    )
    print(f"✅ Usuario {username} creado exitosamente")

print(f"Usuario: {user.username}")
print(f"ID: {user.id}")
print(f"Activo: {user.is_active}") 