/* ==================== BLOQUE 0: Núcleo (config, estado, utils, imágenes, drawer) ==================== */
(() => {
  "use strict";

  /* ----- Config/API (solo cursos por ahora) ----- */
  const API_BASE = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
  const API = {
    cursos:     API_BASE + "c_cursos.php",
    iCursos:    API_BASE + "i_cursos.php",
    uCursos:    API_BASE + "u_cursos.php",
    tutores:    API_BASE + "c_tutor.php",
    prioridad:  API_BASE + "c_prioridad.php",
    categorias: API_BASE + "c_categorias.php",
    calendario: API_BASE + "c_dias_curso.php",
    tipoEval:   API_BASE + "c_tipo_evaluacion.php",
    actividades:API_BASE + "c_actividades.php",
  };
  const API_UPLOAD = { cursoImg: API_BASE + "u_cursoImg.php" };

  /* ----- Estado local (cursos) ----- */
  const S = {
    page: 1, pageSize: 7, search: "",
    data: [],            // cursos en orden
    current: null,       // curso seleccionado { id, _all }
    maps: {              // catálogos cacheados
      tutores: null, prioridad: null, categorias: null,
      calendario: null, tipoEval: null, actividades: null
    }
  };
  window.__CursosState = S;          // útil para debug
  window.API = API;                  // expone endpoints
  window.API_UPLOAD = API_UPLOAD;    // expone upload

  /* ----- Utils DOM/format ----- */
  const qs=(s,r=document)=>r.querySelector(s);
  const qsa=(s,r=document)=>[].slice.call(r.querySelectorAll(s));
  const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c]));
  const fmtMoney = n => isFinite(+n) ? new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(+n) : "-";
  const fmtBool = v => (+v===1 || v===true || v==="1") ? "Sí" : "No";
  const fmtDate = d => !d ? "-" : String(d);

  /* ----- Etiquetas de estatus y orden de concatenación ----- */
  const STATUS_LABEL = { 1:"Activo", 0:"Inactivo", 2:"Pausado", 3:"Terminado", 4:"En curso", 5:"Cancelado" };
  const ORDER_CURSOS = [1,0,2,3,4,5];

  /* ----- HTTP JSON ----- */
  async function postJSON(url, body){
    const r = await fetch(url,{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body||{})});
    const t = await r.text().catch(()=> "");
    if(!r.ok) throw new Error("HTTP "+r.status+" "+t);
    if(!t.trim()) return {};
    try{ return JSON.parse(t) } catch { return { _raw:t } }
  }

  /* ----- Cache-bust seguro (no tocar data: ni blob:) ----- */
  function withBust(u){
    if (!u || typeof u !== "string" || u.startsWith("data:") || u.startsWith("blob:")) return u;
    try{
      const url = new URL(u, location.origin);
      url.searchParams.set("v", Date.now());
      return url.pathname + "?" + url.searchParams.toString();
    }catch{
      const sep = u.includes("?") ? "&" : "?";
      return u + sep + "v=" + Date.now();
    }
  }

  /* ----- Imagen de curso + fallbacks ----- */
  function cursoImgUrl(id, ext="png"){ return `/ASSETS/cursos/img${Number(id)}.${ext}`; }
  function gcNoImageSvg(){
    return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M20 70 L60 35 L95 65 L120 50 L140 70' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>";
  }
  function gcSvgDataUri(svg){ return "data:image/svg+xml;utf8," + encodeURIComponent(svg); }

  // Fuerza cadena de fallbacks: PNG → JPG → SVG data:
  function ensureCourseCover(imgEl, cursoId){
    if(!imgEl) return;
    const png = withBust(cursoImgUrl(cursoId, "png"));
    const jpg = withBust(cursoImgUrl(cursoId, "jpg"));

    imgEl.dataset._state = "png";
    imgEl.loading = "eager";
    imgEl.decoding = "async";

    imgEl.onerror = () => {
      if (imgEl.dataset._state === "png"){
        imgEl.dataset._state = "jpg";
        imgEl.src = jpg;
        return;
      }
      if (imgEl.dataset._state === "jpg"){
        imgEl.dataset._state = "svg";
        imgEl.src = gcSvgDataUri(gcNoImageSvg());
        imgEl.onerror = null;
        return;
      }
      imgEl.onerror = null;
      imgEl.src = gcSvgDataUri(gcNoImageSvg());
    };

    imgEl.src = png;
  }

  /* ----- Overlay + Drawer helpers (compartidos) ----- */
  function openDrawerCurso(){
    const d=qs("#drawer-curso"), ov=qs("#gc-dash-overlay");
    if(!d) return;
    d.classList.add("open"); d.removeAttribute("hidden"); d.setAttribute("aria-hidden","false");
    ov && ov.classList.add("open");
  }
  function closeDrawerCurso(){
    const d=qs("#drawer-curso"), ov=qs("#gc-dash-overlay");
    if(!d) return;
    d.classList.remove("open"); d.setAttribute("hidden",""); d.setAttribute("aria-hidden","true");
    ov && ov.classList.remove("open");
    S.current = null;
  }
  qsa("#drawer-curso-close").forEach(b=>b.addEventListener("click", closeDrawerCurso));
  qsa("#gc-dash-overlay").forEach(ov=>ov.addEventListener("click", closeDrawerCurso));
  document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ closeDrawerCurso(); }});

  // export utilidades que usarán los otros bloques
  window.gcUtils = {
    qs, qsa, esc, fmtMoney, fmtBool, fmtDate,
    STATUS_LABEL, ORDER_CURSOS,
    postJSON, withBust,
    cursoImgUrl, ensureCourseCover,
    openDrawerCurso, closeDrawerCurso
  };

  // === Utils (añadir junto con los demás) ===
