#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from core.models import GaleriaItem
from django.core.files import File

def load_sample_images():
    """Cargar imágenes de ejemplo en la base de datos"""
    
    # Limpiar galería existente
    GaleriaItem.objects.all().delete()
    print("Galería limpiada")
    
    # Nombres para las imágenes
    nombres = [
        "Academia The Badgers - Tatami",
        "Entrenamiento de Martes",
        "BJJ - Brazilian Jiu-Jitsu",
        "No-Gi Training",
        "Nico en acción",
        "MMA - Muay Thai",
        "Entrenamiento 7:30 AM",
        "Equipo The Badgers"
    ]
    
    # Directorio de imágenes de ejemplo
    sample_dir = "media/galeria"
    
    # Cargar cada imagen
    for i, nombre in enumerate(nombres, 1):
        filename = f"ejemplo_{i:02d}.jpg"
        filepath = os.path.join(sample_dir, filename)
        
        if os.path.exists(filepath):
            with open(filepath, 'rb') as f:
                item = GaleriaItem(nombre=nombre)
                item.archivo.save(filename, File(f), save=True)
                print(f"Cargada: {nombre} -> {filename}")
        else:
            print(f"Archivo no encontrado: {filepath}")
    
    print(f"\nTotal de elementos cargados: {GaleriaItem.objects.count()}")

if __name__ == "__main__":
    load_sample_images() 