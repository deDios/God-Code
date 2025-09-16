(() => {
"use strict";

/* ====================== Config & helpers ====================== */
const GC_DEBUG = false;
const gcLog = (...a)=>{ if(GC_DEBUG) try{console.log("[GC]",...a)}catch{} };
const qs  = (s, r=document)=>r.querySelector(s);
const qsa = (s, r=document)=>Array.prototype.slice.call(r.querySelectorAll(s));
const toast = (m,t="exito",d=2400)=>window.gcToast?window.gcToast(m,t,d):console[(t==="error"?"error":"log")]("[toast]",m);

const escapeHTML = s => String(s==null?"":s).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
const fmtMoney = n => { try { return new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(Number(n||0)) } catch { return "$"+(n||0) } };
const fmtDate = d => { if(!d) return "-"; try{ const p=String(d).split("-"); return `${p[2]||""}/${p[1]||""}/${p[0]||""}`}catch{return d} };
const withBust = url => { try{const u=new URL(url,location.origin);u.searchParams.set("v",Date.now());return u.pathname+"?"+u.searchParams.toString()}catch{return url+(url.includes("?")?"&":"?")+"v="+Date.now()} };
const humanSize = b => b<1024?b+" B":(b<1048576?((b/1024).toFixed(1)+" KB"):((b/1048576).toFixed(2)+" MB"));

async function postJSON(url, body){
  gcLog("POST",url,body);
  const r = await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body||{})});
  const t = await r.text().catch(()=> "");
  if(!r.ok) throw new Error("HTTP "+r.status+" "+t);
  if(!t.trim()) return {};
  try { return JSON.parse(t) } catch { return { _raw:t } }
}

/* ====================== API (solo cursos + catálogos) ====================== */
const API_BASE = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
const API = {
  cursos: API_BASE + "c_cursos.php",
  iCursos: API_BASE + "i_cursos.php",
  uCursos: API_BASE + "u_cursos.php",
  prioridad: API_BASE + "c_prioridad.php",
  categorias: API_BASE + "c_categorias.php",
  calendario: API_BASE + "c_dias_curso.php",
  tipoEval: API_BASE + "c_tipo_evaluacion.php",
  actividades: API_BASE + "c_actividades.php",
  tutores: API_BASE + "c_tutor.php"
};
const API_UPLOAD = { cursoImg: API_BASE + "u_cursoImg.php" };

/* ====================== Estado local ====================== */
const state = {
  search: "",
  page: 1,
  pageSize: 7,
  data: [],
  currentId: null,
  currentMode: "view", // "view" | "edit" | "create"
  // catálogos cacheados
  maps: { tutors:null, prioridad:null, categorias:null, calendario:null, tipoEval:null, actividades:null }
};
const cacheGuard = o => o && (Date.now() - o._ts < 30*60*1000);
const arrToMap = arr => { const m={}; (Array.isArray(arr)?arr:[]).forEach(x=> m[x.id]=x.nombre || x.titulo || `#${x.id}`); m._ts=Date.now(); return m; };

/* ====================== Catálogos (solo activos) ====================== */
async function getTutorsMap(){ if(cacheGuard(state.maps.tutors))return state.maps.tutors; const a=await postJSON(API.tutores,{estatus:1}); return state.maps.tutors=arrToMap(a) }
async function getPrioridadMap(){ if(cacheGuard(state.maps.prioridad))return state.maps.prioridad; const a=await postJSON(API.prioridad,{estatus:1}); return state.maps.prioridad=arrToMap(a) }
async function getCategoriasMap(){ if(cacheGuard(state.maps.categorias))return state.maps.categorias; const a=await postJSON(API.categorias,{estatus:1}); return state.maps.categorias=arrToMap(a) }
async function getCalendarioMap(){ if(cacheGuard(state.maps.calendario))return state.maps.calendario; const a=await postJSON(API.calendario,{estatus:1}); return state.maps.calendario=arrToMap(a) }
async function getTipoEvalMap(){ if(cacheGuard(state.maps.tipoEval))return state.maps.tipoEval; const a=await postJSON(API.tipoEval,{estatus:1}); return state.maps.tipoEval=arrToMap(a) }
async function getActividadesMap(){ if(cacheGuard(state.maps.actividades))return state.maps.actividades; const a=await postJSON(API.actividades,{estatus:1}); return state.maps.actividades=arrToMap(a) }

