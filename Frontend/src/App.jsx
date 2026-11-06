import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './auth/Login'
import { useSesion } from './auth/contexto'
import Layout from './layout/Layout'
import { MODULOS } from './layout/menu'
import ActividadesPage from './modulos/actividades/ActividadesPage'
import UsuariosEquiposPage from './modulos/usuarios-equipos/UsuariosEquiposPage'
import MinutasPage from './modulos/minutas/MinutasPage'
const PAGINAS = { actividades: ActividadesPage, 'usuarios-equipos': UsuariosEquiposPage, minutas: MinutasPage }
function Inicio() { const { usuario } = useSesion(); return <Navigate to={usuario ? '/actividades' : '/login'} replace /> }
export default function App() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<Layout />}>
      <Route index element={<Inicio />} />
      {MODULOS.map(({ ruta }) => { const Pagina = PAGINAS[ruta]; return <Route key={ruta} path={ruta} element={<Pagina />} /> })}
      <Route path="*" element={<Inicio />} />
    </Route>
  </Routes>
}
