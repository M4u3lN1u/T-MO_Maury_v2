import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, FilePlus2, Pencil, Trash2, BookOpen, MessageSquare, Download, Eye, Upload } from 'lucide-react'
import { api } from '../../conexion/cliente'
import { useSesion } from '../../auth/contexto'
import { useProyectoActivo } from '../../layout/proyectoActivo'
import { useEquipos } from '../../conexion/consultas'
import { PLANTILLAS, PLANTILLAS_DE, PLANTILLA, MINUTAS, MINUTAS_DEL_PROYECTO, MINUTA, MINUTA_COMENTARIOS } from '../api'
import Encabezado from '../../componentes/Encabezado'
import Modal, { Panel } from '../../componentes/Modal'
import EditorConFormato from '../../componentes/EditorConFormato'
import EditorWord from '../../componentes/EditorWord'
import { subirDocx, errorDocx, rutaDe, pdfDeWord } from '../../utilidades/word'
import { aviso } from '../../componentes/aviso'

const MINUTA_BASE = '<h2>Minuta de reunión</h2><p><strong>Fecha:</strong> </p><p><strong>Asistentes:</strong> </p><h3>Temas tratados</h3><p></p><h3>Acuerdos y responsables</h3><p></p><h3>Próxima reunión</h3><p></p>'
const fecha = (v) => v ? new Date(v).toLocaleDateString('es-MX',{day:'2-digit',month:'long',year:'numeric'}) : '—'
const escapar = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))

function imprimirMinuta(m) {
  const ventana = window.open('', '_blank')
  if (!ventana) return aviso('Permite las ventanas emergentes para imprimir la minuta.')
  ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="UTF-8"><title>${escapar(m.nombre)}</title><style>body{font:14px/1.65 Arial,sans-serif;margin:40px auto;max-width:760px;color:#191338}h1,h2,h3{color:#244ca5}header{border-bottom:3px solid #244ca5;padding-bottom:14px;margin-bottom:24px}.sub{color:#666}@media print{body{margin:0}} </style></head><body><header><h1>${escapar(m.nombre)}</h1><p class="sub">${escapar(m.equipo_nombre)} · ${escapar(fecha(m.fecha_inicio))}</p></header>${m.contenido_html || '<p>Sin contenido</p>'}</body></html>`)
  ventana.document.close()
  ventana.focus()
  ventana.print()
}

export default function MinutasPage() {
  const { usuario } = useSesion()
  const { proyecto } = useProyectoActivo()
  const qc = useQueryClient()
  const equipos = useEquipos(proyecto?.id)
  const lider = usuario.rol === 'lider'
  const [mios, setMios] = useState(false)
  const [editando, setEditando] = useState(null)
  const [plantillasAbiertas, setPlantillasAbiertas] = useState(false)
  const [viendo, setViendo] = useState(null)
  const [error, setError] = useState('')
  const { data: minutas = [], isLoading, error: errorLista } = useQuery({
    queryKey: ['minutas', proyecto?.id, mios], queryFn:()=>api(MINUTAS_DEL_PROYECTO(proyecto.id,mios)), enabled:!!proyecto,
  })
  const { data: plantillas = [] } = useQuery({
    queryKey:['plantillas',proyecto?.id], queryFn:()=>api(PLANTILLAS_DE(proyecto.id)), enabled:!!proyecto,
  })
  const refrescar = () => { qc.invalidateQueries({queryKey:['minutas']}); qc.invalidateQueries({queryKey:['plantillas']}) }
  const iniciar = (m) => {
    setError('')
    setEditando(m ? {...m, fecha_inicio:m.fecha_inicio?.slice(0,16) || ''} : {
      nombre:'', descripcion:'', equipo:equipos[0]?.id ?? '', plantilla:'', contenido_html:MINUTA_BASE,
      archivo:'', fecha_inicio:new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16),
    })
  }
  const eliminar = async (m) => {
    if(!window.confirm(`¿Eliminar la minuta «${m.nombre}»?`)) return
    try {await api(MINUTA(m.id),{metodo:'DELETE'});refrescar();setViendo(null);aviso('Minuta eliminada')} catch(e){aviso(e.message)}
  }
  if (!proyecto) return <><Encabezado titulo="Minutas"/><div className="card vacio">No tienes un proyecto asignado.</div></>
  return <>
    <Encabezado titulo="Minutas" sub={`Documentos de reunión · ${proyecto.nombre}`}>
      {lider && <button className="btn sec" onClick={()=>setPlantillasAbiertas(true)}><BookOpen size={16}/> Plantillas</button>}
      <button className="btn" onClick={()=>iniciar(null)} disabled={!equipos.length}><FilePlus2 size={16}/> Nueva minuta</button>
    </Encabezado>
    <div className="row entre" style={{marginBottom:18}}>
      <div className="chips" style={{margin:0}}><button className="chip" aria-pressed={!mios} onClick={()=>setMios(false)}>Todas las minutas</button><button className="chip" aria-pressed={mios} onClick={()=>setMios(true)}>Mis minutas</button></div>
      <span className="tag p">{minutas.length} documentos</span>
    </div>
    {errorLista && <p className="error" role="alert">{errorLista.message}</p>}
    {isLoading && <p className="sub">Cargando minutas…</p>}
    {!equipos.length && <div className="card vacio">Para crear una minuta, primero debes crear un equipo en «Equipos y miembros».</div>}
    <div className="grid g3" style={{alignItems:'start'}}>
      {minutas.map(m=><div className="card tmo-minuta" key={m.id}>
        <div className="row entre"><span className="tmo-document-icon"><FileText size={20}/></span><span className="tag p">Minuta</span></div>
        <h2 style={{fontSize:18, marginTop:14}}>{m.nombre}</h2><p className="sub">{m.descripcion || 'Documento de reunión'}</p>
        <p className="sub" style={{marginTop:14}}><b>{m.equipo_nombre}</b><br/>{fecha(m.fecha_inicio || m.fecha_registro)}<br/>Por {m.creado_por_nombre}</p>
        <div className="row envuelve" style={{marginTop:16}}><button className="btn sec chico" onClick={()=>setViendo(m)}><Eye size={15}/> Ver</button>
          {(m.creado_por===usuario.id || lider) && <button className="btn ghost chico" onClick={()=>iniciar(m)}><Pencil size={15}/> Editar</button>}
        </div>
      </div>)}
    </div>
    {!isLoading && !minutas.length && <div className="card vacio" style={{marginTop:18}}>No hay minutas registradas. Crea una para documentar los acuerdos de tu equipo.</div>}
    {editando && <EditorMinuta key={editando.id || 'nueva'} minuta={editando} equipos={equipos} plantillas={plantillas} onCerrar={()=>setEditando(null)} onGuardado={()=>{refrescar();setEditando(null);aviso('Minuta guardada')}} onError={setError} error={error} />}
    {viendo && <VisorMinuta minuta={minutas.find(m=>m.id===viendo.id) ?? viendo} usuario={usuario} lider={lider} onCerrar={()=>setViendo(null)} onEditar={()=>{iniciar(viendo);setViendo(null)}} onEliminar={()=>eliminar(viendo)} />}
    {plantillasAbiertas && <PlantillasPanel proyecto={proyecto} equipos={equipos} plantillas={plantillas} onCerrar={()=>setPlantillasAbiertas(false)} onGuardado={refrescar} />}
  </>
}

