(()=>{"use strict";
/* utils/base */
const GC_DEBUG=false,gcLog=(...a)=>{if(GC_DEBUG&&typeof console!=="undefined"){try{console.log("[GC]",...a)}catch{}}};
const qs=(s,r=document)=>r.querySelector(s),qsa=(s,r=document)=>Array.prototype.slice.call(r.querySelectorAll(s));
const toast=(m,t="exito",d=2500)=>window.gcToast?window.gcToast(m,t,d):gcLog(`[${t}] ${m}`);
const ntf=v=>Number(v||0),norm=s=>String(s||"").normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().trim();
document.documentElement.style.setProperty("--vh",`${window.innerHeight*0.01}px`);window.addEventListener("resize",()=>document.documentElement.style.setProperty("--vh",`${window.innerHeight*0.01}px`));
/* endpoints */
const API_BASE="https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
const API={
  cursos:API_BASE+"c_cursos.php",iCursos:API_BASE+"i_cursos.php",uCursos:API_BASE+"u_cursos.php",
  noticias:API_BASE+"c_noticia.php",iNoticias:API_BASE+"i_noticia.php",uNoticias:API_BASE+"u_noticia.php",
  comentarios:API_BASE+"c_comentario_noticia.php",
  tutores:API_BASE+"c_tutor.php",iTutores:API_BASE+"i_tutor.php",uTutores:API_BASE+"u_tutor.php",
  prioridad:API_BASE+"c_prioridad.php",categorias:API_BASE+"c_categorias.php",
  calendario:API_BASE+"c_dias_curso.php",tipoEval:API_BASE+"c_tipo_evaluacion.php",actividades:API_BASE+"c_actividades.php",
  usuarios:API_BASE+"c_usuarios.php",iUsuarios:API_BASE+"i_usuario.php",uUsuarios:API_BASE+"u_usuario.php",
  uAvatar:API_BASE+"u_avatar.php",
  inscripciones:API_BASE+"c_suscripciones.php",iInscripcion:API_BASE+"i_inscripcion.php",uInscripcion:API_BASE+"u_inscripcion.php"
};
const API_UPLOAD={cursoImg:API_BASE+"u_cursoImg.php",noticiaImg:API_BASE+"u_noticiaImagenes.php",tutorImg:API_BASE+"u_tutorImg.php"};
/* roles/estatus & state */
const ADMIN_IDS=[1,12,13];/* ids de administradores */
const STATUS_OPTIONS=[{v:1,l:"Activo"},{v:0,l:"Inactivo"},{v:2,l:"Pausado"},{v:3,l:"Terminado"}];
const state={route:"#/cursos",page:1,pageSize:10,data:[],raw:[],search:"",currentDrawer:null,tempNewCourseImage:null,tempNewNewsImages:{1:null,2:null},tempNewUserAvatar:null,tempNewTutorImage:null,tutorsMap:null,prioMap:null,categoriasMap:null,calendarioMap:null,tipoEvalMap:null,actividadesMap:null,cursosMap:null,usuariosMap:null};
const cacheGuard=o=>o&&(Date.now()-o._ts<30*60*1e3);
const arrToMap=arr=>{const m={};(Array.isArray(arr)?arr:[]).forEach(x=>m[x.id]=x.nombre||x.titulo||(`#${x.id}`));m._ts=Date.now();return m;};
let currentUser=getUsuarioFromCookie();let isAdminUser=ADMIN_IDS.includes(Number((currentUser&&currentUser.id)||0));
function getUsuarioFromCookie(){const row=(document.cookie||"").split("; ").find(r=>r.indexOf("usuario=")===0);if(!row)return null;try{const raw=row.split("=")[1]||"",once=decodeURIComponent(raw);const maybe=/\%7B|\%22/.test(once)?decodeURIComponent(once):once;return JSON.parse(maybe)}catch(e){gcLog("cookie parse fail",e);return null}}
async function postJSON(url,body){gcLog("postJSON ->",url,body);const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body||{})});const t=await r.text().catch(()=> "");gcLog("postJSON <-",url,r.status,t);if(!r.ok)throw new Error("HTTP "+r.status+" "+(t||""));if(!t.trim())return {};try{return JSON.parse(t)}catch{return{_raw:t}}}
/* catálogos */
const getTutorsMap=async()=>{if(cacheGuard(state.tutorsMap))return state.tutorsMap;const a=await postJSON(API.tutores,{estatus:1});return state.tutorsMap=arrToMap(a)};
const getPrioridadMap=async()=>{if(cacheGuard(state.prioMap))return state.prioMap;const a=await postJSON(API.prioridad,{estatus:1});return state.prioMap=arrToMap(a)};
const getCategoriasMap=async()=>{if(cacheGuard(state.categoriasMap))return state.categoriasMap;const a=await postJSON(API.categorias,{estatus:1});return state.categoriasMap=arrToMap(a)};
const getCalendarioMap=async()=>{if(cacheGuard(state.calendarioMap))return state.calendarioMap;const a=await postJSON(API.calendario,{estatus:1});return state.calendarioMap=arrToMap(a)};
const getTipoEvalMap=async()=>{if(cacheGuard(state.tipoEvalMap))return state.tipoEvalMap;const a=await postJSON(API.tipoEval,{estatus:1});return state.tipoEvalMap=arrToMap(a)};
const getActividadesMap=async()=>{if(cacheGuard(state.actividadesMap))return state.actividadesMap;const a=await postJSON(API.actividades,{estatus:1});return state.actividadesMap=arrToMap(a)};
/* cursos/usuarios cache (p/ suscripciones) */
const _usersCache={list:null,ts:0};async function fetchAllUsuariosAnyStatus(){if(_usersCache.list&&(Date.now()-_usersCache.ts)<60*1000)return _usersCache.list;const [e1,e0,e2,e3]=await Promise.all([postJSON(API.usuarios,{estatus:1}),postJSON(API.usuarios,{estatus:0}),postJSON(API.usuarios,{estatus:2}),postJSON(API.usuarios,{estatus:3})]);const arr=[].concat(Array.isArray(e1)?e1:[],Array.isArray(e0)?e0:[],Array.isArray(e2)?e2:[],Array.isArray(e3)?e3:[]);_usersCache.list=arr;_usersCache.ts=Date.now();return arr}
const _cursosCache={list:null,ts:0};async function fetchAllCursosAnyStatus(){if(_cursosCache.list&&(Date.now()-_cursosCache.ts)<60*1000)return _cursosCache.list;const [e1,e0,e2,e3]=await Promise.all([postJSON(API.cursos,{estatus:1}),postJSON(API.cursos,{estatus:0}),postJSON(API.cursos,{estatus:2}),postJSON(API.cursos,{estatus:3})]);const arr=[].concat(Array.isArray(e1)?e1:[],Array.isArray(e0)?e0:[],Array.isArray(e2)?e2:[],Array.isArray(e3)?e3:[]);_cursosCache.list=arr;_cursosCache.ts=Date.now();return arr}
async function getCursosMapAnyStatus(){if(cacheGuard(state.cursosMap))return state.cursosMap;const arr=await fetchAllCursosAnyStatus();return state.cursosMap=arrToMap(arr)}
async function getUsuariosMapAnyStatus(){if(cacheGuard(state.usuariosMap))return state.usuariosMap;const arr=await fetchAllUsuariosAnyStatus();return state.usuariosMap=arrToMap(arr)}
/* routing/visibilidad */
function isCuentasLink(el){const href=(el.getAttribute("href")||el.dataset.route||"").toLowerCase();const txt=(el.textContent||"").toLowerCase();return href.indexOf("#/cuentas")>=0||txt.indexOf("cuenta")>=0}
function applyAdminVisibility(isAdmin){qsa(".gc-side .nav-item").forEach(a=>{if(!isAdmin&&!isCuentasLink(a)){(a.closest&&a.closest("li")?a.closest("li"):a).style.display="none";a.setAttribute("tabindex","-1");a.setAttribute("aria-hidden","true");}});const addBtn=qs("#btn-add");if(addBtn)addBtn.style.display=isAdmin?"":"none"}
function enforceRouteGuard(){if(!isAdminUser){const h=(window.location.hash||"").toLowerCase();if(h.indexOf("#/cuentas")!==0){if(location.hash!=="#/cuentas")location.hash="#/cuentas"}}}
function setRoute(hash){const t=hash||(isAdminUser?"#/cursos":"#/cuentas");if(location.hash!==t)location.hash=t;else onRouteChange()}
window.addEventListener("hashchange",onRouteChange);
function onRouteChange(){enforceRouteGuard();const hash=window.location.hash||(isAdminUser?"#/cursos":"#/cuentas");state.route=hash;state.page=1;qsa(".gc-side .nav-item").forEach(a=>{const active=a.getAttribute("href")===hash;a.classList&&a.classList.toggle("is-active",active);a.setAttribute("aria-current",active?"page":"false")});
  if(hash.startsWith("#/cursos")){hideCuentaPanel();return isAdminUser?loadCursos():enforceRouteGuard()}
  if(hash.startsWith("#/noticias")){hideCuentaPanel();return isAdminUser?loadNoticias():enforceRouteGuard()}
  if(hash.startsWith("#/tutores")){hideCuentaPanel();return isAdminUser?loadTutores():enforceRouteGuard()}
  if(hash.startsWith("#/usuarios")){hideCuentaPanel();return isAdminUser?loadUsuarios():enforceRouteGuard()}
  if(hash.startsWith("#/suscripciones")){hideCuentaPanel();return isAdminUser?loadSuscripciones():enforceRouteGuard()}
  if(hash.startsWith("#/cuentas")){showCuentaPanel();return}
  setRoute(isAdminUser?"#/cursos":"#/cuentas")
}
/* list core */
function showSkeletons(){const d=qs("#recursos-list"),m=qs("#recursos-list-mobile");if(d)d.innerHTML="";if(m)m.innerHTML="";const t=d||m;if(!t)return;for(let i=0;i<5;i++){t.insertAdjacentHTML("beforeend",'<div class="sk-row"><div class="sk n1"></div><div class="sk n2"></div><div class="sk n3"></div></div>')}}
function renderPagination(total){const totalPages=Math.max(1,Math.ceil(total/state.pageSize));[qs("#pagination-controls"),qs("#pagination-mobile")].forEach(cont=>{if(!cont)return;cont.innerHTML="";if(totalPages<=1)return;const prev=document.createElement("button");prev.className="arrow-btn";prev.textContent="‹";prev.disabled=state.page===1;prev.onclick=()=>{state.page=Math.max(1,state.page-1);refreshCurrent()};cont.appendChild(prev);for(let p=1;p<=totalPages&&p<=7;p++){const b=document.createElement("button");b.className="page-btn"+(p===state.page?" active":"");b.textContent=p;b.onclick=()=>{state.page=p;refreshCurrent()};cont.appendChild(b)}const next=document.createElement("button");next.className="arrow-btn";next.textContent="›";next.disabled=state.page===totalPages;next.onclick=()=>{state.page=Math.min(totalPages,state.page+1);refreshCurrent()};cont.appendChild(next)})}
function refreshCurrent(){const h=state.route||window.location.hash||"";if(h.startsWith("#/cursos"))return drawCursos();if(h.startsWith("#/noticias"))return drawNoticias();if(h.startsWith("#/tutores"))return drawTutores();if(h.startsWith("#/usuarios"))return drawUsuarios();if(h.startsWith("#/suscripciones"))return drawSuscripciones();if(h.startsWith("#/cuentas"))return showCuentaPanel()}
function defaultMatcher(q){const k=norm(q);return it=>norm(JSON.stringify(it)).includes(k)}
function renderList(rows,config){const d=qs("#recursos-list"),m=qs("#recursos-list-mobile");if(d)d.innerHTML="";if(m)m.innerHTML="";const matcherFn=(config&&typeof config.matcher==="function")?config.matcher(state.search):defaultMatcher(state.search);const filtered=state.search?rows.filter(matcherFn):rows;if(!filtered.length){const empty='<div class="empty-state" style="padding:1rem;">Sin resultados</div>';if(d)d.innerHTML=empty;if(m)m.innerHTML=empty;const c=qs("#mod-count");if(c)c.textContent="0 resultados";renderPagination(0);return}
  const start=(state.page-1)*state.pageSize,pageRows=filtered.slice(start,start+state.pageSize);
  pageRows.forEach(it=>{if(d)d.insertAdjacentHTML("beforeend",config.desktopRow(it));if(m)m.insertAdjacentHTML("beforeend",config.mobileRow(it))});
  const countEl=qs("#mod-count");if(countEl)countEl.textContent=filtered.length+" "+(filtered.length===1?"elemento":"elementos");
  qsa("#recursos-list .table-row").forEach(el=>{el.addEventListener("click",()=>{const data=el.dataset||{};state.currentDrawer={type:data.type,id:Number(data.id),mode:"view"};openDrawer(config.drawerTitle(data),config.drawerBody(data));setTimeout(()=>config.afterOpen&&config.afterOpen(data),0)})});
  qsa("#recursos-list-mobile .row-toggle").forEach(el=>{el.addEventListener("click",()=>{const row=el.closest(".table-row-mobile");if(row&&row.classList)row.classList.toggle("expanded")})});
  qsa("#recursos-list-mobile .open-drawer").forEach(btn=>{btn.addEventListener("click",(e)=>{e.stopPropagation();const host=btn.closest(".table-row-mobile");const data=(host&&host.dataset)||{};state.currentDrawer={type:data.type,id:Number(data.id),mode:"view"};openDrawer(config.drawerTitle(data),config.drawerBody(data));setTimeout(()=>config.afterOpen&&config.afterOpen(data),0)})});
  qsa(".gc-reactivate").forEach(btn=>{btn.addEventListener("click",async(e)=>{e.stopPropagation();const id=Number(btn.getAttribute("data-id"));const t=btn.getAttribute("data-type");try{
    if(t==="curso"){await reactivateCurso(id);toast("Curso reactivado","exito");await loadCursos()}
    else if(t==="noticia"){const ok=await reactivateNoticia(id);if(ok){toast("Noticia reactivada","exito");await loadNoticias()}}
    else if(t==="tutor"){await reactivateTutor(id);toast("Tutor reactivado","exito");await loadTutores()}
    else if(t==="usuario"){const it=state.data.find(x=>x.id===id);if(!it)return;await postJSON(API.uUsuarios,{...it._all,estatus:1});toast("Usuario reactivado","exito");await loadUsuarios()}
    else if(t==="suscripcion"){await reactivateSuscripcion(id);toast("Suscripción reactivada","exito");await loadSuscripciones()}
  }catch(err){gcLog(err);toast("No se pudo reactivar","error")}})});
  renderPagination(filtered.length)
}
/* format/helpers */
const escapeHTML=s=>String(s==null?"":s).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
const escapeAttr=s=>String(s==null?"":s).replace(/"/g,"&quot;");
const fmtDate=d=>{if(!d)return"-";try{const p=String(d).split("-");return `${p[2]||""}/${p[1]||""}/${p[0]||""}`}catch{return d}};
const fmtDateTime=dt=>{if(!dt)return"-";try{const sp=String(dt).split(" ");return `${fmtDate(sp[0])} ${sp[1]||""}`.trim()}catch{return dt}};
const fmtMoney=n=>{try{return new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(n)}catch{return"$"+n}};
const pair=(l,v)=>`<div class="field"><div class="label">${escapeHTML(l)}</div><div class="value">${escapeHTML(v!=null?v:"-")}</div></div>`;
const statusBadge=v=>{const n=Number(v);if(n===1)return'<span class="gc-badge-activo">Activo</span>';if(n===0)return'<span class="gc-badge-inactivo">Inactivo</span>';if(n===2)return'<span class="gc-badge-gray">Pausado</span>';if(n===3)return'<span class="gc-badge-gray">Terminado</span>';return `<span class="gc-badge-gray">Estatus ${escapeHTML(v)}</span>`};
const statusText=v=>{const f=STATUS_OPTIONS.find(x=>Number(x.v)===Number(v));return f?f.l:`Estatus ${v}`};
const statusSelect=(id,val)=>`<select id="${id}">${STATUS_OPTIONS.map(o=>`<option value="${o.v}"${Number(val)===Number(o.v)?" selected":""}>${o.l}</option>`).join("")}</select>`;
const withBust=url=>{try{const u=new URL(url,window.location.origin);u.searchParams.set("v",Date.now());return u.pathname+"?"+u.searchParams.toString()}catch{return url+(url.indexOf("?")>=0?"&":"?")+"v="+Date.now()}};
const getDefaultAvatar=()=> (window.PATHS&&PATHS.DEFAULT_AVATAR)||"/ASSETS/usuario/usuarioImg/img_user1.png";
/* media (imgs) */
function noImageSvg(){return"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M20 70 L60 35 L95 65 L120 50 L140 70' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>"}
function mediaUrlsByType(type,id){const nid=Number(id);if(type==="noticia")return[`/ASSETS/noticia/NoticiasImg/noticia_img1_${nid}.png`,`/ASSETS/noticia/NoticiasImg/noticia_img2_${nid}.png`];if(type==="curso")return[`/ASSETS/cursos/img${nid}.png`];if(type==="tutor")return[`/ASSETS/tutor/tutor_${nid}.png`];if(type==="usuario")return[`/ASSETS/usuario/usuarioImg/img_user${nid}.png`];return[]}
function humanSize(bytes){if(bytes<1024)return bytes+" B";if(bytes<1024*1024)return(bytes/1024).toFixed(1)+" KB";return(bytes/1024/1024).toFixed(2)+" MB"}
function validarImagen(file,opt){opt=opt||{};const maxMB=opt.maxMB||2;if(!file)return{ok:false,error:"No se seleccionó archivo"};const allowed=["image/jpeg","image/png"];if(!allowed.includes(file.type))return{ok:false,error:"Formato no permitido. Solo JPG o PNG"};const sizeMB=file.size/1024/1024;if(sizeMB>maxMB)return{ok:false,error:"La imagen excede "+maxMB+"MB"};return{ok:true}}
function renderPreviewUI(cardEl,file,onConfirm,onCancel){const url=URL.createObjectURL(file),drawer=qs("#gc-drawer"),overlayBG=qs("#gc-dash-overlay");const prev={pe:drawer?.style?.pointerEvents,fl:drawer?.style?.filter,dz:drawer?.style?.zIndex,oz:overlayBG?.style?.zIndex,aria:drawer?drawer.getAttribute("aria-hidden"):null,hadInert:drawer?.hasAttribute?drawer.hasAttribute("inert"):false};
  const overlay=document.createElement("div");overlay.className="gc-preview-overlay";overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");overlay.style.cssText="position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(17,24,39,.55);backdrop-filter:saturate(120%) blur(2px);";
  if(drawer){drawer.style.pointerEvents="none";drawer.style.filter="blur(1px)";drawer.style.zIndex="1";drawer.setAttribute("aria-hidden","true");try{drawer.setAttribute("inert","")}catch{}}if(overlayBG&&overlayBG.style)overlayBG.style.zIndex="2";
  const modal=document.createElement("div");modal.className="gc-preview-modal";modal.style.cssText="background:#fff;border-radius:14px;box-shadow:0 20px 40px rgba(0,0,0,.25);width:min(920px,94vw);max-height:90vh;overflow:hidden;display:flex;flex-direction:column;";
  const header=document.createElement("div");header.style.cssText="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 16px;border-bottom:1px solid #eee;";header.innerHTML='<div style="font-weight:700;font-size:1.05rem;">Vista previa de imagen</div><button class="gc-btn gc-btn--ghost" data-act="close" aria-label="Cerrar" style="min-width:auto;padding:.35rem .6rem;">✕</button>';
  const body=document.createElement("div");body.style.cssText="display:grid;grid-template-columns:1fr 280px;gap:16px;padding:16px;align-items:start;";
  const imgWrap=document.createElement("div");imgWrap.style.cssText="border:1px solid #eee;border-radius:12px;padding:8px;background:#fafafa;display:flex;align-items:center;justify-content:center;min-height:320px;max-height:60vh;";imgWrap.innerHTML=`<img src="${url}" alt="Vista previa" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:8px;">`;
  const side=document.createElement("div");side.style.cssText="border-left:1px dashed #e6e6e6;padding-left:16px;display:flex;flex-direction:column;gap:10px;";side.innerHTML=`<div style="font-weight:600;">Detalles</div><div style="font-size:.92rem;color:#444;line-height:1.35;"><div><strong>Archivo:</strong> ${file.name}</div><div><strong>Peso:</strong> ${humanSize(file.size)}</div><div><strong>Tipo:</strong> ${file.type||"desconocido"}</div><div style="margin-top:6px;color:#666;">Formatos permitidos: JPG / PNG · Máx 2MB</div></div><div style="margin-top:auto;display:flex;gap:8px;flex-wrap:wrap;"><button class="gc-btn gc-btn--primary" data-act="confirm">Subir</button><button class="gc-btn gc-btn--ghost" data-act="cancel">Cancelar</button></div>`;
  const mql=window.matchMedia&&window.matchMedia("(max-width: 720px)"),applyResponsive=()=>{if(mql&&mql.matches){body.style.gridTemplateColumns="1fr";side.style.borderLeft="none";side.style.paddingLeft="0";imgWrap.style.minHeight="200px"}else{body.style.gridTemplateColumns="1fr 280px";side.style.borderLeft="1px dashed #e6e6e6";side.style.paddingLeft="16px";imgWrap.style.minHeight="320px"}};mql&&mql.addEventListener&&mql.addEventListener("change",applyResponsive);applyResponsive();
  body.appendChild(imgWrap);body.appendChild(side);modal.appendChild(header);modal.appendChild(body);overlay.appendChild(modal);document.body.appendChild(overlay);document.body.style.overflow="hidden";
  const cleanup=()=>{if(drawer){if(drawer.style){drawer.style.pointerEvents=prev.pe||"";drawer.style.filter=prev.fl||"";drawer.style.zIndex=prev.dz||""}if(prev.aria!=null)drawer.setAttribute("aria-hidden",prev.aria);else drawer.removeAttribute("aria-hidden");try{if(!prev.hadInert)drawer.removeAttribute("inert")}catch{}}if(overlayBG?.style)overlayBG.style.zIndex=prev.oz||"";document.body.style.overflow="";try{URL.revokeObjectURL(url)}catch{};try{overlay.remove()}catch{};document.removeEventListener("keydown",onEsc)};
  const onEsc=e=>{if(e&&e.key==="Escape"){e.preventDefault();cleanup()}};document.addEventListener("keydown",onEsc);overlay.addEventListener("click",(e)=>{if(e.target===overlay)cleanup()});
  header.querySelector('[data-act="close"]')?.addEventListener("click",cleanup);
  side.querySelector('[data-act="cancel"]')?.addEventListener("click",(e)=>{e.preventDefault();onCancel&&onCancel();cleanup()});
  side.querySelector('[data-act="confirm"]')?.addEventListener("click",async(e)=>{e.preventDefault();try{if(onConfirm)await onConfirm()}finally{cleanup()}})
}
function mountReadOnlyMedia(opt){const container=opt?.container,type=opt?.type,id=opt?.id,labels=opt?.labels||[];const editableOverride=opt?.editable;if(!container)return;const editable=typeof editableOverride==="boolean"?editableOverride:(isAdminUser&&state.currentDrawer&&state.currentDrawer.mode==="edit");const urls=mediaUrlsByType(type,id);const grid=document.createElement("div");grid.className="media-grid";
  urls.forEach((url,i)=>{const label=labels[i]||("Imagen "+(i+1));const card=document.createElement("div");card.className="media-card";const editBtnHTML=editable?('<button class="icon-btn media-edit" title="Editar imagen"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.0 1.0 0 0 0 0-1.41l-2.34-2.34a1.0 1.0 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"></path></svg></button>'):"";card.innerHTML=`<figure class="media-thumb"><img alt="${escapeAttr(label)}" src="${withBust(url)}">${editBtnHTML}</figure><div class="media-meta"><div class="media-label">${escapeHTML(label)}</div></div>`;
    const img=card.querySelector("img");if(img){img.onerror=function(){img.onerror=null;if(type==="tutor"&&/\.png(\?|$)/.test(url)){img.src=withBust(url.replace(".png",".jpg"))}else if(type==="usuario"){img.src=withBust(getDefaultAvatar())}else{img.src="data:image/svg+xml;utf8,"+encodeURIComponent(noImageSvg())}}}
    if(editable){const btnEdit=card.querySelector(".media-edit");if(btnEdit){btnEdit.addEventListener("click",(e)=>{e.preventDefault();e.stopPropagation();const input=document.createElement("input");input.type="file";input.accept="image/png, image/jpeg";input.style.display="none";document.body.appendChild(input);
      input.addEventListener("change",async function(){const file=input.files&&input.files[0];try{document.body.removeChild(input)}catch{};if(!file)return;const v=validarImagen(file,{maxMB:2});if(!v.ok)return toast(v.error,"error");
        renderPreviewUI(card,file,async()=>{try{
          if(type==="curso"){const fd=new FormData();fd.append("curso_id",String(id));fd.append("imagen",file);const res=await fetch(API_UPLOAD.cursoImg,{method:"POST",body:fd});const text=await res.text().catch(()=> "");if(!res.ok)throw new Error("HTTP "+res.status+" "+(text||""));let json;try{json=JSON.parse(text)}catch{json={_raw:text}};img.src=withBust((json&&json.url)||url);toast("Imagen de curso actualizada","exito");return}
          if(type==="noticia"){const fd=new FormData();fd.append("noticia_id",String(id));fd.append("pos",String(i+1));fd.append("imagen",file);const res=await fetch(API_UPLOAD.noticiaImg,{method:"POST",body:fd});const text=await res.text().catch(()=> "");if(!res.ok)throw new Error("HTTP "+res.status+" "+(text||""));let json;try{json=JSON.parse(text)}catch{json={_raw:text}};img.src=withBust((json&&json.url)||url);toast("Imagen de noticia actualizada","exito");return}
          if(type==="tutor"){const fd=new FormData();fd.append("tutor_id",String(id));fd.append("imagen",file);const res=await fetch(API_UPLOAD.tutorImg,{method:"POST",body:fd});const text=await res.text().catch(()=> "");if(!res.ok)throw new Error("HTTP "+res.status+" "+(text||""));let json;try{json=JSON.parse(text)}catch{json={_raw:text}};img.src=withBust((json&&json.url)||url);toast("Imagen de tutor actualizada","exito");return}
          if(type==="usuario"){const fd=new FormData();fd.append("usuario_id",String(id));fd.append("imagen",file);const res=await fetch(API.uAvatar,{method:"POST",body:fd});const text=await res.text().catch(()=> "");if(!res.ok)throw new Error("HTTP "+res.status+" "+(text||""));let json;try{json=JSON.parse(text)}catch{json={_raw:text}};img.src=withBust((json&&json.url)||url);toast("Avatar actualizado","exito");return}
        }catch(err){gcLog(err);toast("No se pudo subir la imagen","error")}},()=>{});
      });input.click()})}}
    grid.appendChild(card)
  });
  container.innerHTML=`<div class="media-head"><div class="media-title">Imágenes</div>${editable?`<div class="media-help" style="color:#666;">Formatos: JPG/PNG · Máx 2MB</div>`:`<div class="media-help" style="color:#888;">Solo lectura</div>`}</div>`;
  container.appendChild(grid)
}
/* drawer base + dev json */
function openDrawer(title,bodyHTML){const ov=qs("#gc-dash-overlay");if(ov&&ov.classList)ov.classList.add("open");const dw=qs("#gc-drawer");if(!dw)return;qs("#drawer-title")&&(qs("#drawer-title").textContent=title||"Detalle");const b=qs("#drawer-body");if(b)b.innerHTML=bodyHTML||"";dw.classList&&dw.classList.add("open");dw.setAttribute("aria-hidden","false")}
function closeDrawer(){try{document.activeElement?.blur?.()}catch{}const ov=qs("#gc-dash-overlay");if(ov&&ov.classList)ov.classList.remove("open");const dw=qs("#gc-drawer");if(!dw)return;dw.classList&&dw.classList.remove("open");dw.setAttribute("aria-hidden","true");state.currentDrawer=null}
function disableDrawerInputs(disabled){qsa("#drawer-body input, #drawer-body select, #drawer-body textarea").forEach(el=>el.disabled=!!disabled)}
function jsonSection(obj,title,preId,btnId){const safe=escapeHTML(JSON.stringify(obj||{},null,2));return `<details class="dev-json" open style="margin-top:16px;"><summary style="cursor:pointer;font-weight:600;">${escapeHTML(title)}</summary><div style="display:flex;gap:.5rem;margin:.5rem 0;"><button class="gc-btn" id="${btnId}">Copiar JSON</button></div><pre id="${preId}" class="value" style="white-space:pre-wrap;max-height:260px;overflow:auto;">${safe}</pre></details>`}
function bindCopyFromPre(preSel,btnSel){const btn=qs(btnSel),pre=qs(preSel);if(!btn||!pre)return;btn.addEventListener("click",async(e)=>{e.preventDefault();const text=pre.textContent||"";if(!text)return toast("No hay JSON para copiar","warning");try{await navigator.clipboard.writeText(text);toast("JSON copiado","exito")}catch{try{const ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.left="-9999px";document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);toast("JSON copiado","exito")}catch{alert("No se pudo copiar")}}})}
/* toolbar/search/add */
function setSearchPlaceholder(txt){const s=qs("#search-input");if(s)s.placeholder=txt||"Buscar..."}
function bindUI(){qsa(".admin-dash .admin-nav, .gc-side .nav-item").forEach(btn=>{btn.addEventListener("click",function(){const route=btn.getAttribute("data-route")||btn.getAttribute("href");if(route){if(location.hash!==route)location.hash=route;else onRouteChange()}})});
  qs("#drawer-close")?.addEventListener("click",closeDrawer);
  qs("#gc-dash-overlay")?.addEventListener("click",(e)=>{if(e?.target?.id==="gc-dash-overlay")closeDrawer()});
  const addBtn=qs("#btn-add");if(addBtn)addBtn.addEventListener("click",async()=>{if(!isAdminUser)return;
    if(state.route.startsWith("#/cursos"))await openCreateCurso();
    else if(state.route.startsWith("#/noticias"))await openCreateNoticia();
    else if(state.route.startsWith("#/tutores"))await openCreateTutor();
    else if(state.route.startsWith("#/usuarios"))await openCreateUsuario();
    else if(state.route.startsWith("#/suscripciones"))await openCreateSuscripcion();
  });
  const s=qs("#search-input");if(s){s.addEventListener("input",()=>{state.search=s.value||"";refreshCurrent()})}
}
/* Cursos */
const badgePrecio=precio=>Number(precio)===0?'<span class="gc-chip gray">Gratuito</span>':'<span class="gc-chip gray">Con costo</span>';
async function loadCursos(){qs("#mod-title")&&(qs("#mod-title").textContent="Cursos");const hdr=qs(".recursos-box.desktop-only .table-header");if(hdr){const c1=hdr.querySelector(".col-nombre"),c2=hdr.querySelector(".col-tutor")||hdr.querySelector(".col-tipo"),c3=hdr.querySelector(".col-fecha"),c4=hdr.querySelector(".col-status");if(c1)c1.textContent="Nombre";if(c2){c2.textContent="Tutor";c2.classList.add("col-tutor")}if(c3)c3.textContent="Fecha de inicio";if(!c4){const nc=document.createElement("div");nc.className="col-status";nc.setAttribute("role","columnheader");nc.textContent="Status";hdr.appendChild(nc)}else c4.textContent="Status"}
  qs(".tt-title")&&(qs(".tt-title").textContent="Cursos:");const st=qs("#tt-status");if(st){st.textContent="Todos los estatus";st.classList.remove("badge-inactivo");st.classList.add("badge-activo")}
  setSearchPlaceholder("Buscar por nombre o tutor");showSkeletons();
  try{const [e1,e0,e2,e3,tmap,pmap,cmap,calmap,temap,ammap]=await Promise.all([postJSON(API.cursos,{estatus:1}),postJSON(API.cursos,{estatus:0}),postJSON(API.cursos,{estatus:2}),postJSON(API.cursos,{estatus:3}),getTutorsMap(),getPrioridadMap(),getCategoriasMap(),getCalendarioMap(),getTipoEvalMap(),getActividadesMap()]);
    const raw=[].concat(e1||[],e0||[],e2||[],e3||[]);state.raw=raw;
    state.data=(raw||[]).map(c=>({id:c.id,nombre:c.nombre,tutor:(tmap&&tmap[c.tutor])||("Tutor #"+c.tutor),tutor_id:c.tutor,prioridad_id:c.prioridad,prioridad_nombre:(pmap&&pmap[c.prioridad])||("#"+c.prioridad),categoria_id:c.categoria,categoria_nombre:(cmap&&cmap[c.categoria])||("#"+c.categoria),calendario_id:c.calendario,calendario_nombre:(calmap&&calmap[c.calendario])||("#"+c.calendario),tipo_eval_id:c.tipo_evaluacion,tipo_eval_nombre:(temap&&temap[c.tipo_evaluacion])||("#"+c.tipo_evaluacion),actividades_id:c.actividades,actividades_nombre:(ammap&&ammap[c.actividades])||("#"+c.actividades),precio:c.precio,certificado:!!c.certificado,fecha:c.fecha_inicio,estatus:ntf(c.estatus),_all:c}));
    drawCursos()
  }catch(err){gcLog(err);const list=qs("#recursos-list");if(list)list.innerHTML='<div style="padding:1rem;color:#b00020;">Error al cargar cursos</div>';qs("#recursos-list-mobile")&&(qs("#recursos-list-mobile").innerHTML="");toast("No se pudieron cargar cursos","error")}
}
function drawCursos(){const rows=state.data;renderList(rows,{matcher:q=>{const k=norm(q);return it=>norm(it.nombre).includes(k)||norm(it.tutor).includes(k)},desktopRow:it=>`<div class="table-row" data-id="${it.id}" data-type="curso"><div class="col-nombre"><span class="name-text">${escapeHTML(it.nombre)}</span> ${badgePrecio(it.precio)}</div><div class="col-tutor">${escapeHTML(it.tutor)}</div><div class="col-fecha">${fmtDate(it.fecha)}</div><div class="col-status">${statusBadge(it.estatus)}</div></div>`,mobileRow:it=>`<div class="table-row-mobile" data-id="${it.id}" data-type="curso"><button class="row-toggle"><div class="col-nombre">${escapeHTML(it.nombre)} ${badgePrecio(it.precio)}</div><span class="icon-chevron">›</span></button><div class="row-details"><div><strong>Tutor:</strong> ${escapeHTML(it.tutor)}</div><div><strong>Inicio:</strong> ${fmtDate(it.fecha)}</div><div><strong>Status:</strong> ${statusText(it.estatus)}</div><div style="display:flex;gap:8px;margin:.25rem 0 .5rem;"><button class="gc-btn gc-btn--ghost open-drawer">Ver detalle</button>${Number(it.estatus)===0?`<button class="gc-btn gc-btn--success gc-reactivate" data-type="curso" data-id="${it.id}">Reactivar</button>`:""}</div></div></div>`,drawerTitle:d=>{const item=state.data.find(x=>String(x.id)===d.id);return item?("Curso · "+item.nombre):"Curso"},drawerBody:d=>renderCursoDrawer(d),afterOpen:d=>{if(d.type==="curso"){const it=state.data.find(x=>String(x.id)===d.id);if(!it)return;const cont=qs("#media-curso");if(cont)mountReadOnlyMedia({container:cont,type:"curso",id:it.id,labels:["Portada"],editable:isAdminUser&&(state.currentDrawer&&state.currentDrawer.mode==="edit")});if(isAdminUser)bindCopyFromPre("#json-curso","#btn-copy-json-curso")}}})}
function mapToOptions(map,selectedId){if(!map||typeof map!=="object")return'<option value="">—</option>';const pairs=Object.keys(map).filter(k=>k!=="_ts").map(k=>[k,map[k]]);if(!pairs.length)return'<option value="">—</option>';return pairs.map(([id,name])=>`<option value="${escapeAttr(id)}"${String(selectedId)===String(id)?" selected":""}>${escapeHTML(name)}</option>`).join("")}
function getEmptyCourse(){return{nombre:"",descripcion_breve:"",descripcion_curso:"",descripcion_media:"",dirigido:"",competencias:"",certificado:0,tutor:"",horas:0,precio:0,estatus:1,fecha_inicio:"",prioridad:1,categoria:1,calendario:1,tipo_evaluacion:1,actividades:1,creado_por:Number((currentUser&&currentUser.id)||0)||1}}
function normalizeCursoPayload(p){return {...p,nombre:String(p.nombre||""),descripcion_breve:String(p.descripcion_breve||""),descripcion_curso:String(p.descripcion_curso||""),descripcion_media:String(p.descripcion_media||""),dirigido:String(p.dirigido||""),competencias:String(p.competencias||""),certificado:Number(!!p.certificado),tutor:Number(p.tutor||0),horas:Number(p.horas||0),precio:Number(p.precio||0),estatus:Number(p.estatus!=null?p.estatus:1),prioridad:Number(p.prioridad||1),categoria:Number(p.categoria||1),calendario:Number(p.calendario||1),tipo_evaluacion:Number(p.tipo_evaluacion||1),actividades:Number(p.actividades||1),creado_por:Number(p.creado_por||0),fecha_inicio:String(p.fecha_inicio||"")}}
function readCursoForm(existingId){const read=id=>qs("#"+id)?.value||"";const readN=(id,def)=>Number(read(id)||def||0);const readCh=id=>qs("#"+id)?.checked?1:0;const payload={nombre:read("f_nombre"),descripcion_breve:read("f_desc_breve"),descripcion_curso:read("f_desc_curso"),descripcion_media:read("f_desc_media"),dirigido:read("f_dirigido"),competencias:read("f_competencias"),certificado:readCh("f_certificado"),tutor:readN("f_tutor",0),horas:readN("f_horas",0),precio:readN("f_precio",0),estatus:readN("f_estatus",1),fecha_inicio:read("f_fecha"),prioridad:readN("f_prioridad",1),categoria:readN("f_categoria",1),calendario:readN("f_calendario",1),tipo_evaluacion:readN("f_tipo_eval",1),actividades:readN("f_actividades",1),creado_por:Number((currentUser&&currentUser.id)||0)||1};if(existingId!=null)payload.id=Number(existingId);return payload}
async function uploadCursoImagen(cursoId,file){const fd=new FormData();fd.append("curso_id",String(cursoId));fd.append("imagen",file);const res=await fetch(API_UPLOAD.cursoImg,{method:"POST",body:fd});const text=await res.text().catch(()=> "");if(!res.ok)throw new Error("HTTP "+res.status+" "+(text||""));try{return JSON.parse(text)}catch{return{_raw:text}}}
async function saveNewCurso(){const payload=normalizeCursoPayload(readCursoForm(null));if(!payload.nombre)return toast("Falta el nombre","warning");if(!payload.tutor)return toast("Selecciona tutor","warning");if(!payload.categoria)return toast("Selecciona categoría","warning");if(!payload.fecha_inicio)return toast("Fecha de inicio requerida","warning");const res=await postJSON(API.iCursos,payload);const newId=Number((res&&(res.id||res.curso_id||res.insert_id||(res.data&&res.data.id)))||0);const file=state.tempNewCourseImage||null;if(newId&&file){try{await uploadCursoImagen(newId,file);toast("Imagen subida","exito")}catch(err){gcLog(err);toast("Curso creado, pero falló la imagen","error")}finally{state.tempNewCourseImage=null}}toast("Curso creado","exito");closeDrawer();await loadCursos();if(newId){const re=state.data.find(x=>x.id===newId);if(re)openDrawer("Curso · "+re.nombre,renderCursoDrawer({id:String(re.id)}))}}
async function saveUpdateCurso(item){if(!item||!item._all)return toast("Sin item para actualizar","error");const payload=normalizeCursoPayload(readCursoForm(item.id));await postJSON(API.uCursos,payload);toast("Cambios guardados","exito");await loadCursos();const re=state.data.find(x=>x.id===item.id);if(re)openDrawer("Curso · "+re.nombre,renderCursoDrawer({id:String(re.id)}))}
async function softDeleteCurso(item){if(!item||!item._all)throw new Error("Item inválido");const body=normalizeCursoPayload({...item._all,estatus:0});await postJSON(API.uCursos,body)}
async function reactivateCurso(id){const it=state.data.find(x=>x.id===Number(id));if(!it||!it._all)throw new Error("Curso no encontrado");const body=normalizeCursoPayload({...it._all,estatus:1});await postJSON(API.uCursos,body)}
async function openCreateCurso(){await Promise.all([getTutorsMap(),getPrioridadMap(),getCategoriasMap(),getCalendarioMap(),getTipoEvalMap(),getActividadesMap()]);state.currentDrawer={type:"curso",id:null,mode:"create"};openDrawer("Curso · Crear",renderCursoDrawer({id:""}))}


