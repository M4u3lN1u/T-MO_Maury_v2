from django.db.models import Q
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission
from equipos.models import Proyecto

class LiderEscribe(BasePermission):
    """Lectura para integrantes, modificaciones para líderes. La propiedad se valida aparte."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.method in ('GET', 'HEAD', 'OPTIONS') or request.user.is_staff)


def proyectos_visibles(usuario):
    if not usuario.is_authenticated:
        return Proyecto.objects.none()
    return Proyecto.objects.filter(Q(creado_por=usuario) | Q(equipos__integrantes__usuario=usuario)).distinct()


def confirmar_proyecto(usuario, proyecto, escritura=False):
    if escritura:
        if not usuario.is_staff or proyecto.creado_por_id != usuario.id:
            raise PermissionDenied('Solo el líder propietario puede modificar este proyecto.')
    elif not proyectos_visibles(usuario).filter(pk=proyecto.pk).exists():
        raise PermissionDenied('No tienes acceso a este proyecto.')
    return proyecto
