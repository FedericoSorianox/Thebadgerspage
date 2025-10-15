#!/usr/bin/env python3
"""
Script de diagnóstico para verificar la configuración de Cloudinary
Ejecutar en el servidor de producción para debug
"""

import os
import sys
import django

# Configurar Django
sys.path.append('/opt/render/project/src/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings_render')
django.setup()

from django.conf import settings
from core.models import GaleriaItem

def check_cloudinary_config():
    """Verificar configuración de Cloudinary"""
    print("🔍 DIAGNÓSTICO DE CLOUDINARY")
    print("=" * 50)
    
    # 1. Verificar variables de entorno
    print("\n📋 Variables de entorno:")
    cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME')
    api_key = os.environ.get('CLOUDINARY_API_KEY')
    api_secret = os.environ.get('CLOUDINARY_API_SECRET')
    
    print(f"  CLOUDINARY_CLOUD_NAME: {'✅ Configurado' if cloud_name else '❌ No configurado'}")
    print(f"  CLOUDINARY_API_KEY: {'✅ Configurado' if api_key else '❌ No configurado'}")
    print(f"  CLOUDINARY_API_SECRET: {'✅ Configurado' if api_secret else '❌ No configurado'}")
    
    if cloud_name:
        print(f"    Valor: {cloud_name}")
    if api_key:
        print(f"    Valor: {api_key[:8]}...")
    if api_secret:
        print(f"    Valor: {api_secret[:8]}...")
    
    # 2. Verificar configuración de Django
    print("\n⚙️ Configuración de Django:")
    print(f"  CLOUDINARY_CONFIGURED: {getattr(settings, 'CLOUDINARY_CONFIGURED', 'No definido')}")
    print(f"  DEFAULT_FILE_STORAGE: {getattr(settings, 'DEFAULT_FILE_STORAGE', 'No definido')}")
    
    # 3. Verificar items en la base de datos
    print("\n📊 Items en la base de datos:")
    items = GaleriaItem.objects.all().order_by('-fecha_subida')[:10]
    print(f"  Total de items: {GaleriaItem.objects.count()}")
    print(f"  Últimos 10 items:")
    
    for item in items:
        print(f"    ID: {item.id} | Nombre: {item.nombre}")
        print(f"      Archivo local: {'✅' if item.archivo else '❌'}")
        print(f"      URL Cloudinary: {'✅' if item.archivo_url else '❌'}")
        print(f"      URL final: {item.url or '❌ None'}")
        print(f"      Fecha: {item.fecha_subida}")
        print()
    
    # 4. Test de conexión a Cloudinary
    print("\n🌐 Test de conexión a Cloudinary:")
    try:
        import cloudinary
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret
        )
        
        # Intentar listar recursos
        result = cloudinary.api.resources(max_results=1)
        print("  ✅ Conexión exitosa a Cloudinary")
        print(f"  Recursos encontrados: {result.get('total_count', 0)}")
        
    except Exception as e:
        print(f"  ❌ Error conectando a Cloudinary: {e}")
    
    # 5. Verificar archivos locales
    print("\n📁 Archivos locales:")
    media_root = getattr(settings, 'MEDIA_ROOT', 'No definido')
    print(f"  MEDIA_ROOT: {media_root}")
    
    if media_root != 'No definido':
        galeria_dir = os.path.join(media_root, 'galeria')
        if os.path.exists(galeria_dir):
            files = os.listdir(galeria_dir)
            print(f"  Archivos en /galeria/: {len(files)}")
            for f in files[:5]:  # Mostrar solo los primeros 5
                print(f"    - {f}")
        else:
            print("  ❌ Directorio /galeria/ no existe")
    
    print("\n" + "=" * 50)
    print("🎯 DIAGNÓSTICO COMPLETADO")

if __name__ == "__main__":
    check_cloudinary_config()
