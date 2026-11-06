// Librerías
import { createPortal } from 'react-dom'

// Archivos del layout
import { useRanuraCabecera } from '../layout/ranuraCabecera'

// Título de la pantalla con subtítulo y botones; en escritorio va en la barra superior
export default function Encabezado({ titulo, sub, children }) {
  const ranura = useRanuraCabecera()
  const contenido = (
    <div className="top">
      <div>
        <h1>{titulo}</h1>
        {sub && <p className="sub">{sub}</p>}
      </div>
      {children && <div className="row" style={{ gap: 8 }}>{children}</div>}
    </div>
  )
  return ranura ? createPortal(contenido, ranura) : contenido
}
