#!/usr/bin/env python3
import requests

# Configuración
API_BASE = 'https://thebadgerspage.onrender.com'

print("🔧 Configurando usuarios en producción...")
print(f"URL: {API_BASE}/api/usuarios/setup/")

try:
    response = requests.post(f'{API_BASE}/api/usuarios/setup/')
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Usuarios configurados exitosamente!")
        print("\n🔑 Credenciales disponibles:")
        print("   Usuario: admin")
        print("   Contraseña: admin123")
        print("\n   Usuario: federico_sorianox")
        print("   Contraseña: evRWh0Z7")
    else:
        print("❌ Error al configurar usuarios")
        
except Exception as e:
    print(f"❌ Error de conexión: {e}") 