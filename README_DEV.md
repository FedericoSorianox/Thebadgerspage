# The Badgers Page - Guía de Desarrollo

## 📋 Requisitos Previos

- **Python 3.9+** (recomendado 3.9.6 o superior)
- **Node.js 18+** (recomendado 21.5.0 o superior)
- **npm 8+** (recomendado 10.2.4 o superior)

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd Thebadgerspage
```

### 2. Configurar el Backend (Django)

```bash
# Entrar al directorio del backend
cd backend

# Crear entorno virtual
python3 -m venv venv

# Activar el entorno virtual
source venv/bin/activate  # En macOS/Linux
# venv\Scripts\activate  # En Windows

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar migraciones
USE_SQLITE=true python manage.py migrate

# Verificar que todo esté correcto
USE_SQLITE=true python manage.py check
```

### 3. Configurar el Frontend (React)

```bash
# Entrar al directorio del frontend
cd ../frontend

# Instalar dependencias
npm install
```

## 🏃‍♂️ Ejecutar el Proyecto

### Opción 1: Script Automático (Recomendado)
```bash
# Desde la raíz del proyecto
./start_dev.sh
```

### Opción 2: Manual

#### Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate
USE_SQLITE=true python manage.py runserver 8000
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **Admin Django**: http://localhost:8000/admin/

## 📁 Estructura del Proyecto

```
Thebadgerspage/
├── backend/                 # Backend Django
│   ├── core/               # Aplicación principal
│   ├── manage.py           # Script de gestión Django
│   ├── requirements.txt    # Dependencias Python
│   └── venv/              # Entorno virtual
├── frontend/               # Frontend React
│   ├── src/               # Código fuente React
│   ├── package.json       # Dependencias Node.js
│   └── vite.config.js     # Configuración Vite
├── start_dev.sh           # Script de inicio automático
└── README_DEV.md          # Esta guía
```

## 🔧 Configuración de Base de Datos

### Desarrollo Local (SQLite)
El proyecto está configurado para usar SQLite en desarrollo local. La base de datos se crea automáticamente en `backend/db.sqlite3`.

### Producción (PostgreSQL)
Para producción, se usa PostgreSQL. Las credenciales están configuradas en `backend/core/settings.py`.

## 🛠️ Comandos Útiles

### Backend
```bash
# Crear superusuario
USE_SQLITE=true python manage.py createsuperuser

# Ejecutar tests
USE_SQLITE=true python manage.py test

# Crear migraciones
USE_SQLITE=true python manage.py makemigrations

# Aplicar migraciones
USE_SQLITE=true python manage.py migrate
```

### Frontend
```bash
# Construir para producción
npm run build

# Ejecutar linting
npm run lint

# Vista previa de producción
npm run preview
```

## 🐛 Solución de Problemas

### Error: "No module named 'psycopg2'"
- **Solución**: El proyecto está configurado para usar SQLite en desarrollo. Asegúrate de usar `USE_SQLITE=true` antes de los comandos de Django.

### Error: "Port already in use"
- **Solución**: Detén los procesos que estén usando los puertos 8000 o 5173:
```bash
lsof -ti:8000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Error: "Node version not supported"
- **Solución**: Actualiza Node.js a la versión 18+ o usa nvm para cambiar versiones:
```bash
nvm use 18
```

## 📝 Notas de Desarrollo

- El backend usa Django 4.2.10 con Django REST Framework
- El frontend usa React 19.1.0 con Vite
- Se usa TailwindCSS para estilos
- La base de datos por defecto es SQLite para desarrollo
- CORS está configurado para permitir comunicación entre frontend y backend

## 🔒 Variables de Entorno

Para desarrollo local, las siguientes variables están configuradas por defecto:
- `DEBUG=True`
- `USE_SQLITE=true`
- `SECRET_KEY=dev-secret-key-1234567890abcdef`

Para producción, configura las variables de entorno necesarias en tu servidor.
