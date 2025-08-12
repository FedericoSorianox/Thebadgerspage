#!/usr/bin/env python3
"""
Script para crear usuario federico_soriano con contraseña conocida
Y migrar imágenes a Cloudinary
"""
import os
import sys
import django

# Configurar Django usando la base de datos del backend (que debe ser la misma que en producción)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.append('/Users/fede/Thebadgerspage/backend')
django.setup()

from django.contrib.auth.models import User

def create_or_update_user():
    """Crear o actualizar usuario federico_soriano"""
    username = "federico_soriano"
    password = "password123"
    
    try:
        # Intentar obtener el usuario existente
        user = User.objects.get(username=username)
        user.set_password(password)
        user.is_staff = True  # Asegurar que tenga permisos
        user.is_active = True
        user.save()
        print(f"✅ Usuario {username} actualizado con nueva contraseña")
    except User.DoesNotExist:
        # Crear nuevo usuario
        user = User.objects.create_user(
            username=username,
            password=password,
            is_staff=True,
            is_active=True,
            is_superuser=False  # No necesita ser superuser, solo staff
        )
        print(f"✅ Usuario {username} creado exitosamente")
    
    return user

def setup_sample_images():
    """Cargar algunas imágenes de ejemplo"""
    from core.models import GaleriaItem
    from datetime import datetime
    
    # URLs de imágenes de ejemplo que sabemos que funcionan
    sample_images = [
        {
            'nombre': 'Academia The Badgers - Vista General',
            'archivo': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
            'tipo': 'img',
            'usuario': User.objects.get(username='federico_soriano')
        },
        {
            'nombre': 'Entrenamiento de BJJ',
            'archivo': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
            'tipo': 'img', 
            'usuario': User.objects.get(username='federico_soriano')
        },
        {
            'nombre': 'Muay Thai Training',
            'archivo': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
            'tipo': 'img',
            'usuario': User.objects.get(username='federico_soriano')
        }
    ]
    
    print("📸 Agregando imágenes de ejemplo...")
    for img_data in sample_images:
        # Verificar si ya existe
        existing = GaleriaItem.objects.filter(nombre=img_data['nombre']).first()
        if not existing:
            item = GaleriaItem.objects.create(**img_data)
            print(f"✅ Imagen agregada: {item.nombre}")
        else:
            print(f"⚠️  Imagen ya existe: {img_data['nombre']}")

if __name__ == "__main__":
    print("🚀 CONFIGURANDO SISTEMA PARA FEDERICO")
    print("=" * 40)
    
    try:
        user = create_or_update_user()
        setup_sample_images()
        
        print("\n✅ CONFIGURACIÓN COMPLETADA")
        print("=" * 40)
        print(f"🔐 Usuario: federico_soriano")
        print(f"🔑 Contraseña: password123")
        print(f"👤 Permisos: Staff = {user.is_staff}")
        print(f"✨ Estado: Activo = {user.is_active}")
        print("\n🌐 Ahora puedes hacer login en:")
        print("   - https://thebadgerspage.onrender.com/galeria")
        print("   - https://thebadgerspage.onrender.com/torneo")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Asegúrate de que Django esté configurado correctamente")
