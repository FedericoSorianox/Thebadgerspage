# Sistema de Autenticación - The Badgers Page

## 📋 Resumen

Sistema unificado de autenticación que combina:
- Galería pública para ver fotos; subir requiere autenticación (compatibilidad con Basic actual).
- Sistema de Torneo BJJ con autenticación por Token para operaciones protegidas; solo admins pueden modificar.

## 🎯 Funcionalidad

### Galería
- Ver fotos: público (GET)
- Subir/gestionar: requiere autenticación (Basic actual, sin cambios)

### Torneo BJJ
- Lectura (GET torneos/categorías/llaves/luchas): pública
- Escritura (POST/PUT/DELETE/acciones): requiere Token y rol admin (is_staff o is_superuser)

## 🏗️ Arquitectura

### Frontend (React)
- Contexto `AuthProvider` + `ProtectedComponent` para login/logout y protección de rutas.
- Cliente API con Token en `src/services/api-new.js`.
- Servicios: `torneoAPI`, `categoriaAPI`, `participanteAPI`, `llaveAPI`, `luchaAPI` (todas las mutaciones envían `Authorization: Token <token>`).

### Backend (Django + DRF)
- DRF con `TokenAuthentication` habilitada y permisos por defecto `IsAuthenticatedOrReadOnly`.
- Permiso custom `IsAdminOrReadOnly` aplicado a todos los ViewSets de torneo.
- Endpoints de auth: `/api/auth/login/`, `/api/auth/logout/`, `/api/auth/status/`.
- CORS expone cabecera `Authorization` y permite credenciales.

## 🔧 Implementación Técnica

### Autenticación para Torneo (DRF Token)
- Login: `POST /api/auth/login/` → devuelve `{ token, user }`
- Logout: `POST /api/auth/logout/`
- Estado: `GET /api/auth/status/`
- Header requerido en mutaciones: `Authorization: Token <token>`

### Permisos
- `IsAdminOrReadOnly`: GET público, mutaciones solo si el usuario está autenticado y es admin.

### Almacenamiento
- Frontend guarda `auth_token` y `user_data` en `localStorage` y los inyecta en headers vía `authService.getAuthHeaders()`.

## 🚀 Flujo de Usuario

- Usuario anónimo: ve la galería; al entrar a /torneo se muestra login (UI) y no accede al dashboard hasta autenticarse.
- Usuario autenticado (no admin): puede navegar y leer datos; no puede modificar (403 en mutaciones).
- Admin autenticado: puede crear/editar/eliminar torneos/categorías/etc.

## 🌐 Endpoints

### Públicos
- `GET /api/galeria/`
- `GET /api/torneo/torneos/`, `GET /api/torneo/categorias/`, `GET /api/torneo/llaves/`, `GET /api/torneo/luchas/`

### Protegidos (Token + admin)
- `POST|PUT|DELETE /api/torneo/torneos/*`
- `POST|PUT|DELETE /api/torneo/categorias/*`
- `POST|PUT|DELETE /api/torneo/llaves/*`
- `POST /api/torneo/llaves/{id}/generar_automatica/`
- `POST|PUT|DELETE /api/torneo/luchas/*` y acciones (`iniciar`, `finalizar`, etc.)

### Galería (compatibilidad)
- `POST /api/galeria/upload/` (requiere Basic)

## ✅ Validación

### Casos de Prueba
1. **Acceso público a galería**: ✅ Funciona sin login
2. **Upload requiere auth**: ✅ Pide credenciales válidas
3. **Torneo requiere auth**: ✅ Bloquea acceso sin login
4. **Credenciales inválidas**: ✅ Rechaza y limpia localStorage
5. **Auto-login**: ✅ Recuerda sesión entre visitas
6. **Logout**: ✅ Limpia estado y credenciales

---

**Estado**: actualizado a Token Auth para Torneo. Galería mantiene Basic para upload.
**Última actualización**: Octubre 2023
**Desarrollador**: Federico Soriano
