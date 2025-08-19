//------------------------------------------------------------js global-----------------------------------------------------

// Mini helper para vh en móviles (evita saltos raros al abrir teclado)
(function setVH() {
  const apply = () =>
    document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
  apply();
  window.addEventListener("resize", apply);
})();

document.addEventListener("DOMContentLoaded", () => {
  const animados = document.querySelectorAll(".animado");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  animados.forEach((el) => io.observe(el));
});

// ---- menú hamburguesa mobile
function toggleMenu() {
  const menu = document.getElementById("mobile-menu");
  menu?.classList.toggle("show");
}

// ---- header sticky
document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > 50) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll);
});

// --------------------------- toasts globales (gcToast)
(function () {
  if (!document.querySelector(".gc-toast-container")) {
    const cont = document.createElement("div");
    cont.className = "gc-toast-container";
    document.body.appendChild(cont);
  }
  // uso: gcToast("Listo", "exito" | "error" | "warning", 5000)
  window.gcToast = function (mensaje, tipo = "exito", duracion = 5000) {
    const cont = document.querySelector(".gc-toast-container");
    if (!cont) return;

    const toast = document.createElement("div");
    toast.className = `gc-toast ${tipo}`;
    toast.textContent = mensaje;

    cont.appendChild(toast);
    setTimeout(() => toast.classList.add("mostrar"), 10);

    setTimeout(() => {
      toast.classList.remove("mostrar");
      setTimeout(() => cont.removeChild(toast), 400);
    }, duracion);
  };
})();

// --------------------------------- Topbar
document.addEventListener("DOMContentLoaded", () => {
  // helpers chiquitos
  const getUsuarioFromCookie = () => {
    try {
      const m = document.cookie.match(/(?:^|;\s*)usuario=([^;]+)/);
      return m ? JSON.parse(decodeURIComponent(m[1])) : {};
    } catch {
      return {};
    }
  };
  const verificarImagen = (src, cb) => {
    const img = new Image();
    img.onload = () => cb(src);
    img.onerror = () => cb("../ASSETS/usuario/usuarioImg/img_user1.png");
    img.src = src;
  };

  // refs del topbar
  const actionsDesktop = document.querySelector(".actions");
  const btnRegistrarse = actionsDesktop?.querySelector(".btn-primary");
  const userIconDesktop = actionsDesktop?.querySelector(".user-icon");
  const socialIconsContainer = document.querySelector(".social-icons");

  // user cookie
  const datos = getUsuarioFromCookie();
  const email = datos.correo || "Usuario";
  const id = datos.id || "1";
  const avatarUrlCookie = datos.avatarUrl || ""; // si subió avatar, el endpoint devolvió url y la guardamos en cookie
  const rutaLegacy = `../ASSETS/usuario/usuarioImg/img_user${id}.png`;
  const fallback = "../ASSETS/usuario/usuarioImg/img_user1.png";

  // --- Desktop: muestra avatar real si existe
  if (actionsDesktop) {
    btnRegistrarse?.remove();
    userIconDesktop?.remove();

    const setDesktopUI = (rutaFinal) => {
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

      const dd = nuevo.querySelector("#user-dropdown");
      nuevo.addEventListener("click", (e) => {
        e.stopPropagation();
        dd.classList.toggle("active");
      });
      document.addEventListener("click", () => dd.classList.remove("active"));
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") dd.classList.remove("active");
      });

      const btnLogout = nuevo.querySelector("#logout-btn");
      btnLogout?.addEventListener("click", () => {
        document.cookie = "usuario=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        sessionStorage.removeItem("bienvenidaMostrada");
      });
    };

    if (!sessionStorage.getItem("bienvenidaMostrada") && (datos.nombre || datos.correo)) {
      window.gcToast?.(`Bienvenido, ${datos.nombre || "usuario"}`, "exito");
      sessionStorage.setItem("bienvenidaMostrada", "true");
    }

    if (avatarUrlCookie) {
      // pruebo avatarUrl; si truena, pruebo legacy
      verificarImagen(avatarUrlCookie + "?t=" + Date.now(), (urlOk1) => {
        if (urlOk1.includes("img_user1.png")) {
          verificarImagen(rutaLegacy, (urlOk2) => setDesktopUI(urlOk2));
        } else {
          setDesktopUI(urlOk1);
        }
      });
    } else {
      verificarImagen(rutaLegacy, (urlOk) => setDesktopUI(urlOk));
    }
  }

  // --- Header mobile (este se manteine igual, osea con la img por default)
  if (socialIconsContainer) {
    socialIconsContainer.querySelector(".user-icon-mobile")?.remove();

    const nuevoMob = document.createElement("div");
    nuevoMob.className = "user-icon-mobile";
    nuevoMob.innerHTML = `<img src="${fallback}" alt="Perfil" title="Perfil" />`;
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

    document.addEventListener("click", () => dropdownMobile.classList.remove("active"));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") dropdownMobile.classList.remove("active");
    });

    dropdownMobile.querySelector("#logout-btn-mobile")?.addEventListener("click", () => {
      document.cookie = "usuario=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      sessionStorage.removeItem("bienvenidaMostrada");
      window.location.href = "../VIEW/Login.php";
    });
  }

  // Usuario NO logueado (desktop)
  if (!datos || (!datos.correo && !datos.nombre)) {
    if (actionsDesktop) {
      actionsDesktop.querySelector(".user-icon")?.remove();
      const iconoLogin = document.createElement("div");
      iconoLogin.className = "user-icon";
      iconoLogin.innerHTML = `
        <img src="${fallback}" alt="Usuario" title="Iniciar sesión" class="img-perfil" />
      `;
      iconoLogin.addEventListener("click", () => (window.location.href = "../VIEW/Login.php"));
      actionsDesktop.appendChild(iconoLogin);
      actionsDesktop.classList.add("mostrar");
    }
  }

  console.log("Topbar listo: desktop usa avatar real si existe; header mobile siempre default.");
});

