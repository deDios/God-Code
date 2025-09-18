(() => {
  "use strict";

  // ==================== Estado del módulo ====================
  const S = {
    data: [],        // lista renderizable
    raw: [],         // crudo de API
    page: 1,
    pageSize: 7,
    search: "",
    tempNewTutorImage: null // buffer imagen en modo CREAR
  };

  // ==================== Helpers mínimos ====================
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.prototype.slice.call(r.querySelectorAll(s));
  const norm = s => String(s || "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
  const escapeHTML = s => String(s == null ? "" : s).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" }[c]));
  const escapeAttr = s => String(s == null ? "" : s).replace(/"/g, "&quot;");
  const fmtDateTime = dt => { if (!dt) return "-"; try { const sp = String(dt).split(" "); const d = sp[0] || ""; const p = d.split("-"); return `${(p[2] || "")}/${(p[1] || "")}/${(p[0] || "")} ${sp[1] || ""}`.trim(); } catch { return dt; } };

  // Fallbacks para utilidades globales (no rompen si ya existen)
  const APIx = (function getAPI() {
    // Si tienes window.API definido, úsalo. Si no, armas rutas locales.
    const A = (typeof window !== "undefined" && window.API) ? window.API : {};
    return {
      cTutores: A.tutores || "/db/web/c_tutor.php",
      iTutores: A.iTutores || "/db/web/i_tutor.php",
      uTutores: A.uTutores || "/db/web/u_tutor.php",
      uTutorImg: (A.API_UPLOAD && A.API_UPLOAD.tutorImg) || "/db/web/u_tutorImg.php"
    };
  })();

  const postJSON = (window.postJSON) || (async (url, body) => {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  });
  const gcToast = (window.gcToast) || ((m) => alert(m));
  const statusBadge = (window.statusBadge) || ((/*tipo, s*/) => `<span class="gc-chip gray">—</span>`);
  const statusSelect = (window.statusSelect) || ((id, val) => `<select id="${id}"><option value="1"${Number(val) === 1 ? ' selected' : ''}>Activo</option><option value="0"${Number(val) === 0 ? ' selected' : ''}>Inactivo</option><option value="2"${Number(val) === 2 ? ' selected' : ''}>Pausado</option></select>`);
  const withBust = (window.withBust) || (u => u);
  const noImageSvg = (window.noImageSvg) || (function () { return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' fill='%23eee'/><text x='50%' y='54%' text-anchor='middle' font-size='10' fill='%23888'>sin imagen</text></svg>`; });
  const mediaUrlsByType = (window.mediaUrlsByType) || (/*type,id*/() => []);
  const mountReadOnlyMedia = (window.mountReadOnlyMedia) || (() => { });
  const disableDrawerInputs = (window.disableDrawerInputs) || (() => { });
  const bindCopyFromPre = (window.bindCopyFromPre) || (() => { });
  const renderPagination = (window.renderPagination) || (() => { });
  const setSearchPlaceholder = (window.setSearchPlaceholder) || (() => { });
  const showSkeletons = (window.showSkeletons) || (() => { });
  const fetchAllCursosAnyStatus = (window.fetchAllCursosAnyStatus) || (async () => []);
  const renderCursoDrawer = (window.renderCursoDrawer) || (() => "<p>Drawer Curso no disponible</p>");
  const isAdminUser = (typeof window !== "undefined" ? window.isAdminUser : true);
  const state = (typeof window !== "undefined" && window.state) ? window.state : { currentDrawer: null, usuario: { id: 1 } };

  // Preview helpers mínimos
  const validarImagen = (file, { maxMB = 2 } = {}) => {
    if (!file) return { ok: false, error: "Archivo inválido" };
    const okType = /image\/(png|jpeg)/i.test(file.type);
    if (!okType) return { ok: false, error: "Formato inválido. Usa JPG/PNG" };
    const mb = file.size / (1024 * 1024);
    if (mb > maxMB) return { ok: false, error: `Imagen supera ${maxMB}MB` };
    return { ok: true };
  };
  const renderPreviewUI = (container, file, onAccept, onCancel) => {
    const tmpUrl = URL.createObjectURL(file);
    const html = `
      <div class="media-card">
        <figure class="media-thumb">
          <img alt="Preview" src="${tmpUrl}">
        </figure>
        <div class="media-meta">
          <div class="media-label">Preview</div>
          <div class="media-help" style="color:#666;">JPG/PNG · listo para subir</div>
        </div>
        <div style="display:flex; gap:.5rem; margin-top:.5rem;">
          <button class="gc-btn gc-btn--primary" id="pre-accept">Usar</button>
          <button class="gc-btn gc-btn--ghost" id="pre-cancel">Cancelar</button>
        </div>
      </div>`;
    container.innerHTML = html;
    qs("#pre-accept", container)?.addEventListener("click", () => onAccept && onAccept());
    qs("#pre-cancel", container)?.addEventListener("click", () => { onCancel && onCancel(); container.innerHTML = ""; });
  };

  // ==================== Drawer: control específico tutores ====================
  function openTutorDrawer(title, html) {
    const aside = document.getElementById("drawer-tutor");
    const overlay = document.getElementById("gc-dash-overlay");
    const t = document.getElementById("drawer-tutor-title");
    const b = document.getElementById("drawer-tutor-body");
    if (t) t.textContent = title || "Tutor · —";
    if (b) b.innerHTML = html || "";
    if (aside) aside.hidden = false;
    if (overlay) overlay.hidden = false;

    const closeBtn = document.getElementById("drawer-tutor-close");
    if (closeBtn && !closeBtn._bound) {
      closeBtn._bound = true;
      closeBtn.addEventListener("click", closeTutorDrawer);
    }
  }
  function closeTutorDrawer() {
    const aside = document.getElementById("drawer-tutor");
    const overlay = document.getElementById("gc-dash-overlay");
    if (aside) aside.hidden = true;
    if (overlay) overlay.hidden = true;
  }

  // ==================== Montaje público (router) ====================
  async function mount() {
    const hdr = qs(".recursos-box.desktop-only .table-header");
    if (hdr) {
      const c1 = hdr.querySelector(".col-nombre");
      const c2 = hdr.querySelector(".col-fecha") || hdr.querySelector(".col-tipo");
      const c3 = hdr.querySelector(".col-status");
      if (c1) c1.textContent = "Nombre";
      if (c2) { c2.textContent = "Fecha de creación"; c2.classList.add("col-fecha"); }
      if (c3) c3.textContent = "Status";
    }
    qs("#mod-title") && (qs("#mod-title").textContent = "Tutores");
    qs(".tt-title") && (qs(".tt-title").textContent = "Tutores:");
    const st = qs("#tt-status"); if (st) { st.textContent = "Todos los estatus"; st.classList.remove("badge-inactivo"); st.classList.add("badge-activo"); }
    setSearchPlaceholder("Buscar por nombre o bio");
    showSkeletons();

    const s = qs("#search-input");
    if (s) {
      s.oninput = () => { S.search = s.value || ""; draw(); };
    }

    await load();
  }

  async function openCreate() {
    S.tempNewTutorImage = null;
    state.currentDrawer = { type: "tutor", id: null, mode: "create" };
    openTutorDrawer("Tutor · Crear", renderDrawer({ id: "" }));
  }

  // ==================== Carga & render listado ====================
  async function load() {
    try {
      const [activos, inactivos, pausados] = await Promise.all([
        postJSON(APIx.cTutores, { estatus: 1 }),
        postJSON(APIx.cTutores, { estatus: 0 }),
        postJSON(APIx.cTutores, { estatus: 2 })
      ]);
      const raw = [].concat(activos || [], inactivos || [], pausados || []);
      S.raw = raw;
      S.data = raw.map(t => ({
        id: Number(t.id),
        nombre: t.nombre,
        descripcion: t.descripcion || "",
        estatus: Number(t.estatus),
        fecha_creacion: t.fecha_creacion,
        _all: t
      }));
      draw();
    } catch (err) {
      gcToast("No se pudieron cargar tutores", "error");
      const list = qs("#recursos-list"); if (list) list.innerHTML = '<div style="padding:1rem;color:#b00020;">Error al cargar tutores</div>';
      const m = qs("#recursos-list-mobile"); if (m) m.innerHTML = "";
    }
  }

  function draw() {
    const listD = qs("#recursos-list");
    const listM = qs("#recursos-list-mobile");
    if (listD) listD.innerHTML = "";
    if (listM) listM.innerHTML = "";

    const match = it => {
      if (!S.search) return true;
      const k = norm(S.search);
      return norm(it.nombre).includes(k) || norm(it.descripcion).includes(k) || String(it.id).includes(k);
    };

    const filtered = S.search ? S.data.filter(match) : S.data;
    const start = (S.page - 1) * S.pageSize;
    const pageRows = filtered.slice(start, start + S.pageSize);

    if (!filtered.length) {
      const empty = '<div class="empty-state" style="padding:1rem;">Sin resultados</div>';
      if (listD) listD.innerHTML = empty;
      if (listM) listM.innerHTML = empty;
      renderPagination(0);
      const c = qs("#mod-count"); if (c) c.textContent = "0 resultados";
      return;
    }

    // Desktop
    pageRows.forEach(it => {
      listD?.insertAdjacentHTML("beforeend", `
        <div class="table-row" data-id="${it.id}" data-type="tutor">
          <div class="col-nombre"><span class="name-text">${escapeHTML(it.nombre)}</span></div>
          <div class="col-fecha">${escapeHTML(fmtDateTime(it.fecha_creacion))}</div>
          <div class="col-status">${statusBadge("tutores", it.estatus)}</div>
        </div>
      `);
    });

    // Mobile
    pageRows.forEach(it => {
      listM?.insertAdjacentHTML("beforeend", `
        <div class="table-row-mobile" data-id="${it.id}" data-type="tutor">
          <button class="row-toggle">
            <div class="col-nombre">${escapeHTML(it.nombre)}</div>
            <span class="icon-chevron">›</span>
          </button>
          <div class="row-details">
            <div><strong>Creado:</strong> ${escapeHTML(fmtDateTime(it.fecha_creacion))}</div>
            <div><strong>Status:</strong> ${statusBadge("tutores", it.estatus)}</div>
            <div style="display:flex;gap:8px;margin:.25rem 0 .5rem;">
              <button class="gc-btn gc-btn--ghost open-drawer">Ver detalle</button>
              ${Number(it.estatus) === 0 ? `<button class="gc-btn gc-btn--success gc-reactivate" data-type="tutor" data-id="${it.id}">Reactivar</button>` : ""}
            </div>
          </div>
        </div>
      `);
    });

    // Contador
    const countEl = qs("#mod-count");
    if (countEl) countEl.textContent = filtered.length + " " + (filtered.length === 1 ? "elemento" : "elementos");

    // Binds: abrir drawer
    qsa("#recursos-list .table-row").forEach(el => {
      el.addEventListener("click", () => {
        const data = el.dataset || {};
        state.currentDrawer = { type: data.type, id: Number(data.id), mode: "view" };
        openTutorDrawer("Tutor · —", renderDrawer({ id: data.id }));
      });
    });
    qsa("#recursos-list-mobile .open-drawer").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const host = btn.closest(".table-row-mobile");
        const data = (host && host.dataset) || {};
        state.currentDrawer = { type: data.type, id: Number(data.id), mode: "view" };
        openTutorDrawer("Tutor · —", renderDrawer({ id: data.id }));
      });
    });

    // Reactivar desde móvil
    qsa(".gc-reactivate").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = Number(btn.getAttribute("data-id"));
        try {
          await reactivate(id);
          gcToast("Tutor reactivado", "exito");
          await load();
        } catch {
          gcToast("No se pudo reactivar", "error");
        }
      });
    });

    renderPagination(filtered.length);
  }

  // ==================== Drawer (view/edit/create) ====================
  function renderDrawer(dataset) {
    const item = S.data.find(x => String(x.id) === String(dataset.id));
    const mode = (state.currentDrawer && state.currentDrawer.mode) || (item ? "view" : "create");
    const isCreate = mode === "create" || !item;
    const isEdit = mode === "edit";
    const isView = mode === "view" && !!item;
    const t = isCreate ? getEmptyTutor() : (item ? item._all : null);
    if (!t) return "<p>No encontrado.</p>";

    const inText = (id, v, ph) => `<input id="${id}" type="text" value="${escapeAttr(v || "")}" placeholder="${escapeAttr(ph || "")}" maxlength="120" data-max="120" />`;
    const inTA = (id, v, rows) => `<textarea id="${id}" rows="${rows || 8}" maxlength="800" data-max="800">${escapeHTML(v || "")}</textarea>`;

    let headActions = "";
    if (isCreate) {
      headActions = `
        <div class="gc-actions">
          <button class="gc-btn gc-btn--ghost" id="btn-cancel-tutor">Cancelar</button>
          <button class="gc-btn gc-btn--success" id="btn-save-tutor">Guardar</button>
        </div>`;
    } else if (isAdminUser) {
      const isInactive = Number(t.estatus) === 0;
      headActions = `
        <div class="gc-actions">
          ${isView ? '<button class="gc-btn" id="btn-edit-tutor">Editar</button>' : ''}
          ${isEdit ? '<button class="gc-btn gc-btn--ghost" id="btn-cancel-tutor">Cancelar</button>' : ''}
          ${isEdit ? '<button class="gc-btn gc-btn--success" id="btn-save-tutor">Guardar</button>' : ''}
          ${isInactive ? '<button class="gc-btn gc-btn--success" id="btn-reactivar-tutor">Reactivar</button>' : '<button class="gc-btn gc-btn--danger" id="btn-delete-tutor" data-step="1">Eliminar</button>'}
        </div>`;
    }

    const viewHTML = `
      ${headActions}
      <section id="tutor-view" class="mode-view"${isView ? "" : " hidden"}>
        <div class="field">
          <div class="label">Nombre <span class="req">*</span></div>
          <div class="value" id="tv_nombre">${escapeHTML(t.nombre)}</div>
        </div>
        <div class="field">
          <div class="label">Descripción <span class="req">*</span></div>
          <div class="value" id="tv_descripcion">${escapeHTML(t.descripcion)}</div>
        </div>
        <div class="grid-3">
          <div class="field"><div class="label">Estatus</div><div class="value" id="tv_estatus">${statusBadge("tutores", t.estatus)}</div></div>
          <div class="field"><div class="label">ID</div><div class="value" id="tv_id">${escapeHTML(t.id)}</div></div>
          <div class="field"><div class="label">Fecha creación</div><div class="value" id="tv_fecha_creacion">${escapeHTML(fmtDateTime(t.fecha_creacion))}</div></div>
        </div>
        <div class="field">
          <div class="label">Imagen</div>
          <div class="value">
            <div id="media-tutor" data-id="${t.id || (item ? item.id : "")}"></div>
            <div class="hint" style="color:#666;margin-top:.35rem;">Foto del tutor si existe.</div>
          </div>
        </div>
        <div class="field">
          <div class="label">Cursos ligados</div>
          <div class="value">
            <div class="tutor-cursos" id="tutor-cursos"></div>
            <div class="hint gc-soft" style="margin-top:.35rem;">Toca una imagen para abrir el curso en modo solo lectura.</div>
          </div>
        </div>
        <details class="dev-json" id="tutor-json-box" open style="margin-top:16px;">
          <summary style="cursor:pointer;font-weight:600;">JSON · Tutor</summary>
          <div style="display:flex;gap:.5rem;margin:.5rem 0;"><button class="gc-btn" id="btn-copy-json-tutor">Copiar JSON</button></div>
          <pre id="json-tutor" class="value" style="white-space:pre-wrap;max-height:260px;overflow:auto;">${escapeHTML(JSON.stringify(t, null, 2))}</pre>
        </details>
      </section>
    `;

    const createImgBlock = `
      <div class="field">
        <label>Imagen</label>
        <div class="value">
          <div id="create-media-tutor" class="media-grid">
            <div class="media-card">
              <figure class="media-thumb">
                <img id="create-media-thumb" alt="Foto" src="${withBust("/ASSETS/tutor/tutor_0.png")}" />
                <button class="icon-btn media-edit" id="create-media-edit" title="Seleccionar imagen">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.0 1.0 0 0 0 0-1.41l-2.34-2.34a1.0 1.0 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"></path></svg>
                </button>
              </figure>
              <div class="media-meta"><div class="media-label">Foto</div><div class="media-help" style="color:#666;">JPG/PNG · Máx 2MB</div></div>
            </div>
          </div>
        </div>
      </div>`;

    const editImgBlock = `
      <div class="field">
        <label>Imagen</label>
        <div class="value">
          <div id="media-tutor-edit" data-id="${t.id || (item ? item.id : "")}"></div>
          <div class="hint gc-soft">Formatos: JPG/PNG · Máx 2MB.</div>
        </div>
      </div>`;

    const editHTML = `
      <section id="tutor-edit" class="mode-edit"${(isCreate || isEdit) ? "" : " hidden"}>
        <div class="field">
          <label for="tf_nombre">Nombre <span class="req">*</span></label>
          ${inText("tf_nombre", t.nombre, "Nombre del tutor")}
          <small class="char-counter" data-for="tf_nombre"></small>
        </div>
        <div class="field">
          <label for="tf_descripcion">Descripción <span class="req">*</span></label>
          ${inTA("tf_descripcion", t.descripcion, 8)}
          <small class="char-counter" data-for="tf_descripcion"></small>
        </div>
        <div class="field">
          <label for="tf_estatus">Estatus</label>
          ${statusSelect("tf_estatus", t.estatus, "tutores")}
        </div>
        ${(isCreate ? createImgBlock : editImgBlock)}
        <div class="field">
          <label>Cursos ligados</label>
          <div class="value"><div class="tutor-cursos" id="tutor-cursos-edit"></div></div>
        </div>
        <div class="drawer-actions-row">
          <div class="row-right">
            <button class="gc-btn gc-btn--ghost" id="btn-cancel-tutor">Cancelar</button>
            <button class="gc-btn gc-btn--success" id="btn-save-tutor">Guardar</button>
          </div>
        </div>
      </section>
    `;

    // Pinta y configura
    setTimeout(() => {
      // título contextual
      const titleEl = qs("#drawer-tutor-title");
      if (isCreate) { titleEl && (titleEl.textContent = "Tutor · Crear"); state.currentDrawer = { type: "tutor", id: null, mode: "create" }; }
      else if (isEdit) { titleEl && (titleEl.textContent = `Tutor · ${item ? item.nombre : ""} (edición)`); state.currentDrawer = { type: "tutor", id: item?.id || null, mode: "edit" }; }
      else { titleEl && (titleEl.textContent = `Tutor · ${item ? item.nombre : ""}`); state.currentDrawer = { type: "tutor", id: item?.id || null, mode: "view" }; }

      // Habilitar/Deshabilitar inputs
      disableDrawerInputs(!(isEdit || isCreate));

      // Botones principales
      qs("#btn-edit-tutor")?.addEventListener("click", (e) => {
        e.stopPropagation();
        state.currentDrawer = { type: "tutor", id: item?.id || null, mode: "edit" };
        qs("#drawer-tutor-body").innerHTML = renderDrawer({ id: String(item?.id || "") });
      });
      qs("#btn-cancel-tutor")?.addEventListener("click", (e) => {
        e.stopPropagation();
        if (isCreate) { S.tempNewTutorImage = null; closeTutorDrawer(); }
        else { state.currentDrawer = { type: "tutor", id: item?.id || null, mode: "view" }; qs("#drawer-tutor-body").innerHTML = renderDrawer({ id: String(item?.id || "") }); }
      });
      qs("#btn-save-tutor")?.addEventListener("click", async (e) => {
        e.stopPropagation();
        try { if (isCreate) await saveNew(); else await saveUpdate(item); }
        catch { gcToast("Error al guardar", "error"); }
      });

      // Eliminar / Reactivar
      const bDel = qs("#btn-delete-tutor");
      if (bDel) bDel.addEventListener("click", async (e) => {
        e.stopPropagation();
        const step = bDel.getAttribute("data-step") || "1";
        if (step === "1") {
          bDel.textContent = "Confirmar";
          bDel.setAttribute("data-step", "2");
          setTimeout(() => {
            if (bDel.getAttribute("data-step") === "2") { bDel.textContent = "Eliminar"; bDel.setAttribute("data-step", "1"); }
          }, 4000);
          return;
        }
        try {
          await softDelete(item);
          gcToast("Tutor eliminado (inactivo)", "exito");
          closeTutorDrawer();
          await load();
        } catch { gcToast("No se pudo eliminar", "error"); }
      });

      qs("#btn-reactivar-tutor")?.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          await reactivate(Number(item && item.id));
          gcToast("Tutor reactivado", "exito");
          await load();
          const re = S.data.find(x => x.id === (item && item.id));
          if (re) openTutorDrawer("Tutor · " + re.nombre, renderDrawer({ id: String(re.id) }));
        } catch { gcToast("No se pudo reactivar", "error"); }
      });

      // Media: crear → selector con preview y buffer
      if (isCreate) {
        const card = qs("#create-media-tutor"), btn = qs("#create-media-edit"), thumb = qs("#create-media-thumb");
        if (btn && thumb && card) {
          btn.addEventListener("click", () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/png, image/jpeg";
            input.style.display = "none";
            document.body.appendChild(input);
            input.addEventListener("change", () => {
              const file = input.files && input.files[0];
              try { document.body.removeChild(input) } catch { }
              if (!file) return;
              const v = validarImagen(file, { maxMB: 2 });
              if (!v.ok) return gcToast(v.error, "error");
              renderPreviewUI(card, file, async () => {
                S.tempNewTutorImage = file;
                try { if (thumb.dataset?.blobUrl) URL.revokeObjectURL(thumb.dataset.blobUrl) } catch { }
                const blobUrl = URL.createObjectURL(file);
                if (thumb.dataset) thumb.dataset.blobUrl = blobUrl;
                thumb.src = blobUrl;
                gcToast("Imagen seleccionada (se subirá al guardar)", "exito");
              }, () => { });
            });
            input.click();
          });
        }
      } else {
        // Media: edición / vista read-only (editable en modo edición si tu helper lo permite)
        const cont = qs("#media-tutor-edit") || qs("#media-tutor");
        const tid = Number(t.id || item?.id || 0);
        if (cont && tid) {
          mountReadOnlyMedia({
            container: cont,
            type: "tutor",
            id: tid,
            labels: ["Foto"],
            editable: Boolean(isEdit && isAdminUser) // si tu helper soporta edición inline
          });
        }
      }

      // JSON copy
      bindCopyFromPre("#json-tutor", "#btn-copy-json-tutor");

      // Chips de cursos
      const tgt = isEdit || isCreate ? "#tutor-cursos-edit" : "#tutor-cursos";
      renderTutorCursosChips(Number(t.id || item?.id || 0), tgt);
    }, 0);

    // Devuelvo la composición (view + edit) para inyectar en #drawer-tutor-body
    return viewHTML + editHTML;
  }

  function getEmptyTutor() {
    return {
      nombre: "",
      descripcion: "",
      estatus: 1,
      creado_por: Number((window.usuario && window.usuario.id) || (state?.usuario?.id) || 1) || 1
    };
  }

  function readForm(existingId) {
    const read = id => qs("#" + id)?.value || "";
    const readN = id => Number(read(id) || 0);
    const payload = {
      nombre: read("tf_nombre"),
      descripcion: read("tf_descripcion"),
      estatus: readN("tf_estatus") || 1
    };
    if (existingId != null) payload.id = Number(existingId);
    else payload.creado_por = Number((window.usuario && window.usuario.id) || (state?.usuario?.id) || 1) || 1;
    return payload;
  }

  function validateRequired(payload) {
    const errs = [];
    if (!String(payload.nombre || "").trim()) errs.push("Nombre");
    if (!String(payload.descripcion || "").trim()) errs.push("Descripción");
    return errs;
  }

  // ==================== Acciones CRUD ====================
  async function softDelete(item) {
    if (!item || !item._all) throw new Error("Item inválido");
    const body = { ...item._all, estatus: 0 };
    await postJSON(APIx.uTutores, body);
  }

  async function reactivate(id) {
    const it = S.data.find(x => x.id === Number(id));
    if (!it || !it._all) throw new Error("Tutor no encontrado");
    const body = { ...it._all, estatus: 1 };
    await postJSON(APIx.uTutores, body);
  }

  async function uploadTutorImagen(tutorId, file) {
    const fd = new FormData();
    fd.append("tutor_id", String(tutorId));
    fd.append("imagen", file);
    const res = await fetch(APIx.uTutorImg, { method: "POST", body: fd });
    const text = await res.text().catch(() => "");
    if (!res.ok) throw new Error("HTTP " + res.status + " " + (text || ""));
    try { return JSON.parse(text); } catch { return { _raw: text }; }
  }

  async function saveNew() {
    const payload = readForm(null);
    const missing = validateRequired(payload);
    if (missing.length) return gcToast("Campos requeridos: " + missing.join(", "), "warning");

    const res = await postJSON(APIx.iTutores, payload);
    const newId = Number((res && (res.id || res.tutor_id || res.insert_id || (res.data && res.data.id))) || 0);
    const file = S.tempNewTutorImage || null;

    if (newId && file) {
      try { await uploadTutorImagen(newId, file); gcToast("Imagen subida", "exito"); }
      catch { gcToast("Tutor creado, pero falló la imagen", "error"); }
      finally { S.tempNewTutorImage = null; }
    }

    gcToast("Tutor creado", "exito");
    closeTutorDrawer();
    await load();
    if (newId) {
      const re = S.data.find(x => x.id === newId);
      if (re) openTutorDrawer("Tutor · " + re.nombre, renderDrawer({ id: String(re.id) }));
    }
  }

  async function saveUpdate(item) {
    if (!item || !item._all) return gcToast("Sin item para actualizar", "error");
    const payload = readForm(item.id);
    const missing = validateRequired(payload);
    if (missing.length) return gcToast("Campos requeridos: " + missing.join(", "), "warning");

    await postJSON(APIx.uTutores, payload);
    gcToast("Cambios guardados", "exito");
    await load();
    const re = S.data.find(x => x.id === item.id);
    if (re) openTutorDrawer("Tutor · " + re.nombre, renderDrawer({ id: String(re.id) }));
  }

  // ==================== Chips de cursos ligados ====================
  async function renderTutorCursosChips(tutorId, containerSel = "#tutor-cursos") {
    const host = qs(containerSel);
    if (!host) return;
    try {
      const all = await fetchAllCursosAnyStatus();
      const list = (all || []).filter(c => Number(c.tutor) === Number(tutorId));

      if (!list.length) {
        host.innerHTML = '<span class="chip-empty">Sin cursos ligados</span>';
        return;
      }

      // Orden: Activo (1) → En curso (4) → Pausado (2) → Terminado (3) → Inactivo/Cancelado (0/5)
      const orderKey = v => ({ 1: 1, 4: 2, 2: 3, 3: 4, 0: 5, 5: 5 })[Number(v)] || 9;
      list.sort((a, b) => orderKey(a.estatus) - orderKey(b.estatus) || String(a.nombre).localeCompare(String(b.nombre)));

      const statusClass = v => {
        const n = Number(v);
        if (n === 1) return "s-1";
        if (n === 2) return "s-2";
        if (n === 3) return "s-3";
        if (n === 4) return "s-4"; // si quieres azul, define CSS .s-4; si no, cámbialo a "s-3"
        return "s-0"; // 0 ó 5
      };

      const html = list.map(curso => {
        const img = (mediaUrlsByType && mediaUrlsByType("curso", curso.id)[0]) || "/ASSETS/cursos/img0.png";
        const stCls = statusClass(curso.estatus);
        const miniTitle = (curso.nombre || "").slice(0, 18);
        const titleAttr = (curso.nombre || "").replace(/"/g, "&quot;");
        return `
          <button class="curso-chip ${stCls}" data-id="${curso.id}" aria-label="Abrir curso: ${titleAttr}" title="${titleAttr}">
            <img src="${withBust(img)}" alt="Curso ${titleAttr}" loading="lazy"
                 onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,${encodeURIComponent(noImageSvg())}'">
            <span>${miniTitle}</span>
          </button>`;
      }).join("");

      host.innerHTML = html;

      host.querySelectorAll(".curso-chip").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const cid = Number(btn.getAttribute("data-id"));
          state.currentDrawer = { type: "curso", id: cid, mode: "view" };
          // NOTA: usa el drawer global de cursos (fuente: tu módulo de cursos)
          if (typeof window.openDrawer === "function") {
            window.openDrawer("Curso · —", renderCursoDrawer({ id: String(cid) })); // si ya tienes openDrawer global
          } else {
            // en caso estés aislando drawers, opcionalmente podrías tener openCursoDrawer
            const body = document.getElementById("drawer-body") || document.getElementById("drawer-curso-body");
            const title = document.getElementById("drawer-title") || document.getElementById("drawer-curso-title");
            if (title) title.textContent = "Curso · —";
            if (body) body.innerHTML = renderCursoDrawer({ id: String(cid) });
            // muestra aside de curso si usas uno separado
          }
        });
      });
    } catch {
      host.innerHTML = '<span class="chip-empty">No fue posible cargar los cursos</span>';
    }
  }

  // ==================== API pública para el router ====================
  window.tutores = { mount, openCreate };
})();
