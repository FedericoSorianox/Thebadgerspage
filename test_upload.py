#!/usr/bin/env python3
import requests
import base64
import os

# Configuración
API_BASE = 'https://thebadgerspage.onrender.com'
USERNAME = 'federico_sorianox'
PASSWORD = 'evRWh0Z7'

# Crear un archivo de prueba simple
test_file_content = b'fake image content'
with open('test_image.png', 'wb') as f:
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
    'archivo': ('test_image.png', open('test_image.png', 'rb'), 'image/png')
}
data = {
    'nombre': 'Test Image'
}

print("🚀 Probando endpoint de upload...")
print(f"URL: {API_BASE}/api/galeria/upload/")
print(f"Usuario: {USERNAME}")

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
        print("✅ Upload exitoso!")
    else:
        print("❌ Error en upload")
        
except Exception as e:
    print(f"❌ Error de conexión: {e}")

# Limpiar archivo de prueba
os.remove('test_image.png') 