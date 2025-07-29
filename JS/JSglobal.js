//------------------------------------------------------------js global-----------------------------------------------------

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

  if (usuarioCookie) {
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
              <li onclick="window.location.href='../VIEW/Home.php'">
                <img src="../ASSETS/usuario/usuarioSubmenu/homebtn.png" alt="home" /> Ir a Home
              </li>
              <li id="logout-btn" onclick="window.location.href='../VIEW/Login.php'">
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
});

//--------------- deshabilitar el href de cotizar
document.addEventListener("DOMContentLoaded", () => {
  // deshabilitar boton "Cotizar"
  const cotizarBtn = document.querySelector(".actions .btn-outline");
  if (cotizarBtn) {
    cotizarBtn.removeAttribute("onclick");
    cotizarBtn.addEventListener("click", (e) => {
      e.preventDefault();
      gcToast("Función deshabilitada", "warning", 4000);
    });
  }
});

//------------------------------- js para el subnav
document.addEventListener("DOMContentLoaded", () => {
  const operativeViews = ["home.php" /* , "vista2.php", "vista3.php" */]; // estas son las vistas operativas
  const subnavs = Array.from(document.querySelectorAll("#header .subnav"));

  subnavs.forEach(nav => {
    nav.dataset.originalHtml = nav.innerHTML;
  });

  const currentPage = window.location.pathname
    .split("/")
    .pop()
    .toLowerCase();

  if (operativeViews.includes(currentPage)) {
    const mk = label => {
      const slug = label.toLowerCase() + ".php";
      const isActive = slug === currentPage;
      return `<a href="${slug}" class="${isActive ? "active" : ""}">${label}</a>`;
    };
    const markup = `
      ${mk("Home")}
      ${mk("Proyectos")}
      ${mk("Cursos")}
      ${mk("Admin")}
    `;
    subnavs.forEach(nav => nav.innerHTML = markup);

  } else {
    subnavs.forEach(nav => nav.innerHTML = nav.dataset.originalHtml);
  }

  const submenu = document.getElementById("submenu-productos");
  if (submenu) {
    const mega = submenu.querySelector(".megamenu");
    let link = null;
    for (const ch of submenu.children) {
      if (ch.tagName === "A") {
        link = ch;
        break;
      }
    }
    if (mega && link) {
      mega.classList.remove("show");

      link.addEventListener("click", e => {
        e.preventDefault();
        mega.classList.toggle("show");
      });

      document.addEventListener("click", e => {
        if (!submenu.contains(e.target)) {
          mega.classList.remove("show");
        }
      });
    }
  }
});
