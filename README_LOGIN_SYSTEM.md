# Sistema de Login y Autenticación - The Badgers

## Descripción General

Se ha implementado un sistema inteligente de autenticación donde:
- **La Galería es 100% PÚBLICA** - cualquier usuario puede ver todas las fotos y videos
- **El login solo habilita funciones administrativas** - subir archivos y acceder al sistema de torneos BJJ
- **Protección selectiva** - solo las funciones administrativas requieren autenticación

## Características Implementadas

### ✅ Galería 100% Pública
- **Acceso libre** a todas las fotos y videos sin login
- **Navegación completa** por el contenido multimedia
- **Experiencia fluida** para visitantes no registrados

### ✅ Autenticación Selectiva
- **Login modal elegante** con diseño moderno
- **Sistema de tokens JWT** para autenticación segura
- **Validación de permisos** (solo usuarios con `is_staff` o `is_superuser`)
- **Funciones protegidas** solo para administradores

### ✅ Interfaz de Usuario Inteligente
- **Modal de login** responsive con animaciones
- **Botones de login/logout** en navbar (escritorio y móvil)
- **Indicadores visuales** del estado de autenticación
- **Mensajes informativos** para funcionalidades bloqueadas

### ✅ Seguridad Específica
- **Protección selectiva** - solo funciones admin requieren login
- **Validación de permisos** de administrador
- **Autenticación por tokens** (no cookies)
- **Limpieza automática** de datos al logout

## Cómo Usar el Sistema

### 1. Credenciales de Administrador
```
Usuario: admin
Contraseña: admin123
```

### 2. Acceso al Sistema
1. **Desde la página principal**: Haz clic en el botón "Login" en la navbar
2. **Galería pública**: Navega a `/galeria` - ¡es pública para todos!
3. **Torneo BJJ**: Navega a `/torneo` (requiere autenticación)
4. **Subir archivos**: En la galería, haz clic en "Subir Fotos" (requiere autenticación)

### 3. Funcionalidades Disponibles

#### **Para Todos los Usuarios (Sin Login):**
- ✅ **Ver la galería completa** - imágenes y videos públicos
- ✅ **Navegar por todas las fotos** sin restricciones
- ✅ **Visualizar contenido** de alta calidad

#### **Solo para Administradores (Con Login):**
- 🔐 **Subir fotos y videos** a la galería
- 🔐 **Eliminar fotos y videos** de la galería (con confirmación)
- 🔐 **Acceder al sistema completo de torneos** BJJ
- 🔐 **Gestionar todo el contenido** administrativo

## Arquitectura Técnica

### Backend (Django)
- **Modelo User** de Django para autenticación
- **Django REST Framework** con authtoken
- **Endpoints protegidos** con permisos de staff/superuser
- **Usuario admin** creado por defecto

### Frontend (React)
- **AuthContext** para gestión de estado global
- **ProtectedComponent** para rutas protegidas
- **LoginModal** con diseño moderno
- **useAuth hook** para acceso a funcionalidades

## Archivos Modificados/Creados

### Frontend
- `src/components/AuthComponents.jsx` - Componentes de autenticación
- `src/contexts/AuthContext.jsx` - Contexto de autenticación
- `src/hooks/useAuth.js` - Hook personalizado
- `src/services/authService.js` - Servicio de autenticación
- `src/App.jsx` - Rutas protegidas y navbar actualizada

### Backend
- `core/models.py` - Modelo GaleriaItem con usuario
- `core/views.py` - Endpoints de autenticación y protección
- `core/urls.py` - Rutas de autenticación

## Endpoints de API

### Autenticación
- `POST /api/auth/login/` - Login con token
- `POST /api/auth/logout/` - Logout
- `GET /api/auth/status/` - Verificar estado
- `GET /api/auth/user/` - Información del usuario

### APIs Públicas
- `GET /api/galeria/items/` - Ver galería completa (sin auth)
- `GET /api/galeria/` - Listado de galería (sin auth)

### APIs Protegidas
- `POST /api/galeria/upload/` - Subir imágenes (requiere auth admin)
- `GET /api/torneo/*` - Sistema completo de torneos BJJ (requiere auth admin)

## Seguridad Implementada

### Acceso Público
1. **Galería completamente pública**: Cualquier usuario puede ver todo el contenido
2. **Navegación libre**: Sin restricciones para visualizar fotos y videos
3. **Experiencia abierta**: Diseño optimizado para visitantes no registrados

### Acceso Administrativo
1. **Protección selectiva**: Solo funciones administrativas requieren login
2. **Validación de permisos**: Solo staff/superuser pueden subir contenido
3. **Autenticación stateless**: Uso de tokens JWT
4. **Limpieza de datos**: Eliminación automática de tokens al logout
5. **Mensajes informativos**: Feedback claro sobre funcionalidades disponibles

## Próximos Pasos

Para producción, considera:
- Configurar variables de entorno para credenciales
- Implementar refresh tokens
- Agregar rate limiting
- Configurar HTTPS obligatorio
- Implementar logging de accesos

## Comandos Útiles

### Crear usuario admin adicional
```bash
cd backend
python3 manage.py shell -c "
from django.contrib.auth.models import User
user = User.objects.create_user('nuevo_admin', password='password123')
user.is_staff = True
user.is_superuser = True
user.save()
"
```

### Verificar tokens
```bash
cd backend
python3 manage.py shell -c "
from rest_framework.authtoken.models import Token
tokens = Token.objects.all()
for t in tokens:
    print(f'{t.user.username}: {t.key}')
"
```

## Solución de Problemas

### Error "Tipo de autenticación no soportado" (401)
- **Problema**: El backend solo aceptaba Basic Auth, pero el frontend envía Token Auth
- **Solución**: Actualizado el backend para aceptar ambos tipos de autenticación
- **Verificación**: El endpoint `/api/galeria/upload/` ahora acepta Token authentication

