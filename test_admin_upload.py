#!/usr/bin/env python3
import requests
import base64
import os

# Configuración
API_BASE = 'https://thebadgerspage.onrender.com'
USERNAME = 'admin'
PASSWORD = 'admin123'

# Crear un archivo de prueba simple
test_file_content = b'fake image content for admin test'
with open('test_admin_image.png', 'wb') as f:
    f.write(test_file_content)

# Autenticación
auth_string = f"{USERNAME}:{PASSWORD}"
auth_bytes = auth_string.encode('ascii')
auth_b64 = base64.b64encode(auth_bytes).decode('ascii')

# Headers
headers = {
    'Authorization': f'Basic {auth_b64}',
    'Accept': '*/*'
}

# Datos del formulario
files = {
    'archivo': ('test_admin_image.png', open('test_admin_image.png', 'rb'), 'image/png')
}
data = {
    'nombre': 'Test Admin Upload'
}

print("🚀 Probando upload con usuario admin...")
print(f"URL: {API_BASE}/api/galeria/upload/")
print(f"Usuario: {USERNAME}")
print(f"Auth Header: Basic {auth_b64}")

try:
    response = requests.post(
        f'{API_BASE}/api/galeria/upload/',
        headers=headers,
        files=files,
        data=data
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Upload exitoso con admin!")
    else:
        print("❌ Error en upload con admin")
        
except Exception as e:
    print(f"❌ Error de conexión: {e}")

# Limpiar archivo de prueba
os.remove('test_admin_image.png') 