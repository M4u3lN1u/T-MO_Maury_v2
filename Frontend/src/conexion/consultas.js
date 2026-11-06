// Consultas compartidas entre módulos (TanStack Query las guarda en caché por su queryKey)
// Librerías
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

// Conexión con el backend (API)
import { api } from './cliente'

// Variables de la API (rutas del backend)
import { EQUIPOS_DEL_PROYECTO, FUNCIONES, PROYECTO_MIEMBROS } from '../modulos/api'

// Integrantes del proyecto, en lista y por id de usuario
export function useMiembros(proyectoId) {
  const { data = [] } = useQuery({
    queryKey: ['miembros', proyectoId],
    queryFn: () => api(PROYECTO_MIEMBROS(proyectoId)),
    enabled: !!proyectoId,
  })
  return useMemo(() => {
    const porId = {}
    for (const m of data) {
      porId[m.usuario_id] ??= { id: m.usuario_id, nombre: m.usuario, funcion: m.funcion, color: m.funcion_color }
    }
    const lista = Object.values(porId).sort((a, b) => a.nombre.localeCompare(b.nombre))
    return { lista, porId, nombre: (id) => porId[id]?.nombre ?? `Usuario ${id}` }
  }, [data])
}

// Catálogo de funciones
export function useFunciones() {
  return useQuery({ queryKey: ['funciones'], queryFn: () => api(FUNCIONES) }).data ?? []
}

// Equipos del proyecto
export function useEquipos(proyectoId) {
  return useQuery({
    queryKey: ['equipos', proyectoId],
    queryFn: () => api(EQUIPOS_DEL_PROYECTO(proyectoId)),
    enabled: !!proyectoId,
  }).data ?? []
}
