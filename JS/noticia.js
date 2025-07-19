document.addEventListener("DOMContentLoaded", async () => {
  const endpoint =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_noticia.php";

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));

  if (!id) {
    console.warn("No se proporcionó un ID de noticia válido.");
    return;
  }

  const seccion1 = document.querySelector("#noticia-detalle");
  const seccion2 = document.querySelector("#noticia-bloque2");

  const elementos = {
    img1: seccion1.querySelector(".imagen-noticia img"),
    img2: seccion2.querySelector(".imagen-noticia img"),
    texto1: seccion1.querySelector(".contenido-noticia p"),
    texto2: seccion2.querySelector(".contenido-noticia p"),
  };

  function insertarOverlayTitulo(titulo) {
    console.log("Título insertado en overlay:", JSON.stringify(titulo));

    const overlay = document.createElement("div");
    overlay.classList.add("overlay-titulo");
    overlay.innerHTML = `<h1>${titulo}</h1>`;
    seccion1.querySelector(".imagen-noticia").appendChild(overlay);
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estatus: 1 }),
    });

    if (!res.ok) throw new Error("No se pudo obtener la noticia");

    const data = await res.json();

    const noticia = data.find((n) => n.id === id);

    if (!noticia) {
      console.warn("No se encontró una noticia con ese ID.");
      return;
    }

    console.log("Noticia encontrada:", noticia);

    elementos.img1.src = `../ASSETS/noticia/NoticiasImg/noticia_img1_${id}.png`;
    elementos.img2.src = `../ASSETS/noticia/NoticiasImg/noticia_img2_${id}.png`;
    elementos.img1.alt = noticia.titulo;
    elementos.img2.alt = noticia.titulo;

    elementos.texto1.innerHTML = noticia.desc_uno.replace(/\n/g, "<br>");
    elementos.texto2.innerHTML = noticia.desc_dos.replace(/\n/g, "<br>");

    insertarOverlayTitulo(noticia.titulo);

    //------------- js para los botones
    const btnAnterior = document.getElementById("btn-anterior");
    const btnSiguiente = document.getElementById("btn-siguiente");
    const tituloAnterior = document.getElementById("titulo-anterior");
    const tituloSiguiente = document.getElementById("titulo-siguiente");

    const noticiasOrdenadas = data.sort((a, b) => a.id - b.id);

    const indiceActual = noticiasOrdenadas.findIndex((n) => n.id === id);

    if (indiceActual > 0) {
      const anterior = noticiasOrdenadas[indiceActual - 1];
      tituloAnterior.textContent = anterior.titulo;
      btnAnterior.addEventListener("click", () => {
        window.location.href = `../VIEW/Noticia.php?id=${anterior.id}`;
      });
    } else {
      btnAnterior.style.display = "none";
    }

    if (indiceActual < noticiasOrdenadas.length - 1) {
      const siguiente = noticiasOrdenadas[indiceActual + 1];
      tituloSiguiente.textContent = siguiente.titulo;
      btnSiguiente.addEventListener("click", () => {
        window.location.href = `../VIEW/Noticia.php?id=${siguiente.id}`;
      });
    } else {
      btnSiguiente.style.display = "none";
    }
  } catch (error) {
    console.error("Error al cargar la noticia:", error);
  }
});

//----------------------- JS para los comentarios

