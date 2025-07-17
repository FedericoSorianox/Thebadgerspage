#!/usr/bin/env python3
"""
Script de prueba para verificar la subida de archivos a la galería
"""

import requests
import base64
import os
from pathlib import Path

# Configuración
API_BASE = 'https://thebadgerspage.onrender.com'
USERNAME = 'federico_sorianox'
PASSWORD = 'evRWh0Z7'

def test_upload():
    """Prueba la subida de un archivo a la galería"""
    
    # Crear autenticación básica
    auth_string = f"{USERNAME}:{PASSWORD}"
    auth_bytes = auth_string.encode('utf-8')
    auth_b64 = base64.b64encode(auth_bytes).decode('utf-8')
    
    # Buscar una imagen de prueba
    sample_images_dir = Path('sample_images')
    if not sample_images_dir.exists():
        print("❌ No se encontró el directorio sample_images")
        return
    
    image_files = list(sample_images_dir.glob('*.jpg')) + list(sample_images_dir.glob('*.png'))
    if not image_files:
        print("❌ No se encontraron imágenes de prueba")
        return
    
    test_image = image_files[0]
    print(f"📁 Usando imagen de prueba: {test_image}")
    
    # Preparar datos para la subida
    url = f"{API_BASE}/api/galeria/upload/"
    headers = {
        'Authorization': f'Basic {auth_b64}',
        'Accept': '*/*'
    }
    
    # Crear FormData
    with open(test_image, 'rb') as f:
        files = {
            'archivo': (test_image.name, f, 'image/jpeg'),
            'nombre': (None, 'Prueba de subida')
        }
        
        print(f"🚀 Enviando petición a: {url}")
        print(f"📊 Tamaño del archivo: {test_image.stat().st_size} bytes")
        
        try:
            response = requests.post(url, headers=headers, files=files)
            
            print(f"📡 Status Code: {response.status_code}")
            print(f"📡 Headers de respuesta: {dict(response.headers)}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Subida exitosa: {data}")
            else:
                print(f"❌ Error en la subida:")
                print(f"   Status: {response.status_code}")
                print(f"   Respuesta: {response.text}")
                
        except Exception as e:
            print(f"❌ Error de conexión: {e}")

def test_galeria_list():
    """Prueba obtener la lista de la galería"""
    
    url = f"{API_BASE}/api/galeria/"
    print(f"📋 Obteniendo lista de galería: {url}")
    
    try:
        response = requests.get(url)
        print(f"📡 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Lista obtenida: {len(data)} elementos")
            for item in data:
                print(f"   - {item['nombre']} ({item['tipo']})")
        else:
            print(f"❌ Error al obtener lista: {response.text}")
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")

if __name__ == "__main__":
    print("🧪 Iniciando pruebas de galería...")
    print("=" * 50)
    
    print("\n1️⃣ Probando lista de galería:")
    test_galeria_list()
    
    print("\n2️⃣ Probando subida de archivo:")
    test_upload()
    
    print("\n✅ Pruebas completadas") 