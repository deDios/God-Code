// /JS/UAT/admin.index.js (HOTFIX sin imports estáticos)
(() => {
  "use strict";

  const log = (...a) => console?.log?.("[ADMIN:index]", ...a);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // === Permisos: usa Admin.isAdmin() si existe; si no, cae a <html class="role-admin">
  const isAdmin = () =>
    (typeof window.Admin?.isAdmin === "function" && !!window.Admin.isAdmin()) ||
    document.documentElement.classList.contains("role-admin");

  // === Mostrar solo una vista
  const showOnly = (viewId) => {
    let shown = false;
    $$(".view").forEach((sec) => {
      const match = sec.id === viewId;
      if (match) {
        sec.removeAttribute("hidden");
        sec.classList.remove("hidden");
        shown = true;
      } else {
        sec.setAttribute("hidden", "");
        sec.classList.add("hidden");
      }
    });
    return shown;
  };

  const ROUTE_TO_VIEW = {
    "#/cuenta": "view-cuenta",
    "#/usuarios": "view-usuarios",
    "#/cursos": "view-cursos",
    "#/noticias": "view-noticias",
    "#/tutores": "view-tutores",
    "#/suscripciones": "view-suscripciones",
  };

  const currentRoute = () => location.hash || (isAdmin() ? "#/cursos" : "#/cuenta");

  function applyRoute() {
    const admin = isAdmin();
    let h = currentRoute();

    if (!admin && h !== "#/cuenta") {
      h = "#/cuenta";
      if (location.hash !== h) location.hash = h;
    }

    const viewId = ROUTE_TO_VIEW[h] || (admin ? "view-cursos" : "view-cuenta");
    const ok = showOnly(viewId);
    log("applyRoute", { admin, route: h, viewId, ok });

    // Rescate: si por CSS o lo que sea no quedó nada visible, forzamos una
    if (!ok) {
      if ($("#view-cuenta")) {
        showOnly("view-cuenta");
      } else {
        const first = $(".view");
        if (first) {
          first.removeAttribute("hidden");
          first.classList.remove("hidden");
        }
      }
    }
  }

  // === Drawers
  function bindDrawers() {
    document.addEventListener("click", (ev) => {
      const openBtn = ev.target.closest("[data-open]");
      if (openBtn) {
        const dlg = document.getElementById(openBtn.getAttribute("data-open"));
        dlg?.showModal?.();
        return;
      }
      const closeBtn = ev.target.closest("[data-close]");
      if (closeBtn) {
        const dlg = document.getElementById(closeBtn.getAttribute("data-close"));
        dlg?.close?.();
        return;
      }
    });
  }

  // === Contadores y maxlength (desde los data-max del DOM)
  function wireCounters() {
    const counters = $$(".counter[data-for]");
    counters.forEach((cnt) => {
      const id = cnt.getAttribute("data-for");
      const max = Number(cnt.getAttribute("data-max") || 0);
      const el = document.getElementById(id);
      if (!el) return;

      // Si el campo no trae maxlength, aplicamos el del contador
      if (max && !el.maxLength) {
        try {
          el.maxLength = max;
        } catch {}
      }

      const update = () => {
        const len = (el.value || "").length;
        cnt.textContent = max ? `${len}/${max}` : String(len);
        cnt.dataset.over = max && len > max ? "true" : "false";
      };
      update();
      el.addEventListener("input", update);
    });
  }

  // === Fecha por defecto
  function defaultDates() {
    const d = new Date();
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    const el = $("#c_fecha");
    if (el && !el.value) el.value = iso;
  }

  // === Montaje perezoso con import() dinámico y tolerante a 404
  let mountedOnce = false;
  async function mountFeaturesOnce() {
    if (mountedOnce) return;
    mountedOnce = true;

    const safeImport = async (path) => {
      try {
        return await import(path);
      } catch (e) {
        log("feature not found:", path);
        return null;
      }
    };

    // Cuenta siempre (si existe)
    try {
      (await safeImport("/JS/UAT/features/cuenta.js"))?.mount?.();
    } catch (e) {
      log("Cuenta.mount error", e);
    }

    if (!isAdmin()) return;

    // Solo admin
    (await safeImport("/JS/UAT/features/usuarios.js"))?.mount?.();
    (await safeImport("/JS/UAT/features/cursos.js"))?.mount?.();
    (await safeImport("/JS/UAT/features/noticias.js"))?.mount?.();
    (await safeImport("/JS/UAT/features/tutores.js"))?.mount?.();
    (await safeImport("/JS/UAT/features/suscripciones.js"))?.mount?.();
  }

  // === Bootstrap
  function start() {
    bindDrawers();
    wireCounters();
    defaultDates();

    if (!window.__ADMIN_INDEX_ROUTER__) {
      window.__ADMIN_INDEX_ROUTER__ = true;
      window.addEventListener("hashchange", applyRoute);
    }

    const admin = isAdmin();
    const wanted = admin ? (location.hash || "#/cursos") : "#/cuenta";
    if (location.hash !== wanted) location.hash = wanted;

    applyRoute();
    // No bloqueamos la ruta por cargar features; si fallan, la vista igual aparece.
    mountFeaturesOnce();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();