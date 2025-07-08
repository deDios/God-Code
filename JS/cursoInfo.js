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

console.log("DOM cargado - Modal Inscripción Ready");

const modal = document.getElementById("modal-inscripcion");
const abrirBtn = document.getElementById("abrir-modal-inscripcion");
const cerrarBtn = document.querySelector(".cerrar-modal");

const checkboxCuenta = document.getElementById("ya-tengo-cuenta");
const titulo = document.querySelector(".titulo-modal");
const camposRegistro = document.querySelector(".campos-registro");
const camposLogin = document.querySelector(".campos-login");
const errorCuenta = document.getElementById("error-cuenta");
const buscarBtn = document.getElementById("buscar-cuenta");
const volverRegistro = document.getElementById("volver-a-registro");
const cursoNombreInput = document.getElementById("curso-nombre");
const loginInput = document.getElementById("login-identificador");
const formInscripcion = document.getElementById("form-inscripcion");

const alertaRepetido = document.getElementById("alerta-usuario-repetido");
const inputTelefono = document.getElementById("telefono");
const inputCorreo = document.getElementById("correo");

const ENDPOINT_CONSULTA =
  "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_usuario.php";
const ENDPOINT_INSERCION =
  "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_usuario.php";
const ENDPOINT_INSCRIPCION =
  "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_inscripcion.php";

// ----------------------------- abrir/cerrar Modal -----------------------------
const abrirModal = () => {
  console.log("Abriendo modal...");
  modal.classList.add("mostrar");
  document.body.classList.add("modal-abierto");
  limpiarFormulario();
  cursoNombreInput.value = nombreCursoGlobal;
};

const cerrarModal = () => {
  console.log("Cerrando modal...");
  modal.classList.remove("mostrar");
  document.body.classList.remove("modal-abierto");
  limpiarFormulario();
};

// ----------------------------- limpiar formulario -----------------------------

const limpiarFormulario = () => {
  formInscripcion.reset();
  toggleFormularios(false);
  ocultarMensaje();
  alertaRepetido.style.display = "none";
  volverRegistro.classList.remove("mostrar");
  loginInput.value = "";
  document
    .querySelectorAll('input[name="medios-contacto"]')
    .forEach((cb) => (cb.checked = false));
};

// ----------------------------- cambiar entre registro y encontrar usuario -----------------------------
const toggleFormularios = (mostrarLogin) => {
  titulo.style.display = mostrarLogin ? "none" : "flex";
  checkboxCuenta.checked = mostrarLogin;

  if (mostrarLogin) {
    camposRegistro.classList.remove("mostrar");
    camposLogin.classList.add("mostrar");
  } else {
    camposRegistro.classList.add("mostrar");
    camposLogin.classList.remove("mostrar");
  }
};

// ----------------------------- usuarios dummy -----------------------------
const cuentasSimuladas = [
  {
    nombre: "Juan Pérez",
    telefono: "5551234567",
    correo: "juan@godcode.com",
    fecha: "1990-01-01",
    medio: ["correo", "telefono"],
  },
];

const buscarCuentaExistente = () => {
  const valor = loginInput.value.trim().toLowerCase();
  const cuenta = cuentasSimuladas.find(
    (c) => c.telefono === valor || c.correo === valor
  );

  if (cuenta) {
    mostrarMensaje("Cuenta encontrada correctamente.", "exito");
    llenarFormulario(cuenta);
  } else {
    mostrarMensaje(
      "Lo sentimos, no pudimos encontrar tu cuenta. Verifica que el correo o número de teléfono estén escritos correctamente o regístrate para crear una nueva cuenta.",
      "error"
    );
  }
};

const llenarFormulario = (cuenta) => {
  document.getElementById("nombre").value = cuenta.nombre || "";
  document.getElementById("telefono").value = cuenta.telefono || "";
  document.getElementById("correo").value = cuenta.correo || "";
  document.getElementById("fecha-nacimiento").value = cuenta.fecha || "";
  cursoNombreInput.value = nombreCursoGlobal;

  document.querySelectorAll('input[name="medios-contacto"]').forEach((cb) => {
    cb.checked = cuenta.medio?.includes(cb.value);
  });

  toggleFormularios(false);
};

// ----------------------------- mostrar mensajes de error -----------------------------

