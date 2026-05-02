// Section 1 - Blog noticias V2
document.addEventListener("DOMContentLoaded", () => {
  const endpointNoticias =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_noticia.php";

  const track = document.querySelector("#blog-v2-noticias-track");
  const dotsContainer = document.querySelector("#blog-v2-dots");

  const NOTICIAS_POR_SLIDE = 3;
  const TOTAL_SLIDES = 4;

  let noticias = [];
  let slideActual = 0;

  function cargarImagenConFallback(imgEl, basePath) {
    const exts = ["webp", "png", "jpg", "jpeg", "gif"];
    let idx = 0;

    function intentar() {
      if (idx >= exts.length) {
        imgEl.src = "/ASSETS/noticia/NoticiasImg/noticia_noEncontrada.png";
        imgEl.onerror = null;
        return;
      }

      imgEl.onerror = () => {
        idx++;
        intentar();
      };

      imgEl.src = `${basePath}.${exts[idx]}`;
    }

    intentar();
  }

  async function cargarNoticias() {
    try {
      const res = await fetch(endpointNoticias, {
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

      noticias = data
        .filter((noticia) => Number(noticia.estatus) === 1)
        .sort((a, b) => Number(b.id) - Number(a.id))
        .slice(0, NOTICIAS_POR_SLIDE * TOTAL_SLIDES);

      renderizarCarrusel();
      renderizarDots();
      mostrarSlide(0);
    } catch (error) {
      console.error("Error al cargar noticias para blog V2:", error);
    }
  }

  function renderizarCarrusel() {
    if (!track) return;

    track.innerHTML = "";

    for (let i = 0; i < TOTAL_SLIDES; i++) {
      const inicio = i * NOTICIAS_POR_SLIDE;
      const grupo = noticias.slice(inicio, inicio + NOTICIAS_POR_SLIDE);

      const slide = document.createElement("div");
      slide.className = "blog-v2-slide";

      grupo.forEach((noticia) => {
        slide.appendChild(crearCardNoticia(noticia));
      });

      track.appendChild(slide);
    }
  }

  function crearCardNoticia(noticia) {
    const card = document.createElement("article");
    card.className = "blog-v2-card";

    const imagenWrap = document.createElement("div");
    imagenWrap.className = "blog-v2-card-img";

    const categoria = document.createElement("span");
    categoria.className = "blog-v2-tag";
    categoria.textContent = noticia.categoria || "TECNOLOGÍA";

    const img = document.createElement("img");
    cargarImagenConFallback(
      img,
      `/ASSETS/noticia/NoticiasImg/noticia_img1_${noticia.id}`
    );
    img.alt = noticia.titulo || `Imagen noticia ${noticia.id}`;

    imagenWrap.appendChild(categoria);
    imagenWrap.appendChild(img);

    const body = document.createElement("div");
    body.className = "blog-v2-card-body";

    const titulo = document.createElement("h3");
    titulo.textContent = noticia.titulo || "Noticia GodCode";

    const descripcion = document.createElement("p");
    descripcion.textContent =
      noticia.desc_uno ||
      noticia.descripcion ||
      "Descubre las últimas noticias en tecnología, innovación y avances.";

    const fecha = document.createElement("small");
    fecha.className = "blog-v2-date";
    fecha.textContent = formatearFechaNoticia(noticia.fecha_creacion);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "blog-v2-btn";
    btn.textContent = "Leer mas...";
    btn.addEventListener("click", () => {
      window.location.href = `/VIEW/Noticia.php?id=${noticia.id}`;
    });

    body.appendChild(titulo);
    body.appendChild(descripcion);
    body.appendChild(fecha);
    body.appendChild(btn);

    card.appendChild(imagenWrap);
    card.appendChild(body);

    return card;
  }

  function renderizarDots() {
    if (!dotsContainer) return;

    dotsContainer.innerHTML = "";

    for (let i = 0; i < TOTAL_SLIDES; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "blog-v2-dot";
      dot.setAttribute("aria-label", `Ir al grupo ${i + 1}`);

      dot.addEventListener("click", () => mostrarSlide(i));

      dotsContainer.appendChild(dot);
    }
  }

  function mostrarSlide(index) {
    if (!track) return;

    slideActual = index;
    track.style.transform = `translateX(-${slideActual * 100}%)`;

    document.querySelectorAll(".blog-v2-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === slideActual);
    });
  }

  function formatearFechaNoticia(fecha) {
    if (!fecha) return "Fecha no disponible";

    const fechaObj = new Date(fecha);

    if (Number.isNaN(fechaObj.getTime())) {
      return fecha;
    }

    return fechaObj.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  cargarNoticias();
});









// --------------------------- Section 2 - Ranking noticias comunidad
document.addEventListener("DOMContentLoaded", () => {
  const endpointTools =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/godcode01_tools.php";

  const rankingList = document.querySelector(".blog-v2-ranking-list");

  if (!rankingList) {
    console.warn("[BlogV2 Ranking] No existe .blog-v2-ranking-list en el DOM");
    return;
  }

  function cargarImagenRanking(imgEl, id) {
    const exts = ["webp", "png", "jpg", "jpeg", "gif"];
    let idx = 0;

    function intentar() {
      if (idx >= exts.length) {
        imgEl.src = "/ASSETS/noticia/NoticiasImg/noticia_noEncontrada.png";
        imgEl.onerror = null;
        return;
      }

      imgEl.onerror = () => {
        idx++;
        intentar();
      };

      imgEl.src = `/ASSETS/noticia/NoticiasImg/noticia_img1_${id}.${exts[idx]}`;
    }

    intentar();
  }

  function crearItemRanking(noticia, index) {
    const link = document.createElement("a");
    link.className = "blog-v2-ranking-item";
    link.href = `/VIEW/Noticia.php?id=${noticia.id}`;

    const numero = document.createElement("strong");
    numero.textContent = `${index + 1}.`;

    const img = document.createElement("img");
    cargarImagenRanking(img, noticia.id);
    img.alt = noticia.titulo || `Noticia ${noticia.id}`;

    const texto = document.createElement("p");
    texto.textContent = noticia.titulo || "Noticia GodCode";

    link.appendChild(numero);
    link.appendChild(img);
    link.appendChild(texto);

    return link;
  }

  async function cargarRankingNoticias() {
    try {
      //console.log("[BlogV2 Ranking] Consultando endpoint:", endpointTools);

      const res = await fetch(endpointTools, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ranking_noticias_comentarios",
          estatus_noticia: 1,
          estatus_comentario: 1,
          limit: 4,
        }),
      });

      const data = await res.json();

      //console.log("[BlogV2 Ranking] Respuesta completa:", data);
      //console.log("[BlogV2 Ranking] Noticias recibidas:", data?.data);

      if (!res.ok || !data.ok || !Array.isArray(data.data)) {
        throw new Error(data?.error || "Respuesta inválida del ranking");
      }

      rankingList.innerHTML = "";

      if (data.data.length === 0) {
        rankingList.innerHTML = `
          <p class="blog-v2-ranking-empty">
            Aún no hay noticias comentadas.
          </p>
        `;
        return;
      }

      data.data.forEach((noticia, index) => {
        rankingList.appendChild(crearItemRanking(noticia, index));
      });
    } catch (error) {
      console.error("[BlogV2 Ranking] Error al cargar ranking:", error);

      rankingList.innerHTML = `
        <p class="blog-v2-ranking-empty">
          No se pudo cargar el ranking por ahora.
        </p>
      `;
    }
  }

  cargarRankingNoticias();
});