# Guía de Desarrollo - The Badgers Page

## Configuración del Entorno

### Para Desarrollo (con imágenes de ejemplo)

1. **Configurar entorno de desarrollo:**
   ```bash
   ./setup_dev.sh dev
   ```

2. **Iniciar servidores de desarrollo:**
   ```bash
   ./start_dev.sh
   ```

3. **Acceder a la aplicación:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000
   - Galería: http://localhost:5173/galeria

### Para Producción (con imágenes reales)

1. **Configurar entorno de producción:**
   ```bash
   ./setup_dev.sh prod
   ```

2. **Iniciar servidor de producción:**
   ```bash
   source venv/bin/activate && PORT=8000 npm start
   ```

## Diferencias entre Entornos

### Desarrollo
- **Base de datos:** SQLite local (`db.sqlite3`)
- **Imágenes:** Ejemplos predefinidos con usuarios asignados
- **Usuarios de prueba:** admin, federico_sorianox, instructor, alumno
- **API:** http://localhost:8000
- **Frontend:** http://localhost:5173

### Producción
- **Base de datos:** PostgreSQL en Render
- **Imágenes:** Subidas por usuarios reales
- **API:** Misma URL que el frontend
- **Frontend:** Servido por Django

## Scripts Disponibles

### `setup_dev.sh`
Configura el entorno para desarrollo o producción.

```bash
./setup_dev.sh dev   # Para desarrollo
./setup_dev.sh prod  # Para producción
```

### `start_dev.sh`
Inicia ambos servidores (backend y frontend) para desarrollo.

```bash
./start_dev.sh
```

## Estructura de Archivos

```
Thebadgerspage/
├── backend/
│   ├── core/
│   ├── media/galeria/     # Imágenes de ejemplo
│   ├── db.sqlite3         # Base de datos de desarrollo
│   └── setup_dev_environment.py
├── frontend/
│   ├── src/App.jsx
│   └── setup_dev.js
├── setup_dev.sh           # Configurar entorno
├── start_dev.sh           # Iniciar desarrollo
└── README_DEVELOPMENT.md  # Esta documentación
```

## Notas Importantes

- **Nunca ejecutes `setup_dev.sh dev` en producción**
- **Las imágenes de ejemplo se cargan automáticamente en desarrollo con usuarios asignados**
- **Los cambios en desarrollo no afectan la base de datos de producción**
- **Siempre usa `./setup_dev.sh prod` antes de hacer deploy**
- **Cada imagen muestra qué usuario la subió**

## Usuarios de Prueba

En el entorno de desarrollo, se crean automáticamente los siguientes usuarios:

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | Administrador |
| federico_sorianox | evRWh0Z7 | Usuario |
| instructor | instructor123 | Instructor |
| alumno | alumno123 | Alumno |
| testuser | testpass123 | Usuario de prueba |

Puedes usar cualquiera de estos usuarios para probar la funcionalidad de subida de imágenes.

## Solución de Problemas

### Las imágenes no se muestran
1. Verifica que estés usando el entorno correcto
2. Ejecuta `./setup_dev.sh dev` para recargar las imágenes de ejemplo
3. Reinicia los servidores con `./start_dev.sh`

### Error de base de datos
1. Verifica que `USE_SQLITE=true` esté configurado en desarrollo
2. Elimina `backend/db.sqlite3` y ejecuta `./setup_dev.sh dev` nuevamente

### Error de CORS
1. Verifica que el frontend esté apuntando al backend correcto
2. Ejecuta `./setup_dev.sh dev` para configurar correctamente 