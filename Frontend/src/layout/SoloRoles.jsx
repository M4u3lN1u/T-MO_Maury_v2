import { Navigate } from 'react-router-dom'
import { useSesion } from '../auth/contexto'
import { inicioDe } from './menu'

// Redirige si el rol no tiene acceso al módulo
export default function SoloRoles({ roles, children }) {
  const { usuario } = useSesion()
  return roles.includes(usuario.rol) ? children : <Navigate to={inicioDe(usuario.rol)} replace />
}
