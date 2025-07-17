#!/usr/bin/env python3
"""
Script para aplicar migraciones en producción
"""

import os
import sys
import django

# Configurar Django para producción
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.append('/opt/render/project/src/backend')

# Importar Django después de configurar el entorno
django.setup()

from django.core.management import execute_from_command_line

def apply_migrations():
    """Aplica las migraciones pendientes"""
    
    print("🔄 Aplicando migraciones...")
    
    try:
        # Ejecutar migrate
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ Migraciones aplicadas exitosamente")
        return True
    except Exception as e:
        print(f"❌ Error al aplicar migraciones: {e}")
        return False

def show_migration_status():
    """Muestra el estado de las migraciones"""
    
    print("📋 Estado de las migraciones:")
    
    try:
        # Ejecutar showmigrations
        execute_from_command_line(['manage.py', 'showmigrations'])
        return True
    except Exception as e:
        print(f"❌ Error al mostrar migraciones: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Verificando migraciones...")
    print("=" * 50)
    
    print("\n1️⃣ Estado actual de las migraciones:")
    show_migration_status()
    
    print("\n2️⃣ Aplicando migraciones:")
    if apply_migrations():
        print("\n3️⃣ Estado final de las migraciones:")
        show_migration_status()
    
    print("\n✅ Proceso completado") 