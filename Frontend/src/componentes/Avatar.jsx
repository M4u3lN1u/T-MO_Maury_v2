import { iniciales } from '../utilidades/formato'

// Círculo con las iniciales del usuario
export default function Avatar({ nombre, foto, color }) {
  const estilo = foto ? { backgroundImage: `url(${foto})` } : color ? { background: color } : undefined
  return <span className="av" style={estilo} title={nombre} aria-label={nombre}>{foto ? '' : iniciales(nombre)}</span>
}
