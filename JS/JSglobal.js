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

document.addEventListener("DOMContentLoaded", () => {
  const usuarioCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("usuario="));

  if (usuarioCookie) {
    // Ocultar botones de "Registrarse"
    const btnDesktop = document.querySelector(".btn-registrarse-desktop");
    const iconMobile = document.querySelector(".user-icon-mobile");
    if (btnDesktop) btnDesktop.style.display = "none";

    // Mostrar correo + icono en desktop
    const perfilContenedor = document.getElementById("perfil-usuario-desktop");
    try {
      const datos = JSON.parse(decodeURIComponent(usuarioCookie.split("=")[1]));
      const email = datos?.correo || "Usuario";
      const id = datos?.id || "default";
      const rutaImg = `../ASSETS/usuario/usuarioImg/img_user${id}.png`;

      if (perfilContenedor) {
        perfilContenedor.innerHTML = `
          <span>${email}</span>
          <img src="${rutaImg}" alt="Perfil" title="Ir a perfil" onerror="this.src='../ASSETS/usuario/usuarioImg/img_user_noEncontrado.png'" />
        `;

        perfilContenedor.addEventListener("click", () => {
          window.location.href = "../VIEW/Perfil.php"; //---------------------- redirecciones este es el de desktop
        });
      }

      if (iconMobile) {
        iconMobile.addEventListener("click", () => {
          window.location.href = "../VIEW/Perfil.php";
        });
      }
    } catch (e) {
      console.warn("Cookie malformada:", e);
    }
  }
});

//---------------------------------------------- MANEJO DE SESIONES
