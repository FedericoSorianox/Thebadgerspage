#!/usr/bin/env python3
"""
Script para configurar usuarios en la base de datos compartida
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from django.contrib.auth import authenticate

def setup_shared_users():
    """Configura las contraseñas de los usuarios en la base de datos compartida"""
    print("🔧 Configurando usuarios en la base de datos compartida...")
    
    # Listar usuarios existentes
    print("\n📋 Usuarios existentes:")
    for user in User.objects.all():
        print(f"  - {user.username} (ID: {user.id})")
    
    # Configurar admin
    try:
        admin_user = User.objects.get(username='admin')
        admin_user.set_password('admin123')
        admin_user.save()
        print("✅ Contraseña de 'admin' configurada: admin123")
    except User.DoesNotExist:
        print("❌ Usuario 'admin' no encontrado")
    
    # Configurar federico_soriano
    try:
        federico_user = User.objects.get(username='federico_soriano')
        federico_user.set_password('evRWh0Z7')
        federico_user.save()
        print("✅ Contraseña de 'federico_soriano' configurada: evRWh0Z7")
    except User.DoesNotExist:
        print("❌ Usuario 'federico_soriano' no encontrado")
    
    # Verificar autenticación
    print("\n🔍 Verificando autenticación...")
    
    # Probar admin
    admin_auth = authenticate(username='admin', password='admin123')
    if admin_auth:
        print("✅ Autenticación de 'admin' exitosa")
    else:
        print("❌ Error en autenticación de 'admin'")
    
    # Probar federico_soriano
    federico_auth = authenticate(username='federico_soriano', password='evRWh0Z7')
    if federico_auth:
        print("✅ Autenticación de 'federico_soriano' exitosa")
    else:
        print("❌ Error en autenticación de 'federico_soriano'")
    
    print("\n🎯 Usuarios configurados en la base de datos compartida!")
    print("   Ahora pueden autenticarse en ambos sistemas.")

if __name__ == "__main__":
    setup_shared_users() 