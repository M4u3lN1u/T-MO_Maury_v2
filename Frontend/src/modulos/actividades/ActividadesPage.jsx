import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Plus, Trash2, Pencil, CalendarDays, Link2, MessageSquare, CheckCircle2 } from 'lucide-react'
import { api } from '../../conexion/cliente'
import { useProyectoActivo } from '../../layout/proyectoActivo'
import { useSesion } from '../../auth/contexto'
import { useMiembros, useFunciones } from '../../conexion/consultas'
import { ACTIVIDADES, ACTIVIDADES_DEL_PROYECTO, ACTIVIDAD, ACTIVIDAD_ESTADO, ACTIVIDAD_ENTREGABLES, ACTIVIDAD_COMENTARIOS } from '../api'
import Encabezado from '../../componentes/Encabezado'
import Modal, { Panel } from '../../componentes/Modal'
import { aviso } from '../../componentes/aviso'

const ESTADOS = [['pendiente', 'Pendiente'], ['en_proceso', 'En proceso'], ['terminada', 'Terminada']]
const PRIORIDADES = [['baja', 'Baja'], ['media', 'Media'], ['alta', 'Alta'], ['urgente', 'Urgente']]
const hoy = () => new Date().toLocaleDateString('sv-SE')
const inicial = (proyecto, miembros) => ({titulo:'', descripcion:'', fecha_inicio:hoy(), fecha_limite:hoy(), estado:'pendiente', prioridad:'media', responsable:miembros[0]?.id ?? '', funcion:'', proyecto:proyecto.id})
const fecha = (s) => s ? new Date(`${s}T12:00:00`).toLocaleDateString('es-MX', {day:'2-digit',month:'short',year:'numeric'}) : '—'

