(function (window, document) {
  "use strict";

  const TAG = "[AdminNoticias]";

  const API_BASE =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";

  const API = {
    listar: API_BASE + "c_noticia.php",
    crear: API_BASE + "i_noticia.php",
    editar: API_BASE + "u_noticia.php",
  };

  const S = {
    data: [],
    page: 1,
    pageSize: 8,
    search: "",
    loaded: false,
    current: null,
  };

  const STATUS_LABEL = {
    1: "Activo",
    2: "En pausa",
    3: "Temporal",
    0: "Inactivo",
    4: "Cancelado",
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

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    try {
      return JSON.parse(text);
    } catch {
      return { _raw: text };
    }
  }

  function getRowsFromResponse(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
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

  function noticiaImgUrl(id, pos, ext = "png") {
    return `/ASSETS/noticia/NoticiasImg/noticia_img${pos}_${Number(id)}.${ext}`;
  }

  function noImageSvgDataURI() {
    const svg =
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M20 70 L60 35 L95 65 L120 50 L140 70' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  async function resolveNoticiaImg(id, pos = 1) {
    const tryUrl = async (ext) => {
      const url = withBust(noticiaImgUrl(id, pos, ext));

      const ok = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });

      return ok ? url : null;
    };

    return (
      (await tryUrl("png")) ||
      (await tryUrl("jpg")) ||
      (await tryUrl("jpeg")) ||
      noImageSvgDataURI()
    );
  }

  async function loadNoticias() {
    const response = await postJSON(API.listar, { estatus: 9999 });
    S.data = getRowsFromResponse(response);
    S.loaded = true;
    S.page = 1;
  }

  function statusText(estatus) {
    return STATUS_LABEL[Number(estatus)] ?? "Desconocido";
  }

  function statusBadge(estatus) {
    const n = Number(estatus);

    if (n === 1) {
      return `<span class="admin-badge admin-badge--active">Activo</span>`;
    }

    if (n === 2 || n === 3) {
      return `<span class="admin-badge admin-badge--warning">${esc(statusText(n))}</span>`;
    }

    if (n === 4) {
      return `<span class="admin-badge admin-badge--danger">Cancelado</span>`;
    }

    return `<span class="admin-badge admin-badge--inactive">${esc(statusText(n))}</span>`;
  }

  function render() {
    return `
      <section class="admin-module admin-module--noticias">
        <div class="admin-module__head">
          <div class="admin-module__titlebox">
            <h1 class="admin-module__title">Noticias</h1>
            <p class="admin-module__subtitle">Administra las noticias publicadas en GodCode.</p>
          </div>

          <div class="admin-module__toolbar">
            <label class="admin-search" aria-label="Buscar noticias">
              <span>🔎</span>
              <input id="admin-noticias-search" type="search" placeholder="Buscar noticia..." />
            </label>

            <button class="admin-btn admin-btn--primary" id="btn-admin-noticia-new" type="button">
              Nueva noticia
            </button>
          </div>
        </div>

        <div class="admin-module__body">
          <div class="table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Título</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                  <th>Estatus</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="admin-noticias-tbody">
                <tr>
                  <td colspan="6">Cargando noticias...</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="admin-pagination">
            <div class="admin-pagination__info" id="admin-noticias-info"></div>
            <div class="admin-pagination__controls" id="admin-noticias-pagination"></div>
          </div>
        </div>
      </section>
    `;
  }

  function getFilteredRows() {
    const term = normalize(S.search);
    if (!term) return S.data;

    return S.data.filter((row) =>
      normalize(`
        ${row.titulo}
        ${row.desc_uno}
        ${row.desc_dos}
        ${row.fecha_creacion}
        ${statusText(row.estatus)}
      `).includes(term)
    );
  }

  async function paintTable() {
    const tbody = qs("#admin-noticias-tbody");
    const info = qs("#admin-noticias-info");

    if (!tbody) return;

    const rows = getFilteredRows();
    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / S.pageSize));

    if (S.page > totalPages) S.page = totalPages;

    const start = (S.page - 1) * S.pageSize;
    const pageRows = rows.slice(start, start + S.pageSize);

    if (info) {
      info.textContent = `${total} ${total === 1 ? "noticia" : "noticias"}`;
    }

    if (!pageRows.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">No se encontraron noticias.</td>
        </tr>
      `;
      paintPagination(totalPages);
      return;
    }

    tbody.innerHTML = pageRows.map((row) => `
      <tr data-id="${esc(row.id)}">
        <td>
          <div class="admin-news-thumb">
            <img data-news-img="${esc(row.id)}" alt="${esc(row.titulo || "Noticia")}" src="${noImageSvgDataURI()}">
          </div>
        </td>
        <td><strong>${esc(row.titulo || "Sin título")}</strong></td>
        <td>${esc(row.desc_uno || "—")}</td>
        <td>${esc(row.fecha_creacion || "—")}</td>
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
      const img = qs(`[data-news-img="${CSS.escape(String(row.id))}"]`, tbody);
      if (!img) continue;

      img.src = await resolveNoticiaImg(row.id, 1);
      img.onerror = () => {
        img.onerror = null;
        img.src = noImageSvgDataURI();
      };
    }
  }

  function paintPagination(totalPages) {
    const host = qs("#admin-noticias-pagination");
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

  function openEditor(row = null) {
    S.current = row;

    const title = row ? "Editar noticia" : "Nueva noticia";

    const html = `
      <div class="admin-news-editor" id="admin-news-editor">
        <div class="admin-card">
          <div class="admin-module__head">
            <div class="admin-module__titlebox">
              <h2 class="admin-module__title">${title}</h2>
              <p class="admin-module__subtitle">Completa la información de la noticia.</p>
            </div>

            <button class="admin-btn admin-btn--ghost" type="button" id="btn-admin-noticia-cancel">
              Volver
            </button>
          </div>

          <div class="admin-news-form">
            <div class="admin-field">
              <label for="nf_titulo">Título</label>
              <input id="nf_titulo" type="text" value="${esc(row?.titulo || "")}">
            </div>

            <div class="admin-field">
              <label for="nf_desc_uno">Descripción 1</label>
              <textarea id="nf_desc_uno">${esc(row?.desc_uno || "")}</textarea>
            </div>

            <div class="admin-field">
              <label for="nf_desc_dos">Descripción 2</label>
              <textarea id="nf_desc_dos">${esc(row?.desc_dos || "")}</textarea>
            </div>

            <div class="admin-field">
              <label for="nf_estatus">Estatus</label>
              <select id="nf_estatus">
                <option value="1" ${Number(row?.estatus ?? 1) === 1 ? "selected" : ""}>Activo</option>
                <option value="2" ${Number(row?.estatus) === 2 ? "selected" : ""}>En pausa</option>
                <option value="3" ${Number(row?.estatus) === 3 ? "selected" : ""}>Temporal</option>
                <option value="0" ${Number(row?.estatus) === 0 ? "selected" : ""}>Inactivo</option>
                <option value="4" ${Number(row?.estatus) === 4 ? "selected" : ""}>Cancelado</option>
              </select>
            </div>

            <div class="admin-news-preview">
              <p class="admin-module__subtitle">Imagen principal</p>
              <img id="admin-news-preview-img" alt="Imagen de noticia" src="${noImageSvgDataURI()}">
            </div>

            <div class="admin-module__toolbar">
              <button class="admin-btn admin-btn--primary" type="button" id="btn-admin-noticia-save">
                Guardar noticia
              </button>
              <button class="admin-btn admin-btn--ghost" type="button" id="btn-admin-noticia-cancel-2">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const body = qs(".admin-module__body");
    if (body) body.innerHTML = html;

    bindEditor();

    if (row?.id) {
      resolveNoticiaImg(row.id, 1).then((src) => {
        const img = qs("#admin-news-preview-img");
        if (img) img.src = src;
      });
    }
  }

  function closeEditor() {
    const body = qs(".admin-module__body");
    if (!body) return;

    body.innerHTML = `
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Título</th>
              <th>Descripción</th>
              <th>Fecha</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="admin-noticias-tbody"></tbody>
        </table>
      </div>

      <div class="admin-pagination">
        <div class="admin-pagination__info" id="admin-noticias-info"></div>
        <div class="admin-pagination__controls" id="admin-noticias-pagination"></div>
      </div>
    `;

    bindTableEvents();
    paintTable();
  }

  async function saveNoticia() {
    const id = S.current?.id ?? null;
    const titulo = qs("#nf_titulo")?.value.trim() || "";
    const desc_uno = qs("#nf_desc_uno")?.value.trim() || "";
    const desc_dos = qs("#nf_desc_dos")?.value.trim() || "";
    const estatus = Number(qs("#nf_estatus")?.value || 1);

    if (!titulo || !desc_uno || !desc_dos) {
      toast("Título, descripción 1 y descripción 2 son obligatorios.", "error");
      return;
    }

    try {
      if (id) {
        await postJSON(API.editar, {
          id: Number(id),
          titulo,
          desc_uno,
          desc_dos,
          estatus,
        });

        toast("Noticia actualizada correctamente.", "exito");
      } else {
        const creado_por = getCreatorId();

        if (!creado_por) {
          toast("No se pudo detectar el usuario creador.", "error");
          return;
        }

        await postJSON(API.crear, {
          titulo,
          desc_uno,
          desc_dos,
          creado_por,
          estatus,
        });

        toast("Noticia creada correctamente.", "exito");
      }

      S.loaded = false;
      await loadNoticias();
      closeEditor();
    } catch (error) {
      console.error(TAG, error);
      toast("No se pudo guardar la noticia.", "error");
    }
  }

  function bindEditor() {
    qs("#btn-admin-noticia-save")?.addEventListener("click", saveNoticia);
    qs("#btn-admin-noticia-cancel")?.addEventListener("click", closeEditor);
    qs("#btn-admin-noticia-cancel-2")?.addEventListener("click", closeEditor);
  }

  function bindTableEvents() {
    const tbody = qs("#admin-noticias-tbody");
    const pagination = qs("#admin-noticias-pagination");

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

    const search = qs("#admin-noticias-search");
    const btnNew = qs("#btn-admin-noticia-new");

    if (search) {
      search.value = S.search;
      search.addEventListener("input", (e) => {
        S.search = e.target.value || "";
        S.page = 1;
        paintTable();
      });
    }

    btnNew?.addEventListener("click", () => openEditor(null));
    bindTableEvents();
  }

  async function init() {
    if (!S.loaded) {
      await loadNoticias();
    }
  }

  window.AdminNoticias = {
    init,
    render,
    bind,
    reload: loadNoticias,
  };
})(window, document);