document.addEventListener("DOMContentLoaded", async () => {
  // --- Variables y endpoints ---
  const params = new URLSearchParams(window.location.search);
  const noticiaId = parseInt(params.get("id"));
  const lista = document.getElementById("lista-comentarios");
  const textarea = document.querySelector(".nuevo-comentario textarea");
  const contador = document.getElementById("contador-caracteres");
  const btnCancelar = document.getElementById("cancelar-respuesta");
  const btnEnviar = document.getElementById("btn-enviar-comentario");
  const wrapper = document.querySelector(".nuevo-comentario-wrapper");
  const endpointComentarios =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_comentario_noticia.php";
  const endpointInsertar =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_comentario_noticia.php";
  const endpointReaccion =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_reaccion_comentario.php";

  let usuarioId = null;
  let respuestaA = null;
  let respuestaA_nombre = "";
  let enviando = false;
  let ultimoComentario = "";

  // --- Usuario logeado desde cookie ---
  const usuarioCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("usuario="));
  if (usuarioCookie) {
    try {
      const datos = JSON.parse(decodeURIComponent(usuarioCookie.split("=")[1]));
      usuarioId = datos?.id || null;
      if (datos?.avatar) {
        document.querySelector(".nuevo-comentario-wrapper img").src =
          datos.avatar;
      }
    } catch (e) {
      usuarioId = null;
    }
  }

  // --- Habilitar/deshabilitar textarea y botón según login ---
  function actualizarEstadoInput() {
    if (!usuarioId) {
      textarea.disabled = true;
      btnEnviar.disabled = true;
      textarea.placeholder = "Inicia sesión para comentar...";
      btnEnviar.classList.add("disabled");
    } else {
      textarea.disabled = false;
      textarea.placeholder = "Añade un comentario...";
      btnEnviar.disabled = false;
      btnEnviar.classList.remove("disabled");
    }
  }
  actualizarEstadoInput();

  // --- Contador de caracteres ---
  textarea.addEventListener("input", () => {
    contador.textContent = `${textarea.value.length}/500`;
    btnEnviar.disabled =
      !usuarioId || enviando || textarea.value.trim().length === 0;
    btnEnviar.classList.toggle("disabled", btnEnviar.disabled);
  });

  // --- Cancelar respuesta ---
  btnCancelar.addEventListener("click", () => {
    respuestaA = null;
    respuestaA_nombre = "";
    textarea.placeholder = "Añade un comentario...";
    btnCancelar.style.display = "none";
    // Elimina el indicador visual y clase de respuesta
    let etiquetaAutor = document.getElementById("etiqueta-autor");
    if (etiquetaAutor) etiquetaAutor.remove();
    wrapper.classList.remove("respondiendo");
    textarea.value = "";
    contador.textContent = "0/500";
  });

  // --- Publicar comentario/respuesta ---
  btnEnviar.addEventListener("click", async () => {
    const texto = textarea.value.trim();
    if (!texto || enviando || texto === ultimoComentario || !usuarioId) return;

    if (texto.length > 500) {
      gcToast("Comentario demasiado largo", "warning");
      return;
    }

    enviando = true;
    btnEnviar.disabled = true;

    try {
      const res = await fetch(endpointInsertar, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noticia_id: noticiaId,
          usuario_id: usuarioId,
          comentario: texto,
          estatus: 1,
          ...(respuestaA ? { respuesta_a: respuestaA } : {}),
        }),
      });

      const data = await res.json();

      if (data?.mensaje === "Comentario registrado correctamente") {
        ultimoComentario = texto;
        textarea.value = "";
        contador.textContent = "0/500";
        respuestaA = null;
        respuestaA_nombre = "";
        textarea.placeholder = "Añade un comentario...";
        btnCancelar.style.display = "none";
        // Elimina el indicador visual y clase de respuesta
        let etiquetaAutor = document.getElementById("etiqueta-autor");
        if (etiquetaAutor) etiquetaAutor.remove();
        wrapper.classList.remove("respondiendo");
        gcToast("Comentario publicado", "exito");
        await cargarComentarios(noticiaId);
        scrollToUltimoComentario();
      } else {
        gcToast("No se pudo publicar el comentario", "error");
      }
    } catch (err) {
      gcToast("Error de red al comentar", "error");
    }

    enviando = false;
    btnEnviar.disabled = !usuarioId || textarea.value.trim().length === 0;
    btnEnviar.classList.toggle("disabled", btnEnviar.disabled);
  });

  function scrollToUltimoComentario() {
    const lista = document.getElementById("lista-comentarios");
    const ultimo = lista?.firstElementChild;
    if (ultimo) {
      ultimo.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // --- Render y carga de comentarios y respuestas (estilo YouTube) ---
  async function cargarComentarios(noticiaId) {
    lista.innerHTML = "";
    try {
      const res = await fetch(endpointComentarios, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noticia_id: noticiaId, estatus: 1 }),
      });
      let data = await res.json();
      if (!Array.isArray(data)) return;
      data.sort(
        (a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
      );
      data.forEach((comentario) => {
        const nodo = crearComentarioHTML(comentario);
        lista.appendChild(nodo);
      });
    } catch (err) {
      gcToast("Error al cargar comentarios", "error");
    }
  }

  // --- Render de comentario principal y todas sus respuestas ---
  function crearComentarioHTML(data) {
    // Mapa id de respuesta => usuario_nombre para las menciones
    const idToNombre = {};
    (data.respuestas || []).forEach((res) => {
      idToNombre[res.id] = res.usuario_nombre;
    });

    const div = document.createElement("div");
    div.className = "comentario";

    div.innerHTML = `
      <div class="comentario-usuario">
        <img src="../ASSETS/noticia/usuario_icon_1.png" alt="Avatar usuario">
      </div>
      <div class="comentario-contenido">
        <div class="comentario-meta">
          <strong>${data.usuario_nombre}</strong>
          <span>${tiempoRelativo(data.fecha_creacion)}</span>
        </div>
        <p class="comentario-texto">${data.comentario}</p>
        <div class="comentario-interacciones">
          <div class="reaccion" data-id="${data.id}" data-tipo="like">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#1a73e8">
              <path d="M1 21h4V9H1v12zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57c0-.41-.17-.79-.44-1.06L14.17 2 7.59 8.59C7.22 8.95 7 9.45 7 10v9c0 1.1.9 2 2 2h9c.78 0 1.48-.45 1.83-1.14l3.02-7.05c.1-.23.15-.47.15-.72V10z" />
            </svg>
            <span class="cantidad">${data.likes}</span>
          </div>
          <div class="reaccion" data-id="${data.id}" data-tipo="dislike">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#e53935">
              <path d="M15 3H6c-.78 0-1.48.45-1.83 1.14L1.15 11.2c-.1.23-.15.47-.15.72v1.09c0 1.1.9 2 2 2h6.31l-.95 4.57c0 .41.17-.79.44-1.06l1.12 1.12 6.59-6.59c.37-.36.59-.86.59-1.41V5c0-1.1-.9-2-2-2z" />
            </svg>
            <span class="cantidad">${data.dislikes}</span>
          </div>
          <a href="#" class="accion">Responder</a>
        </div>
        ${
          data.respuestas?.length
            ? `
          <div class="comentario-respuestas">
            <a href="#" class="ver-respuestas">
              <svg class="flecha" viewBox="0 0 24 24" width="16" height="16" fill="#1a73e8">
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
              </svg>
              Ver ${data.respuestas.length} respuesta(s)
            </a>
          </div>`
            : ""
        }
      </div>
    `;

    // Subrespuestas (todas bajo el comentario principal)
    if (data.respuestas?.length > 0) {
      const contenedor = document.createElement("div");
      contenedor.className = "subrespuestas";
      contenedor.style.display = "none";
      // Ordenar por fecha ascendente (más viejo arriba)
      data.respuestas.sort(
        (a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion)
      );
      data.respuestas.forEach((respuesta) => {
        contenedor.appendChild(
          crearRespuestaHTML(respuesta, idToNombre, data.id)
        );
      });
      div.appendChild(contenedor);
    }
    return div;
  }

  // --- Render de cada respuesta (estilo YouTube) ---
  function crearRespuestaHTML(res, idToNombre, idComentarioPrincipal) {
    // Si respuesta_a corresponde a otra respuesta, menciona al usuario con @
    let prefijo = "";
    if (
      res.respuesta_a &&
      res.respuesta_a !== idComentarioPrincipal &&
      idToNombre[res.respuesta_a]
    ) {
      prefijo = `<span class="mencion-usuario">@${
        idToNombre[res.respuesta_a]
      }</span> `;
    }
    const div = document.createElement("div");
    div.className = "comentario subcomentario";
    div.innerHTML = `
      <div class="comentario-usuario">
        <img src="../ASSETS/noticia/usuario_icon_1.png" alt="Avatar usuario">
      </div>
      <div class="comentario-contenido">
        <div class="comentario-meta">
          <strong>${res.usuario_nombre}</strong>
          <span>${tiempoRelativo(res.fecha_creacion)}</span>
        </div>
        <p class="comentario-texto">${prefijo}${res.comentario}</p>
        <div class="comentario-interacciones">
          <div class="reaccion" data-id="${res.id}" data-tipo="like">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#1a73e8">
              <path d="M1 21h4V9H1v12zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57c0-.41-.17-.79-.44-1.06L14.17 2 7.59 8.59C7.22 8.95 7 9.45 7 10v9c0 1.1.9 2 2 2h9c.78 0 1.48-.45 1.83-1.14l3.02-7.05c.1-.23.15-.47.15-.72V10z" />
            </svg>
            <span class="cantidad">${res.likes}</span>
          </div>
          <div class="reaccion" data-id="${res.id}" data-tipo="dislike">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#e53935">
              <path d="M15 3H6c-.78 0-1.48.45-1.83 1.14L1.15 11.2c-.1.23-.15.47-.15.72v1.09c0 1.1.9 2 2 2h6.31l-.95 4.57c0 .41.17-.79-.44-1.06l1.12 1.12 6.59-6.59c.37-.36.59-.86.59-1.41V5c0-1.1-.9-2-2-2z" />
            </svg>
            <span class="cantidad">${res.dislikes}</span>
          </div>
          <a href="#" class="accion">Responder</a>
        </div>
      </div>
    `;
    return div;
  }

  // --- Click handler para responder y reacciones ---
  document.addEventListener("click", (e) => {
    // Responder (en cualquier comentario o respuesta)
    if (e.target.classList.contains("accion")) {
      e.preventDefault();
      if (!usuarioId) {
        gcToast("Inicia sesión para responder", "advertencia");
        return;
      }
      const comentario = e.target.closest(".comentario");
      const esRespuesta = comentario.classList.contains("subcomentario");
      let id, autor;
      if (esRespuesta) {
        // Busca el padre principal
        let padre = comentario.parentElement.closest(
          ".comentario:not(.subcomentario)"
        );
        id = parseInt(padre.querySelector(".reaccion")?.dataset.id);
        autor =
          comentario.querySelector(".comentario-meta strong")?.textContent ||
          "";
        respuestaA = id; // SIEMPRE id del principal
        respuestaA_nombre = autor;
        textarea.placeholder = `@${autor} `;
        btnCancelar.style.display = "inline";
        // Indicador visual: inserta como hijo de .nuevo-comentario-wrapper
        let etiquetaAutor = document.getElementById("etiqueta-autor");
        if (!etiquetaAutor) {
          etiquetaAutor = document.createElement("div");
          etiquetaAutor.id = "etiqueta-autor";
          etiquetaAutor.textContent = `Respondiendo a: @${autor}`;
          wrapper.insertBefore(etiquetaAutor, wrapper.children[1]);
        } else {
          etiquetaAutor.textContent = `Respondiendo a: @${autor}`;
        }
        wrapper.classList.add("respondiendo");
      } else {
        // Si es principal, igual que siempre
        id = parseInt(comentario.querySelector(".reaccion")?.dataset.id);
        autor =
          comentario.querySelector(".comentario-meta strong")?.textContent ||
          "";
        respuestaA = id;
        respuestaA_nombre = autor;
        textarea.placeholder = `@${autor} `;
        btnCancelar.style.display = "inline";
        let etiquetaAutor = document.getElementById("etiqueta-autor");
        if (!etiquetaAutor) {
          etiquetaAutor = document.createElement("div");
          etiquetaAutor.id = "etiqueta-autor";
          etiquetaAutor.textContent = `Respondiendo a: @${autor}`;
          wrapper.insertBefore(etiquetaAutor, wrapper.children[1]);
        } else {
          etiquetaAutor.textContent = `Respondiendo a: @${autor}`;
        }
        wrapper.classList.add("respondiendo");
      }
      textarea.focus();
    }
    // Mostrar/ocultar subrespuestas
    if (e.target.closest(".ver-respuestas")) {
      e.preventDefault();
      const enlace = e.target.closest(".ver-respuestas");
      const comentario = enlace.closest(".comentario");
      const subrespuestas = comentario.querySelector(".subrespuestas");
      if (!subrespuestas) return;
      const abierto = enlace.classList.toggle("abierto");
      subrespuestas.style.display = abierto ? "flex" : "none";
      enlace.querySelector(".flecha")?.classList.toggle("girar", abierto);
      enlace.lastChild.textContent = abierto
        ? ` Ocultar ${subrespuestas.childElementCount} respuesta(s)`
        : ` Ver ${subrespuestas.childElementCount} respuesta(s)`;
    }
    // Likes/dislikes
    if (e.target.closest(".reaccion")) {
      e.preventDefault();
      if (!usuarioId) {
        gcToast("Inicia sesión para reaccionar", "advertencia");
        return;
      }
      const btn = e.target.closest(".reaccion");
      const comentarioId = btn.dataset.id;
      const tipo = btn.dataset.tipo;
      fetch(endpointReaccion, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comentario_id: comentarioId,
          usuario_id: usuarioId,
          reaccion: tipo,
          estatus: 1,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.mensaje?.toLowerCase().includes("ya reaccionaste")) {
            gcToast("Ya reaccionaste a este comentario", "advertencia");
          } else if (data?.mensaje?.toLowerCase().includes("registrada")) {
            gcToast(
              `¡Gracias por tu ${tipo === "like" ? "like" : "dislike"}!`,
              "exito"
            );
            cargarComentarios(noticiaId);
          } else {
            gcToast("No se pudo registrar la reacción", "error");
          }
        })
        .catch(() => gcToast("Error de red al reaccionar", "error"));
    }
  });

  // --- Helper tiempo relativo ---
  function tiempoRelativo(fechaStr) {
    const fecha = new Date(fechaStr);
    const ahora = new Date();
    const diff = (ahora - fecha) / 1000;
    if (diff < 60) return "Hace unos segundos";
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minuto(s)`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} hora(s)`;
    if (diff < 2592000) return `Hace ${Math.floor(diff / 86400)} día(s)`;
    if (diff < 31536000) return `Hace ${Math.floor(diff / 2592000)} mes(es)`;
    return `Hace ${Math.floor(diff / 31536000)} año(s)`;
  }

  // --- Inicializar ---
  if (noticiaId) {
    await cargarComentarios(noticiaId);
  }
  actualizarEstadoInput();
});
