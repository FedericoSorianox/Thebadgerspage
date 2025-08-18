#!/usr/bin/env python3
"""
Test script para probar la actualización de puntos en luchas
"""

import os
import sys
import django

# Add the backend directory to Python path
sys.path.append('/Users/fede/Thebadgerspage/backend')

# Configure Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from core.models import Lucha

def test_calcular_puntos():
    """Test del método calcular_puntos"""
    print("=== Test del método calcular_puntos ===")
    
    # Obtener una lucha para probar
    lucha = Lucha.objects.first()
    if not lucha:
        print("❌ No hay luchas disponibles para probar")
        return
    
    print(f"🥊 Lucha seleccionada: {lucha}")
    print(f"📊 Estado inicial - P1: {lucha.puntos_p1}, P2: {lucha.puntos_p2}")
    
    # Simular algunas técnicas para P1
    lucha.montadas_p1 = 1  # 4 puntos
    lucha.guardas_pasadas_p1 = 1  # 3 puntos
    lucha.derribos_p1 = 2  # 4 puntos (2x2)
    lucha.ventajas_p1 = 1
    
    # Simular algunas técnicas para P2
    lucha.montadas_p2 = 2  # 8 puntos
    lucha.rodillazos_p2 = 1  # 2 puntos
    lucha.ventajas_p2 = 2
    
    print("🎯 Técnicas asignadas:")
    print(f"   P1: {lucha.montadas_p1} montadas, {lucha.guardas_pasadas_p1} guardas pasadas, {lucha.derribos_p1} derribos")
    print(f"   P2: {lucha.montadas_p2} montadas, {lucha.rodillazos_p2} rodillazos")
    
    # Probar el método calcular_puntos
    try:
        print("⚡ Llamando a lucha.calcular_puntos()...")
        lucha.calcular_puntos()
        
        print("✅ Método calcular_puntos ejecutado sin errores")
        print(f"📈 Puntos calculados - P1: {lucha.puntos_p1}, P2: {lucha.puntos_p2}")
        
        # Verificar cálculos manuales
        puntos_p1_esperados = 1*4 + 1*3 + 2*2  # 4 + 3 + 4 = 11
        puntos_p2_esperados = 2*4 + 1*2  # 8 + 2 = 10
        
        print(f"🧮 Cálculo manual - P1: {puntos_p1_esperados}, P2: {puntos_p2_esperados}")
        
        if lucha.puntos_p1 == puntos_p1_esperados and lucha.puntos_p2 == puntos_p2_esperados:
            print("✅ Los cálculos son correctos")
        else:
            print("❌ Error en los cálculos")
            
        # Guardar para probar el método save
        print("💾 Guardando lucha...")
        lucha.save()
        
        # Recargar desde DB
        lucha.refresh_from_db()
        print(f"🔄 Después de guardar - P1: {lucha.puntos_p1}, P2: {lucha.puntos_p2}")
        
        # Probar determinar ganador
        ganador = lucha.determinar_ganador()
        if ganador:
            print(f"🏆 Ganador actual (sin finalizar): {ganador.nombre}")
        else:
            print("🤝 No hay ganador determinado (lucha no finalizada)")
            
    except Exception as e:
        print(f"❌ Error al ejecutar calcular_puntos: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_calcular_puntos()
