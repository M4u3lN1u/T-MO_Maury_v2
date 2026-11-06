from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from nucleo.views import login, yo, UsuarioViewSet
from equipos.views import ProyectoViewSet, EquipoViewSet, FuncionViewSet
from actividades.views import ActividadViewSet
from minutas.views import MinutaViewSet, PlantillaViewSet, subir_word

router = DefaultRouter()
router.register('proyectos', ProyectoViewSet, basename='proyectos')
router.register('usuarios', UsuarioViewSet, basename='usuarios')
router.register('equipos', EquipoViewSet, basename='equipos')
router.register('funciones', FuncionViewSet, basename='funciones')
router.register('actividades', ActividadViewSet, basename='actividades')
router.register('plantillas', PlantillaViewSet, basename='plantillas')
router.register('minutas', MinutaViewSet, basename='minutas')
urlpatterns = [
    path('api/auth/login/', login),
    path('api/auth/refresh/', TokenRefreshView.as_view()),
    path('api/auth/yo/', yo),
    path('api/archivos/', subir_word),
    path('api/', include(router.urls)),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema')),
] + (static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) if settings.DEBUG else [])
