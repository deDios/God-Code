(() => {
"use strict";

/* ====== Config/API ====== */
const API_BASE = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
const API = {
  cursos: API_BASE + "c_cursos.php",
  iCursos: API_BASE + "i_cursos.php",
  uCursos: API_BASE + "u_cursos.php",
  tutores: API_BASE + "c_tutor.php",
  prioridad: API_BASE + "c_prioridad.php",
  categorias: API_BASE + "c_categorias.php",
  calendario: API_BASE + "c_dias_curso.php",
  tipoEval: API_BASE + "c_tipo_evaluacion.php",
  actividades: API_BASE + "c_actividades.php",
};
const API_UPLOAD = { cursoImg: API_BASE + "u_cursoImg.php" };

/* ====== Estado local esto solo afecta a cursos ====== */
const S = {
  page: 1, pageSize: 7, search: "",
  data: [],        // cursos en orden
  current: null,   // curso seleccionado (obj completo _all + id)
  maps: {          // catálogos
    tutores: null, prioridad: null, categorias: null,
    calendario: null, tipoEval: null, actividades: null
  }
};

/* ====== Utils DOM/format ====== */
const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[].slice.call(r.querySelectorAll(s));
const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c]));
const fmtMoney = n => isFinite(+n) ? new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(+n) : "-";
const fmtBool = v => (+v===1 || v===true || v==="1") ? "Sí" : "No";
const fmtDate = d => !d ? "-" : String(d);
const mapToOptions = (map, sel) => {
  const ids = Object.keys(map||{}).filter(k=>k!=="_ts");
  return ids.map(id=>`<option value="${esc(id)}"${+id===+sel?" selected":""}>${esc(map[id])}</option>`).join("");
};
const mapLabel = (map, id) => (map && map[id]) || "-";

/* ====== Etiquetas de estatus y orden ====== */
const STATUS_LABEL = { 1:"Activo", 0:"Inactivo", 2:"Pausado", 3:"Terminado", 4:"En curso", 5:"Cancelado" };
const ORDER_CURSOS = [
    1, // activo
    0, // inactivo
    2, // pausado
    3, // terminado
    4, // en curso
    5  // cancelado
];

/* ====== HTTP ====== */
async function postJSON(url, body) {
  const r = await fetch(url,{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body||{})});
  const t = await r.text().catch(()=> "");
  if(!r.ok) throw new Error("HTTP "+r.status+" "+t);
  if(!t.trim()) return {};
  try{ return JSON.parse(t) } catch { return { _raw:t } }
}

/* ====== Imagen de curso  ====== */
function cursoImgUrl(id, ext="png"){ return `/ASSETS/cursos/img${Number(id)}.${ext}`; }

function withBust(u){ try{ const url=new URL(u, location.origin); url.searchParams.set("v", Date.now()); return url.pathname+"?"+url.searchParams.toString(); }catch{ return u+(u.includes("?")?"&":"?")+"v="+Date.now(); } }
function noImageSvg(){ return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M20 70 L60 35 L95 65 L120 50 L140 70' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>"; }
function imgExists(url){ return new Promise(res=>{ try{ const i=new Image(); i.onload=()=>res(true); i.onerror=()=>res(false); i.src=withBust(url); }catch{ res(false); } }); }

async function resolveCursoImg(id){
  const png = cursoImgUrl(id, "png");
  if (await imgExists(png)) return withBust(png);
  const jpg = cursoImgUrl(id, "jpg");
  if (await imgExists(jpg)) return withBust(jpg);
  return "data:image/svg+xml;utf8,"+encodeURIComponent(noImageSvg());
}

async function setCursoImage(imgEl, id){
  if(!imgEl) return;
  const url = await resolveCursoImg(id);
  imgEl.src = url;
  imgEl.onerror = async () => { imgEl.onerror = null; imgEl.src = "data:image/svg+xml;utf8,"+encodeURIComponent(noImageSvg()); };
}

/* ====== Overlay + Drawer helpers (comparten vista/edición) ====== */
function openDrawerCurso(){ const d=qs("#drawer-curso"); const ov=qs("#gc-dash-overlay"); if(!d) return;
  d.classList.add("open"); d.removeAttribute("hidden"); d.setAttribute("aria-hidden","false");
  ov && ov.classList.add("open");
}
function closeDrawerCurso(){ const d=qs("#drawer-curso"); const ov=qs("#gc-dash-overlay"); if(!d) return;
  d.classList.remove("open"); d.setAttribute("hidden",""); d.setAttribute("aria-hidden","true");
  ov && ov.classList.remove("open");
  S.current = null;
}
qsa("#drawer-curso-close").forEach(b=>b.addEventListener("click", closeDrawerCurso));
qsa("#gc-dash-overlay").forEach(ov=>ov.addEventListener("click", closeDrawerCurso));
document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ closeDrawerCurso(); }});

