//menu hamburguesa
function toggleMenu() {
  const menu = document.getElementById("mobile-menu");
  menu.classList.toggle("show");
}

//subnav sticky que no se vea feo
document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
});

// Solo carga si estamos en la vista ---------------------index---------------------
if (window.location.pathname.includes("index.php")) {
  document.addEventListener("DOMContentLoaded", () => {
    const noticias = [
      {
        id: 1,
        titulo:
          "IBM acelera la revolución de la IA Generativa empresarial con...",
        url: "#",
      },
      {
        id: 2,
        titulo: "IBM z17: El primer Mainframe totalmente diseñado para la...",
        url: "#",
      },
      {
        id: 3,
        titulo:
          "IBM lanza soluciones de ciberseguridad para la nueva era digital",
        url: "#",
      },
      {
        id: 4,
        titulo: "IBM Watsonx transforma el uso de datos en empresas medianas",
        url: "#",
      },
      {
        id: 5,
        titulo: "Nuevos centros de datos verdes impulsados por IA de IBM",
        url: "#",
      },
      {
        id: 6,
        titulo: "IBM y NASA colaboran en IA para predicción climática",
        url: "#",
      },
    ];

    const noticiasPorPagina = 2;
    let paginaActual = 1;

    const contenedorNoticias = document.getElementById("lista-noticias");
    const contenidoNoticias = contenedorNoticias.querySelector(
      ".contenido-noticias"
    );

    function mostrarNoticias(pagina) {
      contenidoNoticias.classList.add("animar-salida");

      setTimeout(() => {
        contenidoNoticias.innerHTML = "";

        const inicio = (pagina - 1) * noticiasPorPagina;
        const noticiasPagina = noticias.slice(
          inicio,
          inicio + noticiasPorPagina
        );

        noticiasPagina.forEach((noticia) => {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.href = noticia.url;
          a.textContent = noticia.titulo;
          li.appendChild(a);
          contenidoNoticias.appendChild(li);
        });

        contenidoNoticias.classList.remove("animar-salida");
        contenidoNoticias.classList.add("animar-entrada");

        setTimeout(() => {
          contenidoNoticias.classList.remove("animar-entrada");
        }, 400);
      }, 400);
    }

    function crearPaginacion() {
      const paginacion = document.getElementById("paginacion");
      paginacion.innerHTML = "";

      const totalPaginas = Math.ceil(noticias.length / noticiasPorPagina);
      for (let i = 1; i <= totalPaginas; i++) {
        const enlace = document.createElement("a");
        enlace.textContent = i;
        enlace.href = "#";
        if (i === paginaActual) enlace.classList.add("activo");

        enlace.addEventListener("click", (e) => {
          e.preventDefault();
          if (paginaActual === i) return;

          paginaActual = i;
          mostrarNoticias(paginaActual);
          crearPaginacion();
        });

        paginacion.appendChild(enlace);
      }
    }

    mostrarNoticias(paginaActual);
    crearPaginacion();

    setInterval(() => {
      paginaActual =
        (paginaActual % Math.ceil(noticias.length / noticiasPorPagina)) + 1;
      mostrarNoticias(paginaActual);
      crearPaginacion();
    }, 6000);
  });

  document.addEventListener("DOMContentLoaded", () => {
    //seccion de preguntas frecuentes
    //las demas preguntas
    const botonVerMas = document.getElementById("ver-mas-preguntas");
    const contenedorBoton = botonVerMas?.parentElement;
    const preguntasExtras = document.querySelectorAll(".acordeon .item.extra");

    preguntasExtras.forEach((item) => (item.style.display = "none"));

    let mostrando = false;

    botonVerMas?.addEventListener("click", () => {
      mostrando = !mostrando;

      preguntasExtras.forEach((item) => {
        item.style.display = mostrando ? "block" : "none";
      });

      if (mostrando) {
        botonVerMas.textContent = "Ver menos";
      } else {
        botonVerMas.textContent = "Más preguntas";
        window.scrollTo({
          top: contenedorBoton.offsetTop - 100,
          behavior: "smooth",
        });
      }
    });
  });
  function toggleItem(btn) {
    const respuesta = btn.nextElementSibling;

    if (respuesta.style.display === "block") {
      respuesta.style.display = "none";
    } else {
      respuesta.style.display = "block";
    }
  }
}