/* ====================== Status helpers ====================== */
const STATUS_SELECT_CURSOS = [
  { v:1, l:"Activo" },
  { v:2, l:"Pausado" },
  { v:4, l:"En curso" },
  { v:3, l:"Terminado" },
  { v:0, l:"Inactivo" },
  { v:5, l:"Cancelado" }
];
const statusText = v => (STATUS_SELECT_CURSOS.find(x=>Number(x.v)===Number(v))?.l)||String(v);

/* ====================== Imagen/Media (solo curso) ====================== */
function validarImagen(file, opt){ opt=opt||{}; const maxMB=Number(opt.maxMB||2); if(!file) return {ok:false,error:"No se seleccionó archivo"}; const allowed=["image/jpeg","image/png"]; if(!allowed.includes(file.type)) return {ok:false,error:"Formato no permitido. Solo JPG o PNG"}; const sizeMB=file.size/1024/1024; if(sizeMB>maxMB) return {ok:false,error:"La imagen excede "+maxMB+"MB"}; return {ok:true} }
function mediaUrlCurso(id){ return `/ASSETS/cursos/img${Number(id)}.png`; }
function imgExists(url){ return new Promise(res=>{ try{ const i=new Image(); i.onload=()=>res(true); i.onerror=()=>res(false); i.src=withBust(url) }catch{ res(false) } }); }