function mapLabel(map, id){
  if (!map) return "-";
  const k = String(id ?? "");
  return (k in map) ? (map[k] ?? "-") : "-";
}

// Si ya tienes window.gcUtils, solo añade estas claves:
window.gcUtils = Object.assign(window.gcUtils || {}, {
  mapLabel,
});
})();


/* ==================== BLOQUE 1: Carga de catálogos, cursos y render de listado ==================== */
(() => {
  "use strict";

  // Estado y utilidades expuestas por el BLOQUE 0
  const S = window.__CursosState;
  const {
    qs, qsa, esc, fmtDate,
    STATUS_LABEL, ORDER_CURSOS,
    postJSON,
  } = window.gcUtils;
  const API = window.API;

  /* ----- Catálogos (cacheados) ----- */
  function arrToMap(arr){
    const m = {};
    (Array.isArray(arr)?arr:[]).forEach(x=>{
      m[x.id] = x.nombre || x.titulo || ("#"+x.id);
    });
    m._ts = Date.now();
    return m;
  }

  async function loadCatalogos(){
    if(!S.maps.tutores)    S.maps.tutores    = arrToMap(await postJSON(API.tutores,    { estatus:1 }).catch(()=>[]));
    if(!S.maps.prioridad)  S.maps.prioridad  = arrToMap(await postJSON(API.prioridad,  { estatus:1 }).catch(()=>[]));
    if(!S.maps.categorias) S.maps.categorias = arrToMap(await postJSON(API.categorias, { estatus:1 }).catch(()=>[]));
    if(!S.maps.calendario) S.maps.calendario = arrToMap(await postJSON(API.calendario, { estatus:1 }).catch(()=>[]));
    if(!S.maps.tipoEval)   S.maps.tipoEval   = arrToMap(await postJSON(API.tipoEval,   { estatus:1 }).catch(()=>[]));
    if(!S.maps.actividades)S.maps.actividades= arrToMap(await postJSON(API.actividades,{ estatus:1 }).catch(()=>[]));
  }

  /* ----- Descarga cursos por estatus y concatena en orden ----- */
  async function loadCursos(){
    const chunks = await Promise.all(
      ORDER_CURSOS.map(st => postJSON(API.cursos, { estatus: st }).catch(()=>[]))
    );
    const flat = [];
    ORDER_CURSOS.forEach((st,i)=> { flat.push(...(Array.isArray(chunks[i])?chunks[i]:[])); });
    S.data = flat;
    S.page = 1;
    renderCursos();
  }
  window.cursosLoad = { loadCatalogos, loadCursos }; // opcional para debug
 

  function renderCursos(){
    const hostD = qs("#recursos-list");
    const hostM = qs("#recursos-list-mobile");
    if(hostD) hostD.innerHTML = "";
    if(hostM) hostM.innerHTML = "";

    const term = normalize(S.search);
    const filtered = term
      ? S.data.filter(row => normalize(JSON.stringify(row)).includes(term))
      : S.data;

    // meta
    const modCount = qs("#mod-count");
    if(modCount){
      const n = filtered.length;
      modCount.textContent = `${n} ${n===1?"elemento":"elementos"}`;
    }

    // paginación
    const totalPages = Math.max(1, Math.ceil(filtered.length / S.pageSize));
    if(S.page > totalPages) S.page = totalPages;
    const start = (S.page - 1) * S.pageSize;
    const pageRows = filtered.slice(start, start + S.pageSize);

    // Desktop
    if(hostD){
      pageRows.forEach(it=>{
        const est = STATUS_LABEL[it.estatus] || it.estatus;
        hostD.insertAdjacentHTML("beforeend", `
          <div class="table-row" role="row" data-id="${it.id}">
            <div class="col-nombre" role="cell">${esc(it.nombre || "-")}</div>
            <div class="col-tutor" role="cell">${esc(mapLabel(S.maps.tutores, it.tutor))}</div>
            <div class="col-fecha" role="cell">${esc(fmtDate(it.fecha_inicio))}</div>
            <div class="col-status" role="cell">${esc(est)}</div>
          </div>
        `);
      });
      qsa(".table-row", hostD).forEach(row=>{
        row.addEventListener("click", ()=> {
          const id = Number(row.dataset.id);
          if(typeof window.openCursoView === "function"){
            window.openCursoView(id);
          }
        });
      });
    }

    // Mobile (compacto)
    if(hostM){
      pageRows.forEach(it=>{
        hostM.insertAdjacentHTML("beforeend", `
          <div class="table-row-mobile" data-id="${it.id}">
            <div class="row-head">
              <div class="title">${esc(it.nombre || "-")}</div>
              <button class="open-drawer gc-btn" type="button">Ver</button>
            </div>
          </div>
        `);
      });
      qsa(".open-drawer", hostM).forEach(btn=>{
        btn.addEventListener("click", (e)=>{
          e.stopPropagation();
          const id = Number(btn.closest(".table-row-mobile")?.dataset.id || 0);
          if(id && typeof window.openCursoView === "function"){
            window.openCursoView(id);
          }
        });
      });
    }

    renderPagination(filtered.length);
  }
  window.cursosRender = { renderCursos }; // opcional para debug

  /* ----- Paginación ----- */
  function renderPagination(total){
    const totalPages = Math.max(1, Math.ceil(total / S.pageSize));
    [qs("#pagination-controls"), qs("#pagination-mobile")].forEach(cont=>{
      if(!cont) return;
      cont.innerHTML = "";
      if(totalPages <= 1) return;

      const mkBtn=(txt,dis,cb,cls="")=>{
        const b=document.createElement("button");
        b.textContent = txt;
        b.className = (cls||"page-btn") + (dis?" disabled":"");
        if(dis) b.disabled = true; else b.onclick = cb;
        return b;
      };

      cont.appendChild(mkBtn("‹", S.page===1, ()=>{ S.page=Math.max(1,S.page-1); renderCursos(); }, "arrow-btn"));

      // primeras 7 (simple)
      for(let p=1; p<=totalPages && p<=7; p++){
        const b = mkBtn(String(p), false, ()=>{ S.page=p; renderCursos(); });
        if(p===S.page) b.classList.add("active");
        cont.appendChild(b);
      }

      cont.appendChild(mkBtn("›", S.page===totalPages, ()=>{ S.page=Math.min(totalPages,S.page+1); renderCursos(); }, "arrow-btn"));
    });
  }

  /* ----- Búsqueda ----- */
  function normalize(s){
    return String(s||"")
      .normalize("NFD")
      .replace(/\p{M}/gu,"")
      .toLowerCase()
      .trim();
  }
  const searchInput = qs("#search-input");
  if(searchInput){
    searchInput.addEventListener("input", e=>{
      S.search = e.target.value || "";
      S.page = 1;
      renderCursos();
    });
  }

  /* ----- Crear curso (botón + flujo) ----- */
  const btnAdd = qs("#btn-add");
  if(btnAdd){
    btnAdd.addEventListener("click", ()=>{
      // Curso en blanco; los bloques 2/3 decidirán cómo abrir edición
      const blank = {
        id:null, nombre:"", descripcion_breve:"", descripcion_curso:"", descripcion_media:"",
        dirigido:"", competencias:"", tutor:"", horas:"", precio:"", estatus:1, fecha_inicio:"",
        prioridad:"", categoria:"", calendario:"", tipo_evaluacion:"", actividades:"", certificado:0
      };
      S.current = { id:null, _all: blank };

      // Si ya están cargados los helpers del drawer, inténtalo:
      if(typeof window.openDrawerCurso === "function") window.openDrawerCurso();
      if(typeof window.setDrawerMode === "function") window.setDrawerMode("edit");
      if(typeof window.fillCursoEdit === "function") window.fillCursoEdit(blank);

      // Si el bloque 3 no se ha cargado aún, no pasa nada; al cargar podrá usar S.current
    });
  }

  /* ----- Bootstrap inicial ----- */
  (async function init(){
    try{
      await loadCatalogos();
      await loadCursos();
    }catch(err){
      console.error("Error cargando cursos:", err);
    }
  })();

})();


