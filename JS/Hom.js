// ---- ENDPOINTS ----
const ENDPOINT_INSCRIPCIONES =
  "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_inscripcion.php";
const ENDPOINT_USUARIO_FETCH =
  "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_usuario.php";
const ENDPOINT_USUARIO_UPDATE =
  "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/u_usuario.php";
const ENDPOINT_AVATAR =
  "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/u_avatar.php";

const itemsPerPage = 6; // cuántos recursos por pagina
let recursosData = [];
let currentPage = 1; // página actual de la seccion de mis recursos
const HEADER_SELECTOR = ".recursos-box .table-header > div";

// ---- Estado de sorting ----
const sortState = { column: null, asc: true };
const comparators = {
  nombre: (a, b) => a.nombre_curso.localeCompare(b.nombre_curso),
  tipo: () => 0, // todos "Curso"
  fecha: (a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion),
};

function getUsuarioFromCookie() {
  const cookie = document.cookie
    .split("; ")
    .find((r) => r.startsWith("usuario="));
  if (!cookie) return null;
  try {
    return JSON.parse(decodeURIComponent(cookie.split("=")[1]));
  } catch {
    console.warn("Cookie inválida");
    return null;
  }
}

// trae inscripciones desde el backend
async function fetchInscripciones(usuarioId) {
  const res = await fetch(ENDPOINT_INSCRIPCIONES, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario: usuarioId }),
  });
  if (!res.ok) throw new Error("No se cargaron inscripciones");
  const data = await res.json();
  console.log("fetchInscripciones response:", data);
  return data;
}

// trae datos de usuario
async function fetchUsuario(correo, telefono, estatus) {
  const res = await fetch(ENDPOINT_USUARIO_FETCH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, telefono, estatus }),
  });
  if (!res.ok) throw new Error("No se pudo cargar perfil");
  return res.json();
}

//  Render Perfil Sidebar
function renderPerfil(usuario) {
  const profile = document.querySelector(".user-profile");
  profile.innerHTML = "";

  // avatar
  const avatarCircle = document.createElement("div");
  avatarCircle.className = "avatar-circle";
  const img = document.createElement("img");
  img.id = "avatar-img";
  img.src = usuario.avatarUrl || "../ASSETS/usuario/usuarioImg/img_user1.png";
  img.alt = usuario.nombre;
  avatarCircle.appendChild(img);

  // nombre + link editar
  const userInfo = document.createElement("div");
  userInfo.className = "user-info";
  const nameDiv = document.createElement("div");
  nameDiv.id = "user-name";
  nameDiv.textContent = usuario.nombre;
  const editLink = document.createElement("a");
  editLink.className = "edit-profile";
  editLink.href = "#";
  editLink.textContent = "Administrar perfil ›";

  userInfo.append(nameDiv, editLink);
  profile.append(avatarCircle, userInfo);
}

//  Render Recursos (Desktop)
function renderRecursosRows(lista) {
  const container = document.getElementById("recursos-list");
  container.innerHTML = "";
  lista.forEach((item) => {
    const row = document.createElement("div");
    row.className = "table-row";

    // Nombre + icono
    const colNombre = document.createElement("div");
    colNombre.className = "col-nombre";
    const spanIcon = document.createElement("span");
    spanIcon.className = "icon-recurso";
    const imgIcon = document.createElement("img");
    imgIcon.src = "../ASSETS/Home/recursos/boton3.png";
    imgIcon.alt = "Curso";
    spanIcon.appendChild(imgIcon);
    const link = document.createElement("a");
    link.href = `VIEW/Curso.php?id=${item.curso}`;
    link.className = "recurso-link";
    link.textContent = item.nombre_curso;
    colNombre.append(spanIcon, link);

    // Tipo
    const colTipo = document.createElement("div");
    colTipo.className = "col-tipo";
    colTipo.textContent = "Curso";

    // Fecha
    const colFecha = document.createElement("div");
    colFecha.className = "col-fecha";
    const fecha = new Date(item.fecha_creacion);
    const opts = { year: "numeric", month: "long", day: "2-digit" };
    colFecha.textContent = fecha.toLocaleDateString("es-MX", opts);

    row.append(colNombre, colTipo, colFecha);
    container.appendChild(row);
  });
}

