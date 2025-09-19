/* gc.status.tone.js — helper de badges/labels de estatus (TONE) */
(() => {
  "use strict";

  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>'"]/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        }[c])
    );

  // --- labels por modulo (se encarga de darle color y revisar el status de la columna status)
  const STATUS_SELECT_BY_ENTITY = Object.freeze({
    cursos: [
      { v: 1, l: "Activo" },
      { v: 2, l: "Pausado" },
      { v: 4, l: "En curso" },
      { v: 3, l: "Terminado" },
      { v: 0, l: "Inactivo" },
      { v: 5, l: "Cancelado" },
    ],
    noticias: [
      { v: 1, l: "Activo" },
      { v: 2, l: "En pausa" }, // ámbar
      { v: 3, l: "Temporal" }, // azul
      { v: 0, l: "Cancelado" }, // rojo
    ],
    tutores: [
      { v: 1, l: "Activo" }, // verde
      { v: 2, l: "Pausado" }, // gris
      { v: 0, l: "Inactivo" }, // rojo
    ],
    suscripciones: [
      { v: 2, l: "Suscrito" }, // azul
      { v: 1, l: "Activo" }, // verde
      { v: 3, l: "Terminado" }, // gris
      { v: 0, l: "Cancelado" }, // rojo
    ],
  });

  // --- tonos por modulo
  const STATUS_TONE = Object.freeze({
    cursos: {
      1: "green",
      activo: "green",
      2: "grey",
      pausado: "grey",
      "en pausa": "grey",
      4: "blue",
      "en curso": "blue",
      3: "blue",
      terminado: "blue",
      0: "red",
      inactivo: "red",
      5: "red",
      cancelado: "red",
    },
    noticias: {
      1: "green",
      activo: "green",
      0: "red",
      inactivo: "red",
      2: "amber",
      "en pausa": "amber",
      pausado: "amber",
      3: "blue",
      temporal: "blue",
      4: "red",
      cancelado: "red",
    },
    tutores: {
      1: "green",
      activo: "green",
      2: "grey",
      pausado: "grey",
      0: "red",
      inactivo: "red",
    },
    suscripciones: {
      2: "blue",
      suscrito: "blue",
      1: "green",
      activo: "green",
      3: "grey",
      terminado: "grey",
      0: "red",
      cancelado: "red",
    },
  });

  function statusTextGeneric(v) {
    const opts = [
      { v: 1, l: "Activo" },
      { v: 0, l: "Inactivo" },
      { v: 2, l: "Pausado" },
      { v: 3, l: "Terminado" },
    ];
    const f = opts.find((o) => Number(o.v) === Number(v));
    return f ? f.l : String(v);
  }

  function statusLabel(entity, val) {
    const key = String(entity || "").toLowerCase();
    const opts = STATUS_SELECT_BY_ENTITY[key] || [];
    const f = opts.find((o) => Number(o.v) === Number(val));
    return f ? f.l : statusTextGeneric(val);
  }

  function toneFor(entity, status) {
    const key = String(entity || "").toLowerCase();
    const raw = String(status ?? "")
      .toLowerCase()
      .trim();
    const map = STATUS_TONE[key] || {};
    if (raw in map) return map[raw];
    const asNum = String(Number(status));
    if (asNum in map) return map[asNum];
    // fallback genérico por número
    if (Number(status) === 1) return "green";
    if (Number(status) === 0) return "red";
    if (Number(status) === 2) return "grey";
    if (Number(status) === 3) return "blue";
    return "grey";
  }

  function statusBadge(entity, val, forcedLabel) {
    const tone = toneFor(entity, val);
    const txt = forcedLabel || statusLabel(entity, val);
    return `<span class="gc-badge gc-badge--${tone}">${esc(txt)}</span>`;
  }

  function decorateStatusCells(root = document) {
    root.querySelectorAll(".col-status[data-entity]").forEach((el) => {
      const ent = el.getAttribute("data-entity");
      const val = el.getAttribute("data-status") ?? el.textContent.trim();
      el.innerHTML = statusBadge(ent, val);
    });
  }

  window.gcTone = {
    STATUS_TONE,
    STATUS_SELECT_BY_ENTITY,
    statusLabel,
    statusBadge,
    toneFor,
    decorateStatusCells,
  };
  if (!window.statusBadge) window.statusBadge = statusBadge;
})();