function mountCursoMedia(container, id, editable){
  if(!container) return;
  const url = mediaUrlCurso(id);
  container.innerHTML = `
    <div class="media-head">
      <div class="media-title">Imágenes</div>
      ${editable ? `<div class="media-help">Formatos: JPG/PNG · Máx 2MB</div>` : `<div class="media-help" style="color:#888;">Solo lectura</div>`}
    </div>
    <div class="media-grid">
      <div class="media-card">
        <figure class="media-thumb">
          <img alt="Portada" src="${withBust(url)}">
          ${editable ? `<button class="icon-btn media-edit" title="Editar imagen" aria-label="Editar imagen">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.0 1.0 0 0 0 0-1.41l-2.34-2.34a1.0 1.0 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"></path>
              </svg>
            </button>` : ``}
        </figure>
        <div class="media-meta"><div class="media-label">Portada</div></div>
      </div>
    </div>
  `;
  const img = qs("img", container);
  if(img){
    img.onerror = () => { img.onerror=null; img.src="data:image/svg+xml;utf8,"+encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M20 70 L60 35 L95 65 L120 50 L140 70' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>"); };
  }
  if(editable){
    const btn = qs(".media-edit", container);
    if(btn && !btn._gc_bound){
      btn._gc_bound = true;
      btn.addEventListener("click", async (e)=>{
        e.preventDefault();
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/png,image/jpeg";
        input.style.display="none";
        document.body.appendChild(input);
        input.addEventListener("change", async ()=>{
          const f = input.files && input.files[0];
          try{ document.body.removeChild(input) }catch{}
          if(!f) return;
          const v = validarImagen(f,{maxMB:2});
          if(!v.ok) return toast(v.error,"error");
          try{
            const fd = new FormData();
            fd.append("curso_id", String(id));
            fd.append("imagen", f);
            const res = await fetch(API_UPLOAD.cursoImg,{method:"POST",body:fd});
            const tx = await res.text().catch(()=> "");
            if(!res.ok) throw new Error("HTTP "+res.status+" "+tx);
            // refrezcar imagen
            if(img) img.src = withBust(mediaUrlCurso(id));
            toast("Imagen actualizada","exito");
          }catch(err){ gcLog(err); toast("No se pudo subir la imagen","error"); }
        });
        input.click();
      });
    }
  }
}

/* ====================== Listado Cursos ====================== */
function defaultMatcher(q){
  const k = String(q||"").normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().trim();
  return it => JSON.stringify(it).normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().includes(k);
}

function renderPagination(total){
  const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
  [qs("#pagination-controls"), qs("#pagination-mobile")].forEach(cont=>{
    if(!cont) return;
    cont.innerHTML="";
    if(totalPages<=1) return;
    const prev = document.createElement("button");
    prev.className="arrow-btn"; prev.textContent="‹"; prev.disabled = state.page===1;
    prev.onclick=()=>{ state.page=Math.max(1,state.page-1); drawCursos(); };
    cont.appendChild(prev);
    for(let p=1;p<=totalPages && p<=7;p++){
      const b=document.createElement("button");
      b.className="page-btn"+(p===state.page?" active":"");
      b.textContent=String(p);
      b.onclick=()=>{ state.page=p; drawCursos(); };
      cont.appendChild(b);
    }
    const next = document.createElement("button");
    next.className="arrow-btn"; next.textContent="›"; next.disabled = state.page===totalPages;
    next.onclick=()=>{ state.page=Math.min(totalPages,state.page+1); drawCursos(); };
    cont.appendChild(next);
  });
}

function desktopRowCurso(it, maps){
  const t = escapeHTML(maps.tutors[it.tutor] || "-");
  const f = escapeHTML(fmtDate(it.fecha_inicio));
  const s = escapeHTML(statusText(it.estatus));
  return `
  <div class="table-row" role="row" data-type="curso" data-id="${it.id}">
    <div class="col-nombre" role="cell">${escapeHTML(it.nombre||"-")}</div>
    <div class="col-tutor" role="cell">${t}</div>
    <div class="col-fecha" role="cell">${f}</div>
    <div class="col-status" role="cell">${s}</div>
  </div>`;
}

function mobileRowCurso(it, maps){
  const s = statusText(it.estatus);
  return `
  <div class="table-row-mobile" data-type="curso" data-id="${it.id}">
    <div class="row-main">
      <div class="col-nombre">${escapeHTML(it.nombre||"-")}</div>
      <button class="row-toggle" aria-label="Ver detalles"><span class="icon-chevron">›</span></button>
    </div>
    <div class="row-details">
      <div><strong>Tutor:</strong> ${escapeHTML(maps.tutors[it.tutor]||"-")}</div>
      <div><strong>Inicio:</strong> ${escapeHTML(fmtDate(it.fecha_inicio))}</div>
      <div><strong>Estatus:</strong> ${escapeHTML(s)}</div>
      <div style="margin-top:8px;">
        <button class="gc-btn open-drawer">Abrir</button>
      </div>
    </div>
  </div>`;
}

async function loadCursos(){
  // Por ahora: solo activos (1). Luego puedes cambiar el filtro leyendo #tt-status
  const data = await postJSON(API.cursos,{estatus:1});
  state.data = Array.isArray(data) ? data : [];
  state.page = 1;
  await drawCursos();
}

async function drawCursos(){
  const d = qs("#recursos-list"), m = qs("#recursos-list-mobile");
  if(d) d.innerHTML=""; if(m) m.innerHTML="";
  const maps = {
    tutors: await getTutorsMap()
  };
  // filtro por búsqueda
  const filt = state.search ? state.data.filter(defaultMatcher(state.search)) : state.data.slice();
  const start = (state.page-1)*state.pageSize;
  const pageRows = filt.slice(start, start+state.pageSize);

  pageRows.forEach(it=>{
    if(d) d.insertAdjacentHTML("beforeend", desktopRowCurso(it, maps));
    if(m) m.insertAdjacentHTML("beforeend", mobileRowCurso(it, maps));
  });

  // contador
  const countEl = qs("#mod-count"); if(countEl) countEl.textContent = String(filt.length);

  // binds
  qsa("#recursos-list .table-row").forEach(el=>{
    if(el._gc_bound) return; el._gc_bound=true;
    el.addEventListener("click", ()=>{
      const id = Number(el.dataset.id);
      openCursoDrawer(id,"view");
    });
  });
  qsa("#recursos-list-mobile .row-toggle").forEach(btn=>{
    if(btn._gc_bound) return; btn._gc_bound=true;
    btn.addEventListener("click", ()=>{
      const row = btn.closest(".table-row-mobile");
      row && row.classList.toggle("expanded");
    });
  });
  qsa("#recursos-list-mobile .open-drawer").forEach(btn=>{
    if(btn._gc_bound) return; btn._gc_bound=true;
    btn.addEventListener("click", (e)=>{
      e.stopPropagation();
      const row = btn.closest(".table-row-mobile");
      const id = Number(row?.dataset?.id||0);
      if(id) openCursoDrawer(id,"view");
    });
  });

  renderPagination(filt.length);
}

/* ====================== Drawer: Curso (vista/edición) ====================== */
function setCursoMode(mode){
  state.currentMode = mode; // "view"|"edit"|"create"
  const view = qs("#curso-view");
  const edit = qs("#curso-edit");
  const actionsView = qs("#curso-actions-view");
  if(mode==="view"){
    view && (view.hidden=false);
    actionsView && (actionsView.style.display="");
    edit && (edit.hidden=true);
  } else {
    view && (view.hidden=true);
    actionsView && (actionsView.style.display="none");
    edit && (edit.hidden=false);
  }
}

async function openCursoDrawer(id, mode){
  state.currentId = Number(id||0);
  const drawer = qs("#drawer-curso");
  const overlay = qs("#gc-dash-overlay");
  if(overlay){ overlay.classList.add("open"); }
  if(drawer){
    drawer.classList.add("open");
    drawer.removeAttribute("hidden");
    drawer.setAttribute("aria-hidden","false");
  }
  await fillCursoDrawer(id, mode||"view");
}

function closeDrawer(){
  const overlay = qs("#gc-dash-overlay");
  overlay && overlay.classList.remove("open");
  qsa(".drawer.gc-dash.open").forEach(d=>{
    d.classList.remove("open");
    d.setAttribute("aria-hidden","true");
    d.setAttribute("hidden","");
  });
  state.currentId = null;
}

function getEmptyCourse(){
  return {
    id:null, nombre:"", descripcion_breve:"", descripcion_curso:"", descripcion_media:"",
    dirigido:"", competencias:"", tutor:"", horas:"", precio:"", estatus:1,
    fecha_inicio:"", prioridad:"", categoria:"", calendario:"", tipo_evaluacion:"", actividades:""
  };
}

async function fillCursoDrawer(id, mode){
  const item = state.data.find(x=>Number(x.id)===Number(id));
  const titleEl = qs("#drawer-curso-title");
  titleEl && (titleEl.textContent = "Curso · " + (item?.nombre||"—"));

  setCursoMode(mode);

  const maps = await Promise.all([
    getTutorsMap(), getPrioridadMap(), getCategoriasMap(),
    getCalendarioMap(), getTipoEvalMap(), getActividadesMap()
  ]).then(([t,p,c,cal,te,a])=>({t,p,c,cal,te,a}));

  // Vista
  if(item && mode==="view"){
    qs("#v_nombre").innerHTML = escapeHTML(item.nombre||"—");
    qs("#v_desc_breve").innerHTML = item.descripcion_breve||"—";
    qs("#v_desc_media").innerHTML = item.descripcion_media||"—";
    qs("#v_desc_curso").innerHTML = item.descripcion_curso||"—";
    qs("#v_dirigido").innerHTML = item.dirigido||"—";
    qs("#v_competencias").innerHTML = item.competencias||"—";

    qs("#v_tutor").textContent = maps.t[item.tutor] || "—";
    qs("#v_categoria").textContent = maps.c[item.categoria] || "—";
    qs("#v_prioridad").textContent = maps.p[item.prioridad] || "—";
    qs("#v_tipo_eval").textContent = maps.te[item.tipo_evaluacion] || "—";
    qs("#v_actividades").textContent = maps.a[item.actividades] || "—";
    qs("#v_calendario").textContent = maps.cal[item.calendario] || "—";

    qs("#v_horas").textContent = String(item.horas||"—");
    qs("#v_precio").textContent = fmtMoney(item.precio||0);
    qs("#v_certificado").textContent = (Number(item.certificado)? "Sí":"No");
    qs("#v_fecha").textContent = fmtDate(item.fecha_inicio);
    qs("#v_estatus").textContent = statusText(item.estatus);

    const media = qs("#media-curso");
    if(media){
      media.setAttribute("data-id", String(item.id));
      // en modo vista: editable=false
      mountCursoMedia(media, item.id, /*editable*/ false);
    }

    // JSON dev
    const pre = qs("#json-curso");
    if(pre) pre.textContent = JSON.stringify(item, null, 2);
  }

  // Edición
  if(item && mode==="edit"){
    const setSel = (id,map,val)=>{ const sel=qs("#"+id); if(sel){ sel.innerHTML = Object.keys(map).filter(k=>k!=="_ts").map(k=>`<option value="${k}"${Number(k)===Number(val)?" selected":""}>${escapeHTML(map[k])}</option>`).join(""); } };
    const setVal = (id,val)=>{ const el=qs("#"+id); if(!el) return; if(el.type==="checkbox") el.checked = !!Number(val); else el.value = (val==null?"":val); };

    setVal("f_nombre", item.nombre);
    setVal("f_desc_breve", item.descripcion_breve);
    setVal("f_desc_curso", item.descripcion_curso);
    setVal("f_desc_media", item.descripcion_media);
    setVal("f_dirigido", item.dirigido);
    setVal("f_competencias", item.competencias);
    setVal("f_certificado", item.certificado);
    setVal("f_horas", item.horas);
    setVal("f_precio", item.precio);
    setVal("f_fecha", item.fecha_inicio);

    setSel("f_tutor", maps.t, item.tutor);
    setSel("f_prioridad", maps.p, item.prioridad);
    setSel("f_categoria", maps.c, item.categoria);
    setSel("f_calendario", maps.cal, item.calendario);
    setSel("f_tipo_eval", maps.te, item.tipo_evaluacion);
    setSel("f_actividades", maps.a, item.actividades);

    // estatus
    const selStat = qs("#f_estatus");
    if(selStat){
      selStat.innerHTML = STATUS_SELECT_CURSOS.map(o=>`<option value="${o.v}"${Number(o.v)===Number(item.estatus)?" selected":""}>${o.l}</option>`).join("");
    }

    const media = qs("#media-curso");
    if(media){
      media.setAttribute("data-id", String(item.id));
      // en edición: editable=true con pencil
      mountCursoMedia(media, item.id, /*editable*/ true);
    }
  }

  // Bind de acciones (una sola vez)
  const btnClose = qs("#drawer-curso-close");
  if(btnClose && !btnClose._gc_bound){
    btnClose._gc_bound=true;
    btnClose.addEventListener("click", closeDrawer);
  }

  const btnEdit = qs("#btn-edit");
  if(btnEdit && !btnEdit._gc_bound){
    btnEdit._gc_bound=true;
    btnEdit.addEventListener("click", ()=> openCursoDrawer(id,"edit"));
  }

  const btnCancel = qs("#btn-cancel");
  if(btnCancel && !btnCancel._gc_bound){
    btnCancel._gc_bound=true;
    btnCancel.addEventListener("click", ()=> openCursoDrawer(id,"view"));
  }

  const btnSave = qs("#btn-save");
  if(btnSave && !btnSave._gc_bound){
    btnSave._gc_bound=true;
    btnSave.addEventListener("click", ()=> saveCurso(id));
  }

  const btnDelete = qs("#btn-delete");
  if(btnDelete && !btnDelete._gc_bound){
    btnDelete._gc_bound=true;
    btnDelete.addEventListener("click", async ()=>{
      const step = Number(btnDelete.getAttribute("data-step")||"1");
      if(step===1){
        btnDelete.setAttribute("data-step","2");
        btnDelete.textContent = "Confirmar eliminar";
        setTimeout(()=>{ try{ btnDelete.setAttribute("data-step","1"); btnDelete.textContent="Eliminar"; }catch{} }, 3500);
      }else{
        try{
          const it = state.data.find(x=>Number(x.id)===Number(id));
          if(!it) return;
          await postJSON(API.uCursos, { ...it, estatus:0 });
          toast("Curso eliminado","exito");
          closeDrawer();
          await loadCursos();
        }catch(e){ gcLog(e); toast("No se pudo eliminar","error"); }
      }
    });
  }

  // Copiar JSON
  const btnCopy = qs("#btn-copy-json-curso");
  if(btnCopy && !btnCopy._gc_bound){
    btnCopy._gc_bound=true;
    btnCopy.addEventListener("click", ()=>{
      const pre = qs("#json-curso"); const tx = pre?.textContent||"";
      navigator.clipboard?.writeText(tx).then(()=> toast("JSON copiado","exito")).catch(()=> toast("No se pudo copiar","error"));
    });
  }
}

async function saveCurso(id){
  try{
    const it = state.data.find(x=>Number(x.id)===Number(id));
    if(!it) throw new Error("No encontrado");

    const getVal = (id)=>{ const el=qs("#"+id); if(!el) return ""; if(el.type==="checkbox") return el.checked?1:0; return el.value||""; };

    const payload = {
      id: it.id,
      nombre: getVal("f_nombre"),
      descripcion_breve: getVal("f_desc_breve"),
      descripcion_curso: getVal("f_desc_curso"),
      descripcion_media: getVal("f_desc_media"),
      dirigido: getVal("f_dirigido"),
      competencias: getVal("f_competencias"),
      certificado: getVal("f_certificado"),
      tutor: Number(getVal("f_tutor")||0),
      horas: Number(getVal("f_horas")||0),
      precio: Number(getVal("f_precio")||0),
      estatus: Number(getVal("f_estatus")||1),
      fecha_inicio: getVal("f_fecha"),
      prioridad: Number(getVal("f_prioridad")||0),
      categoria: Number(getVal("f_categoria")||0),
      calendario: Number(getVal("f_calendario")||0),
      tipo_evaluacion: Number(getVal("f_tipo_eval")||0),
      actividades: Number(getVal("f_actividades")||0)
    };

    // Validaciones simples requeridas
    const req = [
      ["f_nombre","Nombre"],
      ["f_desc_breve","Descripción breve"],
      ["f_desc_curso","Descripción larga"],
      ["f_dirigido","Dirigido a"],
      ["f_competencias","Competencias"],
      ["f_tutor","Tutor"],
      ["f_horas","Horas"],
      ["f_fecha","Fecha inicio"],
      ["f_prioridad","Prioridad"],
      ["f_categoria","Categoría"],
      ["f_calendario","Calendario"],
      ["f_tipo_eval","Tipo de evaluación"],
      ["f_actividades","Actividades"]
    ];
    for(const [id, label] of req){
      const v = qs("#"+id)?.value ?? "";
      if(String(v).trim()===""){ toast("Falta: "+label,"error"); return; }
    }

    await postJSON(API.uCursos, payload);
    toast("Curso actualizado","exito");
    await loadCursos();
    await openCursoDrawer(it.id,"view");
  }catch(e){ gcLog(e); toast("No se pudo guardar","error"); }
}

/* ====================== Arranque (solo ruta cursos) ====================== */
function bindSearch(){
  const s = qs("#search-input");
  if(s && !s._gc_bound){
    s._gc_bound=true;
    s.addEventListener("input", ()=>{
      state.search = s.value||"";
      state.page = 1;
      drawCursos();
    });
  }
}
function bindAdd(){
  const add = qs("#btn-add");
  if(add && !add._gc_bound){
    add._gc_bound=true;
    add.addEventListener("click", ()=>{
      toast("Crear curso: pronto","exito");
      // Podrías clonar getEmptyCourse(), insertar en edición, etc.
    });
  }
}

document.addEventListener("DOMContentLoaded", async ()=>{
  bindSearch();
  bindAdd();
  await loadCursos();
});

})();
