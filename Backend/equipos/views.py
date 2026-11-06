from django.db import IntegrityError, transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from nucleo.api import LiderEscribe, confirmar_proyecto, proyectos_visibles
from .models import Proyecto, Equipo, Funcion, Integrante
from .serializers import ProyectoSerializer, EquipoSerializer, FuncionSerializer, IntegranteSerializer, AgregarIntegranteSerializer

class ProyectoViewSet(viewsets.ModelViewSet):
    serializer_class = ProyectoSerializer
    permission_classes = [LiderEscribe]
    http_method_names = ['get', 'post', 'patch', 'head', 'options']
    def get_queryset(self): return proyectos_visibles(self.request.user).order_by('id')
    def perform_create(self, serializer): serializer.save(creado_por=self.request.user)
    def perform_update(self, serializer):
        confirmar_proyecto(self.request.user, serializer.instance, escritura=True)
        serializer.save()
    @action(detail=True, methods=['get'])
    def miembros(self, request, pk=None):
        proyecto = self.get_object()
        entradas = Integrante.objects.filter(equipo__proyecto=proyecto).select_related('usuario', 'equipo', 'funcion')
        return Response([{'usuario_id': m.usuario_id, 'usuario': m.usuario.get_full_name(),
                          'funcion': m.funcion.nombre, 'funcion_color': m.funcion.color,
                          'equipo': m.equipo_id, 'equipo_nombre': m.equipo.nombre} for m in entradas])

class FuncionViewSet(viewsets.ModelViewSet):
    serializer_class = FuncionSerializer
    permission_classes = [LiderEscribe]
    queryset = Funcion.objects.order_by('nombre')
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    def perform_destroy(self, instance):
        if instance.integrante_set.exists():
            raise ValidationError({'detail': 'La función ya tiene integrantes.'})
        instance.delete()

class EquipoViewSet(viewsets.ModelViewSet):
    serializer_class = EquipoSerializer
    permission_classes = [LiderEscribe]
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    def get_queryset(self):
        qs = Equipo.objects.filter(proyecto__in=proyectos_visibles(self.request.user)).select_related('proyecto').prefetch_related('integrantes__usuario', 'integrantes__funcion')
        if self.request.query_params.get('proyecto'):
            qs = qs.filter(proyecto_id=self.request.query_params['proyecto'])
        return qs.order_by('nombre')
    def perform_create(self, serializer):
        confirmar_proyecto(self.request.user, serializer.validated_data['proyecto'], escritura=True)
        try:
            with transaction.atomic(): serializer.save()
        except IntegrityError:
            raise ValidationError({'nombre': 'Ya existe un equipo con ese nombre en el proyecto.'})
    def perform_update(self, serializer):
        confirmar_proyecto(self.request.user, serializer.instance.proyecto, escritura=True)
        destino = serializer.validated_data.get('proyecto', serializer.instance.proyecto)
        if destino != serializer.instance.proyecto:
            raise ValidationError({'proyecto': 'No puedes mover un equipo a otro proyecto.'})
        serializer.save()
    def perform_destroy(self, instance):
        confirmar_proyecto(self.request.user, instance.proyecto, escritura=True)
        if instance.minutas.exists():
            raise ValidationError({'detail': 'El equipo tiene minutas relacionadas. Reasígnalas antes de eliminarlo.'})
        # Si alguien queda fuera del proyecto, no permitir que quede a cargo de actividades.
        for integrante in instance.integrantes.all():
            otro = Integrante.objects.filter(equipo__proyecto=instance.proyecto,
                usuario_id=integrante.usuario_id).exclude(equipo=instance).exists()
            if not otro and instance.proyecto.actividades.filter(responsable_id=integrante.usuario_id).exists():
                raise ValidationError({'detail': 'Este equipo tiene responsables de actividades. Reasigna esas actividades antes de eliminarlo.'})
        instance.delete()
    @action(detail=True, methods=['post'])
    def integrantes(self, request, pk=None):
        equipo = self.get_object()
        confirmar_proyecto(request.user, equipo.proyecto, escritura=True)
        datos = AgregarIntegranteSerializer(data=request.data)
        datos.is_valid(raise_exception=True)
        try:
            with transaction.atomic(): Integrante.objects.create(equipo=equipo, **datos.validated_data)
        except IntegrityError:
            raise ValidationError({'usuario': 'Este usuario ya pertenece al equipo.'})
        return Response(EquipoSerializer(self.get_object()).data, status=201)
    @action(detail=True, methods=['patch', 'delete'], url_path=r'integrantes/(?P<usuario>\d+)')
    def integrante(self, request, pk=None, usuario=None):
        equipo = self.get_object()
        confirmar_proyecto(request.user, equipo.proyecto, escritura=True)
        registro = get_object_or_404(Integrante, equipo=equipo, usuario_id=usuario)
        if request.method == 'PATCH':
            funcion = get_object_or_404(Funcion, pk=request.data.get('funcion'))
            registro.funcion = funcion
            registro.save(update_fields=['funcion'])
        else:
            # No se borra la membresía del último equipo si tiene actividades asignadas.
            pertenece_a_otro = Integrante.objects.filter(equipo__proyecto=equipo.proyecto, usuario_id=usuario).exclude(equipo=equipo).exists()
            if not pertenece_a_otro and equipo.proyecto.actividades.filter(responsable_id=usuario).exists():
                raise ValidationError({'detail': 'Reasigna sus actividades antes de retirarlo del proyecto.'})
            registro.delete()
        return Response(EquipoSerializer(self.get_object()).data)
