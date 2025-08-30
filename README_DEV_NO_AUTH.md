# 🚀 Desarrollo Sin Autenticación - The Badgers Page

## 📋 Configuración Actual

El proyecto está configurado para **desarrollo sin autenticación** para facilitar las pruebas locales.

## 🔧 Endpoints de Desarrollo

### **Galería (Sin Autenticación)**
- **GET** `/api/dev/galeria/upload/` - Verificar estado del endpoint
- **POST** `/api/dev/galeria/upload/` - Subir archivos sin autenticación

### **Autenticación (Simulada)**
- **GET** `/api/dev/auth/status/` - Siempre devuelve `authenticated: false`
- **POST** `/api/dev/auth/login/` - Login simulado exitoso

### **Torneos (Sin Autenticación)**
- **GET** `/api/torneo/torneos/` - Listar torneos
- **POST** `/api/torneo/torneos/` - Crear torneo
- **PUT** `/api/torneo/torneos/{id}/` - Actualizar torneo
- **DELETE** `/api/torneo/torneos/{id}/` - Eliminar torneo

## 🎯 Cómo Usar

### **1. Frontend (React)**
El frontend está configurado para usar la API de desarrollo automáticamente.

**Archivo de configuración:** `frontend/src/services/api-config.js`
```javascript
export const USE_DEV_API = true; // Cambiar a false para usar API normal
```

### **2. Backend (Django)**
Los endpoints de desarrollo están disponibles automáticamente cuando `DEBUG=True`.

**Verificar configuración:**
```bash
cd backend
source venv/bin/activate
USE_SQLITE=true python manage.py runserver 8000
```

### **3. Probar Endpoints**

**Verificar estado de desarrollo:**
```bash
curl http://localhost:8000/api/dev/galeria/upload/
# Respuesta: {"ok": true, "message": "Endpoint de desarrollo activo - no requiere autenticación", "debug": true}
```

**Verificar autenticación:**
```bash
curl http://localhost:8000/api/dev/auth/status/
# Respuesta: {"authenticated": false, "debug": true, "message": "Modo desarrollo - sin autenticación requerida"}
```

## 🔄 Cambiar a Modo Producción

### **Frontend:**
1. Editar `frontend/src/services/api-config.js`
2. Cambiar `USE_DEV_API = false`
3. Reiniciar el servidor de desarrollo

### **Backend:**
1. Los endpoints de desarrollo solo están disponibles cuando `DEBUG=True`
2. En producción, `DEBUG=False` automáticamente deshabilita estos endpoints

## 📁 Archivos de Configuración

### **Backend:**
- `backend/core/dev_views.py` - Endpoints de desarrollo
- `backend/urls.py` - URLs de endpoints de desarrollo
- `backend/core/views.py` - Endpoint original modificado para desarrollo

### **Frontend:**
- `frontend/src/services/dev-api.js` - API de desarrollo
- `frontend/src/services/api-config.js` - Configuración de API
- `frontend/src/services/api.js` - Wrapper principal

## 🛠️ Comandos Útiles

### **Iniciar Servidores:**
```bash
# Script automático
./start_dev.sh

# Manual
# Terminal 1 - Backend
cd backend && source venv/bin/activate && USE_SQLITE=true python manage.py runserver 8000

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### **Verificar Estado:**
```bash
# Backend
curl http://localhost:8000/api/

# Frontend
curl http://localhost:5173
```

### **Probar Subida de Archivos:**
```bash
# Crear un archivo de prueba
echo "test" > test.txt

# Subir archivo (usando endpoint de desarrollo)
curl -X POST -F "nombre=test" -F "archivo=@test.txt" http://localhost:8000/api/dev/galeria/upload/
```

## 🔒 Seguridad

- Los endpoints de desarrollo **solo están disponibles cuando `DEBUG=True`**
- En producción, estos endpoints están **automáticamente deshabilitados**
- No se requiere autenticación para operaciones CRUD en desarrollo
- Los archivos se guardan localmente en `backend/media/`

## 🐛 Solución de Problemas

### **Error: "Endpoint no disponible en producción"**
- Verificar que `DEBUG=True` en `backend/core/settings.py`
- Reiniciar el servidor backend

### **Error: "No se puede acceder al endpoint"**
- Verificar que el servidor backend esté ejecutándose en puerto 8000
- Verificar que `USE_DEV_API = true` en el frontend

### **Error: "CORS"**
- Los endpoints de desarrollo incluyen headers CORS automáticamente
- Verificar que el frontend esté en `http://localhost:5173`

## 📝 Notas

- **Modo desarrollo:** Sin autenticación, archivos locales, endpoints `/api/dev/`
- **Modo producción:** Con autenticación, Cloudinary, endpoints `/api/`
- Los cambios en `api-config.js` requieren reiniciar el servidor frontend
- Los endpoints de desarrollo son seguros para producción (se deshabilitan automáticamente)
