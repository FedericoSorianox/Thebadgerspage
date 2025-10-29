# DESHABILITACION TEMPORAL DEL SISTEMA DE TORNEO BJJ
# 
# Este archivo documenta los cambios realizados para deshabilitar temporalmente
# el sistema de torneo BJJ y permitir que el deploy funcione correctamente.
#
# CAMBIOS REALIZADOS:
# 
# 1. admin.py - Removidos todos los admin classes excepto GaleriaItem
#    - Eliminadas referencias a: Torneo, Categoria, Participante, Llave, Lucha
#    - Solo mantiene: GaleriaItemAdmin
#
# 2. urls.py - Comentadas las rutas del torneo BJJ  
#    - Router comentado para evitar errores de importación
#    - URLs del torneo comentadas
#
# PARA REACTIVAR EL SISTEMA DE TORNEO:
# 1. Descomentar las líneas en urls.py
# 2. Agregar los admin classes de vuelta en admin.py
# 3. Verificar que todas las views del torneo estén funcionando
#
# NOTA: Los modelos siguen existiendo en models.py pero no están expuestos
# en el admin ni en las APIs para evitar errores de importación.

TORNEO_BJJ_HABILITADO = False
