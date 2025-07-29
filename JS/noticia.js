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
// V1













// noticia.js

document.addEventListener("DOMContentLoaded", async () => {
  // -------- Variables y endpoints --------
  const params = new URLSearchParams(window.location.search);
  const noticiaId = parseInt(params.get("id"), 10);
  const lista = document.getElementById("lista-comentarios");
  const textarea = document.querySelector(".nuevo-comentario textarea");
  const contador = document.getElementById("contador-caracteres");
  const btnCancelar = document.getElementById("cancelar-respuesta");
  const btnEnviar = document.getElementById("btn-enviar-comentario");

  if (!lista || !textarea || !contador || !btnCancelar || !btnEnviar) {
    console.warn("Faltan elementos del DOM para comentarios");
    return;
  }

  const endpointComentarios =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_comentario_noticia.php";

  const endpointInsertar =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_comentario_noticia.php";

  const endpointReaccion =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_reaccion_comentario.php";

  const endpointQuitarReaccion =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/d_reaccion_comentario.php";

  let usuarioId = null,
    usuarioNombre = "Tú",
    respuestaA = null,
    respuestaA_nombre = "",
    enviando = false,
    ultimoComentario = "";

  // -------- Helpers --------
  function getUsuarioDeCookie() {
    const cookie = document.cookie.split("; ").find(r => r.startsWith("usuario="));
    if (!cookie) return null;
    try { return JSON.parse(decodeURIComponent(cookie.split("=")[1])); }
    catch { return null; }
  }

  function actualizarEstadoInput() {
    if (!usuarioId) {
      textarea.disabled = btnEnviar.disabled = true;
      textarea.placeholder = "Inicia sesión para comentar...";
      btnEnviar.classList.add("disabled");
    } else {
      textarea.disabled = false;
      textarea.placeholder = "Añade un comentario...";
      btnEnviar.disabled = true;
      btnEnviar.classList.add("disabled");
    }
  }

  function esComentarioDuplicado(txt) {
    const clean = s => s.replace(/\s+/g, " ").trim().toLowerCase();
    return clean(txt) === clean(ultimoComentario);
  }

  function hacerStickyAnim(node) {
    if (!node) return;
    node.classList.add("sticky-anim");
    setTimeout(() => node.classList.remove("sticky-anim"), 2000);
    node.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function mostrarErrorCarga() {
    lista.innerHTML = `
      <div style="text-align:center;padding:1.6rem;">
        <p>Error al cargar comentarios.</p>
        <button id="reintentar-cargar" class="btn btn-primary" style="margin-top:10px;">Reintentar</button>
      </div>`;
    document.getElementById("reintentar-cargar")
      .onclick = () => cargarComentarios(noticiaId);
  }

  function mostrarSkeleton() {
    lista.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      const sk = document.createElement("div");
      sk.className = "comentario skeleton";
      lista.appendChild(sk);
    }
  }

  // -------- Usuario y avatar --------
  const usuario = getUsuarioDeCookie();
  if (usuario) {
    usuarioId = usuario.id;
    usuarioNombre = usuario.nombre || "Tú";
    if (usuario.avatar) {
      const img = document.querySelector(".nuevo-comentario-wrapper img");
      if (img) img.src = usuario.avatar;
    }
  }

  // -------- Input & contador --------
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

    if (texto.length > 500) {
      gcToast("Comentario demasiado largo", "warning");
      return;
    }
    if (esComentarioDuplicado(texto)) {
      gcToast("No publiques el mismo texto dos veces.", "warning");
      return;
    }

    enviando = true;
    btnEnviar.disabled = textarea.disabled = true;

    try {
      const res = await fetch(endpointInsertar, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noticia_id: noticiaId,
          usuario_id: usuarioId,
          comentario: texto,
          estatus: 1,
          ...(respuestaA ? { respuesta_a: respuestaA } : {})
        })
      });
      const data = await res.json();
      if (data.mensaje?.toLowerCase().includes("registrado")) {
        ultimoComentario = texto;
        if (respuestaA) {
          const padre = document.querySelector(`[data-comentario-id="${respuestaA}"]`);
          await recargarUnComentario(respuestaA, padre);
        } else {
          const nodo = await crearNodoInstantaneo({
            id: data.id || Date.now(),
            usuario_id: usuarioId,
            usuario_nombre: usuarioNombre,
            comentario: texto,
            fecha_creacion: new Date().toISOString(),
            likes: 0, dislikes: 0, mi_reaccion: null, respuestas: []
          });
          lista.insertBefore(nodo, lista.firstChild);
          hacerStickyAnim(nodo);
        }
        textarea.value = "";
        contador.textContent = "0/500";
        respuestaA = respuestaA_nombre = "";
        textarea.placeholder = "Añade un comentario...";
        btnCancelar.style.display = "none";
        gcToast("Comentario publicado", "exito");
      } else {
        gcToast("No se pudo publicar el comentario", "error");
      }
    } catch {
      gcToast("Error de red al comentar", "error");
    } finally {
      enviando = false;
      textarea.disabled = false;
      btnEnviar.disabled = !usuarioId || textarea.value.trim().length === 0;
      btnEnviar.classList.toggle("disabled", btnEnviar.disabled);
    }
  });

  async function crearNodoInstantaneo(data) {
    return crearComentarioHTML({ ...data, respuestas: [] });
  }

  // -------- Cargar comentarios --------
  async function cargarComentarios(id) {
    mostrarSkeleton();
    try {
      const res = await fetch(endpointComentarios, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noticia_id: id,
          estatus: 1,
          ...(usuarioId ? { usuario_id: usuarioId } : {})
        })
      });
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        lista.innerHTML = `
          <div class="sin-comentarios" style="text-align:center;padding:1rem;color:#666">
            Sé el primero en comentar
          </div>`;
        return;
      }
      lista.innerHTML = "";
      data
        .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
        .forEach(c => lista.appendChild(crearComentarioHTML(c)));
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

    const likeOn = data.mi_reaccion === "like";
    const disOn = data.mi_reaccion === "dislike";

    div.innerHTML = ''
      + '<div class="comentario-usuario">'
      + '<img src="../ASSETS/noticia/usuario_icon_1.png" alt="Avatar usuario">'
      + '</div>'
      + '<div class="comentario-contenido">'
      + '<div class="comentario-meta">'
      + '<strong>' + data.usuario_nombre + '</strong>'
      + '<span>' + tiempoRelativo(data.fecha_creacion) + '</span>'
      + '</div>'
      + '<p class="comentario-texto">' + data.comentario + '</p>'
      + '<div class="comentario-interacciones">'
      + '<div class="reaccion like' + (likeOn ? " liked" : "") + '" '
      + 'data-id="' + data.id + '" data-tipo="like" role="button" tabindex="0" aria-label="Like">'
      + '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">'
      + '<path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57c0-.41-.17-.79-.44-1.06L14.17 2'
      + '7.59 8.59C7.22 8.95 7 9.45 7 10v9c0 1.1.9 2 2 2h9c.78 0 1.48-.45 1.83-1.14'
      + 'l3.02-7.05c.1-.23.15-.47.15-.72V10z"/>'
      + '</svg>'
      + '<span class="cantidad">' + data.likes + '</span>'
      + '</div>'
      + '<div class="reaccion dislike' + (disOn ? " disliked" : "") + '" '
      + 'data-id="' + data.id + '" data-tipo="dislike" role="button" tabindex="0" aria-label="Dislike">'
      + '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">'
      + '<path d="M15 3H6c-.78 0-1.48.45-1.83 1.14L1.15 11.2c-.1.23-.15.47-.15.72v1.09'
      + 'c0 1.1.9 2 2 2h6.31l-.95 4.57c0 .41.17-.79.44-1.06'
      + 'l1.12 1.12 6.59-6.59c.37-.36.59-.86.59-1.41V5c0-1.1-.9-2-2-2z"/>'
      + '</svg>'
      + '<span class="cantidad">' + data.dislikes + '</span>'
      + '</div>'
      + '<a href="#" class="accion" role="button" tabindex="0">Responder</a>'
      + '</div>'
      + (data.respuestas && data.respuestas.length
        ? '<div class="comentario-respuestas">'
        + '<a href="#" class="ver-respuestas" role="button" tabindex="0">'
        + '<svg class="flecha" viewBox="0 0 24 24" width="16" height="16" fill="#1a73e8">'
        + '<path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>'
        + '</svg>'
        + 'Ver ' + data.respuestas.length + ' respuesta(s)'
        + '</a>'
        + '</div>'
        : ''
      )
      + '</div>';

    // subrespuestas
    if (data.respuestas?.length) {
      const sub = document.createElement("div");
      sub.className = "subcomentarios subrespuestas";
      sub.style.display = "none";
      data.respuestas
        .sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion))
        .forEach(r => sub.appendChild(crearRespuestaHTML(r, idToNombre)));
      div.appendChild(sub);
    }

    return div;
  }

  // -------- Crear respuesta HTML --------
  function crearRespuestaHTML(r, idToNombre) {
    const pref = (r.respuesta_a && idToNombre[r.respuesta_a])
      ? '<span class="mencion-usuario">@' + idToNombre[r.respuesta_a] + '</span> '
      : '';
    const likeOn = r.mi_reaccion === "like";
    const disOn = r.mi_reaccion === "dislike";
    const div = document.createElement("div");
    div.className = "comentario subcomentario";
    div.dataset.comentarioId = r.id;

    div.innerHTML = ''
      + '<div class="comentario-usuario">'
      + '<img src="../ASSETS/noticia/usuario_icon_1.png" alt="Avatar usuario">'
      + '</div>'
      + '<div class="comentario-contenido">'
      + '<div class="comentario-meta">'
      + '<strong>' + r.usuario_nombre + '</strong>'
      + '<span>' + tiempoRelativo(r.fecha_creacion) + '</span>'
      + '</div>'
      + '<p class="comentario-texto">' + pref + r.comentario + '</p>'
      + '<div class="comentario-interacciones">'
      + '<div class="reaccion like' + (likeOn ? " liked" : "") + '" '
      + 'data-id="' + r.id + '" data-tipo="like" role="button" tabindex="0">'
      + '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">'
      + '<path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57c0-.41-.17-.79-.44-1.06L14.17 2'
      + '7.59 8.59C7.22 8.95 7 9.45 7 10v9c0 1.1.9 2 2 2h9c.78 0 1.48-.45 1.83-1.14'
      + 'l3.02-7.05c.1-.23.15-.47.15-.72V10z"/>'
      + '</svg>'
      + '<span class="cantidad">' + r.likes + '</span>'
      + '</div>'
      + '<div class="reaccion dislike' + (disOn ? " disliked" : "") + '" '
      + 'data-id="' + r.id + '" data-tipo="dislike" role="button" tabindex="0">'
      + '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">'
      + '<path d="M15 3H6c-.78 0-1.48.45-1.83 1.14L1.15 11.2c-.1.23-.15.47-.15.72v1.09'
      + 'c0 1.1.9 2 2 2h6.31l-.95 4.57c0 .41.17-.79.44-1.06'
      + 'l1.12 1.12 6.59-6.59c.37-.36.59-.86.59-1.41V5c0-1.1-.9-2-2-2z"/>'
      + '</svg>'
      + '<span class="cantidad">' + r.dislikes + '</span>'
      + '</div>'
      + '<a href="#" class="accion" role="button" tabindex="0">Responder</a>'
      + '</div>'
      + '</div>';

    return div;
  }

  // -------- Recargar un solo comentario --------
  async function recargarUnComentario(id, viejo) {
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
      let found = null;
      for (const c of data) {
        if (c.id == id) { found = c; break; }
        if (c.respuestas) {
          const sub = c.respuestas.find(r => r.id == id);
          if (sub) { found = sub; break; }
        }
      }
      if (!found) return;
      const nuevo = found.respuesta_a == null
        ? crearComentarioHTML(found)
        : crearRespuestaHTML(found, {});
      viejo.replaceWith(nuevo);
    } catch {
      cargarComentarios(noticiaId);
    }
  }

  // -------- Tiempo relativo --------
  function tiempoRelativo(fechaStr) {
    const fecha = new Date(fechaStr);
    const diff = (Date.now() - fecha) / 1000;
    if (diff < 60) return "Hace unos segundos";
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minuto(s)`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} hora(s)`;
    if (diff < 2592000) return `Hace ${Math.floor(diff / 86400)} día(s)`;
    if (diff < 31536000) return `Hace ${Math.floor(diff / 2592000)} mes(es)`;
    return `Hace ${Math.floor(diff / 31536000)} año(s)`;
  }

  // -------- Manejo de clicks por delegación --------
  lista.addEventListener("click", handleComentarioAction);
  // permitir enter/space en elementos role=button
  document.addEventListener("keydown", e => {
    if ((e.key === "Enter" || e.key === " ") && e.target.getAttribute("role") === "button") {
      e.preventDefault();
      e.target.click();
    }
  });

  async function handleComentarioAction(e) {
    // RESPONDER
    if (e.target.classList.contains("accion")) {
      e.preventDefault();
      if (!usuarioId) return gcToast("Inicia sesión para responder", "warning");
      const com = e.target.closest(".comentario");
      const autor = com.querySelector(".comentario-meta strong").textContent;
      let padre = com;
      while (padre.classList.contains("subcomentario")) {
        padre = padre.parentElement.closest(".comentario:not(.subcomentario)");
      }
      respuestaA = parseInt(padre.dataset.comentarioId, 10);
      respuestaA_nombre = autor;
      const at = `@${autor} `;
      if (!textarea.value.startsWith(at)) textarea.value = at;
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      btnCancelar.style.display = "inline";
      contador.textContent = `${textarea.value.length}/500`;
      return;
    }

    // VER/OCULTAR RESPUESTAS
    const ver = e.target.closest(".ver-respuestas");
    if (ver) {
      e.preventDefault();
      const com = ver.closest(".comentario");
      const sub = com.querySelector(".subrespuestas");
      if (!sub) return;
      const abierto = ver.classList.toggle("abierto");
      sub.style.display = abierto ? "flex" : "none";
      ver.querySelector(".flecha")?.classList.toggle("girar", abierto);
      ver.lastChild.textContent = abierto
        ? ` Ocultar ${sub.childElementCount} respuesta(s)`
        : ` Ver ${sub.childElementCount} respuesta(s)`;
      return;
    }

    // LIKE/DISLIKE
    const btn = e.target.closest(".reaccion");
    if (btn) {
      e.preventDefault();
      if (!usuarioId) return gcToast("Inicia sesión para reaccionar", "warning");
      const tipo = btn.dataset.tipo;
      const cid = btn.dataset.id;
      const comDiv = btn.closest(".comentario, .subcomentario");
      const likeBtn = comDiv.querySelector(".reaccion.like");
      const disBtn = comDiv.querySelector(".reaccion.dislike");
      const prevLike = likeBtn.classList.contains("liked");
      const prevDis = disBtn.classList.contains("disliked");

      likeBtn.style.pointerEvents = disBtn.style.pointerEvents = "none";
      try {
        // si cambio de uno a otro, primero quito
        if ((tipo === "like" && prevDis) || (tipo === "dislike" && prevLike)) {
          await fetch(endpointQuitarReaccion, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comentario_id: cid, usuario_id: usuarioId })
          });
        }
        let url, body;
        if ((tipo === "like" && prevLike) || (tipo === "dislike" && prevDis)) {
          url = endpointQuitarReaccion;
          body = { comentario_id: cid, usuario_id: usuarioId };
        } else {
          url = endpointReaccion;
          body = { comentario_id: cid, usuario_id: usuarioId, reaccion: tipo, estatus: 1 };
        }
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const jd = await resp.json();
        if (url === endpointReaccion && jd.mensaje.toLowerCase().includes("registrada")) {
          gcToast(`¡Gracias por tu ${tipo}!`, "exito");
        } else if (url === endpointQuitarReaccion && jd.mensaje.toLowerCase().includes("eliminada")) {
          gcToast("Reacción eliminada.", "exito");
        } else {
          gcToast(jd.mensaje || "Error al reaccionar", "warning");
        }
        await recargarUnComentario(cid, comDiv);
      } catch {
        gcToast("Error de red al reaccionar", "error");
      } finally {
        likeBtn.style.pointerEvents = disBtn.style.pointerEvents = "";
      }
    }
  }

  // -------- Inicialización final --------
  if (noticiaId) await cargarComentarios(noticiaId);
});
