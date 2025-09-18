/* ==================== SUSCRIPCIONES (UAT) — Listado + Drawer ==================== */
(() => {
  "use strict";
  const TAG = "[Suscripciones]";

  /* ---------- API ---------- */
  const API_BASE = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
  const API = {
    suscripciones: (window.API?.suscripciones) || (API_BASE + "c_suscripciones.php"),
    iInscripcion:  (window.API?.iInscripcion)  || (API_BASE + "i_inscripcion.php"),
    uInscripcion:  (window.API?.uInscripcion)  || (API_BASE + "u_inscripcion.php"),
    cursos:        (window.API?.cursos)        || (API_BASE + "c_cursos.php"),
    usuarios:      (window.API?.usuarios)      || (API_BASE + "c_usuarios.php"),
  };

  /* ---------- Estado ---------- */
  const S = {
    page: 1,
    pageSize: 7,
    search: "",
    data: [],   // filas normalizadas
    raw: [],    // original
    maps: { cursos: null }, // id->nombre (para etiquetas)
    current: null, // { id, _all }
    create: { cursoId: null, usuario: null }, // estado del flujo "Inscribir"
  };
  window.__SuscripcionesState = S; // bandera para router

  /* ---------- Utils ---------- */
  const qs = (s, r=document) => r.querySelector(s);
  const qsa = (s, r=document) => [].slice.call(r.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = (s) => String(s||"").normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().trim();
  const fmtDateTime = (dt) => { if(!dt) return "-"; try{ const [d,t=""] = String(dt).split(" "); const [y,m,da]=d.split("-"); return `${da}/${m}/${y} ${t}`.trim(); }catch{return dt;} };
  function toast(msg, type="info", ms=2200){ if(window.gcToast) return window.gcToast(msg,type,ms); console.log(`${TAG} toast[${type}]`, msg); }

  async function postJSON(url, body){
    console.log(TAG, "POST", url, { body });
    const r = await fetch(url, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body||{}) });
    const text = await r.text().catch(()=> "");
    console.log(TAG, "HTTP", r.status, "raw:", text);
    if (!r.ok) throw new Error(`HTTP ${r.status} ${text}`);
    try { const j = JSON.parse(text); console.log(TAG, "JSON OK:", j); return j; } catch {}
    // recorte de emergencia
    const fb=text.indexOf("{"), lb=text.lastIndexOf("}");
    const fb2=text.indexOf("["), lb2=text.lastIndexOf("]");
    let c=""; if(fb!==-1&&lb!==-1&&lb>fb) c=text.slice(fb,lb+1); else if(fb2!==-1&&lb2!==-1&&lb2>fb2) c=text.slice(fb2,lb2+1);
    if (c) { try { const j2=JSON.parse(c); console.warn(TAG,"JSON trimmed:",j2); return j2; } catch{} }
    console.warn(TAG,"JSON parse failed; returning _raw");
    return { _raw: text };
  }

  // creado_por desde cookie usuario
  function getCreatorId(){
    try{
      const raw = document.cookie.split("; ").find(r=>r.startsWith("usuario="));
      if (!raw) return null;
      const json = decodeURIComponent(raw.split("=")[1] || "");
      const u = JSON.parse(json);
      const n = Number(u?.id);
      return Number.isFinite(n) ? n : null;
    }catch{ return null; }
  }

  // cursos → map id->nombre
  function arrToMap(arr){
    const m = {};
    (Array.isArray(arr)?arr:[]).forEach(x => { if (x && (x.id!=null)) m[x.id] = x.nombre || x.titulo || `#${x.id}`; });
    return m;
  }
  function mapCursosLabel(id){
    const m = S.maps.cursos || {};
    const k = String(id ?? "");
    return (k in m) ? (m[k] || `#${id}`) : `#${id}`;
  }

  // estatus (ajusta si tu backend usa otros)
  const STATUS_LABEL = { 1:"Activa", 0:"Inactiva", 2:"Pausada", 3:"Vencida", 4:"Próxima", 5:"Cancelada" };
  function statusBadge(tipo, s){
    if (window.statusBadge) return window.statusBadge(tipo, s);
    const label = STATUS_LABEL[Number(s)] || String(s);
    return `<span class="gc-chip">${label}</span>`;
  }
  function statusSelect(id, val){
    const v = Number(val);
    const opts = Object.entries(STATUS_LABEL).map(([k,lab]) => `<option value="${k}"${Number(k)===v?" selected":""}>${lab}</option>`).join("");
    return `<select id="${id}">${opts}</select>`;
  }

  /* ---------- Drawer helpers ---------- */
  function ensureDrawerDOM(){
    if (qs("#drawer-suscripcion")) return;
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <aside id="drawer-suscripcion" class="drawer gc-dash" aria-hidden="true" hidden>
        <div class="drawer-header">
          <div class="drawer-title" id="drawer-suscripcion-title">Suscripción · —</div>
          <div class="drawer-actions"><button class="btn" id="drawer-suscripcion-close">Cerrar</button></div>
        </div>
        <div class="drawer-body" id="drawer-suscripcion-body"></div>
      </aside>`;
    document.body.appendChild(wrap.firstElementChild);
    qs("#drawer-suscripcion-close")?.addEventListener("click", closeDrawer);
  }
  function openDrawer(title, html){
    ensureDrawerDOM();
    const aside = qs("#drawer-suscripcion");
    const overlay = qs("#gc-dash-overlay");
    const t = qs("#drawer-suscripcion-title");
    const b = qs("#drawer-suscripcion-body");
    if (t) t.textContent = title || "Suscripción · —";
    if (b) b.innerHTML = html || "";
    aside.classList.add("open"); aside.removeAttribute("hidden"); aside.setAttribute("aria-hidden","false");
    if (overlay){ overlay.classList.add("open"); overlay.hidden = false; overlay.setAttribute("aria-hidden","false"); }
  }
  function closeDrawer(){
    const aside = qs("#drawer-suscripcion");
    const overlay = qs("#gc-dash-overlay");
    if (!aside) return;
    try{ const ae=document.activeElement; if (ae && aside.contains(ae)) ae.blur(); }catch{}
    aside.classList.remove("open"); aside.setAttribute("hidden",""); aside.setAttribute("aria-hidden","true");
    if (overlay){ overlay.classList.remove("open"); overlay.hidden = true; overlay.setAttribute("aria-hidden","true"); }
  }
  // cerrar con overlay/Escape (una vez)
  (function bindOnce(){
    const ov = qs("#gc-dash-overlay");
    if (ov && !ov._sub_b){ ov._sub_b=true; ov.addEventListener("click", closeDrawer); }
    if (!window._gc_subs_esc){ window._gc_subs_esc = true; document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeDrawer(); }); }
  })();

  /* ---------- Catálogos mínimos ---------- */
  async function loadCatalogos(){
    try{
      // cursos disponibles para etiqueta y para inscribir (1,2,4)
      const stsList = [1,2,4];
      const chunks = await Promise.all(stsList.map((st)=> postJSON(API.cursos, { estatus: st }).catch(()=>[])));
      const flat = chunks.flat().filter(Boolean);
      S.maps.cursos = arrToMap(flat);
      console.log(TAG, "Catálogo cursos:", S.maps.cursos);
    }catch(e){ console.warn(TAG, "No se pudieron cargar catálogos de cursos:", e); }
  }

  /* ---------- Carga listado ---------- */
  async function load(){
    console.log(TAG, "load()…");
    try{
      // algunos backends exigen estatus; pedimos varios y aplanamos
      const sts = [1,0,2,3,4,5];
      const chunks = await Promise.all(sts.map((st)=> postJSON(API.suscripciones, { estatus: st }).catch(()=>[])));
      const flat = chunks.flat().filter(Boolean);

      S.raw = flat;
      // normalización mínima
      S.data = flat.map(x => ({
        id: Number(x.id ?? x.suscripcion_id ?? x.inscripcion_id ?? 0),
        alumno: x.alumno_nombre || x.nombre_usuario || x.nombre || x.suscriptor || x.usuario || x.user || x.id_alumno || x.usuario_id || "-",
        usuario_id: Number(x.usuario_id ?? x.user_id ?? x.alumno ?? x.alumno_id ?? x.usuario ?? 0) || null,
        curso:  Number(x.curso ?? x.curso_id ?? x.id_curso ?? 0) || null,
        estatus: Number(x.estatus ?? x.status ?? 0),
        fecha_creacion: x.fecha_creacion ?? x.creado ?? x.created_at ?? null,
        fecha_inicio: x.fecha_inicio ?? null,
        fecha_fin: x.fecha_fin ?? null,
        comentario: x.comentario ?? x.nota ?? "",
        _all: x
      }));
      console.log(TAG, "Cargadas suscripciones:", S.data.length);
      S.page = 1;
      render();
    }catch(e){
      console.error(TAG, "load ERROR:", e);
      const hostD = qs("#recursos-list"); if (hostD) hostD.innerHTML = `<div class="table-row"><div class="col-nombre">Error cargando suscripciones</div></div>`;
    }
  }

  function render(){
    console.log(TAG, "render() page", S.page, "search=", S.search);
    const hostD = qs("#recursos-list");
    const hostM = qs("#recursos-list-mobile");
    if (hostD) hostD.innerHTML = "";
    if (hostM) hostM.innerHTML = "";

    const term = norm(S.search);
    const filtered = term
      ? S.data.filter(r => norm(JSON.stringify(r._all||r)).includes(term))
      : S.data;

    const modCount = qs("#mod-count");
    if (modCount) modCount.textContent = `${filtered.length} ${filtered.length===1?"elemento":"elementos"}`;

    const totalPages = Math.max(1, Math.ceil(filtered.length / S.pageSize));
    if (S.page > totalPages) S.page = totalPages;
    const start = (S.page - 1) * S.pageSize;
    const pageRows = filtered.slice(start, start + S.pageSize);

    // Desktop
    if (hostD){
      if (!pageRows.length){
        hostD.insertAdjacentHTML("beforeend", `<div class="table-row"><div class="col-nombre">Sin resultados</div></div>`);
      } else {
        pageRows.forEach(it=>{
          hostD.insertAdjacentHTML("beforeend", `
            <div class="table-row" role="row" data-mod="suscripcion" data-id="${it.id}">
              <div class="col-nombre" role="cell">${esc(String(it.alumno ?? "—"))}</div>
              <div class="col-curso"  role="cell">${esc(mapCursosLabel(it.curso))}</div>
              <div class="col-fecha"  role="cell">${esc(fmtDateTime(it.fecha_creacion))}</div>
              <div class="col-status" role="cell">${statusBadge("suscripciones", it.estatus)}</div>
            </div>
          `);
        });
        qsa('.table-row[data-mod="suscripcion"]', hostD).forEach(row=>{
          row.addEventListener("click", ()=>{
            const id = Number(row.dataset.id);
            const it = S.data.find(x => +x.id === +id);
            if (it) openView(it);
          });
        });
      }
    }

    // Mobile
    if (hostM){
      if (!pageRows.length){
        hostM.insertAdjacentHTML("beforeend", `<div class="table-row"><div class="col-nombre">Sin resultados</div></div>`);
      } else {
        pageRows.forEach(it=>{
          hostM.insertAdjacentHTML("beforeend", `
            <div class="table-row-mobile" data-mod="suscripcion" data-id="${it.id}">
              <div class="row-head">
                <div class="title">${esc(String(it.alumno ?? "—"))}</div>
                <button class="open-drawer gc-btn" type="button">Ver</button>
              </div>
            </div>
          `);
        });
        qsa('.table-row-mobile[data-mod="suscripcion"] .open-drawer', hostM).forEach(btn=>{
          btn.addEventListener("click", (e)=>{
            e.stopPropagation();
            const id = Number(btn.closest('.table-row-mobile[data-mod="suscripcion"]')?.dataset.id || 0);
            const it = S.data.find(x => +x.id === +id);
            if (it) openView(it);
          });
        });
      }
    }

    renderPagination(filtered.length);
  }

  function renderPagination(total){
    const totalPages = Math.max(1, Math.ceil(total / S.pageSize));
    [qs("#pagination-controls"), qs("#pagination-mobile")].forEach(cont=>{
      if (!cont) return;
      cont.innerHTML = "";
      if (totalPages <= 1) return;
      const mk = (txt, dis, cb, cls="page-btn") => {
        const b = document.createElement("button");
        b.textContent = txt; b.className = cls + (dis?" disabled":"");
        if (dis) b.disabled = true; else b.onclick = cb;
        return b;
      };
      cont.appendChild(mk("‹", S.page===1, ()=>{ S.page=Math.max(1,S.page-1); render(); }, "arrow-btn"));
      for (let p=1; p<=totalPages && p<=7; p++){
        const b = mk(String(p), false, ()=>{ S.page=p; render(); });
        if (p===S.page) b.classList.add("active");
        cont.appendChild(b);
      }
      cont.appendChild(mk("›", S.page===totalPages, ()=>{ S.page=Math.min(totalPages,S.page+1); render(); }, "arrow-btn"));
    });
  }

  /* ---------- Drawer: Ver ---------- */
  function openView(row){
    console.log(TAG, "openView id=", row?.id, row);
    S.current = { id: row.id, _all: row._all };
    openDrawer(`Suscripción · #${row.id}`, renderDrawerView(row._all));
    bindViewActions(row);
  }

  function renderDrawerView(data){
    const jsonPretty = `
      <details class="dev-json" open style="margin-top:12px;">
        <summary style="cursor:pointer;font-weight:600;">JSON · Suscripción</summary>
        <div style="display:flex;gap:.5rem;margin:.5rem 0;"><button class="gc-btn" id="btn-copy-json-sus">Copiar JSON</button></div>
        <pre id="json-sus" class="value" style="white-space:pre-wrap;max-height:260px;overflow:auto;">${esc(JSON.stringify(data||{},null,2))}</pre>
      </details>`;

    return `
      <section id="sus-view" class="mode-view">
        <div class="gc-actions" id="sus-actions-view">
          <button class="gc-btn" id="sus-edit">Editar</button>
          ${Number(data?.estatus)===0
            ? `<button class="gc-btn gc-btn--success" id="sus-reactivar">Reactivar</button>`
            : `<button class="gc-btn gc-btn--danger" id="sus-eliminar" data-step="1">Eliminar</button>`}
        </div>

        <div class="field"><div class="label">Alumno</div><div class="value" id="sv_alumno">${esc(String(data?.alumno_nombre || data?.usuario_nombre || data?.suscriptor || data?.usuario || data?.user || "—"))}</div></div>
        <div class="field"><div class="label">Curso</div><div class="value" id="sv_curso">${esc(mapCursosLabel(data?.curso ?? data?.curso_id))}</div></div>

        <div class="grid-3">
          <div class="field"><div class="label">Estatus</div><div class="value" id="sv_estatus">${esc(STATUS_LABEL[Number(data?.estatus)] || String(data?.estatus ?? "—"))}</div></div>
          <div class="field"><div class="label">Creación</div><div class="value" id="sv_fecha_creacion">${esc(fmtDateTime(data?.fecha_creacion))}</div></div>
          <div class="field"><div class="label">Inicio</div><div class="value" id="sv_inicio">${esc(String(data?.fecha_inicio ?? "—"))}</div></div>
        </div>

        <div class="grid-3">
          <div class="field"><div class="label">Fin</div><div class="value" id="sv_fin">${esc(String(data?.fecha_fin ?? "—"))}</div></div>
          <div class="field"><div class="label">Monto</div><div class="value" id="sv_monto">${esc(String(data?.monto ?? "—"))}</div></div>
          <div class="field"><div class="label">Moneda</div><div class="value" id="sv_moneda">${esc(String(data?.moneda ?? "—"))}</div></div>
        </div>

        <div class="field">
          <div class="label">Comentario</div>
          <div class="value" id="sv_comentario">${esc(String(data?.comentario ?? data?.nota ?? "—"))}</div>
        </div>

        ${jsonPretty}
      </section>
    `;
  }

  function bindViewActions(row){
    qs("#sus-edit")?.addEventListener("click", ()=>{
      openDrawer(`Suscripción · #${row.id} (edición)`, renderDrawerEdit(row._all));
      bindEditActions(row._all);
    });

    const btnDel = qs("#sus-eliminar");
    if (btnDel){
      btnDel.addEventListener("click", async ()=>{
        if (btnDel.dataset.step!=="2"){
          btnDel.dataset.step="2"; btnDel.textContent="¿Confirmar?";
          setTimeout(()=>{ btnDel.dataset.step="1"; btnDel.textContent="Eliminar"; }, 3000);
          return;
        }
        try{
          // soft-delete → estatus 0
          await postJSON(API.uInscripcion, { id: row.id, estatus: 0 });
          toast("Suscripción movida a Inactiva", "exito");
          closeDrawer(); await load();
        }catch(e){ console.error(TAG,"delete",e); toast("No se pudo eliminar","error"); }
      });
    }

    qs("#sus-reactivar")?.addEventListener("click", async ()=>{
      try{ await postJSON(API.uInscripcion, { id: row.id, estatus: 1 }); toast("Reactivada","exito"); closeDrawer(); await load(); }
      catch(e){ console.error(TAG,"reactivar",e); toast("No se pudo reactivar","error"); }
    });

    // copiar JSON
    if (window.bindCopyFromPre) window.bindCopyFromPre("#json-sus", "#btn-copy-json-sus");
  }

  /* ---------- Drawer: Editar ---------- */
  function renderDrawerEdit(data){
    return `
      <section id="sus-edit" class="mode-edit">
        <div class="grid-3">
          <div class="field"><label>Alumno</label><div class="value">${esc(String(data?.alumno_nombre || data?.usuario_nombre || data?.suscriptor || data?.usuario || data?.user || "—"))}</div></div>
          <div class="field"><label>Curso</label><div class="value">${esc(mapCursosLabel(data?.curso ?? data?.curso_id))}</div></div>
          <div class="field"><label for="se_estatus">Estatus</label>${statusSelect("se_estatus", data?.estatus ?? 1)}</div>
        </div>

        <div class="field">
          <label for="se_comentario">Comentario</label>
          <textarea id="se_comentario" rows="4" maxlength="1000">${esc(String(data?.comentario ?? data?.nota ?? ""))}</textarea>
        </div>

        <div class="drawer-actions-row">
          <div class="row-right">
            <button class="gc-btn gc-btn--ghost" id="se_cancel">Cancelar</button>
            <button class="gc-btn gc-btn--success" id="se_save">Guardar</button>
          </div>
        </div>
      </section>
    `;
  }

  function bindEditActions(data){
    qs("#se_cancel")?.addEventListener("click", ()=>{
      openDrawer(`Suscripción · #${data.id}`, renderDrawerView(data));
      bindViewActions({ id:data.id, _all:data });
    });

    qs("#se_save")?.addEventListener("click", async ()=>{
      const body = {
        id: Number(data?.id),
        estatus: Number(qs("#se_estatus")?.value || data?.estatus || 1),
        comentario: (qs("#se_comentario")?.value || "").trim(),
      };
      console.log(TAG, "update body=", body);

      try{
        await postJSON(API.uInscripcion, body);
        toast("Cambios guardados","exito");
        closeDrawer();
        await load();
        const re = S.data.find(x=>x.id===body.id);
        if (re) openView(re);
      }catch(e){
        console.error(TAG, "update ERROR:", e);
        toast("No se pudo guardar","error");
      }
    });
  }

  /* ---------- Drawer: Crear (Inscribir) ---------- */
  function openCreate(){
    console.log(TAG, "openCreate()");
    S.create = { cursoId: null, usuario: null };
    openDrawer("Suscripción · Crear", renderDrawerCreate());
    bindCreateActions();
  }

  function renderDrawerCreate(){
    const cursoOptions = Object.entries(S.maps.cursos || {})
      .map(([id, name]) => `<option value="${id}">${esc(name)}</option>`)
      .join("");

    return `
      <section id="sus-create" class="mode-edit">
        <!-- Acciones arriba -->
        <div class="drawer-actions-row" style="justify-content:flex-start; gap:8px; margin-top:-8px;">
          <button class="gc-btn gc-btn--ghost" id="sc_cancel_head">Cancelar</button>
          <button class="gc-btn gc-btn--success" id="sc_inscribir" disabled>Inscribir</button>
        </div>

        <div class="field">
          <label for="sc_curso">Curso <span class="req">*</span></label>
          <select id="sc_curso">
            <option value="">— Selecciona un curso —</option>
            ${cursoOptions}
          </select>
        </div>

        <div class="field">
          <label for="sc_ident">Buscar cuenta (teléfono o correo) <span class="req">*</span></label>
          <div style="display:flex;gap:8px;align-items:center;">
            <input id="sc_ident" type="text" placeholder="3322… o correo@dominio">
            <button class="gc-btn" id="sc_buscar">Buscar</button>
            <button class="gc-btn gc-btn--ghost" id="sc_cambiar" disabled>Cambiar usuario</button>
          </div>
        </div>

        <div id="sc_user_panel" style="display:none;">
          <div class="field">
            <label>Nombre</label>
            <input id="sc_nombre" type="text" disabled>
          </div>
          <div class="field">
            <label>Correo</label>
            <input id="sc_correo" type="email" disabled>
          </div>
          <div class="field">
            <label>Teléfono</label>
            <input id="sc_tel" type="text" disabled>
          </div>
          <div class="field">
            <label>Fecha de nacimiento</label>
            <input id="sc_fnac" type="date" disabled>
          </div>

          <div class="field">
            <label>Medios de contacto</label>
            <div class="value" style="display:flex;gap:18px;">
              <label><input id="sc_mc_tel" type="checkbox" disabled> Teléfono</label>
              <label><input id="sc_mc_mail" type="checkbox" disabled> Correo</label>
            </div>
          </div>
        </div>

        <div class="field">
          <label for="sc_comentario">Comentario</label>
          <textarea id="sc_comentario" rows="3" placeholder="Opcional"></textarea>
        </div>

        <!-- Acciones abajo (duplicadas por patrón) -->
        <div class="drawer-actions-row">
          <div class="row-right">
            <button class="gc-btn gc-btn--ghost" id="sc_cancel">Cancelar</button>
            <button class="gc-btn gc-btn--success" id="sc_inscribir_b" disabled>Inscribir</button>
          </div>
        </div>
      </section>
    `;
  }

  function bindCreateActions(){
    const bCancelTop = qs("#sc_cancel_head");
    const bCancelBot = qs("#sc_cancel");
    const bInsTop    = qs("#sc_inscribir");
    const bInsBot    = qs("#sc_inscribir_b");
    const setInscribirEnabled = (on) => {
      [bInsTop, bInsBot].forEach(b => { if (b){ b.disabled = !on; }});
    };

    const selectCurso = qs("#sc_curso");
    const identInput  = qs("#sc_ident");
    const btnBuscar   = qs("#sc_buscar");
    const btnCambiar  = qs("#sc_cambiar");

    function checkReady(){
      const ok = !!S.create.cursoId && !!S.create.usuario;
      setInscribirEnabled(ok);
    }

    if (bCancelTop) bCancelTop.onclick = closeDrawer;
    if (bCancelBot) bCancelBot.onclick = closeDrawer;

    if (selectCurso){
      selectCurso.addEventListener("change", ()=>{
        S.create.cursoId = Number(selectCurso.value || 0) || null;
        checkReady();
      });
    }

    if (btnBuscar){
      btnBuscar.addEventListener("click", async ()=>{
        const ident = (identInput?.value || "").trim();
        if (!ident) return toast("Ingresa teléfono o correo para buscar.","warning");
        try{
          const user = await buscarUsuario(ident);
          if (!user){ toast("No se encontró usuario con ese dato.","warning"); return; }
          S.create.usuario = user;
          pintarUsuario(user);
          btnCambiar.disabled = false;
          checkReady();
          toast("Usuario encontrado","exito");
        }catch(e){
          console.error(TAG, "buscar usuario ERROR", e);
          toast("No se pudo buscar usuario","error");
        }
      });
    }

    if (btnCambiar){
      btnCambiar.addEventListener("click", ()=>{
        S.create.usuario = null;
        qs("#sc_user_panel").style.display = "none";
        identInput.value = "";
        btnCambiar.disabled = true;
        checkReady();
      });
    }

    // Inscribir (top y bottom)
    async function doInscribir(){
      if (!S.create.cursoId || !S.create.usuario) return;
      const uid = Number(S.create.usuario.id ?? S.create.usuario.usuario_id ?? S.create.usuario.alumno_id ?? S.create.usuario.user_id ?? 0);
      if (!uid) return toast("ID de usuario inválido","error");
      const body = {
        curso: S.create.cursoId,
        usuario: uid,
        comentario: (qs("#sc_comentario")?.value || "").trim(),
        creado_por: getCreatorId() ?? undefined,
      };
      console.log(TAG, "inscribir body=", body);
      try{
        const res = await postJSON(API.iInscripcion, body);
        const newId = Number(res?.id || res?.inscripcion_id || res?.insert_id || res?.data?.id || 0);
        toast("Inscripción creada","exito");
        closeDrawer();
        await load();
        const re = S.data.find(x=>x.id===newId);
        if (re) openView(re);
      }catch(e){
        console.error(TAG, "inscribir ERROR", e);
        toast("No se pudo inscribir","error");
      }
    }
    [bInsTop, bInsBot].forEach(b => { if (b) b.onclick = doInscribir; });
  }

  async function buscarUsuario(ident){
    // intenta por teléfono y por correo con el mismo campo
    const body = { telefono: ident, correo: ident };
    const res = await postJSON(API.usuarios, body);
    const arr = Array.isArray(res) ? res
              : Array.isArray(res?.data) ? res.data
              : Array.isArray(res?.usuarios) ? res.usuarios
              : [];
    console.log(TAG, "buscarUsuario:", ident, "→", arr);
    return arr[0] || null;
  }

  function pintarUsuario(u){
    const pnl = qs("#sc_user_panel");
    if (!pnl) return;
    pnl.style.display = "";

    const nombre = u.nombre_completo || u.nombre || [u.nombre1,u.nombre2,u.apellido_paterno,u.apellido_materno].filter(Boolean).join(" ") || "";
    const tel    = u.telefono || u.celular || u.tel || "";
    const mail   = u.correo || u.email || "";
    const fnac   = (u.fecha_nacimiento || u.fnac || "").slice(0,10);

    qs("#sc_nombre").value = nombre;
    qs("#sc_correo").value = mail;
    qs("#sc_tel").value    = tel;
    qs("#sc_fnac").value   = fnac;

    const prefer = String(u.medio_contacto || u.preferencias_contacto || "").toLowerCase();
    qs("#sc_mc_tel").checked  = /tel|phone/.test(prefer);
    qs("#sc_mc_mail").checked = /mail|correo|email/.test(prefer);
  }

  /* ---------- Búsqueda global ---------- */
  const searchInput = qs("#search-input");
  if (searchInput && !searchInput._b){
    searchInput._b = true;
    searchInput.addEventListener("input", (e)=>{ S.search = e.target.value || ""; S.page = 1; render(); });
  }

  /* ---------- API pública para el router ---------- */
  async function mount(){
    console.log(TAG, "mount() INICIO");
    window.__activeModule = "suscripciones";
    try{
      const hostD = qs("#recursos-list");
      if (hostD) hostD.innerHTML = `<div class="table-row"><div class="col-nombre">Cargando…</div></div>`;
      await loadCatalogos();
      await load();
      console.log(TAG, "mount() OK");
    }catch(e){
      console.error(TAG, "mount ERROR:", e);
      const hostD = qs("#recursos-list");
      if (hostD) hostD.innerHTML = `<div class="table-row"><div class="col-nombre">Error al cargar</div></div>`;
    }
  }

  function openCreateExposed(){ openCreate(); }

  // expone para router
  globalThis.suscripciones = { mount, openCreate: openCreateExposed };
  console.log(TAG, "Módulo suscripciones cargado.");
})();
