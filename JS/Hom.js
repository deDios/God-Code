const ENDPOINT_INSCRIPCIONES =
  "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_inscripcion.php";
const ENDPOINT_USUARIO_FETCH =
  "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_usuario.php";
const ENDPOINT_USUARIO_UPDATE =
  "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/u_usuario.php";

const itemsPerPage = 6; //esto es la paginacion de momento son 6 objetos por pagina
let recursosData = [];
let currentPage = 1; //la pagina por default
const HEADER_SELECTOR = ".recursos-box .table-header > div";

const sortState = { column: null, asc: true };
const comparators = {
  nombre: (a, b) => a.nombre_curso.localeCompare(b.nombre_curso),
  tipo: () => 0,
  fecha: (a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion),
};

// ---- Helpers para cookies / usuario ----
function getUsuarioFromCookie() {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("usuario="));
  if (!cookie) return null;
  try {
    return JSON.parse(decodeURIComponent(cookie.split("=")[1]));
  } catch {
    console.warn("Cookie inválida");
    return null;
  }
}

// ---- Fetch de inscripciones y perfil ----
async function fetchInscripciones(usuarioId) {
  const res = await fetch(ENDPOINT_INSCRIPCIONES, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario: usuarioId }),
  });
  if (!res.ok) {
    throw new Error("No se cargaron inscripciones");
  }

  const data = await res.json();
  console.log("fetchInscripciones response:", data);
  return data;
}

async function fetchUsuario(correo, telefono, estatus) {
  const res = await fetch(ENDPOINT_USUARIO_FETCH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, telefono, estatus }),
  });
  if (!res.ok) throw new Error("No se pudo cargar perfil");
  return res.json();
}

