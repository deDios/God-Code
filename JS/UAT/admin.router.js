// admin.router.js (simple)
(() => {
  const modules = {
    '#/cursos':     { flag: '__CursosState',     path: '/JS/UAT/admin.cursos.js',   api: () => globalThis.cursos },
    '#/noticias':   { flag: '__NoticiasState',   path: '/JS/UAT/admin.noticias.js', api: () => globalThis.noticias },
    '#/tutores':    { flag: '__TutoresState',    path: '/JS/UAT/admin.tutores.js',  api: () => globalThis.tutores },
    '#/suscripciones': { flag: '__SuscripState', path: '/JS/UAT/admin.suscrip.js',  api: () => globalThis.suscrip },
  };

  const qs = (s, r=document)=>r.querySelector(s);

  async function ensure(path, flag) {
    if (globalThis[flag]) return;
    const has = !!document.querySelector(`script[src="${path}"]`);
    if (has) { for (let i=0;i<10 && !globalThis[flag];i++) await new Promise(r=>setTimeout(r,30)); if (globalThis[flag]) return; }
    try { await import(path); } catch {}
  }

  function setTitle(t){ const h=qs('#mod-title'); if(h) h.textContent=t; }
  function clearLists(){
    const d=qs('#recursos-list'), m=qs('#recursos-list-mobile');
    const p1=qs('#pagination-controls'), p2=qs('#pagination-mobile');
    if(d) d.innerHTML=''; if(m) m.innerHTML=''; if(p1) p1.innerHTML=''; if(p2) p2.innerHTML='';
    const c=qs('#mod-count'); if(c) c.textContent='—';
  }
  function setActive(route){
    document.querySelectorAll('.gc-side .nav-item').forEach(a=>{
      a.getAttribute('data-route')===route ? a.setAttribute('aria-current','page') : a.removeAttribute('aria-current');
    });
  }
  function setHeaders(route){
    const head = qs('.recursos-box.desktop-only .table-header');
    if(!head) return;
    const cols = route==="#/cursos" ? [
      ['col-nombre','Nombre'], ['col-tutor','Tutor'], ['col-fecha','Fecha de inicio'], ['col-status','Status'],
    ] : route==="#/noticias" ? [
      ['col-nombre','Título'], ['col-fecha','Creación'], ['col-status','Status'], ['col-acc',''],
    ] : route==="#/tutores" ? [
      ['col-nombre','Nombre'], ['col-fecha','Creación'], ['col-status','Status'], ['col-acc',''],
    ] : [];
    head.innerHTML = cols.map(([cls,lab])=>`<div class="${cls}" role="columnheader">${lab}</div>`).join('');
  }

  async function onRoute(){
    const route = location.hash || '#/cursos';
    const mod = modules[route] || modules['#/cursos'];
    setActive(route);
    clearLists();
    setHeaders(route);
    setTitle(route.replace('#/','').replace(/^\w/,c=>c.toUpperCase()));

    await ensure(mod.path, mod.flag);
    const api = mod.api && mod.api();
    if (api?.mount) await api.mount();
  }

  // botón crear: un solo handler global
  function onCreate(){
    const route = (location.hash || '#/cursos');
    const mod = modules[route] || modules['#/cursos'];
    const api = mod.api && mod.api();
    if (api?.openCreate) api.openCreate();
  }

  // wire
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('.gc-side .nav-item[href^="#/"]');
    if(!a) return;
    e.preventDefault();
    location.hash = a.getAttribute('href');
  });

  window.addEventListener('hashchange', onRoute);
  document.addEventListener('DOMContentLoaded', ()=>{
    const btn = document.querySelector('#btn-add');
    if (btn) { btn.onclick = onCreate; }     // << sin clonar, sin duplicar listeners
    onRoute();
  });
})();
