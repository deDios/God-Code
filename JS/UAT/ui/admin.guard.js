// /JS/UAT/ui/admin.guard.js
(() => {
  "use strict";

  const ADMIN_IDS = [1, 12, 13, 17, 18];

  // --- helpers ---
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];

  function getUserId() {
    try {
      const id = Number(window?.usuario?.id);
      if (Number.isFinite(id) && id > 0) return id;
    } catch {}
    try {
      const raw = document.cookie.split("; ").find(x => x.startsWith("usuario="));
      if (!raw) return null;
      const json = decodeURIComponent(raw.split("=")[1] || "");
      const u = JSON.parse(json);
      const id = Number(u?.id);
      return Number.isFinite(id) && id > 0 ? id : null;
    } catch {}
    return null;
  }

  function isAdmin(id) {
    return ADMIN_IDS.map(Number).includes(Number(id));
  }

  // --- vista placeholder Cuenta ---
  function buildCuentaPlaceholder() {
    const card = (icon, title, desc) => `
      <div class="gc-card-lite">
        <div class="gc-card-ico">${icon}</div>
        <div class="gc-card-body">
          <div class="gc-card-title">${title}</div>
          <div class="gc-card-desc">${desc}</div>
        </div>
      </div>`;

    return `
      <div class="cuenta-wrap">
        <h2 class="cuenta-title">Cuenta</h2>
        ${card("icono", "Borrar cuenta", "Esta acción eliminará tu cuenta y todos sus datos de forma permanente.")}
        ${card("icono", "Opciones de privacidad / Visibilidad", "Permite configurar quién ve tu perfil o actividad.")}
        ${card("icono", "Notificaciones / Preferencias", "Botones para gestionar alertas, correos, notificaciones push.")}
        ${card("icono", "Ajustes de privacidad o configuraciones", "Botones para ajustar visibilidad de datos o preferencias de privacidad.")}
        ${card("icono", "Cambiar de cuenta", "Cambia rápidamente entre diferentes perfiles o usuarios sin cerrar sesión.")}
      </div>
      <style>
        .cuenta-wrap{max-width:860px;margin:8px auto 24px;padding:0 8px;}
        .cuenta-title{font-size:1.35rem;font-weight:700;text-align:center;margin:8px 0 14px;}
        .gc-card-lite{display:flex;gap:10px;align-items:flex-start;background:#fff;border:1px solid #e7e7e7;
          border-radius:8px;box-shadow:0 1px 0 rgba(0,0,0,.03);padding:12px 10px;margin:8px 0;}
        .gc-card-ico{font-size:22px;line-height:1;width:28px;text-align:center;filter:saturate(0.9);}
        .gc-card-title{font-weight:700;margin-bottom:2px}
        .gc-card-desc{color:#555;font-size:.92rem}
      </style>`;
  }

  // --- aplica modo restringido ---
  function applyRestrictedUI() {
    // Lado izquierdo: dejar solo "Cuenta"
    const side = qs(".gc-side");
    if (side) {
      qsa('.gc-side .nav-item').forEach(a => {
        const href = (a.getAttribute("href") || a.dataset?.route || "").toLowerCase();
        const txt  = (a.textContent || "").trim().toLowerCase();
        const isCuenta = href === "#/cuenta" || txt === "cuenta";
        if (!isCuenta) a.style.display = "none";
      });

      // Oculta cabeceras de grupos vacíos
      qsa(".gc-side .nav-group, .gc-side .nav-section").forEach(g => {
        const anyVisible = !![...g.querySelectorAll(".nav-item")].find(x => x.style.display !== "none");
        if (!anyVisible) g.style.display = "none";
      });

      // Si existe item cuenta, seleccionarlo visualmente
      const cuentaItem = qsa(".gc-side .nav-item").find(a => (a.getAttribute("href")||"").toLowerCase()==="#/cuenta" || (a.textContent||"").trim().toLowerCase()==="cuenta");
      if (cuentaItem) {
        qsa(".gc-side .nav-item[aria-current]").forEach(a => a.removeAttribute("aria-current"));
        cuentaItem.setAttribute("aria-current","page");
      }
    }

    // Redirige a #/cuenta si el hash no lo es
    if (location.hash.toLowerCase() !== "#/cuenta") {
      // Evita loop si el router vuelve a escribir
      setTimeout(() => { location.hash = "#/cuenta"; }, 0);
    }

    // Título de módulo
    const title = qs("#mod-title");
    if (title) title.textContent = "Cuenta";

    // Limpia cabecera de tabla / contadores / paginación
    const header = qs(".recursos-box.desktop-only .table-header");
    if (header) header.innerHTML = "";
    const count = qs("#mod-count"); if (count) count.textContent = "—";
    const pag1 = qs("#pagination-controls"); if (pag1) pag1.innerHTML = "";
    const pag2 = qs("#pagination-mobile");  if (pag2) pag2.innerHTML = "";

    // Oculta barra de búsqueda (si quieres dejarla, comenta estas 2 líneas)
    const sb = qs("#search-input");
    if (sb) { sb.value = ""; sb.parentElement && (sb.parentElement.style.display = "none"); }

    // Borra tabla y pinta el mock
    const hostD = qs("#recursos-list"); if (hostD) hostD.innerHTML = buildCuentaPlaceholder();
    const hostM = qs("#recursos-list-mobile"); if (hostM) hostM.innerHTML = "";
    window.__adminGuardRestricted = true;
  }

  // Re-aplica al cambiar de hash para bloquear navegación manual
  function bindHashGuard() {
    if (window.__adminGuardHashBound) return;
    window.__adminGuardHashBound = true;
    window.addEventListener("hashchange", () => {
      const uid = getUserId();
      if (!isAdmin(uid)) {
        applyRestrictedUI();
      }
    });
  }

  function init() {
    const uid = getUserId();
    if (isAdmin(uid)) return;   

    const tries = [0, 30, 120, 300];
    tries.forEach(ms => setTimeout(applyRestrictedUI, ms));
    bindHashGuard();
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
