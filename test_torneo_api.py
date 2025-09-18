#!/usr/bin/env python3
"""
Script de prueba para la API de torneos
"""
import requests
import json
import base64

# Configuración
API_BASE = 'http://localhost:8000'
USERNAME = 'admin'  # Cambiar según tus credenciales
PASSWORD = 'admin123'  # Cambiar según tus credenciales

def get_auth_header():
    """Obtener header de autenticación Basic"""
    credentials = base64.b64encode(f"{USERNAME}:{PASSWORD}".encode()).decode()
    return {'Authorization': f'Basic {credentials}'}

def test_crear_torneo():
    """Probar crear un torneo con categorías"""
    url = f"{API_BASE}/api/torneos/"

    torneo_data = {
        'nombre': 'Torneo de Prueba API',
        'fecha': '2025-12-15',
        'descripcion': 'Torneo creado desde script de prueba',
        'categorias': [
            {
                'id': 1,
                'nombre': 'Blanca - Hasta 70kg',
                'tipo_categoria': 'blanca',
                'peso_minimo': None,
                'peso_maximo': 70.0,
                'estado': 'abierta'
            },
            {
                'id': 2,
                'nombre': 'Azul - Hasta 80kg',
                'tipo_categoria': 'azul',
                'peso_minimo': None,
                'peso_maximo': 80.0,
                'estado': 'abierta'
            }
        ]
    }

    headers = get_auth_header()
    headers['Content-Type'] = 'application/json'

    print("Enviando datos del torneo:")
    print(json.dumps(torneo_data, indent=2))

    response = requests.post(url, json=torneo_data, headers=headers)

    print(f"\nRespuesta del servidor ({response.status_code}):")
    if response.status_code == 201:
        data = response.json()
        print("✅ Torneo creado exitosamente!")
        print(json.dumps(data, indent=2))
        return data.get('torneo', {}).get('_id')
    else:
        print("❌ Error creando torneo:")
        print(response.text)
        return None

def test_obtener_torneos():
    """Probar obtener lista de torneos"""
    url = f"{API_BASE}/api/torneos/"
    headers = get_auth_header()

    response = requests.get(url, headers=headers)

    print(f"\nObteniendo torneos ({response.status_code}):")
    if response.status_code == 200:
        data = response.json()
        torneos = data.get('torneos', [])
        print(f"✅ Encontrados {len(torneos)} torneos")

        if torneos:
            print("\nPrimer torneo:")
            torneo = torneos[0]
            print(f"Nombre: {torneo.get('nombre')}")
            print(f"Fecha: {torneo.get('fecha')}")
            categorias = torneo.get('categorias', [])
            print(f"Categorías: {len(categorias)}")
            for cat in categorias:
                print(f"  - {cat.get('nombre')} (estado: {cat.get('estado', 'N/A')})")

        return torneos
    else:
        print("❌ Error obteniendo torneos:")
        print(response.text)
        return []

if __name__ == '__main__':
    print("🚀 Probando API de torneos...")

    # Crear torneo
    torneo_id = test_crear_torneo()

    # Obtener torneos
    torneos = test_obtener_torneos()

    print("\n🏁 Prueba completada!")
