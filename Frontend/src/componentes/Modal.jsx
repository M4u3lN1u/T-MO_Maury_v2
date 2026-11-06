import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// Ventana modal; se cierra con Escape, el botón cerrar o clic fuera
export default function Modal({ titulo, ancho = 620, onCerrar, extra, children }) {
  useCerrarConEscape(onCerrar)
  return createPortal(
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className="dlg" role="dialog" aria-modal="true" aria-label={titulo} style={{ width: ancho }}>
        {/* El botón cerrar queda siempre arriba a la derecha; en teléfono los botones extra bajan a su propia fila */}
        <div className="dlg-cab">
          <h2 className="titulo">{titulo}</h2>
          <button className="btn ghost cerrar" onClick={onCerrar} aria-label="Cerrar"><X size={18} /></button>
          {extra && <span className="row envuelve dlg-extra">{extra}</span>}
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}

// Panel lateral derecho
export function Panel({ titulo, onCerrar, children }) {
  useCerrarConEscape(onCerrar)
  return createPortal(
    <section className="panel" aria-label={titulo}>
      <div className="row entre">
        <h2 className="titulo">{titulo}</h2>
        <button className="btn ghost" onClick={onCerrar} aria-label="Cerrar"><X size={18} /></button>
      </div>
      {children}
    </section>,
    document.body,
  )
}

// Ejecuta alCerrar al presionar Escape
function useCerrarConEscape(onCerrar) {
  useEffect(() => {
    const tecla = (e) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [onCerrar])
}
