(() => {
  "use strict";
  const TAG = "[LoginGuard]";

  /* ---------- localizar <script> y leer config ---------- */
  function getSelfScript() {
    const cs = document.currentScript;
    if (cs) return cs;
    const all = Array.from(document.scripts || []);
    return (
      all.reverse().find((s) => /login\.guard\.js(\?|$)/.test(String(s.src))) ||
      all[all.length - 1] ||
      null
    );
  }
  const self = getSelfScript();
  const ds = (self && self.dataset) || {};
  let qs = {};
  try {
    if (self && self.src)
      qs = Object.fromEntries(
        new URL(self.src, location.origin).searchParams.entries()
      );
  } catch {}

  const cfg = {
    cookieName: String(ds.cookieName || qs.cookie || "usuario"),
    loginUrl: String(ds.loginUrl || qs.login || "/VIEW/Login.php"),
    nextParam: String(ds.nextParam || qs.next || "next"),
    delay: Number.isFinite(Number(ds.delay || qs.delay))
      ? Number(ds.delay || qs.delay)
      : 500,
    message: String(ds.message || qs.msg || "Por favor inicia sesión"),
    autoprotect: (function () {
      const raw = (ds.autoprotect ?? qs.autoprotect ?? "1").toString();
      return raw !== "0" && raw.toLowerCase() !== "false";
    })(),
  };

  /* ---------- utils ---------- */
  function toast(msg, type = "warning", ms = 2200) {
    if (globalThis.gcToast) return globalThis.gcToast(msg, type, ms);
    try {
      console.warn(TAG, type.toUpperCase() + ":", msg);
    } catch {}
  }
  function readCookie(name) {
    try {
      const m = document.cookie
        .split("; ")
        .find((r) => r.startsWith(name + "="));
      if (!m) return null;
      const v = m.slice(name.length + 1); 
      return decodeURIComponent(v);
    } catch {
      return null;
    }
  }
  function parseUserCookie() {
    const raw = readCookie(cfg.cookieName);
    if (!raw) return null;
    try {
      const obj = JSON.parse(raw);
      if (obj && (obj.id != null || obj.usuario_id != null)) return obj;
    } catch {
      const n = Number(raw);
      if (Number.isFinite(n)) return { id: n };
    }
    return null;
  }
  function isLoggedIn() {
    return !!parseUserCookie();
  }
  function getUser() {
    return parseUserCookie();
  }

  function rememberFlash(msg, type = "warning") {
    try {
      sessionStorage.setItem("gc_flash_msg", String(msg || ""));
      sessionStorage.setItem("gc_flash_type", String(type || "info"));
    } catch {}
  }
  function showFlashIfAny() {
    try {
      const msg = sessionStorage.getItem("gc_flash_msg");
      if (!msg) return;
      const type = sessionStorage.getItem("gc_flash_type") || "info";
      sessionStorage.removeItem("gc_flash_msg");
      sessionStorage.removeItem("gc_flash_type");
      toast(msg, type);
    } catch {}
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showFlashIfAny);
  } else {
    showFlashIfAny();
  }

  function normalizePath(p) {
    try {
      const u = new URL(p, location.origin);
      return u.pathname.replace(/\/+$/, "") || "/";
    } catch {
      return (
        String(p || "/")
          .replace(/^[^/]/, "/")
          .replace(/\/+$/, "") || "/"
      );
    }
  }
  function isOnLoginPage() {
    try {
      const here = normalizePath(location.pathname);
      const login = normalizePath(cfg.loginUrl);
      return here === login || here.endsWith(login);
    } catch {
      return false;
    }
  }
  function buildLoginUrl(next) {
    try {
      const u = new URL(cfg.loginUrl, location.origin);
      if (next) u.searchParams.set(cfg.nextParam, next);
      return u.pathname + (u.search ? u.search : "");
    } catch {
      const base = cfg.loginUrl;
      const sep = base.includes("?") ? "&" : "?";
      return next
        ? base +
            sep +
            encodeURIComponent(cfg.nextParam) +
            "=" +
            encodeURIComponent(next)
        : base;
    }
  }

  function protect(opts = {}) {
    const msg = String(opts.message || cfg.message);
    const delay = Number.isFinite(opts.delay) ? Number(opts.delay) : cfg.delay;

    if (isLoggedIn() || isOnLoginPage()) return true;

    const next = location.pathname + location.search + location.hash;
    rememberFlash(msg, "warning");
    toast(msg, "warning", Math.max(1200, delay));
    const to = buildLoginUrl(next);
    setTimeout(() => {
      location.href = to;
    }, delay);
    return false;
  }

  const run = () => {
    if (cfg.autoprotect) protect();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  globalThis.LoginGuard = {
    isLoggedIn,
    getUser,
    protect,
    config: Object.freeze({ ...cfg }),
  };

  console.log(
    TAG,
    "cargado. Autoprotección:",
    cfg.autoprotect,
    "Login:",
    cfg.loginUrl
  );
})();