window.__CursosState = S;

/* ==================== BLOQUE 1: Carga + lista ==================== */

// Carga catálogos (una sola vez con caching básico)
async function loadCatalogos(){
  if(!S.maps.tutores)    S.maps.tutores    = arrToMap(await postJSON(API.tutores,   {estatus:1}));
  if(!S.maps.prioridad)  S.maps.prioridad  = arrToMap(await postJSON(API.prioridad, {estatus:1}));
  if(!S.maps.categorias) S.maps.categorias = arrToMap(await postJSON(API.categorias,{estatus:1}));
  if(!S.maps.calendario) S.maps.calendario = arrToMap(await postJSON(API.calendario,{estatus:1}));
  if(!S.maps.tipoEval)   S.maps.tipoEval   = arrToMap(await postJSON(API.tipoEval,  {estatus:1}));
  if(!S.maps.actividades)S.maps.actividades= arrToMap(await postJSON(API.actividades,{estatus:1}));
}
function arrToMap(arr){
  const m={}; (Array.isArray(arr)?arr:[]).forEach(x=>{ m[x.id]= x.nombre || x.titulo || ("#"+x.id); });
  m._ts = Date.now(); return m;
}

// Descarga por estatus y concatena en el orden definido
async function loadCursos(){
  const chunks = await Promise.all(ORDER_CURSOS.map(st => postJSON(API.cursos,{estatus:st}).catch(()=>[])));
  const flat = [];
  ORDER_CURSOS.forEach((st,i)=> { flat.push(...(Array.isArray(chunks[i])?chunks[i]:[]) ); });
  S.data = flat;
  S.page = 1;
  renderCursos();
}

// Render general (aplica búsqueda y paginación)
function renderCursos(){
  const d=qs("#recursos-list"), m=qs("#recursos-list-mobile");
  if(d) d.innerHTML=""; if(m) m.innerHTML="";

  const term = normalize(S.search);
  const filtered = term ? S.data.filter(row => normalize(JSON.stringify(row)).includes(term)) : S.data;

  // meta
  const modCount=qs("#mod-count");
  if(modCount) modCount.textContent = `${filtered.length} ${filtered.length===1?"elemento":"elementos"}`;

  const totalPages = Math.max(1, Math.ceil(filtered.length / S.pageSize));
  if(S.page>totalPages) S.page=totalPages;
  const start=(S.page-1)*S.pageSize, pageRows=filtered.slice(start,start+S.pageSize);

  // desktop
  if(d){
    pageRows.forEach(it=>{
      const est = STATUS_LABEL[it.estatus] || it.estatus;
      d.insertAdjacentHTML("beforeend",
    `<div class="table-row" role="row" data-id="${it.id}">
     <div class="col-nombre" role="cell">${esc(it.nombre||"-")}</div>
     <div class="col-tutor" role="cell">${esc(mapLabel(S.maps.tutores, it.tutor))}</div>
     <div class="col-fecha" role="cell">${esc(fmtDate(it.fecha_inicio))}</div>
     <div class="col-status" role="cell">${esc(est)}</div>
    </div>`);
    });
    qsa(".table-row", d).forEach(row=>{
      row.addEventListener("click",()=> openCursoView(Number(row.dataset.id)));
    });
  }
  // mobile simple
  if(m){
    pageRows.forEach(it=>{
      m.insertAdjacentHTML("beforeend",
        `<div class="table-row-mobile" data-id="${it.id}">
           <div class="row-head">
             <div class="title">${esc(it.nombre||"-")}</div>
             <button class="open-drawer gc-btn">Ver</button>
           </div>
         </div>`);
    });
    qsa(".open-drawer", m).forEach(btn=>{
      btn.addEventListener("click", (e)=>{
        e.stopPropagation();
        const host = btn.closest(".table-row-mobile");
        if(host) openCursoView(Number(host.dataset.id));
      });
    });
  }

  renderPagination(filtered.length);
}

