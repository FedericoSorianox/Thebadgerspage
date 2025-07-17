#!/usr/bin/env python3
import requests
import json

# Configuración
API_BASE = 'https://thebadgerspage.onrender.com'

print("👤 Creando usuario en producción...")

# Crear usuario federico_sorianox
user_data = {
    'username': 'federico_sorianox',
    'password': 'evRWh0Z7'
}

try:
    response = requests.post(
        f'{API_BASE}/api/usuarios/crear/',
        headers={'Content-Type': 'application/json'},
        data=json.dumps(user_data)
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Usuario federico_sorianox creado exitosamente!")
        print("\n🔑 Credenciales:")
        print("   Usuario: federico_sorianox")
        print("   Contraseña: evRWh0Z7")
    else:
        print("❌ Error al crear usuario")
        
except Exception as e:
    print(f"❌ Error de conexión: {e}") 