export default function ActividadesPage() {
  const { usuario } = useSesion()
  const { proyecto } = useProyectoActivo()
  const qc = useQueryClient()
  const miembros = useMiembros(proyecto?.id)
  const funciones = useFunciones()
  const lider = usuario.rol === 'lider'
  const [filtro, setFiltro] = useState('todas')
  const [buscar, setBuscar] = useState('')
  const [form, setForm] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [error, setError] = useState('')
  const { data: actividades = [], isLoading, error: errorLista } = useQuery({
    queryKey: ['actividades', proyecto?.id], queryFn: () => api(ACTIVIDADES_DEL_PROYECTO(proyecto.id)), enabled: !!proyecto,
  })
  const refrescar = () => qc.invalidateQueries({queryKey:['actividades',proyecto?.id]})
  const guardar = useMutation({mutationFn: (v) => api(v.id ? ACTIVIDAD(v.id) : ACTIVIDADES, {metodo:v.id?'PATCH':'POST', datos:{...v, responsable:Number(v.responsable), funcion:v.funcion ? Number(v.funcion) : null}}),
    onSuccess: () => { refrescar(); setForm(null); setError(''); aviso('Actividad guardada') }, onError: e => setError(e.message)})
  const borrar = useMutation({mutationFn: (id) => api(ACTIVIDAD(id), {metodo:'DELETE'}), onSuccess: () => {refrescar();setDetalle(null);aviso('Actividad eliminada')}, onError:e=>aviso(e.message)})
  const cambiar = useMutation({mutationFn: ({id,estado}) => api(ACTIVIDAD_ESTADO(id),{metodo:'POST',datos:{estado}}), onSuccess:()=>{refrescar();aviso('Estado actualizado')},onError:e=>aviso(e.message)})
  const visibles = useMemo(() => actividades.filter(a => (filtro === 'todas' || (filtro === 'mias' ? a.responsable === usuario.id : a.prioridad === filtro)) &&
    `${a.titulo} ${a.descripcion} ${a.responsable_nombre}`.toLowerCase().includes(buscar.toLowerCase())), [actividades, filtro, buscar, usuario.id])
  const abrir = (v) => {setError('');setForm(v ? {...v, responsable:String(v.responsable), funcion:v.funcion ? String(v.funcion) : ''} : inicial(proyecto, miembros.lista))}
  if (!proyecto) return <><Encabezado titulo="Actividades" /><div className="card vacio">No tienes un proyecto asignado. Pide al líder que cree uno y te agregue a un equipo.</div></>
  return <>
    <Encabezado titulo="Actividades" sub={`Tablero de trabajo · ${proyecto.nombre}`}>
      {lider && <button className="btn" onClick={()=>abrir(null)}><Plus size={16}/> Nueva actividad</button>}
    </Encabezado>
    <div className="grid g3" style={{marginBottom:16}}>
      {ESTADOS.map(([id,label])=><div className="card kpi" key={id}><span>{label}</span><b>{actividades.filter(a=>a.estado===id).length}</b><span>actividades</span></div>)}
    </div>
    <div className="row envuelve" style={{marginBottom:16}}>
      <input className="campo" style={{maxWidth:360,marginTop:0}} value={buscar} onChange={e=>setBuscar(e.target.value)} placeholder="Buscar actividad o responsable" aria-label="Buscar actividades"/>
      <div className="chips" style={{margin:0}}>
        {[['todas','Todas'],['mias','Mis actividades'],...PRIORIDADES].map(([id,label])=><button className="chip" key={id} aria-pressed={filtro===id} onClick={()=>setFiltro(id)}>{label}</button>)}
      </div>
    </div>
    {errorLista && <p className="error">{errorLista.message}</p>}
    {isLoading && <p className="sub">Cargando actividades…</p>}
    <div className="tablero-tmo">
      {ESTADOS.map(([estado,label])=><section className="card tablero-col" key={estado}>
        <div className="row entre" style={{marginBottom:14}}><h2 style={{margin:0}}>{label}</h2><span className="tag p">{visibles.filter(a=>a.estado===estado).length}</span></div>
        {visibles.filter(a=>a.estado===estado).map(a=><button key={a.id} className="tmo-tarea" onClick={()=>setDetalle(a)}>
          <div className="row entre"><span className={`tag ${a.prioridad==='urgente'?'bad':a.prioridad==='alta'?'warn':'p'}`}>{a.prioridad}</span><span className="sub" style={{fontSize:11}}>#{a.id}</span></div>
          <strong>{a.titulo}</strong><p className="sub tmo-recorta">{a.descripcion || 'Sin descripción'}</p>
          <div className="row entre tmo-meta"><span><CalendarDays size={14}/> {fecha(a.fecha_limite)}</span><span>{a.responsable_nombre}</span></div>
        </button>)}
        {!visibles.some(a=>a.estado===estado) && <p className="vacio" style={{padding:24}}>No hay actividades</p>}
      </section>)}
    </div>
    {form && <Modal titulo={form.id?'Editar actividad':'Nueva actividad'} ancho={700} onCerrar={()=>setForm(null)}>
      <form onSubmit={e=>{e.preventDefault();guardar.mutate(form)}}>
        <div className="frm">
          <label className="w">Título *<input required maxLength={200} value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})}/></label>
          <label className="w">Descripción<textarea rows={3} value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})}/></label>
          <label>Fecha de inicio *<input required type="date" value={form.fecha_inicio} onChange={e=>setForm({...form,fecha_inicio:e.target.value})}/></label>
          <label>Fecha límite *<input required type="date" min={form.fecha_inicio} value={form.fecha_limite} onChange={e=>setForm({...form,fecha_limite:e.target.value})}/></label>
          <label>Responsable único *<select required value={form.responsable} onChange={e=>setForm({...form,responsable:e.target.value})}><option value="">Seleccionar integrante</option>{miembros.lista.map(m=><option value={m.id} key={m.id}>{m.nombre}</option>)}</select></label>
          <label>Prioridad<select value={form.prioridad} onChange={e=>setForm({...form,prioridad:e.target.value})}>{PRIORIDADES.map(([v,t])=><option value={v} key={v}>{t}</option>)}</select></label>
          <label className="w">Función<select value={form.funcion||''} onChange={e=>setForm({...form,funcion:e.target.value})}><option value="">Sin etiqueta</option>{funciones.map(f=><option key={f.id} value={f.id}>{f.nombre}</option>)}</select></label>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="acciones"><button type="button" className="btn ghost" onClick={()=>setForm(null)}>Cancelar</button><button className="btn" disabled={guardar.isPending}>{guardar.isPending?'Guardando…':'Guardar actividad'}</button></div>
      </form>
    </Modal>}
    {detalle && <Detalle actividad={actividades.find(a=>a.id===detalle.id) ?? detalle} usuario={usuario} lider={lider}
      onCerrar={()=>setDetalle(null)} onEditar={()=>{abrir(detalle);setDetalle(null)}} onEliminar={()=>window.confirm('¿Eliminar esta actividad?')&&borrar.mutate(detalle.id)} onEstado={(estado)=>cambiar.mutate({id:detalle.id,estado})} refrescar={refrescar}/>}
  </>
}

