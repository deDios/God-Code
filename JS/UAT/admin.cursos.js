(function () {
  "use strict";

  /* ===================== Namespace/State ===================== */
  const GCNS = (window.GC = window.GC || {});
  const Cursos = (GCNS.Cursos = GCNS.Cursos || {});

  const API_BASE =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
  const API = {
    cursos: API_BASE + "c_cursos.php",
    iCursos: API_BASE + "i_cursos.php",
    uCursos: API_BASE + "u_cursos.php",
    tutores: API_BASE + "c_tutor.php",
    prioridad: API_BASE + "c_prioridad.php",
    categorias: API_BASE + "c_categorias.php",
    calendario: API_BASE + "c_dias_curso.php",
    tipoEval: API_BASE + "c_tipo_evaluacion.php",
    actividades: API_BASE + "c_actividades.php",
  };
  const API_UPLOAD = { cursoImg: API_BASE + "u_cursoImg.php" };

  const state = {
    page: 1,
    pageSize: 7,
    search: "",
    raw: [],
    data: [],
    current: { mode: "view", id: null },
    // imagen temporal (solo si el usuario selecciona una nueva)
    pendingImageFile: null,
  };

  /* ===================== Utils (locales, sin globales) ===================== */
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) =>
    Array.prototype.slice.call(r.querySelectorAll(s));
  const escapeHTML = (s) =>
    String(s == null ? "" : s).replace(
      /[&<>'"]/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        }[c])
    );
  const escapeAttr = (s) => String(s == null ? "" : s).replace(/"/g, "&quot;");
  const ntf = (v) => Number(v || 0);
  const norm = (s) =>
    String(s || "")
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .trim();
  const humanSize = (b) =>
    b < 1024
      ? b + " B"
      : b < 1048576
      ? (b / 1024).toFixed(1) + " KB"
      : (b / 1048576).toFixed(2) + " MB";
  const toast = (m, t = "exito", d = 2200) =>
    window.gcToast ? window.gcToast(m, t, d) : console.log(`[${t}] ${m}`);
  function withBust(url) {
    try {
      const u = new URL(url, location.origin);
      u.searchParams.set("v", Date.now());
      return u.pathname + "?" + u.searchParams.toString();
    } catch {
      return url + (url.includes("?") ? "&" : "?") + "v=" + Date.now();
    }
  }
  async function postJSON(url, body) {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    const t = await r.text().catch(() => "");
    if (!r.ok) throw new Error("HTTP " + r.status + " " + (t || ""));
    if (!t.trim()) return {};
    try {
      return JSON.parse(t);
    } catch {
      return { _raw: t };
    }
  }
  function validarImagen(file, opt) {
    opt = opt || {};
    const maxMB = Number(opt.maxMB || 2);
    const allowed =
      opt.tipos && Array.isArray(opt.tipos) && opt.tipos.length
        ? opt.tipos
        : ["image/jpeg", "image/png"];
    if (!file) return { ok: false, error: "No se seleccionó archivo" };
    if (!allowed.includes(file.type))
      return { ok: false, error: "Formato no permitido. Usa JPG/PNG/WEBP" };
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > maxMB)
      return { ok: false, error: "La imagen excede " + maxMB + "MB" };
    return { ok: true };
  }
  function noImageSvg() {
    return (
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M20 70 L60 35 L95 65 L120 50 L140 70' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>"
      )
    );
  }
  function imgExists(url) {
    return new Promise((res) => {
      try {
        const i = new Image();
        i.onload = () => res(true);
        i.onerror = () => res(false);
        i.src = withBust(url);
      } catch {
        res(false);
      }
    });
  }
  function fmtDate(d) {
    if (!d) return "-";
    try {
      const p = String(d).split("-");
      return `${p[2] || ""}/${p[1] || ""}/${p[0] || ""}`;
    } catch {
      return d;
    }
  }

  // fallback de portada (png/jpg/webp + nombres legacy)
  function courseImageCandidates(id) {
    const nid = Number(id);
    return [
      `/ASSETS/cursos/img${nid}.png`,
      `/ASSETS/cursos/img${nid}.jpg`,
      `/ASSETS/cursos/img${nid}.webp`,
      `/ASSETS/cursos/cursos_img${nid}.png`,
      `/ASSETS/cursos/cursos_img${nid}.jpg`,
      `/ASSETS/cursos/cursos_img${nid}.webp`,
    ];
  }
  async function resolveCourseImageUrl(id) {
    for (const u of courseImageCandidates(id)) {
      if (await imgExists(u)) return u;
    }
    return null;
  }
  async function requireCourseImage(id) {
    for (const u of courseImageCandidates(id)) {
      if (await imgExists(u)) return true;
    }
    return false;
  }

  // opciones <select> desde mapas { id:nombre }
  function arrToMap(arr) {
    const m = {};
    (Array.isArray(arr) ? arr : []).forEach(
      (x) => (m[x.id] = x.nombre || x.titulo || `#${x.id}`)
    );
    return m;
  }
  function mapToOptions(map, selectedId) {
    if (!map || typeof map !== "object") return '<option value="">—</option>';
    const pairs = Object.keys(map).map((k) => [k, map[k]]);
    if (!pairs.length) return '<option value="">—</option>';
    return pairs
      .map(
        ([id, name]) =>
          `<option value="${escapeAttr(id)}"${
            String(selectedId) === String(id) ? " selected" : ""
          }>${escapeHTML(name)}</option>`
      )
      .join("");
  }

  // badge simple (colores por estatus en curso)
  function statusBadge(v) {
    const n = Number(v);
    const tone =
      n === 1
        ? "green"
        : n === 0
        ? "red"
        : n === 2
        ? "grey"
        : n === 4 || n === 3
        ? "blue"
        : "grey";
    const label =
      n === 1
        ? "Activo"
        : n === 0
        ? "Inactivo"
        : n === 2
        ? "Pausado"
        : n === 4
        ? "En curso"
        : n === 3
        ? "Terminado"
        : String(v);
    return `<span class="gc-badge gc-badge--${tone}">${escapeHTML(
      label
    )}</span>`;
  }

  // skeletons mínimos
  function showSkeletons() {
    const d = qs("#recursos-list"),
      m = qs("#recursos-list-mobile");
    if (d) d.innerHTML = "";
    if (m) m.innerHTML = "";
    const t = d || m;
    if (!t) return;
    for (let i = 0; i < 5; i++)
      t.insertAdjacentHTML(
        "beforeend",
        '<div class="sk-row"><div class="sk n1"></div><div class="sk n2"></div><div class="sk n3"></div></div>'
      );
  }

  /* ===================== Catalogos (para selects) ===================== */
  async function fetchCatalogs() {
    const [tutores, prioridad, categorias, calendario, tipoEval, actividades] =
      await Promise.all([
        postJSON(API.tutores, { estatus: 1 }),
        postJSON(API.prioridad, { estatus: 1 }),
        postJSON(API.categorias, { estatus: 1 }),
        postJSON(API.calendario, { estatus: 1 }),
        postJSON(API.tipoEval, { estatus: 1 }),
        postJSON(API.actividades, { estatus: 1 }),
      ]);
    return {
      tmap: arrToMap(tutores || []),
      pmap: arrToMap(prioridad || []),
      cmap: arrToMap(categorias || []),
      calmap: arrToMap(calendario || []),
      temap: arrToMap(tipoEval || []),
      ammap: arrToMap(actividades || []),
    };
  }

  /* ===================== Listado ===================== */
  async function loadCursos() {
    qs("#mod-title") && (qs("#mod-title").textContent = "Cursos");
    const hdr = qs(".recursos-box.desktop-only .table-header");
    if (hdr) {
      const c1 = hdr.querySelector(".col-nombre"),
        c2 = hdr.querySelector(".col-tutor") || hdr.querySelector(".col-tipo"),
        c3 = hdr.querySelector(".col-fecha"),
        c4 = hdr.querySelector(".col-status");
      if (c1) c1.textContent = "Nombre";
      if (c2) {
        c2.textContent = "Tutor";
        c2.classList.add("col-tutor");
      }
      if (c3) c3.textContent = "Fecha de inicio";
      if (!c4) {
        const nc = document.createElement("div");
        nc.className = "col-status";
        nc.setAttribute("role", "columnheader");
        nc.textContent = "Status";
        hdr.appendChild(nc);
      } else c4.textContent = "Status";
    }
    qs(".tt-title") && (qs(".tt-title").textContent = "Cursos:");
    const st = qs("#tt-status");
    if (st) {
      st.textContent = "Todos los estatus";
      st.classList.remove("badge-inactivo");
      st.classList.add("badge-activo");
    }
    showSkeletons();
    try {
      const [e1, e0, e2, e3, e4, e5] = await Promise.all([
        postJSON(API.cursos, { estatus: 1 }),
        postJSON(API.cursos, { estatus: 0 }),
        postJSON(API.cursos, { estatus: 2 }),
        postJSON(API.cursos, { estatus: 3 }),
        postJSON(API.cursos, { estatus: 4 }),
        postJSON(API.cursos, { estatus: 5 }),
      ]);
      state.raw = [].concat(
        e1 || [],
        e0 || [],
        e2 || [],
        e3 || [],
        e4 || [],
        e5 || []
      );
      // mapeo ligero; otros catálogos se hidratan en drawer
      state.data = (state.raw || []).map((c) => ({
        id: c.id,
        nombre: c.nombre,
        tutor_id: c.tutor,
        tutor: "#" + c.tutor,
        precio: c.precio,
        certificado: !!c.certificado,
        fecha: c.fecha_inicio,
        estatus: ntf(c.estatus),
        _all: c,
      }));
      drawCursos();
    } catch (e) {
      console.warn(e);
      const list = qs("#recursos-list");
      if (list)
        list.innerHTML =
          '<div style="padding:1rem;color:#b00020;">Error al cargar cursos</div>';
      qs("#recursos-list-mobile") &&
        (qs("#recursos-list-mobile").innerHTML = "");
      toast("No se pudieron cargar cursos", "error");
    }
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
      prev.onclick = () => {
        state.page = Math.max(1, state.page - 1);
        drawCursos();
      };
      cont.appendChild(prev);
      for (let p = 1; p <= totalPages && p <= 7; p++) {
        const b = document.createElement("button");
        b.className = "page-btn" + (p === state.page ? " active" : "");
        b.textContent = p;
        b.onclick = () => {
          state.page = p;
          drawCursos();
        };
        cont.appendChild(b);
      }
      const next = document.createElement("button");
      next.className = "arrow-btn";
      next.textContent = "›";
      next.disabled = state.page === totalPages;
      next.onclick = () => {
        state.page = Math.min(totalPages, state.page + 1);
        drawCursos();
      };
      cont.appendChild(next);
    });
  }

  function drawCursos() {
    const d = qs("#recursos-list"),
      m = qs("#recursos-list-mobile");
    if (d) d.innerHTML = "";
    if (m) m.innerHTML = "";
    const matcher = (q) => {
      const k = norm(q);
      return (it) =>
        norm(it.nombre).includes(k) || norm(String(it.tutor)).includes(k);
    };
    const rows = state.search
      ? state.data.filter(matcher(state.search))
      : state.data;
    if (!rows.length) {
      const empty =
        '<div class="empty-state" style="padding:1rem;">Sin resultados</div>';
      if (d) d.innerHTML = empty;
      if (m) m.innerHTML = empty;
      const c = qs("#mod-count");
      if (c) c.textContent = "0 resultados";
      renderPagination(0);
      return;
    }
    const start = (state.page - 1) * state.pageSize,
      pageRows = rows.slice(start, start + state.pageSize);
    pageRows.forEach((it) => {
      if (d)
        d.insertAdjacentHTML(
          "beforeend",
          `<div class="table-row" data-id="${it.id}" data-type="curso">
           <div class="col-nombre"><span class="name-text">${escapeHTML(
             it.nombre
           )}</span> ${
            Number(it.precio) === 0
              ? '<span class="gc-chip gray">Gratuito</span>'
              : '<span class="gc-chip gray">Con costo</span>'
          }</div>
           <div class="col-tutor">${escapeHTML(String(it.tutor || "—"))}</div>
           <div class="col-fecha">${fmtDate(it.fecha)}</div>
           <div class="col-status">${statusBadge(it.estatus)}</div>
         </div>`
        );
      if (m)
        m.insertAdjacentHTML(
          "beforeend",
          `<div class="table-row-mobile" data-id="${it.id}" data-type="curso">
           <button class="row-toggle"><div class="col-nombre">${escapeHTML(
             it.nombre
           )} ${
            Number(it.precio) === 0
              ? '<span class="gc-chip gray">Gratuito</span>'
              : '<span class="gc-chip gray">Con costo</span>'
          }</div><span class="icon-chevron">›</span></button>
           <div class="row-details">
             <div><strong>Tutor:</strong> ${escapeHTML(
               String(it.tutor || "—")
             )}</div>
             <div><strong>Inicio:</strong> ${fmtDate(it.fecha)}</div>
             <div><strong>Status:</strong> ${statusBadge(it.estatus)}</div>
             <div style="display:flex;gap:8px;margin:.25rem 0 .5rem;">
               <button class="gc-btn gc-btn--ghost open-drawer">Ver detalle</button>
             </div>
           </div>
         </div>`
        );
    });
    const countEl = qs("#mod-count");
    if (countEl)
      countEl.textContent =
        rows.length + " " + (rows.length === 1 ? "elemento" : "elementos");

    qsa("#recursos-list .table-row").forEach((el) => {
      el.addEventListener("click", () => {
        const id = Number(el.dataset.id);
        openCursoDrawer({ id, mode: "view" });
      });
    });
    qsa("#recursos-list-mobile .row-toggle").forEach((el) => {
      el.addEventListener("click", () => {
        const row = el.closest(".table-row-mobile");
        row && row.classList.toggle("expanded");
      });
    });
    qsa("#recursos-list-mobile .open-drawer").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const host = btn.closest(".table-row-mobile");
        const id = Number(host?.dataset?.id || 0);
        openCursoDrawer({ id, mode: "view" });
      });
    });

    renderPagination(rows.length);
  }

  /* ===================== Drawer (estático en PHP) ===================== */
  function overlayOpen() {
    const ov = qs("#gc-dash-overlay");
    ov && ov.classList.add("open");
  }
  function overlayClose() {
    const ov = qs("#gc-dash-overlay");
    ov && ov.classList.remove("open");
  }

  function openCursoDrawer({ id, mode }) {
    state.current = { id: Number(id) || null, mode: mode || "view" };
    overlayOpen();
    qsa(".gc-drawer").forEach((d) => {
      d.classList.remove("open");
      d.setAttribute("aria-hidden", "true");
      d.setAttribute("hidden", "");
    });
    const drawer = qs("#drawer-curso");
    if (!drawer) return;
    drawer.classList.add("open");
    drawer.removeAttribute("hidden");
    drawer.setAttribute("aria-hidden", "false");
    fillCursoDrawer(drawer, state.current);
    const closeBtn = qs("#drawer-curso-close", drawer);
    if (closeBtn && !closeBtn._gc_b) {
      closeBtn._gc_b = true;
      closeBtn.addEventListener("click", closeCursoDrawer);
    }
  }

  function closeCursoDrawer() {
    overlayClose();
    const d = qs("#drawer-curso");
    if (d) {
      d.classList.remove("open");
      d.setAttribute("aria-hidden", "true");
      d.setAttribute("hidden", "");
    }
    state.current = { mode: "view", id: null };
    state.pendingImageFile = null;
  }

  function setDisabled(drawer, disabled) {
    qsa("input,select,textarea,button", drawer).forEach((el) => {
      if (el.id === "drawer-curso-close" || el.id === "btn-cancel") return;
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
      creado_por: 1,
    };
  }

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
      estatus: Number(p.estatus != null ? p.estatus : 1),
      prioridad: Number(p.prioridad || 1),
      categoria: Number(p.categoria || 1),
      calendario: Number(p.calendario || 1),
      tipo_evaluacion: Number(p.tipo_evaluacion || 1),
      actividades: Number(p.actividades || 1),
      creado_por: Number(p.creado_por || 1),
      fecha_inicio: String(p.fecha_inicio || ""),
    };
  }

  function readCursoForm(drawer, existingId) {
    const read = (id) => qs("#" + id, drawer)?.value || "";
    const readN = (id, def) => Number(read(id) || def || 0);
    const readCh = (id) => (qs("#" + id, drawer)?.checked ? 1 : 0);
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
      estatus: readN("f_estatus", 1),
      fecha_inicio: read("f_fecha"),
      prioridad: readN("f_prioridad", 1),
      categoria: readN("f_categoria", 1),
      calendario: readN("f_calendario", 1),
      tipo_evaluacion: readN("f_tipo_eval", 1),
      actividades: readN("f_actividades", 1),
      creado_por: 1,
    };
    if (existingId != null) payload.id = Number(existingId);
    return payload;
  }

  function validateCursoRequired(payload) {
    const t = (v) => String(v == null ? "" : v).trim();
    const errs = [];
    if (!t(payload.nombre)) errs.push("Nombre");
    if (!t(payload.descripcion_breve)) errs.push("Descripción breve");
    if (!t(payload.descripcion_media)) errs.push("Descripción media");
    if (!t(payload.descripcion_curso)) errs.push("Descripción del curso");
    if (!t(payload.dirigido)) errs.push("Dirigido a");
    if (!t(payload.competencias)) errs.push("Competencias");
    if (!payload.tutor) errs.push("Tutor");
    if (!payload.categoria) errs.push("Categoría");
    if (!payload.calendario) errs.push("Calendario");
    if (!payload.tipo_evaluacion) errs.push("Tipo de evaluación");
    if (!payload.actividades) errs.push("Actividades");
    if (!t(payload.fecha_inicio)) errs.push("Fecha de inicio");
    if (!(Number(payload.horas) > 0)) errs.push("Horas (>0)");
    return errs;
  }

  async function uploadCursoImagen(cursoId, file) {
    const v = validarImagen(file, {
      maxMB: 2,
      tipos: ["image/jpeg", "image/png", "image/webp"],
    });
    if (!v.ok) throw new Error(v.error || "Archivo inválido");
    const fd = new FormData();
    fd.append("curso_id", String(cursoId));
    fd.append("pos", "1");
    fd.append("imagen", file);
    const res = await fetch(API_UPLOAD.cursoImg, { method: "POST", body: fd });
    const text = await res.text().catch(() => "");
    if (!res.ok) throw new Error("HTTP " + res.status + " " + (text || ""));
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { _raw: text };
    }
    return json;
  }

  async function saveUpdateCurso(drawer, { isCreate }) {
    const id = isCreate ? null : state.current.id;
    const payload = normalizeCursoPayload(readCursoForm(drawer, id));
    const errs = validateCursoRequired(payload);
    if (errs.length) {
      toast("Completa: " + errs.join(", "), "warning");
      return;
    }

    // 1) Persistir datos
    let savedId = id;
    try {
      if (isCreate) {
        const resp = await postJSON(API.iCursos, payload);
        savedId = Number(resp?.id || resp?.curso_id || resp?.insert_id || 0);
        if (!savedId) throw new Error("No regresó id de curso");
      } else {
        await postJSON(API.uCursos, payload);
      }
    } catch (e) {
      console.warn(e);
      toast("No se pudo guardar el curso", "error");
      return;
    }

    // 2) Subir imagen SOLO si el usuario modifico la imagen que ya estaba
    try {
      if (state.pendingImageFile && savedId) {
        await uploadCursoImagen(savedId, state.pendingImageFile);
        const hit = await resolveCourseImageUrl(savedId);
        const img = qs("#media-curso img", drawer);
        if (img) img.src = withBust(hit || img.src || noImageSvg());
        state.pendingImageFile = null;
      }
    } catch (e) {
      console.warn(e);
      toast("El curso se guardó, pero la imagen no se pudo subir", "warning");
    }

    toast("Cambios guardados", "exito");
    await loadCursos();
    // Volver a modo vista con el item actualizado
    openCursoDrawer({ id: savedId || state.current.id, mode: "view" });
  }

  async function fillCursoDrawer(drawer, { id, mode }) {
    const titleEl = qs("#drawer-curso-title", drawer);
    const mediaZone = qs("#media-curso", drawer);
    const isCreate = mode === "create" || id == null;

    // rellenar catalogos
    const { tmap, pmap, cmap, calmap, temap, ammap } = await fetchCatalogs();

    // item
    let item = isCreate
      ? { _all: getEmptyCourse(), id: null, nombre: "" }
      : state.data.find((x) => Number(x.id) === Number(id)) || null;
    const c = isCreate ? item._all : item ? item._all : getEmptyCourse();

    // selects
    const selTutor = qs("#f_tutor", drawer),
      selPrior = qs("#f_prioridad", drawer),
      selCat = qs("#f_categoria", drawer),
      selCal = qs("#f_calendario", drawer),
      selTEval = qs("#f_tipo_eval", drawer),
      selAct = qs("#f_actividades", drawer),
      selStat = qs("#f_estatus", drawer);
    if (selTutor) selTutor.innerHTML = mapToOptions(tmap, c.tutor);
    if (selPrior) selPrior.innerHTML = mapToOptions(pmap, c.prioridad);
    if (selCat) selCat.innerHTML = mapToOptions(cmap, c.categoria);
    if (selCal) selCal.innerHTML = mapToOptions(calmap, c.calendario);
    if (selTEval) selTEval.innerHTML = mapToOptions(temap, c.tipo_evaluacion);
    if (selAct) selAct.innerHTML = mapToOptions(ammap, c.actividades);
    if (selStat)
      selStat.innerHTML = mapToOptions(
        {
          1: "Activo",
          2: "Pausado",
          4: "En curso",
          3: "Terminado",
          0: "Inactivo",
          5: "Cancelado",
        },
        c.estatus
      );

    // campos
    function setV(id, val) {
      const el = qs("#" + id, drawer);
      if (!el) return;
      if (el.type === "checkbox") el.checked = !!Number(val);
      else el.value = val == null ? "" : val;
    }
    setV("f_nombre", c.nombre);
    setV("f_desc_breve", c.descripcion_breve); //luego colocar que cantidad de caracteres son el maximo para cada uno
    setV("f_desc_curso", c.descripcion_curso);
    setV("f_desc_media", c.descripcion_media);
    setV("f_dirigido", c.dirigido);
    setV("f_competencias", c.competencias);
    setV("f_certificado", c.certificado);
    setV("f_horas", c.horas);
    setV("f_precio", c.precio);
    setV("f_fecha", c.fecha_inicio);

    if (titleEl)
      titleEl.textContent = isCreate
        ? "Curso · Crear"
        : "Curso · " + (item?.nombre || c.nombre || "");

    // botones
    const oldEdit = qs("#btn-edit", drawer),
      oldSave = qs("#btn-save", drawer),
      oldCancel = qs("#btn-cancel", drawer);
    const clone = (el) => {
      if (!el) return el;
      const c = el.cloneNode(true);
      el.replaceWith(c);
      return c;
    };
    const btnEdit = clone(oldEdit),
      btnSave = clone(oldSave),
      btnCancel = clone(oldCancel);

    if (isCreate || mode === "edit") {
      btnEdit && (btnEdit.style.display = "none");
      btnSave && (btnSave.style.display = "");
      btnCancel && (btnCancel.style.display = "");
      setDisabled(drawer, false);
    } else {
      btnEdit && (btnEdit.style.display = "");
      btnSave && (btnSave.style.display = "none");
      btnCancel && (btnCancel.style.display = "");
      setDisabled(drawer, true);
    }

    if (btnEdit)
      btnEdit.addEventListener("click", () =>
        openCursoDrawer({ id: item.id, mode: "edit" })
      );
    if (btnCancel)
      btnCancel.addEventListener("click", () =>
        isCreate
          ? closeCursoDrawer()
          : openCursoDrawer({ id: item.id, mode: "view" })
      );
    if (btnSave)
      btnSave.addEventListener("click", () =>
        saveUpdateCurso(drawer, { isCreate })
      );

    // se muestra la imagen que esta sino el placeholder + el boton de editar
    if (mediaZone) {
      mediaZone.innerHTML = "";
      const card = document.createElement("div");
      card.className = "media-card";
      const img = document.createElement("img");
      img.alt = "Portada";
      img.style.maxWidth = "100%";
      img.style.borderRadius = "8px";
      const currentId = item?.id || 0;
      if (!isCreate && currentId) {
        const hitUrl = await resolveCourseImageUrl(currentId);
        img.src = withBust(hitUrl || noImageSvg());
      } else {
        img.src = noImageSvg();
      }
      card.appendChild(img);

      const actions = document.createElement("div");
      actions.style.marginTop = "8px";
      if (isCreate || mode === "edit") {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "gc-btn";
        btn.textContent = "Cambiar imagen…";
        btn.addEventListener("click", () => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/png, image/jpeg, image/webp";
          input.style.display = "none";
          document.body.appendChild(input);
          input.addEventListener("change", () => {
            const file = input.files && input.files[0];
            try {
              document.body.removeChild(input);
            } catch {}
            if (!file) return;
            const v = validarImagen(file, { maxMB: 2 });
            if (!v.ok) {
              toast(v.error, "error");
              return;
            }
            state.pendingImageFile = file;
            img.src = URL.createObjectURL(file); // preview local
          });
          input.click();
        });
        actions.appendChild(btn);
      } else {
        const note = document.createElement("div");
        note.style.fontSize = ".9rem";
        note.style.color = "#666";
        note.textContent = "Solo lectura";
        actions.appendChild(note);
      }

      mediaZone.appendChild(card);
      mediaZone.appendChild(actions);
    }
  }

  /* ===================== Toolbar/Route bindings ===================== */
  function bindToolbar() {
    const addBtn = qs("#btn-add");
    if (addBtn && !addBtn._gc_b) {
      addBtn._gc_b = true;
      addBtn.addEventListener("click", () =>
        openCursoDrawer({ id: null, mode: "create" })
      );
    }
    const s = qs("#search-input");
    if (s && !s._gc_b) {
      s._gc_b = true;
      s.addEventListener("input", () => {
        state.search = s.value || "";
        state.page = 1;
        drawCursos();
      });
    }
  }

  function onRoute() {
    const hash = window.location.hash || "#/cursos";
    if (hash.startsWith("#/cursos")) {
      bindToolbar();
      loadCursos();
    }
  }

  window.addEventListener("hashchange", onRoute);
  document.addEventListener("DOMContentLoaded", onRoute);
})();
