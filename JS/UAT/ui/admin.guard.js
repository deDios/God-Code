// /JS/UAT/ui/admin.guard.js
(() => {
  "use strict";
  const TAG = "[AdminGuard]";

  /* ===================== CONFIG ===================== */
  const ADMIN_IDS =
    globalThis.__ADMIN_IDS && Array.isArray(globalThis.__ADMIN_IDS)
      ? globalThis.__ADMIN_IDS.map((n) => Number(n)).filter(Number.isFinite)
      : [1, 12, 13, 17, 18];

  const LINKS = Object.assign(
    { cuenta: "/VIEW/Home.php", sitio: "/index.php" },
    globalThis.__GUARD_LINKS || {}
  );

  /* ===================== UTILS ===================== */
  function parseUserIdFromCookie() {
    try {
      const raw = document.cookie
        .split("; ")
        .find((r) => r.startsWith("usuario="));
      if (!raw) return null;
      const json = decodeURIComponent(raw.split("=")[1] || "");
      const u = JSON.parse(json);
      const n = Number(u?.id);
      return Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  }
  function getUserId() {
    const fromCookie = parseUserIdFromCookie();
    if (Number.isFinite(fromCookie)) return fromCookie;
    const winUser = Number(globalThis.usuario?.id);
    if (Number.isFinite(winUser)) return winUser;
    const stateUser = Number(globalThis.state?.usuario?.id);
    if (Number.isFinite(stateUser)) return stateUser;
    return null;
  }
  const isAdmin = (id) => Number.isFinite(id) && ADMIN_IDS.includes(Number(id));

  /* ===================== CSS ===================== */
  function injectGuardCSS() {
    if (document.getElementById("admin-guard-css")) return;
    const css = `
      #home-main .guard-placeholder { display:none; }

      #home-main.guard-on .main-content { display:none !important; }

      #home-main.guard-on .guard-placeholder {
        display:flex !important;
        align-items:center;          
        justify-content:center;      
        padding: 20px 24px;
        min-height: 60vh;            
      }

      /* Tarjeta del placeholder */
      .guard-hero {
        width: 100%;
        max-width: 920px;
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 10px 30px rgba(0,0,0,.06);
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: 22px;
        padding: 28px 32px;
      }
      .guard-hero .svg {
        display:grid; place-items:center;
        background: #F2F5FF;
        border-radius: 16px;
        width: 120px; height: 120px;
      }
      .guard-hero h1 { margin: 4px 0 6px; font-size: 24px; line-height: 1.2; }
      .guard-hero p  { margin: 0 0 12px; color: #5a6075; }
      .guard-actions { display:flex; gap:10px; margin-top: 8px; }
      .guard-actions .gc-btn { line-height: 1; }

      /* Ocultar cualquier rastro de toolbar/listas por si existe fuera de .main-content */
      #home-main.guard-on .dash-toolbar,
      #home-main.guard-on .recursos-box.desktop-only,
      #home-main.guard-on .recursos-box.mobile-only,
      #home-main.guard-on #pagination-controls,
      #home-main.guard-on #pagination-mobile { display:none !important; }

      #home-main.guard-on .guard-placeholder{
      align-items: flex-start !important;  
      padding-top: 2rem !important;        
      min-height: 40vh !important;       
      }
    `;
    const tag = document.createElement("style");
    tag.id = "admin-guard-css";
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  /* ===================== DOM ===================== */
  function ensureGuardPlaceholder() {
    let ph = document.querySelector("#home-main .guard-placeholder");
    if (!ph) {
      const tpl = document.createElement("section");
      tpl.className = "guard-placeholder";
      tpl.innerHTML = `
        <div class="guard-hero" role="status" aria-live="polite">
          <div class="svg" aria-hidden="true">
            <svg width="92" height="92" viewBox="0 0 92 92" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="18" width="80" height="60" rx="12" fill="#E8EEFF"></rect>
              <path d="M56 38v-6a10 10 0 10-20 0v6" stroke="#7B8BD1" stroke-width="3" stroke-linecap="round"></path>
              <rect x="30" y="38" width="32" height="28" rx="8" fill="#CFE0FF" stroke="#7B8BD1" stroke-width="2"></rect>
              <circle cx="46" cy="52" r="4.5" fill="#7B8BD1"></circle>
              <path d="M46 56v6" stroke="#7B8BD1" stroke-width="2" stroke-linecap="round"></path>
            </svg>
          </div>
          <div class="txt">
            <h1>Estamos trabajando en ello</h1>
            <p>Esta sección aún no está disponible para tu cuenta. Pronto tendrás más opciones aquí mismo.</p>
            <div class="guard-actions">
              <a id="guard-link-cuenta" class="gc-btn" href="#">Cuenta</a>
              <a id="guard-link-sitio"  class="gc-btn gc-btn--ghost" href="#">Home</a>
            </div>
          </div>
        </div>`;
      const host = document.getElementById("home-main") || document.body;
      host.appendChild(tpl);
      ph = tpl;
    }
    ph.querySelector("#guard-link-cuenta")?.setAttribute(
      "href",
      LINKS.cuenta || "#/cuenta"
    );
    ph.querySelector("#guard-link-sitio")?.setAttribute(
      "href",
      LINKS.sitio || "/"
    );
    return ph;
  }

  function reduceSidebarToCuenta() {
    const side = document.querySelector(".gc-side");
    if (!side) return;

    side.innerHTML = "";
    side.setAttribute("aria-label", "Cuenta");

    const a = document.createElement("a");
    a.className = "nav-item";
    a.href = "#/cuenta";
    a.setAttribute("data-route", "#/cuenta");
    a.setAttribute("aria-current", "page");
    a.textContent = "Cuenta";
    side.appendChild(a);
  }

  function toggleHeaderWidgets(hidden) {
    const search = document.getElementById("search-input");
    const addBtn = document.getElementById("btn-add");
    if (search) {
      search.style.display = hidden ? "none" : "";
      if (hidden) search.setAttribute("data-guard-hidden", "1");
      else search.removeAttribute("data-guard-hidden");
    }
    if (addBtn) {
      addBtn.style.display = hidden ? "none" : "";
      if (hidden) addBtn.setAttribute("data-guard-hidden", "1");
      else addBtn.removeAttribute("data-guard-hidden");
    }
  }

  /* ===================== CORE ===================== */
  function applyGuard(restricted) {
    globalThis.__adminGuardRestricted = !!restricted;

    injectGuardCSS();
    ensureGuardPlaceholder();

    const root = document.getElementById("home-main");
    if (root) root.classList.toggle("guard-on", !!restricted);

    toggleHeaderWidgets(!!restricted);

    if (restricted) {
      reduceSidebarToCuenta();
      if (location.hash !== "#/cuenta") location.hash = "#/cuenta";
    }
  }

  function init() {
    const uid = getUserId();
    const restricted = !isAdmin(uid);
    console.log(TAG, "userId:", uid, "restricted:", restricted);
    applyGuard(restricted);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
