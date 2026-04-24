(function (window, document) {
  "use strict";

  const TAG = "[AdminTutores]";

  const API_BASE =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";

  const API = {
    listar: API_BASE + "c_tutor.php",
    crear: API_BASE + "i_tutor.php",
    editar: API_BASE + "u_tutor.php",
  };

  const S = {
    data: [],
    page: 1,
    pageSize: 8,
    search: "",
    loaded: false,
    current: null,
  };

  const ORDER_TUTORES = [1, 2, 0];

  const STATUS_LABEL = {
    1: "Activo",
    2: "Pausado",
    0: "Inactivo",
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

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);

    try {
      return JSON.parse(text);
    } catch {
      return { _raw: text };
    }
  }

  function getRowsFromResponse(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.tutores)) return response.tutores;
    return [];
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

  function withBust(url) {
    if (!url || url.startsWith("data:") || url.startsWith("blob:")) return url;
    return url + (url.includes("?") ? "&" : "?") + "v=" + Date.now();
  }

  function tutorImgUrl(id, ext = "png") {
    return `/ASSETS/tutor/tutor_${Number(id)}.${ext}`;
  }

  function noImageSvgDataURI() {
    const svg =
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 100'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M18 74 L56 38 L92 66 L120 50 L142 74' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  async function resolveTutorImg(id) {
    const tryUrl = async (ext) => {
      const url = withBust(tutorImgUrl(id, ext));

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

  function statusText(estatus) {
    if (window.gcTone?.statusLabel) {
      return window.gcTone.statusLabel("tutores", estatus);
    }

    return STATUS_LABEL[Number(estatus)] ?? "Desconocido";
  }

  function statusBadge(estatus) {
    if (window.gcTone?.statusBadge) {
      return window.gcTone.statusBadge("tutores", estatus);
    }

    const n = Number(estatus);

    if (n === 1) return `<span class="admin-badge admin-badge--active">Activo</span>`;
    if (n === 2) return `<span class="admin-badge admin-badge--warning">Pausado</span>`;

    return `<span class="admin-badge admin-badge--inactive">Inactivo</span>`;
  }

  function fmtDate(value) {
    if (!value) return "—";

    try {
      const [date, time = ""] = String(value).split(" ");
      const [y, m, d] = date.split("-");
      if (!y || !m || !d) return String(value);
      return `${d}/${m}/${y} ${time}`.trim();
    } catch {
      return String(value);
    }
  }

  async function loadTutores() {
    const chunks = await Promise.all(
      ORDER_TUTORES.map((estatus) =>
        postJSON(API.listar, { estatus }).catch(() => [])
      )
    );

    const flat = [];

    chunks.forEach((chunk) => {
      flat.push(...getRowsFromResponse(chunk));
    });

    S.data = flat.map((row) => ({
      ...row,
      id: Number(row.id),
      estatus: Number(row.estatus),
    }));

    S.page = 1;
    S.loaded = true;
    sortTutores();
  }

  function sortTutores() {
    const rank = new Map(ORDER_TUTORES.map((status, index) => [String(status), index]));

    S.data.sort((a, b) => {
      const ra = rank.get(String(a.estatus)) ?? 999;
      const rb = rank.get(String(b.estatus)) ?? 999;

      if (ra !== rb) return ra - rb;

      return String(a.nombre || "").localeCompare(String(b.nombre || ""));
    });
  }

  function render() {
    return `
      <section class="admin-module admin-module--tutores">
        <div class="admin-module__head">
          <div class="admin-module__titlebox">
            <h1 class="admin-module__title">Tutores</h1>
            <p class="admin-module__subtitle">Administra tutores, perfiles y estatus.</p>
          </div>

          <div class="admin-module__toolbar">
            <label class="admin-search" aria-label="Buscar tutores">
              <span>🔎</span>
              <input id="admin-tutores-search" type="search" placeholder="Buscar tutor..." />
            </label>

            <button class="admin-btn admin-btn--primary" id="btn-admin-tutor-new" type="button">
              Nuevo tutor
            </button>
          </div>
        </div>

        <div class="admin-module__body">
          <div class="table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Fecha creación</th>
                  <th>Estatus</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="admin-tutores-tbody">
                <tr>
                  <td colspan="6">Cargando tutores...</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="admin-pagination">
            <div class="admin-pagination__info" id="admin-tutores-info"></div>
            <div class="admin-pagination__controls" id="admin-tutores-pagination"></div>
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
      normalize(`
        ${row.id}
        ${row.nombre}
        ${row.descripcion}
        ${row.fecha_creacion}
        ${statusText(row.estatus)}
      `).includes(term)
    );
  }

  async function paintTable() {
    const tbody = qs("#admin-tutores-tbody");
    const info = qs("#admin-tutores-info");

    if (!tbody) return;

    const rows = getFilteredRows();
    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / S.pageSize));

    if (S.page > totalPages) S.page = totalPages;

    const start = (S.page - 1) * S.pageSize;
    const pageRows = rows.slice(start, start + S.pageSize);

    if (info) {
      info.textContent = `${total} ${total === 1 ? "tutor" : "tutores"}`;
    }

    if (!pageRows.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">No se encontraron tutores.</td>
        </tr>
      `;
      paintPagination(totalPages);
      return;
    }

    tbody.innerHTML = pageRows.map((row) => `
      <tr data-id="${esc(row.id)}">
        <td>
          <div class="admin-news-thumb">
            <img data-tutor-img="${esc(row.id)}" alt="${esc(row.nombre || "Tutor")}" src="${noImageSvgDataURI()}">
          </div>
        </td>
        <td><strong>${esc(row.nombre || "Sin nombre")}</strong></td>
        <td>${esc(row.descripcion || "—")}</td>
        <td>${esc(fmtDate(row.fecha_creacion))}</td>
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
      const img = qs(`[data-tutor-img="${CSS.escape(String(row.id))}"]`, tbody);
      if (!img) continue;

      img.src = await resolveTutorImg(row.id);
      img.onerror = () => {
        img.onerror = null;
        img.src = noImageSvgDataURI();
      };
    }
  }

  function paintPagination(totalPages) {
    const host = qs("#admin-tutores-pagination");
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
      <div class="admin-drawer-overlay" id="admin-tutor-overlay" hidden></div>

      <aside class="admin-drawer" id="admin-tutor-drawer" hidden aria-hidden="true">
        <div class="admin-drawer__head">
          <div>
            <h2 class="admin-drawer__title" id="admin-tutor-drawer-title">Nuevo tutor</h2>
            <p class="admin-drawer__subtitle">Completa la información del tutor.</p>
          </div>

          <button class="admin-drawer__close" type="button" id="btn-admin-tutor-close" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div class="admin-drawer__body">
          <div class="admin-news-form">
            <div class="admin-field">
              <label for="tf_nombre">Nombre</label>
              <input id="tf_nombre" type="text" maxlength="120">
            </div>

            <div class="admin-field">
              <label for="tf_descripcion">Descripción</label>
              <textarea id="tf_descripcion" maxlength="800"></textarea>
            </div>

            <div class="admin-field">
              <label for="tf_estatus">Estatus</label>
              <select id="tf_estatus">
                <option value="1">Activo</option>
                <option value="2">Pausado</option>
                <option value="0">Inactivo</option>
              </select>
            </div>

            <div class="admin-news-preview">
              <p class="admin-module__subtitle">Foto</p>
              <img id="admin-tutor-preview-img" alt="Foto del tutor" src="${noImageSvgDataURI()}">
              <button class="admin-btn admin-btn--ghost" type="button" disabled>
                Media pendiente
              </button>
            </div>
          </div>
        </div>

        <div class="admin-drawer__foot">
          <button class="admin-btn admin-btn--ghost" type="button" id="btn-admin-tutor-cancel">
            Cancelar
          </button>

          <button class="admin-btn admin-btn--primary" type="button" id="btn-admin-tutor-save">
            Guardar tutor
          </button>
        </div>
      </aside>
    `;
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

  function openEditor(row = null) {
    S.current = row;

    const drawer = qs("#admin-tutor-drawer");
    const overlay = qs("#admin-tutor-overlay");
    const title = qs("#admin-tutor-drawer-title");

    if (!drawer || !overlay) return;

    if (title) {
      title.textContent = row ? "Editar tutor" : "Nuevo tutor";
    }

    setValue("tf_nombre", row?.nombre);
    setValue("tf_descripcion", row?.descripcion);
    setValue("tf_estatus", row?.estatus ?? 1);

    const img = qs("#admin-tutor-preview-img");
    if (img) {
      img.src = noImageSvgDataURI();

      if (row?.id) {
        resolveTutorImg(row.id).then((src) => {
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
    const drawer = qs("#admin-tutor-drawer");
    const overlay = qs("#admin-tutor-overlay");

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

  async function saveTutor() {
    const id = S.current?.id ?? null;

    const body = {
      id,
      nombre: getValue("tf_nombre"),
      descripcion: getValue("tf_descripcion"),
      estatus: getNumber("tf_estatus") ?? 1,
    };

    if (!body.nombre || !body.descripcion) {
      toast("Nombre y descripción son obligatorios.", "error");
      return;
    }

    try {
      if (id) {
        await postJSON(API.editar, body);
        toast("Tutor actualizado correctamente.", "exito");
      } else {
        const creado_por = getCreatorId() || Number(window.usuario?.id || 1) || 1;
        const insertBody = { ...body, creado_por };
        delete insertBody.id;

        await postJSON(API.crear, insertBody);
        toast("Tutor creado correctamente.", "exito");
      }

      S.loaded = false;
      await loadTutores();
      await paintTable();
      closeEditor();
    } catch (error) {
      console.error(TAG, error);
      toast("No se pudo guardar el tutor.", "error");
    }
  }

  function bindTableEvents() {
    const tbody = qs("#admin-tutores-tbody");
    const pagination = qs("#admin-tutores-pagination");

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

    qs("#btn-admin-tutor-new")?.addEventListener("click", () => openEditor(null));
    qs("#btn-admin-tutor-close")?.addEventListener("click", closeEditor);
    qs("#btn-admin-tutor-cancel")?.addEventListener("click", closeEditor);
    qs("#admin-tutor-overlay")?.addEventListener("click", closeEditor);
    qs("#btn-admin-tutor-save")?.addEventListener("click", saveTutor);

    const search = qs("#admin-tutores-search");

    if (search) {
      search.value = S.search;
      search.addEventListener("input", (e) => {
        S.search = e.target.value || "";
        S.page = 1;
        paintTable();
      });
    }

    bindTableEvents();
  }

  async function init() {
    if (!S.loaded) {
      await loadTutores();
    }
  }

  window.AdminTutores = {
    init,
    render,
    bind,
    reload: loadTutores,
  };
})(window, document);