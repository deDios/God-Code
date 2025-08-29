(()=>{"use strict";
/* ===== Utils ===== */
const GC_DEBUG=false,gcLog=(...a)=>{if(GC_DEBUG&&typeof console!="undefined"){try{console.log("[GC]",...a)}catch{}}},qs=(s,r=document)=>r.querySelector(s),qsa=(s,r=document)=>Array.prototype.slice.call(r.querySelectorAll(s)),toast=(m,t="exito",d=2500)=>window.gcToast?window.gcToast(m,t,d):gcLog(`[${t}] ${m}`),ntf=v=>Number(v||0),norm=s=>String(s||"").normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().trim();
document.documentElement.style.setProperty("--vh",`${window.innerHeight*0.01}px`);
window.addEventListener("resize",()=>document.documentElement.style.setProperty("--vh",`${window.innerHeight*0.01}px`));

/* ===== API ===== */
const API_BASE="https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
const API={
  cursos:API_BASE+"c_cursos.php", iCursos:API_BASE+"i_cursos.php", uCursos:API_BASE+"u_cursos.php",
  noticias:API_BASE+"c_noticia.php", iNoticias:API_BASE+"i_noticia.php", uNoticias:API_BASE+"u_noticia.php",
  comentarios:API_BASE+"c_comentario_noticia.php",
  tutores:API_BASE+"c_tutor.php", iTutores:API_BASE+"i_tutor.php", uTutores:API_BASE+"u_tutor.php",
  prioridad:API_BASE+"c_prioridad.php", categorias:API_BASE+"c_categorias.php", calendario:API_BASE+"c_dias_curso.php",
  tipoEval:API_BASE+"c_tipo_evaluacion.php", actividades:API_BASE+"c_actividades.php",
  usuarios:API_BASE+"c_usuarios.php", iUsuarios:API_BASE+"i_usuario.php", uUsuarios:API_BASE+"u_usuario.php", uAvatar:API_BASE+"u_avatar.php"
};
const API_UPLOAD={cursoImg:API_BASE+"u_cursoImg.php", noticiaImg:API_BASE+"u_noticiaImagenes.php", tutorImg:API_BASE+"u_tutorImagen.php"};

/* ===== Consts / State ===== */
const ADMIN_IDS=[1,12,13];
const STATUS_OPTIONS=[{v:1,l:"Activo"},{v:0,l:"Inactivo"},{v:2,l:"Borrador"},{v:3,l:"Archivado"}];
const state={route:"#/cursos",page:1,pageSize:10,data:[],raw:[],search:"",currentDrawer:null,tempNewCourseImage:null,tempNewNewsImages:{1:null,2:null},tutorsMap:null,prioMap:null,categoriasMap:null,calendarioMap:null,tipoEvalMap:null,actividadesMap:null};
const cacheGuard=o=>o&&(Date.now()-o._ts<30*60*1e3);
const arrToMap=arr=>{const m={};(Array.isArray(arr)?arr:[]).forEach(x=>m[x.id]=x.nombre);m._ts=Date.now();return m;};

let currentUser=getUsuarioFromCookie();
let isAdminUser=ADMIN_IDS.includes(Number((currentUser&&currentUser.id)||0));

function getUsuarioFromCookie(){
  const row=(document.cookie||"").split("; ").find(r=>r.indexOf("usuario=")===0);
  if(!row) return null;
  try{
    const raw=row.split("=")[1]||"",once=decodeURIComponent(raw),maybe=/\%7B|\%22/.test(once)?decodeURIComponent(once):once;
    return JSON.parse(maybe);
  }catch(e){gcLog("cookie parse fail",e);return null;}
}
async function postJSON(url,body){
  gcLog("postJSON ->",url,body);
  const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body||{})});
  const t=await r.text().catch(()=> ""); gcLog("postJSON <-",url,r.status,t);
  if(!r.ok) throw new Error("HTTP "+r.status+" "+(t||""));
  if(!t.trim()) return {}; try{return JSON.parse(t)}catch{return {_raw:t}}
}

/* ===== Catálogos (Cursos) ===== */
async function getTutorsMap(){if(cacheGuard(state.tutorsMap))return state.tutorsMap; const a=await postJSON(API.tutores,{estatus:1}); return state.tutorsMap=arrToMap(a);}
async function getPrioridadMap(){if(cacheGuard(state.prioMap))return state.prioMap; const a=await postJSON(API.prioridad,{estatus:1}); return state.prioMap=arrToMap(a);}
async function getCategoriasMap(){if(cacheGuard(state.categoriasMap))return state.categoriasMap; const a=await postJSON(API.categorias,{estatus:1}); return state.categoriasMap=arrToMap(a);}
async function getCalendarioMap(){if(cacheGuard(state.calendarioMap))return state.calendarioMap; const a=await postJSON(API.calendario,{estatus:1}); return state.calendarioMap=arrToMap(a);}
async function getTipoEvalMap(){if(cacheGuard(state.tipoEvalMap))return state.tipoEvalMap; const a=await postJSON(API.tipoEval,{estatus:1}); return state.tipoEvalMap=arrToMap(a);}
async function getActividadesMap(){if(cacheGuard(state.actividadesMap))return state.actividadesMap; const a=await postJSON(API.actividades,{estatus:1}); return state.actividadesMap=arrToMap(a);}

/* ===== Nav / Rutas ===== */
function isCuentasLink(el){const href=(el.getAttribute("href")||el.dataset.route||"").toLowerCase(),txt=(el.textContent||"").toLowerCase();return href.indexOf("#/cuentas")>=0||txt.indexOf("cuenta")>=0;}
function applyAdminVisibility(isAdmin){
  qsa(".gc-side .nav-item").forEach(a=>{
    if(!isAdmin && !isCuentasLink(a)){
      (a.closest&&a.closest("li")?a.closest("li"):a).style.display="none";
      a.setAttribute("tabindex","-1"); a.setAttribute("aria-hidden","true");
    }
  });
  const addBtn=qs("#btn-add"); if(addBtn) addBtn.style.display=isAdmin?"":"none";
}
function enforceRouteGuard(){
  if(!isAdminUser){
    const h=(window.location.hash||"").toLowerCase();
    if(h.indexOf("#/cuentas")!==0){ if(location.hash!=="#/cuentas") location.hash="#/cuentas"; }
  }
}
function setRoute(hash){const t=hash||(isAdminUser?"#/cursos":"#/cuentas"); if(location.hash!==t) location.hash=t; else onRouteChange();}
window.addEventListener("hashchange",onRouteChange);

function onRouteChange(){
  enforceRouteGuard();
  const hash=window.location.hash||(isAdminUser?"#/cursos":"#/cuentas");
  state.route=hash; state.page=1;
  qsa(".gc-side .nav-item").forEach(a=>{
    const active=a.getAttribute("href")===hash;
    a.classList&&a.classList.toggle("is-active",active);
    a.setAttribute("aria-current",active?"page":"false");
  });
  if(hash.startsWith("#/cursos"))   { hideCuentaPanel(); return isAdminUser?loadCursos():enforceRouteGuard(); }
  if(hash.startsWith("#/noticias")) { hideCuentaPanel(); return isAdminUser?loadNoticias():enforceRouteGuard(); }
  if(hash.startsWith("#/tutores"))  { hideCuentaPanel(); return isAdminUser?loadTutores():enforceRouteGuard(); }
  if(hash.startsWith("#/usuarios")) { hideCuentaPanel(); return isAdminUser?loadUsuarios():enforceRouteGuard(); }
  if(hash.startsWith("#/cuentas"))  { showCuentaPanel(); return; }
  setRoute(isAdminUser?"#/cursos":"#/cuentas");
}

/* ===== List Core ===== */
function showSkeletons(){
  const d=qs("#recursos-list"), m=qs("#recursos-list-mobile");
  if(d) d.innerHTML=""; if(m) m.innerHTML="";
  const t=d||m; if(!t) return;
  for(let i=0;i<5;i++) t.insertAdjacentHTML("beforeend",'<div class="sk-row"><div class="sk n1"></div><div class="sk n2"></div><div class="sk n3"></div></div>');
}
function renderPagination(total){
  const totalPages=Math.max(1,Math.ceil(total/state.pageSize));
  [qs("#pagination-controls"),qs("#pagination-mobile")].forEach(cont=>{
    if(!cont) return; cont.innerHTML=""; if(totalPages<=1) return;
    const prev=document.createElement("button"); prev.className="arrow-btn"; prev.textContent="‹"; prev.disabled=state.page===1; prev.onclick=()=>{state.page=Math.max(1,state.page-1); refreshCurrent();}; cont.appendChild(prev);
    for(let p=1;p<=totalPages&&p<=7;p++){const b=document.createElement("button"); b.className="page-btn"+(p===state.page?" active":""); b.textContent=p; b.onclick=()=>{state.page=p; refreshCurrent();}; cont.appendChild(b);}
    const next=document.createElement("button"); next.className="arrow-btn"; next.textContent="›"; next.disabled=state.page===totalPages; next.onclick=()=>{state.page=Math.min(totalPages,state.page+1); refreshCurrent();}; cont.appendChild(next);
  });
}
function refreshCurrent(){
  if(state.route.startsWith("#/cursos"))   return drawCursos();
  if(state.route.startsWith("#/noticias")) return drawNoticias();
  if(state.route.startsWith("#/tutores"))  return drawTutores();
  if(state.route.startsWith("#/usuarios")) return drawUsuarios();
  // #/cuentas -> no hay lista que refrescar
}
function defaultMatcher(q){const k=norm(q); return it=>norm(JSON.stringify(it)).includes(k);}
function renderList(rows,config){
  const d=qs("#recursos-list"), m=qs("#recursos-list-mobile");
  if(d) d.innerHTML=""; if(m) m.innerHTML="";
  const filtered=state.search?rows.filter(config.matcher||defaultMatcher(state.search)):rows;
  if(!filtered.length){
    const empty='<div class="empty-state" style="padding:1rem;">Sin resultados</div>';
    if(d) d.innerHTML=empty; if(m) m.innerHTML=empty;
    const c=qs("#mod-count"); if(c) c.textContent="0 resultados";
    renderPagination(0); return;
  }
  const start=(state.page-1)*state.pageSize, pageRows=filtered.slice(start,start+state.pageSize);
  pageRows.forEach(it=>{ if(d) d.insertAdjacentHTML("beforeend",config.desktopRow(it)); if(m) m.insertAdjacentHTML("beforeend",config.mobileRow(it)); });
  const countEl=qs("#mod-count"); if(countEl) countEl.textContent=filtered.length+" "+(filtered.length===1?"elemento":"elementos");

  qsa("#recursos-list .table-row").forEach(el=>{
    el.addEventListener("click",()=>{
      const data=el.dataset||{};
      state.currentDrawer={type:data.type,id:Number(data.id),mode:"view"};
      openDrawer(config.drawerTitle(data),config.drawerBody(data));
      setTimeout(()=>config.afterOpen&&config.afterOpen(data),0);
    });
  });
  qsa("#recursos-list-mobile .row-toggle").forEach(el=>{
    el.addEventListener("click",()=>{const row=el.closest(".table-row-mobile"); if(row&&row.classList) row.classList.toggle("expanded");});
  });
  qsa("#recursos-list-mobile .open-drawer").forEach(btn=>{
    btn.addEventListener("click",(e)=>{
      e.stopPropagation();
      const host=btn.closest(".table-row-mobile"), data=(host&&host.dataset)||{};
      state.currentDrawer={type:data.type,id:Number(data.id),mode:"view"};
      openDrawer(config.drawerTitle(data),config.drawerBody(data));
      setTimeout(()=>config.afterOpen&&config.afterOpen(data),0);
    });
  });

  // Reactivar (cursos/noticias/tutores)
  qsa(".gc-reactivate").forEach(btn=>{
    btn.addEventListener("click",async(e)=>{
      e.stopPropagation();
      const id=Number(btn.getAttribute("data-id")),t=btn.getAttribute("data-type");
      try{
        if(t==="curso"){await reactivateCurso(id); toast("Curso reactivado","exito"); await loadCursos();}
        else if(t==="noticia"){const ok=await reactivateNoticia(id); if(ok){toast("Noticia reactivada","exito"); await loadNoticias();}}
        else if(t==="tutor"){await reactivateTutor(id); toast("Tutor reactivado","exito"); await loadTutores();}
      }catch(err){gcLog(err); toast("No se pudo reactivar","error");}
    });
  });

  renderPagination(filtered.length);
}

