// admin.router.js (parchado)
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

  // ensureModule robusto: evita reimport innecesario y espera si ya hay <script>
  async function ensureModule(path, globalReadyFlag, dynamicPath) {
    if (globalThis[globalReadyFlag]) return;

    const hasScript = !!document.querySelector(`script[src="${path}"]`);
    if (hasScript) {
      for (let i = 0; i < 10 && !globalThis[globalReadyFlag]; i++) {
        await new Promise(r => setTimeout(r, 30));
      }
      if (globalThis[globalReadyFlag]) return;
    }
    try { await import(dynamicPath); } catch (e) { /* opcional: console.warn(e) */ }
  }

  // ===================== Botón Crear contextual =====================
  function resolveCreateActionByHash(hash) {
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
    return null;
  }

  function bindCreateButtonForCurrentRoute() {
    const $btn = document.querySelector('#btn-add');
    if (!$btn) return;

    // limpia listeners clonando el nodo
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
      newBtn.disabled = true;
      newBtn.classList.add('disabled');
    }
  }

  // expón un arreglo de hooks para ejecutar tras cada navegación
  window.__afterRouteChangeHooks = window.__afterRouteChangeHooks || [];
  window.__afterRouteChangeHooks.push(bindCreateButtonForCurrentRoute);

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
        // Usa flag consistente del módulo
        await ensureModule('/JS/UAT/admin.noticias.js', '__NoticiasState', '/JS/UAT/admin.noticias.js');
        if (typeof globalThis.noticiasInit === 'function') {
          await globalThis.noticiasInit(); // renderiza la lista
        } else if (typeof globalThis.openNoticiaCreate === 'function') {
          // fallback para no dejar la pantalla vacía
          globalThis.openNoticiaCreate();
        } else {
          console.warn('noticiasInit/openNoticiaCreate no disponibles.');
        }
        break;
      }

      case '#/tutores': {
        setTitle('Tutores');
        await ensureModule('/JS/UAT/admin.tutores.js', '__TutoresState', '/JS/UAT/admin.tutores.js');
        if (typeof globalThis.tutoresInit === 'function') {
          await globalThis.tutoresInit(); // listado si existe
        } else if (typeof globalThis.openTutorCreate === 'function') {
          globalThis.openTutorCreate();   // fallback
        } else {
          console.warn('tutoresInit/openTutorCreate no disponibles.');
        }
        break;
      }

      // puedes agregar más rutas aquí (suscripciones, usuarios, etc.)

      default: {
        location.hash = '#/cursos';
        return; // evita ejecutar hooks dos veces
      }
    }

    // Ejecuta hooks posteriores a la navegación (incluye el botón Crear contextual)
    try {
      for (const fn of window.__afterRouteChangeHooks) {
        if (typeof fn === 'function') fn();
      }
    } catch (e) {
      // no rompas navegación por errores de hooks
      console.warn('afterRouteChange hook error:', e);
    }
  }

  // Navegación por clicks (sin recargar)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('.gc-side .nav-item[href^="#/"]');
    if (!a) return;
    e.preventDefault();
    const to = a.getAttribute('href');
    if (to) location.hash = to;
  });

  // Eventos de navegación
  window.addEventListener('hashchange', onRoute);
  document.addEventListener('DOMContentLoaded', () => {
    onRoute();
    // botón crear también al cargar (por si la vista inicial no dispara hooks aún)
    bindCreateButtonForCurrentRoute();
  });
})();
