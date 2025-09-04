"use strict";

/*  ENDPOINTS  */
const ENDPOINT_INSCRIPCIONES = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_inscripcion.php";
const ENDPOINT_AVATAR        = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/u_avatar.php";
const ENDPOINT_USUARIO_FETCH  = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_usuario.php";
const ENDPOINT_USUARIO_UPDATE = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/u_usuario.php";

/*  Estado de Recursos  */
const itemsPerPage = 6;
let recursosData = [];
let currentPage = 1;
const HEADER_SELECTOR = ".recursos-box .table-header > div";

/*  Sorting  */
const sortState = { column: null, asc: true };
const comparators = {
  nombre: (a, b) => String(a.nombre_curso || "").localeCompare(String(b.nombre_curso || "")),
  tipo:   () => 0,
  fecha:  (a, b) => new Date(a.fecha_creacion || a.fecha || 0) - new Date(b.fecha_creacion || b.fecha || 0),
};

/*  Utils  */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

function getUsuarioFromCookie() {
  const ck = document.cookie.split("; ").find(r => r.startsWith("usuario="));
  if (!ck) return null;
  try { return JSON.parse(decodeURIComponent(ck.split("=")[1])); }
  catch { console.warn("Cookie inválida"); return null; }
}

/*  Perfil (Sidebar)  */
function setAvatarSrc(imgEl, usuario) {
  const DEF  = "../ASSETS/usuario/usuarioImg/img_user1.png";
  const root = "/ASSETS/usuario/usuarioImg";
  const bust = () => "?t=" + Date.now();

  const cookieUrl = usuario.avatarUrl ? usuario.avatarUrl : null;
  const cand = [];
  if (cookieUrl) cand.push(cookieUrl);
  cand.push(
    `${root}/user_${usuario.id}.jpg`,
    `${root}/user_${usuario.id}.png`,
    `${root}/img_user${usuario.id}.jpg`,
    `${root}/img_user${usuario.id}.png`,
    DEF
  );
  let i = 0;
  const tryNext = () => {
    if (i >= cand.length) return;
    const u = cand[i++];
    imgEl.src = u.startsWith("/ASSETS/") ? (u + bust()) : u;
  };
  imgEl.onerror = tryNext;
  tryNext();
}

