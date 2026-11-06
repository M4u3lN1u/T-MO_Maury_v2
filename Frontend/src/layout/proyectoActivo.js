import { createContext, useContext } from 'react'

export const ProyectoContext = createContext(null)

// Proyecto elegido en el sidebar
export const useProyectoActivo = () => useContext(ProyectoContext)
