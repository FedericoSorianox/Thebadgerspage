#!/usr/bin/env python3
"""
Script para subir imágenes de ejemplo a Cloudinary y actualizar la base de datos
"""

import requests
import cloudinary
import cloudinary.uploader
import os
import base64
from urllib.parse import urlparse

# Configuración
API_BASE = 'https://thebadgerspage.onrender.com'
USERNAME = 'federico_soriano'
PASSWORD = 'evRWh0Z7'

# Imágenes de ejemplo (URLs públicas)
SAMPLE_IMAGES = [
    {
        'nombre': 'Academia The Badgers',
        'url': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80'
    },
    {
        'nombre': 'Clase de Muay Thai',
        'url': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80'
    },
    {
        'nombre': 'Tatami de entrenamiento',
        'url': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80'
    },
    {
        'nombre': 'Academia vista general',
        'url': 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=800&q=80'
    },
    {
        'nombre': 'Academia',
        'url': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
    },
    {
        'nombre': 'Test Cloudinary',
        'url': 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80'
    },
    {
        'nombre': 'Tatami',
        'url': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80'
    },
    {
        'nombre': 'BJJ Gi',
        'url': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'
    }
]

def upload_image_to_cloudinary(image_url, nombre):
    """Subir imagen desde URL a Cloudinary"""
    try:
        # Descargar la imagen
        response = requests.get(image_url, timeout=30)
        response.raise_for_status()
        
        # Configurar Cloudinary
        cloudinary.config(
            cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
            api_key=os.environ.get('CLOUDINARY_API_KEY'),
            api_secret=os.environ.get('CLOUDINARY_API_SECRET')
        )
        
        # Subir a Cloudinary
        result = cloudinary.uploader.upload(
            response.content,
            public_id=f"galeria/{nombre}_{USERNAME}",
            resource_type="auto"
        )
        
        return result['secure_url']
    except Exception as e:
        print(f"Error subiendo {nombre}: {e}")
        return None

def update_database_item(item_id, cloudinary_url):
    """Actualizar item en la base de datos con URL de Cloudinary"""
    try:
        # Autenticación básica
        auth = base64.b64encode(f"{USERNAME}:{PASSWORD}".encode()).decode()
        
        # Llamar al endpoint de actualización
        response = requests.post(
            f"{API_BASE}/api/update-item-cloudinary/",
            headers={
                'Authorization': f'Basic {auth}',
                'Content-Type': 'application/json'
            },
            json={
                'item_id': item_id,
                'cloudinary_url': cloudinary_url
            }
        )
        
        if response.status_code == 200:
            print(f"✅ Item {item_id} actualizado con URL: {cloudinary_url}")
            return True
        else:
            print(f"❌ Error actualizando item {item_id}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error en actualización de item {item_id}: {e}")
        return False

def main():
    print("🚀 Iniciando subida de imágenes de ejemplo a Cloudinary...")
    
    # Verificar configuración de Cloudinary
    if not all([os.environ.get('CLOUDINARY_CLOUD_NAME'), 
               os.environ.get('CLOUDINARY_API_KEY'), 
               os.environ.get('CLOUDINARY_API_SECRET')]):
        print("❌ Cloudinary no está configurado correctamente")
        return
    
    print(f"📁 Configuración de Cloudinary: {os.environ.get('CLOUDINARY_CLOUD_NAME')}")
    
    # Mapeo de nombres a IDs de la base de datos (basado en los logs)
    name_to_id = {
        'Academia The Badgers': 76,
        'Clase de Muay Thai': 77,
        'Tatami de entrenamiento': 78,
        'Academia vista general': 79,
        'Academia': 80,
        'Test Cloudinary': 81,
        'Tatami': 82,
        'BJJ Gi': 83
    }
    
    # Subir cada imagen
    for i, image_data in enumerate(SAMPLE_IMAGES, 1):
        print(f"\n📸 Procesando imagen {i}/{len(SAMPLE_IMAGES)}: {image_data['nombre']}")
        
        # Subir a Cloudinary
        cloudinary_url = upload_image_to_cloudinary(image_data['url'], image_data['nombre'])
        
        if cloudinary_url:
            print(f"✅ Subida exitosa: {cloudinary_url}")
            
            # Actualizar base de datos
            item_id = name_to_id.get(image_data['nombre'])
            if item_id:
                success = update_database_item(item_id, cloudinary_url)
                if success:
                    print(f"✅ Base de datos actualizada para item {item_id}")
                else:
                    print(f"❌ Error actualizando base de datos para item {item_id}")
            else:
                print(f"⚠️ No se encontró ID para: {image_data['nombre']}")
        else:
            print(f"❌ Error subiendo imagen: {image_data['nombre']}")
    
    print(f"\n🎉 Proceso completado. {len(SAMPLE_IMAGES)} imágenes procesadas.")

if __name__ == "__main__":
    main() 