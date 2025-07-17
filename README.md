# Academia The Badgers

Sitio web de la Academia de Artes Marciales The Badgers - Jiu Jitsu & Muay Thai.

## 🚀 Despliegue en Render

### Configuración como Web Service

1. **Crear nuevo Web Service** en Render
2. **Conectar repositorio GitHub**: `FedericoSorianox/Thebadgerspage`
3. **Configurar:**
   - **Environment**: `Python`
   - **Build Command**: `./build.sh`
   - **Start Command**: `cd backend && python manage.py runserver 0.0.0.0:$PORT`

### Variables de Entorno

```bash
PYTHON_VERSION=3.11.0
DJANGO_SETTINGS_MODULE=core.settings_render
DEBUG=false
ALLOWED_HOSTS=the-badgers.com,www.the-badgers.com,thebadgerspage.onrender.com
```

### Estructura del Proyecto

```
Thebadgerspage/
├── frontend/          # React app
├── backend/           # Django API
├── build.sh          # Script de build
├── render.yaml       # Configuración Render
└── README.md         # Este archivo
```

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
cd frontend && npm install
cd ../backend && pip install -r requirements.txt

# Ejecutar build
./build.sh

# Iniciar servidor
cd backend && python manage.py runserver
```

## 📁 Rutas

- `/` - Página principal
- `/galeria` - Galería de fotos/videos
- `/tienda` - Tienda online
- `/api/galeria/` - API de galería
- `/admin/` - Panel de administración 