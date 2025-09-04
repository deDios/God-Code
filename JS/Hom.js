"use strict";

/* ---- ENDPOINTS ---- */
const ENDPOINT_INSCRIPCIONES="https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_inscripcion.php";
const ENDPOINT_AVATAR="https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/u_avatar.php";

/* ---- Estado de recursos (tabla + mobile) ---- */
const itemsPerPage=6;
let recursosData=[],currentPage=1;
const HEADER_SELECTOR=".recursos-box .table-header > div";

/* ---- Sorting ---- */
const sortState={column:null,asc:true};
const comparators={
  nombre:(a,b)=>String(a.nombre_curso||"").localeCompare(String(b.nombre_curso||"")),
  tipo:()=>0, // todos "Curso"
  fecha:(a,b)=>new Date(a.fecha_creacion||a.fecha||0)-new Date(b.fecha_creacion||b.fecha||0)
};

/* Utils básicos*/
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const gcToast=(m,t="info")=>console[t==="error"?"error":t==="warning"?"warn":"log"]("[toast]",t,m);

function getUsuarioFromCookie(){
  const ck=document.cookie.split("; ").find(r=>r.startsWith("usuario="));
  if(!ck) return null;
  try{ return JSON.parse(decodeURIComponent(ck.split("=")[1])); }
  catch{ console.warn("Cookie inválida"); return null; }
}

/* Perfil (avatar + nombre)*/
function setAvatarSrc(imgEl,usuario){
  const DEF="../ASSETS/usuario/usuarioImg/img_user1.png", root="/ASSETS/usuario/usuarioImg", bust=()=>"?t="+Date.now();
  const cookieUrl=usuario.avatarUrl?usuario.avatarUrl:null;
  const cand=[];
  if(cookieUrl) cand.push(cookieUrl);
  cand.push(`${root}/user_${usuario.id}.jpg`,`${root}/user_${usuario.id}.png`,`${root}/img_user${usuario.id}.jpg`,`${root}/img_user${usuario.id}.png`,DEF);
  let i=0;
  const tryNext=()=>{ if(i>=cand.length) return; const u=cand[i++]; imgEl.src=u.startsWith("/ASSETS/")?u+bust():u; };
  imgEl.onerror=tryNext; tryNext();
}

function renderPerfil(usuario){
  const profile=$(".user-profile"); if(!profile) return;
  profile.innerHTML="";
  const shell=document.createElement("div"); shell.className="avatar-shell";
  const circle=document.createElement("div"); circle.className="avatar-circle";
  const img=document.createElement("img"); img.id="avatar-img"; img.alt=usuario.nombre||"Foto de perfil";
  circle.appendChild(img);

  const editBtn=document.createElement("button");
  editBtn.type="button"; editBtn.className="icon-btn avatar-edit";
  editBtn.setAttribute("aria-label","Cambiar foto"); editBtn.title="Cambiar foto";
  editBtn.innerHTML=`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0L15.13 5.12l3.75 3.75 1.83-1.83z" fill="currentColor"></path></svg>`;

  const info=document.createElement("div"); info.className="user-info";
  const nameDiv=document.createElement("div"); nameDiv.id="user-name"; nameDiv.textContent=usuario.nombre||"Usuario";
  info.append(nameDiv);

  shell.append(circle,editBtn); profile.append(shell,info);
  setAvatarSrc(img,usuario);
}

async function uploadAvatarFile(file,usuarioId){
  if(!file) return;
  const valid=["image/jpeg","image/png"]; if(!valid.includes(file.type)){ alert("Formato no permitido. Solo JPG/PNG."); return; }
  if(file.size>2*1024*1024){ alert("La imagen excede 2MB."); return; }
  const fd=new FormData(); fd.append("usuario_id",usuarioId); fd.append("avatar",file);
  try{
    const resp=await fetch(ENDPOINT_AVATAR,{method:"POST",body:fd}); const data=await resp.json();
    if(data.error){ alert(data.error); return; }
    const url=data.url; if(!url){ gcToast("Avatar actualizado", "exito"); return; }
    const cookie=getUsuarioFromCookie()||{}; cookie.avatarUrl=url;
    document.cookie="usuario="+encodeURIComponent(JSON.stringify(cookie))+"; path=/; max-age=86400";
    refreshAvatarEverywhere(url);
    gcToast("Imagen de perfil actualizada","exito");
  }catch(err){ console.error(err); alert("Error al subir la imagen."); }
}