/* ===== Format & helpers ===== */
const escapeHTML=s=>String(s==null?"":s).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
const escapeAttr=s=>String(s==null?"":s).replace(/"/g,"&quot;");
const fmtDate=d=>{if(!d) return "-"; try{const p=String(d).split("-"); return `${p[2]||""}/${p[1]||""}/${p[0]||""}`}catch{return d}};
const fmtDateTime=dt=>{if(!dt) return "-"; try{const sp=String(dt).split(" "); return `${fmtDate(sp[0])} ${sp[1]||""}`.trim()}catch{return dt}};
const fmtMoney=n=>{try{return new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(n)}catch{return "$"+n}};
const pair=(l,v)=>`<div class="field"><div class="label">${escapeHTML(l)}</div><div class="value">${escapeHTML(v!=null?v:"-")}</div></div>`;
const statusBadge=v=>Number(v)===1?'<span class="gc-badge-activo">Activo</span>':Number(v)===0?'<span class="gc-badge-inactivo">Inactivo</span>':`<span class="gc-badge-gray">Estatus ${escapeHTML(v)}</span>`;
const statusText=v=>{const f=STATUS_OPTIONS.find(x=>Number(x.v)===Number(v)); return f?f.l:`Estatus ${v}`;};
const statusSelect=(id,val)=>`<select id="${id}">${STATUS_OPTIONS.map(o=>`<option value="${o.v}"${Number(val)===Number(o.v)?" selected":""}>${o.l}</option>`).join("")}</select>`;
function withBust(url){try{const u=new URL(url,window.location.origin); u.searchParams.set("v",Date.now()); return u.pathname+"?"+u.searchParams.toString();}catch{return url+(url.indexOf("?")>=0?"&":"?")+"v="+Date.now();}}

/* ===== Media (imágenes) ===== */
function noImageSvg(){return"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M20 70 L60 35 L95 65 L120 50 L140 70' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>";}
function mediaUrlsByType(type,id){
  const nid=Number(id);
  if(type==="noticia") return [`/ASSETS/noticia/NoticiasImg/noticia_img1_${nid}.png`,`/ASSETS/noticia/NoticiasImg/noticia_img2_${nid}.png`];
  if(type==="curso")   return [`/ASSETS/cursos/img${nid}.png`];
  if(type==="tutor")   return [`/ASSETS/tutor/tutor_${nid}.png`];
  return [];
}
function mountReadOnlyMedia(opt){
  const container=opt&&opt.container,type=opt&&opt.type,id=opt&&opt.id,labels=(opt&&opt.labels)||[],editableOverride=opt&&opt.editable;
  if(!container) return;
  const editable=typeof editableOverride==="boolean"?editableOverride:(isAdminUser&&state.currentDrawer&&state.currentDrawer.mode==="edit");
  const urls=mediaUrlsByType(type,id), grid=document.createElement("div"); grid.className="media-grid";
  urls.forEach((url,i)=>{
    const label=labels[i]||("Imagen "+(i+1)), card=document.createElement("div"); card.className="media-card";
    const editBtnHTML=editable?('<button class="icon-btn media-edit" title="Editar imagen"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.0 1.0 0 0 0 0-1.41l-2.34-2.34a1.0 1.0 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"></path></svg></button>'):"";
    card.innerHTML=`<figure class="media-thumb"><img alt="${escapeAttr(label)}" src="${withBust(url)}">${editBtnHTML}</figure><div class="media-meta"><div class="media-label">${escapeHTML(label)}</div></div>`;
    const img=card.querySelector("img");
    if(img){img.onerror=function(){img.onerror=null; if(type==="tutor"&&/\.png(\?|$)/.test(url)){img.src=withBust(url.replace(".png",".jpg"));}else{img.src="data:image/svg+xml;utf8,"+encodeURIComponent(noImageSvg());}};}
    if(editable){
      const btnEdit=card.querySelector(".media-edit");
      if(btnEdit){
        btnEdit.addEventListener("click",(e)=>{
          e.preventDefault(); e.stopPropagation();
          const input=document.createElement("input"); input.type="file"; input.accept="image/png, image/jpeg"; input.style.display="none"; document.body.appendChild(input);
          input.addEventListener("change",async function(){
            const file=input.files&&input.files[0]; try{document.body.removeChild(input)}catch{}; if(!file) return;
            const v=validarImagen(file,{maxMB:2}); if(!v.ok) return toast(v.error,"error");
            renderPreviewUI(card,file,async()=>{
              try{
                if(type==="curso"){
                  const fd=new FormData(); fd.append("curso_id",String(id)); fd.append("imagen",file);
                  if(!API_UPLOAD.cursoImg){toast("Configura API_UPLOAD.cursoImg","warning");return;}
                  const res=await fetch(API_UPLOAD.cursoImg,{method:"POST",body:fd}), text=await res.text().catch(()=> ""); if(!res.ok) throw new Error("HTTP "+res.status+" "+(text||""));
                  let json; try{json=JSON.parse(text)}catch{json={_raw:text}}; img.src=withBust((json&&json.url)||url); toast("Imagen de curso actualizada","exito"); return;
                }
                if(type==="noticia"){
                  if(!API_UPLOAD.noticiaImg){toast("Configura API_UPLOAD.noticiaImg","warning");return;}
                  const fd=new FormData(); fd.append("noticia_id",String(id)); fd.append("pos",String(i+1)); fd.append("imagen",file);
                  const res=await fetch(API_UPLOAD.noticiaImg,{method:"POST",body:fd}), text=await res.text().catch(()=> ""); if(!res.ok) throw new Error("HTTP "+res.status+" "+(text||""));
                  let json; try{json=JSON.parse(text)}catch{json={_raw:text}}; img.src=withBust((json&&json.url)||url); toast("Imagen de noticia actualizada","exito"); return;
                }
                if(type==="tutor"){
                  if(!API_UPLOAD.tutorImg){toast("Configura API_UPLOAD.tutorImg","warning");return;}
                  const fd=new FormData(); fd.append("tutor_id",String(id)); fd.append("imagen",file);
                  const res=await fetch(API_UPLOAD.tutorImg,{method:"POST",body:fd}), text=await res.text().catch(()=> ""); if(!res.ok) throw new Error("HTTP "+res.status+" "+(text||""));
                  let json; try{json=JSON.parse(text)}catch{json={_raw:text}}; img.src=withBust((json&&json.url)||url); toast("Imagen de tutor actualizada","exito"); return;
                }
              }catch(err){gcLog(err); toast("No se pudo subir la imagen","error");}
            },()=>{});
          });
          input.click();
        });
      }
    }
    grid.appendChild(card);
  });
  container.innerHTML=`<div class="media-head"><div class="media-title">Imágenes</div>${editable?`<div class="media-help" style="color:#666;">Formatos: JPG/PNG · Máx 2MB</div>`:`<div class="media-help" style="color:#888;">Solo lectura</div>`}</div>`;
  container.appendChild(grid);
}
function humanSize(bytes){if(bytes<1024)return bytes+" B"; if(bytes<1024*1024) return (bytes/1024).toFixed(1)+" KB"; return (bytes/1024/1024).toFixed(2)+" MB";}
function renderPreviewUI(cardEl,file,onConfirm,onCancel){
  const url=URL.createObjectURL(file),drawer=qs("#gc-drawer"),overlayBG=qs("#gc-dash-overlay");
  const prev={pe:drawer&&drawer.style?drawer.style.pointerEvents:"",fl:drawer&&drawer.style?drawer.style.filter:"",dz:drawer&&drawer.style?drawer.style.zIndex:"",oz:overlayBG&&overlayBG.style?overlayBG.style.zIndex:"",aria:drawer?drawer.getAttribute("aria-hidden"):null,hadInert:drawer&&typeof drawer.hasAttribute==="function"?drawer.hasAttribute("inert"):false};
  const overlay=document.createElement("div"); overlay.className="gc-preview-overlay"; overlay.setAttribute("role","dialog"); overlay.setAttribute("aria-modal","true");
  overlay.style.cssText="position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(17,24,39,.55);backdrop-filter:saturate(120%) blur(2px);";
  if(drawer){drawer.style.pointerEvents="none";drawer.style.filter="blur(1px)";drawer.style.zIndex="1";drawer.setAttribute("aria-hidden","true");try{drawer.setAttribute("inert","")}catch{}}
  if(overlayBG&&overlayBG.style) overlayBG.style.zIndex="2";
  const modal=document.createElement("div"); modal.className="gc-preview-modal"; modal.style.cssText="background:#fff;border-radius:14px;box-shadow:0 20px 40px rgba(0,0,0,.25);width:min(920px,94vw);max-height:90vh;overflow:hidden;display:flex;flex-direction:column;";
  const header=document.createElement("div"); header.style.cssText="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 16px;border-bottom:1px solid #eee;"; header.innerHTML='<div style="font-weight:700;font-size:1.05rem;">Vista previa de imagen</div><button class="gc-btn gc-btn--ghost" data-act="close" aria-label="Cerrar" style="min-width:auto;padding:.35rem .6rem;">✕</button>';
  const body=document.createElement("div"); body.style.cssText="display:grid;grid-template-columns:1fr 280px;gap:16px;padding:16px;align-items:start;";
  const imgWrap=document.createElement("div"); imgWrap.style.cssText="border:1px solid #eee;border-radius:12px;padding:8px;background:#fafafa;display:flex;align-items:center;justify-content:center;min-height:320px;max-height:60vh;";
  imgWrap.innerHTML=`<img src="${url}" alt="Vista previa" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:8px;">`;
  const side=document.createElement("div"); side.style.cssText="border-left:1px dashed #e6e6e6;padding-left:16px;display:flex;flex-direction:column;gap:10px;";
  side.innerHTML=`<div style="font-weight:600;">Detalles</div>
  <div style="font-size:.92rem;color:#444;line-height:1.35;">
    <div><strong>Archivo:</strong> ${file.name}</div>
    <div><strong>Peso:</strong> ${humanSize(file.size)}</div>
    <div><strong>Tipo:</strong> ${file.type||"desconocido"}</div>
    <div style="margin-top:6px;color:#666;">Formatos permitidos: JPG / PNG · Máx 2MB</div>
  </div>
  <div style="margin-top:auto;display:flex;gap:8px;flex-wrap:wrap;">
    <button class="gc-btn gc-btn--primary" data-act="confirm">Subir</button>
    <button class="gc-btn gc-btn--ghost" data-act="cancel">Cancelar</button>
  </div>`;
  const mql=window.matchMedia&&window.matchMedia("(max-width: 720px)"),applyResponsive=()=>{if(mql&&mql.matches){body.style.gridTemplateColumns="1fr"; side.style.borderLeft="none"; side.style.paddingLeft="0"; imgWrap.style.minHeight="200px";} else {body.style.gridTemplateColumns="1fr 280px"; side.style.borderLeft="1px dashed #e6e6e6"; side.style.paddingLeft="16px"; imgWrap.style.minHeight="320px";}};
  if(mql&&mql.addEventListener) mql.addEventListener("change",applyResponsive); applyResponsive();
  body.appendChild(imgWrap); body.appendChild(side); modal.appendChild(header); modal.appendChild(body); overlay.appendChild(modal); document.body.appendChild(overlay); document.body.style.overflow="hidden";
  const cleanup=()=>{if(drawer){if(drawer.style){drawer.style.pointerEvents=prev.pe||"";drawer.style.filter=prev.fl||"";drawer.style.zIndex=prev.dz||"";} if(prev.aria!=null) drawer.setAttribute("aria-hidden",prev.aria); else drawer.removeAttribute("aria-hidden"); try{if(!prev.hadInert) drawer.removeAttribute("inert")}catch{}} if(overlayBG&&overlayBG.style) overlayBG.style.zIndex=prev.oz||""; document.body.style.overflow=""; try{URL.revokeObjectURL(url)}catch{}; try{overlay.remove()}catch{}; document.removeEventListener("keydown",onEsc);};
  const onEsc=e=>{if(e&&e.key==="Escape"){e.preventDefault(); cleanup();}};
  document.addEventListener("keydown",onEsc); overlay.addEventListener("click",(e)=>{if(e.target===overlay) cleanup();});
  header.querySelector('[data-act="close"]')?.addEventListener("click",cleanup);
  side.querySelector('[data-act="cancel"]')?.addEventListener("click",(e)=>{e.preventDefault(); onCancel&&onCancel(); cleanup();});
  side.querySelector('[data-act="confirm"]')?.addEventListener("click",async(e)=>{e.preventDefault(); try{if(onConfirm) await onConfirm();} finally{cleanup();}});
}
function validarImagen(file,opt){opt=opt||{}; const maxMB=opt.maxMB||2; if(!file) return {ok:false,error:"No se seleccionó archivo"}; const allowed=["image/jpeg","image/png"]; if(!allowed.includes(file.type)) return {ok:false,error:"Formato no permitido. Solo JPG o PNG"}; const sizeMB=file.size/1024/1024; if(sizeMB>maxMB) return {ok:false,error:"La imagen excede "+maxMB+"MB"}; return {ok:true};}

/* ===== Drawer base & dev ===== */
function openDrawer(title,bodyHTML){const ov=qs("#gc-dash-overlay"); if(ov&&ov.classList) ov.classList.add("open"); const dw=qs("#gc-drawer"); if(!dw) return; const t=qs("#drawer-title"); if(t) t.textContent=title||"Detalle"; const b=qs("#drawer-body"); if(b) b.innerHTML=bodyHTML||""; dw.classList&&dw.classList.add("open"); dw.setAttribute("aria-hidden","false");}
function closeDrawer(){try{if(document.activeElement&&document.activeElement.blur) document.activeElement.blur();}catch{} const ov=qs("#gc-dash-overlay"); if(ov&&ov.classList) ov.classList.remove("open"); const dw=qs("#gc-drawer"); if(!dw) return; dw.classList&&dw.classList.remove("open"); dw.setAttribute("aria-hidden","true"); state.currentDrawer=null; gcLog("closeDrawer");}
function disableDrawerInputs(disabled){qsa("#drawer-body input, #drawer-body select, #drawer-body textarea").forEach(el=>el.disabled=!!disabled);}
function jsonSection(obj,title,preId,btnId){const safe=escapeHTML(JSON.stringify(obj||{},null,2)); return `<details class="dev-json" open style="margin-top:16px;"><summary style="cursor:pointer;font-weight:600;">${escapeHTML(title)}</summary><div style="display:flex;gap:.5rem;margin:.5rem 0;"><button class="gc-btn" id="${btnId}">Copiar JSON</button></div><pre id="${preId}" class="value" style="white-space:pre-wrap;max-height:260px;overflow:auto;">${safe}</pre></details>`;}
function bindCopyFromPre(preSel,btnSel){
  const btn=qs(btnSel), pre=qs(preSel); if(!btn||!pre) return;
  btn.addEventListener("click",async(e)=>{
    e.preventDefault();
    const text=pre.textContent||""; if(!text) return toast("No hay JSON para copiar","warning");
    try{await navigator.clipboard.writeText(text); toast("JSON copiado","exito");}
    catch{
      try{const ta=document.createElement("textarea"); ta.value=text; ta.style.position="fixed"; ta.style.left="-9999px"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); toast("JSON copiado","exito");}
      catch{alert("No se pudo copiar");}
    }
  });
}