/* ==================== BLOQUE 2: Drawer de Vista (solo lectura) ==================== */
(() => {
  "use strict";

  // Estado + utils definidos en el Bloque 0
  const S = window.__CursosState;
  const {
    qs, qsa, esc, fmtMoney, fmtBool, fmtDate,
    STATUS_LABEL, mapLabel,
    withBust, cursoImgUrl, resolveCursoImg, noImageSvgDataURI,
  } = window.gcUtils;

  /* ---------- Apertura / cierre del drawer (compartido) ---------- */
  function openDrawerCurso(){
    const d = qs("#drawer-curso");
    const ov = qs("#gc-dash-overlay");
    if(!d) return;
    d.classList.add("open");
    d.removeAttribute("hidden");
    d.setAttribute("aria-hidden","false");
    if(ov) ov.classList.add("open");
  }
  function closeDrawerCurso(){
    const d = qs("#drawer-curso");
    const ov = qs("#gc-dash-overlay");
    if(!d) return;
    d.classList.remove("open");
    d.setAttribute("hidden","");
    d.setAttribute("aria-hidden","true");
    if(ov) ov.classList.remove("open");
    S.current = null;
  }
  // binds (una sola vez)
  const closeBtn = qs("#drawer-curso-close");
  if(closeBtn && !closeBtn._bound){ closeBtn._bound = true; closeBtn.addEventListener("click", closeDrawerCurso); }
  const overlay = qs("#gc-dash-overlay");
  if(overlay && !overlay._bound){ overlay._bound = true; overlay.addEventListener("click", closeDrawerCurso); }
  if(!window._gc_esc_bound){
    window._gc_esc_bound = true;
    document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeDrawerCurso(); });
  }

  /* ---------- Modo del drawer (view|edit) ---------- */
  function setDrawerMode(mode){
    const v = qs("#curso-view");
    const e = qs("#curso-edit");
    const act = qs("#curso-actions-view"); // botones Editar/Eliminar de modo vista
    if(mode==="view"){
      if(v) v.hidden = false;
      if(e) e.hidden = true;
      if(act) act.style.display = "";
    }else{
      if(v) v.hidden = true;
      if(e) e.hidden = false;
      if(act) act.style.display = "none";
    }
  }

  /* ---------- Abrir vista de un curso ---------- */
  async function openCursoView(id){
    const it = (S.data||[]).find(x => +x.id === +id);
    if(!it) return;
    S.current = { id: it.id, _all: it };
    openDrawerCurso();
    setDrawerMode("view");
    await fillCursoView(it);
  }

  /* ---------- Montar bloque de imágenes (solo lectura) ---------- */
  async function mountCursoMediaView(containerEl, cursoId){
    if(!containerEl) return;
    const url = (typeof resolveCursoImg === "function")
      ? await resolveCursoImg(cursoId)
      : withBust(cursoImgUrl(cursoId||0));

    containerEl.innerHTML = `
      <div class="media-head">
        <div class="media-title">Imágenes</div>
        <div class="media-help" style="color:#888;">Solo lectura</div>
      </div>
      <div class="media-grid">
        <div class="media-card">
          <figure class="media-thumb">
            <img alt="Portada" id="curso-cover-view" loading="eager" src="${esc(url)}">
          </figure>
          <div class="media-meta">
            <div class="media-label">Portada</div>
          </div>
        </div>
      </div>
    `;

    // fallback correcto a data:URI, evitando rutas relativas rotas
    const img = containerEl.querySelector("#curso-cover-view");
    if(img){
      img.onerror = () => {
        img.onerror = null;
        img.src = noImageSvgDataURI(); // data:image/svg+xml;utf8,…
      };
    }
  }

  /* ---------- Rellenar campos del modo vista ---------- */
  async function fillCursoView(it){
    // título
    const title = qs("#drawer-curso-title");
    if(title) title.textContent = "Curso · " + (it.nombre || "—");

    // campos
    put("#v_nombre",        it.nombre);
    put("#v_desc_breve",    it.descripcion_breve);
    put("#v_desc_media",    it.descripcion_media);
    put("#v_desc_curso",    it.descripcion_curso);
    put("#v_dirigido",      it.dirigido);
    put("#v_competencias",  it.competencias);

    put("#v_tutor",      mapLabel(S.maps.tutores,    it.tutor));
    put("#v_categoria",  mapLabel(S.maps.categorias, it.categoria));
    put("#v_prioridad",  mapLabel(S.maps.prioridad,  it.prioridad));
    put("#v_tipo_eval",  mapLabel(S.maps.tipoEval,   it.tipo_evaluacion));
    put("#v_actividades",mapLabel(S.maps.actividades,it.actividades));
    put("#v_calendario", mapLabel(S.maps.calendario, it.calendario));

    put("#v_horas",        it.horas);
    put("#v_precio",       it.precio ? fmtMoney(it.precio) : "-");
    put("#v_certificado",  fmtBool(it.certificado));
    put("#v_fecha",        fmtDate(it.fecha_inicio));
    put("#v_estatus",      STATUS_LABEL[it.estatus] || it.estatus);

    // imagen (solo lectura)
    await mountCursoMediaView(qs("#media-curso"), it.id);

    // JSON dev
    const pre = qs("#json-curso");
    if(pre) pre.textContent = JSON.stringify(it, null, 2);

    // acciones (Editar / Eliminar) – solo bind una vez
    const bEdit = qs("#btn-edit");
    if(bEdit && !bEdit._bound){
      bEdit._bound = true;
      bEdit.addEventListener("click", ()=>{
        if(typeof window.fillCursoEdit === "function"){
          setDrawerMode("edit");
          window.fillCursoEdit(S.current? S.current._all : it);
        }
      });
    }
    const bDel = qs("#btn-delete");
    if(bDel && !bDel._bound){
      bDel._bound = true;
      bDel.addEventListener("click", ()=>{
        const step = bDel.getAttribute("data-step")==="2" ? "1" : "2";
        bDel.setAttribute("data-step", step);
        // aquí podrías disparar confirm real
      });
    }
  }

  function put(sel, val){
    const el = qs(sel);
    if(el) el.innerHTML = esc(val ?? "—");
  }

  // Exponer helpers necesarios a otros bloques
  window.openDrawerCurso = openDrawerCurso;
  window.closeDrawerCurso = closeDrawerCurso;
  window.setDrawerMode    = setDrawerMode;
  window.openCursoView    = openCursoView;
  window.fillCursoView    = fillCursoView;

})();