function initAvatarUpload(usuarioId){
  let input=$("#avatar-input");
  if(!input){ input=document.createElement("input"); input.type="file"; input.id="avatar-input"; input.accept="image/png,image/jpeg"; input.style.display="none"; document.body.appendChild(input); }
  const img=$("#avatar-img"); if(img){ img.style.cursor="pointer"; img.onclick=()=>input.click(); }
  const btn=$(".avatar-edit"); if(btn){ btn.addEventListener("click",e=>{e.preventDefault(); input.click();}); }
  input.onchange=async e=>{ const f=e.target.files&&e.target.files[0]; if(f) await uploadAvatarFile(f,usuarioId); input.value=""; };
}

/* Recursos (lista + mobile + paginación + sorting)*/
async function fetchInscripciones(usuarioId){
  const res=await fetch(ENDPOINT_INSCRIPCIONES,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({usuario:usuarioId})});
  if(!res.ok) throw new Error("No se cargaron inscripciones");
  return res.json();
}

function renderRecursosRows(lista){
  const cont=$("#recursos-list"); if(!cont) return; cont.innerHTML="";
  lista.forEach(it=>{
    const row=document.createElement("div"); row.className="table-row";

    const cNombre=document.createElement("div"); cNombre.className="col-nombre";
    const icon=document.createElement("span"); icon.className="icon-recurso";
    const img=document.createElement("img"); img.src="../ASSETS/Home/recursos/boton3.png"; img.alt="Curso"; icon.appendChild(img);
    const link=document.createElement("a"); link.href=`VIEW/Curso.php?id=${it.curso}`; link.className="recurso-link"; link.textContent=it.nombre_curso;
    cNombre.append(icon,link);

    const cTipo=document.createElement("div"); cTipo.className="col-tipo"; cTipo.textContent="Curso";

    const cFecha=document.createElement("div"); cFecha.className="col-fecha";
    const d=new Date(it.fecha_creacion||it.fecha); cFecha.textContent=d.toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"2-digit"});

    row.append(cNombre,cTipo,cFecha); cont.appendChild(row);
  });
}

