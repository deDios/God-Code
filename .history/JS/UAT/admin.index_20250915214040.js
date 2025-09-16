// /JS/UAT/admin.index.js
import { bindDrawerButtons, bindCharCounters } from '/JS/UAT/admin.ui.js';
import { gcLog, todayYYYYMMDD } from '/JS/UAT/admin.services.js';
import { MAXLEN } from '/JS/UAT/shared/constants.js';
import { Usuarios } from '/JS/UAT/features/usuarios.js';
import { Cursos } from '/JS/UAT/features/cursos.js';
import { Noticias } from '/JS/UAT/features/noticias.js';
import { Tutores } from '/JS/UAT/features/tutores.js';
import { Suscripciones } from '/JS/UAT/features/suscripciones.js';

const routes = {
  '#/usuarios': Usuarios,
  '#/cursos': Cursos,
  '#/noticias': Noticias,
  '#/tutores': Tutores,
  '#/suscripciones': Suscripciones,
};

function applyMaxlengthsFromConstants(root=document){
  const map = [
    ['u_nombre', MAXLEN.usuarios.nombre],
    ['c_nombre', MAXLEN.cursos.nombre],
    ['c_desc',   MAXLEN.cursos.descripcion],
    ['c_detalle',MAXLEN.cursos.descripcion_larga],
    ['n_titulo', MAXLEN.noticias.titulo],
    ['n_resumen',MAXLEN.noticias.resumen],
    ['n_contenido', MAXLEN.noticias.contenido],
    ['n_tags', MAXLEN.noticias.tags],
    ['t_nombre', MAXLEN.tutores.nombre],
    ['t_bio', MAXLEN.tutores.bio],
    ['s_notas', MAXLEN.suscripciones.notas],
  ];
  map.forEach(([id, max])=>{
    const el = root.getElementById(id);
    if (el && typeof max === 'number') {
      el.maxLength = max;
      const counter = root.querySelector(`.counter[data-for="${id}"]`);
      if (counter) { counter.setAttribute('data-max', String(max)); }
    }
  });
}

function mountRoute(){
  const root = document.getElementById('admin-root');
  if (!root) return;
  const hash = location.hash || '#/usuarios';
  const feature = routes[hash] || Usuarios;
  gcLog('router', 'hash=', hash);
  feature.mount();
}

function autoSetTodayForDates(root=document){
  const inputs = root.querySelectorAll('input[type="date"]');
  const today = todayYYYYMMDD();
  inputs.forEach(i => { if(!i.value) i.value = today; });
}

function boot(){
  const root = document.getElementById('admin-root');
  if (!root) return;
  applyMaxlengthsFromConstants(root.ownerDocument);
  bindCharCounters(root.ownerDocument);
  bindDrawerButtons(root.ownerDocument);
  autoSetTodayForDates(root.ownerDocument);
  window.addEventListener('hashchange', mountRoute);
  mountRoute();
  window.Admin = { mountRoute, routes };
}

document.addEventListener('DOMContentLoaded', boot);