// --------------------------------- Subnav dinámico + megamenu + social + logo
document.addEventListener("DOMContentLoaded", () => {
  
  const operativeViews = ["home.php", "admin.php"];
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

  // megamenu Productos
  const submenu = document.getElementById("submenu-productos");
  if (submenu) {
    const mega = submenu.querySelector(".megamenu");
    if (mega) {
      mega.classList.remove("show");
      const link = [...submenu.children].find((c) => c.tagName === "A");
      if (link) {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          mega.classList.toggle("show");
        });
      }
      document.addEventListener("click", (e) => {
        if (!submenu.contains(e.target)) mega.classList.remove("show");
      });
    }
  }

  // logo a index
  const logoBtn = document.getElementById("logo-btn");
  if (logoBtn) {
    logoBtn.style.cursor = "pointer";
    logoBtn.addEventListener("click", () => (window.location.href = "/index.php"));
  }

  // enlaces a redes
  const socialMap = {
    tiktok: "https://www.tiktok.com/@godcodemx",
    instagram: "https://www.instagram.com/god_code_mx/",
    facebook: "https://www.facebook.com/profile.php?id=61578204608103",
  };
  const socialIcons = document.querySelectorAll("#header .icon-mobile, #header .circle-icon");
  socialIcons.forEach((el) => {
    const img = el.querySelector("img") || el;
    if (!img) return;
    const key = (img.alt || "").trim().toLowerCase();
    const url = socialMap[key];
    if (!url) return;
    el.style.cursor = "pointer";
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      window.open(url, "_blank", "noopener");
    });
  });
});

// --------------------------------- Cotizar deshabilitado 
document.addEventListener("DOMContentLoaded", () => {
  const cotizarBtn = document.querySelector(".actions .btn-outline");
  if (cotizarBtn) {
    cotizarBtn.removeAttribute("onclick");
    cotizarBtn.addEventListener("click", (e) => {
      e.preventDefault();
      gcToast("Función deshabilitada", "warning", 4000);
    });
  }
});

// --------------------------------- Botones del subnav deshabilitados en vistas demo
document.addEventListener("DOMContentLoaded", () => {
  const operativeViews = ["home.php", "vistaoperativa2.php", "vistaoperativa3.php"];
  const currentPage = window.location.pathname.split("/").pop().toLowerCase();
  if (!operativeViews.includes(currentPage)) return;

  const deshabilitados = ["Proyectos", "Cursos", "Admin"];
  deshabilitados.forEach((nombre) => {
    const btn = Array.from(document.querySelectorAll("#header .subnav a")).find(
      (a) => a.textContent.trim().toLowerCase() === nombre.toLowerCase()
    );
    if (!btn) return;
    btn.href = "#";
    btn.dataset.disabled = "true";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.gcToast ? gcToast("Función deshabilitada", "warning") : alert("Función deshabilitada");
    });
  });
});


