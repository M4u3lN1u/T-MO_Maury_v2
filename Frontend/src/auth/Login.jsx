import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { inicioDe } from '../layout/menu'
import { useSesion } from './contexto'

// Logos
import logotipoClaro from '../assets/logos/tmo-logotipo-claro.svg'
import logotipoOscuro from '../assets/logos/tmo-logotipo-oscuro.svg'

// Pantalla de inicio de sesión
export default function Login() {
  const { usuario, entrar } = useSesion()
  const navigate = useNavigate()
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (usuario) return <Navigate to={inicioDe(usuario.rol)} replace />

  async function enviar(e) {
    e.preventDefault()
    if (!correo.trim() || !password) {
      setError('Escribe tu correo y tu contraseña.')
      return
    }
    setEnviando(true)
    setError('')
    try {
      const datos = await entrar(correo.trim(), password)
      navigate(inicioDe(datos.rol), { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="login">
      <div className="login-caja">
        <section className="login-marca">
          <img src={logotipoOscuro} alt="T'MO · Teammates Multi Organizational" />
          <h2>¡Bienvenido de nuevo!</h2>
          <p>Organiza proyectos, actividades, reuniones y documentos de tu equipo en un solo lugar.</p>
        </section>

        <form className="login-form" onSubmit={enviar} noValidate>
          <img className="login-logo-movil" src={logotipoClaro} alt="T'MO · Teammates Multi Organizational" />
          <h1>Bienvenido</h1>
          <p className="sub">Inicia sesión en tu cuenta para continuar</p>
          <label className="oculto" htmlFor="correo">Correo</label>
          <input id="correo" type="email" autoComplete="username" value={correo}
            onChange={(e) => setCorreo(e.target.value)} placeholder="Correo · nombre@ut-tijuana.edu.mx" />
          <label className="oculto" htmlFor="password">Contraseña</label>
          <input id="password" type="password" autoComplete="current-password" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />
          <p className="error" role="alert">{error}</p>
          <button className="btn" disabled={enviando}>{enviando ? 'Entrando…' : 'Iniciar sesión'}</button>
        </form>
      </div>
    </div>
  )
}
