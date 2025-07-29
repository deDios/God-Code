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













document.addEventListener("DOMContentLoaded", function () {
  // -------- Variables y endpoints --------
  var params = new URLSearchParams(window.location.search);
  var noticiaId = parseInt(params.get("id"), 10);
  var lista = document.getElementById("lista-comentarios");
  var textarea = document.querySelector(".nuevo-comentario textarea");
  var contador = document.getElementById("contador-caracteres");
  var btnCancelar = document.getElementById("cancelar-respuesta");
  var btnEnviar = document.getElementById("btn-enviar-comentario");

  // Si falta algún elemento esencial, salimos
  if (!lista || !textarea || !contador || !btnCancelar || !btnEnviar) {
    console.warn("Comments script: faltan elementos DOM críticos");
    return;
  }

  var endpointComentarios = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_comentario_noticia.php";
  var endpointInsertar = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_comentario_noticia.php";
  var endpointReaccion = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_reaccion_comentario.php";
  var endpointQuitarReaccion = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/d_reaccion_comentario.php";

  var usuarioId = null;
  var usuarioNombre = "Tú";
  var respuestaA = null;
  var respuestaA_nombre = "";
  var enviando = false;
  var ultimoComentario = "";

  // -------- Helpers --------
  function getUsuarioDeCookie() {
    var cookie = document.cookie.split("; ").find(function (c) {
      return c.indexOf("usuario=") === 0;
    });
    if (!cookie) return null;
    try {
      return JSON.parse(decodeURIComponent(cookie.split("=")[1]));
    } catch (e) {
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

  function esComentarioDuplicado(txt) {
    var clean = txt.replace(/\s+/g, " ").trim().toLowerCase();
    var last = (ultimoComentario || "").replace(/\s+/g, " ").trim().toLowerCase();
    return clean === last;
  }

  function mostrarErrorCarga() {
    lista.innerHTML = ''
      + '<div style="text-align:center;padding:1.6rem;">'
      + '<p>Error al cargar comentarios.</p>'
      + '<button id="reintentar-cargar" class="btn btn-primary" style="margin-top:10px;">Reintentar</button>'
      + '</div>';
    var retry = document.getElementById("reintentar-cargar");
    if (retry) {
      retry.onclick = function () { cargarComentarios(noticiaId); };
    }
  }

  function hacerStickyAnim(nodo) {
    if (!nodo || !nodo.classList) return;
    nodo.classList.add("sticky-anim");
    setTimeout(function () {
      nodo.classList.remove("sticky-anim");
    }, 2000);
    // scrollIntoView suave con fallback
    try {
      nodo.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (e) {
      nodo.scrollIntoView();
    }
  }

  // -------- Recuperar usuario y avatar --------
  var usuario = getUsuarioDeCookie();
  if (usuario && usuario.id) {
    usuarioId = usuario.id;
    usuarioNombre = usuario.nombre || "Tú";
    if (usuario.avatar) {
      var img = document.querySelector(".nuevo-comentario-wrapper img");
      if (img) img.src = usuario.avatar;
    }
  }

  // -------- Input & contador --------
  actualizarEstadoInput();
  textarea.addEventListener("input", function () {
    contador.textContent = textarea.value.length + "/500";
    var desh = !usuarioId || enviando || textarea.value.trim().length === 0 || textarea.value.length > 500;
    btnEnviar.disabled = desh;
    btnEnviar.classList.toggle("disabled", desh);
  });
  textarea.addEventListener("keydown", function (e) {
    var code = e.keyCode || e.which;
    if ((e.key === "Enter" || code === 13) && !e.shiftKey && !btnEnviar.disabled) {
      e.preventDefault();
      btnEnviar.click();
    }
  });

  // -------- Cancelar respuesta --------
  btnCancelar.addEventListener("click", function () {
    respuestaA = null;
    respuestaA_nombre = "";
    textarea.value = "";
    textarea.placeholder = "Añade un comentario...";
    btnCancelar.style.display = "none";
    contador.textContent = "0/500";
  });

  // -------- Enviar comentario/respuesta --------
  btnEnviar.addEventListener("click", function () {
    if (enviando) return;
    var texto = textarea.value.trim();
    if (!texto || !usuarioId || esComentarioDuplicado(texto)) return;

    // anteponer mención si corresponde
    if (respuestaA && respuestaA_nombre) {
      var at = "@" + respuestaA_nombre + " ";
      if (texto.indexOf(at) !== 0) {
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
    textarea.disabled = true;
    btnEnviar.disabled = true;

    fetch(endpointInsertar, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        noticia_id: noticiaId,
        usuario_id: usuarioId,
        comentario: texto,
        estatus: 1,
        respuesta_a: respuestaA || undefined
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && typeof data.mensaje === "string" && data.mensaje.toLowerCase().indexOf("registrado") > -1) {
          ultimoComentario = texto;
          if (respuestaA) {
            var padre = document.querySelector('[data-comentario-id="' + respuestaA + '"]');
            if (padre) recargarUnComentario(respuestaA, padre);
          } else {
            // crear y anteponer nodo optimista
            crearComentarioHTML({
              id: data.id || Date.now(),
              usuario_id: usuarioId,
              usuario_nombre: usuarioNombre,
              comentario: texto,
              fecha_creacion: new Date().toISOString(),
              likes: 0,
              dislikes: 0,
              mi_reaccion: null,
              respuestas: []
            }).then(function (nodo) {
              lista.insertBefore(nodo, lista.firstChild);
              hacerStickyAnim(nodo);
            });
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
      })
      .catch(function () {
        gcToast("Error de red al comentar", "error");
      })
      .finally(function () {
        enviando = false;
        textarea.disabled = false;
        var desh2 = !usuarioId || textarea.value.trim().length === 0;
        btnEnviar.disabled = desh2;
        btnEnviar.classList.toggle("disabled", desh2);
      });
  });

  // -------- Cargar comentarios --------
  function cargarComentarios(id) {
    // skeleton
    lista.innerHTML = "";
    for (var i = 0; i < 5; i++) {
      var sk = document.createElement("div");
      sk.className = "comentario skeleton";
      lista.appendChild(sk);
    }

    fetch(endpointComentarios, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        noticia_id: id,
        estatus: 1,
        usuario_id: usuarioId || undefined
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        // cuando no vengan comentarios
        if (!Array.isArray(data) || data.length === 0) {
          lista.innerHTML = ''
            + '<div class="sin-comentarios" style="text-align:center;padding:1rem;color:#666">'
            + 'Sé el primero en comentar'
            + '</div>';
          return;
        }
        // ordenar y renderizar
        data.sort(function (a, b) {
          return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
        });
        lista.innerHTML = "";
        data.forEach(function (c) {
          crearComentarioHTML(c).then(function (nodo) {
            lista.appendChild(nodo);
          });
        });
      })
      .catch(function () {
        mostrarErrorCarga();
        gcToast("Error al cargar comentarios", "error");
      });
  }

  // -------- Crear comentario y respuesta HTML --------
  function crearComentarioHTML(data) {
    return new Promise(function (resolve) {
      // crear el div
      var div = document.createElement("div");
      div.setAttribute("role", "article");
      div.className = "comentario";
      div.setAttribute("data-comentario-id", data.id);

      // innerHTML básico
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
        + '<div class="reaccion like' + (data.mi_reaccion === "like" ? " liked" : "") + '" '
        + 'data-id="' + data.id + '" data-tipo="like" role="button" tabindex="0" aria-label="Like">'
        + '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">'
        + '<path d="M1 21h4V9H1v12zM23 10...z"/>'
        + '</svg>'
        + '<span class="cantidad">' + data.likes + '</span>'
        + '</div>'
        + '<div class="reaccion dislike' + (data.mi_reaccion === "dislike" ? " disliked" : "") + '" '
        + 'data-id="' + data.id + '" data-tipo="dislike" role="button" tabindex="0" aria-label="Dislike">'
        + '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">'
        + '<path d="M15 3H6...z"/>'
        + '</svg>'
        + '<span class="cantidad">' + data.dislikes + '</span>'
        + '</div>'
        + '<a href="#" class="accion" role="button" tabindex="0">Responder</a>'
        + '</div>';

      // si tiene respuestas, las añadimos ocultas
      if (Array.isArray(data.respuestas) && data.respuestas.length) {
        var cont = document.createElement("div");
        cont.className = "subrespuestas";
        // no seteamos style.display, lo hace el CSS por defecto
        data.respuestas.sort(function (a, b) {
          return new Date(a.fecha_creacion) - new Date(b.fecha_creacion);
        }).forEach(function (r) {
          crearRespuestaHTML(r, data.respuestas.reduce(function (acc, cur) {
            acc[cur.id] = cur.usuario_nombre; return acc;
          }, {})).then(function (nr) {
            cont.appendChild(nr);
          });
        });
        div.appendChild(cont);
      }

      div.innerHTML += '</div>'; // cierra .comentario-contenido 
      resolve(div);
    });
  }

  function crearRespuestaHTML(r, idToNombre) {
    return new Promise(function (resolve) {
      var div = document.createElement("div");
      div.className = "comentario subcomentario";
      div.setAttribute("data-comentario-id", r.id);
      var prefijo = "";
      if (r.respuesta_a && idToNombre[r.respuesta_a]) {
        prefijo = '<span class="mencion-usuario">@' + idToNombre[r.respuesta_a] + '</span> ';
      }
      div.innerHTML = ''
        + '<div class="comentario-usuario">'
        + '<img src="../ASSETS/noticia/usuario_icon_1.png" alt="Avatar usuario">'
        + '</div>'
        + '<div class="comentario-contenido">'
        + '<div class="comentario-meta">'
        + '<strong>' + r.usuario_nombre + '</strong>'
        + '<span>' + tiempoRelativo(r.fecha_creacion) + '</span>'
        + '</div>'
        + '<p class="comentario-texto">' + prefijo + r.comentario + '</p>'
        + '<div class="comentario-interacciones">'
        + '<div class="reaccion like' + (r.mi_reaccion === "like" ? " liked" : "") + '" '
        + 'data-id="' + r.id + '" data-tipo="like" role="button" tabindex="0" aria-label="Like">'
        + '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">'
        + '<path d="M1 21h4V9H1v12zM23 10...z"/>'
        + '</svg>'
        + '<span class="cantidad">' + r.likes + '</span>'
        + '</div>'
        + '<div class="reaccion dislike' + (r.mi_reaccion === "dislike" ? " disliked" : "") + '" '
        + 'data-id="' + r.id + '" data-tipo="dislike" role="button" tabindex="0" aria-label="Dislike">'
        + '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">'
        + '<path d="M15 3H6...z"/>'
        + '</svg>'
        + '<span class="cantidad">' + r.dislikes + '</span>'
        + '</div>'
        + '<a href="#" class="accion" role="button" tabindex="0">Responder</a>'
        + '</div>'
        + '</div>';
      resolve(div);
    });
  }

  function recargarUnComentario(id, viejo) {
    fetch(endpointComentarios, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noticia_id: noticiaId, estatus: 1, usuario_id: usuarioId })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var encontrado = null;
        data.forEach(function (c) {
          if (c.id == id) encontrado = c;
          if (!encontrado && c.respuestas) {
            c.respuestas.forEach(function (r) {
              if (r.id == id) encontrado = r;
            });
          }
        });
        if (!encontrado) return;
        crearComentarioHTML(encontrado).then(function (nuevo) {
          viejo.parentNode.replaceChild(nuevo, viejo);
        });
      })
      .catch(function () { cargarComentarios(noticiaId); });
  }

  function tiempoRelativo(fechaStr) {
    var fecha = new Date(fechaStr);
    var diff = (Date.now() - fecha) / 1000;
    if (diff < 60) return "Hace unos segundos";
    if (diff < 3600) return "Hace " + Math.floor(diff / 60) + " minuto(s)";
    if (diff < 86400) return "Hace " + Math.floor(diff / 3600) + " hora(s)";
    if (diff < 2592000) return "Hace " + Math.floor(diff / 86400) + " día(s)";
    if (diff < 31536000) return "Hace " + Math.floor(diff / 2592000) + " mes(es)";
    return "Hace " + Math.floor(diff / 31536000) + " año(s)";
  }

  // -------- Manejador global de clicks --------
  document.addEventListener("click", function (e) {
    var target = e.target;

    // Mostrar/ocultar respuestas
    var ver = target.closest && target.closest(".ver-respuestas");
    if (ver) {
      e.preventDefault();
      var com = ver.closest(".comentario"),
        sub = com.querySelector(".subrespuestas"),
        flecha = ver.querySelector(".flecha"),
        abierto = ver.classList.toggle("abierto");

      if (abierto) sub.classList.add("mostrar");
      else sub.classList.remove("mostrar");

      if (flecha) {
        if (abierto) flecha.classList.add("girar");
        else flecha.classList.remove("girar");
      }

      var cnt = sub.children.length;
      ver.childNodes[ver.childNodes.length - 1].textContent = abierto
        ? " Ocultar " + cnt + " respuesta(s)"
        : " Ver " + cnt + " respuesta(s)";
      return;
    }

    // Responder o reaccionar se propaga al listener anterior y al btnEnviar
    // …
  });

  // -------- Inicializar carga --------
  if (noticiaId) cargarComentarios(noticiaId);
});
