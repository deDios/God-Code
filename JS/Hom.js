// home.js

// ————— Estado global —————
const itemsPerPage = 6;
let recursosData = [];
let currentPage = 1;
const HEADER_SELECTOR = ".recursos-box .table-header > div";

// ————— Sorting tabla Recursos —————
const sortState = { column: null, asc: true };
const comparators = {
  nombre: (a, b) => a.nombre_curso.localeCompare(b.nombre_curso),
  tipo: () => 0, // todos "Curso" por ahora
  fecha: (a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion)
};

// ————— Helpers —————
function getUsuarioFromCookie() {
  const cookie = document.cookie
    .split("; ")
    .find(row => row.startsWith("usuario="));
  if (!cookie) return null;
  try {
    return JSON.parse(decodeURIComponent(cookie.split("=")[1]));
  } catch (err) {
    console.warn("Cookie inválida:", err);
    return null;
  }
}

// ————— API Fetchers —————
async function fetchInscripciones(usuarioId) {
  const res = await fetch(
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_inscripcion.php",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: usuarioId }),
    }
  );
  if (!res.ok) throw new Error("No se cargaron inscripciones");
  return res.json();
}

async function fetchUsuario(correo, telefono, estatus) {
  const res = await fetch(
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_usuario.php",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, telefono, estatus }),
    }
  );
  if (!res.ok) throw new Error("No se pudo cargar perfil");
  return res.json();
}

// ————— Renderers —————
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

  // info
  const userInfo = document.createElement("div");
  userInfo.className = "user-info";
  const nameDiv = document.createElement("div");
  nameDiv.id = "user-name";
  nameDiv.textContent = usuario.nombre;
  const editLink = document.createElement("a");
  editLink.className = "edit-profile";
  editLink.href = `VIEW/Perfil.php?id=${usuario.id}`;
  editLink.textContent = "Administrar perfil ›";
  userInfo.append(nameDiv, editLink);

  profile.append(avatarCircle, userInfo);
}

function renderRecursosRows(lista) {
  const container = document.getElementById("recursos-list");
  container.innerHTML = "";

  lista.forEach(item => {
    const row = document.createElement("div");
    row.className = "table-row";

    // nombre + icono
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

    // tipo
    const colTipo = document.createElement("div");
    colTipo.className = "col-tipo";
    colTipo.textContent = "Curso";

    // fecha
    const colFecha = document.createElement("div");
    colFecha.className = "col-fecha";
    const fecha = new Date(item.fecha_creacion);
    const opts = { year: "numeric", month: "long", day: "2-digit" };
    colFecha.textContent = fecha.toLocaleDateString("es-MX", opts);

    row.append(colNombre, colTipo, colFecha);
    container.appendChild(row);
  });
}

function createCursoCard(insc) {
  const a = document.createElement("a");
  a.className = "curso-card";
  a.href = `VIEW/Curso.php?id=${insc.curso}`;
  a.setAttribute("role", "button");
  a.setAttribute("tabindex", "0");
  a.setAttribute("aria-label", `Ver ${insc.nombre_curso}`);

  const title = document.createElement("div");
  title.className = "curso-title";
  title.textContent = insc.nombre_curso;

  const fechaIni = new Date(insc.fecha_creacion);
  const opts = { day: "2-digit", month: "2-digit", year: "numeric" };
  const date = document.createElement("div");
  date.className = "curso-date";
  date.textContent = `Fecha Inicio: ${fechaIni.toLocaleDateString("es-ES", opts)}`;

  a.append(title, date);
  return a;
}

function renderMisCursos(inscripciones) {
  const conts = {
    inscritos: document.getElementById("cursos-subscritos"),
    activos: document.getElementById("cursos-activos"),
    cancelados: document.getElementById("cursos-cancelados"),
    terminados: document.getElementById("cursos-terminados")
  };
  Object.values(conts).forEach(c => c.innerHTML = "");

  inscripciones.forEach(ins => {
    const card = createCursoCard(ins);
    switch (String(ins.estatus)) {
      case "1": conts.inscritos.appendChild(card); break;
      case "2": conts.activos.appendChild(card); break;
      case "3": conts.cancelados.appendChild(card); break;
      case "4": conts.terminados.appendChild(card); break;
      default: console.warn("Estatus desconocido:", ins);
    }
    // anim entrada
    requestAnimationFrame(() => card.classList.add("enter"));
  });
}