function renderPerfil(usuario) {
  const profile = document.querySelector(".user-profile");
  if (!profile) return;
  profile.innerHTML = "";

  const shell = document.createElement("div");
  shell.className = "avatar-shell";

  const avatarCircle = document.createElement("div");
  avatarCircle.className = "avatar-circle";

  const img = document.createElement("img");
  img.id  = "avatar-img";
  img.alt = usuario.nombre || "Foto de perfil";
  avatarCircle.appendChild(img);

  const editAvatarBtn = document.createElement("button");
  editAvatarBtn.type = "button";
  editAvatarBtn.className = "icon-btn avatar-edit";
  editAvatarBtn.setAttribute("aria-label","Cambiar foto");
  editAvatarBtn.title = "Cambiar foto";
  editAvatarBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0L15.13 5.12l3.75 3.75 1.83-1.83z" fill="currentColor"></path>
    </svg>`;

  shell.append(avatarCircle, editAvatarBtn);

  const userInfo = document.createElement("div");
  userInfo.className = "user-info";

  const nameDiv = document.createElement("div");
  nameDiv.id = "user-name";
  nameDiv.textContent = usuario.nombre || "Usuario";

  const editProfileBtn = document.createElement("button");
  editProfileBtn.type = "button";
  editProfileBtn.className = "gc-btn gc-btn-ghost edit-profile";
  editProfileBtn.textContent = "Administrar perfil ›";

  userInfo.append(nameDiv, editProfileBtn);
  profile.append(shell, userInfo);

  setAvatarSrc(img, usuario);
}

/*  Avatar Editor / Preview   */
const EDA_RECENTS_KEY = "eda:recientes:v1";

function canAcceptAvatarFile(file) {
  const valid = ["image/jpeg", "image/png"];
  if (!file) return { ok:false, msg:"No se recibió archivo." };
  if (!valid.includes(file.type)) return { ok:false, msg:"Formato no permitido. Solo JPG o PNG." };
  if (file.size > 2*1024*1024) return { ok:false, msg:"La imagen excede 2MB." };
  return { ok:true };
}
function loadAvatarRecents() {
  try { return JSON.parse(localStorage.getItem(EDA_RECENTS_KEY) || "[]"); }
  catch { return []; }
}
function saveAvatarRecents(arr) {
  try { localStorage.setItem(EDA_RECENTS_KEY, JSON.stringify(arr.slice(0,8))); }
  catch {}
}
function dataUrlToFile(dataUrl, filename="avatar.png") {
  const arr = dataUrl.split(",");
  const mime = (arr[0].match(/:(.*?);/) || [,"image/png"])[1];
  const bstr = atob(arr[1]);
  const u8 = new Uint8Array(bstr.length);
  for (let i=0;i<bstr.length;i++) u8[i]=bstr.charCodeAt(i);
  return new File([u8], filename, { type:mime });
}
function fileToDataUrl(file, maxSize=1024) {
  return new Promise((resolve, reject)=>{
    const fr = new FileReader();
    fr.onload = ()=>{
      const img = new Image();
      img.onload = ()=>{
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const cw = Math.round(img.width*scale), ch = Math.round(img.height*scale);
        const cvs = document.createElement("canvas"); cvs.width=cw; cvs.height=ch;
        const ctx = cvs.getContext("2d");
        ctx.drawImage(img, 0, 0, cw, ch);
        resolve(cvs.toDataURL("image/png", 0.92));
      };
      img.onerror = reject;
      img.src = fr.result;
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}
function ensureEditorDom() {
  let overlay = document.getElementById("eda-overlay");
  if (overlay) return overlay;
  overlay = document.createElement("div");
  overlay.className = "eda-overlay";
  overlay.id = "eda-overlay";
  overlay.innerHTML = `
    <div class="eda-modal" role="dialog" aria-modal="true" aria-labelledby="eda-title">
      <div class="eda-header">
        <div class="eda-title" id="eda-title">Editar avatar</div>
        <div class="eda-actions"><button class="btn" id="eda-close" type="button">Cerrar</button></div>
      </div>
      <div class="eda-body">
        <div class="eda-left">
          <div class="eda-drop" id="eda-drop" aria-label="Zona para arrastrar y soltar imágenes">
            <div class="eda-drop-cta">
              <strong>Arrastra una imagen</strong> o 
              <button class="btn btn-outline" id="eda-choose" type="button">Elegir archivo</button>
              <div class="eda-hint">También puedes pegar con <kbd>Ctrl</kbd>+<kbd>V</kbd></div>
            </div>
          </div>
          <div class="eda-preview">
            <div class="eda-preview-wrap">
              <img id="eda-preview-img" alt="Vista previa" />
              <div class="eda-mask" aria-hidden="true"></div>
            </div>
          </div>
        </div>
        <div class="eda-right">
          <div class="eda-recents">
            <div class="eda-recents-title">Recientes</div>
            <div class="eda-recents-grid" id="eda-recents-grid"></div>
          </div>
        </div>
      </div>
      <div class="eda-footer">
        <div class="eda-hint">JPG o PNG · Máx 2MB</div>
        <div class="eda-actions">
          <button class="btn" id="eda-cancel" type="button">Cancelar</button>
          <button class="btn blue" id="eda-save" type="button" disabled>Guardar</button>
        </div>
      </div>
      <input type="file" id="eda-file" accept="image/png, image/jpeg" hidden />
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}
function renderRecentsGrid(root) {
  const grid = root.querySelector("#eda-recents-grid");
  if (!grid) return;
  const arr = loadAvatarRecents();
  grid.innerHTML = "";
  if (!arr.length) { grid.innerHTML = `<div class="eda-empty">Sin recientes</div>`; return; }
  arr.forEach((item, idx)=>{
    const cell = document.createElement("button");
    cell.className = "eda-recent";
    cell.title = "Usar este";
    cell.innerHTML = `<img src="${item.dataUrl}" alt="Avatar reciente ${idx+1}" />`;
    cell.dataset.dataUrl = item.dataUrl;
    grid.appendChild(cell);
  });
}
function openEditorDeAvatar({ usuarioId }) {
  const overlay = ensureEditorDom();
  const modal   = overlay.querySelector(".eda-modal");
  const fileInp = overlay.querySelector("#eda-file");
  const drop    = overlay.querySelector("#eda-drop");
  const choose  = overlay.querySelector("#eda-choose");
  const prevImg = overlay.querySelector("#eda-preview-img");
  const btnSave = overlay.querySelector("#eda-save");
  const btnCancel = overlay.querySelector("#eda-cancel");
  const btnClose  = overlay.querySelector("#eda-close");

  let selectedFile = null;
  let pasteHandler = null;

  function setSelectedFile(file) {
    const v = canAcceptAvatarFile(file);
    if (!v.ok) { gcToast(v.msg, "warning"); return; }
    selectedFile = file;
    prevImg.src = URL.createObjectURL(file);
    btnSave.disabled = false;
  }
  function onPaste(e) {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (const it of items) {
      if (it.type.startsWith("image/")) {
        const f = it.getAsFile();
        if (f) setSelectedFile(f);
        e.preventDefault();
        break;
      }
    }
  }
  function close() {
    overlay.classList.remove("open");
    btnSave.disabled = true;
    selectedFile = null;
    prevImg.removeAttribute("src");
    if (pasteHandler) { document.removeEventListener("paste", pasteHandler); pasteHandler = null; }
  }

  choose.onclick = () => fileInp.click();
  fileInp.onchange = () => {
    const f = fileInp.files && fileInp.files[0];
    if (f) setSelectedFile(f);
    fileInp.value = "";
  };
  drop.addEventListener("dragover", (e)=>{ e.preventDefault(); drop.classList.add("drag"); });
  drop.addEventListener("dragleave", ()=> drop.classList.remove("drag"));
  drop.addEventListener("drop", (e)=>{
    e.preventDefault(); drop.classList.remove("drag");
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) setSelectedFile(f);
  });

  btnCancel.onclick = close;
  btnClose.onclick  = close;
  overlay.addEventListener("click", (e)=>{ if (e.target.id === "eda-overlay") close(); });
  document.addEventListener("keydown", (e)=>{ if (overlay.classList.contains("open") && e.key==="Escape") close(); });

  btnSave.onclick = async ()=>{
    if (!selectedFile) return;
    try {
      await uploadAvatarFile(selectedFile, usuarioId);
      try {
        const dataUrl = await fileToDataUrl(selectedFile, 512);
        const arr = loadAvatarRecents(); arr.unshift({ dataUrl, ts: Date.now() }); saveAvatarRecents(arr);
      } catch {}
      close();
      gcToast("Imagen de perfil actualizada", "exito");
    } catch (e) {
      console.error(e);
      gcToast("Error al subir la imagen. Intenta de nuevo.", "error");
    }
  };

  renderRecentsGrid(modal);
  modal.querySelector("#eda-recents-grid")?.addEventListener("click", (e)=>{
    const btn = e.target.closest(".eda-recent"); if (!btn) return;
    const du = btn.dataset.dataUrl; if (!du) return;
    const f = dataUrlToFile(du, "reciente.png");
    setSelectedFile(f);
  });

  overlay.classList.add("open");
  pasteHandler = onPaste;
  document.addEventListener("paste", pasteHandler);
}

