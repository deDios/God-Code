// =========================
// Dashboard beta – JS
// =========================
(function () {
  // ---- utilidades rápidas ----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // gcToast fallback
  const toast = (msg, tipo = "exito", dur = 4000) =>
    window.gcToast
      ? window.gcToast(msg, tipo, dur)
      : console.log(`[${tipo}]`, msg);

  // Endpoints
  const API = {
    cursos:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_cursos.php",
    noticias:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_noticia.php",
    tutores:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_tutor.php",
    usuarios:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_usuario.php",
  };

  // Cache simple en memoria
  const cache = {
    cursos: null,
    noticias: null,
    tutores: null,
    usuarios: null,
    ts: {},
  };
  const isFresh = (key, ttlMs = 3 * 60 * 1000) =>
    cache.ts[key] && Date.now() - cache.ts[key] < ttlMs;

  async function postJSON(url, body) {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }

  // ---- Router simple por hash ----
  const routes = {
    "#/cursos": loadCursos,
    "#/noticias": loadNoticias,
    "#/usuarios": loadUsuarios,
  };
  function currentRoute() {
    return location.hash && routes[location.hash] ? location.hash : "#/cursos";
  }
  window.addEventListener("hashchange", () => navigate(currentRoute()));

  // ---- UI refs ----
  const elTitle = $("#module-title");
  const elSub = $("#module-sub");
  const elQ = $("#q");
  const elList = $("#recursos-list");
  const elListM = $("#recursos-list-mobile");
  const elPag = $("#pagination-controls");
  const elPagM = $("#pagination-mobile");

  // Drawer
  const drawer = $("#gc-drawer");
  $("#drawer-close").addEventListener("click", closeDrawer);

  function openDrawer(title, html) {
    $("#drawer-title").textContent = title || "Detalle";
    $("#drawer-body").innerHTML = html || "";
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  }

  // ---- Helpers de render ----
  function setHeader(title, count) {
    elTitle.textContent = title;
    elSub.textContent =
      typeof count === "number" ? `${count} elementos` : count || "";
  }

  function renderSkeleton(n = 6) {
    const rows = Array.from({ length: n })
      .map(
        () =>
          `<div class="sk-row"><div class="sk n1"></div><div class="sk n2"></div><div class="sk n3"></div></div>`
      )
      .join("");
    elList.innerHTML = rows;
    elListM.innerHTML = rows; // simple placeholder también en mobile
  }

  // Paginación client-side
  function paginate(arr, page = 1, perPage = 10) {
    const total = arr.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;
    const items = arr.slice(start, start + perPage);
    return { items, page, pages, total };
  }
  function renderPagination(container, page, pages, onGo) {
    container.innerHTML = "";
    const btn = (label, disabled, go) => {
      const b = document.createElement("button");
      b.className = "arrow-btn";
      b.textContent = label;
      b.disabled = !!disabled;
      b.addEventListener("click", () => onGo(go));
      return b;
    };
    container.append(btn("⟨", page <= 1, page - 1));
    for (let p = 1; p <= pages; p++) {
      const b = document.createElement("button");
      b.className = "page-btn" + (p === page ? " active" : "");
      b.textContent = p;
      b.addEventListener("click", () => onGo(p));
      container.appendChild(b);
    }
    container.append(btn("⟩", page >= pages, page + 1));
  }

  // Búsqueda simple (en nombre/título)
  function filterByQuery(items, keyList, q) {
    if (!q) return items;
    const s = q.trim().toLowerCase();
    return items.filter((o) =>
      keyList.some((k) =>
        String(o[k] || "")
          .toLowerCase()
          .includes(s)
      )
    );
  }

  // ---- Loaders de rutas ----
  async function loadCursos() {
    setHeader("Cursos", "Cargando…");
    renderSkeleton(6);
    try {
      if (!isFresh("tutores", 30 * 60 * 1000)) {
        cache.tutores = await postJSON(API.tutores, { estatus: 1 });
        cache.ts.tutores = Date.now();
      }
      if (!isFresh("cursos")) {
        cache.cursos = await postJSON(API.cursos, { estatus: 1 });
        cache.ts.cursos = Date.now();
      }
      const mapTutor = new Map(
        cache.tutores.map((t) => [String(t.id), t.nombre])
      );

      // preparar datos visibles de tabla
      const q = elQ.value || "";
      const base = filterByQuery(
        cache.cursos,
        ["nombre", "descripcion_breve"],
        q
      );
      state.current = { type: "cursos", data: base, mapTutor };
      renderCursos(1);
      toast("Cursos cargados", "exito", 2500);
    } catch (e) {
      elList.innerHTML =
        '<div style="padding:1rem">Error al cargar cursos</div>';
      elListM.innerHTML = "";
      toast("No se pudo cargar cursos", "error");
    }
  }

  function renderCursos(page) {
    const { data, mapTutor } = state.current;
    const per = state.perPage;
    const { items, pages, total } = paginate(data, page, per);
    setHeader("Cursos", total);

    // Desktop rows
    elList.innerHTML = items
      .map((c) => {
        const tutorName = mapTutor.get(String(c.tutor)) || "—";
        const precio =
          Number(c.precio) === 0
            ? '<span class="chip chip--gratis">Gratis</span>'
            : new Intl.NumberFormat("es-MX", {
                style: "currency",
                currency: "MXN",
              }).format(c.precio);
        const cert = c.certificado
          ? '<span class="chip chip--cert">Certificado</span>'
          : "";
        const prior = c.prioridad
          ? `<span class="chip chip--prior">P${c.prioridad}</span>`
          : "";
        return `
          <div class="table-row" data-kind="curso" data-id="${c.id}">
            <div class="col-nombre">
              <span class="recurso-link">${escapeHTML(c.nombre)}</span>
            </div>
            <div class="col-tipo">
              <div>${escapeHTML(tutorName)}</div>
              <div style="margin-top:4px; display:flex; gap:6px; flex-wrap:wrap;">${cert}${prior}</div>
            </div>
            <div class="col-fecha">
              <div>${escapeHTML(c.fecha_inicio || "—")}</div>
              <div style="margin-top:6px;">${precio}</div>
            </div>
          </div>`;
      })
      .join("");

    // Click -> drawer detalle
    $$("#recursos-list .table-row").forEach((row) =>
      row.addEventListener("click", () => {
        const id = row.getAttribute("data-id");
        const c = data.find((x) => String(x.id) === String(id));
        const tutorName = mapTutor.get(String(c.tutor)) || "—";
        openDrawer(
          "Curso · " + c.nombre,
          `
          <div class="field"><div class="label">Tutor</div><div class="value">${escapeHTML(
            tutorName
          )}</div></div>
          <div class="field"><div class="label">Fecha inicio</div><div class="value">${escapeHTML(
            c.fecha_inicio || "—"
          )}</div></div>
          <div class="field"><div class="label">Precio</div><div class="value">${
            Number(c.precio) === 0
              ? "Gratis"
              : new Intl.NumberFormat("es-MX", {
                  style: "currency",
                  currency: "MXN",
                }).format(c.precio)
          }</div></div>
          <div class="field"><div class="label">Certificado</div><div class="value">${
            c.certificado ? "Sí" : "No"
          }</div></div>
          <div class="field"><div class="label">Prioridad</div><div class="value">${
            c.prioridad || "—"
          }</div></div>
          <div class="field"><div class="label">Descripción breve</div><div class="value">${escapeHTML(
            c.descripcion_breve || ""
          )}</div></div>
          <div class="field"><div class="label">Descripción</div><div class="value">${nl2br(
            escapeHTML(c.descripcion_media || c.descripcion_curso || "")
          )}</div></div>
        `
        );
      })
    );

    // Mobile rows (acordeón)
    elListM.innerHTML = items
      .map((c) => {
        const precio =
          Number(c.precio) === 0
            ? '<span class="chip chip--gratis">Gratis</span>'
            : new Intl.NumberFormat("es-MX", {
                style: "currency",
                currency: "MXN",
              }).format(c.precio);
        const cert = c.certificado
          ? '<span class="chip chip--cert">Certificado</span>'
          : "";
        return `
          <div class="table-row-mobile" data-kind="curso" data-id="${c.id}">
            <button class="row-toggle">
              <div class="col-nombre">${escapeHTML(c.nombre)}</div>
              <div class="icon-chevron">›</div>
            </button>
            <div class="row-details">
              <div class="mobile-meta">${cert} ${precio}</div>
              <div>${escapeHTML(c.fecha_inicio || "—")}</div>
              <div><a href="#" class="recurso-link" data-open="${
                c.id
              }">Ver detalle</a></div>
            </div>
          </div>`;
      })
      .join("");
    // toggles acordeón + ver detalle
    $$("#recursos-list-mobile .row-toggle").forEach((btn) =>
      btn.addEventListener("click", () =>
        btn.parentElement.classList.toggle("expanded")
      )
    );
    $$("#recursos-list-mobile a[data-open]").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const id = a.getAttribute("data-open");
        const c = state.current.data.find((x) => String(x.id) === String(id));
        openDrawer(
          "Curso · " + c.nombre,
          `<div class="field"><div class="label">Precio</div><div class="value">${
            Number(c.precio) === 0
              ? "Gratis"
              : new Intl.NumberFormat("es-MX", {
                  style: "currency",
                  currency: "MXN",
                }).format(c.precio)
          }</div></div><div class="field"><div class="label">Descripción</div><div class="value">${nl2br(
            escapeHTML(c.descripcion_media || "")
          )}</div></div>`
        );
      })
    );

    renderPagination(elPag, page, pages, (go) => renderCursos(go));
    renderPagination(elPagM, page, pages, (go) => renderCursos(go));
  }

  async function loadNoticias() {
    setHeader("Noticias", "Cargando…");
    renderSkeleton(6);
    try {
      if (!isFresh("noticias")) {
        cache.noticias = await postJSON(API.noticias, { estatus: 1 });
        cache.ts.noticias = Date.now();
      }
      const q = elQ.value || "";
      const base = filterByQuery(cache.noticias, ["titulo", "desc_uno"], q);
      state.current = { type: "noticias", data: base };
      renderNoticias(1);
      toast("Noticias cargadas", "exito", 2500);
    } catch (e) {
      elList.innerHTML =
        '<div style="padding:1rem">Error al cargar noticias</div>';
      elListM.innerHTML = "";
      toast("No se pudo cargar noticias", "error");
    }
  }

  function renderNoticias(page) {
    const { data } = state.current;
    const per = state.perPage;
    const { items, pages, total } = paginate(data, page, per);
    setHeader("Noticias", total);

    elList.innerHTML = items
      .map(
        (n) => `
        <div class="table-row" data-kind="noticia" data-id="${n.id}">
          <div class="col-nombre"><span class="recurso-link">${escapeHTML(
            n.titulo
          )}</span></div>
          <div class="col-tipo"><span class="chip chip--estatus">Publicada</span></div>
          <div class="col-fecha">${escapeHTML(
            (n.fecha_creacion || "").split(" ")[0]
          )}</div>
        </div>`
      )
      .join("");

    $$("#recursos-list .table-row").forEach((row) =>
      row.addEventListener("click", () => {
        const id = row.getAttribute("data-id");
        const n = data.find((x) => String(x.id) === String(id));
        openDrawer(
          "Noticia · " + n.titulo,
          `
          <div class="field"><div class="label">Fecha</div><div class="value">${escapeHTML(
            n.fecha_creacion || ""
          )}</div></div>
          <div class="field"><div class="label">Descripción (uno)</div><div class="value">${nl2br(
            escapeHTML(n.desc_uno || "")
          )}</div></div>
          <div class="field"><div class="label">Descripción (dos)</div><div class="value">${nl2br(
            escapeHTML(n.desc_dos || "")
          )}</div></div>
        `
        );
      })
    );

    elListM.innerHTML = items
      .map(
        (n) => `
        <div class="table-row-mobile" data-kind="noticia" data-id="${n.id}">
          <button class="row-toggle">
            <div class="col-nombre">${escapeHTML(n.titulo)}</div>
            <div class="icon-chevron">›</div>
          </button>
          <div class="row-details">
            <div class="mobile-meta"><span class="chip chip--estatus">Publicada</span></div>
            <div>${escapeHTML((n.fecha_creacion || "").split(" ")[0])}</div>
            <div><a href="#" class="recurso-link" data-open="${
              n.id
            }">Ver detalle</a></div>
          </div>
        </div>`
      )
      .join("");
    $$("#recursos-list-mobile .row-toggle").forEach((btn) =>
      btn.addEventListener("click", () =>
        btn.parentElement.classList.toggle("expanded")
      )
    );
    $$("#recursos-list-mobile a[data-open]").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const id = a.getAttribute("data-open");
        const n = state.current.data.find((x) => String(x.id) === String(id));
        openDrawer(
          "Noticia · " + n.titulo,
          `<div class="field"><div class="label">Descripción</div><div class="value">${nl2br(
            escapeHTML(n.desc_uno || "")
          )}</div></div>`
        );
      })
    );

    renderPagination(elPag, page, pages, (go) => renderNoticias(go));
    renderPagination(elPagM, page, pages, (go) => renderNoticias(go));
  }

  async function loadUsuarios() {
    setHeader("Usuarios", "Cargando…");
    renderSkeleton(6);
    try {
      if (!isFresh("usuarios")) {
        cache.usuarios = await postJSON(API.usuarios, { estatus: "1" });
        cache.ts.usuarios = Date.now();
      }
      const q = elQ.value || "";
      const base = filterByQuery(
        cache.usuarios,
        ["nombre", "correo", "telefono"],
        q
      );
      state.current = { type: "usuarios", data: base };
      renderUsuarios(1);
      toast("Usuarios cargados", "exito", 2500);
    } catch (e) {
      elList.innerHTML =
        '<div style="padding:1rem">Error al cargar usuarios</div>';
      elListM.innerHTML = "";
      toast("No se pudo cargar usuarios", "error");
    }
  }

  function renderUsuarios(page) {
    const { data } = state.current;
    const per = state.perPage;
    const { items, pages, total } = paginate(data, page, per);
    setHeader("Usuarios", total);

    elList.innerHTML = items
      .map(
        (u) => `
        <div class="table-row" data-kind="usuario" data-id="${u.id}">
          <div class="col-nombre">${escapeHTML(u.nombre)}</div>
          <div class="col-tipo">${escapeHTML(u.correo)}<br>${escapeHTML(
          u.telefono || "—"
        )}</div>
          <div class="col-fecha">
            <span class="chip chip--estatus">Activo</span>
            <div style="margin-top:6px; font-size:.9rem; color:#666;">${escapeHTML(
              (u.fecha_creacion || "").split(" ")[0]
            )}</div>
          </div>
        </div>`
      )
      .join("");

    $$("#recursos-list .table-row").forEach((row) =>
      row.addEventListener("click", () => {
        const id = row.getAttribute("data-id");
        const u = data.find((x) => String(x.id) === String(id));
        openDrawer(
          "Usuario · " + u.nombre,
          `
          <div class="field"><div class="label">Correo</div><div class="value">${escapeHTML(
            u.correo
          )}</div></div>
          <div class="field"><div class="label">Teléfono</div><div class="value">${escapeHTML(
            u.telefono || "—"
          )}</div></div>
          <div class="field"><div class="label">Tipo de contacto</div><div class="value">${tipoContacto(
            u.tipo_contacto
          )}</div></div>
          <div class="field"><div class="label">Estatus</div><div class="value">${
            u.estatus == "1" ? "Activo" : "Inactivo"
          }</div></div>
          <div class="field"><div class="label">Creado</div><div class="value">${escapeHTML(
            u.fecha_creacion || ""
          )}</div></div>
        `
        );
      })
    );

    elListM.innerHTML = items
      .map(
        (u) => `
        <div class="table-row-mobile" data-kind="usuario" data-id="${u.id}">
          <button class="row-toggle">
            <div class="col-nombre">${escapeHTML(u.nombre)}</div>
            <div class="icon-chevron">›</div>
          </button>
          <div class="row-details">
            <div class="mobile-meta"><span class="chip chip--estatus">${
              u.estatus == "1" ? "Activo" : "Inactivo"
            }</span></div>
            <div>${escapeHTML(u.correo)}</div>
            <div>${escapeHTML(u.telefono || "—")}</div>
            <div><a href="#" class="recurso-link" data-open="${
              u.id
            }">Ver detalle</a></div>
          </div>
        </div>`
      )
      .join("");
    $$("#recursos-list-mobile .row-toggle").forEach((btn) =>
      btn.addEventListener("click", () =>
        btn.parentElement.classList.toggle("expanded")
      )
    );
    $$("#recursos-list-mobile a[data-open]").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const id = a.getAttribute("data-open");
        const u = state.current.data.find((x) => String(x.id) === String(id));
        openDrawer(
          "Usuario · " + u.nombre,
          `<div class=\"field\"><div class=\"label\">Correo</div><div class=\"value\">${escapeHTML(
            u.correo
          )}</div></div><div class=\"field\"><div class=\"label\">Teléfono</div><div class=\"value\">${escapeHTML(
            u.telefono || "—"
          )}</div></div>`
        );
      })
    );

    renderPagination(elPag, page, pages, (go) => renderUsuarios(go));
    renderPagination(elPagM, page, pages, (go) => renderUsuarios(go));
  }

  // ---- Estado global de la vista ----
  const state = { perPage: 10, current: { type: "cursos", data: [] } };

  // ---- Búsqueda con debounce ----
  let qTimer = null;
  elQ.addEventListener("input", () => {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => {
      navigate(currentRoute(), /*keep*/ true);
    }, 300);
  });

  // ---- Botones toolbar ----
  $("#btn-refresh").addEventListener("click", () => {
    cache.ts[currentRoute().slice(2)] = 0;
    navigate(currentRoute());
  });
  $("#btn-new").addEventListener("click", () => {
    toast('Acción "Nuevo" pendiente de implementar', "warning");
  });

  // ---- navegacion desde sidebar ----
  $$("#sidebar [data-route]").forEach((btn) =>
    btn.addEventListener("click", () => {
      location.hash = btn.getAttribute("data-route");
    })
  );

  // ---- navegar ----
  async function navigate(route, keep) {
    if (!keep) elQ.value = "";
    const go = routes[route] || routes["#/cursos"];
    closeDrawer();
    await go();
  }

  // Helpers varios
  function tipoContacto(v) {
    const m = { 1: "Teléfono", 2: "Correo", 3: "Ambos" };
    return m[String(v)] || "—";
  }
  function escapeHTML(s) {
    return String(s || "").replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[m])
    );
  }
  function nl2br(s) {
    return String(s).replace(/\n/g, "<br>");
  }

  window.addEventListener("load", () => navigate(currentRoute()));
})();