function Detalle({actividad:a,usuario,lider,onCerrar,onEditar,onEliminar,onEstado,refrescar}) {
  const [nombre,setNombre] = useState('')
  const [url,setUrl] = useState('')
  const [texto,setTexto] = useState('')
  const [archivo,setArchivo] = useState(null)
  const [nombreArchivo,setNombreArchivo] = useState('')
  const [error,setError] = useState('')
  const {data:comentarios=[] ,refetch} = useQuery({queryKey:['comentarios-actividad',a.id], queryFn:()=>api(ACTIVIDAD_COMENTARIOS(a.id))})
  const puedeEstado = a.responsable===usuario.id || lider
  async function entregable(e) {
    e.preventDefault(); setError('')
    try { await api(ACTIVIDAD_ENTREGABLES(a.id),{metodo:'POST',datos:{nombre,url}});setNombre('');setUrl('');refrescar();aviso('Enlace registrado') } catch(err){setError(err.message)}
  }
  async function cargarArchivo(e) {
    e.preventDefault();setError('')
    if (!archivo) return setError('Selecciona un archivo.')
    const datos=new FormData()
    datos.append('nombre',nombreArchivo.trim() || archivo.name)
    datos.append('archivo',archivo)
    try {await api(ACTIVIDAD_ENTREGABLES(a.id),{metodo:'POST',datos});setArchivo(null);setNombreArchivo('');e.target.reset();refrescar();aviso('Archivo adjuntado')}
    catch(err){setError(err.message)}
  }
  async function comentar(e) {
    e.preventDefault(); setError('')
    try { await api(ACTIVIDAD_COMENTARIOS(a.id),{metodo:'POST',datos:{contenido:texto}});setTexto('');refetch();refrescar() } catch(err){setError(err.message)}
  }
  return <Panel titulo={a.titulo} onCerrar={onCerrar}>
    <p className="sub" style={{margin:'12px 0'}}>{a.descripcion || 'Sin descripción'}</p>
    <div className="row envuelve" style={{marginBottom:16}}><span className="tag p">{a.prioridad}</span><span className="tag">{a.responsable_nombre}</span></div>
    <p><b>Inicio:</b> {fecha(a.fecha_inicio)}</p><p><b>Fecha límite:</b> {fecha(a.fecha_limite)}</p>
    <h2 style={{marginTop:22}}>Estado</h2>
    <div className="chips">{ESTADOS.map(([id,t])=><button key={id} className="chip" aria-pressed={a.estado===id} disabled={!puedeEstado} onClick={()=>onEstado(id)}>{t}</button>)}</div>
    {lider && <div className="row" style={{marginBottom:20}}><button className="btn ghost chico" onClick={onEditar}><Pencil size={14}/> Editar</button><button className="btn ghost chico" onClick={onEliminar}><Trash2 size={14}/> Eliminar</button></div>}
    <h2><Link2 size={16}/> Entregables ({a.entregables.length})</h2>
    {a.entregables.map(e=><p key={e.id} style={{marginBottom:8}}><a href={e.url || e.archivo} target="_blank" rel="noreferrer">{e.nombre}</a></p>)}
    {!a.entregables.length && <p className="sub">Aún sin entregables.</p>}
    {puedeEstado && <form onSubmit={entregable} className="frm c1" style={{display:'grid',gridTemplateColumns:'1fr',marginBottom:18}}>
      <label>Nombre<input value={nombre} onChange={e=>setNombre(e.target.value)} required/></label>
      <label>Enlace HTTP/HTTPS<input type="url" value={url} onChange={e=>setUrl(e.target.value)} required placeholder="https://..."/></label>
      <button className="btn chico">Agregar enlace</button>
    </form>}
    {puedeEstado && <form onSubmit={cargarArchivo} className="frm c1" style={{display:'grid',gridTemplateColumns:'1fr',marginBottom:18}}>
      <label>Nombre del archivo<input value={nombreArchivo} onChange={e=>setNombreArchivo(e.target.value)} placeholder="Opcional"/></label>
      <label>Archivo (PDF, Word, Excel, imagen, TXT o CSV, máximo 10 MB)<input type="file" accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.txt,.csv" onChange={e=>setArchivo(e.target.files?.[0] ?? null)} required/></label>
      <button className="btn chico">Adjuntar archivo</button>
    </form>}

    <h2 style={{marginTop:18}}><MessageSquare size={16}/> Comentarios</h2>
    {comentarios.map(c=><div className="tmo-comment" key={c.id}><b>{c.usuario_nombre}</b><p>{c.contenido}</p></div>)}
    {!comentarios.length && <p className="sub">Aún no hay comentarios.</p>}
    <form onSubmit={comentar}><textarea className="campo" rows={3} value={texto} onChange={e=>setTexto(e.target.value)} placeholder="Escribe tu comentario" required/><button className="btn chico" style={{marginTop:10}}>Comentar</button></form>
    {error && <p className="error">{error}</p>}
  </Panel>
}
