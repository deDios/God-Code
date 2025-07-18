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

function crearComentarioHTML(data) {
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
            <path d="M1 21h4V9H1v12zM23 10c0-1.1-.9-2-2-2h-6.31l..." />
          </svg>
          <span class="cantidad">${data.likes}</span>
        </div>
        <div class="reaccion" data-id="${data.id}" data-tipo="dislike">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#e53935">
            <path d="M15 3H6c-.78 0-1.48.45-1.83 1.14L1.15 11.2..." />
          </svg>
          <span class="cantidad">${data.dislikes}</span>
        </div>
        <a href="#" class="accion">Responder</a>
      </div>
      ${
        data.respuestas?.length > 0
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

  if (data.respuestas?.length > 0) {
    const contenedor = document.createElement("div");
    contenedor.className = "subrespuestas";
    data.respuestas.forEach((r) => {
      const respuestaHTML = crearComentarioHTML(r);
      contenedor.appendChild(respuestaHTML);
    });
    div.appendChild(contenedor);
  }

  return div;
}

async function cargarComentarios(noticiaId) {
  const lista = document.getElementById("lista-comentarios");
  lista.innerHTML = "";

  const endpoint =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_comentario_noticia.php";

  let usuarioId = null;
  const usuarioCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("usuario="));
  if (usuarioCookie) {
    try {
      const datos = JSON.parse(decodeURIComponent(usuarioCookie.split("=")[1]));
      usuarioId = datos?.id || null;
    } catch (e) {
      console.warn("Cookie malformada:", e);
    }
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        noticia_id: noticiaId,
        estatus: 1,
        ...(usuarioId ? { usuario_id: usuarioId } : {}),
      }),
    });

    const data = await res.json();
    if (!Array.isArray(data)) return;

    data.forEach((comentario) => {
      const nodo = crearComentarioHTML(comentario);
      lista.appendChild(nodo);
    });
  } catch (err) {
    console.error("Error al cargar comentarios:", err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const endpoint =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_noticia.php";

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));
  if (!id) return;

  const seccion1 = document.querySelector("#noticia-detalle");
  const seccion2 = document.querySelector("#noticia-bloque2");
  const elementos = {
    img1: seccion1.querySelector(".imagen-noticia img"),
    img2: seccion2.querySelector(".imagen-noticia img"),
    texto1: seccion1.querySelector(".contenido-noticia p"),
    texto2: seccion2.querySelector(".contenido-noticia p"),
  };

  function insertarOverlayTitulo(titulo) {
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

    const data = await res.json();
    const noticia = data.find((n) => n.id === id);
    if (!noticia) return;

    elementos.img1.src = `../ASSETS/noticia/NoticiasImg/noticia_img1_${id}.png`;
    elementos.img2.src = `../ASSETS/noticia/NoticiasImg/noticia_img2_${id}.png`;
    elementos.img1.alt = noticia.titulo;
    elementos.img2.alt = noticia.titulo;
    elementos.texto1.innerHTML = noticia.desc_uno.replace(/\n/g, "<br>");
    elementos.texto2.innerHTML = noticia.desc_dos.replace(/\n/g, "<br>");

    insertarOverlayTitulo(noticia.titulo);
    cargarComentarios(id);

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

  const textarea = document.querySelector(".nuevo-comentario textarea");
  const contador = document.getElementById("contador-caracteres");
  const btnCancelar = document.getElementById("cancelar-respuesta");
  const btnEnviar = document.getElementById("btn-enviar-comentario");
  const endpointInsertar =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_comentario_noticia.php";

  let usuarioId = null;
  let respuestaA = null;
  let enviando = false;
  let ultimoComentario = "";

  const usuarioCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("usuario="));
  if (usuarioCookie) {
    try {
      const datos = JSON.parse(decodeURIComponent(usuarioCookie.split("=")[1]));
      usuarioId = datos?.id || null;
    } catch (e) {
      console.warn("Cookie malformada:", e);
    }
  }

  if (!usuarioId) {
    textarea.disabled = true;
    btnEnviar.disabled = true;
    textarea.placeholder = "Inicia sesión para comentar...";
    return;
  }

  textarea.addEventListener("input", () => {
    contador.textContent = `${textarea.value.length}/500`;
  });

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("accion")) {
      e.preventDefault();
      const comentario = e.target.closest(".comentario");
      if (comentario) {
        respuestaA = parseInt(
          comentario.querySelector(".reaccion")?.dataset.id
        );
        textarea.focus();
        textarea.placeholder = "Respondiendo a...";
        btnCancelar.style.display = "inline";
      }
    }
  });

  btnCancelar.addEventListener("click", () => {
    respuestaA = null;
    textarea.placeholder = "Añade un comentario...";
    btnCancelar.style.display = "none";
  });

  btnEnviar.addEventListener("click", async () => {
    const texto = textarea.value.trim();
    if (!texto || enviando || texto === ultimoComentario) return;

    if (texto.length > 500) {
      gcToast("Comentario demasiado largo", "warning");
      return;
    }

    enviando = true;

    try {
      const res = await fetch(endpointInsertar, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noticia_id: id,
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
        textarea.placeholder = "Añade un comentario...";
        respuestaA = null;
        btnCancelar.style.display = "none";
        gcToast("Comentario publicado", "exito");
        await cargarComentarios(id);
        scrollToUltimoComentario();
      } else {
        gcToast("No se pudo publicar el comentario", "error");
      }
    } catch (err) {
      console.error("Error:", err);
      gcToast("Error de red al comentar", "error");
    }

    enviando = false;
  });

  function scrollToUltimoComentario() {
    const lista = document.getElementById("lista-comentarios");
    const ultimo = lista?.lastElementChild;
    if (ultimo) {
      ultimo.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  console.log("se ejecuto todo el bloque de noticias");
});
