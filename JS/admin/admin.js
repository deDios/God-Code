(() => {
  // ---- DEBUG SWITCH  colocar true o false para ver los logs
  if (typeof window.GC_DEBUG === "undefined") window.GC_DEBUG = true;
  const dlog = (...args) => {
    if (window.GC_DEBUG) {
      try {
        console.log("[GC]", ...args);
      } catch (_) {}
    }
  };
  const dwarn = (...args) => {
    if (window.GC_DEBUG) {
      try {
        console.warn("[GC][WARN]", ...args);
      } catch (_) {}
    }
  };
  const derr = (...args) => {
    if (window.GC_DEBUG) {
      try {
        console.error("[GC][ERR]", ...args);
      } catch (_) {}
    }
  };

  dlog("admin.js init: DEBUG =", window.GC_DEBUG);

  // ===== Viewport CSS var =====
  const setVH = () => {
    try {
      document.documentElement.style.setProperty(
        "--vh",
        String(window.innerHeight * 0.01) + "px"
      );
    } catch (e) {
      derr("setVH error:", e);
    }
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
      : window.GC_DEBUG
      ? console.log(`[toast:${tipo}] ${msg}`)
      : void 0;

  function getUsuarioFromCookie() {
    try {
      const cookie = document.cookie || "";
      const c = cookie.split("; ").find((r) => r.indexOf("usuario=") === 0);
      dlog("Cookie full:", cookie);
      dlog("Cookie match:", c);
      if (!c) return null;
      const raw = c.split("=")[1] || "";
      dlog("Cookie raw:", raw);
      const dec = decodeURIComponent(raw || "");
      dlog("Cookie dec:", dec);
      if (!dec || !dec.trim()) return null;
      const obj = JSON.parse(dec);
      dlog("Cookie JSON:", obj);
      return obj;
    } catch (err) {
      dwarn("getUsuarioFromCookie parse error:", err);
      return null;
    }
  }

  // -------- Panel de cuenta
  function showCuentaPanel() {
    try {
      dlog("showCuentaPanel()");
      if (
        qs(".recursos-box.desktop-only") &&
        qs(".recursos-box.desktop-only").style
      )
        qs(".recursos-box.desktop-only").style.display = "none";
      if (
        qs(".recursos-box.mobile-only") &&
        qs(".recursos-box.mobile-only").style
      )
        qs(".recursos-box.mobile-only").style.display = "none";
      if (qs("#pagination-controls") && qs("#pagination-controls").style)
        qs("#pagination-controls").style.display = "none";
      if (qs("#pagination-mobile") && qs("#pagination-mobile").style)
        qs("#pagination-mobile").style.display = "none";

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
    } catch (e) {
      derr("showCuentaPanel error:", e);
    }
  }
  function hideCuentaPanel() {
    try {
      dlog("hideCuentaPanel()");
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
    } catch (e) {
      derr("hideCuentaPanel error:", e);
    }
  }

  // ---- Fetch JSON robusto
  async function postJSON(url, body) {
    dlog("postJSON ->", url, "payload:", body);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });

    const raw = await res.text();
    dlog("postJSON <-", url, "status:", res.status, "raw:", raw);

    if (!res.ok) {
      const snippet = raw ? ` — body: ${raw.slice(0, 200)}` : "";
      throw new Error(`HTTP ${res.status} en ${url}${snippet}`);
    }
    if (!raw || !raw.trim()) return {};

    try {
      const json = JSON.parse(raw);
      return json;
    } catch (e) {
      derr("Respuesta no JSON de", url, "raw:", raw);
      throw new Error(`Respuesta no JSON en ${url}`);
    }
  }

  // ---- Catálogos
  async function getTutorsMap() {
    if (state.tutorsMap && Date.now() - state.tutorsMap._ts < 30 * 60 * 1000)
      return state.tutorsMap;
    dlog("getTutorsMap()");
    const arr = await postJSON(API.tutores, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach((t) => (map[t.id] = t.nombre));
    map._ts = Date.now();
    state.tutorsMap = map;
    dlog("tutorsMap:", map);
    return map;
  }
  async function getPrioridadMap() {
    if (state.prioMap && Date.now() - state.prioMap._ts < 30 * 60 * 1000)
      return state.prioMap;
    dlog("getPrioridadMap()");
    const arr = await postJSON(API.prioridad, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach((p) => (map[p.id] = p.nombre));
    map._ts = Date.now();
    state.prioMap = map;
    dlog("prioMap:", map);
    return map;
  }
  async function getCategoriasMap() {
    if (
      state.categoriasMap &&
      Date.now() - state.categoriasMap._ts < 30 * 60 * 1000
    )
      return state.categoriasMap;
    dlog("getCategoriasMap()");
    const arr = await postJSON(API.categorias, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach((c) => (map[c.id] = c.nombre));
    map._ts = Date.now();
    state.categoriasMap = map;
    dlog("categoriasMap:", map);
    return map;
  }
  async function getCalendarioMap() {
    if (
      state.calendarioMap &&
      Date.now() - state.calendarioMap._ts < 30 * 60 * 1000
    )
      return state.calendarioMap;
    dlog("getCalendarioMap()");
    const arr = await postJSON(API.calendario, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach((c) => (map[c.id] = c.nombre));
    map._ts = Date.now();
    state.calendarioMap = map;
    dlog("calendarioMap:", map);
    return map;
  }
  async function getTipoEvalMap() {
    if (
      state.tipoEvalMap &&
      Date.now() - state.tipoEvalMap._ts < 30 * 60 * 1000
    )
      return state.tipoEvalMap;
    dlog("getTipoEvalMap()");
    const arr = await postJSON(API.tipoEval, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach((c) => (map[c.id] = c.nombre));
    map._ts = Date.now();
    state.tipoEvalMap = map;
    dlog("tipoEvalMap:", map);
    return map;
  }
  async function getActividadesMap() {
    if (
      state.actividadesMap &&
      Date.now() - state.actividadesMap._ts < 30 * 60 * 1000
    )
      return state.actividadesMap;
    dlog("getActividadesMap()");
    const arr = await postJSON(API.actividades, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach((c) => (map[c.id] = c.nombre));
    map._ts = Date.now();
    state.actividadesMap = map;
    dlog("actividadesMap:", map);
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
    dlog("applyAdminVisibility -> isAdmin:", isAdmin);
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
      if (h.indexOf("#/cuentas") !== 0) {
        dlog("enforceRouteGuard redirect to #/cuentas");
        if (location.hash !== "#/cuentas") location.hash = "#/cuentas";
      }
    }
  }

  // ---- Route
  function setRoute(hash) {
    const target = hash || (isAdminUser ? "#/cursos" : "#/cuentas");
    dlog("setRoute:", hash, "->", target);
    if (location.hash !== target) location.hash = target;
    else onRouteChange();
  }
  window.addEventListener("hashchange", onRouteChange);

  function onRouteChange() {
    try {
      enforceRouteGuard();
      const hash =
        window.location.hash || (isAdminUser ? "#/cursos" : "#/cuentas");
      dlog("onRouteChange ->", hash);
      state.route = hash;
      state.page = 1;

      qsa(".gc-side .nav-item").forEach((a) => {
        const isActive = a.getAttribute("href") === hash;
        a.classList.toggle("is-active", isActive);
        a.setAttribute("aria-current", isActive ? "page" : "false");
      });

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
    } catch (e) {
      derr("onRouteChange error:", e);
    }
  }

  // ---- Skeletons
  function showSkeletons() {
    dlog("showSkeletons()");
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
    dlog("renderList() rows:", rows.length);
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
    dlog(
      "renderList page:",
      state.page,
      "start:",
      start,
      "pageRows:",
      pageRows.length
    );

    pageRows.forEach((item) => {
      if (d) d.insertAdjacentHTML("beforeend", config.desktopRow(item));
      if (m) m.insertAdjacentHTML("beforeend", config.mobileRow(item));
    });

    const countEl = qs("#mod-count");
    if (countEl)
      countEl.textContent = `${rows.length} ${
        rows.length === 1 ? "elemento" : "elementos"
      }`;

    // desktop -> drawer
    qsa("#recursos-list .table-row").forEach((el) => {
      el.addEventListener("click", () => {
        const data = el.dataset;
        dlog("desktop row click ->", data);
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
      el.addEventListener("click", () => {
        dlog("mobile row toggle");
        el.closest(".table-row-mobile").classList.toggle("expanded");
      });
    });
    qsa("#recursos-list-mobile .open-drawer").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const data = btn.closest(".table-row-mobile").dataset;
        dlog("mobile open drawer ->", data);
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
        dlog("reactivate click ->", t, id);
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
          derr("reactivate error:", err);
          toast("No se pudo reactivar", "error");
        }
      });
    });

    renderPagination(rows.length);
  }

  function renderPagination(total) {
    dlog("renderPagination total:", total, "pageSize:", state.pageSize);
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
        dlog("pagination prev -> new page:", state.page);
        refreshCurrent();
      };
      cont.appendChild(prev);

      for (let p = 1; p <= totalPages && p <= 7; p++) {
        const b = document.createElement("button");
        b.className = "page-btn" + (p === state.page ? " active" : "");
        b.textContent = p;
        b.onclick = () => {
          state.page = p;
          dlog("pagination click -> page:", p);
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
        dlog("pagination next -> new page:", state.page);
        refreshCurrent();
      };
      cont.appendChild(next);
    });
  }

  function refreshCurrent() {
    dlog("refreshCurrent route:", state.route);
    if (state.route.indexOf("#/cursos") === 0) return drawCursos();
    if (state.route.indexOf("#/noticias") === 0) return drawNoticias();
    if (state.route.indexOf("#/cuentas") === 0) return drawCuentas();
  }

  // ---------- CURSOS ----------
  async function loadCursos() {
    dlog("loadCursos()");
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

      dlog("loadCursos raw activos:", activosRaw);
      dlog("loadCursos raw inactivos:", inactivosRaw);

      const raw = [
        ...(Array.isArray(activosRaw) ? activosRaw : []),
        ...(Array.isArray(inactivosRaw) ? inactivosRaw : []),
      ];

      state.raw = raw;
      state.data = raw.map((c) => ({
        id: c.id,
        nombre: c.nombre,

        tutor: tmap[c.tutor] || "Tutor #" + c.tutor,
        tutor_id: c.tutor,

        prioridad_id: c.prioridad,
        prioridad_nombre: pmap[c.prioridad] || "#" + c.prioridad,

        categoria_id: c.categoria,
        categoria_nombre: cmap[c.categoria] || "#" + c.categoria,

        calendario_id: c.calendario,
        calendario_nombre: calmap[c.calendario] || "#" + c.calendario,

        tipo_eval_id: c.tipo_evaluacion,
        tipo_eval_nombre: temap[c.tipo_evaluacion] || "#" + c.tipo_evaluacion,

        actividades_id: c.actividades,
        actividades_nombre: ammap[c.actividades] || "#" + c.actividades,

        precio: c.precio,
        certificado: !!c.certificado,
        fecha: c.fecha_inicio,
        estatus: Number(c.estatus),
        _all: c,
      }));

      dlog("state.data cursos:", state.data);
      drawCursos();
    } catch (err) {
      derr("loadCursos error:", err);
      const list = qs("#recursos-list");
      if (list)
        list.innerHTML = `<div style="padding:1rem;color:#b00020;">Error al cargar cursos</div>`;
      const m = qs("#recursos-list-mobile");
      if (m) m.innerHTML = "";
      toast("No se pudieron cargar cursos", "error");
    }
  }

  function drawCursos() {
    dlog("drawCursos() rows:", state.data.length);
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
            ${
              Number(it.estatus) === 0
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
  function renderCursoDrawer(dataset) {
    dlog(
      "renderCursoDrawer IN dataset:",
      dataset,
      "state.currentDrawer:",
      state.currentDrawer
    );
    const item = state.data.find((x) => String(x.id) === dataset.id);
    const mode =
      state.currentDrawer && state.currentDrawer.mode
        ? state.currentDrawer.mode
        : item
        ? "view"
        : "create";
    const isCreate = mode === "create" || !item;
    const isEdit = mode === "edit";
    const isView = mode === "view" && !!item;
    const c = isCreate ? getEmptyCourse() : item ? item._all : null;
    if (!c) {
      dlog("renderCursoDrawer: curso no encontrado");
      return "<p>No encontrado.</p>";
    }
    dlog(
      "renderCursoDrawer mode:",
      mode,
      "isCreate:",
      isCreate,
      "isEdit:",
      isEdit,
      "isView:",
      isView,
      "curso:",
      c
    );

    // helpers
    const inText = (id, val, ph = "") =>
      `<input id="${id}" type="text" value="${escapeAttr(
        val || ""
      )}" placeholder="${escapeAttr(ph)}" />`;
    const inNum = (id, val, min = "0") =>
      `<input id="${id}" type="number" value="${escapeAttr(
        val != null ? val : ""
      )}" min="${min}" />`;
    const inDate = (id, val) =>
      `<input id="${id}" type="date" value="${escapeAttr(val || "")}" />`;
    const inCheck = (id, val) =>
      `<label class="gc-inline"><input id="${id}" type="checkbox" ${
        Number(val) ? "checked" : ""
      }/> <span>Sí</span></label>`;
    const inSel = (id, opts) => `<select id="${id}">${opts}</select>`;
    const inTA = (id, val, rows = 4) =>
      `<textarea id="${id}" rows="${rows}">${escapeHTML(val || "")}</textarea>`;

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

    const field = (label, value, inputHTML) => `
    <div class="field">
      <div class="label">${escapeHTML(label)}</div>
      <div class="value">${
        isEdit || isCreate ? inputHTML : escapeHTML(value != null ? value : "-")
      }</div>
    </div>`;

    // acciones
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
        ${
          isEdit
            ? `<button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button>`
            : ""
        }
        ${
          isEdit
            ? `<button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button>`
            : ""
        }
        <button class="gc-btn gc-btn--danger" id="btn-delete" data-step="1">Eliminar</button>
        ${
          isInactive
            ? `<button class="gc-btn gc-btn--success" id="btn-reactivar">Reactivar</button>`
            : ""
        }
      </div>`;
    }

    // contenido
    let html = `
    ${controlsRow}

    ${field(
      "Nombre",
      c.nombre,
      inText("f_nombre", c.nombre, "Nombre del curso")
    )}
    ${field(
      "Descripción breve",
      c.descripcion_breve,
      inTA("f_desc_breve", c.descripcion_breve, 3)
    )}
    ${field(
      "Descripción media",
      c.descripcion_media,
      inTA("f_desc_media", c.descripcion_media, 4)
    )}
    ${field(
      "Descripción del curso",
      c.descripcion_curso,
      inTA("f_desc_curso", c.descripcion_curso, 6)
    )}
    ${field("Dirigido a", c.dirigido, inTA("f_dirigido", c.dirigido, 3))}
    ${field(
      "Competencias",
      c.competencias,
      inTA("f_competencias", c.competencias, 3)
    )}

    <div class="grid-3">
      ${field(
        "Tutor",
        state.tutorsMap && state.tutorsMap[c.tutor]
          ? state.tutorsMap[c.tutor]
          : c.tutor,
        inSel("f_tutor", tutorOptions)
      )}
      ${field(
        "Categoría",
        state.categoriasMap && state.categoriasMap[c.categoria]
          ? state.categoriasMap[c.categoria]
          : c.categoria,
        inSel("f_categoria", catOptions)
      )}
      ${field(
        "Prioridad",
        state.prioMap && state.prioMap[c.prioridad]
          ? state.prioMap[c.prioridad]
          : c.prioridad,
        inSel("f_prioridad", prioOptions)
      )}
    </div>

    <div class="grid-3">
      ${field(
        "Tipo de evaluación",
        state.tipoEvalMap && state.tipoEvalMap[c.tipo_evaluacion]
          ? state.tipoEvalMap[c.tipo_evaluacion]
          : c.tipo_evaluacion,
        inSel("f_tipo_eval", tipoOptions)
      )}
      ${field(
        "Actividades",
        state.actividadesMap && state.actividadesMap[c.actividades]
          ? state.actividadesMap[c.actividades]
          : c.actividades,
        inSel("f_actividades", actOptions)
      )}
      ${field(
        "Calendario",
        state.calendarioMap && state.calendarioMap[c.calendario]
          ? state.calendarioMap[c.calendario]
          : c.calendario,
        inSel("f_calendario", calOptions)
      )}
    </div>

    <div class="grid-3">
      ${field(
        "Horas",
        c.horas,
        inNum("f_horas", c.horas != null ? c.horas : 0)
      )}
      ${field(
        "Precio",
        c.precio === 0 ? "Gratuito" : fmtMoney(c.precio),
        inNum("f_precio", c.precio != null ? c.precio : 0)
      )}
      ${field(
        "Certificado",
        Number(c.certificado) ? "Sí" : "No",
        inCheck("f_certificado", c.certificado)
      )}
    </div>

    ${field(
      "Fecha de inicio",
      c.fecha_inicio,
      inDate("f_fecha", c.fecha_inicio)
    )}
  `;

    // IMAGEN
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
        <div class="value"><div id="media-curso" data-id="${
          c.id != null ? c.id : item ? item.id : ""
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
    dlog(
      "renderCursoDrawer set header and state.currentDrawer:",
      state.currentDrawer
    );

    // bindings
    setTimeout(() => {
      dlog("renderCursoDrawer BINDINGS start");
      disableDrawerInputs(!(isEdit || isCreate));

      // CREAR: seleccionar imagen
      if (isCreate) {
        const card = document.getElementById("create-media-curso");
        const btn = document.getElementById("create-media-edit");
        const thumb = document.getElementById("create-media-thumb");
        if (btn && thumb && card) {
          btn.addEventListener("click", () => {
            dlog("create image picker clicked");
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/png, image/jpeg";
            input.style.display = "none";
            document.body.appendChild(input);

            input.addEventListener("change", () => {
              const file = input.files && input.files[0];
              document.body.removeChild(input);
              dlog(
                "create image picked:",
                file && { name: file.name, size: file.size, type: file.type }
              );
              if (!file) return;

              const v = validarImagen(file, { maxMB: 2 });
              if (!v.ok) {
                toast(v.error, "error");
                return;
              }

              renderPreviewUI(
                card,
                file,
                async () => {
                  state.tempNewCourseImage = file;
                  try {
                    if (thumb.dataset && thumb.dataset.blobUrl)
                      URL.revokeObjectURL(thumb.dataset.blobUrl);
                  } catch (_) {}
                  const blobUrl = URL.createObjectURL(file);
                  if (thumb.dataset) thumb.dataset.blobUrl = blobUrl;
                  thumb.src = blobUrl;
                  dlog("create image set preview blobUrl:", blobUrl);
                  toast("Imagen seleccionada (se subirá al guardar)", "exito");
                },
                () => {
                  dlog("create image preview cancel");
                }
              );
            });

            input.click();
          });
        }
      }

      // guardar/editar
      const btnSave = qs("#btn-save");
      if (btnSave)
        btnSave.addEventListener("click", async (e) => {
          e.stopPropagation();
          try {
            dlog("btn-save clicked, isCreate:", isCreate);
            if (isCreate)
              await saveNewCurso(); // sube state.tempNewCourseImage al final
            else await saveUpdateCurso(item);
          } catch (err) {
            derr("btn-save error:", err);
            toast("Error al guardar", "error");
          }
        });

      const bEdit = qs("#btn-edit");
      if (bEdit)
        bEdit.addEventListener("click", (e) => {
          e.stopPropagation();
          dlog("btn-edit clicked for id:", item && item.id);
          state.currentDrawer = {
            type: "curso",
            id: item ? item.id : null,
            mode: "edit",
          };
          qs("#drawer-body").innerHTML = renderCursoDrawer({
            id: String(item ? item.id : ""),
          });
        });

      const bCancel = qs("#btn-cancel");
      if (bCancel)
        bCancel.addEventListener("click", (e) => {
          e.stopPropagation();
          dlog("btn-cancel clicked, isCreate:", isCreate);
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
        bDel.addEventListener("click", async (e) => {
          e.stopPropagation();
          const step = bDel.getAttribute("data-step") || "1";
          dlog("btn-delete clicked step:", step);
          if (step === "1") {
            bDel.textContent = "Confirmar";
            bDel.setAttribute("data-step", "2");
            setTimeout(() => {
              if (bDel.getAttribute("data-step") === "2") {
                bDel.textContent = "Eliminar";
                bDel.setAttribute("data-step", "1");
              }
            }, 4000);
            return;
          }
          try {
            await softDeleteCurso(item);
            toast("Curso eliminado (inactivo)", "exito");
            closeDrawer();
            await loadCursos();
          } catch (err) {
            derr("softDeleteCurso error:", err);
            toast("No se pudo eliminar", "error");
          }
        });

      const bReact = qs("#btn-reactivar");
      if (bReact)
        bReact.addEventListener("click", async (e) => {
          e.stopPropagation();
          dlog("btn-reactivar clicked:", item && item.id);
          try {
            await reactivateCurso(Number(item && item.id));
            toast("Curso reactivado", "exito");
            await loadCursos();
            const re = state.data.find((x) => item && x.id === item.id);
            if (re)
              openDrawer(
                "Curso · " + re.nombre,
                renderCursoDrawer({ id: String(re.id) })
              );
          } catch (err) {
            derr("reactivateCurso error:", err);
            toast("No se pudo reactivar", "error");
          }
        });

      // montar media
      const contCurso = document.getElementById("media-curso");
      if (contCurso) {
        const cid = Number(c.id != null ? c.id : item ? item.id : 0);
        dlog(
          "mountReadOnlyMedia for curso id:",
          cid,
          "editable:",
          isEdit && isAdminUser
        );
        if (!Number.isNaN(cid) && cid) {
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
      dlog("renderCursoDrawer BINDINGS end");
    }, 0);

    return html;
  }

  function disableDrawerInputs(disabled) {
    dlog("disableDrawerInputs:", disabled);
    qsa(
      "#drawer-body input, #drawer-body select, #drawer-body textarea"
    ).forEach((el) => {
      el.disabled = !!disabled;
    });
  }

  function getEmptyCourse() {
    const ec = {
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
    dlog("getEmptyCourse() ->", ec);
    return ec;
  }

  function mapToOptions(map, selectedId) {
    const pairs = Object.entries(map || {});
    const clean = pairs.filter(function (arr) {
      return arr[0] !== "_ts";
    });
    if (!clean.length) return `<option value="">—</option>`;
    const html = clean
      .map(function (entry) {
        const id = entry[0],
          name = entry[1];
        const sel = String(selectedId) === String(id) ? "selected" : "";
        return `<option value="${escapeAttr(
          id
        )}" ${sel}>${escapeHTML(name)}</option>`;
      })
      .join("");
    return html;
  }

  function readCursoForm(existingId) {
    const read = (id) => (qs("#" + id) ? qs("#" + id).value : "");
    const readN = (id, def) =>
      Number(qs("#" + id) ? qs("#" + id).value : def != null ? def : 0);
    const readCh = (id) => (qs("#" + id) && qs("#" + id).checked ? 1 : 0);

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
      creado_por: Number((currentUser && currentUser.id) || 0) || 1,
    };
    if (existingId != null) payload.id = Number(existingId);
    dlog("readCursoForm ->", payload);
    return payload;
  }

  // ---- Upload imagen
  async function uploadCursoImagen(cursoId, file) {
    dlog(
      "uploadCursoImagen ->",
      cursoId,
      file && { name: file.name, size: file.size, type: file.type }
    );
    if (!API_UPLOAD || !API_UPLOAD.cursoImg)
      throw new Error("API_UPLOAD.cursoImg no configurado");
    const v = validarImagen(file, { maxMB: 2 });
    if (!v.ok) throw new Error(v.error);

    const fd = new FormData();
    fd.append("curso_id", String(cursoId));
    fd.append("imagen", file);

    const res = await fetch(API_UPLOAD.cursoImg, { method: "POST", body: fd });
    const raw = await res.text();
    dlog("uploadCursoImagen <- status:", res.status, "raw:", raw);
    let json = {};
    try {
      json = raw ? JSON.parse(raw) : {};
    } catch (e) {
      derr("uploadCursoImagen parse error:", e, "raw:", raw);
    }
    if (!res.ok || (json && json.error)) {
      throw new Error((json && json.error) || "HTTP " + res.status);
    }
    return json;
  }

  // Crear curso + (opcional) subir imagen
  async function saveNewCurso() {
    try {
      dlog("saveNewCurso()");
      const payload = readCursoForm(null);

      if (!payload.nombre) return toast("Falta el nombre", "warning");
      if (!payload.tutor) return toast("Selecciona tutor", "warning");
      if (!payload.categoria) return toast("Selecciona categoría", "warning");
      if (!payload.fecha_inicio)
        return toast("Fecha de inicio requerida", "warning");

      const res = await postJSON(API.iCursos, payload);
      dlog("saveNewCurso res:", res);

      const newId = Number(
        (res &&
          (res.id ||
            res.curso_id ||
            res.insert_id ||
            (res.data && res.data.id))) ||
          0
      );
      dlog("saveNewCurso newId:", newId);

      if (!newId) {
        dwarn("Respuesta de iCursos sin id utilizable:", res);
        toast("Curso creado, pero no se recibió ID", "warning");
      }

      const fileToUpload = state.tempNewCourseImage || null;
      if (newId && fileToUpload) {
        try {
          await uploadCursoImagen(newId, fileToUpload);
          toast("Imagen subida", "exito");
        } catch (err) {
          derr("upload after create error:", err);
          toast("Curso creado, pero falló la subida de imagen", "error");
        } finally {
          state.tempNewCourseImage = null;
        }
      }

      toast("Curso creado", "exito");
      closeDrawer();
      await loadCursos();

      if (newId) {
        const re = state.data.find((x) => x.id === newId);
        if (re)
          openDrawer(
            "Curso · " + re.nombre,
            renderCursoDrawer({ id: String(re.id) })
          );
      }
    } catch (e) {
      derr("saveNewCurso error:", e);
      toast("No se pudo crear el curso", "error");
    }
  }

  // Actualizar curso + (opcional) subir imagen si hay archivo seleccionado
  async function saveUpdateCurso(item) {
    try {
      dlog("saveUpdateCurso item:", item);
      if (!item || !item._all)
        return toast("Sin item para actualizar", "error");
      const payload = readCursoForm(item.id);
      const res = await postJSON(API.uCursos, payload);
      dlog("saveUpdateCurso res:", res);

      const f =
        qs("#f_curso_img") &&
        qs("#f_curso_img").files &&
        qs("#f_curso_img").files[0];
      if (f) {
        try {
          await uploadCursoImagen(item.id, f);
          toast("Imagen actualizada", "exito");
        } catch (err) {
          derr("upload image in update error:", err);
          toast("Se guardó el curso, pero falló la imagen", "error");
        }
      }

      toast("Cambios guardados", "exito");
      await loadCursos();
      const re = state.data.find((x) => x.id === item.id);
      if (re)
        openDrawer(
          "Curso · " + re.nombre,
          renderCursoDrawer({ id: String(re.id) })
        );
    } catch (e) {
      derr("saveUpdateCurso error:", e);
      toast("No se pudo guardar", "error");
    }
  }

  async function softDeleteCurso(item) {
    dlog("softDeleteCurso item:", item && item._all);
    if (!item || !item._all) throw new Error("Item inválido");
    const base = Object.assign({}, item._all, { estatus: 0 });
    const res = await postJSON(API.uCursos, base);
    dlog("softDeleteCurso res:", res);
  }

  async function reactivateCurso(id) {
    dlog("reactivateCurso id:", id);
    const it = state.data.find((x) => x.id === Number(id));
    if (!it || !it._all) throw new Error("Curso no encontrado");
    const body = Object.assign({}, it._all, { estatus: 1 });
    const res = await postJSON(API.uCursos, body);
    dlog("reactivateCurso res:", res);
  }

  // ---------- NOTICIAS ----------
  async function loadNoticias() {
    dlog("loadNoticias()");
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

      dlog("state.data noticias:", state.data);
      drawNoticias();
    } catch (err) {
      derr("loadNoticias error:", err);
      const list = qs("#recursos-list");
      if (list)
        list.innerHTML = `<div style="padding:1rem;color:#b00020;">Error al cargar noticias</div>`;
      const m = qs("#recursos-list-mobile");
      if (m) m.innerHTML = "";
      toast("No se pudieron cargar noticias", "error");
    }
  }

  async function getCommentsCount(noticiaId) {
    dlog("getCommentsCount noticiaId:", noticiaId);
    const res = await postJSON(API.comentarios, {
      noticia_id: Number(noticiaId),
      estatus: 1,
    });
    const arr = Array.isArray(res) ? res : [];
    let total = 0;
    for (let i = 0; i < arr.length; i++) {
      const c = arr[i];
      total += 1;
      if (c && Array.isArray(c.respuestas)) total += c.respuestas.length;
    }
    dlog("comments count ->", total);
    return total;
  }

  function drawNoticias() {
    dlog("drawNoticias() rows:", state.data.length);
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
              ${
                Number(it.estatus) === 0
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
    dlog("inactivateNoticia id:", id);
    const it = state.data.find((x) => x.id === Number(id));
    if (!it || !it._all) throw new Error("Noticia no encontrada");
    if (!API.uNoticias) throw new Error("Endpoint u_noticia no configurado");
    const body = Object.assign({}, it._all, { estatus: 0 });
    const res = await postJSON(API.uNoticias, body);
    dlog("inactivateNoticia res:", res);
  }

  async function reactivateNoticia(id) {
    dlog("reactivateNoticia id:", id);
    const it = state.data.find((x) => x.id === Number(id));
    if (!it || !it._all) throw new Error("Noticia no encontrada");
    if (!API.uNoticias) {
      toast("Falta endpoint u_noticia.php en backend", "warning", 3500);
      return false;
    }
    const body = Object.assign({}, it._all, { estatus: 1 });
    const res = await postJSON(API.uNoticias, body);
    dlog("reactivateNoticia res:", res);
    return true;
  }

  // ---- Drawer Noticia
  function renderNoticiaDrawer(dataset) {
    dlog("renderNoticiaDrawer dataset:", dataset);
    const item = state.data.find((x) => String(x.id) === dataset.id);
    const n = item && item._all;
    if (!n) return "<p>No encontrado.</p>";

    const mode =
      state.currentDrawer &&
      state.currentDrawer.type === "noticia" &&
      state.currentDrawer.id === n.id
        ? state.currentDrawer.mode
        : "view";
    const isEdit = mode === "edit";
    const isView = !isEdit;
    const isInactive = Number(n.estatus) === 0;

    const controlsRow = isAdminUser
      ? `
        <div class="gc-actions">
          ${
            isView ? `<button class="gc-btn" id="btn-edit">Editar</button>` : ""
          }
          ${
            isEdit
              ? `<button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button>`
              : ""
          }
          ${
            isEdit
              ? `<button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button>`
              : ""
          }
          ${
            isInactive
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
        <div class="value"><div id="media-noticia" data-id="${
          n.id
        }"></div></div>
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
      qs("#drawer-title").textContent =
        "Noticia · " + (item ? item.titulo : "") + " (edición)";
      state.currentDrawer = { type: "noticia", id: n.id, mode: "edit" };
    } else {
      qs("#drawer-title").textContent =
        "Noticia · " + (item ? item.titulo : "");
      state.currentDrawer = { type: "noticia", id: n.id, mode: "view" };
    }
    dlog("renderNoticiaDrawer: set header and state", state.currentDrawer);

    // Bind acciones
    setTimeout(() => {
      dlog("renderNoticiaDrawer BINDINGS start");
      const be = qs("#btn-edit");
      if (be)
        be.addEventListener("click", (e) => {
          e.stopPropagation();
          dlog("noticia btn-edit");
          state.currentDrawer = { type: "noticia", id: n.id, mode: "edit" };
          qs("#drawer-body").innerHTML = renderNoticiaDrawer({
            id: String(n.id),
          });
        });

      const bc = qs("#btn-cancel");
      if (bc)
        bc.addEventListener("click", (e) => {
          e.stopPropagation();
          dlog("noticia btn-cancel");
          state.currentDrawer = { type: "noticia", id: n.id, mode: "view" };
          qs("#drawer-body").innerHTML = renderNoticiaDrawer({
            id: String(n.id),
          });
        });

      const bs = qs("#btn-save");
      if (bs)
        bs.addEventListener("click", async (e) => {
          e.stopPropagation();
          dlog("noticia btn-save (noop demo)");
          toast("Cambios guardados", "exito");
          state.currentDrawer = { type: "noticia", id: n.id, mode: "view" };
          await loadNoticias();
          const re = state.data.find((x) => x.id === n.id);
          if (re)
            openDrawer(
              "Noticia · " + re.titulo,
              renderNoticiaDrawer({ id: String(re.id) })
            );
        });

      const bDel = qs("#btn-delete");
      if (bDel)
        bDel.addEventListener("click", async (e) => {
          e.stopPropagation();
          const step = bDel.getAttribute("data-step") || "1";
          dlog("noticia btn-delete step:", step);
          if (step === "1") {
            bDel.textContent = "Confirmar";
            bDel.setAttribute("data-step", "2");
            setTimeout(() => {
              if (bDel.getAttribute("data-step") === "2") {
                bDel.textContent = "Eliminar";
                bDel.setAttribute("data-step", "1");
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
            derr("inactivateNoticia error:", err);
            toast("No se pudo eliminar", "error");
          }
        });

      const br = qs("#btn-reactivar");
      if (br)
        br.addEventListener("click", async (e) => {
          e.stopPropagation();
          dlog("noticia btn-reactivar");
          const ok = await reactivateNoticia(n.id);
          if (ok) {
            toast("Noticia reactivada", "exito");
            await loadNoticias();
            const re = state.data.find((x) => x.id === n.id);
            if (re)
              openDrawer(
                "Noticia · " + re.titulo,
                renderNoticiaDrawer({ id: String(re.id) })
              );
          }
        });

      disableDrawerInputs(!isEdit);
      dlog("renderNoticiaDrawer BINDINGS end");
    }, 0);

    return html;
  }

  // ---------- CUENTAS ----------
  function drawCuentas() {
    dlog("drawCuentas()");
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

    mount.querySelector("#btn-delete-account") &&
      mount
        .querySelector("#btn-delete-account")
        .addEventListener("click", () => safeOpen("openModalDeleteAccount"));
    mount.querySelector("#btn-privacy") &&
      mount
        .querySelector("#btn-privacy")
        .addEventListener("click", () => safeOpen("openModalPrivacy"));
    mount.querySelector("#btn-notifications") &&
      mount
        .querySelector("#btn-notifications")
        .addEventListener("click", () => safeOpen("openModalNotifications"));
    mount.querySelector("#btn-privacy-toggles") &&
      mount
        .querySelector("#btn-privacy-toggles")
        .addEventListener("click", () => safeOpen("openModalPrivacyToggles"));
    mount.querySelector("#btn-switch-account") &&
      mount
        .querySelector("#btn-switch-account")
        .addEventListener("click", () => safeOpen("openModalSwitchAccount"));
  }

  // ---------- Drawer base ----------
  function openDrawer(title, bodyHTML) {
    dlog("openDrawer ->", title);
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
    dlog("closeDrawer");
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
    return String(str != null ? str : "").replace(/[&<>'"]/g, function (s) {
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
    return String(str != null ? str : "").replace(/"/g, "&quot;");
  }
  function fmtDate(d) {
    if (!d) return "-";
    try {
      const parts = String(d).split("-");
      const y = parts[0],
        m = parts[1],
        day = parts[2];
      return `${day}/${m}/${y}`;
    } catch {
      return d;
    }
  }
  function fmtDateTime(dt) {
    if (!dt) return "-";
    try {
      const parts = String(dt).split(" ");
      return (fmtDate(parts[0]) + " " + (parts[1] || "")).trim();
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
    return `<div class="field"><div class="label">${escapeHTML(
      label
    )}</div><div class="value">${escapeHTML(
      val != null ? val : "-"
    )}</div></div>`;
  }

  function withBust(url) {
    try {
      const u = new URL(url, window.location.origin);
      u.searchParams.set("v", String(Date.now()));
      return u.pathname + "?" + u.searchParams.toString();
    } catch {
      return url + (url.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now();
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
    const safe = escapeHTML(JSON.stringify(obj || {}, null, 2));
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
  function validarImagen(file, opt) {
    opt = opt || {};
    const maxMB = typeof opt.maxMB === "number" ? opt.maxMB : 2;
    if (!file) return { ok: false, error: "No se seleccionó archivo" };
    const allowed = ["image/jpeg", "image/png"];
    if (allowed.indexOf(file.type) === -1) {
      return { ok: false, error: "Formato no permitido. Solo JPG o PNG" };
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxMB) {
      return { ok: false, error: "La imagen excede " + maxMB + "MB" };
    }
    return { ok: true };
  }

  function humanSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  }

  // ---- Modal / preview de imagen
  function renderPreviewUI(cardEl, file, onConfirm, onCancel) {
    dlog(
      "renderPreviewUI file:",
      file && { name: file.name, size: file.size, type: file.type }
    );
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
      hadInert: drawer ? !!drawer.hasAttribute("inert") : false,
    };

    const lockScroll = () => {
      document.body.style.overflow = "hidden";
    };

    const overlay = document.createElement("div");
    overlay.className = "gc-preview-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.style.cssText =
      "position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; background: rgba(17,24,39,.55); backdrop-filter: saturate(120%) blur(2px);";

    if (drawer) {
      drawer.style.pointerEvents = "none";
      drawer.style.filter = "blur(1px)";
      drawer.style.zIndex = "1";
      drawer.setAttribute("aria-hidden", "true");
      try {
        drawer.setAttribute("inert", "");
      } catch (_) {}
    }
    if (drawerOverlay && drawerOverlay.style) {
      drawerOverlay.style.zIndex = "2";
    }

    const modal = document.createElement("div");
    modal.className = "gc-preview-modal";
    modal.style.cssText =
      "background:#fff; border-radius:14px; box-shadow:0 20px 40px rgba(0,0,0,.25); width:min(920px,94vw); max-height:90vh; overflow:hidden; display:flex; flex-direction:column;";

    const header = document.createElement("div");
    header.style.cssText =
      "display:flex; align-items:center; justify-content:space-between; gap:8px; padding:12px 16px; border-bottom:1px solid #eee;";
    header.innerHTML =
      '<div style="font-weight:700; font-size:1.05rem;">Vista previa de imagen</div><button class="gc-btn gc-btn--ghost" data-act="close" aria-label="Cerrar" style="min-width:auto;padding:.35rem .6rem;">✕</button>';

    const body = document.createElement("div");
    body.style.cssText =
      "display:grid; grid-template-columns:1fr 280px; gap:16px; padding:16px; align-items:start;";

    const imgWrap = document.createElement("div");
    imgWrap.style.cssText =
      "border:1px solid #eee; border-radius:12px; padding:8px; background:#fafafa; display:flex; align-items:center; justify-content:center; min-height:320px; max-height:60vh;";
    imgWrap.innerHTML =
      '<img src="' +
      url +
      '" alt="Vista previa" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:8px;">';

    const side = document.createElement("div");
    side.style.cssText =
      "border-left:1px dashed #e6e6e6; padding-left:16px; display:flex; flex-direction:column; gap:10px;";
    side.innerHTML =
      "" +
      '<div style="font-weight:600;">Detalles</div>' +
      '<div style="font-size:.92rem; color:#444; line-height:1.35;">' +
      "  <div><strong>Archivo:</strong> " +
      escapeHTML(file.name) +
      "</div>" +
      "  <div><strong>Peso:</strong> " +
      humanSize(file.size) +
      "</div>" +
      "  <div><strong>Tipo:</strong> " +
      escapeHTML(file.type || "desconocido") +
      "</div>" +
      '  <div style="margin-top:6px; color:#666;">Formatos permitidos: JPG / PNG · Máx 2MB</div>' +
      "</div>" +
      '<div style="margin-top:auto; display:flex; gap:8px; flex-wrap:wrap;">' +
      '  <button class="gc-btn gc-btn--primary" data-act="confirm">Subir</button>' +
      '  <button class="gc-btn gc-btn--ghost" data-act="cancel">Cancelar</button>' +
      "</div>";

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

    const cleanup = () => {
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
        } catch (_) {}
      }
      if (drawerOverlay && drawerOverlay.style)
        drawerOverlay.style.zIndex = prev.overlayZ || "";
      document.body.style.overflow = "";
      try {
        URL.revokeObjectURL(url);
      } catch (_) {}
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
      onCancel && onCancel();
      cleanup();
    });
    side
      .querySelector('[data-act="confirm"]')
      .addEventListener("click", async (e) => {
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
    const editableOverride = opt ? opt.editable : void 0;
    if (!container) {
      dwarn("mountReadOnlyMedia: missing container");
      return;
    }

    const editable =
      typeof editableOverride === "boolean"
        ? editableOverride
        : isAdminUser &&
          state.currentDrawer &&
          state.currentDrawer.mode === "edit";

    const urls = mediaUrlsByType(type, id);
    dlog(
      "mountReadOnlyMedia type:",
      type,
      "id:",
      id,
      "urls:",
      urls,
      "editable:",
      editable
    );
    const grid = document.createElement("div");
    grid.className = "media-grid";

    urls.forEach((url, i) => {
      const label = labels[i] || "Imagen " + (i + 1);
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
      </div>`;

      const img = card.querySelector("img");
      img.onerror = () => {
        img.onerror = null;
        img.src = "data:image/svg+xml;utf8," + encodeURIComponent(noImageSvg());
      };

      if (editable) {
        const btnEdit = card.querySelector(".media-edit");
        if (btnEdit) {
          btnEdit.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            dlog("media edit click -> type:", type, "id:", id, "pos:", i);

            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/png, image/jpeg";
            input.style.display = "none";
            document.body.appendChild(input);

            input.addEventListener("change", async () => {
              const file = input.files && input.files[0];
              document.body.removeChild(input);
              dlog(
                "media picked:",
                file && { name: file.name, size: file.size, type: file.type }
              );
              if (!file) return;

              const v = validarImagen(file, { maxMB: 2 });
              if (!v.ok) return toast(v.error, "error");

              renderPreviewUI(
                card,
                file,
                async () => {
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
                      const raw = await res.text();
                      dlog("media upload curso <-", res.status, raw);
                      let json = {};
                      try {
                        json = raw ? JSON.parse(raw) : {};
                      } catch (e) {
                        derr("media upload parse error:", e, raw);
                      }
                      if (!res.ok || (json && json.error))
                        throw new Error(
                          (json && json.error) || "HTTP " + res.status
                        );

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
                      const raw = await res.text();
                      dlog("media upload noticia <-", res.status, raw);
                      let json = {};
                      try {
                        json = raw ? JSON.parse(raw) : {};
                      } catch (e) {
                        derr("media upload parse error:", e, raw);
                      }
                      if (!res.ok || (json && json.error))
                        throw new Error(
                          (json && json.error) || "HTTP " + res.status
                        );

                      img.src = withBust((json && json.url) || url);
                      toast(
                        "Imagen " + pos + " de noticia actualizada",
                        "exito"
                      );
                      return;
                    }
                  } catch (err) {
                    derr("media upload error:", err);
                    toast("No se pudo subir la imagen", "error");
                  }
                },
                () => {
                  dlog("media preview cancel");
                }
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
      ${
        editable
          ? `<div class="media-help" style="color:#666;">Formatos: JPG/PNG · Máx 2MB</div>`
          : `<div class="media-help" style="color:#888;">Solo lectura</div>`
      }
    </div>`;
    container.appendChild(grid);
  }
  //---------------------------------- fin del bloque de imágenes

  // ---- Toolbar / botones
  function bindUI() {
    dlog("bindUI()");
    qsa(".admin-dash .admin-nav").forEach((btn) => {
      btn.addEventListener("click", () => {
        const route = btn.dataset.route || btn.getAttribute("href");
        dlog("nav click ->", route);
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
    if (addBtn)
      addBtn.addEventListener("click", async () => {
        dlog("btn-add clicked route:", state.route);
        if (!isAdminUser) return;
        if (state.route.indexOf("#/cursos") === 0) {
          await openCreateCurso();
        } else if (state.route.indexOf("#/noticias") === 0) {
          toast("Crear noticia: pendiente de implementar", "warning");
        }
      });
  }

  async function openCreateCurso() {
    if (!isAdminUser) return;
    try {
      dlog("openCreateCurso()");
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
      derr("openCreateCurso error:", e);
      toast("No se pudo abrir el formulario", "error");
    }
  }

  // ---- INIT
  document.addEventListener("DOMContentLoaded", async () => {
    dlog("DOMContentLoaded");
    currentUser = getUsuarioFromCookie();
    const uid = Number((currentUser && currentUser.id) || 0);
    isAdminUser = ADMIN_IDS.indexOf(uid) >= 0;
    dlog("currentUser:", currentUser, "uid:", uid, "isAdminUser:", isAdminUser);

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
    } catch (e) {
      derr("INIT catalogs error:", e);
    }

    if (!window.location.hash)
      window.location.hash = isAdminUser ? "#/cursos" : "#/cuentas";
    onRouteChange();
  });
})();
