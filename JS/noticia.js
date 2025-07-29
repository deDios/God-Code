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

  function esComentarioDuplicado(txt) {
    const clean = s => s.replace(/\s+/g, " ").trim().toLowerCase();
    return clean(txt) === clean(ultimoComentario);
  }

  function hacerStickyAnim(nodo) {
    nodo?.classList.add("sticky-anim");
    setTimeout(() => nodo.classList.remove("sticky-anim"), 2000);
    nodo?.scrollIntoView({ behavior: "smooth", block: "center" });
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

  // -------- Recuperar usuario y avatar --------
  const usuario = getUsuarioDeCookie();
  if (usuario) {
    usuarioId = usuario.id;
    usuarioNombre = usuario.nombre || "Tú";
    const imgAv = document.querySelector(".nuevo-comentario-wrapper img");
    if (imgAv && usuario.avatar) imgAv.src = usuario.avatar;
  }

  // -------- Eventos del textarea --------
  actualizarEstadoInput();
  textarea.addEventListener("input", () => {
    contador.textContent = `${textarea.value.length}/500`;
    btnEnviar.disabled = !usuarioId
      || enviando
      || !textarea.value.trim()
      || textarea.value.length > 500;
    btnEnviar.classList.toggle("disabled", btnEnviar.disabled);
  });
  textarea.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey && !btnEnviar.disabled) {
      e.preventDefault();
      btnEnviar.click();
    }
  });

  // -------- Botón cancelar respuesta --------
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

    enviando = true;
    btnEnviar.disabled = true;
    textarea.disabled = true;

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
    }

    enviando = false;
    textarea.disabled = false;
    btnEnviar.disabled = !usuarioId || !textarea.value.trim();
    btnEnviar.classList.toggle("disabled", btnEnviar.disabled);
  });

  // -------- Crear nodo instantáneo --------
  async function crearNodoInstantaneo(data) {
    return crearComentarioHTML({ ...data, respuestas: [] });
  }

  // -------- Cargar comentarios --------
  async function cargarComentarios(id) {
    try {
      const res = await fetch(endpointComentarios, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noticia_id: id, estatus: 1,
          ...(usuarioId ? { usuario_id: usuarioId } : {})
        })
      });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      lista.innerHTML = "";

      // sin comentarios
      if ((!Array.isArray(data) && data.mensaje) || (Array.isArray(data) && !data.length)) {
        lista.innerHTML = `
          <div class="sin-comentarios" style="text-align:center;padding:1rem;color:#666">
            Sé el primero en comentar
          </div>`;
        return;
      }

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
          <div class="reaccion like ${likeOn ? "liked" : ""}"
               data-id="${data.id}" data-tipo="like" aria-label="Like">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M1 21h4V9H1v12zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57c0-.41-.17-.79-.44-1.06L14.17 2 7.59 8.59C7.22 8.95 7 9.45 7 10v9c0 1.1.9 2 2 2h9c.78 0 1.48-.45 1.83-1.14l3.02-7.05c.1-.23.15-.47.15-.72V10z"/>
            </svg>
            <span class="cantidad">${data.likes}</span>
          </div>
          <div class="reaccion dislike ${disOn ? "disliked" : ""}"
               data-id="${data.id}" data-tipo="dislike" aria-label="Dislike">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M15 3H6c-.78 0-1.48.45-1.83 1.14L1.15 11.2c-.1.23-.15.47-.15.72v1.09c0 1.1.9 2 2 2h6.31l-.95 4.57c0 .41.17.79.44 1.06l1.12 1.12 6.59-6.59c.37-.36.59-.86.59-1.41V5c0-1.1-.9-2-2-2z"/>
            </svg>
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

    if (data.respuestas?.length) {
      const cont = document.createElement("div");
      cont.className = "subrespuestas";
      data.respuestas
        .sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion))
        .forEach(r => cont.appendChild(crearRespuestaHTML(r, idToNombre)));
      div.appendChild(cont);
    }

    return div;
  }

  // -------- Crear respuesta HTML --------
  function crearRespuestaHTML(r, idToNombre) {
    const pref = (r.respuesta_a && idToNombre[r.respuesta_a])
      ? `<span class="mencion-usuario">@${idToNombre[r.respuesta_a]}</span> `
      : "";
    const likeOn = r.mi_reaccion === "like";
    const disOn = r.mi_reaccion === "dislike";

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
        <p class="comentario-texto">${pref}${r.comentario}</p>
        <div class="comentario-interacciones">
          <div class="reaccion like ${likeOn ? "liked" : ""}"
               data-id="${r.id}" data-tipo="like" aria-label="Like">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M1 21h4V9H1v12zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57c0-.41-.17-.79-.44-1.06L14.17 2 7.59 8.59C7.22 8.95 7 9.45 7 10v9c0 1.1.9 2 2 2h9c.78 0 1.48-.45 1.83-1.14l3.02-7.05c.1-.23.15-.47.15-.72V10z"/>
            </svg>
            <span class="cantidad">${r.likes}</span>
          </div>
          <div class="reaccion dislike ${disOn ? "disliked" : ""}"
               data-id="${r.id}" data-tipo="dislike" aria-label="Dislike">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M15 3H6c-.78 0-1.48.45-1.83 1.14L1.15 11.2c-.1.23-.15.47-.15.72v1.09c0 1.1.9 2 2 2h6.31l-.95 4.57c0 .41.17.79.44 1.06l1.12 1.12 6.59-6.59c.37-.36.59-.86.59-1.41V5c0-1.1-.9-2-2-2z"/>
            </svg>
            <span class="cantidad">${r.dislikes}</span>
          </div>
          <a href="#" class="accion">Responder</a>
        </div>
      </div>
    `;
    return div;
  }

  // -------- Toggle ver respuestas & reacciones etc. --------
  document.addEventListener("click", async e => {
    // Ver/Ocultar respuestas
    if (e.target.closest(".ver-respuestas")) {
      e.preventDefault();
      const enlace = e.target.closest(".ver-respuestas");
      const com = enlace.closest(".comentario");
      const sub = com.querySelector(".subrespuestas");
      if (!sub) return;
      const abierto = enlace.classList.toggle("abierto");
      sub.classList.toggle("mostrar", abierto);
      enlace.querySelector(".flecha")?.classList.toggle("girar", abierto);
      enlace.lastChild.textContent = abierto
        ? ` Ocultar ${sub.childElementCount} respuesta(s)`
        : ` Ver ${sub.childElementCount} respuesta(s)`;
    }
    // ... handlers de “Responder” y “Like/Dislike” sin cambios, quedan igual ...
  });

  // -------- Inicialización --------
  if (noticiaId) await cargarComentarios(noticiaId);
  actualizarEstadoInput();
  contador.textContent = "0/500";
});