/* Subida de avatar (con cookie + refresh) */
async function uploadAvatarFile(file, usuarioId) {
  const v = canAcceptAvatarFile(file);
  if (!v.ok) { gcToast(v.msg, "warning"); throw new Error(v.msg); }

  const fd = new FormData();
  fd.append("usuario_id", usuarioId);
  fd.append("avatar", file);

  const resp = await fetch(ENDPOINT_AVATAR, { method: "POST", body: fd });
  const data = await resp.json();
  if (data.error) {
    gcToast(data.error || "Error al subir la imagen.", "error");
    throw new Error(data.error || "upload failed");
  }
  if (data.url) {
    const u = getUsuarioFromCookie() || {};
    u.avatarUrl = data.url;
    document.cookie = "usuario=" + encodeURIComponent(JSON.stringify(u)) + "; path=/; max-age=86400";
    refreshAvatarEverywhere(data.url);
  }
  return data;
}

function initAvatarUpload(usuarioId) {
  let hiddenInput = document.getElementById("avatar-input");
  if (!hiddenInput) {
    hiddenInput = document.createElement("input");
    hiddenInput.type = "file";
    hiddenInput.id = "avatar-input";
    hiddenInput.accept = "image/png, image/jpeg";
    hiddenInput.style.display = "none";
    document.body.appendChild(hiddenInput);
  }
  hiddenInput.onchange = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    await uploadAvatarFile(f, usuarioId);
    try {
      const du = await fileToDataUrl(f, 512);
      const arr = loadAvatarRecents(); arr.unshift({ dataUrl: du, ts: Date.now() }); saveAvatarRecents(arr);
    } catch {}
    hiddenInput.value = "";
  };

  const avatarImg = document.getElementById("avatar-img");
  if (avatarImg) {
    avatarImg.style.cursor = "pointer";
    avatarImg.onclick = (e)=>{ e.preventDefault(); e.stopPropagation(); openEditorDeAvatar({ usuarioId }); };
  }
  const editBtn = document.querySelector(".avatar-edit");
  if (editBtn) {
    const openEd = (e)=>{ e.preventDefault(); e.stopPropagation(); openEditorDeAvatar({ usuarioId }); };
    editBtn.addEventListener("click", openEd);
    editBtn.addEventListener("keydown", (e)=>{ if (e.key==="Enter" || e.key===" ") openEd(e); });
  }
}

