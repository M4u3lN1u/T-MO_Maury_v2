import { createContext, useContext, useSyncExternalStore } from 'react'

// Lugar de la barra superior donde cada pantalla pone su título
export const RanuraCabecera = createContext(null)

const escritorio = window.matchMedia('(min-width: 901px)')
const suscribir = (aviso) => {
  escritorio.addEventListener('change', aviso)
  return () => escritorio.removeEventListener('change', aviso)
}

// Nodo de la ranura; en teléfono no hay ranura y el título queda en la página
export function useRanuraCabecera() {
  const ranura = useContext(RanuraCabecera)
  const esEscritorio = useSyncExternalStore(suscribir, () => escritorio.matches)
  return esEscritorio ? ranura : null
}
