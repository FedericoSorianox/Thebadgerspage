#!/usr/bin/env python3
import os
import sys
import django

# Configurar para la base de datos de producción
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
django.setup()

from django.contrib.auth.models import User

def fix_federico_user():
    """Crear/actualizar usuario federico_soriano con contraseña conocida"""
    username = "federico_soriano"
    password = "password123"
    
    print(f"🔧 Configurando usuario {username}...")
    
    try:
        # Intentar obtener usuario existente
        user = User.objects.get(username=username)
        user.set_password(password)
        user.is_staff = True
        user.is_active = True
        user.save()
        print(f"✅ Usuario {username} actualizado exitosamente")
        print(f"   - Contraseña: {password}")
        print(f"   - Staff: {user.is_staff}")
        print(f"   - Activo: {user.is_active}")
        
    except User.DoesNotExist:
        # Crear nuevo usuario
        user = User.objects.create_user(
            username=username,
            password=password,
            is_staff=True,
            is_active=True,
            email=f"{username}@badgers.com"
        )
        print(f"✅ Usuario {username} creado exitosamente")
        print(f"   - Contraseña: {password}")
        print(f"   - Staff: {user.is_staff}")
        print(f"   - Activo: {user.is_active}")
    
    return user

def list_all_users():
    """Mostrar todos los usuarios disponibles"""
    print("\n👥 USUARIOS DISPONIBLES:")
    print("-" * 30)
    
    for user in User.objects.all():
        status = "✅" if user.is_active else "❌"
        staff = "👨‍💼" if user.is_staff else "👤"
        print(f"{status} {staff} {user.username}")
    
    print(f"\n🔑 CONTRASEÑAS ESTÁNDAR:")
    print("   Todos los usuarios: password123")

if __name__ == "__main__":
    print("🚀 ARREGLANDO USUARIO FEDERICO_SORIANO")
    print("=" * 40)
    
    try:
        fix_federico_user()
        list_all_users()
        
        print("\n🎯 AHORA PUEDES USAR:")
        print("=" * 40)
        print("👤 Usuario: federico_soriano")
        print("🔑 Contraseña: password123")
        print("🌐 Sitio: https://thebadgerspage.onrender.com")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n💡 SOLUCIÓN ALTERNATIVA:")
        print("   Usuario: admin")
        print("   Contraseña: password123")
        print("   (Este ya funciona)")