/* ===== UI / Toolbar ===== */
function bindUI(){
  // navegación lateral (delegación)
  const side=qs(".gc-side");
  if(side){
    side.addEventListener("click",(ev)=>{
      const el=ev.target.closest('[data-route], a[href^="#/"]'); if(!el) return;
      ev.preventDefault();
      const route=el.getAttribute("data-route")||el.getAttribute("href");
      if(route){ if(location.hash!==route) location.hash=route; else onRouteChange(); }
    });
  }
  // botones de la barra superior
  qsa(".admin-dash .admin-nav").forEach(btn=>{
    btn.addEventListener("click",function(){
      const route=btn.getAttribute("data-route")||btn.getAttribute("href");
      if(route){ if(location.hash!==route) location.hash=route; else onRouteChange(); }
    });
  });
  qs("#drawer-close")?.addEventListener("click",closeDrawer);
  const overlay=qs("#gc-dash-overlay"); overlay&&overlay.addEventListener("click",(e)=>{if(e&&e.target&&e.target.id==="gc-dash-overlay") closeDrawer();});
  const addBtn=qs("#btn-add");
  if(addBtn) addBtn.addEventListener("click",async()=>{
    if(!isAdminUser) return;
    if(state.route.startsWith("#/cursos"))      await openCreateCurso();
    else if(state.route.startsWith("#/noticias")) await openCreateNoticia();
    else if(state.route.startsWith("#/tutores"))  await openCreateTutor();
    else if(state.route.startsWith("#/usuarios")) await openCreateUsuario();
  });
  const s=qs("#search-input"); if(s){s.addEventListener("input",()=>{state.search=s.value||""; refreshCurrent();});}
}