/* === cuenta panel (fix) + helpers === */
function showCuentaPanel(){
  try{const el=qs(".recursos-box.desktop-only");if(el&&el.style)el.style.display="none"}catch{}
  try{const el=qs(".recursos-box.mobile-only");if(el&&el.style)el.style.display="none"}catch{}
  try{const p=qs("#pagination-controls");if(p&&p.style)p.style.display="none"}catch{}
  try{const p=qs("#pagination-mobile");if(p&&p.style)p.style.display="none"}catch{}
  if(!qs("#cuenta-panel")){
    const host=qs(".main-content")||document.body;const panel=document.createElement("div");
    panel.id="cuenta-panel";panel.style.padding="16px 18px";
    panel.innerHTML='<div class="empty-state" style="padding:1rem;font-weight:600;">Panel de cuenta</div>';
    host.appendChild(panel);
  }
}
function hideCuentaPanel(){
  const p=qs("#cuenta-panel");if(p)p.remove();
  const d=qs(".recursos-box.desktop-only");if(d)d.style.display="block";
  const m=qs(".recursos-box.mobile-only");if(m)m.style.display="block";
  const pc=qs("#pagination-controls");if(pc)pc.style.display="";
  const pm=qs("#pagination-mobile");if(pm)pm.style.display="";
}

/* === init === */
document.addEventListener("DOMContentLoaded",()=>{
  try{
    bindUI();
    applyAdminVisibility(isAdminUser);
    setRoute(window.location.hash||(isAdminUser?"#/cursos":"#/cuentas"));
  }catch(e){gcLog("init fail:",e)}
});
});