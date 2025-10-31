#!/usr/bin/env python3
"""
Script para probar el upload con Cloudinary configurado (simulado)
"""

import requests
import json
import os
from io import BytesIO

# Configuración
BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/api/auth/login/"
UPLOAD_URL = f"{BASE_URL}/api/galeria/upload/"

def create_test_image():
    """Crear una imagen de prueba pequeña"""
    try:
        from PIL import Image
        
        # Crear una imagen de 100x100 píxeles de color azul
        img = Image.new('RGB', (100, 100), color='blue')
        
        # Guardar en un buffer en memoria
        img_buffer = BytesIO()
        img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        return img_buffer
    except Exception as e:
        print(f"⚠️ No se pudo crear imagen con PIL: {e}")
        # Crear un archivo de texto como fallback
        return BytesIO(b"Test image content for cloudinary")

def test_cloudinary_config():
    """Probar la configuración de Cloudinary"""
    print("🌤️ Verificando configuración de Cloudinary...")
    
    response = requests.get(f"{BASE_URL}/api/debug/cloudinary/")
    if response.status_code == 200:
        config = response.json()
        print(f"   Cloudinary disponible: {config['cloudinary_available']}")
        print(f"   Cloudinary configurado: {config['cloudinary_configured']}")
        print(f"   Cloud name: {config['cloud_name']}")
        print(f"   Tiene API key: {config['has_api_key']}")
        print(f"   Tiene API secret: {config['has_api_secret']}")
        
        if not config['cloudinary_configured']:
            print("\n⚠️ Para probar con Cloudinary, necesitas configurar:")
            print("   export CLOUDINARY_CLOUD_NAME='tu_cloud_name'")
            print("   export CLOUDINARY_API_KEY='tu_api_key'")
            print("   export CLOUDINARY_API_SECRET='tu_api_secret'")
            print("\n📋 Sin estas variables, se usará almacenamiento local (que también funciona)")
    else:
        print(f"❌ Error verificando configuración: {response.text}")

def test_upload_without_cloudinary():
    """Probar upload sin Cloudinary (almacenamiento local)"""
    print("\n🧪 Test de upload SIN Cloudinary (almacenamiento local)...")
    
    # 1. Login como admin
    print("\n1️⃣ Intentando login...")
    login_data = {
        'username': 'admin',
        'password': 'badgers2024!'
    }
    
    login_response = requests.post(LOGIN_URL, json=login_data)
    if login_response.status_code != 200:
        print(f"❌ Error en login: {login_response.text}")
        return
    
    token = login_response.json()['token']
    print(f"✅ Login exitoso")
    
    # 2. Upload imagen
    print("\n2️⃣ Subiendo imagen...")
    img_buffer = create_test_image()
    
    headers = {'Authorization': f'Token {token}'}
    files = {'archivo': ('test_local.png', img_buffer, 'image/png')}
    data = {'nombre': 'Test Local Storage'}
    
    upload_response = requests.post(UPLOAD_URL, headers=headers, files=files, data=data)
    print(f"Upload status: {upload_response.status_code}")
    
    if upload_response.status_code == 200:
        result = upload_response.json()
        print(f"✅ Upload local exitoso!")
        print(f"   ID: {result.get('id')}")
        print(f"   URL: {result.get('url')}")
        print(f"   Nombre: {result.get('nombre')}")
        
        # Verificar que la URL no sea de Cloudinary
        url = result.get('url', '')
        if 'cloudinary.com' in url:
            print(f"⚠️ ADVERTENCIA: URL parece ser de Cloudinary cuando debería ser local")
        else:
            print(f"✅ Confirmado: usando almacenamiento local")
    else:
        print(f"❌ Error en upload: {upload_response.text}")

if __name__ == "__main__":
    test_cloudinary_config()
    test_upload_without_cloudinary()
