// Rutas de los tres módulos y recursos básicos necesarios para iniciar sesión.
export const PREFIJO_API = `${import.meta.env.VITE_API_URL ?? ''}/api/`
export const AUTH_LOGIN = 'auth/login/'
export const AUTH_REFRESH = 'auth/refresh/'
export const PERFIL = 'auth/yo/'
export const PROYECTOS = 'proyectos/'
export const PROYECTO_MIEMBROS = (p) => `proyectos/${p}/miembros/`
export const USUARIOS = 'usuarios/'
export const USUARIO = (id) => `usuarios/${id}/`
export const FUNCIONES = 'funciones/'
export const FUNCION = (id) => `funciones/${id}/`
export const EQUIPOS = 'equipos/'
export const EQUIPOS_DEL_PROYECTO = (p) => `equipos/?proyecto=${p}`
export const EQUIPO = (id) => `equipos/${id}/`
export const EQUIPO_INTEGRANTES = (id) => `equipos/${id}/integrantes/`
export const EQUIPO_INTEGRANTE = (equipo, usuario) => `equipos/${equipo}/integrantes/${usuario}/`
export const ACTIVIDADES = 'actividades/'
export const ACTIVIDADES_DEL_PROYECTO = (p) => `actividades/?proyecto=${p}`
export const ACTIVIDAD = (id) => `actividades/${id}/`
export const ACTIVIDAD_ESTADO = (id) => `actividades/${id}/estado/`
export const ACTIVIDAD_ENTREGABLES = (id) => `actividades/${id}/entregables/`
export const ACTIVIDAD_COMENTARIOS = (id) => `actividades/${id}/comentarios/`
export const PLANTILLAS = 'plantillas/'
export const PLANTILLAS_DE = (p) => `plantillas/?proyecto=${p}`
export const PLANTILLA = (id) => `plantillas/${id}/`
export const MINUTAS = 'minutas/'
export const MINUTAS_DEL_PROYECTO = (p, mios) => `minutas/?proyecto=${p}${mios ? '&mios=1' : ''}`
export const MINUTA = (id) => `minutas/${id}/`
export const MINUTA_COMENTARIOS = (id) => `minutas/${id}/comentarios/`
export const ARCHIVOS = 'archivos/'