function renderRecursosRowsMobile(lista){
  const cont=$("#recursos-list-mobile"); if(!cont) return; cont.innerHTML="";
  lista.forEach(it=>{
    const row=document.createElement("div"); row.className="table-row-mobile";
    const d=new Date(it.fecha_creacion||it.fecha);
    const btn=document.createElement("button"); btn.className="row-toggle"; btn.setAttribute("aria-expanded","false");
    btn.innerHTML=`
      <span class="col-nombre">
        <span class="icon-recurso"><img src="../ASSETS/Home/recursos/boton3.png" alt="Curso"></span>
        ${it.nombre_curso}
      </span>
      <svg class="icon-chevron" viewBox="0 0 24 24" width="20" height="20"><path d="M9 6l6 6-6 6" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
    const det=document.createElement("div"); det.className="row-details";
    det.innerHTML=`<div><strong>Tipo:</strong> Curso</div><div><strong>Fecha:</strong> ${d.toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"2-digit"})}</div>`;
    btn.addEventListener("click",()=>{ const ex=row.classList.toggle("expanded"); btn.setAttribute("aria-expanded",String(ex)); });
    row.append(btn,det); cont.appendChild(row);
  });
}

function renderPagination(totalPages){
  const ctrl=$("#pagination-controls"); if(!ctrl) return; ctrl.innerHTML="";
  const prev=document.createElement("button"); prev.className="arrow-btn"; prev.disabled=currentPage===1;
  prev.innerHTML=`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>`;
  prev.addEventListener("click",()=>renderPage(currentPage-1)); ctrl.appendChild(prev);
  for(let p=1;p<=totalPages;p++){ const b=document.createElement("button"); b.className="page-btn"; b.textContent=p; if(p===currentPage) b.classList.add("active"); b.addEventListener("click",()=>renderPage(p)); ctrl.appendChild(b); }
  const next=document.createElement("button"); next.className="arrow-btn"; next.disabled=currentPage===totalPages;
  next.innerHTML=`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>`;
  next.addEventListener("click",()=>renderPage(currentPage+1)); ctrl.appendChild(next);
}

function renderPaginationMobile(totalPages){
  const ctrl=$("#pagination-mobile"); if(!ctrl) return; ctrl.innerHTML="";
  const prev=document.createElement("button"); prev.className="arrow-btn"; prev.disabled=currentPage===1;
  prev.innerHTML=`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>`;
  prev.addEventListener("click",()=>renderPage(currentPage-1)); ctrl.appendChild(prev);
  for(let p=1;p<=totalPages;p++){ const b=document.createElement("button"); b.className="page-btn"; b.textContent=p; if(p===currentPage) b.classList.add("active"); b.addEventListener("click",()=>renderPage(p)); ctrl.appendChild(b); }
  const next=document.createElement("button"); next.className="arrow-btn"; next.disabled=currentPage===totalPages;
  next.innerHTML=`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>`;
  next.addEventListener("click",()=>renderPage(currentPage+1)); ctrl.appendChild(next);
}

function renderPage(page){
  currentPage=page;
  const start=(page-1)*itemsPerPage, slice=recursosData.slice(start,start+itemsPerPage), totalPages=Math.max(1,Math.ceil(recursosData.length/itemsPerPage));
  renderRecursosRows(slice); renderPagination(totalPages);
  renderRecursosRowsMobile(slice); renderPaginationMobile(totalPages);
}

function montarSortingRecursos(){
  $$(HEADER_SELECTOR).forEach(h=>{
    h.style.cursor="pointer"; h.setAttribute("role","columnheader"); h.setAttribute("aria-sort","none"); h.tabIndex=0;
    if(!h.querySelector(".sort-icon")){
      const ic=document.createElement("span"); ic.className="sort-icon asc";
      ic.innerHTML=`<svg viewBox="0 0 24 24" width="0.9em" height="0.9em"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>`;
      h.appendChild(ic);
    }
    h.addEventListener("click",()=>{
      let key=null;
      if(h.classList.contains("col-nombre")) key="nombre";
      else if(h.classList.contains("col-tipo")) key="tipo";
      else if(h.classList.contains("col-fecha")) key="fecha";
      if(!key) return;
      if(sortState.column===key) sortState.asc=!sortState.asc; else { sortState.column=key; sortState.asc=false; }
      recursosData.sort((a,b)=>sortState.asc?comparators[key](a,b):comparators[key](b,a));
      renderPage(1); actualizarFlechasSorting();
    });
  });
}

function actualizarFlechasSorting(){
  $$(".recursos-box .sort-icon").forEach(ic=>{ ic.classList.remove("asc","desc"); const h=ic.closest("[role=columnheader]"); h&&h.setAttribute("aria-sort","none"); });
  if(!sortState.column) return;
  const sel=`.recursos-box .col-${sortState.column}`;
  $$(sel).forEach(h=>{ const ic=h.querySelector(".sort-icon"); h.setAttribute("aria-sort",sortState.asc?"ascending":"descending"); ic&&ic.classList.add(sortState.asc?"asc":"desc"); });
}

function showSkeletons(){
  const body=$(".recursos-table .table-body"); if(!body) return;
  body.innerHTML=""; for(let i=0;i<itemsPerPage;i++){ const r=document.createElement("div"); r.className="sk-row"; r.innerHTML=`<div class="sk n1"></div><div class="sk n2"></div><div class="sk n3"></div>`; body.appendChild(r); }
}

function showEmptyRecursos(){
  const list=$("#recursos-list"); if(list) list.innerHTML=`<div class="empty-state"><p>No solicitaste recursos aún.</p><button class="btn btn-primary" onclick="location.href='../VIEW/Blog.php'">Solicitar recurso</button></div>`;
  const listM=$("#recursos-list-mobile"); if(listM) listM.innerHTML="";
  renderPagination(1); renderPaginationMobile(1);
}

function showErrorRecursos(message,retryFn){
  const box=$(".recursos-box"); if(!box) return;
  box.innerHTML=`<div class="error-state"><p>${message}</p><button id="retry-recursos" class="btn btn-primary">Reintentar</button></div>`;
  $("#retry-recursos")?.addEventListener("click",retryFn);
}

/*  Mis Cursos (sidebar)*/
const CURSO_STATUS_LABEL={1:"Activo",2:"Pausado",4:"En curso",3:"Terminado",0:"Inactivo",5:"Cancelado"};
const CURSO_STATUS_BADGE={1:"gc-badge--green",2:"gc-badge--grey",4:"gc-badge--blue",3:"gc-badge--blue",0:"gc-badge--red",5:"gc-badge--red"};

const formatFechaCurso=(it)=>{ const raw=it.fecha_inicio||it.fecha_creacion||it.fecha||it.created_at||""; if(!raw) return "—"; const d=new Date(raw); return isNaN(d)?String(raw):d.toLocaleDateString("es-MX",{day:"2-digit",month:"long",year:"numeric"}); };
function dedupInscripcionesPorCurso(list){ const m=new Map(); for(const it of (Array.isArray(list)?list:[])){ const cid=String(it.curso??it.id_curso??it.id??""); if(!cid) continue; const prev=m.get(cid); if(!prev) m.set(cid,it); else { const a=new Date(prev.fecha_creacion||prev.fecha||0).getTime(); const b=new Date(it.fecha_creacion||it.fecha||0).getTime(); if(b>a) m.set(cid,it);} } return [...m.values()]; }
function pickSidebarContainerByStatus(s){
  const pref={1:["cursos-activos"],2:["cursos-pausados","cursos-subscritos","cursos-inscritos","cursos-activos"],4:["cursos-en-curso","cursos-activos"],3:["cursos-terminados","cursos-finalizados"],5:["cursos-cancelados","cursos-inactivos"],0:["cursos-inactivos","cursos-cancelados"]}[s]||["cursos-activos"];
  for(const id of pref){ const el=document.getElementById(id); if(el) return el; } return null;
}
function buildCursoCard(it,s){
  const cursoId=it.curso??it.id_curso??it.id, nombre=it.nombre_curso||it.nombre||"Curso", fecha=formatFechaCurso(it), label=CURSO_STATUS_LABEL[s]||"—", badge=CURSO_STATUS_BADGE[s]||"gc-badge--grey";
  const a=document.createElement("a"); a.className="curso-card"; a.href=`VIEW/Curso.php?id=${encodeURIComponent(cursoId)}`; a.setAttribute("role","button"); a.setAttribute("aria-label",`Ver ${nombre}`);
  const t=document.createElement("div"); t.className="curso-title"; t.textContent=nombre;
  const m=document.createElement("div"); m.className="curso-meta"; m.innerHTML=`<span class="gc-badge ${badge}">${label}</span><span class="curso-date">· ${fecha}</span>`;
  a.append(t,m); requestAnimationFrame(()=>a.classList.add("enter")); return a;
}

function renderMisCursos(inscripciones){
  const grupos=[
    {id:"cursos-activos"},{id:"cursos-pausados"},{id:"cursos-en-curso"},{id:"cursos-terminados"},{id:"cursos-cancelados"},{id:"cursos-inactivos"}
  ]; grupos.forEach(g=>{ const el=document.getElementById(g.id); if(el) el.innerHTML=""; });

  const lista=dedupInscripcionesPorCurso(inscripciones||[]);
  for(const it of lista){ const s=Number(it.estatus_curso??it.estatus??1); const tgt=pickSidebarContainerByStatus(s); if(!tgt) continue; tgt.appendChild(buildCursoCard(it,s)); }

  $$(".mis-cursos .cursos-list").forEach(listEl=>{
    const subtitle=listEl.querySelector(".cursos-subtitulo");
    const container=listEl.querySelector("div[id^='cursos-']");
    if(!subtitle||!container) return;
    const count=container.children.length;
    subtitle.textContent=subtitle.textContent.replace(/\s*\(\d+\)\s*$/,"");
    subtitle.textContent=`${subtitle.textContent} (${count})`;
  });
}

function initMisCursosToggle(){
  $$(".mis-cursos .cursos-list").forEach(listEl=>{
    const subtitle=listEl.querySelector(".cursos-subtitulo");
    const container=listEl.querySelector("div[id^='cursos-']");
    if(!subtitle||!container) return;
    const wrap=document.createElement("span"); wrap.className="arrow-wrapper";
    wrap.innerHTML=`<svg class="arrow-icon" viewBox="0 0 24 24" width="24" height="24"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>`;
    subtitle.append(wrap); subtitle.setAttribute("role","button"); subtitle.tabIndex=0; subtitle.setAttribute("aria-expanded","true");
    container.style.overflow="hidden"; container.style.transition="max-height .3s ease";
    let collapsed=localStorage.getItem(`mis-cursos:${container.id}`)==="closed";
    const svg=wrap.querySelector(".arrow-icon");
    const apply=()=>{ if(collapsed){ container.style.maxHeight="0px"; container.style.display="none"; subtitle.setAttribute("aria-expanded","false"); svg.classList.add("open"); }else{ container.style.display="flex"; container.style.flexDirection="column"; container.style.maxHeight=container.scrollHeight+"px"; subtitle.setAttribute("aria-expanded","true"); svg.classList.remove("open"); } };
    apply();
    subtitle.addEventListener("click",()=>{ collapsed=!collapsed; apply(); localStorage.setItem(`mis-cursos:${container.id}`,collapsed?"closed":"open"); });
    subtitle.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); subtitle.click(); }});
  });
}

/* Carga de datos*/
async function loadRecursos(usuarioId){
  try{
    const data=await fetchInscripciones(usuarioId);
    if(!Array.isArray(data)||!data.length){ showEmptyRecursos(); renderMisCursos([]); initMisCursosToggle(); return; }
    recursosData=data.slice();
    renderPage(1);
    renderMisCursos(recursosData);
    montarSortingRecursos();
    initMisCursosToggle();
  }catch(err){
    console.error(err);
    showErrorRecursos("Error al cargar tus recursos. Intenta de nuevo.",()=>loadRecursos(usuarioId));
  }
}

/* Boot*/
document.addEventListener("DOMContentLoaded",async()=>{
  const usuario=getUsuarioFromCookie();
  if(!usuario){ window.location.href="../VIEW/Login.php"; return; }
  renderPerfil(usuario);
  initAvatarUpload(usuario.id);
  showSkeletons();
  await loadRecursos(usuario.id);
});

/* Avatar refresh global */
function refreshAvatarEverywhere(url){
  const base=url.startsWith("http")?new URL(url,location.origin).pathname:url;
  const bust=base+(base.includes("?")?"&":"?")+"t="+Date.now();
  const avatarImg=$("#avatar-img"); if(avatarImg) avatarImg.src=bust;
  $$(".actions .img-perfil, .user-icon-mobile img").forEach(el=>{ el.src=bust; });
}
