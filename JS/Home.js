document.addEventListener("DOMContentLoaded", () => {
  const endpoint =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_noticia.php";

  const h1 = document.querySelector("#seccion-innovacion .columna.texto h1");
  const p = document.querySelector("#seccion-innovacion .columna.texto p");
  const botonNoticia = document.querySelector(
    "#seccion-innovacion .columna.texto .btn-primary"
  );

  const contenedorNoticias = document.querySelector(
    "#lista-noticias .contenido-noticias"
  );
  const paginacion = document.getElementById("paginacion");

  const noticiasPorPagina = 5;
  let paginaActual = 1;
  let noticias = [];

  // ENDPOINTNOTICIAS
  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ estatus: 1 }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Noticias cargadas:", data);

      if (!Array.isArray(data) || data.length === 0) {
        console.warn("No hay noticias disponibles.");
        return;
      }

      // ordena por fecha de mas reciente a mas antigua
      noticias = data.sort(
        (a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
      );

      console.log("Noticias ordenadas:", noticias);

      // mostrar la noticia mas reciente
      const noticiaReciente = noticias[0];
      console.log("Noticia más reciente:", noticiaReciente);

      h1.textContent = noticiaReciente.titulo;
      p.textContent = noticiaReciente.desc_uno;
      botonNoticia.textContent = "Ver más detalles";
      botonNoticia.href = `VIEW/Noticia.php?id=${noticiaReciente.id}`;

      // mostramos noticias a partir de la segunda
      noticias = noticias.slice(1);
      mostrarNoticias(paginaActual);
      crearPaginacion();

      // auto-paginación cada 6s
      setInterval(() => {
        paginaActual =
          (paginaActual % Math.ceil(noticias.length / noticiasPorPagina)) + 1;
        mostrarNoticias(paginaActual);
        actualizarPaginacion();
      }, 6000);
    })
    .catch((err) => {
      console.error("Error al cargar noticias:", err);
    });

  // Mostrar noticias de una página
  function mostrarNoticias(pagina) {
    contenedorNoticias.innerHTML = "";

    const inicio = (pagina - 1) * noticiasPorPagina;
    const noticiasPagina = noticias.slice(inicio, inicio + noticiasPorPagina);

    console.log("Noticias a mostrar:", noticiasPagina);

    noticiasPagina.forEach((noticia) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `VIEW/Noticia.php?id=${noticia.id}`;
      a.textContent = noticia.titulo;
      li.appendChild(a);
      contenedorNoticias.appendChild(li);
    });
  }

  // Paginación
  function crearPaginacion() {
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
        actualizarPaginacion();
      });

      paginacion.appendChild(enlace);
    }
  }

  function actualizarPaginacion() {
    const enlaces = paginacion.querySelectorAll("a");
    enlaces.forEach((btn, index) => {
      btn.classList.toggle("activo", index + 1 === paginaActual);
    });
  }
}); //----------------- aqui termina el js para noticias

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
