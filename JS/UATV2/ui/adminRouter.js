(function (window, document) {
  //JS/UATV2/ui/adminRouter.js
  // ajustar con la nueva plantilla de godcode, este es el router
  // que ayudara a cambiar entre los modulos de admin.
  "use strict";

  const STORAGE_KEY = "admin_active_view";

  const VIEWS = {
    noticias: {
      init: () => window.AdminNoticias?.init?.() || Promise.resolve(),
      render: () => window.AdminNoticias?.render?.() || unavailable("Noticias"),
      bind: () => window.AdminNoticias?.bind?.() || null,
    },

    cursos: {
      init: () => window.AdminCursos?.init?.() || Promise.resolve(),
      render: () => window.AdminCursos?.render?.() || unavailable("Cursos"),
      bind: () => window.AdminCursos?.bind?.() || null,
    },

    tutores: {
      init: () => window.AdminTutores?.init?.() || Promise.resolve(),
      render: () => window.AdminTutores?.render?.() || unavailable("Tutores"),
      bind: () => window.AdminTutores?.bind?.() || null,
    },

    Suscripciones: {
      init: () => window.AdminSuscripciones?.init?.() || Promise.resolve(),
      render: () => window.AdminSuscripciones?.render?.() || unavailable("Suscripciones"),
      bind: () => window.AdminSuscripciones?.bind?.() || null,
    },
  };

  function unavailable(nombre) {
    return `
    <div class="admin-module">
      <div class="admin-placeholder">
        <div class="admin-placeholder__inner">
          <h2 class="admin-placeholder__title">${nombre} no disponible</h2>
          <p class="admin-placeholder__text">No se pudo cargar el módulo de ${nombre.toLowerCase()}.</p>
        </div>
      </div>
    </div>
  `;
  }

  const state = {
    root: null,
    navItems: [],
    currentView: null,
    isMounting: false,
  };

  function getViewNameFromItem(item) {
    return item?.dataset?.adminView?.trim() || "";
  }

  function isValidView(viewName) {
    return Boolean(viewName && VIEWS[viewName]);
  }

  function saveCurrentView(viewName) {
    if (!isValidView(viewName)) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, viewName);
    } catch (error) {
      console.warn("[AdminRouter] No se pudo guardar la vista activa.", error);
    }
  }

  function getSavedView() {
    try {
      const savedView = window.localStorage.getItem(STORAGE_KEY);
      return isValidView(savedView) ? savedView : null;
    } catch (error) {
      console.warn("[AdminRouter] No se pudo leer la vista guardada.", error);
      return null;
    }
  }

  function setActiveItem(viewName) {
    state.navItems.forEach((item) => {
      const isActive = getViewNameFromItem(item) === viewName;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-current", isActive ? "page" : "false");
    });
  }

  function setNavDisabled(disabled) {
    state.navItems.forEach((item) => {
      item.style.pointerEvents = disabled ? "none" : "";
      item.setAttribute("aria-disabled", disabled ? "true" : "false");
    });
  }

  async function mountView(viewName) {
    if (!state.root) {
      console.warn("[AdminRouter] No existe #admin-view-root.");
      return;
    }

    const view = VIEWS[viewName];

    if (!view) {
      console.warn(`[AdminRouter] Vista no registrada: ${viewName}`);
      return;
    }

    if (state.isMounting) return;

    state.isMounting = true;
    setNavDisabled(true);

    try {
      if (typeof view.init === "function") {
        await view.init();
      }

      state.root.innerHTML = view.render();
      state.currentView = viewName;
      setActiveItem(viewName);
      saveCurrentView(viewName);

      if (typeof view.bind === "function") {
        view.bind();
      }
    } catch (error) {
      console.error(`[AdminRouter] Error al montar la vista "${viewName}":`, error);

      state.root.innerHTML = `
        <div class="admin-module">
          <div class="admin-placeholder">
            <div class="admin-placeholder__inner">
              <h2 class="admin-placeholder__title">No se pudo cargar la vista</h2>
              <p class="admin-placeholder__text">
                Ocurrió un problema al montar el módulo de administración.
              </p>
            </div>
          </div>
        </div>
      `;
    } finally {
      state.isMounting = false;
      setNavDisabled(false);
    }
  }

  function onNavClick(event) {
    const item = event.target.closest(".admin-panel__item");
    if (!item) return;

    event.preventDefault();

    const viewName = getViewNameFromItem(item);
    if (!viewName || viewName === state.currentView) return;

    mountView(viewName);
  }

  function wireNav() {
    state.navItems.forEach((item) => {
      item.addEventListener("click", onNavClick);
    });
  }

  function init(options = {}) {
    const {
      rootSelector = "#admin-view-root",
      navSelector = ".admin-panel__item",
      defaultView = "noticias",
    } = options;

    state.root = document.querySelector(rootSelector);
    state.navItems = Array.from(document.querySelectorAll(navSelector));

    if (!state.root) {
      console.warn("[AdminRouter] Root no encontrado.");
      return;
    }

    if (!state.navItems.length) {
      console.warn("[AdminRouter] No se encontraron items del menú admin.");
    }

    wireNav();

    const initialView = getSavedView() || defaultView;
    mountView(initialView);
  }

  window.AdminRouter = {
    init,
    mountView,
    getCurrentView: () => state.currentView,
  };
})(window, document);