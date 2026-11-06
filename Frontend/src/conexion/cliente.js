// Cliente de la API REST (Django) con JWT: access en cada petición y refresh automático al expirar.

// Variables de la API (rutas del backend)
import { AUTH_REFRESH, PREFIJO_API } from '../modulos/api'

const CLAVE = 'gestion-equipos.tokens'

// Lee los tokens JWT guardados
export function leerTokens() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) ?? null
  } catch {
    return null
  }
}

// Guarda o borra los tokens JWT
export function guardarTokens(tokens) {
  try {
    if (tokens) localStorage.setItem(CLAVE, JSON.stringify(tokens))
    else localStorage.removeItem(CLAVE)
  } catch {
    // almacenamiento bloqueado: la sesión dura lo que la pestaña
  }
}

export class ErrorApi extends Error {
  constructor(status, datos) {
    super(mensajeDe(datos) || `Error ${status}`)
    this.status = status
    this.datos = datos
  }
}

// Primer mensaje de error legible de la respuesta de la API
function mensajeDe(datos) {
  if (!datos || typeof datos !== 'object') return ''
  if (typeof datos.detail === 'string') return datos.detail
  const primero = Object.values(datos)[0]
  return Array.isArray(primero) ? String(primero[0]) : typeof primero === 'string' ? primero : ''
}

let refrescando = null

// Renueva el token access con el refresh
async function refrescar() {
  const tokens = leerTokens()
  if (!tokens?.refresh) return false
  refrescando ??= fetch(`${PREFIJO_API}${AUTH_REFRESH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: tokens.refresh }),
  })
    .then(async (r) => {
      if (!r.ok) return false
      guardarTokens({ ...tokens, ...(await r.json()) })
      return true
    })
    .finally(() => { refrescando = null })
  return refrescando
}

// Petición a la API con el token; reintenta una vez si expiró
export async function api(ruta, { metodo = 'GET', datos, reintento = true } = {}) {
  const tokens = leerTokens()
  const esFormulario = datos instanceof FormData
  const respuesta = await fetch(`${PREFIJO_API}${ruta}`, {
    method: metodo,
    headers: {
      ...(datos && !esFormulario ? { 'Content-Type': 'application/json' } : {}),
      ...(tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
    },
    body: datos ? (esFormulario ? datos : JSON.stringify(datos)) : undefined,
  })

  if (respuesta.status === 401 && reintento && tokens?.refresh) {
    if (await refrescar()) return api(ruta, { metodo, datos, reintento: false })
    guardarTokens(null)
    window.dispatchEvent(new Event('sesion-expirada'))
  }
  if (respuesta.status === 204) return null
  const cuerpo = await respuesta.json().catch(() => null)
  if (!respuesta.ok) throw new ErrorApi(respuesta.status, cuerpo)
  return cuerpo
}
