import uuid
import zipfile
from pathlib import Path
from django.conf import settings
from django.core.files.storage import default_storage
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from equipos.models import Equipo
from nucleo.api import LiderEscribe, confirmar_proyecto, proyectos_visibles
from .models import Plantilla, Minuta, ComentarioMinuta
from .serializers import PlantillaSerializer, MinutaSerializer, ComentarioSerializer

class PlantillaViewSet(viewsets.ModelViewSet):
    serializer_class = PlantillaSerializer
    permission_classes = [LiderEscribe]
    def get_queryset(self):
        qs = Plantilla.objects.filter(Q(equipo__proyecto__in=proyectos_visibles(self.request.user)) | Q(equipo__isnull=True)).distinct().order_by('-id')
        proyecto = self.request.query_params.get('proyecto')
        if proyecto: qs = qs.filter(Q(equipo__proyecto_id=proyecto) | Q(equipo__isnull=True))
        return qs
    def perform_create(self, serializer):
        equipo = serializer.validated_data.get('equipo')
        if equipo: confirmar_proyecto(self.request.user, equipo.proyecto, escritura=True)
        serializer.save(creado_por=self.request.user)
    def perform_update(self, serializer):
        if serializer.instance.creado_por_id != self.request.user.id:
            raise PermissionDenied('Solo quien creó la plantilla puede modificarla.')
        equipo = serializer.validated_data.get('equipo')
        if equipo: confirmar_proyecto(self.request.user, equipo.proyecto, escritura=True)
        serializer.save()
    def perform_destroy(self, instance):
        if instance.creado_por_id != self.request.user.id:
            raise PermissionDenied('Solo el autor puede eliminar la plantilla.')
        instance.delete()

class MinutaViewSet(viewsets.ModelViewSet):
    serializer_class = MinutaSerializer
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    def get_queryset(self):
        qs = Minuta.objects.filter(equipo__proyecto__in=proyectos_visibles(self.request.user)).select_related('equipo', 'creado_por', 'plantilla').order_by('-fecha_registro')
        if self.request.query_params.get('proyecto'): qs = qs.filter(equipo__proyecto_id=self.request.query_params['proyecto'])
        if self.request.query_params.get('mios') == '1': qs = qs.filter(creado_por=self.request.user)
        return qs
    def perform_create(self, serializer):
        confirmar_proyecto(self.request.user, serializer.validated_data['equipo'].proyecto)
        serializer.save(creado_por=self.request.user)
    def perform_update(self, serializer):
        m = serializer.instance
        if m.creado_por_id != self.request.user.id and not (self.request.user.is_staff and m.equipo.proyecto.creado_por_id == self.request.user.id):
            raise PermissionDenied('Solo el autor o líder puede editar esta minuta.')
        if serializer.validated_data.get('equipo', m.equipo) != m.equipo:
            raise ValidationError({'equipo': 'No se permite mover una minuta de equipo.'})
        serializer.save()
    def perform_destroy(self, instance):
        if instance.creado_por_id != self.request.user.id and not (self.request.user.is_staff and instance.equipo.proyecto.creado_por_id == self.request.user.id):
            raise PermissionDenied('Solo el autor o líder puede eliminarla.')
        instance.delete()
    @action(detail=True, methods=['get', 'post'])
    def comentarios(self, request, pk=None):
        minuta = self.get_object()
        if request.method == 'GET':
            return Response(ComentarioSerializer(minuta.comentarios.select_related('usuario').order_by('id'), many=True).data)
        contenido = str(request.data.get('contenido', '')).strip()
        if not contenido: raise ValidationError({'contenido': 'Escribe un comentario.'})
        c = ComentarioMinuta.objects.create(minuta=minuta, usuario=request.user, contenido=contenido)
        return Response(ComentarioSerializer(c).data, status=201)

@api_view(['POST'])
def subir_word(request):
    archivo = request.FILES.get('archivo')
    if not archivo or not archivo.name.lower().endswith('.docx') or archivo.size > 10 * 1024 * 1024:
        raise ValidationError({'archivo': 'Envía un Word .docx de máximo 10 MB.'})
    try:
        with zipfile.ZipFile(archivo) as z:
            if 'word/document.xml' not in z.namelist(): raise ValueError()
    except (zipfile.BadZipFile, ValueError):
        raise ValidationError({'archivo': 'El archivo no es un Word .docx válido.'})
    archivo.seek(0)
    ruta = default_storage.save(f'documentos/{uuid.uuid4().hex}.docx', archivo)
    return Response({'url': settings.MEDIA_URL + ruta}, status=201)
