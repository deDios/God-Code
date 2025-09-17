// ==================== NOTICIAS — Listado + Drawer + Imágenes ====================
(() => {
  "use strict";
  const TAG = "[Noticias]";

  /* ---------------- API ---------------- */
  const API_BASE = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
  const API = {
    noticias : API_BASE + "c_noticias.php",
    iNoticias: API_BASE + "i_noticias.php",
    uNoticias: API_BASE + "u_noticias.php",
  };
  // Subida de imágenes (pos=1/2), PHP que nos compartiste
  const API_UPLOAD = { noticiaImg: API_BASE + "u_noticiaImagenes.php" };

  /* ---------------- Estado ---------------- */
  const S = {
    page: 1,
    pageSize: 7,
    search: "",
    data: [],
    current: null,           // { id, _all }
    tempImg1: null,          // File para crear
    tempImg2: null,          // File para crear
  };
  window.__NoticiasState = S;

  /* ---------------- Const UI ---------------- */
  const STATUS_LABEL = { 1: "Activo", 0: "Inactivo" };
  const ORDER_NOTICIAS = [1, 0]; // primero activas, luego inactivas

  /* ---------------- Utils DOM/format ---------------- */
  const qs  = (s,r=document)=>r.querySelector(s);
  const qsa = (s,r=document)=>[].slice.call(r.querySelectorAll(s));
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c]));
  const fmtDate = d => !d ? "-" : String(d);
  const normalize = s => String(s||"").normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().trim();

  function toast(msg, type="info", ms=2200){
    if (window.gcToast) return window.gcToast(msg, type, ms);
    console.log(`${TAG} toast[${type}]`, msg);
  }

  // Id de usuario desde cookie `usuario`
  function getCreatorId(){
    try{
      const raw = document.cookie.split("; ").find(r => r.startsWith("usuario="));
      if(!raw){ console.warn(TAG,"cookie usuario no encontrada"); return null; }
      const json = decodeURIComponent(raw.split("=")[1]||"");
      const u = JSON.parse(json);
      console.log(TAG,"usuario(cookie) →", u);
      const n = Number(u?.id);
      return Number.isFinite(n) ? n : null;
    }catch(e){
      console.error(TAG,"getCreatorId() error:", e);
      return null;
    }
  }

  /* ---------------- HTTP JSON robusto ---------------- */
  async function postJSON(url, body){
    console.log(TAG,"POST", url, {body});
    const r = await fetch(url, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(body || {})
    });
    const text = await r.text().catch(()=> "");
    console.log(TAG,"HTTP", r.status, "raw:", text);
    if(!r.ok) throw new Error(`HTTP ${r.status} ${text}`);

    try{ const j = JSON.parse(text); console.log(TAG,"JSON OK:", j); return j; }catch{}

    // recorte defensivo
    const fb=text.indexOf("{"), lb=text.lastIndexOf("}");
    const fB=text.indexOf("["), lB=text.lastIndexOf("]");
    let c="";
    if(fb!==-1 && lb!==-1 && lb>fb) c=text.slice(fb,lb+1);
    else if(fB!==-1 && lB!==-1 && lB>fB) c=text.slice(fB,lB+1);
    if(c){ try{ const j=JSON.parse(c); console.warn(TAG,"JSON trimmed:", j); return j; }catch{} }

    console.warn(TAG,"JSON parse failed; returning _raw");
    return { _raw:text };
  }

  /* ---------------- Cache-bust + Imágenes ---------------- */
  function withBust(u){
    if(!u || typeof u!=="string" || u.startsWith("data:") || u.startsWith("blob:")) return u;
    try{ const url = new URL(u, location.origin); url.searchParams.set("v", Date.now()); return url.pathname+"?"+url.searchParams.toString(); }
    catch{ return u + (u.includes("?") ? "&" : "?") + "v=" + Date.now(); }
  }

  function noticiaImgUrl(id, pos){ // PHP guarda PNG
    return `/ASSETS/noticia/NoticiasImg/noticia_img${pos}_${Number(id)}.png`;
  }
  function noImageSvg(){ return "data:image/svg+xml;utf8,"+encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M20 70 L60 35 L95 65 L120 50 L140 70' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>"); }

  async function resolveNoticiaImg(id, pos){
    const tryUrl = url => new Promise(res => { const i=new Image(); i.onload=()=>res(true); i.onerror=()=>res(false); i.src=url; });
    const png = withBust(noticiaImgUrl(id,pos));
    if (await tryUrl(png)) return png;
    return noImageSvg();
  }

  async function uploadNoticiaImg(noticiaId, pos, file){
    console.log(TAG,"uploadNoticiaImg →", {noticiaId, pos, file});
    const fd = new FormData();
    fd.append("noticia_id", String(noticiaId));
    fd.append("pos", String(pos));         // 1 o 2
    fd.append("imagen", file);             // name = imagen
    const r = await fetch(API_UPLOAD.noticiaImg, { method:"POST", body:fd });
    const text = await r.text().catch(()=> "");
    console.log(TAG,"upload HTTP", r.status, "raw:", text);
    if (!r.ok) throw new Error(`HTTP ${r.status} ${text}`);
    let j=null; try{ j=JSON.parse(text);}catch{ j={_raw:text}; }
    console.log(TAG,"upload JSON:", j);
    if(j && j.ok) return j.url || noticiaImgUrl(noticiaId, pos);
    throw new Error(j?.error || "Upload desconocido");
  }

  /* ---------------- Drawer helpers ---------------- */
  function openDrawer(){ const d=qs("#drawer-curso"), ov=qs("#gc-dash-overlay"); if(!d) return; d.classList.add("open"); d.hidden=false; d.setAttribute("aria-hidden","false"); ov && ov.classList.add("open"); }
  function closeDrawer(){ const d=qs("#drawer-curso"), ov=qs("#gc-dash-overlay"); if(!d) return; d.classList.remove("open"); d.hidden=true; d.setAttribute("aria-hidden","true"); ov && ov.classList.remove("open"); S.current=null; }

  // binds de cierre una vez
  qsa("#drawer-curso-close").forEach(b=>{ if(!b._b){ b._b=true; b.addEventListener("click", closeDrawer); }});
  const _ov = qs("#gc-dash-overlay");
  if (_ov && !_ov._b){ _ov._b=true; _ov.addEventListener("click", closeDrawer); }
  if (!window._gc_noticias_esc){ window._gc_noticias_esc=true; document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeDrawer(); }); }

  function setDrawerMode(mode){
    console.log(TAG,"setDrawerMode:", mode);
    const v=qs("#curso-view"), e=qs("#curso-edit"), act=qs("#curso-actions-view");
    if(mode==="view"){ v && (v.hidden=false); e && (e.hidden=true); act && (act.style.display=""); }
    else{ v && (v.hidden=true); e && (e.hidden=false); act && (act.style.display="none"); }
  }

  /* ---------------- Listado ---------------- */
  async function loadNoticias(){
    console.log(TAG,"loadNoticias()…");
    const chunks = await Promise.all(
      ORDER_NOTICIAS.map(st => postJSON(API.noticias, { estatus: st }).catch(()=>[]))
    );
    const flat=[];
    ORDER_NOTICIAS.forEach((st,i)=>{ flat.push(...(Array.isArray(chunks[i])?chunks[i]:[])); });
    S.data = flat;
    S.page = 1;
    console.log(TAG,"Noticias cargadas:", S.data.length);
    renderNoticias();
  }

  function renderNoticias(){
    console.log(TAG,"renderNoticias() page", S.page, "search=", S.search);
    const hostD = qs("#recursos-list");
    const hostM = qs("#recursos-list-mobile");
    if (hostD) hostD.innerHTML="";
    if (hostM) hostM.innerHTML="";

    const term = normalize(S.search);
    const filtered = term ? S.data.filter(row=> normalize(JSON.stringify(row)).includes(term)) : S.data;

    const modCount = qs("#mod-count");
    if (modCount){ const n=filtered.length; modCount.textContent = `${n} ${n===1? "elemento":"elementos"}`; }

    const totalPages = Math.max(1, Math.ceil(filtered.length/S.pageSize));
    if (S.page>totalPages) S.page=totalPages;
    const start = (S.page-1)*S.pageSize;
    const pageRows = filtered.slice(start, start+S.pageSize);

    // Desktop
    if (hostD){
      if(pageRows.length===0){
        hostD.insertAdjacentHTML("beforeend", `<div class="table-row"><div class="col-nombre">Sin resultados</div></div>`);
      }else{
        pageRows.forEach(it=>{
          const est = STATUS_LABEL[it.estatus] || it.estatus;
          hostD.insertAdjacentHTML("beforeend", `
            <div class="table-row" role="row" data-id="${it.id}">
              <div class="col-nombre" role="cell">${esc(it.titulo || "-")}</div>
              <div class="col-tutor"  role="cell">${esc(fmtDate(it.fecha_publicacion || it.fecha || "-"))}</div>
              <div class="col-fecha"  role="cell">${esc(it.creado_por ?? "-")}</div>
              <div class="col-status" role="cell">${esc(est)}</div>
            </div>`);
        });
        qsa(".table-row", hostD).forEach(row=>{
          row.addEventListener("click", ()=>{
            const id = Number(row.dataset.id);
            console.log(TAG,"click row id=", id);
            if (id) openNoticiaView(id);
          });
        });
      }
    }

    // Mobile
    if (hostM){
      if(pageRows.length===0){
        hostM.insertAdjacentHTML("beforeend", `<div class="table-row"><div class="col-nombre">Sin resultados</div></div>`);
      }else{
        pageRows.forEach(it=>{
          hostM.insertAdjacentHTML("beforeend", `
            <div class="table-row-mobile" data-id="${it.id}">
              <div class="row-head">
                <div class="title">${esc(it.titulo || "-")}</div>
                <button class="open-drawer gc-btn" type="button">Ver</button>
              </div>
            </div>`);
        });
        qsa(".open-drawer", hostM).forEach(btn=>{
          btn.addEventListener("click", (e)=>{
            e.stopPropagation();
            const id = Number(btn.closest(".table-row-mobile")?.dataset.id || 0);
            console.log(TAG,"open mobile id=", id);
            if (id) openNoticiaView(id);
          });
        });
      }
    }

    renderPagination(filtered.length);
  }

  function renderPagination(total){
    const totalPages = Math.max(1, Math.ceil(total/S.pageSize));
    [qs("#pagination-controls"), qs("#pagination-mobile")].forEach(cont=>{
      if(!cont) return;
      cont.innerHTML="";
      if(totalPages<=1) return;

      const mk=(txt, dis, cb, cls="page-btn")=>{
        const b=document.createElement("button");
        b.textContent=txt;
        b.className=cls + (dis ? " disabled" : "");
        if(dis) b.disabled=true; else b.onclick=cb;
        return b;
      };
      cont.appendChild(mk("‹", S.page===1, ()=>{ S.page=Math.max(1,S.page-1); renderNoticias(); }, "arrow-btn"));
      for(let p=1;p<=totalPages && p<=7;p++){
        const b=mk(String(p), false, ()=>{ S.page=p; renderNoticias(); });
        if(p===S.page) b.classList.add("active");
        cont.appendChild(b);
      }
      cont.appendChild(mk("›", S.page===totalPages, ()=>{ S.page=Math.min(totalPages,S.page+1); renderNoticias(); }, "arrow-btn"));
    });
  }

  // búsqueda
  const searchInput = qs("#search-input");
  if (searchInput && !searchInput._b){
    searchInput._b=true;
    searchInput.addEventListener("input", e=>{
      S.search = e.target.value || "";
      S.page = 1;
      renderNoticias();
    });
  }

  /* ---------------- Drawer: Vista ---------------- */
  function paintActions(noticia){
    // Usaremos el mismo btn (id #btn-delete) como "Eliminar" o "Reactivar" según estatus
    const cont = qs("#curso-actions-view");
    if(!cont) return;

    // Limpiamos y reinsertamos botones (evita listeners zombies)
    cont.innerHTML = `
      <button class="gc-btn" id="btn-edit">Editar</button>
      <button class="gc-btn gc-btn--danger" id="btn-delete" data-step="1">Eliminar</button>
    `;

    const bEdit = qs("#btn-edit");
    const bDel  = qs("#btn-delete");

    // Editar
    bEdit.addEventListener("click", ()=>{
      setDrawerMode("edit");
      fillNoticiaEdit(S.current ? S.current._all : noticia);
    });

    // Eliminar / Reactivar
    if (+noticia.estatus === 0){
      // reusar botón como "Reactivar"
      bDel.textContent = "Reactivar";
      bDel.classList.remove("gc-btn--danger");
      bDel.classList.add("gc-btn--success","gc-badge","gc-badge--green");
      bDel.removeAttribute("data-step");
      bDel.onclick = async ()=>{
        if(!S.current?.id){ toast("No hay noticia para reactivar.", "error"); return; }
        bDel.disabled = true;
        try{
          const ok = await updateNoticiaStatus(S.current.id, 1);
          if(ok){
            toast("Noticia reactivada", "exito");
            await afterStatusChange(S.current.id);
          }
        }finally{ bDel.disabled=false; }
      };
    }else{
      // Confirm de 2 pasos para eliminar (soft delete)
      bDel.classList.remove("gc-btn--success","gc-badge","gc-badge--green");
      bDel.classList.add("gc-btn--danger");
      let confirming=false, timer=null;

      function resetConfirm(){
        confirming=false;
        bDel.textContent="Eliminar";
        bDel.dataset.step="1";
        if(timer){clearTimeout(timer); timer=null;}
      }

      bDel.addEventListener("click", async ()=>{
        if(!S.current?.id){ toast("No hay noticia activa para eliminar.", "error"); return; }
        if(!confirming){
          confirming=true;
          bDel.textContent="¿Confirmar?";
          bDel.dataset.step="2";
          timer=setTimeout(resetConfirm, 3000);
          return;
        }
        bDel.disabled=true;
        try{
          const ok = await updateNoticiaStatus(S.current.id, 0);
          if(ok){
            toast("Noticia movida a Inactivo", "exito");
            await afterStatusChange(S.current.id);
          }
        }finally{
          bDel.disabled=false;
          resetConfirm();
        }
      });
    }
  }

  async function afterStatusChange(id){
    // refetch + reabrir drawer con datos frescos
    await loadNoticias();
    const it = (S.data||[]).find(x=> +x.id === +id);
    if (it){
      S.current = { id: it.id, _all: it };
      setDrawerMode("view");
      await fillNoticiaView(it);
    }else{
      closeDrawer();
    }
  }

  async function mountNoticiaMediaView(containerEl, noticiaId){
    if(!containerEl) return;
    const url1 = noticiaId ? await resolveNoticiaImg(noticiaId,1) : noImageSvg();
    const url2 = noticiaId ? await resolveNoticiaImg(noticiaId,2) : noImageSvg();

    containerEl.innerHTML = `
      <div class="media-head">
        <div class="media-title">Imágenes</div>
        <div class="media-help" style="color:#888;">Solo lectura</div>
      </div>
      <div class="media-grid">
        <div class="media-card">
          <figure class="media-thumb"><img alt="Imagen 1" id="not-img1-view" loading="eager" src="${esc(url1)}"></figure>
          <div class="media-meta"><div class="media-label">Imagen 1</div></div>
        </div>
        <div class="media-card">
          <figure class="media-thumb"><img alt="Imagen 2" id="not-img2-view" loading="eager" src="${esc(url2)}"></figure>
          <div class="media-meta"><div class="media-label">Imagen 2</div></div>
        </div>
      </div>
    `;
  }

  function put(sel, val){ const el=qs(sel); if(el) el.innerHTML = esc(val ?? "—"); }

  async function fillNoticiaView(it){
    console.log(TAG,"fillNoticiaView id=", it?.id, it);
    const title = qs("#drawer-curso-title");
    if (title) title.textContent = "Noticia · " + (it.titulo || "—");

    put("#v_nombre", it.titulo);
    put("#v_desc_breve", it.desc_uno);
    put("#v_desc_media", it.desc_dos);
    put("#v_desc_curso", "-"); // no aplica; dejamos lugar por compat de layout
    put("#v_dirigido","—");
    put("#v_competencias","—");

    put("#v_tutor","—");
    put("#v_categoria","—");
    put("#v_prioridad","—");
    put("#v_tipo_eval","—");
    put("#v_actividades","—");
    put("#v_calendario","—");

    put("#v_horas","—");
    put("#v_precio","—");
    put("#v_certificado","—");
    put("#v_fecha", fmtDate(it.fecha_publicacion || it.fecha || it.fecha_creacion));
    put("#v_estatus", STATUS_LABEL[it.estatus] || it.estatus);

    await mountNoticiaMediaView(qs("#media-curso"), it.id);

    const pre = qs("#json-curso");
    if (pre) pre.textContent = JSON.stringify(it, null, 2);

    paintActions(it);
  }
  window.fillNoticiaView = fillNoticiaView;

  async function openNoticiaView(id){
    const it = (S.data||[]).find(x=> +x.id === +id);
    console.log(TAG,"openNoticiaView id=", id, "found:", !!it);
    if(!it) return;
    S.current = { id: it.id, _all: it };
    openDrawer();
    setDrawerMode("view");
    await fillNoticiaView(it);
  }
  window.openNoticiaView = openNoticiaView;

  /* ---------------- Drawer: Edición ---------------- */
  function setVal(id, v){ const el=qs("#"+id); if(el) el.value = v==null? "": String(v); }
  function val(id){ return (qs("#"+id)?.value || "").trim(); }

  function humanSize(bytes){ if(!Number.isFinite(bytes)) return "—"; if(bytes<1024) return bytes+" B"; if(bytes<1048576) return (bytes/1024).toFixed(1)+" KB"; return (bytes/1048576).toFixed(2)+" MB"; }
  function validarImagen(file, maxMB=2){
    if(!file) return {ok:false, error:"No seleccionaste archivo."};
    if(!/image\/(png|jpeg)/.test(file.type)) return {ok:false, error:"Formato no permitido. Usa JPG o PNG."};
    if(file.size > maxMB*1048576) return {ok:false, error:`La imagen excede ${maxMB}MB.`};
    return {ok:true};
  }

  function previewOverlay(file, { onConfirm, onCancel }){
    const url = URL.createObjectURL(file);
    const o = document.createElement("div");
    o.style.cssText="position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(17,24,39,.55)";
    const m = document.createElement("div");
    m.style.cssText="background:#fff;border-radius:14px;box-shadow:0 20px 40px rgba(0,0,0,.25);width:min(920px,94vw);max-height:90vh;overflow:hidden;display:flex;flex-direction:column;";
    m.innerHTML=`
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
      </div>`;
    o.appendChild(m); document.body.appendChild(o); document.body.style.overflow="hidden";
    function cleanup(){ URL.revokeObjectURL(url); o.remove(); document.body.style.overflow=""; }
    o.addEventListener("click", e=>{ if(e.target===o){ onCancel&&onCancel(); cleanup(); }});
    m.querySelector('[data-x="close"]').addEventListener("click", ()=>{ onCancel&&onCancel(); cleanup(); });
    m.querySelector('[data-x="cancel"]').addEventListener("click", ()=>{ onCancel&&onCancel(); cleanup(); });
    m.querySelector('[data-x="ok"]').addEventListener("click", async()=>{ try{ await onConfirm?.(); } finally{ cleanup(); }});

    const body=m.children[1], side=body.children[1]; const mql=window.matchMedia("(max-width: 720px)");
    function apply(){ if(mql.matches){ body.style.gridTemplateColumns="1fr"; side.style.borderLeft="none"; side.style.paddingLeft="0"; } else { body.style.gridTemplateColumns="1fr 280px"; side.style.borderLeft="1px dashed #e6e6e6"; side.style.paddingLeft="16px"; } }
    mql.addEventListener("change", apply); apply();
  }

  function mountNoticiaMediaEdit(containerEl, noticiaId){
    if(!containerEl) return;
    containerEl.innerHTML=`
      <div class="media-head">
        <div class="media-title">Imágenes</div>
        <div class="media-help">JPG/PNG · Máx 2MB</div>
      </div>
      <div class="media-grid">
        <div class="media-card">
          <figure class="media-thumb">
            <img alt="Imagen 1" id="not-img1-edit" loading="eager" src="">
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
            <img alt="Imagen 2" id="not-img2-edit" loading="eager" src="">
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

    const img1 = containerEl.querySelector("#not-img1-edit");
    const img2 = containerEl.querySelector("#not-img2-edit");

    if (noticiaId){
      (async()=>{
        img1.src = await resolveNoticiaImg(noticiaId,1);
        img2.src = await resolveNoticiaImg(noticiaId,2);
      })();
      img1.onerror=()=>{ img1.onerror=null; img1.src=noImageSvg(); };
      img2.onerror=()=>{ img2.onerror=null; img2.src=noImageSvg(); };
    } else {
      img1.src = S.tempImg1 ? URL.createObjectURL(S.tempImg1) : noImageSvg();
      img2.src = S.tempImg2 ? URL.createObjectURL(S.tempImg2) : noImageSvg();
    }

    qsa(".media-edit", containerEl).forEach(btn=>{
      if(btn._b) return; btn._b=true;
      btn.addEventListener("click", ()=>{
        const pos = Number(btn.dataset.pos); // 1 o 2
        const input = document.createElement("input");
        input.type="file"; input.accept="image/png,image/jpeg"; input.style.display="none";
        document.body.appendChild(input);
        input.addEventListener("change", async()=>{
          const file = input.files && input.files[0]; input.remove();
          if(!file) return;
          const v = validarImagen(file,2); if(!v.ok){ toast(v.error,"error"); return; }

          // crear: solo buffer + preview
          if(!noticiaId){
            if(pos===1){ S.tempImg1 = file; img1.src = withBust(URL.createObjectURL(file)); }
            else { S.tempImg2 = file; img2.src = withBust(URL.createObjectURL(file)); }
            toast("Imagen lista; se subirá al guardar.", "info");
            return;
          }

          // editar: subir de inmediato con confirm preview
          previewOverlay(file, {
            onCancel(){},
            async onConfirm(){
              try{
                const newUrl = await uploadNoticiaImg(noticiaId,pos,file);
                if(pos===1) img1.src = withBust(newUrl); else img2.src = withBust(newUrl);
                toast("Imagen actualizada", "exito");
              }catch(err){
                console.error(TAG,"upload error", err);
                toast("No se pudo subir la imagen", "error");
              }
            }
          });
        });
        input.click();
      });
    });
  }

  function fillNoticiaEdit(n){
    console.log(TAG,"fillNoticiaEdit()", n);
    setVal("f_nombre", n.titulo || "");
    setVal("f_desc_breve", n.desc_uno || "");
    setVal("f_desc_media", n.desc_dos || "");
    setVal("f_desc_curso", ""); // no aplica

    // estatus select simple (1/0)
    const sel = qs("#f_estatus");
    if(sel){
      sel.innerHTML = `
        <option value="1"${+n.estatus===1?" selected":""}>Activo</option>
        <option value="0"${+n.estatus===0?" selected":""}>Inactivo</option>`;
    }

    mountNoticiaMediaEdit(qs("#media-curso-edit"), n.id);

    const bSave = qs("#btn-save");
    const bCancel = qs("#btn-cancel");
    if (bSave && !bSave._b){ bSave._b=true; bSave.addEventListener("click", saveNoticia); }
    if (bCancel && !bCancel._b){ bCancel._b=true; bCancel.addEventListener("click", ()=>{
      setDrawerMode("view");
      fillNoticiaView(S.current ? S.current._all : n);
    }); }
  }
  window.fillNoticiaEdit = fillNoticiaEdit;

  /* ---------------- Cambios de estatus ---------------- */
  async function updateNoticiaStatus(id, estatus, extra={}){
    if(!id) return false;
    try{
      const payload = Object.assign({ id:Number(id), estatus:Number(estatus) }, extra);
      console.log(TAG,"updateNoticiaStatus →", payload);
      const res = await postJSON(API.uNoticias, payload);
      console.log(TAG,"updateNoticiaStatus respuesta:", res);
      if(res && res.error){ console.error(TAG,"Status ERROR:", res.error); toast(res.error,"error"); return false; }
      return true;
    }catch(err){
      console.error(TAG,"updateNoticiaStatus ERROR:", err);
      toast("No se pudo actualizar el estatus.","error");
      return false;
    }
  }

  /* ---------------- Guardar (insert/update) ---------------- */
  async function saveNoticia(){
    const body = {
      id: S.current?.id ?? null,
      titulo: val("f_nombre"),
      desc_uno: val("f_desc_breve"),
      desc_dos: val("f_desc_media"),
      estatus: Number(qs("#f_estatus")?.value ?? 1),
    };
    console.log(TAG,"saveNoticia() body=", body);

    if(!body.titulo || !body.desc_uno || !body.desc_dos){
      toast("Completa título y descripciones.","error");
      return;
    }

    try{
      let newId = body.id;

      if (body.id == null){
        const creado_por = getCreatorId();
        if (creado_por == null){ toast("No se puede crear: falta id de usuario (creado_por).","error"); return; }
        const insertBody = { ...body, creado_por };
        console.log(TAG,"Insertando noticia con:", insertBody);
        const res = await postJSON(API.iNoticias, insertBody);
        console.log(TAG,"Respuesta insert:", res);
        if(res && res.error){ console.error(TAG,"Insert ERROR:", res.error); toast(res.error,"error"); return; }
        newId = Number(res?.id ?? res?.noticia_id ?? res?.insert_id ?? res?.data?.id ?? 0);
        console.log(TAG,"Nuevo ID:", newId);

        // Subir imágenes si se eligieron
        if (newId){
          if (S.tempImg1 instanceof File){
            try{ await uploadNoticiaImg(newId,1,S.tempImg1); toast("Imagen 1 subida","exito"); }catch(e){ console.error(TAG,"img1 create fail:", e); toast("No se pudo subir Imagen 1","error"); }
          }
          if (S.tempImg2 instanceof File){
            try{ await uploadNoticiaImg(newId,2,S.tempImg2); toast("Imagen 2 subida","exito"); }catch(e){ console.error(TAG,"img2 create fail:", e); toast("No se pudo subir Imagen 2","error"); }
          }
          S.tempImg1 = S.tempImg2 = null;
        }
      }else{
        console.log(TAG,"Actualizando noticia id=", body.id);
        const resU = await postJSON(API.uNoticias, body);
        console.log(TAG,"Respuesta update:", resU);
        if(resU && resU.error){ console.error(TAG,"Update ERROR:", resU.error); toast(resU.error,"error"); return; }
      }

      toast("Noticia guardada","exito");

      await loadNoticias();
      const idToOpen = newId || body.id;
      const it = (S.data||[]).find(x=> +x.id === +idToOpen) || S.data[0];
      console.log(TAG,"Reabrir id=", idToOpen, "found:", !!it);
      if(it){
        S.current = { id: it.id, _all: it };
        setDrawerMode("view");
        await fillNoticiaView(it);
      }
    }catch(err){
      console.error(TAG,"saveNoticia ERROR:", err);
      toast("No se pudo guardar.","error");
    }
  }
  window.saveNoticia = saveNoticia;

  /* ---------------- Montaje / Crear ---------------- */
  async function mount(){
    console.log(TAG,"mount() INICIO");
    try{
      const hostD = qs("#recursos-list");
      if(hostD) hostD.innerHTML = `<div class="table-row"><div class="col-nombre">Cargando…</div></div>`;
      await loadNoticias();

      // bind búsqueda si faltó
      const s = qs("#search-input");
      if (s && !s._b){
        s._b=true;
        s.addEventListener("input", e=>{
          S.search = e.target.value || "";
          S.page = 1;
          renderNoticias();
        });
      }
      console.log(TAG,"mount() OK");
    }catch(e){
      console.error(TAG,"mount() ERROR:", e);
      const hostD = qs("#recursos-list");
      if(hostD) hostD.innerHTML = `<div class="table-row"><div class="col-nombre">Error cargando noticias</div></div>`;
    }
  }

  function openNoticiaCreate(){
    console.log(TAG,"openNoticiaCreate()");
    const blank = {
      id:null,
      titulo:"",
      desc_uno:"",
      desc_dos:"",
      estatus:1
    };
    S.current = { id:null, _all:blank };
    openDrawer();
    setDrawerMode("edit");
    fillNoticiaEdit(blank);
  }

  /* ---------------- Exponer API pública ---------------- */
  window.noticias = { mount, openCreate: openNoticiaCreate };
  // compat con tu router anterior
  window.noticiasInit = mount;

  // Botón global "Crear" contextual (si tu router no lo hace)
  const btnAdd = qs("#btn-add");
  if (btnAdd && !btnAdd._b){
    btnAdd._b=true;
    btnAdd.addEventListener("click", ()=>{
      // solo si estamos en noticias
      const route=(location.hash||"").toLowerCase();
      if(route.startsWith("#/noticias")) openNoticiaCreate();
    });
  }

  console.log(TAG,"Módulo noticias cargado.");
})();
