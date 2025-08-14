#!/usr/bin/env python3

import os
import sys
import django

# Configurar Django
sys.path.append('/Users/fede/Thebadgerspage/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from core.models import GaleriaItem

print("🔍 GALERÍA DIAGNOSTIC")
print("=====================")
print()

# Verificar cuántas imágenes hay en la base de datos
total_items = GaleriaItem.objects.count()
print(f"📊 Total items in database: {total_items}")

if total_items > 0:
    print("\n📋 First 5 items:")
    for i, item in enumerate(GaleriaItem.objects.all()[:5]):
        print(f"  {i+1}. ID: {item.id}")
        print(f"     Nombre: {item.nombre}")
        print(f"     Archivo: {item.archivo}")
        print(f"     URL tipo: {type(item.archivo)}")
        
        # Verificar si el archivo tiene URL
        try:
            if hasattr(item.archivo, 'url'):
                print(f"     Archivo URL: {item.archivo.url}")
            else:
                print(f"     Archivo string: {str(item.archivo)}")
        except Exception as e:
            print(f"     Error getting URL: {e}")
        
        print(f"     Fecha: {item.fecha_subida}")
        print()
        
    print("🔗 URL patterns found:")
    urls = []
    for item in GaleriaItem.objects.all()[:10]:
        try:
            if hasattr(item.archivo, 'url'):
                urls.append(item.archivo.url)
            else:
                urls.append(str(item.archivo))
        except:
            urls.append("ERROR")
    
    for url in set(urls):
        print(f"  - {url}")
        
else:
    print("❌ No items found in database!")
    print("🎯 Need to:")
    print("   1. Upload some sample images")
    print("   2. Check if migration created the tables")
    print("   3. Verify database connection")

print()
print("🌐 API URL being used:")
print("   Frontend should call: https://thebadgerspage.onrender.com/api/galeria/")
print()
print("✅ Next steps:")
print("   1. Check browser Network tab for API response")
print("   2. Verify image URLs are valid")
print("   3. Check CSS loading in browser")
