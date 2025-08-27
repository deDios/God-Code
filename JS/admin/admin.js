(() => {
  // ------------------------------------- este bloque es para habilitar el debug
  window.GC_DEBUG = false; // aca colocar true o false para ver o no todos los console logs 
  function gcLog(...a) {
    if (window.GC_DEBUG && typeof console !== "undefined")
      try {
        console.log("[GC]", ...a);
      } catch { }
  }

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

    currentDrawer: null, // {type:'curso'|'noticia'|'tutor', id:number|null, mode:'view'|'edit'|'create'}
    tempNewCourseImage: null,
  };

  let currentUser = null;
  let isAdminUser = false;

  // ---- Helpers
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) =>
    Array.prototype.slice.call(r.querySelectorAll(s));
  const toast = (msg, tipo = "exito", dur = 2500) =>
    window.gcToast ? window.gcToast(msg, tipo, dur) : gcLog(`[${tipo}] ${msg}`);

  function getUsuarioFromCookie() {
    const row = (document.cookie || "").split("; ").find(function (r) {
      return r.indexOf("usuario=") === 0;
    });
    if (!row) return null;
    const raw = row.split("=")[1] || "";
    try {
      const once = decodeURIComponent(raw);
      const maybeTwice = /%7B|%22/.test(once) ? decodeURIComponent(once) : once;
      return JSON.parse(maybeTwice);
    } catch (e) {
      gcLog("cookie parse fail", e);
      return null;
    }
  }

  // -------- Panel de cuenta
  function showCuentaPanel() {
    try {
      var el = qs(".recursos-box.desktop-only");
      if (el && el.style) el.style.display = "none";
    } catch { }
    try {
      var el2 = qs(".recursos-box.mobile-only");
      if (el2 && el2.style) el2.style.display = "none";
    } catch { }
    try {
      var p1 = qs("#pagination-controls");
      if (p1 && p1.style) p1.style.display = "none";
    } catch { }
    try {
      var p2 = qs("#pagination-mobile");
      if (p2 && p2.style) p2.style.display = "none";
    } catch { }

    if (!qs("#cuenta-panel")) {
      const host = qs(".main-content") || document.body;
      const panel = document.createElement("div");
      panel.id = "cuenta-panel";
      panel.style.padding = "16px 18px";
      panel.innerHTML = window.renderCuentaOpciones
        ? window.renderCuentaOpciones()
        : "<div>Panel de cuenta</div>";
      host.appendChild(panel);
    }
  }
  function hideCuentaPanel() {
    const panel = qs("#cuenta-panel");
    if (panel) panel.remove();

    const d = qs(".recursos-box.desktop-only");
    if (d) d.style.display = "block";
    const m = qs(".recursos-box.mobile-only");
    if (m) m.style.display = "block";
    const pg = qs("#pagination-controls");
    if (pg) pg.style.display = "";
    const pgm = qs("#pagination-mobile");
    if (pgm) pgm.style.display = "";
  }

  // ---- fetch helper TOLERANTE
  async function postJSON(url, body) {
    gcLog("postJSON ->", url, "payload:", body);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    const text = await res.text().catch(() => "");
    gcLog("postJSON <-", url, "status:", res.status, "raw:\n", text);
    if (!res.ok) throw new Error("HTTP " + res.status + " " + (text || ""));
    if (!text || !String(text).trim()) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { _raw: text };
    }
  }

  // ---- Catálogos (con cache)
  async function getTutorsMap() {
    if (state.tutorsMap && Date.now() - state.tutorsMap._ts < 30 * 60 * 1000)
      return state.tutorsMap;
    const arr = await postJSON(API.tutores, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach((t) => {
      map[t.id] = t.nombre;
    });
    map._ts = Date.now();
    state.tutorsMap = map;
    return map;
  }
  async function getPrioridadMap() {
    if (state.prioMap && Date.now() - state.prioMap._ts < 30 * 60 * 1000)
      return state.prioMap;
    const arr = await postJSON(API.prioridad, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach((p) => {
      map[p.id] = p.nombre;
    });
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
    (Array.isArray(arr) ? arr : []).forEach((c) => {
      map[c.id] = c.nombre;
    });
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
    (Array.isArray(arr) ? arr : []).forEach((c) => {
      map[c.id] = c.nombre;
    });
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
    (Array.isArray(arr) ? arr : []).forEach((c) => {
      map[c.id] = c.nombre;
    });
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
    (Array.isArray(arr) ? arr : []).forEach((c) => {
      map[c.id] = c.nombre;
    });
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
    return href.indexOf("#/cuentas") >= 0 || txt.indexOf("cuenta") >= 0;
  }

  function applyAdminVisibility(isAdmin) {
    qsa(".gc-side .nav-item").forEach((a) => {
      if (!isAdmin && !isCuentasLink(a)) {
        (a.closest && a.closest("li") ? a.closest("li") : a).style.display =
          "none";
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
      if (h.indexOf("#/cuentas") !== 0) {
        if (location.hash !== "#/cuentas") location.hash = "#/cuentas";
      }
    }
  }

  // ================== CATÁLOGO DE STATUS (para cursos, noticias, tutores)
  const STATUS_CATALOG = {
    tutor: [
      { value: 1, label: "Activo", tone: "good" },
      { value: 0, label: "Inactivo", tone: "muted" },
      { value: 2, label: "Suspendido", tone: "warn" },
      { value: 3, label: "Eliminado", tone: "bad" }
    ],
    curso: [
      { value: 1, label: "Publicado", tone: "good" },
      { value: 0, label: "Borrador", tone: "muted" },
      { value: 2, label: "Oculto", tone: "warn" },
      { value: 3, label: "Archivado", tone: "bad" }
    ],
    noticia: [
      { value: 1, label: "Publicada", tone: "good" },
      { value: 0, label: "Borrador", tone: "muted" },
      { value: 2, label: "Revisión", tone: "warn" },
      { value: 3, label: "Retirada", tone: "bad" }
    ]
  };
  function statusLabel(mod, value) {
    const def = (STATUS_CATALOG[mod] || []).find(s => s.value === Number(value));
    return def ? def.label : `Estado ${value}`;
  }
  function statusSelectOptions(mod, value) {
    return (STATUS_CATALOG[mod] || [])
      .map(s => `<option value="${s.value}" ${Number(value) === s.value ? 'selected' : ''}>${s.label}</option>`)
      .join("");
  }
  // Chip simple: mapea "good" a badge activo; el resto badge inactivo (para no depender de nuevos estilos)
  function badgeGeneric(mod, value) {
    const def = (STATUS_CATALOG[mod] || []).find(s => s.value === Number(value));
    const cls = def && def.tone === "good" ? "gc-badge-activo" : "gc-badge-inactivo";
    const lbl = def ? def.label : `Estado ${value}`;
    return `<span class="${cls}">${lbl}</span>`;
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
      if (a.classList) a.classList.toggle("is-active", isActive);
      a.setAttribute("aria-current", isActive ? "page" : "false");
    });

    if (hash.indexOf("#/cursos/tutores") === 0) {
      hideCuentaPanel();
      return isAdminUser ? loadTutores() : enforceRouteGuard();
    }
    if (hash.indexOf("#/cursos/suscripciones") === 0) {
      hideCuentaPanel();
      return isAdminUser ? loadSuscripciones() : enforceRouteGuard();
    }
    if (hash.indexOf("#/cursos") === 0) {
      hideCuentaPanel();
      return isAdminUser ? loadCursos() : enforceRouteGuard();
    }
    if (hash.indexOf("#/noticias") === 0) {
      hideCuentaPanel();
      return isAdminUser ? loadNoticias() : enforceRouteGuard();
    }
    if (hash.indexOf("#/cuentas") === 0) {
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
        '<div class="sk-row"><div class="sk n1"></div><div class="sk n2"></div><div class="sk n3"></div></div>'
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
        d.innerHTML =
          '<div class="empty-state" style="padding:1rem;">Sin resultados</div>';
      if (m)
        m.innerHTML =
          '<div class="empty-state" style="padding:1rem;">Sin resultados</div>';
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
      countEl.textContent =
        rows.length + " " + (rows.length === 1 ? "elemento" : "elementos");

    // desktop -> drawer
    qsa("#recursos-list .table-row").forEach((el) => {
      el.addEventListener("click", function () {
        const data = el.dataset || {};
        if (data.type === "noticia") {
          state.currentDrawer = {
            type: "noticia",
            id: Number(data.id),
            mode: "view",
          };
        }
        // Para curso/tutor/noticia el body lo delegamos al config.drawerBody
        openDrawer(config.drawerTitle(data), config.drawerBody(data));
        if (data.type === "noticia") {
          const nid = Number(data.id);
          setTimeout(function () {
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
      el.addEventListener("click", function () {
        const row = el.closest(".table-row-mobile");
        if (row && row.classList) row.classList.toggle("expanded");
      });
    });
    qsa("#recursos-list-mobile .open-drawer").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const host = btn.closest(".table-row-mobile");
        const data = (host && host.dataset) || {};
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
          setTimeout(function () {
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
      btn.addEventListener("click", async function (e) {
        e.stopPropagation();
        const id = Number(btn.getAttribute("data-id"));
        const t = btn.getAttribute("data-type");
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
          gcLog(err);
          toast("No se pudo reactivar", "error");
        }
      });
    });

    renderPagination(rows.length);
  }

  function renderPagination(total) {
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    [qs("#pagination-controls"), qs("#pagination-mobile")].forEach((cont) => {
      if (!cont) return;
      cont.innerHTML = "";
      if (totalPages <= 1) return;

      const prev = document.createElement("button");
      prev.className = "arrow-btn";
      prev.textContent = "‹";
      prev.disabled = state.page === 1;
      prev.onclick = function () {
        state.page = Math.max(1, state.page - 1);
        refreshCurrent();
      };
      cont.appendChild(prev);

      for (let p = 1; p <= totalPages && p <= 7; p++) {
        const b = document.createElement("button");
        b.className = "page-btn" + (p === state.page ? " active" : "");
        b.textContent = p;
        b.onclick = function () {
          state.page = p;
          refreshCurrent();
        };
        cont.appendChild(b);
      }

      const next = document.createElement("button");
      next.className = "arrow-btn";
      next.textContent = "›";
      next.disabled = state.page === totalPages;
      next.onclick = function () {
        state.page = Math.min(totalPages, state.page + 1);
        refreshCurrent();
      };
      cont.appendChild(next);
    });
  }

  function refreshCurrent() {
    if (state.route.indexOf("#/cursos/tutores") === 0) return drawTutores();
    if (state.route.indexOf("#/cursos/suscripciones") === 0) return; // placeholder no pagina
    if (state.route.indexOf("#/cursos") === 0) return drawCursos();
    if (state.route.indexOf("#/noticias") === 0) return drawNoticias();
    if (state.route.indexOf("#/cuentas") === 0) return drawCuentas();
  }

  // ---------- CURSOS ----------
  async function loadCursos() {
    const title = qs("#mod-title");
    if (title) title.textContent = "Cursos";

    const hdr = qs(".recursos-box.desktop-only .table-header");
    if (hdr) {
      const c1 = hdr.querySelector(".col-nombre");
      let c2 = hdr.querySelector(".col-tutor") || hdr.querySelector(".col-tipo");
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

      const raw = [].concat(
        Array.isArray(activosRaw) ? activosRaw : [],
        Array.isArray(inactivosRaw) ? inactivosRaw : []
      );
      gcLog("loadCursos raw activos:", activosRaw);
      gcLog("loadCursos raw inactivos:", inactivosRaw);

      state.raw = raw;
      state.data = raw.map(function (c) {
        return {
          id: c.id,
          nombre: c.nombre,
          tutor: tmap && tmap[c.tutor] ? tmap[c.tutor] : "Tutor #" + c.tutor,
          tutor_id: c.tutor,
          prioridad_id: c.prioridad,
          prioridad_nombre: (pmap && pmap[c.prioridad]) || "#" + c.prioridad,
          categoria_id: c.categoria,
          categoria_nombre: (cmap && cmap[c.categoria]) || "#" + c.categoria,
          calendario_id: c.calendario,
          calendario_nombre:
            (calmap && calmap[c.calendario]) || "#" + c.calendario,
          tipo_eval_id: c.tipo_evaluacion,
          tipo_eval_nombre:
            (temap && temap[c.tipo_evaluacion]) || "#" + c.tipo_evaluacion,
          actividades_id: c.actividades,
          actividades_nombre:
            (ammap && ammap[c.actividades]) || "#" + c.actividades,
          precio: c.precio,
          certificado: !!c.certificado,
          fecha: c.fecha_inicio,
          estatus: Number(c.estatus),
          _all: c,
        };
      });

      gcLog("state.data cursos:", state.data.length);
      drawCursos();
    } catch (err) {
      const list = qs("#recursos-list");
      if (list)
        list.innerHTML =
          '<div style="padding:1rem;color:#b00020;">Error al cargar cursos</div>';
      const m = qs("#recursos-list-mobile");
      if (m) m.innerHTML = "";
      gcLog(err);
      toast("No se pudieron cargar cursos", "error");
    }
  }

  function drawCursos() {
    const rows = state.data;
    gcLog("drawCursos() rows:", rows.length);
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
          ${badgeGeneric('curso', it.estatus)}
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
          <div><strong>Status:</strong> ${statusLabel('curso', it.estatus)}</div>
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
        return item ? "Curso · " + item.nombre : "Curso";
      },
      drawerBody: (d) => renderCursoDrawer(d),
    });
  }

  function badgePrecio(precio) {
    return Number(precio) === 0
      ? '<span class="gc-chip gray">Gratuito</span>'
      : '<span class="gc-chip gray">Con costo</span>';
  }

  // ---- normalizador de payload (JS only)
  function normalizeCursoPayload(p) {
    return {
      ...p,
      nombre: String(p.nombre || ""),
      descripcion_breve: String(p.descripcion_breve || ""),
      descripcion_curso: String(p.descripcion_curso || ""),
      descripcion_media: String(p.descripcion_media || ""),
      dirigido: String(p.dirigido || ""),
      competencias: String(p.competencias || ""),
      certificado: Number(!!p.certificado),
      tutor: Number(p.tutor || 0),
      horas: Number(p.horas || 0),
      precio: Number(p.precio || 0),
      estatus: Number(p.estatus != null ? p.estatus : 1), // <-- ahora toma del form
      prioridad: Number(p.prioridad || 1),
      categoria: Number(p.categoria || 1),
      calendario: Number(p.calendario || 1),
      tipo_evaluacion: Number(p.tipo_evaluacion || 1),
      actividades: Number(p.actividades || 1),
      creado_por: Number(p.creado_por || 0),
      fecha_inicio: String(p.fecha_inicio || ""),
    };
  }

  // ---- Drawer Curso (COMPLETO, ahora con "Status")
  function renderCursoDrawer(dataset) {
    const item = state.data.find((x) => String(x.id) === dataset.id);
    const mode =
      (state.currentDrawer && state.currentDrawer.mode) ||
      (item ? "view" : "create");
    const isCreate = mode === "create" || !item;
    const isEdit = mode === "edit";
    const isView = mode === "view" && !!item;

    const c = isCreate ? getEmptyCourse() : item ? item._all : null;
    if (!c) return "<p>No encontrado.</p>";

    // helpers
    const inText = (id, val, ph) =>
      '<input id="' +
      id +
      '" type="text" value="' +
      escapeAttr(val || "") +
      '" placeholder="' +
      escapeAttr(ph || "") +
      '" />';
    const inNum = (id, val, min) =>
      '<input id="' +
      id +
      '" type="number" value="' +
      escapeAttr(val != null ? val : "") +
      '" min="' +
      (min || "0") +
      '" />';
    const inDate = (id, val) =>
      '<input id="' +
      id +
      '" type="date" value="' +
      escapeAttr(val || "") +
      '" />';
    const inCheck = (id, val) =>
      '<label class="gc-inline"><input id="' +
      id +
      '" type="checkbox" ' +
      (Number(val) ? "checked" : "") +
      "/> <span>Sí</span></label>";
    const inSel = (id, opts) => '<select id="' + id + '">' + opts + "</select>";
    const inTA = (id, val, rows) =>
      '<textarea id="' +
      id +
      '" rows="' +
      (rows || 4) +
      '">' +
      escapeHTML(val || "") +
      "</textarea>";

    // catálogos
    const tutorOptions = mapToOptions(state.tutorsMap, String(c.tutor || ""));
    const prioOptions = mapToOptions(state.prioMap, String(c.prioridad || ""));
    const catOptions = mapToOptions(
      state.categoriasMap,
      String(c.categoria || "")
    );
    const calOptions = mapToOptions(
      state.calendarioMap,
      String(c.calendario || "")
    );
    const tipoOptions = mapToOptions(
      state.tipoEvalMap,
      String(c.tipo_evaluacion || "")
    );
    const actOptions = mapToOptions(
      state.actividadesMap,
      String(c.actividades || "")
    );

    const field = function (label, value, inputHTML) {
      return (
        '<div class="field"><div class="label">' +
        escapeHTML(label) +
        '</div><div class="value">' +
        (isEdit || isCreate
          ? inputHTML
          : escapeHTML(value != null ? value : "-")) +
        "</div></div>"
      );
    };

    // acciones
    let controlsRow = "";
    if (isCreate) {
      controlsRow =
        '<div class="gc-actions"><button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button><button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button></div>';
    } else if (isAdminUser) {
      const isInactive = Number(c.estatus) === 0;
      controlsRow =
        '<div class="gc-actions">' +
        (isView ? '<button class="gc-btn" id="btn-edit">Editar</button>' : "") +
        (isEdit
          ? '<button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button>'
          : "") +
        (isEdit
          ? '<button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button>'
          : "") +
        '<button class="gc-btn gc-btn--danger" id="btn-delete" data-step="1">Eliminar</button>' +
        (isInactive
          ? '<button class="gc-btn gc-btn--success" id="btn-reactivar">Reactivar</button>'
          : "") +
        "</div>";
    }

    // contenido
    let html =
      "" +
      controlsRow +
      field(
        "Nombre",
        c.nombre,
        inText("f_nombre", c.nombre, "Nombre del curso")
      ) +
      field(
        "Descripción breve",
        c.descripcion_breve,
        inTA("f_desc_breve", c.descripcion_breve, 3)
      ) +
      field(
        "Descripción media",
        c.descripcion_media,
        inTA("f_desc_media", c.descripcion_media, 4)
      ) +
      field(
        "Descripción del curso",
        c.descripcion_curso,
        inTA("f_desc_curso", c.descripcion_curso, 6)
      ) +
      field("Dirigido a", c.dirigido, inTA("f_dirigido", c.dirigido, 3)) +
      field(
        "Competencias",
        c.competencias,
        inTA("f_competencias", c.competencias, 3)
      ) +
      // --------- NUEVO: Status
      field(
        "Status",
        statusLabel("curso", c.estatus),
        inSel("f_estatus", statusSelectOptions("curso", c.estatus))
      ) +
      '<div class="grid-3">' +
      field(
        "Tutor",
        (state.tutorsMap && state.tutorsMap[c.tutor]) || c.tutor,
        inSel("f_tutor", tutorOptions)
      ) +
      field(
        "Categoría",
        (state.categoriasMap && state.categoriasMap[c.categoria]) ||
        c.categoria,
        inSel("f_categoria", catOptions)
      ) +
      field(
        "Prioridad",
        (state.prioMap && state.prioMap[c.prioridad]) || c.prioridad,
        inSel("f_prioridad", prioOptions)
      ) +
      "</div>" +
      '<div class="grid-3">' +
      field(
        "Tipo de evaluación",
        (state.tipoEvalMap && state.tipoEvalMap[c.tipo_evaluacion]) ||
        c.tipo_evaluacion,
        inSel("f_tipo_eval", tipoOptions)
      ) +
      field(
        "Actividades",
        (state.actividadesMap && state.actividadesMap[c.actividades]) ||
        c.actividades,
        inSel("f_actividades", actOptions)
      ) +
      field(
        "Calendario",
        (state.calendarioMap && state.calendarioMap[c.calendario]) ||
        c.calendario,
        inSel("f_calendario", calOptions)
      ) +
      "</div>" +
      '<div class="grid-3">' +
      field("Horas", c.horas, inNum("f_horas", c.horas != null ? c.horas : 0)) +
      field(
        "Precio",
        c.precio === 0 ? "Gratuito" : fmtMoney(c.precio),
        inNum("f_precio", c.precio != null ? c.precio : 0)
      ) +
      field(
        "Certificado",
        Number(c.certificado) ? "Sí" : "No",
        inCheck("f_certificado", c.certificado)
      ) +
      "</div>" +
      field(
        "Fecha de inicio",
        c.fecha_inicio,
        inDate("f_fecha", c.fecha_inicio)
      );

    // imagen
    if (isCreate) {
      html += `
      <div class="field">
        <div class="label">Imagen del curso</div>
        <div class="value">
          <div id="create-media-curso" class="media-grid">
            <div class="media-card">
              <figure class="media-thumb">
                <img id="create-media-thumb" alt="Portada" src="${withBust(
        "/ASSETS/cursos/img0.png"
      )}" />
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
      </div>`;
    } else {
      html += `
      <div class="field">
        <div class="label">Imágenes existentes</div>
        <div class="value"><div id="media-curso" data-id="${c.id || (item ? item.id : "")
        }"></div></div>
      </div>`;
    }

    if (isAdminUser) {
      html += jsonSection(
        c,
        "JSON · Curso",
        "json-curso",
        "btn-copy-json-curso"
      );
    }

    // título y estado
    if (isCreate) {
      qs("#drawer-title").textContent = "Curso · Crear";
      state.currentDrawer = { type: "curso", id: null, mode: "create" };
    } else if (isEdit) {
      qs("#drawer-title").textContent =
        "Curso · " + (item ? item.nombre : "") + " (edición)";
      state.currentDrawer = {
        type: "curso",
        id: item ? item.id : null,
        mode: "edit",
      };
    } else {
      qs("#drawer-title").textContent = "Curso · " + (item ? item.nombre : "");
      state.currentDrawer = {
        type: "curso",
        id: item ? item.id : null,
        mode: "view",
      };
    }

    // bindings con try/catch
    setTimeout(function () {
      try {
        disableDrawerInputs(!(isEdit || isCreate));

        // CREAR: seleccionar imagen con modal preview
        if (isCreate) {
          const card = document.getElementById("create-media-curso");
          const btn = document.getElementById("create-media-edit");
          const thumb = document.getElementById("create-media-thumb");
          if (btn && thumb && card) {
            btn.addEventListener("click", function () {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/png, image/jpeg";
              input.style.display = "none";
              document.body.appendChild(input);
              input.addEventListener("change", function () {
                const file = input.files && input.files[0];
                try {
                  document.body.removeChild(input);
                } catch { }
                if (!file) return;
                const v = validarImagen(file, { maxMB: 2 });
                if (!v.ok) {
                  toast(v.error, "error");
                  return;
                }
                renderPreviewUI(
                  card,
                  file,
                  async function () {
                    state.tempNewCourseImage = file;
                    try {
                      if (thumb.dataset && thumb.dataset.blobUrl)
                        URL.revokeObjectURL(thumb.dataset.blobUrl);
                    } catch { }
                    const blobUrl = URL.createObjectURL(file);
                    if (thumb.dataset) thumb.dataset.blobUrl = blobUrl;
                    thumb.src = blobUrl;
                    toast(
                      "Imagen seleccionada (se subirá al guardar)",
                      "exito"
                    );
                  },
                  function () { }
                );
              });
              input.click();
            });
          }
        }

        // guardar/editar
        const btnSave = qs("#btn-save");
        if (btnSave)
          btnSave.addEventListener("click", async function (e) {
            e.stopPropagation();
            try {
              if (isCreate) await saveNewCurso();
              else await saveUpdateCurso(item);
            } catch (err) {
              gcLog(err);
              toast("Error al guardar", "error");
            }
          });

        const btnEdit = qs("#btn-edit");
        if (btnEdit)
          btnEdit.addEventListener("click", function (e) {
            e.stopPropagation();
            state.currentDrawer = {
              type: "curso",
              id: item ? item.id : null,
              mode: "edit",
            };
            qs("#drawer-body").innerHTML = renderCursoDrawer({
              id: String(item ? item.id : ""),
            });
          });

        const btnCancel = qs("#btn-cancel");
        if (btnCancel)
          btnCancel.addEventListener("click", function (e) {
            e.stopPropagation();
            if (isCreate) {
              state.tempNewCourseImage = null;
              closeDrawer();
            } else {
              state.currentDrawer = {
                type: "curso",
                id: item ? item.id : null,
                mode: "view",
              };
              qs("#drawer-body").innerHTML = renderCursoDrawer({
                id: String(item ? item.id : ""),
              });
            }
          });

        const bDel = qs("#btn-delete");
        if (bDel)
          bDel.addEventListener("click", async function (e) {
            e.stopPropagation();
            const step = bDel.getAttribute("data-step") || "1";
            gcLog("btn-delete clicked step:", step);
            if (step === "1") {
              bDel.textContent = "Confirmar";
              bDel.setAttribute("data-step", "2");
              setTimeout(function () {
                if (bDel.getAttribute("data-step") === "2") {
                  bDel.textContent = "Eliminar";
                  bDel.setAttribute("data-step", "1");
                }
              }, 4000);
              return;
            }
            try {
              gcLog("softDeleteCurso item:", item);
              await softDeleteCurso(item);
              toast("Curso eliminado (inactivo)", "exito");
              closeDrawer();
              await loadCursos();
            } catch (err) {
              gcLog(err);
              toast("No se pudo eliminar", "error");
            }
          });

        const btnRea = qs("#btn-reactivar");
        if (btnRea)
          btnRea.addEventListener("click", async function (e) {
            e.stopPropagation();
            try {
              await reactivateCurso(Number(item && item.id));
              toast("Curso reactivado", "exito");
              await loadCursos();
              const re = state.data.find(function (x) {
                return x.id === (item && item.id);
              });
              if (re)
                openDrawer(
                  "Curso · " + re.nombre,
                  renderCursoDrawer({ id: String(re.id) })
                );
            } catch (err) {
              gcLog(err);
              toast("No se pudo reactivar", "error");
            }
          });

        // montar media existente
        const contCurso = document.getElementById("media-curso");
        if (contCurso) {
          const cid = Number(c.id || (item ? item.id : 0));
          if (!isNaN(cid) && cid) {
            mountReadOnlyMedia({
              container: contCurso,
              type: "curso",
              id: cid,
              labels: ["Portada"],
              editable: isEdit && isAdminUser,
            });
          }
        }

        if (isAdminUser) bindCopyFromPre("#json-curso", "#btn-copy-json-curso");
        gcLog("renderCursoDrawer BINDINGS end");
      } catch (err) {
        gcLog("renderCursoDrawer bindings error:", err);
        toast("Ocurrió un error al preparar el formulario", "error");
      }
    }, 0);

    return html;
  }

  function disableDrawerInputs(disabled) {
    qsa(
      "#drawer-body input, #drawer-body select, #drawer-body textarea"
    ).forEach(function (el) {
      el.disabled = !!disabled;
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
      creado_por: Number((currentUser && currentUser.id) || 0) || 1,
    };
  }

  function mapToOptions(map, selectedId) {
    if (!map || typeof map !== "object") return '<option value="">—</option>';
    const pairs = Object.keys(map)
      .filter(function (k) {
        return k !== "_ts";
      })
      .map(function (k) {
        return [k, map[k]];
      });
    if (!pairs.length) return '<option value="">—</option>';
    return pairs
      .map(function (pair) {
        const id = pair[0],
          name = pair[1];
        const sel = String(selectedId) === String(id) ? " selected" : "";
        return (
          '<option value="' +
          escapeAttr(id) +
          '"' +
          sel +
          ">" +
          escapeHTML(name) +
          "</option>"
        );
      })
      .join("");
  }

  function readCursoForm(existingId) {
    const read = (id) => {
      const el = qs("#" + id);
      return el ? el.value : "";
    };
    const readN = (id, def) => Number(read(id) || def || 0);
    const readCh = (id) => {
      const el = qs("#" + id);
      return el && el.checked ? 1 : 0;
    };

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
      estatus: readN("f_estatus", 1), // <-- ahora se lee del select
      fecha_inicio: read("f_fecha"),
      prioridad: readN("f_prioridad", 1),
      categoria: readN("f_categoria", 1),
      calendario: readN("f_calendario", 1),
      tipo_evaluacion: readN("f_tipo_eval", 1),
      actividades: readN("f_actividades", 1),
      creado_por: Number((currentUser && currentUser.id) || 0) || 1,
    };
    if (existingId != null) payload.id = Number(existingId);
    return payload;
  }

  // 👉 subida de imagen
  async function uploadCursoImagen(cursoId, file) {
    if (!API_UPLOAD || !API_UPLOAD.cursoImg)
      throw new Error("API_UPLOAD.cursoImg no configurado");
    const v = validarImagen(file, { maxMB: 2 });
    if (!v.ok) throw new Error(v.error);
    const fd = new FormData();
    fd.append("curso_id", String(cursoId));
    fd.append("imagen", file);
    const res = await fetch(API_UPLOAD.cursoImg, { method: "POST", body: fd });
    const text = await res.text().catch(() => "");
    if (!res.ok) throw new Error("HTTP " + res.status + " " + (text || ""));
    try {
      return JSON.parse(text);
    } catch {
      return { _raw: text };
    }
  }

  // Crear curso + (opcional) subir imagen
  async function saveNewCurso() {
    const payload = normalizeCursoPayload(readCursoForm(null));
    if (!payload.nombre) return toast("Falta el nombre", "warning");
    if (!payload.tutor) return toast("Selecciona tutor", "warning");
    if (!payload.categoria) return toast("Selecciona categoría", "warning");
    if (!payload.fecha_inicio)
      return toast("Fecha de inicio requerida", "warning");

    const res = await postJSON(API.iCursos, payload);
    const newId = Number(
      (res &&
        (res.id ||
          res.curso_id ||
          res.insert_id ||
          (res.data && res.data.id))) ||
      0
    );
    if (!newId) {
      gcLog("Respuesta de iCursos sin id utilizable:", res);
      toast("Curso creado, pero no se recibió ID", "warning");
    }

    const fileToUpload = state.tempNewCourseImage || null;
    if (newId && fileToUpload) {
      try {
        await uploadCursoImagen(newId, fileToUpload);
        toast("Imagen subida", "exito");
      } catch (err) {
        gcLog(err);
        toast("Curso creado, pero falló la subida de imagen", "error");
      } finally {
        state.tempNewCourseImage = null;
      }
    }

    toast("Curso creado", "exito");
    closeDrawer();
    await loadCursos();

    if (newId) {
      const re = state.data.find(function (x) {
        return x.id === newId;
      });
      if (re)
        openDrawer(
          "Curso · " + re.nombre,
          renderCursoDrawer({ id: String(re.id) })
        );
    }
  }

  // Actualizar curso + (opcional) subir imagen
  async function saveUpdateCurso(item) {
    if (!item || !item._all) return toast("Sin item para actualizar", "error");
    const payload = normalizeCursoPayload(readCursoForm(item.id));
    await postJSON(API.uCursos, payload);

    const fEl = qs("#f_curso_img");
    const f = fEl && fEl.files && fEl.files[0];
    if (f) {
      try {
        await uploadCursoImagen(item.id, f);
        toast("Imagen actualizada", "exito");
      } catch (err) {
        gcLog(err);
        toast("Se guardó el curso, pero falló la imagen", "error");
      }
    }

    toast("Cambios guardados", "exito");
    await loadCursos();
    const re = state.data.find(function (x) {
      return x.id === item.id;
    });
    if (re)
      openDrawer(
        "Curso · " + re.nombre,
        renderCursoDrawer({ id: String(re.id) })
      );
  }

  async function softDeleteCurso(item) {
    if (!item || !item._all) throw new Error("Item inválido");
    const base = { ...item._all, estatus: 0 };
    const payload = normalizeCursoPayload(base);
    await postJSON(API.uCursos, payload);
  }

  async function reactivateCurso(id) {
    const it = state.data.find(function (x) {
      return x.id === Number(id);
    });
    if (!it || !it._all) throw new Error("Curso no encontrado");
    const body = normalizeCursoPayload({ ...it._all, estatus: 1 });
    await postJSON(API.uCursos, body);
  }

  // (Las secciones de NOTICIAS, TUTORES, CUENTAS, imágenes, toolbar y INIT continúan en la PARTE 2/2)

  // ---------- Helpers UI/format ----------
  function escapeHTML(str) {
    return String(str == null ? "" : str).replace(/[&<>'"]/g, function (s) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      }[s];
    });
  }
  function escapeAttr(str) {
    return String(str == null ? "" : str).replace(/"/g, "&quot;");
  }
  function fmtDate(d) {
    if (!d) return "-";
    try {
      const p = String(d).split("-");
      return (p[2] || "") + "/" + (p[1] || "") + "/" + (p[0] || "");
    } catch {
      return d;
    }
  }
  function fmtDateTime(dt) {
    if (!dt) return "-";
    try {
      const sp = String(dt).split(" ");
      return (fmtDate(sp[0]) + " " + (sp[1] || "")).trim();
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
      return "$" + n;
    }
  }
  function pair(label, val) {
    return (
      '<div class="field"><div class="label">' +
      escapeHTML(label) +
      '</div><div class="value">' +
      escapeHTML(val != null ? val : "-") +
      "</div></div>"
    );
  }

  function withBust(url) {
    try {
      const u = new URL(url, window.location.origin);
      u.searchParams.set("v", Date.now());
      return u.pathname + "?" + u.searchParams.toString();
    } catch {
      return url + (url.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now();
    }
  }

  function noImageSvg() {
    return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M20 70 L60 35 L95 65 L120 50 L140 70' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>";
  }

  function mediaUrlsByType(type, id) {
    const nid = Number(id);
    if (type === "noticia") {
      return [
        "/ASSETS/noticia/NoticiasImg/noticia_img1_" + nid + ".png",
        "/ASSETS/noticia/NoticiasImg/noticia_img2_" + nid + ".png",
      ];
    }
    if (type === "curso") {
      return ["/ASSETS/cursos/img" + nid + ".png"];
    }
    return [];
  }

  // ---- Sección JSON
  function jsonSection(obj, title, preId, btnId) {
    const safe = escapeHTML(JSON.stringify(obj || {}, null, 2));
    return (
      '<details class="dev-json" open style="margin-top:16px;">' +
      '<summary style="cursor:pointer; font-weight:600;">' +
      escapeHTML(title) +
      "</summary>" +
      '<div style="display:flex;gap:.5rem;margin:.5rem 0;"><button class="gc-btn" id="' +
      btnId +
      '">Copiar JSON</button></div>' +
      '<pre id="' +
      preId +
      '" class="value" style="white-space:pre-wrap;max-height:260px;overflow:auto;">' +
      safe +
      "</pre>" +
      "</details>"
    );
  }

  function bindCopyFromPre(preSel, btnSel) {
    const btn = qs(btnSel);
    const pre = qs(preSel);
    if (!btn || !pre) return;
    btn.addEventListener("click", async function (e) {
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
  function validarImagen(file, opt) {
    opt = opt || {};
    const maxMB = opt.maxMB || 2;
    if (!file) return { ok: false, error: "No se seleccionó archivo" };
    const allowed = ["image/jpeg", "image/png"];
    if (allowed.indexOf(file.type) === -1)
      return { ok: false, error: "Formato no permitido. Solo JPG o PNG" };
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxMB)
      return { ok: false, error: "La imagen excede " + maxMB + "MB" };
    return { ok: true };
  }

  function humanSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  }

  // ---- Modal / preview de imagen
  function renderPreviewUI(cardEl, file, onConfirm, onCancel) {
    const url = URL.createObjectURL(file);
    const drawer = document.getElementById("gc-drawer");
    const drawerOverlay = document.getElementById("gc-dash-overlay");
    const prev = {
      drawerPE: drawer && drawer.style ? drawer.style.pointerEvents : "",
      drawerFilter: drawer && drawer.style ? drawer.style.filter : "",
      drawerZ: drawer && drawer.style ? drawer.style.zIndex : "",
      overlayZ:
        drawerOverlay && drawerOverlay.style ? drawerOverlay.style.zIndex : "",
      drawerAria: drawer ? drawer.getAttribute("aria-hidden") : null,
      hadInert:
        drawer && typeof drawer.hasAttribute === "function"
          ? drawer.hasAttribute("inert")
          : false,
    };

    const lockScroll = function () {
      document.body.style.overflow = "hidden";
    };

    const overlay = document.createElement("div");
    overlay.className = "gc-preview-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(17,24,39,.55);backdrop-filter:saturate(120%) blur(2px);";

    if (drawer) {
      drawer.style.pointerEvents = "none";
      drawer.style.filter = "blur(1px)";
      drawer.style.zIndex = "1";
      drawer.setAttribute("aria-hidden", "true");
      try {
        drawer.setAttribute("inert", "");
      } catch { }
    }
    if (drawerOverlay && drawerOverlay.style) drawerOverlay.style.zIndex = "2";

    const modal = document.createElement("div");
    modal.className = "gc-preview-modal";
    modal.style.cssText =
      "background:#fff;border-radius:14px;box-shadow:0 20px 40px rgba(0,0,0,.25);width:min(920px,94vw);max-height:90vh;overflow:hidden;display:flex;flex-direction:column;";

    const header = document.createElement("div");
    header.style.cssText =
      "display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 16px;border-bottom:1px solid #eee;";
    header.innerHTML =
      '<div style="font-weight:700;font-size:1.05rem;">Vista previa de imagen</div><button class="gc-btn gc-btn--ghost" data-act="close" aria-label="Cerrar" style="min-width:auto;padding:.35rem .6rem;">✕</button>';

    const body = document.createElement("div");
    body.style.cssText =
      "display:grid;grid-template-columns:1fr 280px;gap:16px;padding:16px;align-items:start;";

    const imgWrap = document.createElement("div");
    imgWrap.style.cssText =
      "border:1px solid #eee;border-radius:12px;padding:8px;background:#fafafa;display:flex;align-items:center;justify-content:center;min-height:320px;max-height:60vh;";
    imgWrap.innerHTML =
      '<img src="' +
      url +
      '" alt="Vista previa" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:8px;">';

    const side = document.createElement("div");
    side.style.cssText =
      "border-left:1px dashed #e6e6e6;padding-left:16px;display:flex;flex-direction:column;gap:10px;";
    side.innerHTML =
      '<div style="font-weight:600;">Detalles</div>' +
      '<div style="font-size:.92rem;color:#444;line-height:1.35;">' +
      "<div><strong>Archivo:</strong> " +
      file.name +
      "</div>" +
      "<div><strong>Peso:</strong> " +
      humanSize(file.size) +
      "</div>" +
      "<div><strong>Tipo:</strong> " +
      (file.type || "desconocido") +
      "</div>" +
      '<div style="margin-top:6px;color:#666;">Formatos permitidos: JPG / PNG · Máx 2MB</div>' +
      "</div>" +
      '<div style="margin-top:auto;display:flex;gap:8px;flex-wrap:wrap;">' +
      '<button class="gc-btn gc-btn--primary" data-act="confirm">Subir</button>' +
      '<button class="gc-btn gc-btn--ghost" data-act="cancel">Cancelar</button>' +
      "</div>";

    const mql = window.matchMedia && window.matchMedia("(max-width: 720px)");
    const applyResponsive = function () {
      if (mql && mql.matches) {
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
    if (mql && mql.addEventListener)
      mql.addEventListener("change", applyResponsive);
    applyResponsive();

    body.appendChild(imgWrap);
    body.appendChild(side);
    modal.appendChild(header);
    modal.appendChild(body);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    lockScroll();

    const cleanup = function () {
      if (drawer) {
        if (drawer.style) {
          drawer.style.pointerEvents = prev.drawerPE || "";
          drawer.style.filter = prev.drawerFilter || "";
          drawer.style.zIndex = prev.drawerZ || "";
        }
        if (prev.drawerAria != null)
          drawer.setAttribute("aria-hidden", prev.drawerAria);
        else drawer.removeAttribute("aria-hidden");
        try {
          if (!prev.hadInert) drawer.removeAttribute("inert");
        } catch { }
      }
      if (drawerOverlay && drawerOverlay.style)
        drawerOverlay.style.zIndex = prev.overlayZ || "";
      document.body.style.overflow = "";
      try {
        URL.revokeObjectURL(url);
      } catch { }
      try {
        overlay.remove();
      } catch { }
      document.removeEventListener("keydown", onEsc);
    };

    const onEsc = function (e) {
      if (e && e.key === "Escape") {
        e.preventDefault();
        cleanup();
      }
    };
    document.addEventListener("keydown", onEsc);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) cleanup();
    });
    const btnClose = header.querySelector('[data-act="close"]');
    if (btnClose) btnClose.addEventListener("click", cleanup);
    const btnCancel = side.querySelector('[data-act="cancel"]');
    if (btnCancel)
      btnCancel.addEventListener("click", function (e) {
        e.preventDefault();
        onCancel && onCancel();
        cleanup();
      });
    const btnConfirm = side.querySelector('[data-act="confirm"]');
    if (btnConfirm)
      btnConfirm.addEventListener("click", async function (e) {
        e.preventDefault();
        try {
          if (onConfirm) await onConfirm();
        } finally {
          cleanup();
        }
      });
  }

  // ---- Imágenes (lectura y, en cursos+edit, subida)
  function mountReadOnlyMedia(opt) {
    const container = opt && opt.container;
    const type = opt && opt.type;
    const id = opt && opt.id;
    const labels = (opt && opt.labels) || [];
    const editableOverride = opt && opt.editable;

    if (!container) return;

    const editable =
      typeof editableOverride === "boolean"
        ? editableOverride
        : isAdminUser &&
        state.currentDrawer &&
        state.currentDrawer.mode === "edit";
    const urls = mediaUrlsByType(type, id);
    const grid = document.createElement("div");
    grid.className = "media-grid";

    urls.forEach(function (url, i) {
      const label = labels[i] || "Imagen " + (i + 1);
      const card = document.createElement("div");
      card.className = "media-card";
      const editBtnHTML = editable
        ? '<button class="icon-btn media-edit" title="Editar imagen">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.0 1.0 0 0 0 0-1.41l-2.34-2.34a1.0 1.0 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"></path></svg>' +
        "</button>"
        : "";

      card.innerHTML =
        '<figure class="media-thumb"><img alt="' +
        escapeAttr(label) +
        '" src="' +
        withBust(url) +
        '">' +
        editBtnHTML +
        "</figure>" +
        '<div class="media-meta"><div class="media-label">' +
        escapeHTML(label) +
        "</div></div>";

      const img = card.querySelector("img");
      if (img)
        img.onerror = function () {
          img.onerror = null;
          img.src =
            "data:image/svg+xml;utf8," + encodeURIComponent(noImageSvg());
        };

      if (editable) {
        const btnEdit = card.querySelector(".media-edit");
        if (btnEdit) {
          btnEdit.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/png, image/jpeg";
            input.style.display = "none";
            document.body.appendChild(input);
            input.addEventListener("change", async function () {
              const file = input.files && input.files[0];
              try {
                document.body.removeChild(input);
              } catch { }
              if (!file) return;

              const v = validarImagen(file, { maxMB: 2 });
              if (!v.ok) return toast(v.error, "error");

              renderPreviewUI(
                card,
                file,
                async function () {
                  try {
                    if (type === "curso") {
                      if (!API_UPLOAD || !API_UPLOAD.cursoImg) {
                        toast(
                          "Configura API_UPLOAD.cursoImg para habilitar la subida",
                          "warning"
                        );
                        return;
                      }
                      const fd = new FormData();
                      fd.append("curso_id", String(id));
                      fd.append("imagen", file);
                      const res = await fetch(API_UPLOAD.cursoImg, {
                        method: "POST",
                        body: fd,
                      });
                      const text = await res.text().catch(() => "");
                      if (!res.ok)
                        throw new Error(
                          "HTTP " + res.status + " " + (text || "")
                        );
                      let json;
                      try {
                        json = JSON.parse(text);
                      } catch {
                        json = { _raw: text };
                      }
                      img.src = withBust((json && json.url) || url);
                      toast("Imagen de curso actualizada", "exito");
                      return;
                    }

                    if (type === "noticia") {
                      if (!API_UPLOAD || !API_UPLOAD.noticiaImg) {
                        toast(
                          "Configura API_UPLOAD.noticiaImg para habilitar la subida",
                          "warning"
                        );
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
                      const text = await res.text().catch(() => "");
                      if (!res.ok)
                        throw new Error(
                          "HTTP " + res.status + " " + (text || "")
                        );
                      let json;
                      try {
                        json = JSON.parse(text);
                      } catch {
                        json = { _raw: text };
                      }
                      img.src = withBust((json && json.url) || url);
                      toast(
                        "Imagen " + pos + " de noticia actualizada",
                        "exito"
                      );
                      return;
                    }
                  } catch (err) {
                    gcLog(err);
                    toast("No se pudo subir la imagen", "error");
                  }
                },
                function () { }
              );
            });
            input.click();
          });
        }
      }

      grid.appendChild(card);
    });

    container.innerHTML =
      '<div class="media-head"><div class="media-title">Imágenes</div>' +
      (editable
        ? '<div class="media-help" style="color:#666;">Formatos: JPG/PNG · Máx 2MB</div>'
        : '<div class="media-help" style="color:#888;">Solo lectura</div>') +
      "</div>";
    container.appendChild(grid);
  }
  // ---------- NOTICIAS ----------
  async function loadNoticias() {
    const title = qs("#mod-title");
    if (title) title.textContent = "Noticias";

    const hdr = qs(".recursos-box.desktop-only .table-header");
    if (hdr) {
      let c1 = hdr.querySelector(".col-nombre");
      let c2 = hdr.querySelector(".col-fecha");
      let c3 = hdr.querySelector(".col-status");
      if (c1) c1.textContent = "Título";
      if (c2) c2.textContent = "Fecha";
      if (!c3) {
        c3 = document.createElement("div");
        c3.className = "col-status";
        c3.textContent = "Status";
        hdr.appendChild(c3);
      } else c3.textContent = "Status";
    }

    showSkeletons();
    try {
      const activos = await postJSON(API.noticias, { estatus: 1 });
      const inactivos = await postJSON(API.noticias, { estatus: 0 });
      const raw = [].concat(
        Array.isArray(activos) ? activos : [],
        Array.isArray(inactivos) ? inactivos : []
      );
      state.raw = raw;
      state.data = raw.map((n) => ({
        id: n.id,
        titulo: n.titulo,
        desc_uno: n.desc_uno,
        desc_dos: n.desc_dos,
        estatus: Number(n.estatus),
        fecha_creacion: n.fecha_creacion,
        _all: n,
      }));
      drawNoticias();
    } catch (err) {
      gcLog(err);
      toast("Error al cargar noticias", "error");
    }
  }

  function drawNoticias() {
    const rows = state.data;
    renderList(rows, {
      desktopRow: (it) => `
        <div class="table-row" data-id="${it.id}" data-type="noticia">
          <div class="col-nombre">${escapeHTML(it.titulo)}</div>
          <div class="col-fecha">${fmtDateTime(it.fecha_creacion)}</div>
          <div class="col-status">${badgeGeneric('noticia', it.estatus)}</div>
        </div>`,
      mobileRow: (it) => `
        <div class="table-row-mobile" data-id="${it.id}" data-type="noticia">
          <button class="row-toggle">
            <div class="col-nombre">${escapeHTML(it.titulo)}</div>
            <span class="icon-chevron">›</span>
          </button>
          <div class="row-details">
            <div><strong>Fecha:</strong> ${fmtDateTime(it.fecha_creacion)}</div>
            <div><strong>Status:</strong> ${statusLabel('noticia', it.estatus)}</div>
            <div style="margin:.25rem 0;">
              <button class="gc-btn gc-btn--ghost open-drawer">Ver detalle</button>
            </div>
          </div>
        </div>`,
      drawerTitle: (d) => {
        const item = state.data.find((x) => String(x.id) === d.id);
        return item ? "Noticia · " + item.titulo : "Noticia";
      },
      drawerBody: (d) => renderNoticiaDrawer(d),
    });
  }

  function renderNoticiaDrawer(dataset) {
    const item = state.data.find((x) => String(x.id) === dataset.id);
    if (!item) return "<p>No encontrado.</p>";
    const n = item._all;

    const field = (label, val) =>
      `<div class="field"><div class="label">${label}</div><div class="value">${escapeHTML(val || "-")}</div></div>`;

    const html =
      field("Título", n.titulo) +
      field("Descripción 1", n.desc_uno) +
      field("Descripción 2", n.desc_dos) +
      field("Status", statusLabel("noticia", n.estatus)) +
      jsonSection(n, "JSON · Noticia", "json-noticia", "btn-copy-json-noticia");

    return html;
  }

  // ---------- TUTORES ----------
  async function loadTutores() {
    const title = qs("#mod-title");
    if (title) title.textContent = "Tutores";

    const hdr = qs(".recursos-box.desktop-only .table-header");
    if (hdr) {
      let c1 = hdr.querySelector(".col-nombre");
      let c2 = hdr.querySelector(".col-fecha");
      let c3 = hdr.querySelector(".col-status");
      if (c1) c1.textContent = "Nombre";
      if (c2) c2.textContent = "Fecha creación";
      if (!c3) {
        c3 = document.createElement("div");
        c3.className = "col-status";
        c3.textContent = "Status";
        hdr.appendChild(c3);
      } else c3.textContent = "Status";
    }

    showSkeletons();
    try {
      const activos = await postJSON(API.tutores, { estatus: 1 });
      const inactivos = await postJSON(API.tutores, { estatus: 0 });
      const raw = [].concat(
        Array.isArray(activos) ? activos : [],
        Array.isArray(inactivos) ? inactivos : []
      );
      state.raw = raw;
      state.data = raw.map((t) => ({
        id: t.id,
        nombre: t.nombre,
        descripcion: t.descripcion,
        estatus: Number(t.estatus),
        fecha_creacion: t.fecha_creacion,
        _all: t,
      }));
      drawTutores();
    } catch (err) {
      gcLog(err);
      toast("Error al cargar tutores", "error");
    }
  }

  function drawTutores() {
    const rows = state.data;
    renderList(rows, {
      desktopRow: (it) => `
        <div class="table-row" data-id="${it.id}" data-type="tutor">
          <div class="col-nombre">
            <img class="gc-avatar sm" src="../ASSETS/tutor/tutor_${it.id}.png"
                 onerror="this.onerror=null;this.src='../ASSETS/tutor/tutor_${it.id}.jpg';"
                 alt="Tutor ${it.id}">
            ${escapeHTML(it.nombre)}
          </div>
          <div class="col-fecha">${fmtDateTime(it.fecha_creacion)}</div>
          <div class="col-status">${badgeGeneric('tutor', it.estatus)}</div>
        </div>`,
      mobileRow: (it) => `
        <div class="table-row-mobile" data-id="${it.id}" data-type="tutor">
          <button class="row-toggle">
            <div class="col-nombre">${escapeHTML(it.nombre)}</div>
            <span class="icon-chevron">›</span>
          </button>
          <div class="row-details">
            <div><strong>Fecha:</strong> ${fmtDateTime(it.fecha_creacion)}</div>
            <div><strong>Status:</strong> ${statusLabel('tutor', it.estatus)}</div>
            <div style="margin:.25rem 0;">
              <button class="gc-btn gc-btn--ghost open-drawer">Ver detalle</button>
            </div>
          </div>
        </div>`,
      drawerTitle: (d) => {
        const item = state.data.find((x) => String(x.id) === d.id);
        return item ? "Tutor · " + item.nombre : "Tutor";
      },
      drawerBody: (d) => renderTutorDrawer(d),
    });
  }

  function renderTutorDrawer(dataset) {
    const item = state.data.find((x) => String(x.id) === dataset.id);
    if (!item) return "<p>No encontrado.</p>";
    const t = item._all;

    const avatarPNG = `../ASSETS/tutor/tutor_${t.id}.png`;
    const avatarJPG = `../ASSETS/tutor/tutor_${t.id}.jpg`;

    const html = `
      <div class="field center">
        <img class="gc-avatar xl" src="${avatarPNG}" 
             onerror="this.onerror=null;this.src='${avatarJPG}';"
             alt="Tutor ${t.id}">
      </div>
      <div class="field"><div class="label">Nombre</div><div class="value">${escapeHTML(t.nombre)}</div></div>
      <div class="field"><div class="label">Descripción</div><div class="value">${escapeHTML(t.descripcion || "-")}</div></div>
      <div class="field"><div class="label">Status</div><div class="value">${statusLabel("tutor", t.estatus)}</div></div>
      <div class="field"><div class="label">Fecha creación</div><div class="value">${fmtDateTime(t.fecha_creacion)}</div></div>
      ${jsonSection(t, "JSON · Tutor", "json-tutor", "btn-copy-json-tutor")}
    `;
    return html;
  }

  // ---------- SUSCRIPCIONES (placeholder) ----------
  function loadSuscripciones() {
    const title = qs("#mod-title");
    if (title) title.textContent = "Suscripciones";

    const list = qs("#recursos-list");
    if (list)
      list.innerHTML = `
        <div style="padding:2rem; text-align:center;">
          <h3>Suscripciones (en construcción)</h3>
          <p>Pronto podrás gestionar inscripciones de cursos aquí.</p>
          <button class="gc-btn" onclick="setRoute('#/cursos')">Volver a Cursos</button>
        </div>`;
    const m = qs("#recursos-list-mobile");
    if (m) m.innerHTML = "";
  }

  // ---------- INIT ----------
  document.addEventListener("DOMContentLoaded", () => {
    currentUser = getUsuarioFromCookie();
    isAdminUser =
      currentUser && currentUser.id && ADMIN_IDS.indexOf(currentUser.id) >= 0;
    applyAdminVisibility(isAdminUser);

    onRouteChange();
  });
})();