(() => {
  "use strict";

  const ID = "#search-input";
  const defPh = "Buscar…";

  const S = {
    routeKey: "", // '#/cursos' | '#/noticias' | …
    q: "",
    handlers: {}, // { '#/cursos': fn(q), … }
    placeholders: {
      "#/cursos": "Buscar cursos…",
      "#/noticias": "Buscar noticias…",
      "#/tutores": "Buscar tutores…",
      "#/suscripciones": "Buscar por suscriptor o curso…",
      "#/usuarios": "Buscar usuarios…",
    },
    debounceMs: 120,
    _wired: false,
    _timer: null,
  };

  /* ---------- utils ---------- */
  const norm = (s) =>
    String(s || "")
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .trim();

  function defaultMatcher(q) {
    const k = norm(q);
    return (row) => norm(JSON.stringify(row)).includes(k);
  }

  function applyFilter(arr, q, matcher) {
    const m = typeof matcher === "function" ? matcher : defaultMatcher(q);
    return (Array.isArray(arr) ? arr : []).filter(m);
  }

  /* ---------- wiring del input ---------- */
  function ensureWired() {
    if (S._wired) return;
    const inp = document.querySelector(ID);
    if (!inp) return;
    S._wired = true;

    // entrada
    inp.addEventListener("input", () => {
      const run = () => {
        S.q = inp.value || "";
        document.dispatchEvent(
          new CustomEvent("gc:search-change", {
            detail: { routeKey: S.routeKey, q: S.q },
          })
        );
        const fn = S.handlers[S.routeKey];
        if (typeof fn === "function") {
          try {
            fn(S.q);
          } catch (e) {
            console.error("[gcSearch] handler error:", e);
          }
        }
      };
      if (S.debounceMs > 0) {
        clearTimeout(S._timer);
        S._timer = setTimeout(run, S.debounceMs);
      } else {
        run();
      }
    });
  }

  function setPlaceholder(ph) {
    const inp = document.querySelector(ID);
    if (inp) inp.placeholder = ph || defPh;
  }

  /* ---------- API pública ---------- */
  function setRoute(routeKey, opts = {}) {
    S.routeKey = routeKey || S.routeKey || "#/cursos";
    if (opts.placeholder) S.placeholders[S.routeKey] = String(opts.placeholder);
    setPlaceholder(S.placeholders[S.routeKey] || defPh);
    ensureWired();
  }

  function register(routeKey, onChange, { placeholder } = {}) {
    if (placeholder) S.placeholders[routeKey] = String(placeholder);
    S.handlers[routeKey] = onChange;
    if (S.routeKey === routeKey) {
      setPlaceholder(S.placeholders[routeKey] || defPh);
      const inp = document.querySelector(ID);
      if (inp) {
        const val = inp.value || "";
        if (val !== S.q) {
          S.q = val;
        }
        if (typeof onChange === "function") onChange(S.q);
      }
    }
    ensureWired();
  }

  function getQuery() {
    return S.q;
  }
  function normalize(s) {
    return norm(s);
  }
  function is(routeKey) {
    return S.routeKey === routeKey;
  }

  // expone
  window.gcSearch = {
    setRoute,
    register,
    getQuery,
    applyFilter,
    normalize,
    is,
  };
})();

(function () {
  if (window.gcBindCharCounters) return;

  function _updateOne(el) {
    var max = Number(el.getAttribute("data-max") || 0);
    if (!max) return;
    var id = el.id;
    var cc = document.querySelector('.char-counter[data-for="' + id + '"]');
    if (!cc) return;
    var v = el.value || "";
    cc.textContent = v.length + "/" + max;
    if (v.length > max) cc.classList.add("over");
    else cc.classList.remove("over");
  }

  window.gcBindCharCounters = function (root) {
    (root || document).querySelectorAll("[data-max]").forEach(function (el) {
      if (el._cc_wired) {
        _updateOne(el);
        return;
      }
      el._cc_wired = true;
      _updateOne(el);
      el.addEventListener("input", function () {
        _updateOne(el);
      });
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.gcBindCharCounters(document);
  });
})();
