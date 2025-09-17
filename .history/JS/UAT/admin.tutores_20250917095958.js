/* ==================== TUTORES: Drawer + CRUD (ajustado a API) ==================== */
(() => {
  "use strict";
  if (!window.gcUtils) { console.error("gcUtils no disponible. Carga primero el Bloque 0 de Cursos."); return; }

  const { qs, esc, postJSON, toast, withBust } = window.gcUtils;

  // Endpoints (ajústalos a tus rutas reales)
  const API_BASE = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
  const TAPI = {
    // listado/consulta
    tutores: API_BASE + "c_tutor.php",   // POST {} -> [ { id, nombre, descripcion, estatus, fecha_creacion, fecha_modif } ]
    // inserts/updates
    iTutor:  API_BASE + "i_tutor.php",   // POST { nombre, descripcion, estatus }
    uTutor:  API_BASE + "u_tutor.php",   // POST { id, nombre, descripcion, estatus }
  };
  const TUPLOAD = { foto: API_BASE + "u_tutorImg.php" }; // opcional (si manejas foto aparte)

  const TS = { current: null };
  window.__TutoresState = TS;
  window.TAPI = TAPI;
  window.TUPLOAD = TUPLOAD;

  /* ======= Imagen Tutor (opcional) ======= */
  function tutorImgUrl(id, ext = "png") { return `/ASSETS/tutor/tutor_${Number(id)}.${ext}`; }
  function noImageSvgDataURI() {
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'><rect width='100%' height='100%' fill='#f3f3f3'/><circle cx='80' cy='60' r='30' fill='#d1d5db'/><rect x='35' y='100' width='90' height='40' rx='12' fill='#d1d5db'/></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }
  async function resolveTutorImg(id) {
    const tryLoad = (url) => new Promise(res => {
      const i = new Image(); i.onload = () => res(true); i.onerror = () => res(false); i.src = withBust(url);
    });
    const png = tutorImgUrl(id, "png");
    const jpg = tutorImgUrl(id, "jpg");
    if (await tryLoad(png)) return withBust(png);
    if (await tryLoad(jpg)) return withBust(jpg);
    return noImageSvgDataURI();
  }

  /* ======= Drawer helpers ======= */
  function openDrawerTutor() {
    const d = qs("#drawer-tutor"), ov = qs("#gc-dash-overlay");
    if (!d) return;
    d.classList.add("open"); d.removeAttribute("hidden"); d.setAttribute("aria-hidden", "false");
    ov && ov.classList.add("open");
  }
  function closeDrawerTutor() {
    const d = qs("#drawer-tutor"), ov = qs("#gc-dash-overlay");
    if (!d) return;
    d.classList.remove("open"); d.setAttribute("hidden", ""); d.setAttribute("aria-hidden", "true");
    ov && ov.classList.remove("open");
    TS.current = null;
  }
  const cBtn = qs("#drawer-tutor-close");
  if (cBtn && !cBtn._bound) { cBtn._bound = true; cBtn.addEventListener("click", closeDrawerTutor); }
  const overlay = qs("#gc-dash-overlay");
  if (overlay && !overlay._bound) { overlay._bound = true; overlay.addEventListener("click", closeDrawerTutor); }
  if (!window._gc_tutor_esc) {
    window._gc_tutor_esc = true;
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawerTutor(); });
  }

  function setTutorMode(mode) {
    const v = qs("#tutor-view"), e = qs("#tutor-edit"), act = qs("#tutor-actions-view");
    if (mode === "view") { v && (v.hidden = false); e && (e.hidden = true); act && (act.style.display = ""); }
    else { v && (v.hidden = true); e && (e.hidden = false); act && (act.style.display = "none"); }
  }

  /* ======= Vista (solo lectura) ======= */
  async function mountTutorMediaView(containerEl, id) {
    if (!containerEl) return;
    const url = await resolveTutorImg(id);
    containerEl.innerHTML = `
      <div class="media-head">
        <div class="media-title">Foto</div>
        <div class="media-help" style="color:#888;">Solo lectura</div>
      </div>
      <div class="media-grid">
        <div class="media-card">
          <figure class="media-thumb" style="aspect-ratio:1/1">
            <img alt="Foto del tutor" id="tutor-foto-view" src="${esc(url)}" loading="eager">
          </figure>
          <div class="media-meta"><div class="media-label">Foto</div></div>
        </div>
      </div>`;
    const img = containerEl.querySelector("#tutor-foto-view");
    if (img) { img.onerror = () => { img.onerror = null; img.src = noImageSvgDataURI(); }; }
  }

  function put(sel, val) { const el = qs(sel); if (el) el.innerHTML = esc(val ?? "—"); }

  async function fillTutorView(t) {
    const title = qs("#drawer-tutor-title"); if (title) title.textContent = "Tutor · " + (t.nombre || "—");

    // Campos canónicos
    put("#tv_nombre", t.nombre);
    put("#tv_descripcion", t.descripcion);
    put("#tv_estatus", ({ "1": "Activo", "0": "Inactivo" }[String(t.estatus)] || t.estatus));
    put("#tv_fecha_creacion", t.fecha_creacion || "—");
    put("#tv_fecha_modif", t.fecha_modif || "—");

    // Foto opcional
    await mountTutorMediaView(qs("#media-tutor"), t.id);

    const pre = qs("#json-tutor"); if (pre) pre.textContent = JSON.stringify(t, null, 2);

    const bEdit = qs("#t-btn-edit");
    if (bEdit && !bEdit._bound) {
      bEdit._bound = true;
      bEdit.addEventListener("click", () => {
        setTutorMode("edit");
        fillTutorEdit(TS.current ? TS.current._all : t);
      });
    }
    const bDel = qs("#t-btn-delete");
    if (bDel && !bDel._bound) {
      bDel._bound = true;
      bDel.addEventListener("click", () => {
        const step = bDel.getAttribute("data-step") === "2" ? "1" : "2";
        bDel.setAttribute("data-step", step);
      });
    }
  }

  async function openTutorViewByObj(tutorObj) {
    TS.current = { id: tutorObj.id, _all: tutorObj };
    openDrawerTutor();
    setTutorMode("view");
    await fillTutorView(tutorObj);
  }

  function openTutorCreate() {
    const blank = {
      id: null,
      nombre: "",
      descripcion: "",
      estatus: 1,
      fecha_creacion: null,
      fecha_modif: null
    };
    TS.current = { id: null, _all: blank };
    openDrawerTutor();
    setTutorMode("edit");
    fillTutorEdit(blank);
  }

  /* ======= Edición ======= */
  function setVal(id, v) { const el = qs("#" + id); if (el) el.value = v == null ? "" : String(v); }
  function val(id) { return (qs("#" + id)?.value || "").trim(); }
  function putStatus(id, sel) {
    const el = qs("#" + id); if (!el) return;
    const opts = [{ v: 1, l: "Activo" }, { v: 0, l: "Inactivo" }];
    el.innerHTML = opts.map(o => `<option value="${o.v}"${+o.v === +sel ? " selected" : ""}>${o.l}</option>`).join("");
  }

  function fillTutorEdit(t) {
    setVal("t_nombre", t.nombre);
    setVal("t_descripcion", t.descripcion);
    putStatus("t_estatus", t.estatus);

    // Foto opcional (si usas edición de imagen)
    mountTutorMediaEdit(qs("#media-tutor-edit"), t.id);

    const bSave = qs("#t-btn-save"), bCancel = qs("#t-btn-cancel");
    if (bSave && !bSave._bound) { bSave._bound = true; bSave.addEventListener("click", saveTutor); }
    if (bCancel && !bCancel._bound) {
      bCancel._bound = true;
      bCancel.addEventListener("click", () => {
        setTutorMode("view");
        fillTutorView(TS.current ? TS.current._all : t);
      });
    }
  }

  // ===== Imagen (edición opcional) =====
  async function uploadTutorFoto(id, file) {
    const fd = new FormData();
    fd.append("tutor_id", String(id || 0));
    fd.append("imagen", file);
    const r = await fetch(TUPLOAD.foto, { method: "POST", body: fd });
    const t = await r.text().catch(() => "");
    if (!r.ok) throw new Error("HTTP " + r.status + " " + t);
    let j = null; try { j = JSON.parse(t); } catch { j = { _raw: t }; }
    return (j && j.url) ? String(j.url) : tutorImgUrl(id || 0);
  }
  function validarImagen(file, maxMB = 2) {
    if (!file) return { ok: false, error: "No seleccionaste archivo." };
    if (!/image\/(png|jpeg)/.test(file.type)) return { ok: false, error: "Formato no permitido. Usa JPG o PNG." };
    if (file.size > maxMB * 1024 * 1024) return { ok: false, error: `La imagen excede ${maxMB}MB.` };
    return { ok: true };
  }
  function previewOverlay(file, { onConfirm, onCancel }) {
    const url = URL.createObjectURL(file);
    const o = document.createElement("div");
    o.style.cssText = "position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(17,24,39,.55)";
    const m = document.createElement("div");
    m.style.cssText = "background:#fff;border-radius:14px;box-shadow:0 20px 40px rgba(0,0,0,.25);width:min(720px,94vw);max-height:90vh;overflow:hidden;display:flex;flex-direction:column;";
    m.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 16px;border-bottom:1px solid #eee;background:#f8fafc;">
        <div style="font-weight:700;">Vista previa de imagen</div>
        <button type="button" data-x="close" class="gc-btn gc-btn--ghost" style="min-width:auto;padding:.35rem .6rem;">✕</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 260px;gap:16px;padding:16px;align-items:start;">
        <div style="border:1px solid #eee;border-radius:12px;padding:8px;background:#fafafa;display:flex;align-items:center;justify-content:center;min-height:300px;max-height:60vh;">
          <img src="${url}" alt="Vista previa" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;">
        </div>
        <div style="border-left:1px dashed #e6e6e6;padding-left:16px;display:flex;flex-direction:column;gap:10px;">
          <div style="font-weight:600;">Detalles</div>
          <div style="font-size:.92rem;color:#444;line-height:1.35;">
            <div><strong>Archivo:</strong> ${esc(file.name)}</div>
            <div><strong>Peso:</strong> ${(file.size / 1048576).toFixed(2)} MB</div>
            <div><strong>Tipo:</strong> ${esc(file.type || "—")}</div>
            <div style="margin-top:6px;color:#666;">Formatos: JPG / PNG · Máx 2MB</div>
          </div>
          <div style="margin-top:auto;display:flex;gap:8px;flex-wrap:wrap;">
            <button class="gc-btn gc-btn--primary" data-x="ok">Subir</button>
            <button class="gc-btn gc-btn--ghost" data-x="cancel">Cancelar</button>
          </div>
        </div>
      </div>`;
    o.appendChild(m); document.body.appendChild(o); document.body.style.overflow = "hidden";
    function cleanup() { URL.revokeObjectURL(url); o.remove(); document.body.style.overflow = ""; }
    o.addEventListener("click", e => { if (e.target === o) { onCancel && onCancel(); cleanup(); } });
    m.querySelector('[data-x="close"]').addEventListener("click", () => { onCancel && onCancel(); cleanup(); });
    m.querySelector('[data-x="cancel"]').addEventListener("click", () => { onCancel && onCancel(); cleanup(); });
    m.querySelector('[data-x="ok"]').addEventListener("click", async () => { try { await onConfirm?.(); } finally { cleanup(); } });
  }
  function mountTutorMediaEdit(containerEl, id) {
    if (!containerEl) return;
    containerEl.innerHTML = `
      <div class="media-head">
        <div class="media-title">Foto</div>
        <div class="media-help">JPG/PNG · Máx 2MB</div>
      </div>
      <div class="media-grid">
        <div class="media-card">
          <figure class="media-thumb" style="aspect-ratio:1/1">
            <img alt="Foto del tutor" id="tutor-foto-edit" src="" loading="eager">
            <button class="icon-btn media-edit" type="button" title="Editar foto" aria-label="Editar foto">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"></path>
              </svg>
            </button>
          </figure>
          <div class="media-meta"><div class="media-label">Foto</div></div>
        </div>
      </div>`;
    const img = containerEl.querySelector("#tutor-foto-edit");
    const btn = containerEl.querySelector(".media-edit");

    (async () => { img.src = await resolveTutorImg(id); })();
    img.onerror = () => { img.onerror = null; img.src = noImageSvgDataURI(); };

    if (btn && !btn._bound) {
      btn._bound = true;
      btn.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file"; input.accept = "image/png,image/jpeg"; input.style.display = "none";
        document.body.appendChild(input);
        input.addEventListener("change", async () => {
          const file = input.files && input.files[0];
          input.remove();
          if (!file) return;
          const v = validarImagen(file, 2);
          if (!v.ok) { toast(v.error, "error"); return; }
          previewOverlay(file, {
            onCancel() { },
            async onConfirm() {
              try {
                const newUrl = await uploadTutorFoto(id, file);
                img.src = withBust(newUrl);
                toast("Foto actualizada", "exito");
              } catch (err) {
                console.error(err);
                toast("No se pudo subir la foto", "error");
              }
            }
          });
        });
        input.click();
      });
    }
  }

  async function saveTutor() {
    const body = {
      id: TS.current?.id ?? null,
      nombre:      val("t_nombre"),
      descripcion: val("t_descripcion"),
      estatus: Number((qs("#t_estatus")?.value ?? 1))
    };
    if (!body.nombre || !body.descripcion) {
      toast("Completa al menos nombre y descripción.", "error"); return;
    }
    try {
      if (body.id == null) {
        await postJSON(TAPI.iTutor, body);
        toast("Tutor creado", "exito");
      } else {
        await postJSON(TAPI.uTutor, body);
        toast("Tutor actualizado", "exito");
      }

      const updated = Object.assign({}, TS.current ? TS.current._all : {}, body);
      TS.current = { id: updated.id ?? TS.current?.id, _all: updated };

      setTutorMode("view");
      await fillTutorView(updated);
      // Opcional: refrescar listado con await tutoresInit();

    } catch (err) {
      console.error(err);
      toast("No se pudo guardar el tutor.", "error");
    }
  }

  /* ===================== Listado / Init: Tutores ===================== */
  async function tutoresInit() {
    
      console.log("dentro del init de tutores");
    try {
      console.log("dentro del init de turores");
      // 1) Obtener data
      let tutores = await postJSON(TAPI.tutores, {}).catch(() => []);
      if (!Array.isArray(tutores)) tutores = [];

      // 2) Render desktop (tabla)
      const $list = document.querySelector('#recursos-list');
      if ($list) {
        $list.innerHTML = '';
        tutores.forEach((t) => {
          const tr = document.createElement('tr');
          tr.className = 'gc-row';
          tr.innerHTML = `
            <td class="txt-ellipsis" title="${esc(t.nombre ?? '')}">${esc(t.nombre ?? '-')}</td>
            <td>${esc(t.fecha_creacion ?? '-')}</td>
            <td>${esc(({ "1": "Activo", "0": "Inactivo" }[String(t.estatus)] || t.estatus))}</td>
            <td><button class="gc-btn mini ver">Ver</button></td>
          `;
          tr.querySelector('.ver')?.addEventListener('click', () => {
            openTutorViewByObj(t);
          });
          $list.appendChild(tr);
        });
      }

      // 3) Render mobile (cards)
      const $listMobile = document.querySelector('#recursos-list-mobile');
      if ($listMobile) {
        $listMobile.innerHTML = '';
        tutores.forEach((t) => {
          const li = document.createElement('li');
          li.className = 'gc-card';
          li.innerHTML = `
            <div class="gc-card-title">${esc(t.nombre ?? '-')}</div>
            <div class="gc-card-sub">${esc(t.fecha_creacion ?? '-')}</div>
            <div class="gc-badges"><span class="gc-chip">${esc(({ "1": "Activo", "0": "Inactivo" }[String(t.estatus)] || t.estatus))}</span></div>
            <div class="gc-actions"><button class="gc-btn mini ver">Ver</button></div>
          `;
          li.querySelector('.ver')?.addEventListener('click', () => {
            openTutorViewByObj(t);
          });
          $listMobile.appendChild(li);
        });
      }
    } catch (err) {
      console.error('[Tutores] tutoresInit error:', err);
    }
  }

  // ===== Exponer al router y helpers públicos =====
  window.tutoresInit = tutoresInit;
  window.openTutorCreate = openTutorCreate;
  window.openTutorViewByObj = openTutorViewByObj;
  window.fillTutorView = fillTutorView;
  window.fillTutorEdit = fillTutorEdit;

})();
