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

// Elementos principales
const modal = document.getElementById("modal-inscripcion");
const abrirBtn = document.getElementById("abrir-modal-inscripcion");
const cerrarBtn = document.querySelector(".cerrar-modal");
const checkboxCuenta = document.getElementById("ya-tengo-cuenta");
const titulo = document.querySelector(".titulo-modal");
const camposRegistro = document.querySelector(".campos-registro");
const camposLogin = document.querySelector(".campos-login");
const errorCuenta = document.getElementById("error-cuenta");
const alertaRepetido = document.getElementById("alerta-usuario-repetido");
const buscarBtn = document.getElementById("buscar-cuenta");
const volverRegistro = document.getElementById("volver-a-registro");
const cursoNombreInput = document.getElementById("curso-nombre");
const loginInput = document.getElementById("login-identificador");
const formInscripcion = document.getElementById("form-inscripcion");

// ENDPOINTS
const ENDPOINT_CONSULTA =
  "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_usuario.php";
const ENDPOINT_INSERTAR =
  "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_usuario.php";
const ENDPOINT_INSCRIPCION =
  "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_inscripcion.php";

// Toast personalizado
const mostrarToast = (mensaje, tipo = "exito") => {
  const toast = document.createElement("div");
  toast.className = `toast toast-${tipo}`;
  toast.textContent = mensaje;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("visible"), 100);
  setTimeout(() => toast.classList.remove("visible"), 4000);
  setTimeout(() => toast.remove(), 5000);
};

// Mostrar modal
const abrirModal = () => {
  modal.classList.add("mostrar");
  document.body.classList.add("modal-abierto");
  limpiarFormulario();
  cursoNombreInput.value = nombreCursoGlobal;
};

// Cerrar modal
const cerrarModal = () => {
  modal.classList.remove("mostrar");
  document.body.classList.remove("modal-abierto");
  limpiarFormulario();
};

// Limpiar formulario
const limpiarFormulario = () => {
  if (formInscripcion) formInscripcion.reset();
  toggleFormularios(false);
  ocultarMensaje();
  volverRegistro.classList.remove("mostrar");
  loginInput.value = "";
  alertaRepetido.style.display = "none";
  document.querySelectorAll('input[name="medios-contacto"]').forEach((cb) => {
    cb.checked = false;
  });
};

// Alternar entre login y registro
const toggleFormularios = (mostrarLogin) => {
  titulo.style.display = mostrarLogin ? "none" : "flex";
  checkboxCuenta.checked = mostrarLogin;
  camposRegistro.classList.toggle("mostrar", !mostrarLogin);
  camposLogin.classList.toggle("mostrar", mostrarLogin);
};

// Mensajes reutilizables (para el bloque de errores/éxitos en login/registro)
const mostrarMensaje = (mensaje, tipo = "error") => {
  errorCuenta.textContent = mensaje;
  errorCuenta.classList.add("mostrar", tipo);
  errorCuenta.classList.remove(tipo === "error" ? "exito" : "error");
  volverRegistro.classList.toggle("mostrar", tipo === "error");
  setTimeout(() => ocultarMensaje(), 5000);
};

const ocultarMensaje = () => {
  errorCuenta.classList.remove("mostrar", "exito", "error");
  errorCuenta.textContent = "";
  volverRegistro.classList.remove("mostrar");
};

// Buscar cuenta existente
const buscarCuentaExistente = async () => {
  const identificador = loginInput.value.trim().toLowerCase();
  if (!identificador)
    return mostrarMensaje(
      "Ingresa un correo o teléfono para buscar tu cuenta."
    );
  try {
    const res = await fetch(ENDPOINT_CONSULTA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: identificador, telefono: identificador }),
    });

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      llenarFormulario(data[0]);
      mostrarMensaje("Cuenta encontrada correctamente.", "exito");
    } else {
      mostrarMensaje("No se encontró la cuenta. Verifica los datos.", "error");
    }
  } catch (err) {
    mostrarMensaje("Error al buscar cuenta.", "error");
    console.error(err);
  }
};