//  Render Recursos (acordion mobile)
function renderRecursosRowsMobile(lista) {
  const container = document.getElementById("recursos-list-mobile");
  container.innerHTML = "";
  lista.forEach((item) => {
    const row = document.createElement("div");
    row.className = "table-row-mobile";

    // Toggle Button
    const btn = document.createElement("button");
    btn.className = "row-toggle";
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = `
      <span class="col-nombre">
        <span class="icon-recurso">
          <img src="../ASSETS/Home/recursos/boton3.png" alt="Curso">
        </span>
        ${item.nombre_curso}
      </span>
      <svg class="icon-chevron" viewBox="0 0 24 24" width="20" height="20">
        <path d="M9 6l6 6-6 6" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
    `;

    // Detalles sin colapsar
    const details = document.createElement("div");
    details.className = "row-details";
    const fecha = new Date(item.fecha_creacion);
    const opts = { year: "numeric", month: "long", day: "2-digit" };
    details.innerHTML = `
      <div><strong>Tipo:</strong> Curso</div>
      <div><strong>Fecha:</strong> ${fecha.toLocaleDateString(
        "es-MX",
        opts
      )}</div>
    `;

    // Expand/Collapse
    btn.addEventListener("click", () => {
      const expanded = row.classList.toggle("expanded");
      btn.setAttribute("aria-expanded", expanded.toString());
    });

    row.append(btn, details);
    container.appendChild(row);
  });
}

//  Paginación Desktop
function renderPagination(totalPages) {
  const ctrl = document.getElementById("pagination-controls");
  ctrl.innerHTML = "";

  // Anterior
  const prev = document.createElement("button");
  prev.className = "arrow-btn";
  prev.disabled = currentPage === 1;
  prev.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M15 18l-6-6 6-6"/>
    </svg>`;
  prev.addEventListener("click", () => renderPage(currentPage - 1));
  ctrl.appendChild(prev);

  // Números
  for (let p = 1; p <= totalPages; p++) {
    const btn = document.createElement("button");
    btn.className = "page-btn";
    btn.textContent = p;
    if (p === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => renderPage(p));
    ctrl.appendChild(btn);
  }

  // Siguiente
  const next = document.createElement("button");
  next.className = "arrow-btn";
  next.disabled = currentPage === totalPages;
  next.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 6l6 6-6 6"/>
    </svg>`;
  next.addEventListener("click", () => renderPage(currentPage + 1));
  ctrl.appendChild(next);
}

//  Paginación Mobile
function renderPaginationMobile(totalPages) {
  const ctrl = document.getElementById("pagination-mobile");
  ctrl.innerHTML = "";

  // Anterior
  const prev = document.createElement("button");
  prev.className = "arrow-btn";
  prev.disabled = currentPage === 1;
  prev.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M15 18l-6-6 6-6"/>
    </svg>`;
  prev.addEventListener("click", () => renderPage(currentPage - 1));
  ctrl.appendChild(prev);

  // Números
  for (let p = 1; p <= totalPages; p++) {
    const btn = document.createElement("button");
    btn.className = "page-btn";
    btn.textContent = p;
    if (p === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => renderPage(p));
    ctrl.appendChild(btn);
  }

  // Siguiente
  const next = document.createElement("button");
  next.className = "arrow-btn";
  next.disabled = currentPage === totalPages;
  next.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 6l6 6-6 6"/>
    </svg>`;
  next.addEventListener("click", () => renderPage(currentPage + 1));
  ctrl.appendChild(next);
}

//  Render unificado
function renderPage(page) {
  currentPage = page;
  const start = (page - 1) * itemsPerPage;
  const slice = recursosData.slice(start, start + itemsPerPage);

  // desktop
  renderRecursosRows(slice);
  renderPagination(Math.ceil(recursosData.length / itemsPerPage));

  // mobile
  renderRecursosRowsMobile(slice);
  renderPaginationMobile(Math.ceil(recursosData.length / itemsPerPage));
}

