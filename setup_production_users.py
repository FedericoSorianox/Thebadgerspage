#!/usr/bin/env python3
"""
Script para configurar usuarios en producción
Configura los usuarios admin y federico_sorianox con las credenciales correctas
"""

import requests
import base64
import json

# Configuración
API_BASE = 'https://thebadgerspage.onrender.com'

def setup_users_production():
    """Configura los usuarios en producción usando la API"""
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

def test_authentication():
    """Prueba la autenticación de los usuarios"""
    print("\n🧪 Probando autenticación...")
    
    # Probar admin
    auth_admin = base64.b64encode(b'admin:admin123').decode()
    headers_admin = {'Authorization': f'Basic {auth_admin}'}
    
    try:
        response = requests.get(f'{API_BASE}/api/galeria/', headers=headers_admin)
        if response.status_code == 200:
            print("✅ Autenticación de 'admin' exitosa")
        else:
            print(f"❌ Error en autenticación de 'admin': {response.status_code}")
    except Exception as e:
        print(f"❌ Error de conexión para admin: {e}")
    
    # Probar federico_sorianox
    auth_federico = base64.b64encode(b'federico_sorianox:evRWh0Z7').decode()
    headers_federico = {'Authorization': f'Basic {auth_federico}'}
    
    try:
        response = requests.get(f'{API_BASE}/api/galeria/', headers=headers_federico)
        if response.status_code == 200:
            print("✅ Autenticación de 'federico_sorianox' exitosa")
        else:
            print(f"❌ Error en autenticación de 'federico_sorianox': {response.status_code}")
    except Exception as e:
        print(f"❌ Error de conexión para federico_sorianox: {e}")

if __name__ == "__main__":
    setup_users_production()
    test_authentication() 