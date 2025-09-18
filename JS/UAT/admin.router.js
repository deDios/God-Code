// admin.router.js (router-lite)

(() => {
  const qs = (s, r = document) => r.querySelector(s);

  // Mapa de módulos (ajusta paths si cambian)
  const modules = {
    "#/cursos": {
      flag: "__CursosState",
      path: "/JS/UAT/admin.cursos.js",
      api: () => globalThis.cursos,
    },
    "#/noticias": {
      flag: "__NoticiasState",
      path: "/JS/UAT/admin.noticias.js",
      api: () => globalThis.noticias,
    },
    "#/tutores": {
      flag: "__TutoresState",
      path: "/JS/UAT/admin.tutores.js",
      api: () => globalThis.tutores,
    },
    "#/suscripciones": {
      flag: "__SuscripcionesState",
      path: "/JS/UAT/admin.suscripciones.js",
      api: () => globalThis.suscripciones,
    },
  };

  // Asegura que el módulo esté cargado (si hay <script> ya insertado, espera a que exponga el flag)
  async function ensure(path, flag) {
    if (globalThis[flag]) return;
    const hasScript = !!document.querySelector(`script[src="${path}"]`);
    if (hasScript) {
      for (let i = 0; i < 10 && !globalThis[flag]; i++) {
        await new Promise((r) => setTimeout(r, 30));
      }
      if (globalThis[flag]) return;
    }
    try {
      await import(path);
    } catch {
      /* no-op si el navegador no soporta import() relativo */
    }
  }

  function setActive(route) {
    document.querySelectorAll(".gc-side .nav-item").forEach((a) => {
      const r = a.getAttribute("data-route");
      if (r === route) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function clearLists() {
    const d = qs("#recursos-list");
    const m = qs("#recursos-list-mobile");
    const p1 = qs("#pagination-controls");
    const p2 = qs("#pagination-mobile");
    if (d) d.innerHTML = "";
    if (m) m.innerHTML = "";
    if (p1) p1.innerHTML = "";
    if (p2) p2.innerHTML = "";
    const c = qs("#mod-count");
    if (c) c.textContent = "—";
  }

  function setTitleByRoute(route) {
    //rutas de urls para los diferentes modulos
    const map = {
      "#/cursos": "Cursos",
      "#/noticias": "Noticias",
      "#/tutores": "Tutores",
      "#/suscripciones": "Suscripciones",
    };

    const h = qs("#mod-title");
    if (h) h.textContent = map[route] || "—";
  }

  function setTableHeaders(route) {
    const head = document.querySelector(
      ".recursos-box.desktop-only .table-header"
    );
    if (!head) return;
    let cols = [];
    if (route === "#/cursos") {
      cols = [
        ["col-nombre", "Nombre"],
        ["col-tutor", "Tutor"],
        ["col-fecha", "Fecha de inicio"],
        ["col-status", "Status"],
      ];
    } else if (route === "#/noticias") {
      cols = [
        ["col-nombre", "Título"],
        ["col-fecha", "Creación"],
        ["col-status", "Status"],
        ["col-acc", ""],
      ];
    } else if (route === "#/tutores") {
      cols = [
        ["col-nombre", "Nombre"],
        ["col-fecha", "Creación"],
        ["col-status", "Status"],
        ["col-acc", ""],
      ];
    } else if (route === "#/suscripciones") {
      cols = [
        ["col-nombre", "Alumno"],
        ["col-curso", "Curso"],
        ["col-fecha", "Fecha de suscripción"],
        ["col-status", "Status"],
      ];
    } else {
      cols = [];
    }
    head.innerHTML = cols
      .map(
        ([cls, lab]) => `<div class="${cls}" role="columnheader">${lab}</div>`
      )
      .join("");
  }

  async function onRoute() {
    const route = location.hash || "#/cursos";
    const mod = modules[route] || modules["#/cursos"];

    gcSearch.setRoute(route);

    setActive(route);
    clearLists();
    setTableHeaders(route);
    setTitleByRoute(route);

    await ensure(mod.path, mod.flag);
    const api = mod.api && mod.api();
    if (api?.mount) await api.mount();
  }

  // Botón "Crear": handler único que despacha al módulo actual
  function onCreate() {
    const route = location.hash || "#/cursos";
    const mod = modules[route] || modules["#/cursos"];
    const api = mod.api && mod.api();
    if (api?.openCreate) api.openCreate();
  }

  // Navegación por clicks en el sidebar (sin recarga)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('.gc-side .nav-item[href^="#/"]');
    if (!a) return;
    e.preventDefault();
    const to = a.getAttribute("href");
    if (to) location.hash = to;
  });

  // Wire events
  window.addEventListener("hashchange", onRoute);
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector("#btn-add");
    if (btn && !btn._wired) {
      btn._wired = true;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        onCreate();
      });
    }
    onRoute();
  });
})();