/* ===== Cursos ===== */
const badgePrecio=precio=>Number(precio)===0?'<span class="gc-chip gray">Gratuito</span>':'<span class="gc-chip gray">Con costo</span>';
async function loadCursos(){
  const title=qs("#mod-title"); if(title) title.textContent="Cursos";
  const hdr=qs(".recursos-box.desktop-only .table-header");
  if(hdr){
    const c1=hdr.querySelector(".col-nombre"),c2=hdr.querySelector(".col-tutor")||hdr.querySelector(".col-tipo"),c3=hdr.querySelector(".col-fecha"),c4=hdr.querySelector(".col-status");
    if(c1) c1.textContent="Nombre"; if(c2){c2.textContent="Tutor"; c2.classList.add("col-tutor");} if(c3) c3.textContent="Fecha de inicio";
    if(!c4){const nc=document.createElement("div"); nc.className="col-status"; nc.setAttribute("role","columnheader"); nc.textContent="Status"; hdr.appendChild(nc);} else c4.textContent="Status";
  }
  const tt=qs(".tt-title"); if(tt) tt.textContent="Cursos:";
  const st=qs("#tt-status"); if(st){st.textContent="Activos e Inactivos"; st.classList.remove("badge-inactivo"); st.classList.add("badge-activo");}
  showSkeletons();
  try{
    const [act,inact,tmap,pmap,cmap,calmap,temap,ammap]=await Promise.all([
      postJSON(API.cursos,{estatus:1}), postJSON(API.cursos,{estatus:0}),
      getTutorsMap(), getPrioridadMap(), getCategoriasMap(), getCalendarioMap(), getTipoEvalMap(), getActividadesMap()
    ]);
    const raw=[].concat(Array.isArray(act)?act:[], Array.isArray(inact)?inact:[]);
    state.raw=raw;
    state.data=raw.map(c=>({id:c.id,nombre:c.nombre,tutor:(tmap&&tmap[c.tutor])||("Tutor #"+c.tutor),tutor_id:c.tutor,prioridad_id:c.prioridad,prioridad_nombre:(pmap&&pmap[c.prioridad])||("#"+c.prioridad),categoria_id:c.categoria,categoria_nombre:(cmap&&cmap[c.categoria])||("#"+c.categoria),calendario_id:c.calendario,calendario_nombre:(calmap&&calmap[c.calendario])||("#"+c.calendario),tipo_eval_id:c.tipo_evaluacion,tipo_eval_nombre:(temap&&temap[c.tipo_evaluacion])||("#"+c.tipo_evaluacion),actividades_id:c.actividades,actividades_nombre:(ammap&&ammap[c.actividades])||("#"+c.actividades),precio:c.precio,certificado:!!c.certificado,fecha:c.fecha_inicio,estatus:ntf(c.estatus),_all:c}));
    drawCursos();
  }catch(err){gcLog(err); const list=qs("#recursos-list"); if(list) list.innerHTML='<div style="padding:1rem;color:#b00020;">Error al cargar cursos</div>'; const m=qs("#recursos-list-mobile"); if(m) m.innerHTML=""; toast("No se pudieron cargar cursos","error");}
}
function drawCursos(){
  const rows=state.data;
  renderList(rows,{
    matcher:(q)=>{const k=norm(q); return it=>norm(it.nombre).includes(k)||norm(it.tutor).includes(k);},
    desktopRow:(it)=>`<div class="table-row" data-id="${it.id}" data-type="curso"><div class="col-nombre"><span class="name-text">${escapeHTML(it.nombre)}</span> ${badgePrecio(it.precio)}</div><div class="col-tutor">${escapeHTML(it.tutor)}</div><div class="col-fecha">${fmtDate(it.fecha)}</div><div class="col-status">${statusBadge(it.estatus)}</div></div>`,
    mobileRow:(it)=>`<div class="table-row-mobile" data-id="${it.id}" data-type="curso"><button class="row-toggle"><div class="col-nombre">${escapeHTML(it.nombre)} ${badgePrecio(it.precio)}</div><span class="icon-chevron">›</span></button><div class="row-details"><div><strong>Tutor:</strong> ${escapeHTML(it.tutor)}</div><div><strong>Inicio:</strong> ${fmtDate(it.fecha)}</div><div><strong>Status:</strong> ${statusText(it.estatus)}</div><div style="display:flex;gap:8px;margin:.25rem 0 .5rem;"><button class="gc-btn gc-btn--ghost open-drawer">Ver detalle</button>${Number(it.estatus)===0?`<button class="gc-btn gc-btn--success gc-reactivate" data-type="curso" data-id="${it.id}">Reactivar</button>`:""}</div></div></div>`,
    drawerTitle:(d)=>{const item=state.data.find(x=>String(x.id)===d.id); return item?("Curso · "+item.nombre):"Curso";},
    drawerBody:(d)=>renderCursoDrawer(d),
    afterOpen:(d)=>{if(d.type==="curso"){const it=state.data.find(x=>String(x.id)===d.id); if(!it) return; const cont=qs("#media-curso"); if(cont) mountReadOnlyMedia({container:cont,type:"curso",id:it.id,labels:["Portada"],editable:isAdminUser&&(state.currentDrawer&&state.currentDrawer.mode==="edit")}); if(isAdminUser) bindCopyFromPre("#json-curso","#btn-copy-json-curso");}}
  });
}
function normalizeCursoPayload(p){return {...p,nombre:String(p.nombre||""),descripcion_breve:String(p.descripcion_breve||""),descripcion_curso:String(p.descripcion_curso||""),descripcion_media:String(p.descripcion_media||""),dirigido:String(p.dirigido||""),competencias:String(p.competencias||""),certificado:Number(!!p.certificado),tutor:Number(p.tutor||0),horas:Number(p.horas||0),precio:Number(p.precio||0),estatus:Number(p.estatus!=null?p.estatus:1),prioridad:Number(p.prioridad||1),categoria:Number(p.categoria||1),calendario:Number(p.calendario||1),tipo_evaluacion:Number(p.tipo_evaluacion||1),actividades:Number(p.actividades||1),creado_por:Number(p.creado_por||0),fecha_inicio:String(p.fecha_inicio||"")};}
function mapToOptions(map,selectedId){if(!map||typeof map!="object") return '<option value="">—</option>'; const pairs=Object.keys(map).filter(k=>k!=="_ts").map(k=>[k,map[k]]); if(!pairs.length) return '<option value="">—</option>'; return pairs.map(([id,name])=>`<option value="${escapeAttr(id)}"${String(selectedId)===String(id)?" selected":""}>${escapeHTML(name)}</option>`).join("");}
function getEmptyCourse(){return{nombre:"",descripcion_breve:"",descripcion_curso:"",descripcion_media:"",dirigido:"",competencias:"",certificado:0,tutor:"",horas:0,precio:0,estatus:1,fecha_inicio:"",prioridad:1,categoria:1,calendario:1,tipo_evaluacion:1,actividades:1,creado_por:Number((currentUser&&currentUser.id)||0)||1};}
function readCursoForm(existingId){
  const read=id=>{const el=qs("#"+id); return el?el.value:"";}, readN=(id,def)=>Number(read(id)||def||0), readCh=id=>{const el=qs("#"+id); return el&&el.checked?1:0;};
  const payload={nombre:read("f_nombre"),descripcion_breve:read("f_desc_breve"),descripcion_curso:read("f_desc_curso"),descripcion_media:read("f_desc_media"),dirigido:read("f_dirigido"),competencias:read("f_competencias"),certificado:readCh("f_certificado"),tutor:readN("f_tutor",0),horas:readN("f_horas",0),precio:readN("f_precio",0),estatus:readN("f_estatus",1),fecha_inicio:read("f_fecha"),prioridad:readN("f_prioridad",1),categoria:readN("f_categoria",1),calendario:readN("f_calendario",1),tipo_evaluacion:readN("f_tipo_eval",1),actividades:readN("f_actividades",1),creado_por:Number((currentUser&&currentUser.id)||0)||1};
  if(existingId!=null) payload.id=Number(existingId); return payload;
}
async function uploadCursoImagen(cursoId,file){
  if(!API_UPLOAD||!API_UPLOAD.cursoImg) throw new Error("API_UPLOAD.cursoImg no configurado");
  const v=validarImagen(file,{maxMB:2}); if(!v.ok) throw new Error(v.error);
  const fd=new FormData(); fd.append("curso_id",String(cursoId)); fd.append("imagen",file);
  const res=await fetch(API_UPLOAD.cursoImg,{method:"POST",body:fd}), text=await res.text().catch(()=> ""); if(!res.ok) throw new Error("HTTP "+res.status+" "+(text||"")); try{return JSON.parse(text)}catch{return {_raw:text}}
}
async function saveNewCurso(){
  const payload=normalizeCursoPayload(readCursoForm(null));
  if(!payload.nombre) return toast("Falta el nombre","warning");
  if(!payload.tutor) return toast("Selecciona tutor","warning");
  if(!payload.categoria) return toast("Selecciona categoría","warning");
  if(!payload.fecha_inicio) return toast("Fecha de inicio requerida","warning");
  const res=await postJSON(API.iCursos,payload), newId=Number((res&&(res.id||res.curso_id||res.insert_id||(res.data&&res.data.id)))||0);
  const file=state.tempNewCourseImage||null;
  if(newId&&file){try{await uploadCursoImagen(newId,file); toast("Imagen subida","exito");}catch(err){gcLog(err); toast("Curso creado, pero falló la imagen","error");} finally{state.tempNewCourseImage=null;}}
  toast("Curso creado","exito"); closeDrawer(); await loadCursos();
  if(newId){const re=state.data.find(x=>x.id===newId); if(re) openDrawer("Curso · "+re.nombre,renderCursoDrawer({id:String(re.id)}));}
}
async function saveUpdateCurso(item){
  if(!item||!item._all) return toast("Sin item para actualizar","error");
  const payload=normalizeCursoPayload(readCursoForm(item.id));
  await postJSON(API.uCursos,payload); toast("Cambios guardados","exito"); await loadCursos();
  const re=state.data.find(x=>x.id===item.id); if(re) openDrawer("Curso · "+re.nombre,renderCursoDrawer({id:String(re.id)}));
}
async function softDeleteCurso(item){if(!item||!item._all) throw new Error("Item inválido"); const body=normalizeCursoPayload({...item._all,estatus:0}); await postJSON(API.uCursos,body);}
async function reactivateCurso(id){const it=state.data.find(x=>x.id===Number(id)); if(!it||!it._all) throw new Error("Curso no encontrado"); const body=normalizeCursoPayload({...it._all,estatus:1}); await postJSON(API.uCursos,body);}
async function openCreateCurso(){try{await Promise.all([getTutorsMap(),getPrioridadMap(),getCategoriasMap(),getCalendarioMap(),getTipoEvalMap(),getActividadesMap()]); state.currentDrawer={type:"curso",id:null,mode:"create"}; openDrawer("Curso · Crear",renderCursoDrawer({id:""}));}catch(e){gcLog(e); toast("No se pudo abrir el formulario","error");}}
function renderCursoDrawer(dataset){
  const item=state.data.find(x=>String(x.id)===dataset.id), mode=(state.currentDrawer&&state.currentDrawer.mode)||(item?"view":"create"), isCreate=mode==="create"||!item, isEdit=mode==="edit", isView=mode==="view"&&!!item, c=isCreate?getEmptyCourse():(item?item._all:null);
  if(!c) return "<p>No encontrado.</p>";
  const inText=(id,v,ph)=>`<input id="${id}" type="text" value="${escapeAttr(v||"")}" placeholder="${escapeAttr(ph||"")}" />`;
  const inNum =(id,v,min)=>`<input id="${id}" type="number" value="${escapeAttr(v!=null?v:"")}" min="${min||"0"}" />`;
  const inDate=(id,v)=>`<input id="${id}" type="date" value="${escapeAttr(v||"")}" />`;
  const inCheck=(id,val)=>`<label class="gc-inline"><input id="${id}" type="checkbox" ${Number(val)?"checked":""}/> <span>Sí</span></label>`;
  const inSel =(id,opts)=>`<select id="${id}">${opts}</select>`;
  const inTA  =(id,v,rows)=>`<textarea id="${id}" rows="${rows||4}">${escapeHTML(v||"")}</textarea>`;
  const tutorOptions=mapToOptions(state.tutorsMap,String(c.tutor||"")), prioOptions=mapToOptions(state.prioMap,String(c.prioridad||"")), catOptions=mapToOptions(state.categoriasMap,String(c.categoria||"")), calOptions=mapToOptions(state.calendarioMap,String(c.calendario||"")), tipoOptions=mapToOptions(state.tipoEvalMap,String(c.tipo_evaluacion||"")), actOptions=mapToOptions(state.actividadesMap,String(c.actividades||""));
  const field=(label,value,inputHTML)=>`<div class="field"><div class="label">${escapeHTML(label)}</div><div class="value">${(isEdit||isCreate)?inputHTML:escapeHTML(value!=null?value:"-")}</div></div>`;
  let controls="";
  if(isCreate){
    controls='<div class="gc-actions"><button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button><button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button></div>';
  }else if(isAdminUser){
    const isInactive=Number(c.estatus)===0;
    controls='<div class="gc-actions">'+(isView?'<button class="gc-btn" id="btn-edit">Editar</button>':"")+(isEdit?'<button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button>':"")+(isEdit?'<button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button>':"")+(isInactive?'<button class="gc-btn gc-btn--success" id="btn-reactivar">Reactivar</button>':'<button class="gc-btn gc-btn--danger" id="btn-delete" data-step="1">Eliminar</button>')+"</div>";
  }
  let html=""+controls+
    field("Nombre",c.nombre,inText("f_nombre",c.nombre,"Nombre del curso"))+
    field("Descripción breve",c.descripcion_breve,inTA("f_desc_breve",c.descripcion_breve,3))+
    field("Descripción media",c.descripcion_media,inTA("f_desc_media",c.descripcion_media,4))+
    field("Descripción del curso",c.descripcion_curso,inTA("f_desc_curso",c.descripcion_curso,6))+
    field("Dirigido a",c.dirigido,inTA("f_dirigido",c.dirigido,3))+
    field("Competencias",c.competencias,inTA("f_competencias",c.competencias,3))+
    '<div class="grid-3">'+
      field("Tutor",(state.tutorsMap&&state.tutorsMap[c.tutor])||c.tutor,inSel("f_tutor",tutorOptions))+
      field("Categoría",(state.categoriasMap&&state.categoriasMap[c.categoria])||c.categoria,inSel("f_categoria",catOptions))+
      field("Prioridad",(state.prioMap&&state.prioMap[c.prioridad])||c.prioridad,inSel("f_prioridad",prioOptions))+
    '</div>'+
    '<div class="grid-3">'+
      field("Tipo de evaluación",(state.tipoEvalMap&&state.tipoEvalMap[c.tipo_evaluacion])||c.tipo_evaluacion,inSel("f_tipo_eval",tipoOptions))+
      field("Actividades",(state.actividadesMap&&state.actividadesMap[c.actividades])||c.actividades,inSel("f_actividades",actOptions))+
      field("Calendario",(state.calendarioMap&&state.calendarioMap[c.calendario])||c.calendario,inSel("f_calendario",calOptions))+
    '</div>'+
    '<div class="grid-3">'+
      field("Horas",c.horas,inNum("f_horas",c.horas!=null?c.horas:0))+
      field("Precio",c.precio===0?"Gratuito":fmtMoney(c.precio),inNum("f_precio",c.precio!=null?c.precio:0))+
      field("Certificado",Number(c.certificado)?"Sí":"No",inCheck("f_certificado",c.certificado))+
    '</div>'+
    field("Fecha de inicio",c.fecha_inicio,inDate("f_fecha",c.fecha_inicio))+
    field("Estatus",statusText(c.estatus),statusSelect("f_estatus",c.estatus));
  if(isCreate){
    html+=`<div class="field"><div class="label">Imagen del curso</div><div class="value"><div id="create-media-curso" class="media-grid"><div class="media-card"><figure class="media-thumb"><img id="create-media-thumb" alt="Portada" src="${withBust("/ASSETS/cursos/img0.png")}" /><button class="icon-btn media-edit" id="create-media-edit" title="Seleccionar imagen"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.0 1.0 0 0 0 0-1.41l-2.34-2.34a1.0 1.0 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"></path></svg></button></figure><div class="media-meta"><div class="media-label">Portada</div><div class="media-help" style="color:#666;">JPG/PNG · Máx 2MB</div></div></div></div></div></div>`;
  }else{
    html+=`<div class="field"><div class="label">Imágenes existentes</div><div class="value"><div id="media-curso" data-id="${c.id||(item?item.id:"")}"></div></div></div>`;
  }
  if(isAdminUser) html+=jsonSection(c,"JSON · Curso","json-curso","btn-copy-json-curso");
  if(isCreate){qs("#drawer-title").textContent="Curso · Crear"; state.currentDrawer={type:"curso",id:null,mode:"create"};}
  else if(isEdit){qs("#drawer-title").textContent="Curso · "+(item?item.nombre:"")+" (edición)"; state.currentDrawer={type:"curso",id:item?item.id:null,mode:"edit"};}
  else{qs("#drawer-title").textContent="Curso · "+(item?item.nombre:""); state.currentDrawer={type:"curso",id:item?item.id:null,mode:"view"};}
  setTimeout(()=>{
    try{
      disableDrawerInputs(!(isEdit||isCreate));
      if(isCreate){
        const card=qs("#create-media-curso"), btn=qs("#create-media-edit"), thumb=qs("#create-media-thumb");
        if(btn&&thumb&&card){
          btn.addEventListener("click",()=>{
            const input=document.createElement("input"); input.type="file"; input.accept="image/png, image/jpeg"; input.style.display="none"; document.body.appendChild(input);
            input.addEventListener("change",()=>{
              const file=input.files&&input.files[0]; try{document.body.removeChild(input);}catch{}; if(!file) return;
              const v=validarImagen(file,{maxMB:2}); if(!v.ok){toast(v.error,"error"); return;}
              renderPreviewUI(card,file,async()=>{
                state.tempNewCourseImage=file; try{if(thumb.dataset&&thumb.dataset.blobUrl) URL.revokeObjectURL(thumb.dataset.blobUrl);}catch{}
                const blobUrl=URL.createObjectURL(file); if(thumb.dataset) thumb.dataset.blobUrl=blobUrl; thumb.src=blobUrl; toast("Imagen seleccionada (se subirá al guardar)","exito");
              },()=>{});
            });
            input.click();
          });
        }
      }
      qs("#btn-save")?.addEventListener("click",async(e)=>{e.stopPropagation(); try{if(isCreate) await saveNewCurso(); else await saveUpdateCurso(item);}catch(err){gcLog(err); toast("Error al guardar","error");}});
      qs("#btn-edit")?.addEventListener("click",(e)=>{e.stopPropagation(); state.currentDrawer={type:"curso",id:item?item.id:null,mode:"edit"}; qs("#drawer-body").innerHTML=renderCursoDrawer({id:String(item?item.id:"")});});
      qs("#btn-cancel")?.addEventListener("click",(e)=>{e.stopPropagation(); if(isCreate){state.tempNewCourseImage=null; closeDrawer();} else {state.currentDrawer={type:"curso",id:item?item.id:null,mode:"view"}; qs("#drawer-body").innerHTML=renderCursoDrawer({id:String(item?item.id:"")});}});
      const bDel=qs("#btn-delete");
      if(bDel) bDel.addEventListener("click",async(e)=>{
        e.stopPropagation(); const step=bDel.getAttribute("data-step")||"1";
        if(step==="1"){bDel.textContent="Confirmar"; bDel.setAttribute("data-step","2"); setTimeout(()=>{if(bDel.getAttribute("data-step")==="2"){bDel.textContent="Eliminar"; bDel.setAttribute("data-step","1");}},4000); return;}
        try{await softDeleteCurso(item); toast("Curso eliminado (inactivo)","exito"); closeDrawer(); await loadCursos();}catch(err){gcLog(err); toast("No se pudo eliminar","error");}
      });
      qs("#btn-reactivar")?.addEventListener("click",async(e)=>{
        e.stopPropagation();
        try{await reactivateCurso(Number(item&&item.id)); toast("Curso reactivado","exito"); await loadCursos(); const re=state.data.find(x=>x.id===(item&&item.id)); if(re) openDrawer("Curso · "+re.nombre,renderCursoDrawer({id:String(re.id)}));}
        catch(err){gcLog(err); toast("No se pudo reactivar","error");}
      });
      const contCurso=qs("#media-curso");
      if(contCurso){const cid=Number(c.id||(item?item.id:0)); if(!isNaN(cid)&&cid){mountReadOnlyMedia({container:contCurso,type:"curso",id:cid,labels:["Portada"],editable:isEdit&&isAdminUser});}}
      if(isAdminUser) bindCopyFromPre("#json-curso","#btn-copy-json-curso");
    }catch(err){gcLog("renderCursoDrawer bindings error:",err); toast("Ocurrió un error al preparar el formulario","error");}
  },0);
  return html;
}

