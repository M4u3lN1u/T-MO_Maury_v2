import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSesion } from '../auth/contexto'
import Toast from '../componentes/Toast'
import Cabecera from './Cabecera'
import { RanuraCabecera } from './ranuraCabecera'
import ProyectoProvider from './ProyectoProvider'
import Sidebar from './Sidebar'

// Estructura de la app: sidebar y contenido
export default function Layout() {
  const { usuario, cargando } = useSesion()
  // En pantallas angostas el sidebar se oculta y se abre con el botón de menú
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [ranura, setRanura] = useState(null)
  if (cargando) return <div className="cargando">Cargando…</div>
  if (!usuario) return <Navigate to="/login" replace />
  return (
    <ProyectoProvider>
      <div className="app">
        {menuAbierto && <div className="velo" onClick={() => setMenuAbierto(false)} aria-hidden="true" />}
        <Sidebar abierto={menuAbierto} onNavegar={() => setMenuAbierto(false)} />
        <div className="contenido">
          <Cabecera menuAbierto={menuAbierto} onMenu={() => setMenuAbierto(true)} ranura={setRanura} />
          <RanuraCabecera.Provider value={ranura}>
            <main><Outlet /></main>
          </RanuraCabecera.Provider>
        </div>
      </div>
      <Toast />
    </ProyectoProvider>
  )
}
