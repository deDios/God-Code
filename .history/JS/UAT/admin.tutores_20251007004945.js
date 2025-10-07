/* ==================== TUTORES ==================== */
(() => {
  "use strict";

  const TAG = "[Tutores]";

  /* ---------- Config/API ---------- */
  const API_BASE =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
  const API = {
    tutores:  (window.API?.tutores  || API_BASE + "c_tutor.php"),
    iTutores: (window.API?.iTutores || API_BASE + "i_tutor.php"),
    uTutores: (window.API?.uTutores || API_BASE + "u_tutor.php"),
    cursos:   (window.API?.cursos   || API_BASE + "c_cursos.php"),
  };
  const API_UPLOAD = window.API?.API_UPLOAD || {
    tutorImg: API_BASE + "u_tutorImg.php",
  };

  /* ---------- Estado ---------- */
  const S = {
    raw: [],
    data: [],
    page: 1,
    pageSize: 7,
    search: "",
    tempNewTutorImage: null, // buffer para creación
  };
  window.__TutoresState = S;

  // Orden deseado en el listado: Activo → Pausado → Inactivo
  const ORDER_TUTORES = [1, 2, 0];

  /* ---------- Utils ---------- */
  const MAX_UPLOAD_MB = 10;
  const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

  const qs  = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [].slice.call(r.querySelectorAll(s));
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  const norm = (s) =>
    String(s || "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

  const fmtDateTime = (dt) => {
    if (!dt) return "-";
    try {
      const [d, t = ""] = String(dt).split(" ");
      const [y, m, da] = d.split("-");
      return `${da}/${m}/${y} ${t}`.trim();
    } catch { return String(dt); }
  };

  function toast(m, t = "info", ms = 2200) {
    if (window.gcToast) return window.gcToast(m, t, ms);
    console.log(TAG, `toast[${t}]`, m);
  }

  async function postJSON(url, body) {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    const text = await r.text().catch(() => "");
    if (!r.ok) throw new Error(`HTTP ${r.status} ${text}`);
    try { return JSON.parse(text); } catch {}
    // Fallback: intenta recortar JSON válido
    const fb = text.indexOf("{"), lb = text.lastIndexOf("}");
    const fb2 = text.indexOf("["), lb2 = text.lastIndexOf("]");
    let candidate = "";
    if (fb !== -1 && lb !== -1 && lb > fb) candidate = text.slice(fb, lb + 1);
    else if (fb2 !== -1 && lb2 !== -1 && lb2 > fb2) candidate = text.slice(fb2, lb2 + 1);
    if (candidate) { try { return JSON.parse(candidate); } catch {} }
    return { _raw: text };
  }

  function withBust(u) {
    if (!u || typeof u !== "string" || u.startsWith("data:") || u.startsWith("blob:")) return u;
    try {
      const url = new URL(u, location.origin);
      url.searchParams.set("v", Date.now());
      return url.pathname + "?" + url.searchParams.toString();
    } catch {
      return u + (u.includes("?") ? "&" : "?") + "v=" + Date.now();
    }
  }

  function noImageSvgDataURI() {
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 100'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M18 74 L56 38 L92 66 L120 50 L142 74' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  function tutorImgUrl(id, ext = "png") { return `/ASSETS/tutor/tutor_${Number(id)}.${ext}`; }
  function cursoImgUrl(id, ext = "png") { return `/ASSETS/cursos/img${Number(id)}.${ext}`; }

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

  const STATUS_LABEL_TUTOR = { 1: "Activo", 0: "Inactivo", 2: "Pausado" };
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
      <option value="2"${v === 2 ? " selected" : ""}>Pausado</option>
      <option value="0"${v === 0 ? " selected" : ""}>Inactivo</option>
    </select>`;
  }

  /* ---------- Preview imagen (igual que Noticias) ---------- */
  function openImagePreviewLocal({ src, file, title = "Vista previa", confirm = false, onConfirm }) {
    const ov = document.createElement("div");
    ov.className = "gc-preview-overlay";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-modal", "true");
    Object.assign(ov.style, {
      position: "fixed", inset: "0", zIndex: "99999",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(17,24,39,.55)", backdropFilter: "saturate(120%) blur(2px)",
    });

    const modal = document.createElement("div");
    modal.className = "gc-preview-modal";
    Object.assign(modal.style, {
      background: "#fff", borderRadius: "14px", boxShadow: "0 20px 40px rgba(0,0,0,.25)",
      width: "min(920px,94vw)", maxHeight: "90vh", overflow: "hidden",
      display: "flex", flexDirection: "column",
    });

    const head = document.createElement("div");
    Object.assign(head.style, {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: "8px", padding: "12px 16px", borderBottom: "1px solid #eee",
    });
    head.innerHTML = `<div style="font-weight:700;font-size:1.05rem;">${esc(title)}</div>
      <button class="gc-btn gc-btn--ghost" data-act="close" aria-label="Cerrar" style="min-width:auto;padding:.35rem .6rem;">✕</button>`;

    const body = document.createElement("div");
    Object.assign(body.style, {
      display: "grid", gridTemplateColumns: "1fr 280px", gap: "16px", padding: "16px", alignItems: "start",
    });

    const left = document.createElement("div");
    Object.assign(left.style, {
      border: "1px solid #eee", borderRadius: "12px", padding: "8px", background: "#fafafa",
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "320px", maxHeight: "60vh",
    });
    const img = document.createElement("img");
    img.alt = "Vista previa";
    Object.assign(img.style, { maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "8px" });
    img.src = src || (file ? URL.createObjectURL(file) : "");
    left.appendChild(img);

    const right = document.createElement("div");
    Object.assign(right.style, { borderLeft: "1px dashed #e6e6e6", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "10px" });
    right.innerHTML = `
      <div style="font-weight:600;">Detalles</div>
      <div style="font-size:.92rem;color:#444;line-height:1.35;">
        ${file ? `
          <div><strong>Archivo:</strong> ${esc(file.name || "-")}</div>
          <div><strong>Peso:</strong> ${ (file.size/1048576).toFixed(2) } MB</div>
          <div><strong>Tipo:</strong> ${esc(file.type || "-")}</div>` : `<div style="color:#666;">Solo lectura</div>`}
        <div style="margin-top:6px;color:#666;">Formatos permitidos: JPG / PNG · Máx ${MAX_UPLOAD_MB}MB</div>
      </div>
      <div style="margin-top:auto;display:flex;gap:8px;flex-wrap:wrap;">
        ${confirm ? `<button class="gc-btn gc-btn--primary" data-act="confirm">Subir</button>` : ``}
        <button class="gc-btn gc-btn--ghost" data-act="cancel">Cerrar</button>
      </div>`;

    body.append(left, right);
    modal.append(head, body);
    ov.appendChild(modal);
    document.body.appendChild(ov);

    const close = () => {
      try { document.activeElement && document.activeElement.blur(); } catch {}
      ov.remove();
      if (file && img.src.startsWith("blob:")) URL.revokeObjectURL(img.src);
    };
    ov.addEventListener("click", (e) => { if (e.target === ov) close(); });
    ov.querySelector('[data-act="close"]')?.addEventListener("click", close);
    ov.querySelector('[data-act="cancel"]')?.addEventListener("click", close);
    ov.querySelector('[data-act="confirm"]')?.addEventListener("click", async () => {
      try { if (typeof onConfirm === "function") await onConfirm(); }
      finally { close(); }
    });

    return { close };
  }

  function getOpenImagePreview() {
    const external = (window.gcPreview?.openImagePreview) || window.openImagePreview;
    return (opts = {}) => {
      if (opts.confirm) return openImagePreviewLocal(opts); // forzamos local si hay confirm
      return external ? external(opts) : openImagePreviewLocal(opts);
    };
  }

  function validarImagen(file, maxMB = MAX_UPLOAD_MB) {
    if (!file) return { ok: false, error: "No seleccionaste archivo." };
    if (!/image\/(png|jpeg)/.test(file.type)) return { ok: false, error: "Formato no permitido. Usa JPG o PNG." };
    if (file.size > maxMB * 1048576) return { ok: false, error: `La imagen excede ${maxMB}MB.` };
    return { ok: true };
  }

  async function pickImageAndPreview({ title = "Vista previa · Foto del tutor", accept = "image/png,image/jpeg", maxMB = MAX_UPLOAD_MB, onConfirm }) {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = accept;
      input.style.display = "none";
      document.body.appendChild(input);

      input.addEventListener("change", async () => {
        const file = input.files && input.files[0];
        input.remove();
        if (!file) { resolve(null); return; }

        const v = validarImagen(file, maxMB);
        if (!v.ok) { toast(v.error, "error"); resolve(null); return; }

        const openPreview = getOpenImagePreview();
        openPreview({
          file, title, confirm: true,
          onConfirm: async () => {
            try { if (typeof onConfirm === "function") await onConfirm(file); resolve(file); }
            catch (e) { console.error(TAG, "pickImageAndPreview onConfirm", e); toast("No se pudo completar la carga.", "error"); resolve(null); }
          }
        });
      });

      input.click();
    });
  }

  /* ---------- Drawer control ---------- */
  function openTutorDrawer(title, html) {
    const aside = qs("#drawer-tutor");
    const overlay = qs("#gc-dash-overlay");
    if (!aside) return;
    const t = qs("#drawer-tutor-title");
    const b = qs("#drawer-tutor-body");
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
    const aside = qs("#drawer-tutor");
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
  (function bindDrawerOnce() {
    qsa("#drawer-tutor-close").forEach((b) => {
      if (!b._b) { b._b = true; b.addEventListener("click", closeTutorDrawer); }
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

  /* ---------- Búsqueda ---------- */
  function wireSearch() {
    const ph = "Buscar por nombre, descripción o ID…";
    const tip = "Filtra por: nombre, descripción o ID.";
    if (window.gcSearch?.register) {
      if (!window._search_tutores_wired) {
        window._search_tutores_wired = true;
        window.gcSearch.register("#/tutores", (q) => {
          S.search = q || ""; S.page = 1; draw();
        }, { placeholder: ph });
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

  /* ---------- Montaje ---------- */
  async function mount() {
    // Ajusta encabezados de tabla si existen
    const hdr = qs(".recursos-box.desktop-only .table-header");
    if (hdr) {
      hdr.querySelector(".col-nombre") && (hdr.querySelector(".col-nombre").textContent = "Nombre");
      const c2 = hdr.querySelector(".col-fecha") || hdr.querySelector(".col-tipo");
      if (c2) { c2.textContent = "Fecha de creación"; c2.classList.add("col-fecha"); }
      hdr.querySelector(".col-status") && (hdr.querySelector(".col-status").textContent = "Status");
    }
    qs("#mod-title") && (qs("#mod-title").textContent = "Tutores");
    qs(".tt-title")  && (qs(".tt-title").textContent  = "Tutores:");
    const st = qs("#tt-status");
    if (st) { st.textContent = "Todos los estatus"; st.classList.remove("badge-inactivo"); st.classList.add("badge-activo"); }

    wireSearch();
    await load();
  }

  async function openCreate() {
    S.tempNewTutorImage = null;
    openTutorDrawer("Tutor · Crear", renderDrawer({ id: "" }));
  }

  /* ---------- Carga & Listado ---------- */
  async function load() {
    try {
      const chunks = await Promise.all(
        ORDER_TUTORES.map((st) => postJSON(API.tutores, { estatus: st }).catch(() => []))
      );
      const flat = [];
      ORDER_TUTORES.forEach((st, i) => flat.push(...(Array.isArray(chunks[i]) ? chunks[i] : [])));
      S.raw = flat;

      S.data = flat.map((t) => ({
        id: Number(t.id),
        nombre: t.nombre,
        descripcion: t.descripcion || "",
        estatus: Number(t.estatus),
        fecha_creacion: t.fecha_creacion,
        _all: t,
      }));
      if (S.page < 1) S.page = 1;
      draw();
    } catch (e) {
      console.error(TAG, "load error", e);
      toast("No se pudieron cargar tutores", "error");
    }
  }

  function renderPagination(total) {
    const totalPages = Math.max(1, Math.ceil(total / S.pageSize));
    if (S.page > totalPages) S.page = totalPages;

    [qs("#pagination-controls"), qs("#pagination-mobile")].forEach((cont) => {
      if (!cont) return;
      cont.innerHTML = "";
      if (totalPages <= 1) return;

      const mk = (txt, dis, cb, cls = "page-btn") => {
        const b = document.createElement("button");
        b.textContent = txt;
        b.className = cls + (dis ? " disabled" : "");
        if (dis) b.disabled = true; else b.onclick = cb;
        return b;
      };
      cont.appendChild(mk("‹", S.page === 1, () => { S.page = Math.max(1, S.page - 1); draw(); }, "arrow-btn"));
      for (let p = 1; p <= totalPages && p <= 7; p++) {
        const b = mk(String(p), false, () => { S.page = p; draw(); });
        if (p === S.page) b.classList.add("active");
        cont.appendChild(b);
      }
      cont.appendChild(mk("›", S.page === totalPages, () => { S.page = Math.min(totalPages, S.page + 1); draw(); }, "arrow-btn"));
    });
  }

  function draw() {
    const hostD = qs("#recursos-list");
    const hostM = qs("#recursos-list-mobile");
    if (hostD) hostD.innerHTML = "";
    if (hostM) hostM.innerHTML = "";

    const term = norm(S.search);
    const filtered = term
      ? S.data.filter(it =>
          norm(it.nombre).includes(term) ||
          norm(it.descripcion).includes(term) ||
          String(it.id).includes(term))
      : S.data;

    const cnt = qs("#mod-count");
    if (cnt) cnt.textContent = `${filtered.length} ${filtered.length === 1 ? "elemento" : "elementos"}`;

    const totalPages = Math.max(1, Math.ceil(filtered.length / S.pageSize));
    if (S.page > totalPages) S.page = totalPages;
    const start = (S.page - 1) * S.pageSize;
    const pageRows = filtered.slice(start, start + S.pageSize);

    if (!filtered.length) {
      const empty = '<div class="empty-state" style="padding:1rem;">Sin resultados</div>';
      if (hostD) hostD.innerHTML = empty;
      if (hostM) hostM.innerHTML = empty;
      renderPagination(filtered.length);
      return;
    }

    // Desktop
    pageRows.forEach((it) => {
      hostD?.insertAdjacentHTML("beforeend", `
        <div class="table-row" data-id="${it.id}" data-type="tutor">
          <div class="col-nombre"><span class="name-text">${esc(it.nombre)}</span></div>
          <div class="col-fecha">${esc(fmtDateTime(it.fecha_creacion))}</div>
          <div class="col-status">${statusBadge("tutores", it.estatus)}</div>
        </div>
      `);
    });

    // Mobile
    pageRows.forEach((it) => {
      hostM?.insertAdjacentHTML("beforeend", `
        <div class="table-row-mobile" data-id="${it.id}" data-type="tutor">
          <button class="row-toggle">
            <div class="col-nombre">${esc(it.nombre)}</div>
            <span class="icon-chevron">›</span>
          </button>
          <div class="row-details">
            <div><strong>Creado:</strong> ${esc(fmtDateTime(it.fecha_creacion))}</div>
            <div><strong>Status:</strong> ${statusBadge("tutores", it.estatus)}</div>
            <div style="display:flex;gap:8px;margin:.25rem 0 .5rem;">
              <button class="gc-btn gc-btn--ghost open-drawer">Ver detalle</button>
              ${Number(it.estatus) === 0 ? `<button class="gc-btn gc-btn--success gc-reactivate" data-id="${it.id}">Reactivar</button>` : ""}
            </div>
          </div>
        </div>
      `);
    });

    // binds
    qsa("#recursos-list .table-row").forEach((row) => {
      row.addEventListener("click", () => {
        const id = Number(row.dataset.id);
        openTutorDrawer("Tutor · —", renderDrawer({ id: String(id) }));
      });
    });
    qsa("#recursos-list-mobile .open-drawer").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = Number(btn.closest(".table-row-mobile")?.dataset.id || 0);
        openTutorDrawer("Tutor · —", renderDrawer({ id: String(id) }));
      });
    });
    qsa(".gc-reactivate").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = Number(btn.getAttribute("data-id"));
        try { await reactivate(id); toast("Tutor reactivado", "exito"); await load(); }
        catch { toast("No se pudo reactivar", "error"); }
      });
    });

    renderPagination(filtered.length);
  }

  /* ---------- Drawer (view/edit/create) ---------- */
  function renderDrawer(dataset) {
    const item = S.data.find((x) => String(x.id) === String(dataset.id));
    const mode = item ? "view" : "create";
    const isCreate = mode === "create";
    const t = isCreate ? getEmptyTutor() : (item?._all || null);
    if (!t) return "<p>No encontrado.</p>";

    const headActions = (!isCreate && window.isAdminUser !== false) ? `
      <div class="gc-actions" id="tutor-actions-view">
        <button class="gc-btn" id="btn-edit-tutor">Editar</button>
        ${ Number(t.estatus) === 0
            ? `<button class="gc-btn gc-btn--success" id="btn-reactivar-tutor">Reactivar</button>`
            : `<button class="gc-btn gc-btn--danger" id="btn-delete-tutor" data-step="1">Eliminar</button>`}
      </div>` : "";

    const viewHTML = `
      ${headActions}
      <section id="tutor-view" class="mode-view"${isCreate ? " hidden" : ""}>
        <div class="field"><div class="label">Nombre <span class="req">*</span></div><div class="value" id="tv_nombre">${esc(t.nombre)}</div></div>
        <div class="field"><div class="label">Descripción <span class="req">*</span></div><div class="value" id="tv_descripcion">${esc(t.descripcion)}</div></div>
        <div class="grid-3">
          <div class="field"><div class="label">Estatus</div><div class="value" id="tv_estatus">${esc(STATUS_LABEL_TUTOR[t.estatus] ?? "—")}</div></div>
          <div class="field"><div class="label">ID</div><div class="value" id="tv_id">${esc(t.id)}</div></div>
          <div class="field"><div class="label">Fecha creación</div><div class="value" id="tv_fecha_creacion">${esc(fmtDateTime(t.fecha_creacion))}</div></div>
        </div>
        <div class="field">
          <div class="label">Imagen</div>
          <div class="value">
            <div id="media-tutor" data-id="${t.id || item?.id || ""}">
              <div class="media-head"><div class="media-title">Imágenes</div><div class="media-help" style="color:#888;">Solo lectura</div></div>
              <div class="media-grid">
                <div class="media-card">
                  <figure class="media-thumb"><img id="tutor-img-view" alt="Foto" src="${noImageSvgDataURI()}"></figure>
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
          <pre id="json-tutor" class="value" style="white-space:pre-wrap;max-height:260px;overflow:auto;">${esc(JSON.stringify(t, null, 2))}</pre>
        </details>
      </section>
    `;

    const editHTML = `
      <section id="tutor-edit" class="mode-edit"${isCreate ? "" : " hidden"}>
        <div class="field">
          <label for="tf_nombre">Nombre <span class="req">*</span></label>
          <input id="tf_nombre" type="text" value="${esc(t.nombre || "")}" maxlength="120" data-max="120" />
          <small class="char-counter" data-for="tf_nombre"></small>
        </div>
        <div class="field">
          <label for="tf_descripcion">Descripción <span class="req">*</span></label>
          <textarea id="tf_descripcion" rows="8" maxlength="800" data-max="800">${esc(t.descripcion || "")}</textarea>
          <small class="char-counter" data-for="tf_descripcion"></small>
        </div>
        <div class="field">
          <label for="tf_estatus">Estatus</label>
          ${statusSelect("tf_estatus", t.estatus ?? 1, "tutores")}
        </div>
        <div class="field">
          <label>Imagen</label>
          <div class="value">
            <div id="media-tutor-edit" class="media-grid" data-id="${t.id || item?.id || ""}">
              <div class="media-card">
                <figure class="media-thumb">
                  <img alt="Foto" id="tutor-img-edit" src="${noImageSvgDataURI()}">
                  <button class="icon-btn media-edit" id="tutor-pencil" type="button" title="Editar imagen" aria-label="Editar imagen">
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                    </svg>
                  </button>
                </figure>
                <div class="media-meta">
                  <div class="media-label">Foto</div>
                  <div class="media-help gc-soft" id="tutor-img-info">JPG/PNG · Máx ${MAX_UPLOAD_MB}MB</div>
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

    // Pintamos y enlazamos
    setTimeout(async () => {
      const existId = Number(t.id || item?.id || 0);

      // Título + bloqueo de inputs
      const titleEl = qs("#drawer-tutor-title");
      if (isCreate) { titleEl && (titleEl.textContent = "Tutor · Crear"); }
      else { titleEl && (titleEl.textContent = `Tutor · ${item ? item.nombre : ""}`); }
      if (window.disableDrawerInputs) window.disableDrawerInputs(isCreate ? false : true);

      // Botones vista
      qs("#btn-edit-tutor")?.addEventListener("click", () => {
        qs("#drawer-tutor-body").innerHTML = renderDrawer({ id: String(item?.id || "") })
          .replace('class="mode-view"', 'class="mode-view" hidden')
          .replace('class="mode-edit" hidden', 'class="mode-edit"');
        // hacemos un hack rápido: re-render para modo edición
        openTutorDrawer(`Tutor · ${item?.nombre || ""} (edición)`, renderDrawer({ id: String(item?.id || "") }));
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
          if (re) openTutorDrawer("Tutor · " + re.nombre, renderDrawer({ id: String(re.id) }));
        } catch (err) {
          console.error(TAG, "reactivar", err);
          toast("No se pudo reactivar", "error");
        }
      });

      // Guardar / Cancelar (modo creación)
      qs("#btn-cancel-tutor")?.addEventListener("click", () => {
        S.tempNewTutorImage = null;
        closeTutorDrawer();
      });
      qs("#btn-save-tutor")?.addEventListener("click", async () => {
        try { await saveCreate(); } catch (err) { console.error(TAG, "save", err); toast("Error al guardar", "error"); }
      });

      // Imagen en vista
      if (!isCreate) {
        const imgView = qs("#tutor-img-view");
        if (imgView && existId) {
          setImgWithFallback(imgView, tutorImgUrl(existId, "png"), tutorImgUrl(existId, "jpg"), noImageSvgDataURI());
          bindImagePreview(imgView, { title: "Vista previa · Foto del tutor" });
        }
      }

      // Imagen en edición/creación
      const imgEdit = qs("#tutor-img-edit");
      const info   = qs("#tutor-img-info");
      if (imgEdit) {
        if (existId) {
          setImgWithFallback(imgEdit, tutorImgUrl(existId, "png"), tutorImgUrl(existId, "jpg"), noImageSvgDataURI());
        } else if (S.tempNewTutorImage instanceof File) {
          imgEdit.src = withBust(URL.createObjectURL(S.tempNewTutorImage));
        } else {
          imgEdit.src = noImageSvgDataURI();
        }
      }
      const pencil = qs("#tutor-pencil");
      if (pencil && !pencil._b) {
        pencil._b = true;
        pencil.addEventListener("click", async () => {
          await pickImageAndPreview({
            async onConfirm(file) {
              if (!existId) {
                // aún no existe el tutor → buffer
                const url = URL.createObjectURL(file);
                imgEdit && (imgEdit.src = withBust(url));
                S.tempNewTutorImage = file;
                if (info) info.textContent = `Archivo: ${file.name} · ${(file.size/1048576).toFixed(2)} MB (se subirá al guardar)`;
                toast("Imagen lista; se subirá al guardar.", "info");
                return;
              }
              // tutor existente → subida inmediata
              try {
                const res = await uploadTutorImagen(existId, file);
                const url = res?.url || res?.data?.url || res?.location || res?.path;
                if (url) imgEdit && (imgEdit.src = withBust(url));
                else setImgWithFallback(imgEdit, tutorImgUrl(existId, "png"), tutorImgUrl(existId, "jpg"), noImageSvgDataURI());
                if (info) info.textContent = "Imagen actualizada";
                toast("Imagen actualizada", "exito");
              } catch (err) {
                console.error(TAG, "upload tutor img", err);
                toast("No se pudo subir la imagen", "error");
              }
            }
          });
        });
      }

      // Copiar JSON
      if (window.bindCopyFromPre) window.bindCopyFromPre("#json-tutor", "#btn-copy-json-tutor");

      // Cursos ligados
      const tgt = isCreate ? "#tutor-cursos-edit" : "#tutor-cursos";
      renderTutorCursosChips(existId, tgt);

      // Contadores de caracteres
      if (window.gcBindCharCounters) window.gcBindCharCounters(qs("#drawer-tutor-body"));
    }, 0);

    return viewHTML + editHTML;
  }

  function bindImagePreview(el, { title = "Vista previa" } = {}) {
    if (!el || el._previewBound) return;
    el._previewBound = true;
    el.style.cursor = "zoom-in";
    el.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      const src = el.currentSrc || el.getAttribute("src") || "";
      if (!src) return;
      const openPreview = getOpenImagePreview();
      openPreview({ src, confirm: false, title });
    });
  }

  function getEmptyTutor() {
    const uid =
      Number(window.usuario?.id || window.state?.usuario?.id || 1) || 1;
    return { nombre: "", descripcion: "", estatus: 1, creado_por: uid };
  }

  function readFormForCreate() {
    const v = (id) => (qs("#" + id)?.value || "").trim();
    const n = (id) => Number(v(id) || 0);
    const payload = {
      nombre: v("tf_nombre"),
      descripcion: v("tf_descripcion"),
      estatus: n("tf_estatus") || 1,
    };
    // creado_por ya lo pone el backend si lo requiere; agrega si es necesario:
    payload.creado_por = Number(window.usuario?.id || window.state?.usuario?.id || 1) || 1;
    return payload;
  }

  function requireFields(p) {
    const errs = [];
    if (!p.nombre) errs.push("Nombre");
    if (!p.descripcion) errs.push("Descripción");
    if (errs.length) { toast("Campos requeridos: " + errs.join(", "), "warning"); return false; }
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
    let j = null; try { j = JSON.parse(text); } catch { j = { _raw: text }; }
    return j; // dejamos que el caller intente leer j.url / j.data.url ...
  }

  async function saveCreate() {
    const p = readFormForCreate();
    if (!requireFields(p)) return;

    const res = await postJSON(API.iTutores, p);
    const newId = Number(res?.id || res?.tutor_id || res?.insert_id || res?.data?.id || 0);

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
      if (re) openTutorDrawer("Tutor · " + re.nombre, renderDrawer({ id: String(re.id) }));
    }
  }

  /* ---------- Cursos ligados ---------- */
  async function renderTutorCursosChips(tutorId, containerSel = "#tutor-cursos") {
    const host = qs(containerSel);
    if (!host) return;

    try {
      const statuses = [1, 4, 2, 3, 0, 5];
      const chunks = await Promise.all(statuses.map((st) =>
        postJSON(API.cursos, { estatus: st }).catch(() => [])
      ));
      const all = chunks.flat().filter(Boolean);
      const list = all.filter((c) =>
        Number(c.tutor) === Number(tutorId) ||
        Number(c.id_tutor) === Number(tutorId)
      );

      if (!list.length) { host.innerHTML = '<span class="chip-empty">Sin cursos ligados</span>'; return; }

      const orderKey = (v) => ({ 1: 1, 4: 2, 2: 3, 3: 4, 0: 5, 5: 5 }[Number(v)] || 9);
      list.sort((a, b) => orderKey(a.estatus) - orderKey(b.estatus) || String(a.nombre).localeCompare(String(b.nombre)));

      const statusCls = (v) => {
        const n = Number(v);
        if (n === 1) return "s-1";
        if (n === 2) return "s-2";
        if (n === 3) return "s-3";
        if (n === 4) return "s-3";
        return "s-0";
      };

      host.innerHTML = list.map((cr) => `
        <button class="curso-chip ${statusCls(cr.estatus)}" data-id="${cr.id}" aria-label="Abrir curso: ${esc(cr.nombre || "")}" title="${esc(cr.nombre || "")}">
          <img alt="Portada" id="chip-img-${cr.id}">
          <span>${esc((cr.nombre || "").slice(0, 18))}</span>
        </button>
      `).join("");

      list.forEach((cr) => {
        const im = qs(`#chip-img-${cr.id}`, host);
        if (im) setImgWithFallback(im, cursoImgUrl(cr.id, "png"), cursoImgUrl(cr.id, "jpg"), noImageSvgDataURI());
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
      host.innerHTML = '<span class="chip-empty">No fue posible cargar los cursos</span>';
    }
  }

  /* ---------- Mini Drawer de curso ---------- */
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
    if (btn && !btn._b) { btn._b = true; btn.addEventListener("click", closeCursoMiniDrawer); }
  }
  function openCursoMiniDrawer(data) {
    ensureCursoMiniDOM();
    const aside = qs("#drawer-curso-mini");
    const overlay = qs("#gc-dash-overlay");
    const put = (sel, val) => { const el = qs(sel); if (el) el.textContent = val ?? "—"; };

    qs("#drawer-curso-mini-title") && (qs("#drawer-curso-mini-title").textContent = "Curso · " + (data?.nombre || "—"));
    put("#cm_nombre", data?.nombre || "—");
    const STATUS_LABEL = { 1: "Activo", 0: "Inactivo", 2: "Pausado", 3: "Terminado", 4: "En curso", 5: "Cancelado" };
    put("#cm_estatus", STATUS_LABEL[data?.estatus] || String(data?.estatus ?? "—"));
    put("#cm_fecha", data?.fecha_inicio || "—");
    let tutorLabel = data?.tutor ?? "-";
    try {
      tutorLabel = window.gcUtils?.mapLabel?.(window.__CursosState?.maps?.tutores || {}, data?.tutor) || (data?.tutor ?? "-");
    } catch {}
    put("#cm_tutor", String(tutorLabel));

    const img = qs("#cm_img");
    if (img && data?.id) setImgWithFallback(img, cursoImgUrl(data.id, "png"), cursoImgUrl(data.id, "jpg"), noImageSvgDataURI());
    qs("#cm_json") && (qs("#cm_json").textContent = JSON.stringify(data || {}, null, 2));

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
      const ae = document.activeElement; if (ae && aside.contains(ae)) ae.blur();
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

  /* ---------- API pública ---------- */
  window.tutores = { mount, openCreate };

  console.log(TAG, "Módulo tutores cargado.");
})();