//  Sorting Desktop
function montarSortingRecursos() {
  const headers = document.querySelectorAll(HEADER_SELECTOR);
  headers.forEach((header) => {
    header.style.cursor = "pointer";
    header.setAttribute("role", "columnheader");
    header.setAttribute("aria-sort", "none");
    header.tabIndex = 0;

    if (!header.querySelector(".sort-icon")) {
      const icon = document.createElement("span");
      icon.className = "sort-icon asc";
      icon.innerHTML = `
        <svg viewBox="0 0 24 24" width="0.9em" height="0.9em">
          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
        </svg>`;
      header.appendChild(icon);
    }

    header.addEventListener("click", () => {
      let colKey = null;
      if (header.classList.contains("col-nombre")) colKey = "nombre";
      else if (header.classList.contains("col-tipo")) colKey = "tipo";
      else if (header.classList.contains("col-fecha")) colKey = "fecha";
      if (!colKey) return;

      if (sortState.column === colKey) sortState.asc = !sortState.asc;
      else {
        sortState.column = colKey;
        sortState.asc = false;
      }

      recursosData.sort((a, b) =>
        sortState.asc ? comparators[colKey](a, b) : comparators[colKey](b, a)
      );
      renderPage(1);
      actualizarFlechasSorting();
    });
  });
}

function actualizarFlechasSorting() {
  document.querySelectorAll(".recursos-box .sort-icon").forEach((ic) => {
    ic.classList.remove("asc", "desc");
    const hdr = ic.closest("[role=columnheader]");
    hdr && hdr.setAttribute("aria-sort", "none");
  });
  if (!sortState.column) return;

  const sel = `.recursos-box .col-${sortState.column}`;
  document.querySelectorAll(sel).forEach((hdr) => {
    const icon = hdr.querySelector(".sort-icon");
    hdr.setAttribute("aria-sort", sortState.asc ? "ascending" : "descending");
    icon && icon.classList.add(sortState.asc ? "asc" : "desc");
  });
}

//  Mis Cursos (Sidebar)
function renderMisCursos(inscripciones) {
  const conts = {
    inscritos: document.getElementById("cursos-subscritos"),
    activos: document.getElementById("cursos-activos"),
    cancelados: document.getElementById("cursos-cancelados"),
    terminados: document.getElementById("cursos-terminados"),
  };
  Object.values(conts).forEach((c) => (c.innerHTML = ""));

  inscripciones.forEach((ins) => {
    const a = document.createElement("a");
    a.className = "curso-card";
    a.href = `VIEW/Curso.php?id=${ins.curso}`;
    a.setAttribute("role", "button");
    a.setAttribute("aria-label", `Ver ${ins.nombre_curso}`);

    const title = document.createElement("div");
    title.className = "curso-title";
    title.textContent = ins.nombre_curso;

    const fechaIni = new Date(ins.fecha_creacion);
    const opts = { day: "2-digit", month: "2-digit", year: "numeric" };
    const date = document.createElement("div");
    date.className = "curso-date";
    date.textContent = `Fecha Inicio: ${fechaIni.toLocaleDateString(
      "es-ES",
      opts
    )}`;

    a.append(title, date);
    switch (String(ins.estatus)) {
      case "1":
        conts.inscritos.appendChild(a);
        break;
      case "2":
        conts.activos.appendChild(a);
        break;
      case "3":
        conts.cancelados.appendChild(a);
        break;
      case "4":
        conts.terminados.appendChild(a);
        break;
    }
    requestAnimationFrame(() => a.classList.add("enter"));
  });
}

//  Estados VACÍOS o ERROR
function showEmptyRecursos() {
  document.getElementById("recursos-list").innerHTML = `
    <div class="empty-state">
      <p>No solicitaste recursos aún.</p>
      <button class="btn btn-primary" onclick="location.href='nuevo_recurso.php'">
        Solicitar recurso
      </button>
    </div>`;
}

function showErrorRecursos(message, retryFn) {
  const box = document.querySelector(".recursos-box");
  box.innerHTML = `
    <div class="error-state">
      <p>${message}</p>
      <button id="retry-recursos" class="btn btn-primary">Reintentar</button>
    </div>`;
  document.getElementById("retry-recursos").addEventListener("click", retryFn);
}

