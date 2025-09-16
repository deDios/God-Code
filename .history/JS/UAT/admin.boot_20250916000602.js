// /JS/UAT/admin.boot.js
// Módulo de arranque para Admin UAT (evita script inline en el HTML)
import '/JS/UAT/constants.js';
import '/JS/UAT/admin.api.js';

// Features
import { Cursos }    from '/JS/UAT/features/cursos.js';
import { Noticias }  from '/JS/UAT/features/noticias.js';
import { Tutores }   from '/JS/UAT/features/tutores.js';
import { Usuarios }  from '/JS/UAT/features/usuarios.js';
import { Suscrips }  from '/JS/UAT/features/suscripciones.js';

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

function mountAll(){
  try { Cursos.mount?.(); }    catch(e){ console.error('Cursos.mount', e); }
  try { Noticias.mount?.(); }  catch(e){ console.error('Noticias.mount', e); }
  try { Tutores.mount?.(); }   catch(e){ console.error('Tutores.mount', e); }
  try { Usuarios.mount?.(); }  catch(e){ console.error('Usuarios.mount', e); }
  try { Suscrips.mount?.(); }  catch(e){ console.error('Suscrips.mount', e); }
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', mountAll, { once: true });
} else {
  mountAll();
}
