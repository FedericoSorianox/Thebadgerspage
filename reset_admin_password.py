#!/usr/bin/env python
"""
Script para resetear la contraseña del admin en producción
Uso: python reset_admin_password.py
"""

import os
import sys
import django

# Configurar Django
sys.path.append('/opt/render/project/src/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings_production')
django.setup()

from django.contrib.auth.models import User

def reset_admin_password():
    username = os.environ.get('ADMIN_USERNAME', 'admin')
    email = os.environ.get('ADMIN_EMAIL', 'admin@thebadgers.uy')
    password = os.environ.get('ADMIN_PASSWORD', 'admin123bjj2025')
    
    try:
        user = User.objects.get(username=username)
        user.email = email
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save()
        print(f"✅ Contraseña actualizada para el usuario: {username}")
        print(f"📧 Email: {email}")
        print(f"🔑 Nueva contraseña: {password}")
        print(f"👤 is_staff: {user.is_staff}")
        print(f"🔒 is_superuser: {user.is_superuser}")
        print(f"✅ is_active: {user.is_active}")
    except User.DoesNotExist:
        user = User.objects.create_superuser(username, email, password)
        print(f"✅ Superusuario creado: {username}")
        print(f"📧 Email: {email}")
        print(f"🔑 Contraseña: {password}")

if __name__ == "__main__":
    reset_admin_password()
