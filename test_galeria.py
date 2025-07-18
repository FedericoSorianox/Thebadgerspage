#!/usr/bin/env python3
"""
Script para probar la galería y ver qué está pasando
"""

import requests
import json

def test_galeria():
    print("🧪 Probando la galería...")
    
    try:
        response = requests.get('https://thebadgerspage.onrender.com/api/galeria/')
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API respondió correctamente con {len(data)} items")
            
            for i, item in enumerate(data):
                print(f"\n📸 Item {i+1}:")
                print(f"   ID: {item['id']}")
                print(f"   Nombre: {item['nombre']}")
                print(f"   URL: {item['url']}")
                print(f"   Tipo: {item['tipo']}")
                print(f"   Usuario: {item['usuario']}")
                
                # Verificar si la URL es local o externa
                if item['url'].startswith('http'):
                    if 'thebadgerspage.onrender.com' in item['url']:
                        print(f"   ⚠️ URL local (puede no funcionar)")
                    else:
                        print(f"   ✅ URL externa (debería funcionar)")
                else:
                    print(f"   ❌ URL relativa (no funcionará)")
        else:
            print(f"❌ Error en la API: {response.status_code}")
            print(f"Respuesta: {response.text}")
            
    except Exception as e:
        print(f"❌ Error al probar la galería: {e}")

if __name__ == "__main__":
    test_galeria() 