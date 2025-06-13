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
    }, 6000); // 6 segundos para cambiar de pagina y haga la transicion
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
if (window.location.pathname.includes("Blog.php")) {
  //---------js para la parte de noticias para recuperar la informacion y colocarla en la vista Noticias
  //esto todavia esta pendiente 
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

  //carrusel para la parte de cursos
  const track = document.querySelector(".carousel-track");
  const prevButton = document.querySelector(".carousel-btn.prev");
  const nextButton = document.querySelector(".carousel-btn.next");
  const cards = Array.from(track.children);
  const cardWidth = cards[0].getBoundingClientRect().width + 16;

  let currentIndex = 0;

  function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
  }

  prevButton.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  nextButton.addEventListener("click", () => {
    if (
      currentIndex <
      cards.length - Math.floor(track.parentElement.offsetWidth / cardWidth)
    ) {
      currentIndex++;
      updateCarousel();
    }
  });
}

//------------------------------------------------------------js global-----------------------------------------------------
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
