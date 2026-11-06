import { createContext, useContext } from 'react'

export const SesionContext = createContext(null)

// Sesión actual: usuario, cargando, entrar() y salir()
export const useSesion = () => useContext(SesionContext)
