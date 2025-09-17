(() => {
  "use strict";

  /* ====================== Utils ====================== */
  const GC_DEBUG = false;
  const gcLog = (...a) => {
    if (GC_DEBUG && typeof console !== "undefined") {
      try {
        console.log("[GC]", ...a);
      } catch {}
    }
  };
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) =>
    Array.prototype.slice.call(r.querySelectorAll(s));
  const toast = (m, t = "exito", d = 2400) =>
    window.gcToast
      ? window.gcToast(m, t, d)
      : t === "error"
      ? alert(m)
      : console.log(`[${t}] ${m}`);
  const ntf = (v) => Number(v || 0);
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
  const fmtMoney = (n) => {
    try {
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(n);
    } catch {
      return "$" + n;
    }
  };
  const fmtDate = (d) => {
    if (!d) return "-";
    try {
      const p = String(d).split("-");
      return `${p[2] || ""}/${p[1] || ""}/${p[0] || ""}`;
    } catch {
      return d;
    }
  };
  const withBust = (url) => {
    try {
      const u = new URL(url, location.origin);
      u.searchParams.set("v", Date.now());
      return u.pathname + "?" + u.searchParams.toString();
    } catch {
      return url + (url.includes("?") ? "&" : "?") + "v=" + Date.now();
    }
  };

  /* ====================== API ====================== */
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

  /* ====================== Estado ====================== */
  const state = {
    data: [], // cursos ya normalizados
    raw: [], // respuesta original
    page: 1,
    pageSize: 7,
    search: "",
    currentDrawer: null, // { id, mode:'view'|'edit'|'create' }
    // catálogos
    tutorsMap: null,
    prioMap: null,
    categoriasMap: null,
    calendarioMap: null,
    tipoEvalMap: null,
    actividadesMap: null,
  };
  const cacheGuard = (m) =>
    !!(m && m._ts && Date.now() - m._ts < 30 * 60 * 1000);
  const arrToMap = (arr) => {
    const m = {};
    (Array.isArray(arr) ? arr : []).forEach(
      (x) => (m[x.id] = x.nombre || x.titulo || "#" + x.id)
    );
    m._ts = Date.now();
    return m;
  };
  const mapToOptions = (map, sel) => {
    const ids = Object.keys(map || {}).filter((k) => k !== "_ts");
    return ids
      .map(
        (id) =>
          `<option value="${id}"${
            Number(id) === Number(sel) ? " selected" : ""
          }>${escapeHTML(map[id])}</option>`
      )
      .join("");
  };

  /* ====================== Estatus Cursos ====================== */
  const STATUS_SELECT_CURSOS = Object.freeze([
    { v: 1, l: "Activo" },
    { v: 2, l: "Pausado" },
    { v: 4, l: "En curso" },
    { v: 3, l: "Terminado" },
    { v: 0, l: "Inactivo" },
    { v: 5, l: "Cancelado" },
  ]);
  const statusLabel = (v) => {
    const f = STATUS_SELECT_CURSOS.find((o) => Number(o.v) === Number(v));
    return f ? f.l : String(v);
  };
  const statusOptionsForCursos = (selected) =>
    STATUS_SELECT_CURSOS.map(
      (o) =>
        `<option value="${o.v}"${
          Number(o.v) === Number(selected) ? " selected" : ""
        }>${o.l}</option>`
    ).join("");

  /* ====================== Catálogos (solo activos) ====================== */
  const getTutorsMap = async () => {
    if (cacheGuard(state.tutorsMap)) return state.tutorsMap;
    const a = await postJSON(API.tutores, { estatus: 1 });
    return (state.tutorsMap = arrToMap(a));
  };
  const getPrioridadMap = async () => {
    if (cacheGuard(state.prioMap)) return state.prioMap;
    const a = await postJSON(API.prioridad, { estatus: 1 });
    return (state.prioMap = arrToMap(a));
  };
  const getCategoriasMap = async () => {
    if (cacheGuard(state.categoriasMap)) return state.categoriasMap;
    const a = await postJSON(API.categorias, { estatus: 1 });
    return (state.categoriasMap = arrToMap(a));
  };
  const getCalendarioMap = async () => {
    if (cacheGuard(state.calendarioMap)) return state.calendarioMap;
    const a = await postJSON(API.calendario, { estatus: 1 });
    return (state.calendarioMap = arrToMap(a));
  };
  const getTipoEvalMap = async () => {
    if (cacheGuard(state.tipoEvalMap)) return state.tipoEvalMap;
    const a = await postJSON(API.tipoEval, { estatus: 1 });
    return (state.tipoEvalMap = arrToMap(a));
  };
  const getActividadesMap = async () => {
    if (cacheGuard(state.actividadesMap)) return state.actividadesMap;
    const a = await postJSON(API.actividades, { estatus: 1 });
    return (state.actividadesMap = arrToMap(a));
  };

  /* ====================== Lista / Render ====================== */
  function bindToolbar() {
    const s = qs("#search-input");
    if (s && !s._bound) {
      s._bound = true;
      s.addEventListener("input", () => {
        state.search = (s.value || "").trim();
        state.page = 1;
        drawCursos();
      });
    }
    const addBtn = qs("#btn-add");
    if (addBtn && !addBtn._bound) {
      addBtn._bound = true;
      addBtn.addEventListener("click", () => {
        openCursoDrawer({
          id: null,
          mode: "edit",
          isCreate: true,
          _all: getEmptyCourse(),
        });
      });
    }
  }

  function defaultMatcher(q) {
    const k = (q || "")
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .trim();
    return (it) =>
      JSON.stringify(it)
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .toLowerCase()
        .includes(k);
  }

  function renderPagination(total) {
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    const targets = [qs("#pagination-controls"), qs("#pagination-mobile")];
    targets.forEach((cont) => {
      if (!cont) return;
      cont.innerHTML = "";
      if (totalPages <= 1) return;

      const mkBtn = (txt, cb, dis) => {
        const b = document.createElement("button");
        b.className =
          "page-btn" + (txt === "‹" || txt === "›" ? " arrow-btn" : "");
        b.textContent = txt;
        b.disabled = !!dis;
        b.onclick = cb;
        return b;
      };
      cont.appendChild(
        mkBtn(
          "‹",
          () => {
            state.page = Math.max(1, state.page - 1);
            drawCursos();
          },
          state.page === 1
        )
      );
      for (let p = 1; p <= totalPages && p <= 7; p++) {
        const b = mkBtn(String(p), () => {
          state.page = p;
          drawCursos();
        });
        if (p === state.page) b.classList.add("active");
        cont.appendChild(b);
      }
      cont.appendChild(
        mkBtn(
          "›",
          () => {
            state.page = Math.min(totalPages, state.page + 1);
            drawCursos();
          },
          state.page === totalPages
        )
      );
    });
  }

  function rowDesktop(it) {
    return `<div class="table-row" role="row" data-type="curso" data-id="${
      it.id
    }">
      <div class="col-nombre" role="cell">${escapeHTML(it.nombre || "—")}</div>
      <div class="col-tutor" role="cell">${escapeHTML(
        it.tutor_nombre || "—"
      )}</div>
      <div class="col-fecha" role="cell">${escapeHTML(
        it.fecha_inicio || "—"
      )}</div>
      <div class="col-status" role="cell">${escapeHTML(
        statusLabel(it.estatus)
      )}</div>
    </div>`;
  }
  function rowMobile(it) {
    return `<div class="table-row-mobile" data-type="curso" data-id="${it.id}">
      <div class="row-main">
        <div class="title">${escapeHTML(it.nombre || "—")}</div>
        <button class="open-drawer" type="button" aria-label="Abrir">Ver</button>
      </div>
      <div class="row-sub">Tutor: ${escapeHTML(
        it.tutor_nombre || "—"
      )} · Inicio: ${escapeHTML(it.fecha_inicio || "—")} · ${escapeHTML(
      statusLabel(it.estatus)
    )}</div>
    </div>`;
  }

  function drawCursos() {
    const listD = qs("#recursos-list");
    const listM = qs("#recursos-list-mobile");
    if (listD) listD.innerHTML = "";
    if (listM) listM.innerHTML = "";

    const rows = state.data || [];
    const filtered = state.search
      ? rows.filter(defaultMatcher(state.search))
      : rows;

    const cEl = qs("#mod-count");
    if (cEl)
      cEl.textContent =
        (filtered.length || 0) +
        " " +
        (filtered.length === 1 ? "elemento" : "elementos");

    if (!filtered.length) {
      const empty =
        '<div class="empty-state" style="padding:1rem;">Sin resultados</div>';
      if (listD) listD.innerHTML = empty;
      if (listM) listM.innerHTML = empty;
      renderPagination(0);
      return;
    }

    const start = (state.page - 1) * state.pageSize;
    const pageRows = filtered.slice(start, start + state.pageSize);

    pageRows.forEach((it) => {
      if (listD) listD.insertAdjacentHTML("beforeend", rowDesktop(it));
      if (listM) listM.insertAdjacentHTML("beforeend", rowMobile(it));
    });

    // bind open
    qsa("#recursos-list .table-row").forEach((el) => {
      if (el._bound) return;
      el._bound = true;
      el.addEventListener("click", () => {
        const id = Number(el.getAttribute("data-id"));
        openCursoDrawer({ id, mode: "view" });
      });
    });
    qsa("#recursos-list-mobile .open-drawer").forEach((btn) => {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const host = btn.closest(".table-row-mobile");
        const id = Number(host && host.getAttribute("data-id"));
        openCursoDrawer({ id, mode: "view" });
      });
    });

    renderPagination(filtered.length);
  }

  /* ====================== Carga inicial ====================== */
  async function loadCursos() {
    bindToolbar();
    // Por defecto listamos Activos (1)
    qs("#tt-status") && (qs("#tt-status").textContent = "Activo");
    let arr = await postJSON(API.cursos, { estatus: 1 });
    if (!Array.isArray(arr)) arr = [];

    // enriquecer con nombre de tutor para listados
    const tmap = await getTutorsMap();

    state.raw = arr.slice();
    state.data = arr.map((x) => ({
      ...x,
      tutor_nombre: tmap[x.tutor] || "-",
    }));
    state.page = 1;
    drawCursos();
  }

  /* ====================== Drawer CURSO ====================== */
  function openCursoDrawer(cfg) {
    const overlay = qs("#gc-dash-overlay");
    overlay && overlay.classList.add("open");

    const drawer = qs("#drawer-curso");
    if (!drawer) return;

    drawer.classList.add("open");
    drawer.removeAttribute("hidden");
    drawer.setAttribute("aria-hidden", "false");

    const closeBtn = qs("#drawer-curso-close", drawer);
    if (closeBtn && !closeBtn._bound) {
      closeBtn._bound = true;
      closeBtn.addEventListener("click", closeDrawer);
    }

    state.currentDrawer = {
      type: "curso",
      id: cfg.id,
      mode: cfg.mode || "view",
      isCreate: !!cfg.isCreate,
      _all: cfg._all || null,
    };
    fillCursoDrawer();
  }

  function closeDrawer() {
    try {
      document.activeElement &&
        document.activeElement.blur &&
        document.activeElement.blur();
    } catch {}
    const overlay = qs("#gc-dash-overlay");
    overlay && overlay.classList.remove("open");
    qsa(".gc-dash.drawer.open").forEach((d) => {
      d.classList.remove("open");
      d.setAttribute("aria-hidden", "true");
      d.setAttribute("hidden", "");
    });
    state.currentDrawer = null;
  }

  function getEmptyCourse() {
    return {
      nombre: "",
      descripcion_breve: "",
      descripcion_media: "",
      descripcion_curso: "",
      dirigido: "",
      competencias: "",
      tutor: "",
      categoria: "",
      prioridad: "",
      tipo_evaluacion: "",
      actividades: "",
      calendario: "",
      horas: "",
      precio: "",
      certificado: false,
      fecha_inicio: "",
      estatus: 1,
    };
  }

  function refreshCountersIn(root) {
    qsa("[data-max]", root).forEach((el) => {
      const max = Number(el.getAttribute("data-max") || 0);
      const id = el.id;
      const cc = qs('.char-counter[data-for="' + id + '"]', root);
      if (!cc || !max) return;
      const v = el.value || "";
      cc.textContent = v.length + "/" + max;
      if (v.length > max) cc.classList.add("over");
      else cc.classList.remove("over");
    });
  }

  async function fillCursoDrawer() {
    const d = qs("#drawer-curso");
    const body = qs("#drawer-curso-body", d);
    if (!d || !body) return;

    const cd = state.currentDrawer || {};
    const isCreate = !!cd.isCreate;
    const mode = cd.mode || (isCreate ? "edit" : "view");
    const id = cd.id;

    // obtener item
    let item = null;
    if (isCreate && cd._all) {
      item = { id: null, _all: cd._all, nombre: "" };
    } else {
      item = state.raw.find((x) => Number(x.id) === Number(id));
      if (!item) return;
      item = { ...item, _all: { ...item } };
    }

    // Título
    const titleEl = qs("#drawer-curso-title", d);
    if (titleEl)
      titleEl.textContent = isCreate
        ? "Curso · Crear"
        : "Curso · " + (item.nombre || "");

    // Acciones visibles arriba (solo vista)
    const actions = qs("#curso-actions-view", d);
    const secView = qs("#curso-view", d);
    const secEdit = qs("#curso-edit", d);

    if (mode === "edit") {
      actions && (actions.style.display = "none");
      secView && secView.setAttribute("hidden", "");
      secEdit && secEdit.removeAttribute("hidden");

      // Catálogos
      const [tmap, pmap, cmap, calmap, temap, ammap] = await Promise.all([
        getTutorsMap(),
        getPrioridadMap(),
        getCategoriasMap(),
        getCalendarioMap(),
        getTipoEvalMap(),
        getActividadesMap(),
      ]);

      const c = item._all;
      // selects
      const setHTML = (id, html) => {
        const el = qs("#" + id, d);
        if (el) el.innerHTML = html;
      };
      setHTML("f_tutor", mapToOptions(tmap, c.tutor));
      setHTML("f_prioridad", mapToOptions(pmap, c.prioridad));
      setHTML("f_categoria", mapToOptions(cmap, c.categoria));
      setHTML("f_calendario", mapToOptions(calmap, c.calendario));
      setHTML("f_tipo_eval", mapToOptions(temap, c.tipo_evaluacion));
      setHTML("f_actividades", mapToOptions(ammap, c.actividades));
      setHTML("f_estatus", statusOptionsForCursos(c.estatus));

      // inputs/textarea
      const setVal = (id, val) => {
        const el = qs("#" + id, d);
        if (el) el.value = val == null ? "" : val;
      };
      setVal("f_nombre", c.nombre);
      setVal("f_desc_breve", c.descripcion_breve);
      setVal("f_desc_media", c.descripcion_media);
      setVal("f_desc_curso", c.descripcion_curso);
      setVal("f_dirigido", c.dirigido);
      setVal("f_competencias", c.competencias);
      const chk = qs("#f_certificado", d);
      if (chk) chk.checked = !!Number(c.certificado);
      setVal("f_horas", c.horas);
      setVal("f_precio", c.precio);
      setVal("f_fecha", c.fecha_inicio);

      refreshCountersIn(secEdit);

      // Media (editable) – justo antes del JSON
      if (!isCreate) {
        try {
          window.GC_CURSO_MEDIA && window.GC_CURSO_MEDIA.mountEdit(item.id);
        } catch (e) {
          gcLog(e);
        }
      }

      // Botones editar/guardar/cancelar
      const btnCancel = qs("#btn-cancel", d);
      const btnSave = qs("#btn-save", d);
      if (btnCancel && !btnCancel._bound) {
        btnCancel._bound = true;
        btnCancel.addEventListener("click", () => fillCursoDrawerView(item));
      }
      if (btnSave && !btnSave._bound) {
        btnSave._bound = true;
        btnSave.addEventListener("click", async () => {
          try {
            await saveUpdateCurso(item, d, { isCreate });
          } catch (e) {
            gcLog(e);
            toast("No se pudo guardar", "error");
          }
        });
      }
    } else {
      // modo vista
      fillCursoDrawerView(item);
    }
  }

  function fillCursoDrawerView(item) {
    const d = qs("#drawer-curso");
    const actions = qs("#curso-actions-view", d);
    const secView = qs("#curso-view", d);
    const secEdit = qs("#curso-edit", d);

    actions && (actions.style.display = "");
    secEdit && secEdit.setAttribute("hidden", "");
    secView && secView.removeAttribute("hidden");

    // Render de campos simples
    const put = (id, val) => {
      const el = qs("#" + id, d);
      if (el) el.textContent = val == null || val === "" ? "—" : String(val);
    };
    const c = item._all || item;

    // map names (si tenemos catálogos en cache se usan, si no se muestran ids)
    const tmap = state.tutorsMap || {};
    const pmap = state.prioMap || {};
    const cmap = state.categoriasMap || {};
    const calmap = state.calendarioMap || {};
    const temap = state.tipoEvalMap || {};
    const ammap = state.actividadesMap || {};

    put("v_nombre", c.nombre);
    put("v_desc_breve", c.descripcion_breve);
    put("v_desc_media", c.descripcion_media);
    put("v_desc_curso", c.descripcion_curso);
    put("v_dirigido", c.dirigido);
    put("v_competencias", c.competencias);
    put("v_tutor", tmap[c.tutor] || c.tutor || "—");
    put("v_categoria", cmap[c.categoria] || c.categoria || "—");
    put("v_prioridad", pmap[c.prioridad] || c.prioridad || "—");
    put("v_tipo_eval", temap[c.tipo_evaluacion] || c.tipo_evaluacion || "—");
    put("v_actividades", ammap[c.actividades] || c.actividades || "—");
    put("v_calendario", calmap[c.calendario] || c.calendario || "—");
    put("v_horas", c.horas);
    put(
      "v_precio",
      c.precio != null && c.precio !== "" ? fmtMoney(c.precio) : "—"
    );
    put("v_certificado", Number(c.certificado) ? "Sí" : "No");
    put("v_fecha", c.fecha_inicio || "—");
    put("v_estatus", statusLabel(c.estatus));

    // Media (solo lectura)
    try {
      window.GC_CURSO_MEDIA && window.GC_CURSO_MEDIA.mountView(item.id);
    } catch (e) {
      gcLog(e);
    }

    // JSON dev
    const jsonBox = qs("#json-curso", d);
    if (jsonBox) {
      const data = { ...c };
      jsonBox.textContent = JSON.stringify(data, null, 2);
    }
    const btnCopy = qs("#btn-copy-json-curso", d);
    if (btnCopy && !btnCopy._bound) {
      btnCopy._bound = true;
      btnCopy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(
            qs("#json-curso", d).textContent || ""
          );
          toast("JSON copiado", "exito");
        } catch {
          toast("No se pudo copiar", "error");
        }
      });
    }

    // Botón Editar / Eliminar
    const btnEdit = qs("#btn-edit", d);
    const btnDelete = qs("#btn-delete", d);
    if (btnEdit && !btnEdit._bound) {
      btnEdit._bound = true;
      btnEdit.addEventListener("click", () => {
        state.currentDrawer.mode = "edit";
        fillCursoDrawer();
      });
    }
    if (btnDelete && !btnDelete._bound) {
      btnDelete._bound = true;
      btnDelete.addEventListener("click", async () => {
        try {
          // Baja lógica: estatus = 0
          await postJSON(API.uCursos, { ...item._all, estatus: 0 });
          toast("Curso eliminado (inactivo)", "exito");
          closeDrawer();
          await loadCursos();
        } catch (e) {
          gcLog(e);
          toast("No se pudo eliminar", "error");
        }
      });
    }
  }

  async function saveUpdateCurso(item, drawer, { isCreate }) {
    // recolectar
    const val = (id) => qs("#" + id, drawer)?.value ?? "";
    const chk = (id) => (qs("#" + id, drawer)?.checked ? 1 : 0);

    const payload = {
      id: item.id,
      nombre: val("f_nombre"),
      descripcion_breve: val("f_desc_breve"),
      descripcion_media: val("f_desc_media"),
      descripcion_curso: val("f_desc_curso"),
      dirigido: val("f_dirigido"),
      competencias: val("f_competencias"),
      tutor: ntf(val("f_tutor")),
      categoria: ntf(val("f_categoria")),
      prioridad: ntf(val("f_prioridad")),
      tipo_evaluacion: ntf(val("f_tipo_eval")),
      actividades: ntf(val("f_actividades")),
      calendario: ntf(val("f_calendario")),
      horas: ntf(val("f_horas")),
      precio: Number(val("f_precio") || 0),
      certificado: chk("f_certificado"),
      fecha_inicio: val("f_fecha"),
      estatus: ntf(val("f_estatus") || 1),
    };

    // validaciones mínimas
    if (
      !payload.nombre ||
      !payload.descripcion_breve ||
      !payload.descripcion_media ||
      !payload.descripcion_curso ||
      !payload.dirigido ||
      !payload.competencias
    ) {
      toast("Completa los campos obligatorios", "error");
      return;
    }
    if (
      !payload.tutor ||
      !payload.categoria ||
      !payload.prioridad ||
      !payload.tipo_evaluacion ||
      !payload.actividades ||
      !payload.calendario ||
      !payload.horas ||
      !payload.fecha_inicio
    ) {
      toast("Faltan campos del bloque de select/num/fecha", "error");
      return;
    }

    if (isCreate) {
      const res = await postJSON(API.iCursos, payload);
      toast("Curso creado", "exito");
    } else {
      const res = await postJSON(API.uCursos, payload);
      toast("Cambios guardados", "exito");
    }

    closeDrawer();
    await loadCursos();
  }

  /* ====================== Inicio ====================== */
  document.addEventListener("DOMContentLoaded", () => {
    // arrancamos en cursos
    loadCursos().catch((e) => {
      gcLog(e);
      toast("No se pudieron cargar cursos", "error");
    });
  });

  /* =======================================================================
     CURSO · Media (vista + edición)  ——  Montaje de imagen, lápiz y preview
     ======================================================================= */
  (() => {
    const log = (...a) => {
      try {
        if (GC_DEBUG) console.log("[CURSO IMG]", ...a);
      } catch {}
    };
    const UPLOAD_URL =
      (window.API_UPLOAD && window.API_UPLOAD.cursoImg) ||
      API_BASE + "u_cursoImg.php";

    function humanSize(bytes) {
      return bytes < 1024
        ? bytes + " B"
        : bytes < 1048576
        ? (bytes / 1024).toFixed(1) + " KB"
        : (bytes / 1048576).toFixed(2) + " MB";
    }
    function validarImagen(file, opt) {
      opt = opt || {};
      const maxMB = Number(opt.maxMB || 2);
      if (!file) return { ok: false, error: "No se seleccionó archivo" };
      const allowed = ["image/jpeg", "image/png"];
      if (!allowed.includes(file.type))
        return { ok: false, error: "Formato no permitido. Solo JPG o PNG" };
      if (file.size / 1024 / 1024 > maxMB)
        return { ok: false, error: "La imagen excede " + maxMB + "MB" };
      return { ok: true };
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
    function noImageSvg() {
      return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M20 70 L60 35 L95 65 L120 50 L140 70' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>";
    }
    function courseImageCandidates(id) {
      id = Number(id || 0);
      return [`/ASSETS/cursos/img${id}.png`, `/ASSETS/cursos/img${id}.jpg`];
    }
    async function resolveCourseImageUrl(id) {
      const cands = courseImageCandidates(id);
      for (let i = 0; i < cands.length; i++) {
        if (await imgExists(cands[i])) return cands[i];
      }
      return null;
    }

    function renderPreviewUI(file, { onConfirm, onCancel } = {}) {
      const url = URL.createObjectURL(file);
      const overlay = document.createElement("div");
      overlay.style.cssText =
        "position:fixed;inset:0;z-index:99999;background:rgba(17,24,39,.55);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px);";
      const modal = document.createElement("div");
      modal.style.cssText =
        "background:#fff;border-radius:14px;box-shadow:0 20px 40px rgba(0,0,0,.25);width:min(920px,94vw);max-height:90vh;overflow:hidden;display:flex;flex-direction:column;";
      modal.innerHTML =
        "<div style='display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #eee;font-weight:700;'>Vista previa de imagen<button data-x style='all:unset;cursor:pointer;font-size:18px;padding:4px 8px;'>✕</button></div>" +
        "<div style='display:grid;grid-template-columns:1fr 280px;gap:16px;padding:16px;align-items:start;'>" +
        "<div style='border:1px solid #eee;border-radius:12px;padding:8px;background:#fafafa;display:flex;align-items:center;justify-content:center;min-height:320px;max-height:60vh;'>" +
        `<img src="${url}" alt="Preview" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;">` +
        "</div>" +
        "<div style='border-left:1px dashed #e6e6e6;padding-left:16px;display:flex;flex-direction:column;gap:10px;'>" +
        "<div style='font-weight:600;'>Detalles</div>" +
        `<div style="font-size:.92rem;color:#444;line-height:1.35;"><div><strong>Archivo:</strong> ${
          file.name
        }</div><div><strong>Peso:</strong> ${humanSize(
          file.size
        )}</div><div><strong>Tipo:</strong> ${
          file.type || "desconocido"
        }</div><div style="margin-top:6px;color:#666;">Formatos permitidos: JPG / PNG · Máx 2MB</div></div>` +
        "<div style='margin-top:auto;display:flex;gap:8px;flex-wrap:wrap;'>" +
        "<button data-ok class='gc-btn gc-btn--primary'>Subir</button>" +
        "<button data-cancel class='gc-btn gc-btn--ghost'>Cancelar</button>" +
        "</div>" +
        "</div>" +
        "</div>";
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";
      const cleanup = () => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
        try {
          overlay.remove();
        } catch {}
        document.body.style.overflow = "";
        document.removeEventListener("keydown", onEsc);
      };
      const onEsc = (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          cleanup();
        }
      };
      document.addEventListener("keydown", onEsc);
      modal.querySelector("[data-x]")?.addEventListener("click", cleanup);
      modal.querySelector("[data-cancel]")?.addEventListener("click", () => {
        onCancel && onCancel();
        cleanup();
      });
      modal.querySelector("[data-ok]")?.addEventListener("click", async () => {
        try {
          onConfirm && (await onConfirm());
        } finally {
          cleanup();
        }
      });
    }

    function mediaCardHTML(url, label, editable) {
      const pencil = editable
        ? `<button class="icon-btn media-edit" title="Editar imagen" aria-label="Editar imagen"
              style="position:absolute;top:8px;right:8px;width:32px;height:32px;border-radius:10px;background:#fff;border:1px solid #e2e2e2;display:grid;place-items:center;box-shadow:0 1px 3px rgba(0,0,0,.08);color:#444;">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.0 1.0 0 0 0 0-1.41l-2.34-2.34a1.0 1.0 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
           </button>`
        : "";
      return `
        <div class="media-head">
          <div class="media-title">Imágenes</div>
          <div class="media-help" style="color:${
            editable ? "#666" : "#888"
          };">${editable ? "Formatos: JPG/PNG · Máx 2MB" : "Solo lectura"}</div>
        </div>
        <div class="media-grid">
          <div class="media-card">
            <figure class="media-thumb">
              <img alt="${label}" src="${withBust(url)}">
              ${pencil}
            </figure>
            <div class="media-meta"><div class="media-label">${label}</div></div>
          </div>
        </div>`;
    }

    async function mountCursoMedia(targetSel, { id, editable }) {
      const root =
        typeof targetSel === "string"
          ? document.querySelector(targetSel)
          : targetSel;
      if (!root) return;
      let url = await resolveCourseImageUrl(id);
      if (!url)
        url = "data:image/svg+xml;utf8," + encodeURIComponent(noImageSvg());
      root.innerHTML = mediaCardHTML(url, "Portada", !!editable);

      const img = root.querySelector("img");
      if (img) {
        img.onerror = () => {
          img.onerror = null;
          if (/\.png(\?|$)/.test(img.src))
            img.src = withBust(img.src.replace(/\.png(\?|$)/, ".jpg$1"));
          else
            img.src =
              "data:image/svg+xml;utf8," + encodeURIComponent(noImageSvg());
        };
      }

      if (!editable) return;

      const btn = root.querySelector(".media-edit");
      if (!btn || !img) return;

      btn.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/png,image/jpeg";
        input.style.display = "none";
        document.body.appendChild(input);

        input.addEventListener("change", () => {
          const file = input.files && input.files[0];
          try {
            document.body.removeChild(input);
          } catch {}
          if (!file) return;

          const v = validarImagen(file, { maxMB: 2 });
          if (!v.ok) return toast(v.error, "error");

          renderPreviewUI(file, {
            onConfirm: async () => {
              try {
                const fd = new FormData();
                fd.append("curso_id", String(id));
                fd.append("imagen", file);
                const res = await fetch(UPLOAD_URL, {
                  method: "POST",
                  body: fd,
                });
                const text = await res.text().catch(() => "");
                if (!res.ok) throw new Error("HTTP " + res.status + " " + text);
                let json = {};
                try {
                  json = JSON.parse(text);
                } catch {}
                const newUrl =
                  json.url || (await resolveCourseImageUrl(id)) || url;
                img.src = withBust(newUrl);
                toast("Imagen de curso actualizada", "exito");
              } catch (e) {
                log(e);
                toast("No se pudo subir la imagen", "error");
              }
            },
            onCancel: () => {},
          });
        });

        input.click();
      });
    }

    // export mini api
    window.GC_CURSO_MEDIA = {
      mountView: (id) =>
        mountCursoMedia("#media-curso", { id, editable: false }),
      mountEdit: (id) =>
        mountCursoMedia("#media-curso-edit", { id, editable: true }),
      resolveCourseImageUrl,
    };
  })();
})();