/* ===== Noticias ===== */
const badgeNoticia=e=>statusBadge(e);
async function getCommentsCount(nid){
  const r=await postJSON(API.comentarios,{noticia_id:Number(nid),estatus:1}), arr=Array.isArray(r)?r:[]; let total=0;
  for(let i=0;i<arr.length;i++){const c=arr[i]; total+=1; if(c&&c.respuestas&&Array.isArray(c.respuestas)) total+=c.respuestas.length;}
  return total;
}
async function loadNoticias(){
  const title=qs("#mod-title"); if(title) title.textContent="Noticias";
  const hdr=qs(".recursos-box.desktop-only .table-header");
  if(hdr){
    const c1=hdr.querySelector(".col-nombre"),c2=hdr.querySelector(".col-tutor")||hdr.querySelector(".col-tipo"),c3=hdr.querySelector(".col-fecha"),c4=hdr.querySelector(".col-status");
    if(c1) c1.textContent="Título"; if(c2){c2.textContent="Comentarios"; c2.classList.add("col-tipo");} if(c3) c3.textContent="Fecha de publicación"; if(c4) c4.textContent="Status";
  }
  const tt=qs(".tt-title"); if(tt) tt.textContent="Noticias:";
  const st=qs("#tt-status"); if(st){st.textContent="Publicadas e Inactivas"; st.classList.remove("badge-inactivo"); st.classList.add("badge-activo");}
  showSkeletons();
  try{
    const [act,inact]=await Promise.all([postJSON(API.noticias,{estatus:1}),postJSON(API.noticias,{estatus:0})]);
    const arr=[].concat(Array.isArray(act)?act:[], Array.isArray(inact)?inact:[]);
    const counts=await Promise.all(arr.map(n=>getCommentsCount(n.id).catch(()=>0)));
    state.raw=arr; state.data=arr.map((n,i)=>({id:n.id,titulo:n.titulo,fecha:n.fecha_creacion,estatus:ntf(n.estatus),comentarios:counts[i]||0,_all:n}));
    drawNoticias();
  }catch(err){gcLog(err); const list=qs("#recursos-list"); if(list) list.innerHTML='<div style="padding:1rem;color:#b00020;">Error al cargar noticias</div>'; const m=qs("#recursos-list-mobile"); if(m) m.innerHTML=""; toast("No se pudieron cargar noticias","error");}
}
function drawNoticias(){
  const rows=state.data;
  renderList(rows,{
    matcher:(q)=>{const k=norm(q); return it=>norm(it.titulo).includes(k);},
    desktopRow:(it)=>`<div class="table-row" data-id="${it.id}" data-type="noticia"><div class="col-nombre"><span class="name-text">${escapeHTML(it.titulo)}</span></div><div class="col-tutor">${it.comentarios}</div><div class="col-fecha">${fmtDateTime(it.fecha)}</div><div class="col-status">${badgeNoticia(it.estatus)}</div></div>`,
    mobileRow:(it)=>`<div class="table-row-mobile" data-id="${it.id}" data-type="noticia"><button class="row-toggle"><div class="col-nombre">${escapeHTML(it.titulo)}</div><span class="icon-chevron">›</span></button><div class="row-details"><div><strong>Comentarios:</strong> ${it.comentarios}</div><div><strong>Publicada:</strong> ${fmtDateTime(it.fecha)}</div><div style="display:flex;gap:8px;margin:.25rem 0 .5rem;"><button class="gc-btn gc-btn--ghost open-drawer">Ver detalle</button>${Number(it.estatus)===0?`<button class="gc-btn gc-btn--success gc-reactivate" data-type="noticia" data-id="${it.id}">Reactivar</button>`:""}</div></div></div>`,
    drawerTitle:(d)=>{const item=state.data.find(x=>String(x.id)===d.id); return item?("Noticia · "+item.titulo):"Noticia";},
    drawerBody:(d)=>renderNoticiaDrawer(d),
    afterOpen:(d)=>{if(d.type==="noticia"){const nid=Number(d.id), cont=qs("#media-noticia"); if(cont) mountReadOnlyMedia({container:cont,type:"noticia",id:nid,labels:["Imagen 1","Imagen 2"],editable:isAdminUser&&(state.currentDrawer&&state.currentDrawer.mode==="edit")}); if(isAdminUser) bindCopyFromPre("#json-noticia","#btn-copy-json-noticia");}}
  });
}
async function inactivateNoticia(id){const it=state.data.find(x=>x.id===Number(id)); if(!it||!it._all) throw new Error("Noticia no encontrada"); const body={...it._all,estatus:0}; await postJSON(API.uNoticias,body);}
async function reactivateNoticia(id){const it=state.data.find(x=>x.id===Number(id)); if(!it||!it._all) throw new Error("Noticia no encontrada"); if(!API.uNoticias){toast("Falta endpoint u_noticia.php en backend","warning",3500); return false;} const body={...it._all,estatus:1}; await postJSON(API.uNoticias,body); return true;}
function readNoticiaForm(n){const g=id=>{const el=qs("#"+id); return el?el.value:"";}, gN=(id,def)=>Number(g(id)||def||0); return {id:n.id,titulo:g("f_tit"),desc_uno:g("f_desc1"),desc_dos:g("f_desc2"),estatus:gN("f_estatus",1),creado_por:n.creado_por};}
function renderNoticiaDrawer(dataset){
  const item=state.data.find(x=>String(x.id)===dataset.id), n=item&&item._all; if(!n) return "<p>No encontrado.</p>";
  const mode=(state.currentDrawer&&state.currentDrawer.type==="noticia"&&state.currentDrawer.id===n.id)?state.currentDrawer.mode:"view", isEdit=mode==="edit", isView=!isEdit, isInactive=Number(n.estatus)===0;
  const field=(label,val,input)=>`<div class="field"><div class="label">${escapeHTML(label)}</div><div class="value">${isEdit?input:escapeHTML(val!=null?val:"-")}</div></div>`;
  const controls=isAdminUser?('<div class="gc-actions">'+(isView?'<button class="gc-btn" id="btn-edit">Editar</button>':"")+(isEdit?'<button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button>':"")+(isEdit?'<button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button>':"")+(isInactive?'<button class="gc-btn gc-btn--success" id="btn-reactivar">Reactivar</button>':'<button class="gc-btn gc-btn--danger" id="btn-delete" data-step="1">Eliminar</button>')+"</div>"):"";
  let html=""+controls+
    field("Título",n.titulo,`<input id="f_tit" type="text" value="${escapeAttr(n.titulo||"")}"/>`)+
    field("Estatus",statusText(n.estatus),statusSelect("f_estatus",n.estatus))+
    field("Fecha publicación",fmtDateTime(n.fecha_creacion),fmtDateTime(n.fecha_creacion))+
    field("Descripción (1)",n.desc_uno,`<textarea id="f_desc1" rows="3">${escapeHTML(n.desc_uno||"")}</textarea>`)+
    field("Descripción (2)",n.desc_dos,`<textarea id="f_desc2" rows="3">${escapeHTML(n.desc_dos||"")}</textarea>`)+
    `<div class="field"><div class="label">Imágenes</div><div class="value"><div id="media-noticia" data-id="${n.id}"></div></div></div>`;
  if(isAdminUser) html+=jsonSection(n,"JSON · Noticia","json-noticia","btn-copy-json-noticia");
  if(isEdit){qs("#drawer-title").textContent="Noticia · "+(item?item.titulo:"")+" (edición)"; state.currentDrawer={type:"noticia",id:n.id,mode:"edit"};}
  else{qs("#drawer-title").textContent="Noticia · "+(item?item.titulo:""); state.currentDrawer={type:"noticia",id:n.id,mode:"view"};}
  setTimeout(()=>{
    try{
      const cont=qs("#media-noticia"); if(cont) mountReadOnlyMedia({container:cont,type:"noticia",id:n.id,labels:["Imagen 1","Imagen 2"],editable:isEdit&&isAdminUser});
      qs("#btn-edit")?.addEventListener("click",(e)=>{e.stopPropagation(); state.currentDrawer={type:"noticia",id:n.id,mode:"edit"}; qs("#drawer-body").innerHTML=renderNoticiaDrawer({id:String(n.id)});});
      qs("#btn-cancel")?.addEventListener("click",(e)=>{e.stopPropagation(); state.currentDrawer={type:"noticia",id:n.id,mode:"view"}; qs("#drawer-body").innerHTML=renderNoticiaDrawer({id:String(n.id)});});
      qs("#btn-save")?.addEventListener("click",async(e)=>{e.stopPropagation(); try{const payload={...n,...readNoticiaForm(n)}; await postJSON(API.uNoticias,payload); toast("Cambios guardados","exito"); state.currentDrawer={type:"noticia",id:n.id,mode:"view"}; await loadNoticias(); const re=state.data.find(x=>x.id===n.id); if(re) openDrawer("Noticia · "+re.titulo,renderNoticiaDrawer({id:String(re.id)}));}catch(err){gcLog(err); toast("Error al guardar","error");}});
      const bDel=qs("#btn-delete");
      if(bDel) bDel.addEventListener("click",async(e)=>{
        e.stopPropagation(); const step=bDel.getAttribute("data-step")||"1";
        if(step==="1"){bDel.textContent="Confirmar"; bDel.setAttribute("data-step","2"); setTimeout(()=>{if(bDel.getAttribute("data-step")==="2"){bDel.textContent="Eliminar"; bDel.setAttribute("data-step","1");}},4000); return;}
        try{await inactivateNoticia(n.id); toast("Noticia eliminada (inactiva)","exito"); closeDrawer(); await loadNoticias();}catch(err){gcLog(err); toast("No se pudo eliminar","error");}
      });
      qs("#btn-reactivar")?.addEventListener("click",async(e)=>{e.stopPropagation(); const ok=await reactivateNoticia(n.id); if(ok){toast("Noticia reactivada","exito"); await loadNoticias(); const re=state.data.find(x=>x.id===n.id); if(re) openDrawer("Noticia · "+re.titulo,renderNoticiaDrawer({id:String(re.id)}));}});
      disableDrawerInputs(!isEdit); if(isAdminUser) bindCopyFromPre("#json-noticia","#btn-copy-json-noticia");
    }catch(err){gcLog("renderNoticiaDrawer bindings error:",err);}
  },0);
  return html;
}
async function openCreateNoticia(){
  state.tempNewNewsImages={1:null,2:null}; state.currentDrawer={type:"noticia",id:null,mode:"create"};
  const field=(l,inp)=>`<div class="field"><div class="label">${escapeHTML(l)}</div><div class="value">${inp}</div></div>`;
  const estSel=statusSelect("f_estatus",1);
  const imgCard=pos=>`<div class="media-card"><figure class="media-thumb"><img id="create-news-thumb-${pos}" alt="Imagen ${pos}" src="${withBust(`/ASSETS/noticia/NoticiasImg/noticia_img${pos}_0.png`)}"/><button class="icon-btn media-edit" id="create-news-edit-${pos}" title="Seleccionar imagen"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.0 1.0 0 0 0 0-1.41l-2.34-2.34a1.0 1.0 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"></path></svg></button></figure><div class="media-meta"><div class="media-label">Imagen ${pos}</div><div class="media-help" style="color:#666;">JPG/PNG · Máx 2MB</div></div></div>`;
  const html='<div class="gc-actions"><button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button><button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button></div>'+
    field("Título",`<input id="f_tit" type="text" placeholder="Título de la noticia"/>`)+
    field("Descripción (1)",`<textarea id="f_desc1" rows="3" placeholder="Texto principal"></textarea>`)+
    field("Descripción (2)",`<textarea id="f_desc2" rows="3" placeholder="Texto adicional"></textarea>`)+
    field("Estatus",estSel)+
    `<div class="field"><div class="label">Imágenes</div><div class="value"><div id="create-media-noticia" class="media-grid">${imgCard(1)}${imgCard(2)}</div></div></div>`;
  openDrawer("Noticia · Crear",html);
  setTimeout(()=>{
    const pick=(pos)=>{
      const btn=qs(`#create-news-edit-${pos}`), img=qs(`#create-news-thumb-${pos}`), wrap=qs("#create-media-noticia");
      if(btn&&img&&wrap){
        btn.addEventListener("click",()=>{
          const input=document.createElement("input"); input.type="file"; input.accept="image/png, image/jpeg"; input.style.display="none"; document.body.appendChild(input);
          input.addEventListener("change",()=>{
            const file=input.files&&input.files[0]; try{document.body.removeChild(input);}catch{}; if(!file) return;
            const v=validarImagen(file,{maxMB:2}); if(!v.ok){toast(v.error,"error"); return;}
            renderPreviewUI(wrap,file,async()=>{state.tempNewNewsImages[pos]=file; try{if(img.dataset&&img.dataset.blobUrl) URL.revokeObjectURL(img.dataset.blobUrl);}catch{} const blobUrl=URL.createObjectURL(file); if(img.dataset) img.dataset.blobUrl=blobUrl; img.src=blobUrl; toast(`Imagen ${pos} lista (se subirá al guardar)`,"exito");},()=>{});
          });
          input.click();
        });
      }
    };
    pick(1); pick(2);
    qs("#btn-cancel")?.addEventListener("click",()=>{state.tempNewNewsImages={1:null,2:null}; closeDrawer();});
    qs("#btn-save")?.addEventListener("click",async()=>{
      try{
        if(!API.iNoticias){toast("Falta endpoint i_noticia.php en backend","warning"); return;}
        const payload={titulo:(qs("#f_tit")?.value||"").trim(),desc_uno:(qs("#f_desc1")?.value||"").trim(),desc_dos:(qs("#f_desc2")?.value||"").trim(),estatus:ntf(qs("#f_estatus")?.value||1),creado_por:Number((currentUser&&currentUser.id)||0)||1};
        if(!payload.titulo) return toast("Falta el título","warning");
        const res=await postJSON(API.iNoticias,payload), newId=Number((res&&(res.id||res.noticia_id||res.insert_id||(res.data&&res.data.id)))||0);
        for(const pos of [1,2]){const f=state.tempNewNewsImages[pos]; if(newId&&f){try{const fd=new FormData(); fd.append("noticia_id",String(newId)); fd.append("pos",String(pos)); fd.append("imagen",f); await fetch(API_UPLOAD.noticiaImg,{method:"POST",body:fd});}catch(e){gcLog(e); toast(`Noticia creada, pero falló imagen ${pos}`,"error");}}}
        state.tempNewNewsImages={1:null,2:null}; toast("Noticia creada","exito"); closeDrawer(); await loadNoticias();
        if(newId){const re=state.data.find(x=>x.id===newId); if(re) openDrawer("Noticia · "+re.titulo,renderNoticiaDrawer({id:String(re.id)}));}
      }catch(err){gcLog(err); toast("Error al crear noticia","error");}
    });
  },0);
}

