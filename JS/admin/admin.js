(() => {
  const setVH = () => {
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight * 0.01}px`
    );
  };
  setVH();
  window.addEventListener("resize", setVH);

  // ENDPOINTS
  const API = {
    cursos:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_cursos.php",
    noticias:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_noticia.php",
    tutores:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_tutor.php",
    usuarios:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_usuario.php",
    prioridad:
      "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_prioridad.php",
  };

  // Estado global
  const state = {
    route: "#/cursos",
    page: 1,
    pageSize: 10,
    data: [],
    raw: [],
    tutorsMap: null,
    prioMap: null,
    devMode: true, // muestra TODOS los campos en el drawer + JSON
  };

  const toast = (msg, tipo = "exito", dur = 3000) => {
    if (window.gcToast) window.gcToast(msg, tipo, dur);
    else console.log(`[${tipo}] ${msg}`);
  };

  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  async function postJSON(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function getTutorsMap() {
    if (state.tutorsMap && Date.now() - state.tutorsMap._ts < 30 * 60 * 1000)
      return state.tutorsMap;
    const arr = await postJSON(API.tutores, { estatus: 1 });
    const map = {};
    arr.forEach((t) => (map[t.id] = t.nombre));
    map._ts = Date.now();
    state.tutorsMap = map;
    return map;
  }
  async function getPrioridadMap() {
    if (state.prioMap && Date.now() - state.prioMap._ts < 30 * 60 * 1000)
      return state.prioMap;
    const arr = await postJSON(API.prioridad, { estatus: 1 });
    const map = {};
    arr.forEach((p) => (map[p.id] = p.nombre));
    map._ts = Date.now();
    state.prioMap = map;
    return map;
  }

  // router
  function setRoute(route) {
    if (!route) route = "#/cursos";
    if (route !== state.route) {
      window.location.hash = route;
      return;
    }
    onRouteChange();
  }
  window.addEventListener("hashchange", onRouteChange);

  function onRouteChange() {
    state.route = window.location.hash || "#/cursos";
    state.page = 1;

    qsa(".admin-dash .admin-nav").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.route === state.route);
    });

    if (state.route.startsWith("#/cursos")) return loadCursos();
    if (state.route.startsWith("#/noticias")) return loadNoticias();
    if (state.route.startsWith("#/usuarios")) return loadUsuarios();
    loadCursos();
  }

  // skeletons
  function showSkeletons() {
    const d = qs("#recursos-list");
    const m = qs("#recursos-list-mobile");
    d.innerHTML = "";
    m.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      d.insertAdjacentHTML(
        "beforeend",
        `<div class="sk-row"><div class="sk w1"></div><div class="sk w2"></div><div class="sk w3"></div></div>`
      );
    }
  }

  // render lista + mobile
  function renderList(rows, config) {
    const d = qs("#recursos-list");
    const m = qs("#recursos-list-mobile");
    d.innerHTML = "";
    m.innerHTML = "";

    if (!rows.length) {
      d.innerHTML = `<div class="empty-state" style="padding:1rem;">Sin resultados</div>`;
      m.innerHTML = `<div class="empty-state" style="padding:1rem;">Sin resultados</div>`;
      qs("#mod-count").textContent = "0 resultados";
      renderPagination(0);
      return;
    }

    const start = (state.page - 1) * state.pageSize;
    const pageRows = rows.slice(start, start + state.pageSize);

    pageRows.forEach((item) => {
      d.insertAdjacentHTML("beforeend", config.desktopRow(item));
      m.insertAdjacentHTML("beforeend", config.mobileRow(item));
    });

    qs("#mod-count").textContent = `${rows.length} ${
      rows.length === 1 ? "elemento" : "elementos"
    }`;

    // eventos de filas
    qsa("#recursos-list .table-row").forEach((el) => {
      el.addEventListener("click", () =>
        openDrawer(
          config.drawerTitle(el.dataset),
          config.drawerBody(el.dataset)
        )
      );
    });
    qsa("#recursos-list-mobile .row-toggle").forEach((el) => {
      el.addEventListener("click", () =>
        el.closest(".table-row-mobile").classList.toggle("expanded")
      );
    });
    qsa("#recursos-list-mobile .open-drawer").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const data = btn.closest(".table-row-mobile").dataset;
        openDrawer(config.drawerTitle(data), config.drawerBody(data));
      });
    });

    renderPagination(rows.length);
  }

  function renderPagination(total) {
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    const conts = [qs("#pagination-controls"), qs("#pagination-mobile")];
    conts.forEach((cont) => {
      cont.innerHTML = "";
      if (totalPages <= 1) return;

      const prev = document.createElement("button");
      prev.className = "arrow-btn";
      prev.textContent = "‹";
      prev.disabled = state.page === 1;
      prev.onclick = () => {
        state.page = Math.max(1, state.page - 1);
        refreshCurrent();
      };
      cont.appendChild(prev);

      for (let p = 1; p <= totalPages && p <= 7; p++) {
        const b = document.createElement("button");
        b.className = "page-btn" + (p === state.page ? " active" : "");
        b.textContent = p;
        b.onclick = () => {
          state.page = p;
          refreshCurrent();
        };
        cont.appendChild(b);
      }

      const next = document.createElement("button");
      next.className = "arrow-btn";
      next.textContent = "›";
      next.disabled = state.page === totalPages;
      next.onclick = () => {
        state.page = Math.min(totalPages, state.page + 1);
        refreshCurrent();
      };
      cont.appendChild(next);
    });
  }
  function refreshCurrent() {
    if (state.route.startsWith("#/cursos")) return drawCursos();
    if (state.route.startsWith("#/noticias")) return drawNoticias();
    if (state.route.startsWith("#/usuarios")) return drawUsuarios();
  }

  // ----- cursos -----
  async function loadCursos() {
    qs("#mod-title").textContent = "Cursos";
    qs(".recursos-box.desktop-only .table-header .col-tipo").textContent =
      "Tutor";
    qs(".recursos-box.desktop-only .table-header .col-fecha").textContent =
      "Fecha inicio";
    showSkeletons();
    try {
      const [raw, tmap, pmap] = await Promise.all([
        postJSON(API.cursos, { estatus: 1 }),
        getTutorsMap(),
        getPrioridadMap(),
      ]);
      state.raw = raw;
      state.data = raw.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        tutor: tmap[c.tutor] || `Tutor #${c.tutor}`,
        prioridad_id: c.prioridad,
        prioridad_nombre: pmap[c.prioridad] || `#${c.prioridad}`,
        precio: c.precio,
        certificado: !!c.certificado,
        fecha: c.fecha_inicio,
        estatus: c.estatus,
        _all: c,
      }));
      drawCursos();
      toast("Cursos cargados", "exito", 1600);
    } catch (err) {
      qs(
        "#recursos-list"
      ).innerHTML = `<div style="padding:1rem;color:#b00020;">Error al cargar cursos</div>`;
      qs("#recursos-list-mobile").innerHTML = "";
      toast("No se pudieron cargar cursos", "error");
      console.error(err);
    }
  }
  function drawCursos() {
    const rows = state.data;
    renderList(rows, {
      desktopRow: (it) => `
        <div class="table-row" data-id="${it.id}" data-type="curso">
          <div class="col-nombre">
            <span>${escapeHTML(it.nombre)}</span>
            <span class="chip">${escapeHTML(it.prioridad_nombre)}</span>
            ${it.certificado ? `<span class="chip">Certificado</span>` : ""}
          </div>
          <div class="col-tipo">${escapeHTML(it.tutor)}</div>
          <div class="col-fecha">${fmtDate(it.fecha)}</div>
        </div>`,
      mobileRow: (it) => `
        <div class="table-row-mobile" data-id="${it.id}" data-type="curso">
          <button class="row-toggle">
            <div class="col-nombre">
              ${escapeHTML(it.nombre)} <span class="chip">${escapeHTML(
        it.prioridad_nombre
      )}</span>
            </div>
            <span class="icon-chevron">›</span>
          </button>
          <div class="row-details">
            <div><strong>Tutor:</strong> ${escapeHTML(it.tutor)}</div>
            <div><strong>Inicio:</strong> ${fmtDate(it.fecha)}</div>
            <button class="btn open-drawer" style="margin:.25rem 0 .5rem;">Ver detalle</button>
          </div>
        </div>`,
      drawerTitle: (d) => {
        const item = state.data.find((x) => String(x.id) === d.id);
        return item ? `Curso · ${item.nombre}` : "Curso";
      },
      drawerBody: (d) => {
        const item = state.data.find((x) => String(x.id) === d.id);
        if (!item) return "<p>No encontrado.</p>";
        if (state.devMode) {
          return renderAllFields(item._all, {
            tutor_nombre: item.tutor,
            prioridad_nombre: item.prioridad_nombre,
          });
        }
        const c = item._all;
        return `
          ${pair("Tutor", item.tutor)}
          ${pair("Prioridad", item.prioridad_nombre)}
          ${pair("Fecha inicio", fmtDate(c.fecha_inicio))}
          ${pair("Precio", c.precio === 0 ? "Gratuito" : fmtMoney(c.precio))}
          ${pair("Certificado", c.certificado ? "Sí" : "No")}
          ${pair("Descripción breve", c.descripcion_breve)}
          ${pair("Descripción", c.descripcion_media)}
        `;
      },
    });
  }

  // ----- noticias ----
  async function loadNoticias() {
    qs("#mod-title").textContent = "Noticias";
    qs(".recursos-box.desktop-only .table-header .col-tipo").textContent =
      "Estado";
    qs(".recursos-box.desktop-only .table-header .col-fecha").textContent =
      "Creada";
    showSkeletons();
    try {
      const raw = await postJSON(API.noticias, { estatus: 1 });
      state.raw = raw;
      state.data = raw.map((n) => ({
        id: n.id,
        titulo: n.titulo,
        fecha: n.fecha_creacion,
        estatus: n.estatus,
        _all: n,
      }));
      drawNoticias();
      toast("Noticias cargadas", "exito", 1600);
    } catch (err) {
      qs(
        "#recursos-list"
      ).innerHTML = `<div style="padding:1rem;color:#b00020;">Error al cargar noticias</div>`;
      qs("#recursos-list-mobile").innerHTML = "";
      toast("No se pudieron cargar noticias", "error");
      console.error(err);
    }
  }
  function drawNoticias() {
    const rows = state.data;
    renderList(rows, {
      desktopRow: (it) => `
        <div class="table-row" data-id="${it.id}" data-type="noticia">
          <div class="col-nombre">
            <span>${escapeHTML(it.titulo)}</span> ${chipStatus(it.estatus)}
          </div>
          <div class="col-tipo">${statusText(it.estatus)}</div>
          <div class="col-fecha">${fmtDateTime(it.fecha)}</div>
        </div>`,
      mobileRow: (it) => `
        <div class="table-row-mobile" data-id="${it.id}" data-type="noticia">
          <button class="row-toggle">
            <div class="col-nombre">${escapeHTML(it.titulo)} ${chipStatus(
        it.estatus
      )}</div>
            <span class="icon-chevron">›</span>
          </button>
          <div class="row-details">
            <div><strong>Creada:</strong> ${fmtDateTime(it.fecha)}</div>
            <button class="btn open-drawer" style="margin:.25rem 0 .5rem;">Ver detalle</button>
          </div>
        </div>`,
      drawerTitle: (d) => {
        const item = state.data.find((x) => String(x.id) === d.id);
        return item ? `Noticia · ${item.titulo}` : "Noticia";
      },
      drawerBody: (d) => {
        const n = state.data.find((x) => String(x.id) === d.id)?._all;
        if (!n) return "<p>No encontrado.</p>";
        return state.devMode
          ? renderAllFields(n)
          : `
          ${pair("Título", n.titulo)}
          ${pair("Estado", statusText(n.estatus))}
          ${pair("Fecha creación", fmtDateTime(n.fecha_creacion))}
          ${pair("Descripción (uno)", n.desc_uno)}
          ${pair("Descripción (dos)", n.desc_dos)}
          ${pair("Creado por", n.creado_por)}
        `;
      },
    });
  }

  // ---- usuarios ----
  async function loadUsuarios() {
    qs("#mod-title").textContent = "Usuarios";
    qs(".recursos-box.desktop-only .table-header .col-tipo").textContent =
      "Tipo contacto";
    qs(".recursos-box.desktop-only .table-header .col-fecha").textContent =
      "Creado";
    showSkeletons();
    try {
      const raw = await postJSON(API.usuarios, { estatus: "1" });
      state.raw = raw;
      state.data = raw.map((u) => ({
        id: u.id,
        nombre: u.nombre,
        correo: u.correo,
        telefono: u.telefono,
        tipo_contacto: Number(u.tipo_contacto || 0),
        estatus: Number(u.estatus || 0),
        fecha: u.fecha_creacion,
        _all: u,
      }));
      drawUsuarios();
      toast("Usuarios cargados", "exito", 1600);
    } catch (err) {
      qs(
        "#recursos-list"
      ).innerHTML = `<div style="padding:1rem;color:#b00020;">Error al cargar usuarios</div>`;
      qs("#recursos-list-mobile").innerHTML = "";
      toast("No se pudieron cargar usuarios", "error");
      console.error(err);
    }
  }
  function drawUsuarios() {
    const rows = state.data;
    renderList(rows, {
      desktopRow: (it) => `
        <div class="table-row" data-id="${it.id}" data-type="usuario">
          <div class="col-nombre">
            <span>${escapeHTML(it.nombre)}</span> ${chipUserStatus(it.estatus)}
          </div>
          <div class="col-tipo">${chipTipoContacto(it.tipo_contacto)}</div>
          <div class="col-fecha">${fmtDateTime(it.fecha)}</div>
        </div>`,
      mobileRow: (it) => `
        <div class="table-row-mobile" data-id="${it.id}" data-type="usuario">
          <button class="row-toggle">
            <div class="col-nombre">${escapeHTML(it.nombre)} ${chipUserStatus(
        it.estatus
      )}</div>
            <span class="icon-chevron">›</span>
          </button>
          <div class="row-details">
            <div><strong>Correo:</strong> ${escapeHTML(it.correo)}</div>
            <div><strong>Teléfono:</strong> ${escapeHTML(it.telefono)}</div>
            <div><strong>Preferencia:</strong> ${tipoContactoText(
              it.tipo_contacto
            )}</div>
            <button class="btn open-drawer" style="margin:.25rem 0 .5rem;">Ver detalle</button>
          </div>
        </div>`,
      drawerTitle: (d) => {
        const item = state.data.find((x) => String(x.id) === d.id);
        return item ? `Usuario · ${item.nombre}` : "Usuario";
      },
      drawerBody: (d) => {
        const u = state.data.find((x) => String(x.id) === d.id)?._all;
        if (!u) return "<p>No encontrado.</p>";
        return state.devMode
          ? renderAllFields(u)
          : `
          ${pair("Nombre", u.nombre)}
          ${pair("Correo", u.correo)}
          ${pair("Teléfono", u.telefono)}
          ${pair("Tipo de contacto", tipoContactoText(Number(u.tipo_contacto)))}
          ${pair("Estatus", u.estatus == "1" ? "Activo" : "Inactivo")}
          ${pair("Fecha de nacimiento", u.fecha_nacimiento || "-")}
          ${pair("Creado", fmtDateTime(u.fecha_creacion))}
          ${pair("Última modif", u.fecha_modif || "-")}
        `;
      },
    });
  }

  // ---- drawer ----
  function openDrawer(title, bodyHTML) {
    const overlay = qs("#gc-dash-overlay");
    if (overlay) overlay.classList.add("open");

    let drawer = qs("#gc-drawer");
    if (!drawer) return; 
    qs("#drawer-title").textContent = title || "Detalle";
    qs("#drawer-body").innerHTML = bodyHTML || "";
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
  }
  function closeDrawer() {
    const overlay = qs("#gc-dash-overlay");
    if (overlay) overlay.classList.remove("open");

    const drawer = qs("#gc-drawer");
    if (!drawer) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  }

  // ---- helpers de UI ----
  function escapeHTML(str) {
    return String(str ?? "").replace(
      /[&<>'"]/g,
      (s) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        }[s])
    );
  }
  function fmtDate(d) {
    if (!d) return "-";
    try {
      const [y, m, day] = d.split("-");
      return `${day}/${m}/${y}`;
    } catch {
      return d;
    }
  }
  function fmtDateTime(dt) {
    if (!dt) return "-";
    try {
      const [date, time] = dt.split(" ");
      return `${fmtDate(date)} ${time || ""}`.trim();
    } catch {
      return dt;
    }
  }
  function fmtMoney(n) {
    try {
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(n);
    } catch {
      return `$${n}`;
    }
  }
  function pair(label, val) {
    return `<div class="field"><div class="label">${escapeHTML(
      label
    )}</div><div class="value">${escapeHTML(val ?? "-")}</div></div>`;
  }
  function chipStatus(estatus) {
    return Number(estatus) === 1
      ? `<span class="chip green">Publicada</span>`
      : `<span class="chip gray">Inactiva</span>`;
  }
  function statusText(e) {
    return Number(e) === 1 ? "Publicada" : "Inactiva";
  }
  function chipUserStatus(s) {
    return Number(s) === 1
      ? `<span class="chip green">Activo</span>`
      : `<span class="chip gray">Inactivo</span>`;
  }
  function tipoContactoText(t) {
    if (t === 1) return "Teléfono";
    if (t === 2) return "Correo";
    if (t === 3) return "Ambos";
    return "-";
  }
  function chipTipoContacto(t) {
    return `<span class="chip">${escapeHTML(tipoContactoText(t))}</span>`;
  }

  // drawer dev Mode
  function renderAllFields(obj, extras = {}) {
    const merged = { ...obj, ...extras };
    const entries = Object.entries(merged);
    const html = entries
      .map(([k, v]) => {
        const val = formatValue(v);
        return `<div class="field"><div class="label">${escapeHTML(
          k
        )}</div><div class="value">${val}</div></div>`;
      })
      .join("");

    const jsonPretty = escapeHTML(JSON.stringify(obj, null, 2));
    const jsonBlock = `
      <div style="margin-top:16px;">
        <div class="label" style="margin-bottom:6px;">JSON</div>
        <pre class="value" style="white-space:pre-wrap;max-height:260px;overflow:auto;">${jsonPretty}</pre>
        <button class="btn" id="btn-copy-json">Copiar JSON</button>
      </div>`;
    setTimeout(() => {
      const btn = qs("#btn-copy-json");
      if (btn)
        btn.onclick = async () => {
          try {
            await navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
            toast("JSON copiado", "exito", 1500);
          } catch {
            toast("No se pudo copiar", "warning");
          }
        };
    }, 0);

    return html + jsonBlock;
  }
  function formatValue(v) {
    if (v === null || v === undefined)
      return "<em style='color:#777'>null</em>";
    if (typeof v === "boolean") return v ? "true" : "false";
    if (typeof v === "number") return String(v);
    if (typeof v === "string") {
      if (/^\d{4}-\d{2}-\d{2}( .+)?$/.test(v))
        return `<code>${escapeHTML(
          v
        )}</code> <span style="color:#666">(${escapeHTML(
          fmtDateTime(v) || fmtDate(v)
        )})</span>`;
      const long = v.length > 220;
      const short = escapeHTML(v.slice(0, 220)) + (long ? "…" : "");
      if (!long) return short;
      const id = "tx_" + Math.random().toString(36).slice(2);
      setTimeout(() => {
        const btn = qs(`#${id}_btn`);
        if (btn)
          btn.onclick = () => {
            const el = qs(`#${id}`);
            const expanded = btn.dataset.expanded === "1";
            el.textContent = expanded ? v.slice(0, 220) + "…" : v;
            btn.textContent = expanded ? "ver más" : "ver menos";
            btn.dataset.expanded = expanded ? "0" : "1";
          };
      }, 0);
      return `<span id="${id}">${short}</span> <button class="btn" id="${id}_btn" data-expanded="0">ver más</button>`;
    }
    try {
      return `<pre style="white-space:pre-wrap;max-height:200px;overflow:auto;">${escapeHTML(
        JSON.stringify(v, null, 2)
      )}</pre>`;
    } catch {
      return escapeHTML(String(v));
    }
  }

  // UI init
  function bindUI() {
    // Sidebar al router
    qsa(".admin-dash .admin-nav").forEach((btn) =>
      btn.addEventListener("click", () => setRoute(btn.dataset.route))
    );
    // dev toggle por si quieres ver los datos que se mandan al post
    const devBtn = document.createElement("button");
    devBtn.className = "btn";
    devBtn.id = "btn-dev";
    devBtn.textContent = state.devMode ? "Modo desarrollador: ON" : "Modo desarrollador: OFF";
    devBtn.onclick = () => {
      state.devMode = !state.devMode;
      devBtn.textContent = `Modo dev: ${state.devMode ? "ON" : "OFF"}`;
    };
    const right = qs(".dash-toolbar .right");
    if (right) right.prepend(devBtn);

    // Refresh
    const refresh = qs("#btn-refresh");
    if (refresh) refresh.addEventListener("click", () => refreshCurrent());

    // Drawer close
    const drawerClose = qs("#drawer-close");
    if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
    const overlay = qs("#gc-dash-overlay");
    if (overlay)
      overlay.addEventListener("click", (e) => {
        if (e.target.id === "gc-dash-overlay") closeDrawer();
      });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindUI();
    if (!window.location.hash) window.location.hash = "#/cursos";
    onRouteChange();
  });
})();
