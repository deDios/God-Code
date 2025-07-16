//------------------------------------------------------------js global-----------------------------------------------------
//este es el menu del subnav
document.addEventListener("DOMContentLoaded", () => {
  const menu = document.querySelector("#submenu-productos .megamenu");
  menu.classList.remove("show");

  const link = document.querySelector("#submenu-productos > a");
  link.addEventListener("click", (e) => {
    e.preventDefault();
    menu.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    const contenedor = document.querySelector("#submenu-productos");
    if (!contenedor.contains(e.target)) {
      menu.classList.remove("show");
    }
  });
});

//esta es la class "animado" que al colocarsela algo le agrega una transicion
document.addEventListener("DOMContentLoaded", () => {
  const animados = document.querySelectorAll(".animado");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  animados.forEach((el) => observer.observe(el));
});

//menu hamburguesa
function toggleMenu() {
  const menu = document.getElementById("mobile-menu");
  menu.classList.toggle("show");
}

//subnav sticky que no se vea feo
document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
});

//notificaciones tipo toast para manejarlas en todas las vistas
(function () {
  if (!document.querySelector(".gc-toast-container")) {
    const contenedor = document.createElement("div");
    contenedor.className = "gc-toast-container";
    document.body.appendChild(contenedor);
  }

  /**
   * notificaciones
   * @param {string} mensaje - El texto que quiero mostrar
   * @param {string} tipo - 'exito' | 'error' | 'warning', por defecto 'exito'
   * @param {number} duracion - Tiempo en milisegundos, por defecto 5000ms (5 segundos)
   */

  window.gcToast = function (mensaje, tipo = "exito", duracion = 5000) {
    const contenedor = document.querySelector(".gc-toast-container");
    if (!contenedor) return;

    const toast = document.createElement("div");
    toast.className = `gc-toast ${tipo}`;
    toast.textContent = mensaje;

    contenedor.appendChild(toast);

    // animacion de entrada
    setTimeout(() => toast.classList.add("mostrar"), 10);

    // ocultar
    setTimeout(() => {
      toast.classList.remove("mostrar");
      setTimeout(() => contenedor.removeChild(toast), 400);
    }, duracion);
  };
})();

document.addEventListener("DOMContentLoaded", () => { // -------- js para cambiar el topbar
  const usuarioCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("usuario="));

  const iconMobile = document.querySelector(".user-icon-mobile");
  const socialIconsContainer = document.querySelector(".social-icons");

  const actionsDesktop = document.querySelector(".actions");
  const userIconDesktop = document.querySelector(".user-icon");
  const btnRegistrarse = actionsDesktop?.querySelector(".btn-primary"); // botón registrarse
  const btnCotizar = actionsDesktop?.querySelector(".btn-outline");

  if (usuarioCookie) {
    try {
      const datos = JSON.parse(decodeURIComponent(usuarioCookie.split("=")[1]));
      const email = datos?.correo || "Usuario";
      const id = datos?.id || "default";
      const rutaImg = `../ASSETS/usuario/usuarioImg/img_user${id}.png`;

      if (!sessionStorage.getItem("bienvenidaMostrada")) {
        gcToast(`Bienvenido, ${datos.nombre || "usuario"}`, "exito");
        sessionStorage.setItem("bienvenidaMostrada", "true");
      }

      if (actionsDesktop) {
        if (btnRegistrarse) btnRegistrarse.remove();

        if (userIconDesktop) userIconDesktop.remove();

        const nuevoIcon = document.createElement("div");
        nuevoIcon.className = "user-icon";
        nuevoIcon.innerHTML = `
          <img src="${rutaImg}" alt="Perfil" title="Ir a perfil"
            onerror="this.onerror=null; this.src='../ASSETS/usuario/usuarioImg/img_user1.png'" />
        `;
        nuevoIcon.addEventListener("click", () => {
          window.location.href = "../VIEW/testLogin.php";
        });

        actionsDesktop.appendChild(nuevoIcon);
      }

      if (socialIconsContainer && iconMobile) {
        iconMobile.remove();

        const nuevoIconMobile = document.createElement("div");
        nuevoIconMobile.className = "user-icon-mobile";
        nuevoIconMobile.innerHTML = `
          <img src="${rutaImg}" alt="Perfil"
            title="Ir a perfil"
            onerror="this.onerror=null; this.src='../ASSETS/usuario/usuarioImg/img_user1.png'" />
        `;
        nuevoIconMobile.addEventListener("click", () => {
          window.location.href = "../VIEW/testLogin.php";
        });

        socialIconsContainer.appendChild(nuevoIconMobile);
      }
    } catch (e) {
      console.warn("Cookie malformada:", e);
    }
  }

  console.log("Bloque de botones dinámicos ejecutado");
});

//---------------------------------------------- MANEJO DE SESIONES
