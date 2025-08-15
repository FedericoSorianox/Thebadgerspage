#!/usr/bin/env python3
"""
Script para simular exactamente lo que hace el navegador al cargar the-badgers.com/torneo
"""

import requests
import re
import time

def simulate_browser_load():
    print("🌐 Simulando carga completa del navegador...")
    
    # Paso 1: Cargar la página principal
    print("\n1️⃣ Cargando https://the-badgers.com/torneo")
    try:
        response = requests.get('https://the-badgers.com/torneo')
        if response.status_code != 200:
            print(f"❌ Error al cargar la página: {response.status_code}")
            return
            
        html_content = response.text
        print(f"✅ Página cargada (tamaño: {len(html_content)} bytes)")
        
        # Buscar referencias a assets JS y CSS
        js_files = re.findall(r'src="(/assets/[^"]+\.js)"', html_content)
        css_files = re.findall(r'href="(/assets/[^"]+\.css)"', html_content)
        
        print(f"📄 Archivos JS encontrados: {js_files}")
        print(f"🎨 Archivos CSS encontrados: {css_files}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return
    
    # Paso 2: Cargar archivos CSS
    for css_file in css_files:
        print(f"\n2️⃣ Cargando CSS: {css_file}")
        try:
            css_url = f"https://the-badgers.com{css_file}"
            css_response = requests.get(css_url)
            if css_response.status_code == 200:
                print(f"✅ CSS cargado ({len(css_response.content)} bytes)")
            else:
                print(f"❌ Error cargando CSS: {css_response.status_code}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    # Paso 3: Cargar archivos JS
    for js_file in js_files:
        print(f"\n3️⃣ Cargando JS: {js_file}")
        try:
            js_url = f"https://the-badgers.com{js_file}"
            js_response = requests.get(js_url)
            if js_response.status_code == 200:
                print(f"✅ JS cargado ({len(js_response.content)} bytes)")
                
                # Buscar referencias a la API en el JS
                js_content = js_response.text
                if 'thebadgerspage.onrender.com' in js_content:
                    print("🌐 ✅ API de Render encontrada en JS")
                if 'TorneoDashboard' in js_content:
                    print("🎯 ✅ TorneoDashboard encontrado en JS")
                if 'torneoAPI' in js_content:
                    print("📡 ✅ torneoAPI encontrado en JS")
                    
            else:
                print(f"❌ Error cargando JS: {js_response.status_code}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    # Paso 4: Simular llamada a la API (como haría el frontend)
    print(f"\n4️⃣ Simulando llamada a la API...")
    try:
        api_response = requests.get(
            'https://thebadgerspage.onrender.com/api/torneo/torneos/',
            headers={
                'Origin': 'https://the-badgers.com',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        )
        
        if api_response.status_code == 200:
            api_data = api_response.json()
            print(f"✅ API responde correctamente")
            print(f"📊 Datos recibidos: {api_data.get('count', 0)} torneos")
        else:
            print(f"❌ API falló: {api_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error en API: {e}")

if __name__ == '__main__':
    simulate_browser_load()
