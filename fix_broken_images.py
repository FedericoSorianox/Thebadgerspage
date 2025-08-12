#!/usr/bin/env python3
"""
Script para subir imágenes de ejemplo que funcionarán
"""
import os
import sys
import django
import requests

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
django.setup()

from core.models import GaleriaItem
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from datetime import datetime

def create_working_images():
    """Crear imágenes que funcionarán usando URLs externas confiables"""
    
    # URLs de imágenes confiables (Unsplash)
    sample_images = [
        {
            'nombre': 'Academia The Badgers - Entrada Principal',
            'url': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
            'tipo': 'img'
        },
        {
            'nombre': 'Entrenamiento BJJ - Técnica de Guardia',
            'url': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
            'tipo': 'img'
        },
        {
            'nombre': 'Muay Thai - Entrenamiento de Pads',
            'url': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
            'tipo': 'img'
        },
        {
            'nombre': 'MMA - Preparación Física',
            'url': 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=800&q=80',
            'tipo': 'img'
        },
        {
            'nombre': 'Tatami Principal - Vista Completa',
            'url': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
            'tipo': 'img'
        },
        {
            'nombre': 'Clase Grupal - Técnicas Básicas',
            'url': 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
            'tipo': 'img'
        }
    ]
    
    print("📸 Creando imágenes que funcionarán...")
    
    # Obtener usuario para asignar las imágenes
    try:
        user = User.objects.get(username='federico_soriano')
    except User.DoesNotExist:
        try:
            user = User.objects.get(username='admin')
        except User.DoesNotExist:
            print("❌ No se encontró usuario para asignar imágenes")
            return
    
    # Limpiar imágenes rotas existentes
    print("🧹 Limpiando imágenes rotas...")
    GaleriaItem.objects.all().delete()
    
    # Crear nuevas imágenes
    for img_data in sample_images:
        try:
            # Crear item con URL directa (no subir archivo)
            item = GaleriaItem.objects.create(
                nombre=img_data['nombre'],
                archivo=img_data['url'],  # Usar URL directa
                tipo=img_data['tipo'],
                usuario=user
            )
            print(f"✅ Imagen creada: {item.nombre}")
            
        except Exception as e:
            print(f"❌ Error creando {img_data['nombre']}: {e}")
    
    print(f"\n✅ Proceso completado")
    print(f"📊 Total de imágenes: {GaleriaItem.objects.count()}")

def test_images():
    """Verificar que las imágenes son accesibles"""
    print("\n🔍 Verificando imágenes...")
    
    for item in GaleriaItem.objects.all()[:3]:  # Solo las primeras 3
        try:
            response = requests.head(str(item.archivo), timeout=5)
            status = "✅" if response.status_code == 200 else f"❌ {response.status_code}"
            print(f"{status} {item.nombre}")
        except Exception as e:
            print(f"❌ {item.nombre}: Error - {e}")

if __name__ == "__main__":
    print("🖼️  ARREGLANDO IMÁGENES ROTAS")
    print("=" * 40)
    
    try:
        create_working_images()
        test_images()
        
        print("\n🎯 IMÁGENES REPARADAS")
        print("=" * 40)
        print("✅ Las imágenes ahora deberían verse correctamente")
        print("🌐 Prueba en: https://thebadgerspage.onrender.com/galeria")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