//solo carga si estamos en la vista ----------------------------------Nosotros----------------------------------------------
if (window.location.pathname.includes("Nosotros.php")) {
  //seccion 2 Nosotros carrusel
  let indice = 0;
  const slides = document.querySelectorAll(".slide");
  const indicador = document.getElementById("indicador");

  function mostrarSlide(n) {
    slides.forEach((slide) => slide.classList.remove("activo"));
    indice = (n + slides.length) % slides.length;
    slides[indice].classList.add("activo");
    indicador.textContent = `${indice + 1} / ${slides.length}`;
  }

  window.moverCarrusel = function (direccion) {
    mostrarSlide(indice + direccion);
  };

  mostrarSlide(indice);
}

//--------------------------------------------------------------- vista blog JS --------------------------
if (
  window.location.pathname.includes("Blog.php") ||
  window.location.pathname.includes("ejemplo_api.php")
) {
  if (
    window.location.pathname.includes("Blog.php") ||
    window.location.pathname.includes("ejemplo_api.php")
  ) {
    document.addEventListener("DOMContentLoaded", () => {
      const cursosContainer = document.getElementById("cursos-container");
      const categoriaSelect = document.getElementById("categoria");
      const explorarSelect = document.getElementById("explorar");
      const limpiarBtn = document.getElementById("limpiar-filtros");

      let cursosOriginales = [];
      let prioridadesData = [];

      fetch(
        "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_categorias.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estatus: 1 }),
        }
      )
        .then((res) => res.json())
        .then((categorias) => {
          categorias.forEach((cat) => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.nombre;
            categoriaSelect.appendChild(option);
          });
        })
        .catch((err) => console.error("Error al cargar categorías:", err));

      fetch(
        "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_prioridad.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estatus: 1 }),
        }
      )
        .then((res) => res.json())
        .then((prioridades) => {
          prioridadesData = prioridades;
          +prioridades
            .sort((a, b) => a.id - b.id)
            .forEach((item) => {
              const option = document.createElement("option");
              option.value = item.id;
              console.log(
                "el value de esta opcion es:",
                item.id,
                " y su id es:",
                item.nombre
              );
              option.textContent = item.nombre;
              explorarSelect.appendChild(option);
            });
        })
        .catch((err) => console.error("Error al cargar prioridades:", err));

      fetch(
        "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_cursos.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estatus: 1 }),
        }
      )
        .then((res) => res.json())
        .then((data) => {
          cursosOriginales = data;
          renderizarCursos(data);
          inicializarCarrusel();
        })
        .catch((err) => console.error("Error al cargar cursos:", err));

      categoriaSelect.addEventListener("change", aplicarFiltros);
      explorarSelect.addEventListener("change", aplicarFiltros);

      limpiarBtn.addEventListener("click", () => {
        categoriaSelect.value = "";
        explorarSelect.value = "";
        renderizarCursos(cursosOriginales);
        inicializarCarrusel();
      });

      function aplicarFiltros() {
        const categoriaSeleccionada = categoriaSelect.value;
        const explorarSeleccionado = explorarSelect.value;

        let cursosFiltrados = [...cursosOriginales];

        if (categoriaSeleccionada) {
          cursosFiltrados = cursosFiltrados.filter(
            (curso) => curso.categoria == categoriaSeleccionada
          );
          console.log(`filtro por categoria:  ${categoriaSeleccionada}`);
        }

        if (explorarSeleccionado) {
          cursosFiltrados = cursosFiltrados.filter(
            (curso) => curso.prioridad == explorarSeleccionado
          );

          const prioridadSeleccionada = prioridadesData.find(
            (p) => p.id == explorarSeleccionado
          );
          if (prioridadSeleccionada) {
            console.log(`filtro por prioridad:  ${prioridadSeleccionada}`);
          }
        }

        renderizarCursos(cursosFiltrados);
        inicializarCarrusel();
      }

      function renderizarCursos(cursos) {
        cursosContainer.innerHTML = "";

        cursos.forEach((curso) => {
          const card = document.createElement("div");
          card.classList.add("card");

          const cardLink = document.createElement("a");
          cardLink.href = `../VIEW/cursoInfo.php?id=${curso.id}`; // redirecciona con el id de lcurso
          cardLink.classList.add("curso-link");

          const img = document.createElement("img");
          img.src = `../ASSETS/cursos/img${curso.id}.png`;
          img.alt = curso.nombre;

          const contenido = document.createElement("div");
          contenido.classList.add("contenido");

          const titulo = document.createElement("h4");
          titulo.textContent = curso.nombre;

          const descripcion = document.createElement("p");
          descripcion.textContent = curso.descripcion_breve;

          const info = document.createElement("p");
          info.classList.add("info");
          info.textContent = `${curso.horas} hr | $${curso.precio} mx`;

          contenido.appendChild(titulo);
          contenido.appendChild(descripcion);
          contenido.appendChild(info);

          card.appendChild(img);
          card.appendChild(contenido);

          cardLink.appendChild(card);
          cursosContainer.appendChild(cardLink);
        });
      }

      function inicializarCarrusel() {
        const scrollContainer = document.querySelector(
          ".carousel-track-container"
        );

        const cursosContainer = document.getElementById("cursos-container");

        const prevBtn = document.querySelector(".carousel-btn.prev");
        const nextBtn = document.querySelector(".carousel-btn.next");

        if (!scrollContainer || !cursosContainer || !prevBtn || !nextBtn)
          return;

        const card = cursosContainer.querySelector(".card");
        if (!card) return;

        const cardWidth = card.offsetWidth + 24;

        const prevButton = prevBtn.cloneNode(true);
        const nextButton = nextBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(prevButton, prevBtn);
        nextBtn.parentNode.replaceChild(nextButton, nextBtn);

        prevButton.addEventListener("click", () => {
          scrollContainer.scrollBy({ left: -cardWidth, behavior: "smooth" });
          console.log("click hacia atrás");
        });

        nextButton.addEventListener("click", () => {
          scrollContainer.scrollBy({ left: cardWidth, behavior: "smooth" });
          console.log("click hacia adelante");
        });

        if (window.innerWidth <= 768) {
          prevButton.style.display = "none";
          nextButton.style.display = "none";
        } else {
          prevButton.style.display = "flex";
          nextButton.style.display = "flex";
        }
      }
    });
  }
}

