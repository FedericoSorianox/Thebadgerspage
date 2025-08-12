# CONFIGURACIÓN CLOUDINARY PARA RENDER
# ====================================

# Variables de entorno que necesitas agregar en Render Dashboard:
# Ir a: https://dashboard.render.com/web/srv-XXX/env

CLOUDINARY_CLOUD_NAME=dt6u9vkqp
CLOUDINARY_API_KEY=837265473969433  
CLOUDINARY_API_SECRET=5r_2IEStR3TrkCjQKHQoXoL1iA8

# PASOS PARA CONFIGURAR:
# =====================

# 1. Ve a Render Dashboard
# 2. Selecciona tu servicio "thebadgerspage"
# 3. Ve a "Environment" 
# 4. Agrega estas 3 variables de entorno
# 5. Haz "Manual Deploy" para aplicar cambios

# Una vez configurado, las imágenes se guardarán en Cloudinary 
# y no se perderán entre deployments.

# NOTA: Estas credenciales ya están en el código, solo necesitan
# ser configuradas como variables de entorno en Render.
