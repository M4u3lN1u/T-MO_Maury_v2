// Librerías
import { NavLink } from 'react-router-dom'

// Sesión y proyecto activo
import { useSesion } from '../auth/contexto'
import { useProyectoActivo } from './proyectoActivo'

// Logos
import isotipo from '../assets/logos/tmo-isotipo-oscuro.svg'

// Archivos del layout
import Icono from './Icono'
import { etiquetaDe, menuLateral } from './menu'

const ROLES = { lider: 'Líder', miembro: 'Miembro' }
// Iniciales del nombre
const iniciales = (u) => `${u.nombre_pila[0] ?? ''}${u.pri_ape[0] ?? ''}`

// Menú lateral con el selector de proyecto
export default function Sidebar({ abierto, onNavegar }) {
  const { usuario, salir } = useSesion()
  const { proyectos, proyecto, setProyectoId } = useProyectoActivo()

  return (
    <aside className={abierto ? 'abierto' : ''}>
      <div className="brand">
        <div className="marca"><img src={isotipo} alt="T'MO" />Gestión de equipos</div>
        <small>Proyecto activo</small>
        <select aria-label="Proyecto activo" value={proyecto?.id ?? ''} disabled={!proyectos.length}
          onChange={(e) => setProyectoId(Number(e.target.value))}>
          {proyectos.length ? proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)
            : <option value="">Sin proyectos</option>}
        </select>
      </div>

      <nav aria-label="Menú principal">
        {menuLateral(usuario.rol).map((m) => (
          <NavLink key={m.ruta} to={`/${m.ruta}`} onClick={onNavegar}>
            <Icono nombre={m.icono} />{etiquetaDe(m, usuario.rol)}
          </NavLink>
        ))}
      </nav>

      <div className="who">
        <div className="row">
          <span className="av" style={usuario.foto ? { backgroundImage: `url(${usuario.foto})` } : undefined}>
            {usuario.foto ? '' : iniciales(usuario)}
          </span>
          <div>
            <b>{usuario.nombre_completo}</b>
            <small>{ROLES[usuario.rol]}</small>
          </div>
        </div>
        <button className="btn ghost" onClick={salir}>Cerrar sesión</button>
      </div>
    </aside>
  )
}
