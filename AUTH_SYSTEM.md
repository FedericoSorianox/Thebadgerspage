# Sistema de Autenticación - The Badgers Page

## 📋 Resumen

Sistema unificado de autenticación para la aplicación web de The Badgers que permite:

- **Acceso público a la galería** (solo visualización)
- **Autenticación requerida** para subir fotos y acceder al torneo BJJ
- **Seguridad robusta** con verificación real de usuarios

## 🎯 Funcionalidad

### Galería
- ✅ **Pública para ver fotos**: Cualquier persona puede acceder y ver todas las fotos
- 🔐 **Login requerido para subir**: Solo usuarios autenticados pueden subir fotos/videos
- 📱 **UI adaptativa**: Muestra botón de login solo cuando se necesita subir contenido

### Torneo BJJ
- 🔐 **Acceso completamente restringido**: Requiere autenticación para acceder
- 👨‍🏫 **Solo para instructores**: Diseñado para administradores del gimnasio
- 🛡️ **Verificación de credenciales**: Validación real contra la base de datos Django

## 🏗️ Arquitectura

### Frontend (React)
```
App.jsx (Estado compartido de login)
├── Galeria.jsx (Público + login para upload)
└── TorneoBJJ.jsx (Requiere autenticación)
```

### Backend (Django)
```
/api/galeria/          → GET público, otros métodos requieren auth
/api/galeria/upload/   → Todos los métodos requieren auth
/api/torneo/*          → Todos los endpoints requieren auth
```

## 🔧 Implementación Técnica

### Verificación de Credenciales
- **Método**: HTTP Basic Authentication
- **Endpoint de verificación**: `GET /api/galeria/upload/`
- **Validación**: Django `authenticate()` + verificación de usuario activo

### Almacenamiento de Sesión
- **Frontend**: localStorage para persistencia
- **Seguridad**: Credenciales verificadas en cada carga de página
- **Cleanup**: Auto-limpieza si credenciales son inválidas

### Control de Acceso
```python
# Backend - views.py
def galeria_list(request):
    if request.method != 'GET':  # Solo GET es público
        # Verificar autenticación para POST, PUT, DELETE
        
def galeria_upload(request):
    # Siempre requiere autenticación
    # GET = verificación de credenciales
    # POST = subir archivo
```

## 🚀 Flujo de Usuario

### Usuario Anónimo
1. Accede a `/galeria` → Ve todas las fotos sin problemas
2. Intenta subir foto → Se le pide login
3. Accede a `/torneo` → Se le pide login

### Usuario Autenticado
1. Hace login → Credenciales se guardan en localStorage
2. Accede a `/galeria` → Ve fotos + puede subir contenido
3. Accede a `/torneo` → Acceso completo al sistema de torneos

## 🛡️ Seguridad

### Validaciones Backend
- ✅ Autenticación con Django `authenticate()`
- ✅ Verificación de usuario activo
- ✅ Control de acceso por método HTTP
- ✅ Validación de credenciales en cada request sensible

### Validaciones Frontend
- ✅ Verificación automática al cargar página
- ✅ Limpieza de credenciales inválidas
- ✅ UI que refleja estado de autenticación real
- ✅ No exposición de endpoints protegidos

## 🔄 Estados de Autenticación

| Estado | Galería (Ver) | Galería (Subir) | Torneo |
|--------|---------------|-----------------|--------|
| No autenticado | ✅ Acceso | ❌ Login required | ❌ Login required |
| Autenticado | ✅ Acceso | ✅ Acceso | ✅ Acceso |

## 📝 Usuarios de Prueba

Para desarrollo local:
```bash
# Usuario admin
username: admin
password: password123

# Crear nuevo usuario
cd backend
python manage.py createsuperuser
```

## 🌐 Endpoints

### Públicos
- `GET /api/galeria/` - Ver fotos (acceso público)

### Protegidos
- `POST /api/galeria/` - Modificar galería
- `GET|POST /api/galeria/upload/` - Verificar auth / Subir archivos
- `ALL /api/torneo/*` - Sistema de torneos completo

## 🎨 UI/UX

### Galería
- **Siempre muestra fotos** sin restricciones
- **Botón contextual**: "Iniciar Sesión para Subir Fotos" aparece solo cuando no autenticado
- **Experiencia fluida**: Ver fotos no requiere ningún paso adicional

### Torneo
- **Pantalla de acceso**: Prompt elegante para login
- **Información clara**: Explica que es para instructores/organizadores
- **Login integrado**: Formulario en la misma página

## 🔧 Configuración

### Desarrollo
```bash
# Backend
cd backend
source venv/bin/activate
python manage.py runserver

# Frontend  
cd frontend
npm run dev
```

### Producción
- URL Backend: `https://thebadgerspage.onrender.com`
- URL Frontend: Servido desde el mismo dominio
- Variables de entorno configuradas en Render

## ✅ Validación

### Casos de Prueba
1. **Acceso público a galería**: ✅ Funciona sin login
2. **Upload requiere auth**: ✅ Pide credenciales válidas
3. **Torneo requiere auth**: ✅ Bloquea acceso sin login
4. **Credenciales inválidas**: ✅ Rechaza y limpia localStorage
5. **Auto-login**: ✅ Recuerda sesión entre visitas
6. **Logout**: ✅ Limpia estado y credenciales

---

**Estado**: ✅ Implementado y funcionando
**Última actualización**: Agosto 2025
**Desarrollador**: Federico Soriano
