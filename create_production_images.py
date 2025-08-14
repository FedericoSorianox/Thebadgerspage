#!/usr/bin/env python3

import os
import sys
import django
import requests
from django.core.files.base import ContentFile

# Configurar Django
sys.path.append('/Users/fede/Thebadgerspage/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings_production')
django.setup()

from core.models import GaleriaItem

print("🔧 CREATING SAMPLE IMAGES FOR PRODUCTION")
print("========================================")
print()

# URLs de imágenes de ejemplo (de Lorem Picsum en lugar de Unsplash)
sample_images = [
    {
        'nombre': 'BJJ Training 1',
        'url': 'https://picsum.photos/800/600?random=1'
    },
    {
        'nombre': 'BJJ Competition',
        'url': 'https://picsum.photos/800/600?random=2'
    },
    {
        'nombre': 'Academy Group',
        'url': 'https://picsum.photos/800/600?random=3'
    },
    {
        'nombre': 'Belt Promotion',
        'url': 'https://picsum.photos/800/600?random=4'
    },
    {
        'nombre': 'Seminar Day',
        'url': 'https://picsum.photos/800/600?random=5'
    }
]

# Limpiar imágenes existentes
print("🧹 Cleaning existing images...")
GaleriaItem.objects.all().delete()

# Crear nuevas imágenes
print("📸 Creating sample images...")
for i, img_data in enumerate(sample_images):
    try:
        # Crear el objeto GaleriaItem directamente con la URL
        item = GaleriaItem.objects.create(
            nombre=img_data['nombre'],
            archivo=img_data['url']  # Guardar la URL directamente
        )
        print(f"✅ Created: {item.nombre} (ID: {item.id})")
        
    except Exception as e:
        print(f"❌ Error creating {img_data['nombre']}: {e}")

print()
print("📊 Final count:")
total = GaleriaItem.objects.count()
print(f"Total images in database: {total}")

print()
print("🌐 Test the gallery:")
print("https://the-badgers.com/galeria")
print()
print("🔍 API endpoint:")
print("https://thebadgerspage.onrender.com/api/galeria/")
