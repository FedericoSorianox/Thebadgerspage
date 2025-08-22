from django.db import migrations


def link_participants(apps, schema_editor):
    Atleta = apps.get_model('core', 'Atleta')
    Participante = apps.get_model('core', 'Participante')

    for p in Participante.objects.all():
        if p.atleta_id:
            continue
        atleta, _ = Atleta.objects.get_or_create(
            nombre=p.nombre,
            academia=p.academia,
            defaults={'cinturon_actual': p.cinturon}
        )
        p.atleta_id = atleta.id
        p.save(update_fields=['atleta'])


def reverse_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('core', '0009_atleta_models'),
    ]

    operations = [
        migrations.RunPython(link_participants, reverse_noop),
    ]


