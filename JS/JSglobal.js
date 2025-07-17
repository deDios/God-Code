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
})(); //------------------ aca termina el js para las notificaciones.

document.addEventListener("DOMContentLoaded", () => {
  //--------------- js para topbar

  const usuarioCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("usuario="));

  const actionsDesktop = document.querySelector(".actions");
  const btnRegistrarse = actionsDesktop?.querySelector(".btn-primary");
  const userIconDesktop = actionsDesktop?.querySelector(".user-icon");

  const socialIconsContainer = document.querySelector(".social-icons");
  const iconMobile = socialIconsContainer?.querySelector(".user-icon-mobile");

  // función para verificar si la imagen del usuario existe
  function verificarImagen(src, callback) {
    const img = new Image();
    img.onload = () => callback(src);
    img.onerror = () => callback("../ASSETS/usuario/usuarioImg/img_user1.png");
    img.src = src;
  }

  if (usuarioCookie) { //------------------------ js para el topbar 
    try {
      const datos = JSON.parse(decodeURIComponent(usuarioCookie.split("=")[1]));
      const email = datos.correo || "Usuario";
      const id = datos.id || "1";
      const ruta = `../ASSETS/usuario/usuarioImg/img_user${id}.png`;

      // mensaje de bienvenida que solo se activa una vez, el cual de momento no se esta mostrando
      if (!sessionStorage.getItem("bienvenidaMostrada")) {
        gcToast(`Bienvenido, ${datos.nombre || "usuario"}`, "exito");
        sessionStorage.setItem("bienvenidaMostrada", "true");
      }

      verificarImagen(ruta, (rutaFinal) => {
        // DESKTOP
        if (actionsDesktop) {
          btnRegistrarse?.remove();
          userIconDesktop?.remove();

          const nuevo = document.createElement("div");
          nuevo.className = "user-icon";
          nuevo.innerHTML = `
            <span class="user-email">${email}</span>
            <img src="${rutaFinal}" alt="Perfil" title="Perfil" />

            <div class="user-menu" id="user-menu">
              <ul>
                <li onclick="window.location.href='index.php'">
                  <img src="../ASSETS/usuario/usuarioSubmenu/homebtn.png" /> Ir a Home
                </li>
                <li id="btn-logout">
                  <img src="../ASSETS/usuario/usuarioSubmenu/logoutbtn.png" alt="logout" /> Logout
                </li>
              </ul>
            </div>
          `;

          // muestra o oculta el submenu
          nuevo.addEventListener("click", (e) => {
            e.stopPropagation();
            const menu = nuevo.querySelector("#user-menu");
            menu.style.display = menu.style.display === "block" ? "none" : "block";
          });

          // en dado caso de que se de un click afuera del menu este se va a cerrar
          document.addEventListener("click", () => {
            const menu = document.querySelector("#user-menu");
            if (menu) menu.style.display = "none";
          });

          // boton de logout
          setTimeout(() => {
            const btnLogout = document.getElementById("btn-logout");
            btnLogout?.addEventListener("click", () => {
              document.cookie = "usuario=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
              sessionStorage.removeItem("bienvenidaMostrada");
              window.location.reload();
            });
          }, 100);

          actionsDesktop.appendChild(nuevo);
          actionsDesktop.classList.add("mostrar");
        }

        // MOBILE
        if (socialIconsContainer && iconMobile) {
          iconMobile.remove();

          const nuevoMob = document.createElement("div");
          nuevoMob.className = "user-icon-mobile";
          nuevoMob.innerHTML = `
            <img src="${rutaFinal}" alt="Perfil" title="Perfil" />
          `;
          nuevoMob.addEventListener("click", () => {
            window.location.href = "../VIEW/testLogin.php";
          });

          socialIconsContainer.appendChild(nuevoMob);
          nuevoMob.classList.add("mostrar");
        }
      });

    } catch (e) {
      console.warn("Cookie malformada:", e);
    }
  } else {
    //cuando no este logeado el usuario estara el icono de perfil que redirecciona a la view de login
    actionsDesktop?.classList.add("mostrar");
    iconMobile?.classList.add("mostrar");
  }

  console.log("Se ejecutó todo el bloque para el topbar");
}); //------------------------- aca termina el js para el topbar

//--------------- aca estara el js para el manejo de seciones 