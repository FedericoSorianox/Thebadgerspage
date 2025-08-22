from django.db import migrations


def populate_default_categories(apps, schema_editor):
    Torneo = apps.get_model('core', 'Torneo')
    Categoria = apps.get_model('core', 'Categoria')

    # Para cada torneo existente, si no tiene categorías, crearlas
    for torneo in Torneo.objects.all():
        if not Categoria.objects.filter(torneo=torneo).exists():
            try:
                # Usamos el método del modelo real si está disponible
                # Nota: en migraciones no debemos importar el modelo actual directamente
                # por eso reimplementamos una versión mínima aquí
                categorias_fijas = [
                    ('Principiante GI - Hasta 70kg', 'principiante_gi', None, 70.0),
                    ('Principiante GI - Hasta 80kg', 'principiante_gi', 70.1, 80.0),
                    ('Principiante GI - Más de 80kg', 'principiante_gi', 80.1, None),

                    ('Intermedio GI - Hasta 70kg', 'intermedio_gi', None, 70.0),
                    ('Intermedio GI - Hasta 80kg', 'intermedio_gi', 70.1, 80.0),
                    ('Intermedio GI - Más de 80kg', 'intermedio_gi', 80.1, None),

                    ('Avanzado GI - Hasta 70kg', 'avanzado_gi', None, 70.0),
                    ('Avanzado GI - Hasta 80kg', 'avanzado_gi', 70.1, 80.0),
                    ('Avanzado GI - Más de 80kg', 'avanzado_gi', 80.1, None),

                    ('Principiante No GI - Hasta 70kg', 'principiante_nogi', None, 70.0),
                    ('Principiante No GI - Hasta 80kg', 'principiante_nogi', 70.1, 80.0),
                    ('Principiante No GI - Más de 80kg', 'principiante_nogi', 80.1, None),

                    ('Intermedio No GI - Hasta 70kg', 'intermedio_nogi', None, 70.0),
                    ('Intermedio No GI - Hasta 80kg', 'intermedio_nogi', 70.1, 80.0),
                    ('Intermedio No GI - Más de 80kg', 'intermedio_nogi', 80.1, None),

                    ('Avanzado No GI - Hasta 70kg', 'avanzado_nogi', None, 70.0),
                    ('Avanzado No GI - Hasta 80kg', 'avanzado_nogi', 70.1, 80.0),
                    ('Avanzado No GI - Más de 80kg', 'avanzado_nogi', 80.1, None),

                    ('Blanca - Hasta 70kg', 'blanca', None, 70.0),
                    ('Blanca - Hasta 80kg', 'blanca', 70.1, 80.0),
                    ('Blanca - Más de 80kg', 'blanca', 80.1, None),

                    ('Azul - Hasta 70kg', 'azul', None, 70.0),
                    ('Azul - Hasta 80kg', 'azul', 70.1, 80.0),
                    ('Azul - Más de 80kg', 'azul', 80.1, None),

                    ('Violeta - Hasta 70kg', 'violeta', None, 70.0),
                    ('Violeta - Hasta 80kg', 'violeta', 70.1, 80.0),
                    ('Violeta - Más de 80kg', 'violeta', 80.1, None),

                    ('Marrón - Hasta 70kg', 'marron', None, 70.0),
                    ('Marrón - Hasta 80kg', 'marron', 70.1, 80.0),
                    ('Marrón - Más de 80kg', 'marron', 80.1, None),

                    ('Negro - Hasta 70kg', 'negro', None, 70.0),
                    ('Negro - Hasta 80kg', 'negro', 70.1, 80.0),
                    ('Negro - Más de 80kg', 'negro', 80.1, None),
                ]

                for nombre, tipo_categoria, peso_min, peso_max in categorias_fijas:
                    Categoria.objects.get_or_create(
                        torneo=torneo,
                        nombre=nombre,
                        defaults={
                            'tipo_categoria': tipo_categoria,
                            'peso_minimo': peso_min,
                            'peso_maximo': peso_max,
                        }
                    )
            except Exception:
                # No abortar toda la migración si un torneo falla
                continue


def noop_reverse(apps, schema_editor):
    # No revertimos la creación de categorías por seguridad
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('core', '0007_alter_torneo_usuario_creador'),
    ]

    operations = [
        migrations.RunPython(populate_default_categories, noop_reverse),
    ]


