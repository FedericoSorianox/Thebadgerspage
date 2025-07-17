#!/usr/bin/env python3
"""
Script para crear imágenes de ejemplo para la galería de desarrollo
"""
import os
from PIL import Image, ImageDraw, ImageFont
import random

def create_sample_image(filename, text, size=(800, 600), color=None):
    """Crear una imagen de ejemplo con texto"""
    if color is None:
        color = (random.randint(50, 200), random.randint(50, 200), random.randint(50, 200))
    
    # Crear imagen
    img = Image.new('RGB', size, color)
    draw = ImageDraw.Draw(img)
    
    # Intentar usar una fuente del sistema, o usar la default
    try:
        # En macOS, usar una fuente común
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 40)
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 40)
        except:
            font = ImageFont.load_default()
    
    # Calcular posición del texto
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size[0] - text_width) // 2
    y = (size[1] - text_height) // 2
    
    # Dibujar texto con sombra
    draw.text((x+2, y+2), text, fill=(0, 0, 0), font=font)
    draw.text((x, y), text, fill=(255, 255, 255), font=font)
    
    return img

def main():
    """Crear imágenes de ejemplo"""
    # Crear directorio si no existe
    os.makedirs('sample_images', exist_ok=True)
    
    # Lista de nombres para las imágenes
    sample_names = [
        "Entrenamiento de Jiu Jitsu",
        "Clase de Muay Thai",
        "Competencia Local",
        "Seminario con Maestro",
        "Entrenamiento de Técnicas",
        "Sparring Session",
        "Graduación de Cinturones",
        "Evento de Academia"
    ]
    
    # Colores para las imágenes
    colors = [
        (139, 69, 19),   # Marrón
        (25, 25, 112),   # Azul marino
        (139, 0, 0),     # Rojo oscuro
        (0, 100, 0),     # Verde oscuro
        (128, 0, 128),   # Púrpura
        (255, 140, 0),   # Naranja
        (47, 79, 79),    # Gris oscuro
        (178, 34, 34),   # Rojo fuego
    ]
    
    print("Creando imágenes de ejemplo...")
    
    for i, name in enumerate(sample_names):
        filename = f"sample_images/ejemplo_{i+1:02d}.jpg"
        color = colors[i % len(colors)]
        
        img = create_sample_image(filename, name, color=color)
        img.save(filename, 'JPEG', quality=85)
        print(f"✓ Creada: {filename}")
    
    print(f"\nSe crearon {len(sample_names)} imágenes de ejemplo en el directorio 'sample_images/'")
    print("Ahora puedes ejecutar el script para cargarlas a la base de datos.")

if __name__ == "__main__":
    main() 