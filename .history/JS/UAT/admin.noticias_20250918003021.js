/* ==================== NOTICIAS (UAT) — Núcleo + Listado + Drawer ==================== */
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

  // Upload imágenes para noticias (pos 1 y 2)
  const API_UPLOAD = { noticiaImg: API_BASE + "u_noticiaImagenes.php" };

  /* ---------- Estado ---------- */
  const S = {
    page: 1,
    pageSize: 7,
    search: "",
    data: [],               // arreglo de noticias
    current: null,          // { id, _all }
    tempNewImages: {        // buffer para imágenes en modo crear
      1: null, // File para pos 1
      2: null, // File para pos 2
    },
  };
  window.__NoticiasState = S;

  /* ---------- Status (por entidad Noticias) ---------- */
  // Orden de concatenación en la tabla (Activas → En pausa → Temporal → Canceladas)
  const ORDER_NOTICIAS = [1, 2, 3, 0];
  const STATUS_LABEL = {
    1: "Activo",
    2: "En pausa",
    3: "Temporal",
    0: "Cancelado",
  };

  /* ---------- Utils DOM/format ---------- */
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [].slice.call(r.querySelectorAll(s));
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
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

  /* ---------- creado_por desde cookie `usuario` ---------- */
  function getCreatorId() {
    try {
      const raw = document.cookie
        .split("; ")
        .find((r) => r.startsWith("usuario="));
      if (!raw) {
        console.warn(TAG, "Cookie 'usuario' no encontrada.");
        return null;
      }
      const json = decodeURIComponent(raw.split("=")[1] || "");
      const u = JSON.parse(json);
      console.log(TAG, "usuario(cookie) →", u);
      const n = Number(u?.id);
      if (Number.isFinite(n)) return n;
      console.warn(TAG, "El objeto de cookie no trae un id numérico:", u?.id);
      return null;
    } catch (e) {
      console.error(TAG, "getCreatorId() error al leer cookie 'usuario':", e);
      return null;
    }
  }

  /* ---------- HTTP JSON robusto ---------- */
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

    // parse normal
    try {
      const j = JSON.parse(text);
      console.log(TAG, "JSON OK:", j);
      return j;
    } catch { }

    // fallback a recorte {..} ó [..]
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
      } catch { }
    }

    console.warn(TAG, "JSON parse failed; returning _raw");
    return { _raw: text };
  }

  /* ---------- Cache-bust ---------- */
  function withBust(u) {
    if (!u || typeof u !== "string" || u.startsWith("data:") || u.startsWith("blob:"))
      return u;
    try {
      const url = new URL(u, location.origin);
      url.searchParams.set("v", Date.now());
      return url.pathname + "?" + url.searchParams.toString();
    } catch {
      const sep = u.includes("?") ? "&" : "?";
      return u + sep + "v=" + Date.now();
    }
  }

  /* ---------- Imágenes (Noticias) ---------- */
  // Ruta pública esperada por tu uploader: /ASSETS/noticia/NoticiasImg/noticia_img{pos}_{id}.png
  function noticiaImgUrl(id, pos = 1) {
    return `/ASSETS/noticia/NoticiasImg/noticia_img${Number(pos)}_${Number(id)}.png`;
  }
  function noImageSvgDataURI() {
    const svg =
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M20 70 L60 35 L95 65 L120 50 L140 70' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }
  async function resolveNoticiaImg(id, pos = 1) {
    const url = withBust(noticiaImgUrl(id, pos));
    const ok = (u) =>
      new Promise((res) => {
        const i = new Image();
        i.onload = () => res(true);
        i.onerror = () => res(false);
        i.src = u;
      });
    return (await ok(url)) ? url : noImageSvgDataURI();
  }

  async function uploadNoticiaImg(noticiaId, pos, file) {
    console.log(TAG, "uploadNoticiaImg id=", noticiaId, "pos=", pos, file);
    const fd = new FormData();
    fd.append("noticia_id", String(noticiaId));
    fd.append("pos", String(pos));
    fd.append("imagen", file);
    const res = await fetch(API_UPLOAD.noticiaImg, { method: "POST", body: fd });
    const text = await res.text().catch(() => "");
    console.log(TAG, "upload HTTP", res.status, "raw:", text);
    if (!res.ok) throw new Error("HTTP " + res.status + " " + text);
    const j = JSON.parse(text);
    console.log(TAG, "upload JSON:", j);
    if (!j.ok) throw new Error(j.error || "Upload fallo");
    return j.url; // url con ?v=timestamp
  }

  /* ---------- Drawer helpers (Noticias) ---------- */
  function openDrawerNoticia() {
    console.log(TAG, "openDrawerNoticia()");
    const d = qs("#drawer-noticia"),
      ov = qs("#gc-dash-overlay");
    if (!d) return console.warn(TAG, "No existe #drawer-noticia en el DOM");
    d.classList.add("open");
    d.removeAttribute("hidden");
    d.setAttribute("aria-hidden", "false");
    ov && ov.classList.add("open");
  }
  function closeDrawerNoticia() {
    console.log(TAG, "closeDrawerNoticia()");
    const d = qs("#drawer-noticia"),
      ov = qs("#gc-dash-overlay");
    if (!d) return;
    d.classList.remove("open");
    d.setAttribute("hidden", "");
    d.setAttribute("aria-hidden", "true");
    ov && ov.classList.remove("open");
    S.current = null;
  }
  // binds 1 vez
  qsa("#drawer-noticia-close").forEach((b) => {
    if (!b._b) {
      b._b = true;
      b.addEventListener("click", closeDrawerNoticia);
    }
  });
  const _ovN = qs("#gc-dash-overlay");
  if (_ovN && !_ovN._bN) {
    _ovN._bN = true;
    _ovN.addEventListener("click", closeDrawerNoticia);
  }
  if (!window._gc_noticias_esc) {
    window._gc_noticias_esc = true;
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDrawerNoticia();
    });
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

  /* ==================== Carga y render de Noticias ==================== */
  async function loadNoticias() {
    console.log(TAG, "loadNoticias()...");
    // Concatenar por estatus en el orden definido
    const chunks = await Promise.all(
      ORDER_NOTICIAS.map((st) =>
        postJSON(API.noticias, { estatus: st }).catch(() => [])
      )
    );
    const flat = [];
    ORDER_NOTICIAS.forEach((st, i) => {
      flat.push(...(Array.isArray(chunks[i]) ? chunks[i] : []));
    });
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
    const filtered = term
      ? S.data.filter((row) => normalize(JSON.stringify(row)).includes(term))
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
          const est = STATUS_LABEL[it.estatus] || it.estatus;
          hostD.insertAdjacentHTML(
            "beforeend",
            `
            <div class="table-row news-row" role="row" data-id="${it.id}">
             <div class="col-nombre" role="cell">${esc(it.titulo || "-")}</div>
             <div class="col-fecha"  role="cell">${esc(fmtDate(it.fecha_creacion))}</div>
             <div class="col-status" role="cell" data-col="status">${esc(est)}</div>
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

    // Mobile (si lo usas)
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

  function putVal(sel, val) {
  const el = document.querySelector(sel);
  if (!el) return;
  const v = val == null || val === "" ? "—" : String(val);
  if ("value" in el) el.value = v;
  else el.textContent = v;
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

  // búsqueda (bind 1 vez)
  const searchInput = qs("#search-input");
  if (searchInput && !searchInput._bN) {
    searchInput._bN = true;
    searchInput.addEventListener("input", (e) => {
      S.search = e.target.value || "";
      S.page = 1;
      renderNoticias();
    });
  }

  /* ==================== Drawer: Vista ==================== */
  function put(sel, val) {
    const el = qs(sel);
    if (el) el.innerHTML = esc(val ?? "—");
  }

  async function mountNoticiaMediaView(containerEl, noticiaId) {
    if (!containerEl) return;
    const url1 = await resolveNoticiaImg(noticiaId, 1);
    const url2 = await resolveNoticiaImg(noticiaId, 2);
    containerEl.innerHTML = `
      <div class="media-head">
        <div class="media-title">Imágenes</div>
        <div class="media-help" style="color:#888;">Solo lectura</div>
      </div>
      <div class="media-grid">
        <div class="media-card">
          <figure class="media-thumb">
            <img alt="Imagen 1" id="noticia-img1-view" loading="eager" src="${esc(url1)}">
          </figure>
          <div class="media-meta"><div class="media-label">Imagen 1</div></div>
        </div>
        <div class="media-card">
          <figure class="media-thumb">
            <img alt="Imagen 2" id="noticia-img2-view" loading="eager" src="${esc(url2)}">
          </figure>
          <div class="media-meta"><div class="media-label">Imagen 2</div></div>
        </div>
      </div>
    `;
  }

  function paintNoticiaActions(it) {
    // Un solo botón que alterna entre Eliminar (soft) y Reactivar, como en cursos optimizado
    const cont = qs("#noticia-actions-view");
    if (!cont) return;

    // limpia contenedor
    cont.innerHTML = "";

    const btn = document.createElement("button");
    btn.className = "gc-btn";
    btn.dataset.confirm = "0";

    let confirmTimer = null;

    const isInactive = +it.estatus === 0;
    if (isInactive) {
      // Reactivar
      btn.textContent = "Reactivar";
      btn.className = "gc-btn gc-btn--success";
    } else {
      // Eliminar (soft)
      btn.textContent = "Eliminar";
      btn.className = "gc-btn gc-btn--danger";
    }

    btn.addEventListener("click", async () => {
      // Confirmación de 2 toques solo para eliminar
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

      // Acción
      btn.disabled = true;
      try {
        const nuevoStatus = isInactive ? 1 : 0;

        // Optimista: cambia en memoria y UI inmediata
        const prev = it.estatus;
        it.estatus = nuevoStatus;
        updateRowStatusCell(it.id, it.estatus);
        paintNoticiaActions(it); // repinta acciones para el estado resultante

        const ok = await updateNoticiaStatus(it.id, nuevoStatus);
        if (!ok) {
          // revertir si falla
          it.estatus = prev;
          updateRowStatusCell(it.id, it.estatus);
          paintNoticiaActions(it);
          return;
        }

        toast(isInactive ? "Noticia reactivada" : "Noticia cancelada", "exito");

        // Re-ordenar localmente por ORDER_NOTICIAS sin recargar todo
        reorderLocalByStatus(it.id);
        // Refrescar solo la paginación/render actual
        renderNoticias();
        // Mantener drawer abierto y refrescar vista (estatus, badge, etc.)
        await fillNoticiaView(it);
      } finally {
        btn.disabled = false;
        btn.dataset.confirm = "0";
        if (confirmTimer) {
          clearTimeout(confirmTimer);
          confirmTimer = null;
        }
      }
    });

    cont.appendChild(btn);
  }

  function updateRowStatusCell(id, estatus) {
    const row = document.querySelector(`.table-row[data-id="${id}"]`);
    if (!row) return;
    const cell = row.querySelector('[data-col="status"]');
    if (!cell) return;
    cell.textContent = STATUS_LABEL[estatus] || estatus;
  }

  function reorderLocalByStatus(id) {
    // Recolocar el elemento en S.data según ORDER_NOTICIAS
    const idx = S.data.findIndex((x) => +x.id === +id);
    if (idx === -1) return;
    const it = S.data[idx];
    S.data.splice(idx, 1);

    // buscar primer índice cuyo estatus coincida con el del elemento, respetando orden
    // construiremos un nuevo arreglo ordenado por ORDER_NOTICIAS y
    // dentro de cada grupo mantenemos el orden relativo
    const groups = {};
    ORDER_NOTICIAS.forEach((st) => (groups[st] = []));
    S.data.forEach((row) => {
      const st = ORDER_NOTICIAS.includes(+row.estatus) ? +row.estatus : 999;
      if (!(st in groups)) groups[st] = [];
      groups[st].push(row);
    });
    // insertar el modificado en su grupo
    if (!(+it.estatus in groups)) groups[+it.estatus] = [];
    groups[+it.estatus].unshift(it); // al frente de su grupo para que “se note” el cambio

    // aplanar de vuelta
    const flat = [];
    ORDER_NOTICIAS.forEach((st) => flat.push(...groups[st]));
    // si hubo registros con estatus fuera del catálogo, empújalos al final
    Object.keys(groups)
      .map(Number)
      .filter((k) => !ORDER_NOTICIAS.includes(k))
      .sort()
      .forEach((st) => flat.push(...groups[st]));
    S.data = flat;
  }

  async function fillNoticiaView(it) {
    console.log(TAG, "fillNoticiaView id=", it?.id, it);
    const title = qs("#drawer-noticia-title");
    if (title) title.textContent = "Noticia · " + (it.titulo || "—");

    put("#v_titulo", it.titulo);
    put("#v_desc_uno", it.desc_uno);
    put("#v_desc_dos", it.desc_dos);
    put("#v_estatus", STATUS_LABEL[it.estatus] || it.estatus);
    put("#v_fecha_creacion", fmtDate(it.fecha_creacion));
    put("#v_fecha_modif", fmtDate(it.fecha_modif));

    await mountNoticiaMediaView(qs("#media-noticia"), it.id);

    const pre = qs("#json-noticia");
    if (pre) pre.textContent = JSON.stringify(it, null, 2);

    // acciones
    paintNoticiaActions(it);

    // editar
    const bEdit = qs("#btn-edit-noticia");
    if (bEdit && !bEdit._b) {
      bEdit._b = true;
      bEdit.addEventListener("click", () => {
        setNoticiaDrawerMode("edit");
        fillNoticiaEdit(S.current ? S.current._all : it);
      });
    }
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

  /* ==================== Drawer: Edición ==================== */
  function setVal(id, v) {
    const el = qs("#" + id);
    if (el) el.value = v == null ? "" : String(v);
  }
  function setChecked(id, v) {
    const el = qs("#" + id);
    if (el) el.checked = !!(+v === 1 || v === true || v === "1");
  }
  function val(id) {
    return (qs("#" + id)?.value || "").trim();
  }
  function num(id) {
    const v = val(id);
    return v === "" ? null : Number(v);
  }

  function putNoticiaStatus(id, sel) {
    const el = qs("#" + id);
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
          `<option value="${o.v}"${+o.v === +sel ? " selected" : ""}>${o.l}</option>`
      )
      .join("");
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
      // modo crear: placeholder, y si hay temporales previas, mostrarlas
      img1.src = noImageSvgDataURI();
      img2.src = noImageSvgDataURI();
      if (S.tempNewImages[1] instanceof File) {
        img1.src = URL.createObjectURL(S.tempNewImages[1]);
      }
      if (S.tempNewImages[2] instanceof File) {
        img2.src = URL.createObjectURL(S.tempNewImages[2]);
      }
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
          if (!v.ok) {
            toast(v.error, "error");
            return;
          }

          const targetImg = pos === 1 ? img1 : img2;

          if (!noticiaId) {
            // crear: solo guardar en buffer y previsualizar
            const url = URL.createObjectURL(file);
            targetImg.src = withBust(url);
            S.tempNewImages[pos] = file;
            toast("Imagen lista; se subirá al guardar.", "info");
            return;
          }

          // editar: subir inmediato
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
    setVal("f_titulo", n.titulo);
    setVal("f_desc_uno", n.desc_uno);
    setVal("f_desc_dos", n.desc_dos);
    putNoticiaStatus("f_estatus", n.estatus);

    mountNoticiaMediaEdit(qs("#media-noticia-edit"), n.id);

    const bSave = qs("#btn-save-noticia");
    const bCancel = qs("#btn-cancel-noticia");
    if (bSave && !bSave._b) {
      bSave._b = true;
      bSave.addEventListener("click", saveNoticia);
    }
    if (bCancel && !bCancel._b) {
      bCancel._b = true;
      bCancel.addEventListener("click", () => {
        setNoticiaDrawerMode("view");
        fillNoticiaView(S.current ? S.current._all : n);
      });
    }
  }
  window.fillNoticiaEdit = fillNoticiaEdit;

  /* ---------- Cambios de estatus (soft delete / reactivar) ---------- */
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
        console.error(TAG, "Status ERROR:", res.error);
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

  /* ---------- Guardado (insert/update) ---------- */
  async function saveNoticia() {
    const body = {
      id: S.current?.id ?? null,
      titulo: val("f_titulo"),
      desc_uno: val("f_desc_uno"),
      desc_dos: val("f_desc_dos"),
      estatus: num("f_estatus"),
    };
    console.log(TAG, "saveNoticia() body=", body);

    if (!body.titulo || !body.desc_uno) {
      toast("Título y Descripción 1 son obligatorios.", "error");
      return;
    }

    try {
      let newId = body.id;

      if (body.id == null) {
        // INSERT -> agrega creado_por desde cookie `usuario`
        const creado_por = getCreatorId();
        if (creado_por == null) {
          console.warn(TAG, "creado_por ausente. No se puede crear la noticia.");
          toast("No se puede crear: falta el id de usuario (creado_por).", "error");
          return;
        }
        const insertBody = { ...body, creado_por };
        console.log(TAG, "Insertando noticia con:", insertBody);

        const res = await postJSON(API.iNoticias, insertBody);
        console.log(TAG, "Respuesta insert:", res);
        if (res && res.error) {
          console.error(TAG, "Insert ERROR:", res.error);
          toast(res.error, "error");
          return;
        }

        // id devuelto por la API (toma el primero que exista)
        const idCand =
          res?.id ?? res?.noticia_id ?? res?.insert_id ?? res?.data?.id;
        newId = Number(idCand || 0);
        console.log(TAG, "Nuevo ID:", newId);

        // Subida diferida de imágenes si venían seleccionadas en "crear"
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
        // UPDATE
        console.log(TAG, "Actualizando noticia id=", body.id);
        const resU = await postJSON(API.uNoticias, body);
        console.log(TAG, "Respuesta update:", resU);
        if (resU && resU.error) {
          console.error(TAG, "Update ERROR:", resU.error);
          toast(resU.error, "error");
          return;
        }
      }

      toast("Noticia guardada", "exito");

      await loadNoticias(); // refresca listado
      const idToOpen = newId || body.id;
      const it = (S.data || []).find((x) => +x.id === +idToOpen) || S.data[0];
      console.log(TAG, "Reabrir id=", idToOpen, "found:", !!it);
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

  /* ==================== API para Router-lite ==================== */
  async function mount() {
    console.log(TAG, "mount() INICIO");
    try {
      const hostD = qs("#noticias-list") || qs("#recursos-list");
      if (hostD) hostD.innerHTML = `<div class="table-row"><div class="col-nombre">Cargando…</div></div>`;

      await loadNoticias();

      // bind búsqueda por si el router no lo hizo aún
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
    };
    S.current = { id: null, _all: blank };
    openDrawerNoticia();
    setNoticiaDrawerMode("edit");
    fillNoticiaEdit(blank);
  }

  // expone API pública para el router
  window.noticias = { mount, openCreate: openNoticiaCreate };

  console.log(TAG, "Módulo noticias cargado.");
})();
