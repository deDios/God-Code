//JS/cursos.js
document.addEventListener("DOMContentLoaded", () => {

    const cursosContainer = document.getElementById("cursos-container");
    const categoriaSelect = document.getElementById("categoria");
    const explorarSelect = document.getElementById("explorar");
    const limpiarBtn = document.getElementById("limpiar-filtros");
    const buscarInput = document.getElementById("buscar-curso");
    const buscarBtn = document.getElementById("btn-buscar-curso");
    const verTodosBtn = document.getElementById("ver-todos-cursos");

    if (!cursosContainer) return;

    let cursosOriginales = [];
    let busquedaActual = "";

    function cargarImagenCurso(imgEl, id) {
        const exts = ["webp", "png", "jpg", "jpeg", "gif"];
        let idx = 0;

        function intentar() {
            if (idx >= exts.length) {
                imgEl.src = "/ASSETS/cursos/curso_noEncontrado.png";
                imgEl.onerror = null;
                return;
            }

            imgEl.onerror = () => {
                idx++;
                intentar();
            };

            imgEl.src = `/ASSETS/cursos/img${id}.${exts[idx]}`;
        }

        intentar();
    }

    fetch("https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_categorias.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estatus: 1 }),
    })
        .then((res) => res.json())
        .then((categorias) => {
            if (!Array.isArray(categorias) || !categoriaSelect) return;

            categorias.forEach((cat) => {
                const option = document.createElement("option");
                option.value = cat.id;
                option.textContent = cat.nombre;
                categoriaSelect.appendChild(option);
            });
        })
        .catch((err) => console.error("[Cursos] Error al cargar categorías:", err));

    fetch("https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_prioridad.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estatus: 1 }),
    })
        .then((res) => res.json())
        .then((prioridades) => {
            if (!Array.isArray(prioridades) || !explorarSelect) return;

            prioridades
                .sort((a, b) => a.id - b.id)
                .forEach((item) => {
                    const option = document.createElement("option");
                    option.value = item.id;
                    option.textContent = item.nombre;
                    explorarSelect.appendChild(option);
                });
        })
        .catch((err) => console.error("[Cursos] Error al cargar prioridades:", err));

    fetch("https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_cursos.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estatus: 1 }),
    })
        .then((res) => res.json())
        .then((data) => {
            cursosOriginales = Array.isArray(data) ? data : [];
            renderizarCursos(cursosOriginales);
            inicializarCarrusel();
            console.log("[Cursos] Cursos cargados:", cursosOriginales);
        })
        .catch((err) => console.error("[Cursos] Error al cargar cursos:", err));

    categoriaSelect?.addEventListener("change", aplicarFiltros);
    explorarSelect?.addEventListener("change", aplicarFiltros);

    buscarBtn?.addEventListener("click", () => {
        busquedaActual = buscarInput?.value.trim().toLowerCase() || "";
        aplicarFiltros();
    });

    buscarInput?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            busquedaActual = buscarInput.value.trim().toLowerCase();
            aplicarFiltros();
        }
    });

    buscarInput?.addEventListener("input", () => {
        if (buscarInput.value.trim() === "") {
            busquedaActual = "";
            aplicarFiltros();
        }
    });

    limpiarBtn?.addEventListener("click", () => {
        if (categoriaSelect) categoriaSelect.value = "";
        if (explorarSelect) explorarSelect.value = "";
        if (buscarInput) buscarInput.value = "";

        busquedaActual = "";

        renderizarCursos(cursosOriginales);
        inicializarCarrusel();
    });

    verTodosBtn?.addEventListener("click", () => {
        if (categoriaSelect) categoriaSelect.value = "";
        if (explorarSelect) explorarSelect.value = "";
        if (buscarInput) buscarInput.value = "";

        busquedaActual = "";

        renderizarCursos(cursosOriginales);
        inicializarCarrusel();
    });

    function aplicarFiltros() {
        const categoriaSeleccionada = categoriaSelect?.value || "";
        const explorarSeleccionado = explorarSelect?.value || "";

        let cursosFiltrados = [...cursosOriginales];

        if (categoriaSeleccionada) {
            cursosFiltrados = cursosFiltrados.filter(
                (curso) => curso.categoria == categoriaSeleccionada
            );
        }

        if (explorarSeleccionado) {
            cursosFiltrados = cursosFiltrados.filter(
                (curso) => curso.prioridad == explorarSeleccionado
            );
        }

        if (busquedaActual) {
            cursosFiltrados = cursosFiltrados.filter((curso) =>
                String(curso.nombre || "").toLowerCase().includes(busquedaActual)
            );
        }

        renderizarCursos(cursosFiltrados);
        inicializarCarrusel();
    }

    function renderizarCursos(cursos) {
        cursosContainer.innerHTML = "";

        if (!Array.isArray(cursos) || cursos.length === 0) {
            cursosContainer.innerHTML = `
        <div class="cursos-view__empty">
          No encontramos cursos con esos filtros.
        </div>
      `;
            return;
        }

        cursos.forEach((curso) => {
            const cardLink = document.createElement("a");
            cardLink.href = `/VIEW/cursoInfo.php?id=${curso.id}`;
            cardLink.classList.add("curso-link");

            const card = document.createElement("div");
            card.classList.add("card");

            const img = document.createElement("img");
            cargarImagenCurso(img, curso.id);
            img.alt = curso.nombre || "Curso GodCode";

            const contenido = document.createElement("div");
            contenido.classList.add("contenido");

            const titulo = document.createElement("h4");
            titulo.textContent = curso.nombre || "Curso sin nombre";

            const descripcion = document.createElement("p");
            descripcion.textContent = curso.descripcion_breve || "Descripción no disponible.";

            const profesor = document.createElement("span");
            profesor.classList.add("profesor");
            profesor.textContent = `Impartido por: ${curso.tutor_nombre || curso.profesor || "Juan Pablo"}`;

            const info = document.createElement("p");
            info.classList.add("info");

            const precioTexto = Number(curso.precio) === 0 ? "Gratuito" : `$${curso.precio} Mx`;
            info.textContent = `${curso.horas || 0} Hr | ${precioTexto}`;

            contenido.appendChild(titulo);
            contenido.appendChild(descripcion);
            contenido.appendChild(profesor);
            contenido.appendChild(info);

            card.appendChild(img);
            card.appendChild(contenido);
            cardLink.appendChild(card);

            cursosContainer.appendChild(cardLink);
        });
    }

    function inicializarCarrusel() {
        const scrollContainer = document.querySelector(".carousel-track-container");
        const prevBtn = document.querySelector(".carousel-btn.prev");
        const nextBtn = document.querySelector(".carousel-btn.next");

        if (!scrollContainer || !prevBtn || !nextBtn) return;

        const card = cursosContainer.querySelector(".card");
        if (!card) {
            prevBtn.style.display = "none";
            nextBtn.style.display = "none";
            return;
        }

        const cardWidth = card.offsetWidth + 32;

        const prevButton = prevBtn.cloneNode(true);
        const nextButton = nextBtn.cloneNode(true);

        prevBtn.parentNode.replaceChild(prevButton, prevBtn);
        nextBtn.parentNode.replaceChild(nextButton, nextBtn);

        prevButton.addEventListener("click", () => {
            scrollContainer.scrollBy({ left: -cardWidth, behavior: "smooth" });
        });

        nextButton.addEventListener("click", () => {
            scrollContainer.scrollBy({ left: cardWidth, behavior: "smooth" });
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