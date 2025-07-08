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

console.log("Modal Inscripción Ready");

const modal = document.getElementById("modal-inscripcion");
const abrirBtn = document.getElementById("abrir-modal-inscripcion");
const cerrarBtn = document.querySelector(".cerrar-modal");
const checkboxCuenta = document.getElementById("ya-tengo-cuenta");
const camposRegistro = document.querySelector(".campos-registro");
const camposLogin = document.querySelector(".campos-login");
const errorCuenta = document.getElementById("error-cuenta");
const buscarBtn = document.getElementById("buscar-cuenta");
const volverRegistro = document.getElementById("volver-a-registro");
const cursoNombreInput = document.getElementById("curso-nombre");
const loginInput = document.getElementById("login-identificador");
const formInscripcion = document.getElementById("form-inscripcion");

const ENDPOINT_CONSULTA = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_usuario.php";
const ENDPOINT_INSERT = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_usuario.php";
const ENDPOINT_INSCRIPCION = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_inscripcion.php";
const PASSWORD_DEFAULT = "godcode123";
let usuarioId = null;

// abrir modal
abrirBtn.addEventListener("click", () => {
  console.log("Abriendo modal...");
  modal.classList.add("mostrar");
  document.body.classList.add("modal-abierto");
  limpiarFormulario();
  cursoNombreInput.value = nombreCursoGlobal;
});

// cerrar modal
cerrarBtn.addEventListener("click", cerrarModal);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarModal();
});
modal.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModal();
});

function cerrarModal() {
  console.log("Cerrando modal...");
  modal.classList.remove("mostrar");
  document.body.classList.remove("modal-abierto");
  limpiarFormulario();
}

// toggle para registro o login
checkboxCuenta.addEventListener("change", () => toggleFormularios(checkboxCuenta.checked));

volverRegistro.addEventListener("click", (e) => {
  e.preventDefault();
  toggleFormularios(false);
});

function toggleFormularios(mostrarLogin) {
  checkboxCuenta.checked = mostrarLogin;
  camposLogin.classList.toggle("mostrar", mostrarLogin);
  camposRegistro.classList.toggle("mostrar", !mostrarLogin);
  ocultarMensajeError();
}

// buscar cuenta ya existente
buscarBtn.addEventListener("click", async () => {
  console.log("Buscar cuenta existente...");
  const valor = loginInput.value.trim();
  console.log("Identificador ingresado:", valor);

  if (!valor) return mostrarMensajeError("Por favor ingresa un correo o teléfono válido.");

  const esCorreo = valor.includes("@");
  const payload = esCorreo ? { correo: valor, telefono: "" } : { correo: "", telefono: valor };

  console.log("Payload a enviar:", payload);

  try {
    const res = await fetch(ENDPOINT_CONSULTA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log("Respuesta del servidor (consulta usuario):", data);

    if (Array.isArray(data) && data.length > 0 && data[0].id) {
      const usuario = data[0];
      console.log("Usuario encontrado:", usuario);
      usuarioId = usuario.id;
      llenarFormulario(usuario);
      toggleFormularios(false);
    } else {
      console.warn("No se encontró usuario con ese identificador.");
      mostrarMensajeError("Cuenta no encontrada. Puedes registrarte.");
    }
  } catch (error) {
    console.error("Error al consultar usuario:", error);
    mostrarMensajeError("Ocurrió un error al buscar tu cuenta.");
  }
});

function llenarFormulario(usuario) {
  document.getElementById("nombre").value = usuario.nombre || "";
  document.getElementById("telefono").value = usuario.telefono || "";
  document.getElementById("correo").value = usuario.correo || "";
  document.getElementById("fecha-nacimiento").value = usuario.fecha_nacimiento || "";
  cursoNombreInput.value = nombreCursoGlobal;

  document.querySelectorAll('input[name="medios-contacto"]').forEach(cb => {
    const tipo = parseInt(usuario.tipo_contacto);
    if ((cb.value === "telefono" && (tipo === 1 || tipo === 3)) ||
      (cb.value === "correo" && (tipo === 2 || tipo === 3))) {
      cb.checked = true;
    }
  });
}

function limpiarFormulario() {
  formInscripcion.reset();
  usuarioId = null;
  loginInput.value = "";
  ocultarMensajeError();
  toggleFormularios(false);
}

// validar metodos de contacto
function obtenerTipoContacto() {
  const seleccionados = Array.from(document.querySelectorAll('input[name="medios-contacto"]:checked'))
    .map(cb => cb.value);
  if (seleccionados.length === 2) return 3;
  if (seleccionados.includes("telefono")) return 1;
  if (seleccionados.includes("correo")) return 2;
  return 0;
}

// mensaje de error o confirmacion
function mostrarMensajeError(mensaje) {
  errorCuenta.textContent = mensaje;
  errorCuenta.classList.add("mostrar");
}

function ocultarMensajeError() {
  errorCuenta.textContent = "";
  errorCuenta.classList.remove("mostrar");
}

// se envia la inscripcion
formInscripcion.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const fecha = document.getElementById("fecha-nacimiento").value;
  const tipo_contacto = obtenerTipoContacto();

  if (!nombre || !telefono || !correo || !fecha || tipo_contacto === 0) {
    return mostrarMensajeError("Por favor completa todos los campos y selecciona al menos un medio de contacto.");
  }

  try {
    if (!usuarioId) {
      console.log("Verificando si el usuario ya existe antes de registrar...");
      const verif = await fetch(ENDPOINT_CONSULTA, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, telefono })
      });
      const existe = await verif.json();
      console.log("Resultado verificación previa:", existe);

      if (Array.isArray(existe) && existe.length > 0 && existe[0].id) {
        return mostrarMensajeError("Ya existe una cuenta con ese correo o teléfono.");
      }

      console.log("Registrando nuevo usuario...");
      const insert = await fetch(ENDPOINT_INSERT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          correo,
          telefono,
          tipo_contacto,
          fecha_nacimiento: fecha,
          password: PASSWORD_DEFAULT
        })
      });
      const nuevo = await insert.json();
      console.log("Respuesta del servidor (nuevo usuario):", nuevo);

      if (!nuevo || !nuevo.id) throw new Error("No se pudo registrar el usuario.");
      usuarioId = nuevo.id;
    }

    console.log("Inscribiendo usuario en el curso...");
    const cursoId = idCursoGlobal;
    const inscribir = await fetch(ENDPOINT_INSCRIPCION, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        curso: cursoId,
        usuario: usuarioId
      })
    });
    const resultado = await inscribir.json();
    console.log("Resultado inscripción:", resultado);

    if (resultado?.mensaje === "Inscripción realizada correctamente") {
      alert("¡Te has inscrito correctamente!");
      cerrarModal();
    } else if (resultado?.mensaje === "El usuario ya se encuentra registrado en el curso") {
      mostrarMensajeError("Ya estás inscrito en este curso.");
    } else {
      mostrarMensajeError("Error al procesar la inscripción.");
    }
  } catch (error) {
    console.error("Error en inscripción:", error);
    mostrarMensajeError("Error al enviar los datos. Inténtalo más tarde.");
  }
});