//  Modal Perfil
let perfilModalIniciado = false;
function initModalPerfil() {
  if (perfilModalIniciado) return;
  perfilModalIniciado = true;

  const editBtn = document.querySelector(".edit-profile");
  const modal = document.getElementById("modal-perfil");
  const closeBtn = modal.querySelector(".modal-close");
  const form = document.getElementById("form-perfil");
  const inp = {
    nombre: document.getElementById("perfil-nombre"),
    correo: document.getElementById("perfil-email"),
    pass: document.getElementById("perfil-password"),
    pass2: document.getElementById("perfil-password2"),
    telefono: document.getElementById("perfil-telefono"),
    nacimiento: document.getElementById("perfil-nacimiento"),
  };

  let usuarioCookie = getUsuarioFromCookie();
  let usuarioActual = null;

  editBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const lista = await fetchUsuario(
        usuarioCookie.correo,
        usuarioCookie.telefono,
        usuarioCookie.estatus
      );
      usuarioActual =
        lista.find((u) => +u.id === +usuarioCookie.id) || lista[0];
      inp.nombre.value = usuarioActual.nombre || "";
      inp.correo.value = usuarioActual.correo || "";
      inp.telefono.value = usuarioActual.telefono || "";
      inp.nacimiento.value = usuarioActual.fecha_nacimiento || "";
      inp.pass.value = inp.pass2.value = "";
      modal.classList.add("active");
      document.body.classList.add("modal-abierto");
    } catch {
      gcToast("Error al cargar datos de perfil.", "error");
    }
  });

  const cerrar = () => {
    modal.classList.remove("active");
    document.body.classList.remove("modal-abierto");
  };
  closeBtn.addEventListener("click", cerrar);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrar();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (inp.pass.value !== inp.pass2.value)
      return gcToast("Contraseñas no coinciden.", "warning");
    const payload = {
      id: usuarioActual.id,
      nombre: inp.nombre.value.trim(),
      correo: inp.correo.value.trim(),
      telefono: inp.telefono.value.trim(),
      fecha_nacimiento: inp.nacimiento.value,
      tipo_contacto: usuarioActual.tipo_contacto,
      estatus: usuarioActual.estatus,
      ...(inp.pass.value && { password: inp.pass.value }),
    };
    try {
      const res = await fetch(ENDPOINT_USUARIO_UPDATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      data.mensaje && gcToast(data.mensaje, "exito");
      usuarioCookie = { ...usuarioCookie, ...payload };
      document.cookie =
        "usuario=" +
        encodeURIComponent(JSON.stringify(usuarioCookie)) +
        "; path=/; max-age=" +
        86400;
      renderPerfil(usuarioCookie);
      initAvatarUpload(usuarioCookie.id); // re-enganchar avatar tras re-render
    } catch {
      gcToast("Error al actualizar perfil.", "error");
    } finally {
      cerrar();
    }
  });
}

// --- Avatar upload (inicialización y handlers) ---
function initAvatarUpload(usuarioId) {
  // asegurar input (con accept)
  let avatarInput = document.getElementById("avatar-input");
  if (!avatarInput) {
    avatarInput = document.createElement("input");
    avatarInput.type = "file";
    avatarInput.id = "avatar-input";
    avatarInput.accept = "image/png, image/jpeg";
    avatarInput.style.display = "none";
    document.body.appendChild(avatarInput);
  }

  const avatarImg = document.getElementById("avatar-img");
  if (!avatarImg) return;

  // set cursor y handlers (reemplazo directo para evitar duplicados)
  avatarImg.style.cursor = "pointer";
  avatarImg.onclick = () => avatarInput.click();

  avatarInput.onchange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Validar formato
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      alert("Formato no permitido. Solo JPG o PNG.");
      avatarInput.value = "";
      return;
    }

    // Validar tamaño (máx. 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen excede 2MB.");
      avatarInput.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("usuario_id", usuarioId);
    formData.append("avatar", file);

    try {
      const resp = await fetch(ENDPOINT_AVATAR, {
        method: "POST",
        body: formData,
      });
      const data = await resp.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      if (data.url) {
        avatarImg.src = data.url + "?t=" + Date.now(); // cache bust
      } else {
        alert("Imagen actualizada, pero no se recibió URL.");
      }
    } catch (err) {
      console.error(err);
      alert("Error al subir la imagen. Intenta de nuevo.");
    } finally {
      avatarInput.value = "";
    }
  };
}

