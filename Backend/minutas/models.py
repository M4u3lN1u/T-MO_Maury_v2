from django.conf import settings
from django.db import models

class Plantilla(models.Model):
    nombre = models.CharField(max_length=120)
    equipo = models.ForeignKey('equipos.Equipo', on_delete=models.CASCADE, null=True, blank=True, related_name='plantillas')
    contenido_html = models.TextField(blank=True)
    archivo = models.CharField(max_length=500, blank=True)
    creado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.nombre

class Minuta(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.CharField(max_length=300, blank=True)
    equipo = models.ForeignKey('equipos.Equipo', on_delete=models.PROTECT, related_name='minutas')
    plantilla = models.ForeignKey(Plantilla, on_delete=models.SET_NULL, null=True, blank=True)
    contenido_html = models.TextField(blank=True)
    archivo = models.CharField(max_length=500, blank=True)
    fecha_inicio = models.DateTimeField(null=True, blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    creado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='minutas_tmo')
    def __str__(self): return self.nombre

class ComentarioMinuta(models.Model):
    minuta = models.ForeignKey(Minuta, on_delete=models.CASCADE, related_name='comentarios')
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    contenido = models.TextField(max_length=3000)
    fecha_registro = models.DateTimeField(auto_now_add=True)
