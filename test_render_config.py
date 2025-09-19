#!/usr/bin/env python3
"""
Script para verificar configuración de Render usando manage.py
"""
import os
import sys
import subprocess

def test_render_config():
    """Verificar configuración específica de Render usando manage.py"""
    print("🧪 Verificando configuración de Render con manage.py...")
    print("=" * 60)

    # Cambiar al directorio backend
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    os.chdir(backend_dir)

    try:
        # Ejecutar check de Django
        print("🔍 Ejecutando: python manage.py check --settings=core.settings_render")
        result = subprocess.run([
            'python3', 'manage.py', 'check', '--settings=core.settings_render'
        ], capture_output=True, text=True, timeout=30)

        print("📄 Salida de check:")
        if result.stdout:
            print(result.stdout)

        if result.stderr:
            print("⚠️  Errores/warnings:")
            print(result.stderr)

        if result.returncode == 0:
            print("✅ Comando check ejecutado exitosamente")
        else:
            print(f"❌ Comando check falló con código: {result.returncode}")
            return False

        # Verificar que las migraciones se pueden ejecutar
        print("\n🔍 Verificando migraciones...")
        result = subprocess.run([
            'python3', 'manage.py', 'showmigrations', '--settings=core.settings_render'
        ], capture_output=True, text=True, timeout=30)

        if result.returncode == 0:
            print("✅ Migraciones verificadas correctamente")
        else:
            print(f"❌ Error verificando migraciones: {result.stderr}")
            return False

        print("\n✅ Configuración de Render verificada correctamente!")
        return True

    except subprocess.TimeoutExpired:
        print("\n❌ Timeout ejecutando comandos de Django")
        return False
    except Exception as e:
        print(f"\n❌ Error ejecutando verificación: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_render_config()
    sys.exit(0 if success else 1)
