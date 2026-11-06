import { Menu } from 'lucide-react'
import { useSesion } from '../auth/contexto'
import Avatar from '../componentes/Avatar'
export default function Cabecera({ menuAbierto, onMenu, ranura }) {
  const { usuario } = useSesion()
  return <header className="cabecera">
    <button className="btn ghost menu-movil" aria-label="Abrir menú" aria-expanded={menuAbierto} onClick={onMenu}><Menu size={20} /></button>
    <b className="titulo-movil">Gestión de equipos</b>
    <div className="ranura-cab" ref={ranura} />
    <div className="acciones-cabecera"><div className="perfil-cab" aria-label="Usuario actual">
      <Avatar nombre={usuario.nombre_completo} foto={usuario.foto}/><span className="nombre-cab">{usuario.nombre_completo}</span>
    </div></div>
  </header>
}
