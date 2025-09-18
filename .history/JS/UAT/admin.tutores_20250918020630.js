(() => {
  "use strict";

  // ====== Estado local del módulo ======
  const S = {
    data: [],
    raw: [],
    page: 1,
    pageSize: 7,
    search: "",
    tempNewTutorImage: null, // buffer para 'crear' antes de tener id
  };

  // ====== Utils mínimos (reutiliza globales si existen) ======
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.prototype.slice.call(r.querySelectorAll(s));
  const norm = s => String(s || "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
  const escapeHTML = s => String(s == null ? "" : s).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" }[c]));
  const escapeAttr = s => String(s == null ? "" : s).replace(/"/g, "&quot;");
  const fmtDateTime = dt => { if (!dt) return "-"; try { const sp = String(dt).split(" "); const d = sp[0] || ""; const p = d.split("-"); return `${(p[2]||"")}/${(p[1]||"")}/${(p[0]||"")} ${sp[1]||""}`.trim(); } catch { return dt } };

  // `gcToast`, `postJSON`, `API`, `API_UPLOAD`, `openDrawer`, `closeDrawer`, `disableDrawerInputs`,
  // `jsonSection`, `bindCopyFromPre`, `statusSelect`, `statusBadge`, `withBust`, `mediaUrlsByType`,
  // `mountReadOnlyMedia`, `state`, `isAdminUser`, `fetchAllCursosAnyStatus`, `renderCursoDrawer`
  // son globales provistos por tu admin (reutilizados tal cual). 

  // ====== Montaje público (router) ======
  async function mount() {
    // Título y cabecera (el router también las ajusta)
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
    setSearchPlaceholder && setSearchPlaceholder("Buscar por nombre o bio"); // si existe global
    showSkeletons && showSkeletons(); // si existe global

    // Búsqueda live
    const s = qs("#search-input");
    if (s) {
      s.oninput = () => {
        S.search = s.value || "";
        draw();
      };
    }

    await load();
  }

  async function openCreate() {
    S.tempNewTutorImage = null;
    state.currentDrawer = { type: "tutor", id: null, mode: "create" };
    openDrawer("Tutor · Crear", renderDrawer({ id: "" }));
  }

  // ====== Carga & render lista ======
  async function load() {
    try {
      const [e1, e0, e2] = await Promise.all([
        postJSON(API.tutores, { estatus: 1 }),
        postJSON(API.tutores, { estatus: 0 }),
        postJSON(API.tutores, { estatus: 2 }),
      ]);
      const raw = [].concat(e1 || [], e0 || [], e2 || []);
      S.raw = raw;
      S.data = raw.map(t => ({
        id: t.id,
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
      renderPagination && renderPagination(0);
      const c = qs("#mod-count"); if (c) c.textContent = "0 resultados";
      return;
    }

    // Desktop rows
    pageRows.forEach(it => {
      if (listD) {
        listD.insertAdjacentHTML("beforeend", `
          <div class="table-row" data-id="${it.id}" data-type="tutor">
            <div class="col-nombre"><span class="name-text">${escapeHTML(it.nombre)}</span></div>
            <div class="col-fecha">${escapeHTML(fmtDateTime(it.fecha_creacion))}</div>
            <div class="col-status">${statusBadge("tutores", it.estatus)}</div>
          </div>
        `);
      }
      if (listM) {
        listM.insertAdjacentHTML("beforeend", `
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
      }
    });

    // Contador
    const countEl = qs("#mod-count");
    if (countEl) countEl.textContent = filtered.length + " " + (filtered.length === 1 ? "elemento" : "elementos");

    // Binds apertura drawer
    qsa("#recursos-list .table-row").forEach(el => {
      el.addEventListener("click", () => {
        const data = el.dataset || {};
        state.currentDrawer = { type: data.type, id: Number(data.id), mode: "view" };
        openDrawer("Tutor · —", renderDrawer({ id: data.id }));
      });
    });
    qsa("#recursos-list-mobile .open-drawer").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const host = btn.closest(".table-row-mobile");
        const data = (host && host.dataset) || {};
        state.currentDrawer = { type: data.type, id: Number(data.id), mode: "view" };
        openDrawer("Tutor · —", renderDrawer({ id: data.id }));
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

    // Paginación
    renderPagination && renderPagination(filtered.length);
  }

  // ====== Drawer ======
  function renderDrawer(dataset) {
    const item = S.data.find(x => String(x.id) === String(dataset.id));
    const mode = (state.currentDrawer && state.currentDrawer.mode) || (item ? "view" : "create");
    const isCreate = mode === "create" || !item;
    const isEdit = mode === "edit";
    const isView = mode === "view" && !!item;

    const t = isCreate ? getEmptyTutor() : (item ? item._all : null);
    if (!t) return "<p>No encontrado.</p>";

    const inText = (id, v, ph) => `<input id="${id}" type="text" value="${escapeAttr(v || "")}" placeholder="${escapeAttr(ph || "")}" />`;
    const inTA   = (id, v, rows) => `<textarea id="${id}" rows="${rows || 5}">${escapeHTML(v || "")}</textarea>`;
    const inSel  = (id, html) => `<select id="${id}">${html}</select>`;

    const field = (label, value, inputHTML, req) => `
      <div class="field">
        <div class="label">${escapeHTML(label)} ${req ? '<span class="req">*</span>' : ''}</div>
        <div class="value">${(isEdit || isCreate) ? inputHTML : escapeHTML(value != null ? value : "-")}</div>
      </div>`;

    let controls = "";
    if (isCreate) {
      controls = `<div class="gc-actions">
        <button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button>
        <button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button>
      </div>`;
    } else if (isAdminUser) {
      const isInactive = Number(t.estatus) === 0;
      controls = `<div class="gc-actions">
        ${isView ? '<button class="gc-btn" id="btn-edit">Editar</button>' : ''}
        ${isEdit ? '<button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button>' : ''}
        ${isEdit ? '<button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button>' : ''}
        ${isInactive ? '<button class="gc-btn gc-btn--success" id="btn-reactivar">Reactivar</button>' : '<button class="gc-btn gc-btn--danger" id="btn-delete" data-step="1">Eliminar</button>'}
      </div>`;
    }

    let html = "";
    html += controls;
    html += field("Nombre", t.nombre, inText("f_nombre", t.nombre, "Nombre del tutor"), true);
    html += field("Descripción", t.descripcion, inTA("f_descripcion", t.descripcion, 8), true);
    html += `<div class="field"><div class="label">Estatus</div><div class="value">${(isEdit || isCreate) ? statusSelect("f_estatus", t.estatus, "tutores") : statusBadge("tutores", t.estatus)}</div></div>`;

    // Imagen
    if (isCreate) {
      html += `
      <div class="field">
        <div class="label">Foto</div>
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
    } else {
      html += `
      <div class="field">
        <div class="label">Imagen</div>
        <div class="value">
          <div id="media-tutor" data-id="${t.id || (item ? item.id : "")}"></div>
          <div class="hint" style="color:#666;margin-top:.35rem;">Puedes actualizar la foto en modo edición.</div>
        </div>
      </div>`;
    }

    // Cursos ligados (chips)
    html += `
      <div class="field">
        <div class="label">Cursos ligados</div>
        <div class="value">
          <div class="tutor-cursos" id="tutor-cursos"></div>
        </div>
      </div>
    `;

    if (isAdminUser) {
      html += jsonSection(t, "JSON · Tutor", "json-tutor", "btn-copy-json-tutor");
    }

    // Título del drawer + estado interno
    if (isCreate) {
      qs("#drawer-title").textContent = "Tutor · Crear";
      state.currentDrawer = { type: "tutor", id: null, mode: "create" };
    } else if (isEdit) {
      qs("#drawer-title").textContent = `Tutor · ${item ? item.nombre : ""} (edición)`;
      state.currentDrawer = { type: "tutor", id: item ? item.id : null, mode: "edit" };
    } else {
      qs("#drawer-title").textContent = `Tutor · ${item ? item.nombre : ""}`;
      state.currentDrawer = { type: "tutor", id: item ? item.id : null, mode: "view" };
    }

    // Post-mount binds
    setTimeout(() => {
      try {
        disableDrawerInputs && disableDrawerInputs(!(isEdit || isCreate));

        // Crear: selector de imagen con preview
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
                try { document.body.removeChild(input) } catch {}
                if (!file) return;
                const v = validarImagen(file, { maxMB: 2 });
                if (!v.ok) return gcToast(v.error, "error");
                renderPreviewUI(card, file, async () => {
                  S.tempNewTutorImage = file;
                  try { if (thumb.dataset?.blobUrl) URL.revokeObjectURL(thumb.dataset.blobUrl) } catch {}
                  const blobUrl = URL.createObjectURL(file);
                  if (thumb.dataset) thumb.dataset.blobUrl = blobUrl;
                  thumb.src = blobUrl;
                  gcToast("Imagen seleccionada (se subirá al guardar)", "exito");
                }, () => {});
              });
              input.click();
            });
          }
        }

        // Guardar / Editar / Cancelar
        qs("#btn-save")?.addEventListener("click", async (e) => {
          e.stopPropagation();
          try { if (isCreate) await saveNew(); else await saveUpdate(item); }
          catch { gcToast("Error al guardar", "error"); }
        });
        qs("#btn-edit")?.addEventListener("click", (e) => {
          e.stopPropagation();
          state.currentDrawer = { type: "tutor", id: item ? item.id : null, mode: "edit" };
          qs("#drawer-body").innerHTML = renderDrawer({ id: String(item ? item.id : "") });
        });
        qs("#btn-cancel")?.addEventListener("click", (e) => {
          e.stopPropagation();
          if (isCreate) { S.tempNewTutorImage = null; closeDrawer(); }
          else {
            state.currentDrawer = { type: "tutor", id: item ? item.id : null, mode: "view" };
            qs("#drawer-body").innerHTML = renderDrawer({ id: String(item ? item.id : "") });
          }
        });

        // Eliminar / Reactivar
        const bDel = qs("#btn-delete");
        if (bDel) bDel.addEventListener("click", async (e) => {
          e.stopPropagation();
          const step = bDel.getAttribute("data-step") || "1";
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
            await softDelete(item);
            gcToast("Tutor eliminado (inactivo)", "exito");
            closeDrawer();
            await load();
          } catch { gcToast("No se pudo eliminar", "error"); }
        });

        qs("#btn-reactivar")?.addEventListener("click", async (e) => {
          e.stopPropagation();
          try {
            await reactivate(Number(item && item.id));
            gcToast("Tutor reactivado", "exito");
            await load();
            const re = S.data.find(x => x.id === (item && item.id));
            if (re) openDrawer("Tutor · " + re.nombre, renderDrawer({ id: String(re.id) }));
          } catch { gcToast("No se pudo reactivar", "error"); }
        });

        // Imagen existente editable (en modo edición)
        const contTutor = qs("#media-tutor");
        if (contTutor) {
          const tid = Number(t.id || (item ? item.id : 0));
          if (!isNaN(tid) && tid) {
            mountReadOnlyMedia({
              container: contTutor,
              type: "tutor",
              id: tid,
              labels: ["Foto"],
              editable: isEdit && isAdminUser
            });
          }
        }

        // Bloque JSON (copiar)
        if (isAdminUser) bindCopyFromPre && bindCopyFromPre("#json-tutor", "#btn-copy-json-tutor");

        // Chips de cursos ligados
        renderTutorCursosChips(Number(t.id || item?.id || 0), "#tutor-cursos");
      } catch {}
    }, 0);

    return html;
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
      nombre: read("f_nombre"),
      descripcion: read("f_descripcion"),
      estatus: readN("f_estatus") || 1
    };
    if (existingId != null) payload.id = Number(existingId);
    else payload.creado_por = Number((window.usuario && window.usuario.id) || (state?.usuario?.id) || 1) || 1;

    return payload;
  }

  function validateRequired(payload, { isEdit }) {
    const errs = [];
    if (!String(payload.nombre || "").trim()) errs.push("Nombre");
    if (!String(payload.descripcion || "").trim()) errs.push("Descripción");
    return errs;
  }

  async function softDelete(item) {
    if (!item || !item._all) throw new Error("Item inválido");
    const body = { ...item._all, estatus: 0 };
    await postJSON(API.uTutores, body);
  }

  async function reactivate(id) {
    const it = S.data.find(x => x.id === Number(id));
    if (!it || !it._all) throw new Error("Tutor no encontrado");
    const body = { ...it._all, estatus: 1 };
    await postJSON(API.uTutores, body);
  }

  async function uploadTutorImagen(tutorId, file) {
    const fd = new FormData();
    fd.append("tutor_id", String(tutorId));
    fd.append("imagen", file);
    const res = await fetch(API_UPLOAD.tutorImg, { method: "POST", body: fd });
    const text = await res.text().catch(() => "");
    if (!res.ok) throw new Error("HTTP " + res.status + " " + (text || ""));
    try { return JSON.parse(text); } catch { return { _raw: text }; }
  }

  async function saveNew() {
    const payload = readForm(null);
    const missing = validateRequired(payload, { isEdit: false });
    if (missing.length) return gcToast("Campos requeridos: " + missing.join(", "), "warning");

    const res = await postJSON(API.iTutores, payload);
    const newId = Number((res && (res.id || res.tutor_id || res.insert_id || (res.data && res.data.id))) || 0);
    const file = S.tempNewTutorImage || null;

    if (newId && file) {
      try { await uploadTutorImagen(newId, file); gcToast("Imagen subida", "exito"); }
      catch { gcToast("Tutor creado, pero falló la imagen", "error"); }
      finally { S.tempNewTutorImage = null; }
    }

    gcToast("Tutor creado", "exito");
    closeDrawer();
    await load();
    if (newId) {
      const re = S.data.find(x => x.id === newId);
      if (re) openDrawer("Tutor · " + re.nombre, renderDrawer({ id: String(re.id) }));
    }
  }

  async function saveUpdate(item) {
    if (!item || !item._all) return gcToast("Sin item para actualizar", "error");
    const payload = readForm(item.id);
    const missing = validateRequired(payload, { isEdit: true });
    if (missing.length) return gcToast("Campos requeridos: " + missing.join(", "), "warning");

    await postJSON(API.uTutores, payload);
    gcToast("Cambios guardados", "exito");
    await load();
    const re = S.data.find(x => x.id === item.id);
    if (re) openDrawer("Tutor · " + re.nombre, renderDrawer({ id: String(re.id) }));
  }

  // ====== Chips de cursos ligados ======
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
      const orderKey = v => ({1:1, 4:2, 2:3, 3:4, 0:5, 5:5})[Number(v)] || 9;
      list.sort((a, b) => orderKey(a.estatus) - orderKey(b.estatus) || String(a.nombre).localeCompare(String(b.nombre)));

      const statusClass = v => {
        const n = Number(v);
        if (n === 1) return "s-1";
        if (n === 2) return "s-2";
        if (n === 3) return "s-3";
        if (n === 4) return "s-4"; // añade la regla CSS si quieres azul; de lo contrario, cámbialo a "s-3"
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
          openDrawer("Curso · —", renderCursoDrawer({ id: String(cid) }));
        });
      });
    } catch {
      host.innerHTML = '<span class="chip-empty">No fue posible cargar los cursos</span>';
    }
  }

  // ====== API pública para el router ======
  window.tutores = { mount, openCreate };
})();
