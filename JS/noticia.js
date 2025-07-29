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
// comentariosNoticia.js

document.addEventListener("DOMContentLoaded", async () => {
  // -------- Variables y endpoints --------
  const params = new URLSearchParams(window.location.search);
  const noticiaId = parseInt(params.get("id"), 10);
  const lista = document.getElementById("lista-comentarios");
  const textarea = document.querySelector(".nuevo-comentario textarea");
  const contador = document.getElementById("contador-caracteres");
  const btnCancelar = document.getElementById("cancelar-respuesta");
  const btnEnviar = document.getElementById("btn-enviar-comentario");

  const endpointComentarios = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_comentario_noticia.php";
  const endpointInsertar = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_comentario_noticia.php";
  const endpointReaccion = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_reaccion_comentario.php";
  const endpointQuitarReaccion = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/d_reaccion_comentario.php";

  let usuarioId = null;
  let usuarioNombre = "Tú";
  let respuestaA = null;
  let respuestaA_nombre = "";
  let enviando = false;
  let ultimoComentario = "";

  // -------- Helpers --------
  function getUsuarioDeCookie() {
    const usuarioCookie = document.cookie
      .split("; ")
      .find(row => row.startsWith("usuario="));
    if (!usuarioCookie) return null;
    try {
      return JSON.parse(decodeURIComponent(usuarioCookie.split("=")[1]));
    } catch {
      return null;
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

  function esComentarioDuplicado(texto) {
    const clean = str => str.replace(/\s+/g, " ").trim().toLowerCase();
    return clean(texto) === clean(ultimoComentario);
  }

  function hacerStickyAnim(nodo) {
    if (!nodo) return;
    nodo.classList.add("sticky-anim");
    setTimeout(() => nodo.classList.remove("sticky-anim"), 2000);
    nodo.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function mostrarErrorCarga() {
    lista.innerHTML = `
      <div style="text-align:center;padding:1.6rem;">
        <p>Error al cargar comentarios.</p>
        <button id="reintentar-cargar" class="btn btn-primary" style="margin-top:10px;">
          Reintentar
        </button>
      </div>`;
    document.getElementById("reintentar-cargar")
      .onclick = () => cargarComentarios(noticiaId);
  }

  // -------- Recuperar usuario y avatar --------
  const usuario = getUsuarioDeCookie();
  if (usuario) {
    usuarioId = usuario.id;
    usuarioNombre = usuario.nombre || "Tú";
    if (usuario.avatar) {
      const imgAvatar = document.querySelector(".nuevo-comentario-wrapper img");
      if (imgAvatar) imgAvatar.src = usuario.avatar;
    }
  }

  // -------- Input & contador --------
  actualizarEstadoInput();
  textarea.addEventListener("input", () => {
    contador.textContent = `${textarea.value.length}/500`;
    btnEnviar.disabled = !usuarioId
      || enviando
      || textarea.value.trim().length === 0
      || textarea.value.length > 500;
    btnEnviar.classList.toggle("disabled", btnEnviar.disabled);
  });
  textarea.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey && !btnEnviar.disabled) {
      e.preventDefault();
      btnEnviar.click();
    }
  });

  // -------- Cancelar respuesta --------
  btnCancelar.addEventListener("click", () => {
    respuestaA = null;
    respuestaA_nombre = "";
    textarea.value = "";
    textarea.placeholder = "Añade un comentario...";
    btnCancelar.style.display = "none";
    contador.textContent = "0/500";
  });

  // -------- Enviar comentario/respuesta --------
  btnEnviar.addEventListener("click", async () => {
    let texto = textarea.value.trim();
    if (!texto || enviando || esComentarioDuplicado(texto) || !usuarioId) return;
    if (respuestaA && respuestaA_nombre) {
      const at = `@${respuestaA_nombre} `;
      if (!texto.startsWith(at)) {
        texto = at + texto.replace(/^@[\w\s]+/, "").trim();
      }
    }
    if (texto.length > 500) { gcToast("Comentario demasiado largo", "warning"); return; }
    if (esComentarioDuplicado(texto)) { gcToast("No publiques el mismo texto dos veces.", "warning"); return; }

    const body = {
      noticia_id: noticiaId,
      usuario_id: usuarioId,
      comentario: texto,
      estatus: 1,
      ...(respuestaA ? { respuesta_a: respuestaA } : {})
    };

    enviando = true;
    btnEnviar.disabled = true;
    textarea.disabled = true;

    try {
      const res = await fetch(endpointInsertar, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data?.mensaje?.toLowerCase().includes("registrado")) {
        ultimoComentario = texto;

        if (respuestaA) {
          const padre = document.querySelector(`[data-comentario-id="${respuestaA}"]`);
          await recargarUnComentario(respuestaA, padre);
        } else {
          const nodo = await crearNodoComentarioInstantaneo({
            id: data.id || Date.now(),
            usuario_id: usuarioId,
            usuario_nombre: usuarioNombre,
            comentario: texto,
            fecha_creacion: new Date().toISOString(),
            likes: 0,
            dislikes: 0,
            mi_reaccion: null,
            respuestas: []
          });
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
    } catch {
      gcToast("Error de red al comentar", "error");
    }

    enviando = false;
    textarea.disabled = false;
    btnEnviar.disabled = !usuarioId || textarea.value.trim().length === 0;
    btnEnviar.classList.toggle("disabled", btnEnviar.disabled);
  });

  // -------- Crear nodos de comentario --------
  async function crearNodoComentarioInstantaneo(data) {
    return crearComentarioHTML({ ...data, respuestas: [] });
  }

  // -------- Cargar comentarios (adaptado) --------
  async function cargarComentarios(noticiaId) {
    try {
      const res = await fetch(endpointComentarios, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noticia_id: noticiaId,
          estatus: 1,
          ...(usuarioId ? { usuario_id: usuarioId } : {})
        })
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      lista.innerHTML = "";

      // si viene { mensaje: "No se encontraron..." }
      if (!Array.isArray(data) && data.mensaje) {
        lista.innerHTML = `
          <div class="sin-comentarios" style="text-align:center; padding:1rem; color:#666">
            Sé el primero en comentar
          </div>`;
        return;
      }
      // si es []
      if (Array.isArray(data) && data.length === 0) {
        lista.innerHTML = `
          <div class="sin-comentarios" style="text-align:center; padding:1rem; color:#666">
            Sé el primero en comentar
          </div>`;
        return;
      }
      // array con comentarios
      data
        .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
        .forEach(c => {
          const nodo = crearComentarioHTML(c);
          lista.appendChild(nodo);
        });

    } catch {
      mostrarErrorCarga();
      gcToast("Error al cargar comentarios", "error");
    }
  }

  // -------- Crear comentario HTML --------
  function crearComentarioHTML(data) {
    const idToNombre = {};
    (data.respuestas || []).forEach(r => idToNombre[r.id] = r.usuario_nombre);

    const div = document.createElement("div");
    div.className = "comentario";
    div.dataset.comentarioId = data.id;

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
          <div class="reaccion like ${likeActivo ? "liked" : ""}" data-id="${data.id}" data-tipo="like" aria-label="Like">
            <!-- SVG like -->
            <span class="cantidad">${data.likes}</span>
          </div>
          <div class="reaccion dislike ${dislikeActivo ? "disliked" : ""}" data-id="${data.id}" data-tipo="dislike" aria-label="Dislike">
            <!-- SVG dislike -->
            <span class="cantidad">${data.dislikes}</span>
          </div>
          <a href="#" class="accion">Responder</a>
        </div>
        ${data.respuestas?.length
        ? `<div class="comentario-respuestas">
               <a href="#" class="ver-respuestas">
                 <svg class="flecha" viewBox="0 0 24 24" width="16" height="16" fill="#1a73e8">
                   <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
                 </svg>
                 Ver ${data.respuestas.length} respuesta(s)
               </a>
             </div>`
        : ""}
      </div>
    `;

    // subrespuestas
    if (data.respuestas?.length > 0) {
      const cont = document.createElement("div");
      cont.className = "subcomentarios";
      cont.style.display = "none";
      data.respuestas
        .sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion))
        .forEach(r => cont.appendChild(crearRespuestaHTML(r, idToNombre)));
      div.appendChild(cont);
    }

    return div;
  }

  // -------- Crear respuesta HTML --------
  function crearRespuestaHTML(r, idToNombre) {
    const prefijo = (r.respuesta_a && idToNombre[r.respuesta_a])
      ? `<span class="mencion-usuario">@${idToNombre[r.respuesta_a]}</span> `
      : "";

    const likeActivo = r.mi_reaccion === "like";
    const dislikeActivo = r.mi_reaccion === "dislike";

    const div = document.createElement("div");
    div.className = "comentario subcomentario";
    div.dataset.comentarioId = r.id;
    div.innerHTML = `
      <div class="comentario-usuario">
        <img src="../ASSETS/noticia/usuario_icon_1.png" alt="Avatar usuario">
      </div>
      <div class="comentario-contenido">
        <div class="comentario-meta">
          <strong>${r.usuario_nombre}</strong>
          <span>${tiempoRelativo(r.fecha_creacion)}</span>
        </div>
        <p class="comentario-texto">${prefijo}${r.comentario}</p>
        <div class="comentario-interacciones">
          <div class="reaccion like ${likeActivo ? "liked" : ""}" data-id="${r.id}" data-tipo="like" aria-label="Like">
            <!-- SVG like -->
            <span class="cantidad">${r.likes}</span>
          </div>
          <div class="reaccion dislike ${dislikeActivo ? "disliked" : ""}" data-id="${r.id}" data-tipo="dislike" aria-label="Dislike">
            <!-- SVG dislike -->
            <span class="cantidad">${r.dislikes}</span>
          </div>
          <a href="#" class="accion">Responder</a>
        </div>
      </div>
    `;
    return div;
  }

  // -------- Recargar un único comentario --------
  async function recargarUnComentario(id, nodoViejo) {
    try {
      const res = await fetch(endpointComentarios, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noticia_id: noticiaId,
          estatus: 1,
          ...(usuarioId ? { usuario_id: usuarioId } : {})
        })
      });
      const data = await res.json();
      // busca el comentario en data
      let encontrado = null;
      for (const c of data) {
        if (c.id == id) { encontrado = c; break; }
        if (c.respuestas) {
          const sub = c.respuestas.find(r => r.id == id);
          if (sub) { encontrado = sub; break; }
        }
      }
      if (!encontrado) return;
      const nodoNuevo = encontrado.respuesta_a == null
        ? crearComentarioHTML(encontrado)
        : crearRespuestaHTML(encontrado, {});
      nodoViejo.replaceWith(nodoNuevo);
    } catch {
      cargarComentarios(noticiaId);
    }
  }

  // -------- Tiempo relativo --------
  function tiempoRelativo(fechaStr) {
    const fecha = new Date(fechaStr), ahora = new Date(), diff = (ahora - fecha) / 1000;
    if (diff < 60) return "Hace unos segundos";
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minuto(s)`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} hora(s)`;
    if (diff < 2592000) return `Hace ${Math.floor(diff / 86400)} día(s)`;
    if (diff < 31536000) return `Hace ${Math.floor(diff / 2592000)} mes(es)`;
    return `Hace ${Math.floor(diff / 31536000)} año(s)`;
  }

  // -------- Eventos globales (responder, reacciones) --------
  document.addEventListener("click", async e => {
    // responder
    if (e.target.classList.contains("accion")) {
      e.preventDefault();
      if (!usuarioId) { gcToast("Inicia sesión para responder", "warning"); return; }
      const comentarioDiv = e.target.closest(".comentario");
      const autor = comentarioDiv.querySelector(".comentario-meta strong").textContent;
      // identifica padre real
      let principal = comentarioDiv;
      while (principal.classList.contains("subcomentario")) {
        principal = principal.parentElement.closest(".comentario:not(.subcomentario)");
      }
      respuestaA = parseInt(principal.dataset.comentarioId, 10);
      respuestaA_nombre = autor;
      const atText = `@${respuestaA_nombre} `;
      if (!textarea.value.startsWith(atText)) textarea.value = atText;
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      btnCancelar.style.display = "inline";
      contador.textContent = `${textarea.value.length}/500`;
    }

    // ver/ocultar respuestas
    if (e.target.closest(".ver-respuestas")) {
      e.preventDefault();
      const enlace = e.target.closest(".ver-respuestas");
      const comentarioDiv = enlace.closest(".comentario");
      const contSub = comentarioDiv.querySelector(".subcomentarios");
      if (!contSub) return;
      const abierto = enlace.classList.toggle("abierto");
      contSub.style.display = abierto ? "flex" : "none";
      enlace.querySelector(".flecha")?.classList.toggle("girar", abierto);
      enlace.lastChild.textContent = abierto
        ? ` Ocultar ${contSub.childElementCount} respuesta(s)`
        : ` Ver ${contSub.childElementCount} respuesta(s)`;
    }

    // like/dislike
    if (e.target.closest(".reaccion")) {
      e.preventDefault();
      if (!usuarioId) { gcToast("Inicia sesión para reaccionar", "warning"); return; }
      const btn = e.target.closest(".reaccion");
      const tipo = btn.dataset.tipo;
      const cid = btn.dataset.id;
      const comentarioDiv = btn.closest(".comentario, .subcomentario");
      const likeBtn = comentarioDiv.querySelector(".reaccion.like");
      const dislikeBtn = comentarioDiv.querySelector(".reaccion.dislike");
      const prevLike = likeBtn.classList.contains("liked");
      const prevDislike = dislikeBtn.classList.contains("disliked");
      likeBtn.style.pointerEvents = dislikeBtn.style.pointerEvents = "none";

      try {
        // si cambio de like a dislike o viceversa, quita primero
        if ((tipo === "like" && prevDislike) || (tipo === "dislike" && prevLike)) {
          await fetch(endpointQuitarReaccion, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comentario_id: cid, usuario_id: usuarioId })
          });
        }
        // elige endpoint
        let urlFetch, bodyFetch;
        if ((tipo === "like" && prevLike) || (tipo === "dislike" && prevDislike)) {
          urlFetch = endpointQuitarReaccion;
          bodyFetch = { comentario_id: cid, usuario_id: usuarioId };
        } else {
          urlFetch = endpointReaccion;
          bodyFetch = { comentario_id: cid, usuario_id: usuarioId, reaccion: tipo, estatus: 1 };
        }
        const resp = await fetch(urlFetch, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyFetch)
        });
        const jd = await resp.json();
        // toasts según respuesta
        if (urlFetch === endpointReaccion && jd.mensaje.toLowerCase().includes("registrada")) {
          gcToast(`¡Gracias por tu ${tipo}!`, "exito");
        } else if (urlFetch === endpointQuitarReaccion && jd.mensaje.toLowerCase().includes("eliminada")) {
          gcToast("Reacción eliminada.", "exito");
        } else {
          gcToast(jd.mensaje || "Error al reaccionar", "warning");
        }
        await recargarUnComentario(cid, comentarioDiv);
      } catch {
        gcToast("Error de red al reaccionar", "error");
      } finally {
        likeBtn.style.pointerEvents = dislikeBtn.style.pointerEvents = "";
      }
    }
  });

  // -------- Inicialización --------
  if (noticiaId) {
    await cargarComentarios(noticiaId);
  }
  actualizarEstadoInput();
  contador.textContent = "0/500";
});
