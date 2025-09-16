(()=>{"use strict";
/* ========= Config opcional ========= */
const API_UPLOAD_CURSOS = window.GC_API_UPLOAD_CURSOS || "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/u_cursoImg.php";
const SHOW_TOAST = (m,t="info")=> (window.gcToast?window.gcToast(m,t):alert(m));
const byId = id => document.getElementById(id);
const qs = (s,r=document)=>r.querySelector(s);
const qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const bust=u=>{try{const x=new URL(u,location.origin);x.searchParams.set("v",Date.now());return x.pathname+"?"+x.searchParams.toString()}catch{return u+(u.includes("?")?"&":"?")+"v="+Date.now()}};
const fmtMoney=n=>{try{return new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(+n||0)}catch{return "$"+(+n||0)}};
/* ========= Estado local ========= */
const elDrawer = byId("drawer-curso");
const elOverlay = byId("gc-dash-overlay");
if(!elDrawer) return;

const UI = {
  title: byId("drawer-curso-title"),
  close: byId("drawer-curso-close"),
  view: byId("curso-view"),
  edit: byId("curso-edit"),
  actionsView: byId("curso-actions-view"),
  btnEdit: byId("btn-edit"),
  btnDelete: byId("btn-delete"),
  btnSave: byId("btn-save"),
  btnCancel: byId("btn-cancel"),
  media: byId("media-curso"),
  jsonBox: byId("curso-json-box"),
  jsonPre: byId("json-curso"),
  copyJson: byId("btn-copy-json-curso"),
};

const state = {
  mode: "view",
  curso: null,         // objeto curso plano (backend)
  maps: window.GC_MAPS || null, // opcional: {tutores: {id:nombre}, ...}
};

/* ========= Helpers DOM ========= */
function show(el){ if(el){ el.hidden=false; el.setAttribute("aria-hidden","false"); } }
function hide(el){ if(el){ el.hidden=true; el.setAttribute("aria-hidden","true"); } }
function togg(el, on){ if(!el) return; on?show(el):hide(el); }
function text(el, val){ if(el!=null) el.innerHTML = (val==null||val==="")?"—":String(val); }
function valOrDash(v){ return (v==null||v==="")?"—":String(v); }
function opt(v,l){ return `<option value="${String(v)}">${String(l)}</option>` }
function getMapName(map, id){ if(!map) return id; const k=String(id); return map[k] ?? id; }

/* ========= Imágenes ========= */
function validarImagen(file, maxMB=2){
  if(!file) return {ok:false, error:"No se seleccionó archivo"};
  const allowed=["image/jpeg","image/png"];
  if(!allowed.includes(file.type)) return {ok:false, error:"Formato no permitido. Usa JPG o PNG"};
  const sizeMB = file.size/1024/1024;
  if(sizeMB>maxMB) return {ok:false, error:`La imagen excede ${maxMB}MB`};
  return {ok:true};
}
function noImageSvg(){
  return "data:image/svg+xml;utf8,"+encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#f3f3f3'/>"+
    "<path d='M20 70 L60 35 L95 65 L120 50 L140 70' stroke='#c9c9c9' stroke-width='4' fill='none'/>"+
    "<circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>"
  );
}
function courseImgUrl(id){ return `/ASSETS/cursos/img${Number(id||0)}.png`; }

function mountMediaCourse(container, cursoId, editable){
  if(!container) return;
  const url = courseImgUrl(cursoId);
  container.innerHTML = `
    <div class="media-head">
      <div class="media-title">Imágenes</div>
      <div class="media-help" style="color:${editable?"#666":"#888"};">${editable?"Formatos: JPG/PNG · Máx 2MB":"Solo lectura"}</div>
    </div>
    <div class="media-grid">
      <div class="media-card">
        <figure class="media-thumb">
          <img alt="Portada" id="curso-thumb" src="${bust(url)}">
          ${editable?`<button class="icon-btn media-edit" id="btn-img-edit" title="Editar imagen" aria-label="Editar imagen">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.0 1.0 0 0 0 0-1.41l-2.34-2.34a1.0 1.0 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"></path></svg>
          </button>`:""}
        </figure>
        <div class="media-meta"><div class="media-label">Portada</div></div>
      </div>
    </div>
  `;
  const img = byId("curso-thumb");
  if(img){
    img.onerror = ()=>{ img.onerror=null; img.src=noImageSvg(); };
  }
  if(editable){
    const btn = byId("btn-img-edit");
    if(btn && !btn._bound){
      btn._bound=true;
      btn.addEventListener("click", async (e)=>{
        e.preventDefault();
        const input = document.createElement("input");
        input.type="file"; input.accept="image/png,image/jpeg"; input.style.display="none";
        document.body.appendChild(input);
        input.addEventListener("change", async ()=>{
          const file = input.files && input.files[0];
          try{ document.body.removeChild(input);}catch{}
          if(!file) return;
          const v = validarImagen(file, 2);
          if(!v.ok) return SHOW_TOAST(v.error,"error");

          // Confirmación simple (si quieres, aquí podríamos abrir un modal preview)
          if(!confirm("¿Subir esta portada para el curso?")) return;

          try{
            const fd = new FormData();
            fd.append("curso_id", String(cursoId));
            fd.append("imagen", file);
            const res = await fetch(API_UPLOAD_CURSOS, { method:"POST", body:fd });
            const text = await res.text().catch(()=> "");
            if(!res.ok) throw new Error(`HTTP ${res.status} ${text||""}`);
            let json; try{ json=JSON.parse(text);}catch{ json={_raw:text}; }
            img.src = bust((json && json.url) || url);
            SHOW_TOAST("Imagen actualizada","exito");
          }catch(err){
            console.error(err);
            SHOW_TOAST("No se pudo subir la imagen","error");
          }
        });
        input.click();
      });
    }
  }
}

/* ========= Pintar VISTA ========= */
function renderView(c){
  // título
  if(UI.title) UI.title.textContent = `Curso · ${valOrDash(c.nombre)}`;

  // campos (lectura)
  text(byId("v_nombre"), c.nombre);
  text(byId("v_desc_breve"), c.descripcion_breve);
  text(byId("v_desc_media"), c.descripcion_media);
  text(byId("v_desc_curso"), c.descripcion_curso);
  text(byId("v_dirigido"), c.dirigido);
  text(byId("v_competencias"), c.competencias);

  const maps = state.maps || {};
  text(byId("v_tutor"), getMapName(maps.tutores, c.tutor));
  text(byId("v_categoria"), getMapName(maps.categorias, c.categoria));
  text(byId("v_prioridad"), getMapName(maps.prioridad, c.prioridad));
  text(byId("v_tipo_eval"), getMapName(maps.tipo_evaluacion, c.tipo_evaluacion));
  text(byId("v_actividades"), getMapName(maps.actividades, c.actividades));
  text(byId("v_calendario"), getMapName(maps.calendario, c.calendario));

  text(byId("v_horas"), c.horas!=null?String(c.horas):"—");
  text(byId("v_precio"), c.precio!=null?fmtMoney(c.precio):"—");
  text(byId("v_certificado"), c.certificado? "Sí":"No");
  text(byId("v_fecha"), c.fecha_inicio || "—");
  text(byId("v_estatus"), c.estatus!=null?String(c.estatus):"—");

  // imágenes
  mountMediaCourse(UI.media, c.id, state.mode==="edit");
  // JSON dev
  if(UI.jsonPre){
    try{ UI.jsonPre.textContent = JSON.stringify(c, null, 2); }catch{}
  }
}

/* ========= Pintar FORM ========= */
function renderEdit(c){
  setVal("f_nombre", c.nombre);
  setVal("f_desc_breve", c.descripcion_breve);
  setVal("f_desc_curso", c.descripcion_curso);
  setVal("f_desc_media", c.descripcion_media);
  setVal("f_dirigido", c.dirigido);
  setVal("f_competencias", c.competencias);
  const chk = byId("f_certificado");
  if(chk) chk.checked = !!c.certificado;

  setVal("f_horas", c.horas);
  setVal("f_precio", c.precio);
  setVal("f_fecha", c.fecha_inicio);

  // selects (si hay mapas, pintarlos; si no, dejar como texto/única opción)
  fillSelect("f_tutor", state.maps?.tutores, c.tutor);
  fillSelect("f_prioridad", state.maps?.prioridad, c.prioridad);
  fillSelect("f_categoria", state.maps?.categorias, c.categoria);
  fillSelect("f_calendario", state.maps?.calendario, c.calendario);
  fillSelect("f_tipo_eval", state.maps?.tipo_evaluacion, c.tipo_evaluacion);
  fillSelect("f_actividades", state.maps?.actividades, c.actividades);
  // estatus – dejamos opciones comunes 1/0/2/3 si no hay mapa específico
  fillSelect("f_estatus", state.maps?.estatusCursos || {"1":"Activo","2":"Pausado","4":"En curso","3":"Terminado","0":"Inactivo","5":"Cancelado"}, c.estatus);
}
function setVal(id, v){ const el=byId(id); if(!el) return; el.value = v==null? "": v; }
function fillSelect(id, map, value){
  const el = byId(id);
  if(!el) return;
  if(map && typeof map==="object"){
    el.innerHTML = Object.entries(map).map(([k,lab])=>opt(k,lab)).join("");
  }else{
    // fallback: deja la opción actual o crea una
    if(!el.innerHTML.trim()) el.innerHTML = opt(value??"", value??"—");
  }
  el.value = value!=null? String(value) : "";
}
function readForm(){
  const get=(id)=>{const x=byId(id); return x? x.value : "";};
  return {
    id: state.curso?.id ?? null,
    nombre: get("f_nombre"),
    descripcion_breve: get("f_desc_breve"),
    descripcion_curso: get("f_desc_curso"),
    descripcion_media: get("f_desc_media"),
    dirigido: get("f_dirigido"),
    competencias: get("f_competencias"),
    certificado: !!(byId("f_certificado")?.checked),
    tutor: numOrNull(get("f_tutor")),
    horas: numOrNull(get("f_horas")),
    precio: numOrNull(get("f_precio")),
    fecha_inicio: get("f_fecha") || null,
    prioridad: numOrNull(get("f_prioridad")),
    categoria: numOrNull(get("f_categoria")),
    calendario: numOrNull(get("f_calendario")),
    tipo_evaluacion: numOrNull(get("f_tipo_eval")),
    actividades: numOrNull(get("f_actividades")),
    estatus: numOrNull(get("f_estatus")),
  };
}
function numOrNull(v){ const n=Number(v); return Number.isFinite(n)? n : null; }

/* ========= Modo & flujo ========= */
function setMode(mode){
  state.mode = (mode==="edit") ? "edit" : "view";
  const isEdit = state.mode==="edit";
  togg(UI.view, !isEdit);
  togg(UI.actionsView, !isEdit);
  togg(UI.edit, isEdit);
  togg(UI.btnSave, isEdit);
  togg(UI.btnCancel, isEdit);
  if(UI.btnEdit) UI.btnEdit.style.display = isEdit? "none":"";
  // remonta imágenes con/ sin lápiz
  if(state.curso) mountMediaCourse(UI.media, state.curso.id, isEdit);
}
function setCurso(curso, maps){
  state.curso = {...curso};
  if(maps) state.maps = maps;
  renderView(state.curso);
  renderEdit(state.curso);
}

/* ========= Open / Close ========= */
function openDrawer(){
  if(elOverlay) elOverlay.classList.add("open");
  elDrawer.classList.add("open");
  elDrawer.hidden=false; elDrawer.setAttribute("aria-hidden","false");
}
function closeDrawer(){
  if(elOverlay) elOverlay.classList.remove("open");
  elDrawer.classList.remove("open");
  elDrawer.hidden=true; elDrawer.setAttribute("aria-hidden","true");
}

/* ========= Bind ========= */
function bind(){
  if(UI.close && !UI.close._b){ UI.close._b=true; UI.close.addEventListener("click", closeDrawer); }
  if(UI.btnEdit && !UI.btnEdit._b){ UI.btnEdit._b=true; UI.btnEdit.addEventListener("click", ()=>setMode("edit")); }
  if(UI.btnCancel && !UI.btnCancel._b){ UI.btnCancel._b=true; UI.btnCancel.addEventListener("click", ()=>{ setMode("view"); renderView(state.curso||{}); }); }
  if(UI.btnSave && !UI.btnSave._b){
    UI.btnSave._b=true;
    UI.btnSave.addEventListener("click", async ()=>{
      const payload = readForm();
      // Hook para que tu capa de datos guarde
      if(typeof window.onCursoSave === "function"){
        try{
          await window.onCursoSave(payload, state.curso);
          state.curso = {...state.curso, ...payload};
          SHOW_TOAST("Curso guardado","exito");
          setMode("view"); renderView(state.curso);
        }catch(e){
          console.error(e); SHOW_TOAST("No se pudo guardar","error");
        }
      }else{
        // Por defecto: solo refleja y vuelve a vista
        state.curso = {...state.curso, ...payload};
        SHOW_TOAST("Guardado (mock)","exito");
        setMode("view"); renderView(state.curso);
      }
    });
  }
  if(UI.copyJson && !UI.copyJson._b){
    UI.copyJson._b=true;
    UI.copyJson.addEventListener("click", async ()=>{
      const txt = UI.jsonPre?.textContent || "";
      try{ await navigator.clipboard.writeText(txt); SHOW_TOAST("JSON copiado","exito"); }catch{ SHOW_TOAST("No se pudo copiar","error"); }
    });
  }
}

/* ========= Bootstrap ========= */
document.addEventListener("DOMContentLoaded", ()=>{
  bind();
  // Si el drawer ya está visible, asegúrate de montar imágenes acorde a view
  if(elDrawer.classList.contains("open")) setMode("view");

  // Si hay JSON en #json-curso con un curso real, úsalo para pintar:
  try{
    const raw = UI.jsonPre?.textContent?.trim();
    if(raw && raw.startsWith("{")){
      const c = JSON.parse(raw);
      if(c && (c.id!=null)){ setCurso(c); }
    }
  }catch{}
});

/* ========= API pública para tu lista ========= */
window.GC_CursoDrawer = {
  open: (curso, maps)=>{ setCurso(curso||{}, maps); setMode("view"); openDrawer(); },
  close: closeDrawer,
  setMode,
  setData: setCurso,
  getData: ()=>({...state.curso}),
};
})();
