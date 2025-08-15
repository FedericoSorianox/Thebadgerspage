#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
sys.path.append('/Users/fede/Thebadgerspage/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
os.environ.setdefault('USE_SQLITE', 'true')
django.setup()

from core.models import Torneo, Categoria, Participante
from django.contrib.auth.models import User
from datetime import datetime, date as date_module

def crear_datos_prueba():
    print("🏆 Creando datos de prueba para torneos...")
    
    # Obtener o crear usuario admin
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@thebadgers.com',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"✅ Usuario admin creado: {admin_user.username}")
    else:
        print(f"✅ Usuario admin encontrado: {admin_user.username}")
    
    # Crear torneo de prueba si no existe
    torneo, created = Torneo.objects.get_or_create(
        nombre="Torneo BJJ The Badgers 2025",
        defaults={
            'descripcion': 'Torneo de prueba para demostrar el sistema',
            'fecha_inicio': date_module.today(),
            'fecha_fin': date_module.today(),
            'ubicacion': 'Academia The Badgers',
            'estado': 'planificacion',
            'usuario_creador': admin_user
        }
    )
    if created:
        print(f"✅ Torneo creado: {torneo.nombre}")
    else:
        print(f"✅ Torneo encontrado: {torneo.nombre}")
    
    # Crear categorías de prueba
    categorias_data = [
        {'nombre': 'Adulto Blanco', 'peso_minimo': 60, 'peso_maximo': 80, 'cinturon': 'blanca', 'grupo_edad': 'adulto', 'genero': 'masculino'},
        {'nombre': 'Adulto Azul', 'peso_minimo': 70, 'peso_maximo': 90, 'cinturon': 'azul', 'grupo_edad': 'adulto', 'genero': 'masculino'},
        {'nombre': 'Juvenil Blanco', 'peso_minimo': 50, 'peso_maximo': 70, 'cinturon': 'blanca', 'grupo_edad': 'juvenil', 'genero': 'masculino'},
    ]
    
    for cat_data in categorias_data:
        categoria, created = Categoria.objects.get_or_create(
            torneo=torneo,
            nombre=cat_data['nombre'],
            defaults=cat_data
        )
        if created:
            print(f"✅ Categoría creada: {categoria.nombre}")
    
    # Crear algunos participantes de ejemplo
    participantes_data = [
        {'nombre': 'Juan', 'apellido': 'Pérez', 'peso': 75, 'cinturon': 'blanca', 'fecha_nacimiento': date_module(1995, 5, 15), 'genero': 'masculino'},
        {'nombre': 'María', 'apellido': 'García', 'peso': 65, 'cinturon': 'azul', 'fecha_nacimiento': date_module(1992, 8, 22), 'genero': 'femenino'},
        {'nombre': 'Carlos', 'apellido': 'López', 'peso': 85, 'cinturon': 'blanca', 'fecha_nacimiento': date_module(1990, 12, 10), 'genero': 'masculino'},
        {'nombre': 'Ana', 'apellido': 'Martínez', 'peso': 60, 'cinturon': 'azul', 'fecha_nacimiento': date_module(1988, 3, 7), 'genero': 'femenino'},
    ]
    
    # Obtener categorías existentes
    categoria_adulto = Categoria.objects.filter(torneo=torneo).first()
    
    for part_data in participantes_data:
        part_data['categoria'] = categoria_adulto  # Asignar a la primera categoría disponible
        participante, created = Participante.objects.get_or_create(
            nombre=part_data['nombre'],
            apellido=part_data['apellido'],
            defaults=part_data
        )
        if created:
            print(f"✅ Participante creado: {participante.nombre} {participante.apellido}")
    
    print("")
    print("📊 Resumen de datos creados:")
    print(f"   - Torneos: {Torneo.objects.count()}")
    print(f"   - Categorías: {Categoria.objects.count()}")
    print(f"   - Participantes: {Participante.objects.count()}")
    print("")
    print("🔍 Para probar la API:")
    print("   curl http://127.0.0.1:8000/api/torneo/torneos/")
    print("   curl http://127.0.0.1:8000/api/torneo/categorias/")
    print("   curl http://127.0.0.1:8000/api/torneo/participantes/")

if __name__ == '__main__':
    crear_datos_prueba()
