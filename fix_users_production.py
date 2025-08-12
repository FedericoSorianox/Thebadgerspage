#!/usr/bin/env python3
"""
Script que se puede ejecutar en producción para arreglar usuarios
Usar con: python manage.py shell < fix_users_production.py
"""

from django.contrib.auth.models import User

# Usuarios y contraseñas a configurar
users_passwords = [
    ('admin', 'password123'),
    ('federico_soriano', 'password123'), 
    ('federico_sorianox', 'password123'),
    ('instructor', 'password123'),
    ('testuser', 'password123'),
    ('alumno', 'password123')
]

print("🔧 Arreglando contraseñas de usuarios en producción...")

for username, password in users_passwords:
    try:
        user = User.objects.get(username=username)
        user.set_password(password)
        user.save()
        print(f"✅ {username}: contraseña actualizada a 'password123'")
    except User.DoesNotExist:
        print(f"⚠️  {username}: usuario no existe, creando...")
        # Crear usuario si no existe
        user = User.objects.create_user(
            username=username,
            password=password,
            is_staff=True,  # Dar permisos de staff
            is_active=True
        )
        print(f"✅ {username}: usuario creado con contraseña 'password123'")

print(f"\n🎯 Lista final de usuarios disponibles:")
for user in User.objects.all():
    print(f"   - {user.username} (staff: {user.is_staff}, active: {user.is_active})")

print(f"\n✅ Todos los usuarios tienen contraseña: password123")
print(f"🔐 Ahora puedes usar federico_soriano:password123 para hacer login")