function EditorMinuta({minuta, equipos, plantillas, onCerrar, onGuardado, error, onError}) {
  const [v,setV] = useState(minuta)
  const [guardando,setGuardando] = useState(false)
  const [subiendo,setSubiendo] = useState(false)
  const wordRef = useRef(null)
  function elegirPlantilla(id) {
    const p = plantillas.find(p=>String(p.id)===String(id))
    setV(prev=>({...prev,plantilla:id,contenido_html:p?.contenido_html || MINUTA_BASE,archivo:p?.archivo||''}))
  }
  async function importar(e) {
    const fichero=e.target.files?.[0]
    if (!fichero) return
    const fallo=errorDocx(fichero)
    if (fallo) {onError(fallo);return}
    setSubiendo(true);onError('')
    try { const url=await subirDocx(fichero, fichero.name.replace(/\.docx$/i,''));setV({...v,archivo:url,contenido_html:''}) }
    catch(err){onError(err.message)} finally {setSubiendo(false)}
  }
  async function guardar(e) {
    e.preventDefault();setGuardando(true);onError('')
    try {
      let archivo=v.archivo
      if(archivo && wordRef.current) {
        const nuevoWord=await wordRef.current.exportar()
        archivo=await subirDocx(nuevoWord,v.nombre)
      }
      const datos={nombre:v.nombre.trim(),descripcion:v.descripcion, equipo:Number(v.equipo),
        plantilla:v.plantilla?Number(v.plantilla):null,contenido_html:archivo?'':v.contenido_html, archivo,
        fecha_inicio:v.fecha_inicio||null}
      await api(v.id?MINUTA(v.id):MINUTAS,{metodo:v.id?'PATCH':'POST',datos})
      onGuardado()
    } catch(err){onError(err.message)} finally {setGuardando(false)}
  }
  return <Modal titulo={v.id?'Editar minuta':'Nueva minuta'} ancho={940} onCerrar={onCerrar}>
    <form onSubmit={guardar} className="tmo-editor-minuta">
      <div className="frm">
        <label className="w">Título de la minuta *<input value={v.nombre} maxLength={200} required onChange={e=>setV({...v,nombre:e.target.value})}/></label>
        <label className="w">Descripción<input maxLength={300} value={v.descripcion||''} onChange={e=>setV({...v,descripcion:e.target.value})}/></label>
        <label>Equipo *<select value={v.equipo} required onChange={e=>setV({...v,equipo:e.target.value,plantilla:''})}><option value="">Seleccionar</option>{equipos.map(eq=><option value={eq.id} key={eq.id}>{eq.nombre}</option>)}</select></label>
        <label>Fecha de reunión<input type="datetime-local" value={v.fecha_inicio||''} onChange={e=>setV({...v,fecha_inicio:e.target.value})}/></label>
        <label className="w">Plantilla de documento<select value={v.plantilla??''} onChange={e=>elegirPlantilla(e.target.value)}><option value="">Formato básico</option>{plantillas.filter(p=>!p.equipo || String(p.equipo)===String(v.equipo)).map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}</select></label>
      </div>
      <div className="row entre" style={{margin:'18px 0 8px'}}><h2 style={{margin:0}}>Editar contenido</h2><label className="btn sec chico" style={{cursor:'pointer'}}><Upload size={15}/> {subiendo?'Subiendo…':'Importar Word (.docx)'}<input type="file" accept=".docx" style={{display:'none'}} onChange={importar} disabled={subiendo}/></label></div>
      {v.archivo ? <><EditorWord key={v.archivo} documento={v.archivo} ref={wordRef}/><p className="sub">El archivo Word se edita aquí y se guarda con la minuta.</p><button className="btn ghost chico" type="button" onClick={()=>setV({...v,archivo:'',contenido_html:MINUTA_BASE})}>Usar editor de texto</button></> : <EditorConFormato etiqueta="Contenido de la minuta" valor={v.contenido_html||''} onChange={html=>setV(prev=>({...prev,contenido_html:html}))}/>}
      {error && <p className="error" role="alert" style={{marginTop:12}}>{error}</p>}
      <div className="acciones" style={{marginTop:20}}><button className="btn ghost" type="button" onClick={onCerrar}>Cancelar</button><button className="btn" disabled={guardando||subiendo}>{guardando?'Guardando…':'Guardar minuta'}</button></div>
    </form>
  </Modal>
}