/* ===== Tutores ===== */
async function loadTutores(){
  const title=qs("#mod-title"); if(title) title.textContent="Tutores";
  const hdr=qs(".recursos-box.desktop-only .table-header");
  if(hdr){
    const c1=hdr.querySelector(".col-nombre"),c2=hdr.querySelector(".col-tutor")||hdr.querySelector(".col-tipo"),c3=hdr.querySelector(".col-fecha"),c4=hdr.querySelector(".col-status");
    if(c1) c1.textContent="Nombre"; if(c2){c2.textContent="Descripción"; c2.classList.add("col-tipo");} if(c3) c3.textContent=""; if(c4) c4.textContent="Status";
  }
  const tt=qs(".tt-title"); if(tt) tt.textContent="Tutores:";
  const st=qs("#tt-status"); if(st){st.textContent="Activos e Inactivos"; st.classList.remove("badge-inactivo"); st.classList.add("badge-activo");}
  showSkeletons();
  try{
    const [act,inact]=await Promise.all([postJSON(API.tutores,{estatus:1}),postJSON(API.tutores,{estatus:0})]);
    const raw=[].concat(Array.isArray(act)?act:[], Array.isArray(inact)?inact:[]);
    state.raw=raw; state.data=raw.map(t=>({id:t.id,nombre:t.nombre,descripcion:t.descripcion,estatus:ntf(t.estatus),_all:t}));
    drawTutores();
  }catch(err){gcLog(err); const list=qs("#recursos-list"); if(list) list.innerHTML='<div style="padding:1rem;color:#b00020;">Error al cargar tutores</div>'; const m=qs("#recursos-list-mobile"); if(m) m.innerHTML=""; toast("No se pudieron cargar tutores","error");}
}
function drawTutores(){
  const rows=state.data;
  renderList(rows,{
    matcher:(q)=>{const k=norm(q); return it=>norm(it.nombre).includes(k)||norm(it.descripcion||"").includes(k);},
    desktopRow:(it)=>`<div class="table-row" data-id="${it.id}" data-type="tutor"><div class="col-nombre"><span class="name-text">${escapeHTML(it.nombre)}</span></div><div class="col-tutor" title="${escapeAttr(it.descripcion||"")}">${escapeHTML((it.descripcion||"").slice(0,60))}${(it.descripcion||"").length>60?"…":""}</div><div class="col-fecha"></div><div class="col-status">${statusBadge(it.estatus)}</div></div>`,
    mobileRow:(it)=>`<div class="table-row-mobile" data-id="${it.id}" data-type="tutor"><button class="row-toggle"><div class="col-nombre">${escapeHTML(it.nombre)}</div><span class="icon-chevron">›</span></button><div class="row-details"><div><strong>Estatus:</strong> ${statusText(it.estatus)}</div><div style="display:flex;gap:8px;margin:.25rem 0 .5rem;"><button class="gc-btn gc-btn--ghost open-drawer">Ver detalle</button>${Number(it.estatus)===0?`<button class="gc-btn gc-btn--success gc-reactivate" data-type="tutor" data-id="${it.id}">Reactivar</button>`:""}</div></div></div>`,
    drawerTitle:(d)=>{const item=state.data.find(x=>String(x.id)===d.id); return item?("Tutor · "+item.nombre):"Tutor";},
    drawerBody:(d)=>renderTutorDrawer(d),
    afterOpen:(d)=>{if(d.type==="tutor"){const it=state.data.find(x=>String(x.id)===d.id); if(!it) return; const cont=qs("#media-tutor"); if(cont) mountReadOnlyMedia({container:cont,type:"tutor",id:it.id,labels:["Foto"],editable:isAdminUser&&(state.currentDrawer&&state.currentDrawer.mode==="edit")}); if(isAdminUser) bindCopyFromPre("#json-tutor","#btn-copy-json-tutor");}}
  });
}
function readTutorForm(existing){const g=id=>{const el=qs("#"+id); return el?el.value:"";}, gN=(id,def)=>Number(g(id)||def||0); const p={nombre:g("f_nombre"),descripcion:g("f_desc"),estatus:gN("f_estatus",1)}; if(existing&&existing.id) p.id=existing.id; return p;}
async function saveTutorCreate(){const p=readTutorForm(null); if(!p.nombre) return toast("Falta el nombre","warning"); const body={...p,creado_por:Number((currentUser&&currentUser.id)||0)||1}; await postJSON(API.iTutores,body); toast("Tutor creado","exito"); closeDrawer(); await loadTutores();}
async function saveTutorUpdate(item){if(!item||!item._all) return toast("Sin item para actualizar","error"); const p=readTutorForm(item._all), body={...item._all,...p}; await postJSON(API.uTutores,body); toast("Cambios guardados","exito"); await loadTutores(); const re=state.data.find(x=>x.id===item.id); if(re) openDrawer("Tutor · "+re.nombre,renderTutorDrawer({id:String(re.id)}));}
async function softDeleteTutor(item){if(!item||!item._all) throw new Error("Item inválido"); const body={...item._all,estatus:0}; await postJSON(API.uTutores,body);}
async function reactivateTutor(id){const it=state.data.find(x=>x.id===Number(id)); if(!it||!it._all) throw new Error("Tutor no encontrado"); const body={...it._all,estatus:1}; await postJSON(API.uTutores,body);}
async function openCreateTutor(){state.currentDrawer={type:"tutor",id:null,mode:"create"}; openDrawer("Tutor · Crear",renderTutorDrawer({id:""}));}
function renderTutorDrawer(dataset){
  const item=state.data.find(x=>String(x.id)===dataset.id), mode=(state.currentDrawer&&state.currentDrawer.mode)||(item?"view":"create"), isCreate=mode==="create"||!item, isEdit=mode==="edit", isView=mode==="view"&&!!item, t=isCreate?{id:null,nombre:"",descripcion:"",estatus:1,creado_por:Number((currentUser&&currentUser.id)||0)||1}:(item?item._all:null);
  if(!t) return "<p>No encontrado.</p>";
  const field=(label,val,input)=>`<div class="field"><div class="label">${escapeHTML(label)}</div><div class="value">${(isEdit||isCreate)?input:escapeHTML(val!=null?val:"-")}</div></div>`;
  let controls="";
  if(isCreate){
    controls='<div class="gc-actions"><button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button><button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button></div>';
  }else if(isAdminUser){
    const isInactive=Number(t.estatus)===0;
    controls='<div class="gc-actions">'+(isView?'<button class="gc-btn" id="btn-edit">Editar</button>':"")+(isEdit?'<button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button>':"")+(isEdit?'<button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button>':"")+(isInactive?'<button class="gc-btn gc-btn--success" id="btn-reactivar">Reactivar</button>':'<button class="gc-btn gc-btn--danger" id="btn-delete" data-step="1">Eliminar</button>')+"</div>";
  }
  let html=""+controls+
    field("Nombre",t.nombre,`<input id="f_nombre" type="text" value="${escapeAttr(t.nombre||"")}" placeholder="Nombre del tutor"/>`)+
    field("Descripción",t.descripcion,`<textarea id="f_desc" rows="4" placeholder="Descripción del perfil">${escapeHTML(t.descripcion||"")}</textarea>`)+
    field("Estatus",statusText(t.estatus),statusSelect("f_estatus",t.estatus));
  if(!isCreate){html+=`<div class="field"><div class="label">Imagen</div><div class="value"><div id="media-tutor" data-id="${t.id}"></div></div></div>`;}
  if(isAdminUser) html+=jsonSection(t,"JSON · Tutor","json-tutor","btn-copy-json-tutor");
  if(isCreate){qs("#drawer-title").textContent="Tutor · Crear"; state.currentDrawer={type:"tutor",id:null,mode:"create"};}
  else if(isEdit){qs("#drawer-title").textContent="Tutor · "+(item?item.nombre:"")+" (edición)"; state.currentDrawer={type:"tutor",id:item?item.id:null,mode:"edit"};}
  else{qs("#drawer-title").textContent="Tutor · "+(item?item.nombre:""); state.currentDrawer={type:"tutor",id:item?item.id:null,mode:"view"};}
  setTimeout(()=>{
    try{
      disableDrawerInputs(!(isEdit||isCreate));
      qs("#btn-save")?.addEventListener("click",async(e)=>{e.stopPropagation(); try{if(isCreate) await saveTutorCreate(); else await saveTutorUpdate(item);}catch(err){gcLog(err); toast("Error al guardar","error");}});
      qs("#btn-edit")?.addEventListener("click",(e)=>{e.stopPropagation(); state.currentDrawer={type:"tutor",id:item?item.id:null,mode:"edit"}; qs("#drawer-body").innerHTML=renderTutorDrawer({id:String(item?item.id:"")});});
      qs("#btn-cancel")?.addEventListener("click",(e)=>{e.stopPropagation(); if(isCreate){closeDrawer();} else {state.currentDrawer={type:"tutor",id:item?item.id:null,mode:"view"}; qs("#drawer-body").innerHTML=renderTutorDrawer({id:String(item?item.id:"")});}});
      const bDel=qs("#btn-delete");
      if(bDel) bDel.addEventListener("click",async(e)=>{e.stopPropagation(); const step=bDel.getAttribute("data-step")||"1"; if(step==="1"){bDel.textContent="Confirmar"; bDel.setAttribute("data-step","2"); setTimeout(()=>{if(bDel.getAttribute("data-step")==="2"){bDel.textContent="Eliminar"; bDel.setAttribute("data-step","1");}},4000); return;} try{await softDeleteTutor(item); toast("Tutor eliminado (inactivo)","exito"); closeDrawer(); await loadTutores();}catch(err){gcLog(err); toast("No se pudo eliminar","error");}});
      qs("#btn-reactivar")?.addEventListener("click",async(e)=>{e.stopPropagation(); try{await reactivateTutor(Number(item&&item.id)); toast("Tutor reactivado","exito"); await loadTutores(); const re=state.data.find(x=>x.id===(item&&item.id)); if(re) openDrawer("Tutor · "+re.nombre,renderTutorDrawer({id:String(re.id)}));}catch(err){gcLog(err); toast("No se pudo reactivar","error");}});
      const cont=qs("#media-tutor"); if(cont&&t.id) mountReadOnlyMedia({container:cont,type:"tutor",id:t.id,labels:["Foto"],editable:isEdit&&isAdminUser});
      if(isAdminUser) bindCopyFromPre("#json-tutor","#btn-copy-json-tutor");
    }catch(err){gcLog("renderTutorDrawer bindings error:",err);}
  },0);
  return html;
}

