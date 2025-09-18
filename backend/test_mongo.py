#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from core.models import crear_torneo, obtener_torneos

print("🧪 Probando funciones MongoDB...")

# Probar crear torneo
print("\n1. Creando torneo...")
torneo_data = {
    'nombre': 'Torneo Test Directo',
    'fecha': '2025-12-15',
    'descripcion': 'Test directo desde script',
    'estado': 'planificado',
    'categorias': [
        {
            'id': 1,
            'nombre': 'Blanca - Hasta 70kg',
            'tipo_categoria': 'blanca',
            'peso_minimo': None,
            'peso_maximo': 70.0,
            'estado': 'abierta'
        }
    ]
}

result = crear_torneo(
    torneo_data['nombre'],
    torneo_data['fecha'],
    torneo_data['descripcion'],
    torneo_data['estado'],
    torneo_data['categorias']
)

print(f"Resultado crear_torneo: {result}")

# Probar obtener torneos
print("\n2. Obteniendo torneos...")
torneos = obtener_torneos()
print(f"Torneos encontrados: {len(torneos)}")
if torneos:
    print("Primer torneo:", torneos[0])

print("\n✅ Prueba completada!")