/*  Recursos (lista/paginación/sorting)  */
async function fetchInscripciones(usuarioId) {
  const res = await fetch(ENDPOINT_INSCRIPCIONES, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ usuario: usuarioId }),
  });
  if (!res.ok) throw new Error("No se cargaron inscripciones");
  return res.json();
}
function renderRecursosRows(lista) {
  const cont = $("#recursos-list"); if (!cont) return;
  cont.innerHTML = "";
  lista.forEach(it => {
    const row = document.createElement("div");
    row.className = "table-row";

    const cNombre = document.createElement("div");
    cNombre.className = "col-nombre";
    const icon = document.createElement("span");
    icon.className = "icon-recurso";
    const img = document.createElement("img");
    img.src = "../ASSETS/Home/recursos/boton3.png";
    img.alt = "Curso";
    icon.appendChild(img);
    const link = document.createElement("a");
    link.href = `VIEW/Curso.php?id=${it.curso}`;
    link.className = "recurso-link";
    link.textContent = it.nombre_curso;
    cNombre.append(icon, link);

    const cTipo = document.createElement("div");
    cTipo.className = "col-tipo";
    cTipo.textContent = "Curso";

    const cFecha = document.createElement("div");
    cFecha.className = "col-fecha";
    const d = new Date(it.fecha_creacion || it.fecha);
    cFecha.textContent = d.toLocaleDateString("es-MX", { year:"numeric", month:"long", day:"2-digit" });

    row.append(cNombre, cTipo, cFecha);
    cont.appendChild(row);
  });
}
function renderRecursosRowsMobile(lista) {
  const cont = $("#recursos-list-mobile"); if (!cont) return;
  cont.innerHTML = "";
  lista.forEach(it => {
    const row = document.createElement("div");
    row.className = "table-row-mobile";
    const d = new Date(it.fecha_creacion || it.fecha);

    const btn = document.createElement("button");
    btn.className = "row-toggle";
    btn.setAttribute("aria-expanded","false");
    btn.innerHTML = `
      <span class="col-nombre">
        <span class="icon-recurso"><img src="../ASSETS/Home/recursos/boton3.png" alt="Curso"></span>
        ${it.nombre_curso}
      </span>
      <svg class="icon-chevron" viewBox="0 0 24 24" width="20" height="20">
        <path d="M9 6l6 6-6 6" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>`;

    const det = document.createElement("div");
    det.className = "row-details";
    det.innerHTML = `
      <div><strong>Tipo:</strong> Curso</div>
      <div><strong>Fecha:</strong> ${d.toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"2-digit"})}</div>`;

    btn.addEventListener("click", ()=>{
      const ex = row.classList.toggle("expanded");
      btn.setAttribute("aria-expanded", String(ex));
    });

    row.append(btn, det);
    cont.appendChild(row);
  });
}
function renderPagination(totalPages) {
  const ctrl = $("#pagination-controls"); if (!ctrl) return;
  ctrl.innerHTML = "";

  const prev = document.createElement("button");
  prev.className = "arrow-btn";
  prev.disabled = currentPage === 1;
  prev.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M15 18l-6-6 6-6"/>
    </svg>`;
  prev.addEventListener("click", ()=>renderPage(currentPage-1));
  ctrl.appendChild(prev);

  for (let p=1;p<=totalPages;p++){
    const b = document.createElement("button");
    b.className = "page-btn";
    b.textContent = p;
    if (p===currentPage) b.classList.add("active");
    b.addEventListener("click", ()=>renderPage(p));
    ctrl.appendChild(b);
  }

  const next = document.createElement("button");
  next.className = "arrow-btn";
  next.disabled = currentPage === totalPages;
  next.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 6l6 6-6 6"/>
    </svg>`;
  next.addEventListener("click", ()=>renderPage(currentPage+1));
  ctrl.appendChild(next);
}
function renderPaginationMobile(totalPages) {
  const ctrl = $("#pagination-mobile"); if (!ctrl) return;
  ctrl.innerHTML = "";

  const prev = document.createElement("button");
  prev.className = "arrow-btn";
  prev.disabled = currentPage === 1;
  prev.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M15 18l-6-6 6-6"/>
    </svg>`;
  prev.addEventListener("click", ()=>renderPage(currentPage-1));
  ctrl.appendChild(prev);

  for (let p=1;p<=totalPages;p++){
    const b = document.createElement("button");
    b.className = "page-btn";
    b.textContent = p;
    if (p===currentPage) b.classList.add("active");
    b.addEventListener("click", ()=>renderPage(p));
    ctrl.appendChild(b);
  }

  const next = document.createElement("button");
  next.className = "arrow-btn";
  next.disabled = currentPage === totalPages;
  next.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 6l6 6-6 6"/>
    </svg>`;
  next.addEventListener("click", ()=>renderPage(currentPage+1));
  ctrl.appendChild(next);
}
function renderPage(page) {
  currentPage = page;
  const start = (page-1)*itemsPerPage;
  const slice = recursosData.slice(start, start+itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(recursosData.length/itemsPerPage));

  renderRecursosRows(slice);
  renderPagination(totalPages);
  renderRecursosRowsMobile(slice);
  renderPaginationMobile(totalPages);
}
function montarSortingRecursos() {
  $$(HEADER_SELECTOR).forEach(h=>{
    h.style.cursor = "pointer";
    h.setAttribute("role","columnheader");
    h.setAttribute("aria-sort","none");
    h.tabIndex = 0;

    if (!h.querySelector(".sort-icon")) {
      const ic = document.createElement("span");
      ic.className = "sort-icon asc";
      ic.innerHTML = `<svg viewBox="0 0 24 24" width="0.9em" height="0.9em"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>`;
      h.appendChild(ic);
    }

    h.addEventListener("click", ()=>{
      let key = null;
      if (h.classList.contains("col-nombre")) key = "nombre";
      else if (h.classList.contains("col-tipo")) key = "tipo";
      else if (h.classList.contains("col-fecha")) key = "fecha";
      if (!key) return;

      if (sortState.column === key) sortState.asc = !sortState.asc;
      else { sortState.column = key; sortState.asc = false; }

      recursosData.sort((a,b)=> sortState.asc ? comparators[key](a,b) : comparators[key](b,a));
      renderPage(1);
      actualizarFlechasSorting();
    });
  });
}
function actualizarFlechasSorting() {
  $$(".recursos-box .sort-icon").forEach(ic=>{
    ic.classList.remove("asc","desc");
    const h = ic.closest("[role=columnheader]");
    h && h.setAttribute("aria-sort","none");
  });
  if (!sortState.column) return;
  const sel = `.recursos-box .col-${sortState.column}`;
  $$(sel).forEach(h=>{
    const ic = h.querySelector(".sort-icon");
    h.setAttribute("aria-sort", sortState.asc ? "ascending" : "descending");
    ic && ic.classList.add(sortState.asc ? "asc" : "desc");
  });
}
function showSkeletons() {
  const body = $(".recursos-table .table-body");
  if (!body) return;
  body.innerHTML = "";
  for (let i=0;i<itemsPerPage;i++){
    const r = document.createElement("div");
    r.className = "sk-row";
    r.innerHTML = `<div class="sk n1"></div><div class="sk n2"></div><div class="sk n3"></div>`;
    body.appendChild(r);
  }
}
function showEmptyRecursos() {
  const list = $("#recursos-list");
  if (list) list.innerHTML = `
    <div class="empty-state">
      <p>No solicitaste recursos aún.</p>
      <button class="btn btn-primary" onclick="location.href='../VIEW/Blog.php'">Solicitar recurso</button>
    </div>`;
  const listM = $("#recursos-list-mobile");
  if (listM) listM.innerHTML = "";
  renderPagination(1);
  renderPaginationMobile(1);
}
function showErrorRecursos(message, retryFn) {
  const box = $(".recursos-box"); if (!box) return;
  box.innerHTML = `
    <div class="error-state">
      <p>${message}</p>
      <button id="retry-recursos" class="btn btn-primary">Reintentar</button>
    </div>`;
  $("#retry-recursos")?.addEventListener("click", retryFn);
}

