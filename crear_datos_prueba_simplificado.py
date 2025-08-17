#!/usr/bin/env python
"""
Script para crear datos de prueba para el sistema de torneos BJJ simplificado
"""
import os
import sys
import django
from datetime import date, timedelta

# Configuración de Django
import django
from django.conf import settings
sys.path.append('/Users/fede/Thebadgerspage/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Configurar Django si no está configurado
if not settings.configured:
    django.setup()
else:
    django.setup()

from django.contrib.auth.models import User
from core.models import Torneo, Categoria, Participante

def create_test_data():
    print("🔧 Creando datos de prueba para sistema de torneos BJJ...")
    
    # Crear usuario admin si no existe
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'is_staff': True,
            'is_superuser': True,
            'email': 'admin@thebadgers.com'
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print("✅ Usuario admin creado")
    
    # Crear torneo de prueba
    torneo, created = Torneo.objects.get_or_create(
        nombre='Copa The Badgers 2025',
        defaults={
            'descripcion': 'Torneo de prueba con el sistema simplificado',
            'fecha_inicio': date.today() + timedelta(days=7),
            'fecha_fin': date.today() + timedelta(days=8),
            'ubicacion': 'The Badgers Academy',
            'usuario_creador': admin_user,
            'estado': 'activo'
        }
    )
    
    if created:
        print("✅ Torneo creado: Copa The Badgers 2025")
        print("✅ Categorías automáticas creadas")
    else:
        print("ℹ️ Torneo ya existía")
    
    # Crear participantes de prueba
    participantes_data = [
        # Cinturón Blanca
        {'nombre': 'Juan Pérez', 'cinturon': 'blanca', 'academia': 'The Badgers', 'peso': 65.0},
        {'nombre': 'María García', 'cinturon': 'blanca', 'academia': 'The Badgers', 'peso': 75.0},
        {'nombre': 'Carlos López', 'cinturon': 'blanca', 'academia': 'Academia Rival', 'peso': 85.0},
        
        # Cinturón Azul
        {'nombre': 'Ana Martínez', 'cinturon': 'azul', 'academia': 'The Badgers', 'peso': 68.0},
        {'nombre': 'Roberto Silva', 'cinturon': 'azul', 'academia': 'Academia Rival', 'peso': 78.0},
        {'nombre': 'Elena Rodríguez', 'cinturon': 'azul', 'academia': 'The Badgers', 'peso': 88.0},
        
        # Cinturón Violeta
        {'nombre': 'Miguel Torres', 'cinturon': 'violeta', 'academia': 'The Badgers', 'peso': 70.0},
        {'nombre': 'Laura Jiménez', 'cinturon': 'violeta', 'academia': 'Academia Rival', 'peso': 80.0},
        
        # Cinturón Marrón
        {'nombre': 'Pedro Morales', 'cinturon': 'marron', 'academia': 'The Badgers', 'peso': 72.0},
        {'nombre': 'Sofía Herrera', 'cinturon': 'marron', 'academia': 'Academia Rival', 'peso': 82.0},
        
        # Cinturón Negro
        {'nombre': 'Francisco Ruiz', 'cinturon': 'negro', 'academia': 'The Badgers', 'peso': 74.0},
        {'nombre': 'Carmen Delgado', 'cinturon': 'negro', 'academia': 'Academia Rival', 'peso': 84.0},
    ]
    
    participantes_creados = 0
    for data in participantes_data:
        participante, created = Participante.objects.get_or_create(
            nombre=data['nombre'],
            torneo=torneo,
            defaults={
                'cinturon': data['cinturon'],
                'academia': data['academia'],
                'peso': data['peso'],
            }
        )
        if created:
            participantes_creados += 1
    
    print(f"✅ {participantes_creados} participantes creados")
    
    # Mostrar resumen
    total_categorias = torneo.categorias.count()
    total_participantes = torneo.participantes.filter(activo=True).count()
    
    print(f"\n📊 RESUMEN:")
    print(f"  🏆 Torneo: {torneo.nombre}")
    print(f"  🏷️ Categorías: {total_categorias}")
    print(f"  👥 Participantes: {total_participantes}")
    
    print(f"\n🎯 Distribución por categorías:")
    for categoria in torneo.categorias.all()[:10]:  # Mostrar solo las primeras 10
        # Contar participantes en esta categoría
        count = 0
        if categoria.tipo_categoria in ['blanca', 'azul', 'violeta', 'marron', 'negro']:
            queryset = torneo.participantes.filter(
                activo=True,
                cinturon=categoria.tipo_categoria,
                categoria_asignada__isnull=True
            )
            if categoria.peso_minimo is not None:
                queryset = queryset.filter(peso__gte=categoria.peso_minimo)
            if categoria.peso_maximo is not None:
                queryset = queryset.filter(peso__lte=categoria.peso_maximo)
            count = queryset.count()
        
        if count > 0:
            print(f"  • {categoria.nombre}: {count} participantes")
    
    print(f"\n🚀 ¡Sistema listo para pruebas!")
    print(f"  Frontend: http://localhost:5173/torneo")
    print(f"  Backend Admin: http://127.0.0.1:8001/admin/")

if __name__ == '__main__':
    create_test_data()