function VisorMinuta({minuta:m,usuario,lider,onCerrar,onEditar,onEliminar}) {
  const [texto,setTexto]=useState('')
  const [error,setError]=useState('')
  const {data:comentarios=[],refetch}=useQuery({queryKey:['minuta-comentarios',m.id],queryFn:()=>api(MINUTA_COMENTARIOS(m.id))})
  async function comentar(e) {e.preventDefault();setError('');try {await api(MINUTA_COMENTARIOS(m.id),{metodo:'POST',datos:{contenido:texto}});setTexto('');refetch()} catch(err){setError(err.message)}}
  async function descargar() {
    try {if(m.archivo) await pdfDeWord(m.archivo,m.nombre);else imprimirMinuta(m)}catch(e){aviso(e.message)}
  }
  return <Panel titulo={m.nombre} onCerrar={onCerrar}>
    <p className="sub">{m.equipo_nombre} · {fecha(m.fecha_inicio || m.fecha_registro)} · {m.creado_por_nombre}</p>
    <div className="row envuelve" style={{margin:'18px 0'}}><button className="btn sec chico" onClick={descargar}><Download size={15}/> Imprimir / PDF</button>
      {m.archivo && <a className="btn ghost chico" href={rutaDe(m.archivo)} download><Download size={15}/> Descargar Word</a>}
      {(m.creado_por===usuario.id || lider) && <><button className="btn ghost chico" onClick={onEditar}><Pencil size={15}/> Editar</button><button className="btn ghost chico" onClick={onEliminar}><Trash2 size={15}/> Eliminar</button></>}
    </div>
    {m.archivo ? <EditorWord documento={m.archivo} soloLectura /> : <article className="paper tmo-paper" dangerouslySetInnerHTML={{__html:m.contenido_html || '<p>Sin contenido</p>'}}/>}
    <h2 style={{marginTop:22}}><MessageSquare size={16}/> Comentarios</h2>
    {comentarios.map(c=><div key={c.id} className="tmo-comment"><b>{c.usuario_nombre}</b><p>{c.contenido}</p></div>)}
    {!comentarios.length && <p className="sub">Aún no hay comentarios.</p>}
    <form onSubmit={comentar}><textarea className="campo" rows={3} value={texto} required placeholder="Escribe un comentario" onChange={e=>setTexto(e.target.value)}/><button className="btn chico" style={{marginTop:10}}>Comentar</button></form>
    {error && <p className="error">{error}</p>}
  </Panel>
}

