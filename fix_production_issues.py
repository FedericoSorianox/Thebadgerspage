#!/usr/bin/env python3
"""
Script para arreglar usuarios y verificar configuración en producción
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.append('/Users/fede/Thebadgerspage/backend')
django.setup()

from django.contrib.auth.models import User

def fix_user_passwords():
    """Cambiar contraseñas de usuarios para que sean conocidas"""
    print("🔧 Arreglando contraseñas de usuarios...")
    
    # Lista de usuarios a actualizar
    users_to_fix = [
        ('admin', 'password123'),
        ('federico_soriano', 'password123'),
        ('federico_sorianox', 'password123'),
        ('instructor', 'password123'),
        ('testuser', 'password123'),
        ('alumno', 'password123')
    ]
    
    for username, password in users_to_fix:
        try:
            user = User.objects.get(username=username)
            user.set_password(password)
            user.save()
            print(f"✅ {username}: contraseña actualizada")
        except User.DoesNotExist:
            print(f"⚠️  {username}: usuario no existe")
    
    print(f"\n🎯 Usuarios disponibles para login:")
    for user in User.objects.all():
        print(f"   - {user.username}:password123")

def check_media_settings():
    """Verificar configuración de archivos media"""
    print("\n📁 Verificando configuración de archivos media...")
    from django.conf import settings
    
    print(f"DEBUG: {settings.DEBUG}")
    print(f"MEDIA_URL: {settings.MEDIA_URL}")
    print(f"MEDIA_ROOT: {settings.MEDIA_ROOT}")
    print(f"STATIC_URL: {settings.STATIC_URL}")
    print(f"STATIC_ROOT: {settings.STATIC_ROOT}")
    
    # Verificar si hay archivos en MEDIA_ROOT
    if os.path.exists(settings.MEDIA_ROOT):
        print(f"📂 Archivos en MEDIA_ROOT:")
        for root, dirs, files in os.walk(settings.MEDIA_ROOT):
            for file in files[:5]:  # Solo mostrar los primeros 5
                print(f"   - {os.path.join(root, file)}")
    else:
        print("❌ MEDIA_ROOT no existe")

if __name__ == "__main__":
    print("🚀 ARREGLANDO PROBLEMAS DE PRODUCCIÓN")
    print("=" * 40)
    
    fix_user_passwords()
    check_media_settings()
    
    print("\n✅ ARREGLOS COMPLETADOS")
    print("Ahora puedes usar:")
    print("- Usuario: federico_soriano")  
    print("- Contraseña: password123")
    print("- O cualquier otro usuario con password123")
