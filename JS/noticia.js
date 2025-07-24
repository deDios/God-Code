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
  // -------- Variables y endpoints --------
  const params = new URLSearchParams(window.location.search);
  const noticiaId = parseInt(params.get("id"));
  const lista = document.getElementById("lista-comentarios");
  const textarea = document.querySelector(".nuevo-comentario textarea");
  const contador = document.getElementById("contador-caracteres");
  const btnCancelar = document.getElementById("cancelar-respuesta");
  const btnEnviar = document.getElementById("btn-enviar-comentario");
  const endpointComentarios =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_comentario_noticia.php";
  const endpointInsertar =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_comentario_noticia.php";
  const endpointReaccion =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_reaccion_comentario.php";
  const endpointQuitarReaccion =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/d_reaccion_comentario.php";

  let usuarioId = null;
  let usuarioNombre = "Tú";
  let respuestaA = null;
  let respuestaA_nombre = "";
  let enviando = false;
  let ultimoComentario = "";

  function getUsuarioDeCookie() {
    const usuarioCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("usuario="));
    if (usuarioCookie) {
      try {
        const datos = JSON.parse(
          decodeURIComponent(usuarioCookie.split("=")[1])
        );
        return datos;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // -------- recuperar usuario logeado de cookie --------
  const usuario = getUsuarioDeCookie();
  if (usuario) {
    usuarioId = usuario?.id || null;
    usuarioNombre = usuario?.nombre || "Tú";
    if (usuario?.avatar) {
      document.querySelector(".nuevo-comentario-wrapper img").src =
        usuario.avatar;
    }
  }

  function actualizarEstadoInput() {
    if (!usuarioId) {
      textarea.disabled = true;
      btnEnviar.disabled = true;
      textarea.placeholder = "Inicia sesión para comentar...";
      btnEnviar.classList.add("disabled");
    } else {
      textarea.disabled = false;
      textarea.placeholder = "Añade un comentario...";
      btnEnviar.disabled = true;
      btnEnviar.classList.add("disabled");
    }
  }
  actualizarEstadoInput();

  textarea.addEventListener("input", () => {
    contador.textContent = `${textarea.value.length}/500`;
    btnEnviar.disabled =
      !usuarioId ||
      enviando ||
      textarea.value.trim().length === 0 ||
      textarea.value.length > 500;
    btnEnviar.classList.toggle("disabled", btnEnviar.disabled);
  });

  textarea.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey && !btnEnviar.disabled) {
      e.preventDefault();
      btnEnviar.click();
    }
  });

  // -------- cancelar respuesta --------
  btnCancelar.addEventListener("click", () => {
    respuestaA = null;
    respuestaA_nombre = "";
    textarea.value = "";
    textarea.placeholder = "Añade un comentario...";
    btnCancelar.style.display = "none";
    contador.textContent = "0/500";
  });

  function hacerStickyAnim(nodo) {
    if (!nodo) return;
    nodo.classList.add("sticky-anim");
    setTimeout(() => {
      nodo.classList.remove("sticky-anim");
    }, 2000);
    nodo.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function esComentarioDuplicado(texto) {
    const clean = (str) =>
      (str || "")
        .replace(/\s+/g, " ")
        .replace(/^\s+|\s+$/g, "")
        .toLowerCase();
    return clean(texto) === clean(ultimoComentario);
  }

  // -------- enviar comentario/respuesta --------
  btnEnviar.addEventListener("click", async () => {
    let texto = textarea.value.trim();
    if (!texto || enviando || esComentarioDuplicado(texto) || !usuarioId)
      return;
    if (enviando) return;

    // si es respuesta, anteponer @nombre
    if (respuestaA && respuestaA_nombre) {
      const atText = `@${respuestaA_nombre} `;
      if (!texto.startsWith(atText)) {
        texto = atText + texto.replace(/^@[\w\s]+/, "").trim();
      }
    }

    if (texto.length > 500) {
      gcToast("Comentario demasiado largo", "warning");
      return;
    }
    if (esComentarioDuplicado(texto)) {
      gcToast("No publiques el mismo texto dos veces.", "warning");
      return;
    }

    const body = {
      noticia_id: noticiaId,
      usuario_id: usuarioId,
      comentario: texto,
      estatus: 1,
      ...(respuestaA ? { respuesta_a: respuestaA } : {}),
    };

    enviando = true;
    btnEnviar.disabled = true;
    textarea.disabled = true;

    try {
      const res = await fetch(endpointInsertar, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data?.mensaje === "Comentario registrado correctamente") {
        ultimoComentario = texto;

        if (respuestaA) {
          // Es una respuesta: recarga SOLO el comentario padre (donde debe aparecer la respuesta)
          await recargarUnComentario(
            respuestaA,
            document.querySelector(`[data-comentario-id="${respuestaA}"]`)
          );
        } else {
          // Es comentario principal: agrégalo optimistamente al inicio (o recarga toda la lista si prefieres)
          const nodo = await crearNodoComentarioInstantaneo(
            {
              id: data?.id ?? Date.now(),
              usuario_id: usuarioId,
              usuario_nombre: usuarioNombre,
              comentario: texto,
              fecha_creacion: new Date().toISOString(),
              likes: 0,
              dislikes: 0,
              mi_reaccion: null,
              respuestas: [],
            },
            respuestaA
          );
          lista.insertBefore(nodo, lista.firstChild);
          hacerStickyAnim(nodo);
        }

        textarea.value = "";
        contador.textContent = "0/500";
        respuestaA = null;
        respuestaA_nombre = "";
        textarea.placeholder = "Añade un comentario...";
        btnCancelar.style.display = "none";
        gcToast("Comentario publicado", "exito");
      } else {
        gcToast("No se pudo publicar el comentario", "error");
      }
    } catch (err) {
      gcToast("Error de red al comentar", "error");
    }

    enviando = false;
    btnEnviar.disabled = !usuarioId || textarea.value.trim().length === 0;
    textarea.disabled = false;
    btnEnviar.classList.toggle("disabled", btnEnviar.disabled);
  });

  async function crearNodoComentarioInstantaneo(data, respuestaAId) {
    return crearComentarioHTML({
      ...data,
      respuestas: [],
    });
  }

  // --------- cargar comentarios ---------
  async function cargarComentarios(noticiaId) {
    try {
      const res = await fetch(endpointComentarios, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noticia_id: noticiaId,
          estatus: 1,
          ...(usuarioId ? { usuario_id: usuarioId } : {}),
        }),
      });
      let data = await res.json();
      if (!Array.isArray(data)) return mostrarErrorCarga();
      data.sort(
        (a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
      );
      lista.innerHTML = "";
      data.forEach((comentario) => {
        const nodo = crearComentarioHTML(comentario);
        lista.appendChild(nodo);
      });
    } catch (err) {
      mostrarErrorCarga();
      gcToast("Error al cargar comentarios", "error");
    }
  }

  function mostrarErrorCarga() {
    lista.innerHTML = `<div style="text-align:center;padding:1.6rem;">
      <p>Error al cargar comentarios.</p>
      <button id="reintentar-cargar" class="btn btn-primary" style="margin-top:10px;">Reintentar</button>
    </div>`;
    document.getElementById("reintentar-cargar").onclick = () =>
      cargarComentarios(noticiaId);
  }

  // --------- render comentario principal y respuestas ---------
  function crearComentarioHTML(data) {
    const idToNombre = {};
    (data.respuestas || []).forEach((res) => {
      idToNombre[res.id] = res.usuario_nombre;
    });

    const div = document.createElement("div");
    div.className = "comentario";
    div.dataset.comentarioId = data.id;

    // like/dislike icon
    const likeActivo = data.mi_reaccion === "like";
    const dislikeActivo = data.mi_reaccion === "dislike";

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
          <div class="reaccion like ${likeActivo ? "liked" : ""}" data-id="${
      data.id
    }" data-tipo="like" aria-label="Like">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M1 21h4V9H1v12zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57c0-.41-.17-.79-.44-1.06L14.17 2 7.59 8.59C7.22 8.95 7 9.45 7 10v9c0 1.1.9 2 2 2h9c.78 0 1.48-.45 1.83-1.14l3.02-7.05c.1-.23.15-.47.15-.72V10z"/>
            </svg>
            <span class="cantidad">${data.likes}</span>
          </div>
          <div class="reaccion dislike ${
            dislikeActivo ? "disliked" : ""
          }" data-id="${data.id}" data-tipo="dislike" aria-label="Dislike">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M15 3H6c-.78 0-1.48.45-1.83 1.14L1.15 11.2c-.1.23-.15.47-.15.72v1.09c0 1.1.9 2 2 2h6.31l-.95 4.57c0 .41.17-.79.44-1.06l1.12 1.12 6.59-6.59c.37-.36.59-.86.59-1.41V5c0-1.1-.9-2-2-2z"/>
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

    // subrespuestas
    if (data.respuestas?.length > 0) {
      const contenedor = document.createElement("div");
      contenedor.className = "subcomentarios subrespuestas";
      contenedor.style.display = "none";
      data.respuestas.sort(
        (a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion)
      );
      data.respuestas.forEach((respuesta) => {
        contenedor.appendChild(
          crearRespuestaHTML(respuesta, idToNombre, data.id, data)
        );
      });
      div.appendChild(contenedor);
    }
    return div;
  }

  // --------- armar respuesta ---------
  function crearRespuestaHTML(
    res,
    idToNombre,
    idComentarioPrincipal,
    padreComentario
  ) {
    let prefijo = "";
    if (
      res.respuesta_a &&
      res.respuesta_a !== idComentarioPrincipal &&
      idToNombre[res.respuesta_a]
    ) {
      if (
        !res.comentario.trim().startsWith(`@${idToNombre[res.respuesta_a]}`)
      ) {
        prefijo = `<span class="mencion-usuario">@${
          idToNombre[res.respuesta_a]
        }</span> `;
      }
    }

    // like/dislike ahora con estados
    const likeActivo = res.mi_reaccion === "like";
    const dislikeActivo = res.mi_reaccion === "dislike";

    const div = document.createElement("div");
    div.className = "comentario subcomentario";
    div.dataset.comentarioId = res.id;
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
          <div class="reaccion like ${likeActivo ? "liked" : ""}" data-id="${
      res.id
    }" data-tipo="like" aria-label="Like">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M1 21h4V9H1v12zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57c0-.41-.17-.79-.44-1.06L14.17 2 7.59 8.59C7.22 8.95 7 9.45 7 10v9c0 1.1.9 2 2 2h9c.78 0 1.48-.45 1.83-1.14l3.02-7.05c.1-.23.15-.47.15-.72V10z"/>
            </svg>
            <span class="cantidad">${res.likes}</span>
          </div>
          <div class="reaccion dislike ${
            dislikeActivo ? "disliked" : ""
          }" data-id="${res.id}" data-tipo="dislike" aria-label="Dislike">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M15 3H6c-.78 0-1.48.45-1.83 1.14L1.15 11.2c-.1.23-.15.47-.15.72v1.09c0 1.1.9 2 2 2h6.31l-.95 4.57c0 .41.17-.79.44-1.06l1.12 1.12 6.59-6.59c.37-.36.59-.86.59-1.41V5c0-1.1-.9-2-2-2z"/>
            </svg>
            <span class="cantidad">${res.dislikes}</span>
          </div>
          <a href="#" class="accion">Responder</a>
        </div>
      </div>
    `;
    return div;
  }

  document.addEventListener("click", async (e) => {
    // ---- responder a comentario ----
    if (e.target.classList.contains("accion")) {
      e.preventDefault();
      if (!usuarioId) {
        gcToast("Inicia sesión para responder", "advertencia");
        return;
      }
      const comentario = e.target.closest(".comentario");
      const autor =
        comentario.querySelector(".comentario-meta strong")?.textContent || "";
      let principal = comentario;
      while (principal && principal.classList.contains("subcomentario")) {
        principal = principal.parentElement.closest(
          ".comentario:not(.subcomentario)"
        );
      }
      respuestaA = principal
        ? parseInt(principal.querySelector(".reaccion")?.dataset.id)
        : parseInt(comentario.querySelector(".reaccion")?.dataset.id);
      respuestaA_nombre = autor;

      const atText = `@${respuestaA_nombre} `;
      if (!textarea.value.startsWith(atText)) {
        textarea.value = atText;
      }
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      btnCancelar.style.display = "inline";
      contador.textContent = `${textarea.value.length}/500`;
    }

    // ---- mostrar/ocultar respuestas ----
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

    // ---- like/dislike ----
    if (e.target.closest(".reaccion")) {
      e.preventDefault();
      if (!usuarioId) {
        gcToast("Inicia sesión para reaccionar", "advertencia");
        return;
      }
      const btn = e.target.closest(".reaccion");
      const comentarioId = btn.dataset.id;
      const tipo = btn.dataset.tipo;
      const comentarioDiv = btn.closest(".comentario, .subcomentario");
      if (!comentarioDiv) return;

      const likeBtn = comentarioDiv.querySelector(".reaccion.like");
      const dislikeBtn = comentarioDiv.querySelector(".reaccion.dislike");

      const prevLike = likeBtn.classList.contains("liked");
      const prevDislike = dislikeBtn.classList.contains("disliked");

      // deshabilita botones para evitar multiples fetch
      likeBtn.style.pointerEvents = "none";
      dislikeBtn.style.pointerEvents = "none";

      try {
        if (
          (tipo === "like" && prevDislike) ||
          (tipo === "dislike" && prevLike)
        ) {
          await fetch(endpointQuitarReaccion, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              comentario_id: comentarioId,
              usuario_id: usuarioId,
            }),
          });
        }

        let endpoint, fetchBody;
        if (
          (tipo === "like" && prevLike) ||
          (tipo === "dislike" && prevDislike)
        ) {
          // en caso de ya haber reaccionado quita la que estaba
          endpoint = endpointQuitarReaccion;
          fetchBody = {
            comentario_id: comentarioId,
            usuario_id: usuarioId,
          };
        } else {
          endpoint = endpointReaccion;
          fetchBody = {
            comentario_id: comentarioId,
            usuario_id: usuarioId,
            reaccion: tipo,
            estatus: 1,
          };
        }
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fetchBody),
        });
        const data = await res.json();

        if (
          endpoint === endpointReaccion &&
          data?.mensaje?.toLowerCase().includes("registrada")
        ) {
          gcToast(
            `¡Gracias por tu ${tipo === "like" ? "like" : "dislike"}!`,
            "exito"
          );
        } else if (
          endpoint === endpointQuitarReaccion &&
          data?.mensaje?.toLowerCase().includes("eliminada")
        ) {
          gcToast("Reacción eliminada.", "exito");
        } else if (data?.mensaje?.toLowerCase().includes("ya reaccionaste")) {
          gcToast("Ya reaccionaste a este comentario", "advertencia");
        } else {
          gcToast(
            data?.mensaje || "No se pudo actualizar la reacción",
            "warning"
          );
        }
        await recargarUnComentario(comentarioId, comentarioDiv);
      } catch (err) {
        gcToast("Error de red al reaccionar", "error");
      } finally {
        likeBtn.style.pointerEvents = "";
        dislikeBtn.style.pointerEvents = "";
      }
    }
  });

  async function recargarUnComentario(comentarioId, comentarioDiv) {
    try {
      const res = await fetch(endpointComentarios, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noticia_id: noticiaId,
          estatus: 1,
          ...(usuarioId ? { usuario_id: usuarioId } : {}),
        }),
      });
      let data = await res.json();
      if (!Array.isArray(data)) return;
      let comentario = null;

      for (const c of data) {
        if (c.id == comentarioId) {
          comentario = c;
          break;
        }
        if (c.respuestas?.length) {
          const sub = c.respuestas.find((r) => r.id == comentarioId);
          if (sub) {
            comentario = sub;
            break;
          }
        }
      }
      if (!comentario) return;

      const nuevoNodo =
        comentario.respuesta_a == null
          ? crearComentarioHTML(comentario)
          : crearRespuestaHTML(comentario, {}, comentario.respuesta_a);
      comentarioDiv.replaceWith(nuevoNodo);
    } catch (e) {
      cargarComentarios(noticiaId);
    }
  }

  // -------- Tiempo relativo --------
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

  // -------- Inicializar --------
  if (noticiaId) {
    await cargarComentarios(noticiaId);
  }
  actualizarEstadoInput();
  contador.textContent = "0/500";
});