/* ==================== BLOQUE 3: Drawer de Edición (form + imagen) ==================== */
(() => {
  "use strict";

  // Estado + utils + API expuestos por Bloque 0
  const S = window.__CursosState;
  const API = window.API;
  const API_UPLOAD = window.API_UPLOAD;

  const {
    qs, esc, mapToOptions, mapLabel,
    fmtMoney, fmtBool, fmtDate, STATUS_LABEL,
    withBust, cursoImgUrl, resolveCursoImg,
    noImageSvgDataURI, postJSON, toast
  } = window.gcUtils;

  /* ---------- Helpers de inputs ---------- */
  function setVal(id, v){ const el = qs("#"+id); if(el) el.value = v==null ? "" : String(v); }
  function setChecked(id, v){ const el = qs("#"+id); if(el) el.checked = !!(+v===1 || v===true || v==="1"); }
  function val(id){ return (qs("#"+id)?.value || "").trim(); }
  function num(id){ const v = val(id); return v==="" ? "" : Number(v); }

  function putSelect(id, map, sel){
    const el = qs("#"+id);
    if(!el) return;
    el.innerHTML = mapToOptions(map || {}, sel);
  }
  function putStatus(id, valSel){
    const el=qs("#"+id); if(!el) return;
    const opts = [
      {v:1,l:"Activo"},{v:0,l:"Inactivo"},{v:2,l:"Pausado"},
      {v:3,l:"Terminado"},{v:4,l:"En curso"},{v:5,l:"Cancelado"}
    ];
    el.innerHTML = opts.map(o=>`<option value="${o.v}"${+o.v===+valSel?" selected":""}>${o.l}</option>`).join("");
  }

  /* ---------- Imagen (edición con lápiz + preview + upload) ---------- */
  function humanSize(bytes){
    if(!Number.isFinite(bytes)) return "—";
    if(bytes < 1024) return bytes+" B";
    if(bytes < 1048576) return (bytes/1024).toFixed(1)+" KB";
    return (bytes/1048576).toFixed(2)+" MB";
  }
  function validarImagen(file, maxMB=2){
    if(!file) return {ok:false, error:"No seleccionaste archivo."};
    if(!/image\/(png|jpeg)/.test(file.type)) return {ok:false, error:"Formato no permitido. Usa JPG o PNG."};
    if(file.size > maxMB*1024*1024) return {ok:false, error:`La imagen excede ${maxMB}MB.`};
    return {ok:true};
  }

  function previewOverlay(file, {onConfirm, onCancel}){
    const url = URL.createObjectURL(file);
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(17,24,39,.55)";
    const modal = document.createElement("div");
    modal.style.cssText = "background:#fff;border-radius:14px;box-shadow:0 20px 40px rgba(0,0,0,.25);width:min(920px,94vw);max-height:90vh;overflow:hidden;display:flex;flex-direction:column;";
    modal.innerHTML = `
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
            <div><strong>Tipo:</strong> ${esc(file.type||"—")}</div>
            <div style="margin-top:6px;color:#666;">Formatos: JPG / PNG · Máx 2MB</div>
          </div>
          <div style="margin-top:auto;display:flex;gap:8px;flex-wrap:wrap;">
            <button class="gc-btn gc-btn--primary" data-x="ok">Subir</button>
            <button class="gc-btn gc-btn--ghost" data-x="cancel">Cancelar</button>
          </div>
        </div>
      </div>
    `;
    overlay.appendChild(modal); document.body.appendChild(overlay);
    document.body.style.overflow="hidden";

    function cleanup(){ URL.revokeObjectURL(url); overlay.remove(); document.body.style.overflow=""; }
    overlay.addEventListener("click", e=>{ if(e.target===overlay){ onCancel && onCancel(); cleanup(); }});
    modal.querySelector('[data-x="close"]').addEventListener("click", ()=>{ onCancel && onCancel(); cleanup(); });
    modal.querySelector('[data-x="cancel"]').addEventListener("click", ()=>{ onCancel && onCancel(); cleanup(); });
    modal.querySelector('[data-x="ok"]').addEventListener("click", async ()=>{
      try{ await onConfirm?.(); } finally { cleanup(); }
    });

    // responsive
    const body = modal.children[1], side = body.children[1];
    const mql = window.matchMedia("(max-width: 720px)");
    function apply(){
      if(mql.matches){ body.style.gridTemplateColumns="1fr"; side.style.borderLeft="none"; side.style.paddingLeft="0"; }
      else{ body.style.gridTemplateColumns="1fr 280px"; side.style.borderLeft="1px dashed #e6e6e6"; side.style.paddingLeft="16px"; }
    }
    mql.addEventListener("change", apply); apply();
  }

  async function uploadCursoCover(cursoId, file){
    const fd = new FormData();
    fd.append("curso_id", String(cursoId||0));
    fd.append("imagen", file);
    const res = await fetch(API_UPLOAD.cursoImg, { method:"POST", body: fd });
    const text = await res.text().catch(()=> "");
    if(!res.ok) throw new Error("HTTP "+res.status+" "+text);
    let json=null; try{ json=JSON.parse(text);}catch{ json={_raw:text}; }
    return (json && json.url) ? String(json.url) : cursoImgUrl(cursoId||0);
  }

  function bindEditButtonUpload(btn, img, cursoId){
    if(!btn || btn._gc_bound) return;
    btn._gc_bound = true;
    btn.addEventListener("click", ()=>{
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/png,image/jpeg";
      input.style.display = "none";
      document.body.appendChild(input);
      input.addEventListener("change", async ()=>{
        const file = input.files && input.files[0];
        input.remove();
        if(!file) return;
        const v = validarImagen(file, 2);
        if(!v.ok){ toast(v.error,"error"); return; }

        previewOverlay(file, {
          onCancel(){},
          async onConfirm(){
            try{
              const newUrl = await uploadCursoCover(cursoId, file);
              img.src = withBust(newUrl);
              toast("Imagen actualizada","exito");
            }catch(err){
              console.error(err);
              toast("No se pudo subir la imagen","error");
            }
          }
        });
      });
      input.click();
    });
  }

  function mountCursoMediaEdit(containerEl, cursoId){
    if(!containerEl) return;
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
          <div class="media-meta"><div class="media-label">Portada</div></div>
        </div>
      </div>
    `;

    const img = containerEl.querySelector("#curso-cover-edit");
    const pencil = containerEl.querySelector(".media-edit");

    // carga inicial con fallback correcto
    (async ()=>{
      const url = await resolveCursoImg(cursoId);
      img.src = url;
    })();

    img.onerror = ()=>{ img.onerror=null; img.src = noImageSvgDataURI(); };

    bindEditButtonUpload(pencil, img, cursoId);
  }

  /* ---------- Rellenar el form de edición ---------- */
  function fillCursoEdit(c){
    // inputs
    setVal("f_nombre",          c.nombre);
    setVal("f_desc_breve",      c.descripcion_breve);
    setVal("f_desc_media",      c.descripcion_media);
    setVal("f_desc_curso",      c.descripcion_curso);
    setVal("f_dirigido",        c.dirigido);
    setVal("f_competencias",    c.competencias);
    setVal("f_horas",           c.horas);
    setVal("f_precio",          c.precio);
    setVal("f_fecha",           c.fecha_inicio);
    setChecked("f_certificado", c.certificado);

    // selects
    putSelect("f_tutor",       S.maps.tutores,     c.tutor);
    putSelect("f_prioridad",   S.maps.prioridad,   c.prioridad);
    putSelect("f_categoria",   S.maps.categorias,  c.categoria);
    putSelect("f_calendario",  S.maps.calendario,  c.calendario);
    putSelect("f_tipo_eval",   S.maps.tipoEval,    c.tipo_evaluacion);
    putSelect("f_actividades", S.maps.actividades, c.actividades);
    putStatus("f_estatus",     c.estatus);

    // imágenes (editable)
    mountCursoMediaEdit(qs("#media-curso-edit"), c.id);

    // acciones guardar / cancelar (bind una sola vez)
    const bSave = qs("#btn-save");
    const bCancel = qs("#btn-cancel");

    if(bSave && !bSave._bound){
      bSave._bound = true;
      bSave.addEventListener("click", saveCurso);
    }
    if(bCancel && !bCancel._bound){
      bCancel._bound = true;
      bCancel.addEventListener("click", ()=>{
        // volver a vista con los datos actuales en memoria
        if(window.setDrawerMode && window.fillCursoView){
          window.setDrawerMode("view");
          window.fillCursoView(S.current? S.current._all : c);
        }
      });
    }
  }

  /* ---------- Guardar curso (insert/update) ---------- */
  async function saveCurso(){
    const body = {
      id: S.current?.id ?? null,
      nombre: val("f_nombre"),
      descripcion_breve: val("f_desc_breve"),
      descripcion_media: val("f_desc_media"),
      descripcion_curso: val("f_desc_curso"),
      dirigido: val("f_dirigido"),
      competencias: val("f_competencias"),
      tutor: num("f_tutor"),
      horas: num("f_horas"),
      precio: Number(val("f_precio")||0),
      estatus: num("f_estatus"),
      fecha_inicio: val("f_fecha"),
      prioridad: num("f_prioridad"),
      categoria: num("f_categoria"),
      calendario: num("f_calendario"),
      tipo_evaluacion: num("f_tipo_eval"),
      actividades: num("f_actividades"),
      certificado: qs("#f_certificado")?.checked ? 1 : 0
    };

    // validación mínima
    if(!body.nombre || !body.descripcion_breve || !body.descripcion_curso || !body.dirigido || !body.competencias){
      toast("Completa los campos obligatorios.","error"); return;
    }

    try{
      if(body.id==null){
        await postJSON(API.iCursos, body);
      }else{
        await postJSON(API.uCursos, body);
      }
      toast("Curso guardado","exito");

      await window.loadCursos(); 
      let it = body.id ? S.data.find(x=>+x.id===+body.id) : S.data.find(x=>x.nombre===body.nombre);
      if(!it) it = S.data[0];
      if(it){
        S.current = { id: it.id, _all: it };
        window.setDrawerMode("view");
        await window.fillCursoView(it);
      }
    }catch(err){
      console.error(err);
      toast("No se pudo guardar.","error");
    }
  }

  // Exponer para Bloque 2
  window.fillCursoEdit = fillCursoEdit;
  window.saveCurso     = saveCurso;
  
})();

