document.addEventListener("DOMContentLoaded", async () => {
  //--------------------------- inicia el js para noticias
  const endpoint =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_noticia.php";

  const contenedor = document.querySelector("#blog-godcode .grid-cards");

  try {
    //ENDPOINT NOTICIAS
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estatus: 1 }),
    });

    if (!res.ok) throw new Error("No se pudo obtener noticias");
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.warn("No hay noticias activas disponibles");
      return;
    }

    // toma las noticias con los 3 IDs más altos
    const noticiasRecientes = data.sort((a, b) => b.id - a.id).slice(0, 3);

    // limpia las cards dummy
    contenedor.innerHTML = "";

    // inserta las noticias
    noticiasRecientes.forEach((noticia, index) => {
      const card = document.createElement("div");
      card.classList.add("card");

      const rutaImagen = `../ASSETS/noticia/NoticiasImg/noticia_img1_${noticia.id}.png`;

      card.innerHTML = `
        <img src="${rutaImagen}" alt="Imagen noticia ${noticia.id}">
        <div class="contenido">
          <p>${noticia.titulo}</p>
          <button onclick="abrirNoticia(event, this)" data-id="${noticia.id}">Leer más...</button>
        </div>
      `;

      contenedor.appendChild(card);
      console.log("Insertada noticia ID:", noticia.id);
    });
  } catch (error) {
    console.error("Error al cargar noticias para blog:", error);
  }

  // redireccionar con el id en la url
  window.abrirNoticia = function (event, btn) {
    const id = btn.getAttribute("data-id");
    if (!id) return;
    window.location.href = `../VIEW/Noticia.php?id=${id}`;
  };
  //--------------------------- termina el js para noticias
});

document.addEventListener("DOMContentLoaded", () => {
  //----------------------- aca inicia el js para los cursos
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
        console.log(
          "el id de la categoria es: ",
          cat.id,
          " y su nombre es",
          cat.nombre
        );
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
            "el id de esta opcion es:",
            item.id,
            " y su nombre es:",
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
        console.log(`Prioridad seleccionada: "${nombrePrioridad}"`);
        console.log(
          "→ Cursos tras filtrar prioridad: ",
          cursosFiltrados.map(c => c.nombre));
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
      const precioTexto =
        curso.precio == 0 ? "Gratuito" : `$${curso.precio} mx`;
      info.textContent = `${curso.horas} hr | ${precioTexto}`;

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
    const scrollContainer = document.querySelector(".carousel-track-container");

    const cursosContainer = document.getElementById("cursos-container");

    const prevBtn = document.querySelector(".carousel-btn.prev");
    const nextBtn = document.querySelector(".carousel-btn.next");

    if (!scrollContainer || !cursosContainer || !prevBtn || !nextBtn) return;

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
