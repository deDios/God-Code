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

    elementos.certificado.textContent = `Certificado ${curso.certificado ? "incluido" : "no incluido"
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
            <img src="../ASSETS/cursos/img${curso.id}.png" alt="${curso.nombre
            }">
            <div class="card-contenido">
                <h4>${curso.nombre}</h4>
                <p>${curso.descripcion_breve}</p>
                <p class="info-curso">
                ${curso.horas} hrs | ${curso.precio === 0
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
console.log("DOM cargado modal listo");

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

const ENDPOINT_CONSULTA =
  "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_usuario.php";
const ENDPOINT_INSERTAR =
  "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_usuario.php";
const ENDPOINT_INSCRIPCION =
  "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_inscripcion.php";

// mostrar notificación tipo toast
function mostrarToast(mensaje, tipo = "exito", duracion = 5000) {
  const contenedor = document.querySelector(".toast-container");
  if (!contenedor) return;

  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;

  contenedor.appendChild(toast);
  setTimeout(() => toast.classList.add("mostrar"), 10);
  setTimeout(() => {
    toast.classList.remove("mostrar");
    setTimeout(() => contenedor.removeChild(toast), 400);
  }, duracion);
}

// mostrar/ocultar modal
const abrirModal = () => {
  modal.classList.add("mostrar");
  document.body.classList.add("modal-abierto");
  limpiarFormulario();
  cursoNombreInput.value = nombreCursoGlobal;
};

const cerrarModal = () => {
  modal.classList.remove("mostrar");
  document.body.classList.remove("modal-abierto");
  limpiarFormulario();
};

// limpiar formulario y estados visuales
const limpiarFormulario = () => {
  formInscripcion.reset();
  toggleFormularios(false);
  volverRegistro.classList.remove("mostrar");
  loginInput.value = "";
  btnSubmit.disabled = false;
  btnSubmit.classList.remove("disabled");

  document.querySelectorAll(".icono-alerta").forEach((el) => {
    el.textContent = "";
    el.classList.remove("valido");
  });

  document.querySelectorAll('input[name="medios-contacto"]').forEach((cb) => {
    cb.checked = false;
  });

  document.querySelectorAll(".input-alerta-container").forEach((c) => {
    c.classList.remove("alerta");
  });

  buscarBtn.classList.remove("disabled");
};

// alternar entre login y registro
const toggleFormularios = (mostrarLogin) => {
  titulo.style.display = mostrarLogin ? "none" : "flex";
  checkboxCuenta.checked = mostrarLogin;
  camposRegistro.classList.toggle("mostrar", !mostrarLogin);
  camposLogin.classList.toggle("mostrar", mostrarLogin);
  cursoNombreInput.value = nombreCursoGlobal;
};

// mensaje de error o alerta visual
const mostrarMensaje = (mensaje, tipo = "error") => {
  volverRegistro.classList.toggle("mostrar", tipo === "error");
  mostrarToast(mensaje, tipo);
};

// buscar cuenta existente
const buscarCuentaExistente = async () => {
  const identificador = loginInput.value.trim().toLowerCase();
  if (!identificador)
    return mostrarMensaje("Ingresa un correo o teléfono.", "warning");

  try {
    const res = await fetch(ENDPOINT_CONSULTA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: identificador, telefono: identificador }),
    });

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      mostrarToast("Cuenta encontrada correctamente.", "exito");
      llenarFormulario(data[0]);
    } else {
      mostrarToast("No encontramos tu cuenta.", "warning");
    }
  } catch (err) {
    mostrarToast("Error al consultar la cuenta.", "error");
  }
};

// llenar campos con datos de cuenta encontrada
const llenarFormulario = (cuenta) => {
  document.getElementById("nombre").value = cuenta.nombre || "";
  document.getElementById("telefono").value = cuenta.telefono || "";
  document.getElementById("correo").value = cuenta.correo || "";
  document.getElementById("fecha-nacimiento").value =
    cuenta.fecha_nacimiento || "";

  document.querySelectorAll('input[name="medios-contacto"]').forEach((cb) => {
    cb.checked =
      cuenta.tipo_contacto == 3 ||
      cb.value === (cuenta.tipo_contacto == 1 ? "telefono" : "correo");
  });

  toggleFormularios(false);
  document.querySelectorAll(".input-alerta-container").forEach((c) =>
    c.classList.remove("alerta")
  );
  btnSubmit.disabled = false;
  btnSubmit.classList.remove("disabled");
};

//validar al menos un medio de contacto
const validarMediosContacto = () => {
  return (
    document.querySelectorAll('input[name="medios-contacto"]:checked').length >
    0
  );
};

// validar duplicados y mostrar alertas
const validarDuplicados = async () => {
  const telefono = telefonoInput.value.trim();
  const correo = correoInput.value.trim();
  let warning = false;

  const telIcono = telefonoInput
    .closest(".input-alerta-container")
    .querySelector(".icono-alerta");
  const correoIcono = correoInput
    .closest(".input-alerta-container")
    .querySelector(".icono-alerta");

  telefonoInput.closest(".input-alerta-container").classList.remove("alerta");
  correoInput.closest(".input-alerta-container").classList.remove("alerta");
  telIcono.textContent = "";
  correoIcono.textContent = "";

  if (!telefono && !correo) return;

  try {
    const res = await fetch(ENDPOINT_CONSULTA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefono, correo }),
    });

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      let mensaje = "Ya existe una cuenta con ese ";

      if (telefono && data.some((d) => d.telefono === telefono)) {
        telefonoInput
          .closest(".input-alerta-container")
          .classList.add("alerta");
        telIcono.textContent = "⚠️";
        mensaje += "teléfono ";
        warning = true;
      }

      if (correo && data.some((d) => d.correo === correo)) {
        correoInput.closest(".input-alerta-container").classList.add("alerta");
        correoIcono.textContent = "⚠️";
        mensaje += telefono ? "y correo" : "correo";
        warning = true;
      }

      mostrarToast(mensaje.trim(), "warning");
    }
  } catch (err) {
    console.warn("Error validando duplicados:", err);
  }

  buscarBtn.classList.toggle("disabled", warning);
  btnSubmit.disabled = warning;
  btnSubmit.classList.toggle("disabled", warning);
};

telefonoInput.addEventListener("blur", () => validarCampoValido(telefonoInput));
correoInput.addEventListener("blur", () => validarCampoValido(correoInput));

function validarCampoValido(input) {
  const campos = [
    { input: telefonoInput, id: "telefono" },
    { input: correoInput, id: "correo" },
  ];

  campos.forEach(({ input: campo, id }) => {
    const contenedor = campo.closest(".input-alerta-container");
    const icono = contenedor.querySelector(".icono-alerta");
    const valor = campo.value.trim();
    const tieneWarning = contenedor.classList.contains("alerta");

    if (tieneWarning) {
      icono.textContent = "⚠️";
      icono.classList.remove("valido");
    } else if (valor) {
      icono.textContent = "✅";
      icono.classList.add("valido");
    } else {
      icono.textContent = "";
      icono.classList.remove("valido");
    }
  });

  const algunWarning =
    document.querySelectorAll(".input-alerta-container.alerta").length > 0;
  buscarBtn.classList.toggle("disabled", algunWarning);
  btnSubmit.disabled = algunWarning;
  btnSubmit.classList.toggle("disabled", algunWarning);
}

// tipo de contacto: 1 = tel, 2 = correo, 3 = ambos
const obtenerTipoContacto = () => {
  const seleccionados = Array.from(
    document.querySelectorAll('input[name="medios-contacto"]:checked')
  ).map((cb) => cb.value);
  if (seleccionados.includes("telefono") && seleccionados.includes("correo"))
    return 3;
  if (seleccionados.includes("telefono")) return 1;
  if (seleccionados.includes("correo")) return 2;
  return 0;
};

// envío final del formulario
formInscripcion.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validarMediosContacto()) {
    mostrarToast("Selecciona al menos un medio de contacto.", "warning");
    return;
  }

  if (btnSubmit.disabled) {
    mostrarToast("Corrige los campos marcados antes de continuar.", "warning");
    return;
  }

  const nombre = document.getElementById("nombre").value.trim();
  const telefono = telefonoInput.value.trim();
  const correo = correoInput.value.trim();
  const fecha_nacimiento = document.getElementById("fecha-nacimiento").value;
  const tipo_contacto = obtenerTipoContacto();

  if (!nombre || !telefono || !correo || !fecha_nacimiento) {
    mostrarToast("Completa todos los campos.", "warning");
    return;
  }

  try {
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
    mostrarToast(inscData?.mensaje || "Inscripción completada.", "exito", 6000);
    cerrarModal(); // ✅ Limpia y cierra
  } catch (err) {
    console.error("Error en inscripción:", err);
    mostrarToast("Hubo un error al procesar tu inscripción.", "error");
  }
});

// listeners
abrirBtn.addEventListener("click", abrirModal);
cerrarBtn.addEventListener("click", cerrarModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModal();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarModal();
});
checkboxCuenta.addEventListener("change", () => {
  toggleFormularios(checkboxCuenta.checked);
});
buscarBtn.addEventListener("click", buscarCuentaExistente);
volverRegistro.addEventListener("click", (e) => {
  e.preventDefault();
  toggleFormularios(false);
});
telefonoInput.addEventListener("input", validarDuplicados);
correoInput.addEventListener("input", validarDuplicados);
