(() => {
  // ---- util para vh en móviles
  const setVH = () => {
    document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
  };
  setVH();
  window.addEventListener("resize", setVH);

  // ---- ENDPOINTS
  const API = {
    cursos: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_cursos.php",
    iCursos: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_cursos.php",
    uCursos: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/u_cursos.php",
    noticias: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_noticia.php",
    comentarios: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_comentario_noticia.php",
    tutores: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_tutor.php",
    prioridad: "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_prioridad.php",
  };

  // ---- estado global
  const state = {
    route: "#/cursos",
    page: 1,
    pageSize: 10,
    data: [],
    raw: [],
    tutorsMap: null,
    prioMap: null,
    devMode: false, // lo maneja el botón de la toolbar
    currentDrawer: null, // {type:'curso'|'noticia', id:number|null, mode:'view'|'edit'|'create'}
  };

  // ---- helpers cortos
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
  const toast = (msg, tipo = "exito", dur = 2500) => (window.gcToast ? window.gcToast(msg, tipo, dur) : console.log(`[${tipo}] ${msg}`));

  async function postJSON(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // ---- catálogos (cache 30min)
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

  // ---- router básico
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

    // activa item del sidebar
    qsa(".gc-side .nav-item").forEach(a => {
      const isActive = a.getAttribute("href") === hash;
      a.classList.toggle("is-active", isActive);
      a.setAttribute("aria-current", isActive ? "page" : "false");
    });

    // cambia columnas según módulo
    if (hash.startsWith("#/cursos")) return loadCursos();
    if (hash.startsWith("#/noticias")) return loadNoticias();

    // default
    setRoute("#/cursos");
  }

  // ---- skeletons rápidos
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

  // ---- render de listas (desktop + mobile)
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
  }

  // ---------- CURSOS ----------
  async function loadCursos() {
    // header de columnas
    const title = qs("#mod-title");
    if (title) title.textContent = "Cursos";

    const hdr = qs(".recursos-box.desktop-only .table-header");
    if (hdr) {
      const c1 = hdr.querySelector(".col-nombre");
      const c2 = hdr.querySelector(".col-tutor") || hdr.querySelector(".col-tipo");
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

    // meta de barra
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
      const [raw, tmap, pmap] = await Promise.all([
        postJSON(API.cursos, { estatus: 1 }),
        getTutorsMap(),
        getPrioridadMap(),
      ]);

      state.raw = raw;
      state.data = (Array.isArray(raw) ? raw : []).map(c => ({
        id: c.id,
        nombre: c.nombre,
        tutor: tmap[c.tutor] || `Tutor #${c.tutor}`,
        tutor_id: c.tutor,
        prioridad_id: c.prioridad,
        prioridad_nombre: pmap[c.prioridad] || `#${c.prioridad}`,
        precio: c.precio,
        certificado: !!c.certificado,
        fecha: c.fecha_inicio,
        estatus: Number(c.estatus),
        _all: c,
      }));

      drawCursos();
      // toast("Cursos cargados","exito",1400); // si quieres feedback
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

  // badges de precio y status (usa tus clases .badge-*)
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

  // render del drawer de curso (view/edit/create)
  function renderCursoDrawer(dataset) {
    const item = state.data.find(x => String(x.id) === dataset.id);
    const mode = state.currentDrawer?.mode || "view";
    const isCreate = mode === "create";
    const isEdit = mode === "edit";
    const isView = mode === "view";

    const c = isCreate ? getEmptyCourse() : (item ? item._all : null);
    if (!c) return "<p>No encontrado.</p>";

    // opciones selects (usa mapas cacheados)
    const tutorOptions = mapToOptions(state.tutorsMap, String(c.tutor || ""));
    const prioOptions = mapToOptions(state.prioMap, String(c.prioridad || ""));

    // barra de acciones
    let controlsRow = "";
    if (isCreate) {
      controlsRow = `
      <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
        <button class="btn" id="btn-cancel">Cancelar</button>
        <button class="btn blue" id="btn-save">Guardar</button>
      </div>
    `;
    } else if (state.devMode) {
      controlsRow = `
      <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
        ${isView ? `<button class="btn" id="btn-edit">Editar</button>` : ""}
        ${isEdit ? `<button class="btn" id="btn-cancel">Cancelar</button>` : ""}
        ${isEdit ? `<button class="btn blue" id="btn-save">Guardar</button>` : ""}
        ${!isCreate ? `<button class="btn" id="btn-delete" data-step="1">Eliminar</button>` : ""}
      </div>
    `;
    }

    // helpers de inputs inline
    const inText = (id, val, ph = "") => `<input id="${id}" type="text" value="${escapeAttr(val || "")}" placeholder="${escapeAttr(ph)}" />`;
    const inNum = (id, val, min = "0") => `<input id="${id}" type="number" value="${escapeAttr(val ?? "")}" min="${min}" />`;
    const inDate = (id, val) => `<input id="${id}" type="date" value="${escapeAttr(val || "")}" />`;
    const inCheck = (id, val) => `<label style="display:inline-flex;align-items:center;gap:.5rem;"><input id="${id}" type="checkbox" ${Number(val) ? 'checked' : ''}/> <span>Sí</span></label>`;
    const inSelect = (id, opts) => `<select id="${id}">${opts}</select>`;
    const inTA = (id, val, rows = 5) => `<textarea id="${id}" rows="${rows}">${escapeHTML(val || "")}</textarea>`;

    const field = (label, key, value, inputHTML) => `
    <div class="field">
      <div class="label">${escapeHTML(label)}</div>
      <div class="value">${(isEdit || isCreate) ? inputHTML : escapeHTML(value ?? "-")}</div>
    </div>
  `;

    // layout del cuerpo
    const html = `
    ${controlsRow}
    ${field("Nombre", "nombre", c.nombre, inText("f_nombre", c.nombre, "Nombre del curso"))}
    ${field("Tutor", "tutor", state.tutorsMap?.[c.tutor] || c.tutor, inSelect("f_tutor", tutorOptions))}
    ${field("Fecha inicio", "fecha_inicio", c.fecha_inicio, inDate("f_fecha", c.fecha_inicio))}
    ${field("Precio", "precio", c.precio === 0 ? "Gratuito" : fmtMoney(c.precio), inNum("f_precio", c.precio ?? 0))}
    ${field("Certificado", "certificado", Number(c.certificado) ? "Sí" : "No", inCheck("f_certificado", c.certificado))}
    ${field("Prioridad", "prioridad", state.prioMap?.[c.prioridad] || c.prioridad, inSelect("f_prioridad", prioOptions))}
    ${field("Estatus", "estatus", Number(c.estatus) === 1 ? "Activo" : "Inactivo",
      inSelect("f_estatus", `
        <option value="1" ${Number(c.estatus) === 1 ? 'selected' : ''}>Activo</option>
        <option value="0" ${Number(c.estatus) === 0 ? 'selected' : ''}>Inactivo</option>
      `)
    )}
    ${field("Descripción breve", "descripcion_breve", c.descripcion_breve, inTA("f_desc_breve", c.descripcion_breve, 3))}
    ${field("Descripción media", "descripcion_media", c.descripcion_media, inTA("f_desc_media", c.descripcion_media, 4))}

    ${state.devMode ? `
      <details style="margin-top:10px;">
        <summary>Campos extendidos</summary>
        ${field("Descripción completa", "descripcion_curso", c.descripcion_curso, inTA("f_desc_curso", c.descripcion_curso, 6))}
        ${field("Actividades", "actividades", c.actividades, inNum("f_actividades", c.actividades ?? 0))}
        ${field("Tipo evaluación", "tipo_evaluacion", c.tipo_evaluacion, inNum("f_tipo_eval", c.tipo_evaluacion ?? 1))}
        ${field("Calendario", "calendario", c.calendario, inNum("f_calendario", c.calendario ?? 1))}
        ${field("Dirigido", "dirigido", c.dirigido, inTA("f_dirigido", c.dirigido, 3))}
        ${field("Competencias", "competencias", c.competencias, inTA("f_competencias", c.competencias, 3))}
        ${field("Horas", "horas", c.horas, inNum("f_horas", c.horas ?? 0))}
        ${field("Categoría", "categoria", c.categoria, inNum("f_categoria", c.categoria ?? 1))}
        ${field("Creado por", "creado_por", c.creado_por, inNum("f_creado_por", c.creado_por ?? 1))}
      </details>
    `: ""}

    ${state.devMode ? `
      <div style="margin-top:16px;">
        <div class="label" style="margin-bottom:6px;">JSON</div>
        <pre class="value" style="white-space:pre-wrap;max-height:260px;overflow:auto;">${escapeHTML(JSON.stringify(c, null, 2))}</pre>
      </div>
    ` : ""}
  `;

    // título y estado del drawer
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

    // engancha eventos de acciones y bloquea/habilita inputs según modo
    setTimeout(() => {
      // Guardar (create / edit)
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

      // Editar -> pasa a modo edición
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

      // Eliminar con confirm de dos pasos
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

      // habilita/deshabilita inputs según modo
      disableDrawerInputs(!(isEdit || isCreate));
    }, 0);

    return html;
  }

  // bloquea/desbloquea inputs del drawer
  function disableDrawerInputs(disabled) {
    qsa("#drawer-body input, #drawer-body select, #drawer-body textarea").forEach(el => {
      el.disabled = disabled;
    });
  }

  // curso vacío para crear
  function getEmptyCourse() {
    return {
      nombre: "",
      descripcion_breve: "",
      descripcion_curso: "",
      descripcion_media: "",
      actividades: 1,
      tipo_evaluacion: 1,
      calendario: 1,
      certificado: 0,
      dirigido: "",
      competencias: "",
      tutor: "",
      horas: 0,
      precio: 0,
      estatus: 1,
      creado_por: 1,
      fecha_inicio: "",
      categoria: 1,
      prioridad: 1
    };
  }

  // option builder a partir de mapas
  function mapToOptions(map, selectedId) {
    const pairs = Object.entries(map || {});
    // filtra la propiedad de timestamp si existe
    const clean = pairs.filter(([k]) => k !== "_ts");
    if (!clean.length) return `<option value="">—</option>`;
    return clean.map(([id, name]) => `<option value="${escapeAttr(id)}" ${String(selectedId) === String(id) ? "selected" : ""}>${escapeHTML(name)}</option>`).join("");
  }

  // build payload desde el drawer
  function readCursoForm(existingId = null) {
    const read = (id) => qs(`#${id}`)?.value ?? "";
    const readNum = (id, def = 0) => Number(qs(`#${id}`)?.value ?? def);
    const readChk = (id) => qs(`#${id}`)?.checked ? 1 : 0;

    const payload = {
      nombre: read("f_nombre"),
      descripcion_breve: qs("#f_desc_breve")?.value ?? "",
      descripcion_curso: qs("#f_desc_curso")?.value ?? "",
      descripcion_media: qs("#f_desc_media")?.value ?? "",
      actividades: readNum("f_actividades", 1),
      tipo_evaluacion: readNum("f_tipo_eval", 1),
      calendario: readNum("f_calendario", 1),
      certificado: readChk("f_certificado"),
      dirigido: qs("#f_dirigido")?.value ?? "",
      competencias: qs("#f_competencias")?.value ?? "",
      tutor: readNum("f_tutor", 0),
      horas: readNum("f_horas", 0),
      precio: readNum("f_precio", 0),
      estatus: readNum("f_estatus", 1),
      creado_por: readNum("f_creado_por", 1),
      fecha_inicio: read("f_fecha"),
      categoria: readNum("f_categoria", 1),
      prioridad: readNum("f_prioridad", 1),
    };
    if (existingId != null) payload.id = Number(existingId);
    return payload;
  }

  // guardar nuevo curso (insert)
  async function saveNewCurso() {
    const payload = readCursoForm(null);

    // validito lo básico
    if (!payload.nombre) { toast("Falta el nombre", "warning"); return; }
    if (!payload.tutor) { toast("Selecciona tutor", "warning"); return; }
    if (!payload.fecha_inicio) { toast("Fecha de inicio requerida", "warning"); return; }

    await postJSON(API.iCursos, payload);
    toast("Curso creado", "exito");
    closeDrawer();
    await loadCursos();
  }

  // actualizar curso existente
  async function saveUpdateCurso(item) {
    if (!item || !item._all) { toast("Sin item para actualizar", "error"); return; }
    const payload = readCursoForm(item.id);
    await postJSON(API.uCursos, payload);
    toast("Cambios guardados", "exito");
    // recarga para ver datos actualizados
    await loadCursos();
    // reabrimos el drawer en view
    const re = state.data.find(x => x.id === item.id);
    if (re) {
      openDrawer(`Curso · ${re.nombre}`, renderCursoDrawer({ id: String(re.id) }));
    }
  }

  // soft delete (estatus=0) usando el update
  async function softDeleteCurso(item) {
    if (!item || !item._all) throw new Error("Item inválido");
    const base = { ...item._all };
    base.estatus = 0;
    // el update espera todos los campos, así que reusamos el original
    await postJSON(API.uCursos, base);
  }

  // ---------- NOTICIAS ----------
  async function loadNoticias() {
    const title = qs("#mod-title");
    if (title) title.textContent = "Noticias";

    const hdr = qs(".recursos-box.desktop-only .table-header");
    if (hdr) {
      const c1 = hdr.querySelector(".col-nombre");
      const c2 = hdr.querySelector(".col-tutor") || hdr.querySelector(".col-tipo");
      const c3 = hdr.querySelector(".col-fecha");
      let c4 = hdr.querySelector(".col-status");
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
      const arr = (Array.isArray(raw) ? raw : []);
      // contamos comentarios (cuidado con spam de requests)
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
    // suma respuestas anidadas también
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
        // por ahora solo vista (sin CRUD de noticias)
        return `
          ${pair("Título", n.titulo)}
          ${pair("Estado", Number(n.estatus) === 1 ? "Publicada" : "Inactiva")}
          ${pair("Fecha publicación", fmtDateTime(n.fecha_creacion))}
          ${pair("Descripción (1)", n.desc_uno)}
          ${pair("Descripción (2)", n.desc_dos)}
          ${pair("Creado por", n.creado_por)}
        `;
      },
    });
  }

  function badgeNoticia(estatus) {
    return Number(estatus) === 1
      ? `<span class="badge-activo">Publicada</span>`
      : `<span class="badge-inactivo">Inactiva</span>`;
  }

  // ---------- DRAWER base ----------
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

  // ---------- helpers UI/format ----------
  function escapeHTML(str) {
    return String(str ?? "").replace(/[&<>'"]/g, (s) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    })[s]);
  }
  function escapeAttr(str) {
    return String(str ?? "").replace(/"/g, "&quot;");
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

  // ---------- toolbar / botones ----------
  function bindUI() {
    document.querySelectorAll(".admin-dash .admin-nav").forEach((btn) => {
      btn.addEventListener("click", () => {
        const route = btn.dataset.route || btn.getAttribute("href");
        if (route) {
          if (location.hash !== route) location.hash = route;
          else onRouteChange();
        }
      });
    });

    const oldDevBtn = document.getElementById("btn-dev");
    if (oldDevBtn) oldDevBtn.remove();

    const devToggle = document.getElementById("btn-dev-toggle");
    if (devToggle) {
      devToggle.addEventListener("click", () => {
        // Alterna el modo desarrollador
        state.devMode = !state.devMode;

        applyDevModeUI();

        const drawer = document.getElementById("gc-drawer");
        if (drawer && drawer.classList.contains("open")) {
          typeof initDrawerControls === "function" && initDrawerControls();

          const form = drawer.querySelector("[data-editable='true']");
          if (form) {
            const enable = !!state.devMode && form.classList.contains("editing");
            form.querySelectorAll("input, select, textarea, button[data-role='editor-only']")
              .forEach(el => el.disabled = !enable);
          }
        }
      });
    }

    // Cerrar drawer
    const drawerClose = document.getElementById("drawer-close");
    if (drawerClose) {
      drawerClose.addEventListener("click", closeDrawer);
    }

    const overlay = document.getElementById("gc-dash-overlay");
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target.id === "gc-dash-overlay") closeDrawer();
      });
    }

    applyDevModeUI();
  }

  function applyDevModeUI() {
    const btn = document.getElementById("btn-dev-toggle");
    if (!btn) return;
    btn.classList.toggle("is-active", state.devMode);
    btn.setAttribute("aria-pressed", String(!!state.devMode));
    btn.title = `Modo desarrollador (${state.devMode ? "ON" : "OFF"})`;
  }

  async function openCreateCurso() {
    try {
      await Promise.all([getTutorsMap(), getPrioridadMap()]);

      state.currentDrawer = { type: "curso", id: null, mode: "create" };

      openDrawer("Curso · Crear", renderCursoDrawer({ id: "" }));
    } catch (e) {
      console.error(e);
      toast("No se pudo abrir el formulario", "error");
    }
  }

  const addBtn = document.getElementById("btn-add");
  if (addBtn) {
    addBtn.addEventListener("click", openCreateCurso);
  }

  // ---- init
  document.addEventListener("DOMContentLoaded", async () => {
    bindUI();
    try { await Promise.all([getTutorsMap(), getPrioridadMap()]); } catch { }
    if (!window.location.hash) window.location.hash = "#/cursos";
    onRouteChange();
  });
})();
