//--------------- aca termina el js de la pesteña emergente
let nombreCursoGlobal = "";
let idCursoGlobal = 0;
//apartado para recuperar los datos del curso segun su id
document.addEventListener("DOMContentLoaded", async () => {
  console.log("1. DOM completamente cargado - Iniciando script");

  // se obtiene el curso con la id que enviamos por la url
  const urlParams = new URLSearchParams(window.location.search);
  const cursoId = urlParams.get("id");
  console.log("2. ID obtenido de la URL:", cursoId);
  idCursoGlobal = cursoId;

  if (!cursoId) {
    console.error("3. No se encontró ID de curso en la URL");
    mostrarError("No se encontró ID de curso en la URL");
    return;
  }

  const elementos = {
    nombre: document.querySelector("#curso .curso-contenido h4"),
    titulo: document.querySelector("#curso .curso-contenido .titulo"),
    descCorta: document.querySelector(
      "#curso .curso-contenido .descripcion-corta"
    ),
    descMedia: document.querySelector(
      "#curso .curso-contenido .descripcion-media"
    ),
    imagen: document.querySelector("#curso .curso-contenido img"),
    descripcion: document.querySelector(
      "#curso .curso-contenido .texto-descriptivo"
    ),
    fechaInicio: document.querySelector("#curso .fecha-inicio"),

    precio: document.querySelector("#curso .curso-info .precio"),
    horas: document.querySelector("#curso .curso-info .horas"),
    actividades: document.querySelector("#curso .curso-info .actividades"),
    evaluacion: document.querySelector("#curso .curso-info .evaluacion"),
    calendario: document.querySelector("#curso .curso-info .calendario"),
    certificado: document.querySelector("#curso .curso-info .certificado"),

    tutorImg: document.querySelector("#curso-detalle-extra .instructor img"),
    tutorNombre: document.querySelector(
      "#curso-detalle-extra .instructor strong"
    ),
    tutorBio: document.querySelector(
      "#curso-detalle-extra .instructor p:last-child"
    ),
    dirigido: document.querySelector(
      "#curso-detalle-extra .dirigido .contenido p"
    ),
    competencias: document.querySelector(
      "#curso-detalle-extra .competencias .contenido p"
    ),

    otrosCursosContainer: document.querySelector("#otros-cursos .cards-cursos"),
    otrosCursosSection: document.querySelector("#otros-cursos"),
  };

  console.log("4. Elementos encontrados en el DOM:");
  Object.entries(elementos).forEach(([key, element]) => {
    console.log(`   - ${key}:`, element ? "Encontrado" : "NO encontrado");
  });

  try {
    // carga datos del curso seleccionado
    console.log("5. Cargando datos del curso...");
    const curso = await fetchData(
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_cursos.php",
      { estatus: 1 }
    ).then((cursos) => cursos.find((c) => c.id == cursoId));

    if (!curso) throw new Error("Curso no encontrado");
    console.log("6. Curso encontrado:", curso);
    nombreCursoGlobal = curso.nombre;
    idCursoGlobal = curso.id;
    console.log("cursoNombre:", curso.nombre);
    // carga los demas cursos relacionados
    console.log("7. Cargando datos relacionados...");
    const [tutor, actividades, tipoEvaluacion, calendario] = await Promise.all([
      fetchData(
        "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_tutor.php",
        { estatus: 1 }
      ).then((tutores) => tutores.find((t) => t.id == curso.tutor)),
      fetchData(
        "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_actividades.php",
        { estatus: 1 }
      ).then((acts) => acts.find((a) => a.id == curso.actividades)),
      fetchData(
        "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_tipo_evaluacion.php",
        { estatus: 1 }
      ).then((evaluaciones) =>
        evaluaciones.find((e) => e.id == curso.tipo_evaluacion)
      ),
      fetchData(
        "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_dias_curso.php",
        { estatus: 1 }
      ).then((dias) => dias.find((d) => d.id == curso.calendario)),
    ]);

    console.log("8. Datos relacionados cargados:", {
      tutor,
      actividades,
      tipoEvaluacion,
      calendario,
    });

    // cargar curso en DOM
    console.log("9. Actualizando DOM con datos del curso...");
    elementos.nombre.innerHTML = ``; //este es un espacio vacio para pruebas
    elementos.titulo.textContent = curso.nombre;
    elementos.descCorta.innerHTML = formatearTexto(curso.descripcion_breve);
    elementos.descMedia.innerHTML = formatearTexto(curso.descripcion_media);
    elementos.imagen.src = `../ASSETS/cursos/img${curso.id}.png`;
    elementos.imagen.alt = curso.nombre;
    elementos.descripcion.innerHTML = formatearTexto(curso.descripcion_curso);
    elementos.precio.textContent =
      curso.precio == 0
        ? "Gratuito"
        : `$${curso.precio.toLocaleString("es-MX", {
            minimumFractionDigits: 2,
          })}`;

    elementos.horas.textContent = `${curso.horas} Horas totales`;
    elementos.actividades.textContent = actividades.nombre;
    elementos.evaluacion.textContent = tipoEvaluacion.nombre;

    const fechaFormateada = formatearFecha(curso.fecha_inicio);
    elementos.calendario.textContent = `Inicia: ${fechaFormateada} (${calendario.nombre})`;

    elementos.certificado.textContent = `Certificado ${
      curso.certificado ? "incluido" : "no incluido"
    }`;

    if (tutor) {
      elementos.tutorImg.src = `../ASSETS/tutor/tutor_${tutor.id}.png`;
      elementos.tutorImg.alt = "../ASSETS/tutor/tutor_noEncontrado.png";
      elementos.tutorImg.onerror = function () {
        console.log("error al cargar imagen de tutor");
        this.src = "../ASSETS/tutor/tutor_noEncontrado.png";
      };
      elementos.tutorNombre.textContent = tutor.nombre;
      elementos.tutorBio.textContent =
        tutor.descripcion || "Experto en su campo";
    }

    elementos.dirigido.textContent = curso.dirigido;
    elementos.competencias.textContent = curso.competencias;

    // cargar cursos de la misma categoria
    console.log("10. Cargando otros cursos de la misma categoría...");
    const todosCursos = await fetchData(
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_cursos.php",
      { estatus: 1 }
    );

    const otrosCursos = todosCursos
      .filter((c) => c.categoria == curso.categoria && c.id != cursoId)
      .slice(0, 4);

    console.log(
      `11. Encontrados ${otrosCursos.length} cursos de la categoría ${curso.categoria}`
    );

    if (otrosCursos.length > 0) {
      elementos.otrosCursosContainer.innerHTML = otrosCursos
        .map(
          (curso) => `
      <a href="cursoInfo.php?id=${curso.id}" class="curso-link">
        <div class="card-curso">
            <img src="../ASSETS/cursos/img${curso.id}.png" alt="${
            curso.nombre
          }">
            <div class="card-contenido">
                <h4>${curso.nombre}</h4>
                <p>${curso.descripcion_breve}</p>
                <p class="info-curso">
                ${curso.horas} hrs | ${
            curso.precio === 0
              ? "Gratuito"
              : `$${curso.precio.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                })}`
          }
                </p>
            </div>
        </div>
      </a>
    `
        )
        .join("");
    } else {
      console.log("12. No hay otros cursos de la misma categoría");
      elementos.otrosCursosSection.style.display = "none";
    }

    console.log("13. Inicializando acordeones...");
    inicializarAcordeones();
  } catch (error) {
    console.error("14. Error en la carga:", error);
    mostrarError(error.message);
  }

  async function fetchData(url, body) {
    console.log(`Fetching data from ${url}`, body);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Error al cargar datos de ${url}`);
    }

    return response.json();
  }

  function formatearTexto(texto) {
    return (texto || "").toString().replace(/\n/g, "<br>");
  }

  function formatearFecha(fecha) {
    if (!fecha) return "Por definir";
    const opciones = { year: "numeric", month: "long", day: "numeric" };
    return new Date(fecha).toLocaleDateString("es-MX", opciones);
  }

  function mostrarError(mensaje) {
    const main = document.querySelector("main");
    if (main) {
      main.innerHTML = `
        <div class="error-message">
          <h3>¡Ocurrió un error!</h3>
          <p>${mensaje}</p>
          <a href="../VIEW/Blog.php" class="btn-principal">Volver a los cursos</a>
        </div>
      `;
    }
  }
});

function inicializarAcordeones() {
  const acordeones = document.querySelectorAll(
    "#curso-detalle-extra .cabecera"
  );
  acordeones.forEach((acordeon) => {
    acordeon.addEventListener("click", function () {
      const contenido = this.nextElementSibling;
      const icono = this.querySelector(".arrow-icon");

      if (contenido.style.display === "block") {
        contenido.style.display = "none";
        icono.style.transform = "rotate(0deg)";
      } else {
        contenido.style.display = "block";
        icono.style.transform = "rotate(180deg)";
      }
    });
  });
}

// ---------------------------------------- js para la pestaña emergente ---------------------------------------------------

// home-inscripcion.js

console.log("DOM cargado modal listo");

// ————— Elementos del DOM —————
const modal = document.getElementById("modal-inscripcion");
const abrirBtn = document.getElementById("abrir-modal-inscripcion");
const cerrarBtn = document.querySelector(".cerrar-modal");
const checkboxCuenta = document.getElementById("ya-tengo-cuenta");
const titulo = document.querySelector(".titulo-modal");
const camposRegistro = document.querySelector(".campos-registro");
const camposLogin = document.querySelector(".campos-login");
const buscarBtn = document.getElementById("buscar-cuenta");
const volverRegistro = document.getElementById("volver-a-registro");
const cursoNombreInput = document.getElementById("curso-nombre");
const loginInput = document.getElementById("login-identificador");
const formInscripcion = document.getElementById("form-inscripcion");
const telefonoInput = document.getElementById("telefono");
const correoInput = document.getElementById("correo");
const btnSubmit = document.querySelector(".btn-inscribirme");
const resumenContainer = document.getElementById("resumen-usuario-container");

// ————— Verificar que exista la variable global del curso —————
if (typeof idCursoGlobal === "undefined") {
  console.warn("idCursoGlobal no está definido, las inscripciones fallarán.");
}

// ————— Endpoints —————
const ENDPOINT_CONSULTA =
  "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_usuario.php";
const ENDPOINT_INSERTAR =
  "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_usuario.php";
const ENDPOINT_INSCRIPCION =
  "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_inscripcion.php";

// ————— Estado interno —————
let camposBloqueadosPorCuenta = false;
let cuentaEncontrada = null;

// ————— Forzar minúsculas on-the-fly —————
function soloMinusculas(input) {
  input.addEventListener("input", (e) => {
    const pos = e.target.selectionStart;
    e.target.value = e.target.value.toLowerCase();
    e.target.setSelectionRange(pos, pos);
  });
}
soloMinusculas(loginInput);
soloMinusculas(correoInput);

// ————— Validadores de formato —————
function esFormatoTelefono(val) {
  return /^\d{10,15}$/.test(val);
}
function esFormatoCorreo(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

// ————— Abrir / cerrar modal —————
const abrirModal = () => {
  modal.classList.add("mostrar");
  document.body.classList.add("modal-abierto");
  limpiarFormulario();
  cursoNombreInput.value = nombreCursoGlobal;
  // si hay sesión, precargar datos y bloquear
  const cookie = document.cookie
    .split("; ")
    .find((r) => r.startsWith("usuario="));
  if (cookie) {
    try {
      const datos = JSON.parse(decodeURIComponent(cookie.split("=")[1]));
      if (datos.id) {
        llenarFormulario(datos, true);
        bloquearCampos(true, true);
        checkboxCuenta.checked = false;
        checkboxCuenta.disabled = true;
        toggleFormularios(false);
      }
    } catch {}
  }
  modal.querySelector(".modal-contenido").scrollTop = 0;
};
const cerrarModal = () => {
  modal.classList.remove("mostrar");
  document.body.classList.remove("modal-abierto");
  limpiarFormulario();
};

// ————— Bloquear / desbloquear campos —————
function bloquearCampos(bloquear = true, bloquearToggle = false) {
  document.getElementById("nombre").readOnly = bloquear;
  telefonoInput.readOnly = bloquear;
  correoInput.readOnly = bloquear;
  document.getElementById("fecha-nacimiento").readOnly = bloquear;
  document
    .querySelectorAll('input[name="medios-contacto"]')
    .forEach((cb) => (cb.disabled = bloquear));
  buscarBtn.disabled = bloquear;
  // deshabilitar/enabled el botón de registro manual
  btnSubmit.disabled = bloquear;
  btnSubmit.classList.toggle("disabled", bloquear);
  if (bloquearToggle) checkboxCuenta.disabled = true;
  camposBloqueadosPorCuenta = bloquear;
}
function desbloquearCampos() {
  camposBloqueadosPorCuenta = false;
  bloquearCampos(false, false);
}

// ————— Limpiar formulario —————
const limpiarFormulario = () => {
  formInscripcion.reset();
  toggleFormularios(false);
  volverRegistro.classList.remove("mostrar");
  loginInput.value = "";
  btnSubmit.disabled = false;
  btnSubmit.classList.remove("disabled");
  desbloquearCampos();
  checkboxCuenta.disabled = false;
  resumenContainer.innerHTML = ""; // limpiar resumen
  document.querySelectorAll(".icono-alerta").forEach((el) => {
    el.textContent = "";
    el.classList.remove("valido");
  });
  document
    .querySelectorAll('input[name="medios-contacto"]')
    .forEach((cb) => (cb.checked = false));
  document
    .querySelectorAll(".input-alerta-container")
    .forEach((c) => c.classList.remove("alerta"));
  buscarBtn.classList.remove("disabled");
};

// ————— Alternar login/registro —————
const toggleFormularios = (mostrarLogin) => {
  titulo.style.display = mostrarLogin ? "none" : "flex";
  checkboxCuenta.checked = mostrarLogin;
  camposRegistro.classList.toggle("mostrar", !mostrarLogin);
  camposLogin.classList.toggle("mostrar", mostrarLogin);
  cursoNombreInput.value = nombreCursoGlobal;
  if (!mostrarLogin && !camposBloqueadosPorCuenta) desbloquearCampos();
};

// ————— Buscar cuenta existente —————
async function buscarCuentaExistente() {
  const iden = loginInput.value.trim().toLowerCase();
  if (!iden) {
    gcToast("Ingresa un correo o teléfono.", "warning");
    return;
  }
  if (document.cookie.split("; ").find((r) => r.startsWith("usuario="))) {
    gcToast("Ya has iniciado sesión. No puedes buscar otra cuenta.", "warning");
    return;
  }
  // formato antes de red
  if (!(esFormatoCorreo(iden) || esFormatoTelefono(iden))) {
    gcToast("Formato inválido. Usa correo o teléfono válido.", "warning");
    return;
  }
  try {
    const res = await fetch(ENDPOINT_CONSULTA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: iden, telefono: iden }),
    });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      cuentaEncontrada = data[0];
      gcToast("Cuenta encontrada correctamente.", "exito");
      crearResumenUsuario(cuentaEncontrada);
    } else {
      gcToast("No encontramos tu cuenta.", "warning");
      loginInput.value = "";
      loginInput.focus();
    }
  } catch (err) {
    console.error("Error al consultar cuenta:", err);
    gcToast("Error al consultar la cuenta.", "error");
  }
}

// ————— Crear resumen de usuario —————
function crearResumenUsuario(cuenta) {
  resumenContainer.innerHTML = "";
  resumenContainer.insertAdjacentHTML(
    "beforeend",
    `
    <form class="resumen-usuario">
      <div><strong>Nombre:</strong> ${cuenta.nombre}</div>
      <div><strong>Teléfono:</strong> ${cuenta.telefono}</div>
      <div><strong>Correo:</strong> ${cuenta.correo}</div>
      <div><strong>Fecha Nac.:</strong> ${new Date(
        cuenta.fecha_nacimiento
      ).toLocaleDateString()}</div>
      <button type="button" id="inscribir-con-cuenta" class="btn-inscribirme">
        Inscribirme con esta cuenta
      </button>
    </form>
  `
  );
  document
    .getElementById("inscribir-con-cuenta")
    .addEventListener("click", () => enviarInscripcion(cuenta.id));
}

// ————— Validación de campo (formato + duplicados) —————
async function validarCampo(input) {
  const cont = input.closest(".input-alerta-container");
  const icono = cont.querySelector(".icono-alerta");
  const val = input.value.trim();
  let ok = true;

  if (input === telefonoInput) ok = esFormatoTelefono(val);
  else if (input === correoInput) ok = esFormatoCorreo(val);

  if (!ok) {
    cont.classList.add("alerta");
    icono.textContent = "⚠️";
    icono.classList.remove("valido");
    btnSubmit.disabled = true;
    buscarBtn.disabled = true;
    return;
  }

  cont.classList.remove("alerta");
  icono.textContent = val ? "✅" : "";
  icono.classList.toggle("valido", !!val);

  if (checkboxCuenta.checked) {
    await validarDuplicados();
  }

  const anyAlert =
    document.querySelectorAll(".input-alerta-container.alerta").length > 0;
  btnSubmit.disabled = anyAlert;
  buscarBtn.disabled = anyAlert;
}

// ————— Validar duplicados puro —————
async function validarDuplicados() {
  const tel = telefonoInput.value.trim();
  const cor = correoInput.value.trim();
  const telCont = telefonoInput.closest(".input-alerta-container");
  const corCont = correoInput.closest(".input-alerta-container");
  const telIcon = telCont.querySelector(".icono-alerta");
  const corIcon = corCont.querySelector(".icono-alerta");

  telCont.classList.remove("alerta");
  corCont.classList.remove("alerta");
  telIcon.textContent = "";
  corIcon.textContent = "";

  let warning = false;
  try {
    const res = await fetch(ENDPOINT_CONSULTA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefono: tel, correo: cor }),
    });
    const data = await res.json();
    let msg = "Ya existe una cuenta con ese ";
    if (tel && data.some((d) => d.telefono === tel)) {
      telCont.classList.add("alerta");
      telIcon.textContent = "⚠️";
      msg += "teléfono ";
      warning = true;
    }
    if (cor && data.some((d) => d.correo === cor)) {
      corCont.classList.add("alerta");
      corIcon.textContent = "⚠️";
      msg += tel ? "y correo" : "correo";
      warning = true;
    }
    if (warning) gcToast(msg.trim(), "warning");
  } catch (e) {
    console.warn("Error validarDuplicados:", e);
  }
}

// ————— Listeners de validación de campo —————
telefonoInput.addEventListener("input", () => validarCampo(telefonoInput));
correoInput.addEventListener("input", () => validarCampo(correoInput));
telefonoInput.addEventListener("blur", () => validarCampo(telefonoInput));
correoInput.addEventListener("blur", () => validarCampo(correoInput));

// ————— Enviar inscripción (resumen) —————
async function enviarInscripcion(usuarioId) {
  try {
    const res = await fetch(ENDPOINT_INSCRIPCION, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        curso: idCursoGlobal,
        usuario: usuarioId,
        comentario: "",
      }),
    });
    const data = await res.json();
    gcToast(data.mensaje || "Inscripción completada.", "exito", 6000);
    cerrarModal();
  } catch (e) {
    console.error("Error en inscripción:", e);
    gcToast("Error al procesar inscripción.", "error");
  }
}

// ————— Enviar inscripción (registro manual) —————
formInscripcion.addEventListener("submit", async (e) => {
  e.preventDefault();
  btnSubmit.disabled = true;
  btnSubmit.classList.add("disabled");

  if (
    !document.querySelectorAll('input[name="medios-contacto"]:checked').length
  ) {
    gcToast("Selecciona al menos un medio de contacto.", "warning");
    btnSubmit.disabled = false;
    btnSubmit.classList.remove("disabled");
    return;
  }

  const nombre = document.getElementById("nombre").value.trim();
  const telefono = telefonoInput.value.trim();
  const correo = correoInput.value.trim();
  const fecha_nac = document.getElementById("fecha-nacimiento").value;
  const tipo_contacto = obtenerTipoContacto();

  if (!nombre || !telefono || !correo || !fecha_nac) {
    gcToast("Completa todos los campos.", "warning");
    btnSubmit.disabled = false;
    btnSubmit.classList.remove("disabled");
    return;
  }
  if (!esFormatoCorreo(correo)) {
    gcToast("El correo no es válido.", "warning");
    btnSubmit.disabled = false;
    btnSubmit.classList.remove("disabled");
    return;
  }
  if (!esFormatoTelefono(telefono)) {
    gcToast("El teléfono no es válido.", "warning");
    btnSubmit.disabled = false;
    btnSubmit.classList.remove("disabled");
    return;
  }

  try {
    // verificar si existe usuario
    let idUsuario = null;
    const chkRes = await fetch(ENDPOINT_CONSULTA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, telefono }),
    });
    const chkData = await chkRes.json();
    if (Array.isArray(chkData) && chkData.length > 0) {
      idUsuario = chkData[0].id;
    } else {
      // crear usuario
      const createRes = await fetch(ENDPOINT_INSERTAR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          correo,
          telefono,
          fecha_nacimiento: fecha_nac,
          tipo_contacto,
          password: "godcode123",
        }),
      });
      const createData = await createRes.json();
      if (!createData.mensaje.toLowerCase().includes("registrado")) {
        throw new Error(createData.mensaje || "Error al crear usuario.");
      }
      // volver a consultar
      const newChk = await fetch(ENDPOINT_CONSULTA, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, telefono }),
      });
      const newData = await newChk.json();
      idUsuario = newData[0]?.id;
    }
    // inscribir
    const inscRes = await fetch(ENDPOINT_INSCRIPCION, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        curso: idCursoGlobal,
        usuario: idUsuario,
        comentario: "",
      }),
    });
    const inscData = await inscRes.json();
    gcToast(inscData.mensaje || "Inscripción completada.", "exito", 6000);
  } catch (err) {
    console.error("Error en flujo inscripción:", err);
    gcToast(err.message || "Error al procesar inscripción.", "error");
  }
});

// ————— Auxiliar: determinar tipo de contacto —————
function obtenerTipoContacto() {
  const sel = Array.from(
    document.querySelectorAll('input[name="medios-contacto"]:checked')
  ).map((cb) => cb.value);
  if (sel.includes("telefono") && sel.includes("correo")) return 3;
  if (sel.includes("telefono")) return 1;
  if (sel.includes("correo")) return 2;
  return 0;
}

// ————— Listeners generales —————
checkboxCuenta.addEventListener("change", () => {
  const modo = checkboxCuenta.checked;
  toggleFormularios(modo);
  if (!modo) {
    // limpiar resumen si volvemos al registro
    resumenContainer.innerHTML = "";
    cuentaEncontrada = null;
  }
  [loginInput, telefonoInput, correoInput].forEach((i) => {
    if (modo) i.addEventListener("keydown", onEnterBuscar);
    else i.removeEventListener("keydown", onEnterBuscar);
  });
});
function onEnterBuscar(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    buscarCuentaExistente();
  }
}
abrirBtn.addEventListener("click", abrirModal);
cerrarBtn.addEventListener("click", cerrarModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModal();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarModal();
});
buscarBtn.addEventListener("click", buscarCuentaExistente);
volverRegistro.addEventListener("click", (e) => {
  e.preventDefault();
  toggleFormularios(false);
  desbloquearCampos();
  checkboxCuenta.disabled = false;
  resumenContainer.innerHTML = "";
  cuentaEncontrada = null;
});
