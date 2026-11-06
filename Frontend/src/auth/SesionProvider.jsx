// Librerías
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'

// Conexión con el backend (API)
import { api, guardarTokens, leerTokens } from '../conexion/cliente'

// Variables de la API (rutas del backend)
import { AUTH_LOGIN, PERFIL } from '../modulos/api'

// Sesión
import { SesionContext } from './contexto'

// Mantiene la sesión del usuario
export default function SesionProvider({ children }) {
  const queryClient = useQueryClient()
  const [conToken, setConToken] = useState(() => Boolean(leerTokens()?.access))

  const { data: usuario, isLoading } = useQuery({
    queryKey: ['yo'],
    queryFn: () => api(PERFIL),
    enabled: conToken,
    staleTime: 5 * 60 * 1000,
  })

  const salir = useCallback(() => {
    guardarTokens(null)
    setConToken(false)
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    window.addEventListener('sesion-expirada', salir)
    return () => window.removeEventListener('sesion-expirada', salir)
  }, [salir])

  const entrar = useCallback(async (correo, password) => {
    const { access, refresh, usuario: datos } = await api(AUTH_LOGIN, {
      metodo: 'POST', datos: { correo, password }, reintento: false,
    })
    guardarTokens({ access, refresh })
    queryClient.setQueryData(['yo'], datos)
    setConToken(true)
    return datos
  }, [queryClient])

  const valor = useMemo(() => ({
    usuario: conToken ? usuario ?? null : null,
    cargando: conToken && isLoading,
    entrar,
    salir,
  }), [conToken, usuario, isLoading, entrar, salir])

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
}
