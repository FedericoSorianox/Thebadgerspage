#!/usr/bin/env python3
"""
Script de diagnóstico para verificar la configuración de Cloudinary
Ejecutar con: cd backend && python render_diagnostic_cloudinary.py
"""

import os
import sys
import django
from django.conf import settings

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings_render')
django.setup()

def verificar_cloudinary():
    print("🔍 DIAGNÓSTICO DE CLOUDINARY")
    print("=" * 50)
    
    # Verificar variables de entorno
    cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME')
    api_key = os.environ.get('CLOUDINARY_API_KEY')
    api_secret = os.environ.get('CLOUDINARY_API_SECRET')
    
    print(f"📋 Variables de entorno:")
    print(f"   CLOUDINARY_CLOUD_NAME: {'✅ Configurado' if cloud_name else '❌ No configurado'}")
    print(f"   CLOUDINARY_API_KEY: {'✅ Configurado' if api_key else '❌ No configurado'}")
    print(f"   CLOUDINARY_API_SECRET: {'✅ Configurado' if api_secret else '❌ No configurado'}")
    
    # Verificar configuración de Django
    print(f"\n📋 Configuración de Django:")
    cloudinary_configured = getattr(settings, 'CLOUDINARY_CONFIGURED', False)
    default_storage = getattr(settings, 'DEFAULT_FILE_STORAGE', 'No configurado')
    
    print(f"   CLOUDINARY_CONFIGURED: {'✅' if cloudinary_configured else '❌'} {cloudinary_configured}")
    print(f"   DEFAULT_FILE_STORAGE: {default_storage}")
    
    # Verificar si cloudinary está instalado
    try:
        import cloudinary
        print(f"   Cloudinary package: ✅ Instalado")
    except ImportError:
        print(f"   Cloudinary package: ❌ No instalado")
        return False
    
    # Test de conexión si está configurado
    if all([cloud_name, api_key, api_secret]):
        print(f"\n🔗 Probando conexión con Cloudinary...")
        try:
            import cloudinary.api
            cloudinary.config(
                cloud_name=cloud_name,
                api_key=api_key,
                api_secret=api_secret
            )
            
            # Hacer una llamada simple a la API
            result = cloudinary.api.ping()
            print(f"   Conexión: ✅ Exitosa")
            print(f"   Respuesta: {result}")
            return True
            
        except Exception as e:
            print(f"   Conexión: ❌ Error - {e}")
            return False
    else:
        print(f"\n❌ No se puede probar conexión: Variables de entorno faltantes")
        return False

def main():
    success = verificar_cloudinary()
    
    print(f"\n" + "=" * 50)
    if success:
        print("🎉 RESULTADO: Cloudinary está configurado correctamente")
        print("   Las fotos se guardarán en la nube y NO se perderán en deploys")
    else:
        print("⚠️  RESULTADO: Cloudinary NO está configurado")
        print("   Las fotos se guardan localmente y SE PERDERÁN en cada deploy")
        print("\n📝 Para solucionarlo:")
        print("   1. Crear cuenta en cloudinary.com")
        print("   2. Configurar variables de entorno en Render:")
        print("      - CLOUDINARY_CLOUD_NAME")
        print("      - CLOUDINARY_API_KEY")
        print("      - CLOUDINARY_API_SECRET")
        print("   3. Hacer un nuevo deploy")

if __name__ == '__main__':
    main()
