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
      threshold: 0.2
      
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

//--------------------------- notificaciones tipo toast para manejarlas en todas las vistas
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
})(); //------------------ aca termina el js para las notificaciones

document.addEventListener("DOMContentLoaded", () => {
  const usuarioCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("usuario="));

  const actionsDesktop = document.querySelector(".actions");
  const btnRegistrarse = actionsDesktop?.querySelector(".btn-primary");
  const userIconDesktop = actionsDesktop?.querySelector(".user-icon");
  const socialIconsContainer = document.querySelector(".social-icons");

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

          const userDropdown = nuevo.querySelector("#user-dropdown");
          nuevo.addEventListener("click", (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle("active");
          });
          document.addEventListener("click", () =>
            userDropdown.classList.remove("active")
          );
          document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") userDropdown.classList.remove("active");
          });

          const btnLogout = nuevo.querySelector("#logout-btn");
          btnLogout?.addEventListener("click", () => {
            document.cookie =
              "usuario=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            sessionStorage.removeItem("bienvenidaMostrada");
          });
        }

        // MOBILE
        if (socialIconsContainer) {
          const iconoPrevio =
            socialIconsContainer.querySelector(".user-icon-mobile");
          if (iconoPrevio) iconoPrevio.remove();

          const nuevoMob = document.createElement("div");
          nuevoMob.className = "user-icon-mobile";
          nuevoMob.innerHTML = `
            <img src="${rutaFinal}" alt="Perfil" title="Perfil" />
          `;
          socialIconsContainer.appendChild(nuevoMob);

          const dropdownMobile = document.createElement("div");
          dropdownMobile.className = "dropdown-menu mobile";
          dropdownMobile.id = "user-dropdown-mobile";
          dropdownMobile.innerHTML = `
            <ul>
              <li onclick="window.location.href='../VIEW/Home.php'">
                <img src="../ASSETS/usuario/usuarioSubmenu/homebtn.png" alt="home" /> Ir a Home
              </li>
              <li id="logout-btn-mobile">
                <img src="../ASSETS/usuario/usuarioSubmenu/logoutbtn.png" alt="logout" /> Logout
              </li>
            </ul>
          `;
          document.body.appendChild(dropdownMobile);

          nuevoMob.querySelector("img").addEventListener("click", (e) => {
            e.stopPropagation();
            const rect = nuevoMob.getBoundingClientRect();
            dropdownMobile.style.top = `${rect.bottom + window.scrollY}px`;
            dropdownMobile.style.left = `${rect.right - 180}px`;
            dropdownMobile.classList.toggle("active");
          });

          document.addEventListener("click", () => {
            dropdownMobile.classList.remove("active");
          });

          document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") dropdownMobile.classList.remove("active");
          });

          const btnLogoutMobile =
            dropdownMobile.querySelector("#logout-btn-mobile");
          btnLogoutMobile?.addEventListener("click", () => {
            document.cookie =
              "usuario=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            sessionStorage.removeItem("bienvenidaMostrada");
            window.location.href = "../VIEW/Login.php";
          });
        }
      });
    } catch (e) {
      console.warn("Cookie malformada:", e);
    }
  } else {
    // usuario no logeado
    if (actionsDesktop) {
      actionsDesktop.querySelector(".user-icon")?.remove();
      const iconoLogin = document.createElement("div");
      iconoLogin.className = "user-icon";
      iconoLogin.innerHTML = `
        <img src="../ASSETS/usuario/usuarioImg/img_user1.png"
             alt="Usuario" title="Iniciar sesión" class="img-perfil" />
      `;
      iconoLogin.addEventListener("click", () => {
        window.location.href = "../VIEW/Login.php";
      });
      actionsDesktop.appendChild(iconoLogin);
      actionsDesktop.classList.add("mostrar");
    }
  }

  console.log("Se ejecutó todo el bloque para el topbar");
});









