#!/usr/bin/env python3
"""
Script para ejecutar migraciones de forma segura
Solo ejecuta migraciones cuando sea explícitamente solicitado
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.append('/opt/render/project/src/backend')

# Importar Django después de configurar el entorno
django.setup()

from django.core.management import execute_from_command_line

def check_migrations():
    """Verifica si hay migraciones pendientes sin ejecutarlas"""
    
    print("🔍 Verificando migraciones pendientes...")
    
    try:
        # Ejecutar showmigrations para ver el estado
        execute_from_command_line(['manage.py', 'showmigrations'])
        return True
    except Exception as e:
        print(f"❌ Error al verificar migraciones: {e}")
        return False

def safe_migrate():
    """Ejecuta migraciones solo si el usuario confirma"""
    
    print("⚠️  ADVERTENCIA: Este comando ejecutará migraciones en la base de datos compartida")
    print("📋 Esto puede afectar a otros sistemas que usen la misma base de datos")
    print("")
    
    # Verificar migraciones pendientes
    check_migrations()
    
    print("")
    response = input("¿Estás seguro de que quieres ejecutar las migraciones? (sí/no): ")
    
    if response.lower() in ['sí', 'si', 's', 'yes', 'y']:
        print("🔄 Ejecutando migraciones...")
        try:
            execute_from_command_line(['manage.py', 'migrate'])
            print("✅ Migraciones ejecutadas exitosamente")
            return True
        except Exception as e:
            print(f"❌ Error al ejecutar migraciones: {e}")
            return False
    else:
        print("❌ Migraciones canceladas por el usuario")
        return False

if __name__ == "__main__":
    print("🛡️  Script de migración segura")
    print("=" * 50)
    
    if len(sys.argv) > 1 and sys.argv[1] == "--check":
        check_migrations()
    else:
        safe_migrate() 