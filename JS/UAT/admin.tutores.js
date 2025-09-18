/* ==================== TUTORES (UAT) — Núcleo + Listado + Drawer ==================== */
(() => {
  "use strict";

  const TAG = "[Tutores]";

  /* ---------- Config/API ---------- */
  const API_BASE =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
  const API = {
    tutores: window.API?.tutores || API_BASE + "c_tutor.php",
    iTutores: window.API?.iTutores || API_BASE + "i_tutor.php",
    uTutores: window.API?.uTutores || API_BASE + "u_tutor.php",
    cursos: window.API?.cursos || API_BASE + "c_cursos.php",
  };
  const API_UPLOAD = window.API?.API_UPLOAD || {
    tutorImg: API_BASE + "u_tutorImg.php",
  };

  /* ---------- Estado ---------- */
  const S = {
    data: [],
    raw: [],
    page: 1,
    pageSize: 7,
    search: "",
    tempNewTutorImage: null, // crear: se sube al guardar
    pendingEditTutorImage: null, // edición: (ya no la usamos, porque subimos tras preview)
  };

  /* ---------- Utils básicos ---------- */
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [].slice.call(r.querySelectorAll(s));
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[c])
    );
  const norm = (s) =>
    String(s || "")
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .trim();
  const fmtDateTime = (dt) => {
    if (!dt) return "-";
    try {
      const [d, t = ""] = String(dt).split(" ");
      const [y, m, da] = d.split("-");
      return `${da}/${m}/${y} ${t}`.trim();
    } catch {
      return dt;
    }
  };
  const STATUS_LABEL_TUTOR = { 1: "Activo", 0: "Inactivo", 2: "Pausado" };

  function toast(m, t = "info", ms = 2200) {
    if (window.gcToast) return window.gcToast(m, t, ms);
    console.log(TAG, "toast[" + t + "]: ", m);
  }

  async function postJSON(url, body) {
    console.log(TAG, "POST", url, { body });
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    const text = await r.text().catch(() => "");
    if (!r.ok) throw new Error(`HTTP ${r.status} ${text}`);

    try {
      return JSON.parse(text);
    } catch {}
    const fb = text.indexOf("{"),
      lb = text.lastIndexOf("}");
    const fb2 = text.indexOf("["),
      lb2 = text.lastIndexOf("]");
    let candidate = "";
    if (fb !== -1 && lb !== -1 && lb > fb) candidate = text.slice(fb, lb + 1);
    else if (fb2 !== -1 && lb2 !== -1 && lb2 > fb2)
      candidate = text.slice(fb2, lb2 + 1);
    if (candidate) {
      try {
        return JSON.parse(candidate);
      } catch {}
    }
    return { _raw: text };
  }

  function withBust(u) {
    if (
      !u ||
      typeof u !== "string" ||
      u.startsWith("data:") ||
      u.startsWith("blob:")
    )
      return u;
    try {
      const url = new URL(u, location.origin);
      url.searchParams.set("v", Date.now());
      return url.pathname + "?" + url.searchParams.toString();
    } catch {
      return u + (u.includes("?") ? "&" : "?") + "v=" + Date.now();
    }
  }
  function noImageSvgDataURI() {
    const svg =
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 100'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M18 74 L56 38 L92 66 L120 50 L142 74' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  // ---------- Img helpers ----------
  function tutorImgUrl(id, ext = "png") {
    return `/ASSETS/tutor/tutor_${Number(id)}.${ext}`;
  }
  function cursoImgUrl(id, ext = "png") {
    return `/ASSETS/cursos/img${Number(id)}.${ext}`;
  }
  function setImgWithFallback(imgEl, primary, secondary, finalDataURI) {
    if (!imgEl) return;
    const trySecond = () => {
      imgEl.onerror = () => {
        imgEl.onerror = null;
        imgEl.src = finalDataURI || noImageSvgDataURI();
      };
      imgEl.src = withBust(secondary);
    };
    imgEl.onerror = () => trySecond();
    imgEl.src = withBust(primary);
  }

  // ---------- Status helpers (para listado) ----------
  function statusBadge(tipo, s) {
    if (window.statusBadge) return window.statusBadge(tipo, s);
    const n = Number(s);
    const label = n === 1 ? "Activo" : n === 0 ? "Inactivo" : "Pausado";
    return `<span class="gc-chip">${label}</span>`;
  }
  function statusSelect(id, val, tipo) {
    if (window.statusSelect) return window.statusSelect(id, val, tipo);
    const v = Number(val);
    return `<select id="${id}">
      <option value="1"${v === 1 ? " selected" : ""}>Activo</option>
      <option value="0"${v === 0 ? " selected" : ""}>Inactivo</option>
      <option value="2"${v === 2 ? " selected" : ""}>Pausado</option>
    </select>`;
  }

  const isAdminUser =
    typeof window !== "undefined" && "isAdminUser" in window
      ? window.isAdminUser
      : true;
  const state =
    typeof window !== "undefined" && window.state
      ? window.state
      : { currentDrawer: null, usuario: { id: 1 } };

  /* ---------- Preview de imagen (usa tu preview nativo si existe; fallback modal ligero) ---------- */
  async function gcAskImageUpload({
    file,
    title = "Vista previa de imagen",
    detailsText = "",
  }) {
    const openers = [
      window.gcImagePreview,
      window.openImagePreview,
      window.gcOpenImagePreview,
      window.imagePreview,
    ].filter(Boolean);
    if (openers.length) {
      return await new Promise((resolve) => {
        try {
          openers[0]({
            file,
            title,
            detailsText,
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false),
          });
        } catch {
          resolve(window.confirm("¿Subir esta imagen?"));
        }
      });
    }
    // Fallback simple
    return await new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const m = document.createElement("div");
      m.innerHTML = `
        <div style="position:fixed;inset:0;background:rgba(0,0,0,.5);display:grid;place-items:center;z-index:1010;">
          <div style="background:#fff;width:min(960px,92vw);max-height:92vh;border-radius:12px;overflow:hidden;box-shadow:0 12px 24px rgba(0,0,0,.2);">
            <div style="padding:16px 18px;border-bottom:1px solid #eee;font-weight:700;">${esc(
              title
            )}</div>
            <div style="display:grid;grid-template-columns:1fr 280px;gap:16px;padding:16px;max-height:calc(92vh - 120px);overflow:auto;">
              <div style="border:1px solid #eee;border-radius:8px;overflow:hidden;">
                <img src="${url}" alt="Preview" style="display:block;max-width:100%;height:auto;">
              </div>
              <div>
                <div style="font-weight:600;margin-bottom:8px;">Detalles</div>
                <div style="line-height:1.6;">
                  <div><strong>Archivo:</strong> ${esc(file.name)}</div>
                  <div><strong>Peso:</strong> ${(file.size / 1024).toFixed(
                    1
                  )} KB</div>
                  <div><strong>Tipo:</strong> ${esc(file.type)}</div>
                  <div style="margin-top:8px;color:#606770;">Formatos permitidos: JPG / PNG · Máx 2MB</div>
                </div>
              </div>
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end;padding:12px 16px;border-top:1px solid #eee;">
              <button id="p-cancel" class="gc-btn gc-btn--ghost">Cancelar</button>
              <button id="p-ok" class="gc-btn gc-btn--success">Subir</button>
            </div>
          </div>
        </div>`;
      document.body.appendChild(m);
      m.querySelector("#p-cancel").onclick = () => {
        m.remove();
        resolve(false);
      };
      m.querySelector("#p-ok").onclick = () => {
        m.remove();
        resolve(true);
      };
    });
  }

  /* ---------- Drawer control (overlay bien manejado) ---------- */
  function openTutorDrawer(title, html) {
    const aside = document.getElementById("drawer-tutor");
    const overlay = document.getElementById("gc-dash-overlay");
    const t = document.getElementById("drawer-tutor-title");
    const b = document.getElementById("drawer-tutor-body");
    if (!aside) return;
    if (t) t.textContent = title || "Tutor · —";
    if (b) b.innerHTML = html || "";
    aside.classList.add("open");
    aside.removeAttribute("hidden");
    aside.setAttribute("aria-hidden", "false");
    if (overlay) {
      overlay.classList.add("open");
      overlay.hidden = false;
      overlay.setAttribute("aria-hidden", "false");
    }
  }
  function closeTutorDrawer() {
    const aside = document.getElementById("drawer-tutor");
    const overlay = document.getElementById("gc-dash-overlay");
    if (!aside) return;
    try {
      const ae = document.activeElement;
      if (ae && aside.contains(ae)) ae.blur();
    } catch {}
    aside.classList.remove("open");
    aside.setAttribute("hidden", "");
    aside.setAttribute("aria-hidden", "true");
    if (overlay) {
      overlay.classList.remove("open");
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden", "true");
    }
  }
  // binds una vez
  (function bindDrawerOnce() {
    qsa("#drawer-tutor-close").forEach((b) => {
      if (!b._b) {
        b._b = true;
        b.addEventListener("click", closeTutorDrawer);
      }
    });
    const ov = qs("#gc-dash-overlay");
    if (ov && !ov._b) {
      ov._b = true;
      ov.addEventListener("click", () => {
        const mini = qs("#drawer-curso-mini");
        if (mini && !mini.hasAttribute("hidden")) closeCursoMiniDrawer();
        else closeTutorDrawer();
      });
    }
    if (!window._gc_tutores_esc) {
      window._gc_tutores_esc = true;
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          const mini = qs("#drawer-curso-mini");
          if (mini && !mini.hasAttribute("hidden")) closeCursoMiniDrawer();
          else closeTutorDrawer();
        }
      });
    }
  })();

  /* ---------- Búsqueda (gcSearch + fallback) ---------- */
  function wireSearch() {
    const ph = "Buscar por nombre, descripción o ID…";
    const tip = "Filtra por: nombre, descripción o ID.";
    if (window.gcSearch?.register) {
      if (!window._search_tutores_wired) {
        window._search_tutores_wired = true;
        window.gcSearch.register(
          "#/tutores",
          (q) => {
            S.search = q || "";
            S.page = 1;
            draw();
          },
          { placeholder: ph }
        );
        const inp = document.querySelector("#search-input");
        if (inp) inp.title = tip;
      }
    } else {
      const s = qs("#search-input");
      if (s && !s._b) {
        s._b = true;
        s.placeholder = ph;
        s.title = tip;
        s.addEventListener("input", (e) => {
          S.search = e.target.value || "";
          S.page = 1;
          draw();
        });
      }
    }
  }

  /* ---------- Montaje Router ---------- */
  async function mount() {
    console.log(TAG, "mount()");
    const hdr = qs(".recursos-box.desktop-only .table-header");
    if (hdr) {
      hdr.querySelector(".col-nombre") &&
        (hdr.querySelector(".col-nombre").textContent = "Nombre");
      const c2 =
        hdr.querySelector(".col-fecha") || hdr.querySelector(".col-tipo");
      if (c2) {
        c2.textContent = "Fecha de creación";
        c2.classList.add("col-fecha");
      }
      hdr.querySelector(".col-status") &&
        (hdr.querySelector(".col-status").textContent = "Status");
    }
    qs("#mod-title") && (qs("#mod-title").textContent = "Tutores");
    qs(".tt-title") && (qs(".tt-title").textContent = "Tutores:");
    const st = qs("#tt-status");
    if (st) {
      st.textContent = "Todos los estatus";
      st.classList.remove("badge-inactivo");
      st.classList.add("badge-activo");
    }

    wireSearch();
    await load();
  }

  async function openCreate() {
    console.log(TAG, "openCreate()");
    S.tempNewTutorImage = null;
    state.currentDrawer = { type: "tutor", id: null, mode: "create" };
    openTutorDrawer("Tutor · Crear", renderDrawer({ id: "" }));
  }

  /* ---------- Carga & Listado ---------- */
  async function load() {
    console.log(TAG, "load()");
    try {
      const [act, inact, pa] = await Promise.all([
        postJSON(API.tutores, { estatus: 1 }),
        postJSON(API.tutores, { estatus: 0 }),
        postJSON(API.tutores, { estatus: 2 }),
      ]);
      const raw = [].concat(act || [], inact || [], pa || []);
      S.raw = raw;
      S.data = raw.map((t) => ({
        id: Number(t.id),
        nombre: t.nombre,
        descripcion: t.descripcion || "",
        estatus: Number(t.estatus),
        fecha_creacion: t.fecha_creacion,
        _all: t,
      }));
      draw();
    } catch (e) {
      console.error(TAG, "load error", e);
      toast("No se pudieron cargar tutores", "error");
    }
  }

  function draw() {
    const hostD = qs("#recursos-list");
    const hostM = qs("#recursos-list-mobile");
    if (hostD) hostD.innerHTML = "";
    if (hostM) hostM.innerHTML = "";

    const term = norm(S.search);
    const filtered = term
      ? S.data.filter(
          (it) =>
            norm(it.nombre).includes(term) ||
            norm(it.descripcion).includes(term) ||
            String(it.id).includes(term)
        )
      : S.data;

    const cnt = qs("#mod-count");
    if (cnt)
      cnt.textContent = `${filtered.length} ${
        filtered.length === 1 ? "elemento" : "elementos"
      }`;

    const start = (S.page - 1) * S.pageSize;
    const pageRows = filtered.slice(start, start + S.pageSize);

    if (!filtered.length) {
      const empty =
        '<div class="empty-state" style="padding:1rem;">Sin resultados</div>';
      if (hostD) hostD.innerHTML = empty;
      if (hostM) hostM.innerHTML = empty;
      return;
    }

    // Desktop
    pageRows.forEach((it) => {
      hostD?.insertAdjacentHTML(
        "beforeend",
        `
        <div class="table-row" data-id="${it.id}" data-type="tutor">
          <div class="col-nombre"><span class="name-text">${esc(
            it.nombre
          )}</span></div>
          <div class="col-fecha">${esc(fmtDateTime(it.fecha_creacion))}</div>
          <div class="col-status">${statusBadge("tutores", it.estatus)}</div>
        </div>
      `
      );
    });

    // Mobile
    pageRows.forEach((it) => {
      hostM?.insertAdjacentHTML(
        "beforeend",
        `
        <div class="table-row-mobile" data-id="${it.id}" data-type="tutor">
          <button class="row-toggle">
            <div class="col-nombre">${esc(it.nombre)}</div>
            <span class="icon-chevron">›</span>
          </button>
          <div class="row-details">
            <div><strong>Creado:</strong> ${esc(
              fmtDateTime(it.fecha_creacion)
            )}</div>
            <div><strong>Status:</strong> ${statusBadge(
              "tutores",
              it.estatus
            )}</div>
            <div style="display:flex;gap:8px;margin:.25rem 0 .5rem;">
              <button class="gc-btn gc-btn--ghost open-drawer">Ver detalle</button>
              ${
                Number(it.estatus) === 0
                  ? `<button class="gc-btn gc-btn--success gc-reactivate" data-id="${it.id}">Reactivar</button>`
                  : ""
              }
            </div>
          </div>
        </div>
      `
      );
    });

    // binds
    qsa("#recursos-list .table-row").forEach((row) => {
      row.addEventListener("click", () => {
        const id = Number(row.dataset.id);
        state.currentDrawer = { type: "tutor", id, mode: "view" };
        openTutorDrawer("Tutor · —", renderDrawer({ id: String(id) }));
      });
    });
    qsa("#recursos-list-mobile .open-drawer").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = Number(btn.closest(".table-row-mobile")?.dataset.id || 0);
        state.currentDrawer = { type: "tutor", id, mode: "view" };
        openTutorDrawer("Tutor · —", renderDrawer({ id: String(id) }));
      });
    });
    qsa(".gc-reactivate").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = Number(btn.getAttribute("data-id"));
        try {
          await reactivate(id);
          toast("Tutor reactivado", "exito");
          await load();
        } catch (e) {
          toast("No se pudo reactivar", "error");
        }
      });
    });
  }

  /* ---------- Drawer (view/edit/create) ---------- */
  function renderDrawer(dataset) {
    const item = S.data.find((x) => String(x.id) === String(dataset.id));
    const mode = state.currentDrawer?.mode || (item ? "view" : "create");
    const isCreate = mode === "create" || !item;
    const isEdit = mode === "edit";
    const isView = mode === "view" && !!item;

    const t = isCreate ? getEmptyTutor() : item ? item._all : null;
    if (!t) return "<p>No encontrado.</p>";

    const headActions =
      !isCreate && !isEdit && isAdminUser
        ? `
      <div class="gc-actions" id="tutor-actions-view">
        <button class="gc-btn" id="btn-edit-tutor">Editar</button>
        ${
          Number(t.estatus) === 0
            ? `<button class="gc-btn gc-btn--success" id="btn-reactivar-tutor">Reactivar</button>`
            : `<button class="gc-btn gc-btn--danger" id="btn-delete-tutor" data-step="1">Eliminar</button>`
        }
      </div>`
        : "";

    const viewHTML = `
      ${headActions}
      <section id="tutor-view" class="mode-view"${isView ? "" : " hidden"}>
        <div class="field">
          <div class="label">Nombre <span class="req">*</span></div>
          <div class="value" id="tv_nombre">${esc(t.nombre)}</div>
        </div>
        <div class="field">
          <div class="label">Descripción <span class="req">*</span></div>
          <div class="value" id="tv_descripcion">${esc(t.descripcion)}</div>
        </div>
        <div class="grid-3">
          <div class="field"><div class="label">Estatus</div><div class="value" id="tv_estatus">${esc(
            STATUS_LABEL_TUTOR[t.estatus] ?? "—"
          )}</div></div>
          <div class="field"><div class="label">ID</div><div class="value" id="tv_id">${esc(
            t.id
          )}</div></div>
          <div class="field"><div class="label">Fecha creación</div><div class="value" id="tv_fecha_creacion">${esc(
            fmtDateTime(t.fecha_creacion)
          )}</div></div>
        </div>

        <div class="field">
          <div class="label">Imagen</div>
          <div class="value">
            <div id="media-tutor" data-id="${t.id || item?.id || ""}">
              <div class="media-head">
                <div class="media-title">Imágenes</div>
                <div class="media-help" style="color:#888;">Solo lectura</div>
              </div>
              <div class="media-grid">
                <div class="media-card">
                  <figure class="media-thumb">
                    <img id="tutor-img-view" alt="Foto" src="${noImageSvgDataURI()}">
                  </figure>
                  <div class="media-meta"><div class="media-label">Foto</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="field">
          <div class="label">Cursos ligados</div>
          <div class="value">
            <div class="tutor-cursos" id="tutor-cursos"></div>
            <div class="hint gc-soft" style="margin-top:.35rem;">Toca una imagen para ver el curso (solo lectura).</div>
          </div>
        </div>

        <details class="dev-json" id="tutor-json-box" open style="margin-top:16px;">
          <summary style="cursor:pointer;font-weight:600;">JSON · Tutor</summary>
          <div style="display:flex;gap:.5rem;margin:.5rem 0;"><button class="gc-btn" id="btn-copy-json-tutor">Copiar JSON</button></div>
          <pre id="json-tutor" class="value" style="white-space:pre-wrap;max-height:260px;overflow:auto;">${esc(
            JSON.stringify(t, null, 2)
          )}</pre>
        </details>
      </section>
    `;

    const editHTML = `
      <section id="tutor-edit" class="mode-edit"${
        isCreate || isEdit ? "" : " hidden"
      }>
        <div class="field">
          <label for="tf_nombre">Nombre <span class="req">*</span></label>
          <input id="tf_nombre" type="text" value="${esc(
            t.nombre || ""
          )}" maxlength="120" data-max="120" />
          <small class="char-counter" data-for="tf_nombre"></small>
        </div>
        <div class="field">
          <label for="tf_descripcion">Descripción <span class="req">*</span></label>
          <textarea id="tf_descripcion" rows="8" maxlength="800" data-max="800">${esc(
            t.descripcion || ""
          )}</textarea>
          <small class="char-counter" data-for="tf_descripcion"></small>
        </div>
        <div class="field">
          <label for="tf_estatus">Estatus</label>
          ${statusSelect("tf_estatus", t.estatus, "tutores")}
        </div>

        <div class="field">
          <label>Imagen</label>
          <div class="value">
            <div id="media-tutor-edit" class="media-grid" data-id="${
              t.id || item?.id || ""
            }">
              <div class="media-card">
                <figure class="media-thumb">
                  <img alt="Foto" id="tutor-img-edit" src="${noImageSvgDataURI()}">
                  <button class="icon-btn media-edit" id="tutor-pencil" type="button" title="Editar imagen" aria-label="Editar imagen">
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
                  </button>
                </figure>
                <div class="media-meta">
                  <div class="media-label">Foto</div>
                  <div class="media-help gc-soft" id="tutor-img-info">JPG/PNG · Máx 2MB</div>
                </div>
              </div>
            </div>
          </div>
        </div>

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

    setTimeout(async () => {
      const titleEl = qs("#drawer-tutor-title");
      if (isCreate) {
        titleEl && (titleEl.textContent = "Tutor · Crear");
        state.currentDrawer = { type: "tutor", id: null, mode: "create" };
      } else if (isEdit) {
        titleEl &&
          (titleEl.textContent = `Tutor · ${
            item ? item.nombre : ""
          } (edición)`);
        state.currentDrawer = {
          type: "tutor",
          id: item?.id || null,
          mode: "edit",
        };
      } else {
        titleEl && (titleEl.textContent = `Tutor · ${item ? item.nombre : ""}`);
        state.currentDrawer = {
          type: "tutor",
          id: item?.id || null,
          mode: "view",
        };
      }

      if (window.disableDrawerInputs)
        window.disableDrawerInputs(!(isEdit || isCreate));

      qs("#btn-edit-tutor")?.addEventListener("click", () => {
        state.currentDrawer = {
          type: "tutor",
          id: item?.id || null,
          mode: "edit",
        };
        qs("#drawer-tutor-body").innerHTML = renderDrawer({
          id: String(item?.id || ""),
        });
      });
      qs("#btn-delete-tutor")?.addEventListener("click", async (e) => {
        const btn = e.currentTarget;
        const step = btn.getAttribute("data-step") || "1";
        if (step === "1") {
          btn.textContent = "Confirmar";
          btn.setAttribute("data-step", "2");
          setTimeout(() => {
            if (btn.getAttribute("data-step") === "2") {
              btn.textContent = "Eliminar";
              btn.setAttribute("data-step", "1");
            }
          }, 3500);
          return;
        }
        try {
          await softDelete(item);
          toast("Tutor movido a Inactivo", "exito");
          closeTutorDrawer();
          await load();
        } catch (err) {
          console.error(TAG, "delete", err);
          toast("No se pudo eliminar", "error");
        }
      });
      qs("#btn-reactivar-tutor")?.addEventListener("click", async () => {
        try {
          await reactivate(Number(item?.id));
          toast("Tutor reactivado", "exito");
          await load();
          const re = S.data.find((x) => x.id === item.id);
          if (re)
            openTutorDrawer(
              "Tutor · " + re.nombre,
              renderDrawer({ id: String(re.id) })
            );
        } catch (err) {
          console.error(TAG, "reactivar", err);
          toast("No se pudo reactivar", "error");
        }
      });

      qs("#btn-cancel-tutor")?.addEventListener("click", () => {
        if (isCreate) {
          S.tempNewTutorImage = null;
          closeTutorDrawer();
        } else {
          state.currentDrawer = {
            type: "tutor",
            id: item?.id || null,
            mode: "view",
          };
          qs("#drawer-tutor-body").innerHTML = renderDrawer({
            id: String(item?.id || ""),
          });
        }
      });
      qs("#btn-save-tutor")?.addEventListener("click", async () => {
        try {
          if (isCreate) await saveNew();
          else await saveUpdate(item);
        } catch (err) {
          console.error(TAG, "save", err);
          toast("Error al guardar", "error");
        }
      });

      if (isView) {
        const tid = Number(t.id || item?.id || 0);
        const imgView = qs("#tutor-img-view");
        if (imgView && tid)
          setImgWithFallback(
            imgView,
            tutorImgUrl(tid, "png"),
            tutorImgUrl(tid, "jpg"),
            noImageSvgDataURI()
          );
      }

      if (isEdit || isCreate) {
        const tid = Number(t.id || item?.id || 0);
        const imgEdit = qs("#tutor-img-edit");
        if (imgEdit) {
          if (tid)
            setImgWithFallback(
              imgEdit,
              tutorImgUrl(tid, "png"),
              tutorImgUrl(tid, "jpg"),
              noImageSvgDataURI()
            );
          else if (S.tempNewTutorImage instanceof File) {
            imgEdit.src = withBust(URL.createObjectURL(S.tempNewTutorImage));
          } else imgEdit.src = noImageSvgDataURI();
        }
        const pencil = qs("#tutor-pencil");
        if (pencil && !pencil._b) {
          pencil._b = true;
          pencil.addEventListener("click", async () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/png,image/jpeg";
            input.style.display = "none";
            document.body.appendChild(input);
            input.addEventListener("change", async () => {
              const file = input.files && input.files[0];
              input.remove();
              if (!file) return;
              if (!/image\/(png|jpeg)/.test(file.type))
                return toast("Formato no permitido. Usa JPG o PNG.", "error");
              if (file.size > 2 * 1048576)
                return toast("La imagen excede 2MB.", "error");

              const confirmed = await gcAskImageUpload({
                file,
                title: "Vista previa de imagen",
              });
              if (!confirmed) return;

              const info = qs("#tutor-img-info");
              const u = URL.createObjectURL(file);
              if (!tid) {
                imgEdit && (imgEdit.src = withBust(u));
                S.tempNewTutorImage = file;
                if (info)
                  info.textContent = `Archivo: ${file.name} · ${(
                    file.size / 1048576
                  ).toFixed(2)} MB (se subirá al guardar)`;
                toast("Imagen lista; se subirá al guardar.", "info");
                return;
              }
              try {
                await uploadTutorImagen(tid, file);
                setImgWithFallback(
                  imgEdit,
                  tutorImgUrl(tid, "png"),
                  tutorImgUrl(tid, "jpg"),
                  noImageSvgDataURI()
                );
                if (info) info.textContent = `Imagen actualizada`;
                toast("Imagen actualizada", "exito");
              } catch (err) {
                console.error(TAG, "upload tutor img", err);
                toast("No se pudo subir la imagen", "error");
              }
            });
            input.click();
          });
        }
      }

      if (window.bindCopyFromPre)
        window.bindCopyFromPre("#json-tutor", "#btn-copy-json-tutor");

      const tgt = isEdit || isCreate ? "#tutor-cursos-edit" : "#tutor-cursos";
      renderTutorCursosChips(Number(t.id || item?.id || 0), tgt);
    }, 0);

    return viewHTML + editHTML;
  }

  function getEmptyTutor() {
    return {
      nombre: "",
      descripcion: "",
      estatus: 1,
      creado_por: Number(window.usuario?.id || state?.usuario?.id || 1) || 1,
    };
  }

  function readForm(existingId) {
    const v = (id) => (qs("#" + id)?.value || "").trim();
    const n = (id) => Number(v(id) || 0);
    const payload = {
      nombre: v("tf_nombre"),
      descripcion: v("tf_descripcion"),
      estatus: n("tf_estatus") || 1,
    };
    if (existingId != null) payload.id = Number(existingId);
    else
      payload.creado_por =
        Number(window.usuario?.id || state?.usuario?.id || 1) || 1;
    return payload;
  }

  function requireFields(p) {
    const errs = [];
    if (!p.nombre) errs.push("Nombre");
    if (!p.descripcion) errs.push("Descripción");
    if (errs.length) {
      toast("Campos requeridos: " + errs.join(", "), "warning");
      return false;
    }
    return true;
  }

  /* ---------- CRUD ---------- */
  async function softDelete(item) {
    if (!item || !item._all) throw new Error("Item inválido");
    await postJSON(API.uTutores, { ...item._all, estatus: 0 });
  }
  async function reactivate(id) {
    const it = S.data.find((x) => x.id === Number(id));
    if (!it || !it._all) throw new Error("Tutor no encontrado");
    await postJSON(API.uTutores, { ...it._all, estatus: 1 });
  }
  async function uploadTutorImagen(tutorId, file) {
    const fd = new FormData();
    fd.append("tutor_id", String(tutorId));
    fd.append("imagen", file);
    const r = await fetch(API_UPLOAD.tutorImg, { method: "POST", body: fd });
    const text = await r.text().catch(() => "");
    if (!r.ok) throw new Error("HTTP " + r.status + " " + text);
    try {
      return JSON.parse(text);
    } catch {
      return { _raw: text };
    }
  }

  async function saveNew() {
    const p = readForm(null);
    if (!requireFields(p)) return;
    const res = await postJSON(API.iTutores, p);
    const newId = Number(
      res?.id || res?.tutor_id || res?.insert_id || res?.data?.id || 0
    );

    if (newId && S.tempNewTutorImage instanceof File) {
      try {
        await uploadTutorImagen(newId, S.tempNewTutorImage);
        toast("Imagen subida", "exito");
      } catch (e) {
        console.error(TAG, "upload new", e);
        toast("Tutor creado, pero la imagen no se pudo subir.", "error");
      } finally {
        S.tempNewTutorImage = null;
      }
    }

    toast("Tutor creado", "exito");
    closeTutorDrawer();
    await load();
    if (newId) {
      const re = S.data.find((x) => x.id === newId);
      if (re) {
        state.currentDrawer = { type: "tutor", id: newId, mode: "view" };
        openTutorDrawer(
          "Tutor · " + re.nombre,
          renderDrawer({ id: String(re.id) })
        );
      }
    }
  }

  async function saveUpdate(item) {
    if (!item || !item._all) return toast("Sin item para actualizar", "error");
    const p = readForm(item.id);
    if (!requireFields(p)) return;

    await postJSON(API.uTutores, p);

    toast("Cambios guardados", "exito");
    await load();
    const re = S.data.find((x) => x.id === item.id);
    if (re) {
      state.currentDrawer = { type: "tutor", id: item.id, mode: "view" };
      openTutorDrawer(
        "Tutor · " + re.nombre,
        renderDrawer({ id: String(re.id) })
      );
    }
  }

  /* ---------- Cursos ligados (fetch all + filtrar por tutor) ---------- */
  async function renderTutorCursosChips(
    tutorId,
    containerSel = "#tutor-cursos"
  ) {
    const host = qs(containerSel);
    if (!host) return;

    try {
      const statuses = [1, 4, 2, 3, 0, 5];
      const chunks = await Promise.all(
        statuses.map((st) =>
          postJSON(API.cursos, { estatus: st }).catch(() => [])
        )
      );
      const all = chunks.flat().filter(Boolean);
      const list = all.filter(
        (c) =>
          Number(c.tutor) === Number(tutorId) ||
          Number(c.id_tutor) === Number(tutorId)
      );

      if (!list.length) {
        host.innerHTML = '<span class="chip-empty">Sin cursos ligados</span>';
        return;
      }

      const orderKey = (v) =>
        ({ 1: 1, 4: 2, 2: 3, 3: 4, 0: 5, 5: 5 }[Number(v)] || 9);
      list.sort(
        (a, b) =>
          orderKey(a.estatus) - orderKey(b.estatus) ||
          String(a.nombre).localeCompare(String(b.nombre))
      );

      const statusCls = (v) => {
        const n = Number(v);
        if (n === 1) return "s-1";
        if (n === 2) return "s-2";
        if (n === 3) return "s-3";
        if (n === 4) return "s-3";
        return "s-0";
      };

      host.innerHTML = list
        .map(
          (cr) => `
        <button class="curso-chip ${statusCls(cr.estatus)}" data-id="${
            cr.id
          }" aria-label="Abrir curso: ${esc(cr.nombre || "")}" title="${esc(
            cr.nombre || ""
          )}">
          <img alt="Portada" id="chip-img-${cr.id}">
          <span>${esc((cr.nombre || "").slice(0, 18))}</span>
        </button>
      `
        )
        .join("");

      list.forEach((cr) => {
        const im = qs(`#chip-img-${cr.id}`, host);
        if (im)
          setImgWithFallback(
            im,
            cursoImgUrl(cr.id, "png"),
            cursoImgUrl(cr.id, "jpg"),
            noImageSvgDataURI()
          );
      });

      host.querySelectorAll(".curso-chip").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const cid = Number(btn.getAttribute("data-id"));
          const data = list.find((x) => +x.id === +cid);
          if (!data) return toast("Curso no encontrado", "error");
          openCursoMiniDrawer(data);
        });
      });
    } catch (e) {
      console.error(TAG, "chips error", e);
      host.innerHTML =
        '<span class="chip-empty">No fue posible cargar los cursos</span>';
    }
  }

  /* ---------- Mini Drawer de curso (solo lectura) ---------- */
  function ensureCursoMiniDOM() {
    if (qs("#drawer-curso-mini")) return;
    const tpl = document.createElement("div");
    tpl.innerHTML = `
      <aside id="drawer-curso-mini" class="drawer gc-dash" aria-hidden="true" hidden>
        <div class="drawer-header">
          <div class="drawer-title" id="drawer-curso-mini-title">Curso · —</div>
          <div class="drawer-actions"><button class="btn" id="drawer-curso-mini-close">Cerrar</button></div>
        </div>
        <div class="drawer-body" id="drawer-curso-mini-body">
          <section id="curso-mini-view" class="mode-view">
            <div class="field"><div class="label">Nombre</div><div class="value" id="cm_nombre">—</div></div>
            <div class="grid-3">
              <div class="field"><div class="label">Estatus</div><div class="value" id="cm_estatus">—</div></div>
              <div class="field"><div class="label">Fecha inicio</div><div class="value" id="cm_fecha">—</div></div>
              <div class="field"><div class="label">Tutor</div><div class="value" id="cm_tutor">—</div></div>
            </div>
            <div class="field">
              <div class="label">Portada</div>
              <div class="value">
                <div class="media-grid"><div class="media-card">
                  <figure class="media-thumb"><img id="cm_img" alt="Portada" src=""></figure>
                  <div class="media-meta"><div class="media-label">Portada</div><div class="media-help" style="color:#888;">Solo lectura</div></div>
                </div></div>
              </div>
            </div>
            <details class="dev-json" open style="margin-top:12px;">
              <summary style="cursor:pointer;font-weight:600;">JSON · Curso</summary>
              <pre id="cm_json" class="value" style="white-space:pre-wrap;max-height:220px;overflow:auto;">{}</pre>
            </details>
          </section>
        </div>
      </aside>`;
    document.body.appendChild(tpl.firstElementChild);
    const btn = qs("#drawer-curso-mini-close");
    if (btn && !btn._b) {
      btn._b = true;
      btn.addEventListener("click", closeCursoMiniDrawer);
    }
  }
  function openCursoMiniDrawer(data) {
    ensureCursoMiniDOM();
    const aside = qs("#drawer-curso-mini");
    const overlay = qs("#gc-dash-overlay");
    const put = (sel, val) => {
      const el = qs(sel);
      if (el) el.textContent = val ?? "—";
    };

    qs("#drawer-curso-mini-title") &&
      (qs("#drawer-curso-mini-title").textContent =
        "Curso · " + (data?.nombre || "—"));
    put("#cm_nombre", data?.nombre || "—");
    const STATUS_LABEL = {
      1: "Activo",
      0: "Inactivo",
      2: "Pausado",
      3: "Terminado",
      4: "En curso",
      5: "Cancelado",
    };
    put(
      "#cm_estatus",
      STATUS_LABEL[data?.estatus] || String(data?.estatus ?? "—")
    );
    put("#cm_fecha", data?.fecha_inicio || "—");
    let tutorLabel = data?.tutor ?? "-";
    try {
      tutorLabel =
        window.gcUtils?.mapLabel?.(
          window.__CursosState?.maps?.tutores || {},
          data?.tutor
        ) ||
        (data?.tutor ?? "-");
    } catch {}
    put("#cm_tutor", String(tutorLabel));

    const img = qs("#cm_img");
    if (img && data?.id)
      setImgWithFallback(
        img,
        cursoImgUrl(data.id, "png"),
        cursoImgUrl(data.id, "jpg"),
        noImageSvgDataURI()
      );
    qs("#cm_json") &&
      (qs("#cm_json").textContent = JSON.stringify(data || {}, null, 2));

    aside.hidden = false;
    aside.setAttribute("aria-hidden", "false");
    aside.classList.add("open");
    if (overlay) {
      overlay.classList.add("open");
      overlay.hidden = false;
      overlay.setAttribute("aria-hidden", "false");
    }
  }
  function closeCursoMiniDrawer() {
    const aside = qs("#drawer-curso-mini");
    const overlay = qs("#gc-dash-overlay");
    if (!aside) return;
    try {
      const ae = document.activeElement;
      if (ae && aside.contains(ae)) ae.blur();
    } catch {}
    aside.classList.remove("open");
    aside.setAttribute("hidden", "");
    aside.setAttribute("aria-hidden", "true");
    if (overlay) {
      overlay.classList.remove("open");
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden", "true");
    }
  }

  /* ---------- API pública Router ---------- */
  window.tutores = { mount, openCreate };

  console.log(TAG, "Módulo tutores cargado.");
})();
