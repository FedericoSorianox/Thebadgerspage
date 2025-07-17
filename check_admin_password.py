#!/usr/bin/env python3
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.append('/Users/fede/Thebadgerspage/backend')
django.setup()

from django.contrib.auth.models import User

# Buscar el usuario admin
admin_user = User.objects.filter(username='admin').first()

if admin_user:
    print(f"👤 Usuario admin encontrado:")
    print(f"  - Username: {admin_user.username}")
    print(f"  - Email: {admin_user.email}")
    print(f"  - Activo: {admin_user.is_active}")
    print(f"  - Staff: {admin_user.is_staff}")
    print(f"  - Superuser: {admin_user.is_superuser}")
    
    # Establecer una contraseña conocida para el admin
    admin_password = 'admin123'
    admin_user.set_password(admin_password)
    admin_user.save()
    
    print(f"\n🔑 Contraseña del admin establecida como: {admin_password}")
    print(f"💡 Credenciales completas:")
    print(f"   Usuario: admin")
    print(f"   Contraseña: {admin_password}")
    
else:
    print("❌ Usuario admin no encontrado") 