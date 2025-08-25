document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOMContentLoaded disparado");

  const seccion = document.querySelector("#seccion-innovacion");
  if (!seccion) {
    console.warn("Esta vista no contiene la sección innovación.");
    return;
  }

  const endpoint =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_noticia.php";

  const elementos = {
    titulo: seccion.querySelector(".columna.texto h1"),
    descripcion: seccion.querySelector(".columna.texto p"),
    boton: seccion.querySelector(".btn-primary"),
    imagen: seccion.querySelector(".columna.imagen img"),
    listaNoticias: seccion.querySelector(".contenido-noticias"),
    paginacion: seccion.querySelector("#paginacion"),
  };

  const noticiasPorPagina = 5;
  let paginaActual = 1;
  let noticias = [];

  let autoCambioActivo = true;
  let intervaloRotacion;

  const idNoticiaPrincipal = 1; // esta variable esta por si acaso luego queremos cambiar la noticia principal

  // ---------------- helper para cargar imagen ----------------
  function cargarImagenConFallback(imgEl, basePath) {
    const exts = ["png", "jpg"];
    let idx = 0;

    function intentar() {
      if (idx >= exts.length) {
        imgEl.src = "../ASSETS/Noticias/noticia_noEncontrada.png";
        imgEl.onerror = null;
        return;
      }
      imgEl.src = `${basePath}.${exts[idx]}`;
      imgEl.onerror = () => {
        idx++;
        intentar();
      };
    }

    intentar();
  }

  function formatearTexto(texto) {
    return (texto || "").toString().replace(/\n/g, "<br>");
  }

  async function fetchNoticias() {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estatus: 1 }),
    });
    if (!res.ok) throw new Error("No se pudo obtener noticias");
    return await res.json();
  }

  try {
    noticias = await fetchNoticias();
    if (!Array.isArray(noticias) || noticias.length === 0) {
      elementos.listaNoticias.innerHTML = "<p>No hay noticias disponibles.</p>";
      return;
    }

    // noticia principal
    const principal = noticias.find((n) => n.id === idNoticiaPrincipal);
    if (!principal) {
      console.warn(`No se encontró la noticia con ID ${idNoticiaPrincipal}`);
      return;
    }

    elementos.titulo.textContent = principal.titulo;
    elementos.descripcion.innerHTML = formatearTexto(principal.desc_uno);
    elementos.boton.textContent = "Descrubre GodCode 360°";
    elementos.boton.href = `VIEW/Noticia.php?id=${principal.id}`;

    if (elementos.imagen) {
      cargarImagenConFallback(
        elementos.imagen,
        //`../ASSETS/Noticias/noticia_img${principal.id}`
        `../ASSETS/index/Seccion1_img1.png`
      );
      elementos.imagen.alt = principal.titulo;
    }

    // eliminar la noticia principal para no repetirla en el listado derecho
    noticias = noticias.filter((n) => n.id !== idNoticiaPrincipal);

    // se ordenan las noticias segun su id y con orden descendente
    noticias = noticias.sort((a, b) => b.id - a.id);

    mostrarNoticias(paginaActual);
    crearPaginacion();

    intervaloRotacion = setInterval(() => {
      if (!autoCambioActivo) return;
      const totalPaginas = Math.ceil(noticias.length / noticiasPorPagina);
      paginaActual = (paginaActual % totalPaginas) + 1;
      cambiarPaginaAnimada(paginaActual);
    }, 10000);
  } catch (error) {
    console.error("Error en carga de noticias:", error);
  }

  function mostrarNoticias(pagina) {
    const inicio = (pagina - 1) * noticiasPorPagina;
    const noticiasPagina = noticias.slice(inicio, inicio + noticiasPorPagina);

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

    elementos.listaNoticias.innerHTML = "";
    elementos.listaNoticias.appendChild(ul);
  }

  function crearPaginacion() {
    const totalPaginas = Math.ceil(noticias.length / noticiasPorPagina);
    elementos.paginacion.innerHTML = "";

    for (let i = 1; i <= totalPaginas; i++) {
      const enlace = document.createElement("a");
      enlace.textContent = i;
      enlace.href = "#";
      if (i === paginaActual) enlace.classList.add("activo");

      enlace.addEventListener("click", (e) => {
        e.preventDefault();
        if (paginaActual === i) return;
        autoCambioActivo = false;
        cambiarPaginaAnimada(i);
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

  function cambiarPaginaAnimada(nuevaPagina) {
    elementos.listaNoticias.classList.remove("animar-entrada");
    elementos.listaNoticias.classList.add("animar-salida");

    setTimeout(() => {
      paginaActual = nuevaPagina;
      mostrarNoticias(paginaActual);
      actualizarPaginacion();

      elementos.listaNoticias.classList.remove("animar-salida");
      elementos.listaNoticias.classList.add("animar-entrada");
    }, 400);
  }
});

//--------------------------------------aca termina el section 1

document.addEventListener("DOMContentLoaded", () => {
  // seccion de preguntas frecuentes
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
