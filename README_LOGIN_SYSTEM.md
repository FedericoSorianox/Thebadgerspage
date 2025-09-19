# Sistema de Login y Autenticación - The Badgers

## Descripción General

Se ha implementado un sistema completo de login con autenticación de administradores para proteger las secciones de **Galería** y **Torneo BJJ** de la aplicación.

## Características Implementadas

### ✅ Autenticación Completa
- **Login modal elegante** con diseño moderno
- **Sistema de tokens JWT** para autenticación segura
- **Validación de permisos** (solo usuarios con `is_staff` o `is_superuser`)
- **Protección de rutas** con redireccionamiento automático

### ✅ Interfaz de Usuario
- **Modal de login** responsive con animaciones
- **Botones de login/logout** en navbar (escritorio y móvil)
- **Indicadores visuales** de estado de autenticación
- **Mensajes de error** informativos

### ✅ Seguridad
- **Protección de rutas** para Galería y Torneo BJJ
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
2. **Acceso directo**: Navega a `/galeria` o `/torneo` (se mostrará modal de login automáticamente)
3. **Modal de login**: Ingresa las credenciales y confirma

### 3. Funcionalidades Disponibles
Una vez autenticado como admin podrás:
- **Subir fotos** a la galería
- **Acceder al sistema de torneos** BJJ
- **Gestionar contenido** administrativo

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

### Contenido Protegido
- `POST /api/galeria/upload/` - Subir imágenes (requiere auth)
- `GET /api/torneo/*` - APIs del sistema de torneos (requiere auth)

## Seguridad Implementada

1. **Protección de rutas**: Solo usuarios autenticados pueden acceder
2. **Validación de permisos**: Solo staff/superuser pueden subir contenido
3. **Autenticación stateless**: Uso de tokens JWT
4. **Limpieza de datos**: Eliminación automática de tokens al logout
5. **Mensajes informativos**: Feedback claro al usuario sobre permisos

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

### Error de conexión
- Verificar que el backend esté ejecutándose en puerto 8000
- Revisar configuración de CORS en `settings.py`

### Error de permisos
- Asegurar que el usuario tenga `is_staff=True` o `is_superuser=True`
- Verificar que el token sea válido

### Problemas de frontend
- Limpiar cache del navegador
- Verificar que las variables de entorno estén configuradas

---

**¡El sistema de login está completamente funcional y listo para usar!** 🎉
