document.addEventListener("DOMContentLoaded", async () => {
  console.log("🔵 DOMContentLoaded disparado");

  const endpoint =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_noticia.php";

  const elementos = {
    titulo: document.querySelector("#seccion-innovacion .columna.texto h1"),
    descripcion: document.querySelector("#seccion-innovacion .columna.texto p"),
    boton: document.querySelector("#seccion-innovacion .btn-primary"),
    imagen: document.querySelector("#seccion-innovacion .columna.imagen img"),
    listaNoticias: document.querySelector("#lista-noticias .contenido-noticias"),
    paginacion: document.getElementById("paginacion"),
  };

  console.log("🧩 Elementos encontrados:", elementos);

  const noticiasPorPagina = 5;
  let paginaActual = 1;
  let noticias = [];

  function formatearTexto(texto) {
    return (texto || "").toString().replace(/\n/g, "<br>");
  }

  async function fetchNoticias() {
    console.log("📡 Consultando noticias...");
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ estatus: 1 }),
    });

    if (!res.ok) throw new Error("❌ No se pudo obtener noticias");

    const data = await res.json();
    console.log("✅ Noticias recibidas:", data);
    return data;
  }

  try {
    noticias = await fetchNoticias();

    if (!Array.isArray(noticias) || noticias.length === 0) {
      console.warn("⚠️ No hay noticias disponibles.");
      return;
    }

    noticias = noticias.sort(
      (a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
    );

    console.log("📋 Noticias ordenadas:", noticias);

    const principal = noticias[0];
    console.log("⭐ Noticia principal:", principal);

    elementos.titulo.textContent = principal.titulo;
    elementos.descripcion.innerHTML = formatearTexto(principal.desc_uno);
    elementos.boton.textContent = "Ver más detalles";
    elementos.boton.href = `VIEW/Noticia.php?id=${principal.id}`;

    // elementos.imagen.src = `../ASSETS/Noticias/noticia_img1_${principal.id}.png`;
    // elementos.imagen.alt = principal.titulo;

    noticias = noticias.slice(1);

    mostrarNoticias(paginaActual);
    crearPaginacion();

    setInterval(() => {
      paginaActual =
        (paginaActual % Math.ceil(noticias.length / noticiasPorPagina)) + 1;
      mostrarNoticias(paginaActual);
      actualizarPaginacion();
    }, 6000);
  } catch (error) {
    console.error("❌ Error en try principal:", error);
  }

  function mostrarNoticias(pagina) {
    console.log("📄 Mostrando noticias página:", pagina);
    elementos.listaNoticias.innerHTML = "";

    const inicio = (pagina - 1) * noticiasPorPagina;
    const noticiasPagina = noticias.slice(inicio, inicio + noticiasPorPagina);
    console.log("📰 Noticias en esta página:", noticiasPagina);

    const ul = document.createElement("ul");
    ul.classList.add("lista-noticias");

    noticiasPagina.forEach((noticia) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `VIEW/Noticia.php?id=${noticia.id}`;
      a.textContent = noticia.titulo;
      li.appendChild(a);
      ul.appendChild(li);
    });

    elementos.listaNoticias.appendChild(ul);
  }

  function crearPaginacion() {
    console.log("🔢 Creando paginación");
    elementos.paginacion.innerHTML = "";

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

      elementos.paginacion.appendChild(enlace);
    }
  }

  function actualizarPaginacion() {
    const enlaces = elementos.paginacion.querySelectorAll("a");
    enlaces.forEach((btn, index) => {
      btn.classList.toggle("activo", index + 1 === paginaActual);
    });
  }
});
//--------------------------------------aca termina el section 1 

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
