/* ==================== NOTICIAS: Estado + API ==================== */
(() => {
  "use strict";

  // Requiere gcUtils (cargado por cursos)
  if (!window.gcUtils) { console.error("gcUtils no disponible. Carga primero admin.cursos.js (Bloque 0)."); return; }

  const { qs, qsa, esc, fmtDate, mapToOptions, mapLabel, postJSON, toast,
          withBust } = window.gcUtils;

  // Endpoints (ajústalos a tus nombres reales)
  const API_BASE = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
  const NAPI = {
    noticias   : API_BASE + "c_noticias.php",
    iNoticias  : API_BASE + "i_noticias.php",
    uNoticias  : API_BASE + "u_noticias.php",
    autores    : API_BASE + "c_autores.php",
    categorias : API_BASE + "c_categorias_noticia.php"
  };
  const NUPLOAD = { portada: API_BASE + "u_noticiaImg.php" };

  const NS = {
    current: null, // {id,_all}
    maps: { autores:null, categorias:null }
  };
  window.__NoticiasState = NS;
  window.NAPI = NAPI;
  window.NUPLOAD = NUPLOAD;

  /* ==================== Helpers de Imagen (Noticias) ==================== */
  function noticiaImgUrl(id, ext="png"){ return `/ASSETS/noticias/img${Number(id)}.${ext}`; }
  function noImageSvgDataURI(){
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M20 70 L60 35 L95 65 L120 50 L140 70' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }
  async function resolveNoticiaImg(id){
    const tryLoad = (url) => new Promise(res => {
      const i = new Image();
      i.onload = () => res(true);
      i.onerror = () => res(false);
      i.src = withBust(url);
    });
    const png = noticiaImgUrl(id, "png");
    const jpg = noticiaImgUrl(id, "jpg");
    if (await tryLoad(png)) return withBust(png);
    if (await tryLoad(jpg)) return withBust(jpg);
    return noImageSvgDataURI();
  }

  /* ==================== Drawer helpers (Noticias) ==================== */
  function openDrawerNoticia(){
    const d=qs("#drawer-noticia"); const ov=qs("#gc-dash-overlay");
    if(!d) return;
    d.classList.add("open"); d.removeAttribute("hidden"); d.setAttribute("aria-hidden","false");
    ov && ov.classList.add("open");
  }
  function closeDrawerNoticia(){
    const d=qs("#drawer-noticia"); const ov=qs("#gc-dash-overlay");
    if(!d) return;
    d.classList.remove("open"); d.setAttribute("hidden",""); d.setAttribute("aria-hidden","true");
    ov && ov.classList.remove("open");
    NS.current=null;
  }
  const nCloseBtn = qs("#drawer-noticia-close");
  if(nCloseBtn && !nCloseBtn._bound){ nCloseBtn._bound=true; nCloseBtn.addEventListener("click", closeDrawerNoticia); }
  const overlay = qs("#gc-dash-overlay");
  if(overlay && !overlay._bound){ overlay._bound=true; overlay.addEventListener("click", closeDrawerNoticia); }
  if(!window._gc_news_esc){
    window._gc_news_esc = true;
    document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeDrawerNoticia(); });
  }

  function setNoticiaMode(mode){
    const v = qs("#noticia-view");
    const e = qs("#noticia-edit");
    const act = qs("#noticia-actions-view");
    if(mode==="view"){ v && (v.hidden=false); e && (e.hidden=true); act && (act.style.display=""); }
    else { v && (v.hidden=true); e && (e.hidden=false); act && (act.style.display="none"); }
  }

  /* ==================== Catálogos ==================== */
  function arrToMap(arr){
    const m={}; (Array.isArray(arr)?arr:[]).forEach(x=>{ m[x.id]= x.nombre || x.titulo || ("#"+x.id); }); m._ts = Date.now(); return m;
  }
  async function loadCatNoticias(){
    if(!NS.maps.autores)    NS.maps.autores    = arrToMap(await postJSON(NAPI.autores,    {estatus:1}).catch(()=>[]));
    if(!NS.maps.categorias) NS.maps.categorias = arrToMap(await postJSON(NAPI.categorias, {estatus:1}).catch(()=>[]));
  }

  /* ==================== Modo VISTA ==================== */
  async function mountNoticiaMediaView(containerEl, id){
    if(!containerEl) return;
    const url = await resolveNoticiaImg(id);
    containerEl.innerHTML = `
      <div class="media-head">
        <div class="media-title">Imágenes</div>
        <div class="media-help" style="color:#888;">Solo lectura</div>
      </div>
      <div class="media-grid">
        <div class="media-card">
          <figure class="media-thumb">
            <img alt="Portada" id="noticia-cover-view" src="${esc(url)}" loading="eager">
          </figure>
          <div class="media-meta"><div class="media-label">Portada</div></div>
        </div>
      </div>`;
    const img = containerEl.querySelector("#noticia-cover-view");
    if(img){ img.onerror=()=>{ img.onerror=null; img.src = noImageSvgDataURI(); }; }
  }

  async function fillNoticiaView(n){
    const t = qs("#drawer-noticia-title"); if(t) t.textContent = "Noticia · " + (n.titulo||"—");

    put("#nv_titulo", n.titulo);
    put("#nv_resumen", n.resumen);
    put("#nv_contenido", n.contenido);
    put("#nv_autor", mapLabel(NS.maps.autores, n.autor));
    put("#nv_categoria", mapLabel(NS.maps.categorias, n.categoria));
    put("#nv_estatus", ({"1":"Activa","0":"Inactiva","2":"Borrador"})[String(n.estatus)] || n.estatus);
    put("#nv_fecha", fmtDate(n.fecha_publicacion));

    await mountNoticiaMediaView(qs("#media-noticia"), n.id);

    const pre=qs("#json-noticia"); if(pre) pre.textContent = JSON.stringify(n,null,2);

    // acciones
    const bEdit = qs("#n-btn-edit");
    if(bEdit && !bEdit._bound){
      bEdit._bound = true;
      bEdit.addEventListener("click", ()=>{
        setNoticiaMode("edit");
        fillNoticiaEdit(NS.current? NS.current._all : n);
      });
    }
    const bDel = qs("#n-btn-delete");
    if(bDel && !bDel._bound){
      bDel._bound = true;
      bDel.addEventListener("click", ()=>{
        const step = bDel.getAttribute("data-step")==="2" ? "1" : "2";
        bDel.setAttribute("data-step", step);
      });
    }
  }
  function put(sel,val){ const el=qs(sel); if(el) el.innerHTML = esc(val ?? "—"); }

  async function openNoticiaEditById(id, loader){
    await loadCatNoticias();
    const it = await loader(id); // función que devuelve la noticia (obj)
    if(!it) return;
    NS.current = {id:it.id,_all:it};
    openDrawerNoticia();
    setNoticiaMode("edit");
    fillNoticiaEdit(it);
  }

  function openNoticiaCreate(){
    const blank = {
      id:null, titulo:"", resumen:"", contenido:"",
      autor:"", categoria:"", estatus:2, // 2: borrador
      fecha_publicacion:""
    };
    NS.current = { id:null, _all:blank };
    openDrawerNoticia();
    setNoticiaMode("edit");
    fillNoticiaEdit(blank);
  }

  /* ==================== Modo EDICIÓN ==================== */
  function setVal(id,v){ const el=qs("#"+id); if(el) el.value = v==null?"":String(v); }
  function val(id){ return (qs("#"+id)?.value || "").trim(); }
  function num(id){ const v=val(id); return v===""? "" : Number(v); }

  function putStatus(id, sel){
    const el=qs("#"+id); if(!el) return;
    const opts=[
      {v:2,l:"Borrador"},
      {v:1,l:"Activa"},
      {v:0,l:"Inactiva"},
    ];
    el.innerHTML = opts.map(o=>`<option value="${o.v}"${+o.v===+sel?" selected":""}>${o.l}</option>`).join("");
  }

  async function uploadNoticiaCover(id, file){
    const fd = new FormData();
    fd.append("noticia_id", String(id||0));
    fd.append("imagen", file);
    const r = await fetch(NUPLOAD.portada, { method:"POST", body:fd });
    const t = await r.text().catch(()=> "");
    if(!r.ok) throw new Error("HTTP "+r.status+" "+t);
    let j=null; try{ j=JSON.parse(t);}catch{ j={_raw:t}; }
    return (j&&j.url) ? String(j.url) : noticiaImgUrl(id||0);
  }

  function validarImagen(file, maxMB=2){
    if(!file) return {ok:false,error:"No seleccionaste archivo."};
    if(!/image\/(png|jpeg)/.test(file.type)) return {ok:false,error:"Formato no permitido. Usa JPG o PNG."};
    if(file.size > maxMB*1024*1024) return {ok:false,error:`La imagen excede ${maxMB}MB.`};
    return {ok:true};
  }

  function previewOverlay(file, {onConfirm,onCancel}){
    const url=URL.createObjectURL(file);
    const o=document.createElement("div");
    o.style.cssText="position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(17,24,39,.55)";
    const m=document.createElement("div");
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
            <div><strong>Peso:</strong> ${(file.size/1048576).toFixed(2)} MB</div>
            <div><strong>Tipo:</strong> ${esc(file.type||"—")}</div>
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
    m.querySelector('[data-x="ok"]').addEventListener("click", async ()=>{ try{ await onConfirm?.(); } finally { cleanup(); }});
  }

  function mountNoticiaMediaEdit(containerEl, id){
    if(!containerEl) return;
    containerEl.innerHTML = `
      <div class="media-head">
        <div class="media-title">Imágenes</div>
        <div class="media-help">JPG/PNG · Máx 2MB</div>
      </div>
      <div class="media-grid">
        <div class="media-card">
          <figure class="media-thumb">
            <img alt="Portada" id="noticia-cover-edit" src="" loading="eager">
            <button class="icon-btn media-edit" type="button" title="Editar imagen" aria-label="Editar imagen">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"></path>
              </svg>
            </button>
          </figure>
          <div class="media-meta"><div class="media-label">Portada</div></div>
        </div>
      </div>`;
    const img=containerEl.querySelector("#noticia-cover-edit");
    const btn=containerEl.querySelector(".media-edit");

    (async()=>{ img.src = await resolveNoticiaImg(id); })();
    img.onerror = ()=>{ img.onerror=null; img.src = noImageSvgDataURI(); };

    if(btn && !btn._bound){
      btn._bound=true;
      btn.addEventListener("click", ()=>{
        const input = document.createElement("input");
        input.type="file"; input.accept="image/png,image/jpeg"; input.style.display="none";
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
                const newUrl = await uploadNoticiaCover(id, file);
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
  }

  function fillNoticiaEdit(n){
    // inputs
    setVal("n_titulo",    n.titulo);
    setVal("n_resumen",   n.resumen);
    setVal("n_contenido", n.contenido);
    setVal("n_fecha",     n.fecha_publicacion);

    // selects
    putSelect("n_autor",     NS.maps.autores,    n.autor);
    putSelect("n_categoria", NS.maps.categorias, n.categoria);
    putStatus("n_estatus",   n.estatus);

    // imagen
    mountNoticiaMediaEdit(qs("#media-noticia-edit"), n.id);

    // acciones
    const bSave = qs("#n-btn-save");
    const bCancel = qs("#n-btn-cancel");
    if(bSave && !bSave._bound){ bSave._bound=true; bSave.addEventListener("click", saveNoticia); }
    if(bCancel && !bCancel._bound){
      bCancel._bound=true;
      bCancel.addEventListener("click", ()=>{
        setNoticiaMode("view");
        fillNoticiaView(NS.current ? NS.current._all : n);
      });
    }
  }

  async function saveNoticia(){
    const body = {
      id: NS.current?.id ?? null,
      titulo: val("n_titulo"),
      resumen: val("n_resumen"),
      contenido: val("n_contenido"),
      autor: num("n_autor"),
      categoria: num("n_categoria"),
      estatus: num("n_estatus"),
      fecha_publicacion: val("n_fecha")
    };
    if(!body.titulo || !body.resumen || !body.contenido){
      toast("Completa título, resumen y contenido.","error"); return;
    }
    try{
      if(body.id==null) await postJSON(NAPI.iNoticias, body);
      else await postJSON(NAPI.uNoticias, body);

      toast("Noticia guardada","exito");

      // Si tienes una lista, aquí refrescarías. Como mínimo, vuelve a vista:
      // Opcional: recargar la noticia guardada desde el backend.
      const updated = Object.assign({}, NS.current?NS.current._all:{}, body);
      NS.current = { id: updated.id ?? NS.current?.id, _all: updated };

      setNoticiaMode("view");
      fillNoticiaView(updated);

    }catch(err){
      console.error(err);
      toast("No se pudo guardar la noticia.","error");
    }
  }

  // Exponer funciones públicas útiles
  window.openNoticiaCreate = openNoticiaCreate;
  window.fillNoticiaView  = fillNoticiaView;
  window.fillNoticiaEdit  = fillNoticiaEdit;
  window.openNoticiaEditById = openNoticiaEditById;

})();
