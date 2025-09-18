(() => {
  "use strict";

  const TAG = "[Noticias]";

  /* ======================= Config / API ======================= */
  const API_BASE = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
  const API = {
    noticias:  API_BASE + "c_noticias.php",
    iNoticias: API_BASE + "i_noticias.php",
    uNoticias: API_BASE + "u_noticias.php",
    categorias: API_BASE + "c_categorias.php",        // si tu backend tiene otro catálogo para noticias, cámbialo aquí
    autores:    API_BASE + "c_tutor.php",             // 👈 si tienes “autores” propio, apunta al correcto
  };
  const API_UPLOAD = { noticiaImg: API_BASE + "u_noticiaImagenes.php" };

  /* ======================= Estado ======================= */
  const NS = {
    page: 1,
    pageSize: 7,
    search: "",
    data: [],          // noticias
    current: null,     // { id, _all }
    maps: { categorias: null, autores: null },
    tempImages: { 1: null, 2: null }, // archivos temporales en modo “crear”
  };
  window.__NoticiasState = NS;

  /* ======================= Const UI ======================= */
  const STATUS_LABEL = { 1: "Activa", 0: "Inactiva" };
  const ORDER_NOTICIAS = [1, 0]; // primero activas, luego inactivas

  /* ======================= Utils base ======================= */
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [].slice.call(r.querySelectorAll(s));
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c]));
  const normalize = s => String(s || "").normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().trim();
  const fmtDate = d => (!d ? "—" : String(d));

  function toast(msg, type = "info", ms = 2200) {
    if (window.gcToast) return window.gcToast(msg, type, ms);
    console.log(`${TAG} toast[${type}]:`, msg);
  }

  // creado_por desde cookie `usuario`
  function getCreatorId() {
    try {
      const raw = document.cookie.split("; ").find(r => r.startsWith("usuario="));
      if (!raw) { console.warn(TAG, "Cookie 'usuario' no encontrada"); return null; }
      const json = decodeURIComponent(raw.split("=")[1] || "");
      const u = JSON.parse(json);
      const n = Number(u?.id);
      if (Number.isFinite(n)) return n;
      console.warn(TAG, "Cookie 'usuario' no trae id numérico:", u?.id);
      return null;
    } catch (e) {
      console.error(TAG, "getCreatorId() error:", e);
      return null;
    }
  }

  async function postJSON(url, body) {
    console.log(TAG, "POST", url, { body });
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
    const text = await r.text().catch(() => "");
    console.log(TAG, "HTTP", r.status, "raw:", text);
    if (!r.ok) throw new Error(`HTTP ${r.status} ${text}`);

    try {
      const j = JSON.parse(text);
      console.log(TAG, "JSON OK:", j);
      return j;
    } catch {}

    // recorte defensivo
    const a=text.indexOf("{"), b=text.lastIndexOf("}"), c=text.indexOf("["), d=text.lastIndexOf("]");
    let cand = "";
    if (a!==-1 && b!==-1 && b>a) cand = text.slice(a,b+1);
    else if (c!==-1 && d!==-1 && d>c) cand = text.slice(c,d+1);
    if (cand) { try { const j2=JSON.parse(cand); console.warn(TAG,"JSON trimmed:", j2); return j2; } catch{} }

    return { _raw: text };
  }

  function withBust(u) {
    if (!u || typeof u!=="string" || u.startsWith("data:") || u.startsWith("blob:")) return u;
    try {
      const url = new URL(u, location.origin);
      url.searchParams.set("v", Date.now());
      return url.pathname + "?" + url.searchParams.toString();
    } catch {
      return u + (u.includes("?") ? "&" : "?") + "v=" + Date.now();
    }
  }

  // maps
  function arrToMap(arr) {
    const m = {};
    (Array.isArray(arr)?arr:[]).forEach(x => { m[x.id] = x.nombre || x.titulo || ("#" + x.id) });
    m._ts = Date.now();
    return m;
  }
  function mapToOptions(map, sel) {
    const ids = Object.keys(map || {}).filter(k => k!=="_ts");
    return ids.map(id => `<option value="${id}"${+id===+sel?" selected":""}>${esc(map[id])}</option>`).join("");
  }
  function mapLabel(map, id) {
    if (!map) return "—";
    const k = String(id ?? "");
    return (k in map) ? (map[k] ?? "—") : "—";
  }

  // expone utils (reutiliza si ya existen)
  window.gcUtils = Object.assign({}, window.gcUtils || {}, {
    qs,qsa,esc,normalize,fmtDate,toast,postJSON,withBust,arrToMap,mapToOptions,mapLabel
  });

  /* ======================= Imágenes ======================= */
  function noticiaImgUrl(id, pos=1) {
    // según tu uploader: /ASSETS/noticia/NoticiasImg/noticia_img{pos}_{id}.png
    return `/ASSETS/noticia/NoticiasImg/noticia_img${Number(pos)}_${Number(id)}.png`;
  }
  function noImageSvgDataURI() {
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M20 70 L60 35 L95 65 L120 50 L140 70' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }
  async function resolveNoticiaImg(id, pos) {
    const tryUrl = url => new Promise(res => { const i=new Image(); i.onload=()=>res(true); i.onerror=()=>res(false); i.src=url; });
    const url = withBust(noticiaImgUrl(id, pos));
    if (await tryUrl(url)) return url;
    return noImageSvgDataURI();
  }

  function validarImagen(file, maxMB=2) {
    if (!file) return { ok:false, error:"No seleccionaste archivo." };
    if (!/image\/(png|jpeg)/.test(file.type)) return { ok:false, error:"Formato no permitido. Usa JPG o PNG." };
    if (file.size > maxMB*1048576) return { ok:false, error:`La imagen excede ${maxMB}MB.` };
    return { ok:true };
  }

  async function uploadNoticiaImg(noticiaId, pos, file) {
    console.log(TAG, "uploadNoticiaImg →", { noticiaId, pos, file });
    const fd = new FormData();
    fd.append("noticia_id", String(noticiaId));
    fd.append("pos", String(pos));
    fd.append("imagen", file);
    const r = await fetch(API_UPLOAD.noticiaImg, { method:"POST", body: fd });
    const text = await r.text().catch(()=> "");
    console.log(TAG, "upload HTTP", r.status, "raw:", text);
    if (!r.ok) throw new Error("HTTP " + r.status + " " + text);
    let json = null; try { json = JSON.parse(text) } catch { json = { _raw:text } }
    console.log(TAG, "upload JSON:", json);
    if (json && json.ok && json.url) return String(json.url);
    if (json && json.url) return String(json.url);
    return noticiaImgUrl(noticiaId, pos);
  }

  /* ======================= Drawer helpers ======================= */
  function openDrawerNoticia() {
    console.log(TAG, "openDrawerNoticia()");
    const d = qs("#drawer-noticia"), ov = qs("#gc-dash-overlay");
    if (!d) return;
    d.classList.add("open"); d.removeAttribute("hidden"); d.setAttribute("aria-hidden","false");
    ov && ov.classList.add("open");
  }
  function closeDrawerNoticia() {
    console.log(TAG, "closeDrawerNoticia()");
    const d = qs("#drawer-noticia"), ov = qs("#gc-dash-overlay");
    if (!d) return;
    d.classList.remove("open"); d.setAttribute("hidden",""); d.setAttribute("aria-hidden","true");
    ov && ov.classList.remove("open");
    NS.current = null;
  }
  // binds cerrar (una vez)
  qsa("#drawer-noticia-close").forEach(b => {
    if (!b._b) { b._b = true; b.addEventListener("click", closeDrawerNoticia); }
  });

  function setNoticiaDrawerMode(mode) {
    console.log(TAG, "setNoticiaDrawerMode:", mode);
    const v = qs("#noticia-view"), e = qs("#noticia-edit"), act = qs("#noticia-actions-view");
    if (mode==="view") { v && (v.hidden=false); e && (e.hidden=true); act && (act.style.display=""); }
    else { v && (v.hidden=true); e && (e.hidden=false); act && (act.style.display="none"); }
  }
  window.setNoticiaDrawerMode = setNoticiaDrawerMode;

  /* ======================= Catálogos + Listado ======================= */
  async function loadCatalogos() {
    console.log(TAG, "loadCatalogos()...");
    if (!NS.maps.categorias) NS.maps.categorias = arrToMap(await postJSON(API.categorias, { estatus:1 }).catch(()=>[]));
    if (!NS.maps.autores)    NS.maps.autores    = arrToMap(await postJSON(API.autores,    { estatus:1 }).catch(()=>[]));
    console.log(TAG, "Catálogos OK:", NS.maps);
  }

  async function loadNoticias() {
    console.log(TAG, "loadNoticias()...");
    const chunks = await Promise.all(ORDER_NOTICIAS.map(st => postJSON(API.noticias, { estatus: st }).catch(()=>[])));
    const flat = [];
    ORDER_NOTICIAS.forEach((st,i)=> { flat.push(...(Array.isArray(chunks[i]) ? chunks[i] : [])); });
    NS.data = flat;
    NS.page = 1;
    console.log(TAG, "Noticias cargadas:", NS.data.length);
    renderNoticias();
  }

  function renderNoticias() {
    console.log(TAG, "renderNoticias() page", NS.page, "search=", NS.search);
    const hostD = qs("#noticias-list");
    const hostM = qs("#noticias-list-mobile");
    if (hostD) hostD.innerHTML = "";
    if (hostM) hostM.innerHTML = "";

    const term = normalize(NS.search);
    const filtered = term ? NS.data.filter(row => normalize(JSON.stringify(row)).includes(term)) : NS.data;

    const count = qs("#noticias-count");
    if (count) { const n = filtered.length; count.textContent = `${n} ${n===1?"elemento":"elementos"}`; }

    const totalPages = Math.max(1, Math.ceil(filtered.length / NS.pageSize));
    if (NS.page > totalPages) NS.page = totalPages;
    const start = (NS.page - 1) * NS.pageSize;
    const pageRows = filtered.slice(start, start + NS.pageSize);

    // Desktop
    if (hostD) {
      if (pageRows.length===0) {
        hostD.insertAdjacentHTML("beforeend", `<div class="table-row"><div class="col-nombre">Sin resultados</div></div>`);
      } else {
        pageRows.forEach(it => {
          const est = STATUS_LABEL[it.estatus] || it.estatus;
          hostD.insertAdjacentHTML("beforeend", `
            <div class="table-row" role="row" data-id="${it.id}">
              <div class="col-nombre" role="cell">${esc(it.titulo || "-")}</div>
              <div class="col-fecha" role="cell">${esc(fmtDate(it.fecha_publicacion))}</div>
              <div class="col-status" role="cell" id="noticia-status-${it.id}">${esc(est)}</div>
            </div>
          `);
        });
        qsa(".table-row", hostD).forEach(row => {
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
      if (pageRows.length===0) {
        hostM.insertAdjacentHTML("beforeend", `<div class="table-row"><div class="col-nombre">Sin resultados</div></div>`);
      } else {
        pageRows.forEach(it => {
          hostM.insertAdjacentHTML("beforeend", `
            <div class="table-row-mobile" data-id="${it.id}">
              <div class="row-head">
                <div class="title">${esc(it.titulo || "-")}</div>
                <button class="open-drawer gc-btn" type="button">Ver</button>
              </div>
            </div>
          `);
        });
        qsa(".open-drawer", hostM).forEach(btn => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = Number(btn.closest(".table-row-mobile")?.dataset.id || 0);
            console.log(TAG, "open mobile id=", id);
            if (id) openNoticiaView(id);
          });
        });
      }
    }

    renderNoticiasPagination(filtered.length);
  }

  function renderNoticiasPagination(total) {
    const totalPages = Math.max(1, Math.ceil(total / NS.pageSize));
    [qs("#noticias-pagination-controls"), qs("#noticias-pagination-mobile")].forEach(cont => {
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
      cont.appendChild(mk("‹", NS.page===1, ()=>{ NS.page=Math.max(1,NS.page-1); renderNoticias(); }, "arrow-btn"));
      for (let p=1; p<=totalPages && p<=7; p++) {
        const b = mk(String(p), false, ()=>{ NS.page=p; renderNoticias(); });
        if (p===NS.page) b.classList.add("active");
        cont.appendChild(b);
      }
      cont.appendChild(mk("›", NS.page===totalPages, ()=>{ NS.page=Math.min(totalPages,NS.page+1); renderNoticias(); }, "arrow-btn"));
    });
  }

  const searchInput = qs("#search-noticias-input");
  if (searchInput && !searchInput._b) {
    searchInput._b = true;
    searchInput.addEventListener("input", e => {
      NS.search = e.target.value || "";
      NS.page = 1;
      renderNoticias();
    });
  }

  /* ======================= VISTA (drawer) ======================= */
  function put(sel, val) { const el = qs(sel); if (el) el.innerHTML = esc(val ?? "—"); }

  async function mountNoticiaMediaView(containerEl, id) {
    if (!containerEl) return;
    const u1 = await resolveNoticiaImg(id, 1);
    const u2 = await resolveNoticiaImg(id, 2);
    containerEl.innerHTML = `
      <div class="media-head"><div class="media-title">Imágenes</div><div class="media-help" style="color:#888;">Solo lectura</div></div>
      <div class="media-grid">
        <div class="media-card"><figure class="media-thumb"><img id="noti-img-1" alt="Imagen 1" loading="eager" src="${esc(u1)}"></figure><div class="media-meta"><div class="media-label">Imagen 1</div></div></div>
        <div class="media-card"><figure class="media-thumb"><img id="noti-img-2" alt="Imagen 2" loading="eager" src="${esc(u2)}"></figure><div class="media-meta"><div class="media-label">Imagen 2</div></div></div>
      </div>
    `;
    ["#noti-img-1", "#noti-img-2"].forEach(sel=>{
      const img = containerEl.querySelector(sel);
      if (img) img.onerror = () => { img.onerror=null; img.src=noImageSvgDataURI(); };
    });
  }

  function updateRowStatusCell(id, estatus) {
    const c = qs(`#noticia-status-${id}`);
    if (c) c.textContent = STATUS_LABEL[estatus] || estatus;
  }

  function paintActions(it) {
    const cont = qs("#noticia-actions-view");
    if (!cont) return;
    cont.innerHTML = "";

    // Botón Editar
    const editBtn = document.createElement("button");
    editBtn.id = "btn-noticia-edit";
    editBtn.className = "gc-btn";
    editBtn.textContent = "Editar";
    editBtn.addEventListener("click", () => {
      setNoticiaDrawerMode("edit");
      fillNoticiaEdit(NS.current ? NS.current._all : it);
    });
    cont.appendChild(editBtn);

    // Botón Activar/Desactivar
    const toggleBtn = document.createElement("button");
    toggleBtn.id = "btn-noticia-toggle";
    if (+it.estatus === 0) {
      // Reactivar
      toggleBtn.className = "gc-btn gc-btn--success";
      toggleBtn.textContent = "Reactivar";
      toggleBtn.addEventListener("click", () => toggleStatusFlow(toggleBtn, it, true));
    } else {
      // Eliminar (soft) con confirmación de 2 pasos
      toggleBtn.className = "gc-btn gc-btn--danger";
      toggleBtn.textContent = "Eliminar";
      toggleBtn.dataset.confirm = "0";
      let t = null;
      toggleBtn.addEventListener("click", async () => {
        if (toggleBtn.dataset.confirm !== "1") {
          toggleBtn.dataset.confirm = "1";
          toggleBtn.textContent = "¿Confirmar?";
          if (t) clearTimeout(t);
          t = setTimeout(() => { toggleBtn.dataset.confirm="0"; toggleBtn.textContent="Eliminar"; }, 3000);
          return;
        }
        if (t) { clearTimeout(t); t = null; }
        await toggleStatusFlow(toggleBtn, it, false);
      });
    }
    cont.appendChild(toggleBtn);
  }

  async function fillNoticiaView(it) {
    console.log(TAG, "fillNoticiaView id=", it?.id, it);
    const title = qs("#drawer-noticia-title");
    if (title) title.textContent = "Noticia · " + (it.titulo || "—");

    put("#v_titulo", it.titulo);
    put("#v_resumen", it.resumen);
    put("#v_contenido", it.contenido);
    put("#v_autor", mapLabel(NS.maps.autores, it.autor));
    put("#v_categoria", mapLabel(NS.maps.categorias, it.categoria));
    put("#v_fecha_pub", fmtDate(it.fecha_publicacion));
    put("#v_estatus", STATUS_LABEL[it.estatus] || it.estatus);

    await mountNoticiaMediaView(qs("#media-noticia"), it.id);
    paintActions(it);
  }
  window.fillNoticiaView = fillNoticiaView;

  async function openNoticiaView(id) {
    const it = (NS.data || []).find(x => +x.id === +id);
    console.log(TAG, "openNoticiaView id=", id, "found:", !!it);
    if (!it) return;
    NS.current = { id: it.id, _all: it };
    openDrawerNoticia();
    setNoticiaDrawerMode("view");
    await fillNoticiaView(it);
  }
  window.openNoticiaView = openNoticiaView;

  /* ======================= EDICIÓN (drawer) ======================= */
  function setVal(id, v) { const el = qs("#"+id); if (el) el.value = v==null ? "" : String(v); }
  function val(id) { return (qs("#"+id)?.value || "").trim(); }
  function num(id) { const v=val(id); return v==="" ? null : Number(v); }

  function putSelect(id, map, sel) {
    const el = qs("#"+id);
    if (!el) return;
    el.innerHTML = mapToOptions(map || {}, sel);
  }

  function mountNoticiaMediaEdit(containerEl, id) {
    if (!containerEl) return;
    containerEl.innerHTML = `
      <div class="media-head"><div class="media-title">Imágenes</div><div class="media-help">JPG/PNG · Máx 2MB</div></div>
      <div class="media-grid">
        <div class="media-card">
          <figure class="media-thumb">
            <img id="noti-cover-1" alt="Imagen 1" loading="eager" src="">
            <button class="icon-btn media-edit" data-pos="1" type="button" title="Editar imagen 1" aria-label="Editar imagen 1">
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
            </button>
          </figure>
          <div class="media-meta"><div class="media-label">Imagen 1</div></div>
        </div>

        <div class="media-card">
          <figure class="media-thumb">
            <img id="noti-cover-2" alt="Imagen 2" loading="eager" src="">
            <button class="icon-btn media-edit" data-pos="2" type="button" title="Editar imagen 2" aria-label="Editar imagen 2">
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
            </button>
          </figure>
          <div class="media-meta"><div class="media-label">Imagen 2</div></div>
        </div>
      </div>
    `;

    const img1 = containerEl.querySelector("#noti-cover-1");
    const img2 = containerEl.querySelector("#noti-cover-2");

    if (id) {
      (async () => {
        img1.src = await resolveNoticiaImg(id,1);
        img2.src = await resolveNoticiaImg(id,2);
      })();
      [img1,img2].forEach(img => { if (img) img.onerror = ()=>{ img.onerror=null; img.src=noImageSvgDataURI(); }; });
    } else {
      // crear: placeholder + si hay buffers
      img1.src = NS.tempImages[1] ? URL.createObjectURL(NS.tempImages[1]) : noImageSvgDataURI();
      img2.src = NS.tempImages[2] ? URL.createObjectURL(NS.tempImages[2]) : noImageSvgDataURI();
    }

    // bind lápices
    qsa(".media-edit", containerEl).forEach(btn => {
      if (btn._b) return;
      btn._b = true;
      btn.addEventListener("click", () => {
        const pos = Number(btn.dataset.pos);
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

          const imgEl = pos===1 ? img1 : img2;

          if (!id) {
            // noticia nueva: guarda buffer y previsualiza
            NS.tempImages[pos] = file;
            const u = URL.createObjectURL(file);
            imgEl.src = withBust(u);
            toast(`Imagen ${pos} lista; se subirá al guardar.`, "info");
            return;
          }

          // noticia existente: sube de inmediato
          try {
            const newUrl = await uploadNoticiaImg(id, pos, file);
            imgEl.src = withBust(newUrl);
            toast(`Imagen ${pos} actualizada`, "exito");
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

    setVal("n_titulo", n.titulo);
    setVal("n_resumen", n.resumen);
    setVal("n_contenido", n.contenido);
    setVal("n_fecha_pub", n.fecha_publicacion);

    putSelect("n_autor", NS.maps.autores, n.autor);
    putSelect("n_categoria", NS.maps.categorias, n.categoria);

    // Estatus (0/1)
    const sel = qs("#n_estatus");
    if (sel) sel.innerHTML = [{v:1,l:"Activa"},{v:0,l:"Inactiva"}].map(o=>`<option value="${o.v}"${+o.v===+n.estatus?" selected":""}>${o.l}</option>`).join("");

    mountNoticiaMediaEdit(qs("#media-noticia-edit"), n.id);

    // Acciones
    const bSave = qs("#btn-noticia-save");
    const bCancel = qs("#btn-noticia-cancel");
    if (bSave && !bSave._b) { bSave._b = true; bSave.addEventListener("click", saveNoticia); }
    if (bCancel && !bCancel._b) {
      bCancel._b = true;
      bCancel.addEventListener("click", () => {
        setNoticiaDrawerMode("view");
        fillNoticiaView(NS.current ? NS.current._all : n);
      });
    }
  }
  window.fillNoticiaEdit = fillNoticiaEdit;

  /* ======================= Activar / Desactivar ======================= */
  async function updateNoticiaStatus(id, estatus) {
    try {
      const payload = { id: Number(id), estatus: Number(estatus) };
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

  async function toggleStatusFlow(btn, it, toActive) {
    if (!NS.current?.id) { toast("No hay noticia activa.", "error"); return; }

    // UI optimista
    btn.disabled = true;
    const prev = it.estatus;
    it.estatus = toActive ? 1 : 0;

    // pinta vista + fila
    updateRowStatusCell(it.id, it.estatus);
    paintActions(it);
    put("#v_estatus", STATUS_LABEL[it.estatus] || it.estatus);

    const ok = await updateNoticiaStatus(it.id, it.estatus);
    btn.disabled = false;

    if (!ok) {
      // revertir
      it.estatus = prev;
      updateRowStatusCell(it.id, it.estatus);
      paintActions(it);
      put("#v_estatus", STATUS_LABEL[it.estatus] || it.estatus);
      return;
    }

    toast(toActive ? "Noticia reactivada" : "Noticia movida a Inactiva", "exito");

    // reordenar lista sin fetch completo
    NS.data.sort((a,b) => {
      const ao = ORDER_NOTICIAS.indexOf(+a.estatus), bo = ORDER_NOTICIAS.indexOf(+b.estatus);
      if (ao!==bo) return ao - bo;
      return String(b.id).localeCompare(String(a.id)); // opcional: id desc
    });
    renderNoticias();
  }

  /* ======================= Guardar (insert/update) ======================= */
  async function saveNoticia() {
    const body = {
      id: NS.current?.id ?? null,
      titulo: val("n_titulo"),
      resumen: val("n_resumen"),
      contenido: val("n_contenido"),
      autor: num("n_autor"),
      categoria: num("n_categoria"),
      fecha_publicacion: val("n_fecha_pub"),
      estatus: num("n_estatus"),
    };
    console.log(TAG, "saveNoticia() body=", body);

    if (!body.titulo || !body.resumen || !body.contenido) {
      toast("Completa al menos Título, Resumen y Contenido.", "error");
      return;
    }

    try {
      let newId = body.id;

      if (body.id == null) {
        // Insert
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

        newId = Number(res?.id ?? res?.noticia_id ?? res?.insert_id ?? res?.data?.id ?? 0);
        console.log(TAG, "Nuevo ID noticia:", newId);

        // subir imágenes pendientes
        for (const pos of [1,2]) {
          const f = NS.tempImages[pos];
          if (newId && f instanceof File) {
            try {
              const url = await uploadNoticiaImg(newId, pos, f);
              console.log(TAG, `Imagen ${pos} subida`, url);
              NS.tempImages[pos] = null;
            } catch(e) {
              console.error(TAG, `Upload pos ${pos} falló:`, e);
              toast(`La imagen ${pos} no se pudo subir.`, "error");
            }
          }
        }
      } else {
        // Update
        console.log(TAG, "Actualizando noticia id=", body.id);
        const resU = await postJSON(API.uNoticias, body);
        console.log(TAG, "Respuesta update:", resU);
        if (resU && resU.error) { toast(resU.error, "error"); return; }
      }

      toast("Noticia guardada", "exito");

      // Refresca en memoria: si quieres fetch completo usa loadNoticias(), aquí hacemos “merge” rápido
      if (newId && !body.id) {
        NS.data.unshift({ ...body, id: newId }); // push optimista
      }
      // Si existe, vuelve a pedir listado para asegurar orden y datos (puedes cambiar esto por un merge fino)
      await loadNoticias();

      const idToOpen = newId || body.id;
      const it = (NS.data || []).find(x => +x.id === +idToOpen) || NS.data[0];
      console.log(TAG, "Reabrir id=", idToOpen, "found:", !!it);
      if (it) {
        NS.current = { id: it.id, _all: it };
        setNoticiaDrawerMode("view");
        await fillNoticiaView(it);
      }
    } catch (err) {
      console.error(TAG, "saveNoticia ERROR:", err);
      toast("No se pudo guardar.", "error");
    }
  }
  window.saveNoticia = saveNoticia;

  /* ======================= API pública (router-lite) ======================= */
  async function mount() {
    console.log(TAG, "mount() INICIO");
    try {
      const hostD = qs("#noticias-list");
      if (hostD) hostD.innerHTML = `<div class="table-row"><div class="col-nombre">Cargando…</div></div>`;
      await loadCatalogos();
      await loadNoticias();

      const s = qs("#search-noticias-input");
      if (s && !s._b) {
        s._b = true;
        s.addEventListener("input", e => {
          NS.search = e.target.value || "";
          NS.page = 1;
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
      id:null, titulo:"", resumen:"", contenido:"",
      autor:null, categoria:null, fecha_publicacion:"", estatus:1
    };
    NS.current = { id:null, _all: blank };
    openDrawerNoticia();
    setNoticiaDrawerMode("edit");
    fillNoticiaEdit(blank);
  }

  window.noticias = { mount, openCreate: openNoticiaCreate };

  console.log(TAG, "Módulo noticias cargado.");
})();
