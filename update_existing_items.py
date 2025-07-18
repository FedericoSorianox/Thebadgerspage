#!/usr/bin/env python3
"""
Script para actualizar items existentes con URLs de ejemplo de Cloudinary
"""

import requests
import base64
import json

# Configuración
API_BASE = 'https://thebadgerspage.onrender.com'
USERNAME = 'federico_soriano'
PASSWORD = 'evRWh0Z7'

# URLs de ejemplo de Cloudinary (imágenes de artes marciales)
CLOUDINARY_URLS = [
    'https://res.cloudinary.com/dczcabe7j/image/upload/v1752862265/galeria/academia_the_badgers.jpg',
    'https://res.cloudinary.com/dczcabe7j/image/upload/v1752862265/galeria/clase_muay_thai.jpg',
    'https://res.cloudinary.com/dczcabe7j/image/upload/v1752862265/galeria/tatami_entrenamiento.jpg',
    'https://res.cloudinary.com/dczcabe7j/image/upload/v1752862265/galeria/academia_vista_general.jpg',
    'https://res.cloudinary.com/dczcabe7j/image/upload/v1752862265/galeria/academia.jpg',
    'https://res.cloudinary.com/dczcabe7j/image/upload/v1752862265/galeria/test_cloudinary.jpg',
    'https://res.cloudinary.com/dczcabe7j/image/upload/v1752862265/galeria/tatami.jpg',
    'https://res.cloudinary.com/dczcabe7j/image/upload/v1752862265/galeria/bjj_gi.jpg'
]

# IDs de los items existentes (basado en los logs)
ITEM_IDS = [76, 77, 78, 79, 80, 81, 82, 83]

def update_item(item_id, cloudinary_url):
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
    print("🚀 Iniciando actualización de items existentes con URLs de Cloudinary...")
    
    # Verificar que tenemos la misma cantidad de IDs y URLs
    if len(ITEM_IDS) != len(CLOUDINARY_URLS):
        print(f"❌ Error: Cantidad de IDs ({len(ITEM_IDS)}) no coincide con URLs ({len(CLOUDINARY_URLS)})")
        return
    
    # Actualizar cada item
    success_count = 0
    for i, (item_id, cloudinary_url) in enumerate(zip(ITEM_IDS, CLOUDINARY_URLS), 1):
        print(f"\n📸 Procesando item {i}/{len(ITEM_IDS)}: ID {item_id}")
        
        success = update_item(item_id, cloudinary_url)
        if success:
            success_count += 1
    
    print(f"\n🎉 Proceso completado. {success_count}/{len(ITEM_IDS)} items actualizados exitosamente.")
    
    if success_count == len(ITEM_IDS):
        print("✅ Todos los items fueron actualizados correctamente.")
        print("🖼️ Las imágenes ahora deberían mostrarse correctamente en la galería.")
    else:
        print("⚠️ Algunos items no pudieron ser actualizados.")

if __name__ == "__main__":
    main() 