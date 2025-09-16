// /JS/UAT/admin.boot.js
// Boot con guard de rol + lectura de cookie 'usuario' + fixes de carrera.
// - Define un stub de window.Admin.isAdmin() desde el arranque (evita crash)
// - Lee cookie 'usuario' (doble decode) y normaliza { id,name,email }
// - Aplica guard: no-admin => solo 'Cuenta'; admin => redirige a '#/cursos' si estás en '#/cuenta'
// - No monta features de admin (eso lo hace admin.index.js); solo monta 'Cuenta' para no-admin.

import '/JS/UAT/shared/constants.js';
import { ADMIN_IDS, __ADMIN_DEBUG__ } from '/JS/UAT/shared/constants.js';
import '/JS/UAT/admin.api.js';
import { Cuenta } from '/JS/UAT/features/cuenta.js';

/* ===== SAFETY BOOTSTRAP (corre antes que todo lo demás del módulo) ===== */
(() => {
  // Garantiza que existan Admin e isAdmin aunque un guard se ejecute muy temprano
  window.Admin = window.Admin || {};
  if (typeof window.Admin.isAdmin !== 'function') {
    window.Admin.isAdmin = () => false; // será sobreescrita tras leer la cookie
  }
})();

/* ================= helpers de identidad ================= */
function getUsuarioFromCookie() {
  const row = (document.cookie || "")
    .split("; ")
    .find(r => r.indexOf("usuario=") === 0);
  if (!row) return null;
  try {
    const raw = row.split("=")[1] || "";
    const once = decodeURIComponent(raw);
    const maybe = /%7B|%22/i.test(once) ? decodeURIComponent(once) : once;
    const obj = JSON.parse(maybe);
    const id    = Number(obj.id || obj.usuario_id || obj.user_id || 0);
    const name  = obj.name || obj.nombre || obj.fullname || "";
    const email = obj.email || obj.correo || "";
    return { ...obj, id, name, email };
  } catch {
    return null;
  }
}

function safeIsAdmin(){
  try { return !!(window.Admin && typeof window.Admin.isAdmin === 'function' && window.Admin.isAdmin()); }
  catch { return false; }
}

/* ================= init scoped ================= */
function initAdminBoot() {
  const root = document.getElementById('admin-root') || document; // si no existe, opera a nivel documento (admin.php)

  // Drawer host (no pisa si ya existe)
  function ensureDrawerHost(){
    let host = root.querySelector ? root.querySelector('#gc-drawer-host') : document.getElementById('gc-drawer-host');
    if (!host){
      host = document.createElement('div');
      host.id = 'gc-drawer-host';
      (root.appendChild ? root : document.body).appendChild(host);
    }
    return host;
  }
  if (typeof window.openDrawer !== 'function'){
    window.openDrawer = async (title, html) => {
      const host = ensureDrawerHost();
      host.innerHTML = `<div class="drawer-like"><h3>${title}</h3><div>${html}</div></div>`;
    };
  }
  if (typeof window.closeDrawer !== 'function'){
    window.closeDrawer = () => {
      const host = ensureDrawerHost();
      host.innerHTML = '';
    };
  }

  // Usuario desde cookie y función real de isAdmin()
  const currentUser = getUsuarioFromCookie();
  window.Admin = window.Admin || {};
  window.Admin.user = currentUser || { id: 1, name: 'uat' };
  window.Admin.isAdmin = () => ADMIN_IDS.includes(Number((window.Admin.user && window.Admin.user.id) || 0));

  if (__ADMIN_DEBUG__) {
    try {
      console.log('[ADMIN] user', window.Admin.user);
      console.log('[ADMIN] ADMIN_IDS', ADMIN_IDS);
      console.log('[ADMIN] isAdmin()', window.Admin.isAdmin());
    } catch {}
  }

  function ensureCuentaView(){
    const q = root.querySelector ? (sel)=>root.querySelector(sel) : (sel)=>document.querySelector(sel);
    let v = q('#view-cuenta');
    if (!v){
      v = document.createElement('section');
      v.id = 'view-cuenta';
      v.className = 'view';
      v.innerHTML = `<h2>Mi cuenta</h2><div id="cuenta-body"></div>`;
      (root.prepend ? root : document.body).prepend(v);
    }
    return v;
  }

  function showOnlyCuenta(){
    const views = ['cursos','noticias','tutores','usuarios','suscripciones'];
    views.forEach(k => {
      const el = (root.querySelector ? root : document).querySelector('#view-'+k);
      if (el) el.classList.add('hidden');
    });
    const cuenta = ensureCuentaView();
    cuenta.classList.remove('hidden');
    (root.querySelectorAll ? root : document).querySelectorAll('nav [data-nav]').forEach(btn => {
      const v = btn.getAttribute('data-nav');
      if (v !== 'cuenta') btn.style.display = 'none';
    });
  }

  function showAdminUI(){
    const views = ['cursos','noticias','tutores','usuarios','suscripciones'];
    views.forEach(k => {
      const el = (root.querySelector ? root : document).querySelector('#view-'+k);
      if (el) el.classList.remove('hidden');
    });
    (root.querySelectorAll ? root : document).querySelectorAll('nav [data-nav]').forEach(btn => {
      btn.style.display = '';
    });
  }

  function applyRoleVisibility(){
    const isAdmin = safeIsAdmin();
    const ids = ['c_new_btn','n_new_btn','t_new_btn','u_new_btn','s_new_btn'];
    ids.forEach(id => {
      const btn = (root.querySelector ? root : document).querySelector('#'+id);
      if (btn) btn.style.display = isAdmin ? '' : 'none';
    });
    document.documentElement.classList.toggle('role-admin', isAdmin);
    if (!isAdmin) showOnlyCuenta(); else showAdminUI();
  }

  function enforceRouteGuard(){
    const isAdmin = safeIsAdmin();
    const hash = String(location.hash||'').toLowerCase();
    if (!isAdmin && hash !== '#/cuenta'){
      location.replace('#/cuenta');
    }
  }

  function redirectIfAdminOnCuenta(){
    const isAdmin = safeIsAdmin();
    const hash = String(location.hash||'').toLowerCase();
    if (isAdmin && (hash === '' || hash === '#/' || hash === '#/cuenta')){
      location.replace('#/cursos');
    }
  }

  // No montamos features (lo hace admin.index.js); solo 'Cuenta' para no-admin
  try { Cuenta.mount?.(); } catch(e){ console.error('Cuenta.mount', e); }

  applyRoleVisibility();
  enforceRouteGuard();
  redirectIfAdminOnCuenta();

  window.addEventListener('hashchange', () => {
    enforceRouteGuard();
    redirectIfAdminOnCuenta();
    applyRoleVisibility();
  });
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initAdminBoot, { once: true });
} else {
  initAdminBoot();
}
