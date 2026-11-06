// Librerías
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

// Conexión con el backend (API)
import { api } from '../conexion/cliente'

// Variables de la API (rutas del backend)
import { PROYECTOS } from '../modulos/api'

// Proyecto activo
import { ProyectoContext } from './proyectoActivo'

const CLAVE = 'gestion-equipos.proyecto'

// Lee el último proyecto elegido
function leerGuardado() {
  try {
    return Number(localStorage.getItem(CLAVE)) || null
  } catch {
    return null
  }
}

// Mantiene el proyecto activo
export default function ProyectoProvider({ children }) {
  // La API ya filtra: el líder recibe todos los proyectos; un miembro, solo los suyos
  const { data: proyectos = [] } = useQuery({ queryKey: ['proyectos'], queryFn: () => api(PROYECTOS) })
  const [elegido, setElegido] = useState(leerGuardado)

  const valor = useMemo(() => {
    const proyecto = proyectos.find((p) => p.id === elegido) ?? proyectos[0] ?? null
    const setProyectoId = (id) => {
      setElegido(id)
      try {
        localStorage.setItem(CLAVE, String(id))
      } catch {
        // sin almacenamiento: la elección dura lo que la pestaña
      }
    }
    return { proyectos, proyecto, setProyectoId }
  }, [proyectos, elegido])

  return <ProyectoContext.Provider value={valor}>{children}</ProyectoContext.Provider>
}