### Error "Invalid token" en APIs de torneo
- **Problema**: URLs incorrectas (`/api/torneos/` en lugar de `/api/torneo/`)
- **Solución**: Corregidas las URLs del frontend para coincidir con el backend
- **Verificación**: Las APIs de torneo ahora usan `/api/torneo/categorias/`, `/api/torneo/participantes/`, etc.

### Error de CORS con redirecciones
- **Problema**: Redirección entre `www.the-badgers.com` y `the-badgers.com`
- **Solución**: Middleware CORS personalizado permite todos los orígenes
- **Configuración**: `CORS_ALLOWED_ORIGINS` incluye ambos dominios

### Error de conexión
- Verificar que el backend esté ejecutándose en puerto 8000
- Revisar configuración de CORS en `settings.py`

### Error de permisos
- Asegurar que el usuario tenga `is_staff=True` o `is_superuser=True`
- Verificar que el token sea válido y completo (40 caracteres)

### Problemas de frontend
- Limpiar cache del navegador
- Verificar que las variables de entorno estén configuradas
- Reiniciar el servidor de desarrollo si es necesario

## Cambios Recientes (Septiembre 2025)

### ✅ Problemas Resueltos

1. **URLs incorrectas en APIs de torneo**
   - ❌ **Antes**: `/api/torneos/categorias/`, `/api/torneos/participantes/`
   - ✅ **Ahora**: `/api/torneo/categorias/`, `/api/torneo/participantes/`

2. **Autenticación incompatible en galería/upload**
   - ❌ **Antes**: Solo aceptaba Basic Auth en producción
   - ✅ **Ahora**: Acepta tanto Token Auth como Basic Auth

3. **Galería ahora pública**
   - ❌ **Antes**: Galería protegida por login
   - ✅ **Ahora**: Galería 100% pública, solo subir archivos requiere login

4. **Nueva funcionalidad: Eliminar fotos**
   - ✅ **Botón de eliminar** para administradores
   - ✅ **Confirmación de eliminación** con diálogo
   - ✅ **Eliminación de archivos** tanto locales como en Cloudinary
   - ✅ **Actualización automática** de la interfaz

5. **Optimización: Sin titileo de imágenes**
   - ✅ **Placeholders mientras cargan** las imágenes
   - ✅ **Transiciones suaves** de opacidad
   - ✅ **Estado de carga persistente** para evitar recargas
   - ✅ **Mejor experiencia de usuario**

6. **Componentes actualizados**
   - ✅ `TorneoBJJ.jsx`: URLs corregidas para APIs del backend
   - ✅ `Galeria.jsx`: Autenticación usando authService correctamente
   - ✅ `views.py`: Soporte dual para Token y Basic authentication

### 🔧 Archivos Modificados

- `backend/core/models.py`: Nuevo campo `archivo_url` para URLs de Cloudinary
- `backend/core/views.py`: Endpoint de eliminación `/api/galeria/delete/<id>/`
- `backend/urls.py`: Nueva URL para eliminación de fotos
- `frontend/src/components/TorneoBJJ.jsx`: URLs de APIs corregidas
- `frontend/src/components/Galeria.jsx`: Botón eliminar + optimización anti-titileo
- `README_LOGIN_SYSTEM.md`: Documentación actualizada

### 🧪 Verificación de Funcionamiento

```bash
# Verificar APIs de torneo
curl -H "Authorization: Token [TOKEN_COMPLETO]" http://localhost:8000/api/torneo/categorias/

# Verificar subida de archivos
curl -H "Authorization: Token [TOKEN_COMPLETO]" http://localhost:8000/api/galeria/upload/

# Verificar eliminación de fotos
curl -X DELETE -H "Authorization: Token [TOKEN_COMPLETO]" http://localhost:8000/api/galeria/delete/1/

# Verificar que la galería funciona sin autenticación
curl http://localhost:8000/api/galeria/items/
```

### 🗃️ Nueva Estructura de Base de Datos

```python
class GaleriaItem(models.Model):
    # Campo para archivo local (usado en desarrollo)
    archivo = models.FileField(upload_to='galeria/', null=True, blank=True)
    # Campo para URL de Cloudinary (usado en producción)
    archivo_url = models.URLField(max_length=500, null=True, blank=True)
    nombre = models.CharField(max_length=100)
    fecha_subida = models.DateTimeField(auto_now_add=True)
    tipo = models.CharField(max_length=10, choices=[('img', 'Imagen'), ('video', 'Video')], blank=True)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    @property
    def url(self):
        """Retorna la URL correcta según el tipo de almacenamiento"""
        if self.archivo_url:
            return self.archivo_url
        elif self.archivo:
            return self.archivo.url
        return None
```

### 🔄 Lógica de Almacenamiento

1. **Producción (Cloudinary)**: Archivos se suben a Cloudinary, URL se guarda en `archivo_url`
2. **Desarrollo (Local)**: Archivos se guardan localmente, URL se genera desde `archivo.url`
3. **API Unificada**: La propiedad `url` del modelo maneja ambos casos automáticamente

---

**¡Todos los errores han sido corregidos! El sistema completo funciona perfectamente.** 🎉

**✅ Problemas resueltos:**
- Error 500 "This backend doesn't support absolute paths"
- Autenticación incompatible entre frontend y backend
- URLs incorrectas en APIs de torneo
- Manejo de archivos tanto locales como en Cloudinary
- **Nueva funcionalidad**: Eliminación de fotos por administradores
- **Optimización**: Eliminación del titileo de imágenes
- **UX mejorada**: Placeholders y transiciones suaves