//  deshabilitamos links y skeletons
function disableLinks() {
  document.querySelectorAll(".recurso-link, .curso-card").forEach((el) => {
    el.removeAttribute("href");
    el.addEventListener("click", (e) => {
      e.preventDefault();
      gcToast("Función deshabilitada", "warning");
    });
  });
}

function showSkeletons() {
  const tableBody = document.querySelector(".recursos-table .table-body");
  tableBody.innerHTML = "";
  for (let i = 0; i < itemsPerPage; i++) {
    const row = document.createElement("div");
    row.className = "skeleton-row";
    ["name", "type", "date"].forEach((c) => {
      const cell = document.createElement("div");
      cell.className = `skeleton-cell ${c}`;
      row.appendChild(cell);
    });
    tableBody.appendChild(row);
  }
}

//  Toggle “Mis cursos” Sidebar el de desktop
function initMisCursosToggle() {
  document.querySelectorAll(".mis-cursos .cursos-list").forEach((listEl) => {
    const subtitle = listEl.querySelector(".cursos-subtitulo");
    const container = listEl.querySelector("div[id^='cursos-']");
    if (!subtitle || !container) return;

    const count = container.children.length;
    subtitle.textContent =
      subtitle.textContent.replace(/\(\d+\)/, "") + ` (${count})`;
    console.log("cantidad de cursos", count);

    const wrapper = document.createElement("span");
    wrapper.className = "arrow-wrapper";
    wrapper.innerHTML = `
      <svg class="arrow-icon" viewBox="0 0 24 24" width="24" height="24">
        <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
      </svg>`;
    subtitle.append(wrapper);

    subtitle.setAttribute("role", "button");
    subtitle.tabIndex = 0;
    subtitle.setAttribute("aria-expanded", "true");

    container.style.overflow = "hidden";
    container.style.transition = "max-height 0.3s ease";

    let collapsed =
      localStorage.getItem(`mis-cursos:${container.id}`) === "closed";
    const svgIcon = wrapper.querySelector(".arrow-icon");

    function apply() {
      if (collapsed) {
        container.style.maxHeight = "0px";
        container.style.display = "none";
        subtitle.setAttribute("aria-expanded", "false");
        svgIcon.classList.add("open");
      } else {
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.maxHeight = container.scrollHeight + "px";
        subtitle.setAttribute("aria-expanded", "true");
        svgIcon.classList.remove("open");
      }
    }
    apply();

    subtitle.addEventListener("click", () => {
      collapsed = !collapsed;
      apply();
      localStorage.setItem(
        `mis-cursos:${container.id}`,
        collapsed ? "closed" : "open"
      );
    });
    subtitle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        subtitle.click();
      }
    });
  });
}

async function loadRecursos(usuarioId) {
  try {
    const data = await fetchInscripciones(usuarioId);
    if (!Array.isArray(data) || data.length === 0) {
      showEmptyRecursos();
      console.log("no hay recursos");
      return;
    }
    recursosData = data.slice();
    renderPage(1);
    renderMisCursos(recursosData);
    montarSortingRecursos();
    initMisCursosToggle();
  } catch (err) {
    console.error(err);
    showErrorRecursos("Error al cargar tus recursos. Intenta de nuevo.", () =>
      loadRecursos(usuarioId)
    );
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const usuario = getUsuarioFromCookie();
  if (!usuario) {
    window.location.href = "../VIEW/Login.php";
    return;
  }
  renderPerfil(usuario);
  initAvatarUpload(usuario.id); // engancha avatar al render inicial
  showSkeletons();
  await loadRecursos(usuario.id);
  initModalPerfil();
  disableLinks();
});
