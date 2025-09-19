/* ==================== NOTICIAS ==================== */
(() => {
  "use strict";

  const TAG = "[Noticias]";

  /* ---------- Config/API ---------- */
  const API_BASE =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
  const API = {
    noticias: API_BASE + "c_noticia.php",
    iNoticias: API_BASE + "i_noticia.php",
    uNoticias: API_BASE + "u_noticia.php",
  };
  const API_UPLOAD = { noticiaImg: API_BASE + "u_noticiaImagenes.php" };

  /* ---------- Estado ---------- */
  const S = {
    page: 1,
    pageSize: 7,
    search: "",
    data: [], // arreglo de noticias
    current: null, // { id, _all }
    tempNewImages: { 1: null, 2: null }, // buffer para crear
  };
  window.__NoticiasState = S;

  /* ---------- Status y orden ---------- */
  // Arriba→abajo: Activo → En pausa → Temporal → Cancelado
  const ORDER_NOTICIAS = [1, 2, 3, 0, 4];
  const STATUS_LABEL = {
    1: "Activo",
    2: "En pausa",
    3: "Temporal",
    0: "inactivo",
    4: "Cancelado",
  };

  /* ---------- Utils ---------- */
  // --- Limite de subida
  const MAX_UPLOAD_MB = 10;
  const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

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
  const fmtDate = (d) => (!d ? "—" : String(d));
  const normalize = (s) =>
    String(s || "")
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .trim();

  function toast(msg, type = "info", ms = 2200) {
    if (window.gcToast) return window.gcToast(msg, type, ms);
    console.log(`${TAG} toast[${type}]:`, msg);
  }

  function getCreatorId() {
    try {
      const raw = document.cookie
        .split("; ")
        .find((r) => r.startsWith("usuario="));
      if (!raw) return null;
      const json = decodeURIComponent(raw.split("=")[1] || "");
      const u = JSON.parse(json);
      const n = Number(u?.id);
      return Number.isFinite(n) ? n : null;
    } catch {
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

    try {
      const j = JSON.parse(text);
      console.log(TAG, "JSON OK:", j);
      return j;
    } catch {}

    // Fallback: recorta bloque JSON {..} o [..]
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    const firstBrack = text.indexOf("[");
    const lastBrack = text.lastIndexOf("]");
    let candidate = "";
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace)
      candidate = text.slice(firstBrace, lastBrace + 1);
    else if (firstBrack !== -1 && lastBrack !== -1 && lastBrack > firstBrack)
      candidate = text.slice(firstBrack, lastBrack + 1);
    if (candidate) {
      try {
        const j2 = JSON.parse(candidate);
        console.warn(TAG, "JSON trimmed:", j2);
        return j2;
      } catch {}
    }
    console.warn(TAG, "JSON parse failed; returning _raw");
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

  /* ---------- Imágenes de noticia ---------- */
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
      const ok = await new Promise((res) => {
        const i = new Image();
        i.onload = () => res(true);
        i.onerror = () => res(false);
        i.src = url;
      });
      return ok ? url : null;
    };
    return (
      (await tryUrl("png")) || (await tryUrl("jpg")) || noImageSvgDataURI()
    );
  }

  /* ---------- Overlay de preview ---------- */
  function humanSize(bytes) {
    if (!Number.isFinite(bytes)) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(2) + " MB";
  }
  function openImagePreview({
    src,
    file,
    title = "Vista previa de imagen",
    confirm = false,
    onConfirm,
  }) {
    const ov = document.createElement("div");
    ov.className = "gc-preview-overlay";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-modal", "true");
    Object.assign(ov.style, {
      position: "fixed",
      inset: "0",
      zIndex: "99999",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(17,24,39,.55)",
      backdropFilter: "saturate(120%) blur(2px)",
    });

    const modal = document.createElement("div");
    modal.className = "gc-preview-modal";
    Object.assign(modal.style, {
      background: "#fff",
      borderRadius: "14px",
      boxShadow: "0 20px 40px rgba(0,0,0,.25)",
      width: "min(920px,94vw)",
      maxHeight: "90vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    });

    const head = document.createElement("div");
    Object.assign(head.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "8px",
      padding: "12px 16px",
      borderBottom: "1px solid #eee",
    });
    head.innerHTML = `<div style="font-weight:700;font-size:1.05rem;">${esc(
      title
    )}</div>
      <button class="gc-btn gc-btn--ghost" data-act="close" aria-label="Cerrar" style="min-width:auto;padding:.35rem .6rem;">✕</button>`;

    const body = document.createElement("div");
    Object.assign(body.style, {
      display: "grid",
      gridTemplateColumns: "1fr 280px",
      gap: "16px",
      padding: "16px",
      alignItems: "start",
    });

    const left = document.createElement("div");
    Object.assign(left.style, {
      border: "1px solid #eee",
      borderRadius: "12px",
      padding: "8px",
      background: "#fafafa",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "320px",
      maxHeight: "60vh",
    });
    const img = document.createElement("img");
    img.alt = "Vista previa";
    Object.assign(img.style, {
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "contain",
      borderRadius: "8px",
    });
    img.src = src || (file ? URL.createObjectURL(file) : "");
    left.appendChild(img);

    const right = document.createElement("div");
    Object.assign(right.style, {
      borderLeft: "1px dashed #e6e6e6",
      paddingLeft: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    });
    right.innerHTML = `
      <div style="font-weight:600;">Detalles</div>
      <div style="font-size:.92rem;color:#444;line-height:1.35;">
        ${
          file
            ? `<div><strong>Archivo:</strong> ${esc(file.name || "-")}</div>
               <div><strong>Peso:</strong> ${humanSize(file.size || 0)}</div>
               <div><strong>Tipo:</strong> ${esc(file.type || "-")}</div>`
            : `<div style="color:#666;">Solo lectura</div>`
        }
        <div style="margin-top:6px;color:#666;">Formatos permitidos: JPG / PNG · Máx ${MAX_UPLOAD_MB}MB</div>
      </div>
      <div style="margin-top:auto;display:flex;gap:8px;flex-wrap:wrap;">
        ${
          confirm
            ? `<button class="gc-btn gc-btn--primary" data-act="confirm">Subir</button>`
            : ``
        }
        <button class="gc-btn gc-btn--ghost" data-act="cancel">Cerrar</button>
      </div>
    `;

    body.append(left, right);
    modal.append(head, body);
    ov.appendChild(modal);
    document.body.appendChild(ov);

    const close = () => {
      try {
        document.activeElement && document.activeElement.blur();
      } catch {}
      ov.remove();
      if (file && img.src.startsWith("blob:")) URL.revokeObjectURL(img.src);
    };
    ov.addEventListener("click", (e) => {
      if (e.target === ov) close();
    });
    ov.querySelector('[data-act="close"]')?.addEventListener("click", close);
    ov.querySelector('[data-act="cancel"]')?.addEventListener("click", close);
    ov.querySelector('[data-act="confirm"]')?.addEventListener(
      "click",
      async () => {
        try {
          if (typeof onConfirm === "function") await onConfirm();
        } finally {
          close();
        }
      }
    );

    return { close };
  }

  async function uploadNoticiaImg(noticiaId, pos, file) {
    console.log(TAG, "uploadNoticiaImg id=", noticiaId, "pos=", pos, file);
    const fd = new FormData();
    fd.append("noticia_id", String(noticiaId));
    fd.append("pos", String(pos));
    fd.append("imagen", file);
    const res = await fetch(API_UPLOAD.noticiaImg, {
      method: "POST",
      body: fd,
    });
    const text = await res.text().catch(() => "");
    console.log(TAG, "upload HTTP", res.status, "raw:", text);
    if (!res.ok) throw new Error("HTTP " + res.status + " " + text);
    const j = JSON.parse(text);
    console.log(TAG, "upload JSON:", j);
    if (!j.ok) throw new Error(j.error || "Upload fallo");
    return j.url;
  }

  /* ---------- Drawer helpers ---------- */
  function openDrawerNoticia() {
    console.log(TAG, "openDrawerNoticia()");
    const d = qs("#drawer-noticia"),
      ov = qs("#gc-dash-overlay");
    if (!d) {
      console.warn(TAG, "No existe #drawer-noticia en el DOM");
      return;
    }
    d.classList.add("open");
    d.removeAttribute("hidden");
    d.setAttribute("aria-hidden", "false");
    if (ov) {
      ov.classList.add("open");
      ov.hidden = false;
      ov.setAttribute("aria-hidden", "false");
      if (!ov._b_news) {
        ov._b_news = true;
        ov.addEventListener("click", closeDrawerNoticia);
      }
    }
    qsa("#drawer-noticia-close").forEach((b) => {
      if (!b._b) {
        b._b = true;
        b.addEventListener("click", (e) => {
          e.preventDefault();
          closeDrawerNoticia();
        });
      }
    });
    if (!window._gc_noticias_esc) {
      window._gc_noticias_esc = true;
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeDrawerNoticia();
      });
    }
  }
  function closeDrawerNoticia() {
    console.log(TAG, "closeDrawerNoticia()");
    const d = qs("#drawer-noticia"),
      ov = qs("#gc-dash-overlay");
    if (!d) return;
    try {
      const ae = document.activeElement;
      if (ae && d.contains(ae)) ae.blur();
    } catch {}
    d.classList.remove("open");
    d.setAttribute("hidden", "");
    d.setAttribute("aria-hidden", "true");
    if (ov) {
      ov.classList.remove("open");
      ov.hidden = true;
      ov.setAttribute("aria-hidden", "true");
    }
    S.current = null;
  }

  function setNoticiaDrawerMode(mode) {
    console.log(TAG, "setNoticiaDrawerMode:", mode);
    const v = qs("#noticia-view"),
      e = qs("#noticia-edit"),
      act = qs("#noticia-actions-view");
    if (mode === "view") {
      v && (v.hidden = false);
      e && (e.hidden = true);
      act && (act.style.display = "");
    } else {
      v && (v.hidden = true);
      e && (e.hidden = false);
      act && (act.style.display = "none");
    }
  }
  window.setNoticiaDrawerMode = setNoticiaDrawerMode;

  /* ---------- Resort ---------- */
  function resortList() {
    const rank = new Map(ORDER_NOTICIAS.map((st, i) => [String(st), i]));
    S.data.sort((a, b) => {
      const ra = rank.get(String(a.estatus)) ?? 999;
      const rb = rank.get(String(b.estatus)) ?? 999;
      if (ra !== rb) return ra - rb;
      return String(a.titulo || "").localeCompare(String(b.titulo || ""));
    });
  }

  /* ==================== Cargar y renderizar listado ==================== */
  async function loadNoticias() {
    console.log(TAG, "loadNoticias()...");
    const chunks = await Promise.all(
      ORDER_NOTICIAS.map((st) =>
        postJSON(API.noticias, { estatus: st }).catch(() => [])
      )
    );
    const flat = [];
    ORDER_NOTICIAS.forEach((st, i) =>
      flat.push(...(Array.isArray(chunks[i]) ? chunks[i] : []))
    );
    S.data = flat;
    S.page = 1;
    resortList();
    console.log(TAG, "Noticias cargadas:", S.data.length);
    renderNoticias();
  }

  function statusText(estatus) {
    return STATUS_LABEL[estatus] ?? estatus;
  }

  function renderNoticias() {
    console.log(TAG, "renderNoticias() page", S.page, "search=", S.search);
    const hostD = qs("#noticias-list") || qs("#recursos-list");
    const hostM = qs("#noticias-list-mobile") || qs("#recursos-list-mobile");
    if (hostD) hostD.innerHTML = "";
    if (hostM) hostM.innerHTML = "";

    const term = normalize(S.search);
    const filtered = term
      ? S.data.filter((row) =>
          normalize(
            `${row.titulo} ${row.desc_uno} ${row.desc_dos} ${row.estatus} ${row.fecha_creacion}`
          ).includes(term)
        )
      : S.data;

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
        hostD.insertAdjacentHTML(
          "beforeend",
          `<div class="table-row"><div class="col-nombre">Sin resultados</div></div>`
        );
      } else {
        pageRows.forEach((it) => {
          const statusHTML = window.statusBadge
            ? window.statusBadge("noticias", it.estatus)
            : esc(statusText(it.estatus));
          hostD.insertAdjacentHTML(
            "beforeend",
            `
            <div class="table-row news-row" role="row" data-id="${it.id}">
              <div class="col-nombre" role="cell">${esc(it.titulo || "-")}</div>
              <div class="col-fecha"  role="cell">${esc(
                fmtDate(it.fecha_creacion)
              )}</div>
              <div class="col-status" role="cell" data-col="status">${statusHTML}</div>
            </div>
          `
          );
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

    // Mobile (todavia no esta terminado)
    if (hostM) {
      if (pageRows.length === 0) {
        hostM.insertAdjacentHTML(
          "beforeend",
          `<div class="table-row"><div class="col-nombre">Sin resultados</div></div>`
        );
      } else {
        pageRows.forEach((it) => {
          hostM.insertAdjacentHTML(
            "beforeend",
            `
            <div class="table-row-mobile" data-id="${it.id}">
              <div class="row-head">
                <div class="title">${esc(it.titulo || "-")}</div>
                <button class="open-drawer gc-btn" type="button">Ver</button>
              </div>
            </div>
          `
          );
        });
        qsa(".open-drawer", hostM).forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = Number(
              btn.closest(".table-row-mobile")?.dataset.id || 0
            );
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
        if (dis) b.disabled = true;
        else b.onclick = cb;
        return b;
      };
      cont.appendChild(
        mk(
          "‹",
          S.page === 1,
          () => {
            S.page = Math.max(1, S.page - 1);
            renderNoticias();
          },
          "arrow-btn"
        )
      );
      for (let p = 1; p <= totalPages && p <= 7; p++) {
        const b = mk(String(p), false, () => {
          S.page = p;
          renderNoticias();
        });
        if (p === S.page) b.classList.add("active");
        cont.appendChild(b);
      }
      cont.appendChild(
        mk(
          "›",
          S.page === totalPages,
          () => {
            S.page = Math.min(totalPages, S.page + 1);
            renderNoticias();
          },
          "arrow-btn"
        )
      );
    });
  }

  /* ---------- Búsqueda: gcSearch si existe, si no fallback ---------- */
  function wireSearch() {
    const ph = "Buscar por título, descripción o estatus…";
    const tip =
      "Filtra por: título, descripción (1/2) o estatus (Activo, En pausa, Temporal, Cancelado).";
    if (window.gcSearch?.register) {
      if (!window._search_noticias_wired) {
        window._search_noticias_wired = true;
        window.gcSearch.register(
          "#/noticias",
          (q) => {
            S.search = q || "";
            S.page = 1;
            renderNoticias();
          },
          { placeholder: ph }
        );
        const inp = document.querySelector("#search-input");
        if (inp) inp.title = tip;
      }
    } else {
      const s = qs("#search-input");
      if (s && !s._bNews) {
        s._bNews = true;
        s.placeholder = ph;
        s.title = tip;
        s.addEventListener("input", (e) => {
          S.search = e.target.value || "";
          S.page = 1;
          renderNoticias();
        });
      }
    }
  }

  /* ==================== Drawer: Vista ==================== */
  function putVal(sel, val) {
    const el = qs(sel);
    if (!el) return;
    el.innerHTML = esc(val == null || val === "" ? "—" : String(val));
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
          <figure class="media-thumb"><img alt="Imagen 1" id="noticia-img-1-view" src="${p1}"></figure>
          <div class="media-meta"><div class="media-label">Imagen 1</div></div>
        </div>
        <div class="media-card">
          <figure class="media-thumb"><img alt="Imagen 2" id="noticia-img-2-view" src="${p2}"></figure>
          <div class="media-meta"><div class="media-label">Imagen 2</div></div>
        </div>
      </div>
    `;
    const i1 = containerEl.querySelector("#noticia-img-1-view");
    const i2 = containerEl.querySelector("#noticia-img-2-view");
    [i1, i2].forEach((img, idx) => {
      if (!img) return;
      img.onerror = () => {
        img.onerror = null;
        img.src = noImageSvgDataURI();
      };
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => {
        openImagePreview({
          src: img.src,
          confirm: false,
          title: `Vista previa · Imagen ${idx + 1}`,
        });
      });
    });
  }

  function updateRowStatusCell(id, estatus) {
    const row = document.querySelector(`.table-row[data-id="${id}"]`);
    if (!row) return;
    const cell = row.querySelector('[data-col="status"]');
    if (cell) {
      if (window.statusBadge)
        cell.innerHTML = window.statusBadge("noticias", estatus);
      else cell.textContent = statusText(estatus);
    }
  }

  function paintNoticiaActions(it) {
    const cont = qs("#noticia-actions-view");
    if (!cont) return;
    cont.innerHTML = "";

    // Editar
    const bEdit = document.createElement("button");
    bEdit.className = "gc-btn";
    bEdit.textContent = "Editar";
    bEdit.addEventListener("click", () => {
      setNoticiaDrawerMode("edit");
      fillNoticiaEdit(S.current ? S.current._all : it);
    });
    cont.appendChild(bEdit);

    // Eliminar/Reactivar
    const isInactive = +it.estatus === 0;
    const btn = document.createElement("button");
    btn.className = isInactive
      ? "gc-btn gc-btn--success"
      : "gc-btn gc-btn--danger";
    btn.textContent = isInactive ? "Reactivar" : "Eliminar";
    btn.dataset.confirm = "0";
    cont.appendChild(btn);

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

        // Optimismo
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
        resortList();
        renderNoticias();
        fillNoticiaView(it);
      } finally {
        btn.disabled = false;
        btn.dataset.confirm = "0";
        if (confirmTimer) {
          clearTimeout(confirmTimer);
          confirmTimer = null;
        }
      }
    });
  }

  async function fillNoticiaView(n) {
    console.log(TAG, "fillNoticiaView id=", n?.id, n);
    const title = qs("#drawer-noticia-title");
    if (title) title.textContent = "Noticia · " + (n.titulo || "—");

    putVal("#nv_titulo", n.titulo);
    putVal("#nv_desc_uno", n.desc_uno);
    putVal("#nv_desc_dos", n.desc_dos);
    putVal("#nv_estatus", statusText(n.estatus));
    putVal("#nv_creado_por", n.creado_por);
    putVal("#nv_fecha_creacion", n.fecha_creacion);

    await mountNoticiaMediaView(qs("#media-noticia"), n.id);

    const pre = qs("#json-noticia");
    if (pre) pre.textContent = JSON.stringify(n, null, 2);

    // Copiar JSON
    const btnCopy = qs("#btn-copy-json-noticia");
    if (btnCopy && !btnCopy._b) {
      btnCopy._b = true;
      btnCopy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(JSON.stringify(n, null, 2));
          toast("JSON copiado", "exito");
        } catch {
          toast("No se pudo copiar el JSON", "error");
        }
      });
    }

    paintNoticiaActions(n);
  }
  window.fillNoticiaView = fillNoticiaView;

  async function openNoticiaView(id) {
    if (window.__activeModule && window.__activeModule !== "noticias") {
      console.log(
        TAG,
        "openNoticiaView ignorado; módulo activo:",
        window.__activeModule
      );
      return;
    }
    const it = (S.data || []).find((x) => +x.id === +id);
    console.log(TAG, "openNoticiaView id=", id, "found:", !!it);
    if (!it) return;
    S.current = { id: it.id, _all: it };
    openDrawerNoticia();
    setNoticiaDrawerMode("view");
    await fillNoticiaView(it);
  }
  window.openNoticiaView = openNoticiaView;

  /* ==================== Drawer: Edicion/Creacion ==================== */
  function setVal(id, v) {
    const el = qs("#" + id);
    if (el) el.value = v == null ? "" : String(v);
  }
  function val(id) {
    return (qs("#" + id)?.value || "").trim();
  }
  function num(id) {
    const v = val(id);
    return v === "" ? null : Number(v);
  }

  function putNoticiaStatus(selectId, sel) {
    const el = qs("#" + selectId);
    if (!el) return;
    const opts = [
      { v: 1, l: "Activo" },
      { v: 2, l: "En pausa" },
      { v: 3, l: "Temporal" },
      { v: 0, l: "Cancelado" },
    ];
    el.innerHTML = opts
      .map(
        (o) =>
          `<option value="${o.v}"${+o.v === +sel ? " selected" : ""}>${
            o.l
          }</option>`
      )
      .join("");
  }

  function validarImagen(file, maxMB = MAX_UPLOAD_MB) {
    if (!file) return { ok: false, error: "No seleccionaste archivo." };
    if (!/image\/(png|jpeg)/.test(file.type))
      return { ok: false, error: "Formato no permitido. Usa JPG o PNG." };
    if (
      file.size > (maxMB === MAX_UPLOAD_MB ? MAX_UPLOAD_BYTES : maxMB * 1048576)
    )
      return { ok: false, error: `La imagen excede ${maxMB}MB.` };
    return { ok: true };
  }

  function mountNoticiaMediaEdit(containerEl, noticiaId) {
    if (!containerEl) return;
    containerEl.innerHTML = `
      <div class="media-head">
        <div class="media-title">Imágenes</div>
        <div class="media-help">JPG/PNG · Máx ${MAX_UPLOAD_MB}MB</div>
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

    (async () => {
      if (noticiaId) {
        img1.src = await resolveNoticiaImg(noticiaId, 1);
        img2.src = await resolveNoticiaImg(noticiaId, 2);
      } else {
        img1.src = noImageSvgDataURI();
        img2.src = noImageSvgDataURI();
        if (S.tempNewImages[1] instanceof File)
          img1.src = URL.createObjectURL(S.tempNewImages[1]);
        if (S.tempNewImages[2] instanceof File)
          img2.src = URL.createObjectURL(S.tempNewImages[2]);
      }
    })();
    img1.onerror = () => (img1.src = noImageSvgDataURI());
    img2.onerror = () => (img2.src = noImageSvgDataURI());

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
          const v = validarImagen(file);
          if (!v.ok) {
            toast(v.error, "error");
            return;
          }

          const targetImg = pos === 1 ? img1 : img2;

          // Overlay de confirmación de subida
          openImagePreview({
            file,
            title: `Vista previa · Imagen ${pos}`,
            confirm: true,
            onConfirm: async () => {
              if (!noticiaId) {
                const url = URL.createObjectURL(file);
                targetImg.src = withBust(url);
                S.tempNewImages[pos] = file;
                toast("Imagen lista; se subirá al guardar.", "info");
                return;
              }
              try {
                const newUrl = await uploadNoticiaImg(noticiaId, pos, file);
                targetImg.src = withBust(newUrl);
                // refresca en vista si existe
                const viewTarget = qs(`#noticia-img-${pos}-view`);
                if (viewTarget) viewTarget.src = withBust(newUrl);
                toast("Imagen actualizada", "exito");
              } catch (err) {
                console.error(TAG, "upload error", err);
                toast("No se pudo subir la imagen", "error");
              }
            },
          });
        });
        input.click();
      });
    });
  }

  function fillNoticiaEdit(n) {
    console.log(TAG, "fillNoticiaEdit()", n);

    const model =
      S.current && S.current._all && (+S.current.id === +n.id || n.id == null)
        ? S.current._all
        : n || {};

    setVal("nf_titulo", model.titulo);
    setVal("nf_desc_uno", model.desc_uno);
    setVal("nf_desc_dos", model.desc_dos);
    putNoticiaStatus("nf_estatus", model.estatus ?? 1);

    mountNoticiaMediaEdit(qs("#media-noticia-edit"), model.id);

    // Rebind seguro
    const bSave = qs("#btn-save-noticia");
    if (bSave) {
      const clone = bSave.cloneNode(true);
      bSave.replaceWith(clone);
      clone.addEventListener("click", saveNoticia);
    }
    const bCancel = qs("#btn-cancel-noticia");
    if (bCancel) {
      const c = bCancel.cloneNode(true);
      bCancel.replaceWith(c);
      c.addEventListener("click", () => {
        setNoticiaDrawerMode("view");
        fillNoticiaView(S.current ? S.current._all : model);
      });
    }
  }
  window.fillNoticiaEdit = fillNoticiaEdit;

  async function updateNoticiaStatus(id, estatus, extra = {}) {
    if (!id) return false;
    try {
      const payload = Object.assign(
        { id: Number(id), estatus: Number(estatus) },
        extra
      );
      console.log(TAG, "updateNoticiaStatus →", payload);
      const res = await postJSON(API.uNoticias, payload);
      console.log(TAG, "updateNoticiaStatus respuesta:", res);
      if (res && res.error) {
        toast(res.error, "error");
        return false;
      }
      return true;
    } catch (err) {
      console.error(TAG, "updateNoticiaStatus ERROR:", err);
      toast("No se pudo actualizar el estatus.", "error");
      return false;
    }
  }

  async function saveNoticia() {
    const body = {
      id: S.current?.id ?? null,
      titulo: (qs("#nf_titulo")?.value || "").trim(),
      desc_uno: (qs("#nf_desc_uno")?.value || "").trim(),
      desc_dos: (qs("#nf_desc_dos")?.value || "").trim(),
      estatus: Number(qs("#nf_estatus")?.value || 1),
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
          toast(
            "No se puede crear: falta el id de usuario (creado_por).",
            "error"
          );
          return;
        }
        const insertBody = { ...body, creado_por };
        const res = await postJSON(API.iNoticias, insertBody);
        if (res && res.error) {
          toast(res.error, "error");
          return;
        }
        const idCand =
          res?.id ?? res?.noticia_id ?? res?.insert_id ?? res?.data?.id;
        newId = Number(idCand || 0);

        // subida diferida de imágenes
        if (newId) {
          for (const pos of [1, 2]) {
            const file = S.tempNewImages[pos];
            if (file instanceof File) {
              try {
                await uploadNoticiaImg(newId, pos, file);
              } catch (e) {
                console.error(TAG, "Upload diferido pos", pos, "falló:", e);
                toast(
                  `Noticia creada, pero la imagen ${pos} no se pudo subir.`,
                  "error"
                );
              } finally {
                S.tempNewImages[pos] = null;
              }
            }
          }
        }
      } else {
        const resU = await postJSON(API.uNoticias, body);
        if (resU && resU.error) {
          toast(resU.error, "error");
          return;
        }
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
    window.__activeModule = "noticias";
    try {
      const hostD = qs("#noticias-list") || qs("#recursos-list");
      if (hostD)
        hostD.innerHTML = `<div class="table-row"><div class="col-nombre">Cargando…</div></div>`;
      await loadNoticias();
      wireSearch();
      console.log(TAG, "mount() OK");
    } catch (e) {
      console.error(TAG, "mount() ERROR:", e);
      const hostD = qs("#noticias-list") || qs("#recursos-list");
      if (hostD)
        hostD.innerHTML = `<div class="table-row"><div class="col-nombre">Error cargando noticias</div></div>`;
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
