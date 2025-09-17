// admin.router.js
(() => {
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  function setActive(route) {
    qsa('.gc-side .nav-item').forEach(a => {
      const r = a.getAttribute('data-route');
      if (r === route) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function clearLists() {
    const desktop = qs('#recursos-list');
    const mobile = qs('#recursos-list-mobile');
    const pag1 = qs('#pagination-controls');
    const pag2 = qs('#pagination-mobile');
    if (desktop) desktop.innerHTML = '';
    if (mobile) mobile.innerHTML = '';
    if (pag1) pag1.innerHTML = '';
    if (pag2) pag2.innerHTML = '';
    const count = qs('#mod-count'); if (count) count.textContent = '—';
  }

  function setTitle(t) {
    const h = qs('#mod-title'); if (h) h.textContent = t;
  }

  async function ensureModule(path, globalReadyFlag, dynamicPath) {
    // Si ya está presente, no importamos
    if (globalThis[globalReadyFlag]) return;
    // Usa import dinámico si no agregaste <script defer>
    try { await import(dynamicPath); } catch (e) { /* ignore if not supported */ }
  }

  async function onRoute() {
    const route = location.hash || '#/cursos';
    setActive(route);
    clearLists();

    switch (route) {
      case '#/cursos': {
        setTitle('Cursos');
        // Cursos ya está en admin.cursos.js
        if (globalThis.cursosLoad?.loadCatalogos && globalThis.cursosLoad?.loadCursos) {
          await globalThis.cursosLoad.loadCatalogos();
          await globalThis.cursosLoad.loadCursos();
        } else {
          console.warn('Módulo de cursos no disponible.');
        }
        break;
      }

      case '#/noticias': {
        setTitle('Noticias');
        // Intenta cargar dinámicamente si no existe
        await ensureModule('/JS/UAT/admin.noticias.js', 'noticiasInit', '/JS/UAT/admin.noticias.js');
        if (typeof globalThis.noticiasInit === 'function') {
          await globalThis.noticiasInit();   // esta función debe renderizar la lista de noticias
        } else {
          console.warn('noticiasInit no está definido.');
        }
        break;
      }

      case '#/tutores': {
        setTitle('Tutores');
        await ensureModule('/JS/UAT/admin.tutores.js', '__TutoresState', '/JS/UAT/admin.tutores.js');
        // Si hiciste listado como en cursos, llama a su init; si no, abre el drawer crear:
        if (typeof globalThis.tutoresInit === 'function') {
          await globalThis.tutoresInit();    // opcional si ya tienes listado
        } else if (typeof globalThis.openTutorCreate === 'function') {
          // Quita esto si ya tienes listado de tutores; es solo para no ver "nada".
          globalThis.openTutorCreate();
        } else {
          console.warn('tutoresInit/openTutorCreate no disponibles.');
        }
        break;
      }

      default: {
        // Fallback a cursos
        location.hash = '#/cursos';
      }
    }
  }

  // ===================== Botón Crear contextual =====================
  function resolveCreateActionByHash(hash) {
    // Normaliza
    const route = (hash || location.hash || '').toLowerCase();

    if (route.startsWith('#/cursos')) {
      if (typeof globalThis.openCursoCreate === 'function') return globalThis.openCursoCreate;
    }
    if (route.startsWith('#/noticias')) {
      if (typeof globalThis.openNoticiaCreate === 'function') return globalThis.openNoticiaCreate;
    }
    if (route.startsWith('#/tutores')) {
      if (typeof globalThis.openTutorCreate === 'function') return globalThis.openTutorCreate;
    }
    if (route.startsWith('#/suscripciones')) {
      if (typeof globalThis.openSuscripcionCreate === 'function') return globalThis.openSuscripcionCreate;
    }
    return null; // no-op
  }

  function bindCreateButtonForCurrentRoute() {
    const $btn = document.querySelector('#btn-add');
    if (!$btn) return;

    // Limpia listeners previos clonando el nodo
    const newBtn = $btn.cloneNode(true);
    $btn.parentNode.replaceChild(newBtn, $btn);

    const action = resolveCreateActionByHash(location.hash);
    if (typeof action === 'function') {
      newBtn.disabled = false;
      newBtn.classList.remove('disabled');
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        action();
      });
    } else {
      // Sin acción disponible en la ruta actual
      newBtn.disabled = true;
      newBtn.classList.add('disabled');
    }
  }

  // Llamar después de cada navegación
  window.addEventListener('hashchange', bindCreateButtonForCurrentRoute);
  // Y también al cargar
  document.addEventListener('DOMContentLoaded', bindCreateButtonForCurrentRoute);

  // Si tu router tiene su propio “onRouteChange”, invoca ahí también:
  if (typeof window.__afterRouteChangeHooks === 'object') {
    window.__afterRouteChangeHooks.push(bindCreateButtonForCurrentRoute);
  }


  // Navegación por clicks (sin recargar)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('.gc-side .nav-item[href^="#/"]');
    if (!a) return;
    e.preventDefault();
    const to = a.getAttribute('href');
    if (to) location.hash = to;
  });

  window.addEventListener('hashchange', onRoute);
  document.addEventListener('DOMContentLoaded', onRoute);
})();
