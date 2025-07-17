#!/usr/bin/env python3
"""
Script para probar la subida de archivos a la galería en producción
"""

import requests
import base64
import json
import tempfile
import os

# Configuración
API_BASE = 'https://thebadgerspage.onrender.com'
USERNAME = 'federico_sorianox'
PASSWORD = 'evRWh0Z7'

def get_auth_header():
    """Genera el header de autenticación"""
    auth = base64.b64encode(f"{USERNAME}:{PASSWORD}".encode()).decode()
    return {"Authorization": f"Basic {auth}"}

def crear_imagen_prueba():
    """Crea una imagen de prueba real"""
    # Crear un archivo temporal con extensión PNG
    fd, path = tempfile.mkstemp(suffix='.png')
    
    # Datos de una imagen PNG 1x1 pixel transparente
    png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf5\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
    
    with os.fdopen(fd, 'wb') as f:
        f.write(png_data)
    
    return path

def subir_archivo(nombre, archivo_path):
    """Sube un archivo a la galería"""
    url = f"{API_BASE}/api/galeria/upload/"
    
    with open(archivo_path, 'rb') as f:
        files = {'archivo': (f'{nombre}.png', f, 'image/png')}
        data = {'nombre': nombre}
        headers = get_auth_header()
        
        print(f"📤 Subiendo: {nombre}")
        response = requests.post(url, files=files, data=data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Subido exitosamente: {nombre}")
            return result
        else:
            print(f"❌ Error subiendo {nombre}: {response.status_code}")
            print(f"   Response: {response.text}")
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

def main():
    print("🧪 Probando subida de archivos a la galería...")
    print(f"Usuario: {USERNAME}")
    print(f"URL: {API_BASE}")
    
    # Verificar galería inicial
    galeria_inicial = obtener_galeria()
    print(f"📊 Galería inicial: {len(galeria_inicial)} elementos")
    
    # Crear y subir archivos de prueba
    archivos_prueba = []
    for i in range(3):  # Subir 3 archivos de prueba
        archivo_path = crear_imagen_prueba()
        archivos_prueba.append((f"Prueba {i+1}", archivo_path))
    
    print(f"\n📤 Subiendo {len(archivos_prueba)} archivos...")
    
    # Subir archivos
    for nombre, archivo_path in archivos_prueba:
        subir_archivo(nombre, archivo_path)
    
    # Verificar galería final
    print("\n📊 Verificando galería final...")
    galeria_final = obtener_galeria()
    
    print(f"📈 Elementos en galería: {len(galeria_final)}")
    
    if len(galeria_final) > len(galeria_inicial):
        print("✅ ¡Éxito! Se agregaron archivos a la galería")
    else:
        print("❌ No se agregaron archivos a la galería")
    
    print("\n📋 Elementos en la galería:")
    for i, item in enumerate(galeria_final):
        print(f"  {i+1}. {item['nombre']} ({item['fecha']}) - {item['tipo']}")
    
    # Limpiar archivos temporales
    for _, archivo_path in archivos_prueba:
        try:
            os.unlink(archivo_path)
        except:
            pass
    
    print("\n🧹 Archivos temporales eliminados")
    print("\n🎯 Prueba completada!")

if __name__ == "__main__":
    main() 