//------------------------------- js para el subnav
document.addEventListener("DOMContentLoaded", () => {
  const operativeViews = [
    "home.php",
    "admin.php",
    // "vistaOperativa3.php",
  ];
  const currentPage = window.location.pathname.split("/").pop().toLowerCase();
  const subnavs = Array.from(document.querySelectorAll("#header .subnav"));

  subnavs.forEach((nav) => (nav.dataset.originalHtml = nav.innerHTML));

  const socialMarkup = `
    <div class="social-icons">
      <div class="circle-icon"><img src="../ASSETS/index/Facebook.png" alt="Facebook" /></div>
      <div class="circle-icon"><img src="../ASSETS/index/Instagram.png" alt="Instagram" /></div>
      <div class="circle-icon"><img src="../ASSETS/index/Tiktok.png" alt="TikTok" /></div>
    </div>
  `;

  if (operativeViews.includes(currentPage)) {
    const mk = (label) => {
      const slug = label.toLowerCase() + ".php";
      const active = slug === currentPage ? "active" : "";
      return `<a href="${slug}" class="${active}">${label}</a>`;
    };
    const markup = `
      ${mk("Home")}
      ${mk("Proyectos")}
      ${mk("Cursos")}
      ${mk("Admin")}
      ${socialMarkup}
    `;
    subnavs.forEach((nav) => (nav.innerHTML = markup));
  } else {
    subnavs.forEach((nav) => (nav.innerHTML = nav.dataset.originalHtml));
  }

  const submenu = document.getElementById("submenu-productos");
  if (submenu) {
    const mega = submenu.querySelector(".megamenu");
    if (mega) {
      mega.classList.remove("show");
      let link = null;
      for (const ch of submenu.children) {
        if (ch.tagName === "A") {
          link = ch;
          break;
        }
      }
      if (link) {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          mega.classList.toggle("show");
        });
      }
      document.addEventListener("click", (e) => {
        if (!submenu.contains(e.target)) {
          mega.classList.remove("show");
        }
      });
    }
  }

  const logoBtn = document.getElementById("logo-btn");
  if (logoBtn) {
    logoBtn.style.cursor = "pointer";
    logoBtn.addEventListener("click", () => {
      window.location.href = "/index.php";
    });
  }

  const socialMap = {
    tiktok: "https://www.tiktok.com/@godcodemx",
    instagram: "https://www.instagram.com/god_code_mx/",
    facebook: "https://www.facebook.com/profile.php?id=61578204608103",
  };

  setTimeout(() => {
    const socialIcons = document.querySelectorAll(
      "#header .icon-mobile, #header .circle-icon"
    );
    socialIcons.forEach((el) => {
      const img = el.querySelector("img") || el;
      if (!img) return;
      const key = img.alt ? img.alt.trim().toLowerCase() : "";
      const url = socialMap[key];
      if (!url) return;
      el.style.cursor = "pointer";
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        window.open(url, "_blank", "noopener");
      });
    });
  }, 0);
});










//----------------- insertar iconos de redes sociales
document.addEventListener("DOMContentLoaded", () => {
  const socialMap = {
    tiktok: "https://www.tiktok.com/@godcodemx",
    instagram: "https://www.instagram.com/god_code_mx/",
    facebook: "https://www.facebook.com/profile.php?id=61578204608103",
  };

  const socialIcons = document.querySelectorAll(".icon-mobile, .circle-icon");

  socialIcons.forEach((el) => {
    const img = el.querySelector("img") || el;
    if (!img) return;
    const key = img.alt ? img.alt.trim().toLowerCase() : "";
    const url = socialMap[key];
    if (!url) return;
    el.style.cursor = "pointer";
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      window.open(url, "_blank", "noopener");
    });
  });
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

// botones inhabilitados del subnav
document.addEventListener("DOMContentLoaded", () => {
  const operativeViews = [
    "home.php",
    "vistaoperativa2.php",
    "vistaoperativa3.php",
  ];

  const currentPage = window.location.pathname.split("/").pop().toLowerCase();

  if (!operativeViews.includes(currentPage)) return;

  const deshabilitados = ["Proyectos", "Cursos", "Admin"];

  deshabilitados.forEach((nombre) => {
    const btn = Array.from(document.querySelectorAll("#header .subnav a")).find(
      (a) => a.textContent.trim().toLowerCase() === nombre.toLowerCase()
    );

    if (btn) {
      btn.href = "#";
      btn.dataset.disabled = "true";

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.gcToast) {
          gcToast("Función deshabilitada", "warning");
        } else {
          alert("Función deshabilitada");
        }
      });
    }
  });
});