/*  Mis Cursos (Sidebar)  */
const CURSO_STATUS_LABEL = { 1:"Activo", 2:"Pausado", 4:"En curso", 3:"Terminado", 0:"Inactivo", 5:"Cancelado" };
const CURSO_STATUS_BADGE = { 1:"gc-badge--green", 2:"gc-badge--grey", 4:"gc-badge--blue", 3:"gc-badge--blue", 0:"gc-badge--red", 5:"gc-badge--red" };

const formatFechaCurso = (it)=>{
  const raw = it.fecha_inicio || it.fecha_creacion || it.fecha || it.created_at || "";
  if (!raw) return "—";
  const d = new Date(raw);
  return isNaN(d) ? String(raw) : d.toLocaleDateString("es-MX",{day:"2-digit",month:"long",year:"numeric"});
};
function dedupInscripcionesPorCurso(list) {
  const m = new Map();
  for (const it of (Array.isArray(list)?list:[])) {
    const cid = String(it.curso ?? it.id_curso ?? it.id ?? "");
    if (!cid) continue;
    const prev = m.get(cid);
    if (!prev) m.set(cid, it);
    else {
      const a = new Date(prev.fecha_creacion || prev.fecha || 0).getTime();
      const b = new Date(it.fecha_creacion || it.fecha || 0).getTime();
      if (b > a) m.set(cid, it);
    }
  }
  return [...m.values()];
}
function pickSidebarContainerByStatus(s) {
  const pref = ({
    1: ["cursos-activos"],
    2: ["cursos-pausados","cursos-subscritos","cursos-inscritos","cursos-activos"],
    4: ["cursos-en-curso","cursos-activos"],
    3: ["cursos-terminados","cursos-finalizados"],
    5: ["cursos-cancelados","cursos-inactivos"],
    0: ["cursos-inactivos","cursos-cancelados"]
  })[s] || ["cursos-activos"];
  for (const id of pref) { const el = document.getElementById(id); if (el) return el; }
  return null;
}
function buildCursoCard(it, s) {
  const cursoId = it.curso ?? it.id_curso ?? it.id;
  const nombre  = it.nombre_curso || it.nombre || "Curso";
  const fecha   = formatFechaCurso(it);
  const label   = CURSO_STATUS_LABEL[s] || "—";
  const badge   = CURSO_STATUS_BADGE[s] || "gc-badge--grey";

  const a = document.createElement("a");
  a.className = "curso-card";
  a.href = `VIEW/Curso.php?id=${encodeURIComponent(cursoId)}`;
  a.setAttribute("role","button");
  a.setAttribute("aria-label", `Ver ${nombre}`);

  const t = document.createElement("div");
  t.className = "curso-title";
  t.textContent = nombre;

  const m = document.createElement("div");
  m.className = "curso-meta";
  m.innerHTML = `<span class="gc-badge ${badge}">${label}</span><span class="curso-date">· ${fecha}</span>`;

  a.append(t, m);
  requestAnimationFrame(()=> a.classList.add("enter"));
  return a;
}
function renderMisCursos(inscripciones) {
  const grupos = [
    {id:"cursos-activos"},
    {id:"cursos-pausados"},
    {id:"cursos-en-curso"},
    {id:"cursos-terminados"},
    {id:"cursos-cancelados"},
    {id:"cursos-inactivos"},
  ];
  grupos.forEach(g=>{ const el=document.getElementById(g.id); if (el) el.innerHTML=""; });

  const lista = dedupInscripcionesPorCurso(inscripciones || []);
  for (const it of lista) {
    const s = Number(it.estatus_curso ?? it.estatus ?? 1);
    const tgt = pickSidebarContainerByStatus(s);
    if (!tgt) continue;
    tgt.appendChild(buildCursoCard(it, s));
  }

  $$(".mis-cursos .cursos-list").forEach(listEl=>{
    const subtitle = listEl.querySelector(".cursos-subtitulo");
    const container = listEl.querySelector("div[id^='cursos-']");
    if (!subtitle || !container) return;
    const count = container.children.length;
    subtitle.textContent = subtitle.textContent.replace(/\s*\(\d+\)\s*$/, "");
    subtitle.textContent = `${subtitle.textContent} (${count})`;
  });
}
function initMisCursosToggle() {
  $$(".mis-cursos .cursos-list").forEach(listEl=>{
    const subtitle = listEl.querySelector(".cursos-subtitulo");
    const container = listEl.querySelector("div[id^='cursos-']");
    if (!subtitle || !container) return;

    const wrap = document.createElement("span");
    wrap.className = "arrow-wrapper";
    wrap.innerHTML = `<svg class="arrow-icon" viewBox="0 0 24 24" width="24" height="24"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>`;
    subtitle.append(wrap);

    subtitle.setAttribute("role","button");
    subtitle.tabIndex = 0;
    subtitle.setAttribute("aria-expanded","true");

    container.style.overflow = "hidden";
    container.style.transition = "max-height .3s ease";

    let collapsed = localStorage.getItem(`mis-cursos:${container.id}`) === "closed";
    const svg = wrap.querySelector(".arrow-icon");

    const apply = ()=>{
      if (collapsed) {
        container.style.maxHeight = "0px";
        container.style.display = "none";
        subtitle.setAttribute("aria-expanded","false");
        svg.classList.add("open");
      } else {
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.maxHeight = container.scrollHeight + "px";
        subtitle.setAttribute("aria-expanded","true");
        svg.classList.remove("open");
      }
    };
    apply();

    subtitle.addEventListener("click", ()=>{
      collapsed = !collapsed;
      apply();
      localStorage.setItem(`mis-cursos:${container.id}`, collapsed ? "closed" : "open");
    });
    subtitle.addEventListener("keydown", (e)=>{
      if (e.key==="Enter" || e.key===" ") { e.preventDefault(); subtitle.click(); }
    });
  });
}

