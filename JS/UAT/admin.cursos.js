/* ==================== CURSOS: Núcleo + Listado + Drawer ==================== */
(() => {
  "use strict";

  /* ---------- Config/API ---------- */
  const API_BASE =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
  const API = {
    cursos: API_BASE + "c_cursos.php",
    iCursos: API_BASE + "i_cursos.php",
    uCursos: API_BASE + "u_cursos.php",
    tutores: API_BASE + "c_tutor.php",
    prioridad: API_BASE + "c_prioridad.php",
    categorias: API_BASE + "c_categorias.php",
    calendario: API_BASE + "c_dias_curso.php",
    tipoEval: API_BASE + "c_tipo_evaluacion.php",
    actividades: API_BASE + "c_actividades.php",
  };
  const API_UPLOAD = { cursoImg: API_BASE + "u_cursoImg.php" };

  /* ---------- Estado ---------- */
  const S = {
    page: 1,
    pageSize: 7,
    search: "",
    data: [],
    current: null, // { id, _all }
    maps: {
      tutores: null,
      prioridad: null,
      categorias: null,
      calendario: null,
      tipoEval: null,
      actividades: null,
      pendingCoverFile: null,
    },
  };
  window.__CursosState = S; // flag para el router

  /* ---------- Utils ---------- */
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
  const fmtMoney = (n) =>
    isFinite(+n)
      ? new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        }).format(+n)
      : "-";
  const fmtBool = (v) => (+v === 1 || v === true || v === "1" ? "Sí" : "No");
  const fmtDate = (d) => (!d ? "-" : String(d));
  const STATUS_LABEL = {
    1: "Activo",
    0: "Inactivo",
    2: "Pausado",
    3: "Terminado",
    4: "En curso",
    5: "Cancelado",
  };
  const ORDER_CURSOS = [1, 0, 2, 3, 4, 5];

  async function postJSON(url, body) {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    const t = await r.text().catch(() => "");
    if (!r.ok) throw new Error("HTTP " + r.status + " " + t);
    if (!t.trim()) return {};
    try {
      return JSON.parse(t);
    } catch {
      return { _raw: t };
    }
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
      const sep = u.includes("?") ? "&" : "?";
      return u + sep + "v=" + Date.now();
    }
  }

  /* ---------- Imágenes ---------- */
  function cursoImgUrl(id, ext = "png") {
    return `/ASSETS/cursos/img${Number(id)}.${ext}`;
  }
  function noImageSvgDataURI() {
    const svg =
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M20 70 L60 35 L95 65 L120 50 L140 70' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }
  async function resolveCursoImg(id) {
    const ok = (url) =>
      new Promise((res) => {
        const i = new Image();
        i.onload = () => res(true);
        i.onerror = () => res(false);
        i.src = url;
      });
    const png = withBust(cursoImgUrl(id, "png"));
    const jpg = withBust(cursoImgUrl(id, "jpg"));
    if (await ok(png)) return png;
    if (await ok(jpg)) return jpg;
    return noImageSvgDataURI();
  }

  /* ---------- Drawer helpers ---------- */
  function openDrawerCurso() {
    const d = qs("#drawer-curso"),
      ov = qs("#gc-dash-overlay");
    if (!d) return;
    d.classList.add("open");
    d.removeAttribute("hidden");
    d.setAttribute("aria-hidden", "false");
    ov && ov.classList.add("open");
  }
  function closeDrawerCurso() {
    const d = qs("#drawer-curso"),
      ov = qs("#gc-dash-overlay");
    if (!d) return;
    d.classList.remove("open");
    d.setAttribute("hidden", "");
    d.setAttribute("aria-hidden", "true");
    ov && ov.classList.remove("open");
    S.current = null;
  }
  qsa("#drawer-curso-close").forEach((b) => {
    if (!b._b) {
      b._b = true;
      b.addEventListener("click", closeDrawerCurso);
    }
  });
  const overlay = qs("#gc-dash-overlay");
  if (overlay && !overlay._b) {
    overlay._b = true;
    overlay.addEventListener("click", closeDrawerCurso);
  }
  if (!window._gc_cursos_esc) {
    window._gc_cursos_esc = true;
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDrawerCurso();
    });
  }

  /* ---------- Toast básico ---------- */
  function toast(msg, type = "info", ms = 2200) {
    if (window.gcToast) return window.gcToast(msg, type, ms);
    console.log(`[${type}] ${msg}`);
  }

  /* ---------- Map helpers ---------- */
  function arrToMap(arr) {
    const m = {};
    (Array.isArray(arr) ? arr : []).forEach((x) => {
      m[x.id] = x.nombre || x.titulo || "#" + x.id;
    });
    m._ts = Date.now();
    return m;
  }
  function mapToOptions(map, sel) {
    const ids = Object.keys(map || {}).filter((k) => k !== "_ts");
    return ids
      .map(
        (id) =>
          `<option value="${id}"${+id === +sel ? " selected" : ""}>${esc(
            map[id]
          )}</option>`
      )
      .join("");
  }
  function mapLabel(map, id) {
    if (!map) return "-";
    const k = String(id ?? "");
    return k in map ? map[k] ?? "-" : "-";
  }

  /* ---------- Export utils para otros módulos si los usan ---------- */
  window.gcUtils = Object.assign({}, window.gcUtils || {}, {
    qs,
    qsa,
    esc,
    fmtMoney,
    fmtBool,
    fmtDate,
    STATUS_LABEL,
    ORDER_CURSOS,
    postJSON,
    withBust,
    toast,
    cursoImgUrl,
    resolveCursoImg,
    noImageSvgDataURI,
    openDrawerCurso,
    closeDrawerCurso,
    mapToOptions,
    mapLabel,
  });

  /* ==================== Catálogos + Listado ==================== */
  async function loadCatalogos() {
    if (!S.maps.tutores)
      S.maps.tutores = arrToMap(
        await postJSON(API.tutores, { estatus: 1 }).catch(() => [])
      );
    if (!S.maps.prioridad)
      S.maps.prioridad = arrToMap(
        await postJSON(API.prioridad, { estatus: 1 }).catch(() => [])
      );
    if (!S.maps.categorias)
      S.maps.categorias = arrToMap(
        await postJSON(API.categorias, { estatus: 1 }).catch(() => [])
      );
    if (!S.maps.calendario)
      S.maps.calendario = arrToMap(
        await postJSON(API.calendario, { estatus: 1 }).catch(() => [])
      );
    if (!S.maps.tipoEval)
      S.maps.tipoEval = arrToMap(
        await postJSON(API.tipoEval, { estatus: 1 }).catch(() => [])
      );
    if (!S.maps.actividades)
      S.maps.actividades = arrToMap(
        await postJSON(API.actividades, { estatus: 1 }).catch(() => [])
      );
  }

  async function loadCursos() {
    // carga por estatus y concatena en el orden deseado
    const chunks = await Promise.all(
      ORDER_CURSOS.map((st) =>
        postJSON(API.cursos, { estatus: st }).catch(() => [])
      )
    );
    const flat = [];
    ORDER_CURSOS.forEach((st, i) => {
      flat.push(...(Array.isArray(chunks[i]) ? chunks[i] : []));
    });
    S.data = flat;
    S.page = 1;
    renderCursos();
  }

  function normalize(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .trim();
  }

  function renderCursos() {
    const hostD = qs("#recursos-list");
    const hostM = qs("#recursos-list-mobile");
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
            <div class="table-row" role="row" data-id="${it.id}">
              <div class="col-nombre" role="cell">${esc(it.nombre || "-")}</div>
              <div class="col-tutor" role="cell">${esc(
                mapLabel(S.maps.tutores, it.tutor)
              )}</div>
              <div class="col-fecha" role="cell">${esc(
                fmtDate(it.fecha_inicio)
              )}</div>
              <div class="col-status" role="cell">${esc(est)}</div>
            </div>
          `
          );
        });
        qsa(".table-row", hostD).forEach((row) => {
          row.addEventListener("click", () => {
            const id = Number(row.dataset.id);
            if (id) openCursoView(id);
          });
        });
      }
    }

    // Mobile
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
                <div class="title">${esc(it.nombre || "-")}</div>
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
            if (id) openCursoView(id);
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

      const mkBtn = (txt, dis, cb, cls = "page-btn") => {
        const b = document.createElement("button");
        b.textContent = txt;
        b.className = cls + (dis ? " disabled" : "");
        if (dis) b.disabled = true;
        else b.onclick = cb;
        return b;
      };

      cont.appendChild(
        mkBtn(
          "‹",
          S.page === 1,
          () => {
            S.page = Math.max(1, S.page - 1);
            renderCursos();
          },
          "arrow-btn"
        )
      );
      for (let p = 1; p <= totalPages && p <= 7; p++) {
        const b = mkBtn(String(p), false, () => {
          S.page = p;
          renderCursos();
        });
        if (p === S.page) b.classList.add("active");
        cont.appendChild(b);
      }
      cont.appendChild(
        mkBtn(
          "›",
          S.page === totalPages,
          () => {
            S.page = Math.min(totalPages, S.page + 1);
            renderCursos();
          },
          "arrow-btn"
        )
      );
    });
  }

  // búsqueda
  const searchInput = qs("#search-input");
  if (searchInput && !searchInput._b) {
    searchInput._b = true;
    searchInput.addEventListener("input", (e) => {
      S.search = e.target.value || "";
      S.page = 1;
      renderCursos();
    });
  }

  /* ==================== Drawer: Vista ==================== */
  function setDrawerMode(mode) {
    const v = qs("#curso-view");
    const e = qs("#curso-edit");
    const act = qs("#curso-actions-view");
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

  async function mountCursoMediaView(containerEl, cursoId) {
    if (!containerEl) return;
    const url = await resolveCursoImg(cursoId);
    containerEl.innerHTML = `
      <div class="media-head">
        <div class="media-title">Imágenes</div>
        <div class="media-help" style="color:#888;">Solo lectura</div>
      </div>
      <div class="media-grid">
        <div class="media-card">
          <figure class="media-thumb">
            <img alt="Portada" id="curso-cover-view" loading="eager" src="${esc(
              url
            )}">
          </figure>
          <div class="media-meta"><div class="media-label">Portada</div></div>
        </div>
      </div>
    `;
    const img = containerEl.querySelector("#curso-cover-view");
    if (img)
      img.onerror = () => {
        img.onerror = null;
        img.src = noImageSvgDataURI();
      };
  }

  function put(sel, val) {
    const el = qs(sel);
    if (el) el.innerHTML = esc(val ?? "—");
  }

  async function fillCursoView(it) {
    const title = qs("#drawer-curso-title");
    if (title) title.textContent = "Curso · " + (it.nombre || "—");

    put("#v_nombre", it.nombre);
    put("#v_desc_breve", it.descripcion_breve);
    put("#v_desc_media", it.descripcion_media);
    put("#v_desc_curso", it.descripcion_curso);
    put("#v_dirigido", it.dirigido);
    put("#v_competencias", it.competencias);

    put("#v_tutor", mapLabel(S.maps.tutores, it.tutor));
    put("#v_categoria", mapLabel(S.maps.categorias, it.categoria));
    put("#v_prioridad", mapLabel(S.maps.prioridad, it.prioridad));
    put("#v_tipo_eval", mapLabel(S.maps.tipoEval, it.tipo_evaluacion));
    put("#v_actividades", mapLabel(S.maps.actividades, it.actividades));
    put("#v_calendario", mapLabel(S.maps.calendario, it.calendario));

    put("#v_horas", it.horas);
    put("#v_precio", it.precio ? fmtMoney(it.precio) : "-");
    put("#v_certificado", fmtBool(it.certificado));
    put("#v_fecha", fmtDate(it.fecha_inicio));
    put("#v_estatus", STATUS_LABEL[it.estatus] || it.estatus);

    await mountCursoMediaView(qs("#media-curso"), it.id);

    const pre = qs("#json-curso");
    if (pre) pre.textContent = JSON.stringify(it, null, 2);

    const bEdit = qs("#btn-edit");
    if (bEdit && !bEdit._b) {
      bEdit._b = true;
      bEdit.addEventListener("click", () => {
        setDrawerMode("edit");
        fillCursoEdit(S.current ? S.current._all : it);
      });
    }
    const bDel = qs("#btn-delete");
    if (bDel && !bDel._b) {
      bDel._b = true;
      bDel.addEventListener("click", () => {
        const step = bDel.getAttribute("data-step") === "2" ? "1" : "2";
        bDel.setAttribute("data-step", step);
      });
    }
  }

  async function openCursoView(id) {
    const it = (S.data || []).find((x) => +x.id === +id);
    if (!it) return;
    S.current = { id: it.id, _all: it };
    openDrawerCurso();
    setDrawerMode("view");
    await fillCursoView(it);
  }

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

  function putSelect(id, map, sel) {
    const el = qs("#" + id);
    if (!el) return;
    el.innerHTML = mapToOptions(map || {}, sel);
  }
  function putStatus(id, sel) {
    const el = qs("#" + id);
    if (!el) return;
    const opts = [
      { v: 1, l: "Activo" },
      { v: 0, l: "Inactivo" },
      { v: 2, l: "Pausado" },
      { v: 3, l: "Terminado" },
      { v: 4, l: "En curso" },
      { v: 5, l: "Cancelado" },
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

  function humanSize(bytes) {
    if (!Number.isFinite(bytes)) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(2) + " MB";
  }
  function validarImagen(file, maxMB = 2) {
    if (!file) return { ok: false, error: "No seleccionaste archivo." };
    if (!/image\/(png|jpeg)/.test(file.type))
      return { ok: false, error: "Formato no permitido. Usa JPG o PNG." };
    if (file.size > maxMB * 1048576)
      return { ok: false, error: `La imagen excede ${maxMB}MB.` };
    return { ok: true };
  }

  async function uploadCursoCover(cursoId, file) {
    const fd = new FormData();
    fd.append("curso_id", String(cursoId || 0));
    fd.append("imagen", file);
    const res = await fetch(API_UPLOAD.cursoImg, { method: "POST", body: fd });
    const text = await res.text().catch(() => "");
    if (!res.ok) throw new Error("HTTP " + res.status + " " + text);
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = { _raw: text };
    }
    return json && json.url ? String(json.url) : cursoImgUrl(cursoId || 0);
  }

  function previewOverlay(file, { onConfirm, onCancel }) {
    const url = URL.createObjectURL(file);
    const o = document.createElement("div");
    o.style.cssText =
      "position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(17,24,39,.55)";
    const m = document.createElement("div");
    m.style.cssText =
      "background:#fff;border-radius:14px;box-shadow:0 20px 40px rgba(0,0,0,.25);width:min(920px,94vw);max-height:90vh;overflow:hidden;display:flex;flex-direction:column;";
    m.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 16px;border-bottom:1px solid #eee;background:#f8fafc;">
        <div style="font-weight:700;">Vista previa de imagen</div>
        <button type="button" data-x="close" class="gc-btn gc-btn--ghost" style="min-width:auto;padding:.35rem .6rem;">✕</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 280px;gap:16px;padding:16px;align-items:start;">
        <div style="border:1px solid #eee;border-radius:12px;padding:8px;background:#fafafa;display:flex;align-items:center;justify-content:center;min-height:320px;max-height:60vh;">
          <img src="${url}" alt="Vista previa" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;">
        </div>
        <div style="border-left:1px dashed #e6e6e6;padding-left:16px;display:flex;flex-direction:column;gap:10px;">
          <div style="font-weight:600;">Detalles</div>
          <div style="font-size:.92rem;color:#444;line-height:1.35;">
            <div><strong>Archivo:</strong> ${esc(file.name)}</div>
            <div><strong>Peso:</strong> ${humanSize(file.size)}</div>
            <div><strong>Tipo:</strong> ${esc(file.type || "—")}</div>
            <div style="margin-top:6px;color:#666;">Formatos: JPG / PNG · Máx 2MB</div>
          </div>
          <div style="margin-top:auto;display:flex;gap:8px;flex-wrap:wrap;">
            <button class="gc-btn gc-btn--primary" data-x="ok">Subir</button>
            <button class="gc-btn gc-btn--ghost" data-x="cancel">Cancelar</button>
          </div>
        </div>
      </div>
    `;
    o.appendChild(m);
    document.body.appendChild(o);
    document.body.style.overflow = "hidden";
    function cleanup() {
      URL.revokeObjectURL(url);
      o.remove();
      document.body.style.overflow = "";
    }
    o.addEventListener("click", (e) => {
      if (e.target === o) {
        onCancel && onCancel();
        cleanup();
      }
    });
    m.querySelector('[data-x="close"]').addEventListener("click", () => {
      onCancel && onCancel();
      cleanup();
    });
    m.querySelector('[data-x="cancel"]').addEventListener("click", () => {
      onCancel && onCancel();
      cleanup();
    });
    m.querySelector('[data-x="ok"]').addEventListener("click", async () => {
      try {
        await onConfirm?.();
      } finally {
        cleanup();
      }
    });

    // responsive
    const body = m.children[1],
      side = body.children[1];
    const mql = window.matchMedia("(max-width: 720px)");
    function apply() {
      if (mql.matches) {
        body.style.gridTemplateColumns = "1fr";
        side.style.borderLeft = "none";
        side.style.paddingLeft = "0";
      } else {
        body.style.gridTemplateColumns = "1fr 280px";
        side.style.borderLeft = "1px dashed #e6e6e6";
        side.style.paddingLeft = "16px";
      }
    }
    mql.addEventListener("change", apply);
    apply();
  }

  function bindEditButtonUpload(btn, img, cursoId) {
    if (!btn || btn._b) return;
    btn._b = true;
    btn.addEventListener("click", () => {
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
        previewOverlay(file, {
          onCancel() {},
          async onConfirm() {
            try {
              const newUrl = await uploadCursoCover(cursoId, file);
              img.src = withBust(newUrl);
              toast("Imagen actualizada", "exito");
            } catch (err) {
              console.error(err);
              toast("No se pudo subir la imagen", "error");
            }
          },
        });
      });
      input.click();
    });
  }

  function mountCursoMediaEdit(containerEl, cursoId) {
    if (!containerEl) return;
    containerEl.innerHTML = `
    <div class="media-head">
      <div class="media-title">Imágenes</div>
      <div class="media-help">JPG/PNG · Máx 2MB</div>
    </div>
    <div class="media-grid">
      <div class="media-card">
        <figure class="media-thumb">
          <img alt="Portada" id="curso-cover-edit" loading="eager" src="">
          <button class="icon-btn media-edit" type="button" title="Editar imagen" aria-label="Editar imagen">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"></path>
            </svg>
          </button>
        </figure>
        <div class="media-meta">
          <div class="media-label">Portada</div>
          <div id="cover-hint" class="media-hint" style="font-size:.85rem;color:#666;"></div>
        </div>
      </div>
    </div>
  `;
    const img = containerEl.querySelector("#curso-cover-edit");
    const pencil = containerEl.querySelector(".media-edit");
    const hint = containerEl.querySelector("#cover-hint");

    // si venimos de "crear" y ya elegiste un archivo antes de guardar, muéstralo
    if (!cursoId && S.pendingCoverFile instanceof File) {
      const url = URL.createObjectURL(S.pendingCoverFile);
      img.src = url;
      hint.textContent = "La imagen se subirá cuando guardes el curso.";
    } else {
      (async () => {
        img.src = await resolveCursoImg(cursoId || 0);
      })();
    }
    img.onerror = () => {
      img.onerror = null;
      img.src = noImageSvgDataURI();
    };

    if (!pencil || pencil._b) return;
    pencil._b = true;

    pencil.addEventListener("click", () => {
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

        // Si NO hay ID: sólo previsualiza y guarda en buffer; se subirá tras guardar
        if (!cursoId) {
          previewOverlay(file, {
            onCancel() {},
            async onConfirm() {
              try {
                S.pendingCoverFile = file;
                const blobUrl = URL.createObjectURL(file);
                img.src = blobUrl;
                hint.textContent =
                  "La imagen se subirá cuando guardes el curso.";
                toast("Imagen lista para subir al guardar", "info");
              } catch (e) {
                console.error(e);
                toast("No se pudo preparar la imagen", "error");
              }
            },
          });
          return;
        }

        // Con ID: sube de inmediato
        previewOverlay(file, {
          onCancel() {},
          async onConfirm() {
            try {
              const newUrl = await uploadCursoCover(cursoId, file);
              img.src = withBust(newUrl);
              hint.textContent = "";
              toast("Imagen actualizada", "exito");
            } catch (err) {
              console.error(err);
              toast("No se pudo subir la imagen", "error");
            }
          },
        });
      });

      input.click();
    });
  }

  function fillCursoEdit(c) {
    // inputs
    setVal("f_nombre", c.nombre);
    setVal("f_desc_breve", c.descripcion_breve);
    setVal("f_desc_media", c.descripcion_media);
    setVal("f_desc_curso", c.descripcion_curso);
    setVal("f_dirigido", c.dirigido);
    setVal("f_competencias", c.competencias);
    setVal("f_horas", c.horas);
    setVal("f_precio", c.precio);
    setVal("f_fecha", c.fecha_inicio);
    setChecked("f_certificado", c.certificado);

    // selects
    putSelect("f_tutor", S.maps.tutores, c.tutor);
    putSelect("f_prioridad", S.maps.prioridad, c.prioridad);
    putSelect("f_categoria", S.maps.categorias, c.categoria);
    putSelect("f_calendario", S.maps.calendario, c.calendario);
    putSelect("f_tipo_eval", S.maps.tipoEval, c.tipo_evaluacion);
    putSelect("f_actividades", S.maps.actividades, c.actividades);
    putStatus("f_estatus", c.estatus);

    // imagen
    mountCursoMediaEdit(qs("#media-curso-edit"), c.id);

    // acciones
    const bSave = qs("#btn-save");
    const bCancel = qs("#btn-cancel");
    if (bSave && !bSave._b) {
      bSave._b = true;
      bSave.addEventListener("click", saveCurso);
    }
    if (bCancel && !bCancel._b) {
      bCancel._b = true;
      bCancel.addEventListener("click", () => {
        setDrawerMode("view");
        fillCursoView(S.current ? S.current._all : c);
      });
    }
  }

  async function saveCurso() {
    const toNumOrNull = (v) => {
      const s = (v ?? "").toString().trim();
      if (s === "") return null;
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    };

    const body = {
      id: S.current?.id ?? null,
      nombre: val("f_nombre"),
      descripcion_breve: val("f_desc_breve"),
      descripcion_media: val("f_desc_media"),
      descripcion_curso: val("f_desc_curso"),
      dirigido: val("f_dirigido"),
      competencias: val("f_competencias"),
      tutor: toNumOrNull(val("f_tutor")),
      horas: toNumOrNull(val("f_horas")),
      precio: Number(val("f_precio") || 0),
      estatus: toNumOrNull(val("f_estatus")) ?? 1,
      fecha_inicio: val("f_fecha"),
      prioridad: toNumOrNull(val("f_prioridad")),
      categoria: toNumOrNull(val("f_categoria")),
      calendario: toNumOrNull(val("f_calendario")),
      tipo_evaluacion: toNumOrNull(val("f_tipo_eval")),
      actividades: toNumOrNull(val("f_actividades")),
      certificado: qs("#f_certificado")?.checked ? 1 : 0,
    };

    if (
      !body.nombre ||
      !body.descripcion_breve ||
      !body.descripcion_curso ||
      !body.dirigido ||
      !body.competencias
    ) {
      toast("Completa los campos obligatorios.", "error");
      return;
    }

    try {
      let newId = body.id ?? null;
      if (body.id == null) {
        const resp = await postJSON(API.iCursos, body);
        // adapta a lo que regrese tu PHP: id / insertId / lastId...
        newId = resp?.id ?? resp?.insertId ?? resp?.lastId ?? null;
      } else {
        await postJSON(API.uCursos, body);
        newId = body.id;
      }

      toast("Curso guardado", "exito");

      // recarga y abre el curso guardado
      await loadCursos();
      let it = null;
      if (newId != null) it = (S.data || []).find((x) => +x.id === +newId);
      if (!it)
        it =
          (S.data || []).find((x) => x.nombre === body.nombre) || S.data?.[0];

      if (it) {
        S.current = { id: it.id, _all: it };
        setDrawerMode("view");
        await fillCursoView(it);

        if (S.pendingCoverFile instanceof File) {
          try {
            const url = await uploadCursoCover(it.id, S.pendingCoverFile);
            S.pendingCoverFile = null; 
            const imgView = document.querySelector("#curso-cover-view");
            if (imgView) imgView.src = withBust(url);
            toast("Imagen cargada", "exito");
          } catch (e) {
            console.error(e);
            toast("Curso guardado, pero la imagen no se pudo subir.", "error");
          }
        }
      } else {
        setDrawerMode("edit");
      }
    } catch (err) {
      console.error(err);
      toast("No se pudo guardar.", "error");
    }
  }

  /* ==================== API del módulo (router-lite) ==================== */
  async function mount() {
    // headers los pone el router; aquí solo datos + render
    try {
      // loading state opcional
      const hostD = qs("#recursos-list");
      if (hostD)
        hostD.innerHTML = `<div class="table-row"><div class="col-nombre">Cargando…</div></div>`;

      await loadCatalogos();
      await loadCursos();

      // bind búsqueda (si no estaba)
      const s = qs("#search-input");
      if (s && !s._b) {
        s._b = true;
        s.addEventListener("input", (e) => {
          S.search = e.target.value || "";
          S.page = 1;
          renderCursos();
        });
      }
    } catch (e) {
      console.error("Error en mount cursos:", e);
      const hostD = qs("#recursos-list");
      if (hostD)
        hostD.innerHTML = `<div class="table-row"><div class="col-nombre">Error cargando cursos</div></div>`;
    }
  }

  function openCursoCreate() {
    const blank = {
      id: null,
      nombre: "",
      descripcion_breve: "",
      descripcion_curso: "",
      descripcion_media: "",
      dirigido: "",
      competencias: "",
      tutor: null,
      horas: null,
      precio: 0,
      estatus: 1,
      fecha_inicio: "",
      prioridad: null,
      categoria: null,
      calendario: null,
      tipo_evaluacion: null,
      actividades: null,
      certificado: 0,
    };
    S.current = { id: null, _all: blank };
    openDrawerCurso();
    setDrawerMode("edit");
    fillCursoEdit(blank);
  }

  // expone API para el router
  window.cursos = { mount, openCreate: openCursoCreate };

  // también expone helpers usados por otros módulos si hace falta
  window.cursosLoad = { loadCatalogos, loadCursos };
  window.openCursoView = openCursoView;
  window.fillCursoView = fillCursoView;
  window.fillCursoEdit = fillCursoEdit;
  window.saveCurso = saveCurso;
})();
