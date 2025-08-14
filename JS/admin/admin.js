(() => {
  // Ajuste viewport unidades móviles
  const setVH = () => {
    document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
  };
  setVH();
  window.addEventListener("resize", setVH);

  // ENDPOINTS
  const API = {
    cursos: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_cursos.php",
    noticias: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_noticia.php",
    tutores: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_tutor.php",
    prioridad: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_prioridad.php",
    comments: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_comentario_noticia.php",
  };

  // Estado global
  const state = {
    route: "#/cursos",
    page: 1,
    pageSize: 10,
    data: [],
    raw: [],
    tutorsMap: null,
    prioMap: null,
    devMode: true, // muestra TODOS los campos en el drawer + JSON
  };

  // Utils
  const toast = (msg, tipo = "exito", dur = 3000) => {
    if (window.gcToast) window.gcToast(msg, tipo, dur);
    else console.log(`[${tipo}] ${msg}`);
  };
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  async function postJSON(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function getTutorsMap() {
    if (state.tutorsMap && Date.now() - state.tutorsMap._ts < 30 * 60 * 1000) return state.tutorsMap;
    const arr = await postJSON(API.tutores, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach((t) => (map[t.id] = t.nombre));
    map._ts = Date.now();
    state.tutorsMap = map;
    return map;
  }
  async function getPrioridadMap() {
    if (state.prioMap && Date.now() - state.prioMap._ts < 30 * 60 * 1000) return state.prioMap;
    const arr = await postJSON(API.prioridad, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach((p) => (map[p.id] = p.nombre));
    map._ts = Date.now();
    state.prioMap = map;
    return map;
  }

  // --- Comentarios de noticias: total (incluye respuestas) ---
  async function getCommentsCount(noticiaId) {
    try {
      const res = await postJSON(API.comments, { noticia_id: Number(noticiaId), estatus: 1 });
      if (!Array.isArray(res)) return 0;
      let total = 0;
      for (const c of res) {
        total += 1;
        if (Array.isArray(c.respuestas)) total += c.respuestas.length;
      }
      return total;
    } catch (e) {
      console.warn("Comments error:", e);
      return 0;
    }
  }

  // Router
  function setRoute(hash) {
    const target = hash || "#/cursos";
    if (location.hash !== target) location.hash = target;
    else onRouteChange();
  }
  window.addEventListener("hashchange", onRouteChange);

  function onRouteChange() {
    const hash = window.location.hash || "#/cursos";
    state.route = hash;
    state.page = 1;

    // Sidebar nuevo
    qsa(".gc-side .nav-item").forEach((a) => {
      const isActive = a.getAttribute("href") === hash;
      a.classList.toggle("is-active", isActive);
      a.setAttribute("aria-current", isActive ? "page" : "false");
    });

    if (hash.startsWith("#/cursos")) return loadCursos();
    if (hash.startsWith("#/noticias")) return loadNoticias();
    // Rutas aún no implementadas (sin romper)
    if (hash.startsWith("#/contacto")) return notReady("Contacto");
    if (hash.startsWith("#/reclutamiento")) return notReady("Reclutamiento");
    if (hash.startsWith("#/cuentas")) return notReady("Cuentas");

    setRoute("#/cursos");
  }
  function notReady(name) {
    state.data = [];
    renderList([], {
      desktopRow: () => "",
      mobileRow: () => "",
      drawerTitle: () => name,
      drawerBody: () => `<p>Sección en preparación.</p>`,
    });
    const title = qs("#mod-title");
    if (title) title.textContent = name;
    const ttStatus = qs("#tt-status");
    if (ttStatus) {
      ttStatus.textContent = "—";
      ttStatus.classList.remove("badge-activo", "badge-inactivo");
    }
  }

  // Skeletons
  function showSkeletons() {
    const d = qs("#recursos-list");
    const m = qs("#recursos-list-mobile");
    if (d) d.innerHTML = "";
    if (m) m.innerHTML = "";
    const target = d || m;
    if (!target) return;
    for (let i = 0; i < 5; i++) {
      target.insertAdjacentHTML(
        "beforeend",
        `<div class="sk-row"><div class="sk n1"></div><div class="sk n2"></div><div class="sk n3"></div></div>`
      );
    }
  }

  // Render de lista (desktop + mobile)
  function renderList(rows, config) {
    const d = qs("#recursos-list");
    const m = qs("#recursos-list-mobile");
    if (d) d.innerHTML = "";
    if (m) m.innerHTML = "";

    if (!rows.length) {
      if (d) d.innerHTML = `<div class="empty-state" style="padding:1rem;">Sin resultados</div>`;
      if (m) m.innerHTML = `<div class="empty-state" style="padding:1rem;">Sin resultados</div>`;
      const countEl = qs("#mod-count");
      if (countEl) countEl.textContent = "0 resultados";
      renderPagination(0);
      return;
    }

    const start = (state.page - 1) * state.pageSize;
    const pageRows = rows.slice(start, start + state.pageSize);

    pageRows.forEach((item) => {
      if (d) d.insertAdjacentHTML("beforeend", config.desktopRow(item));
      if (m) m.insertAdjacentHTML("beforeend", config.mobileRow(item));
    });

    const countEl = qs("#mod-count");
    if (countEl) countEl.textContent = `${rows.length} ${rows.length === 1 ? "elemento" : "elementos"}`;

    // eventos de filas (desktop)
    qsa("#recursos-list .table-row").forEach((el) => {
      el.addEventListener("click", () => {
        const data = el.dataset;
        const item = state.data.find((x) => String(x.id) === data.id);
        openDrawer(config.drawerTitle(data), config.drawerBody(data), { item, type: data.type });
      });
    });
    // mobile: expand + drawer
    qsa("#recursos-list-mobile .row-toggle").forEach((el) => {
      el.addEventListener("click", () =>
        el.closest(".table-row-mobile").classList.toggle("expanded")
      );
    });
    qsa("#recursos-list-mobile .open-drawer").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const container = btn.closest(".table-row-mobile");
        const data = container.dataset;
        const item = state.data.find((x) => String(x.id) === data.id);
        openDrawer(config.drawerTitle(data), config.drawerBody(data), { item, type: data.type });
      });
    });

    renderPagination(rows.length);
  }

  function renderPagination(total) {
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    const conts = [qs("#pagination-controls"), qs("#pagination-mobile")];
    conts.forEach((cont) => {
      if (!cont) return;
      cont.innerHTML = "";
      if (totalPages <= 1) return;

      const prev = document.createElement("button");
      prev.className = "arrow-btn";
      prev.textContent = "‹";
      prev.disabled = state.page === 1;
      prev.onclick = () => { state.page = Math.max(1, state.page - 1); refreshCurrent(); };
      cont.appendChild(prev);

      for (let p = 1; p <= totalPages && p <= 7; p++) {
        const b = document.createElement("button");
        b.className = "page-btn" + (p === state.page ? " active" : "");
        b.textContent = p;
        b.onclick = () => { state.page = p; refreshCurrent(); };
        cont.appendChild(b);
      }

      const next = document.createElement("button");
      next.className = "arrow-btn";
      next.textContent = "›";
      next.disabled = state.page === totalPages;
      next.onclick = () => { state.page = Math.min(totalPages, state.page + 1); refreshCurrent(); };
      cont.appendChild(next);
    });
  }
  function refreshCurrent() {
    if (state.route.startsWith("#/cursos")) return drawCursos();
    if (state.route.startsWith("#/noticias")) return drawNoticias();
  }

  // =================== CURSOS ===================
  async function loadCursos() {
    const title = qs("#mod-title");
    if (title) title.textContent = "Cursos";

    // Encabezados
    const hdr = qs(".recursos-box.desktop-only .table-header");
    if (hdr) {
      const hNombre = hdr.querySelector(".col-nombre");
      const hTutor = hdr.querySelector(".col-tutor") || hdr.querySelector(".col-tipo");
      const hFecha = hdr.querySelector(".col-fecha");
      let hStatus = hdr.querySelector(".col-status");

      if (hNombre) hNombre.textContent = "Nombre";
      if (hTutor) { hTutor.classList.add("col-tutor"); hTutor.textContent = "Tutor"; }
      if (hFecha) hFecha.textContent = "Fecha de inicio";
      if (!hStatus) {
        const div = document.createElement("div");
        div.className = "col-status";
        div.setAttribute("role", "columnheader");
        div.textContent = "Status";
        hdr.appendChild(div);
      } else {
        hStatus.textContent = "Status";
      }
    }

    showSkeletons();
    try {
      const [raw, tmap] = await Promise.all([
        postJSON(API.cursos, { estatus: 1 }),
        getTutorsMap(),
      ]);

      state.raw = Array.isArray(raw) ? raw : [];
      state.data = state.raw.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        tutor: tmap[c.tutor] || `Tutor #${c.tutor}`,
        precio: Number(c.precio || 0),
        fecha: c.fecha_inicio,
        estatus: Number(c.estatus),
        _all: c,
      }));

      // Toolbar badges de estado
      const ttStatus = qs("#tt-status");
      if (ttStatus) {
        ttStatus.textContent = "Activos";
        ttStatus.classList.remove("badge-inactivo");
        ttStatus.classList.add("badge-activo");
      }

      drawCursos();
      toast("Cursos cargados", "exito", 1600);
    } catch (err) {
      const list = qs("#recursos-list");
      if (list) list.innerHTML = `<div style="padding:1rem;color:#b00020;">Error al cargar cursos</div>`;
      const m = qs("#recursos-list-mobile");
      if (m) m.innerHTML = "";
      toast("No se pudieron cargar cursos", "error");
      console.error(err);
    }
  }

  function drawCursos() {
    const rows = state.data;
    renderList(rows, {
      desktopRow: (it) => `
        <div class="table-row" data-id="${it.id}" data-type="curso">
          <div class="col-nombre">
            <span>${escapeHTML(it.nombre)}</span>
            ${badgePrecio(it.precio)}
          </div>
          <div class="col-tutor">${escapeHTML(it.tutor)}</div>
          <div class="col-fecha">${fmtDate(it.fecha)}</div>
          <div class="col-status">${badgeCurso(it.estatus)}</div>
        </div>`,
      mobileRow: (it) => `
        <div class="table-row-mobile" data-id="${it.id}" data-type="curso">
          <button class="row-toggle">
            <div class="col-nombre">${escapeHTML(it.nombre)} ${badgePrecio(it.precio)}</div>
            <span class="icon-chevron">›</span>
          </button>
          <div class="row-details">
            <div><strong>Tutor:</strong> ${escapeHTML(it.tutor)}</div>
            <div><strong>Inicio:</strong> ${fmtDate(it.fecha)}</div>
            <div><strong>Status:</strong> ${textCursoStatus(it.estatus)}</div>
            <button class="btn open-drawer" style="margin:.25rem 0 .5rem;">Ver detalle</button>
          </div>
        </div>`,
      drawerTitle: (d) => {
        const item = state.data.find((x) => String(x.id) === d.id);
        return item ? `Curso · ${item.nombre}` : "Curso";
      },
      drawerBody: (d) => {
        const item = state.data.find((x) => String(x.id) === d.id);
        if (!item) return "<p>No encontrado.</p>";
        if (state.devMode) {
          return renderAllFields(item._all);
        }
        const c = item._all;
        return `
          ${pair("Tutor", item.tutor)}
          ${pair("Fecha inicio", fmtDate(c.fecha_inicio))}
          ${pair("Precio", item.precio === 0 ? "Gratuito" : fmtMoney(item.precio))}
          ${pair("Estatus", textCursoStatus(Number(c.estatus)))}
          ${pair("Descripción breve", c.descripcion_breve)}
          ${pair("Descripción", c.descripcion_media)}
        `;
      },
    });
  }

  function badgeCurso(estatus) {
    return Number(estatus) === 1
      ? `<span class="badge-activo">Activo</span>`
      : `<span class="badge-inactivo">Inactivo</span>`;
  }
  function textCursoStatus(estatus) {
    return Number(estatus) === 1 ? "Activo" : "Inactivo";
  }
  function badgePrecio(precio) {
    return Number(precio) === 0
      ? `<span class="badge-neutral">Gratuito</span>`
      : `<span class="badge-neutral">Con costo</span>`;
  }

  // =================== NOTICIAS ===================
  async function loadNoticias() {
    const title = qs("#mod-title");
    if (title) title.textContent = "Noticias";

    // Encabezados en noticias: Título | Comentarios | Publicación | Status
    const hdr = qs(".recursos-box.desktop-only .table-header");
    if (hdr) {
      const hNombre = hdr.querySelector(".col-nombre");
      const hTipo = hdr.querySelector(".col-tutor") || hdr.querySelector(".col-tipo");
      const hFecha = hdr.querySelector(".col-fecha");
      let hStatus = hdr.querySelector(".col-status");

      if (hNombre) hNombre.textContent = "Título";
      if (hTipo) { hTipo.textContent = "Comentarios"; hTipo.classList.add("col-tutor"); }
      if (hFecha) hFecha.textContent = "Publicación";
      if (!hStatus) {
        const div = document.createElement("div");
        div.className = "col-status";
        div.setAttribute("role", "columnheader");
        div.textContent = "Status";
        hdr.appendChild(div);
      } else {
        hStatus.textContent = "Status";
      }
    }

    showSkeletons();
    try {
      const raw = await postJSON(API.noticias, { estatus: 1 });
      const arr = Array.isArray(raw) ? raw : [];

      // Obtener conteo de comentarios por noticia
      const counts = await Promise.all(arr.map(n => getCommentsCount(n.id)));

      state.raw = arr;
      state.data = arr.map((n, i) => ({
        id: n.id,
        titulo: n.titulo,
        fecha: n.fecha_creacion,
        estatus: Number(n.estatus),
        comentarios: counts[i] || 0,
        _all: n,
      }));

      // Toolbar status
      const ttStatus = qs("#tt-status");
      if (ttStatus) {
        ttStatus.textContent = "Activas";
        ttStatus.classList.remove("badge-inactivo");
        ttStatus.classList.add("badge-activo");
      }

      drawNoticias();
      toast("Noticias cargadas", "exito", 1600);
    } catch (err) {
      const list = qs("#recursos-list");
      if (list) list.innerHTML = `<div style="padding:1rem;color:#b00020;">Error al cargar noticias</div>`;
      const m = qs("#recursos-list-mobile");
      if (m) m.innerHTML = "";
      toast("No se pudieron cargar noticias", "error");
      console.error(err);
    }
  }

  function drawNoticias() {
    const rows = state.data;
    renderList(rows, {
      desktopRow: (it) => `
        <div class="table-row" data-id="${it.id}" data-type="noticia">
          <div class="col-nombre">
            <span>${escapeHTML(it.titulo)}</span>
          </div>
          <div class="col-tutor">${it.comentarios}</div>
          <div class="col-fecha">${fmtDateTime(it.fecha)}</div>
          <div class="col-status">
            ${Number(it.estatus) === 1
          ? `<span class="badge-activo">Publicada</span>`
          : `<span class="badge-inactivo">Inactiva</span>`}
          </div>
        </div>`,
      mobileRow: (it) => `
        <div class="table-row-mobile" data-id="${it.id}" data-type="noticia">
          <button class="row-toggle">
            <div class="col-nombre">${escapeHTML(it.titulo)}</div>
            <span class="icon-chevron">›</span>
          </button>
          <div class="row-details">
            <div><strong>Comentarios:</strong> ${it.comentarios}</div>
            <div><strong>Publicación:</strong> ${fmtDateTime(it.fecha)}</div>
            <div><strong>Status:</strong> ${Number(it.estatus) === 1 ? "Publicada" : "Inactiva"}</div>
            <button class="btn open-drawer" style="margin:.25rem 0 .5rem;">Ver detalle</button>
          </div>
        </div>`,
      drawerTitle: (d) => {
        const item = state.data.find((x) => String(x.id) === d.id);
        return item ? `Noticia · ${item.titulo}` : "Noticia";
      },
      drawerBody: (d) => {
        const n = state.data.find((x) => String(x.id) === d.id)?._all;
        if (!n) return "<p>No encontrado.</p>";
        return state.devMode
          ? renderAllFields(n)
          : `
          ${pair("Título", n.titulo)}
          ${pair("Estado", Number(n.estatus) === 1 ? "Publicada" : "Inactiva")}
          ${pair("Fecha creación", fmtDateTime(n.fecha_creacion))}
          ${pair("Descripción (uno)", n.desc_uno)}
          ${pair("Descripción (dos)", n.desc_dos)}
          ${pair("Creado por", n.creado_por)}
        `;
      },
    });
  }

  // =================== Drawer ===================
  function openDrawer(title, bodyHTML, ctx) {
    const overlay = qs("#gc-dash-overlay");
    if (overlay) overlay.classList.add("open");

    const drawer = qs("#gc-drawer");
    if (!drawer) return;

    const t = qs("#drawer-title");
    if (t) t.textContent = title || "Detalle";
    const b = qs("#drawer-body");
    if (b) b.innerHTML = bodyHTML || "";

    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");

    // Inyectar acciones (Editar/Borrar visuales)
    if (ctx && ctx.item) injectDrawerActions(ctx.item, ctx.type);
  }

  function closeDrawer() {
    const overlay = qs("#gc-dash-overlay");
    if (overlay) overlay.classList.remove("open");

    const drawer = qs("#gc-drawer");
    if (!drawer) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  }

  // Inyecta barra de acciones en el drawer (Editar solo en modo dev)
  function injectDrawerActions(item, type) {
    const body = document.querySelector("#drawer-body");
    if (!body) return;

    const old = body.querySelector(".drawer-actions-row");
    if (old) old.remove();

    const row = document.createElement("div");
    row.className = "drawer-actions-row";
    row.innerHTML = `
      <div class="row-left"></div>
      <div class="row-right">
        ${state.devMode ? `<button class="btn" id="btn-edit">Editar</button>` : ""}
        <button class="btn danger" id="btn-delete">Borrar</button>
      </div>
    `;
    body.appendChild(row);

    // Borrar -> Confirmar
    const btnDelete = row.querySelector("#btn-delete");
    let armed = false;
    let armTO = null;

    btnDelete.addEventListener("click", async () => {
      if (!armed) {
        armed = true;
        btnDelete.textContent = "Confirmar";
        btnDelete.classList.add("confirm");
        armTO = setTimeout(() => {
          armed = false;
          btnDelete.textContent = "Borrar";
          btnDelete.classList.remove("confirm");
        }, 4000);
        return;
      }

      // Confirmado (visual; sin endpoint aún)
      clearTimeout(armTO);
      armed = false;
      btnDelete.disabled = true;

      try {
        await softDelete(type, item.id);   // visual: quita de la lista actual
        closeDrawer();
        toast("Elemento eliminado.", "exito", 2000);
      } catch (e) {
        console.error(e);
        toast("No se pudo eliminar.", "error");
        btnDelete.disabled = false;
        btnDelete.textContent = "Borrar";
        btnDelete.classList.remove("confirm");
      }
    });

    // Editar (visual)
    const btnEdit = row.querySelector("#btn-edit");
    if (btnEdit) {
      btnEdit.addEventListener("click", () => {
        // Aquí puedes activar tu modo edición cuando definas el flujo
        // (inputs, botones guardar/cancelar, etc.). De momento, visual.
        toast("Funcion pendiente", "warning", 1800);
      });
    }
  }

  // Soft delete visual (estatus=0 en memoria + refrescar vista)
  async function softDelete(type, id) {
    const rawItem = state.raw.find(x => String(x.id) === String(id));
    if (rawItem) rawItem.estatus = 0;

    // Como las listas cargan solo activos (estatus:1), quitamos de la vista actual
    state.data = state.data.filter(x => String(x.id) !== String(id));
    refreshCurrent();
  }

  // ----- helpers de UI -----
  function escapeHTML(str) {
    return String(str ?? "").replace(/[&<>'"]/g, (s) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[s]));
  }
  function fmtDate(d) {
    if (!d) return "-";
    try {
      const [y, m, day] = d.split("-");
      return `${day}/${m}/${y}`;
    } catch { return d; }
  }
  function fmtDateTime(dt) {
    if (!dt) return "-";
    try {
      const [date, time] = dt.split(" ");
      return `${fmtDate(date)} ${time || ""}`.trim();
    } catch { return dt; }
  }
  function fmtMoney(n) {
    try {
      return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
    } catch { return `$${n}`; }
  }
  function pair(label, val) {
    return `<div class="field"><div class="label">${escapeHTML(label)}</div><div class="value">${escapeHTML(val ?? "-")}</div></div>`;
  }

  // Drawer dev Mode: vista completa + JSON
  function renderAllFields(obj, extras = {}) {
    const merged = { ...obj, ...extras };
    const entries = Object.entries(merged);
    const html = entries
      .map(([k, v]) => {
        const val = formatValue(v);
        return `<div class="field"><div class="label">${escapeHTML(k)}</div><div class="value">${val}</div></div>`;
      })
      .join("");

    const jsonPretty = escapeHTML(JSON.stringify(obj, null, 2));
    const jsonBlock = `
      <div style="margin-top:16px;">
        <div class="label" style="margin-bottom:6px;">JSON</div>
        <pre class="value" style="white-space:pre-wrap;max-height:260px;overflow:auto;">${jsonPretty}</pre>
        <button class="btn" id="btn-copy-json">Copiar JSON</button>
      </div>`;
    setTimeout(() => {
      const btn = qs("#btn-copy-json");
      if (btn)
        btn.onclick = async () => {
          try {
            await navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
            toast("JSON copiado", "exito", 1500);
          } catch {
            toast("No se pudo copiar", "warning");
          }
        };
    }, 0);

    return html + jsonBlock;
  }
  function formatValue(v) {
    if (v === null || v === undefined) return "<em style='color:#777'>null</em>";
    if (typeof v === "boolean") return v ? "true" : "false";
    if (typeof v === "number") return String(v);
    if (typeof v === "string") {
      if (/^\d{4}-\d{2}-\d{2}( .+)?$/.test(v))
        return `<code>${escapeHTML(v)}</code> <span style="color:#666">(${escapeHTML(fmtDateTime(v) || fmtDate(v))})</span>`;
      const long = v.length > 220;
      const short = escapeHTML(v.slice(0, 220)) + (long ? "…" : "");
      if (!long) return short;
      const id = "tx_" + Math.random().toString(36).slice(2);
      setTimeout(() => {
        const btn = qs(`#${id}_btn`);
        if (btn)
          btn.onclick = () => {
            const el = qs(`#${id}`);
            const expanded = btn.dataset.expanded === "1";
            el.textContent = expanded ? v.slice(0, 220) + "…" : v;
            btn.textContent = expanded ? "ver más" : "ver menos";
            btn.dataset.expanded = expanded ? "0" : "1";
          };
      }, 0);
      return `<span id="${id}">${short}</span> <button class="btn" id="${id}_btn" data-expanded="0">ver más</button>`;
    }
    try {
      return `<pre style="white-space:pre-wrap;max-height:200px;overflow:auto;">${escapeHTML(JSON.stringify(v, null, 2))}</pre>`;
    } catch {
      return escapeHTML(String(v));
    }
  }

  // UI init
  function bindUI() {
    // Botón de modo dev (inyección en toolbar)
    const devBtn = document.createElement("button");
    devBtn.className = "btn";
    devBtn.id = "btn-dev";
    devBtn.textContent = state.devMode ? "Modo desarrollador: ON" : "Modo desarrollador: OFF";
    devBtn.onclick = () => {
      state.devMode = !state.devMode;
      devBtn.textContent = `Modo desarrollador: ${state.devMode ? "ON" : "OFF"}`;
      toast(`Modo desarrollador ${state.devMode ? "activado" : "desactivado"}`, "exito", 1200);
    };
    const right = qs(".dash-toolbar .right");
    if (right) right.prepend(devBtn);

    // Refresh (opcional: si existe)
    const refresh = qs("#btn-refresh");
    if (refresh) refresh.addEventListener("click", () => refreshCurrent());

    // Drawer close
    const drawerClose = qs("#drawer-close");
    if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
    const overlay = qs("#gc-dash-overlay");
    if (overlay)
      overlay.addEventListener("click", (e) => {
        if (e.target.id === "gc-dash-overlay") closeDrawer();
      });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindUI();
    if (!window.location.hash) window.location.hash = "#/cursos";
    onRouteChange();
  });
})();
