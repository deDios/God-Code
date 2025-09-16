(()=>{"use strict";

/* =============== Utils base =============== */
const qs=(s,r=document)=>r.querySelector(s),qsa=(s,r=document)=>Array.prototype.slice.call(r.querySelectorAll(s));
const gcLog=(...a)=>{ /* toggle si quieres debug */ /* console.log("[GC]",...a); */ };
const toast=(m,t="exito",d=2400)=>window.gcToast?window.gcToast(m,t,d):console.log(`[${t}] ${m}`);
const escapeAttr=s=>String(s??"").replace(/"/g,"&quot;");
const escapeHTML=s=>String(s??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
const withBust=url=>{try{const u=new URL(url,location.origin);u.searchParams.set("v",Date.now());return u.pathname+"?"+u.searchParams.toString()}catch{return url+(url.includes("?")?"&":"?")+"v="+Date.now()}};
const humanSize=b=>b<1024?b+" B":b<1048576?(b/1024).toFixed(1)+" KB":(b/1048576).toFixed(2)+" MB";
const fmtMoney=n=>{try{return new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(n)}catch{return "$"+n}};
const fmtDate=d=>{if(!d) return "-"; try{const p=String(d).split("-");return `${p[2]||""}/${p[1]||""}/${p[0]||""}`}catch{return d}};
const postJSON=async(u,b)=>{const r=await fetch(u,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b||{})});const t=await r.text().catch(()=>(""));if(!r.ok) throw new Error("HTTP "+r.status+" "+t); if(!t.trim()) return {}; try{return JSON.parse(t)}catch{return{_raw:t}}};

/* =============== API (solo cursos) =============== */
const API_BASE="https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
const API={ cursos:API_BASE+"c_cursos.php", iCursos:API_BASE+"i_cursos.php", uCursos:API_BASE+"u_cursos.php" };
const API_UPLOAD={ cursoImg:API_BASE+"u_cursoImg.php" };

/* =============== Estado local del drawer =============== */
const DrawerState={
  el:null, overlay:null,
  mode:"view",                   // 'view' | 'edit' | 'create'
  curso:null,                    // objeto curso actual
  isAdmin:true                   // si necesitas, pon lógica real aquí
};

/* =============== Validaciones simples =============== */
const validarImagen=(file,opt)=>{opt=opt||{};const maxMB=Number(opt.maxMB||2);if(!file) return {ok:false,error:"No se seleccionó archivo"};const allowed=["image/jpeg","image/png"];if(!allowed.includes(file.type)) return {ok:false,error:"Formato no permitido. Solo JPG o PNG"};const sizeMB=file.size/1024/1024;if(sizeMB>maxMB) return {ok:false,error:"La imagen excede "+maxMB+"MB"};return{ok:true}};
const validarCurso=(c)=>{
  const req=["nombre","descripcion_breve","descripcion_media","descripcion_curso","dirigido","competencias","tutor","categoria","prioridad","tipo_evaluacion","actividades","calendario","horas","fecha_inicio"];
  const faltan=req.filter(k=>c[k]==null || String(c[k]).trim()==="");
  if(faltan.length) return {ok:false,error:"Campos requeridos: "+faltan.join(", ")};
  return {ok:true};
};

/* =============== Imágenes curso =============== */
const mediaUrlsByType=(type,id)=>type==="curso"?[`/ASSETS/cursos/img${Number(id)}.png`]:[];
const imgExists=url=>new Promise(res=>{try{const i=new Image();i.onload=()=>res(true);i.onerror=()=>res(false);i.src=withBust(url)}catch{res(false)}});
async function requireCourseImage(id){ const u=mediaUrlsByType("curso",id)[0]; return await imgExists(u); }

/* Modal previa simple y segura */
function renderPreviewUI(host,file,onConfirm,onCancel){
  const url=URL.createObjectURL(file);
  const overlay=document.createElement("div");
  overlay.style.cssText="position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(1.5px);";
  const card=document.createElement("div");
  card.style.cssText="background:#fff;border-radius:14px;box-shadow:0 20px 40px rgba(0,0,0,.25);width:min(920px,94vw);max-height:90vh;overflow:hidden;display:flex;flex-direction:column;";
  card.innerHTML=`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #eee;">
      <strong>Vista previa</strong>
      <button type="button" data-act="x" class="gc-btn gc-btn--ghost" style="padding:.35rem .6rem">✕</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 280px;gap:16px;padding:16px;align-items:start;">
      <div style="border:1px solid #eee;border-radius:12px;background:#fafafa;display:flex;align-items:center;justify-content:center;min-height:320px;max-height:60vh;">
        <img src="${escapeAttr(url)}" alt="Vista previa" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:8px">
      </div>
      <div style="border-left:1px dashed #e6e6e6;padding-left:16px;display:flex;flex-direction:column;gap:8px">
        <div><strong>Archivo:</strong> ${escapeHTML(file.name)}</div>
        <div><strong>Peso:</strong> ${humanSize(file.size)}</div>
        <div><strong>Tipo:</strong> ${escapeHTML(file.type||"")}</div>
        <div style="margin-top:auto;display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" class="gc-btn gc-btn--primary" data-act="ok">Subir</button>
          <button type="button" class="gc-btn gc-btn--ghost" data-act="cancel">Cancelar</button>
        </div>
      </div>
    </div>`;
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  const cleanup=()=>{URL.revokeObjectURL(url); overlay.remove()};
  overlay.addEventListener("click",(e)=>{ if(e.target===overlay) cleanup(); });
  card.querySelector('[data-act="x"]')?.addEventListener("click",cleanup);
  card.querySelector('[data-act="cancel"]')?.addEventListener("click",()=>{onCancel&&onCancel(); cleanup();});
  card.querySelector('[data-act="ok"]')?.addEventListener("click",async()=>{ try{ await onConfirm?.() } finally { cleanup(); }});
}

/* Render del bloque de imágenes (lápiz solo en edición) */
function mountReadOnlyMedia({container,id,editable}){
  if(!container) return;
  const url=mediaUrlsByType("curso",id)[0];
  container.innerHTML=`
    <div class="media-head">
      <div class="media-title">Imágenes</div>
      <div class="media-help" style="color:${editable?"#666":"#888"}">${editable?"JPG/PNG · Máx 2MB":"Solo lectura"}</div>
    </div>
    <div class="media-grid">
      <div class="media-card">
        <figure class="media-thumb">
          <img alt="Portada" src="${escapeAttr(withBust(url))}">
          ${editable?`
            <button class="icon-btn media-edit" title="Editar imagen" aria-label="Editar">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0L15.13 5.12l3.75 3.75 1.83-1.83z" fill="currentColor"/>
              </svg>
            </button>`:""}
        </figure>
        <div class="media-meta"><div class="media-label">Portada</div></div>
      </div>
    </div>`;
  const img=container.querySelector("img");
  if(img){
    img.onerror=()=>{ img.onerror=null; img.src=withBust(url.replace(".png",".jpg")); };
  }
  if(editable){
    const btn=container.querySelector(".media-edit");
    if(btn && !btn._gcBound){
      btn._gcBound=true;
      btn.addEventListener("click",()=>{ 
        const input=document.createElement("input");
        input.type="file"; input.accept="image/png,image/jpeg"; input.style.display="none";
        document.body.appendChild(input);
        input.addEventListener("change",async()=>{
          const file=input.files&&input.files[0]; input.remove(); if(!file) return;
          const v=validarImagen(file,{maxMB:2}); if(!v.ok) return toast(v.error,"error");
          renderPreviewUI(container,file,async()=>{
            try{
              const fd=new FormData();
              fd.append("curso_id",String(id));
              fd.append("imagen",file);
              const r=await fetch(API_UPLOAD.cursoImg,{method:"POST",body:fd});
              const tx=await r.text().catch(()=>("")); if(!r.ok) throw new Error("HTTP "+r.status+" "+tx);
              let json; try{json=JSON.parse(tx)}catch{json={_raw:tx}};
              const newURL=(json&&json.url)?json.url:url;
              img.src=withBust(newURL);
              toast("Imagen actualizada","exito");
            }catch(e){ gcLog(e); toast("No se pudo subir la imagen","error"); }
          },()=>{});
        });
        input.click();
      });
    }
  }
}

/* =============== Relleno de vistas (view/edit) =============== */
function paintView(c){
  const root=DrawerState.el; if(!root) return;
  // Título
  const title=qs("#drawer-title",root);
  if(title) title.textContent="Curso · "+(c?.nombre||"—");

  // Pares de texto (div.value) — usa ids "v_*"
  const set=(id,val,fmt)=>{ const el=qs("#"+id,root); if(!el) return; el.textContent=fmt?fmt(val):String(val??"-"); };
  set("v_nombre",c.nombre);
  set("v_desc_breve",c.descripcion_breve);
  set("v_desc_media",c.descripcion_media);
  set("v_desc_curso",c.descripcion_curso);
  set("v_dirigido",c.dirigido);
  set("v_competencias",c.competencias);
  set("v_tutor",c.tutor_nombre||c.tutor||"-");
  set("v_categoria",c.categoria_nombre||c.categoria||"-");
  set("v_prioridad",c.prioridad_nombre||c.prioridad||"-");
  set("v_tipo_eval",c.tipo_eval_nombre||c.tipo_evaluacion||"-");
  set("v_actividades",c.actividades_nombre||c.actividades||"-");
  set("v_calendario",c.calendario_nombre||c.calendario||"-");
  set("v_horas",c.horas);
  set("v_precio",c.precio,fmtMoney);
  set("v_certificado",c.certificado? "Sí":"No");
  set("v_fecha",c.fecha_inicio,fmtDate);
  set("v_estatus",c.estatus==1?"Activo":(c.estatus==2?"Pausado":(c.estatus==3?"Terminado":"Inactivo")));

  // JSON debug
  const j=qs("#json-curso",root);
  if(j) j.textContent=JSON.stringify(c,null,2);

  // Media (abajo del todo, antes del JSON)
  const media=qs("#media-curso",root);
  if(media){ media.innerHTML=""; mountReadOnlyMedia({container:media,id:c.id,editable:false}); }
}

function paintEdit(c){
  const root=DrawerState.el; if(!root) return;
  const set=(id,val)=>{ const el=qs("#"+id,root); if(!el) return; if(el.type==="checkbox") el.checked=!!Number(val); else el.value=(val??""); };
  set("f_nombre",c.nombre);
  set("f_desc_breve",c.descripcion_breve);
  set("f_desc_media",c.descripcion_media);
  set("f_desc_curso",c.descripcion_curso);
  set("f_dirigido",c.dirigido);
  set("f_competencias",c.competencias);
  set("f_tutor",c.tutor);
  set("f_categoria",c.categoria);
  set("f_prioridad",c.prioridad);
  set("f_tipo_eval",c.tipo_evaluacion);
  set("f_actividades",c.actividades);
  set("f_calendario",c.calendario);
  set("f_horas",c.horas);
  set("f_precio",c.precio);
  set("f_certificado",c.certificado?1:0);
  set("f_fecha",c.fecha_inicio);
  set("f_estatus",c.estatus);

  // Media editable (con lápiz)
  const media=qs("#media-curso",root);
  if(media){ media.innerHTML=""; mountReadOnlyMedia({container:media,id:c.id,editable:true}); }
}

/* =============== Alternar modo =============== */
function setMode(mode){
  DrawerState.mode=mode;
  const root=DrawerState.el; if(!root) return;
  const V=qs("#curso-view",root), E=qs("#curso-edit",root);
  if(V) V.hidden = (mode!=="view");
  if(E) E.hidden = (mode==="view");

  // botones estándar
  const bEdit=qs("#btn-edit",root), bSave=qs("#btn-save",root), bCancel=qs("#btn-cancel",root);
  if(bEdit)   bEdit.style.display   = (mode==="view")?"":"none";
  if(bSave)   bSave.style.display   = (mode==="view")?"none":"";
  if(bCancel) bCancel.style.display = "";

  if(DrawerState.curso){
    if(mode==="view") paintView(DrawerState.curso);
    else paintEdit(DrawerState.curso);
  }
}

/* =============== Leer datos del form edición =============== */
function readForm(){
  const root=DrawerState.el;
  const get=id=>{const el=qs("#"+id,root); if(!el) return null; if(el.type==="checkbox") return el.checked?1:0; return el.value;};
  const c={ ...DrawerState.curso,
    nombre:get("f_nombre"),
    descripcion_breve:get("f_desc_breve"),
    descripcion_media:get("f_desc_media"),
    descripcion_curso:get("f_desc_curso"),
    dirigido:get("f_dirigido"),
    competencias:get("f_competencias"),
    tutor:Number(get("f_tutor")||0),
    categoria:Number(get("f_categoria")||0),
    prioridad:Number(get("f_prioridad")||0),
    tipo_evaluacion:Number(get("f_tipo_eval")||0),
    actividades:Number(get("f_actividades")||0),
    calendario:Number(get("f_calendario")||0),
    horas:Number(get("f_horas")||0),
    precio:Number(get("f_precio")||0),
    certificado:Number(get("f_certificado")||0)?1:0,
    fecha_inicio:get("f_fecha"),
    estatus:Number(get("f_estatus")||1)
  };
  return c;
}

/* =============== Guardar =============== */
async function guardarCurso(){
  const data=readForm();
  const v=validarCurso(data);
  if(!v.ok) return toast(v.error,"error");
  try{
    const isCreate = !data.id;
    const url=isCreate?API.iCursos:API.uCursos;
    const res=await postJSON(url,data);
    // actualiza id si viene del insert
    if(isCreate && res?.id) data.id=res.id;
    DrawerState.curso=data;
    toast("Curso guardado","exito");
    setMode("view");
  }catch(e){ gcLog(e); toast("No se pudo guardar","error"); }
}

/* =============== Abrir / Cerrar drawer =============== */
function openDrawer(){
  const el=DrawerState.el, ov=DrawerState.overlay;
  if(ov){ ov.classList.add("open"); }
  if(el){ el.classList.add("open"); el.setAttribute("aria-hidden","false"); el.removeAttribute("hidden"); }
}
function closeDrawer(){
  const el=DrawerState.el, ov=DrawerState.overlay;
  if(ov){ ov.classList.remove("open"); }
  if(el){ el.classList.remove("open"); el.setAttribute("aria-hidden","true"); el.setAttribute("hidden",""); }
  DrawerState.mode="view"; DrawerState.curso=null;
}

/* =============== API pública para abrir el drawer =============== */
async function openCursoDrawer(cursoOrId){
  let c=cursoOrId;
  if(typeof cursoOrId==="number"){
    // intenta pedir por id (si tu backend lo permite), si no, podrías traer por estatus y filtrar
    try{
      const arr=await postJSON(API.cursos,{ id:cursoOrId });
      if(Array.isArray(arr) && arr.length) c=arr[0];
      else if(arr && typeof arr==="object") c=arr;
    }catch(e){ gcLog(e); }
  }
  if(!c || typeof c!=="object"){ toast("No se pudo abrir el curso","error"); return; }
  DrawerState.curso=c;
  openDrawer();
  setMode("view"); // por defecto abre en lectura
}

/* =============== Binding de eventos =============== */
function bindEvents(){
  const root=DrawerState.el; if(!root) return;

  // Botones header/acciones
  qs("#drawer-close",root)?.addEventListener("click",closeDrawer);
  qs("#btn-edit",root)?.addEventListener("click",()=>setMode("edit"));
  qs("#btn-cancel",root)?.addEventListener("click",()=>setMode("view"));
  qs("#btn-save",root)?.addEventListener("click",guardarCurso);

  // Copiar JSON
  const copyBtn=qs("#btn-copy-json-curso",root);
  if(copyBtn && !copyBtn._gcBound){
    copyBtn._gcBound=true;
    copyBtn.addEventListener("click",async()=>{
      const pre=qs("#json-curso",root); if(!pre) return;
      try{ await navigator.clipboard.writeText(pre.textContent||""); toast("JSON copiado","exito"); }
      catch{ toast("No se pudo copiar","error"); }
    });
  }
}

/* =============== Init =============== */
document.addEventListener("DOMContentLoaded",()=>{
  DrawerState.el=qs("#gc-drawer");
  DrawerState.overlay=qs("#gc-dash-overlay");
  if(!DrawerState.el){ gcLog("Drawer #gc-drawer no encontrado"); return; }
  bindEvents();

  // Si el drawer ya viene abierto con datos (como tu ejemplo), intenta leer JSON del <pre>:
  const pre=qs("#json-curso",DrawerState.el);
  if(pre && pre.textContent.trim()){
    try{ DrawerState.curso=JSON.parse(pre.textContent); setMode("view"); }
    catch{ /* ignore */ }
  }

  // Expón una API mínima para que la lista pueda abrir el drawer:
  window.GC_CursoDrawer={ open:openCursoDrawer, setMode, getData:()=>DrawerState.curso };
});

})();
