(() => {
  const setVH = () => {
    document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
  };
  setVH();
  window.addEventListener("resize", setVH);

  // ENDPOINTS 
  const API = {
    cursos: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_cursos.php",
    iCursos: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_cursos.php",
    uCursos: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/u_cursos.php",

    noticias: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_noticia.php",
    comentarios: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_comentario_noticia.php",

    tutores: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_tutor.php",
    prioridad: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_prioridad.php",

    categorias: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_categorias.php",
    calendario: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_dias_curso.php",
    tipoEval: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_tipo_evaluacion.php",
    actividades: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_actividades.php",
  };

  const ADMIN_IDS = [1, 4, 12, 13]; // los ids de admins

  let currentUser = null;
  let isAdminUser = false;

  // ---------------- estado global 
  const state = {
    route: "#/cursos",
    page: 1,
    pageSize: 10,
    data: [],
    raw: [],
    devMode: false,
    tutorsMap: null,
    prioMap: null,

    categoriasMap: null,
    calendarioMap: null,
    tipoEvalMap: null,
    actividadesMap: null,

    currentDrawer: null, // {type:'curso'|'noticia', id:number|null, mode:'view'|'edit'|'create'}
  };
  const DEV_ALLOWED_IDS = [1, 13];  // esto solo es para debug
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
  const toast = (msg, tipo = "exito", dur = 2500) =>
    window.gcToast ? window.gcToast(msg, tipo, dur) : console.log(`[${tipo}] ${msg}`);

  function getUsuarioFromCookie() {
    const c = document.cookie.split("; ").find(r => r.startsWith("usuario="));
    if (!c) return null;
    try { return JSON.parse(decodeURIComponent(c.split("=")[1])); }
    catch { return null; }
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

  async function getTutorsMap() {
    if (state.tutorsMap && Date.now() - state.tutorsMap._ts < 30 * 60 * 1000) return state.tutorsMap;
    const arr = await postJSON(API.tutores, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach(t => map[t.id] = t.nombre);
    map._ts = Date.now();
    state.tutorsMap = map;
    return map;
  }

  async function getPrioridadMap() {
    if (state.prioMap && Date.now() - state.prioMap._ts < 30 * 60 * 1000) return state.prioMap;
    const arr = await postJSON(API.prioridad, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach(p => map[p.id] = p.nombre);
    map._ts = Date.now();
    state.prioMap = map;
    return map;
  }

  async function getCategoriasMap() {
    if (state.categoriasMap && Date.now() - state.categoriasMap._ts < 30 * 60 * 1000) return state.categoriasMap;
    const arr = await postJSON(API.categorias, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach(c => map[c.id] = c.nombre);
    map._ts = Date.now();
    state.categoriasMap = map;
    return map;
  }

  async function getCalendarioMap() {
    if (state.calendarioMap && Date.now() - state.calendarioMap._ts < 30 * 60 * 1000) return state.calendarioMap;
    const arr = await postJSON(API.calendario, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach(c => map[c.id] = c.nombre);
    map._ts = Date.now();
    state.calendarioMap = map;
    return map;
  }

  async function getTipoEvalMap() {
    if (state.tipoEvalMap && Date.now() - state.tipoEvalMap._ts < 30 * 60 * 1000) return state.tipoEvalMap;
    const arr = await postJSON(API.tipoEval, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach(c => map[c.id] = c.nombre);
    map._ts = Date.now();
    state.tipoEvalMap = map;
    return map;
  }

  async function getActividadesMap() {
    if (state.actividadesMap && Date.now() - state.actividadesMap._ts < 30 * 60 * 1000) return state.actividadesMap;
    const arr = await postJSON(API.actividades, { estatus: 1 });
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach(c => map[c.id] = c.nombre);
    map._ts = Date.now();
    state.actividadesMap = map;
    return map;
  }

  // ------------- Restricción de navegación por rol 
  function isCuentasLink(el) {
    const href = (el.getAttribute("href") || el.dataset.route || "").toLowerCase();
    const txt = (el.textContent || "").toLowerCase();
    return href.includes("#/cuentas") || txt.includes("cuenta");
  }

  function applyAdminVisibility(isAdmin) {
    // Sidebar: deja solo "Cuentas" si NO es admin
    qsa(".gc-side .nav-item").forEach(a => {
      if (!isAdmin && !isCuentasLink(a)) {
        (a.closest("li") || a).style.display = "none";
        a.setAttribute("tabindex", "-1");
        a.setAttribute("aria-hidden", "true");
      }
    });

    // boton "Agregar" (curso) sólo para admin
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


  function setRoute(hash) {
    const target = hash || (isAdminUser ? "#/cursos" : "#/cuentas");
    if (location.hash !== target) location.hash = target;
    else onRouteChange();
  }
  window.addEventListener("hashchange", onRouteChange);

  function onRouteChange() {
    enforceRouteGuard();

    const hash = window.location.hash || (isAdminUser ? "#/cursos" : "#/cuentas");
    state.route = hash;
    state.page = 1;

    // activa item del sidebar
    qsa(".gc-side .nav-item").forEach(a => {
      const isActive = a.getAttribute("href") === hash;
      a.classList.toggle("is-active", isActive);
      a.setAttribute("aria-current", isActive ? "page" : "false");
    });

    // rutas
    if (hash.startsWith("#/cursos")) return isAdminUser ? loadCursos() : enforceRouteGuard();
    if (hash.startsWith("#/noticias")) return isAdminUser ? loadNoticias() : enforceRouteGuard();
    if (hash.startsWith("#/cuentas")) return drawCuentas();

    // fallback
    return setRoute(isAdminUser ? "#/cursos" : "#/cuentas");
  }

  // === Skeletons rapidos ===
  function showSkeletons() {
    const d = qs("#recursos-list");
    const m = qs("#recursos-list-mobile");
    if (d) d.innerHTML = "";
    if (m) m.innerHTML = "";
    const target = d || m;
    if (!target) return;
    for (let i = 0; i < 5; i++) {
      target.insertAdjacentHTML("beforeend",
        `<div class="sk-row"><div class="sk n1"></div><div class="sk n2"></div><div class="sk n3"></div></div>`);
    }
  }

  // === Render de listas (desktop + mobile) ===
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

    pageRows.forEach(item => {
      if (d) d.insertAdjacentHTML("beforeend", config.desktopRow(item));
      if (m) m.insertAdjacentHTML("beforeend", config.mobileRow(item));
    });

    const countEl = qs("#mod-count");
    if (countEl) countEl.textContent = `${rows.length} ${rows.length === 1 ? "elemento" : "elementos"}`;

    // clicks desktop -> drawer
    qsa("#recursos-list .table-row").forEach(el => {
      el.addEventListener("click", () => {
        const data = el.dataset;
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
            // Acciones inhabilitadas (noticias)
            bindDisabledNewsActions();
          }, 0);
        }
      });
    });

    // acordeón mobile
    qsa("#recursos-list-mobile .row-toggle").forEach(el => {
      el.addEventListener("click", () => el.closest(".table-row-mobile").classList.toggle("expanded"));
    });
    qsa("#recursos-list-mobile .open-drawer").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const data = btn.closest(".table-row-mobile").dataset;
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
            bindDisabledNewsActions();
          }, 0);
        }
      });
    });

    renderPagination(rows.length);
  }

  function renderPagination(total) {
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    const conts = [qs("#pagination-controls"), qs("#pagination-mobile")];
    conts.forEach(cont => {
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
    if (state.route.startsWith("#/cuentas")) return drawCuentas();
  }

  // === CURSOS ===
  async function loadCursos() {
    // header de columnas
    const title = qs("#mod-title");
    if (title) title.textContent = "Cursos";

    const hdr = qs(".recursos-box.desktop-only .table-header");
    if (hdr) {
      const c1 = hdr.querySelector(".col-nombre");
      let c2 = hdr.querySelector(".col-tutor") || hdr.querySelector(".col-tipo");
      const c3 = hdr.querySelector(".col-fecha");
      let c4 = hdr.querySelector(".col-status");
      if (c1) c1.textContent = "Nombre";
      if (c2) { c2.textContent = "Tutor"; c2.classList.add("col-tutor"); }
      if (c3) c3.textContent = "Fecha de inicio";
      if (!c4) {
        c4 = document.createElement("div");
        c4.className = "col-status";
        c4.setAttribute("role", "columnheader");
        c4.textContent = "Status";
        hdr.appendChild(c4);
      } else c4.textContent = "Status";
    }

    // meta barra
    const tt = qs(".tt-title");
    if (tt) tt.textContent = "Cursos:";
    const ttStatus = qs("#tt-status");
    if (ttStatus) {
      ttStatus.textContent = "Activo";
      ttStatus.classList.remove("badge-inactivo");
      ttStatus.classList.add("badge-activo");
    }

    showSkeletons();
    try {
      const [raw, tmap, pmap, cmap, calmap, temap, ammap] = await Promise.all([
        postJSON(API.cursos, { estatus: 1 }),
        getTutorsMap(),
        getPrioridadMap(),
        getCategoriasMap(),
        getCalendarioMap(),
        getTipoEvalMap(),
        getActividadesMap(),
      ]);

      state.raw = raw;
      state.data = (Array.isArray(raw) ? raw : []).map(c => ({
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
      if (list) list.innerHTML = `<div style="padding:1rem;color:#b00020;">Error al cargar cursos</div>`;
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
        const item = state.data.find(x => String(x.id) === d.id);
        return item ? `Curso · ${item.nombre}` : "Curso";
      },
      drawerBody: (d) => renderCursoDrawer(d),
    });
  }

  function badgePrecio(precio) {
    return Number(precio) === 0
      ? `<span class="badge-neutral">Gratuito</span>`
      : `<span class="badge-neutral">Con costo</span>`;
  }
  function badgeCurso(estatus) {
    return Number(estatus) === 1
      ? `<span class="badge-activo">Activo</span>`
      : `<span class="badge-inactivo">Inactivo</span>`;
  }
  function textCursoStatus(estatus) {
    return Number(estatus) === 1 ? "Activo" : "Inactivo";
  }

  // === Drawer Curso (view/edit/create) ===
  function renderCursoDrawer(dataset) {
    const item = state.data.find(x => String(x.id) === dataset.id);
    const mode = state.currentDrawer?.mode || "view";
    const isCreate = mode === "create";
    const isEdit = mode === "edit";
    const isView = mode === "view";

    const c = isCreate ? getEmptyCourse() : item ? item._all : null;
    if (!c) return "<p>No encontrado.</p>";

    // opciones selects
    const tutorOptions = mapToOptions(state.tutorsMap, String(c.tutor || ""));
    const prioOptions = mapToOptions(state.prioMap, String(c.prioridad || ""));
    const catOptions = mapToOptions(state.categoriasMap, String(c.categoria || ""));
    const calOptions = mapToOptions(state.calendarioMap, String(c.calendario || ""));
    const tipoOptions = mapToOptions(state.tipoEvalMap, String(c.tipo_evaluacion || ""));
    const actOptions = mapToOptions(state.actividadesMap, String(c.actividades || ""));

    // helpers de inputs
    const inText = (id, val, ph = "") => `<input id="${id}" type="text" value="${escapeAttr(val || "")}" placeholder="${escapeAttr(ph)}" />`;
    const inNum = (id, val, min = "0") => `<input id="${id}" type="number" value="${escapeAttr(val ?? "")}" min="${min}" />`;
    const inDate = (id, val) => `<input id="${id}" type="date" value="${escapeAttr(val || "")}" />`;
    const inCheck = (id, val) => `<label style="display:inline-flex;align-items:center;gap:.5rem;"><input id="${id}" type="checkbox" ${Number(val) ? "checked" : ""}/> <span>Sí</span></label>`;
    const inSel = (id, opts) => `<select id="${id}">${opts}</select>`;
    const inTA = (id, val, rows = 4) => `<textarea id="${id}" rows="${rows}">${escapeHTML(val || "")}</textarea>`;

    const field = (label, key, value, inputHTML) => `
      <div class="field">
        <div class="label">${escapeHTML(label)}</div>
        <div class="value">${(isEdit || isCreate) ? inputHTML : escapeHTML(value ?? "-")}</div>
      </div>`;

    // barra de acciones
    let controlsRow = "";
    if (isCreate) {
      controlsRow = `
        <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
          <button class="btn" id="btn-cancel">Cancelar</button>
          <button class="btn blue" id="btn-save">Guardar</button>
        </div>`;
    } else if (isAdminUser) {
      controlsRow = `
        <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
          ${isView ? `<button class="btn" id="btn-edit">Editar</button>` : ""}
          ${isEdit ? `<button class="btn" id="btn-cancel">Cancelar</button>` : ""}
          ${isEdit ? `<button class="btn blue" id="btn-save">Guardar</button>` : ""}
          ${!isCreate ? `<button class="btn" id="btn-delete" data-step="1">Eliminar</button>` : ""}
        </div>`;
    }

    const html = `
      ${controlsRow}

      ${field("Nombre", "nombre", c.nombre, inText("f_nombre", c.nombre, "Nombre del curso"))}
      ${field("Tutor", "tutor", state.tutorsMap?.[c.tutor] || c.tutor, inSel("f_tutor", tutorOptions))}
      ${field("Fecha inicio", "fecha_inicio", c.fecha_inicio, inDate("f_fecha", c.fecha_inicio))}
      ${field("Precio", "precio", c.precio === 0 ? "Gratuito" : fmtMoney(c.precio), inNum("f_precio", c.precio ?? 0))}
      ${field("Certificado", "certificado", Number(c.certificado) ? "Sí" : "No", inCheck("f_certificado", c.certificado))}
      ${field("Prioridad", "prioridad", state.prioMap?.[c.prioridad] || c.prioridad, inSel("f_prioridad", prioOptions))}
      ${field("Categoría", "categoria", state.categoriasMap?.[c.categoria] || c.categoria, inSel("f_categoria", catOptions))}
      ${field("Calendario", "calendario", state.calendarioMap?.[c.calendario] || c.calendario, inSel("f_calendario", calOptions))}
      ${field("Tipo de evaluación", "tipo_evaluacion", state.tipoEvalMap?.[c.tipo_evaluacion] || c.tipo_evaluacion, inSel("f_tipo_eval", tipoOptions))}
      ${field("Actividades", "actividades", state.actividadesMap?.[c.actividades] || c.actividades, inSel("f_actividades", actOptions))}
      ${field("Descripción breve", "descripcion_breve", c.descripcion_breve, inTA("f_desc_breve", c.descripcion_breve, 3))}
      ${field("Descripción media", "descripcion_media", c.descripcion_media, inTA("f_desc_media", c.descripcion_media, 4))}

      <div class="field">
        <div class="label">Imágenes</div>
        <div class="value"><div id="media-curso" data-id="${c.id ?? item?.id ?? ""}"></div></div>
      </div>

      ${state.devMode ? `
        <details style="margin-top:10px;">
          <summary>JSON</summary>
          <pre class="value" style="white-space:pre-wrap;max-height:260px;overflow:auto;">${escapeHTML(JSON.stringify(c, null, 2))}</pre>
        </details>` : ""}
    `;

    // título y estado
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

    // engancha eventos post-render
    setTimeout(() => {
      // Guardar
      const bSave = qs("#btn-save");
      if (bSave) bSave.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          if (isCreate) await saveNewCurso();
          else await saveUpdateCurso(item);
        } catch (err) {
          console.error(err);
          toast("Error al guardar", "error");
        }
      });

      // Editar
      const bEdit = qs("#btn-edit");
      if (bEdit) bEdit.addEventListener("click", (e) => {
        e.stopPropagation();
        state.currentDrawer = { type: "curso", id: item?.id ?? null, mode: "edit" };
        qs("#drawer-body").innerHTML = renderCursoDrawer({ id: String(item?.id ?? "") });
      });

      // Cancelar
      const bCancel = qs("#btn-cancel");
      if (bCancel) bCancel.addEventListener("click", (e) => {
        e.stopPropagation();
        if (isCreate) {
          closeDrawer();
        } else {
          state.currentDrawer = { type: "curso", id: item?.id ?? null, mode: "view" };
          qs("#drawer-body").innerHTML = renderCursoDrawer({ id: String(item?.id ?? "") });
        }
      });

      // Eliminar (confirm 2 pasos)
      const bDel = qs("#btn-delete");
      if (bDel) bDel.addEventListener("click", async (e) => {
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
          await softDeleteCurso(item);
          toast("Curso eliminado (inactivo)", "exito");
          closeDrawer();
          await loadCursos();
        } catch (err) {
          console.error(err);
          toast("No se pudo eliminar", "error");
        }
      });

      // Habilita/deshabilita inputs según modo
      disableDrawerInputs(!(isEdit || isCreate));

      // Galería read-only (Curso)
      const contCurso = document.getElementById("media-curso");
      if (contCurso) {
        const cid = Number(c.id ?? item?.id);
        if (!Number.isNaN(cid)) {
          mountReadOnlyMedia({
            container: contCurso,
            type: "curso",
            id: cid,
            labels: ["Portada"],
          });
        } else {
          contCurso.innerHTML = `
            <div class="media-head">
              <div class="media-title">Imágenes</div>
              <div class="media-help">Disponible al crear el curso</div>
            </div>`;
        }
      }
    }, 0);

    return html;
  }

  function disableDrawerInputs(disabled) {
    qsa("#drawer-body input, #drawer-body select, #drawer-body textarea").forEach(el => {
      el.disabled = disabled;
    });
  }

  function getEmptyCourse() {
    return {
      nombre: "",
      descripcion_breve: "",
      descripcion_media: "",
      certificado: 0,
      tutor: "",
      precio: 0,
      estatus: 1,
      fecha_inicio: "",
      prioridad: 1,
      categoria: 1,
      calendario: 1,
      tipo_evaluacion: 1,
      actividades: 1,
    };
  }

  function mapToOptions(map, selectedId) {
    const pairs = Object.entries(map || {});
    const clean = pairs.filter(([k]) => k !== "_ts");
    if (!clean.length) return `<option value="">—</option>`;
    return clean.map(([id, name]) =>
      `<option value="${escapeAttr(id)}" ${String(selectedId) === String(id) ? "selected" : ""}>${escapeHTML(name)}</option>`
    ).join("");
  }

  function readCursoForm(existingId = null) {
    const read = (id) => qs(`#${id}`)?.value ?? "";
    const readNum = (id, def = 0) => Number(qs(`#${id}`)?.value ?? def);
    const readChk = (id) => (qs(`#${id}`)?.checked ? 1 : 0);

    const payload = {
      nombre: read("f_nombre"),
      descripcion_breve: qs("#f_desc_breve")?.value ?? "",
      descripcion_media: qs("#f_desc_media")?.value ?? "",
      certificado: readChk("f_certificado"),
      tutor: readNum("f_tutor", 0),
      precio: readNum("f_precio", 0),
      estatus: readNum("f_estatus", 1), // (si en el futuro lo vuelves editable aquí)
      fecha_inicio: read("f_fecha"),
      prioridad: readNum("f_prioridad", 1),
      categoria: readNum("f_categoria", 1),
      calendario: readNum("f_calendario", 1),
      tipo_evaluacion: readNum("f_tipo_eval", 1),
      actividades: readNum("f_actividades", 1),
      creado_por: Number(currentUser?.id || 0) || 1, // por si el backend lo requiere
    };
    if (existingId != null) payload.id = Number(existingId);
    return payload;
  }

  async function saveNewCurso() {
    const payload = readCursoForm(null);

    if (!payload.nombre) return toast("Falta el nombre", "warning");
    if (!payload.tutor) return toast("Selecciona tutor", "warning");
    if (!payload.fecha_inicio) return toast("Fecha de inicio requerida", "warning");

    await postJSON(API.iCursos, payload);
    toast("Curso creado", "exito");
    closeDrawer();
    await loadCursos();
  }

  async function saveUpdateCurso(item) {
    if (!item || !item._all) return toast("Sin item para actualizar", "error");
    const payload = readCursoForm(item.id);
    await postJSON(API.uCursos, payload);
    toast("Cambios guardados", "exito");
    await loadCursos();
    const re = state.data.find(x => x.id === item.id);
    if (re) openDrawer(`Curso · ${re.nombre}`, renderCursoDrawer({ id: String(re.id) }));
  }

  async function softDeleteCurso(item) {
    if (!item || !item._all) throw new Error("Item inválido");
    const base = { ...item._all };
    base.estatus = 0;
    await postJSON(API.uCursos, base);
  }

  // === NOTICIAS ===
  async function loadNoticias() {
    const title = qs("#mod-title");
    if (title) title.textContent = "Noticias";

    const hdr = qs(".recursos-box.desktop-only .table-header");
    if (hdr) {
      const c1 = hdr.querySelector(".col-nombre");
      let c2 = hdr.querySelector(".col-tutor") || hdr.querySelector(".col-tipo");
      const c3 = hdr.querySelector(".col-fecha");
      const c4 = hdr.querySelector(".col-status");
      if (c1) c1.textContent = "Título";
      if (c2) { c2.textContent = "Comentarios"; c2.classList.add("col-tipo"); }
      if (c3) c3.textContent = "Fecha de publicación";
      if (c4) c4.textContent = "Status";
    }

    const tt = qs(".tt-title");
    if (tt) tt.textContent = "Noticias:";
    const ttStatus = qs("#tt-status");
    if (ttStatus) {
      ttStatus.textContent = "Activas";
      ttStatus.classList.remove("badge-inactivo");
      ttStatus.classList.add("badge-activo");
    }

    showSkeletons();
    try {
      const raw = await postJSON(API.noticias, { estatus: 1 });
      const arr = Array.isArray(raw) ? raw : [];
      const counts = await Promise.all(arr.map(n => getCommentsCount(n.id).catch(() => 0)));

      state.raw = raw;
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
      if (list) list.innerHTML = `<div style="padding:1rem;color:#b00020;">Error al cargar noticias</div>`;
      const m = qs("#recursos-list-mobile");
      if (m) m.innerHTML = "";
      console.error(err);
      toast("No se pudieron cargar noticias", "error");
    }
  }

  async function getCommentsCount(noticiaId) {
    const res = await postJSON(API.comentarios, { noticia_id: Number(noticiaId), estatus: 1 });
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
          <div class="col-status">${badgeNoticia(it.estatus)}</div>
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
            <button class="btn open-drawer" style="margin:.25rem 0 .5rem;">Ver detalle</button>
          </div>
        </div>`,
      drawerTitle: (d) => {
        const item = state.data.find(x => String(x.id) === d.id);
        return item ? `Noticia · ${item.titulo}` : "Noticia";
      },
      drawerBody: (d) => {
        const n = state.data.find(x => String(x.id) === d.id)?._all;
        if (!n) return "<p>No encontrado.</p>";
        return `
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
          <div class="field">
            <div class="label">Acciones</div>
            <div class="value">
              <div style="display:flex;gap:.5rem;flex-wrap:wrap;">
                <button class="btn" id="btn-edit-noticia">Editar</button>
                <button class="btn" id="btn-delete-noticia">Eliminar</button>
              </div>
              <div style="margin-top:.25rem;color:#666;font-size:.9rem;">Funciones deshabilitadas</div>
            </div>
          </div>
        `;
      },
    });
  }

  function bindDisabledNewsActions() {
    const be = document.getElementById("btn-edit-noticia");
    const bd = document.getElementById("btn-delete-noticia");
    [be, bd].forEach(b => b && b.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      (window.gcToast ? gcToast : alert)("Función deshabilitada", "warning");
    }));
  }

  function badgeNoticia(estatus) {
    return Number(estatus) === 1
      ? `<span class="badge-activo">Publicada</span>`
      : `<span class="badge-inactivo">Inactiva</span>`;
  }

  // === CUENTAS (placeholder para no-admin) ===
  function drawCuentas() {
    const title = qs("#mod-title");
    if (title) title.textContent = "Cuentas";

    // Encabezados mínimos
    const hdr = qs(".recursos-box.desktop-only .table-header");
    if (hdr) {
      hdr.innerHTML = `
        <div class="col-nombre" role="columnheader">Sección</div>
        <div class="col-fecha" role="columnheader">Estado</div>`;
    }

    // Contenido
    const d = qs("#recursos-list");
    const m = qs("#recursos-list-mobile");
    if (d) d.innerHTML = `
      <div class="table-row">
        <div class="col-nombre">Gestión de cuenta</div>
        <div class="col-fecha">Disponible</div>
      </div>`;
    if (m) m.innerHTML = `
      <div class="table-row-mobile expanded">
        <button class="row-toggle">
          <div class="col-nombre">Gestión de cuenta</div>
          <span class="icon-chevron">›</span>
        </button>
        <div class="row-details">
          <div><strong>Estado:</strong> Disponible</div>
        </div>
      </div>`;

    const tt = qs(".tt-title");
    if (tt) tt.textContent = "Cuentas:";
    const ttStatus = qs("#tt-status");
    if (ttStatus) {
      ttStatus.textContent = "Disponible";
      ttStatus.classList.remove("badge-inactivo");
      ttStatus.classList.add("badge-activo");
    }

    renderPagination(1);
  }

  // === Drawer base ===
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

  // === Helpers UI/format ===
  function escapeHTML(str) {
    return String(str ?? "").replace(/[&<>'"]/g, (s) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[s]));
  }
  function escapeAttr(str) {
    return String(str ?? "").replace(/"/g, "&quot;");
  }
  function fmtDate(d) {
    if (!d) return "-";
    try { const [y, m, day] = d.split("-"); return `${day}/${m}/${y}`; }
    catch { return d; }
  }
  function fmtDateTime(dt) {
    if (!dt) return "-";
    try {
      const [date, time] = dt.split(" ");
      return `${fmtDate(date)} ${time || ""}`.trim();
    } catch { return dt; }
  }
  function fmtMoney(n) {
    try { return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n); }
    catch { return `$${n}`; }
  }
  function pair(label, val) {
    return `<div class="field"><div class="label">${escapeHTML(label)}</div><div class="value">${escapeHTML(val ?? "-")}</div></div>`;
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

  // === Imágenes read-only (con lápiz deshabilitado) ===
  function mountReadOnlyMedia(opt) {
    const { container, type, id, labels = [] } = opt;
    if (!container) return;

    const urls = mediaUrlsByType(type, id);
    const grid = document.createElement("div");
    grid.className = "media-grid";

    urls.forEach((url, i) => {
      const label = labels[i] || `Imagen ${i + 1}`;
      const card = document.createElement("div");
      card.className = "media-card";
      card.innerHTML = `
        <figure class="media-thumb">
          <img alt="${escapeAttr(label)}" src="${withBust(url)}">
          <button class="icon-btn media-edit" aria-disabled="true" title="Editar imagen (deshabilitado)">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.0 1.0 0 0 0 0-1.41l-2.34-2.34a1.0 1.0 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"></path>
            </svg>
          </button>
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

      card.querySelector(".media-edit")?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        (window.gcToast ? gcToast : alert)("función deshabilitada", "warning");
      });

      grid.appendChild(card);
    });

    container.innerHTML = `
      <div class="media-head">
        <div class="media-title">Imágenes</div>
      </div>`;
    container.appendChild(grid);
  }

  // === Toolbar / botones ===
  function bindUI() {
    qsa(".admin-dash .admin-nav").forEach(btn => {
      btn.addEventListener("click", () => {
        const route = btn.dataset.route || btn.getAttribute("href");
        if (route) {
          if (location.hash !== route) location.hash = route;
          else onRouteChange();
        }
      });
    });

    // Ocultar botón devmode siempre; devmode lo controlamos por lista
    const devToggle = document.getElementById("btn-dev-toggle");
    if (devToggle) {
      devToggle.style.display = "none";
      // si se dejara visible en algún entorno, esto alternaría el estado
      devToggle.addEventListener("click", () => {
        state.devMode = !state.devMode;
        applyDevModeUI();
      });
    }

    // Cerrar drawer
    const drawerClose = document.getElementById("drawer-close");
    if (drawerClose) drawerClose.addEventListener("click", closeDrawer);

    const overlay = document.getElementById("gc-dash-overlay");
    if (overlay) overlay.addEventListener("click", (e) => {
      if (e.target.id === "gc-dash-overlay") closeDrawer();
    });

    applyDevModeUI();
  }

  function applyDevModeUI() {
    const btn = document.getElementById("btn-dev-toggle");
    if (btn) {
      btn.classList.toggle("is-active", state.devMode);
      btn.setAttribute("aria-pressed", String(!!state.devMode));
      btn.title = `Modo desarrollador (${state.devMode ? "ON" : "OFF"})`;
    }
    document.body.classList.toggle("gc-devmode", state.devMode);
  }

  async function openCreateCurso() {
    if (!isAdminUser) return;
    try {
      await Promise.all([
        getTutorsMap(), getPrioridadMap(),
        getCategoriasMap(), getCalendarioMap(),
        getTipoEvalMap(), getActividadesMap()
      ]);
      state.currentDrawer = { type: "curso", id: null, mode: "create" };
      openDrawer("Curso · Crear", renderCursoDrawer({ id: "" }));
    } catch (e) {
      console.error(e);
      toast("No se pudo abrir el formulario", "error");
    }
  }

  const addBtn = document.getElementById("btn-add");
  if (addBtn) addBtn.addEventListener("click", openCreateCurso);

  // === INIT ===
  document.addEventListener("DOMContentLoaded", async () => {
    currentUser = getUsuarioFromCookie();
    const uid = Number(currentUser?.id || 0);
    isAdminUser = ADMIN_IDS.includes(uid);

    // DevMode por lista (sin botón)
    state.devMode = DEV_ALLOWED_IDS.includes(uid);
    applyDevModeUI();

    applyAdminVisibility(isAdminUser);

    bindUI();

    try {
      await Promise.all([
        getTutorsMap(), getPrioridadMap(),
        getCategoriasMap(), getCalendarioMap(),
        getTipoEvalMap(), getActividadesMap()
      ]);
    } catch { }

    if (!window.location.hash) window.location.hash = isAdminUser ? "#/cursos" : "#/cuentas";
    onRouteChange();
  });







  (function () {
    function safeGetUser() {
      try {
        return (window.getUsuarioFromCookie && getUsuarioFromCookie()) || null;
      } catch { return null; }
    }

    function disableDevModeForAll() {
      if (window.state && typeof state === "object") {
        state.devMode = false;
      }
      if (typeof window.applyDevModeUI === "function") {
        try { window.applyDevModeUI(); } catch { }
      }
    }

    function removeDevButton() {
      const btn = document.getElementById("btn-dev-toggle");
      if (!btn) return;
      btn.replaceWith(document.createComment("DevMode oculto"));
    }

    document.addEventListener("DOMContentLoaded", function () {
      const user = safeGetUser();
      const uid = Number(user && user.id);
      const isDev = DEV_ALLOWED_IDS.includes(uid);

      if (!isDev) {
        disableDevModeForAll();
        removeDevButton();
      } else {
        const btn = document.getElementById("btn-dev-toggle");
        if (btn) {
          btn.removeAttribute("hidden");
          btn.classList.remove("hidden");
          btn.disabled = false;
          btn.setAttribute(
            "aria-pressed",
            String(!!(window.state && state.devMode))
          );
        }
      }
    });
  })();
})();




