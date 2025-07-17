#!/usr/bin/env python3
import requests
import base64

# Configuración
API_BASE = 'https://thebadgerspage.onrender.com'
USERNAME = 'federico_sorianox'
PASSWORD = 'evRWh0Z7'

# Autenticación
auth_string = f"{USERNAME}:{PASSWORD}"
auth_bytes = auth_string.encode('ascii')
auth_b64 = base64.b64encode(auth_bytes).decode('ascii')

# Headers
headers = {
    'Authorization': f'Basic {auth_b64}',
    'Accept': '*/*'
}

print("🔐 Probando autenticación...")
print(f"URL: {API_BASE}/api/galeria/")
print(f"Usuario: {USERNAME}")
print(f"Auth Header: Basic {auth_b64}")

try:
    response = requests.get(
        f'{API_BASE}/api/galeria/',
        headers=headers
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:200]}...")
    
    if response.status_code == 200:
        print("✅ Autenticación exitosa!")
    else:
        print("❌ Error en autenticación")
        
except Exception as e:
    print(f"❌ Error de conexión: {e}") 