#!/usr/bin/env python3
"""
Script de prueba para la galería
Sube múltiples imágenes y verifica que se muestren los últimos 8
"""

import requests
import base64
import json
import time
import os

# Configuración
API_BASE = "http://localhost:8000"
USERNAME = "admin"
PASSWORD = "admin123"

def get_auth_header():
    """Genera el header de autenticación"""
    auth = base64.b64encode(f"{USERNAME}:{PASSWORD}".encode()).decode()
    return {"Authorization": f"Basic {auth}"}

def subir_archivo(nombre, archivo_path):
    """Sube un archivo a la galería"""
    url = f"{API_BASE}/api/galeria/upload/"
    
    with open(archivo_path, 'rb') as f:
        files = {'archivo': f}
        data = {'nombre': nombre}
        headers = get_auth_header()
        
        response = requests.post(url, files=files, data=data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Subido: {nombre}")
            return result
        else:
            print(f"❌ Error subiendo {nombre}: {response.status_code} - {response.text}")
            return None

def obtener_galeria():
    """Obtiene la lista de elementos de la galería"""
    url = f"{API_BASE}/api/galeria/"
    response = requests.get(url)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Error obteniendo galería: {response.status_code}")
        return []

def crear_imagen_prueba(nombre, extension=".jpg"):
    """Crea una imagen de prueba real"""
    import tempfile
    
    # Crear un archivo temporal con extensión de imagen
    fd, path = tempfile.mkstemp(suffix=extension)
    
    # Crear una imagen PNG simple (1x1 pixel)
    if extension.lower() in ['.png', '.jpg', '.jpeg']:
        # Datos de una imagen PNG 1x1 pixel transparente
        png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf5\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
        with os.fdopen(fd, 'wb') as f:
            f.write(png_data)
    else:
        # Para otros tipos, crear un archivo vacío
        with os.fdopen(fd, 'w') as f:
            f.write("")
    
    return path

def main():
    print("🧪 Iniciando prueba de galería...")
    
    # Verificar que el servidor esté funcionando
    try:
        galeria_inicial = obtener_galeria()
        print(f"📊 Galería inicial: {len(galeria_inicial)} elementos")
    except requests.exceptions.ConnectionError:
        print("❌ No se puede conectar al servidor. Asegúrate de que esté ejecutándose en localhost:8000")
        return
    
    # Crear archivos de prueba
    archivos_prueba = []
    for i in range(10):  # Crear 10 archivos para probar el límite de 8
        archivo_path = crear_imagen_prueba(f"test_{i+1}", ".png")
        archivos_prueba.append((f"Imagen de prueba {i+1}", archivo_path))
    
    print(f"\n📤 Subiendo {len(archivos_prueba)} archivos...")
    
    # Subir archivos
    for nombre, archivo_path in archivos_prueba:
        subir_archivo(nombre, archivo_path)
        time.sleep(0.5)  # Pequeña pausa entre subidas
    
    # Verificar resultado final
    print("\n📊 Verificando resultado final...")
    galeria_final = obtener_galeria()
    
    print(f"📈 Elementos en galería: {len(galeria_final)}")
    
    if len(galeria_final) == 8:
        print("✅ ¡Éxito! La galería muestra exactamente los últimos 8 archivos")
    else:
        print(f"❌ Error: Se esperaban 8 elementos, pero hay {len(galeria_final)}")
    
    print("\n📋 Elementos en la galería:")
    for i, item in enumerate(galeria_final):
        print(f"  {i+1}. {item['nombre']} ({item['fecha']})")
    
    # Limpiar archivos temporales
    for _, archivo_path in archivos_prueba:
        try:
            os.unlink(archivo_path)
        except:
            pass
    
    print("\n🧹 Archivos temporales eliminados")

if __name__ == "__main__":
    main() 