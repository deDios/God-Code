(() => {
  "use strict";

  const ADMIN_IDS = [1, 12, 13, 17, 18];

  const HEADER_SEL = [
    ".dashboard-header",
  ];
  const ADD_BUTTON_SEL = ["#btn-add", ".gc-fab", ".add-resource"];
  const SEARCH_SEL = ["#search-input", ".gc-search", ".searchbar"];

  // ======= Helpers =======
  function getUserIdFromCookie() {
    try {
      const row = document.cookie
        .split("; ")
        .find((x) => x.startsWith("usuario="));
      if (!row) return null;
      const json = decodeURIComponent(row.split("=")[1] || "");
      const u = JSON.parse(json);
      const n = Number(u?.id);
      return Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  }

  function hideEls(selectors) {
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        el.setAttribute("data-guard-hidden", "1");
        el.style.display = "none";
      });
    });
  }

  function stripSidebarToCuenta() {
    const side = document.querySelector(".gc-side");
    if (!side) return;

    // deja solo el item "Cuenta" si existe; si no, crea uno mínimo
    const items = Array.from(side.querySelectorAll('.nav-item[href^="#/"]'));
    const cuenta = items.find(
      (a) => (a.getAttribute("href") || "").trim() === "#/cuenta"
    );
    items.forEach((a) => {
      if (a !== cuenta) a.remove();
    });

    if (!cuenta) {
      const li = document.createElement("a");
      li.className = "nav-item";
      li.href = "#/cuenta";
      li.setAttribute("data-route", "#/cuenta");
      li.textContent = "Cuenta";
      side.innerHTML = "";
      side.appendChild(li);
    }

    // título grande del sidebar
    const bigTitle = side.querySelector(".side-title, .title, h3");
    if (bigTitle) bigTitle.textContent = "Cuenta";
  }

  function clearMainLists() {
    const ids = [
      "#recursos-list",
      "#recursos-list-mobile",
      "#pagination-controls",
      "#pagination-mobile",
    ];
    ids.forEach((id) => {
      const el = document.querySelector(id);
      if (el) el.innerHTML = "";
    });

    const tc = document.querySelector("#mod-count");
    if (tc) tc.textContent = "—";

    const head = document.querySelector(
      ".recursos-box.desktop-only .table-header"
    );
    if (head) head.innerHTML = "";
  }

  function findContentHost() {
    // dónde colocar el placeholder
    return (
      document.querySelector("#gc-admin-content") ||
      document.querySelector(".gc-content") ||
      document.querySelector(".dashboard-content") ||
      document.querySelector("#main") ||
      document.querySelector("main") ||
      document.body
    );
  }

  function injectGuardCSS() {
    if (document.getElementById("admin-guard-css")) return;
    const css = `
      .guard-placeholder{
        max-width: 920px; margin: 48px auto; padding: 24px;
        background:#fff; border-radius:16px; box-shadow:0 16px 40px rgba(0,0,0,.08);
      }
      .guard-hero{ display:flex; gap:24px; align-items:center; }
      .guard-hero .svg{
        flex:0 0 160px; width:160px; height:160px; display:grid; place-items:center;
        border-radius:14px; background:linear-gradient(180deg,#f4f7ff,#eef2ff);
      }
      .guard-hero h1{ font-size:1.4rem; margin:0 0 6px; }
      .guard-hero p{ color:#5b6475; margin:0; }
      .guard-actions{ margin-top:18px; display:flex; gap:10px; flex-wrap:wrap; }
      .guard-actions .gc-btn{ padding:.6rem 1rem; }
    `;
    const s = document.createElement("style");
    s.id = "admin-guard-css";
    s.textContent = css;
    document.head.appendChild(s);
  }

  function makeWipSVG() {
    // engranes / candado suave
    return `
      <svg width="92" height="92" viewBox="0 0 92 92" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img">
        <rect x="6" y="18" width="80" height="60" rx="12" fill="#E8EEFF"/>
        <path d="M56 38v-6a10 10 0 10-20 0v6" stroke="#7B8BD1" stroke-width="3" stroke-linecap="round"/>
        <rect x="30" y="38" width="32" height="28" rx="8" fill="#CFE0FF" stroke="#7B8BD1" stroke-width="2"/>
        <circle cx="46" cy="52" r="4.5" fill="#7B8BD1"/>
        <path d="M46 56v6" stroke="#7B8BD1" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  }

  function renderPlaceholderCuenta() {
    injectGuardCSS();
    clearMainLists();

    const host = findContentHost();
    // elimina cualquier placeholder previo
    host.querySelectorAll(".guard-placeholder").forEach((n) => n.remove());

    const box = document.createElement("section");
    box.className = "guard-placeholder";
    box.innerHTML = `
      <div class="guard-hero">
        <div class="svg">${makeWipSVG()}</div>
        <div class="txt">
          <h1>Estamos trabajando en ello</h1>
          <p>Esta sección aún no está disponible para tu cuenta. Pronto tendrás más opciones aquí mismo.</p>
          <div class="guard-actions">
            <a href="#/cuenta" class="gc-btn">Ir a Cuenta</a>
            <a href="/" class="gc-btn gc-btn--ghost">Volver al sitio</a>
          </div>
        </div>
      </div>
    `;
    host.appendChild(box);

    const title = document.querySelector("#mod-title");
    if (title) title.textContent = "Cuenta";
  }

  function hideHeaderAndSearch() {
    hideEls(HEADER_SEL);
    hideEls(ADD_BUTTON_SEL);
    hideEls(SEARCH_SEL);
  }

  function applyRestrictedUI() {
    // 1) Oculta header + acciones
    hideHeaderAndSearch();

    // 2) Sidebar mínima
    stripSidebarToCuenta();

    // 3) Fuerza ruta y limpia tabla
    if (location.hash !== "#/cuenta") {
      // replace para no contaminar el historial
      location.replace("#/cuenta");
    }
    renderPlaceholderCuenta();
  }

  // ======= Init =======
  function init() {
    // si ya decidió alguien, respétalo
    if (window.__adminGuardRestricted === true) {
      applyRestrictedUI();
      return;
    }
    if (window.__adminGuardRestricted === false) {
      return;
    }

    const uid = getUserIdFromCookie();
    const isAdmin = uid != null && ADMIN_IDS.includes(Number(uid));
    window.__adminGuardRestricted = !isAdmin;

    if (!isAdmin) applyRestrictedUI();
  }

  // Ejecuta en cuanto haya DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expone por si quieres forzar en consola:
  window.AdminGuard = { init, applyRestrictedUI };
})();
