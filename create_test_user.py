#!/usr/bin/env python3
"""
Script para crear un usuario de prueba y verificar la autenticación
"""

import requests
import base64
import json

# Configuración
API_BASE = 'https://thebadgerspage.onrender.com'
TEST_USERNAME = 'test_user'
TEST_PASSWORD = 'test123456'

def create_test_user():
    """Crea un usuario de prueba"""
    
    url = f"{API_BASE}/api/usuarios/crear/"
    data = {
        'username': TEST_USERNAME,
        'password': TEST_PASSWORD
    }
    
    print(f"👤 Creando usuario de prueba: {TEST_USERNAME}")
    
    try:
        response = requests.post(url, json=data)
        print(f"📡 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Usuario creado exitosamente: {result}")
            return True
        else:
            print(f"❌ Error al crear usuario: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def test_authentication():
    """Prueba la autenticación del usuario"""
    
    # Crear autenticación básica
    auth_string = f"{TEST_USERNAME}:{TEST_PASSWORD}"
    auth_bytes = auth_string.encode('utf-8')
    auth_b64 = base64.b64encode(auth_bytes).decode('utf-8')
    
    url = f"{API_BASE}/api/galeria/"
    headers = {
        'Authorization': f'Basic {auth_b64}',
        'Accept': '*/*'
    }
    
    print(f"🔐 Probando autenticación para usuario: {TEST_USERNAME}")
    
    try:
        response = requests.get(url, headers=headers)
        print(f"📡 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Autenticación exitosa")
            return True
        else:
            print(f"❌ Error de autenticación: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def test_upload_with_test_user():
    """Prueba la subida con el usuario de prueba"""
    
    # Crear autenticación básica
    auth_string = f"{TEST_USERNAME}:{TEST_PASSWORD}"
    auth_bytes = auth_string.encode('utf-8')
    auth_b64 = base64.b64encode(auth_bytes).decode('utf-8')
    
    # Crear una imagen de prueba simple (1x1 pixel PNG)
    png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf5\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
    
    url = f"{API_BASE}/api/galeria/upload/"
    headers = {
        'Authorization': f'Basic {auth_b64}',
        'Accept': '*/*'
    }
    
    # Crear FormData
    files = {
        'archivo': ('test.png', png_data, 'image/png'),
        'nombre': (None, 'Imagen de prueba')
    }
    
    print(f"📤 Probando subida con usuario de prueba")
    
    try:
        response = requests.post(url, headers=headers, files=files)
        print(f"📡 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Subida exitosa: {data}")
            return True
        else:
            print(f"❌ Error en la subida: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Iniciando pruebas de usuario...")
    print("=" * 50)
    
    print("\n1️⃣ Creando usuario de prueba:")
    if create_test_user():
        print("\n2️⃣ Probando autenticación:")
        if test_authentication():
            print("\n3️⃣ Probando subida de archivo:")
            test_upload_with_test_user()
    
    print(f"\n📋 Credenciales de prueba:")
    print(f"   Usuario: {TEST_USERNAME}")
    print(f"   Contraseña: {TEST_PASSWORD}")
    print(f"   Auth Header: Basic {base64.b64encode(f'{TEST_USERNAME}:{TEST_PASSWORD}'.encode()).decode()}")
    
    print("\n✅ Pruebas completadas") 