//------------------------------- vista CursoInfo -------------------------------------------------------------

if (window.location.pathname.includes("cursoInfo.php")) {
  //apartado para recuperar los datos del curso segun su id
  document.addEventListener("DOMContentLoaded", async () => {
    console.log("1. DOM completamente cargado - Iniciando script");

    // se obtiene el curso con la id que enviamos por la url
    const urlParams = new URLSearchParams(window.location.search);
    const cursoId = urlParams.get("id");
    console.log("2. ID obtenido de la URL:", cursoId);

    if (!cursoId) {
      console.error("3. No se encontró ID de curso en la URL");
      mostrarError("No se encontró ID de curso en la URL");
      return;
    }

    const elementos = {
      // aca se arma el curso
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
      ),//aca se carga la fecha inicio pero no supe donde colocarla
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

      otrosCursosContainer: document.querySelector(
        "#otros-cursos .cards-cursos"
      ),
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

      // carga los demas cursos
      console.log("7. Cargando datos relacionados...");
      const [tutor, actividades, tipoEvaluacion, calendario] =
        await Promise.all([
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

      // cargar curso
      console.log("9. Actualizando DOM con datos del curso...");
      elementos.nombre.innerHTML = `${curso.nombre} <span class="curso-id">(ID: ${curso.id})</span>`;
      elementos.titulo.textContent = curso.nombre;
      elementos.descCorta.innerHTML = formatearTexto(curso.descripcion_breve);
      elementos.descMedia.innerHTML = formatearTexto(curso.descripcion_media);
      elementos.imagen.src = `../ASSETS/cursos/img${curso.id}.png`;
      elementos.imagen.alt = curso.nombre;
      elementos.descripcion.innerHTML = formatearTexto(curso.descripcion_curso);
      elementos.fechaInicio.textContent = `Inicia: ${formatearFecha(
        curso.fecha_inicio
      )}`;
      elementos.precio.textContent = `$${curso.precio.toLocaleString("es-MX", {
        minimumFractionDigits: 2,
      })}`;
      
      elementos.horas.textContent = `${curso.horas} Horas totales`;
      elementos.actividades.textContent = actividades.nombre;
      elementos.evaluacion.textContent = tipoEvaluacion.nombre;
      elementos.calendario.textContent = `Inicia: ${fechaFormateada} (${calendario.nombre})`;
      elementos.certificado.textContent = `Certificado ${curso.certificado ? "incluido" : "no incluido"}`;

      if (tutor) {
        // se carga la imagen con el id del tutor concatenado
        elementos.tutorImg.src = `../ASSETS/tutor/tutor_${tutor.id}.png`;
        elementos.tutorImg.alt = "../ASSETS/tutor/tutor_noEncontrado.png";
        elementos.tutorImg.onerror = function () {
          // si no se encuentra la imagen se carga una por defecto
          console.log("error al cargar imagen de tutor");
          this.src = "../ASSETS/tutor/tutor_noEncontrado.png";
        };
        elementos.tutorNombre.textContent = tutor.nombre;
        elementos.tutorBio.textContent =
          tutor.biografia || "Experto en su campo";
      }

      elementos.dirigido.textContent = curso.dirigido;
      elementos.competencias.textContent = curso.competencias;

      // carga cursos de la misma categoria
      console.log("10. Cargando otros cursos de la misma categoría...");
      const todosCursos = await fetchData(
        "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_cursos.php",
        { estatus: 1 }
      );

      // filtra cursos de la misma categoria (menos el actual)
      const otrosCursos = todosCursos
        .filter((c) => c.categoria == curso.categoria && c.id != cursoId)
        .slice(0, 4); // muestra 4 cursos a la vez

      console.log(
        `11. Encontrados ${otrosCursos.length} cursos de la categoría ${curso.categoria}`
      );

      if (otrosCursos.length > 0) {
        elementos.otrosCursosContainer.innerHTML = otrosCursos
          .map(
            (curso) => `
                <div class="card-curso">
                    <img src="../ASSETS/cursos/img${curso.id}.png" alt="${curso.nombre
              }">
                    <div class="card-contenido">
                        <a href="cursoInfo.php?id=${curso.id}">${curso.nombre
              }</a>
                        <p>${curso.descripcion_breve}</p>
                        <p class="horas">${curso.horas} horas</p>
                        <p class="precio">Precio: <strong>$${curso.precio.toLocaleString(
                "es-MX",
                { minimumFractionDigits: 2 }
              )}</strong></p>
                    </div>
                </div>
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
  });
}

// -----------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------- VISTE PRODUCTOS/DesarrolloWeb.php -------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------
if (
  window.location.pathname.includes("DesarrolloWeb.php") ||
  window.location.pathname.includes("DesarrolloMobile.php")
) {
  document.addEventListener("DOMContentLoaded", function () {
    const track = document.querySelector(
      "#desarrollo-web-carrusel .carousel-track"
    );
    const prevButton = document.querySelector(
      "#desarrollo-web-carrusel .carousel-btn.prev"
    );
    const nextButton = document.querySelector(
      "#desarrollo-web-carrusel .carousel-btn.next"
    );

    if (!track || !prevButton || !nextButton) return;

    const cards = Array.from(track.children);
    if (cards.length === 0) return;

    let cardWidth = cards[0].getBoundingClientRect().width + 16;
    let currentIndex = 0;

    prevButton.addEventListener("click", moverAnterior);
    nextButton.addEventListener("click", moverSiguiente);

    window.addEventListener("resize", () => {
      cardWidth = cards[0].getBoundingClientRect().width + 16;
      updateCarousel();
      actualizarBotones();
    });

    const mediaQuery = window.matchMedia("(max-width: 480px)");
    mediaQuery.addEventListener("change", handleMobileChange);
    handleMobileChange(mediaQuery);

    function handleMobileChange(e) {
      if (e.matches) {
        prevButton.style.display = "none";
        nextButton.style.display = "none";
      } else {
        prevButton.style.display = "flex";
        nextButton.style.display = "flex";
        actualizarBotones();
      }
    }

    function updateCarousel() {
      track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
      actualizarBotones();
    }

    function moverAnterior() {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    }

    function moverSiguiente() {
      const visibles = Math.floor(track.parentElement.offsetWidth / cardWidth);
      if (currentIndex < cards.length - visibles) {
        currentIndex++;
        updateCarousel();
      }
    }

    function actualizarBotones() {
      const visibles = Math.floor(track.parentElement.offsetWidth / cardWidth);
      prevButton.style.visibility = currentIndex === 0 ? "hidden" : "visible";
      nextButton.style.visibility =
        currentIndex >= cards.length - visibles ? "hidden" : "visible";
    }

    updateCarousel();
  });
}

// -----------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------- vistas del megamenu de productos -------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------
if (
  window.location.pathname.includes("DesarrolloWeb.php") ||
  window.location.pathname.includes("DesarrolloMobile.php") ||
  window.location.pathname.includes("ServiciosEnLaNube.php") ||
  window.location.pathname.includes("IndustriaEducacion.php") ||
  window.location.pathname.includes("ServicioEducativo") ||
  window.location.pathname.includes("DisenoUXUI.php") ||
  window.location.pathname.includes("IndustriaTecnologia.php") ||
  window.location.pathname.includes("IndustriaEducacion.php") ||
  window.location.pathname.includes("IndustriaFinanciera.php")
) {
  //funcion para el apartado de OTROS PRODUCTOS para las vistas del megamenu de productos
  const productos = [
    {
      texto: "Desarrollo web",
      icono: "../ASSETS/ProductosPopUp/DesarrolloWeb.png",
      link: "../VIEW/DesarrolloWeb.php",
    },
    {
      texto: "Desarrollo Mobile",
      icono: "../ASSETS/ProductosPopUp/DesarrolloMobile.png",
      link: "../VIEW/DesarrolloMobile.php",
    },
    {
      texto: "Servicios en la nube",
      icono: "../ASSETS/ProductosPopUp/ServiciosEnLaNube.png",
      link: "../VIEW/DesarrolloWeb.php",
    },
    {
      texto: "Diseño UX/UI",
      icono: "../ASSETS/ProductosPopUp/DiseñoUXUI.png",
      link: "../VIEW/DiseñoUXUI.php",
    },
    {
      texto: "Sercivio educativo",
      icono: "../ASSETS/ProductosPopUp/ServicioEducativo.png",
      link: "../VIEW/DesarrolloWeb.php",
    },
    {
      texto: "Educación",
      icono: "../ASSETS/ProductosPopUp/Educacion.png",
      link: "../VIEW/DesarrolloWeb.php",
    },
    {
      texto: "Finanzas",
      icono: "../ASSETS/ProductosPopUp/Finanzas.png",
      link: "../VIEW/DesarrolloWeb.php",
    },
    {
      texto: "Tecnología",
      icono: "../ASSETS/ProductosPopUp/Tecnologia.png",
      link: "../VIEW/DesarrolloWeb.php",
    },
  ];

  const contenedor = document.querySelector(
    "#otros-productos .productos-random"
  );

  const seleccionAleatoria = productos
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  seleccionAleatoria.forEach((prod) => {
    const a = document.createElement("a");
    a.href = prod.link;
    a.className = "producto-item";
    a.innerHTML = `<img src="${prod.icono}" alt="${prod.texto}"><span>${prod.texto}</span>`;
    contenedor.appendChild(a);
  });
}

// -----------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------- VISTA PRODUCTOS/ServiciosEnLaNube.php -------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------
if (window.location.pathname.includes("ServiciosEnLaNube.php")) {
  document.addEventListener("DOMContentLoaded", () => {
    const carousel = document.getElementById("ventajas-carousel");
    const prevBtn = document.querySelector(".ventajas-nube__btn.prev");
    const nextBtn = document.querySelector(".ventajas-nube__btn.next");
    const slides = carousel.querySelectorAll(".ventaja");

    let currentIndex = 0;
    const totalSlides = slides.length;

    function updateCarousel() {
      const slideWidth = carousel.offsetWidth;
      carousel.scrollTo({
        left: slideWidth * currentIndex,
        behavior: "smooth",
      });

      prevBtn.style.visibility = currentIndex === 0 ? "hidden" : "visible";
      nextBtn.style.visibility =
        currentIndex === totalSlides - 1 ? "hidden" : "visible";
    }

    prevBtn.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });

    nextBtn.addEventListener("click", () => {
      if (currentIndex < totalSlides - 1) {
        currentIndex++;
        updateCarousel();
      }
    });

    carousel.addEventListener("scroll", () => {
      const slideWidth = carousel.offsetWidth;
      currentIndex = Math.round(carousel.scrollLeft / slideWidth);

      prevBtn.style.visibility = currentIndex === 0 ? "hidden" : "visible";
      nextBtn.style.visibility =
        currentIndex === totalSlides - 1 ? "hidden" : "visible";
    });

    window.addEventListener("resize", updateCarousel);

    updateCarousel();
  });
}

// -----------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------- VISTA PRODUCTOS/DiseñoUXUI.php -------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------
if (window.location.href.includes("DisenoUXUI")) {
  document.addEventListener("DOMContentLoaded", () => {
    const carousel = document.getElementById("ventajas-uxui-carousel");
    const prevBtn = document.querySelector(".ventajas-uxui__btn.prev");
    const nextBtn = document.querySelector(".ventajas-uxui__btn.next");
    const slides = carousel?.querySelectorAll(".ventaja");

    if (!carousel || !prevBtn || !nextBtn || !slides.length) return;

    let currentIndex = 0;

    function updateCarousel() {
      const slideWidth = carousel.clientWidth;
      carousel.scrollTo({
        left: slideWidth * currentIndex,
        behavior: "smooth",
      });

      prevBtn.style.visibility = currentIndex === 0 ? "hidden" : "visible";
      nextBtn.style.visibility =
        currentIndex >= slides.length - 1 ? "hidden" : "visible";
    }

    prevBtn.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });

    nextBtn.addEventListener("click", () => {
      if (currentIndex < slides.length - 1) {
        currentIndex++;
        updateCarousel();
      }
    });

    window.addEventListener("resize", updateCarousel);
    updateCarousel();
  });
}

// -------------------- carrusel para los cursos de la vista servicio educativo

if (window.location.pathname.includes("ServicioEducativo.php")) {
  document.addEventListener("DOMContentLoaded", () => {
    const cursosContainer = document.getElementById(
      "cursos-servicio-container"
    );
    const prevButton = document.querySelector(".carousel-btn-servicio.prev");
    const nextButton = document.querySelector(".carousel-btn-servicio.next");

    let cursos = [];

    fetch(
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_cursos.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estatus: 1 }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        cursos = data;
        renderizarCursos(cursos);
        inicializarCarrusel();
      })
      .catch((err) => console.error("Error al cargar cursos:", err));

    function renderizarCursos(cursos) {
      cursosContainer.innerHTML = "";
      cursos.forEach((curso) => {
        const card = document.createElement("div");
        card.classList.add("card");

        const img = document.createElement("img");
        img.src = `../ASSETS/cursos/img${curso.id}.png`;
        img.alt = curso.nombre;

        const contenido = document.createElement("div");
        contenido.classList.add("contenido");

        const titulo = document.createElement("h4");
        titulo.textContent = curso.nombre;

        const descripcion = document.createElement("p");
        descripcion.textContent = curso.descripcion_breve;

        const info = document.createElement("p");
        info.classList.add("info");
        info.textContent = `${curso.horas} hr | $${curso.precio} mx`;

        contenido.appendChild(titulo);
        contenido.appendChild(descripcion);
        contenido.appendChild(info);

        card.appendChild(img);
        card.appendChild(contenido);
        cursosContainer.appendChild(card);
      });
    }

    function inicializarCarrusel() {
      const track = document.querySelector(".carousel-track-servicio");
      if (!track || !prevButton || !nextButton) return;

      const cards = Array.from(track.children);
      if (cards.length === 0) return;

      let cardWidth = cards[0].getBoundingClientRect().width + 16;
      let currentIndex = 0;

      prevButton.addEventListener("click", () => {
        if (currentIndex > 0) {
          currentIndex--;
          updateCarousel();
        }
      });

      nextButton.addEventListener("click", () => {
        const cardsVisibles = Math.floor(
          track.parentElement.offsetWidth / cardWidth
        );
        if (currentIndex < cards.length - cardsVisibles) {
          currentIndex++;
          updateCarousel();
        }
      });

      function updateCarousel() {
        track.style.transition = "transform 0.4s ease";
        track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        actualizarBotones();
      }

      function actualizarBotones() {
        const cardsVisibles = Math.floor(
          track.parentElement.offsetWidth / cardWidth
        );
        prevButton.style.visibility = currentIndex === 0 ? "hidden" : "visible";
        nextButton.style.visibility =
          currentIndex >= cards.length - cardsVisibles ? "hidden" : "visible";

        if (window.innerWidth <= 480) {
          prevButton.style.display = "none";
          nextButton.style.display = "none";
        } else {
          prevButton.style.display = "flex";
          nextButton.style.display = "flex";
        }
      }

      window.addEventListener("resize", () => {
        cardWidth = cards[0].getBoundingClientRect().width + 16;
        const cardsVisibles = Math.floor(
          track.parentElement.offsetWidth / cardWidth
        );
        if (currentIndex > cards.length - cardsVisibles) {
          currentIndex = Math.max(cards.length - cardsVisibles, 0);
        }
        updateCarousel();
      });

      updateCarousel();
    }
  });
}

//------------------------------------------------------------js global-----------------------------------------------------
//este es el menu del subnav
document.addEventListener("DOMContentLoaded", () => {
  const menu = document.querySelector("#submenu-productos .megamenu");
  menu.classList.remove("show");

  const link = document.querySelector("#submenu-productos > a");
  link.addEventListener("click", (e) => {
    e.preventDefault();
    menu.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    const contenedor = document.querySelector("#submenu-productos");
    if (!contenedor.contains(e.target)) {
      menu.classList.remove("show");
    }
  });
});

//esta es la class "animado" que al colocarsela algo le agrega una transicion
document.addEventListener("DOMContentLoaded", () => {
  const animados = document.querySelectorAll(".animado");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  animados.forEach((el) => observer.observe(el));
});
