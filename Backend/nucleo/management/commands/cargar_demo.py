from datetime import date, timedelta
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from equipos.models import Proyecto, Equipo, Funcion, Integrante
from actividades.models import Actividad
from minutas.models import Minuta, Plantilla

class Command(BaseCommand):
    help = 'Carga datos de demostración solo cuando no existe el proyecto Demo.'
    def handle(self, *args, **kwargs):
        User = get_user_model()
        miembros = [
            ('elias@ut-tijuana.edu.mx', 'Elias', 'Gomez', True),
            ('mauricio@tmo.local', 'Mauricio', 'Romero', False),
            ('alexa@tmo.local', 'Alexa', 'Perez', False),
        ]
        usuarios = {}
        for correo, nombre, ape, lider in miembros:
            u, creado = User.objects.get_or_create(username=correo, defaults={'email': correo, 'first_name': nombre, 'last_name': ape, 'is_staff': lider})
            if creado:
                u.set_password('Demo1234')
                u.save(update_fields=['password'])
            usuarios[correo] = u
        lider = usuarios[miembros[0][0]]
        proyecto, nuevo = Proyecto.objects.get_or_create(nombre='Proyecto T-MO · Demostración', creado_por=lider,
            defaults={'descripcion': 'Proyecto de ejemplo para los tres módulos del SRS.', 'fecha_inicio': date.today()})
        frontend, _ = Funcion.objects.get_or_create(nombre='Frontend', defaults={'color': '#5A2D7C'})
        backend, _ = Funcion.objects.get_or_create(nombre='Backend', defaults={'color': '#244CA5'})
        gestion, _ = Funcion.objects.get_or_create(nombre='Gestión', defaults={'color': '#2a8a68'})
        equipo, _ = Equipo.objects.get_or_create(proyecto=proyecto, nombre='Equipo de desarrollo')
        for correo, funcion in [(miembros[0][0], gestion), (miembros[1][0], backend), (miembros[2][0], frontend)]:
            Integrante.objects.get_or_create(equipo=equipo, usuario=usuarios[correo], defaults={'funcion': funcion})
        if nuevo:
            hoy = date.today()
            for titulo, descripcion, res, funcion, estado, dias, prioridad in [
                ('Diseñar el tablero de actividades', 'Crear las tarjetas y filtros.', miembros[2][0], frontend, 'en_proceso', 7, 'alta'),
                ('Implementar API de equipos', 'Validar las asignaciones de miembros.', miembros[1][0], backend, 'pendiente', 12, 'media'),
                ('Revisar requerimientos de minutas', 'Definir los campos básicos del documento.', miembros[0][0], gestion, 'terminada', 4, 'baja')]:
                Actividad.objects.create(proyecto=proyecto, titulo=titulo, descripcion=descripcion,
                    responsable=usuarios[res], funcion=funcion, estado=estado, prioridad=prioridad,
                    fecha_inicio=hoy, fecha_limite=hoy + timedelta(days=dias), creado_por=lider,
                    fecha_terminada=hoy if estado == 'terminada' else None)
            p = Plantilla.objects.create(nombre='Minuta de reunión general', equipo=equipo, creado_por=lider,
                contenido_html='<h2>Minuta de reunión</h2><p><strong>Fecha:</strong></p><p><strong>Asistentes:</strong></p><h3>Temas tratados</h3><p></p><h3>Acuerdos y responsables</h3><p></p><h3>Próxima reunión</h3><p></p>')
            Minuta.objects.create(nombre='Reunión inicial de T-MO', equipo=equipo, creado_por=lider, plantilla=p,
                contenido_html='<h2>Minuta de reunión inicial</h2><p>Se acordó organizar las actividades y distribuir responsabilidades.</p>')
        self.stdout.write(self.style.SUCCESS('Datos de demostración preparados.'))
