(() => {
  // -------- Ajuste de viewport (móvil) --------
  const setVH = () => {
    document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
  };
  setVH();
  window.addEventListener("resize", setVH);

  // -------- ENDPOINTS --------
  const API = {
    cursos: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_cursos.php",
    noticias: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_noticia.php",
    tutores: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_tutor.php",
    prioridad: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_prioridad.php",
    comentariosNoticia: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_comentario_noticia.php",
  };

  // -------- Estado global --------
  const state = {
    route: "#/cursos",
    page: 1,
    pageSize: 10,
    data: [],
    raw: [],
    tutorsMap: null,
    prioMap: null,
    devMode: JSON.parse(localStorage.getItem("gc_devMode") || "true"),
    commentsCache: new Map(), // noticiaId -> { total, ts }
    commentsCount: {}, // noticiaId -> total (para render rápido)
  };

  // -------- Utils --------
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));
  const toast = (msg, tipo = "exito", dur = 2500) =>
    window.gcToast ? window.gcToast(msg, tipo, dur) : console.log(`[${tipo}] ${msg}`);

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
    arr.forEach((t) => (map[t.id] = t.nombre));
    map._ts = Date.now();
    state.tutorsMap = map;
    return map;
  }
  async function getPrioridadMap() {
    if (state.prioMap && Date.now() - state.prioMap._ts < 30 * 60 * 1000) return state.prioMap;
    const arr = await postJSON(API.prioridad, { estatus: 1 });
    const map = {};
    arr.forEach((p) => (map[p.id] = p.nombre));
    map._ts = Date.now();
    state.prioMap = map;
    return map;
  }

  // Comentarios por noticia (comentarios + respuestas), con caché 5 min
  async function getCommentsCount(noticiaId) {
    const cached = state.commentsCache.get(noticiaId);
    if (cached && Date.now() - cached.ts < 5 * 60 * 1000) return cached.total;

    const arr = await postJSON(API.comentariosNoticia, { noticia_id: noticiaId, estatus: 1 });
    let total = 0;
    for (const c of arr) {
      total += 1;
      if (Array.isArray(c.respuestas)) total += c.respuestas.length;
    }
    state.commentsCache.set(noticiaId, { total, ts: Date.now() });
    return total;
  }

  // -------- Router --------
  window.addEventListener("hashchange", onRouteChange);

  function setRoute(hash) {
    const target = hash || "#/cursos";
    if (location.hash !== target) location.hash = target;
    else onRouteChange();
  }

  function onRouteChange() {
    const hash = window.location.hash || "#/cursos";
    state.route = hash;
    state.page = 1;

    // Sidebar activo
    qsa(".gc-side .nav-item").forEach((a) => {
      const isActive = a.getAttribute("href") === hash;
      a.classList.toggle("is-active", isActive);
      a.setAttribute("aria-current", isActive ? "page" : "false");
    });

    if (hash.startsWith("#/cursos")) return loadCursos();
    if (hash.startsWith("#/noticias")) return loadNoticias();

    setRoute("#/cursos");
  }

  // -------- Skeletons --------
  function showSkeletons() {
    const d = qs("#recursos-list");
    const m = qs("#recursos-list-mobile");
    if (!d || !m) return;
    d.innerHTML = "";
    m.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      d.insertAdjacentHTML(
        "beforeend",
        `<div class="sk-row"><div class="sk n1"></div><div class="sk n2"></div><div class="sk n3"></div></div>`
      );
    }
  }

  // -------- Render genérico --------
  function renderList(rows, config) {
    const d = qs("#recursos-list");
    const m = qs("#recursos-list-mobile");
    if (!d || !m) return;

    d.innerHTML = "";
    m.innerHTML = "";

    if (!rows.length) {
      d.innerHTML = `<div class="empty-state" style="padding:1rem;">Sin resultados</div>`;
      m.innerHTML = `<div class="empty-state" style="padding:1rem;">Sin resultados</div>`;
      qs("#mod-count") && (qs("#mod-count").textContent = "0 elementos");
      renderPagination(0);
      return;
    }

    const start = (state.page - 1) * state.pageSize;
    const pageRows = rows.slice(start, start + state.pageSize);

    pageRows.forEach((item) => {
      d.insertAdjacentHTML("beforeend", config.desktopRow(item));
      m.insertAdjacentHTML("beforeend", config.mobileRow(item));
    });

    qs("#mod-count") &&
      (qs("#mod-count").textContent = `${rows.length} ${rows.length === 1 ? "elemento" : "elementos"}`);

    // Eventos de filas
    qsa("#recursos-list .table-row").forEach((el) => {
      el.addEventListener("click", () =>
        openDrawer(config.drawerTitle(el.dataset), config.drawerBody(el.dataset))
      );
    });
    qsa("#recursos-list-mobile .row-toggle").forEach((el) => {
      el.addEventListener("click", () => el.closest(".table-row-mobile").classList.toggle("expanded"));
    });
    qsa("#recursos-list-mobile .open-drawer").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const data = btn.closest(".table-row-mobile").dataset;
        openDrawer(config.drawerTitle(data), config.drawerBody(data));
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
      prev.onclick = () => {
        state.page = Math.max(1, state.page - 1);
        refreshCurrent();
      };
      cont.appendChild(prev);

      const maxButtons = 7;
      for (let p = 1; p <= totalPages && p <= maxButtons; p++) {
        const b = document.createElement("button");
        b.className = "page-btn" + (p === state.page ? " active" : "");
        b.textContent = p;
        b.onclick = () => {
          state.page = p;
          refreshCurrent();
        };
        cont.appendChild(b);
      }

      const next = document.createElement("button");
      next.className = "arrow-btn";
      next.textContent = "›";
      next.disabled = state.page === totalPages;
      next.onclick = () => {
        state.page = Math.min(totalPages, state.page + 1);
        refreshCurrent();
      };
      cont.appendChild(next);
    });
  }

  function refreshCurrent() {
    if (state.route.startsWith("#/cursos")) return drawCursos();
    if (state.route.startsWith("#/noticias")) return drawNoticias();
  }

  // ===================== CURSOS =====================
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

    // Chip toolbar “Estado”
    const ttStatus = qs("#tt-status");
    if (ttStatus) {
      ttStatus.textContent = "Activo";
      ttStatus.classList.remove("badge-inactivo");
      ttStatus.classList.add("badge-activo");
    }

    showSkeletons();
    try {
      const [raw, tmap, pmap] = await Promise.all([
        postJSON(API.cursos, { estatus: 1 }),
        getTutorsMap(),
        getPrioridadMap(),
      ]);

      state.raw = raw;
      state.data = raw.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        tutor: tmap[c.tutor] || `Tutor #${c.tutor}`,
        prioridad_id: c.prioridad,
        prioridad_nombre: pmap[c.prioridad] || `#${c.prioridad}`,
        precio: Number(c.precio || 0),
        certificado: !!c.certificado,
        fecha: c.fecha_inicio,
        estatus: Number(c.estatus),
        _all: c,
      }));

      drawCursos();
      toast("Cursos cargados", "exito", 1400);
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
      desktopRow: (it) => {
        const costoBadge = it.precio === 0
          ? `<span class="chip green">Gratuito</span>`
          : `<span class="chip amber">Con costo</span>`;
        return `
        <div class="table-row" data-id="${it.id}" data-type="curso">
          <div class="col-nombre">
            <span>${escapeHTML(it.nombre)}</span>
            ${costoBadge}
          </div>
          <div class="col-tutor">${escapeHTML(it.tutor)}</div>
          <div class="col-fecha">${fmtDate(it.fecha)}</div>
          <div class="col-status">${badgeCurso(it.estatus)}</div>
        </div>`;
      },
      mobileRow: (it) => `
        <div class="table-row-mobile" data-id="${it.id}" data-type="curso">
          <button class="row-toggle">
            <div class="col-nombre">${escapeHTML(it.nombre)}</div>
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
          return renderAllFields(item._all, {
            tutor_nombre: item.tutor,
            prioridad_nombre: item.prioridad_nombre,
          });
        }
        const c = item._all;
        return `
          ${pair("Tutor", item.tutor)}
          ${pair("Prioridad", item.prioridad_nombre)}
          ${pair("Fecha inicio", fmtDate(c.fecha_inicio))}
          ${pair("Precio", c.precio == 0 ? "Gratuito" : fmtMoney(c.precio))}
          ${pair("Certificado", c.certificado ? "Sí" : "No")}
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

  // ===================== NOTICIAS =====================
  async function loadNoticias() {
    const title = qs("#mod-title");
    if (title) title.textContent = "Noticias";

    // Encabezados para Noticias:
    // Nombre -> Título, Tutor -> Comentarios, Fecha -> Publicación, Status -> Status
    const hdr = qs(".recursos-box.desktop-only .table-header");
    if (hdr) {
      const hNombre = hdr.querySelector(".col-nombre");
      const hTutor = hdr.querySelector(".col-tutor") || hdr.querySelector(".col-tipo");
      const hFecha = hdr.querySelector(".col-fecha");
      let hStatus = hdr.querySelector(".col-status");

      if (hNombre) hNombre.textContent = "Título";
      if (hTutor) { hTutor.classList.add("col-tutor"); hTutor.textContent = "Comentarios"; }
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

    // Chip toolbar “Estado”
    const ttStatus = qs("#tt-status");
    if (ttStatus) {
      ttStatus.textContent = "Activas";
      ttStatus.classList.remove("badge-inactivo");
      ttStatus.classList.add("badge-activo");
    }

    showSkeletons();
    try {
      const raw = await postJSON(API.noticias, { estatus: 1 });
      state.raw = raw;
      state.data = raw.map((n) => ({
        id: n.id,
        titulo: n.titulo,
        fecha: n.fecha_creacion,
        estatus: Number(n.estatus),
        _all: n,
      }));

      // Precalcular comentarios para todas las noticias visibles (en paralelo)
      const ids = state.data.map((n) => n.id);
      const counts = await Promise.all(
        ids.map(async (id) => ({ id, total: await getCommentsCount(id) }))
      );
      state.commentsCount = counts.reduce((acc, { id, total }) => {
        acc[id] = total;
        return acc;
      }, {});

      drawNoticias();
      toast("Noticias cargadas", "exito", 1400);
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
            <span>${escapeHTML(it.titulo)}</span> ${chipStatus(it.estatus)}
          </div>
          <div class="col-tutor">${Number(state.commentsCount[it.id] || 0)}</div>
          <div class="col-fecha">${fmtDateTime(it.fecha)}</div>
          <div class="col-status">${badgePublicacion(it.estatus)}</div>
        </div>`,
      mobileRow: (it) => `
        <div class="table-row-mobile" data-id="${it.id}" data-type="noticia">
          <button class="row-toggle">
            <div class="col-nombre">${escapeHTML(it.titulo)} ${chipStatus(it.estatus)}</div>
            <span class="icon-chevron">›</span>
          </button>
          <div class="row-details">
            <div><strong>Publicación:</strong> ${fmtDateTime(it.fecha)}</div>
            <div><strong>Comentarios:</strong> ${Number(state.commentsCount[it.id] || 0)}</div>
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
          ? renderAllFields(n, { comentarios: Number(state.commentsCount[n.id] || 0) })
          : `
            ${pair("Título", n.titulo)}
            ${pair("Estado", statusText(n.estatus))}
            ${pair("Fecha de publicación", fmtDateTime(n.fecha_creacion))}
            ${pair("Comentarios", Number(state.commentsCount[n.id] || 0))}
            ${pair("Descripción (uno)", n.desc_uno)}
            ${pair("Descripción (dos)", n.desc_dos)}
            ${pair("Creado por", n.creado_por)}
          `;
      },
    });
  }

  function chipStatus(estatus) {
    return Number(estatus) === 1
      ? `<span class="chip green">Publicada</span>`
      : `<span class="chip gray">Inactiva</span>`;
  }
  function badgePublicacion(estatus) {
    return Number(estatus) === 1
      ? `<span class="badge-activo">Activa</span>`
      : `<span class="badge-inactivo">Inactiva</span>`;
  }
  function statusText(e) {
    return Number(e) === 1 ? "Publicada" : "Inactiva";
  }

  // ===================== Drawer =====================
  function openDrawer(title, bodyHTML) {
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
  }
  function closeDrawer() {
    const overlay = qs("#gc-dash-overlay");
    if (overlay) overlay.classList.remove("open");

    const drawer = qs("#gc-drawer");
    if (!drawer) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  }

  function escapeHTML(str) {
    return String(str ?? "").replace(
      /[&<>'"]/g,
      (s) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      }[s])
    );
  }
  function fmtDate(d) {
    if (!d) return "-";
    try {
      const [y, m, day] = d.split("-");
      return `${day}/${m}/${y}`;
    } catch {
      return d;
    }
  }
  function fmtDateTime(dt) {
    if (!dt) return "-";
    try {
      const [date, time] = dt.split(" ");
      return `${fmtDate(date)} ${time || ""}`.trim();
    } catch {
      return dt;
    }
  }
  function fmtMoney(n) {
    try {
      return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
    } catch {
      return `$${n}`;
    }
  }
  function pair(label, val) {
    return `<div class="field"><div class="label">${escapeHTML(label)}</div><div class="value">${escapeHTML(
      val ?? "-"
    )}</div></div>`;
  }

  // Modo dev (imprime todos los campos + JSON)
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
        return `<code>${escapeHTML(v)}</code> <span style="color:#666">(${escapeHTML(
          fmtDateTime(v) || fmtDate(v)
        )})</span>`;
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
      return `<pre style="white-space:pre-wrap;max-height:200px;overflow:auto;">${escapeHTML(
        JSON.stringify(v, null, 2)
      )}</pre>`;
    } catch {
      return escapeHTML(String(v));
    }
  }

  function bindUI() {
    // Botón "+" (placeholder)
    const addBtn = qs("#btn-add");
    if (addBtn) addBtn.addEventListener("click", () => toast("Acción crear (WIP)", "warning"));

    // boton de desarrollador, no deberia estorbar
    const devBtn = document.createElement("button");
    devBtn.className = "btn";
    devBtn.id = "btn-dev";
    devBtn.textContent = state.devMode ? "Modo desarrollador: ON" : "Modo desarrollador: OFF";
    devBtn.onclick = () => {
      state.devMode = !state.devMode;
      localStorage.setItem("gc_devMode", JSON.stringify(state.devMode));
      devBtn.textContent = `Modo desarrollador: ${state.devMode ? "ON" : "OFF"}`;
      toast(`Modo dev ${state.devMode ? "activado" : "desactivado"}`, "exito", 1200);
    };
    const right = qs(".dash-toolbar .right");
    if (right) right.prepend(devBtn);

    // Cerrar drawer
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