// ---- Render del perfil en la sidebar ----
function renderPerfil(usuario) {
  const profile = document.querySelector(".user-profile");
  profile.innerHTML = ""; // limpiamos

  // avatar
  const avatarCircle = document.createElement("div");
  avatarCircle.className = "avatar-circle";
  const img = document.createElement("img");
  img.id = "avatar-img";
  img.src = usuario.avatarUrl || "../ASSETS/usuario/usuarioImg/img_user1.png";
  img.alt = usuario.nombre;
  avatarCircle.appendChild(img);

  // nombre y link de editar
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

// ---- Render de filas (desktop) ----
function renderRecursosRows(lista) {
  const container = document.getElementById("recursos-list");
  container.innerHTML = "";
  lista.forEach((item) => {
    const row = document.createElement("div");
    row.className = "table-row";

    // columna Nombre + icono
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

    // columna Tipo
    const colTipo = document.createElement("div");
    colTipo.className = "col-tipo";
    colTipo.textContent = "Curso";

    // columna Fecha
    const colFecha = document.createElement("div");
    colFecha.className = "col-fecha";
    const fecha = new Date(item.fecha_creacion);
    const opts = { year: "numeric", month: "long", day: "2-digit" };
    colFecha.textContent = fecha.toLocaleDateString("es-MX", opts);

    row.append(colNombre, colTipo, colFecha);
    container.appendChild(row);
  });
}

// ---- Render de paginacion (desktop) ----
function renderPagination(totalPages) {
  const ctrl = document.getElementById("pagination-controls");
  ctrl.innerHTML = "";

  // Anterior desktop
  const prev = document.createElement("button");
  prev.className = "arrow-btn";
  prev.disabled = currentPage === 1;
  prev.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  `;
  prev.addEventListener("click", () => renderPage(currentPage - 1));
  ctrl.appendChild(prev);

  // botones de pagina, el que es un numero
  for (let p = 1; p <= totalPages; p++) {
    const btn = document.createElement("button");
    btn.className = "page-btn";
    btn.textContent = p;
    if (p === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => renderPage(p));
    ctrl.appendChild(btn);
  }

  // Siguiente desktop
  const next = document.createElement("button");
  next.className = "arrow-btn";
  next.disabled = currentPage === totalPages;
  next.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 6l6 6-6 6"/>
    </svg>
  `;
  next.addEventListener("click", () => renderPage(currentPage + 1));
  ctrl.appendChild(next);
}

function renderPaginationMobile(totalPages) {
  const ctrl = document.getElementById("pagination-mobile");
  ctrl.innerHTML = "";

  // Anterior (mobile)
  const prev = document.createElement("button");
  prev.className = "arrow-btn";
  prev.disabled = currentPage === 1;
  prev.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  `;
  prev.addEventListener("click", () => renderPage(currentPage - 1));
  ctrl.appendChild(prev);

  // botones de página son los que son numeros
  for (let p = 1; p <= totalPages; p++) {
    const btn = document.createElement("button");
    btn.className = "page-btn";
    btn.textContent = p;
    if (p === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => renderPage(p));
    ctrl.appendChild(btn);
  }

  // Siguiente (mobile)
  const next = document.createElement("button");
  next.className = "arrow-btn";
  next.disabled = currentPage === totalPages;
  next.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 6l6 6-6 6"/>
    </svg>
  `;
  next.addEventListener("click", () => renderPage(currentPage + 1));
  ctrl.appendChild(next);
}

// ---- Render de filas Mobile ----
function renderRecursosRowsMobile(lista) {
  const container = document.getElementById("recursos-list-mobile");
  container.innerHTML = "";
  lista.forEach((item) => {
    const row = document.createElement("div");
    row.className = "table-row-mobile";

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
        <path d="M9 6l6 6-6 6"
              stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
    `;

    // informacion colapsable
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

    // toggle expand/collapse
    btn.addEventListener("click", () => {
      const expanded = row.classList.toggle("expanded");
      btn.setAttribute("aria-expanded", expanded.toString());
    });

    row.append(btn, details);
    container.appendChild(row);
  });
}

// ---- Render para la pagina ----
function renderPage(page) {
  currentPage = page;
  const start = (page - 1) * itemsPerPage;
  const slice = recursosData.slice(start, start + itemsPerPage);

  // Desktop
  renderRecursosRows(slice);
  renderPagination(Math.ceil(recursosData.length / itemsPerPage));

  // Mobile
  renderRecursosRowsMobile(slice);
  renderPaginationMobile(Math.ceil(recursosData.length / itemsPerPage));
}

// ---- Sorting de la tabla desktop ----
function montarSortingRecursos() {
  const headers = document.querySelectorAll(
    ".recursos-box .table-header > div"
  );
  headers.forEach((header) => {
    header.style.cursor = "pointer";
    header.setAttribute("role", "columnheader");
    header.setAttribute("aria-sort", "none");
    header.tabIndex = 0;

    // Si no tiene icono, se inserta
    if (!header.querySelector(".sort-icon")) {
      const icon = document.createElement("span");
      icon.className = "sort-icon asc";
      icon.innerHTML = `
        <svg viewBox="0 0 24 24" width="0.9em" height="0.9em">
          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
        </svg>
      `;
      header.appendChild(icon);
    }

    header.addEventListener("click", () => {
      let colKey = null;
      if (header.classList.contains("col-nombre")) colKey = "nombre";
      else if (header.classList.contains("col-tipo")) colKey = "tipo";
      else if (header.classList.contains("col-fecha")) colKey = "fecha";
      if (!colKey) return;

      // alternama entre asc/desc
      if (sortState.column === colKey) {
        sortState.asc = !sortState.asc;
      } else {
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
    if (!icon) return;
    hdr.setAttribute("aria-sort", sortState.asc ? "ascending" : "descending");
    icon.classList.add(sortState.asc ? "asc" : "desc");
  });
}

// ---- Estados vacíos y error ----
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

// ---- Modal “Administrar perfil” ----
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

  const cerrarPerfilModal = () => {
    modal.classList.remove("active");
    document.body.classList.remove("modal-abierto");
  };
  closeBtn.addEventListener("click", cerrarPerfilModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarPerfilModal();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (inp.pass.value !== inp.pass2.value)
      return gcToast("Las contraseñas no coinciden.", "warning");
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
    } catch {
      gcToast("Error al actualizar perfil.", "error");
    } finally {
      cerrarPerfilModal();
    }
  });
}

// ---- Deshabilitar enlaces de prueba ----
function disableLinks() {
  document.querySelectorAll(".recurso-link, .curso-card").forEach((el) => {
    el.removeAttribute("href");
    el.addEventListener("click", (e) => {
      e.preventDefault();
      gcToast("Función deshabilitada", "warning");
    });
  });
}

// ---- Skeleton loaders ----
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

// ---- Toggle “Mis cursos” (sidebar) ----
function initMisCursosToggle() {
  document.querySelectorAll(".mis-cursos .cursos-list").forEach((listEl) => {
    const subtitle = listEl.querySelector(".cursos-subtitulo");
    const container = listEl.querySelector("div[id^='cursos-']");
    if (!subtitle || !container) return;

    const count = container.children.length;
    const baseLabel = subtitle.textContent.trim().replace(/\(\d+\)\s*$/, "");
    subtitle.textContent = `${baseLabel} (${count})`;
    console.log("cantidad de cursos", count);

    const wrapper = document.createElement("span");
    wrapper.className = "arrow-wrapper";
    wrapper.innerHTML = `
      <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 24 24" width="24" height="24">
        <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
      </svg>`;
    subtitle.appendChild(wrapper);

    subtitle.setAttribute("role", "button");
    subtitle.tabIndex = 0;
    subtitle.setAttribute("aria-expanded", "true");

    container.style.overflow = "hidden";
    container.style.transition = "max-height 0.3s ease";

    const key = `mis-cursos:${container.id}`;
    let collapsed = localStorage.getItem(key) === "closed";
    const svgIcon = wrapper.querySelector(".arrow-icon");

    function applyState() {
      if (collapsed) {
        container.style.maxHeight = "0px";
        container.style.display = "none";
        subtitle.setAttribute("aria-expanded", "false");
        svgIcon.classList.add("open");
      } else {
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.flexWrap = "nowrap";
        container.style.maxHeight = container.scrollHeight + "px";
        subtitle.setAttribute("aria-expanded", "true");
        svgIcon.classList.remove("open");
      }
    }
    applyState();

    function toggleSection() {
      collapsed = !collapsed;
      applyState();
      localStorage.setItem(key, collapsed ? "closed" : "open");
    }
    subtitle.addEventListener("click", toggleSection);
    subtitle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleSection();
      }
    });
  });
}

// ---- Carga de recursos y arranque ----
async function loadRecursos(usuarioId) {
  try {
    const data = await fetchInscripciones(usuarioId);
    if (!Array.isArray(data) || data.length === 0) {
      showEmptyRecursos();
      return;
    }
    recursosData = data.slice();
    renderPage(1);
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
  showSkeletons();
  await loadRecursos(usuario.id);
  initModalPerfil();
  disableLinks();
});
