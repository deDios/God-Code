(()=>{window.GC_DEBUG=false;function gcLog(...a){if(window.GC_DEBUG&&typeof console!="undefined")try{console.log("[GC]",...a);}catch{}}
const setVH=()=>{document.documentElement.style.setProperty("--vh",`${window.innerHeight*0.01}px`)};setVH();window.addEventListener("resize",setVH);

// ===== API ENDPOINTS =====
const API_BASE="https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
const API={
  cursos:API_BASE+"c_cursos.php", iCursos:API_BASE+"i_cursos.php", uCursos:API_BASE+"u_cursos.php",
  noticias:API_BASE+"c_noticia.php", iNoticias:API_BASE+"i_noticia.php", uNoticias:API_BASE+"u_noticia.php",
  tutores:API_BASE+"c_tutor.php", iTutores:API_BASE+"i_tutor.php", uTutores:API_BASE+"u_tutor.php",
  usuarios:API_BASE+"c_usuarios.php", iUsuarios:API_BASE+"i_usuario.php", uUsuarios:API_BASE+"u_usuario.php",
  suscripciones:API_BASE+"c_suscripciones.php", iInscripcion:API_BASE+"i_inscripcion.php", uInscripcion:API_BASE+"u_inscripcion.php"
};
const API_UPLOAD={
  cursoImg:API_BASE+"u_cursoImg.php",
  noticiaImg:API_BASE+"u_noticiaImagenes.php",
  tutorImg:API_BASE+"u_tutorImg.php",
  uAvatar: API_BASE+"u_avatar.php"
};
// ===== STATE =====
const state={data:[],currentDrawer:null,route:"",tempNewCourseImage:null,tempNewNewsImages:{1:null,2:null},tempNewTutorImage:null};

// ====== UTILS =====
const qs=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];
const escapeHTML=s=>(s||"").replace(/[&<>\"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
const escapeAttr=s=>escapeHTML(s);
const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const digits=s=>String(s||"").replace(/\D+/g,"");
const isEmail=s=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
const ntf=v=>Number(v)||0;
const fmtDate=d=>d?new Date(d).toLocaleDateString():"";
const fmtDateTime=d=>d?new Date(d).toLocaleString():"";
async function getJSON(u){try{const r=await fetch(u);return await r.json();}catch(e){gcLog("fetch fail",e);return null}}
async function postJSON(u,b){try{const r=await fetch(u,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});return await r.json();}catch(e){gcLog("post fail",e);return null}}

// ===== BADGES =====
const STATUS_LABELS={
  curso:{1:"Activo",0:"Inactivo",2:"Pausado",3:"Terminado",4:"Cancelado",5:"En curso"},
  noticia:{1:"Activo",0:"Inactivo",2:"Pausada",3:"Temporal",4:"Cancelada"},
  tutor:{1:"Activo",0:"Inactivo",2:"Pausado"},
  usuario:{1:"Activo",0:"Inactivo"},                 // <-- agregar
  suscripcion:{1:"Activa",0:"Cancelada",2:"Suscrito",3:"Terminada"}
};

function statusTextModule(m,v){
  const t=STATUS_LABELS[m]||{};
  return (v in t)? t[v] : ("Estatus "+v);
}

function statusChip(m,v){
  const n=Number(v);
  const M={
    curso:{1:"curso-activo",0:"curso-inactivo",2:"curso-pausado",3:"curso-terminado",4:"curso-cancelado",5:"curso-encurso"},
    noticia:{1:"noticia-activo",0:"noticia-inactivo",2:"noticia-pausa",3:"noticia-temporal",4:"noticia-cancelado"},
    tutor:{1:"tutor-activo",0:"tutor-inactivo",2:"tutor-pausado"},
    usuario:{1:"user-activo",0:"user-inactivo"},      // <-- agregar
    suscripcion:{1:"sub-activo",0:"sub-cancelado",2:"sub-suscrito",3:"sub-terminado"}
  };
  const cls=(M[m]&&M[m][n])||"gray";
  const label=statusTextModule(m,n);
  return `<span class="gc-chip ${cls}">${escapeHTML(label)}</span>`;
}

// ===== VALIDATION =====
function isBlank(v){return String(v==null?"":v).trim()===""}
function focusMarkInvalid(id){const el=qs("#"+id);if(!el)return;el.classList.add("gc-invalid");el.style.outline="2px solid #b00020";try{el.focus();}catch{}el.addEventListener("input",()=>{el.classList.remove("gc-invalid");el.style.outline=""},{once:true})}
function firstInvalidField(fields){for(const f of fields){const val=f.value;const empty=(typeof val==="number")?(!f.allowZero&&(isNaN(val)||val==null)):isBlank(val);if(empty)return f}return null}

// ===== TOAST =====
function toast(msg,type="info",ms=2500){const div=document.createElement("div");div.className=`gc-toast ${type}`;div.textContent=msg;document.body.appendChild(div);setTimeout(()=>div.remove(),ms)}

// ========== RENDER TABLES ==========
// Cursos
async function loadCursos(){const res=await getJSON(API.cursos);state.data=res||[];const wrap=qs("#tabla-cursos");if(!wrap)return;wrap.innerHTML=state.data.map(it=>`<div class="table-row" data-id="${it.id}" data-type="curso"><div class="col-nombre">${escapeHTML(it.nombre)} ${badgePrecio(it.precio)}</div><div class="col-tutor">${escapeHTML(it.tutor)}</div><div class="col-fecha">${fmtDate(it.fecha)}</div><div class="col-status">${statusChip('curso',it.estatus)}</div></div>`).join("")}
function badgePrecio(p){return p==0?`<span class="gc-chip success">Gratuito</span>`:`<span class="gc-chip gray">$${p}</span>`}

// Noticias
async function loadNoticias(){const res=await getJSON(API.noticias);state.data=res||[];const wrap=qs("#tabla-noticias");if(!wrap)return;wrap.innerHTML=state.data.map(it=>`<div class="table-row" data-id="${it.id}" data-type="noticia"><div class="col-nombre">${escapeHTML(it.titulo)}</div><div class="col-fecha">${fmtDateTime(it.fecha)}</div><div class="col-status">${statusChip('noticia',it.estatus)}</div></div>`).join("")}

// Tutores
async function loadTutores(){const res=await getJSON(API.tutores);state.data=res||[];const wrap=qs("#tabla-tutores");if(!wrap)return;wrap.innerHTML=state.data.map(it=>`<div class="table-row" data-id="${it.id}" data-type="tutor"><div class="col-nombre">${escapeHTML(it.nombre)}</div><div class="col-fecha"></div><div class="col-status">${statusChip('tutor',it.estatus)}</div></div>`).join("")}

// Usuarios
async function loadUsuarios(){const res=await getJSON(API.usuarios);state.data=res||[];const wrap=qs("#tabla-usuarios");if(!wrap)return;wrap.innerHTML=state.data.map(it=>`<div class="table-row" data-id="${it.id}" data-type="usuario"><div class="col-nombre">${escapeHTML(it.nombre)}</div><div class="col-correo">${escapeHTML(it.correo)}</div><div class="col-telefono">${escapeHTML(it.telefono)}</div><div class="col-status">${statusChip('usuario',it.estatus)}</div></div>`).join("")}

// Suscripciones
async function loadSuscripciones(){const res=await getJSON(API.suscripciones);state.data=res||[];const wrap=qs("#tabla-suscripciones");if(!wrap)return;wrap.innerHTML=state.data.map(it=>`<div class="table-row" data-id="${it.id}" data-type="suscripcion"><div class="col-nombre">${escapeHTML(it.suscriptor)}</div><div class="col-curso">${escapeHTML(it.curso_nombre)}</div><div class="col-fecha">${fmtDateTime(it.fecha)}</div><div class="col-status">${statusChip('suscripcion',it.estatus)}</div></div>`).join("")}


// ===== Drawer base =====
function openDrawer(title,body){const ov=qs("#gc-dash-overlay"),dw=qs("#gc-drawer");if(ov)ov.classList.add("open");if(!dw)return;const t=qs("#drawer-title"),b=qs("#drawer-body");if(t)t.textContent=title||"Detalle";if(b)b.innerHTML=body||"";dw.classList.add("open");dw.setAttribute("aria-hidden","false");state.currentDrawer=state.currentDrawer||{}}
function closeDrawer(){try{document.activeElement&&document.activeElement.blur()}catch{};const ov=qs("#gc-dash-overlay"),dw=qs("#gc-drawer");if(ov)ov.classList.remove("open");if(!dw)return;dw.classList.remove("open");dw.setAttribute("aria-hidden","true");state.currentDrawer=null}
function disableDrawerInputs(dis){qsa("#drawer-body input, #drawer-body select, #drawer-body textarea").forEach(el=>el.disabled=!!dis)}

// ===== Helpers form =====
function pair(l,v){return `<div class="field"><div class="label">${escapeHTML(l)}</div><div class="value">${escapeHTML(v!=null?v:"-")}</div></div>`}
function statusSelect(id,val){const o={1:"Activo",0:"Inactivo",2:"Pausado",3:"Terminado"};return `<select id="${id}">${Object.keys(o).map(k=>`<option value="${k}"${Number(val)===Number(k)?" selected":""}>${o[k]}</option>`).join("")}</select>`}
function withBust(url){try{const u=new URL(url,location.origin);u.searchParams.set("v",Date.now());return u.pathname+"?"+u.searchParams.toString()}catch{return url+(url.includes("?")?"&":"?")+"v="+Date.now()}}

// ===== Media mounts (solo lectura + edición simple imagen) =====
function mediaUrlsByType(type,id){id=Number(id);if(type==="noticia")return [`/ASSETS/noticia/NoticiasImg/noticia_img1_${id}.png`,`/ASSETS/noticia/NoticiasImg/noticia_img2_${id}.png`];if(type==="curso")return [`/ASSETS/cursos/img${id}.png`];if(type==="tutor")return [`/ASSETS/tutor/tutor_${id}.png`];if(type==="usuario")return [`/ASSETS/usuario/usuarioImg/img_user${id}.png`];return []}
function noImageSvg(){return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M20 70 L60 35 L95 65 L120 50 L140 70' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>"}
function mountReadOnlyMedia({container,type,id,labels=[],editable=false}){if(!container)return;const urls=mediaUrlsByType(type,id),grid=document.createElement("div");grid.className="media-grid";urls.forEach((url,i)=>{const label=labels[i]||("Imagen "+(i+1));const edit=editable?'<button class="icon-btn media-edit" title="Editar imagen">✎</button>':"";const card=document.createElement("div");card.className="media-card";card.innerHTML=`<figure class="media-thumb"><img alt="${escapeAttr(label)}" src="${withBust(url)}">${edit}</figure><div class="media-meta"><div class="media-label">${escapeHTML(label)}</div></div>`;const img=card.querySelector("img");img&&(img.onerror=()=>{img.onerror=null;img.src="data:image/svg+xml;utf8,"+encodeURIComponent(noImageSvg())});if(editable){card.querySelector(".media-edit").addEventListener("click",()=>{const input=document.createElement("input");input.type="file";input.accept="image/png,image/jpeg";input.style.display="none";document.body.appendChild(input);input.addEventListener("change",async()=>{const f=input.files&&input.files[0];try{document.body.removeChild(input)}catch{};if(!f)return;const ok=["image/png","image/jpeg"].includes(f.type)&&f.size<=2*1024*1024;if(!ok)return toast("Formato o tamaño inválido (JPG/PNG ≤2MB)","warning");try{if(type==="curso"){const fd=new FormData();fd.append("curso_id",String(id));fd.append("imagen",f);await fetch(API_UPLOAD.cursoImg,{method:"POST",body:fd})}else if(type==="noticia"){const fd=new FormData();fd.append("noticia_id",String(id));fd.append("pos",String(i+1));fd.append("imagen",f);await fetch(API_UPLOAD.noticiaImg,{method:"POST",body:fd})}else if(type==="tutor"){const fd=new FormData();fd.append("tutor_id",String(id));fd.append("imagen",f);await fetch(API_UPLOAD.tutorImg,{method:"POST",body:fd})}toast("Imagen actualizada","exito");img.src=URL.createObjectURL(f)}catch(e){gcLog(e);toast("No se pudo subir","error")}});input.click()})}grid.appendChild(card)});container.innerHTML=`<div class="media-head"><div class="media-title">Imágenes</div>${editable?'<div class="media-help">JPG/PNG · Máx 2MB</div>':'<div class="media-help">Solo lectura</div>'}</div>`;container.appendChild(grid)}

// ====== CURSOS: Drawer ======
function inText(id,v,ph){return `<input id="${id}" type="text" value="${escapeAttr(v||"")}" placeholder="${escapeAttr(ph||"")}">`}
function inNum(id,v,min=0){return `<input id="${id}" type="number" value="${escapeAttr(v!=null?v:"")}" min="${min}">`}
function inDate(id,v){return `<input id="${id}" type="date" value="${escapeAttr(v||"")}">`}
function inTA(id,v,rows=3){return `<textarea id="${id}" rows="${rows}">${escapeHTML(v||"")}</textarea>`}
function field(label,value,inputHTML,edit){return `<div class="field"><div class="label">${escapeHTML(label)}</div><div class="value">${edit?inputHTML:escapeHTML(value!=null?value:"-")}</div></div>`}
function mapToOptions(map,sel){if(!map||!map.length)return '<option value="">—</option>';return map.map(o=>`<option value="${escapeAttr(o.id)}"${String(sel)===String(o.id)?" selected":""}>${escapeHTML(o.nombre||o.titulo||("#"+o.id))}</option>`).join("")}

async function openCreateCurso(){const cat=await getJSON(API.cursos+"?cats=1");const tut=await getJSON(API.tutores);const prio=[{id:1,nombre:"Alta"},{id:2,nombre:"Media"},{id:3,nombre:"Baja"}];const act=[{id:1,nombre:"Actividades base"}];const tipo=[{id:1,nombre:"Examen"}];const cal=[{id:1,nombre:"Calendario A"}];const html=`
<div class="gc-actions"><button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button><button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button></div>
${field("Nombre","",inText("f_nombre","", "Nombre del curso"),true)}
${field("Descripción breve","",inTA("f_desc_breve","",3),true)}
${field("Descripción media","",inTA("f_desc_media","",4),true)}
${field("Descripción del curso","",inTA("f_desc_curso","",6),true)}
${field("Dirigido a","",inTA("f_dirigido","",3),true)}
${field("Competencias","",inTA("f_competencias","",3),true)}
<div class="grid-3">
 ${field("Tutor","",`<select id="f_tutor">${mapToOptions((tut||[]), "")}</select>`,true)}
 ${field("Categoría","",`<select id="f_categoria">${mapToOptions((cat||[]), "")}</select>`,true)}
 ${field("Prioridad","",`<select id="f_prioridad">${mapToOptions(prio,"1")}</select>`,true)}
</div>
<div class="grid-3">
 ${field("Tipo evaluación","",`<select id="f_tipo_eval">${mapToOptions(tipo,"1")}</select>`,true)}
 ${field("Actividades","",`<select id="f_actividades">${mapToOptions(act,"1")}</select>`,true)}
 ${field("Calendario","",`<select id="f_calendario">${mapToOptions(cal,"1")}</select>`,true)}
</div>
<div class="grid-3">
 ${field("Horas","",inNum("f_horas","",1),true)}
 ${field("Precio","",inNum("f_precio","",0),true)}
 ${field("Certificado","",`<label class="gc-inline"><input id="f_certificado" type="checkbox"> <span>Sí</span></label>`,true)}
</div>
${field("Fecha de inicio","",inDate("f_fecha",""),true)}
${field("Estatus","Activo",statusSelect("f_estatus",1),true)}
<div class="field"><div class="label">Imagen del curso</div><div class="value"><div id="create-media-curso" class="media-grid">
 <div class="media-card"><figure class="media-thumb"><img id="create-media-thumb" alt="Portada" src="${withBust("/ASSETS/cursos/img0.png")}">
 <button class="icon-btn media-edit" id="create-media-edit" title="Seleccionar imagen">✎</button></figure><div class="media-meta"><div class="media-label">Portada</div><div class="media-help">JPG/PNG · Máx 2MB</div></div></div></div></div></div>`;
openDrawer("Curso · Crear",html);setTimeout(()=>{const pick=()=>{const btn=qs("#create-media-edit"),img=qs("#create-media-thumb"),wrap=qs("#create-media-curso");if(!btn||!img||!wrap)return;btn.addEventListener("click",()=>{const input=document.createElement("input");input.type="file";input.accept="image/png,image/jpeg";input.style.display="none";document.body.appendChild(input);input.addEventListener("change",()=>{const f=input.files&&input.files[0];try{document.body.removeChild(input)}catch{};if(!f)return;if(!["image/png","image/jpeg"].includes(f.type)||f.size>2*1024*1024)return toast("Imagen inválida","warning");state.tempNewCourseImage=f;img.src=URL.createObjectURL(f);toast("Imagen lista (se sube al guardar)","exito")});input.click()})};pick();qs("#btn-cancel").addEventListener("click",()=>{state.tempNewCourseImage=null;closeDrawer()});qs("#btn-save").addEventListener("click",saveNewCurso)},0)}
function readCursoForm(){const v=id=>qs("#"+id)?.value||"";const n=id=>Number(v(id)||0);return {nombre:v("f_nombre"),descripcion_breve:v("f_desc_breve"),descripcion_media:v("f_desc_media"),descripcion_curso:v("f_desc_curso"),dirigido:v("f_dirigido"),competencias:v("f_competencias"),tutor:n("f_tutor"),categoria:n("f_categoria"),prioridad:n("f_prioridad"),tipo_evaluacion:n("f_tipo_eval"),actividades:n("f_actividades"),horas:n("f_horas"),precio:n("f_precio"),certificado:qs("#f_certificado")?.checked?1:0,fecha_inicio:v("f_fecha"),estatus:n("f_estatus")}}
async function saveNewCurso(){const p=readCursoForm();const invalid=firstInvalidField([{k:"f_nombre",value:p.nombre},{k:"f_desc_breve",value:p.descripcion_breve},{k:"f_desc_media",value:p.descripcion_media},{k:"f_desc_curso",value:p.descripcion_curso},{k:"f_dirigido",value:p.dirigido},{k:"f_competencias",value:p.competencias},{k:"f_tutor",value:p.tutor,allowZero:false},{k:"f_categoria",value:p.categoria,allowZero:false},{k:"f_prioridad",value:p.prioridad,allowZero:false},{k:"f_tipo_eval",value:p.tipo_evaluacion,allowZero:false},{k:"f_actividades",value:p.actividades,allowZero:false},{k:"f_horas",value:p.horas,allowZero:false},{k:"f_precio",value:p.precio,allowZero:true},{k:"f_fecha",value:p.fecha_inicio}]);if(invalid){focusMarkInvalid(invalid.k);return toast("Completa todos los campos obligatorios","warning")}if(!state.tempNewCourseImage)return toast("La imagen de curso es obligatoria","warning");try{const r=await postJSON(API.iCursos,p);const newId=(r&&(+r.id||+r.curso_id||+r.insert_id))||0;if(newId&&state.tempNewCourseImage){const fd=new FormData();fd.append("curso_id",String(newId));fd.append("imagen",state.tempNewCourseImage);await fetch(API_UPLOAD.cursoImg,{method:"POST",body:fd});state.tempNewCourseImage=null}toast("Curso creado","exito");closeDrawer();loadCursos()}catch(e){gcLog(e);toast("No se pudo crear","error")}}

// ====== NOTICIAS: Drawer ======
async function openCreateNoticia(){const html=`
<div class="gc-actions"><button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button><button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button></div>
${field("Título","",inText("f_tit","", "Título de la noticia"),true)}
${field("Estatus","Activo",statusSelect("f_estatus",1),true)}
${field("Descripción (1)","",inTA("f_desc1","",3),true)}
${field("Descripción (2)","",inTA("f_desc2","",3),true)}
<div class="field"><div class="label">Imágenes</div><div class="value"><div id="create-media-noticia" class="media-grid">
 <div class="media-card"><figure class="media-thumb"><img id="create-news-thumb-1" alt="Imagen 1" src="${withBust("/ASSETS/noticia/NoticiasImg/noticia_img1_0.png")}"><button class="icon-btn media-edit" id="create-news-edit-1">✎</button></figure><div class="media-meta"><div class="media-label">Imagen 1</div><div class="media-help">JPG/PNG · Máx 2MB</div></div></div>
 <div class="media-card"><figure class="media-thumb"><img id="create-news-thumb-2" alt="Imagen 2" src="${withBust("/ASSETS/noticia/NoticiasImg/noticia_img2_0.png")}"><button class="icon-btn media-edit" id="create-news-edit-2">✎</button></figure><div class="media-meta"><div class="media-label">Imagen 2</div><div class="media-help">JPG/PNG · Máx 2MB</div></div></div>
</div></div></div>`;
openDrawer("Noticia · Crear",html);state.tempNewNewsImages={1:null,2:null};setTimeout(()=>{const pick=pos=>{const btn=qs(`#create-news-edit-${pos}`),img=qs(`#create-news-thumb-${pos}`),wrap=qs("#create-media-noticia");if(!btn||!img||!wrap)return;btn.addEventListener("click",()=>{const input=document.createElement("input");input.type="file";input.accept="image/png,image/jpeg";input.style.display="none";document.body.appendChild(input);input.addEventListener("change",()=>{const f=input.files&&input.files[0];try{document.body.removeChild(input)}catch{};if(!f)return;if(!["image/png","image/jpeg"].includes(f.type)||f.size>2*1024*1024)return toast("Imagen inválida","warning");state.tempNewNewsImages[pos]=f;img.src=URL.createObjectURL(f);toast(`Imagen ${pos} lista`,"exito")});input.click()})};pick(1);pick(2);qs("#btn-cancel").addEventListener("click",()=>{state.tempNewNewsImages={1:null,2:null};closeDrawer()});qs("#btn-save").addEventListener("click",saveNewNoticia)},0)}
function readNoticiaForm(){const g=id=>qs("#"+id)?.value||"";return {titulo:g("f_tit"),desc_uno:g("f_desc1"),desc_dos:g("f_desc2"),estatus:+(qs("#f_estatus")?.value||1)}}
async function saveNewNoticia(){
  const p=readNoticiaForm();
  if(isBlank(p.titulo)) return focusMarkInvalid("f_tit"), toast("El título es obligatorio","warning");
  if(isBlank(p.desc_uno)) return focusMarkInvalid("f_desc1"), toast("La descripción (1) es obligatoria","warning");
  if(isBlank(p.desc_dos)) return focusMarkInvalid("f_desc2"), toast("La descripción (2) es obligatoria","warning");
  if(!state.tempNewNewsImages[1] || !state.tempNewNewsImages[2])
    return toast("Debes subir las 2 imágenes","warning");
  try{
    const r=await postJSON(API.iNoticias,p);
    const id=(r&&(+r.id||+r.noticia_id||+r.insert_id))||0;
    for(const pos of [1,2]){
      const f=state.tempNewNewsImages[pos];
      const fd=new FormData(); fd.append("noticia_id",String(id)); fd.append("pos",String(pos)); fd.append("imagen",f);
      await fetch(API_UPLOAD.noticiaImg,{method:"POST",body:fd});
    }
    toast("Noticia creada","exito"); state.tempNewNewsImages={1:null,2:null}; closeDrawer(); loadNoticias();
  }catch(e){ gcLog(e); toast("No se pudo crear","error"); }
}

// ====== TUTORES: Drawer ======
async function openCreateTutor(){const html=`
<div class="gc-actions"><button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button><button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button></div>
${field("Nombre","",inText("t_nombre","", "Nombre del tutor"),true)}
${field("Descripción","",inTA("t_desc","",4),true)}
${field("Estatus","Activo",statusSelect("t_estatus",1),true)}
<div class="field"><div class="label">Imagen</div><div class="value"><div id="create-media-tutor" class="media-grid">
 <div class="media-card"><figure class="media-thumb"><img id="create-tutor-thumb" alt="Foto" src="${withBust("/ASSETS/tutor/tutor_0.png")}"><button class="icon-btn media-edit" id="create-tutor-pick">✎</button></figure><div class="media-meta"><div class="media-label">Foto</div><div class="media-help">JPG/PNG · Máx 2MB</div></div></div></div></div></div>`;
openDrawer("Tutor · Crear",html);setTimeout(()=>{const btn=qs("#create-tutor-pick"),img=qs("#create-tutor-thumb"),wrap=qs("#create-media-tutor");btn&&btn.addEventListener("click",()=>{const input=document.createElement("input");input.type="file";input.accept="image/png,image/jpeg";input.style.display="none";document.body.appendChild(input);input.addEventListener("change",()=>{const f=input.files&&input.files[0];try{document.body.removeChild(input)}catch{};if(!f)return;if(!["image/png","image/jpeg"].includes(f.type)||f.size>2*1024*1024)return toast("Imagen inválida","warning");state.tempNewTutorImage=f;img.src=URL.createObjectURL(f);toast("Imagen lista","exito")});input.click()});qs("#btn-cancel").addEventListener("click",()=>{state.tempNewTutorImage=null;closeDrawer()});qs("#btn-save").addEventListener("click",saveTutorCreate)},0)}
async function saveTutorCreate(){const nombre=qs("#t_nombre")?.value||"",desc=qs("#t_desc")?.value||"",estatus=+(qs("#t_estatus")?.value||1);if(isBlank(nombre))return focusMarkInvalid("t_nombre"),toast("Nombre obligatorio","warning");if(isBlank(desc))return focusMarkInvalid("t_desc"),toast("Descripción obligatoria","warning");if(!state.tempNewTutorImage)return toast("La imagen del tutor es obligatoria","warning");try{const r=await postJSON(API.iTutores,{nombre:nombre,descripcion:desc,estatus});const id=(r&&(+r.id||+r.tutor_id||+r.insert_id))||0;if(id&&state.tempNewTutorImage){const fd=new FormData();fd.append("tutor_id",String(id));fd.append("imagen",state.tempNewTutorImage);await fetch(API_UPLOAD.tutorImg,{method:"POST",body:fd});state.tempNewTutorImage=null}toast("Tutor creado","exito");closeDrawer();loadTutores()}catch(e){gcLog(e);toast("No se pudo crear","error")}}

// ====== USUARIOS: Drawer + Validaciones ======
async function openCreateUsuario(){const html=`
<div class="gc-actions"><button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button><button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button></div>
<div class="field"><div class="label">Nombre</div><div class="value"><input id="u_nombre" type="text" placeholder="Nombre completo" required></div></div>
<div class="field"><div class="label">Correo</div><div class="value"><input id="u_correo" type="email" placeholder="correo@dominio.com" required></div></div>
<div class="field"><div class="label">Teléfono</div><div class="value"><input id="u_telefono" type="tel" placeholder="555..." required></div></div>
<div class="field"><div class="label">Fecha nacimiento</div><div class="value"><input id="u_fnac" type="date" required></div></div>
<div class="field"><div class="label">Tipo contacto</div><div class="value"><input id="u_tcontacto" type="number" min="1" value="1" required></div></div>
<div class="field"><div class="label">Estatus</div><div class="value">${statusSelect("u_estatus",1)}</div></div>
<div class="field"><div class="label">Avatar</div><div class="value"><div id="create-media-usuario" class="media-grid"><div class="media-card"><figure class="media-thumb"><img id="create-user-avatar" alt="Avatar" src="${withBust("/ASSETS/usuario/usuarioImg/img_user0.png")}"><button class="icon-btn media-edit" id="create-user-avatar-btn">✎</button></figure><div class="media-meta"><div class="media-label">Avatar</div><div class="media-help">JPG/PNG · Máx 2MB</div></div></div></div></div></div>`;
openDrawer("Usuario · Crear",html);setTimeout(()=>{const btn=qs("#create-user-avatar-btn"),img=qs("#create-user-avatar"),wrap=qs("#create-media-usuario");btn&&btn.addEventListener("click",()=>{const input=document.createElement("input");input.type="file";input.accept="image/png,image/jpeg";input.style.display="none";document.body.appendChild(input);input.addEventListener("change",()=>{const f=input.files&&input.files[0];try{document.body.removeChild(input)}catch{};if(!f)return;if(!["image/png","image/jpeg"].includes(f.type)||f.size>2*1024*1024)return toast("Imagen inválida","warning");state.tempNewUserAvatar=f;img.src=URL.createObjectURL(f);toast("Avatar listo","exito")});input.click()});qs("#btn-cancel").addEventListener("click",()=>{state.tempNewUserAvatar=null;closeDrawer()});qs("#btn-save").addEventListener("click",saveUsuarioCreate)},0)}
function readUsuarioForm(){const v=id=>qs("#"+id)?.value||"";const n=id=>Number(v(id)||0);return {nombre:v("u_nombre"),correo:v("u_correo"),telefono:v("u_telefono"),fecha_nacimiento:v("u_fnac"),tipo_contacto:n("u_tcontacto"),estatus:n("u_estatus")}}
async function saveUsuarioCreate(){if(!API.iUsuarios)return toast("Endpoint i_usuario no disponible","warning");const p=readUsuarioForm();if(isBlank(p.nombre))return focusMarkInvalid("u_nombre"),toast("El nombre es obligatorio","warning");if(isBlank(p.correo)||!isEmail(p.correo))return focusMarkInvalid("u_correo"),toast("Correo inválido u obligatorio","warning");if(isBlank(p.telefono)||digits(p.telefono).length<7)return focusMarkInvalid("u_telefono"),toast("Teléfono inválido u obligatorio","warning");if(isBlank(p.fecha_nacimiento))return focusMarkInvalid("u_fnac"),toast("La fecha de nacimiento es obligatoria","warning");if(!(Number(p.tipo_contacto)>0))return focusMarkInvalid("u_tcontacto"),toast("El tipo de contacto es obligatorio (>0)","warning");try{const r=await postJSON(API.iUsuarios,p);const newId=(r&&(+r.id||+r.usuario_id||+r.insert_id))||0;if(newId&&state.tempNewUserAvatar){const fd=new FormData();fd.append("usuario_id",String(newId));fd.append("imagen",state.tempNewUserAvatar);await fetch(API_UPLOAD.uAvatar,{method:"POST",body:fd});state.tempNewUserAvatar=null}toast("Usuario creado","exito");closeDrawer();loadUsuarios()}catch(e){gcLog(e);toast("No se pudo crear","error")}}
async function saveUsuarioUpdate(item){if(!item||!item._all)return toast("Sin item para actualizar","error");if(!API.uUsuarios)return toast("Endpoint u_usuario no disponible","warning");const p=readUsuarioForm();if(isBlank(p.nombre))return focusMarkInvalid("u_nombre"),toast("El nombre es obligatorio","warning");if(isBlank(p.correo)||!isEmail(p.correo))return focusMarkInvalid("u_correo"),toast("Correo inválido u obligatorio","warning");if(isBlank(p.telefono)||digits(p.telefono).length<7)return focusMarkInvalid("u_telefono"),toast("Teléfono inválido u obligatorio","warning");if(isBlank(p.fecha_nacimiento))return focusMarkInvalid("u_fnac"),toast("La fecha de nacimiento es obligatoria","warning");if(!(Number(p.tipo_contacto)>0))return focusMarkInvalid("u_tcontacto"),toast("El tipo de contacto es obligatorio (>0)","warning");await postJSON(API.uUsuarios,{...item._all,...p});toast("Cambios guardados","exito");loadUsuarios()}

// ====== SUSCRIPCIONES: combo filtrable + crear ======
function buildSearchableSelect(cfg){const root=document.createElement("div");root.className="gc-combo";root.innerHTML=`<div class="gc-combo-inputwrap"><input id="${escapeAttr(cfg.id)}-input" type="text" placeholder="${escapeAttr(cfg.placeholder||'Buscar...')}" autocomplete="off"/></div><div class="gc-combo-list" style="display:none;"></div><input type="hidden" id="${escapeAttr(cfg.id)}"/>`;cfg.mount.innerHTML="";cfg.mount.appendChild(root);const input=root.querySelector(`#${cfg.id}-input`),list=root.querySelector(".gc-combo-list"),hidden=root.querySelector(`#${cfg.id}`);const render=items=>{list.innerHTML=items.map(it=>`<button type="button" class="gc-combo-item" data-v="${escapeAttr(it.value)}">${escapeHTML(it.label)}</button>`).join("");list.style.display=items.length?"block":"none";list.querySelectorAll(".gc-combo-item").forEach(btn=>btn.addEventListener("click",()=>{const v=btn.getAttribute("data-v");const opt=(cfg.options||[]).find(o=>String(o.value)===String(v));hidden.value=v;input.value=opt?opt.label:"";list.style.display="none";cfg.onSelect&&cfg.onSelect(opt)}))};const filter=q=>{const k=norm(q);const src=cfg.options||[];const out=k?src.filter(o=>norm(o.label).includes(k)):src.slice(0,50);render(out.slice(0,50))};input.addEventListener("focus",()=>filter(input.value||""));input.addEventListener("input",()=>filter(input.value||""));document.addEventListener("click",e=>{if(!root.contains(e.target))list.style.display="none"});const style=document.createElement("style");style.textContent=`.gc-combo{position:relative}.gc-combo-inputwrap input{width:100%;padding:.5rem .65rem;border:1px solid #dadce0;border-radius:10px}.gc-combo-list{position:absolute;z-index:9999;left:0;right:0;top:100%;background:#fff;border:1px solid #e6e6e6;border-radius:12px;margin-top:6px;max-height:280px;overflow:auto;box-shadow:0 8px 24px rgba(0,0,0,.08)}.gc-combo-item{display:block;width:100%;text-align:left;padding:.5rem .75rem;background:#fff;border:0;border-bottom:1px solid #f3f3f3;cursor:pointer}.gc-combo-item:hover{background:#f7faff}`;document.head.appendChild(style);filter("");return {getValue:()=>hidden.value,setValue:v=>{hidden.value=v;const o=(cfg.options||[]).find(x=>String(x.value)===String(v));input.value=o?o.label:""},focus:()=>input.focus()}}
async function openCreateSuscripcion(){const [cursos,usuarios]=await Promise.all([getJSON(API.cursos),getJSON(API.usuarios)]);const cursosAct=(cursos||[]).filter(c=>+c.estatus===1).map(c=>({value:c.id,label:`${c.nombre} · ${fmtDate(c.fecha_inicio||"")}`}));const usuariosAct=(usuarios||[]).filter(u=>+u.estatus===1).map(u=>({value:u.id,label:`${u.nombre||u.correo||("#"+u.id)}`}));const html=`
<div class="gc-actions"><button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button><button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button></div>
<div class="field"><div class="label">Usuario <span style="color:#a50e0e">*</span></div><div class="value"><div id="sel-user-wrap"></div></div></div>
<div class="field"><div class="label">Curso <span style="color:#a50e0e">*</span></div><div class="value"><div id="sel-curso-wrap"></div></div></div>
<div class="field"><div class="label">Comentario</div><div class="value"><textarea id="s_comentario_new" rows="3" placeholder="(Opcional) Comentario u observación"></textarea></div></div>`;
openDrawer("Suscripción · Crear",html);state.currentDrawer={type:"suscripcion",id:null,mode:"create"};setTimeout(()=>{const wUser=qs("#sel-user-wrap"),wCurso=qs("#sel-curso-wrap");const userCombo=buildSearchableSelect({mount:wUser,id:"s_usuario",placeholder:"Buscar usuario...",options:usuariosAct});const cursoCombo=buildSearchableSelect({mount:wCurso,id:"s_curso",placeholder:"Buscar curso...",options:cursosAct});qs("#btn-cancel").addEventListener("click",()=>closeDrawer());qs("#btn-save").addEventListener("click",async()=>{const usuarioId=+qs("#s_usuario")?.value||0,cursoId=+qs("#s_curso")?.value||0,comentario=(qs("#s_comentario_new")?.value||"").trim();if(!(usuarioId>0)){toast("Selecciona un usuario","warning");userCombo.focus();return}if(!(cursoId>0)){toast("Selecciona un curso","warning");cursoCombo.focus();return}if(!API.iInscripcion){toast("Falta endpoint i_inscripcion.php","warning",3500);return}try{await postJSON(API.iInscripcion,{usuario:usuarioId,curso:cursoId,comentario});toast("Suscripción creada","exito");closeDrawer();loadSuscripciones()}catch(e){gcLog(e);toast("No se pudo crear la suscripción","error")}})},0)}

// ====== Binding UI / Routing ======
function bindUI(){const addBtn=qs("#btn-add");addBtn&&addBtn.addEventListener("click",async()=>{if(state.route.startsWith("#/cursos"))await openCreateCurso();else if(state.route.startsWith("#/noticias"))await openCreateNoticia();else if(state.route.startsWith("#/tutores"))await openCreateTutor();else if(state.route.startsWith("#/usuarios"))await openCreateUsuario();else if(state.route.startsWith("#/suscripciones"))await openCreateSuscripcion()});qsa(".gc-side .nav-item").forEach(el=>{el.addEventListener("click",e=>{e.preventDefault();const r=el.getAttribute("href")||el.dataset.route||"";if(!r)return;location.hash=r})});qs("#drawer-close")&&qs("#drawer-close").addEventListener("click",closeDrawer);qs("#gc-dash-overlay")&&qs("#gc-dash-overlay").addEventListener("click",e=>{if(e.target&&e.target.id==="gc-dash-overlay")closeDrawer()})}
function refreshCurrent(){if(state.route.startsWith("#/cursos"))loadCursos();else if(state.route.startsWith("#/noticias"))loadNoticias();else if(state.route.startsWith("#/tutores"))loadTutores();else if(state.route.startsWith("#/usuarios"))loadUsuarios();else if(state.route.startsWith("#/suscripciones"))loadSuscripciones()}
function onRouteChange(){state.route=location.hash||"#/cursos";qsa(".gc-side .nav-item").forEach(a=>{const active=(a.getAttribute("href")===state.route);a.classList.toggle("is-active",active);a.setAttribute("aria-current",active?"page":"false")});refreshCurrent()}
window.addEventListener("hashchange",onRouteChange);

// ====== Init ======
document.addEventListener("DOMContentLoaded",()=>{bindUI();if(!location.hash)location.hash="#/cursos";onRouteChange()});

})();

