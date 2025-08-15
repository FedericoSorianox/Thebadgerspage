#!/usr/bin/env python3
"""
Script simple para verificar si el contenido de torneos se está mostrando
"""

import requests
import re

def check_torneo_content():
    print("🔍 Verificando contenido de torneos en the-badgers.com...")
    
    try:
        response = requests.get('https://the-badgers.com/torneo')
        
        if response.status_code == 200:
            content = response.text
            
            # Buscar indicadores de que el contenido se está mostrando
            indicators = [
                'TorneoDashboard',
                'Torneo BJJ',
                'carga',
                'Error',
                'torneos',
                'categorías'
            ]
            
            found_indicators = []
            for indicator in indicators:
                if indicator.lower() in content.lower():
                    found_indicators.append(indicator)
            
            print(f"✅ Página carga correctamente (status: {response.status_code})")
            print(f"📝 Indicadores encontrados: {found_indicators}")
            
            # Buscar si hay JavaScript errors o console logs
            if 'console.log' in content:
                print("🐛 Se detecta contenido de desarrollo (logs)")
            
            if 'error' in content.lower():
                print("⚠️ Se detecta posible error en el contenido")
                
            # Buscar si hay referencias a la API
            if 'thebadgerspage.onrender.com' in content:
                print("🌐 Se detecta referencia a la API de Render")
            
            return True
            
        else:
            print(f"❌ Error al cargar la página: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    check_torneo_content()
