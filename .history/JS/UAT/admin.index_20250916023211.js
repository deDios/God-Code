// /JS/UAT/admin.index.js — build con DEBUG
(() => {
  "use strict";

  // ===== DEBUG SWITCH =====
  const DEBUG = localStorage.gcAdminDebug === "1";
  const L = (...a) => DEBUG && console.log("[ADMIN:DBG]", ...a);
  const G = (label, fn) => {
    if (!DEBUG) return fn();
    console.groupCollapsed(`%c[ADMIN:DBG] ${label}`, "color:#0b8");
    try { return fn(); } finally { console.groupEnd(); }
  };

  // ===== Helpers DOM =====
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ===== Crash catchers =====
  window.addEventListener("error", (e) => {
    console.error("[ADMIN:ERR] error global", e?.message, e?.error || e);
  });
  window.addEventListener("unhandledrejection", (e) => {
    console.error("[ADMIN:ERR] unhandledrejection", e?.reason || e);
  });

  // ===== Admin detection (con trazas) =====
  function isAdmin() {
    let fromFn = false, fromClass = false, value = false;
    try { fromFn = typeof window.Admin?.isAdmin === "function" && !!window.Admin.isAdmin(); } catch {}
    try { fromClass = document.documentElement.classList.contains("role-admin"); } catch {}
    value = !!(fromFn || fromClass);
    L("isAdmin()", { fromFn, fromClass, value });
    return value;
  }

  // ===== Mostrar solo una vista (trazado detallado) =====
  function showOnly(viewId) {
    return G(`showOnly(${viewId})`, () => {
      let shown = false;
      const views = $$(".view");
      if (views.length === 0) {
        L("No hay .view en el DOM");
        return false;
      }
      views.forEach((sec) => {
        const match = sec.id === viewId;
        const before = {
          id: sec.id,
          hadHiddenAttr: sec.hasAttribute("hidden"),
          hadHiddenClass: sec.classList.contains("hidden"),
        };
        if (match) {
          sec.removeAttribute("hidden");
          sec.classList.remove("hidden");
          shown = true;
        } else {
          sec.setAttribute("hidden", "");
          sec.classList.add("hidden");
        }
        const after = {
          hasHiddenAttr: sec.hasAttribute("hidden"),
          hasHiddenClass: sec.classList.contains("hidden"),
        };
        L("view state", { ...before, ...after, match });
      });
      return shown;
    });
  }

  // ===== Router =====
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
    return G("applyRoute()", () => {
      const admin = isAdmin();
      let h = currentRoute();
      const desired = admin ? h : "#/cuenta";

      // Normaliza ruta si no eres admin
      if (!admin && h !== "#/cuenta") {
        L("No admin → forzando #/cuenta");
        h = "#/cuenta";
        if (location.hash !== h) location.hash = h;
      }

      const viewId = ROUTE_TO_VIEW[h] || (admin ? "view-cursos" : "view-cuenta");
      const exists = !!document.getElementById(viewId);
      L("routing", { admin, hash: h, viewId, exists });

      const ok = exists && showOnly(viewId);
      if (!ok) {
        L("fallback de vista (no se pudo mostrar la esperada)");
        if ($("#view-cuenta")) showOnly("view-cuenta");
        else {
          const first = $(".view");
          if (first) { first.removeAttribute("hidden"); first.classList.remove("hidden"); }
        }
      }
    });
  }

  // ===== Observador de “alguien volvió a ocultar” =====
  function watchViewToggles() {
    const obs = new MutationObserver((mutList) => {
      mutList.forEach((m) => {
        if (!(m.target instanceof HTMLElement)) return;
        if (!m.target.classList.contains("view")) return;
        const id = m.target.id;
        if (m.type === "attributes" && (m.attributeName === "hidden" || m.attributeName === "class")) {
          const st = {
            hiddenAttr: m.target.hasAttribute("hidden"),
            hiddenClass: m.target.classList.contains("hidden"),
            disp: getComputedStyle(m.target).display,
          };
          L("mutation:view", { id, attr: m.attributeName, ...st });
        }
      });
    });
    obs.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["hidden", "class"] });
    L("MutationObserver activo");
  }

  // ===== Drawers =====
  function bindDrawers() {
    document.addEventListener("click", (ev) => {
      const openBtn = ev.target.closest("[data-open]");
      const closeBtn = ev.target.closest("[data-close]");
      if (openBtn) {
        const id = openBtn.getAttribute("data-open");
        L("drawer.open", id);
        document.getElementById(id)?.showModal?.();
      } else if (closeBtn) {
        const id = closeBtn.getAttribute("data-close");
        L("drawer.close", id);
        document.getElementById(id)?.close?.();
      }
    });
  }

  // ===== Contadores =====
  function wireCounters() {
    $$(".counter[data-for]").forEach((cnt) => {
      const id = cnt.getAttribute("data-for");
      const max = Number(cnt.getAttribute("data-max") || 0);
      const el = document.getElementById(id);
      if (!el) { L("counter sin campo", { counterId: cnt.id, for: id }); return; }
      if (max && !el.maxLength) { try { el.maxLength = max; } catch {} }
      const update = () => {
        const len = (el.value || "").length;
        cnt.textContent = max ? `${len}/${max}` : String(len);
        cnt.dataset.over = max && len > max ? "true" : "false";
      };
      el.addEventListener("input", update);
      update();
      L("counter bound", { counterId: cnt.id, for: id, max });
    });
  }

  // ===== Fecha default =====
  function defaultDates() {
    const d = new Date();
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const el = $("#c_fecha");
    if (el && !el.value) { el.value = iso; L("c_fecha prellenada", iso); }
  }

  // ===== import() seguro =====
  async function safeImport(path) {
    try {
      const m = await import(path);
      L("import OK", path, Object.keys(m || {}));
      return m;
    } catch (e) {
      console.warn("[ADMIN:WARN] import FAIL", path, e?.message || e);
      return null;
    }
  }

  // ===== Carga perezosa de features =====
  let mountedOnce = false;
  async function mountFeaturesOnce() {
    if (mountedOnce) return;
    mountedOnce = true;

    // cuenta (si existe)
    (await safeImport("/JS/UAT/features/cuenta.js"))?.mount?.();

    if (!isAdmin()) return;

    // solo admin
    (await safeImport("/JS/UAT/features/usuarios.js"))?.mount?.();
    (await safeImport("/JS/UAT/features/cursos.js"))?.mount?.();
    (await safeImport("/JS/UAT/features/noticias.js"))?.mount?.();
    (await safeImport("/JS/UAT/features/tutores.js"))?.mount?.();
    (await safeImport("/JS/UAT/features/suscripciones.js"))?.mount?.();
  }

  // ===== API de diagnóstico para consola =====
  window.__ADMIN_DIAG__ = {
    go(hash) { L("diag.go", hash); if (location.hash !== hash) location.hash = hash; applyRoute(); },
    dump() {
      const data = $$(".view").map((v) => ({
        id: v.id,
        hasHiddenAttr: v.hasAttribute("hidden"),
        hasHiddenClass: v.classList.contains("hidden"),
        display: getComputedStyle(v).display,
      }));
      const meta = {
        isAdmin: isAdmin(),
        hash: location.hash,
        scriptTag: Array.from(document.scripts).find((s) => (s.src || "").includes("/JS/UAT/admin.index.js"))?.outerHTML || "(no encontrado)",
        readyState: document.readyState,
      };
      console.table(data);
      L("dump", meta);
      return { data, meta };
    },
  };

  // ===== Bootstrap =====
  function start() {
    G("start()", () => {
      L("readyState", document.readyState);
      L("HTML classList", Array.from(document.documentElement.classList));
      bindDrawers();
      wireCounters();
      defaultDates();
      watchViewToggles();

      // Router: escucha y aplica
      if (!window.__ADMIN_INDEX_ROUTER__) {
        window.__ADMIN_INDEX_ROUTER__ = true;
        window.addEventListener("hashchange", () => {
          L("hashchange", location.hash);
          applyRoute();
        });
      }

      const admin = isAdmin();
      const wanted = admin ? (location.hash || "#/cursos") : "#/cuenta";
      if (location.hash !== wanted) {
        L("ajustando hash inicial", { from: location.hash, to: wanted });
        location.hash = wanted;
      }
      applyRoute();

      // Carga features sin bloquear
      mountFeaturesOnce();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
