from datetime import date
from pathlib import Path
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from nucleo.api import LiderEscribe, confirmar_proyecto, proyectos_visibles
from .models import Actividad, Entregable, ComentarioActividad
from .serializers import ActividadSerializer, EntregableSerializer, ComentarioSerializer

class ActividadViewSet(viewsets.ModelViewSet):
    serializer_class = ActividadSerializer
    permission_classes = [LiderEscribe]
    def get_queryset(self):
        qs = Actividad.objects.filter(proyecto__in=proyectos_visibles(self.request.user)).select_related('responsable', 'funcion').prefetch_related('entregables')
        if self.request.query_params.get('proyecto'): qs = qs.filter(proyecto_id=self.request.query_params['proyecto'])
        return qs.order_by('fecha_limite', 'id')
    def perform_create(self, serializer):
        confirmar_proyecto(self.request.user, serializer.validated_data['proyecto'], escritura=True)
        serializer.save(creado_por=self.request.user)
    def perform_update(self, serializer):
        confirmar_proyecto(self.request.user, serializer.instance.proyecto, escritura=True)
        serializer.save()
    def perform_destroy(self, instance):
        confirmar_proyecto(self.request.user, instance.proyecto, escritura=True)
        instance.delete()
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def estado(self, request, pk=None):
        actividad = self.get_object()
        if not (request.user.id == actividad.responsable_id or (request.user.is_staff and actividad.proyecto.creado_por_id == request.user.id)):
            raise PermissionDenied('Solo el responsable o líder del proyecto puede cambiar el estado.')
        nuevo = request.data.get('estado')
        if nuevo not in dict(Actividad.ESTADOS): raise ValidationError({'estado': 'Estado inválido.'})
        actividad.estado = nuevo
        actividad.fecha_terminada = date.today() if nuevo == 'terminada' else None
        actividad.save(update_fields=['estado', 'fecha_terminada'])
        return Response(self.get_serializer(actividad).data)
    @action(detail=True, methods=['post', 'get'], permission_classes=[IsAuthenticated])
    def entregables(self, request, pk=None):
        actividad = self.get_object()
        if request.method == 'GET': return Response(EntregableSerializer(actividad.entregables.all(), many=True).data)
        if not (request.user.id == actividad.responsable_id or (request.user.is_staff and actividad.proyecto.creado_por_id == request.user.id)):
            raise PermissionDenied('Solo el responsable o líder puede adjuntar entregables.')
        nombre = str(request.data.get('nombre', '')).strip()
        url = str(request.data.get('url', '')).strip()
        archivo = request.FILES.get('archivo')
        if not nombre:
            raise ValidationError({'nombre': 'Escribe un nombre para el entregable.'})
        if bool(url) == bool(archivo):
            raise ValidationError({'detail': 'Proporciona un enlace o un archivo (solo uno).'})
        if url:
            comprobar = serializers.URLField()
            try: comprobar.run_validation(url)
            except serializers.ValidationError:
                raise ValidationError({'url': 'Escribe un enlace válido.'})
            if not url.startswith(('https://', 'http://')):
                raise ValidationError({'url': 'El enlace debe empezar con HTTP o HTTPS.'})
        if archivo:
            permitidos = {'.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg', '.txt', '.csv'}
            if Path(archivo.name).suffix.lower() not in permitidos or archivo.size > 10 * 1024 * 1024:
                raise ValidationError({'archivo': 'Archivo no permitido o mayor de 10 MB.'})
        e = Entregable.objects.create(actividad=actividad, usuario=request.user, nombre=nombre, url=url, archivo=archivo)
        return Response(EntregableSerializer(e).data, status=201)
    @action(detail=True, methods=['post', 'get'], permission_classes=[IsAuthenticated])
    def comentarios(self, request, pk=None):
        actividad = self.get_object()
        if request.method == 'GET':
            return Response(ComentarioSerializer(actividad.comentarios.select_related('usuario').order_by('id'), many=True).data)
        texto = str(request.data.get('contenido', '')).strip()
        if not texto: raise ValidationError({'contenido': 'Escribe un comentario.'})
        comentario = ComentarioActividad.objects.create(actividad=actividad, usuario=request.user, contenido=texto)
        return Response(ComentarioSerializer(comentario).data, status=201)
