(() => {
  const setVH = () => {
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight * 0.01}px`
    );
  };
  setVH();
  window.addEventListener("resize", setVH);

  // ---- ENDPOINTS
  const API = {
    cursos:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_cursos.php",
    iCursos:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_cursos.php",
    uCursos:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/u_cursos.php",

    noticias:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_noticia.php",
    uNoticias:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/u_noticia.php",
    comentarios:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_comentario_noticia.php",

    tutores:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_tutor.php",
    prioridad:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_prioridad.php",

    categorias:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_categorias.php",
    calendario:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_dias_curso.php",
    tipoEval:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_tipo_evaluacion.php",
    actividades:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_actividades.php",
  };

  // --- subida de imagen de curso
  const API_UPLOAD = {
    cursoImg:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/u_cursoImg.php",
    // noticiaImg: "https://.../u_noticiaImg.php"
  };

  // ---- ids de usuarios con los permisos de admin
  const ADMIN_IDS = [1, 12, 13];

  // ---- Estado global
  const state = {
    route: "#/cursos",
    page: 1,
    pageSize: 10,
    data: [],
    raw: [],

    tutorsMap: null,
    prioMap: null,
    categoriasMap: null,
    calendarioMap: null,
    tipoEvalMap: null,
    actividadesMap: null,

    currentDrawer: null, // {type:'curso'|'noticia', id:number|null, mode:'view'|'edit'|'create'}
    currentDrawer: null,
    tempNewCourseImage: null,
  };

  let currentUser = null;
  let isAdminUser = false;

  // ---- Helpers
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
  const toast = (msg, tipo = "exito", dur = 2500) =>
    window.gcToast
      ? window.gcToast(msg, tipo, dur)
      : console.log(`[${tipo}] ${msg}`);

  function getUsuarioFromCookie() {
    const c = document.cookie.split("; ").find((r) => r.startsWith("usuario="));
    if (!c) return null;
    try {
      return JSON.parse(decodeURIComponent(c.split("=")[1]));
    } catch {
      return null;
    }
  }

  // -------- Panel de cuenta
  function showCuentaPanel() {
    qs(".recursos-box.desktop-only")?.style &&
      (qs(".recursos-box.desktop-only").style.display = "none");
    qs(".recursos-box.mobile-only")?.style &&
      (qs(".recursos-box.mobile-only").style.display = "none");
    qs("#pagination-controls")?.style &&
      (qs("#pagination-controls").style.display = "none");
    qs("#pagination-mobile")?.style &&
      (qs("#pagination-mobile").style.display = "none");

    if (!qs("#cuenta-panel")) {
      const host = qs(".main-content") || document.body;
      const panel = document.createElement("div");
      panel.id = "cuenta-panel";
      panel.style.padding = "16px 18px";
      panel.innerHTML = window.renderCuentaOpciones
        ? window.renderCuentaOpciones()
        : `<div>Panel de cuenta</div>`;
      host.appendChild(panel);
    }
  }
  function hideCuentaPanel() {
    const panel = qs("#cuenta-panel");
    if (panel) panel.remove();

    const d = qs(".recursos-box.desktop-only");
    const m = qs(".recursos-box.mobile-only");
    if (d) d.style.display = "block";
    if (m) m.style.display = "block";
    const pg = qs("#pagination-controls");
    const pgm = qs("#pagination-mobile");
    if (pg) pg.style.display = "";
    if (pgm) pgm.style.display = "";
  }

  async function postJSON(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // ---- Catálogos
  async function getTutorsMap() {
    if (state.tutorsMap && Date.now() - state.tutorsMap._ts < 30 * 60 * 1000)
      return state.tutorsMap;
    const arr = await postJSON(API.tutores, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach((t) => (map[t.id] = t.nombre));
    map._ts = Date.now();
    state.tutorsMap = map;
    return map;
  }
  async function getPrioridadMap() {
    if (state.prioMap && Date.now() - state.prioMap._ts < 30 * 60 * 1000)
      return state.prioMap;
    const arr = await postJSON(API.prioridad, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach((p) => (map[p.id] = p.nombre));
    map._ts = Date.now();
    state.prioMap = map;
    return map;
  }
  async function getCategoriasMap() {
    if (
      state.categoriasMap &&
      Date.now() - state.categoriasMap._ts < 30 * 60 * 1000
    )
      return state.categoriasMap;
    const arr = await postJSON(API.categorias, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach((c) => (map[c.id] = c.nombre));
    map._ts = Date.now();
    state.categoriasMap = map;
    return map;
  }
  async function getCalendarioMap() {
    if (
      state.calendarioMap &&
      Date.now() - state.calendarioMap._ts < 30 * 60 * 1000
    )
      return state.calendarioMap;
    const arr = await postJSON(API.calendario, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach((c) => (map[c.id] = c.nombre));
    map._ts = Date.now();
    state.calendarioMap = map;
    return map;
  }
  async function getTipoEvalMap() {
    if (
      state.tipoEvalMap &&
      Date.now() - state.tipoEvalMap._ts < 30 * 60 * 1000
    )
      return state.tipoEvalMap;
    const arr = await postJSON(API.tipoEval, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach((c) => (map[c.id] = c.nombre));
    map._ts = Date.now();
    state.tipoEvalMap = map;
    return map;
  }
  async function getActividadesMap() {
    if (
      state.actividadesMap &&
      Date.now() - state.actividadesMap._ts < 30 * 60 * 1000
    )
      return state.actividadesMap;
    const arr = await postJSON(API.actividades, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach((c) => (map[c.id] = c.nombre));
    map._ts = Date.now();
    state.actividadesMap = map;
    return map;
  }

  // ---- Visibilidad por rol
  function isCuentasLink(el) {
    const href = (
      el.getAttribute("href") ||
      el.dataset.route ||
      ""
    ).toLowerCase();
    const txt = (el.textContent || "").toLowerCase();
    return href.includes("#/cuentas") || txt.includes("cuenta");
  }

  function applyAdminVisibility(isAdmin) {
    qsa(".gc-side .nav-item").forEach((a) => {
      if (!isAdmin && !isCuentasLink(a)) {
        (a.closest("li") || a).style.display = "none";
        a.setAttribute("tabindex", "-1");
        a.setAttribute("aria-hidden", "true");
      }
    });
    const addBtn = qs("#btn-add");
    if (addBtn) addBtn.style.display = isAdmin ? "" : "none";
  }

  function enforceRouteGuard() {
    if (!isAdminUser) {
      const h = (window.location.hash || "").toLowerCase();
      if (!h.startsWith("#/cuentas")) {
        if (location.hash !== "#/cuentas") location.hash = "#/cuentas";
      }
    }
  }

  // ---- Route
  function setRoute(hash) {
    const target = hash || (isAdminUser ? "#/cursos" : "#/cuentas");
    if (location.hash !== target) location.hash = target;
    else onRouteChange();
  }
  window.addEventListener("hashchange", onRouteChange);

  function onRouteChange() {
    enforceRouteGuard();

    const hash =
      window.location.hash || (isAdminUser ? "#/cursos" : "#/cuentas");
    state.route = hash;
    state.page = 1;

    qsa(".gc-side .nav-item").forEach((a) => {
      const isActive = a.getAttribute("href") === hash;
      a.classList.toggle("is-active", isActive);
      a.setAttribute("aria-current", isActive ? "page" : "false");
    });

    if (hash.startsWith("#/cursos")) {
      hideCuentaPanel();
      return isAdminUser ? loadCursos() : enforceRouteGuard();
    }
    if (hash.startsWith("#/noticias")) {
      hideCuentaPanel();
      return isAdminUser ? loadNoticias() : enforceRouteGuard();
    }
    if (hash.startsWith("#/cuentas")) {
      showCuentaPanel();
      return;
    }
    return setRoute(isAdminUser ? "#/cursos" : "#/cuentas");
  }

  // ---- Skeletons
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

  // ---- Render listas
  function renderList(rows, config) {
    const d = qs("#recursos-list");
    const m = qs("#recursos-list-mobile");
    if (d) d.innerHTML = "";
    if (m) m.innerHTML = "";

    if (!rows.length) {
      if (d)
        d.innerHTML = `<div class="empty-state" style="padding:1rem;">Sin resultados</div>`;
      if (m)
        m.innerHTML = `<div class="empty-state" style="padding:1rem;">Sin resultados</div>`;
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
    if (countEl)
      countEl.textContent = `${rows.length} ${rows.length === 1 ? "elemento" : "elementos"
        }`;

    // desktop -> drawer
    qsa("#recursos-list .table-row").forEach((el) => {
      el.addEventListener("click", () => {
        const data = el.dataset;
        if (data.type === "noticia") {
          state.currentDrawer = {
            type: "noticia",
            id: Number(data.id),
            mode: "view",
          };
        }
        openDrawer(config.drawerTitle(data), config.drawerBody(data));
        if (data.type === "noticia") {
          const nid = Number(data.id);
          setTimeout(() => {
            mountReadOnlyMedia({
              container: document.getElementById("media-noticia"),
              type: "noticia",
              id: nid,
              labels: ["Imagen 1", "Imagen 2"],
            });
            if (isAdminUser)
              bindCopyFromPre("#json-noticia", "#btn-copy-json-noticia");
          }, 0);
        }
      });
    });

    // acordeón mobile
    qsa("#recursos-list-mobile .row-toggle").forEach((el) => {
      el.addEventListener("click", () =>
        el.closest(".table-row-mobile").classList.toggle("expanded")
      );
    });
    qsa("#recursos-list-mobile .open-drawer").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const data = btn.closest(".table-row-mobile").dataset;
        if (data.type === "noticia") {
          state.currentDrawer = {
            type: "noticia",
            id: Number(data.id),
            mode: "view",
          };
        }
        openDrawer(config.drawerTitle(data), config.drawerBody(data));
        if (data.type === "noticia") {
          const nid = Number(data.id);
          setTimeout(() => {
            mountReadOnlyMedia({
              container: document.getElementById("media-noticia"),
              type: "noticia",
              id: nid,
              labels: ["Imagen 1", "Imagen 2"],
            });
            if (isAdminUser)
              bindCopyFromPre("#json-noticia", "#btn-copy-json-noticia");
          }, 0);
        }
      });
    });

    // Botones Reactivar (lista)
    qsa(".gc-reactivate").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = Number(btn.dataset.id);
        const t = btn.dataset.type;
        try {
          if (t === "curso") {
            await reactivateCurso(id);
            toast("Curso reactivado", "exito");
            await loadCursos();
          } else if (t === "noticia") {
            const ok = await reactivateNoticia(id);
            if (ok) {
              toast("Noticia reactivada", "exito");
              await loadNoticias();
            }
          }
        } catch (err) {
          console.error(err);
          toast("No se pudo reactivar", "error");
        }
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

      for (let p = 1; p <= totalPages && p <= 7; p++) {
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
    if (state.route.startsWith("#/cuentas")) return drawCuentas();
  }

  // ---------- CURSOS ----------
  async function loadCursos() {
    const title = qs("#mod-title");
    if (title) title.textContent = "Cursos";

    const hdr = qs(".recursos-box.desktop-only .table-header");
    if (hdr) {
      const c1 = hdr.querySelector(".col-nombre");
      let c2 =
        hdr.querySelector(".col-tutor") || hdr.querySelector(".col-tipo");
      const c3 = hdr.querySelector(".col-fecha");
      let c4 = hdr.querySelector(".col-status");
      if (c1) c1.textContent = "Nombre";
      if (c2) {
        c2.textContent = "Tutor";
        c2.classList.add("col-tutor");
      }
      if (c3) c3.textContent = "Fecha de inicio";
      if (!c4) {
        c4 = document.createElement("div");
        c4.className = "col-status";
        c4.setAttribute("role", "columnheader");
        c4.textContent = "Status";
        hdr.appendChild(c4);
      } else c4.textContent = "Status";
    }

    const tt = qs(".tt-title");
    if (tt) tt.textContent = "Cursos:";
    const ttStatus = qs("#tt-status");
    if (ttStatus) {
      ttStatus.textContent = "Activos e Inactivos";
      ttStatus.classList.remove("badge-inactivo");
      ttStatus.classList.add("badge-activo");
    }

    showSkeletons();
    try {
      const [activosRaw, inactivosRaw, tmap, pmap, cmap, calmap, temap, ammap] =
        await Promise.all([
          postJSON(API.cursos, { estatus: 1 }),
          postJSON(API.cursos, { estatus: 0 }),
          getTutorsMap(),
          getPrioridadMap(),
          getCategoriasMap(),
          getCalendarioMap(),
          getTipoEvalMap(),
          getActividadesMap(),
        ]);

      const raw = [
        ...(Array.isArray(activosRaw) ? activosRaw : []),
        ...(Array.isArray(inactivosRaw) ? inactivosRaw : []),
      ];

      state.raw = raw;
      state.data = raw.map((c) => ({
        id: c.id,
        nombre: c.nombre,

        tutor: tmap[c.tutor] || `Tutor #${c.tutor}`,
        tutor_id: c.tutor,

        prioridad_id: c.prioridad,
        prioridad_nombre: pmap[c.prioridad] || `#${c.prioridad}`,

        categoria_id: c.categoria,
        categoria_nombre: cmap[c.categoria] || `#${c.categoria}`,

        calendario_id: c.calendario,
        calendario_nombre: calmap[c.calendario] || `#${c.calendario}`,

        tipo_eval_id: c.tipo_evaluacion,
        tipo_eval_nombre: temap[c.tipo_evaluacion] || `#${c.tipo_evaluacion}`,

        actividades_id: c.actividades,
        actividades_nombre: ammap[c.actividades] || `#${c.actividades}`,

        precio: c.precio,
        certificado: !!c.certificado,
        fecha: c.fecha_inicio,
        estatus: Number(c.estatus),
        _all: c,
      }));

      drawCursos();
    } catch (err) {
      const list = qs("#recursos-list");
      if (list)
        list.innerHTML = `<div style="padding:1rem;color:#b00020;">Error al cargar cursos</div>`;
      const m = qs("#recursos-list-mobile");
      if (m) m.innerHTML = "";
      console.error(err);
      toast("No se pudieron cargar cursos", "error");
    }
  }

  function drawCursos() {
    const rows = state.data;
    renderList(rows, {
      desktopRow: (it) => `
      <div class="table-row" data-id="${it.id}" data-type="curso">
        <div class="col-nombre">
          <span class="name-text">${escapeHTML(it.nombre)}</span>
          ${badgePrecio(it.precio)}
        </div>
        <div class="col-tutor">${escapeHTML(it.tutor)}</div>
        <div class="col-fecha">${fmtDate(it.fecha)}</div>
        <div class="col-status">
          ${badgeCurso(it.estatus)}
        </div>
      </div>`,
      mobileRow: (it) => `
      <div class="table-row-mobile" data-id="${it.id}" data-type="curso">
        <button class="row-toggle">
          <div class="col-nombre">${escapeHTML(it.nombre)} ${badgePrecio(
        it.precio
      )}</div>
          <span class="icon-chevron">›</span>
        </button>
        <div class="row-details">
          <div><strong>Tutor:</strong> ${escapeHTML(it.tutor)}</div>
          <div><strong>Inicio:</strong> ${fmtDate(it.fecha)}</div>
          <div><strong>Status:</strong> ${textCursoStatus(it.estatus)}</div>
          <div style="display:flex; gap:8px; margin:.25rem 0 .5rem;">
            <button class="gc-btn gc-btn--ghost open-drawer">Ver detalle</button>
            ${Number(it.estatus) === 0
          ? `<button class="gc-btn gc-btn--success gc-reactivate" data-type="curso" data-id="${it.id}">Reactivar</button>`
          : ""
        }
          </div>
        </div>
      </div>`,
      drawerTitle: (d) => {
        const item = state.data.find((x) => String(x.id) === d.id);
        return item ? `Curso · ${item.nombre}` : "Curso";
      },
      drawerBody: (d) => renderCursoDrawer(d),
    });
  }

  function badgePrecio(precio) {
    return Number(precio) === 0
      ? `<span class="gc-chip gray">Gratuito</span>`
      : `<span class="gc-chip gray">Con costo</span>`;
  }
  function badgeCurso(estatus) {
    return Number(estatus) === 1
      ? `<span class="gc-badge-activo">Activo</span>`
      : `<span class="gc-badge-inactivo">Inactivo</span>`;
  }
  function textCursoStatus(estatus) {
    return Number(estatus) === 1 ? "Activo" : "Inactivo";
  }

  // ---- Drawer Curso (COMPLETO)
  // ---- Drawer Curso (COMPLETO)
  function renderCursoDrawer(dataset) {
    const item = state.data.find((x) => String(x.id) === dataset.id);
    const mode = state.currentDrawer?.mode || (item ? "view" : "create");
    const isCreate = mode === "create" || !item;
    const isEdit = mode === "edit";
    const isView = mode === "view" && !!item;

    const c = isCreate ? getEmptyCourse() : (item ? item._all : null);
    if (!c) return "<p>No encontrado.</p>";

    // helpers de inputs
    const inText = (id, val, ph = "") =>
      `<input id="${id}" type="text" value="${escapeAttr(val || "")}" placeholder="${escapeAttr(ph)}" />`;
    const inNum = (id, val, min = "0") =>
      `<input id="${id}" type="number" value="${escapeAttr(val ?? "")}" min="${min}" />`;
    const inDate = (id, val) =>
      `<input id="${id}" type="date" value="${escapeAttr(val || "")}" />`;
    const inCheck = (id, val) =>
      `<label class="gc-inline"><input id="${id}" type="checkbox" ${Number(val) ? "checked" : ""}/> <span>Sí</span></label>`;
    const inSel = (id, opts) => `<select id="${id}">${opts}</select>`;
    const inTA = (id, val, rows = 4) =>
      `<textarea id="${id}" rows="${rows}">${escapeHTML(val || "")}</textarea>`;

    // opciones de catálogos
    const tutorOptions = mapToOptions(state.tutorsMap, String(c.tutor || ""));
    const prioOptions = mapToOptions(state.prioMap, String(c.prioridad || ""));
    const catOptions = mapToOptions(state.categoriasMap, String(c.categoria || ""));
    const calOptions = mapToOptions(state.calendarioMap, String(c.calendario || ""));
    const tipoOptions = mapToOptions(state.tipoEvalMap, String(c.tipo_evaluacion || ""));
    const actOptions = mapToOptions(state.actividadesMap, String(c.actividades || ""));

    // field wrapper
    const field = (label, value, inputHTML) => `
    <div class="field">
      <div class="label">${escapeHTML(label)}</div>
      <div class="value">${(isEdit || isCreate) ? inputHTML : escapeHTML(value ?? "-")}</div>
    </div>`;

    // barra de acciones
    let controlsRow = "";
    if (isCreate) {
      controlsRow = `
      <div class="gc-actions">
        <button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button>
        <button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button>
      </div>`;
    } else if (isAdminUser) {
      const isInactive = Number(c.estatus) === 0;
      controlsRow = `
      <div class="gc-actions">
        ${isView ? `<button class="gc-btn" id="btn-edit">Editar</button>` : ""}
        ${isEdit ? `<button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button>` : ""}
        ${isEdit ? `<button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button>` : ""}
        ${!isCreate ? `<button class="gc-btn gc-btn--danger" id="btn-delete" data-step="1">Eliminar</button>` : ""}
        ${isInactive ? `<button class="gc-btn gc-btn--success" id="btn-reactivar">Reactivar</button>` : ""}
      </div>`;
    }

    // HTML del drawer (SIEMPRE completo)
    let html = `
    ${controlsRow}

    ${field("Nombre", c.nombre, inText("f_nombre", c.nombre, "Nombre del curso"))}
    ${field("Descripción breve", c.descripcion_breve, inTA("f_desc_breve", c.descripcion_breve, 3))}
    ${field("Descripción media", c.descripcion_media, inTA("f_desc_media", c.descripcion_media, 4))}
    ${field("Descripción del curso", c.descripcion_curso, inTA("f_desc_curso", c.descripcion_curso, 6))}
    ${field("Dirigido a", c.dirigido, inTA("f_dirigido", c.dirigido, 3))}
    ${field("Competencias", c.competencias, inTA("f_competencias", c.competencias, 3))}

    <div class="grid-3">
      ${field("Tutor", state.tutorsMap?.[c.tutor] || c.tutor, inSel("f_tutor", tutorOptions))}
      ${field("Categoría", state.categoriasMap?.[c.categoria] || c.categoria, inSel("f_categoria", catOptions))}
      ${field("Prioridad", state.prioMap?.[c.prioridad] || c.prioridad, inSel("f_prioridad", prioOptions))}
    </div>

    <div class="grid-3">
      ${field("Tipo de evaluación", state.tipoEvalMap?.[c.tipo_evaluacion] || c.tipo_evaluacion, inSel("f_tipo_eval", tipoOptions))}
      ${field("Actividades", state.actividadesMap?.[c.actividades] || c.actividades, inSel("f_actividades", actOptions))}
      ${field("Calendario", state.calendarioMap?.[c.calendario] || c.calendario, inSel("f_calendario", calOptions))}
    </div>

    <div class="grid-3">
      ${field("Horas", c.horas, inNum("f_horas", c.horas ?? 0))}
      ${field("Precio", (c.precio === 0 ? "Gratuito" : fmtMoney(c.precio)), inNum("f_precio", c.precio ?? 0))}
      ${field("Certificado", (Number(c.certificado) ? "Sí" : "No"), inCheck("f_certificado", c.certificado))}
    </div>

    ${field("Fecha de inicio", c.fecha_inicio, inDate("f_fecha", c.fecha_inicio))}
  `;

    // --- Imagen del curso (crear = card con lápiz + modal; editar/ver = input + media-grid)
    if (isCreate) {
      html += `
      <div class="field">
        <div class="label">Imagen del curso</div>
        <div class="value">
          <div id="create-media-curso" class="media-grid">
            <div class="media-card">
              <figure class="media-thumb">
                <img id="create-media-thumb" alt="Portada" src="${withBust('/ASSETS/cursos/img0.png')}" />
                <button class="icon-btn media-edit" id="create-media-edit" title="Seleccionar imagen">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.0 1.0 0 0 0 0-1.41l-2.34-2.34a1.0 1.0 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"></path>
                  </svg>
                </button>
              </figure>
              <div class="media-meta">
                <div class="media-label">Portada</div>
                <div class="media-help" style="color:#666;">JPG/PNG · Máx 2MB</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    } else {
      html += `
      <div class="field">
        <div class="label">Imagen del curso</div>
        <div class="value">
          <div class="img-uploader">
            <input id="f_curso_img" type="file" accept="image/png, image/jpeg" />
            <div id="f_curso_img_hint" class="gc-muted" style="margin-top:.25rem;">Formatos: JPG/PNG · Máx 2MB</div>
            <div id="f_curso_img_preview" style="margin-top:.5rem;display:none;">
              <img alt="Vista previa" style="max-width:100%;max-height:220px;border:1px solid #eee;border-radius:8px;object-fit:contain;">
            </div>
            ${isEdit ? `<button class="gc-btn" id="btn-upload-now" style="margin-top:.5rem;">Subir ahora</button>` : ""}
          </div>
        </div>
      </div>

      <div class="field">
        <div class="label">Imágenes existentes</div>
        <div class="value"><div id="media-curso" data-id="${c.id ?? item?.id ?? ""}"></div></div>
      </div>
    `;
    }

    if (isAdminUser) {
      html += jsonSection(c, "JSON · Curso", "json-curso", "btn-copy-json-curso");
    }

    if (isCreate) {
      qs("#drawer-title").textContent = "Curso · Crear";
      state.currentDrawer = { type: "curso", id: null, mode: "create" };
    } else if (isEdit) {
      qs("#drawer-title").textContent = `Curso · ${item?.nombre || ""} (edición)`;
      state.currentDrawer = { type: "curso", id: item?.id ?? null, mode: "edit" };
    } else {
      qs("#drawer-title").textContent = `Curso · ${item?.nombre || ""}`;
      state.currentDrawer = { type: "curso", id: item?.id ?? null, mode: "view" };
    }

    // bindings
    setTimeout(() => {
      disableDrawerInputs(!(isEdit || isCreate));

      // ---------- Crear: lápiz + modal de preview (usa renderPreviewUI)
      if (isCreate) {
        const card = document.getElementById("create-media-curso");
        const btnEdit = document.getElementById("create-media-edit");
        const thumb = document.getElementById("create-media-thumb");
        if (btnEdit && thumb && card) {
          btnEdit.addEventListener("click", () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/png, image/jpeg";
            input.style.display = "none";
            document.body.appendChild(input);

            input.addEventListener("change", () => {
              const file = input.files && input.files[0];
              document.body.removeChild(input);
              if (!file) return;

              const v = validarImagen(file, { maxMB: 2 });
              if (!v.ok) { toast(v.error, "error"); return; }

              renderPreviewUI(
                card,
                file,
                async () => {
                  // Confirmado -> buffer + preview
                  state.tempNewCourseImage = file;
                  try { URL.revokeObjectURL(thumb.dataset.blobUrl || ""); } catch { }
                  const blobUrl = URL.createObjectURL(file);
                  thumb.dataset.blobUrl = blobUrl;
                  thumb.src = blobUrl;
                  toast("Imagen seleccionada (se subirá al guardar)", "exito");
                },
                () => { }
              );
            });

            input.click();
          });
        }
      }

      // ---------- Editar: input clásico + preview + subir ahora
      const fileInput = qs("#f_curso_img");
      const prevBox = qs("#f_curso_img_preview");
      const prevImg = prevBox?.querySelector("img");
      if (fileInput && prevBox && prevImg) {
        fileInput.addEventListener("change", () => {
          const f = fileInput.files?.[0];
          if (!f) { prevBox.style.display = "none"; return; }
          const v = validarImagen(f, { maxMB: 2 });
          if (!v.ok) { toast(v.error, "error"); prevBox.style.display = "none"; fileInput.value = ""; return; }
          const url = URL.createObjectURL(f);
          prevImg.src = url;
          prevBox.style.display = "";
        });
      }

      // subir en edición inmediata
      qs("#btn-upload-now")?.addEventListener("click", async (e) => {
        e.preventDefault();
        const f = qs("#f_curso_img")?.files?.[0];
        if (!f) return toast("Selecciona un archivo primero", "warning");
        const itemId = item?.id;
        if (!itemId) return toast("No hay ID de curso", "error");
        try {
          await uploadCursoImagen(itemId, f);
          const contCurso = document.getElementById("media-curso");
          if (contCurso) mountReadOnlyMedia({
            container: contCurso,
            type: "curso",
            id: itemId,
            labels: ["Portada"],
            editable: isEdit && isAdminUser,
          });
          toast("Imagen subida", "exito");
        } catch (err) {
          console.error(err);
          toast("No se pudo subir la imagen", "error");
        }
      });

      // helper local para subir imagen (se usa en crear y en editar)
      async function uploadCursoImagen(cursoId, file) {
        if (!API_UPLOAD?.cursoImg) throw new Error("API_UPLOAD.cursoImg no configurado");
        const v = validarImagen(file, { maxMB: 2 });
        if (!v.ok) throw new Error(v.error);

        const fd = new FormData();
        fd.append("curso_id", String(cursoId));
        fd.append("imagen", file);

        const res = await fetch(API_UPLOAD.cursoImg, { method: "POST", body: fd });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json?.error) {
          throw new Error(json?.error || `HTTP ${res.status}`);
        }
        return json; // { url: ".../img10.png" }
      }

      // ---------- Acciones
      qs("#btn-save")?.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          if (isCreate) await saveNewCurso();  // usa state.tempNewCourseImage internamente
          else await saveUpdateCurso(item);
        } catch (err) {
          console.error(err);
          toast("Error al guardar", "error");
        }
      });

      qs("#btn-edit")?.addEventListener("click", (e) => {
        e.stopPropagation();
        state.currentDrawer = { type: "curso", id: item?.id ?? null, mode: "edit" };
        qs("#drawer-body").innerHTML = renderCursoDrawer({ id: String(item?.id ?? "") });
      });

      qs("#btn-cancel")?.addEventListener("click", (e) => {
        e.stopPropagation();
        if (isCreate) {
          state.tempNewCourseImage = null; // limpiar buffer si se cancela crear
          closeDrawer();
        } else {
          state.currentDrawer = { type: "curso", id: item?.id ?? null, mode: "view" };
          qs("#drawer-body").innerHTML = renderCursoDrawer({ id: String(item?.id ?? "") });
        }
      });

      const bDel = qs("#btn-delete");
      if (bDel)
        bDel.addEventListener("click", async (e) => {
          e.stopPropagation();
          const step = bDel.dataset.step || "1";
          if (step === "1") {
            bDel.textContent = "Confirmar";
            bDel.dataset.step = "2";
            setTimeout(() => {
              if (bDel.dataset.step === "2") { bDel.textContent = "Eliminar"; bDel.dataset.step = "1"; }
            }, 4000);
            return;
          }
          try {
            await softDeleteCurso(item);
            toast("Curso eliminado (inactivo)", "exito");
            closeDrawer();
            await loadCursos();
          } catch (err) {
            console.error(err);
            toast("No se pudo eliminar", "error");
          }
        });

      qs("#btn-reactivar")?.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          await reactivateCurso(Number(item?.id));
          toast("Curso reactivado", "exito");
          await loadCursos();
          const re = state.data.find((x) => x.id === item.id);
          if (re) openDrawer(`Curso · ${re.nombre}`, renderCursoDrawer({ id: String(re.id) }));
        } catch (err) {
          console.error(err);
          toast("No se pudo reactivar", "error");
        }
      });

      // montar media existente (solo si hay id)
      const contCurso = document.getElementById("media-curso");
      if (contCurso) {
        const cid = Number(c.id ?? item?.id);
        if (!Number.isNaN(cid) && cid) {
          mountReadOnlyMedia({
            container: contCurso,
            type: "curso",
            id: cid,
            labels: ["Portada"],
            editable: isEdit && isAdminUser,
          });
        } else if (!isCreate) {
          contCurso.innerHTML = `
          <div class="media-head">
            <div class="media-title">Imágenes</div>
            <div class="media-help" style="color:#666;">Se habilita tras crear el curso</div>
          </div>`;
        }
      }

      if (isAdminUser) bindCopyFromPre("#json-curso", "#btn-copy-json-curso");
    }, 0);

    return html;
  }


  function disableDrawerInputs(disabled) {
    qsa(
      "#drawer-body input, #drawer-body select, #drawer-body textarea"
    ).forEach((el) => {
      el.disabled = disabled;
    });
  }

  function getEmptyCourse() {
    return {
      nombre: "",
      descripcion_breve: "",
      descripcion_curso: "",
      descripcion_media: "",
      dirigido: "",
      competencias: "",
      certificado: 0,
      tutor: "",
      horas: 0,
      precio: 0,
      estatus: 1,
      fecha_inicio: "",
      prioridad: 1,
      categoria: 1,
      calendario: 1,
      tipo_evaluacion: 1,
      actividades: 1,
      creado_por: Number(currentUser?.id || 0) || 1,
    };
  }

  function mapToOptions(map, selectedId) {
    const pairs = Object.entries(map || {});
    const clean = pairs.filter(([k]) => k !== "_ts");
    if (!clean.length) return `<option value="">—</option>`;
    return clean
      .map(
        ([id, name]) =>
          `<option value="${escapeAttr(id)}" ${String(selectedId) === String(id) ? "selected" : ""
          }>${escapeHTML(name)}</option>`
      )
      .join("");
  }

  function readCursoForm(existingId = null) {
    const read = (id) => qs(`#${id}`)?.value ?? "";
    const readN = (id, def = 0) => Number(qs(`#${id}`)?.value ?? def);
    const readCh = (id) => (qs(`#${id}`)?.checked ? 1 : 0);

    const payload = {
      nombre: read("f_nombre"),
      descripcion_breve: read("f_desc_breve"),
      descripcion_curso: read("f_desc_curso"),
      descripcion_media: read("f_desc_media"),
      dirigido: read("f_dirigido"),
      competencias: read("f_competencias"),

      certificado: readCh("f_certificado"),
      tutor: readN("f_tutor", 0),
      horas: readN("f_horas", 0),

      precio: readN("f_precio", 0),
      estatus: 1,
      fecha_inicio: read("f_fecha"),
      prioridad: readN("f_prioridad", 1),
      categoria: readN("f_categoria", 1),
      calendario: readN("f_calendario", 1),
      tipo_evaluacion: readN("f_tipo_eval", 1),
      actividades: readN("f_actividades", 1),
      creado_por: Number(currentUser?.id || 0) || 1,
    };
    if (existingId != null) payload.id = Number(existingId);
    return payload;
  }

  // 👉 Helper global para subir imagen (usable en crear/editar)
  async function uploadCursoImagen(cursoId, file) {
    if (!API_UPLOAD?.cursoImg) throw new Error("API_UPLOAD.cursoImg no configurado");
    const v = validarImagen(file, { maxMB: 2 });
    if (!v.ok) throw new Error(v.error);

    const fd = new FormData();
    fd.append("curso_id", String(cursoId));
    fd.append("imagen", file);

    const res = await fetch(API_UPLOAD.cursoImg, { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.error) {
      throw new Error(json?.error || `HTTP ${res.status}`);
    }
    return json; // { url: ".../img10.png" } opcional
  }

  // Crear curso + (opcional) subir imagen
  async function saveNewCurso() {
    const payload = readCursoForm(null);

    if (!payload.nombre) return toast("Falta el nombre", "warning");
    if (!payload.tutor) return toast("Selecciona tutor", "warning");
    if (!payload.categoria) return toast("Selecciona categoría", "warning");
    if (!payload.fecha_inicio) return toast("Fecha de inicio requerida", "warning");

    const res = await postJSON(API.iCursos, payload);

    const newId = Number(
      res?.id ??
      res?.curso_id ??
      res?.insert_id ??
      res?.data?.id ??
      0
    );

    if (!newId) {
      console.warn("Respuesta de iCursos sin id utilizable:", res);
      toast("Curso creado, pero no se recibió ID", "warning");
    }

    // subir imagen si se seleccionó
    const fileToUpload = state.tempNewCourseImage || null;
    if (newId && fileToUpload) {
      try {
        await uploadCursoImagen(newId, fileToUpload);
        toast("Imagen subida", "exito");
      } catch (err) {
        console.error(err);
        toast("Curso creado, pero falló la subida de imagen", "error");
      } finally {
        state.tempNewCourseImage = null; // limpiar buffer
      }
    }

    toast("Curso creado", "exito");
    closeDrawer();
    await loadCursos();

    if (newId) {
      const re = state.data.find((x) => x.id === newId);
      if (re) openDrawer(`Curso · ${re.nombre}`, renderCursoDrawer({ id: String(re.id) }));
    }
  }

  // Actualizar curso + (opcional) subir imagen si hay archivo seleccionado
  async function saveUpdateCurso(item) {
    if (!item || !item._all) return toast("Sin item para actualizar", "error");
    const payload = readCursoForm(item.id);
    await postJSON(API.uCursos, payload);

    // Si el usuario eligió un archivo, súbelo junto con la actualización
    const f = qs("#f_curso_img")?.files?.[0];
    if (f) {
      try {
        await uploadCursoImagen(item.id, f);
        toast("Imagen actualizada", "exito");
      } catch (err) {
        console.error(err);
        toast("Se guardó el curso, pero falló la imagen", "error");
      }
    }

    toast("Cambios guardados", "exito");
    await loadCursos();
    const re = state.data.find((x) => x.id === item.id);
    if (re)
      openDrawer(
        `Curso · ${re.nombre}`,
        renderCursoDrawer({ id: String(re.id) })
      );
  }

  async function softDeleteCurso(item) {
    if (!item || !item._all) throw new Error("Item inválido");
    const base = { ...item._all, estatus: 0 };
    await postJSON(API.uCursos, base);
  }

  async function reactivateCurso(id) {
    const it = state.data.find((x) => x.id === Number(id));
    if (!it || !it._all) throw new Error("Curso no encontrado");
    const body = { ...it._all, estatus: 1 };
    await postJSON(API.uCursos, body);
  }

  // ---------- NOTICIAS ----------
  async function loadNoticias() {
    const title = qs("#mod-title");
    if (title) title.textContent = "Noticias";

    const hdr = qs(".recursos-box.desktop-only .table-header");
    if (hdr) {
      const c1 = hdr.querySelector(".col-nombre");
      let c2 =
        hdr.querySelector(".col-tutor") || hdr.querySelector(".col-tipo");
      const c3 = hdr.querySelector(".col-fecha");
      const c4 = hdr.querySelector(".col-status");
      if (c1) c1.textContent = "Título";
      if (c2) {
        c2.textContent = "Comentarios";
        c2.classList.add("col-tipo");
      }
      if (c3) c3.textContent = "Fecha de publicación";
      if (c4) c4.textContent = "Status";
    }

    const tt = qs(".tt-title");
    if (tt) tt.textContent = "Noticias:";
    const ttStatus = qs("#tt-status");
    if (ttStatus) {
      ttStatus.textContent = "Publicadas e Inactivas";
      ttStatus.classList.remove("badge-inactivo");
      ttStatus.classList.add("badge-activo");
    }

    showSkeletons();
    try {
      const [activasRaw, inactivasRaw] = await Promise.all([
        postJSON(API.noticias, { estatus: 1 }),
        postJSON(API.noticias, { estatus: 0 }),
      ]);

      const arr = [
        ...(Array.isArray(activasRaw) ? activasRaw : []),
        ...(Array.isArray(inactivasRaw) ? inactivasRaw : []),
      ];

      const counts = await Promise.all(
        arr.map((n) => getCommentsCount(n.id).catch(() => 0))
      );

      state.raw = arr;
      state.data = arr.map((n, i) => ({
        id: n.id,
        titulo: n.titulo,
        fecha: n.fecha_creacion,
        estatus: Number(n.estatus),
        comentarios: counts[i] || 0,
        _all: n,
      }));

      drawNoticias();
    } catch (err) {
      const list = qs("#recursos-list");
      if (list)
        list.innerHTML = `<div style="padding:1rem;color:#b00020;">Error al cargar noticias</div>`;
      const m = qs("#recursos-list-mobile");
      if (m) m.innerHTML = "";
      console.error(err);
      toast("No se pudieron cargar noticias", "error");
    }
  }

  async function getCommentsCount(noticiaId) {
    const res = await postJSON(API.comentarios, {
      noticia_id: Number(noticiaId),
      estatus: 1,
    });
    const arr = Array.isArray(res) ? res : [];
    let total = 0;
    for (const c of arr) {
      total += 1;
      if (Array.isArray(c.respuestas)) total += c.respuestas.length;
    }
    return total;
  }

  function drawNoticias() {
    const rows = state.data;
    renderList(rows, {
      desktopRow: (it) => `
        <div class="table-row" data-id="${it.id}" data-type="noticia">
          <div class="col-nombre">
            <span class="name-text">${escapeHTML(it.titulo)}</span>
          </div>
          <div class="col-tutor">${it.comentarios}</div>
          <div class="col-fecha">${fmtDateTime(it.fecha)}</div>
          <div class="col-status">
            ${badgeNoticia(it.estatus)}
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
            <div><strong>Publicada:</strong> ${fmtDateTime(it.fecha)}</div>
            <div style="display:flex; gap:8px; margin:.25rem 0 .5rem;">
              <button class="gc-btn gc-btn--ghost open-drawer">Ver detalle</button>
              ${Number(it.estatus) === 0
          ? `<button class="gc-btn gc-btn--success gc-reactivate" data-type="noticia" data-id="${it.id}">Reactivar</button>`
          : ""
        }
            </div>
          </div>
        </div>`,
      drawerTitle: (d) => {
        const item = state.data.find((x) => String(x.id) === d.id);
        return item ? `Noticia · ${item.titulo}` : "Noticia";
      },
      drawerBody: (d) => renderNoticiaDrawer(d),
    });
  }

  function badgeNoticia(estatus) {
    return Number(estatus) === 1
      ? `<span class="gc-badge-activo">Publicada</span>`
      : `<span class="gc-badge-inactivo">Inactiva</span>`;
  }

  async function inactivateNoticia(id) {
    const it = state.data.find((x) => x.id === Number(id));
    if (!it || !it._all) throw new Error("Noticia no encontrada");
    if (!API.uNoticias) throw new Error("Endpoint u_noticia no configurado");
    const body = { ...it._all, estatus: 0 };
    await postJSON(API.uNoticias, body);
  }

  async function reactivateNoticia(id) {
    const it = state.data.find((x) => x.id === Number(id));
    if (!it || !it._all) throw new Error("Noticia no encontrada");
    if (!API.uNoticias) {
      toast("Falta endpoint u_noticia.php en backend", "warning", 3500);
      return false;
    }
    const body = { ...it._all, estatus: 1 };
    await postJSON(API.uNoticias, body);
    return true;
  }

  // ---- Drawer Noticia
  function renderNoticiaDrawer(dataset) {
    const item = state.data.find((x) => String(x.id) === dataset.id);
    const n = item?._all;
    if (!n) return "<p>No encontrado.</p>";

    const mode =
      state.currentDrawer?.type === "noticia" &&
        state.currentDrawer?.id === n.id
        ? state.currentDrawer.mode
        : "view";
    const isEdit = mode === "edit";
    const isView = !isEdit;
    const isInactive = Number(n.estatus) === 0;

    const controlsRow = isAdminUser
      ? `
        <div class="gc-actions">
          ${isView ? `<button class="gc-btn" id="btn-edit">Editar</button>` : ""}
          ${isEdit ? `<button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button>` : ""}
          ${isEdit ? `<button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button>` : ""}
          ${isInactive
        ? `<button class="gc-btn gc-btn--success" id="btn-reactivar">Reactivar</button>`
        : `<button class="gc-btn gc-btn--danger" id="btn-delete" data-step="1">Eliminar</button>`
      }
        </div>`
      : "";

    let html = `
      ${controlsRow}

      ${pair("Título", n.titulo)}
      ${pair("Estado", Number(n.estatus) === 1 ? "Publicada" : "Inactiva")}
      ${pair("Fecha publicación", fmtDateTime(n.fecha_creacion))}
      ${pair("Descripción (1)", n.desc_uno)}
      ${pair("Descripción (2)", n.desc_dos)}
      ${pair("Creado por", n.creado_por)}

      <div class="field">
        <div class="label">Imágenes</div>
        <div class="value"><div id="media-noticia" data-id="${n.id}"></div></div>
      </div>
    `;

    if (isAdminUser) {
      html += jsonSection(
        n,
        "JSON · Noticia",
        "json-noticia",
        "btn-copy-json-noticia"
      );
    }

    if (isEdit) {
      qs("#drawer-title").textContent = `Noticia · ${item?.titulo || ""} (edición)`;
      state.currentDrawer = { type: "noticia", id: n.id, mode: "edit" };
    } else {
      qs("#drawer-title").textContent = `Noticia · ${item?.titulo || ""}`;
      state.currentDrawer = { type: "noticia", id: n.id, mode: "view" };
    }

    // Bind acciones
    setTimeout(() => {
      qs("#btn-edit")?.addEventListener("click", (e) => {
        e.stopPropagation();
        state.currentDrawer = { type: "noticia", id: n.id, mode: "edit" };
        qs("#drawer-body").innerHTML = renderNoticiaDrawer({ id: String(n.id) });
      });

      qs("#btn-cancel")?.addEventListener("click", (e) => {
        e.stopPropagation();
        state.currentDrawer = { type: "noticia", id: n.id, mode: "view" };
        qs("#drawer-body").innerHTML = renderNoticiaDrawer({ id: String(n.id) });
      });

      qs("#btn-save")?.addEventListener("click", async (e) => {
        e.stopPropagation();
        toast("Cambios guardados", "exito");
        state.currentDrawer = { type: "noticia", id: n.id, mode: "view" };
        await loadNoticias();
        const re = state.data.find((x) => x.id === n.id);
        if (re)
          openDrawer(`Noticia · ${re.titulo}`, renderNoticiaDrawer({ id: String(re.id) }));
      });

      const bDel = qs("#btn-delete");
      if (bDel)
        bDel.addEventListener("click", async (e) => {
          e.stopPropagation();
          const step = bDel.dataset.step || "1";
          if (step === "1") {
            bDel.textContent = "Confirmar";
            bDel.dataset.step = "2";
            setTimeout(() => {
              if (bDel.dataset.step === "2") {
                bDel.textContent = "Eliminar";
                bDel.dataset.step = "1";
              }
            }, 4000);
            return;
          }
          try {
            await inactivateNoticia(n.id);
            toast("Noticia eliminada (inactiva)", "exito");
            closeDrawer();
            await loadNoticias();
          } catch (err) {
            console.error(err);
            toast("No se pudo eliminar", "error");
          }
        });

      qs("#btn-reactivar")?.addEventListener("click", async (e) => {
        e.stopPropagation();
        const ok = await reactivateNoticia(n.id);
        if (ok) {
          toast("Noticia reactivada", "exito");
          await loadNoticias();
          const re = state.data.find((x) => x.id === n.id);
          if (re)
            openDrawer(`Noticia · ${re.titulo}`, renderNoticiaDrawer({ id: String(re.id) }));
        }
      });

      disableDrawerInputs(!isEdit);
    }, 0);

    return html;
  }

  // ---------- CUENTAS ----------
  function drawCuentas() {
    const title = qs("#mod-title");
    if (title) title.textContent = "Cuenta";

    const tt = qs(".tt-title");
    if (tt) tt.textContent = "Cuentas:";
    const ttStatus = qs("#tt-status");
    if (ttStatus) {
      ttStatus.textContent = "Disponible";
      ttStatus.classList.remove("badge-inactivo");
      ttStatus.classList.add("badge-activo");
    }

    const desktopTable = qs(".recursos-table");
    const mobileTable = qs(".recursos-table-mobile");
    if (desktopTable) desktopTable.style.display = "none";
    if (mobileTable) mobileTable.style.display = "none";

    const d = qs("#recursos-list");
    const m = qs("#recursos-list-mobile");
    if (d) d.innerHTML = "";
    if (m) m.innerHTML = "";

    const host = qs(".recursos-box");
    if (!host) return;

    let mount = document.getElementById("cuenta-menu");
    if (!mount) {
      mount = document.createElement("div");
      mount.id = "cuenta-menu";
      host.appendChild(mount);
    }

    mount.innerHTML = `
    <div class="gc-card-grid" style="margin:12px 0 20px;">
      <div class="gc-card">
        <img src="/ASSETS/admin/cuentaMenu/borrarCuenta.png" alt="" width="28" height="28">
        <div>
          <div class="gc-card-title">Borrar cuenta</div>
          <div class="gc-muted">Esta acción eliminará tu cuenta y todos sus datos de forma permanente.</div>
        </div>
        <button id="btn-delete-account" class="gc-btn gc-btn--danger gc-card-cta">Eliminar cuenta</button>
      </div>

      <div class="gc-card">
        <img src="/ASSETS/admin/cuentaMenu/opcionesPrivacidad.png" alt="" width="28" height="28">
        <div>
          <div class="gc-card-title">Opciones de privacidad / Visibilidad</div>
          <div class="gc-muted">Configura quién puede ver tu perfil y actividad.</div>
        </div>
        <button id="btn-privacy" class="gc-btn gc-btn--primary gc-card-cta">Abrir</button>
      </div>

      <div class="gc-card">
        <img src="/ASSETS/admin/cuentaMenu/notificaciones.png" alt="" width="28" height="28">
        <div>
          <div class="gc-card-title">Notificaciones / Preferencias</div>
          <div class="gc-muted">Gestiona alertas dentro de la app, correos y push.</div>
        </div>
        <button id="btn-notifications" class="gc-btn gc-btn--primary gc-card-cta">Abrir</button>
      </div>

      <div class="gc-card">
        <img src="/ASSETS/admin/cuenta/shield.png" alt="" width="28" height="28">
        <div>
          <div class="gc-card-title">Ajustes de privacidad o configuraciones</div>
          <div class="gc-muted">Ajusta visibilidad de datos y preferencias.</div>
        </div>
        <button id="btn-privacy-toggles" class="gc-btn gc-btn--ghost gc-card-cta">Abrir</button>
      </div>

      <div class="gc-card">
        <img src="/ASSETS/admin/cuenta/switch.png" alt="" width="28" height="28">
        <div>
          <div class="gc-card-title">Cambiar de cuenta</div>
          <div class="gc-muted">Cambia entre perfiles sin cerrar sesión.</div>
        </div>
        <button id="btn-switch-account" class="gc-btn gc-btn--ghost gc-card-cta">Cambiar</button>
      </div>
    </div>
  `;

    const pag1 = qs("#pagination-controls");
    const pag2 = qs("#pagination-mobile");
    if (pag1) pag1.innerHTML = "";
    if (pag2) pag2.innerHTML = "";

    const safeOpen = (fnName) => {
      const fn = window[fnName];
      if (typeof fn === "function") fn();
      else toast("Modal no disponible aún", "warning");
    };

    mount
      .querySelector("#btn-delete-account")
      ?.addEventListener("click", () => safeOpen("openModalDeleteAccount"));
    mount
      .querySelector("#btn-privacy")
      ?.addEventListener("click", () => safeOpen("openModalPrivacy"));
    mount
      .querySelector("#btn-notifications")
      ?.addEventListener("click", () => safeOpen("openModalNotifications"));
    mount
      .querySelector("#btn-privacy-toggles")
      ?.addEventListener("click", () => safeOpen("openModalPrivacyToggles"));
    mount
      .querySelector("#btn-switch-account")
      ?.addEventListener("click", () => safeOpen("openModalSwitchAccount"));
  }

  // ---------- Drawer base ----------
  function openDrawer(title, bodyHTML) {
    const overlay = qs("#gc-dash-overlay");
    if (overlay) overlay.classList.add("open");

    const drawer = qs("#gc-drawer");
    if (!drawer) return;
    qs("#drawer-title").textContent = title || "Detalle";
    qs("#drawer-body").innerHTML = bodyHTML || "";
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
    state.currentDrawer = null;
  }

  // ---------- Helpers UI/format ----------
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
  function escapeAttr(str) {
    return String(str ?? "").replace(/"/g, "&quot;");
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
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(n);
    } catch {
      return `$${n}`;
    }
  }
  function pair(label, val) {
    return `<div class="field"><div class="label">${escapeHTML(
      label
    )}</div><div class="value">${escapeHTML(val ?? "-")}</div></div>`;
  }

  function withBust(url) {
    try {
      const u = new URL(url, window.location.origin);
      u.searchParams.set("v", Date.now());
      return u.pathname + "?" + u.searchParams.toString();
    } catch {
      return url + (url.includes("?") ? "&" : "?") + "v=" + Date.now();
    }
  }

  function noImageSvg() {
    return `
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'>
        <rect width='100%' height='100%' fill='#f3f3f3'/>
        <path d='M20 70 L60 35 L95 65 L120 50 L140 70' stroke='#c9c9c9' stroke-width='4' fill='none'/>
        <circle cx='52' cy='30' r='8' fill='#c9c9c9'/>
      </svg>`;
  }

  function mediaUrlsByType(type, id) {
    const nid = Number(id);
    if (type === "noticia") {
      return [
        `/ASSETS/noticia/NoticiasImg/noticia_img1_${nid}.png`,
        `/ASSETS/noticia/NoticiasImg/noticia_img2_${nid}.png`,
      ];
    }
    if (type === "curso") {
      return [`/ASSETS/cursos/img${nid}.png`];
    }
    return [];
  }

  // ---- Sección JSON
  function jsonSection(obj, title, preId, btnId) {
    const safe = escapeHTML(JSON.stringify(obj ?? {}, null, 2));
    return `
      <details class="dev-json" open style="margin-top:16px;">
        <summary style="cursor:pointer; font-weight:600;">${escapeHTML(
      title
    )}</summary>
        <div style="display:flex;gap:.5rem;margin:.5rem 0;">
          <button class="gc-btn" id="${btnId}">Copiar JSON</button>
        </div>
        <pre id="${preId}" class="value" style="white-space:pre-wrap;max-height:260px;overflow:auto;">${safe}</pre>
      </details>
    `;
  }

  function bindCopyFromPre(preSel, btnSel) {
    const btn = qs(btnSel);
    const pre = qs(preSel);
    if (!btn || !pre) return;
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const text = pre.textContent || "";
      if (!text) return toast("No hay JSON para copiar", "warning");
      try {
        await copyText(text);
        toast("JSON copiado", "exito");
      } catch {
        try {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          toast("JSON copiado", "exito");
        } catch {
          alert("No se pudo copiar");
        }
      }
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return Promise.reject(new Error("Clipboard API no disponible"));
  }

  // ---- Validación de imagen
  function validarImagen(file, { maxMB = 2 } = {}) {
    if (!file) return { ok: false, error: "No se seleccionó archivo" };
    const allowed = ["image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      return { ok: false, error: "Formato no permitido. Solo JPG o PNG" };
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxMB) {
      return { ok: false, error: `La imagen excede ${maxMB}MB` };
    }
    return { ok: true };
  }

  function humanSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  // ---- Modal / preview de imagen (para media grid)
  function renderPreviewUI(cardEl, file, onConfirm, onCancel) {
    const url = URL.createObjectURL(file);

    const drawer = document.getElementById("gc-drawer");
    const drawerOverlay = document.getElementById("gc-dash-overlay");
    const prev = {
      drawerPE: drawer?.style.pointerEvents,
      drawerFilter: drawer?.style.filter,
      drawerZ: drawer?.style.zIndex,
      overlayZ: drawerOverlay?.style.zIndex,
      drawerAria: drawer?.getAttribute("aria-hidden"),
      hadInert: !!drawer?.hasAttribute?.("inert"),
    };

    const lockScroll = () => {
      document.body.style.overflow = "hidden";
    };

    const overlay = document.createElement("div");
    overlay.className = "gc-preview-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.style.cssText = `
      position: fixed; inset: 0;
      z-index: 99999;
      display: flex; align-items: center; justify-content: center;
      background: rgba(17,24,39,.55);
      backdrop-filter: saturate(120%) blur(2px);
    `;

    if (drawer) {
      drawer.style.pointerEvents = "none";
      drawer.style.filter = "blur(1px)";
      drawer.style.zIndex = "1";
      drawer.setAttribute("aria-hidden", "true");
      try {
        drawer.setAttribute("inert", "");
      } catch { }
    }
    if (drawerOverlay) {
      drawerOverlay.style.zIndex = "2";
    }

    const modal = document.createElement("div");
    modal.className = "gc-preview-modal";
    modal.style.cssText = `
      background:#fff; border-radius:14px; box-shadow:0 20px 40px rgba(0,0,0,.25);
      width:min(920px,94vw); max-height:90vh; overflow:hidden; display:flex; flex-direction:column;
    `;

    const header = document.createElement("div");
    header.style.cssText = `
      display:flex; align-items:center; justify-content:space-between; gap:8px;
      padding:12px 16px; border-bottom:1px solid #eee;
    `;
    header.innerHTML = `
      <div style="font-weight:700; font-size:1.05rem;">Vista previa de imagen</div>
      <button class="gc-btn gc-btn--ghost" data-act="close" aria-label="Cerrar" style="min-width:auto;padding:.35rem .6rem;">✕</button>
    `;

    const body = document.createElement("div");
    body.style.cssText = `
      display:grid; grid-template-columns:1fr 280px; gap:16px; padding:16px; align-items:start;
    `;

    const imgWrap = document.createElement("div");
    imgWrap.style.cssText = `
      border:1px solid #eee; border-radius:12px; padding:8px; background:#fafafa;
      display:flex; align-items:center; justify-content:center; min-height:320px; max-height:60vh;
    `;
    imgWrap.innerHTML = `<img src="${url}" alt="Vista previa" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:8px;">`;

    const side = document.createElement("div");
    side.style.cssText = `
      border-left:1px dashed #e6e6e6; padding-left:16px; display:flex; flex-direction:column; gap:10px;
    `;
    side.innerHTML = `
      <div style="font-weight:600;">Detalles</div>
      <div style="font-size:.92rem; color:#444; line-height:1.35;">
        <div><strong>Archivo:</strong> ${file.name}</div>
        <div><strong>Peso:</strong> ${humanSize(file.size)}</div>
        <div><strong>Tipo:</strong> ${file.type || "desconocido"}</div>
        <div style="margin-top:6px; color:#666;">Formatos permitidos: JPG / PNG · Máx 2MB</div>
      </div>
      <div style="margin-top:auto; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="gc-btn gc-btn--primary" data-act="confirm">Subir</button>
        <button class="gc-btn gc-btn--ghost" data-act="cancel">Cancelar</button>
      </div>
    `;

    const mql = window.matchMedia("(max-width: 720px)");
    const applyResponsive = () => {
      if (mql.matches) {
        body.style.gridTemplateColumns = "1fr";
        side.style.borderLeft = "none";
        side.style.paddingLeft = "0";
        imgWrap.style.minHeight = "200px";
      } else {
        body.style.gridTemplateColumns = "1fr 280px";
        side.style.borderLeft = "1px dashed #e6e6e6";
        side.style.paddingLeft = "16px";
        imgWrap.style.minHeight = "320px";
      }
    };
    mql.addEventListener?.("change", applyResponsive);
    applyResponsive();

    body.appendChild(imgWrap);
    body.appendChild(side);
    modal.appendChild(header);
    modal.appendChild(body);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    lockScroll();

    const cleanup = () => {
      if (drawer) {
        drawer.style.pointerEvents = prev.drawerPE ?? "";
        drawer.style.filter = prev.drawerFilter ?? "";
        drawer.style.zIndex = prev.drawerZ ?? "";
        if (prev.drawerAria != null)
          drawer.setAttribute("aria-hidden", prev.drawerAria);
        else drawer.removeAttribute("aria-hidden");
        if (!prev.hadInert)
          try {
            drawer.removeAttribute("inert");
          } catch { }
      }
      if (drawerOverlay) {
        drawerOverlay.style.zIndex = prev.overlayZ ?? "";
      }
      document.body.style.overflow = "";
      URL.revokeObjectURL(url);
      overlay.remove();
      document.removeEventListener("keydown", onEsc);
    };

    const onEsc = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cleanup();
      }
    };
    document.addEventListener("keydown", onEsc);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) cleanup();
    });
    header
      .querySelector('[data-act="close"]')
      .addEventListener("click", cleanup);
    side.querySelector('[data-act="cancel"]').addEventListener("click", (e) => {
      e.preventDefault();
      onCancel?.();
      cleanup();
    });
    side
      .querySelector('[data-act="confirm"]')
      .addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await onConfirm?.();
        } finally {
          cleanup();
        }
      });
  }

  // ---- Imágenes (lectura y, en cursos+edit, subida)
  function mountReadOnlyMedia(opt) {
    const {
      container,
      type,
      id,
      labels = [],
      editable: editableOverride,
    } = opt;
    if (!container) return;

    const editable =
      typeof editableOverride === "boolean"
        ? editableOverride
        : isAdminUser && state.currentDrawer?.mode === "edit";

    const urls = mediaUrlsByType(type, id);
    const grid = document.createElement("div");
    grid.className = "media-grid";

    urls.forEach((url, i) => {
      const label = labels[i] || `Imagen ${i + 1}`;
      const card = document.createElement("div");
      card.className = "media-card";

      const editBtnHTML = editable
        ? `
      <button class="icon-btn media-edit" title="Editar imagen">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.0 1.0 0 0 0 0-1.41l-2.34-2.34a1.0 1.0 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"></path>
        </svg>
      </button>`
        : "";

      card.innerHTML = `
      <figure class="media-thumb">
        <img alt="${escapeAttr(label)}" src="${withBust(url)}">
        ${editBtnHTML}
      </figure>
      <div class="media-meta">
        <div class="media-label">${escapeHTML(label)}</div>
      </div>
    `;

      const img = card.querySelector("img");
      img.onerror = () => {
        img.onerror = null;
        img.src = `data:image/svg+xml;utf8,${encodeURIComponent(noImageSvg())}`;
      };

      if (editable) {
        const btnEdit = card.querySelector(".media-edit");
        if (btnEdit) {
          btnEdit.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/png, image/jpeg";
            input.style.display = "none";
            document.body.appendChild(input);

            input.addEventListener("change", async () => {
              const file = input.files && input.files[0];
              document.body.removeChild(input);
              if (!file) return;

              const v = validarImagen(file, { maxMB: 2 });
              if (!v.ok) return toast(v.error, "error");

              renderPreviewUI(
                card,
                file,
                async () => {
                  try {
                    if (type === "curso") {
                      if (!API_UPLOAD?.cursoImg) {
                        toast("Configura API_UPLOAD.cursoImg para habilitar la subida", "warning");
                        return;
                      }
                      const fd = new FormData();
                      fd.append("curso_id", String(id));
                      fd.append("imagen", file);

                      const res = await fetch(API_UPLOAD.cursoImg, {
                        method: "POST",
                        body: fd,
                      });
                      if (!res.ok) throw new Error(`HTTP ${res.status}`);
                      const json = await res.json();
                      if (json.error) throw new Error(json.error);

                      img.src = withBust(json.url || url);
                      toast("Imagen de curso actualizada", "exito");
                      return;
                    }

                    if (type === "noticia") {
                      if (!API_UPLOAD?.noticiaImg) {
                        toast("Configura API_UPLOAD.noticiaImg para habilitar la subida", "warning");
                        return;
                      }
                      const pos = i + 1;
                      const fd = new FormData();
                      fd.append("noticia_id", String(id));
                      fd.append("pos", String(pos));
                      fd.append("imagen", file);

                      const res = await fetch(API_UPLOAD.noticiaImg, {
                        method: "POST",
                        body: fd,
                      });
                      if (!res.ok) throw new Error(`HTTP ${res.status}`);
                      const json = await res.json();
                      if (json.error) throw new Error(json.error);

                      img.src = withBust(json.url || url);
                      toast(`Imagen ${pos} de noticia actualizada`, "exito");
                      return;
                    }
                  } catch (err) {
                    console.error(err);
                    toast("No se pudo subir la imagen", "error");
                  }
                },
                () => { }
              );
            });

            input.click();
          });
        }
      }

      grid.appendChild(card);
    });

    container.innerHTML = `
    <div class="media-head">
      <div class="media-title">Imágenes</div>
      ${editable
        ? `<div class="media-help" style="color:#666;">Formatos: JPG/PNG · Máx 2MB</div>`
        : `<div class="media-help" style="color:#888;">Solo lectura</div>`
      }
    </div>`;
    container.appendChild(grid);
  }
  //---------------------------------- fin del bloque de imágenes

  // ---- Toolbar / botones
  function bindUI() {
    qsa(".admin-dash .admin-nav").forEach((btn) => {
      btn.addEventListener("click", () => {
        const route = btn.dataset.route || btn.getAttribute("href");
        if (route) {
          if (location.hash !== route) location.hash = route;
          else onRouteChange();
        }
      });
    });

    const drawerClose = document.getElementById("drawer-close");
    if (drawerClose) drawerClose.addEventListener("click", closeDrawer);

    const overlay = document.getElementById("gc-dash-overlay");
    if (overlay)
      overlay.addEventListener("click", (e) => {
        if (e.target.id === "gc-dash-overlay") closeDrawer();
      });

    const addBtn = document.getElementById("btn-add");
    if (addBtn) addBtn.addEventListener("click", async () => {
      if (!isAdminUser) return;
      if (state.route.startsWith("#/cursos")) {
        await openCreateCurso();
      } else if (state.route.startsWith("#/noticias")) {
        toast("Crear noticia: pendiente de implementar", "warning");
      }
    });
  }

  async function openCreateCurso() {
    if (!isAdminUser) return;
    try {
      await Promise.all([
        getTutorsMap(),
        getPrioridadMap(),
        getCategoriasMap(),
        getCalendarioMap(),
        getTipoEvalMap(),
        getActividadesMap(),
      ]);
      state.currentDrawer = { type: "curso", id: null, mode: "create" };
      openDrawer("Curso · Crear", renderCursoDrawer({ id: "" }));
    } catch (e) {
      console.error(e);
      toast("No se pudo abrir el formulario", "error");
    }
  }

  // ---- INIT
  document.addEventListener("DOMContentLoaded", async () => {
    currentUser = getUsuarioFromCookie();
    const uid = Number(currentUser?.id || 0);
    isAdminUser = ADMIN_IDS.includes(uid);

    applyAdminVisibility(isAdminUser);
    bindUI();

    try {
      await Promise.all([
        getTutorsMap(),
        getPrioridadMap(),
        getCategoriasMap(),
        getCalendarioMap(),
        getTipoEvalMap(),
        getActividadesMap(),
      ]);
    } catch { }

    if (!window.location.hash)
      window.location.hash = isAdminUser ? "#/cursos" : "#/cuentas";
    onRouteChange();
  });
})();
