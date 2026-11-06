import { useEffect, useRef } from 'react'

const BOTONES = [
  ['bold', 'Negritas', <b key="b">B</b>],
  ['italic', 'Cursivas', <i key="i">I</i>],
  ['underline', 'Subrayado', <u key="u">S</u>],
  ['insertUnorderedList', 'Lista', '• Lista'],
  ['insertOrderedList', 'Lista numerada', '1. Lista'],
]

// Campo de texto con negritas, cursivas y listas; devuelve HTML
export default function EditorConFormato({ etiqueta, valor, onChange }) {
  const ref = useRef(null)

  // Solo reescribe el contenido si cambió desde fuera (así no se pierde el cursor al escribir)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (valor ?? '')) ref.current.innerHTML = valor ?? ''
  }, [valor])

  const aplicar = (comando) => {
    ref.current.focus()
    document.execCommand(comando)
    onChange(ref.current.innerHTML)
  }

  return (
    <div className="rte">
      <div className="tb" role="toolbar" aria-label={`Formato de ${etiqueta}`}>
        {BOTONES.map(([comando, titulo, contenido]) => (
          <button key={comando} type="button" title={titulo} aria-label={titulo}
            onMouseDown={(e) => e.preventDefault()} onClick={() => aplicar(comando)}>
            {contenido}
          </button>
        ))}
      </div>
      <div ref={ref} className="ed" contentEditable role="textbox" aria-multiline="true" aria-label={etiqueta}
        suppressContentEditableWarning onInput={(e) => onChange(e.currentTarget.innerHTML)} />
    </div>
  )
}
