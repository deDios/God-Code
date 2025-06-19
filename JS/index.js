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

  //seccion 4 de ayuda
  function toggleItem(btn) {
    const respuesta = btn.nextElementSibling;
    respuesta.style.display =
      respuesta.style.display === "block" ? "none" : "block";
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

//------------------------------- vista blog JS --------------------------
if (window.location.pathname.includes("Blog.php") || window.location.pathname.includes("ejemplo_api.php")) {
  function abrirNoticia(event, boton) {
    event.preventDefault();
    const card = boton.closest(".card");
    const noticiaId = card.getAttribute("data-id");

    if (noticiaId) {
      localStorage.setItem("noticiaSeleccionada", noticiaId);
      window.location.href = "Noticia.php";
    } else {
      alert("No se pudo identificar la noticia.");
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("cursos-container");

    // no estaba el apartado imagen en las cards pero aca se puede cambiar
    const imagenesCursos = {
      1: "../ASSETS/cursos/cursos_img1.png",
      2: "../ASSETS/cursos/cursos_img2.png",
      3: "../ASSETS/cursos/cursos_img3.png",
      4: "../ASSETS/cursos/cursos_img4.png",
      5: "../ASSETS/cursos/cursos_img4.png",
    };

    const response = await fetch(
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_cursos.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estatus: 1 }),
      }
    );

    const data = await response.json();

    if (data && Array.isArray(data)) {
      container.innerHTML = data
        .map((curso) => {
          const imagenSrc = imagenesCursos[curso.id] || "https://via.placeholder.com/300x200?text=Curso";
          return `
            <div class="card">
              <img src="${imagenSrc}" alt="${curso.nombre}">
              <div class="contenido">
                <h4>${curso.nombre}</h4>
                <p>${curso.descripcion_breve}</p>
                <p class="horas">${curso.horas} horas</p>
                <p class="precio">$${curso.precio}</p>
              </div>
            </div>
          `;
        })
        .join("");
    }

    inicializarCarrusel();
  });

  function inicializarCarrusel() {
    const track = document.querySelector(".carousel-track");
    const prevButton = document.querySelector(".carousel-btn.prev");
    const nextButton = document.querySelector(".carousel-btn.next");

    if (!track || !prevButton || !nextButton) return;

    const cards = Array.from(track.children);
    if (cards.length === 0) return;

    let cardWidth = cards[0].getBoundingClientRect().width + 16;
    let currentIndex = 0;

    prevButton.addEventListener("click", moverAnterior);
    nextButton.addEventListener("click", moverSiguiente);

    function moverAnterior() {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    }

    function moverSiguiente() {
      const cardsVisibles = Math.floor(track.parentElement.offsetWidth / cardWidth);
      if (currentIndex < cards.length - cardsVisibles) {
        currentIndex++;
        updateCarousel();
      }
    }

    function updateCarousel() {
      track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
      actualizarBotones();
    }

    function actualizarBotones() {
      const cardsVisibles = Math.floor(track.parentElement.offsetWidth / cardWidth);
      prevButton.style.visibility = currentIndex === 0 ? "hidden" : "visible";
      nextButton.style.visibility = currentIndex >= cards.length - cardsVisibles ? "hidden" : "visible";
    }

    window.addEventListener("resize", () => {
      cardWidth = cards[0].getBoundingClientRect().width + 16;
      updateCarousel();
    });

    actualizarBotones();
  }
}


// -----------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------- vista CursoInfo -------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------

if (window.location.pathname.includes("CursoInfo.php")) {
  function toggleAcordeon(header) {
    const item = header.parentElement;
    const contenido = item.querySelector(".contenido");
    const isOpen = contenido.style.display === "block";

    // Cerrar todos si deseas modo exclusivo
    document
      .querySelectorAll("#curso-detalle-extra .contenido")
      .forEach((el) => (el.style.display = "none"));
    document
      .querySelectorAll("#curso-detalle-extra .cabecera")
      .forEach((el) => el.classList.remove("abierto"));

    if (!isOpen) {
      contenido.style.display = "block";
      header.classList.add("abierto");
    }
  }

  const id = new URLSearchParams(window.location.search).get("id");
}

// -----------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------- VISTE PRODUCTOS/DesarrolloWeb.php -------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------
if (window.location.pathname.includes("DesarrolloWeb.php")) {
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
//------------------------------- vista CursoInfo -------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------

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

//funcion para el apartado de OTROS PRODUCTOS para las vistas del megamenu de productos
const productos = [
  {
    texto: "Desarrollo offshore",
    icono: "../ASSETS/ProductosPopUp/DesarrolloOffshore.png",
    link: "../VIEW/DesarrolloWeb.php",
  },
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
    texto: "Desarrollo nearshore",
    icono: "../ASSETS/ProductosPopUp/DesarrolloNearshore.png",
    link: "../VIEW/DesarrolloWeb.php",
  },
  {
    texto: "Servicios en la nube",
    icono: "../ASSETS/ProductosPopUp/ServiciosEnLaNube.png",
    link: "../VIEW/DesarrolloWeb.php",
  },
  {
    texto: "Diseño UX/UI",
    icono: "../ASSETS/ProductosPopUp/DiseñoUXUI.png",
    link: "../VIEW/DesarrolloWeb.php",
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

const contenedor = document.querySelector("#otros-productos .productos-random");

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
