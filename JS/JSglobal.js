//------------------------------------------------------------ js global -----------------------------------------------------
(() => {
  if (window.__gcGlobalInit) return;
  window.__gcGlobalInit = true;

  // -------------------- helpers de paths --------------------
  const PATHS = window.GC_PATHS || {
    ASSETS: "/ASSETS",
    VIEWS: "/VIEW",
    ROUTES: { home: "../VIEW/Home.php", login: "/VIEW/Login.php" },
    DEFAULT_AVATAR: "/ASSETS/usuario/usuarioImg/img_user1.png",
  };

  const abs = (p) => new URL(p, window.location.origin).pathname;
  const join = (...parts) =>
    parts
      .filter(Boolean)
      .map((s, i) =>
        i === 0 ? s.replace(/\/+$/g, "") : s.replace(/^\/+|\/+$/g, "")
      )
      .join("/")
      .replace(/\/{2,}/g, "/");

  const asset = (sub) => abs(join(PATHS.ASSETS, sub));
  const view = (sub) => abs(join(PATHS.VIEWS, sub));
  const routeHome = PATHS.ROUTES?.home
    ? abs(PATHS.ROUTES.home)
    : view("Home.php");
  const routeLogin = PATHS.ROUTES?.login
    ? abs(PATHS.ROUTES.login)
    : view("Login.php");
  const DEFAULT_AVATAR = abs(
    PATHS.DEFAULT_AVATAR || "/ASSETS/usuario/usuarioImg/img_user1.png"
  );

  // -------------------- funcion para obtener el usuario desde la cookie --------------------
  function getUsuarioFromCookie() {
    try {
      const m = document.cookie.match(/(?:^|;\s*)usuario=([^;]+)/);
      return m ? JSON.parse(decodeURIComponent(m[1])) : null;
    } catch {
      return null;
    }
  }

  function setUsuarioCookie(patch) {
    const prev = getUsuarioFromCookie() || {};
    const next = { ...prev, ...patch };
    document.cookie =
      "usuario=" +
      encodeURIComponent(JSON.stringify(next)) +
      "; path=/; max-age=86400; samesite=lax";
    return next;
  }

  function withBust(url) {
    try {
      const u = new URL(url, window.location.origin);
      u.searchParams.set("v", Date.now().toString());
      return u.pathname + "?" + u.searchParams.toString();
    } catch {
      return url + (url.includes("?") ? "&" : "?") + "v=" + Date.now();
    }
  }

  function setImgWithExtFallback(
    imgEl,
    bases,
    { extOrder = ["png", "jpg"], placeholder, cacheBust = true } = {}
  ) {
    const isAbsolute = (u) => /^https?:\/\//i.test(u) || u.startsWith("/");
    const hasExt = (u) => /\.[a-zA-Z0-9]{2,5}(\?|#|$)/.test(u);

    const queue = [];
    const baseArr = Array.isArray(bases) ? bases : [bases];

    baseArr.forEach((b) => {
      if (!b) return;
      if (hasExt(b)) {
        queue.push(b);
      } else {
        extOrder.forEach((ext) => queue.push(`${b}.${ext}`));
      }
    });

    let i = 0;
    const tryNext = () => {
      if (i >= queue.length) {
        if (placeholder) {
          imgEl.onerror = null;
          imgEl.src = cacheBust ? withBust(placeholder) : placeholder;
        }
        return;
      }
      const url = queue[i++];
      imgEl.onerror = tryNext;
      imgEl.onload = () => {
        imgEl.dataset.srcResolved = url;
        imgEl.onerror = null;
      };
      const finalUrl = cacheBust && isAbsolute(url) ? withBust(url) : url;
      imgEl.src = finalUrl;
    };

    tryNext();
  }

  function setAvatarSrc(imgEl, usuario) {
    const ASSETS_BASE = "/ASSETS/usuario/usuarioImg";
    const DEFAULT_URL = DEFAULT_AVATAR;

    const cookieUrl = usuario?.avatarUrl || usuario?.avatar || null; 
    const id = usuario?.id != null ? String(usuario.id).trim() : null;

    const basesSinExt = id
      ? [`${ASSETS_BASE}/user_${id}`, `${ASSETS_BASE}/img_user${id}`]
      : [];

    const primary = cookieUrl
      ? /\.[a-zA-Z0-9]{2,5}(\?|#|$)/.test(cookieUrl)
        ? [cookieUrl]
        : [cookieUrl]
      : [];

    const candidates = [
      ...primary,
      ...basesSinExt,
      DEFAULT_URL, 
    ];

    setImgWithExtFallback(imgEl, candidates, {
      extOrder: ["png", "jpg"], // si luego se necesitan mas formatos se agrega
      placeholder: DEFAULT_URL,
      cacheBust: true,
    });

    imgEl.alt = usuario?.nombre || "Avatar";
    imgEl.loading = "lazy";
  }

  const applyVH = () =>
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight * 0.01}px`
    );
  applyVH();
  window.addEventListener("resize", applyVH);

  // -------------------- animacion (.animado) (de momento solo hay un tipo de animacion)--------------------
  document.addEventListener("DOMContentLoaded", () => {
    const animados = document.querySelectorAll(".animado");
    if (!animados.length) return;
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

  // -------------------- menu hamburguesa --------------------
  window.toggleMenu = function toggleMenu() {
    const menu = document.getElementById("mobile-menu");
    if (menu) menu.classList.toggle("show");
  };

  // -------------------- header sticky --------------------
  document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("header");
    if (!header) return;
    const onScroll = () =>
      window.scrollY > 50
        ? header.classList.add("scrolled")
        : header.classList.remove("scrolled");
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  });

  // --------------------------- toasts globales ---------------------------
  (function ensureToastContainer() {
    if (!document.querySelector(".gc-toast-container")) {
      const cont = document.createElement("div");
      cont.className = "gc-toast-container";
      document.body.appendChild(cont);
    }
    window.gcToast = function (mensaje, tipo = "exito", duracion = 5000) {
      const cont = document.querySelector(".gc-toast-container");
      if (!cont) return;
      const toast = document.createElement("div");
      toast.className = `gc-toast ${tipo}`;
      toast.textContent = mensaje;
      cont.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add("mostrar"));
      setTimeout(() => {
        toast.classList.remove("mostrar");
        setTimeout(() => toast.remove(), 400);
      }, duracion);
    };
  })();

  // -------------------- Topbar (avatar, dropdown y mobile icon) --------------------
  document.addEventListener("DOMContentLoaded", () => {
    const usuario = getUsuarioFromCookie();
    const isLogged = !!(usuario?.correo || usuario?.nombre);

    // refs del topbar (version desktop)
    const actions = document.querySelector(".actions");
    if (actions) {
      // limpieza para evitar duplicados
      actions.querySelector(".user-icon")?.remove();

      // boton de registrarse (si hay sesion, se elimina)
      const btnPrimary = actions.querySelector(".btn-primary");
      if (isLogged && btnPrimary) btnPrimary.remove();

      const email = usuario?.correo || "Usuario";

      // Construcción del bloque desktop
      if (isLogged) {
        const wrap = document.createElement("div");
        wrap.className = "user-icon";
        wrap.setAttribute("role", "button");
        wrap.setAttribute("tabindex", "0");
        wrap.setAttribute("aria-haspopup", "true");
        wrap.setAttribute("aria-expanded", "false");
        wrap.innerHTML = `
          <span class="user-email">${email}</span>
          <img alt="Perfil" title="Perfil" class="img-perfil" />
          <div class="dropdown-menu" id="user-dropdown" role="menu" aria-hidden="true">
            <ul>
              <li role="menuitem" tabindex="-1">
                <img src="${asset(
                  "usuario/usuarioSubmenu/homebtn.png"
                )}" alt="" aria-hidden="true" />
                Ir a Home
              </li>
              <li id="logout-btn" role="menuitem" tabindex="-1">
                <img src="${asset(
                  "usuario/usuarioSubmenu/logoutbtn.png"
                )}" alt="" aria-hidden="true" />
                Logout
              </li>
            </ul>
          </div>
        `;
        actions.appendChild(wrap);
        actions.classList.add("mostrar");

        const img = wrap.querySelector("img.img-perfil");
        if (img) setAvatarSrc(img, usuario);

        // dropdown
        const dd = wrap.querySelector("#user-dropdown");
        const open = (flag) => {
          dd.classList.toggle("active", flag);
          dd.setAttribute("aria-hidden", String(!flag));
          wrap.setAttribute("aria-expanded", String(!!flag));
        };
        const toggle = (e) => {
          e?.stopPropagation();
          open(!dd.classList.contains("active"));
        };

        wrap.addEventListener("click", toggle);
        wrap.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle(e);
          }
          if (e.key === "Escape") open(false);
        });
        document.addEventListener("click", () => open(false));

        // acciones del menu
        dd.querySelector("li:nth-child(1)")?.addEventListener("click", () => {
          window.location.href = routeHome;
        });
        dd.querySelector("#logout-btn")?.addEventListener("click", () => {
          document.cookie =
            "usuario=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
          sessionStorage.removeItem("bienvenidaMostrada");
          window.location.href = routeLogin;
        });

        // bienvenida (una vez por sesion)
        if (!sessionStorage.getItem("bienvenidaMostrada")) {
          window.gcToast?.(
            `Bienvenido, ${usuario.nombre || "usuario"}`,
            "exito"
          );
          sessionStorage.setItem("bienvenidaMostrada", "true");
        }
      } else {
        // no logueado = un solo icono que redirige a login
        const loginIcon = document.createElement("div");
        loginIcon.className = "user-icon";
        loginIcon.innerHTML = `
          <img src="${withBust(
            DEFAULT_AVATAR
          )}" alt="Usuario" title="Iniciar sesión" class="img-perfil" />
        `;
        loginIcon.addEventListener(
          "click",
          () => (window.location.href = routeLogin)
        );
        actions.appendChild(loginIcon);
        actions.classList.add("mostrar");
      }
    }

    // header mobile
    const socialIconsContainer = document.querySelector(".social-icons");
    if (socialIconsContainer) {
      socialIconsContainer.querySelector(".user-icon-mobile")?.remove();

      const mob = document.createElement("div");
      mob.className = "user-icon-mobile";

      mob.innerHTML = `<img alt="Perfil" title="Perfil" src="${withBust(
        DEFAULT_AVATAR
      )}" />`;
      socialIconsContainer.appendChild(mob);

      const mobImg = mob.querySelector("img");

      if (isLogged) {
        const dropdownMobileId = "user-dropdown-mobile";
        document.getElementById(dropdownMobileId)?.remove();

        const dropdownMobile = document.createElement("div");
        dropdownMobile.className = "dropdown-menu mobile";
        dropdownMobile.id = dropdownMobileId;
        dropdownMobile.innerHTML = `
      <ul>
        <li>
          <img src="${asset(
            "usuario/usuarioSubmenu/homebtn.png"
          )}" alt="" aria-hidden="true" />
          Ir a Home
        </li>
        <li id="logout-btn-mobile">
          <img src="${asset(
            "usuario/usuarioSubmenu/logoutbtn.png"
          )}" alt="" aria-hidden="true" />
          Logout
        </li>
      </ul>
    `;
        document.body.appendChild(dropdownMobile);

        // toggle del dropdown
        mobImg?.addEventListener("click", (e) => {
          e.stopPropagation();
          const rect = mob.getBoundingClientRect();
          dropdownMobile.style.top = `${rect.bottom + window.scrollY}px`;
          dropdownMobile.style.left = `${Math.max(8, rect.right - 180)}px`;
          dropdownMobile.classList.toggle("active");
        });

        document.addEventListener("click", () =>
          dropdownMobile.classList.remove("active")
        );
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") dropdownMobile.classList.remove("active");
        });

        dropdownMobile
          .querySelector("li:first-child")
          ?.addEventListener("click", (e) => {
            e.stopPropagation();
            window.location.href = routeHome;
          });

        dropdownMobile
          .querySelector("#logout-btn-mobile")
          ?.addEventListener("click", () => {
            document.cookie =
              "usuario=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            sessionStorage.removeItem("bienvenidaMostrada");
            window.location.href = routeLogin;
          });
      } else {
        // no login =  default y un click lleva a Login
        mob.addEventListener(
          "click",
          () => (window.location.href = routeLogin)
        );
      }
    }
  });

  // -------------------- subnav --------------------
  document.addEventListener("DOMContentLoaded", () => {
    function abs(path) {
      if (!path) return "/";
      const p = String(path);
      if (p.startsWith("http://") || p.startsWith("https://")) return p; 
      const clean = "/" + p.replace(/^\/+/, ""); 
      return clean;
    }

    function asset(relPath) {
      const base = (window.ASSET_BASE || "/assets/").replace(/\/+$/, "") + "/";
      const rel = String(relPath || "").replace(/^\/+/, "");
      return abs(base + rel);
    }

    function getNavLink(key, fallback) {
      const header = document.getElementById("header");
      const ds = header ? header.dataset : {};
      const map = window.NAV_LINKS || {};
      const dataKey = `link${key[0].toUpperCase()}${key.slice(1)}`; // e.g. linkHome
      const dsVal = ds && typeof ds[dataKey] === "string" ? ds[dataKey] : null;
      return abs(dsVal || map[key] || fallback);
    }

    const setVH = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };
    setVH();
    window.addEventListener("resize", setVH);

    // -------------------------------------------------------- Views operativas
    const operativeViews = ["home.php", "admin.php"].map((s) =>
      s.toLowerCase()
    );
    const currentPage = (
      window.location.pathname.split("/").pop() || ""
    ).toLowerCase();

    const subnavs = Array.from(document.querySelectorAll("#header .subnav"));
    subnavs.forEach((nav) => (nav.dataset.originalHtml = nav.innerHTML));

    const socialMarkup = `
    <div class="social-icons">
      <div class="circle-icon"><img src="${asset(
        "index/Facebook.png"
      )}" alt="Facebook" /></div>
      <div class="circle-icon"><img src="${asset(
        "index/Instagram.png"
      )}" alt="Instagram" /></div>
      <div class="circle-icon"><img src="${asset(
        "index/Tiktok.png"
      )}" alt="TikTok" /></div>
    </div>
  `;

    const LINKS = {
      home: getNavLink("home", "/VIEW/Home.php"),
      proyectos: getNavLink("proyectos", "/proyectos.php"),
      cursos: getNavLink("cursos", "/cursos.php"),
      admin: getNavLink("admin", "/VIEW/UAT/admin.php"),
    };

    function isActive(href) {
      try {
        const a = document.createElement("a");
        a.href = href;
        const navPath = new URL(
          a.href,
          window.location.origin
        ).pathname.toLowerCase();
        const curPath = window.location.pathname.toLowerCase();
        return navPath === curPath;
      } catch {
        return false;
      }
    }

    if (operativeViews.includes(currentPage)) {
      const mk = (label, href) => {
        const active = isActive(href) ? "active" : "";
        return `<a href="${href}" class="${active}">${label}</a>`;
      };

      const markup = [
        mk("Home", LINKS.home),
        mk("Proyectos", LINKS.proyectos),
        mk("Cursos", LINKS.cursos),
        mk("Admin", LINKS.admin),
        socialMarkup,
      ].join("");

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

    // logo redirige a index
    const logoBtn = document.getElementById("logo-btn");
    if (logoBtn) {
      logoBtn.style.cursor = "pointer";
      logoBtn.addEventListener("click", () => {
        const to = getNavLink("home", "/index.php");
        window.location.href = to;
      });
    }

    const socialMap = {
      tiktok: "https://www.tiktok.com/@godcodemx",
      instagram: "https://www.instagram.com/god_code_mx/",
      facebook: "https://www.facebook.com/profile.php?id=61578204608103",
    };
    const socialIcons = document.querySelectorAll(
      "#header .icon-mobile, #header .circle-icon"
    );
    socialIcons.forEach((el) => {
      const img = el.querySelector("img") || el;
      const key = (img.alt || "").trim().toLowerCase();
      const url = socialMap[key];
      if (!url) return;
      el.style.cursor = "pointer";
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        window.open(url, "_blank", "noopener");
      });
    });
  }); // ------------------------------------- fin del js para para el subnav para las vistas operativas

  // -------------------- cotizar deshabilitado --------------------
  document.addEventListener("DOMContentLoaded", () => {
    const cotizarBtn = document.querySelector(".actions .btn-outline");
    if (!cotizarBtn) return;
    cotizarBtn.removeAttribute("onclick");
    cotizarBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.gcToast
        ? gcToast("Función deshabilitada", "warning", 4000)
        : alert("Función deshabilitada");
    });
  });

  // -------------------- Subnav (deshabilita los links de los botones) --------------------
  document.addEventListener("DOMContentLoaded", () => {
    const operativeViews = ["home.php", "admin.php", "vistaoperativa3.php"].map(
      (s) => s.toLowerCase()
    );
    const currentPage = window.location.pathname.split("/").pop().toLowerCase();
    if (!operativeViews.includes(currentPage)) return;

    const deshabilitados = ["Proyectos", "Cursos"];
    deshabilitados.forEach((nombre) => {
      const btn = Array.from(
        document.querySelectorAll("#header .subnav a")
      ).find(
        (a) => a.textContent.trim().toLowerCase() === nombre.toLowerCase()
      );
      if (!btn) return;
      btn.href = "#";
      btn.dataset.disabled = "true";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        window.gcToast
          ? gcToast("Función deshabilitada", "warning")
          : alert("Función deshabilitada");
      });
    });
  });
})();

