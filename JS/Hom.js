// cursoDashboard.js

// ————— Helpers —————

// Lee y parsea la cookie "usuario"
function getUsuarioFromCookie() {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("usuario="));
  if (!cookie) return null;
  try {
    return JSON.parse(decodeURIComponent(cookie.split("=")[1]));
  } catch (err) {
    console.warn('Cookie "usuario" malformada:', err);
    return null;
  }
}

// ————— API Fetchers —————

// Inscripciones (cursos) del usuario
async function fetchInscripciones(usuarioId) {
  const res = await fetch(
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_inscripcion.php",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: usuarioId }),
    }
  );
  if (!res.ok) throw new Error("Error al cargar inscripciones");
  return res.json();
}

// Datos de usuario por correo/telefono/estatus
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
  return res.json(); // devuelve array de usuarios
}

// ————— Renderers —————

// Reconstruye el sidebar con avatar y nombre
function renderPerfil(usuario) {
  const profile = document.querySelector(".user-profile");
  profile.innerHTML = "";

  const avatarCircle = document.createElement("div");
  avatarCircle.className = "avatar-circle";
  const img = document.createElement("img");
  img.id = "avatar-img";
  img.src = usuario.avatarUrl || "../ASSETS/usuario/usuarioImg/img_user1.png";
  img.alt = usuario.nombre;
  avatarCircle.appendChild(img);

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

// Renderiza filas en la tabla de Recursos
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

// Crea una card para Mis Cursos
function createCursoCard(insc) {
  const a = document.createElement("a");
  a.className = "curso-card";
  a.href = `VIEW/Curso.php?id=${insc.curso}`;

  const title = document.createElement("div");
  title.className = "curso-title";
  title.textContent = insc.nombre_curso;

  const fechaIni = new Date(insc.fecha_creacion);
  const opts = { day: "2-digit", month: "2-digit", year: "numeric" };
  const date = document.createElement("div");
  date.className = "curso-date";
  date.textContent = `Fecha Inicio: ${fechaIni.toLocaleDateString(
    "es-ES",
    opts
  )}`;

  a.append(title, date);
  return a;
}

// Renderiza Mis Cursos en sus cuatro estados
function renderMisCursos(inscripciones) {
  const contInscritos = document.getElementById("cursos-subscritos");
  const contActivos = document.getElementById("cursos-activos");
  const contCancelados = document.getElementById("cursos-cancelados");
  const contTerminados = document.getElementById("cursos-terminados");

  // Limpia contenedores
  [contInscritos, contActivos, contCancelados, contTerminados].forEach(
    (c) => (c.innerHTML = "")
  );

  inscripciones.forEach((ins) => {
    const card = createCursoCard(ins);
    switch (String(ins.estatus)) {
      case "1":
        contInscritos.appendChild(card);
        break;
      case "2":
        contActivos.appendChild(card);
        break;
      case "3":
        contCancelados.appendChild(card);
        break;
      case "4":
        contTerminados.appendChild(card);
        break;
      default:
        console.warn("Estatus desconocido:", ins);
    }
  });
}

// ————— Paginación de Recursos —————
let recursosData = [];
const itemsPerPage = 6;
let currentPage = 1;

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

// ————— Inicialización y configuración de UI —————
document.addEventListener("DOMContentLoaded", async () => {
  // Dashboard: perfil + recursos + mis cursos
  const usuario = getUsuarioFromCookie();
  if (!usuario) {
    window.location.href = "../VIEW/Login.php";
    return;
  }
  renderPerfil(usuario);

  try {
    recursosData = await fetchInscripciones(usuario.id);
    renderPage(1);
    renderMisCursos(recursosData);
  } catch (err) {
    console.error(err);
    mostrarToast("No se pudieron cargar tus cursos", "error", 5000);
  }

  // Modal “Administrar perfil”
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
  let usuarioActual,
    usuarioCookie = usuario;

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
      inp.pass.value = "";
      inp.pass2.value = "";
      modal.classList.add("active");
      document.body.classList.add("modal-abierto");
    } catch {
      mostrarToast("Error al cargar datos de perfil.", "error", 5000);
    }
  });

  const cerrarModal = () => {
    modal.classList.remove("active");
    document.body.classList.remove("modal-abierto");
  };
  closeBtn.addEventListener("click", cerrarModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (inp.pass.value !== inp.pass2.value) {
      return mostrarToast("Las contraseñas no coinciden.", "warning", 4000);
    }
    const payload = {
      id: usuarioActual.id,
      nombre: inp.nombre.value.trim(),
      correo: inp.correo.value.trim(),
      telefono: inp.telefono.value.trim(),
      fecha_nacimiento: inp.nacimiento.value,
      tipo_contacto: usuarioActual.tipo_contacto,
      estatus: usuarioActual.estatus,
    };
    if (inp.pass.value) payload.password = inp.pass.value;
    try {
      const res = await fetch(
        "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/u_usuario.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (data.mensaje) {
        mostrarToast(data.mensaje, "exito", 4000);
        // actualiza cookie y sidebar
        usuarioCookie = { ...usuarioCookie, ...payload };
        document.cookie =
          "usuario=" +
          encodeURIComponent(JSON.stringify(usuarioCookie)) +
          "; path=/; max-age=" +
          24 * 60 * 60;
        renderPerfil(usuarioCookie);
      }
    } catch {
      mostrarToast("Error al actualizar perfil.", "error", 5000);
    } finally {
      cerrarModal();
    }
  });

  // Deshabilitar links de recursos y cards de cursos
  const toastDuration = 4000;
  document.querySelectorAll(".recurso-link").forEach((link) => {
    link.removeAttribute("href");
    link.addEventListener("click", (e) => {
      e.preventDefault();
      gcToast("Función deshabilitada", "warning", toastDuration);
    });
  });
  document.querySelectorAll(".curso-card").forEach((card) => {
    card.removeAttribute("href");
    card.addEventListener("click", (e) => {
      e.preventDefault();
      gcToast("Función deshabilitada", "warning", toastDuration);
    });
  });


});
