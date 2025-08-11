# 🚀 Guía de Deployment - The Badgers BJJ System

## 📋 Pre-requisitos

### 1. Variables de Entorno Requeridas

En tu plataforma de hosting (Render, Heroku, etc.) configura estas variables:

```bash
# Seguridad
SECRET_KEY=tu_secret_key_super_segura_de_al_menos_50_caracteres

# Base de datos (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# Admin por defecto
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@thebadgers.uy
ADMIN_PASSWORD=admin123bjj2025

# Cloudinary (opcional)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Configuración Django
DJANGO_SETTINGS_MODULE=core.settings_production
```

## 🎯 Deployment en Render

### 1. Crear cuenta en Render.com
- Ve a [render.com](https://render.com)
- Crea una cuenta gratuita
- Conecta tu repositorio de GitHub

### 2. Configurar servicio web
- Selecciona "New Web Service"
- Conecta tu repositorio
- Configuración:
  - **Environment**: Python
  - **Build Command**: `./deploy_production.sh`
  - **Start Command**: `cd backend && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --settings=core.settings_production`

### 3. Configurar base de datos PostgreSQL
- En el dashboard de Render, crea "New PostgreSQL"
- Plan gratuito incluye hasta 1GB
- Copia la `DATABASE_URL` a las variables de entorno

### 4. Variables de entorno en Render
Ve a Settings > Environment y agrega todas las variables listadas arriba.

## 🔐 Sistema de Autenticación

### En Desarrollo
- Sistema mock con localStorage
- Un clic para acceder
- Usuario simulado: `admin_dev`

### En Producción
- Autenticación real con Django Admin
- URL: `https://tu-dominio.com/admin/login/`
- Credenciales por defecto:
  - Usuario: `admin`
  - Contraseña: `admin123bjj2025`

## 💾 Base de Datos

### Desarrollo
- SQLite local (`backend/db.sqlite3`)
- Datos de prueba incluidos

### Producción
- PostgreSQL (configurado automáticamente por Render)
- Migraciones automáticas en deployment
- Datos persistentes

## 🎨 Archivos Multimedia

### Desarrollo
- Almacenamiento local en `backend/media/`

### Producción (Cloudinary)
- Si configuras Cloudinary: almacenamiento en la nube
- Si no: almacenamiento local en el servidor

## 🛠️ Comandos Útiles

### Crear usuario adicional en producción:
```bash
# En el shell de tu servidor
python manage.py shell --settings=core.settings_production

# Ejecutar en el shell:
from django.contrib.auth.models import User
User.objects.create_superuser('nuevo_admin', 'email@ejemplo.com', 'password123')
```

### Ver logs en producción:
```bash
# En Render, ve a la pestaña "Logs"
# O usa el CLI de Render
render logs --service=tu-servicio
```

## 🔄 Proceso de Deployment

1. **Push a GitHub**: Cualquier cambio en la rama main
2. **Render detecta cambios**: Inicia build automáticamente
3. **Ejecuta build**: Corre `deploy_production.sh`
4. **Migraciones**: Se ejecutan automáticamente
5. **Superusuario**: Se crea si no existe
6. **Deploy completo**: ¡Tu app está live!

## 🎯 URLs Importantes

- **Frontend**: `https://tu-dominio.com`
- **Admin Django**: `https://tu-dominio.com/admin/`
- **API**: `https://tu-dominio.com/api/`
- **Torneo System**: `https://tu-dominio.com/torneo`

## 🐛 Troubleshooting

### ❌ Error de login en Django Admin (Producción)

Si ves el error "Please enter the correct username and password for a staff account":

#### Diagnóstico del problema:
El error indica que las variables de entorno no están configuradas correctamente en Render.

#### Solución PASO A PASO:

**1. Configurar Variables de Entorno en Render:**
- Ve a tu servicio en Render.com
- Settings > Environment
- Agrega/verifica estas variables:
```bash
SECRET_KEY=tu_secret_key_super_segura_de_al_menos_50_caracteres
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@thebadgers.uy
ADMIN_PASSWORD=admin123bjj2025
DJANGO_SETTINGS_MODULE=core.settings_production
```

**2. Usar el script simple en Render Shell:**
```bash
cd backend
./fix_admin_simple.sh
```

**3. Si el script simple no funciona, comandos manuales:**
```bash
cd backend
python manage.py shell
```

Luego en el shell de Python:
```python
from django.contrib.auth.models import User

# Ver usuarios existentes
print("Usuarios existentes:")
for u in User.objects.all():
    print(f"- {u.username} (staff: {u.is_staff}, superuser: {u.is_superuser})")

# Resetear admin
username = 'admin'
password = 'admin123bjj2025'

try:
    user = User.objects.get(username=username)
    user.set_password(password)
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.save()
    print("✅ Usuario admin actualizado")
except User.DoesNotExist:
    User.objects.create_superuser(username, 'admin@thebadgers.uy', password)
    print("✅ Usuario admin creado")
```

**4. Verificar el login:**
- URL: `https://thebadgerspage.onrender.com/admin/`
- Usuario: `admin`
- Contraseña: `admin123bjj2025`

### Error de CORS
- Verifica que tu dominio esté en `CORS_ALLOWED_ORIGINS`
- En `settings_production.py`

### Error de base de datos
- Verifica la `DATABASE_URL`
- Ejecuta migraciones manualmente si es necesario

### Error de autenticación
- Verifica que el superusuario existe
- Resetea la contraseña si es necesario

### Error 500
- Revisa los logs en Render
- Verifica todas las variables de entorno

## 🚀 ¡Listo!

Tu sistema de torneo BJJ está ahora deployado y listo para usar en producción con:

✅ Autenticación real  
✅ Base de datos PostgreSQL  
✅ Almacenamiento de archivos  
✅ Sistema completo de torneos  
✅ Datos de prueba pre-cargados  

¡Disfruta tu sistema de torneo BJJ en producción!
