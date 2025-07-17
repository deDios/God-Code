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

if (usuarioCookie) {
  //------------------------ js para el topbar
  try {
    const datos = JSON.parse(decodeURIComponent(usuarioCookie.split("=")[1]));
    const email = datos.correo || "Usuario";
    const id = datos.id || "1";
    const ruta = `../ASSETS/usuario/usuarioImg/img_user${id}.png`;

    // mensaje de bienvenida que solo se activa una vez
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
          <img src="${rutaFinal}" alt="Perfil" title="Perfil" class="img-perfil" />

          <div class="dropdown-menu" id="user-dropdown">
            <ul>
              <li onclick="window.location.href='index.php'">
                <img src="../ASSETS/usuario/usuarioSubmenu/homebtn.png" alt="home" /> Ir a Home
              </li>
              <li id="logout-btn">
                <img src="../ASSETS/usuario/usuarioSubmenu/logoutbtn.png" alt="logout" /> Logout
              </li>
            </ul>
          </div>
        `;

        actionsDesktop.appendChild(nuevo);
        actionsDesktop.classList.add("mostrar");

        // js para el submenu
        const userDropdown = nuevo.querySelector("#user-dropdown");

        nuevo.addEventListener("click", (e) => {
          e.stopPropagation();
          userDropdown.classList.toggle("active");
        });

        document.addEventListener("click", () => {
          userDropdown.classList.remove("active");
        });

        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            userDropdown.classList.remove("active");
          }
        });

        // boton de logout
        const btnLogout = nuevo.querySelector("#logout-btn");
        btnLogout?.addEventListener("click", () => {
          document.cookie =
            "usuario=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
          sessionStorage.removeItem("bienvenidaMostrada");
          window.location.reload();
        });
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
  // cuando no hay usuario logeado muestra el icono de perfil por default (desktop)
  if (actionsDesktop) {
    actionsDesktop.querySelector(".user-icon")?.remove();

    const iconoLogin = document.createElement("div");
    iconoLogin.className = "user-icon";
    iconoLogin.innerHTML = `
      <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
           alt="Usuario" title="Iniciar sesión" class="img-perfil" />
    `;
    iconoLogin.addEventListener("click", () => {
      window.location.href = "../VIEW/Login.php";
    });

    actionsDesktop.appendChild(iconoLogin);
    actionsDesktop.classList.add("mostrar");
  }

  // MOBILE
  if (iconMobile) {
    iconMobile.classList.add("mostrar");
  }
}

console.log("Se ejecutó todo el bloque para el topbar");

//--------------- aca estara el js para el manejo de seciones
