// /JS/UAT/admin.index.js
// Capa de “glue”: orquesta vistas y helpers de UI.
// El router principal y la verificación de permisos vive en admin.boot.js.
// Aquí evitamos duplicar lógica sensible y nos hacemos idempotentes.

import { MAXLEN } from "/JS/UAT/shared/constants.js";

// Features (vistas)
import * as Cuenta      from "/JS/UAT/features/cuenta.js";
import * as Usuarios    from "/JS/UAT/features/usuarios.js";
import * as Cursos      from "/JS/UAT/features/cursos.js";
import * as Noticias    from "/JS/UAT/features/noticias.js";
import * as Tutores     from "/JS/UAT/features/tutores.js";
import * as Suscrips    from "/JS/UAT/features/suscripciones.js";

// ===== Utils locales =====
const log = (...a) => console?.log?.("[ADMIN:index]", ...a);
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const isAdmin = () =>
  typeof window.Admin?.isAdmin === "function" ? !!window.Admin.isAdmin() : false;

const showOnly = (idToShow) => {
  $$(".view").forEach((sec) => {
    const show = sec.id === idToShow;
    if (show) {
      sec.removeAttribute("hidden");
      sec.classList.remove("hidden");
    } else {
      sec.setAttribute("hidden", "");
      sec.classList.add("hidden");
    }
  });
};

const ROUTE_TO_VIEW = {
  "#/cuenta": "view-cuenta",
  "#/usuarios": "view-usuarios",
  "#/cursos": "view-cursos",
  "#/noticias": "view-noticias",
  "#/tutores": "view-tutores",
  "#/suscripciones": "view-suscripciones",
};

function currentRoute() {
  return location.hash || (isAdmin() ? "#/cursos" : "#/cuenta");
}

function routeTo(hash) {
  if (location.hash !== hash) location.hash = hash;
  applyRoute();
}

function applyRoute() {
  const admin = isAdmin();
  const h = currentRoute();

  // Si no es admin, siempre forzar cuenta.
  if (!admin && h !== "#/cuenta") {
    routeTo("#/cuenta");
    return;
  }

  const viewId = ROUTE_TO_VIEW[h] || (admin ? "view-cursos" : "view-cuenta");
  showOnly(viewId);
  log("route =", h, "->", viewId);
}

// ====== Maxlengths + contadores ======
function applyMaxlengthsFromConstants() {
  // Usuarios
  const uNombre = $("#u_nombre");
  if (uNombre && MAXLEN?.usuarios?.nombre) {
    uNombre.maxLength = MAXLEN.usuarios.nombre;
  }

  // Cursos
  const cNombre = $("#c_nombre");
  const cDesc = $("#c_desc");
  if (cNombre && MAXLEN?.cursos?.nombre) cNombre.maxLength = MAXLEN.cursos.nombre;
  if (cDesc && MAXLEN?.cursos?.descripcion) cDesc.maxLength = MAXLEN.cursos.descripcion;

  // Noticias
  const nTitulo = $("#n_titulo");
  const nResumen = $("#n_resumen");
  const nContenido = $("#n_contenido");
  const nTags = $("#n_tags");
  if (nTitulo && MAXLEN?.noticias?.titulo) nTitulo.maxLength = MAXLEN.noticias.titulo;
  if (nResumen && MAXLEN?.noticias?.resumen) nResumen.maxLength = MAXLEN.noticias.resumen;
  if (nContenido && MAXLEN?.noticias?.contenido) nContenido.maxLength = MAXLEN.noticias.contenido;
  if (nTags && MAXLEN?.noticias?.tags) nTags.maxLength = MAXLEN.noticias.tags;

  // Tutores
  const tNombre = $("#t_nombre");
  const tBio = $("#t_bio");
  if (tNombre && MAXLEN?.tutores?.nombre) tNombre.maxLength = MAXLEN.tutores.nombre;
  if (tBio && MAXLEN?.tutores?.bio) tBio.maxLength = MAXLEN.tutores.bio;

  // Suscripciones
  const sNotas = $("#s_notas");
  if (sNotas && MAXLEN?.suscripciones?.notas) sNotas.maxLength = MAXLEN.suscripciones.notas;

  // Contadores vivos
  const updateCounter = (cnt) => {
    const forId = cnt.getAttribute("data-for");
    if (!forId) return;
    const max = Number(cnt.getAttribute("data-max") || 0);
    const el = document.getElementById(forId);
    if (!el) return;
    const len = (el.value || "").length;
    cnt.textContent = max ? `${len}/${max}` : String(len);
    const over = max && len > max;
    cnt.dataset.over = over ? "true" : "false";
  };

  const counters = $$(".counter[data-for]");
  counters.forEach((c) => {
    updateCounter(c);
    const forId = c.getAttribute("data-for");
    const el = document.getElementById(forId);
    if (el) el.addEventListener("input", () => updateCounter(c));
  });
}

function autoSetTodayForDates() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const iso = `${yyyy}-${mm}-${dd}`;

  const cFecha = $("#c_fecha");
  if (cFecha && !cFecha.value) cFecha.value = iso;
}

// ====== Drawers (abrir/cerrar) ======
function bindDrawers() {
  document.addEventListener("click", (ev) => {
    const openBtn = ev.target.closest("[data-open]");
    if (openBtn) {
      const id = openBtn.getAttribute("data-open");
      const dlg = document.getElementById(id);
      if (dlg?.showModal) dlg.showModal();
      return;
    }
    const closeBtn = ev.target.closest("[data-close]");
    if (closeBtn) {
      const id = closeBtn.getAttribute("data-close");
      const dlg = document.getElementById(id);
      if (dlg?.close) dlg.close();
      return;
    }
  });
}

// ====== Montaje ======
let mountedOnce = false;
function mountFeaturesOnce() {
  if (mountedOnce) return;
  mountedOnce = true;

  // Siempre montamos Cuenta (lee Admin.user normalizado por boot)
  try { Cuenta?.mount?.(); } catch (e) { log("Cuenta.mount error", e); }

  if (isAdmin()) {
    try { Usuarios?.mount?.(); } catch (e) { log("Usuarios.mount error", e); }
    try { Cursos?.mount?.(); } catch (e) { log("Cursos.mount error", e); }
    try { Noticias?.mount?.(); } catch (e) { log("Noticias.mount error", e); }
    try { Tutores?.mount?.(); } catch (e) { log("Tutores.mount error", e); }
    try { Suscrips?.mount?.(); } catch (e) { log("Suscrips.mount error", e); }
  }
}

// ====== Bootstrap local ======
(function start() {
  const admin = isAdmin();
  log("user", window.Admin?.user, "isAdmin", admin);

  // Aplicar límites, contadores y defaults UI
  applyMaxlengthsFromConstants();
  autoSetTodayForDates();
  bindDrawers();

  // Montar módulos una sola vez
  mountFeaturesOnce();

  // Enrutamiento ligero (no volvemos a montar en cambios de hash)
  // *Si admin.boot.js ya instaló un router, esto no causa conflicto:
  // sólo mostramos/ocultamos vistas; los mounts no se repiten.
  if (!window.__ADMIN_INDEX_ROUTER__) {
    window.__ADMIN_INDEX_ROUTER__ = true;
    window.addEventListener("hashchange", applyRoute);
  }

  // Ruta inicial forzada según rol
  const startHash = admin ? (location.hash || "#/cursos") : "#/cuenta";
  if (location.hash !== startHash) {
    location.hash = startHash;
  }
  applyRoute();
})();