function renderPagination(total){
  const totalPages = Math.max(1, Math.ceil(total / S.pageSize));
  [qs("#pagination-controls"), qs("#pagination-mobile")].forEach(cont=>{
    if(!cont) return;
    cont.innerHTML = "";
    if(totalPages<=1) return;

    const mkBtn=(txt,dis,cb,cls="")=>{
      const b=document.createElement("button");
      b.textContent=txt; b.className = (cls||"page-btn") + (dis?" disabled":"");
      if(dis) b.disabled=true; else b.onclick=cb;
      return b;
    };

    cont.appendChild(mkBtn("‹", S.page===1, ()=>{ S.page=Math.max(1,S.page-1); renderCursos(); }, "arrow-btn"));

    for(let p=1; p<=totalPages && p<=7; p++){
      const b=mkBtn(String(p),false,()=>{ S.page=p; renderCursos(); });
      if(p===S.page) b.classList.add("active");
      cont.appendChild(b);
    }

    cont.appendChild(mkBtn("›", S.page===totalPages, ()=>{ S.page=Math.min(totalPages,S.page+1); renderCursos(); }, "arrow-btn"));
  });
}

// búsqueda
function normalize(s){ return String(s||"").normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().trim(); }
const searchInput=qs("#search-input");
if(searchInput){
  searchInput.addEventListener("input", e=>{ S.search = e.target.value||""; S.page=1; renderCursos(); });
}

// botón “crear”
const btnAdd=qs("#btn-add");
if(btnAdd){
  btnAdd.addEventListener("click", ()=>{
    // Creamos curso vacío y abrimos en edición
    const blank = {
      id:null, nombre:"", descripcion_breve:"", descripcion_curso:"", descripcion_media:"",
      dirigido:"", competencias:"", tutor:"", horas:"", precio:"", estatus:1, fecha_inicio:"",
      prioridad:"", categoria:"", calendario:"", tipo_evaluacion:"", actividades:"", certificado:0
    };
    S.current = { id:null, _all: blank };
    openDrawerCurso();
    setDrawerMode("edit");
    fillCursoEdit(blank);
  });
}

// kick inicial
loadCatalogos().then(loadCursos).catch(console.error);

/* ==================== BLOQUE 2: Drawer de Vista ==================== */

function setDrawerMode(mode){
  const v = qs("#curso-view");
  const e = qs("#curso-edit");
  const act = qs("#curso-actions-view");
  if(mode==="view"){
    v && (v.hidden=false);
    e && (e.hidden=true);
    act && (act.style.display="");
  }else{
    v && (v.hidden=true);
    e && (e.hidden=false);
    act && (act.style.display="none");
  }
}

async function openCursoView(id){
  const item = S.data.find(x => +x.id === +id);
  if(!item) return;
  S.current = { id:item.id, _all: item };
  await loadCatalogos();
  openDrawerCurso();
  setDrawerMode("view");
  fillCursoView(item);
}

