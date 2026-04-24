(function (window, document) {
  "use strict";

  const TAG = "[AdminSuscripciones]";

  const API_BASE =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";

  const API = {
    listar: API_BASE + "c_suscripciones.php",
    crear: API_BASE + "i_inscripcion.php",
    editar: API_BASE + "u_inscripcion.php",
    cursos: API_BASE + "c_cursos.php",
    usuarios: API_BASE + "c_usuarios.php",
  };

  const S = {
    data: [],
    raw: [],
    page: 1,
    pageSize: 8,
    search: "",
    loaded: false,
    current: null,
    maps: {
      cursos: {},
      usuarios: {},
    },
    create: {
      cursoId: null,
      usuario: null,
    },
  };

  const STATUS_LABEL = {
    1: "Activo",
    0: "Cancelado",
    2: "Suscrito",
    3: "Terminado",
  };

  const ORDER_SUSCRIPCIONES = [2, 1, 3, 0];

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

    if (!text.trim()) return {};

    try {
      return JSON.parse(text);
    } catch {
      return { _raw: text };
    }
  }

  function getRowsFromResponse(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.suscripciones)) return response.suscripciones;
    if (Array.isArray(response?.usuarios)) return response.usuarios;
    if (Array.isArray(response?.cursos)) return response.cursos;
    return [];
  }

  function arrToMap(arr, fallback = "Item") {
    const map = {};

    getRowsFromResponse(arr).forEach((item) => {
      const id = item?.id ?? item?.usuario_id ?? item?.curso_id;
      if (id == null) return;

      map[String(id)] =
        item.nombre ||
        item.nombre_completo ||
        item.titulo ||
        item.descripcion ||
        `${fallback} #${id}`;
    });

    return map;
  }

  function mapCursoLabel(id) {
    const key = String(id ?? "");
    return S.maps.cursos[key] || `Curso #${key || "—"}`;
  }

  function mapUserLabel(id) {
    const key = String(id ?? "");
    return S.maps.usuarios[key] || `Usuario #${key || "—"}`;
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

  function statusText(estatus) {
    if (window.gcTone?.statusLabel) {
      return window.gcTone.statusLabel("suscripciones", estatus);
    }

    return STATUS_LABEL[Number(estatus)] ?? "Desconocido";
  }

  function statusBadge(estatus) {
    if (window.gcTone?.statusBadge) {
      return window.gcTone.statusBadge("suscripciones", estatus);
    }

    const n = Number(estatus);

    if (n === 2) return `<span class="admin-badge admin-badge--warning">Suscrito</span>`;
    if (n === 1) return `<span class="admin-badge admin-badge--active">Activo</span>`;
    if (n === 3) return `<span class="admin-badge admin-badge--inactive">Terminado</span>`;

    return `<span class="admin-badge admin-badge--danger">Cancelado</span>`;
  }

  function getUsuarioId(row) {
    return (
      Number(
        row.usuario_id ??
        row.user_id ??
        row.alumno ??
        row.alumno_id ??
        row.usuario ??
        0
      ) || null
    );
  }

  function getCursoId(row) {
    return Number(row.curso ?? row.curso_id ?? row.id_curso ?? 0) || null;
  }

  function getSuscripcionId(row) {
    return Number(row.id ?? row.suscripcion_id ?? row.inscripcion_id ?? 0);
  }

  function getInlineUserName(row, usuarioId) {
    const inline =
      row.alumno_nombre ||
      row.usuario_nombre ||
      row.suscriptor ||
      row.nombre_usuario ||
      row.nombre ||
      null;

    if (inline && !/^\s*\d+\s*$/.test(String(inline))) return inline;

    return usuarioId ? mapUserLabel(usuarioId) : "—";
  }

  async function loadCursosMap() {
    const statuses = [1, 4, 2, 3, 0, 5];

    const chunks = await Promise.all(
      statuses.map((estatus) =>
        postJSON(API.cursos, { estatus }).catch(() => [])
      )
    );

    const flat = chunks.flatMap(getRowsFromResponse);
    S.maps.cursos = arrToMap(flat, "Curso");
  }

  async function loadUsuariosMap() {
    const attempts = [{}, { estatus: 1 }, { estatus: 0 }, { estatus: 2 }, { estatus: 3 }];
    const seen = new Map();

    for (const body of attempts) {
      try {
        const res = await postJSON(API.usuarios, body);
        getRowsFromResponse(res).forEach((user) => {
          const id = String(user?.id ?? user?.usuario_id ?? "");
          if (id && !seen.has(id)) seen.set(id, user);
        });
      } catch { }
    }

    S.maps.usuarios = arrToMap([...seen.values()], "Usuario");
  }

  async function loadSuscripciones() {
    const chunks = await Promise.all(
      ORDER_SUSCRIPCIONES.map((estatus) =>
        postJSON(API.listar, { estatus }).catch(() => [])
      )
    );

    const flat = chunks.flatMap(getRowsFromResponse);
    S.raw = flat;

    S.data = flat.map((row) => {
      const id = getSuscripcionId(row);
      const usuarioId = getUsuarioId(row);
      const cursoId = getCursoId(row);

      return {
        id,
        usuario_id: usuarioId,
        curso: cursoId,
        alumnoNombre: getInlineUserName(row, usuarioId),
        estatus: Number(row.estatus ?? row.status ?? 0),
        fecha_creacion:
          row.fecha_creacion ?? row.creado ?? row.created_at ?? row.fecha ?? null,
        comentario: row.comentario ?? row.nota ?? "",
        _all: row,
      };
    });

    S.page = 1;
    S.loaded = true;
    sortSuscripciones();
  }

  function sortSuscripciones() {
    const rank = new Map(
      ORDER_SUSCRIPCIONES.map((status, index) => [String(status), index])
    );

    S.data.sort((a, b) => {
      const ra = rank.get(String(a.estatus)) ?? 999;
      const rb = rank.get(String(b.estatus)) ?? 999;

      if (ra !== rb) return ra - rb;

      return String(a.alumnoNombre || "").localeCompare(
        String(b.alumnoNombre || "")
      );
    });
  }

  async function init() {
    if (!S.loaded) {
      await loadCursosMap();
      await loadUsuariosMap();
      await loadSuscripciones();
    }
  }

  function render() {
    return `
      <section class="admin-module admin-module--suscripciones">
        <div class="admin-module__head">
          <div class="admin-module__titlebox">
            <h1 class="admin-module__title">Suscripciones</h1>
            <p class="admin-module__subtitle">Administra inscripciones de usuarios a cursos.</p>
          </div>

          <div class="admin-module__toolbar">
            <label class="admin-search" aria-label="Buscar suscripciones">
              <span>🔎</span>
              <input id="admin-suscripciones-search" type="search" placeholder="Buscar suscripción..." />
            </label>

            <button class="admin-btn admin-btn--primary" id="btn-admin-suscripcion-new" type="button">
              Nueva suscripción
            </button>
          </div>
        </div>

        <div class="admin-module__body">
          <div class="table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Suscriptor</th>
                  <th>Curso</th>
                  <th>Fecha</th>
                  <th>Estatus</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="admin-suscripciones-tbody">
                <tr>
                  <td colspan="6">Cargando suscripciones...</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="admin-pagination">
            <div class="admin-pagination__info" id="admin-suscripciones-info"></div>
            <div class="admin-pagination__controls" id="admin-suscripciones-pagination"></div>
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
        ${row.alumnoNombre}
        ${mapCursoLabel(row.curso)}
        ${row.comentario}
        ${row.fecha_creacion}
        ${statusText(row.estatus)}
        ${JSON.stringify(row._all || {})}
      `).includes(term)
    );
  }

  function paintTable() {
    const tbody = qs("#admin-suscripciones-tbody");
    const info = qs("#admin-suscripciones-info");

    if (!tbody) return;

    const rows = getFilteredRows();
    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / S.pageSize));

    if (S.page > totalPages) S.page = totalPages;

    const start = (S.page - 1) * S.pageSize;
    const pageRows = rows.slice(start, start + S.pageSize);

    if (info) {
      info.textContent = `${total} ${total === 1 ? "suscripción" : "suscripciones"}`;
    }

    if (!pageRows.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">No se encontraron suscripciones.</td>
        </tr>
      `;
      paintPagination(totalPages);
      return;
    }

    tbody.innerHTML = pageRows
      .map(
        (row) => `
        <tr data-id="${esc(row.id)}">
          <td><strong>${esc(row.alumnoNombre || "—")}</strong></td>
          <td>${esc(mapCursoLabel(row.curso))}</td>
          <td>${esc(fmtDate(row.fecha_creacion))}</td>
          <td>${statusBadge(row.estatus)}</td>
          <td>
            <button class="admin-btn admin-btn--ghost" type="button" data-action="edit" data-id="${esc(row.id)}">
              Editar
            </button>
          </td>
        </tr>
      `
      )
      .join("");

    paintPagination(totalPages);
  }

  function paintPagination(totalPages) {
    const host = qs("#admin-suscripciones-pagination");
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

  function statusOptions(selected) {
    return Object.entries(STATUS_LABEL)
      .map(([value, label]) => {
        const isSelected = Number(value) === Number(selected);
        return `<option value="${value}"${isSelected ? " selected" : ""}>${esc(label)}</option>`;
      })
      .join("");
  }

  function cursosOptions(selected = "") {
    const opts = Object.entries(S.maps.cursos || {})
      .map(([id, name]) => {
        const isSelected = Number(id) === Number(selected);
        return `<option value="${esc(id)}"${isSelected ? " selected" : ""}>${esc(name)}</option>`;
      })
      .join("");

    return `<option value="">Selecciona un curso</option>${opts}`;
  }

  function drawerTemplate() {
    return `
      <div class="admin-drawer-overlay" id="admin-suscripcion-overlay" hidden></div>

      <aside class="admin-drawer" id="admin-suscripcion-drawer" hidden aria-hidden="true">
        <div class="admin-drawer__head">
          <div>
            <h2 class="admin-drawer__title" id="admin-suscripcion-drawer-title">Nueva suscripción</h2>
            <p class="admin-drawer__subtitle">Administra la inscripción de un usuario a un curso.</p>
          </div>

          <button class="admin-drawer__close" type="button" id="btn-admin-suscripcion-close" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div class="admin-drawer__body">
          <div id="admin-suscripcion-form-host"></div>
        </div>

        <div class="admin-drawer__foot">
          <button class="admin-btn admin-btn--ghost" type="button" id="btn-admin-suscripcion-cancel">
            Cancelar
          </button>

          <button class="admin-btn admin-btn--primary" type="button" id="btn-admin-suscripcion-save">
            Guardar
          </button>
        </div>
      </aside>
    `;
  }

  function editForm(row) {
    return `
      <div class="admin-news-form">
        <div class="admin-field">
          <label>Suscriptor</label>
          <input type="text" value="${esc(row.alumnoNombre || "—")}" disabled>
        </div>

        <div class="admin-field">
          <label>Curso</label>
          <input type="text" value="${esc(mapCursoLabel(row.curso))}" disabled>
        </div>

        <div class="admin-field">
          <label for="sf_estatus">Estatus</label>
          <select id="sf_estatus">
            ${statusOptions(row.estatus)}
          </select>
        </div>

        <div class="admin-field">
          <label for="sf_comentario">Comentario</label>
          <textarea id="sf_comentario">${esc(row.comentario || "")}</textarea>
        </div>
      </div>
    `;
  }

  function createForm() {
    return `
      <div class="admin-news-form">
        <div class="admin-field">
          <label for="sf_curso">Curso</label>
          <select id="sf_curso">
            ${cursosOptions("")}
          </select>
        </div>

        <div class="admin-field">
          <label for="sf_identificador">Buscar usuario por teléfono o correo</label>
          <div class="admin-inline-actions">
            <input id="sf_identificador" type="text" placeholder="correo@dominio.com o 3322...">
            <button class="admin-btn admin-btn--ghost" id="btn-sf-buscar-usuario" type="button">
              Buscar
            </button>
          </div>
        </div>

        <div class="admin-card" id="sf_usuario_panel" hidden>
          <h3 class="hs-card-title">Usuario encontrado</h3>
          <p class="admin-module__subtitle" id="sf_usuario_text">—</p>
        </div>

        <div class="admin-field">
          <label for="sf_comentario">Comentario</label>
          <textarea id="sf_comentario" placeholder="Opcional"></textarea>
        </div>
      </div>
    `;
  }

  function openEditor(row = null) {
    S.current = row;
    S.create = { cursoId: null, usuario: null };

    const drawer = qs("#admin-suscripcion-drawer");
    const overlay = qs("#admin-suscripcion-overlay");
    const title = qs("#admin-suscripcion-drawer-title");
    const host = qs("#admin-suscripcion-form-host");
    const saveBtn = qs("#btn-admin-suscripcion-save");

    if (!drawer || !overlay || !host) return;

    if (title) title.textContent = row ? "Editar suscripción" : "Nueva suscripción";
    host.innerHTML = row ? editForm(row) : createForm();

    if (saveBtn) {
      saveBtn.textContent = row ? "Guardar cambios" : "Inscribir";
      saveBtn.disabled = false;
    }

    overlay.hidden = false;
    drawer.hidden = false;

    requestAnimationFrame(() => {
      overlay.classList.add("is-open");
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
    });

    if (!row) bindCreateSearch();
  }

  function closeEditor() {
    const drawer = qs("#admin-suscripcion-drawer");
    const overlay = qs("#admin-suscripcion-overlay");

    if (!drawer || !overlay) return;

    drawer.classList.remove("is-open");
    overlay.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");

    setTimeout(() => {
      drawer.hidden = true;
      overlay.hidden = true;
      S.current = null;
      S.create = { cursoId: null, usuario: null };
    }, 220);
  }

  async function buscarUsuario(identificador) {
    const res = await postJSON(API.usuarios, {
      telefono: identificador,
      correo: identificador,
    });

    const rows = getRowsFromResponse(res);
    if (rows.length) return rows[0];

    if (res && typeof res === "object" && !Array.isArray(res) && !res.error) {
      return res;
    }

    return null;
  }

  function usuarioIdFromUser(user) {
    return Number(
      user?.id ??
      user?.usuario_id ??
      user?.alumno_id ??
      user?.user_id ??
      0
    );
  }

  function userLabelFromUser(user) {
    return (
      user?.nombre ||
      user?.nombre_completo ||
      user?.correo ||
      user?.email ||
      `Usuario #${usuarioIdFromUser(user)}`
    );
  }

  function bindCreateSearch() {
    const btn = qs("#btn-sf-buscar-usuario");
    const input = qs("#sf_identificador");
    const panel = qs("#sf_usuario_panel");
    const text = qs("#sf_usuario_text");

    btn?.addEventListener("click", async () => {
      const ident = input?.value.trim() || "";
      if (!ident) {
        toast("Ingresa teléfono o correo para buscar.", "warning");
        return;
      }

      try {
        const user = await buscarUsuario(ident);

        if (!user || !usuarioIdFromUser(user)) {
          toast("No se encontró usuario con ese dato.", "warning");
          return;
        }

        S.create.usuario = user;

        if (panel) panel.hidden = false;
        if (text) {
          text.textContent = `${userLabelFromUser(user)} · ${user.correo || user.email || "Sin correo"
            } · ${user.telefono || user.celular || "Sin teléfono"}`;
        }

        toast("Usuario encontrado.", "exito");
      } catch (error) {
        console.error(TAG, error);
        toast("No se pudo buscar el usuario.", "error");
      }
    });
  }

  async function saveSuscripcion() {
    const isEdit = Boolean(S.current?.id);

    try {
      if (isEdit) {
        const body = {
          id: Number(S.current.id),
          estatus: Number(qs("#sf_estatus")?.value || S.current.estatus || 1),
          comentario: (qs("#sf_comentario")?.value || "").trim(),
        };

        await postJSON(API.editar, body);
        toast("Suscripción actualizada correctamente.", "exito");
      } else {
        const cursoId = Number(qs("#sf_curso")?.value || 0);
        const user = S.create.usuario;
        const usuarioId = usuarioIdFromUser(user);

        if (!cursoId) {
          toast("Selecciona un curso.", "error");
          return;
        }

        if (!usuarioId) {
          toast("Busca y selecciona un usuario.", "error");
          return;
        }

        const body = {
          curso: cursoId,
          usuario: usuarioId,
          comentario: (qs("#sf_comentario")?.value || "").trim(),
        };

        const creado_por = getCreatorId();
        if (creado_por) body.creado_por = creado_por;

        await postJSON(API.crear, body);
        toast("Suscripción creada correctamente.", "exito");
      }

      S.loaded = false;
      await loadCursosMap();
      await loadUsuariosMap();
      await loadSuscripciones();
      paintTable();
      closeEditor();
    } catch (error) {
      console.error(TAG, error);
      toast("No se pudo guardar la suscripción.", "error");
    }
  }

  function bindTableEvents() {
    const tbody = qs("#admin-suscripciones-tbody");
    const pagination = qs("#admin-suscripciones-pagination");

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

    qs("#btn-admin-suscripcion-new")?.addEventListener("click", () => openEditor(null));
    qs("#btn-admin-suscripcion-close")?.addEventListener("click", closeEditor);
    qs("#btn-admin-suscripcion-cancel")?.addEventListener("click", closeEditor);
    qs("#admin-suscripcion-overlay")?.addEventListener("click", closeEditor);
    qs("#btn-admin-suscripcion-save")?.addEventListener("click", saveSuscripcion);

    const search = qs("#admin-suscripciones-search");

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

  window.AdminSuscripciones = {
    init,
    render,
    bind,
    reload: async () => {
      await loadCursosMap();
      await loadUsuariosMap();
      await loadSuscripciones();
    },
  };
})(window, document);