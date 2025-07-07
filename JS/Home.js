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
      const noticiasPagina = noticias.slice(inicio, inicio + noticiasPorPagina);

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
