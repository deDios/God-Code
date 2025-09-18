// admin.router.js
(() => {
  const qs = (s, r = document) => r.querySelector(s);

  // Mapa de modulos
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
    } catch {}
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
    const map = {
      "#/cursos": "Cursos",
      "#/noticias": "Noticias",
      "#/tutores": "Tutores",
      "#/suscripciones": "Suscripciones",
      "#/cuenta": "Cuenta", // para cuando el guard manda a Cuenta
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
      ];
    } else if (route === "#/tutores") {
      cols = [
        ["col-nombre", "Nombre"],
        ["col-fecha", "Creación"],
        ["col-status", "Status"],
      ];
    } else if (route === "#/suscripciones") {
      cols = [
        ["col-nombre", "Suscriptor"],
        ["col-curso", "Curso"],
        ["col-fecha", "Fecha de suscripción"],
        ["col-status", "Status"],
      ];
    } else if (route === "#/cuenta") {
      // Sin cabecera de tabla; el guard pinta su placeholder
      cols = [];
    }
    head.innerHTML = cols
      .map(
        ([cls, lab]) => `<div class="${cls}" role="columnheader">${lab}</div>`
      )
      .join("");
  }

  // Espera a que el guard marque el flag la primera vez (evita parpadeo)
  async function waitGuardFlagOnce(maxMs = 250) {
    const start = Date.now();
    while (
      window.__adminGuardRestricted === undefined &&
      Date.now() - start < maxMs
    ) {
      await new Promise((r) => setTimeout(r, 15));
    }
  }

  async function onRoute() {
    // da chance a que el guard ponga el flag antes del primer route
    await waitGuardFlagOnce();

    const restricted = !!window.__adminGuardRestricted;
    const defaultRoute = restricted ? "#/cuenta" : "#/cursos";
    const route = location.hash || defaultRoute;

    // 🔒 Si está restringido y la ruta NO es #/cuenta, redirige y sal.
    if (restricted && route !== "#/cuenta") {
      // replace para no llenar el historial
      location.replace("#/cuenta");
      // deja el contenedor limpio para que el guard pinte su placeholder
      clearLists();
      setTableHeaders("#/cuenta");
      setTitleByRoute("#/cuenta");
      setActive("#/cuenta");
      return;
    }

    const mod = modules[route] || (!restricted ? modules["#/cursos"] : null);

    if (window.gcSearch?.setRoute) gcSearch.setRoute(route);

    setActive(route);
    clearLists();
    setTableHeaders(route);
    setTitleByRoute(route);

    // En modo restringido en #/cuenta, no se monta ningún módulo
    if (restricted && route === "#/cuenta") return;

    if (!mod) return;

    await ensure(mod.path, mod.flag);
    const api = mod.api && mod.api();
    if (api?.mount) await api.mount();
  }

  function onCreate() {
    const restricted = !!window.__adminGuardRestricted;
    if (restricted) {
      // si alguien llega a pulsar el + en restringido, lo llevamos a cuenta
      location.replace("#/cuenta");
      return;
    }
    const route = location.hash || "#/cursos";
    const mod = modules[route] || modules["#/cursos"];
    const api = mod.api && mod.api();
    if (api?.openCreate) api.openCreate();
  }

  // Navegación por clicks (en modo restringido, fuerza #/cuenta)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('.gc-side .nav-item[href^="#/"]');
    if (!a) return;
    e.preventDefault();
    const restricted = !!window.__adminGuardRestricted;
    const to = restricted ? "#/cuenta" : a.getAttribute("href");
    if (to) location.hash = to;
  });

  // Wire events
  window.addEventListener("hashchange", onRoute);
  document.addEventListener("DOMContentLoaded", async () => {
    const btn = document.querySelector("#btn-add");
    if (btn && !btn._wired) {
      btn._wired = true;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        onCreate();
      });
    }
    await onRoute();
  });
})();
