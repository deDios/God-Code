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

  // -----------------------------------------------------------------------------------------------------------------------------------------------
  // JS Para comenzar a rescatar datos para la pagina de momento con informacion dummy -------------------------------------------------------------
  // -----------------------------------------------------------------------------------------------------------------------------------------------
  // Datos dummy de cursos
  const cursos = [
    {
      id: "1",
      categoria: "Programación Web",
      titulo: "Curso de CSS",
      descripcion_corta: "Aprende diseño y estilo de páginas web, conoce propiedades y validaciones CSS.",
      descripcion_larga: `En este curso dominarás las técnicas modernas de diseño web. Desde los fundamentos hasta técnicas avanzadas como:
        \n- Diseño responsive con Flexbox y Grid
        \n- Animaciones y transiciones CSS
        \n- Variables CSS y metodologías modernas
        \n- Buenas prácticas de organización de código`,
      imagen_principal: "https://images.unsplash.com/photo-1523437110208-8e4c62276029?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      imagen_miniatura: "../ASSETS/cursos/cursos_img1.png",
      precio: 300,
      horas_diarias: "2",
      tipo_actividades: "Prácticas y teóricas",
      frecuencia_evaluacion: "Semanal",
      horarios_disponibles: "Mañana/Tarde",
      certificado: "Incluye certificado digital",
      beneficio_extra: "Acceso a comunidad privada por 1 año",
      nombre_instructor: "Ana López",
      foto_instructor: "https://randomuser.me/api/portraits/women/44.jpg",
      bio_instructor: "Diseñadora web con 10 años de experiencia. Especialista en UI/UX y desarrollo frontend. Ha trabajado para empresas como Google y Airbnb.",
      dirigido_a: "Diseñadores gráficos, desarrolladores frontend y cualquier persona interesada en mejorar la presentación visual de sitios web.",
      competencias: "Creación de diseños responsivos, implementación de animaciones CSS, organización de código CSS escalable, uso de preprocesadores como SASS.",
      duracion: "40",
      url: "CursoInfo.php?id=css"
    },
    {
      id: "javascript",
      categoria: "Programación Web",
      titulo: "Curso de JavaScript",
      descripcion_corta: "Domina el lenguaje de programación más importante para desarrollo web frontend.",
      descripcion_larga: `Este curso te llevará desde cero hasta un nivel avanzado en JavaScript moderno (ES6+). Aprenderás:
        \n- Fundamentos de programación con JS
        \n- Manipulación del DOM
        \n- Async/Await y Promesas
        \n- Programación orientada a objetos
        \n- Patrones de diseño modernos`,
      imagen_principal: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      imagen_miniatura: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      precio: 400,
      horas_diarias: "2.5",
      tipo_actividades: "Proyectos prácticos",
      frecuencia_evaluacion: "Por módulo",
      horarios_disponibles: "Mañana/Noche",
      certificado: "Certificado con validación internacional",
      beneficio_extra: "Acceso a talleres exclusivos",
      nombre_instructor: "Carlos Méndez",
      foto_instructor: "https://randomuser.me/api/portraits/men/32.jpg",
      bio_instructor: "Ingeniero de software con 8 años de experiencia en desarrollo frontend. Creador de varias librerías open source y speaker en conferencias internacionales.",
      dirigido_a: "Desarrolladores web que quieran profundizar en JavaScript, diseñadores que quieran agregar interactividad a sus proyectos.",
      competencias: "Desarrollo de aplicaciones web interactivas, manejo de asincronía, consumo de APIs, fundamentos de React/Vue.",
      duracion: "60",
      url: "CursoInfo.php?id=javascript"
    },
    {
      id: "python",
      categoria: "Programación",
      titulo: "Curso de Python",
      descripcion_corta: "Aprende el lenguaje más versátil para desarrollo web, ciencia de datos e inteligencia artificial.",
      descripcion_larga: `Python es el lenguaje más demandado actualmente. En este curso aprenderás:
        \n- Fundamentos de programación con Python
        \n- Desarrollo web con Django/Flask
        \n- Análisis de datos con Pandas
        \n- Introducción a machine learning
        \n- Automatización de tareas`,
      imagen_principal: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      imagen_miniatura: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      precio: 450,
      horas_diarias: "3",
      tipo_actividades: "Casos prácticos reales",
      frecuencia_evaluacion: "Quincenal",
      horarios_disponibles: "Tarde/Noche",
      certificado: "Certificado con proyectos evaluados",
      beneficio_extra: "Acceso a bolsa de trabajo",
      nombre_instructor: "María González",
      foto_instructor: "https://randomuser.me/api/portraits/women/65.jpg",
      bio_instructor: "Data Scientist con 7 años de experiencia. PhD en Ciencias de la Computación. Ha trabajado en proyectos de IA para empresas Fortune 500.",
      dirigido_a: "Personas interesadas en ciencia de datos, desarrolladores que quieran aprender un lenguaje versátil, profesionales que necesiten automatizar procesos.",
      competencias: "Desarrollo de aplicaciones Python, análisis de datos, fundamentos de IA, creación de APIs REST.",
      duracion: "55",
      url: "CursoInfo.php?id=python"
    },
    {
      id: "react",
      categoria: "Frontend Avanzado",
      titulo: "Curso de React",
      descripcion_corta: "Domina la biblioteca más popular para construir interfaces de usuario modernas.",
      descripcion_larga: `En este curso aprenderás React desde cero hasta nivel avanzado:
        \n- Fundamentos de React y JSX
        \n- Hooks (useState, useEffect, etc.)
        \n- Context API y Redux
        \n- Routing con React Router
        \n- Integración con APIs
        \n- Testing y despliegue`,
      imagen_principal: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      imagen_miniatura: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      precio: 420,
      horas_diarias: "2",
      tipo_actividades: "Proyectos prácticos",
      frecuencia_evaluacion: "Por módulo",
      horarios_disponibles: "Flexible",
      certificado: "Certificado con revisión de portafolio",
      beneficio_extra: "Sesiones de mentoría",
      nombre_instructor: "Javier Ruiz",
      foto_instructor: "https://randomuser.me/api/portraits/men/75.jpg",
      bio_instructor: "Frontend Architect con 10 años de experiencia. Especialista en React y ecosistema JavaScript. Ha liderado equipos en startups y grandes empresas.",
      dirigido_a: "Desarrolladores JavaScript que quieran especializarse en React, diseñadores UI/UX que quieran implementar sus diseños.",
      competencias: "Desarrollo de SPA modernas, gestión de estado, componentes reutilizables, buenas prácticas de React.",
      duracion: "50",
      url: "CursoInfo.php?id=react"
    },
    {
      id: "nodejs",
      categoria: "Backend",
      titulo: "Curso de Node.js",
      descripcion_corta: "Aprende a construir aplicaciones backend escalables con JavaScript.",
      descripcion_larga: `Node.js permite usar JavaScript en el servidor. En este curso aprenderás:
        \n- Fundamentos de Node.js y npm
        \n- Creación de APIs REST
        \n- Autenticación JWT
        \n- Bases de datos (MongoDB, MySQL)
        \n- Websockets
        \n- Despliegue en la nube`,
      imagen_principal: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      imagen_miniatura: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      precio: 380,
      horas_diarias: "2.5",
      tipo_actividades: "Desarrollo de API completa",
      frecuencia_evaluacion: "Por proyecto",
      horarios_disponibles: "Noche",
      certificado: "Certificado con proyecto final evaluado",
      beneficio_extra: "Revisión de CV y perfil LinkedIn",
      nombre_instructor: "Laura Fernández",
      foto_instructor: "https://randomuser.me/api/portraits/women/33.jpg",
      bio_instructor: "Backend Developer con 6 años de experiencia. Especialista en arquitectura de microservicios y APIs escalables. Certificada como AWS Developer.",
      dirigido_a: "Desarrolladores frontend que quieran convertirse en fullstack, profesionales que necesiten construir APIs robustas.",
      competencias: "Creación de APIs RESTful, autenticación y autorización, integración con bases de datos, despliegue en la nube.",
      duracion: "45",
      url: "CursoInfo.php?id=nodejs"
    }
  ];

  let track, prevButton, nextButton, cards, cardWidth, currentIndex;

  function generarCardsCursos() {
    const container = document.getElementById('cursos-container');

    if (!container) return;

    let html = '';

    cursos.forEach(curso => {
      html += `
        <a href="${curso.url}" class="card" data-curso-id="${curso.id}">
            <img src="${curso.imagen_miniatura}" alt="${curso.titulo}" />
            <div class="contenido">
                <h4>${curso.titulo}</h4>
                <p>${curso.descripcion_corta}</p>
                <p class="horas">${curso.duracion} horas</p>
                <p class="precio">Precio: <strong>$${curso.precio}</strong></p>
            </div>
        </a>`;
    });
    container.innerHTML = html;

    inicializarCarrusel();
  }

  function inicializarCarrusel() {
    track = document.querySelector(".carousel-track");
    prevButton = document.querySelector(".carousel-btn.prev");
    nextButton = document.querySelector(".carousel-btn.next");

    if (!track || !prevButton || !nextButton) return;

    cards = Array.from(track.children);

    if (cards.length === 0) return;

    cardWidth = cards[0].getBoundingClientRect().width + 16;
    currentIndex = 0;

    prevButton.addEventListener("click", moverAnterior);
    nextButton.addEventListener("click", moverSiguiente);

    actualizarBotones();

    window.addEventListener('resize', () => {
      cardWidth = cards[0].getBoundingClientRect().width + 16;
      updateCarousel();
      actualizarBotones();
    });

    const mediaQuery = window.matchMedia('(max-width: 480px)');
    function handleMobileChange(e) {
      if (e.matches) {
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
      } else {
        prevButton.style.display = 'flex';
        nextButton.style.display = 'flex';
        actualizarBotones();
      }
    }
    mediaQuery.addListener(handleMobileChange);
    handleMobileChange(mediaQuery);
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
    const cardsVisibles = Math.floor(track.parentElement.offsetWidth / cardWidth);
    if (currentIndex < cards.length - cardsVisibles) {
      currentIndex++;
      updateCarousel();
    }
  }

  function actualizarBotones() {
    prevButton.style.visibility = currentIndex === 0 ? 'hidden' : 'visible';

    const cardsVisibles = Math.floor(track.parentElement.offsetWidth / cardWidth);
    nextButton.style.visibility = currentIndex >= cards.length - cardsVisibles ? 'hidden' : 'visible';
  }

  document.addEventListener('DOMContentLoaded', generarCardsCursos);

}//aqui termina la vista BLOG




//------------------------------- vista CursoInfo --------------------------
if (window.location.pathname.includes("CursoInfo.php")) {
  function toggleAcordeon(header) {
    const item = header.parentElement;
    const contenido = item.querySelector('.contenido');
    const isOpen = contenido.style.display === 'block';

    // Cerrar todos si deseas modo exclusivo
    document.querySelectorAll('#curso-detalle-extra .contenido').forEach(el => el.style.display = 'none');
    document.querySelectorAll('#curso-detalle-extra .cabecera').forEach(el => el.classList.remove('abierto'));

    if (!isOpen) {
      contenido.style.display = 'block';
      header.classList.add('abierto');
    }
  }

  const id = new URLSearchParams(window.location.search).get('id');
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

