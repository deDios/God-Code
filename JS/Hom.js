//------------------------------------ cursos y perfil del usuario

function getUsuarioFromCookie() {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("usuario="));
  if (!cookie) return null;

  try {
    const json = decodeURIComponent(cookie.split("=")[1]);
    return JSON.parse(json);
  } catch (err) {
    console.warn("Cookie “usuario” malformada:", err);
    return null;
  }
}

//ENDPOINT CURSOS DEL USUARIO
async function fetchRecursos(usuarioId) {
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

// re-arma el sidebar especificamente perfil
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

// armar filas
function renderRecursosRows(lista) {
  const container = document.getElementById("recursos-list");
  container.innerHTML = "";

  lista.forEach((item) => {
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

    // Tipo, en este caso es curso
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

// paginacion
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
  const totalPages = Math.ceil(recursosData.length / itemsPerPage);
  renderPagination(totalPages);
}

async function initDashboard() {
  const usuario = getUsuarioFromCookie();
  if (!usuario) {
    window.location.href = "../VIEW/Login.php";
    return;
  }
  renderPerfil(usuario);

  try {
    recursosData = await fetchRecursos(usuario.id);
    renderPage(1);
  } catch (err) {
    console.error(err);
    mostrarToast("No se pudieron cargar tus cursos", "error");
  }
}

document.addEventListener("DOMContentLoaded", initDashboard);

//--------------------------------- JS del MODAL
document.addEventListener("DOMContentLoaded", () => {
  // —–––––––––––– tus initDashboard, renderPerfil, etc. –––––––––––—

  // 1) Helpers para cookie y fetch de usuario
  function getUsuarioFromCookie() {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("usuario="));
    if (!cookie) return null;
    try {
      return JSON.parse(decodeURIComponent(cookie.split("=")[1]));
    } catch {
      return null;
    }
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
    const arr = await res.json();
    return arr; // array de usuarios
  }

  // 2) Elements del modal
  const editBtn = document.querySelector(".edit-profile");
  const modal = document.getElementById("modal-perfil");
  const closeBtn = modal.querySelector(".modal-close");
  const form = document.getElementById("form-perfil");

  // IDs de inputs
  const inpNombre = document.getElementById("perfil-nombre");
  const inpEmail = document.getElementById("perfil-email");
  const inpPass = document.getElementById("perfil-password");
  const inpPass2 = document.getElementById("perfil-password2");
  const inpTel = document.getElementById("perfil-telefono");
  const inpNac = document.getElementById("perfil-nacimiento");

  let usuarioCookie, usuarioActual;

  // 3) Abrir modal y poblar campos
  editBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    usuarioCookie = getUsuarioFromCookie();
    if (!usuarioCookie) {
      window.location.href = "../VIEW/Login.php";
      return;
    }

    try {
      // fetch usuario por correo/telefono/estatus
      const lista = await fetchUsuario(
        usuarioCookie.correo,
        usuarioCookie.telefono,
        usuarioCookie.estatus
      );
      // buscamos el que coincida con el id de la cookie
      usuarioActual =
        lista.find((u) => +u.id === +usuarioCookie.id) || lista[0];

      // rellenamos inputs
      inpNombre.value = usuarioActual.nombre || "";
      inpEmail.value = usuarioActual.correo || "";
      inpTel.value = usuarioActual.telefono || "";
      inpNac.value = usuarioActual.fecha_nacimiento || "";

      // dejamos password vacíos
      inpPass.value = "";
      inpPass2.value = "";

      // mostramos el modal
      modal.classList.add("active");
      document.body.classList.add("modal-abierto");
    } catch (err) {
      console.error(err);
      alert("Error al cargar datos de perfil.");
    }
  });

  // 4) Cerrar modal
  const cerrarModal = () => {
    modal.classList.remove("active");
    document.body.classList.remove("modal-abierto");
  };
  closeBtn.addEventListener("click", cerrarModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
  });

  // 5) Submit: actualizar usuario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // simple validación de contraseñas
    if (inpPass.value !== inpPass2.value) {
      return alert("Las contraseñas no coinciden.");
    }

    const payload = {
      id: usuarioActual.id,
      nombre: inpNombre.value.trim(),
      correo: inpEmail.value.trim(),
      telefono: inpTel.value.trim(),
      fecha_nacimiento: inpNac.value, // YYYY-MM-DD
      tipo_contacto: usuarioActual.tipo_contacto,
      password: inpPass.value || usuarioActual.password,
      estatus: usuarioActual.estatus,
    };

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
        alert(data.mensaje);
        // actualiza la cookie con los nuevos datos
        const nuevoUsuario = { ...usuarioCookie, ...payload };
        document.cookie =
          "usuario=" +
          encodeURIComponent(JSON.stringify(nuevoUsuario)) +
          "; path=/; max-age=" +
          24 * 60 * 60;
        // refresca perfil en sidebar
        renderPerfil(nuevoUsuario);
      }
    } catch (err) {
      console.error(err);
      alert("Error al actualizar perfil.");
    } finally {
      cerrarModal();
    }
  });
});
