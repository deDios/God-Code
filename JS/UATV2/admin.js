(function () {
    //JS/UATV2/admin.js
  "use strict";

  function bootAdmin() {
    if (!window.AdminRouter || typeof window.AdminRouter.init !== "function") {
      console.warn("[admin.js] AdminRouter no está disponible.");
      return;
    }

    window.AdminRouter.init({
      rootSelector: "#admin-view-root",
      navSelector: ".admin-panel__item",
      defaultView: "carrusel",
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootAdmin);
  } else {
    bootAdmin();
  }
})();