/* ===== Usuarios ===== */
const isEmail=s=>/\S+@\S+\.\S+/.test(String(s||"").trim()), digits=s=>String(s||"").replace(/\D/g,"");
async function loadUsuarios(){
  const title=qs("#mod-title"); if(title) title.textContent="Usuarios";
  const hdr=qs(".recursos-box.desktop-only .table-header");
  if(hdr){
    const c1=hdr.querySelector(".col-nombre"),c2=hdr.querySelector(".col-tutor")||hdr.querySelector(".col-tipo"),c3=hdr.querySelector(".col-fecha"),c4=hdr.querySelector(".col-status");
    if(c1) c1.textContent="Nombre"; if(c2){c2.textContent="Correo"; c2.classList.add("col-tipo");} if(c3) c3.textContent="Teléfono"; if(c4) c4.textContent="Status";
  }
  const tt=qs(".tt-title"); if(tt) tt.textContent="Usuarios:";
  const st=qs("#tt-status"); if(st){st.textContent="Buscar por correo o teléfono"; st.classList.remove("badge-inactivo"); st.classList.add("badge-activo");}
  const s=qs("#search-input"); if(s) s.placeholder="Buscar por correo o teléfono";
  state.data=[]; state.raw=[]; drawUsuarios();
}
let _usersLastQ="";
async function fetchUsuariosBySearch(q){
  const body=isEmail(q)?{correo:q.trim()}:{telefono:digits(q)};
  const r=await postJSON(API.usuarios,body), arr=Array.isArray(r)?r:[]; state.raw=arr;
  state.data=arr.map(u=>({id:u.id,nombre:u.nombre,correo:u.correo,telefono:u.telefono,estatus:Number(u.estatus),_all:u}));
}
function drawUsuarios(){
  const q=(state.search||"").trim(), d=qs("#recursos-list"), m=qs("#recursos-list-mobile");
  if(!q||(!isEmail(q)&&digits(q).length<7)){
    const msg='<div class="empty-state" style="padding:1rem;">Escribe un <b>correo</b> o al menos <b>7 dígitos</b> del teléfono para buscar.</div>';
    if(d) d.innerHTML=msg; if(m) m.innerHTML=msg; const c=qs("#mod-count"); if(c) c.textContent="0 resultados"; renderPagination(0); return;
  }
  if(q!==_usersLastQ){_usersLastQ=q; showSkeletons(); fetchUsuariosBySearch(q).then(()=>renderUsuariosList()).catch(err=>{gcLog(err); toast("No se pudo consultar usuarios","error"); renderUsuariosList();});}
  else renderUsuariosList();
}
function renderUsuariosList(){
  const rows=state.data;
  renderList(rows,{
    matcher:(q)=>{const k=norm(q); return it=>norm(it.nombre).includes(k)||norm(it.correo||"").includes(k)||norm(it.telefono||"").includes(k);},
    desktopRow:it=>`<div class="table-row" data-id="${it.id}" data-type="usuario"><div class="col-nombre"><span class="name-text">${escapeHTML(it.nombre||"-")}</span></div><div class="col-tutor">${escapeHTML(it.correo||"-")}</div><div class="col-fecha">${escapeHTML(it.telefono||"-")}</div><div class="col-status">${statusBadge(it.estatus)}</div></div>`,
    mobileRow:it=>`<div class="table-row-mobile" data-id="${it.id}" data-type="usuario"><button class="row-toggle"><div class="col-nombre">${escapeHTML(it.nombre||"-")}</div><span class="icon-chevron">›</span></button><div class="row-details"><div><strong>Correo:</strong> ${escapeHTML(it.correo||"-")}</div><div><strong>Teléfono:</strong> ${escapeHTML(it.telefono||"-")}</div><div><strong>Status:</strong> ${statusText(it.estatus)}</div><div style="display:flex; gap:8px; margin:.25rem 0 .5rem;"><button class="gc-btn gc-btn--ghost open-drawer">Ver detalle</button>${Number(it.estatus)===0?`<button class="gc-btn gc-btn--success gc-reactivate" data-type="usuario" data-id="${it.id}">Reactivar</button>`:""}</div></div></div>`,
    drawerTitle:(d)=>{const it=state.data.find(x=>String(x.id)===d.id); return it?("Usuario · "+(it.nombre||it.correo||("#"+it.id))):"Usuario";},
    drawerBody:(d)=>renderUsuarioDrawer(d),
    afterOpen:()=>{}
  });
  // Reactivar desde lista (usuario)
  qsa(".gc-reactivate").forEach(btn=>{
    btn.addEventListener("click",async(e)=>{
      e.stopPropagation();
      const id=Number(btn.getAttribute("data-id"));
      try{
        const it=state.data.find(x=>x.id===id);
        if(!it||!API.uUsuarios) return toast("Endpoint u_usuario no disponible","warning");
        await postJSON(API.uUsuarios,{...it._all,estatus:1});
        toast("Usuario reactivado","exito"); _usersLastQ=""; drawUsuarios();
      }catch(err){gcLog(err); toast("No se pudo reactivar","error");}
    });
  });
}
function readUsuarioForm(existing){const v=id=>(qs("#"+id)?.value||""), n=id=>Number(v(id)||0), p={nombre:v("u_nombre"),correo:v("u_correo"),telefono:v("u_telefono"),fecha_nacimiento:v("u_fnac"),tipo_contacto:n("u_tcontacto"),estatus:n("u_estatus")}; if(existing&&existing.id) p.id=existing.id; return p;}
async function saveUsuarioUpdate(item){
  if(!item||!item._all) return toast("Sin item para actualizar","error");
  if(!API.uUsuarios) return toast("Endpoint u_usuario no disponible","warning");
  const p=readUsuarioForm(item._all); await postJSON(API.uUsuarios,{...item._all,...p}); toast("Cambios guardados","exito"); _usersLastQ=""; drawUsuarios();
}
async function saveUsuarioCreate(){
  if(!API.iUsuarios) return toast("Endpoint i_usuario no disponible","warning");
  const p=readUsuarioForm(null); if(!p.nombre||!p.correo||!p.telefono) return toast("Nombre, correo y teléfono son obligatorios","warning");
  await postJSON(API.iUsuarios,p); toast("Usuario creado","exito"); closeDrawer(); _usersLastQ=""; drawUsuarios();
}
async function softDeleteUsuario(item){if(!item||!item._all) return; if(!API.uUsuarios) return toast("Endpoint u_usuario no disponible","warning"); await postJSON(API.uUsuarios,{...item._all,estatus:0});}
function renderUsuarioDrawer(dataset){
  const it=state.data.find(x=>String(x.id)===dataset.id), n=it&&it._all, mode=(state.currentDrawer&&state.currentDrawer.type==="usuario"&&state.currentDrawer.id===(n?.id))?state.currentDrawer.mode:"view", isEdit=mode==="edit", isView=!isEdit;
  if(!n) return "<p>No encontrado.</p>";
  const field=(label,val,input)=>`<div class="field"><div class="label">${escapeHTML(label)}</div><div class="value">${isEdit?input:escapeHTML(val!=null?val:"-")}</div></div>`;
  const controls=isAdminUser?('<div class="gc-actions">'+(isView?'<button class="gc-btn" id="btn-edit">Editar</button>':"")+(isEdit?'<button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button>':"")+(isEdit?'<button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button>':"")+(Number(n.estatus)===0?'<button class="gc-btn gc-btn--success" id="btn-reactivar">Reactivar</button>':'<button class="gc-btn gc-btn--danger" id="btn-delete" data-step="1">Eliminar</button>')+"</div>"):"";
  let html=controls+
    field("Nombre",n.nombre,`<input id="u_nombre" type="text" value="${escapeAttr(n.nombre||"")}">`)+
    field("Correo",n.correo,`<input id="u_correo" type="email" value="${escapeAttr(n.correo||"")}">`)+
    field("Teléfono",n.telefono,`<input id="u_telefono" type="tel" value="${escapeAttr(n.telefono||"")}">`)+
    field("Fecha nacimiento",n.fecha_nacimiento||"",`<input id="u_fnac" type="date" value="${escapeAttr(n.fecha_nacimiento||"")}">`)+
    field("Tipo contacto",n.tipo_contacto,`<input id="u_tcontacto" type="number" min="0" value="${escapeAttr(n.tipo_contacto||"0")}">`)+
    field("Estatus",statusText(n.estatus),statusSelect("u_estatus",n.estatus));
  if(isEdit){qs("#drawer-title").textContent="Usuario · "+(it?it.nombre:"")+" (edición)"; state.currentDrawer={type:"usuario",id:n.id,mode:"edit"};}
  else{qs("#drawer-title").textContent="Usuario · "+(it?it.nombre:""); state.currentDrawer={type:"usuario",id:n.id,mode:"view"};}
  setTimeout(()=>{
    try{
      disableDrawerInputs(!isEdit);
      qs("#btn-edit")?.addEventListener("click",(e)=>{e.stopPropagation(); state.currentDrawer={type:"usuario",id:n.id,mode:"edit"}; qs("#drawer-body").innerHTML=renderUsuarioDrawer({id:String(n.id)});});
      qs("#btn-cancel")?.addEventListener("click",(e)=>{e.stopPropagation(); state.currentDrawer={type:"usuario",id:n.id,mode:"view"}; qs("#drawer-body").innerHTML=renderUsuarioDrawer({id:String(n.id)});});
      qs("#btn-save")?.addEventListener("click",async(e)=>{e.stopPropagation(); await saveUsuarioUpdate(it);});
      const bDel=qs("#btn-delete");
      if(bDel) bDel.addEventListener("click",async(e)=>{e.stopPropagation(); const step=bDel.getAttribute("data-step")||"1"; if(step==="1"){bDel.textContent="Confirmar"; bDel.setAttribute("data-step","2"); setTimeout(()=>{if(bDel.getAttribute("data-step")==="2"){bDel.textContent="Eliminar"; bDel.setAttribute("data-step","1");}},4000); return;} await softDeleteUsuario(it); toast("Usuario inactivado","exito"); closeDrawer(); _usersLastQ=""; drawUsuarios();});
      qs("#btn-reactivar")?.addEventListener("click",async(e)=>{e.stopPropagation(); await postJSON(API.uUsuarios,{...n,estatus:1}); toast("Usuario reactivado","exito"); closeDrawer(); _usersLastQ=""; drawUsuarios();});
    }catch(err){gcLog("renderUsuarioDrawer error:",err);}
  },0);
  return html;
}
async function openCreateUsuario(){
  state.currentDrawer={type:"usuario",id:null,mode:"create"};
  const html='<div class="gc-actions"><button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button><button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button></div>'+
    '<div class="field"><div class="label">Nombre</div><div class="value"><input id="u_nombre" type="text" placeholder="Nombre completo"></div></div>'+
    '<div class="field"><div class="label">Correo</div><div class="value"><input id="u_correo" type="email" placeholder="correo@dominio.com"></div></div>'+
    '<div class="field"><div class="label">Teléfono</div><div class="value"><input id="u_telefono" type="tel" placeholder="555..."></div></div>'+
    '<div class="field"><div class="label">Fecha nacimiento</div><div class="value"><input id="u_fnac" type="date"></div></div>'+
    '<div class="field"><div class="label">Tipo contacto</div><div class="value"><input id="u_tcontacto" type="number" min="0" value="0"></div></div>'+
    '<div class="field"><div class="label">Estatus</div><div class="value">'+statusSelect("u_estatus",1)+'</div></div>';
  openDrawer("Usuario · Crear",html);
  setTimeout(()=>{qs("#btn-cancel")?.addEventListener("click",closeDrawer); qs("#btn-save")?.addEventListener("click",async()=>{try{await saveUsuarioCreate();}catch(e){gcLog(e); toast("Error al crear usuario","error");}}); disableDrawerInputs(false);},0);
}

