// /JS/UAT/admin.boot.js 
import '/JS/UAT/shared/constants.js';
import { ADMIN_IDS } from '/JS/UAT/shared/constants.js';
import '/JS/UAT/admin.api.js';

// Features
import { Cursos }    from '/JS/UAT/features/cursos.js';
import { Noticias }  from '/JS/UAT/features/noticias.js';
import { Tutores }   from '/JS/UAT/features/tutores.js';
import { Usuarios }  from '/JS/UAT/features/usuarios.js';
import { Suscrips }  from '/JS/UAT/features/suscripciones.js';
import { Cuenta }    from '/JS/UAT/features/cuenta.js';

function ensureDrawerHost(){
  let host = document.getElementById('gc-drawer-host');
  if (!host){
    host = document.createElement('div');
    host.id = 'gc-drawer-host';
    document.body.appendChild(host);
  }
  return host;
}

// Fallbacks (solo si no existen ya)
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

// Usuario (para creado_por, etc.)
window.Admin = window.Admin || { user: { id: 1, name: 'uat' } };
window.Admin.isAdmin = () => ADMIN_IDS.includes(Number(window.Admin?.user?.id));

function ensureCuentaView(){
  let v = document.getElementById('view-cuenta');
  if (!v){
    const wrap = document.querySelector('.wrap') || document.body;
    v = document.createElement('section');
    v.id = 'view-cuenta';
    v.className = 'view';
    v.innerHTML = `<h2>Mi cuenta</h2><div id="cuenta-body"></div>`;
    wrap.prepend(v);
  }
  return v;
}

function showOnlyCuenta(){
  const views = ['cursos','noticias','tutores','usuarios','suscripciones'];
  views.forEach(k => {
    const el = document.getElementById('view-'+k);
    if (el) el.classList.add('hidden');
  });
  const cuenta = ensureCuentaView();
  cuenta.classList.remove('hidden');

  // Ocultar botones de navegación de admin
  document.querySelectorAll('nav [data-nav]').forEach(btn => {
    const v = btn.getAttribute('data-nav');
    if (v !== 'cuenta') btn.style.display = 'none';
  });
}

function applyRoleVisibility(){
  const isAdmin = window.Admin.isAdmin();
  // Mostrar/ocultar botones "Nuevo"
  const ids = ['c_new_btn','n_new_btn','t_new_btn','u_new_btn','s_new_btn'];
  ids.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.style.display = isAdmin ? '' : 'none';
  });
  document.documentElement.classList.toggle('role-admin', isAdmin);

  if (!isAdmin){
    showOnlyCuenta();
  }
}

function enforceRouteGuard(){
  const isAdmin = window.Admin.isAdmin();
  const hash = String(location.hash||'').toLowerCase();
  if (!isAdmin && hash !== '#/cuenta'){
    location.replace('#/cuenta');
  }
}

function mountAll(){
  const isAdmin = window.Admin.isAdmin();
  if (isAdmin){
    try { Cursos.mount?.(); }    catch(e){ console.error('Cursos.mount', e); }
    try { Noticias.mount?.(); }  catch(e){ console.error('Noticias.mount', e); }
    try { Tutores.mount?.(); }   catch(e){ console.error('Tutores.mount', e); }
    try { Usuarios.mount?.(); }  catch(e){ console.error('Usuarios.mount', e); }
    try { Suscrips.mount?.(); }  catch(e){ console.error('Suscrips.mount', e); }
  }
  // Cuenta siempre disponible
  try { Cuenta.mount?.(); } catch(e){ console.error('Cuenta.mount', e); }
  applyRoleVisibility();
  enforceRouteGuard();
}

window.addEventListener('hashchange', enforceRouteGuard);

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', mountAll, { once: true });
} else {
  mountAll();
}
