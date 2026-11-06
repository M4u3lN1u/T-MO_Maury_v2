// Conexión con el backend (API)
import { api } from '../conexion/cliente'

// Variables de la API (rutas del backend)
import { ARCHIVOS } from '../modulos/api'

// Plantillas y reportes Word (.docx), que se editan en la página con EditorWord

export const TIPO_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

// URL del archivo; en desarrollo usa el proxy de Vite
export function rutaDe(url) {
  try {
    const ruta = new URL(url)
    return import.meta.env.DEV && ruta.pathname.startsWith('/media/') ? ruta.pathname : url
  } catch {
    return url
  }
}

// Valida el .docx antes de subirlo
export function errorDocx(fichero) {
  const extension = fichero.name.slice(fichero.name.lastIndexOf('.')).toLowerCase()
  if (extension === '.pdf') return 'Los PDF no son documentos editables. Sube un archivo Word (.docx).'
  if (extension === '.doc') return 'Los .doc antiguos no se pueden editar: guárdalo como .docx desde Word.'
  if (extension !== '.docx') return 'Solo se aceptan documentos Word (.docx).'
  if (fichero.size > 10 * 1024 * 1024) return 'El archivo no puede pesar más de 10 MB.'
  return ''
}

// Sube el .docx y devuelve su URL
export async function subirDocx(blob, nombre) {
  const datos = new FormData()
  const base = nombre.trim().replace(/[\\/:*?"<>|]+/g, '').slice(0, 80) || 'documento'
  datos.append('archivo', new File([blob], `${base}.docx`, { type: TIPO_DOCX }))
  datos.append('carpeta', 'documentos')
  return (await api(ARCHIVOS, { metodo: 'POST', datos })).url
}

// Carga SuperDoc bajo demanda
export async function cargarSuperDoc() {
  const [{ SuperDoc }] = await Promise.all([import('superdoc'), import('superdoc/style.css')])
  return SuperDoc
}

// Convierte una URL en File para SuperDoc
export async function fuenteDe(documento) {
  if (typeof documento !== 'string') return documento
  const respuesta = await fetch(rutaDe(documento))
  if (!respuesta.ok) throw new Error('No se pudo descargar el documento.')
  return new File([await respuesta.blob()], 'documento.docx', { type: TIPO_DOCX })
}

// Espera los milisegundos indicados
const esperar = (ms) => new Promise((listo) => setTimeout(listo, ms))

// Exporta a PDF un documento Word
export async function pdfDeWord(documento, nombre) {
  const [SuperDoc, fuente] = await Promise.all([cargarSuperDoc(), fuenteDe(documento)])
  const lienzo = document.createElement('div')
  lienzo.className = 'word-render' // invisible, pero en pantalla y con tamaño para que SuperDoc mida y pagine
  document.body.append(lienzo)
  let editor = null
  try {
    await new Promise((listo, fallo) => {
      editor = new SuperDoc({
        selector: lienzo, document: fuente, documentMode: 'viewing', role: 'viewer', ui: false,
        viewOptions: { layout: 'print' }, onReady: listo,
        onContentError: () => fallo(new Error('El documento está dañado o no es un Word válido.')),
      })
    })
    // La paginación sigue después de onReady: se espera a que el número de páginas deje de cambiar
    let paginas = -1
    for (let intento = 0; intento < 40; intento++) {
      await esperar(200)
      const ahora = lienzo.querySelectorAll('.superdoc-page').length
      if (ahora && ahora === paginas) break
      paginas = ahora
    }
    const hojas = [...lienzo.querySelectorAll('.superdoc-page')]
    if (!hojas.length) throw new Error('No se pudo preparar el documento para imprimir.')
    const { width, height } = hojas[0].getBoundingClientRect()
    // SuperDoc solo dibuja el contenido de las páginas cercanas a la vista: se recorre cada una,
    // se espera a que tenga contenido y se copia en ese momento
    const copias = []
    for (const hoja of hojas) {
      hoja.scrollIntoView({ block: 'start' })
      for (let intento = 0; intento < 15 && !hoja.querySelector('.superdoc-fragment'); intento++) await esperar(100)
      await esperar(50)
      copias.push(hoja.cloneNode(true))
    }
    // Se conservan los contenedores de SuperDoc (sus clases traen los estilos) con copias de las páginas
    const marco = lienzo.querySelector('.superdoc').cloneNode(false)
    const capa = lienzo.querySelector('.presentation-editor').cloneNode(false)
    capa.removeAttribute('style')
    capa.append(...copias)
    marco.append(capa)
    imprimir(marco, width, height, nombre)
  } finally {
    editor?.destroy()
    lienzo.remove()
  }
}

// Imprime solo el contenido dado
function imprimir(contenido, ancho, alto, nombre) {
  const caja = document.createElement('div')
  caja.className = 'impresion-word'
  caja.append(contenido)
  const hoja = document.createElement('style')
  hoja.textContent = `@page { size: ${Math.round(ancho)}px ${Math.round(alto)}px; margin: 0 }`
  const titulo = document.title
  const limpiar = () => {
    caja.remove()
    hoja.remove()
    document.body.classList.remove('imprimiendo-word')
    document.title = titulo
    window.removeEventListener('afterprint', limpiar)
  }
  document.head.append(hoja)
  document.body.append(caja)
  document.body.classList.add('imprimiendo-word')
  document.title = nombre // el navegador lo propone como nombre del PDF
  window.addEventListener('afterprint', limpiar)
  window.print()
}