// Llenar campos desde cuenta encontrada
const llenarFormulario = (cuenta) => {
  document.getElementById("nombre").value = cuenta.nombre || "";
  document.getElementById("telefono").value = cuenta.telefono || "";
  document.getElementById("correo").value = cuenta.correo || "";
  document.getElementById("fecha-nacimiento").value =
    cuenta.fecha_nacimiento || "";
  cursoNombreInput.value = nombreCursoGlobal;

  document.querySelectorAll('input[name="medios-contacto"]').forEach((cb) => {
    cb.checked =
      cuenta.tipo_contacto == 3 ||
      cb.value === (cuenta.tipo_contacto == 1 ? "telefono" : "correo");
  });

  toggleFormularios(false);
};

// Validar medios de contacto seleccionados
const validarMediosContacto = () => {
  return (
    Array.from(
      document.querySelectorAll('input[name="medios-contacto"]:checked')
    ).length > 0
  );
};

// Validar duplicados en tiempo real
const validarDuplicados = async () => {
  const telefono = document.getElementById("telefono").value.trim();
  const correo = document.getElementById("correo").value.trim();

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
    alertaRepetido.style.display =
      Array.isArray(data) && data.length > 0 ? "block" : "none";
  } catch (err) {
    console.warn("Error validando duplicados:", err);
  }
};

// Tipo de contacto: 1 = teléfono, 2 = correo, 3 = ambos
const obtenerTipoContacto = () => {
  const seleccionados = Array.from(
    document.querySelectorAll('input[name="medios-contacto"]:checked')
  ).map((cb) => cb.value);
  return seleccionados.includes("telefono") && seleccionados.includes("correo")
    ? 3
    : seleccionados.includes("telefono")
    ? 1
    : seleccionados.includes("correo")
    ? 2
    : 0;
};

// Enviar inscripción
formInscripcion.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validarMediosContacto()) {
    alert("Selecciona al menos un medio de contacto.");
    return;
  }

  const nombre = document.getElementById("nombre").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const fecha_nacimiento = document.getElementById("fecha-nacimiento").value;
  const tipo_contacto = obtenerTipoContacto();

  if (!nombre || !telefono || !correo || !fecha_nacimiento) {
    alert("Por favor completa todos los campos.");
    return;
  }

  try {
    // Validar duplicado
    const checkRes = await fetch(ENDPOINT_CONSULTA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, telefono }),
    });
    const checkData = await checkRes.json();

    let idUsuario = null;

    if (Array.isArray(checkData) && checkData.length > 0) {
      idUsuario = checkData[0].id;
    } else {
      // Insertar usuario
      const insertRes = await fetch(ENDPOINT_INSERTAR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          correo,
          telefono,
          fecha_nacimiento,
          tipo_contacto,
          password: "godcode123",
        }),
      });

      const insertData = await insertRes.json();

      if (insertData?.mensaje === "Usuario registrado correctamente") {
        const nuevoRes = await fetch(ENDPOINT_CONSULTA, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, telefono }),
        });
        const nuevoUsuario = await nuevoRes.json();
        idUsuario = nuevoUsuario[0]?.id;
      } else {
        throw new Error("No se pudo registrar el usuario.");
      }
    }

    // Inscripción
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
    mostrarToast(
      inscData?.mensaje || "Inscripción completada correctamente",
      "exito"
    );
    formInscripcion.reset();
  } catch (err) {
    console.error("Error en inscripción:", err);
    mostrarToast("Hubo un error al procesar tu inscripción.", "error");
  }
});

// Listeners
abrirBtn.addEventListener("click", abrirModal);
cerrarBtn.addEventListener("click", cerrarModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModal();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarModal();
});
checkboxCuenta.addEventListener("change", () =>
  toggleFormularios(checkboxCuenta.checked)
);
buscarBtn.addEventListener("click", buscarCuentaExistente);
volverRegistro.addEventListener("click", (e) => {
  e.preventDefault();
  toggleFormularios(false);
});
document
  .getElementById("telefono")
  .addEventListener("input", validarDuplicados);
document.getElementById("correo").addEventListener("input", validarDuplicados);
