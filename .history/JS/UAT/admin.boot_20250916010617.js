// /JS/UAT/admin.boot.guard.scoped.js
// Boot con guard de rol, lectura de cookie 'usuario' y scope a #admin-root.
// No monta features de admin (eso lo hace el router). Solo monta "Cuenta" para no-admin.

import '/JS/UAT/shared/constants.js';
import { ADMIN_IDS } from '/JS/UAT/shared/constants.js';
import '/JS/UAT/admin.api.js';
import { Cuenta } from '/JS/UAT/features/cuenta.js';

// --- identidad desde cookie 'usuario' (compat exacta + normalización) ---
function getUsuarioFromCookie() {
  const row = (document.cookie || "")
    .split("; ")
    .find(r => r.indexOf("usuario=") === 0);
  if (!row) return null;

  try {
    const raw = row.split("=")[1] || "";
    // 1er decode (URL encoded)
    const once = decodeURIComponent(raw);
    // si aún huele a %7B o %22, decodifica otra vez
    const maybe = /%7B|%22/i.test(once) ? decodeURIComponent(once) : once;

    const obj = JSON.parse(maybe);

    // Normaliza a las claves que usa el front
    const id    = Number(obj.id || obj.usuario_id || obj.user_id || 0);
    const name  = obj.name || obj.nombre || obj.fullname || "";
    const email = obj.email || obj.correo || "";

    return { ...obj, id, name, email };
  } catch (e) {
    // (opcional) fallback si alguna vez viniera base64
    try {
      const b64 = (row.split("=")[1] || "").replace(/-/g,"+").replace(/_/g,"/");
      return JSON.parse(atob(b64));
    } catch {}
    if (typeof gcLog === "function") gcLog("cookie parse fail", e);
    return null;
  }
}

function initAdminBoot() {
  const root = document.getElementById('admin-root');
  if (!root) {
    console.warn('[admin.boot] #admin-root no encontrado. Se omite inicialización de Admin UAT.');
    return;
  }

  // Fallbacks de drawer (scoped a #admin-root)
  function ensureDrawerHost(){
    let host = root.querySelector('#gc-drawer-host');
    if (!host){
      host = document.createElement('div');
      host.id = 'gc-drawer-host';
      root.appendChild(host);
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

  // Usuario desde cookie/localStorage (fallback a uat)
  const currentUser = getUsuarioFromCookie();
  window.Admin = window.Admin || {};
  window.Admin.user = currentUser || { id: 1, name: 'uat' };
  window.Admin.isAdmin = () => ADMIN_IDS.includes(Number((window.Admin.user && window.Admin.user.id) || 0));

  function ensureCuentaView(){
    let v = root.querySelector('#view-cuenta');
    if (!v){
      v = document.createElement('section');
      v.id = 'view-cuenta';
      v.className = 'view';
      v.innerHTML = `<h2>Mi cuenta</h2><div id="cuenta-body"></div>`;
      root.prepend(v);
    }
    return v;
  }

  function showOnlyCuenta(){
    const views = ['cursos','noticias','tutores','usuarios','suscripciones'];
    views.forEach(k => {
      const el = root.querySelector('#view-'+k);
      if (el) el.classList.add('hidden');
    });
    const cuenta = ensureCuentaView();
    cuenta.classList.remove('hidden');
    // Ocultar botones de navegación SOLO dentro del root
    root.querySelectorAll('nav [data-nav]').forEach(btn => {
      const v = btn.getAttribute('data-nav');
      if (v !== 'cuenta') btn.style.display = 'none';
    });
  }

  function applyRoleVisibility(){
    const isAdmin = window.Admin.isAdmin();
    // Mostrar/ocultar botones "Nuevo" dentro del root
    const ids = ['c_new_btn','n_new_btn','t_new_btn','u_new_btn','s_new_btn'];
    ids.forEach(id => {
      const btn = root.querySelector('#'+id);
      if (btn) btn.style.display = isAdmin ? '' : 'none';
    });
    document.documentElement.classList.toggle('role-admin', isAdmin);
    if (!isAdmin) showOnlyCuenta();
  }

  function enforceRouteGuard(){
    const isAdmin = window.Admin.isAdmin();
    const hash = String(location.hash||'').toLowerCase();
    if (!isAdmin && hash !== '#/cuenta'){
      location.replace('#/cuenta');
    }
  }

  // No montamos features de admin aquí; eso lo hace el router.
  // Montamos SIEMPRE "Cuenta" (idempotente) para que no-admin tenga vista.
  try { Cuenta.mount?.(); } catch(e){ console.error('Cuenta.mount', e); }
  applyRoleVisibility();
  enforceRouteGuard();

  window.addEventListener('hashchange', enforceRouteGuard);
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initAdminBoot, { once: true });
} else {
  initAdminBoot();
}
