/* ==================== TUTORES (UAT) — Núcleo + Listado + Drawer ==================== */
(() => {
  "use strict";

  const TAG = "[Tutores]";

  /* ---------- Config/API ---------- */
  const API_BASE = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
  const API = {
    tutores:  (window.API?.tutores)  || (API_BASE + "c_tutor.php"),
    iTutores: (window.API?.iTutores) || (API_BASE + "i_tutor.php"),
    uTutores: (window.API?.uTutores) || (API_BASE + "u_tutor.php"),
    cursos:   (window.API?.cursos)   || (API_BASE + "c_cursos.php"),
  };
  const API_UPLOAD = (window.API?.API_UPLOAD) || { tutorImg: (API_BASE + "u_tutorImg.php") };

  /* ---------- Estado ---------- */
  const S = {
    data: [],
    raw: [],
    page: 1,
    pageSize: 7,
    search: "",
    tempNewTutorImage: null,
  };

  /* ---------- Utils básicos ---------- */
  const qs = (s, r=document) => r.querySelector(s);
  const qsa = (s, r=document) => [].slice.call(r.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = (s) => String(s||"").normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().trim();
  const fmtDateTime = (dt) => { if(!dt) return "-"; try { const [d,t=""] = String(dt).split(" "); const [y,m,da]=d.split("-"); return `${da}/${m}/${y} ${t}`.trim(); } catch { return dt; } };
  const toast = (m,t="info",ms=2200)=> (window.gcToast?window.gcToast(m,t,ms):console.log(TAG,"toast["+t+"]:",m));

  async function postJSON(url, body) {
    console.log(TAG, "POST", url, { body });
    const r = await fetch(url, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(body||{}) });
    const text = await r.text().catch(()=> "");
    if (!r.ok) throw new Error(`HTTP ${r.status} ${text}`);
    try { return JSON.parse(text); } catch {}
    // recorte tolerante
    const fb = text.indexOf("{"), lb = text.lastIndexOf("}");
    const fb2 = text.indexOf("["), lb2 = text.lastIndexOf("]");
    let candidate = "";
    if (fb!==-1 && lb!==-1 && lb>fb) candidate = text.slice(fb, lb+1);
    else if (fb2!==-1 && lb2!==-1 && lb2>fb2) candidate = text.slice(fb2, lb2+1);
    if (candidate) { try { return JSON.parse(candidate); } catch {} }
    return { _raw: text };
  }

  function withBust(u){
    if(!u || typeof u!=="string" || u.startsWith("data:") || u.startsWith("blob:")) return u;
    try { const url = new URL(u, location.origin); url.searchParams.set("v", Date.now()); return url.pathname+"?"+url.searchParams.toString(); }
    catch { return u+(u.includes("?")?"&":"?")+"v="+Date.now(); }
  }

  function noImageSvgDataURI(){
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 100'><rect width='100%' height='100%' fill='#f3f3f3'/><path d='M18 74 L56 38 L92 66 L120 50 L142 74' stroke='#c9c9c9' stroke-width='4' fill='none'/><circle cx='52' cy='30' r='8' fill='#c9c9c9'/></svg>";
    return "data:image/svg+xml;utf8,"+encodeURIComponent(svg);
  }

  // ---------- Img helpers: sin onerror inline ----------
  function tutorImgUrl(id, ext="png"){ return `/ASSETS/tutor/tutor_${Number(id)}.${ext}`; }
  function cursoImgUrl(id, ext="png"){ return `/ASSETS/cursos/img${Number(id)}.${ext}`; }

  function setImgWithFallback(imgEl, primary, secondary, finalDataURI){
    if(!imgEl) return;
    const trySecond = () => { imgEl.onerror = () => { imgEl.onerror = null; imgEl.src = finalDataURI || noImageSvgDataURI(); }; imgEl.src = withBust(secondary); };
    imgEl.onerror = () => trySecond();
    imgEl.src = withBust(primary);
  }

  async function resolveTutorImgChain(id){
    // retorna ya con bust; no dispara 404 visibles
    return new Promise((res) => {
      const i = new Image();
      i.onload = () => res(withBust(tutorImgUrl(id,"png")));
      i.onerror = () => {
        const j = new Image();
        j.onload = () => res(withBust(tutorImgUrl(id,"jpg")));
        j.onerror = () => res(noImageSvgDataURI());
        j.src = withBust(tutorImgUrl(id,"jpg"));
      };
      i.src = withBust(tutorImgUrl(id,"png"));
    });
  }

  // ---------- Status helpers ----------
  function statusBadge(tipo, s){
    if (window.statusBadge) return window.statusBadge(tipo, s);
    const n = Number(s);
    const label = (n===1?"Activo":n===0?"Inactivo":"Pausado");
    return `<span class="gc-chip">${label}</span>`;
  }
  function statusSelect(id, val, tipo){
    if (window.statusSelect) return window.statusSelect(id, val, tipo);
    const v = Number(val);
    return `<select id="${id}">
      <option value="1"${v===1?" selected":""}>Activo</option>
      <option value="0"${v===0?" selected":""}>Inactivo</option>
      <option value="2"${v===2?" selected":""}>Pausado</option>
    </select>`;
  }

  const isAdminUser = (typeof window !== "undefined" && "isAdminUser" in window) ? window.isAdminUser : true;
  const state = (typeof window !== "undefined" && window.state) ? window.state : { currentDrawer:null, usuario:{ id:1 } };

  /* ---------- Drawer control (respeta core) ---------- */
  function openTutorDrawer(title, html){
    console.log(TAG, "openTutorDrawer()");
    const aside = qs("#drawer-tutor");
    const overlay = qs("#gc-dash-overlay");
    const t = qs("#drawer-tutor-title");
    const b = qs("#drawer-tutor-body");
    if (!aside) return;
    if (t) t.textContent = title || "Tutor · —";
    if (b) b.innerHTML = html || "";
    aside.classList.add("open");
    aside.removeAttribute("hidden");
    aside.setAttribute("aria-hidden","false");
    overlay && overlay.classList.add("open");
  }
  function closeTutorDrawer(){
    console.log(TAG, "closeTutorDrawer()");
    const aside = qs("#drawer-tutor");
    const overlay = qs("#gc-dash-overlay");
    if (!aside) return;
    try { const ae=document.activeElement; if (ae && aside.contains(ae)) ae.blur(); } catch {}
    aside.classList.remove("open");
    aside.setAttribute("hidden","");
    aside.setAttribute("aria-hidden","true");
    overlay && overlay.classList.remove("open");
  }
  // binds una vez
  (function bindDrawerOnce(){
    const btns = qsa("#drawer-tutor-close");
    btns.forEach(b=>{ if (!b._b){ b._b=true; b.addEventListener("click", closeTutorDrawer); }});
    const ov = qs("#gc-dash-overlay");
    if (ov && !ov._b){ ov._b=true; ov.addEventListener("click", closeTutorDrawer); }
    if (!window._gc_tutores_esc){
      window._gc_tutores_esc = true;
      document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeTutorDrawer(); });
    }
  })();

  /* ---------- Montaje Router ---------- */
  async function mount(){
    console.log(TAG, "mount()");
    const hdr = qs(".recursos-box.desktop-only .table-header");
    if (hdr){
      hdr.querySelector(".col-nombre") && (hdr.querySelector(".col-nombre").textContent="Nombre");
      const c2 = hdr.querySelector(".col-fecha") || hdr.querySelector(".col-tipo");
      if (c2){ c2.textContent = "Fecha de creación"; c2.classList.add("col-fecha"); }
      hdr.querySelector(".col-status") && (hdr.querySelector(".col-status").textContent="Status");
    }
    qs("#mod-title") && (qs("#mod-title").textContent="Tutores");
    qs(".tt-title") && (qs(".tt-title").textContent="Tutores:");
    const st = qs("#tt-status"); if (st){ st.textContent="Todos los estatus"; st.classList.remove("badge-inactivo"); st.classList.add("badge-activo"); }
    const s = qs("#search-input"); if (s && !s._b){ s._b=true; s.addEventListener("input", e=>{ S.search = e.target.value||""; draw(); }); }
    await load();
  }

  async function openCreate(){
    console.log(TAG, "openCreate()");
    S.tempNewTutorImage = null;
    state.currentDrawer = { type:"tutor", id:null, mode:"create" };
    openTutorDrawer("Tutor · Crear", renderDrawer({ id:"" }));
  }

  /* ---------- Carga & Listado ---------- */
  async function load(){
    console.log(TAG, "load()");
    try{
      const [act, inact, pa] = await Promise.all([
        postJSON(API.tutores, { estatus: 1 }),
        postJSON(API.tutores, { estatus: 0 }),
        postJSON(API.tutores, { estatus: 2 }),
      ]);
      const raw = [].concat(act||[], inact||[], pa||[]);
      S.raw = raw;
      S.data = raw.map(t => ({
        id: Number(t.id),
        nombre: t.nombre,
        descripcion: t.descripcion || "",
        estatus: Number(t.estatus),
        fecha_creacion: t.fecha_creacion,
        _all: t
      }));
      draw();
    } catch(e){
      console.error(TAG, "load error", e);
      toast("No se pudieron cargar tutores", "error");
    }
  }

  function draw(){
    const hostD = qs("#recursos-list");
    const hostM = qs("#recursos-list-mobile");
    if (hostD) hostD.innerHTML = "";
    if (hostM) hostM.innerHTML = "";

    const term = norm(S.search);
    const filtered = term ? S.data.filter(it => (norm(it.nombre).includes(term) || norm(it.descripcion).includes(term) || String(it.id).includes(term))) : S.data;

    const cnt = qs("#mod-count"); if (cnt) cnt.textContent = `${filtered.length} ${filtered.length===1?"elemento":"elementos"}`;

    const start = (S.page-1)*S.pageSize;
    const pageRows = filtered.slice(start, start + S.pageSize);

    if (!filtered.length){
      const empty = '<div class="empty-state" style="padding:1rem;">Sin resultados</div>';
      if (hostD) hostD.innerHTML = empty;
      if (hostM) hostM.innerHTML = empty;
      return;
    }

    // Desktop
    pageRows.forEach(it=>{
      hostD?.insertAdjacentHTML("beforeend", `
        <div class="table-row" data-id="${it.id}" data-type="tutor">
          <div class="col-nombre"><span class="name-text">${esc(it.nombre)}</span></div>
          <div class="col-fecha">${esc(fmtDateTime(it.fecha_creacion))}</div>
          <div class="col-status">${statusBadge("tutores", it.estatus)}</div>
        </div>
      `);
    });

    // Mobile
    pageRows.forEach(it=>{
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
              ${Number(it.estatus)===0?`<button class="gc-btn gc-btn--success gc-reactivate" data-id="${it.id}">Reactivar</button>`:""}
            </div>
          </div>
        </div>
      `);
    });

    // binds
    qsa("#recursos-list .table-row").forEach(row=>{
      row.addEventListener("click", ()=>{
        const id = Number(row.dataset.id);
        state.currentDrawer = { type:"tutor", id, mode:"view" };
        openTutorDrawer("Tutor · —", renderDrawer({ id: String(id) }));
      });
    });
    qsa("#recursos-list-mobile .open-drawer").forEach(btn=>{
      btn.addEventListener("click",(e)=>{
        e.stopPropagation();
        const id = Number(btn.closest(".table-row-mobile")?.dataset.id || 0);
        state.currentDrawer = { type:"tutor", id, mode:"view" };
        openTutorDrawer("Tutor · —", renderDrawer({ id: String(id) }));
      });
    });
    qsa(".gc-reactivate").forEach(btn=>{
      btn.addEventListener("click", async (e)=>{
        e.stopPropagation();
        const id = Number(btn.getAttribute("data-id"));
        try{ await reactivate(id); toast("Tutor reactivado","exito"); await load(); } catch(e){ toast("No se pudo reactivar","error"); }
      });
    });
  }

  /* ---------- Drawer (view/edit/create) ---------- */
  function renderDrawer(dataset){
    const item = S.data.find(x => String(x.id) === String(dataset.id));
    const mode = (state.currentDrawer?.mode) || (item ? "view" : "create");
    const isCreate = mode === "create" || !item;
    const isEdit   = mode === "edit";
    const isView   = mode === "view" && !!item;

    const t = isCreate ? getEmptyTutor() : (item ? item._all : null);
    if (!t) return "<p>No encontrado.</p>";

    // Acciones de cabecera SOLO en vista
    const headActions = (!isCreate && !isEdit && isAdminUser) ? `
      <div class="gc-actions" id="tutor-actions-view">
        <button class="gc-btn" id="btn-edit-tutor">Editar</button>
        ${Number(t.estatus)===0
          ? `<button class="gc-btn gc-btn--success" id="btn-reactivar-tutor">Reactivar</button>`
          : `<button class="gc-btn gc-btn--danger" id="btn-delete-tutor" data-step="1">Eliminar</button>`}
      </div>` : "";

    const viewHTML = `
      ${headActions}
      <section id="tutor-view" class="mode-view"${isView?"":" hidden"}>
        <div class="field">
          <div class="label">Nombre <span class="req">*</span></div>
          <div class="value" id="tv_nombre">${esc(t.nombre)}</div>
        </div>
        <div class="field">
          <div class="label">Descripción <span class="req">*</span></div>
          <div class="value" id="tv_descripcion">${esc(t.descripcion)}</div>
        </div>
        <div class="grid-3">
          <div class="field"><div class="label">Estatus</div><div class="value">${statusBadge("tutores", t.estatus)}</div></div>
          <div class="field"><div class="label">ID</div><div class="value">${esc(t.id)}</div></div>
          <div class="field"><div class="label">Fecha creación</div><div class="value">${esc(fmtDateTime(t.fecha_creacion))}</div></div>
        </div>

        <div class="field">
          <div class="label">Imagen</div>
          <div class="value">
            <div id="media-tutor" data-id="${t.id||item?.id||""}">
              <div class="media-head">
                <div class="media-title">Imágenes</div>
                <div class="media-help" style="color:#888;">Solo lectura</div>
              </div>
              <div class="media-grid">
                <div class="media-card">
                  <figure class="media-thumb">
                    <img id="tutor-img-view" alt="Foto" src="${noImageSvgDataURI()}">
                  </figure>
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
            <div class="hint gc-soft" style="margin-top:.35rem;">Toca una imagen para abrir el curso en modo solo lectura.</div>
          </div>
        </div>

        <details class="dev-json" id="tutor-json-box" open style="margin-top:16px;">
          <summary style="cursor:pointer;font-weight:600;">JSON · Tutor</summary>
          <div style="display:flex;gap:.5rem;margin:.5rem 0;"><button class="gc-btn" id="btn-copy-json-tutor">Copiar JSON</button></div>
          <pre id="json-tutor" class="value" style="white-space:pre-wrap;max-height:260px;overflow:auto;">${esc(JSON.stringify(t,null,2))}</pre>
        </details>
      </section>
    `;

    const editHTML = `
      <section id="tutor-edit" class="mode-edit"${(isCreate||isEdit)?"":" hidden"}>
        <div class="field">
          <label for="tf_nombre">Nombre <span class="req">*</span></label>
          <input id="tf_nombre" type="text" value="${esc(t.nombre||"")}" maxlength="120" data-max="120" />
          <small class="char-counter" data-for="tf_nombre"></small>
        </div>
        <div class="field">
          <label for="tf_descripcion">Descripción <span class="req">*</span></label>
          <textarea id="tf_descripcion" rows="8" maxlength="800" data-max="800">${esc(t.descripcion||"")}</textarea>
          <small class="char-counter" data-for="tf_descripcion"></small>
        </div>
        <div class="field">
          <label for="tf_estatus">Estatus</label>
          ${statusSelect("tf_estatus", t.estatus, "tutores")}
        </div>

        <div class="field">
          <label>Imagen</label>
          <div class="value">
            <div id="media-tutor-edit" class="media-grid" data-id="${t.id||item?.id||""}">
              <div class="media-card">
                <figure class="media-thumb">
                  <img alt="Foto" id="tutor-img-edit" src="${noImageSvgDataURI()}">
                  <button class="icon-btn media-edit" id="tutor-pencil" type="button" title="Editar imagen" aria-label="Editar imagen">
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
                  </button>
                </figure>
                <div class="media-meta"><div class="media-label">Foto</div></div>
                <div class="media-help gc-soft">JPG/PNG · Máx 2MB</div>
              </div>
            </div>
          </div>
        </div>

        <div class="field">
          <label>Cursos ligados</label>
          <div class="value"><div class="tutor-cursos" id="tutor-cursos-edit"></div></div>
        </div>

        <!-- Acciones abajo -->
        <div class="drawer-actions-row">
          <div class="row-right">
            <button class="gc-btn gc-btn--ghost" id="btn-cancel-tutor">Cancelar</button>
            <button class="gc-btn gc-btn--success" id="btn-save-tutor">Guardar</button>
          </div>
        </div>
      </section>
    `;

    // Post-mount config
    setTimeout(async () => {
      const titleEl = qs("#drawer-tutor-title");
      if (isCreate) { titleEl && (titleEl.textContent="Tutor · Crear"); state.currentDrawer = { type:"tutor", id:null, mode:"create" }; }
      else if (isEdit) { titleEl && (titleEl.textContent=`Tutor · ${item?item.nombre:""} (edición)`); state.currentDrawer = { type:"tutor", id:item?.id||null, mode:"edit" }; }
      else { titleEl && (titleEl.textContent=`Tutor · ${item?item.nombre:""}`); state.currentDrawer = { type:"tutor", id:item?.id||null, mode:"view" }; }

      // habilitar/RO
      if (window.disableDrawerInputs) window.disableDrawerInputs(!(isEdit||isCreate));

      // Header actions (vista)
      qs("#btn-edit-tutor")?.addEventListener("click", ()=>{
        state.currentDrawer = { type:"tutor", id:item?.id||null, mode:"edit" };
        qs("#drawer-tutor-body").innerHTML = renderDrawer({ id: String(item?.id||"") });
      });
      qs("#btn-delete-tutor")?.addEventListener("click", async (e)=>{
        const btn = e.currentTarget;
        const step = btn.getAttribute("data-step") || "1";
        if (step==="1"){
          btn.textContent="Confirmar";
          btn.setAttribute("data-step","2");
          setTimeout(()=>{ if(btn.getAttribute("data-step")==="2"){ btn.textContent="Eliminar"; btn.setAttribute("data-step","1"); } }, 3500);
          return;
        }
        try{ await softDelete(item); toast("Tutor movido a Inactivo","exito"); closeTutorDrawer(); await load(); }
        catch(err){ console.error(TAG,"delete",err); toast("No se pudo eliminar","error"); }
      });
      qs("#btn-reactivar-tutor")?.addEventListener("click", async ()=>{
        try{ await reactivate(Number(item?.id)); toast("Tutor reactivado","exito"); await load(); const re=S.data.find(x=>x.id===item.id); if(re) openTutorDrawer("Tutor · "+re.nombre, renderDrawer({ id:String(re.id) })); }
        catch(err){ console.error(TAG,"reactivar",err); toast("No se pudo reactivar","error"); }
      });

      // Botones abajo (edición/crear)
      qs("#btn-cancel-tutor")?.addEventListener("click", ()=>{
        if (isCreate){ S.tempNewTutorImage=null; closeTutorDrawer(); }
        else { state.currentDrawer = { type:"tutor", id:item?.id||null, mode:"view" }; qs("#drawer-tutor-body").innerHTML = renderDrawer({ id:String(item?.id||"") }); }
      });
      qs("#btn-save-tutor")?.addEventListener("click", async ()=>{
        try{ if(isCreate) await saveNew(); else await saveUpdate(item); }
        catch(err){ console.error(TAG,"save",err); toast("Error al guardar","error"); }
      });

      // Imagen (vista)
      if (isView){
        const tid = Number(t.id || item?.id || 0);
        const imgView = qs("#tutor-img-view");
        if (imgView && tid){
          setImgWithFallback(imgView, tutorImgUrl(tid,"png"), tutorImgUrl(tid,"jpg"), noImageSvgDataURI());
        }
      }

      // Imagen (edición / crear) con lápiz
      if (isEdit || isCreate){
        const tid = Number(t.id || item?.id || 0);
        const imgEdit = qs("#tutor-img-edit");
        if (imgEdit){
          if (tid) setImgWithFallback(imgEdit, tutorImgUrl(tid,"png"), tutorImgUrl(tid,"jpg"), noImageSvgDataURI());
          else imgEdit.src = noImageSvgDataURI();
        }
        const pencil = qs("#tutor-pencil");
        if (pencil && !pencil._b){
          pencil._b = true;
          pencil.addEventListener("click", () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/png,image/jpeg";
            input.style.display = "none";
            document.body.appendChild(input);
            input.addEventListener("change", async ()=>{
              const file = input.files && input.files[0];
              input.remove();
              if (!file) return;
              // valida
              if (!/image\/(png|jpeg)/.test(file.type)) return toast("Formato no permitido. Usa JPG o PNG.","error");
              if (file.size > 2*1048576) return toast("La imagen excede 2MB.","error");

              // crear: preview y subir al guardar
              if (!tid){
                const u = URL.createObjectURL(file);
                imgEdit && (imgEdit.src = withBust(u));
                S.tempNewTutorImage = file;
                toast("Imagen lista; se subirá al guardar.","info");
                return;
              }

              // edición: confirmar y subir inmediato
              if (!confirm("¿Subir nueva imagen del tutor?")) return;
              try{
                await uploadTutorImagen(tid, file);
                // refresca img (sin 404)
                setImgWithFallback(imgEdit, tutorImgUrl(tid,"png"), tutorImgUrl(tid,"jpg"), noImageSvgDataURI());
                toast("Imagen actualizada","exito");
              } catch (err){
                console.error(TAG, "upload tutor img", err);
                toast("No se pudo subir la imagen","error");
              }
            });
            input.click();
          });
        }
      }

      // JSON copy
      if (window.bindCopyFromPre) window.bindCopyFromPre("#json-tutor", "#btn-copy-json-tutor");

      // Chips de cursos
      const tgt = (isEdit || isCreate) ? "#tutor-cursos-edit" : "#tutor-cursos";
      renderTutorCursosChips(Number(t.id || item?.id || 0), tgt);

    }, 0);

    return viewHTML + editHTML;
  }

  function getEmptyTutor(){
    return {
      nombre:"",
      descripcion:"",
      estatus:1,
      creado_por: Number(window.usuario?.id || state?.usuario?.id || 1) || 1
    };
  }

  function readForm(existingId){
    const v = id => (qs("#"+id)?.value || "").trim();
    const n = id => Number(v(id) || 0);
    const payload = { nombre: v("tf_nombre"), descripcion: v("tf_descripcion"), estatus: n("tf_estatus")||1 };
    if (existingId != null) payload.id = Number(existingId);
    else payload.creado_por = Number(window.usuario?.id || state?.usuario?.id || 1) || 1;
    return payload;
  }

  function requireFields(p){
    const errs = [];
    if (!p.nombre) errs.push("Nombre");
    if (!p.descripcion) errs.push("Descripción");
    if (errs.length){ toast("Campos requeridos: "+errs.join(", "), "warning"); return false; }
    return true;
  }

  /* ---------- CRUD ---------- */
  async function softDelete(item){
    if (!item || !item._all) throw new Error("Item inválido");
    await postJSON(API.uTutores, { ...item._all, estatus: 0 });
  }
  async function reactivate(id){
    const it = S.data.find(x => x.id === Number(id));
    if (!it || !it._all) throw new Error("Tutor no encontrado");
    await postJSON(API.uTutores, { ...it._all, estatus: 1 });
  }
  async function uploadTutorImagen(tutorId, file){
    const fd = new FormData();
    fd.append("tutor_id", String(tutorId));
    fd.append("imagen", file);
    const r = await fetch(API_UPLOAD.tutorImg, { method:"POST", body: fd });
    const text = await r.text().catch(()=> "");
    if (!r.ok) throw new Error("HTTP "+r.status+" "+text);
    try { return JSON.parse(text); } catch { return { _raw:text }; }
  }

  async function saveNew(){
    const p = readForm(null);
    if (!requireFields(p)) return;
    const res = await postJSON(API.iTutores, p);
    const newId = Number(res?.id || res?.tutor_id || res?.insert_id || res?.data?.id || 0);
    if (newId && S.tempNewTutorImage instanceof File){
      try{ await uploadTutorImagen(newId, S.tempNewTutorImage); toast("Imagen subida","exito"); }
      catch(e){ console.error(TAG,"upload new",e); toast("Tutor creado, pero la imagen no se pudo subir.","error"); }
      finally{ S.tempNewTutorImage = null; }
    }
    toast("Tutor creado","exito");
    closeTutorDrawer();
    await load();
    if (newId){ const re = S.data.find(x=>x.id===newId); if (re) openTutorDrawer("Tutor · "+re.nombre, renderDrawer({ id:String(re.id) })); }
  }

  async function saveUpdate(item){
    if (!item || !item._all) return toast("Sin item para actualizar","error");
    const p = readForm(item.id);
    if (!requireFields(p)) return;
    await postJSON(API.uTutores, p);
    toast("Cambios guardados","exito");
    await load();
    const re = S.data.find(x=>x.id===item.id);
    if (re) openTutorDrawer("Tutor · "+re.nombre, renderDrawer({ id:String(re.id) }));
  }

  /* ---------- Cursos ligados (filtrando todos) ---------- */
  async function renderTutorCursosChips(tutorId, containerSel="#tutor-cursos"){
    const host = qs(containerSel);
    if (!host) return;

    try{
      const statuses = [1,4,2,3,0,5];
      const chunks = await Promise.all(statuses.map(st => postJSON(API.cursos, { estatus: st }).catch(()=> [])));
      const all = chunks.flat().filter(Boolean);
      const list = all.filter(c => Number(c.tutor)===Number(tutorId) || Number(c.id_tutor)===Number(tutorId));

      if (!list.length){
        host.innerHTML = '<span class="chip-empty">Sin cursos ligados</span>';
        return;
      }

      const orderKey = v => ({1:1, 4:2, 2:3, 3:4, 0:5, 5:5})[Number(v)] || 9;
      list.sort((a,b)=> orderKey(a.estatus)-orderKey(b.estatus) || String(a.nombre).localeCompare(String(b.nombre)));

      const statusCls = v => {
        const n = Number(v);
        if (n===1) return "s-1";      // Activo
        if (n===2) return "s-2";      // Pausado
        if (n===3) return "s-3";      // Terminado (gris)
        if (n===4) return "s-3";      // En curso → usa s-3 (tu CSS no tiene s-4)
        return "s-0";                 // Inactivo/Cancelado
      };

      host.innerHTML = list.map(cr => `
        <button class="curso-chip ${statusCls(cr.estatus)}" data-id="${cr.id}" aria-label="Abrir curso: ${esc(cr.nombre||"")}" title="${esc(cr.nombre||"")}">
          <img alt="Portada" id="chip-img-${cr.id}">
          <span>${esc((cr.nombre||"").slice(0,18))}</span>
        </button>
      `).join("");

      // set imágenes con fallback png → jpg → svg
      list.forEach(cr => {
        const im = qs(`#chip-img-${cr.id}`, host);
        if (im) setImgWithFallback(im, cursoImgUrl(cr.id,"png"), cursoImgUrl(cr.id,"jpg"), noImageSvgDataURI());
      });

      // click → drawer curso (solo lectura)
      host.querySelectorAll(".curso-chip").forEach(btn=>{
        btn.addEventListener("click", (e)=>{
          e.preventDefault();
          const cid = Number(btn.getAttribute("data-id"));
          if (typeof window.openCursoView === "function"){
            window.openCursoView(cid);
          } else {
            // compat básica: si no está el módulo, no hacemos nada
            toast("Drawer de curso no disponible en esta vista", "info");
          }
        });
      });

    } catch(e){
      console.error(TAG, "chips error", e);
      host.innerHTML = '<span class="chip-empty">No fue posible cargar los cursos</span>';
    }
  }

  /* ---------- API pública Router ---------- */
  window.tutores = { mount, openCreate };

  console.log(TAG, "Módulo tutores cargado.");
})();