// ————— Paginación —————
function renderPagination(totalPages) {
  const ctrl = document.getElementById("pagination-controls");
  ctrl.innerHTML = "";

  const prev = document.createElement("button");
  prev.textContent = "← Anterior";
  prev.disabled = currentPage === 1;
  prev.addEventListener("click", () => renderPage(currentPage - 1));
  ctrl.appendChild(prev);

  for (let p = 1; p <= totalPages; p++) {
    const btn = document.createElement("button");
    btn.textContent = p;
    if (p === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => renderPage(p));
    ctrl.appendChild(btn);
  }

  const next = document.createElement("button");
  next.textContent = "Siguiente →";
  next.disabled = currentPage === totalPages;
  next.addEventListener("click", () => renderPage(currentPage + 1));
  ctrl.appendChild(next);
}

function renderPage(page) {
  currentPage = page;
  const start = (page - 1) * itemsPerPage;
  const slice = recursosData.slice(start, start + itemsPerPage);
  renderRecursosRows(slice);
  renderPagination(Math.ceil(recursosData.length / itemsPerPage));
}

// ————— Sorting tabla Recursos —————
function montarSortingRecursos() {
  const headers = document.querySelectorAll(HEADER_SELECTOR);
  headers.forEach(header => {
    header.style.cursor = "pointer";
    header.setAttribute("role", "columnheader");
    header.setAttribute("aria-sort", "none");
    header.tabIndex = 0;

    header.addEventListener("click", () => {
      let colKey = header.classList.contains("col-nombre") ? "nombre"
        : header.classList.contains("col-tipo") ? "tipo"
          : header.classList.contains("col-fecha") ? "fecha"
            : null;
      if (!colKey) return;

      if (sortState.column === colKey) sortState.asc = !sortState.asc;
      else {
        sortState.column = colKey;
        sortState.asc = true;
      }

      recursosData.sort((a, b) => sortState.asc
        ? comparators[colKey](a, b)
        : comparators[colKey](b, a)
      );
      renderPage(1);
      actualizarFlechasSorting();
    });
  });
}

function actualizarFlechasSorting() {
  const headers = document.querySelectorAll(HEADER_SELECTOR);
  headers.forEach(h => {
    h.querySelector(".flecha").textContent = "";
    h.setAttribute("aria-sort", "none");
  });
  if (!sortState.column) return;

  const idxMap = { nombre: 0, tipo: 1, fecha: 2 };
  const idx = idxMap[sortState.column];
  const header = headers[idx];
  const flecha = header.querySelector(".flecha");
  flecha.textContent = sortState.asc ? "↑" : "↓";
  header.setAttribute("aria-sort", sortState.asc ? "ascending" : "descending");
}

