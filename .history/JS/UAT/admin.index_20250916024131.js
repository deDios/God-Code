// /JS/UAT/admin.index.js — DEV bypass guard
(() => {
  "use strict";

  // ====== DEBUG & BYPASS ======
  const DEBUG = localStorage.gcAdminDebug === "1";
  const BYPASS_GUARD =
    localStorage.gcAdminBypassGuard === "1" ||
    new URLSearchParams(location.search).has("bypassguard");

  const L = (...a) => DEBUG && console.log("[ADMIN]", ...a);
  const G = (label, fn) => {
    if (!DEBUG) return fn();
    console.groupCollapsed(`%c[ADMIN] ${label}`, "color:#0b8");
    try { return fn(); } finally { console.groupEnd(); }
  };

  // ====== DOM helpers ======
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  // ====== Crash catchers ======
  window.addEventListener("error", (e) => console.error("[ADMIN] error", e?.message, e?.error||e));
  window.addEventListener("unhandledrejection", (e) => console.error("[ADMIN] unhandledrejection", e?.reason||e));

  // ====== Admin check (con bypass) ======
  function isAdmin() {
    if (BYPASS_GUARD) { L("BYPASS_GUARD activo → isAdmin = true"); return true; }
    let fromFn = false, fromClass = false;
    try { fromFn = typeof window.Admin?.isAdmin === "function" && !!window.Admin.isAdmin(); } catch {}
    try { fromClass = document.documentElement.classList.contains("role-admin"); } catch {}
    const ok = !!(fromFn || fromClass);
    L("isAdmin()", { fromFn, fromClass, ok });
    return ok;
  }

  // ====== Views ======
  const ROUTE_TO_VIEW = {
    "#/cuenta": "view-cuenta",
    "#/usuarios": "view-usuarios",
    "#/cursos": "view-cursos",
    "#/noticias": "view-noticias",
    "#/tutores": "view-tutores",
    "#/suscripciones": "view-suscripciones",
  };

  function showOnly(viewId) {
    return G(`showOnly(${viewId})`, () => {
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
      if (!shown) console.warn("[ADMIN] view no encontrada:", viewId);
      return shown;
    });
  }

  const currentRoute = () => location.hash || (isAdmin() ? "#/cursos" : "#/cuenta");

  function applyRoute() {
    return G("applyRoute()", () => {
      const admin = isAdmin();
      let h = currentRoute();

      // si NO hay bypass y NO es admin → fuerza cuenta
      if (!BYPASS_GUARD && !admin && h !== "#/cuenta") {
        L("no admin → forzando #/cuenta");
        h = "#/cuenta";
        if (location.hash !== h) location.hash = h;
      }

      const viewId = ROUTE_TO_VIEW[h] || (admin ? "view-cursos" : "view-cuenta");
      L("routing", { bypass: BYPASS_GUARD, admin, hash: h, viewId });
      const ok = showOnly(viewId);
      if (!ok) {
        // último fallback
        const first = $(".view");
        if (first) { first.removeAttribute("hidden"); first.classList.remove("hidden"); }
      }
    });
  }

  // ====== Drawers (abrir/cerrar) ======
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

  // ====== Counters ======
  function wireCounters() {
    $$(".counter[data-for]").forEach((cnt) => {
      const id = cnt.getAttribute("data-for");
      const max = Number(cnt.getAttribute("data-max") || 0);
      const el = document.getElementById(id);
      if (!el) return;
      if (max && !el.maxLength) { try { el.maxLength = max; } catch {} }
      const update = () => {
        const len = (el.value || "").length;
        cnt.textContent = max ? `${len}/${max}` : String(len);
        cnt.dataset.over = max && len > max ? "true" : "false";
      };
      el.addEventListener("input", update);
      update();
    });
  }

  // ====== Defaults ======
  function defaultDates() {
    const d = new Date();
    const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const el = $("#c_fecha");
    if (el && !el.value) el.value = iso;
  }

  // ====== Dynamic imports (features) ======
  async function safeImport(path) {
    try { const m = await import(path); L("import OK", path); return m; }
    catch(e){ console.warn("[ADMIN] import FAIL", path, e?.message||e); return null; }
  }

  let mountedOnce = false;
  async function mountFeaturesOnce() {
    if (mountedOnce) return;
    mountedOnce = true;

    // cuenta para todos
    (await safeImport("/JS/UAT/features/cuenta.js"))?.mount?.();

    // si hay bypass o es admin → carga todo
    if (BYPASS_GUARD || isAdmin()) {
      (await safeImport("/JS/UAT/features/usuarios.js"))?.mount?.();
      (await safeImport("/JS/UAT/features/cursos.js"))?.mount?.();
      (await safeImport("/JS/UAT/features/noticias.js"))?.mount?.();
      (await safeImport("/JS/UAT/features/tutores.js"))?.mount?.();
      (await safeImport("/JS/UAT/features/suscripciones.js"))?.mount?.();
    }
  }

  // ====== API consola ======
  window.__ADMIN_DIAG__ = {
    go(hash){ if (location.hash !== hash) location.hash = hash; applyRoute(); },
    dump(){
      const data = $$(".view").map(v => ({
        id: v.id,
        hiddenAttr: v.hasAttribute("hidden"),
        hiddenClass: v.classList.contains("hidden"),
        display: getComputedStyle(v).display,
      }));
      const meta = { bypass: BYPASS_GUARD, isAdmin: isAdmin(), hash: location.hash };
      console.table(data); L("dump", meta);
      return { data, meta };
    },
  };

  // ====== Bootstrap ======
  function start(){
    L("BYPASS_GUARD =", BYPASS_GUARD);
    bindDrawers();
    wireCounters();
    defaultDates();

    if (!window.__ADMIN_INDEX_ROUTER__) {
      window.__ADMIN_INDEX_ROUTER__ = true;
      window.addEventListener("hashchange", () => { L("hashchange", location.hash); applyRoute(); });
    }

    const admin = isAdmin();
    const wanted = (BYPASS_GUARD || admin) ? (location.hash || "#/cursos") : "#/cuenta";
    if (location.hash !== wanted) { L("ajustando hash inicial", {from:location.hash, to:wanted}); location.hash = wanted; }
    applyRoute();
    mountFeaturesOnce();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