function fillCursoView(it){
  // título
  const t=qs("#drawer-curso-title"); if(t) t.textContent = "Curso · " + (it.nombre||"—");

  // campos
  put("#v_nombre", it.nombre);
  put("#v_desc_breve", it.descripcion_breve);
  put("#v_desc_media", it.descripcion_media);
  put("#v_desc_curso", it.descripcion_curso);
  put("#v_dirigido", it.dirigido);
  put("#v_competencias", it.competencias);
  put("#v_tutor", mapLabel(S.maps.tutores, it.tutor));
  put("#v_categoria", mapLabel(S.maps.categorias, it.categoria));
  put("#v_prioridad", mapLabel(S.maps.prioridad, it.prioridad));
  put("#v_tipo_eval", mapLabel(S.maps.tipoEval, it.tipo_evaluacion));
  put("#v_actividades", mapLabel(S.maps.actividades, it.actividades));
  put("#v_calendario", mapLabel(S.maps.calendario, it.calendario));
  put("#v_horas", it.horas);
  put("#v_precio", it.precio ? fmtMoney(it.precio) : "-");
  put("#v_certificado", fmtBool(it.certificado));
  put("#v_fecha", fmtDate(it.fecha_inicio));
  put("#v_estatus", STATUS_LABEL[it.estatus] || it.estatus);

async function mountCursoMedia(container, id, { editable=false } = {}){
  if(!container) return;
  container.innerHTML =
    `<div class="media-head">
       <div class="media-title">Imágenes</div>
       <div class="media-help" style="color:${editable?'#666':'#888'};">${editable?'Formatos: JPG/PNG · Máx 2MB':'Solo lectura'}</div>
     </div>
     <div class="media-grid">
       <div class="media-card">
         <figure class="media-thumb">
           <img id="curso-cover" alt="Portada">
           ${editable ? '<button class="icon-btn media-edit" title="Editar imagen" type="button">✎</button>' : ''}
         </figure>
         <div class="media-meta"><div class="media-label">Portada</div></div>
       </div>
     </div>`;

  // Cargar imagen con fallback (png→jpg→placeholder)
  const img = container.querySelector("#curso-cover");
  await setCursoImage(img, id);

  if (editable){
    const btn = container.querySelector(".media-edit");
    if (btn && !btn._gc_bound){
      btn._gc_bound = true;
      btn.addEventListener("click", async (e)=>{
        e.preventDefault();
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/png,image/jpeg";
        input.style.display = "none";
        document.body.appendChild(input);
        input.onchange = async ()=>{
          const file = input.files && input.files[0];
          try{ document.body.removeChild(input); }catch{}
          if(!file) return;

          // validación ligera
          if(!/image\/(png|jpe?g)/i.test(file.type)) { gcToast?.("Formato no permitido","error"); return; }
          if(file.size > 2*1024*1024){ gcToast?.("La imagen excede 2MB","error"); return; }

          // Vista previa simple 
          const url = URL.createObjectURL(file);
          img.src = url;

          // Subir al backend
          try{
            const fd = new FormData();
            fd.append("curso_id", String(id));
            fd.append("imagen", file);
            const r = await fetch(API_UPLOAD.cursoImg, { method:"POST", body:fd });
            const t = await r.text();
            if(!r.ok) throw new Error("HTTP "+r.status+" "+(t||""));
            let j; try{ j = JSON.parse(t); }catch{ j = {}; }
            // Si el backend devuelve la url, úsala; si no, refuerza fallback local
            if (j && j.url){
              img.src = withBust(j.url);
            } else {
              await setCursoImage(img, id);
            }
            gcToast?.("Imagen de curso actualizada","exito");
          }catch(err){
            console.error(err);
            gcToast?.("No se pudo subir la imagen","error");
            // regresar a la mejor disponible
            await setCursoImage(img, id);
          }finally{
            try{ URL.revokeObjectURL(url); }catch{}
          }
        };
        input.click();
      });
    }
  }
}


  // JSON dev
  const pre=qs("#json-curso"); if(pre) pre.textContent = JSON.stringify(it, null, 2);

  // botones acciones vista
  const bEdit=qs("#btn-edit"), bDel=qs("#btn-delete");
  if(bEdit && !bEdit._bound){
    bEdit._bound=true;
    bEdit.addEventListener("click",()=>{
      setDrawerMode("edit");
      fillCursoEdit(S.current? S.current._all : it);
    });
  }
  if(bDel && !bDel._bound){
    bDel._bound=true;
    bDel.addEventListener("click",()=>{
      // Paso doble opcional; por ahora solo feedback visual
      const step = bDel.getAttribute("data-step")==="2" ? "1" : "2";
      bDel.setAttribute("data-step", step);
      // aquí implementarías cancelación/confirm real si procede
    });
  }
}
function put(sel, val){ const el=qs(sel); if(el) el.innerHTML = esc(val ?? "—"); }

