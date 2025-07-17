#!/usr/bin/env python3
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.append('/Users/fede/Thebadgerspage/backend')
django.setup()

from django.contrib.auth.models import User

print("👥 Usuarios en la base de datos:")
for user in User.objects.all():
    print(f"  - {user.username} (ID: {user.id})")
    print(f"    Email: {user.email}")
    print(f"    Activo: {user.is_active}")
    print(f"    Staff: {user.is_staff}")
    print(f"    Superuser: {user.is_superuser}")
    print() 