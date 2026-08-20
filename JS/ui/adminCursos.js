(function (window, document) {
  "use strict";

  const TAG = "[AdminCursos]";

  const API_BASE =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";

  const API = {
    listar: API_BASE + "c_cursos.php",
    crear: API_BASE + "i_cursos.php",
    editar: API_BASE + "u_cursos.php",
    tutores: API_BASE + "c_tutor.php",
    prioridad: API_BASE + "c_prioridad.php",
    categorias: API_BASE + "c_categorias.php",
    calendario: API_BASE + "c_dias_curso.php",
    tipoEval: API_BASE + "c_tipo_evaluacion.php",
    actividades: API_BASE + "c_actividades.php",
  };

  const FIELD_LIMITS = {
    cf_nombre: 100,
    cf_desc_breve: 250,
    cf_desc_media: 350,
    cf_desc_curso: 2000,
    cf_dirigido: 250,
    cf_competencias: 250,
  };

  const REQUIRED_COURSE_FIELDS = [
    ["cf_nombre", "Nombre"],
    ["cf_desc_breve", "Descripción breve"],
    ["cf_desc_media", "Descripción media"],
    ["cf_desc_curso", "Descripción del curso"],
    ["cf_dirigido", "Dirigido a"],
    ["cf_competencias", "Competencias"],
    ["cf_tutor", "Tutor"],
    ["cf_categoria", "Categoría"],
    ["cf_prioridad", "Prioridad"],
    ["cf_calendario", "Calendario"],
    ["cf_tipo_eval", "Tipo de evaluación"],
    ["cf_actividades", "Actividades"],
    ["cf_horas", "Horas"],
    ["cf_fecha", "Fecha de inicio"],
  ];

  const API_FIELD_TO_FORM_ID = {
    nombre: "cf_nombre",
    descripcion_breve: "cf_desc_breve",
    descripcion_media: "cf_desc_media",
    descripcion_curso: "cf_desc_curso",
    dirigido: "cf_dirigido",
    competencias: "cf_competencias",
    tutor: "cf_tutor",
    categoria: "cf_categoria",
    prioridad: "cf_prioridad",
    calendario: "cf_calendario",
    tipo_evaluacion: "cf_tipo_eval",
    actividades: "cf_actividades",
    horas: "cf_horas",
    precio: "cf_precio",
    fecha_inicio: "cf_fecha",
  };

  const S = {
    data: [],
    page: 1,
    pageSize: 8,
    search: "",
    loaded: false,
    current: null,
    maps: {
      tutores: {},
      prioridad: {},
      categorias: {},
      calendario: {},
      tipoEval: {},
      actividades: {},
    },
    tempImage: null,
    documentEventsBound: false,
  };

  function getCreatedId(response) {
    return Number(
      response?.id ||
      response?.data?.id ||
      response?.curso?.id ||
      response?.curso_id ||
      response?.insert_id ||
      response?.last_id ||
      response?.meta?.id ||
      0
    );
  }

  const ORDER_CURSOS = [1, 4, 3, 2, 5, 0];

  const STATUS_LABEL = {
    1: "Activo",
    0: "Inactivo",
    2: "Pausado",
    3: "Terminado",
    4: "En curso",
    5: "Cancelado",
  };

  const qs = (s, r = document) => r.querySelector(s);

  const esc = (v) =>
    String(v ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));

  const normalize = (v) =>
    String(v ?? "")
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .trim();

  function toast(msg, type = "info", ms = 2200) {
    if (window.gcToast) return window.gcToast(msg, type, ms);
    console.log(`${TAG} ${type}: ${msg}`);
  }

  async function postJSON(url, body = {}) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text().catch(() => "");

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        res.ok
          ? "El servidor devolvió una respuesta inválida."
          : `Error HTTP ${res.status}.`
      );
    }

    if (!res.ok || data?.error) {
      throw new Error(data?.error || `Error HTTP ${res.status}.`);
    }

    return data;
  }

  function excerpt(value, max = 50) {
    const text = String(value ?? "").replace(/\s+/g, " ").trim();

    if (!text) return "";
    if (text.length <= max) return text;

    return text.slice(0, max).trim() + "…";
  }

  function getRowsFromResponse(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.cursos)) return response.cursos;
    return [];
  }

  function arrToMap(arr) {
    const map = {};

    getRowsFromResponse(arr).forEach((item) => {
      const id = Number(item.id);
      if (!Number.isFinite(id)) return;

      map[id] =
        item.nombre ||
        item.titulo ||
        item.descripcion ||
        item.label ||
        `#${id}`;
    });

    return map;
  }

  function mapLabel(map, id) {
    const key = String(id ?? "");
    return key in map ? map[key] : "—";
  }

  function mapOptions(map, selected) {
    const opts = Object.keys(map || {}).map((id) => {
      const isSelected = Number(id) === Number(selected);
      return `<option value="${esc(id)}"${isSelected ? " selected" : ""}>${esc(map[id])}</option>`;
    });

    return `<option value="">Selecciona una opción</option>` + opts.join("");
  }

  function getCreatorId() {
    try {
      const raw = document.cookie
        .split("; ")
        .find((row) => row.startsWith("usuario="));

      if (!raw) return null;

      const user = JSON.parse(decodeURIComponent(raw.split("=")[1] || ""));
      const id = Number(user?.id);

      return Number.isFinite(id) ? id : null;
    } catch {
      return null;
    }
  }

  function fmtMoney(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";

    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(n);
  }

  function fmtBool(value) {
    return Number(value) === 1 ? "Sí" : "No";
  }

  function fmtDate(value) {
    return value ? String(value) : "—";
  }

  function statusText(estatus) {
    if (window.gcTone?.statusLabel) {
      return window.gcTone.statusLabel("cursos", estatus);
    }

    return STATUS_LABEL[Number(estatus)] ?? "Desconocido";
  }

  function statusBadge(estatus) {
    if (window.gcTone?.statusBadge) {
      return window.gcTone.statusBadge("cursos", estatus);
    }

    const n = Number(estatus);

    if (n === 1) return `<span class="admin-badge admin-badge--active">Activo</span>`;
    if (n === 4 || n === 3) return `<span class="admin-badge admin-badge--warning">${esc(statusText(n))}</span>`;
    if (n === 5 || n === 0) return `<span class="admin-badge admin-badge--danger">${esc(statusText(n))}</span>`;

    return `<span class="admin-badge admin-badge--inactive">${esc(statusText(n))}</span>`;
  }

  function cursoImgUrl(id, ext = "png") {
    return `/ASSETS/cursos/img${Number(id)}.${ext}`;
  }

  function noImageSvgDataURI() {
    const svg =
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M20 70 L60 35 L95 65 L120 50 L140 70' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  function withBust(url) {
    if (!url || url.startsWith("data:") || url.startsWith("blob:")) return url;
    return url + (url.includes("?") ? "&" : "?") + "v=" + Date.now();
  }

  async function resolveCursoImg(id) {
    const tryUrl = async (ext) => {
      const url = withBust(cursoImgUrl(id, ext));

      const ok = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });

      return ok ? url : null;
    };

    return (
      (await tryUrl("webp")) ||
      (await tryUrl("png")) ||
      (await tryUrl("jpg")) ||
      (await tryUrl("jpeg")) ||
      noImageSvgDataURI()
    );
  }

  async function loadCatalogos() {
    const [
      tutores,
      prioridad,
      categorias,
      calendario,
      tipoEval,
      actividades,
    ] = await Promise.all([
      postJSON(API.tutores, { estatus: 1 }).catch(() => []),
      postJSON(API.prioridad, { estatus: 1 }).catch(() => []),
      postJSON(API.categorias, { estatus: 1 }).catch(() => []),
      postJSON(API.calendario, { estatus: 1 }).catch(() => []),
      postJSON(API.tipoEval, { estatus: 1 }).catch(() => []),
      postJSON(API.actividades, { estatus: 1 }).catch(() => []),
    ]);

    S.maps.tutores = arrToMap(tutores);
    S.maps.prioridad = arrToMap(prioridad);
    S.maps.categorias = arrToMap(categorias);
    S.maps.calendario = arrToMap(calendario);
    S.maps.tipoEval = arrToMap(tipoEval);
    S.maps.actividades = arrToMap(actividades);
  }

  async function loadCursos() {
    const chunks = await Promise.all(
      ORDER_CURSOS.map((estatus) =>
        postJSON(API.listar, { estatus }).catch(() => [])
      )
    );

    const flat = [];

    chunks.forEach((chunk) => {
      flat.push(...getRowsFromResponse(chunk));
    });

    S.data = flat;
    S.page = 1;
    S.loaded = true;
    sortCursos();
  }

  function sortCursos() {
    const rank = new Map(ORDER_CURSOS.map((status, index) => [String(status), index]));

    S.data.sort((a, b) => {
      const ra = rank.get(String(a.estatus)) ?? 999;
      const rb = rank.get(String(b.estatus)) ?? 999;

      if (ra !== rb) return ra - rb;

      return String(a.nombre || "").localeCompare(String(b.nombre || ""));
    });
  }

  function render() {
    return `
      <section class="admin-module admin-module--cursos">
        <div class="admin-module__head">
          <div class="admin-module__titlebox">
            <h1 class="admin-module__title">Cursos</h1>
            <p class="admin-module__subtitle">Administra cursos, contenido, tutores y estatus.</p>
          </div>

          <div class="admin-module__toolbar">
            <label class="admin-search" aria-label="Buscar cursos">
              <span>🔎</span>
              <input id="admin-cursos-search" type="search" placeholder="Buscar curso..." />
            </label>

            <button class="admin-btn admin-btn--primary" id="btn-admin-curso-new" type="button">
              Nuevo curso
            </button>
          </div>
        </div>

        <div class="admin-module__body">
          <div class="table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Curso</th>
                  <th>Tutor</th>
                  <th>Inicio</th>
                  <th>Precio</th>
                  <th>Estatus</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="admin-cursos-tbody">
                <tr>
                  <td colspan="7">Cargando cursos...</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="admin-pagination">
            <div class="admin-pagination__info" id="admin-cursos-info"></div>
            <div class="admin-pagination__controls" id="admin-cursos-pagination"></div>
          </div>
        </div>

        ${drawerTemplate()}
      </section>
    `;
  }

  function getFilteredRows() {
    const term = normalize(S.search);

    if (!term) return S.data;

    return S.data.filter((row) =>
      normalize(row.nombre).includes(term)
    );
  }

  async function paintTable() {
    const tbody = qs("#admin-cursos-tbody");
    const info = qs("#admin-cursos-info");

    if (!tbody) return;

    const rows = getFilteredRows();
    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / S.pageSize));

    if (S.page > totalPages) S.page = totalPages;

    const start = (S.page - 1) * S.pageSize;
    const pageRows = rows.slice(start, start + S.pageSize);

    if (info) {
      info.textContent = `${total} ${total === 1 ? "curso" : "cursos"}`;
    }

    if (!pageRows.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">No se encontraron cursos.</td>
        </tr>
      `;
      paintPagination(totalPages);
      return;
    }

    tbody.innerHTML = pageRows.map((row) => `
      <tr data-id="${esc(row.id)}">
        <td>
          <div class="admin-news-thumb">
            <img data-course-img="${esc(row.id)}" alt="${esc(row.nombre || "Curso")}" src="${noImageSvgDataURI()}">
          </div>
        </td>
        <td>
          <strong title="${esc(row.nombre || "")}">
            ${esc(excerpt(row.nombre || "Sin nombre", 40))}
          </strong>
          <div class="admin-table-muted">${esc(excerpt(row.descripcion_breve || "", 50))}</div>
        </td>
        <td>${esc(mapLabel(S.maps.tutores, row.tutor))}</td>
        <td>${esc(fmtDate(row.fecha_inicio))}</td>
        <td>${esc(fmtMoney(row.precio))}</td>
        <td>${statusBadge(row.estatus)}</td>
        <td>
          <button class="admin-btn admin-btn--ghost" type="button" data-action="edit" data-id="${esc(row.id)}">
            Editar
          </button>
        </td>
      </tr>
    `).join("");

    paintPagination(totalPages);

    for (const row of pageRows) {
      const img = qs(`[data-course-img="${CSS.escape(String(row.id))}"]`, tbody);
      if (!img) continue;

      img.src = await resolveCursoImg(row.id);
      img.onerror = () => {
        img.onerror = null;
        img.src = noImageSvgDataURI();
      };
    }
  }

  function paintPagination(totalPages) {
    const host = qs("#admin-cursos-pagination");
    if (!host) return;

    if (totalPages <= 1) {
      host.innerHTML = "";
      return;
    }

    let html = `
      <button class="admin-pagination__btn" type="button" data-page="prev" ${S.page === 1 ? "disabled" : ""}>‹</button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      html += `
        <button class="admin-pagination__page ${i === S.page ? "is-active" : ""}" type="button" data-page="${i}">
          ${i}
        </button>
      `;
    }

    html += `
      <button class="admin-pagination__btn" type="button" data-page="next" ${S.page === totalPages ? "disabled" : ""}>›</button>
    `;

    host.innerHTML = html;
  }

  function drawerTemplate() {
    return `
      <div class="admin-drawer-overlay" id="admin-curso-overlay" hidden></div>

      <aside class="admin-drawer" id="admin-curso-drawer" hidden aria-hidden="true">
        <div class="admin-drawer__head">
          <div>
            <h2 class="admin-drawer__title" id="admin-curso-drawer-title">Nuevo curso</h2>
            <p class="admin-drawer__subtitle">Completa la información del curso.</p>
            <p class="admin-form-help"><span aria-hidden="true">*</span> Campos obligatorios</p>
          </div>

          <button class="admin-drawer__close" type="button" id="btn-admin-curso-close" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div class="admin-drawer__body">
          <div class="admin-news-form">
            <div class="admin-field">
              <label for="cf_nombre">Nombre <span class="admin-required" aria-hidden="true">*</span></label>
              <input id="cf_nombre" type="text" maxlength="${FIELD_LIMITS.cf_nombre}" required>
              ${charCounter("cf_nombre")}
            </div>

            <div class="admin-field">
              <label for="cf_desc_breve">Descripción breve <span class="admin-required" aria-hidden="true">*</span></label>
              <textarea id="cf_desc_breve" maxlength="${FIELD_LIMITS.cf_desc_breve}" required></textarea>
              ${charCounter("cf_desc_breve")}
            </div>

            <div class="admin-field">
              <label for="cf_desc_media">Descripción media <span class="admin-required" aria-hidden="true">*</span></label>
              <textarea id="cf_desc_media" maxlength="${FIELD_LIMITS.cf_desc_media}" required></textarea>
              ${charCounter("cf_desc_media")}
            </div>

            <div class="admin-field">
              <label for="cf_desc_curso">Descripción del curso <span class="admin-required" aria-hidden="true">*</span></label>
              <textarea id="cf_desc_curso" maxlength="${FIELD_LIMITS.cf_desc_curso}" required></textarea>
              ${charCounter("cf_desc_curso")}
            </div>

            <div class="admin-field">
              <label for="cf_dirigido">Dirigido a <span class="admin-required" aria-hidden="true">*</span></label>
              <textarea id="cf_dirigido" maxlength="${FIELD_LIMITS.cf_dirigido}" required></textarea>
              ${charCounter("cf_dirigido")}
            </div>

            <div class="admin-field">
              <label for="cf_competencias">Competencias <span class="admin-required" aria-hidden="true">*</span></label>
              <textarea id="cf_competencias" maxlength="${FIELD_LIMITS.cf_competencias}" required></textarea>
              ${charCounter("cf_competencias")}
            </div>

            <div class="admin-field">
              <label for="cf_tutor">Tutor <span class="admin-required" aria-hidden="true">*</span></label>
              <select id="cf_tutor" required></select>
            </div>

            <div class="admin-field">
              <label for="cf_categoria">Categoría <span class="admin-required" aria-hidden="true">*</span></label>
              <select id="cf_categoria" required></select>
            </div>

            <div class="admin-field">
              <label for="cf_prioridad">Prioridad <span class="admin-required" aria-hidden="true">*</span></label>
              <select id="cf_prioridad" required></select>
            </div>

            <div class="admin-field">
              <label for="cf_calendario">Calendario <span class="admin-required" aria-hidden="true">*</span></label>
              <select id="cf_calendario" required></select>
            </div>

            <div class="admin-field">
              <label for="cf_tipo_eval">Tipo de evaluación <span class="admin-required" aria-hidden="true">*</span></label>
              <select id="cf_tipo_eval" required></select>
            </div>

            <div class="admin-field">
              <label for="cf_actividades">Actividades <span class="admin-required" aria-hidden="true">*</span></label>
              <select id="cf_actividades" required></select>
            </div>

            <div class="admin-field">
              <label for="cf_horas">Horas <span class="admin-required" aria-hidden="true">*</span></label>
              <input id="cf_horas" type="number" min="0" required>
            </div>

            <div class="admin-field">
              <label for="cf_precio">Precio <span class="admin-optional">(opcional; vacío = gratuito)</span></label>
              <input id="cf_precio" type="number" min="0" step="0.01">
            </div>

            <div class="admin-field">
              <label for="cf_fecha">Fecha de inicio <span class="admin-required" aria-hidden="true">*</span></label>
              <input id="cf_fecha" type="date" required>
            </div>

            <div class="admin-field">
              <label for="cf_estatus">Estatus</label>
              <select id="cf_estatus">
                <option value="1">Activo</option>
                <option value="4">En curso</option>
                <option value="3">Terminado</option>
                <option value="2">Pausado</option>
                <option value="5">Cancelado</option>
                <option value="0">Inactivo</option>
              </select>
            </div>

            <label class="admin-check">
              <input id="cf_certificado" type="checkbox">
              <span>Incluye certificado</span>
            </label>

            <div class="admin-news-preview">
              <p class="admin-module__subtitle">Portada <span class="admin-optional">(opcional)</span></p>
              <img id="admin-course-preview-img" alt="Portada del curso" src="${noImageSvgDataURI()}">
              <button 
                class="admin-btn admin-btn--ghost" 
                type="button" 
                data-action="pick-course-media" 
                >
                  Subir imagen
              </button>
            </div>
          </div>
        </div>

        <div class="admin-drawer__foot">
          <button class="admin-btn admin-btn--ghost" type="button" id="btn-admin-curso-cancel">
            Cancelar
          </button>

          <button class="admin-btn admin-btn--primary" type="button" id="btn-admin-curso-save">
            Guardar curso
          </button>
        </div>
      </aside>
    `;
  }

  async function handlePickMedia() {
    if (!window.AdminMedia) {
      toast("AdminMedia no está cargado.", "error");
      return;
    }

    const file = await window.AdminMedia.pickImageFile();
    if (!file) return;

    const validation = window.AdminMedia.validateImageFile(file);
    if (!validation.ok) {
      toast(validation.error, "error");
      return;
    }

    const img = qs("#admin-course-preview-img");
    const btn = qs("[data-action='pick-course-media']");
    const previewUrl = window.AdminMedia.createObjectPreview(file);

    if (img && previewUrl) img.src = previewUrl;
    if (btn) btn.textContent = "Cambiar imagen";

    if (!S.current?.id) {
      S.tempImage = file;
      toast("Imagen lista; se subirá al guardar.", "info");
      return;
    }

    try {
      const res = await window.AdminMedia.uploadAdminMedia({
        modulo: "cursos",
        id: S.current.id,
        file,
      });

      if (img && res.url) {
        img.src = withBust(res.url);
      }

      if (btn) {
        btn.textContent = "Cambiar imagen";
      }

      toast("Imagen actualizada correctamente.", "exito");
      await paintTable();
    } catch (error) {
      console.error(TAG, error);
      toast(error.message || "No se pudo subir la imagen.", "error");
    }
  }

  function setValue(id, value) {
    const el = qs(`#${id}`);
    if (el) el.value = value == null ? "" : String(value);
  }

  function getValue(id) {
    return (qs(`#${id}`)?.value || "").trim();
  }

  function getNumber(id) {
    const value = getValue(id);
    return value === "" ? null : Number(value);
  }

  function clearFieldError(field) {
    if (!field) return;
    field.classList.remove("is-invalid");
    field.removeAttribute("aria-invalid");
    field.closest(".admin-field")?.querySelector(".admin-field-error")?.remove();
  }

  function markFieldError(field, message) {
    if (!field) return;
    clearFieldError(field);
    field.classList.add("is-invalid");
    field.setAttribute("aria-invalid", "true");

    const error = document.createElement("small");
    error.className = "admin-field-error";
    error.textContent = message;
    field.closest(".admin-field")?.appendChild(error);
  }

  function validateCourseForm() {
    const missing = [];

    REQUIRED_COURSE_FIELDS.forEach(([id, label]) => {
      const field = qs(`#${id}`);
      clearFieldError(field);

      if (!field || String(field.value ?? "").trim() === "") {
        missing.push({ field, label });
        markFieldError(field, `Falta completar: ${label}.`);
      }
    });

    const price = qs("#cf_precio");
    clearFieldError(price);
    if (price?.value !== "" && Number(price.value) < 0) {
      missing.push({ field: price, label: "Precio" });
      markFieldError(price, "El precio no puede ser negativo.");
    }

    const hours = qs("#cf_horas");
    if (hours?.value !== "" && Number(hours.value) <= 0) {
      missing.push({ field: hours, label: "Horas" });
      markFieldError(hours, "Las horas deben ser mayores que cero.");
    }

    if (missing.length) {
      missing[0].field?.focus();
      missing[0].field?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast(`Revisa ${missing.length} ${missing.length === 1 ? "campo marcado" : "campos marcados"}.`, "error", 5000);
      return false;
    }

    return true;
  }

  function setSaveBusy(isBusy) {
    const button = qs("#btn-admin-curso-save");
    if (!button) return;
    button.disabled = isBusy;
    button.setAttribute("aria-busy", String(isBusy));
    button.textContent = isBusy ? "Guardando…" : "Guardar curso";
  }

  function charCounter(id) {
    const max = FIELD_LIMITS[id];

    if (!max) return "";

    return `
    <small class="admin-char-counter" data-counter-for="${esc(id)}">
      0 / ${max}
    </small>
  `;
  }

  function updateCharCounter(id) {
    const el = qs(`#${id}`);
    const counter = qs(`[data-counter-for="${id}"]`);
    const max = FIELD_LIMITS[id];

    if (!el || !counter || !max) return;

    const current = String(el.value || "").length;

    counter.textContent = `${current} / ${max}`;
    counter.classList.toggle("is-warning", current >= Math.floor(max * 0.9));
    counter.classList.toggle("is-full", current >= max);
  }

  function updateAllCharCounters() {
    Object.keys(FIELD_LIMITS).forEach(updateCharCounter);
  }

  function bindCharCounters() {
    const drawer = qs("#admin-curso-drawer");
    if (!drawer) return;

    Object.entries(FIELD_LIMITS).forEach(([id, max]) => {
      const el = qs(`#${id}`, drawer);
      if (!el) return;

      el.setAttribute("maxlength", String(max));

      el.addEventListener("input", () => {
        updateCharCounter(id);
      });
    });

    updateAllCharCounters();
  }

  function openEditor(row = null) {
    S.current = row;
    S.tempImage = null;

    const drawer = qs("#admin-curso-drawer");
    const overlay = qs("#admin-curso-overlay");
    const title = qs("#admin-curso-drawer-title");

    if (!drawer || !overlay) return;

    drawer.querySelectorAll(".is-invalid").forEach(clearFieldError);

    if (title) {
      title.textContent = row ? "Editar curso" : "Nuevo curso";
    }

    setValue("cf_nombre", row?.nombre);
    setValue("cf_desc_breve", row?.descripcion_breve);
    setValue("cf_desc_media", row?.descripcion_media);
    setValue("cf_desc_curso", row?.descripcion_curso);
    setValue("cf_dirigido", row?.dirigido);
    setValue("cf_competencias", row?.competencias);
    setValue("cf_horas", row?.horas);
    setValue("cf_precio", row?.precio);
    setValue("cf_fecha", row?.fecha_inicio);
    setValue("cf_estatus", row?.estatus ?? 1);
    updateAllCharCounters();

    const cert = qs("#cf_certificado");
    if (cert) cert.checked = Number(row?.certificado || 0) === 1;

    qs("#cf_tutor").innerHTML = mapOptions(S.maps.tutores, row?.tutor);
    qs("#cf_categoria").innerHTML = mapOptions(S.maps.categorias, row?.categoria);
    qs("#cf_prioridad").innerHTML = mapOptions(S.maps.prioridad, row?.prioridad);
    qs("#cf_calendario").innerHTML = mapOptions(S.maps.calendario, row?.calendario);
    qs("#cf_tipo_eval").innerHTML = mapOptions(S.maps.tipoEval, row?.tipo_evaluacion);
    qs("#cf_actividades").innerHTML = mapOptions(S.maps.actividades, row?.actividades);

    const img = qs("#admin-course-preview-img");
    if (img) {
      img.src = noImageSvgDataURI();

      if (row?.id) {
        resolveCursoImg(row.id).then((src) => {
          img.src = src;
        });
      }
    }

    overlay.hidden = false;
    drawer.hidden = false;

    requestAnimationFrame(() => {
      overlay.classList.add("is-open");
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
    });
  }

  function closeEditor() {
    const drawer = qs("#admin-curso-drawer");
    const overlay = qs("#admin-curso-overlay");

    if (!drawer || !overlay) return;

    drawer.classList.remove("is-open");
    overlay.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");

    setTimeout(() => {
      drawer.hidden = true;
      overlay.hidden = true;
      S.current = null;
    }, 220);
  }

  async function saveCurso() {
    const id = S.current?.id ?? null;

    if (!validateCourseForm()) return;

    const body = {
      id,
      nombre: getValue("cf_nombre"),
      descripcion_breve: getValue("cf_desc_breve"),
      descripcion_media: getValue("cf_desc_media"),
      descripcion_curso: getValue("cf_desc_curso"),
      dirigido: getValue("cf_dirigido"),
      competencias: getValue("cf_competencias"),
      tutor: getNumber("cf_tutor"),
      horas: getNumber("cf_horas"),
      precio: Number(getValue("cf_precio") || 0),
      estatus: getNumber("cf_estatus"),
      fecha_inicio: getValue("cf_fecha"),
      prioridad: getNumber("cf_prioridad"),
      categoria: getNumber("cf_categoria"),
      calendario: getNumber("cf_calendario"),
      tipo_evaluacion: getNumber("cf_tipo_eval"),
      actividades: getNumber("cf_actividades"),
      certificado: qs("#cf_certificado")?.checked ? 1 : 0,
    };

    if (
      !body.nombre ||
      !body.descripcion_breve ||
      !body.descripcion_media ||
      !body.descripcion_curso ||
      !body.dirigido ||
      !body.competencias ||
      !body.tutor ||
      !body.categoria ||
      !body.prioridad ||
      !body.calendario ||
      !body.tipo_evaluacion ||
      !body.actividades ||
      body.horas === null ||
      !body.fecha_inicio
    ) {
      toast("Completa los campos obligatorios.", "error");
      return;
    }

    setSaveBusy(true);

    try {
      if (id) {
        await postJSON(API.editar, body);
        toast("Curso actualizado correctamente.", "exito");
      } else {
        const creado_por = getCreatorId();

        if (!creado_por) {
          toast("No se pudo detectar el usuario creador.", "error");
          return;
        }

        const insertBody = { ...body, creado_por };
        delete insertBody.id;

        const created = await postJSON(API.crear, insertBody);
        const newId = getCreatedId(created);

        if (!newId) {
          throw new Error("El servidor no confirmó el ID del curso creado.");
        } else if (window.AdminMedia && S.tempImage instanceof File) {
          try {
            await window.AdminMedia.uploadAdminMedia({
              modulo: "cursos",
              id: newId,
              file: S.tempImage,
            });

            S.tempImage = null;
          } catch (mediaError) {
            console.error(TAG, mediaError);
            toast("Curso creado, pero no se pudo subir la imagen.", "warning");
          }
        }
        toast("Curso creado correctamente.", "exito");
      }

      S.loaded = false;
      await loadCatalogos();
      await loadCursos();
      await paintTable();
      closeEditor();
    } catch (error) {
      console.error(TAG, error);
      const apiField = String(error.message || "").match(/Falta el campo requerido:\s*([a-z_]+)/i)?.[1];
      const formField = apiField ? qs(`#${API_FIELD_TO_FORM_ID[apiField]}`) : null;
      if (formField) {
        markFieldError(formField, error.message);
        formField.focus();
        formField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      toast(error.message || "No se pudo guardar el curso.", "error", 5000);
    } finally {
      setSaveBusy(false);
    }
  }

  function bindTableEvents() {
    const tbody = qs("#admin-cursos-tbody");
    const pagination = qs("#admin-cursos-pagination");

    tbody?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action='edit']");
      if (!btn) return;

      const id = Number(btn.dataset.id);
      const row = S.data.find((item) => Number(item.id) === id);

      if (row) openEditor(row);
    });

    pagination?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-page]");
      if (!btn) return;

      const rows = getFilteredRows();
      const totalPages = Math.max(1, Math.ceil(rows.length / S.pageSize));
      const page = btn.dataset.page;

      if (page === "prev") S.page = Math.max(1, S.page - 1);
      else if (page === "next") S.page = Math.min(totalPages, S.page + 1);
      else S.page = Number(page);

      paintTable();
    });
  }

  function bind() {
    paintTable();

    qs("#btn-admin-curso-new")?.addEventListener("click", () => openEditor(null));
    qs("#btn-admin-curso-close")?.addEventListener("click", closeEditor);
    qs("#btn-admin-curso-cancel")?.addEventListener("click", closeEditor);
    qs("#admin-curso-overlay")?.addEventListener("click", closeEditor);
    qs("#btn-admin-curso-save")?.addEventListener("click", saveCurso);
    qs("#admin-curso-drawer")?.addEventListener("input", (event) => clearFieldError(event.target));
    qs("#admin-curso-drawer")?.addEventListener("change", (event) => clearFieldError(event.target));
    bindCharCounters();

    const search = qs("#admin-cursos-search");

    if (search) {
      search.value = S.search;
      search.addEventListener("input", (e) => {
        S.search = e.target.value || "";
        S.page = 1;
        paintTable();
      });
    }

    if (!S.documentEventsBound) {
      S.documentEventsBound = true;

      document.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-action='pick-course-media']");
        if (!btn) return;

        const drawer = qs("#admin-curso-drawer");
        if (!drawer || !drawer.contains(btn)) return;

        handlePickMedia();
      });
    }

    bindTableEvents();
  }

  async function init() {
    if (!S.loaded) {
      await loadCatalogos();
      await loadCursos();
    }
  }

  window.AdminCursos = {
    init,
    render,
    bind,
    reload: async () => {
      await loadCatalogos();
      await loadCursos();
    },
  };
})(window, document);