function PlantillasPanel({proyecto,equipos,plantillas,onCerrar,onGuardado}) {
  const [v,setV] = useState(null)
  const [error,setError]=useState('')
  const [guardando,setGuardando]=useState(false)
  const wordRef=useRef(null)
  function nueva(p) {setV(p||{nombre:'',equipo:equipos[0]?.id || '',contenido_html:MINUTA_BASE,archivo:''});setError('')}
  async function cargar(e) {const f=e.target.files?.[0];if(!f)return;const fallo=errorDocx(f);if(fallo)return setError(fallo)
    try{setGuardando(true);const url=await subirDocx(f,f.name.replace(/\.docx$/i,''));setV({...v,archivo:url,contenido_html:''})}catch(err){setError(err.message)}finally{setGuardando(false)}}
  async function guardar(e) {e.preventDefault();setGuardando(true);setError('')
    try {let archivo=v.archivo;if(archivo&&wordRef.current) archivo=await subirDocx(await wordRef.current.exportar(),v.nombre)
      await api(v.id?PLANTILLA(v.id):PLANTILLAS,{metodo:v.id?'PATCH':'POST',datos:{nombre:v.nombre,equipo:v.equipo?Number(v.equipo):null,contenido_html:archivo?'':v.contenido_html,archivo}})
      onGuardado();setV(null);aviso('Plantilla guardada')
    } catch(err){setError(err.message)}finally{setGuardando(false)} }
  async function eliminar(p) {if(!window.confirm('¿Eliminar esta plantilla?'))return;try{await api(PLANTILLA(p.id),{metodo:'DELETE'});onGuardado();aviso('Plantilla eliminada')}catch(err){aviso(err.message)}}
  return <Modal titulo="Biblioteca de plantillas" ancho={860} onCerrar={onCerrar}>
    {!v ? <><p className="sub">Crea tus formatos para reutilizarlos al generar minutas.</p><button className="btn" style={{margin:'14px 0'}} onClick={()=>nueva(null)}><FilePlus2 size={15}/> Nueva plantilla</button>
      <div className="list">{plantillas.map(p=><div className="row entre" key={p.id}><span><b>{p.nombre}</b><p className="sub">{p.archivo?'Documento Word (.docx)':'Plantilla de texto'} · {equipos.find(e=>e.id===p.equipo)?.nombre || 'General'}</p></span><span className="row"><button className="btn ghost chico" onClick={()=>nueva(p)}><Pencil size={14}/></button><button className="btn ghost chico" onClick={()=>eliminar(p)}><Trash2 size={14}/></button></span></div>)}
      {!plantillas.length && <p className="vacio">Aún no se han creado plantillas.</p>}</div></> : <form onSubmit={guardar}>
        <div className="frm"><label className="w">Nombre *<input required value={v.nombre} onChange={e=>setV({...v,nombre:e.target.value})}/></label>
        <label className="w">Equipo<select value={v.equipo??''} onChange={e=>setV({...v,equipo:e.target.value})}><option value="">Disponible en todos los equipos</option>{equipos.map(eq=><option key={eq.id} value={eq.id}>{eq.nombre}</option>)}</select></label></div>
        <label className="btn sec chico" style={{cursor:'pointer',display:'inline-flex',margin:'14px 0'}}><Upload size={14}/> Importar .docx<input type="file" accept=".docx" style={{display:'none'}} onChange={cargar}/></label>
        {v.archivo ? <><EditorWord key={v.archivo} documento={v.archivo} ref={wordRef}/><button className="btn ghost chico" type="button" onClick={()=>setV({...v,archivo:'',contenido_html:MINUTA_BASE})}>Usar editor de texto</button></> : <EditorConFormato etiqueta="Contenido de la plantilla" valor={v.contenido_html||''} onChange={html=>setV(prev=>({...prev,contenido_html:html}))}/>}
        {error && <p className="error" role="alert">{error}</p>}
        <div className="acciones"><button type="button" className="btn ghost" onClick={()=>setV(null)}>Volver</button><button className="btn" disabled={guardando}>{guardando?'Guardando…':'Guardar plantilla'}</button></div></form>}
  </Modal>
}
