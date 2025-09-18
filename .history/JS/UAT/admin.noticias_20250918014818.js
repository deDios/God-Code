/* ==================== NOTICIAS (UAT) — Listado + Drawer (vista/edición) ==================== */
(() => {
  "use strict";

  const TAG = "[Noticias]";

  /* ---------- Config/API ---------- */
  const API_BASE =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
  const API = {
    noticias:  API_BASE + "c_noticia.php",
    iNoticias: API_BASE + "i_noticia.php",
    uNoticias: API_BASE + "u_noticia.php",
  };
  const API_UPLOAD = { noticiaImg: API_BASE + "u_noticiaImagenes.php" };

  /* ---------- Estado ---------- */
  const S = {
    page: 1,
    pageSize: 7,
    search: "",
    data: [],                 // arreglo de noticias
    current: null,            // { id, _all }
    tempNewImages: { 1: null, 2: null }, // buffer para crear
  };
  window.__NoticiasState = S;

  /* ---------- Status y orden de concatenación ---------- */
  const ORDER_NOTICIAS = [1, 2, 3, 0];   // Activo → Pausa → Temporal → Cancelado
  const STATUS_LABEL = {
    1: "Activo",
    2: "En pausa",
    3: "Temporal",
    0: "Cancelado",
  };

  /* ---------- Utils ---------- */
  const qs  = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [].slice.call(r.querySelectorAll(s));
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => (
      { "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]
    ));

  const fmtDate = (d) => (!d ? "—" : String(d));
  const normalize = (s) =>
    String(s || "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

  function toast(msg, type = "info", ms = 2200) {
    if (window.gcToast) return window.gcToast(msg, type, ms);
    console.log(`${TAG} toast[${type}]:`, msg);
  }

  function getCreatorId() {
    try {
      const raw = document.cookie.split("; ").find((r) => r.startsWith("usuario="));
      if (!raw) { console.warn(TAG, "Cookie 'usuario' no encontrada."); return null; }
      const json = decodeURIComponent(raw.split("=")[1] || "");
      const u = JSON.parse(json);
      console.log(TAG, "usuario(cookie) →", u);
      const n = Number(u?.id);
      if (Number.isFinite(n)) return n;
      console.warn(TAG, "El objeto de cookie no trae id numérico:", u?.id);
      return null;
    } catch (e) {
      console.error(TAG, "getCreatorId() error al leer cookie 'usuario':", e);
      return null;
    }
  }

  async function postJSON(url, body) {
    console.log(TAG, "POST", url, { body });
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    const text = await r.text().catch(() => "");
    console.log(TAG, "HTTP", r.status, "raw:", text);
    if (!r.ok) throw new Error(`HTTP ${r.status} ${text}`);

    try { const j = JSON.parse(text); console.log(TAG, "JSON OK:", j); return j; } catch {}

    // Fallback a recorte {..} / [..]
    const firstBrace = text.indexOf("{");
    const lastBrace  = text.lastIndexOf("}");
    const firstBrack = text.indexOf("[");
    const lastBrack  = text.lastIndexOf("]");
    let candidate = "";
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace)
      candidate = text.slice(firstBrace, lastBrace + 1);
    else if (firstBrack !== -1 && lastBrack !== -1 && lastBrack > firstBrack)
      candidate = text.slice(firstBrack, lastBrack + 1);
    if (candidate) {
      try { const j2 = JSON.parse(candidate); console.warn(TAG, "JSON trimmed:", j2); return j2; } catch {}
    }
    console.warn(TAG, "JSON parse failed; returning _raw");
    return { _raw: text };
  }

  function withBust(u) {
    if (!u || typeof u !== "string" || u.startsWith("data:") || u.startsWith("blob:")) return u;
    try { const url = new URL(u, location.origin); url.searchParams.set("v", Date.now());
      return url.pathname + "?" + url.searchParams.toString();
    } catch { return u + (u.includes("?") ? "&" : "?") + "v=" + Date.now(); }
  }

  /* ---------- Imágenes de noticia ---------- */
  function noticiaImgUrl(id, pos) {
    return `/ASSETS/noticia/NoticiasImg/noticia_img${pos}_${Number(id)}.png`;
  }
  function noImageSvgDataURI() {
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M20 70 L60 35 L95 65 L120 50 L140 70' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }
  async function resolveNoticiaImg(id, pos = 1) {
    const url = withBust(noticiaImgUrl(id, pos));
    const ok = await new Promise((res) => { const i = new Image();
      i.onload = () => res(true); i.onerror = () => res(false); i.src = url; });
    return ok ? url : noImageSvgDataURI();
  }
  async function uploadNoticiaImg(noticiaId, pos, file) {
    console.log(TAG, "uploadNoticiaImg id=", noticiaId, "pos=", pos, file);
    const fd = new FormData();
    fd.append("noticia_id", String(noticiaId));
    fd.append("pos", String(pos));
    fd.append("imagen", file);
    const res  = await fetch(API_UPLOAD.noticiaImg, { method: "POST", body: fd });
    const text = await res.text().catch(() => "");
    console.log(TAG, "upload HTTP", res.status, "raw:", text);
    if (!res.ok) throw new Error("HTTP " + res.status + " " + text);
    const j = JSON.parse(text);
    console.log(TAG, "upload JSON:", j);
    if (!j.ok) throw new Error(j.error || "Upload fallo");
    return j.url; // trae ?v=timestamp
  }

  /* ---------- Drawer helpers ---------- */
  function openDrawerNoticia() {
    console.log(TAG, "openDrawerNoticia()");
    const d = qs("#drawer-noticia"), ov = qs("#gc-dash-overlay");
    if (!d) { console.warn(TAG, "No existe #drawer-noticia en el DOM"); return; }
    d.classList.add("open"); d.removeAttribute("hidden");
    d.setAttribute("aria-hidden", "false"); ov && ov.classList.add("open");
  }
  function closeDrawerNoticia() {
    console.log(TAG, "closeDrawerNoticia()");
    const d = qs("#drawer-noticia"), ov = qs("#gc-dash-overlay");
    if (!d) return;
    d.classList.remove("open"); d.setAttribute("hidden", "");
    d.setAttribute("aria-hidden", "true"); ov && ov.classList.remove("open");
    S.current = null;
  }
  // binds 1 vez
  qsa("#drawer-noticia-close").forEach((b) => { if (!b._b) { b._b = true; b.addEventListener("click", closeDrawerNoticia); }});
  const _ovN = qs("#gc-dash-overlay");
  if (_ovN && !_ovN._bN) { _ovN._bN = true; _ovN.addEventListener("click", closeDrawerNoticia); }
  if (!window._gc_noticias_esc) {
    window._gc_noticias_esc = true;
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawerNoticia(); });
  }

  function setNoticiaDrawerMode(mode) {
    console.log(TAG, "setNoticiaDrawerMode:", mode);
    const v = qs("#noticia-view"), e = qs("#noticia-edit"), act = qs("#noticia-actions-view");
    if (mode === "view") { v && (v.hidden = false); e && (e.hidden = true); act && (act.style.display = ""); }
    else { v && (v.hidden = true); e && (e.hidden = false); act && (act.style.display = "none"); }
  }
  window.setNoticiaDrawerMode = setNoticiaDrawerMode;

  /* ==================== Cargar y renderizar listado ==================== */
  async function loadNoticias() {
    console.log(TAG, "loadNoticias()...");
    const chunks = await Promise.all(
      ORDER_NOTICIAS.map((st) => postJSON(API.noticias, { estatus: st }).catch(() => []))
    );
    const flat = [];
    ORDER_NOTICIAS.forEach((st, i) => { flat.push(...(Array.isArray(chunks[i]) ? chunks[i] : [])); });
    S.data = flat;
    S.page = 1;
    console.log(TAG, "Noticias cargadas:", S.data.length);
    renderNoticias();
  }

  function renderNoticias() {
    console.log(TAG, "renderNoticias() page", S.page, "search=", S.search);
    const hostD = qs("#noticias-list") || qs("#recursos-list");
    const hostM = qs("#noticias-list-mobile") || qs("#recursos-list-mobile");
    if (hostD) hostD.innerHTML = "";
    if (hostM) hostM.innerHTML = "";

    const term = normalize(S.search);
    const filtered = term ? S.data.filter((row) => normalize(JSON.stringify(row)).includes(term)) : S.data;

    // meta
    const modCount = qs("#mod-count");
    if (modCount) {
      const n = filtered.length;
      modCount.textContent = `${n} ${n === 1 ? "elemento" : "elementos"}`;
    }

    // paginación
    const totalPages = Math.max(1, Math.ceil(filtered.length / S.pageSize));
    if (S.page > totalPages) S.page = totalPages;
    const start = (S.page - 1) * S.pageSize;
    const pageRows = filtered.slice(start, start + S.pageSize);

    // Desktop
    if (hostD) {
      if (pageRows.length === 0) {
        hostD.insertAdjacentHTML("beforeend",
          `<div class="table-row"><div class="col-nombre">Sin resultados</div></div>`);
      } else {
        pageRows.forEach((it) => {
          const est = STATUS_LABEL[it.estatus] || it.estatus;
          hostD.insertAdjacentHTML("beforeend", `
            <div class="table-row news-row" role="row" data-id="${it.id}">
              <div class="col-nombre" role="cell">${esc(it.titulo || "-")}</div>
              <div class="col-fecha"  role="cell">${esc(fmtDate(it.fecha_creacion))}</div>
              <div class="col-status" role="cell" data-col="status">${esc(est)}</div>
            </div>
          `);
        });
        qsa(".news-row", hostD).forEach((row) => {
          row.addEventListener("click", () => {
            const id = Number(row.dataset.id);
            console.log(TAG, "click row id=", id);
            if (id) openNoticiaView(id);
          });
        });
      }
    }

    // Mobile
    if (hostM) {
      if (pageRows.length === 0) {
        hostM.insertAdjacentHTML("beforeend",
          `<div class="table-row"><div class="col-nombre">Sin resultados</div></div>`);
      } else {
        pageRows.forEach((it) => {
          hostM.insertAdjacentHTML("beforeend", `
            <div class="table-row-mobile" data-id="${it.id}">
              <div class="row-head">
                <div class="title">${esc(it.titulo || "-")}</div>
                <button class="open-drawer gc-btn" type="button">Ver</button>
              </div>
            </div>
          `);
        });
        qsa(".open-drawer", hostM).forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = Number(btn.closest(".table-row-mobile")?.dataset.id || 0);
            console.log(TAG, "open mobile id=", id);
            if (id) openNoticiaView(id);
          });
        });
      }
    }

    renderPagination(filtered.length);
  }

  function renderPagination(total) {
    const totalPages = Math.max(1, Math.ceil(total / S.pageSize));
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
      cont.appendChild(mk("‹", S.page === 1, () => { S.page = Math.max(1, S.page - 1); renderNoticias(); }, "arrow-btn"));
      for (let p = 1; p <= totalPages && p <= 7; p++) {
        const b = mk(String(p), false, () => { S.page = p; renderNoticias(); });
        if (p === S.page) b.classList.add("active");
        cont.appendChild(b);
      }
      cont.appendChild(mk("›", S.page === totalPages, () => {
        S.page = Math.min(totalPages, S.page + 1); renderNoticias();
      }, "arrow-btn"));
    });
  }

  // búsqueda (bind 1 vez)
  const searchInput = qs("#search-input");
  if (searchInput && !searchInput._bNews) {
    searchInput._bNews = true;
    searchInput.addEventListener("input", (e) => {
      S.search = e.target.value || "";
      S.page = 1;
      renderNoticias();
    });
  }

  /* ==================== Drawer: Vista ==================== */
  function putVal(sel, val) {
    const el = qs(sel);
    if (!el) return;
    const v = (val == null || val === "") ? "—" : String(val);
    el.innerHTML = esc(v);
  }

  async function mountNoticiaMediaView(containerEl, noticiaId) {
    if (!containerEl) return;
    const p1 = await resolveNoticiaImg(noticiaId, 1);
    const p2 = await resolveNoticiaImg(noticiaId, 2);
    containerEl.innerHTML = `
      <div class="media-head">
        <div class="media-title">Imágenes</div>
        <div class="media-help" style="color:#888;">Solo lectura</div>
      </div>
      <div class="media-grid">
        <div class="media-card">
          <figure class="media-thumb"><img alt="Imagen 1" src="${p1}"></figure>
          <div class="media-meta"><div class="media-label">Imagen 1</div></div>
        </div>
        <div class="media-card">
          <figure class="media-thumb"><img alt="Imagen 2" src="${p2}"></figure>
          <div class="media-meta"><div class="media-label">Imagen 2</div></div>
        </div>
      </div>
    `;
  }

  function updateRowStatusCell(id, estatus) {
    const row = document.querySelector(`.table-row[data-id="${id}"]`);
    if (!row) return;
    const cell = row.querySelector('[data-col="status"]');
    if (cell) cell.textContent = STATUS_LABEL[estatus] || estatus;
  }

  function reorderLocalByStatus(id) {
    // Reorganiza S.data para mantener el orden por ORDER_NOTICIAS
    const idx = S.data.findIndex((x) => +x.id === +id);
    if (idx === -1) return;
    const it = S.data[idx];
    S.data.splice(idx, 1);

    const groups = {};
    ORDER_NOTICIAS.forEach((st) => (groups[st] = []));
    S.data.forEach((row) => {
      const st = ORDER_NOTICIAS.includes(+row.estatus) ? +row.estatus : 999;
      (groups[st] ??= []).push(row);
    });
    (groups[+it.estatus] ??= []).unshift(it);

    const flat = [];
    ORDER_NOTICIAS.forEach((st) => flat.push(...groups[st]));
    Object.keys(groups).map(Number).filter((k) => !ORDER_NOTICIAS.includes(k)).sort().forEach((st) => flat.push(...groups[st]));
    S.data = flat;
  }

  function paintNoticiaActions(it) {
    const cont = qs("#noticia-actions-view");
    if (!cont) return;
    cont.innerHTML = "";

    // Botón Editar
    const bEdit = document.createElement("button");
    bEdit.className = "gc-btn";
    bEdit.textContent = "Editar";
    bEdit.addEventListener("click", () => {
      setNoticiaDrawerMode("edit");
      fillNoticiaEdit(S.current ? S.current._all : it);
    });
    cont.appendChild(bEdit);

    // Botón Eliminar/Reactivar
    const btn = document.createElement("button");
    const isInactive = +it.estatus === 0;
    btn.className = isInactive ? "gc-btn gc-btn--success" : "gc-btn gc-btn--danger";
    btn.textContent = isInactive ? "Reactivar" : "Eliminar";
    btn.dataset.confirm = "0";

    let confirmTimer = null;
    btn.addEventListener("click", async () => {
      if (!isInactive && btn.dataset.confirm !== "1") {
        btn.dataset.confirm = "1";
        const old = btn.textContent;
        btn.textContent = "¿Confirmar?";
        if (confirmTimer) clearTimeout(confirmTimer);
        confirmTimer = setTimeout(() => {
          btn.dataset.confirm = "0";
          btn.textContent = old;
        }, 3000);
        return;
      }

      btn.disabled = true;
      try {
        const nuevoStatus = isInactive ? 1 : 0;

        // Optimista
        const prev = it.estatus;
        it.estatus = nuevoStatus;
        updateRowStatusCell(it.id, it.estatus);
        paintNoticiaActions(it);

        const ok = await updateNoticiaStatus(it.id, nuevoStatus);
        if (!ok) {
          it.estatus = prev;
          updateRowStatusCell(it.id, it.estatus);
          paintNoticiaActions(it);
          return;
        }

        toast(isInactive ? "Noticia reactivada" : "Noticia cancelada", "exito");
        reorderLocalByStatus(it.id);
        renderNoticias();
        fillNoticiaView(it); // refresca vista
      } finally {
        btn.disabled = false;
        btn.dataset.confirm = "0";
        if (confirmTimer) { clearTimeout(confirmTimer); confirmTimer = null; }
      }
    });

    cont.appendChild(btn);
  }

  async function fillNoticiaView(n) {
    console.log(TAG, "fillNoticiaView id=", n?.id, n);
    const title = qs("#drawer-noticia-title");
    if (title) title.textContent = "Noticia · " + (n.titulo || "—");

    putVal("#nv_titulo", n.titulo);
    putVal("#nv_desc_uno", n.desc_uno);
    putVal("#nv_desc_dos", n.desc_dos);
    putVal("#nv_estatus", STATUS_LABEL[n.estatus] || n.estatus);
    putVal("#nv_creado_por", n.creado_por);
    putVal("#nv_fecha_creacion", n.fecha_creacion);

    await mountNoticiaMediaView(qs("#media-noticia"), n.id);

    const pre = qs("#json-noticia");
    if (pre) pre.textContent = JSON.stringify(n, null, 2);

    paintNoticiaActions(n);
  }

  async function openNoticiaView(id) {
    const it = (S.data || []).find((x) => +x.id === +id);
    console.log(TAG, "openNoticiaView id=", id, "found:", !!it);
    if (!it) return;
    S.current = { id: it.id, _all: it };
    openDrawerNoticia();
    setNoticiaDrawerMode("view");
    await fillNoticiaView(it);
  }
  window.openNoticiaView = openNoticiaView;

  /* ==================== Drawer: Edición/Creación ==================== */
  function setVal(id, v) { const el = qs("#" + id); if (el) el.value = v == null ? "" : String(v); }
  function val(id) { return (qs("#" + id)?.value || "").trim(); }
  function num(id) { const v = val(id); return v === "" ? null : Number(v); }

  function putNoticiaStatus(selectId, sel) {
    const el = qs("#" + selectId);
    if (!el) return;
    const opts = [
      { v: 1, l: "Activo" },
      { v: 2, l: "En pausa" },
      { v: 3, l: "Temporal" },
      { v: 0, l: "Cancelado" },
    ];
    el.innerHTML = opts.map(o =>
      `<option value="${o.v}"${+o.v === +sel ? " selected" : ""}>${o.l}</option>`
    ).join("");
  }

  function validarImagen(file, maxMB = 2) {
    if (!file) return { ok: false, error: "No seleccionaste archivo." };
    if (!/image\/(png|jpeg)/.test(file.type))
      return { ok: false, error: "Formato no permitido. Usa JPG o PNG." };
    if (file.size > maxMB * 1048576)
      return { ok: false, error: `La imagen excede ${maxMB}MB.` };
    return { ok: true };
  }

  function mountNoticiaMediaEdit(containerEl, noticiaId) {
    if (!containerEl) return;
    containerEl.innerHTML = `
      <div class="media-head">
        <div class="media-title">Imágenes</div>
        <div class="media-help">JPG/PNG · Máx 2MB</div>
      </div>
      <div class="media-grid">
        <div class="media-card">
          <figure class="media-thumb">
            <img alt="Imagen 1" id="noticia-img1-edit" loading="eager" src="">
            <button class="icon-btn media-edit" data-pos="1" type="button" title="Editar imagen 1" aria-label="Editar imagen 1">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"></path>
              </svg>
            </button>
          </figure>
          <div class="media-meta"><div class="media-label">Imagen 1</div></div>
        </div>
        <div class="media-card">
          <figure class="media-thumb">
            <img alt="Imagen 2" id="noticia-img2-edit" loading="eager" src="">
            <button class="icon-btn media-edit" data-pos="2" type="button" title="Editar imagen 2" aria-label="Editar imagen 2">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"></path>
              </svg>
            </button>
          </figure>
          <div class="media-meta"><div class="media-label">Imagen 2</div></div>
        </div>
      </div>
    `;

    const img1 = containerEl.querySelector("#noticia-img1-edit");
    const img2 = containerEl.querySelector("#noticia-img2-edit");

    if (noticiaId) {
      (async () => {
        img1.src = await resolveNoticiaImg(noticiaId, 1);
        img2.src = await resolveNoticiaImg(noticiaId, 2);
      })();
      img1.onerror = () => (img1.src = noImageSvgDataURI());
      img2.onerror = () => (img2.src = noImageSvgDataURI());
    } else {
      // crear
      img1.src = noImageSvgDataURI();
      img2.src = noImageSvgDataURI();
      if (S.tempNewImages[1] instanceof File) img1.src = URL.createObjectURL(S.tempNewImages[1]);
      if (S.tempNewImages[2] instanceof File) img2.src = URL.createObjectURL(S.tempNewImages[2]);
    }

    qsa(".media-edit", containerEl).forEach((btn) => {
      if (btn._b) return;
      btn._b = true;
      btn.addEventListener("click", () => {
        const pos = Number(btn.dataset.pos || 1);
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/png,image/jpeg";
        input.style.display = "none";
        document.body.appendChild(input);
        input.addEventListener("change", async () => {
          const file = input.files && input.files[0];
          input.remove();
          if (!file) return;
          const v = validarImagen(file, 2);
          if (!v.ok) { toast(v.error, "error"); return; }

          const targetImg = pos === 1 ? img1 : img2;

          if (!noticiaId) {
            // crear: previsualiza y almacena en buffer
            const url = URL.createObjectURL(file);
            targetImg.src = withBust(url);
            S.tempNewImages[pos] = file;
            toast("Imagen lista; se subirá al guardar.", "info");
            return;
          }

          // editar: sube inmediata
          try {
            const newUrl = await uploadNoticiaImg(noticiaId, pos, file);
            targetImg.src = withBust(newUrl);
            toast("Imagen actualizada", "exito");
          } catch (err) {
            console.error(TAG, "upload error", err);
            toast("No se pudo subir la imagen", "error");
          }
        });
        input.click();
      });
    });
  }

  function fillNoticiaEdit(n) {
    console.log(TAG, "fillNoticiaEdit()", n);

    const model = (S.current && S.current._all && (+S.current.id === +n.id || n.id == null))
      ? S.current._all : n || {};

    setVal("nf_titulo",   model.titulo);
    setVal("nf_desc_uno", model.desc_uno);
    setVal("nf_desc_dos", model.desc_dos);
    putNoticiaStatus("nf_estatus", model.estatus ?? 1);

    mountNoticiaMediaEdit(qs("#media-noticia-edit"), model.id);

    // Rebind seguro
    const bSave = qs("#btn-save-noticia");
    if (bSave) { const clone = bSave.cloneNode(true); bSave.replaceWith(clone); clone.addEventListener("click", saveNoticia); }
    const bCancel = qs("#btn-cancel-noticia");
    if (bCancel) { const c = bCancel.cloneNode(true); bCancel.replaceWith(c);
      c.addEventListener("click", () => {
        setNoticiaDrawerMode("view");
        fillNoticiaView(S.current ? S.current._all : model);
      });
    }
    console.log(TAG, "fillNoticiaEdit() bound and filled.");
  }
  window.fillNoticiaEdit = fillNoticiaEdit;

  async function updateNoticiaStatus(id, estatus, extra = {}) {
    if (!id) return false;
    try {
      const payload = Object.assign({ id: Number(id), estatus: Number(estatus) }, extra);
      console.log(TAG, "updateNoticiaStatus →", payload);
      const res = await postJSON(API.uNoticias, payload);
      console.log(TAG, "updateNoticiaStatus respuesta:", res);
      if (res && res.error) { toast(res.error, "error"); return false; }
      return true;
    } catch (err) {
      console.error(TAG, "updateNoticiaStatus ERROR:", err);
      toast("No se pudo actualizar el estatus.", "error");
      return false;
    }
  }

  async function saveNoticia() {
    const titulo   = (qs("#nf_titulo")?.value || "").trim();
    const desc_uno = (qs("#nf_desc_uno")?.value || "").trim();
    const desc_dos = (qs("#nf_desc_dos")?.value || "").trim();
    const estatus  = Number(qs("#nf_estatus")?.value || 1);

    const body = {
      id: S.current?.id ?? null,
      titulo, desc_uno, desc_dos, estatus,
    };
    console.log(TAG, "saveNoticia() body=", body);

    if (!body.titulo || !body.desc_uno) {
      toast("Título y Descripción 1 son obligatorios.", "error");
      return;
    }

    try {
      let newId = body.id;

      if (body.id == null) {
        const creado_por = getCreatorId();
        if (creado_por == null) {
          toast("No se puede crear: falta el id de usuario (creado_por).", "error");
          return;
        }
        const insertBody = { ...body, creado_por };
        console.log(TAG, "Insertando noticia con:", insertBody);
        const res = await postJSON(API.iNoticias, insertBody);
        console.log(TAG, "Respuesta insert:", res);
        if (res && res.error) { toast(res.error, "error"); return; }
        const idCand = res?.id ?? res?.noticia_id ?? res?.insert_id ?? res?.data?.id;
        newId = Number(idCand || 0);

        // subida diferida de imágenes
        if (newId) {
          for (const pos of [1, 2]) {
            const file = S.tempNewImages[pos];
            if (file instanceof File) {
              try {
                const url = await uploadNoticiaImg(newId, pos, file);
                console.log(TAG, "Imagen subida pos", pos, url);
              } catch (e) {
                console.error(TAG, "Upload diferido pos", pos, "falló:", e);
                toast(`Noticia creada, pero la imagen ${pos} no se pudo subir.`, "error");
              } finally {
                S.tempNewImages[pos] = null;
              }
            }
          }
        }
      } else {
        console.log(TAG, "Actualizando noticia id=", body.id);
        const resU = await postJSON(API.uNoticias, body);
        console.log(TAG, "Respuesta update:", resU);
        if (resU && resU.error) { toast(resU.error, "error"); return; }
      }

      toast("Noticia guardada", "exito");

      await loadNoticias(); // refresca tabla
      const idToOpen = newId || body.id;
      const it = (S.data || []).find((x) => +x.id === +idToOpen) || S.data[0];
      if (it) {
        S.current = { id: it.id, _all: it };
        setNoticiaDrawerMode("view");
        await fillNoticiaView(it);
      } else {
        closeDrawerNoticia();
      }
    } catch (err) {
      console.error(TAG, "saveNoticia ERROR:", err);
      toast("No se pudo guardar.", "error");
    }
  }
  window.saveNoticia = saveNoticia;

  /* ==================== API pública (router-lite) ==================== */
  async function mount() {
    console.log(TAG, "mount() INICIO");
    try {
      const hostD = qs("#noticias-list") || qs("#recursos-list");
      if (hostD) hostD.innerHTML = `<div class="table-row"><div class="col-nombre">Cargando…</div></div>`;
      await loadNoticias();

      const s = qs("#search-input");
      if (s && !s._bNews) {
        s._bNews = true;
        s.addEventListener("input", (e) => {
          S.search = e.target.value || "";
          S.page = 1;
          renderNoticias();
        });
      }
      console.log(TAG, "mount() OK");
    } catch (e) {
      console.error(TAG, "mount() ERROR:", e);
      const hostD = qs("#noticias-list");
      if (hostD) hostD.innerHTML = `<div class="table-row"><div class="col-nombre">Error cargando noticias</div></div>`;
    }
  }

  function openNoticiaCreate() {
    console.log(TAG, "openNoticiaCreate()");
    const blank = {
      id: null,
      titulo: "",
      desc_uno: "",
      desc_dos: "",
      estatus: 1,
      fecha_creacion: "",
      fecha_modif: "",
      creado_por: getCreatorId() ?? "",
    };
    S.current = { id: null, _all: blank };
    openDrawerNoticia();
    setNoticiaDrawerMode("edit");
    fillNoticiaEdit(blank);
  }

  window.noticias = { mount, openCreate: openNoticiaCreate };

  console.log(TAG, "Módulo noticias cargado.");
})();
