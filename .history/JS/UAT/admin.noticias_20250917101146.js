/* ==================== NOTICIAS (ajustado a Postman) ==================== */
(() => {
  "use strict";

  // Requiere gcUtils (cargado por cursos / bloque 0)
  if (!window.gcUtils) {
    console.error("[Noticias] gcUtils no disponible. Carga primero admin.cursos.js (Bloque 0).");
    return;
  }
  const { qs, esc, postJSON, toast } = window.gcUtils;

  /* ==================== Endpoints ==================== */
  const API_BASE = "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
  const NAPI = {
    list: API_BASE + "c_noticia.php",   // POST {} -> [noticias]
    insert: API_BASE + "i_noticia.php", // POST {titulo,desc_uno,desc_dos,creado_por,estatus}
    update: API_BASE + "u_noticia.php", // POST {id,titulo,desc_uno,desc_dos,creado_por,estatus}
  };
  window.NAPI = Object.freeze(NAPI);

  /* ==================== Estado ==================== */
  const NS = {
    current: null // { id, _all }
  };
  window.__NoticiasState = NS;

  /* ==================== Drawer helpers ==================== */
  function openDrawerNoticia() {
    const d = qs("#drawer-noticia");
    const ov = qs("#gc-dash-overlay");
    if (!d) return;
    d.classList.add("open");
    d.removeAttribute("hidden");
    d.setAttribute("aria-hidden", "false");
    ov && ov.classList.add("open");
  }
  function closeDrawerNoticia() {
    const d = qs("#drawer-noticia");
    const ov = qs("#gc-dash-overlay");
    if (!d) return;
    d.classList.remove("open");
    d.setAttribute("hidden", "");
    d.setAttribute("aria-hidden", "true");
    ov && ov.classList.remove("open");
    NS.current = null;
  }
  const nCloseBtn = qs("#drawer-noticia-close");
  if (nCloseBtn && !nCloseBtn._bound) {
    nCloseBtn._bound = true;
    nCloseBtn.addEventListener("click", closeDrawerNoticia);
  }
  const overlay = qs("#gc-dash-overlay");
  if (overlay && !overlay._bound) {
    overlay._bound = true;
    overlay.addEventListener("click", closeDrawerNoticia);
  }
  if (!window._gc_news_esc) {
    window._gc_news_esc = true;
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawerNoticia(); });
  }

  function setNoticiaMode(mode) {
    const v = qs("#noticia-view");
    const e = qs("#noticia-edit");
    const act = qs("#noticia-actions-view");
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

  /* ==================== View helpers ==================== */
  function putHTML(sel, val) { const el = qs(sel); if (el) el.innerHTML = esc(val ?? "—"); }
  function setVal(id, v) { const el = qs("#" + id); if (el) el.value = v == null ? "" : String(v); }
  function val(id) { return (qs("#" + id)?.value || "").trim(); }
  function num(id) { const v = val(id); return v === "" ? "" : Number(v); }

  function estatusLabel(v) {
    const map = { "1": "Activo", "0": "Inactivo", "2": "Borrador" };
    return map[String(v)] ?? v ?? "—";
  }

  function putStatusSelect(id, selVal) {
    const el = qs("#" + id); if (!el) return;
    const opts = [
      { v: 1, l: "Activo" },
      { v: 0, l: "Inactivo" },
      { v: 2, l: "Borrador" },
    ];
    el.innerHTML = opts
      .map(o => `<option value="${o.v}"${(+o.v === +selVal) ? " selected" : ""}>${o.l}</option>`)
      .join("");
  }

  /* ==================== Vista (READ) ==================== */
  async function fillNoticiaView(n) {
    // Título del drawer
    const t = qs("#drawer-noticia-title");
    if (t) t.textContent = "Noticia · " + (n.titulo || "—");

    // Campos de solo lectura
    putHTML("#nv_titulo", n.titulo);
    putHTML("#nv_desc_uno", n.desc_uno);
    putHTML("#nv_desc_dos", n.desc_dos);
    putHTML("#nv_estatus", estatusLabel(n.estatus));
    putHTML("#nv_fecha_creacion", n.fecha_creacion || "—");
    putHTML("#nv_fecha_modif", n.fecha_modif || "—");

    // Acciones en vista
    const bEdit = qs("#n-btn-edit");
    if (bEdit && !bEdit._bound) {
      bEdit._bound = true;
      bEdit.addEventListener("click", () => {
        setNoticiaMode("edit");
        fillNoticiaEdit(NS.current ? NS.current._all : n);
      });
    }
    const bDel = qs("#n-btn-delete"); // (si implementas borrado real, engancha aquí)
    if (bDel && !bDel._bound) {
      bDel._bound = true;
      bDel.addEventListener("click", () => {
        const step = bDel.getAttribute("data-step") === "2" ? "1" : "2";
        bDel.setAttribute("data-step", step);
      });
    }
  }

  async function openNoticiaEditById(id, loader) {
    const it = await loader(id); // función que obtiene una noticia por id
    if (!it) return;
    NS.current = { id: it.id, _all: it };
    openDrawerNoticia();
    setNoticiaMode("edit");
    fillNoticiaEdit(it);
  }

  function openNoticiaCreate() {
    const blank = {
      id: null,
      titulo: "",
      desc_uno: "",
      desc_dos: "",
      creado_por: "", // opcional: puedes asignar el id del usuario logeado aquí
      estatus: 2,     // Borrador por defecto
      fecha_creacion: null,
      fecha_modif: null
    };
    NS.current = { id: null, _all: blank };
    openDrawerNoticia();
    setNoticiaMode("edit");
    fillNoticiaEdit(blank);
  }

  /* ==================== Edición (EDIT) ==================== */
  function fillNoticiaEdit(n) {
    // Inputs
    setVal("n_titulo", n.titulo);
    setVal("n_desc_uno", n.desc_uno);
    setVal("n_desc_dos", n.desc_dos);
    setVal("n_creado_por", n.creado_por ?? ""); // si no lo usas en UI, puedes omitir este campo

    // Select estatus
    putStatusSelect("n_estatus", n.estatus);

    // Botones
    const bSave = qs("#n-btn-save");
    const bCancel = qs("#n-btn-cancel");

    if (bSave && !bSave._bound) {
      bSave._bound = true;
      bSave.addEventListener("click", saveNoticia);
    }
    if (bCancel && !bCancel._bound) {
      bCancel._bound = true;
      bCancel.addEventListener("click", () => {
        setNoticiaMode("view");
        fillNoticiaView(NS.current ? NS.current._all : n);
      });
    }
  }

  async function saveNoticia() {
    const body = {
      id: NS.current?.id ?? null,
      titulo: val("n_titulo"),
      desc_uno: val("n_desc_uno"),
      desc_dos: val("n_desc_dos"),
      // Si no quieres exponer este campo en UI, coloca aquí el id del usuario logeado:
      creado_por: num("n_creado_por") || NS.current?._all?.creado_por || "",
      estatus: num("n_estatus"),
    };

    // Validaciones mínimas
    if (!body.titulo || !body.desc_uno || !body.desc_dos) {
      toast("Completa título, desc_uno y desc_dos.", "error");
      return;
    }

    try {
      if (body.id == null) {
        await postJSON(NAPI.insert, body);
        toast("Noticia creada", "exito");
      } else {
        await postJSON(NAPI.update, body);
        toast("Noticia actualizada", "exito");
      }

      // Actualiza estado local y vuelve a vista
      const updated = Object.assign({}, NS.current?._all || {}, body);
      NS.current = { id: updated.id ?? NS.current?.id, _all: updated };
      setNoticiaMode("view");
      fillNoticiaView(updated);

      // Opcional: refrescar listado si estás en la tabla.
      // await noticiasInit();

    } catch (err) {
      console.error("[Noticias] saveNoticia error:", err);
      toast("No se pudo guardar la noticia.", "error");
    }
  }

  /* ==================== Listado / Init ==================== */
  async function noticiasInit() {
    console.log("fuera del init de noticias");

    try {
      console.log("dentro del init de noticias");
      // Pedimos TODO. Si tu API requiere {estatus:1} para activas, cambia el body aquí.
      let noticias = await postJSON(NAPI.list, {}).catch(() => []);
      if (!Array.isArray(noticias)) noticias = [];

      // Desktop (tabla)
      const $list = document.querySelector('#recursos-list');
      if ($list) {
        $list.innerHTML = '';
        noticias.forEach((n) => {
          const row = document.createElement('div');
          row.className = 'table-row';
          row.innerHTML = `
      <div class="col-nombre txt-ellipsis" title="${esc(n.titulo ?? '')}">${esc(n.titulo ?? '-')}</div>
      <div class="col-fecha">${esc(n.fecha_creacion ?? '-')}</div>
      <div class="col-status">${esc(({ "1": "Activo", "0": "Inactivo", "2": "Borrador" }[String(n.estatus)] || n.estatus))}</div>
      <div class="col-acc"><button class="gc-btn mini ver">Ver</button></div>
    `;
          row.querySelector('.ver')?.addEventListener('click', () => {
            openDrawerNoticia();
            setNoticiaMode('view');
            __NoticiasState.current = { id: n.id, _all: n };
            fillNoticiaView(n);
          });
          $list.appendChild(row);
        });
      }

      // Mobile
      const $listMobile = document.querySelector('#recursos-list-mobile');
      if ($listMobile) {
        $listMobile.innerHTML = '';
        noticias.forEach((n) => {
          const card = document.createElement('div');
          card.className = 'table-row';
          card.innerHTML = `
      <div class="col-nombre">${esc(n.titulo ?? '-')}</div>
      <div class="col-fecha">${esc(n.fecha_creacion ?? '-')}</div>
      <div class="col-status">${esc(({ "1": "Activo", "0": "Inactivo", "2": "Borrador" }[String(n.estatus)] || n.estatus))}</div>
      <div class="col-acc"><button class="gc-btn mini ver">Ver</button></div>
    `;
          card.querySelector('.ver')?.addEventListener('click', () => {
            openDrawerNoticia();
            setNoticiaMode('view');
            __NoticiasState.current = { id: n.id, _all: n };
            fillNoticiaView(n);
          });
          $listMobile.appendChild(card);
        });
      }


    } catch (err) {
      console.error("[Noticias] noticiasInit error:", err);
    }
  }

  /* ==================== API pública ==================== */
  window.noticiasInit = noticiasInit;
  window.openNoticiaCreate = openNoticiaCreate;
  window.fillNoticiaView = fillNoticiaView;
  window.fillNoticiaEdit = fillNoticiaEdit;
  window.openNoticiaEditById = openNoticiaEditById;

})();