/* ===== Cuenta (placeholder enriquecido) ===== */
function showCuentaPanel(){
  try{const el=qs(".recursos-box.desktop-only"); if(el&&el.style) el.style.display="none";}catch{}
  try{const el=qs(".recursos-box.mobile-only"); if(el&&el.style) el.style.display="none";}catch{}
  try{const p=qs("#pagination-controls"); if(p&&p.style) p.style.display="none";}catch{}
  try{const p=qs("#pagination-mobile"); if(p&&p.style) p.style.display="none";}catch{}
  if(!qs("#cuenta-panel")){
    const host=qs(".main-content")||document.body, panel=document.createElement("div");
    panel.id="cuenta-panel"; panel.style.padding="16px 18px";
    panel.innerHTML=(window.renderCuentaOpciones?window.renderCuentaOpciones():`
      <div class="gc-card-grid" style="margin:12px 0 20px;">
        <div class="gc-card">
          <img src="/ASSETS/admin/cuentaMenu/borrarCuenta.png" alt="" width="28" height="28">
          <div><div class="gc-card-title">Borrar cuenta</div><div class="gc-muted">Elimina tu cuenta y datos de forma permanente.</div></div>
          <button id="btn-delete-account" class="gc-btn gc-btn--danger gc-card-cta">Eliminar cuenta</button>
        </div>
        <div class="gc-card">
          <img src="/ASSETS/admin/cuentaMenu/opcionesPrivacidad.png" alt="" width="28" height="28">
          <div><div class="gc-card-title">Privacidad / Visibilidad</div><div class="gc-muted">Configura quién puede ver tu perfil.</div></div>
          <button id="btn-privacy" class="gc-btn gc-btn--primary gc-card-cta">Abrir</button>
        </div>
        <div class="gc-card">
          <img src="/ASSETS/admin/cuentaMenu/notificaciones.png" alt="" width="28" height="28">
          <div><div class="gc-card-title">Notificaciones</div><div class="gc-muted">Gestiona alertas dentro de la app y correo.</div></div>
          <button id="btn-notifications" class="gc-btn gc-btn--primary gc-card-cta">Abrir</button>
        </div>
      </div>`);
    host.appendChild(panel);
    const safeOpen=(fn)=>{const f=window[fn]; if(typeof f==="function") f(); else toast("Modal no disponible aún","warning");};
    qs("#btn-delete-account")?.addEventListener("click",()=>safeOpen("openModalDeleteAccount"));
    qs("#btn-privacy")?.addEventListener("click",()=>safeOpen("openModalPrivacy"));
    qs("#btn-notifications")?.addEventListener("click",()=>safeOpen("openModalNotifications"));
  }
}
function hideCuentaPanel(){
  const p=qs("#cuenta-panel"); if(p) p.remove();
  const d=qs(".recursos-box.desktop-only"); if(d) d.style.display="block";
  const m=qs(".recursos-box.mobile-only"); if(m) m.style.display="block";
  const pg=qs("#pagination-controls"); if(pg) pg.style.display="";
  const pgm=qs("#pagination-mobile"); if(pgm) pgm.style.display="";
}

/* ===== Init ===== */
document.addEventListener("DOMContentLoaded",async()=>{
  currentUser=getUsuarioFromCookie();
  isAdminUser=ADMIN_IDS.includes(Number((currentUser&&currentUser.id)||0));
  applyAdminVisibility(isAdminUser);
  bindUI();
  try{
    await Promise.all([
      getTutorsMap().catch(()=>{}), getPrioridadMap().catch(()=>{}), getCategoriasMap().catch(()=>{}),
      getCalendarioMap().catch(()=>{}), getTipoEvalMap().catch(()=>{}), getActividadesMap().catch(()=>{})
    ]);
  }catch(e){gcLog("catálogos init error",e);}
  if(!window.location.hash) window.location.hash=isAdminUser?"#/cursos":"#/cuentas";
  onRouteChange();
});
})();
