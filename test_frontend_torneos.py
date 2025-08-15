#!/usr/bin/env python3
"""
Script para probar que el frontend cargue correctamente los datos de torneos
"""

import requests
import time
import json

def test_api_direct():
    """Probar la API directamente"""
    print("🔍 Probando API directamente...")
    try:
        response = requests.get(
            'https://thebadgerspage.onrender.com/api/torneo/torneos/',
            headers={
                'Origin': 'https://the-badgers.com',
                'Accept': 'application/json'
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API responde OK - {data['count']} torneos encontrados")
            for torneo in data['results']:
                print(f"   📅 {torneo['nombre']} - {torneo['estado']}")
            return True
        else:
            print(f"❌ API falló: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error en API: {e}")
        return False

def test_frontend_loads():
    """Probar que el frontend cargue"""
    print("\n🌐 Probando que el frontend cargue...")
    try:
        response = requests.get('https://the-badgers.com/torneo')
        if response.status_code == 200:
            content = response.text
            if 'TorneoDashboard' in content or 'torneo' in content.lower():
                print("✅ Frontend parece estar cargando correctamente")
                return True
            else:
                print("⚠️ Frontend carga pero no se ve contenido de torneos")
                return False
        else:
            print(f"❌ Frontend falló: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error cargando frontend: {e}")
        return False

def check_cors_preflight():
    """Verificar preflight CORS"""
    print("\n🛡️ Probando preflight CORS...")
    try:
        response = requests.options(
            'https://thebadgerspage.onrender.com/api/torneo/torneos/',
            headers={
                'Origin': 'https://the-badgers.com',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        )
        
        if response.status_code == 200:
            cors_headers = {
                'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
                'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
                'access-control-allow-headers': response.headers.get('access-control-allow-headers')
            }
            print("✅ Preflight CORS OK")
            for header, value in cors_headers.items():
                print(f"   {header}: {value}")
            return True
        else:
            print(f"❌ Preflight falló: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error en preflight: {e}")
        return False

def main():
    print("🚀 Probando configuración completa de torneos...\n")
    
    # Probar todos los componentes
    api_ok = test_api_direct()
    cors_ok = check_cors_preflight() 
    frontend_ok = test_frontend_loads()
    
    print("\n" + "="*50)
    print("📊 RESUMEN:")
    print(f"   API: {'✅' if api_ok else '❌'}")
    print(f"   CORS: {'✅' if cors_ok else '❌'}")
    print(f"   Frontend: {'✅' if frontend_ok else '❌'}")
    
    if all([api_ok, cors_ok, frontend_ok]):
        print("\n🎉 ¡Todo parece estar funcionando correctamente!")
        print("💡 Si aún hay problemas, puede ser cache del navegador.")
        print("   Prueba Ctrl+Shift+R o modo incógnito")
    else:
        print("\n⚠️ Hay problemas que necesitan atención")
    
    print("="*50)

if __name__ == '__main__':
    main()