/* ==================== BLOQUE 3: Drawer de Edicion ==================== */

function fillCursoEdit(c){
  // inputs
  setVal("f_nombre", c.nombre);
  setVal("f_desc_breve", c.descripcion_breve);
  setVal("f_desc_media", c.descripcion_media);
  setVal("f_desc_curso", c.descripcion_curso);
  setVal("f_dirigido", c.dirigido);
  setVal("f_competencias", c.competencias);
  setVal("f_horas", c.horas);
  setVal("f_precio", c.precio);
  setVal("f_fecha", c.fecha_inicio);
  setChecked("f_certificado", c.certificado);

  // selects
  putSelect("f_tutor",      S.maps.tutores,    c.tutor);
  putSelect("f_prioridad",  S.maps.prioridad,  c.prioridad);
  putSelect("f_categoria",  S.maps.categorias, c.categoria);
  putSelect("f_calendario", S.maps.calendario, c.calendario);
  putSelect("f_tipo_eval",  S.maps.tipoEval,   c.tipo_evaluacion);
  putSelect("f_actividades",S.maps.actividades,c.actividades);
  putStatus("f_estatus", c.estatus);

  // imagenes con lapiz (editable)
  //mountCursoMedia("media-curso-edit", S.current?.id, { editable:true }); ya no es necesario aqui

  // botones guardar/cancelar
  const bSave=qs("#btn-save"), bCancel=qs("#btn-cancel");
  if(bSave && !bSave._bound){
    bSave._bound=true;
    bSave.addEventListener("click", saveCurso);
  }
  if(bCancel && !bCancel._bound){
    bCancel._bound=true;
    bCancel.addEventListener("click",()=>{
      setDrawerMode("view");
      fillCursoView(S.current? S.current._all : {});
    });
  }
}

function setVal(id,v){ const el=qs("#"+id); if(el) el.value = v==null?"":v; }
function setChecked(id,v){ const el=qs("#"+id); if(el) el.checked = !!(+v===1 || v===true || v==="1"); }
function putSelect(id, map, sel){
  const el=qs("#"+id); if(!el) return;
  el.innerHTML = mapToOptions(map, sel);
}
function putStatus(id, val){
  const el=qs("#"+id); if(!el) return;
  const opts = [{v:1,l:"Activo"},{v:0,l:"Inactivo"},{v:2,l:"Pausado"},{v:3,l:"Terminado"},{v:4,l:"En curso"},{v:5,l:"Cancelado"}];
  el.innerHTML = opts.map(o=>`<option value="${o.v}"${+o.v===+val?" selected":""}>${o.l}</option>`).join("");
}

async function saveCurso(){
  // recolecta
  const body = {
    id: S.current?.id ?? null,
    nombre: val("f_nombre"),
    descripcion_breve: val("f_desc_breve"),
    descripcion_media: val("f_desc_media"),
    descripcion_curso: val("f_desc_curso"),
    dirigido: val("f_dirigido"),
    competencias: val("f_competencias"),
    tutor: num("f_tutor"),
    horas: num("f_horas"),
    precio: Number(val("f_precio")||0),
    estatus: num("f_estatus"),
    fecha_inicio: val("f_fecha"),
    prioridad: num("f_prioridad"),
    categoria: num("f_categoria"),
    calendario: num("f_calendario"),
    tipo_evaluacion: num("f_tipo_eval"),
    actividades: num("f_actividades"),
    certificado: qs("#f_certificado")?.checked ? 1 : 0
  };
  // validaciones mínimas
  if(!body.nombre || !body.descripcion_breve || !body.descripcion_curso || !body.dirigido || !body.competencias){
    toast("Completa los campos obligatorios","error"); return;
  }
  try{
    if(body.id==null){
      await postJSON(API.iCursos, body);
    }else{
      await postJSON(API.uCursos, body);
    }
    toast("Curso guardado","exito");
    await loadCursos();
    // volver a ver el curso (si es nuevo, intenta localizarlo por nombre)
    let it = body.id ? S.data.find(x=>+x.id===+body.id) : S.data.find(x=>x.nombre===body.nombre);
    if(!it) it = S.data[0];
    if(it){ S.current={id:it.id,_all:it}; setDrawerMode("view"); fillCursoView(it); }
  }catch(e){
    console.error(e); toast("No se pudo guardar","error");
  }
}
function val(id){ return qs("#"+id)?.value?.trim() || ""; }
function num(id){ const v=val(id); return v? Number(v): ""; }

