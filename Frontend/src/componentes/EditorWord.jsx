import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { cargarSuperDoc, fuenteDe } from '../utilidades/word'

// Edita un .docx en la página; ref.current.exportar() devuelve el Blob
export default function EditorWord({ documento, soloLectura = false, ref }) {
  const barra = useRef(null)
  const hoja = useRef(null)
  const instancia = useRef(null)
  // Se guarda para qué documento se terminó de cargar (o falló), así un documento nuevo vuelve a "cargando"
  const [listo, setListo] = useState(null)
  const [falla, setFalla] = useState({ documento: null, mensaje: '' })
  const cargando = listo !== documento && falla.documento !== documento
  const error = falla.documento === documento ? falla.mensaje : ''

  useImperativeHandle(ref, () => ({
    exportar: () => {
      if (!instancia.current) throw new Error('El documento aún no termina de cargar.')
      return instancia.current.export({ exportType: ['docx'], triggerDownload: false })
    },
  }), [])

  useEffect(() => {
    let activo = true
    let editor = null
    const fallo = (mensaje) => activo && setFalla({ documento, mensaje })
    ;(async () => {
      try {
        const [SuperDoc, fuente] = await Promise.all([cargarSuperDoc(), fuenteDe(documento)])
        if (!activo) return
        editor = new SuperDoc({
          selector: hoja.current,
          ...(fuente ? { document: fuente } : {}),
          documentMode: soloLectura ? 'viewing' : 'editing',
          role: soloLectura ? 'viewer' : 'editor',
          ui: { toolbar: soloLectura ? false : { container: barra.current }, comments: false },
          // Si la hoja carta completa (816 px) no cabe en el recuadro, el texto se acomoda al ancho disponible
          viewOptions: { layout: hoja.current.clientWidth < 860 ? 'web' : 'print' },
          onReady: () => activo && setListo(documento),
          onContentError: () => fallo('El documento está dañado o no es un Word válido.'),
        })
        instancia.current = editor
      } catch (e) {
        fallo(e.message)
      }
    })()
    return () => {
      activo = false
      instancia.current = null
      editor?.destroy()
    }
  }, [documento, soloLectura])

  return (
    <div className="word">
      {!soloLectura && <div className="word-barra" ref={barra} />}
      {cargando && <p className="sub word-aviso">Abriendo documento…</p>}
      {error && <p className="error word-aviso" role="alert">{error}</p>}
      <div className="word-hoja" ref={hoja} />
    </div>
  )
}