// ————— Estados vacíos y error —————
function showEmptyRecursos() {
  document.getElementById("recursos-list").innerHTML = `
    <div class="empty-state">
      <p>No solicitaste recursos aún.</p>
      <button class="btn btn-primary" onclick="location.href='nuevo_recurso.php'">
        Solicitar recurso
      </button>
    </div>`;
  document.querySelector(".mis-cursos .cursos-seccion").innerHTML = `
    <div class="empty-state">
      <p>No estás inscrito en ningún curso.</p>
      <button class="btn btn-primary" onclick="location.href='../VIEW/Blog.php'">
        Explorar cursos
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
  document.getElementById("retry-recursos")
    .addEventListener("click", retryFn);
}

// ————— Modal “Administrar perfil” —————
function initModalPerfil() {
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

  editBtn.addEventListener("click", async e => {
    e.preventDefault();
    try {
      const lista = await fetchUsuario(
        usuarioCookie.correo, usuarioCookie.telefono, usuarioCookie.estatus
      );
      usuarioActual = lista.find(u => +u.id === +usuarioCookie.id) || lista[0];
      inp.nombre.value = usuarioActual.nombre || "";
      inp.correo.value = usuarioActual.correo || "";
      inp.telefono.value = usuarioActual.telefono || "";
      inp.nacimiento.value = usuarioActual.fecha_nacimiento || "";
      inp.pass.value = inp.pass2.value = "";
      modal.classList.add("active");
      document.body.classList.add("modal-abierto");
    } catch {
      gcToast("Error al cargar datos de perfil.", "error", 5000);
    }
  });

  const cerrarModal = () => {
    modal.classList.remove("active");
    document.body.classList.remove("modal-abierto");
  };
  closeBtn.addEventListener("click", cerrarModal);
  modal.addEventListener("click", e => {
    if (e.target === modal) cerrarModal();
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (inp.pass.value !== inp.pass2.value) {
      return gcToast("Las contraseñas no coinciden.", "warning", 4000);
    }
    const payload = {
      id: usuarioActual.id,
      nombre: inp.nombre.value.trim(),
      correo: inp.correo.value.trim(),
      telefono: inp.telefono.value.trim(),
      fecha_nacimiento: inp.nacimiento.value,
      tipo_contacto: usuarioActual.tipo_contacto,
      estatus: usuarioActual.estatus
    };
    if (inp.pass.value) payload.password = inp.pass.value;
    try {
      const res = await fetch(
        "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/u_usuario.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      const data = await res.json();
      if (data.mensaje) {
        gcToast(data.mensaje, "exito", 4000);
        usuarioCookie = { ...usuarioCookie, ...payload };
        document.cookie =
          "usuario=" + encodeURIComponent(JSON.stringify(usuarioCookie)) +
          "; path=/; max-age=" + 24 * 60 * 60;
        renderPerfil(usuarioCookie);
      }
    } catch {
      gcToast("Error al actualizar perfil.", "error", 5000);
    } finally {
      cerrarModal();
    }
  });
}

// ————— Deshabilitar enlaces de prueba —————
function disableLinks() {
  const toastDuration = 4000;
  document.querySelectorAll(".recurso-link, .curso-card").forEach(el => {
    el.removeAttribute("href");
    el.addEventListener("click", e => {
      e.preventDefault();
      gcToast("Función deshabilitada", "warning", toastDuration);
    });
  });
}

function showSkeletons() {
  // tabla recursos
  const tableBody = document.querySelector(".recursos-table .table-body");
  tableBody.innerHTML = "";
  for (let i = 0; i < itemsPerPage; i++) {
    const row = document.createElement("div");
    row.className = "skeleton-row";
    ["name", "type", "date"].forEach(c => {
      const cell = document.createElement("div");
      cell.className = `skeleton-cell ${c}`;
      row.appendChild(cell);
    });
    tableBody.appendChild(row);
  }
  // mis cursos
  ["subscritos", "activos", "cancelados", "terminados"].forEach(id => {
    const cont = document.getElementById(`cursos-${id}`);
    cont.innerHTML = "";
    for (let j = 0; j < 3; j++) {
      const ph = document.createElement("div");
      ph.className = "curso-card skeleton";
      cont.appendChild(ph);
    }
  });
}

// ————— Carga de recursos principal —————
async function loadRecursos(usuarioId) {
  try {
    const data = await fetchInscripciones(usuarioId);
    if (!Array.isArray(data) || data.length === 0) {
      showEmptyRecursos();
      return;
    }
    recursosData = data.slice();
    renderPage(1);
    renderMisCursos(recursosData);
    montarSortingRecursos();
    initMisCursosToggle();
  } catch (err) {
    console.error(err);
    showErrorRecursos(
      "Error al cargar tus recursos. Intenta de nuevo.",
      () => loadRecursos(usuarioId)
    );
  }
}


document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".mis-cursos .cursos-list").forEach(listEl => {
    const subtitle = listEl.querySelector(".cursos-subtitulo");
    const container = listEl.querySelector("div[id^='cursos-']");
    if (!subtitle || !container) return;

    const count = container.children.length;
    const baseLabel = subtitle.textContent.trim().replace(/\(\d+\)\s*$/, "");
    subtitle.textContent = `${baseLabel} (${count})`;

    const arrow = document.createElement("svg");
    arrow.className = "arrow-icon";
    arrow.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    arrow.setAttribute("viewBox", "0 0 24 24");
    arrow.setAttribute("width", "24");
    arrow.setAttribute("height", "24");
    arrow.innerHTML = `<path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>`;
    subtitle.appendChild(arrow);

    subtitle.setAttribute("role", "button");
    subtitle.tabIndex = 0;
    subtitle.setAttribute("aria-expanded", "true");

    container.style.overflow = "hidden";
    container.style.transition = "max-height 0.3s ease";

    const key = `mis-cursos:${container.id}`;
    let collapsed = localStorage.getItem(key) === "closed";

    function applyState() {
      if (collapsed) {
        container.style.maxHeight = "0px";
        subtitle.setAttribute("aria-expanded", "false");
        arrow.classList.add("open");
      } else {
        container.style.maxHeight = container.scrollHeight + "px";
        subtitle.setAttribute("aria-expanded", "true");
        arrow.classList.remove("open");
      }
    }
    applyState();

    function toggleSection() {
      collapsed = !collapsed;
      applyState();
      localStorage.setItem(key, collapsed ? "closed" : "open");
    }

    subtitle.addEventListener("click", toggleSection);
    subtitle.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleSection();
      }
    });
  });
});