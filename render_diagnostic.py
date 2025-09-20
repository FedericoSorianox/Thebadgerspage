#!/usr/bin/env python3
"""
Script de diagnóstico simplificado para Render
Solo verifica archivos críticos sin ejecutar comandos complejos
"""
import os
import sys

def diagnose_render():
    """Diagnóstico simplificado del entorno Render"""
    print("🚀 Iniciando diagnóstico simplificado de Render")
    print("=" * 50)

    # Cambiar al directorio backend
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    os.chdir(backend_dir)
    print(f"📁 Cambiado a directorio backend: {os.getcwd()}")

    # Configurar PYTHONPATH para que Django encuentre los módulos
    python_path = f"{backend_dir}:{os.environ.get('PYTHONPATH', '')}"
    os.environ['PYTHONPATH'] = python_path
    sys.path.insert(0, backend_dir)

    # Información básica del sistema
    print(f"🐍 Python executable: {sys.executable}")
    print(f"🐍 Python version: {sys.version}")
    print(f"🌐 RENDER env: {os.environ.get('RENDER', 'Not set')}")
    print(f"🎯 PORT env: {os.environ.get('PORT', 'Not set')}")

    # Verificar archivos críticos (solo verificación de existencia)
    critical_files = [
        'manage.py',
        'core/__init__.py',
        'core/settings.py',
        'core/settings_render.py',
        'core/wsgi.py'
    ]

    print("\n📂 Verificando archivos críticos:")
    all_files_exist = True
    for file_path in critical_files:
        exists = os.path.exists(file_path)
        status = "✅" if exists else "❌"
        print(f"   {status} {file_path}")
        if not exists:
            all_files_exist = False

    # Verificar solo imports básicos de Python (sin Django setup)
    print("\n📦 Verificando imports básicos:")
    try:
        import django
        print("   ✅ Django importado correctamente")
        print(f"   📄 Django version: {django.VERSION}")
    except ImportError as e:
        print(f"   ❌ Error importando Django: {e}")
        all_files_exist = False

    try:
        import gunicorn
        print("   ✅ Gunicorn importado correctamente")
    except ImportError as e:
        print(f"   ❌ Error importando Gunicorn: {e}")

    # No ejecutar comandos complejos que puedan causar timeouts
    print("\n⚠️  Omitiendo verificaciones complejas para evitar timeouts")
    print("   📝 Solo se verificaron archivos críticos e imports básicos")

    if all_files_exist:
        print("\n✅ Diagnóstico completado - Archivos críticos presentes")
        print("   🎯 Para verificaciones más detalladas, ejecutar después del deploy")
        return True
    else:
        print("\n❌ Diagnóstico completado - Faltan archivos críticos")
        return False

if __name__ == "__main__":
    success = diagnose_render()
    sys.exit(0 if success else 1)
