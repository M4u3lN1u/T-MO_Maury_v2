import { useEffect, useState } from 'react'

// Muestra los mensajes de aviso()
export default function Toast() {
  const [texto, setTexto] = useState('')

  useEffect(() => {
    let temporizador
    const mostrar = (e) => {
      setTexto(e.detail)
      clearTimeout(temporizador)
      temporizador = setTimeout(() => setTexto(''), 2500)
    }
    window.addEventListener('aviso', mostrar)
    return () => {
      window.removeEventListener('aviso', mostrar)
      clearTimeout(temporizador)
    }
  }, [])

  return texto ? <div className="toast" role="status">{texto}</div> : null
}
