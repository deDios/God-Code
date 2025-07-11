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
