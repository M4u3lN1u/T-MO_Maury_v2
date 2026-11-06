// Solo módulos solicitados en el SRS; inicio por Actividades para ambos roles.
export const MODULOS = [
  { ruta: 'actividades', etiqueta: 'Actividades', icono: 'task', roles: ['lider', 'miembro'] },
  { ruta: 'usuarios-equipos', etiqueta: 'Equipos y miembros', icono: 'user', roles: ['lider', 'miembro'] },
  { ruta: 'minutas', etiqueta: 'Minutas', icono: 'note', roles: ['lider', 'miembro'] },
]
export const modulosDe = (rol) => MODULOS.filter((m) => m.roles.includes(rol))
export const menuLateral = (rol) => modulosDe(rol)
export const etiquetaDe = (modulo) => modulo.etiqueta
export const inicioDe = () => '/actividades'
