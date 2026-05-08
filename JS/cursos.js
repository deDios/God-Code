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

    function normalizarTexto(valor) {
        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

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
        busquedaActual = normalizarTexto(buscarInput?.value || "");
        aplicarFiltros();
    });

    buscarInput?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            busquedaActual = normalizarTexto(buscarInput.value);
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
                normalizarTexto(curso.nombre).includes(normalizarTexto(busquedaActual))
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









    // ------------------------------------------------------ section 2 - cursos finalizados
    const cursosFinalizadosCarrusel = document.getElementById("cursos-finalizados-carrusel");
    const cursosFinalizadosPrev = document.querySelector(".cursos-finalizados__btn.prev");
    const cursosFinalizadosNext = document.querySelector(".cursos-finalizados__btn.next");
    const cursosFinalizadosIndicador = document.getElementById("cursos-finalizados-indicador");

    let cursosFinalizados = [];
    let indiceFinalizados = 0;

    if (cursosFinalizadosCarrusel) {
        fetch("https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_cursos.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estatus: 3 }),
        })
            .then((res) => res.json())
            .then((data) => {
                cursosFinalizados = Array.isArray(data)
                    ? data
                        .sort((a, b) => Number(b.id) - Number(a.id))
                        .slice(0, 5)
                    : [];

                renderizarCursosFinalizados(cursosFinalizados);
                mostrarCursoFinalizado(0);

                const mostrarBotones = cursosFinalizados.length > 1;

                if (cursosFinalizadosPrev) {
                    cursosFinalizadosPrev.style.display = mostrarBotones ? "flex" : "none";
                }

                if (cursosFinalizadosNext) {
                    cursosFinalizadosNext.style.display = mostrarBotones ? "flex" : "none";
                }

                console.log("[Cursos finalizados] Cursos cargados:", cursosFinalizados);
            })
            .catch((err) => {
                console.error("[Cursos finalizados] Error:", err);

                renderizarCursosFinalizados([]);
            });
    }

    cursosFinalizadosPrev?.addEventListener("click", () => {
        mostrarCursoFinalizado(indiceFinalizados - 1);
    });

    cursosFinalizadosNext?.addEventListener("click", () => {
        mostrarCursoFinalizado(indiceFinalizados + 1);
    });

    function renderizarCursosFinalizados(cursos) {
        if (!cursosFinalizadosCarrusel) return;

        cursosFinalizadosCarrusel.innerHTML = "";

        if (!Array.isArray(cursos) || cursos.length === 0) {
            cursosFinalizadosCarrusel.innerHTML = `
            <div class="cursos-finalizados__empty">
                No hay cursos finalizados disponibles.
            </div>
        `;

            if (cursosFinalizadosPrev) cursosFinalizadosPrev.style.display = "none";
            if (cursosFinalizadosNext) cursosFinalizadosNext.style.display = "none";

            return;
        }

        cursos.forEach((curso) => {
            const slide = document.createElement("article");
            slide.classList.add("cursos-finalizados__slide");

            const img = document.createElement("img");
            cargarImagenCurso(img, curso.id);
            img.alt = curso.nombre || "Curso finalizado";

            slide.innerHTML = `
            <div class="cursos-finalizados__imagen"></div>

            <div class="cursos-finalizados__texto">
                <h3>${curso.nombre || "Curso finalizado"}</h3>
                <p>${curso.descripcion_media || curso.descripcion_breve || "Descripción no disponible."}</p>
                <span>${formatearFechaCurso(curso.fecha_inicio)}</span>
            </div>
        `;

            slide.querySelector(".cursos-finalizados__imagen").appendChild(img);
            cursosFinalizadosCarrusel.appendChild(slide);
        });
    }

    function mostrarCursoFinalizado(n) {
        const slides = document.querySelectorAll(".cursos-finalizados__slide");
        if (!slides.length) return;

        slides.forEach((slide) => slide.classList.remove("activo"));

        indiceFinalizados = (n + slides.length) % slides.length;
        slides[indiceFinalizados].classList.add("activo");

        if (cursosFinalizadosIndicador) {
            cursosFinalizadosIndicador.textContent = `${indiceFinalizados + 1} / ${slides.length}`;
        }
    }

    function formatearFechaCurso(fecha) {
        if (!fecha) return "Fecha no disponible";

        const date = new Date(`${fecha}T00:00:00`);

        if (Number.isNaN(date.getTime())) return fecha;

        return date.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    }
});