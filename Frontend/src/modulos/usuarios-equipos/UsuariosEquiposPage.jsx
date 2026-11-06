import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Users, Trash2, Pencil, FolderPlus, UserPlus, Tag } from 'lucide-react'
import { api } from '../../conexion/cliente'
import { useProyectoActivo } from '../../layout/proyectoActivo'
import { useSesion } from '../../auth/contexto'
import { useEquipos, useFunciones } from '../../conexion/consultas'
import { USUARIOS, EQUIPOS, EQUIPO, EQUIPO_INTEGRANTES, EQUIPO_INTEGRANTE, FUNCIONES, FUNCION, PROYECTOS } from '../api'
import Encabezado from '../../componentes/Encabezado'
import Modal from '../../componentes/Modal'
import { aviso } from '../../componentes/aviso'

export default function UsuariosEquiposPage() {
  const {usuario} = useSesion()
  const {proyecto, setProyectoId} = useProyectoActivo()
  const lider = usuario.rol === 'lider'
  const qc = useQueryClient()
  const equipos = useEquipos(proyecto?.id)
  const funciones = useFunciones()
  const {data:usuarios=[]} = useQuery({queryKey:['usuarios'],queryFn:()=>api(USUARIOS),enabled:lider})
  const [form,setForm] = useState(null)
  const [error,setError] = useState('')
  const [cargando,setCargando] = useState(false)
  const [v,setV] = useState({})
  const refrescar = () => {qc.invalidateQueries({queryKey:['equipos']});qc.invalidateQueries({queryKey:['miembros']});qc.invalidateQueries({queryKey:['usuarios']});qc.invalidateQueries({queryKey:['funciones']});qc.invalidateQueries({queryKey:['proyectos']})}
  const abrir = (tipo, datos={}) => {setForm(tipo);setError('');setV(datos)}
  async function ejecutar(e) {
    e.preventDefault(); setCargando(true);setError('')
    try {
      let ruta, metodo='POST', datos={...v}
      if (form === 'proyecto') ruta=PROYECTOS
      if (form === 'equipo') {ruta=v.id?EQUIPO(v.id):EQUIPOS;metodo=v.id?'PATCH':'POST';datos={nombre:v.nombre,proyecto:proyecto.id}}
      if (form === 'usuario') {ruta=USUARIOS; datos={nombre_pila:v.nombre_pila,pri_ape:v.pri_ape,correo:v.correo,password:v.password}}
      if (form === 'funcion') {ruta=v.id?FUNCION(v.id):FUNCIONES;metodo=v.id?'PATCH':'POST';datos={nombre:v.nombre,color:v.color}}
      if (form === 'integrante') {ruta=EQUIPO_INTEGRANTES(v.equipo);datos={usuario:Number(v.usuario),funcion:Number(v.funcion)}}
      if (form === 'cambio-funcion') {ruta=EQUIPO_INTEGRANTE(v.equipo,v.usuario);metodo='PATCH';datos={funcion:Number(v.funcion)}}
      const respuesta=await api(ruta,{metodo,datos})
      refrescar();setForm(null);aviso('Cambios guardados')
      if(form==='proyecto') setProyectoId(respuesta.id)
    } catch(err){setError(err.message)} finally {setCargando(false)}
  }
  async function borrar(ruta,pregunta) {
    if(!window.confirm(pregunta))return
    try {await api(ruta,{metodo:'DELETE'});refrescar();aviso('Registro eliminado')}catch(e){aviso(e.message)}
  }
  return <>
    <Encabezado titulo="Equipos y miembros" sub="Organización, integrantes y funciones del equipo">
      {lider && <button className="btn ghost" onClick={()=>abrir('proyecto',{nombre:'',descripcion:''})}><FolderPlus size={16}/> Nuevo proyecto</button>}
      {lider && proyecto && <button className="btn" onClick={()=>abrir('equipo',{nombre:''})}><Plus size={16}/> Nuevo equipo</button>}
    </Encabezado>
    {!proyecto && <div className="card vacio">No tienes proyectos asignados. {lider && 'Crea uno con «Nuevo proyecto».'}</div>}
    {proyecto && <>
      <div className="row entre" style={{marginBottom:16}}><h2 style={{margin:0}}>Equipos de {proyecto.nombre}</h2><span className="tag p">{equipos.length} equipos</span></div>
      <div className="grid g2i">
        {equipos.map(eq=><div className="card" key={eq.id}>
          <div className="row entre" style={{marginBottom:12}}><h2 style={{margin:0}}><Users size={18}/> {eq.nombre}</h2>
            {lider && <div className="row" style={{gap:4}}><button className="btn ghost chico" title="Editar equipo" onClick={()=>abrir('equipo',eq)}><Pencil size={14}/></button>
              <button className="btn ghost chico" title="Eliminar equipo" onClick={()=>borrar(EQUIPO(eq.id),'¿Eliminar el equipo?')}><Trash2 size={14}/></button></div>}</div>
          <div className="list">{eq.integrantes.map(m=><div className="row entre" key={m.usuario_id}>
            <div className="row"><div className="av">{m.usuario.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
              <div><b>{m.usuario}</b><div><span className="tag" style={{color:m.funcion_color}}>{m.funcion}</span></div></div></div>
            {lider && <div className="row" style={{gap:4}}><button className="btn ghost chico" title="Cambiar función" onClick={()=>abrir('cambio-funcion',{equipo:eq.id,usuario:m.usuario_id,funcion:String(m.funcion_id)})}><Pencil size={14}/></button>
              <button className="btn ghost chico" title="Quitar integrante" onClick={()=>borrar(EQUIPO_INTEGRANTE(eq.id,m.usuario_id),'¿Quitar al integrante?')}><Trash2 size={14}/></button></div>}</div>)}
            {!eq.integrantes.length && <p className="sub">Sin integrantes.</p>}</div>
          {lider && <button className="btn sec chico" style={{marginTop:16}} onClick={()=>abrir('integrante',{equipo:eq.id,usuario:'',funcion:''})}><UserPlus size={15}/> Agregar integrante</button>}
        </div>)}
      </div>
      {!equipos.length && <div className="card vacio" style={{marginTop:16}}>Todavía no hay equipos para este proyecto.</div>}
    </>}
    {lider && <div className="grid g2i" style={{marginTop:22}}>
      <div className="card"><div className="row entre"><h2>Usuarios registrados</h2><button className="btn sec chico" onClick={()=>abrir('usuario',{nombre_pila:'',pri_ape:'',correo:'',password:''})}><UserPlus size={15}/> Nuevo usuario</button></div>
        <div className="list">{usuarios.map(u=><div key={u.id}><b>{u.nombre_completo}</b><p className="sub">{u.correo} · {u.rol==='lider'?'Líder':'Miembro'}</p></div>)}</div>
      </div>
      <div className="card"><div className="row entre"><h2>Etiquetas de función</h2><button className="btn sec chico" onClick={()=>abrir('funcion',{nombre:'',color:'#244CA5'})}><Plus size={15}/> Nueva función</button></div>
        <div className="list">{funciones.map(f=><div key={f.id} className="row entre"><span className="row"><span className="dot" style={{background:f.color}}/>{f.nombre}</span>
          <span className="row" style={{gap:4}}><button className="btn ghost chico" title="Editar función" onClick={()=>abrir('funcion',f)}><Pencil size={14}/></button><button className="btn ghost chico" title="Eliminar función" onClick={()=>borrar(FUNCION(f.id),'¿Eliminar función?')}><Trash2 size={14}/></button></span></div>)}</div>
      </div>
    </div>}
    {form && <Modal titulo={{proyecto:'Nuevo proyecto',equipo:v.id?'Editar equipo':'Nuevo equipo',usuario:'Nuevo usuario',funcion:v.id?'Editar función':'Nueva función',integrante:'Agregar integrante','cambio-funcion':'Cambiar función'}[form]} onCerrar={()=>setForm(null)}>
      <form onSubmit={ejecutar}><div className="frm">
        {form==='proyecto' && <><label className="w">Nombre *<input required value={v.nombre||''} onChange={e=>setV({...v,nombre:e.target.value})}/></label><label className="w">Descripción<textarea value={v.descripcion||''} onChange={e=>setV({...v,descripcion:e.target.value})}/></label></>}
        {form==='equipo' && <label className="w">Nombre del equipo *<input required value={v.nombre||''} onChange={e=>setV({...v,nombre:e.target.value})}/></label>}
        {form==='usuario' && <><label>Nombre *<input required value={v.nombre_pila||''} onChange={e=>setV({...v,nombre_pila:e.target.value})}/></label><label>Apellido *<input required value={v.pri_ape||''} onChange={e=>setV({...v,pri_ape:e.target.value})}/></label><label className="w">Correo electrónico *<input type="email" required value={v.correo||''} onChange={e=>setV({...v,correo:e.target.value})}/></label><label className="w">Contraseña (8 o más caracteres) *<input type="password" required minLength={8} value={v.password||''} onChange={e=>setV({...v,password:e.target.value})}/></label></>}
        {form==='funcion' && <><label>Nombre *<input required value={v.nombre||''} onChange={e=>setV({...v,nombre:e.target.value})}/></label><label>Color<input type="color" value={v.color||'#244CA5'} onChange={e=>setV({...v,color:e.target.value})}/></label></>}
        {form==='integrante' && <><label>Usuario *<select required value={v.usuario||''} onChange={e=>setV({...v,usuario:e.target.value})}><option value="">Seleccionar usuario</option>{usuarios.map(u=><option key={u.id} value={u.id}>{u.nombre_completo}</option>)}</select></label><label>Función *<select required value={v.funcion||''} onChange={e=>setV({...v,funcion:e.target.value})}><option value="">Seleccionar función</option>{funciones.map(f=><option key={f.id} value={f.id}>{f.nombre}</option>)}</select></label></>}
        {form==='cambio-funcion' && <label className="w">Función *<select required value={v.funcion||''} onChange={e=>setV({...v,funcion:e.target.value})}>{funciones.map(f=><option key={f.id} value={f.id}>{f.nombre}</option>)}</select></label>}
      </div>{error && <p className="error" role="alert">{error}</p>}
      <div className="acciones"><button type="button" className="btn ghost" onClick={()=>setForm(null)}>Cancelar</button><button className="btn" disabled={cargando}>{cargando?'Guardando…':'Guardar'}</button></div></form>
    </Modal>}
  </>
}