const mostrarMensaje = (mensaje, tipo = "error") => {
  errorCuenta.textContent = mensaje;
  errorCuenta.classList.add("mostrar");
  errorCuenta.classList.remove("exito", "error");
  errorCuenta.classList.add(tipo);
  volverRegistro.classList.toggle("mostrar", tipo === "error");

  setTimeout(() => {
    ocultarMensaje();
  }, 5000);
};

const ocultarMensaje = () => {
  errorCuenta.classList.remove("mostrar", "exito", "error");
  errorCuenta.textContent = "";
  volverRegistro.classList.remove("mostrar");
};

// ----------------------------- validar medios -----------------------------

const validarMediosContacto = () => {
  const mediosSeleccionados = Array.from(
    document.querySelectorAll('input[name="medios-contacto"]:checked')
  );
  return mediosSeleccionados.length > 0;
};

// ----------------------------- validar duplicados en tiempo real -----------------------------

async function validarDuplicados() {
  const telefono = inputTelefono.value.trim();
  const correo = inputCorreo.value.trim();

  if (!telefono && !correo) {
    alertaRepetido.style.display = "none";
    return;
  }

  try {
    const res = await fetch(ENDPOINT_CONSULTA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, telefono }),
    });

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      alertaRepetido.style.display = "block";
    } else {
      alertaRepetido.style.display = "none";
    }
  } catch (err) {
    console.warn("Error validando duplicados:", err);
  }
}

// ----------------------------- enviar inscripcion -----------------------------

formInscripcion.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validarMediosContacto()) {
    alert("Por favor selecciona al menos un medio de contacto.");
    return;
  }

  if (alertaRepetido.style.display === "block") {
    alert("No puedes registrar un correo o teléfono ya existente.");
    return;
  }

  const nombre = document.getElementById("nombre").value.trim();
  const telefono = inputTelefono.value.trim();
  const correo = inputCorreo.value.trim();
  const fecha_nacimiento = document.getElementById("fecha-nacimiento").value;
  const tipo_contacto = calcularTipoContacto();
  const password = "godcode123";

  try {
    console.log("Registrando usuario nuevo...");
    const resUsuario = await fetch(ENDPOINT_INSERCION, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        correo,
        telefono,
        tipo_contacto,
        fecha_nacimiento,
        password,
      }),
    });

    const dataUsuario = await resUsuario.json();
    console.log("Respuesta de registro:", dataUsuario);

    if (dataUsuario.mensaje !== "Usuario registrado correctamente") {
      throw new Error("No se pudo registrar el usuario.");
    }

    const resConsulta = await fetch(ENDPOINT_CONSULTA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, telefono }),
    });

    const dataConsulta = await resConsulta.json();
    const usuarioId = Array.isArray(dataConsulta)
      ? dataConsulta[0]?.id
      : dataConsulta?.id;

    if (!usuarioId) throw new Error("No se pudo obtener el ID del usuario");

    const resInscripcion = await fetch(ENDPOINT_INSCRIPCION, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        curso: idCursoGlobal,
        usuario: usuarioId,
        comentario: "",
      }),
    });

    const dataInscripcion = await resInscripcion.json();
    console.log("Respuesta de inscripción:", dataInscripcion);
    mostrarMensaje("Inscripción completada exitosamente.", "exito");

    setTimeout(cerrarModal, 3000);
  } catch (error) {
    console.error("Error en inscripción:", error);
    alert("Ocurrió un error al registrar la inscripción.");
  }
});

// ----------------------------- utilidades -----------------------------

const calcularTipoContacto = () => {
  const medios = Array.from(
    document.querySelectorAll('input[name="medios-contacto"]:checked')
  ).map((cb) => cb.value);

  if (medios.includes("telefono") && medios.includes("correo")) return 3;
  if (medios.includes("telefono")) return 1;
  if (medios.includes("correo")) return 2;
  return 0;
};

// ----------------------------- eventos -----------------------------

abrirBtn?.addEventListener("click", abrirModal);
cerrarBtn?.addEventListener("click", cerrarModal);

modal?.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModal();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarModal();
});

checkboxCuenta?.addEventListener("change", () => {
  toggleFormularios(checkboxCuenta.checked);
});

buscarBtn?.addEventListener("click", buscarCuentaExistente);

volverRegistro?.addEventListener("click", (e) => {
  e.preventDefault();
  toggleFormularios(false);
});

inputTelefono?.addEventListener("input", validarDuplicados);
inputCorreo?.addEventListener("input", validarDuplicados);
