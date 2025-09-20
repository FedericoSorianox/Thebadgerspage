#!/usr/bin/env python3
"""
Script de diagnóstico para Render
Ejecutar durante el build para identificar problemas específicos
"""
import os
import sys
import subprocess

def run_command(cmd, description):
    """Ejecuta un comando y muestra el resultado"""
    print(f"\n🔍 {description}")
    print(f"   Comando: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("   ✅ Éxito")
            if result.stdout.strip():
                print(f"   📄 Salida: {result.stdout.strip()[:200]}...")
        else:
            print("   ❌ Error")
            if result.stderr.strip():
                print(f"   ⚠️  Error: {result.stderr.strip()[:200]}...")
        return result.returncode == 0
    except Exception as e:
        print(f"   ❌ Excepción: {e}")
        return False

def diagnose_render():
    """Diagnóstico completo del entorno Render"""
    print("🚀 Iniciando diagnóstico de Render")
    print("=" * 50)

    # Cambiar al directorio backend
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    os.chdir(backend_dir)
    print(f"📁 Cambiado a directorio backend: {os.getcwd()}")

    # Información básica del sistema
    print(f"🐍 Python executable: {sys.executable}")
    print(f"🐍 Python version: {sys.version}")
    print(f"🌐 RENDER env: {os.environ.get('RENDER', 'Not set')}")
    print(f"🎯 PORT env: {os.environ.get('PORT', 'Not set')}")

    # Verificar archivos importantes
    important_files = [
        'manage.py',
        'core/__init__.py',
        'core/settings.py',
        'core/settings_render.py',
        'core/wsgi.py'
    ]

    print("\n📂 Verificando archivos importantes:")
    for file_path in important_files:
        exists = os.path.exists(file_path)
        print(f"   {'✅' if exists else '❌'} {file_path}")

    # Verificar comandos disponibles
    print("\n🔧 Verificando comandos disponibles:")
    commands_to_check = ['python', 'python3', 'pip', 'pip3', 'gunicorn']
    for cmd in commands_to_check:
        available = run_command(['which', cmd], f"Buscar {cmd}")

    # Verificar Python imports
    print("\n📦 Verificando imports de Python:")
    try:
        import django
        print("   ✅ Django importado correctamente")
        print(f"   📄 Django version: {django.VERSION}")
    except ImportError as e:
        print(f"   ❌ Error importando Django: {e}")

    try:
        import gunicorn
        print("   ✅ Gunicorn importado correctamente")
    except ImportError as e:
        print(f"   ❌ Error importando Gunicorn: {e}")

    # Verificar configuración de Django
    print("\n🔧 Verificando configuración de Django:")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings_render')

    try:
        import django
        django.setup()
        print("   ✅ Django setup completado")

        from django.conf import settings
        print("   ✅ Settings cargados")
        print(f"   📄 DEBUG: {settings.DEBUG}")
        print(f"   📄 ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
        print(f"   📄 DATABASES: {list(settings.DATABASES.keys())}")

    except Exception as e:
        print(f"   ❌ Error en Django setup: {e}")
        import traceback
        traceback.print_exc()

    # Verificar manage.py
    print("\n⚙️  Verificando manage.py:")
    python_cmd = 'python3' if os.path.exists('/usr/bin/python3') else 'python'
    success = run_command([python_cmd, 'manage.py', 'check', '--settings=core.settings_render'],
                         "Django check command")

    if success:
        print("\n✅ Diagnóstico completado - Todo parece correcto!")
    else:
        print("\n❌ Diagnóstico completado - Se encontraron problemas")

    return success

if __name__ == "__main__":
    success = diagnose_render()
    sys.exit(0 if success else 1)