/* ===== Imagen: leer/editar con lápiz y preview ===== */
function mountCursoMedia(containerId, cursoId, opt){
  const cont=qs("#"+containerId); if(!cont) return;
  cont.innerHTML = "";
  const editable = !!(opt && opt.editable);

  const head = document.createElement("div");
  head.className = "media-head";
  head.innerHTML = `<div class="media-title">Imágenes</div><div class="media-help" style="color:${editable?"#666":"#888"};">${editable?"JPG/PNG · Máx 2MB":"Solo lectura"}</div>`;
  const grid = document.createElement("div"); grid.className="media-grid";
  const card = document.createElement("div"); card.className="media-card";
  const url = withBust(cursoImgUrl(cursoId||0));

  card.innerHTML = `
    <figure class="media-thumb">
      <img alt="Portada" src="${esc(url)}">
      ${editable? `<button class="icon-btn media-edit" title="Editar imagen" aria-label="Editar">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.0 1.0 0 0 0 0-1.41l-2.34-2.34a1.0 1.0 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"></path></svg>
      </button>`:""}
    </figure>
    <div class="media-meta"><div class="media-label">Portada</div></div>
  `;

  grid.appendChild(card);
  cont.appendChild(head); cont.appendChild(grid);

  // fallback de imagen
  const img=card.querySelector("img");
  img.onerror = ()=>{ img.onerror=null; img.src="data:image/svg+xml;utf8,"+encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M20 70 L60 35 L95 65 L120 50 L140 70' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>`); };

  if(!editable) return;

  // editar (subir)
  const btn = card.querySelector(".media-edit");
  if(btn && !btn._bound){
    btn._bound=true;
    btn.addEventListener("click", async (e)=>{
      e.preventDefault();
      const input = document.createElement("input");
      input.type="file"; input.accept="image/png, image/jpeg"; input.style.display="none";
      document.body.appendChild(input);
      input.addEventListener("change", async ()=>{
        const file = input.files && input.files[0];
        try{ document.body.removeChild(input);}catch{}
        if(!file) return;
        if(file.size>2*1024*1024) { toast("Máximo 2MB","error"); return; }
        if(!/image\/(png|jpeg)/.test(file.type)){ toast("Solo JPG/PNG","error"); return; }

        // Preview simple
        const prev = URL.createObjectURL(file);
        img.src = prev;

        // Subir
        try{
          const fd = new FormData();
          fd.append("curso_id", String(cursoId||""));
          fd.append("imagen", file);
          const res = await fetch(API_UPLOAD.cursoImg,{method:"POST", body:fd});
          const txt = await res.text().catch(()=> "");
          if(!res.ok) throw new Error("HTTP "+res.status+" "+txt);
          let json; try{ json=JSON.parse(txt);}catch{ json={_raw:txt}; }
          if(json && json.url){ img.src = withBust(json.url); }
          toast("Imagen actualizada","exito");
        }catch(err){
          console.error(err); toast("No se pudo subir la imagen","error");
        }finally{
          try{ URL.revokeObjectURL(prev);}catch{}
        }
      });
      input.click();
    });
  }
}

/* ===== Pequeño toast (fallback) ===== */
function toast(msg,type="info"){
  if(window.gcToast) { window.gcToast(msg,type,2500); return; }
  console.log(`[${type}]`, msg);
}

})(); // fin IIFE