/*  botones deshabilitados  */
function disableLinks() {
  document.querySelectorAll(".recurso-link, .curso-card").forEach((el)=>{
    if (el.tagName === "A") el.removeAttribute("href");
    el.setAttribute("aria-disabled", "true");
    el.classList.add("is-disabled");
    el.addEventListener("click", (e)=>{
      e.preventDefault();
      e.stopPropagation();
      gcToast("Función deshabilitada", "warning");
      return false;
    }, { passive:false });
  });
}

/*  Avatar refresh global  */
function refreshAvatarEverywhere(url) {
  const base = url.startsWith("http") ? new URL(url, location.origin).pathname : url;
  const bust = base + (base.includes("?") ? "&" : "?") + "t=" + Date.now();

  const avatarImg = document.getElementById("avatar-img");
  if (avatarImg) avatarImg.src = bust;

  document.querySelectorAll(".actions .img-perfil, .user-icon-mobile img").forEach(el => {
    el.src = bust;
  });
}

/*  Modal Administrar Perfil  */
async function fetchUsuario(correo, telefono, estatus) {
  const res = await fetch(ENDPOINT_USUARIO_FETCH, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ correo, telefono, estatus }),
  });
  if (!res.ok) throw new Error("No se pudo cargar perfil");
  return res.json();
}
function normalizarFecha(fechaRaw) {
  if (!fechaRaw) return "";
  const s = String(fechaRaw);
  if (s.includes("T")) return s.split("T")[0];
  if (s.includes(" ")) return s.split(" ")[0];
  if (s.includes("/")) {
    const p = s.split("/");
    if (p.length===3) return `${p[2]}-${String(p[1]).padStart(2,"0")}-${String(p[0]).padStart(2,"0")}`;
  }
  return s;
}
let perfilModalIniciado = false;
function initModalPerfil() {
  if (perfilModalIniciado) return;
  perfilModalIniciado = true;

  const editBtn = document.querySelector(".edit-profile");
  const modal   = document.getElementById("modal-perfil");
  if (!modal) { console.warn("[perfil] Falta #modal-perfil en el DOM"); return; }

  const closeBtn = modal.querySelector(".modal-close");
  const form     = document.getElementById("form-perfil");
  if (!form) { console.warn("[perfil] Falta #form-perfil en el DOM"); return; }

  const inp = {
    nombre:     document.getElementById("perfil-nombre"),
    correo:     document.getElementById("perfil-email"),
    pass:       document.getElementById("perfil-password"),
    pass2:      document.getElementById("perfil-password2"),
    telefono:   document.getElementById("perfil-telefono"),
    nacimiento: document.getElementById("perfil-nacimiento"),
  };

  let usuarioCookie = getUsuarioFromCookie();
  let usuarioActual = null;

  async function abrirYPrefill() {
    try {
      const lista = await fetchUsuario(usuarioCookie?.correo, usuarioCookie?.telefono, usuarioCookie?.estatus);
      usuarioActual = Array.isArray(lista) ? (lista.find(u => +u.id === +usuarioCookie.id) || lista[0]) : null;
      if (!usuarioActual) throw new Error("No se encontró el usuario.");

      inp.nombre.value     = usuarioActual.nombre || "";
      inp.correo.value     = (usuarioActual.correo || "").toLowerCase();
      inp.telefono.value   = usuarioActual.telefono || "";
      inp.nacimiento.value = normalizarFecha(usuarioActual.fecha_nacimiento || "");
      inp.pass.value = inp.pass2.value = "";

      modal.classList.add("active");
      document.body.classList.add("modal-abierto");
    } catch (e) {
      console.error(e);
      gcToast("Error al cargar datos de perfil.", "error");
    }
  }

  if (editBtn) {
    editBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      usuarioCookie = getUsuarioFromCookie();
      if (!usuarioCookie) return gcToast("Debes iniciar sesión.", "warning");
      abrirYPrefill();
    });
  }

  window.openPerfilModal = function() {
    usuarioCookie = getUsuarioFromCookie();
    if (!usuarioCookie) return gcToast("Debes iniciar sesión.", "warning");
    abrirYPrefill();
  };

  const cerrar = ()=>{
    modal.classList.remove("active");
    document.body.classList.remove("modal-abierto");
  };

  closeBtn?.addEventListener("click", cerrar);
  modal.addEventListener("click", (e)=>{ if (e.target === modal) cerrar(); });
  document.addEventListener("keydown", (e)=>{
    if (e.key === "Escape" && modal.classList.contains("active")) cerrar();
  });

  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    if (!usuarioActual) return;

    if (inp.pass.value !== inp.pass2.value) {
      gcToast("Las contraseñas no coinciden.", "warning");
      return;
    }

    const payload = {
      id: usuarioActual.id,
      nombre: (inp.nombre.value || "").trim(),
      correo: (inp.correo.value || "").trim().toLowerCase(),
      telefono: (inp.telefono.value || "").trim(),
      fecha_nacimiento: inp.nacimiento.value,
      tipo_contacto: usuarioActual.tipo_contacto,
      estatus: usuarioActual.estatus,
      ...(inp.pass.value ? { password: inp.pass.value } : {}),
    };

    try {
      const res = await fetch(ENDPOINT_USUARIO_UPDATE, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.mensaje) gcToast(data.mensaje, "exito");

      usuarioCookie = { ...usuarioCookie, ...payload };
      document.cookie = "usuario=" + encodeURIComponent(JSON.stringify(usuarioCookie)) + "; path=/; max-age=86400";

      renderPerfil(usuarioCookie);
      initAvatarUpload(usuarioCookie.id);
    } catch (err) {
      console.error(err);
      gcToast("Error al actualizar perfil.", "error");
    } finally {
      cerrar();
    }
  });
}

/*  Carga / Init  */
async function loadRecursos(usuarioId) {
  try {
    const data = await fetchInscripciones(usuarioId);
    if (!Array.isArray(data) || !data.length) {
      showEmptyRecursos();
      renderMisCursos([]);
      initMisCursosToggle();
      return;
    }
    recursosData = data.slice();
    renderPage(1);
    renderMisCursos(recursosData);
    montarSortingRecursos();
    initMisCursosToggle();
  } catch (err) {
    console.error(err);
    showErrorRecursos("Error al cargar tus recursos. Intenta de nuevo.", ()=>loadRecursos(usuarioId));
  }
}

document.addEventListener("DOMContentLoaded", async ()=>{
  const usuario = getUsuarioFromCookie();
  if (!usuario) { window.location.href = "../VIEW/Login.php"; return; }

  renderPerfil(usuario);
  initAvatarUpload(usuario.id);

  showSkeletons();
  await loadRecursos(usuario.id);

   disableLinks();

  if (typeof initModalPerfil === "function") initModalPerfil();
});