//------------------------- js para rescribir el footer
(function () {
  const DEFAULTS = {
    selector: "footer",
    createIfMissing: true,
    extraClasses: "",

    // ---- Contenido personalizable ----
    contactTitle: "Contacto",
    phoneLabel: "Teléfono:",
    phone: "+52 1 33 1977 4088",
    locationLabel: "Ubicación:",
    location: "Francisco Madero 1C, Ixtlahuacán de los Membrillos",

    hoursTitle: "Horarios de servicio",
    hoursLines: ["Lunes a Viernes", "De 9:00AM a 9:00PM"],
  };

  const getConfig = () => Object.assign({}, DEFAULTS, window.GCFooterConfig || {});

  function buildFooterInnerHTML(cfg) {
    const telHref = "tel:" + String(cfg.phone || "").replace(/\s+/g, "");
    return `
      <div>
        <strong>${cfg.contactTitle}</strong>
        <small>${cfg.phoneLabel} <a>${cfg.phone}</a></small>
        <small>${cfg.locationLabel} ${cfg.location}</small>
      </div>
      <div>
        <strong>${cfg.hoursTitle}</strong>
        ${cfg.hoursLines.map(l => `<small>${l}</small>`).join("")}
      </div>
    `;
  }

  function replaceFooter() {
    const cfg = getConfig();
    let footer = document.querySelector(cfg.selector);

    if (!footer) {
      if (!cfg.createIfMissing) return;
      footer = document.createElement("footer");
      document.body.appendChild(footer);
    }

    if (cfg.extraClasses) {
      cfg.extraClasses.split(/\s+/).filter(Boolean).forEach(c => footer.classList.add(c));
    }
    footer.classList.add("gc-footer");

    footer.innerHTML = buildFooterInnerHTML(cfg);
  }

  function init() {
    replaceFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // window.updateGCFooter({ phone: "..." })
  window.updateGCFooter = function (patch = {}) {
    window.GCFooterConfig = Object.assign({}, window.GCFooterConfig || {}, patch);
    replaceFooter();
  };
})();
