#!/bin/bash

# Script de deployment para producción (Render)
echo "Iniciando deployment de producción..."

# Instalar dependencias
echo "Instalando dependencias de Python..."
pip install -r backend/requirements.txt

# Migraciones de base de datos
echo "Ejecutando migraciones..."
cd backend
python manage.py collectstatic --noinput --settings=core.settings_production
python manage.py migrate --settings=core.settings_production

# Crear superusuario si no existe
echo "Verificando superusuario..."
python manage.py shell --settings=core.settings_production << EOF
from django.contrib.auth.models import User
import os

username = os.environ.get('ADMIN_USERNAME', 'admin')
email = os.environ.get('ADMIN_EMAIL', 'admin@thebadgers.uy')
password = os.environ.get('ADMIN_PASSWORD', 'admin123bjj2025')

# Crear o actualizar el superusuario
try:
    user = User.objects.get(username=username)
    user.email = email
    user.set_password(password)
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.save()
    print(f"Superusuario {username} actualizado exitosamente")
except User.DoesNotExist:
    User.objects.create_superuser(username, email, password)
    print(f"Superusuario {username} creado exitosamente")
EOF

echo "Deployment completado!"
