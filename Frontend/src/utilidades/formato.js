// Iniciales para los avatares de miembros.
export const iniciales = (nombre = '') => nombre.split(/\s+/).filter(Boolean).slice(0,2).map(p=>p[0]).join('').toUpperCase()
