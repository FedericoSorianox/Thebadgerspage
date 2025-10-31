#!/usr/bin/env python3
"""
Script para probar el upload de imágenes a la galería
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
    from PIL import Image
    
    # Crear una imagen de 100x100 píxeles de color rojo
    img = Image.new('RGB', (100, 100), color='red')
    
    # Guardar en un buffer en memoria
    img_buffer = BytesIO()
    img.save(img_buffer, format='PNG')
    img_buffer.seek(0)
    
    return img_buffer

def test_upload():
    """Probar el upload de una imagen"""
    print("🧪 Iniciando test de upload de imagen...")
    
    # 1. Login como admin
    print("\n1️⃣ Intentando login...")
    login_data = {
        'username': 'admin',
        'password': 'badgers2024!'
    }
    
    login_response = requests.post(LOGIN_URL, json=login_data)
    print(f"Login status: {login_response.status_code}")
    
    if login_response.status_code != 200:
        print(f"❌ Error en login: {login_response.text}")
        return
    
    login_result = login_response.json()
    token = login_result['token']
    print(f"✅ Login exitoso. Token: {token[:20]}...")
    
    # 2. Crear imagen de prueba
    print("\n2️⃣ Creando imagen de prueba...")
    try:
        img_buffer = create_test_image()
        print("✅ Imagen de prueba creada")
    except Exception as e:
        print(f"❌ Error creando imagen: {e}")
        # Crear un archivo de texto como fallback
        img_buffer = BytesIO(b"Test image content")
    
    # 3. Upload de la imagen
    print("\n3️⃣ Subiendo imagen...")
    
    headers = {
        'Authorization': f'Token {token}'
    }
    
    files = {
        'archivo': ('test_image.png', img_buffer, 'image/png')
    }
    
    data = {
        'nombre': 'Imagen de prueba'
    }
    
    upload_response = requests.post(UPLOAD_URL, headers=headers, files=files, data=data)
    print(f"Upload status: {upload_response.status_code}")
    print(f"Upload response: {upload_response.text}")
    
    if upload_response.status_code == 200:
        result = upload_response.json()
        print(f"✅ Upload exitoso!")
        print(f"   ID: {result.get('id')}")
        print(f"   URL: {result.get('url')}")
        print(f"   Nombre: {result.get('nombre')}")
    else:
        print(f"❌ Error en upload: {upload_response.text}")

if __name__ == "__main__":
    test_upload()
