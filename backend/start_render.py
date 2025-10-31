#!/usr/bin/env python3
"""
Script de inicio para Render - más robusto que el comando directo
"""
import os
import sys
import subprocess
import time

def main():
    print("🚀 Iniciando aplicación en Render...")
    print("=" * 50)

    # Configurar entorno
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings_render')
    os.environ['RENDER'] = '1'

    # Configurar PYTHONPATH para que Django encuentre los módulos
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    python_path = f"{backend_dir}:{os.environ.get('PYTHONPATH', '')}"
    os.environ['PYTHONPATH'] = python_path
    sys.path.insert(0, backend_dir)

    # Información del entorno
    print(f"📁 Directorio actual: {os.getcwd()}")
    print(f"🐍 Python: {sys.executable}")
    print(f"🌐 PORT: {os.environ.get('PORT', '8000')}")
    print(f"🌐 RENDER: {os.environ.get('RENDER', 'Not set')}")

    # Verificar archivos importantes
    required_files = [
        'manage.py',
        'core/__init__.py',
        'core/settings.py',
        'core/settings_render.py',
        'core/wsgi.py'
    ]

    print("\n📂 Verificando archivos:")
    missing_files = []
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"   ✅ {file_path}")
        else:
            print(f"   ❌ {file_path}")
            missing_files.append(file_path)

    if missing_files:
        print(f"\n❌ Archivos faltantes: {missing_files}")
        sys.exit(1)

    # Verificar que Django esté disponible
    try:
        import django
        print(f"\n✅ Django {django.VERSION} disponible")
    except ImportError as e:
        print(f"\n❌ Django no disponible: {e}")
        sys.exit(1)

    # Ejecutar migraciones si es necesario
    print("\n🔄 Ejecutando migraciones...")
    try:
        from django.core.management import execute_from_command_line
        execute_from_command_line(['manage.py', 'migrate', '--noinput'])
        print("✅ Migraciones completadas")
    except Exception as e:
        print(f"❌ Error crítico en migraciones: {e}")
        print("🔧 Las migraciones son necesarias para el funcionamiento de la aplicación")
        sys.exit(1)

    # Recolectar archivos estáticos
    print("\n📂 Recolectando archivos estáticos...")
    try:
        execute_from_command_line(['manage.py', 'collectstatic', '--noinput', '--clear'])
        print("✅ Archivos estáticos recolectados")
    except Exception as e:
        print(f"⚠️ Error en collectstatic: {e}")

    # Verificar configuración (simplificado para evitar timeouts)
    print("\n🔧 Verificando configuración...")
    try:
        # Solo verificar imports básicos, no ejecutar check completo que puede timeout
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings_render')
        import django
        django.setup()
        print("✅ Configuración básica verificada")
    except Exception as e:
        print(f"❌ Error en configuración básica: {e}")
        sys.exit(1)

    # Iniciar servidor
    port = os.environ.get('PORT', '8000')
    print(f"\n🚀 Iniciando servidor en puerto {port}...")

    # Usar gunicorn si está disponible, sino usar runserver
    try:
        import gunicorn
        print("🐍 Usando Gunicorn (producción)")
        cmd = [
            'gunicorn',
            'core.wsgi:application',
            '--bind', f'0.0.0.0:{port}',
            '--workers', '2',
            '--threads', '2',
            '--timeout', '30',
            '--keep-alive', '10'
        ]
    except ImportError:
        print("🐍 Gunicorn no disponible, usando runserver (desarrollo)")
        cmd = [
            'python3', 'manage.py', 'runserver',
            f'0.0.0.0:{port}',
            '--settings=core.settings_render'
        ]

    print(f"📋 Comando: {' '.join(cmd)}")
    print("🎯 Aplicación iniciada correctamente!")

    # Ejecutar el comando
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error iniciando servidor: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido por usuario")
        sys.exit(0)

if __name__ == '__main__':
    main()
