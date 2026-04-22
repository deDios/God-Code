(() => {
  //JS/UATV2/ui/adminSuscripciones.js
  "use strict";

  const TAG = "[AdminTramites]";
  const log = (...a) => console.log(TAG, ...a);
  const err = (...a) => console.error(TAG, ...a);
  const toast = (m, t = "info") =>
    window.gcToast ? window.gcToast(m, t) : console.log("[toast]", t, m);


  //db\WEB\ixtla01_c_media.php
  //db\WEB\ixtla01_in_media.php
  const API = {
    LIST: "/db/WEB/ixtla01_c_tramiteV2.php",
    CREATE: "/db/WEB/ixtla01_i_tramite.php",
    UPDATE: "/db/WEB/ixtla01_u_tramite.php",
    DEPARTAMENTOS: "/db/WEB/ixtla01_c_departamentoV2.php",

    // Media
    MEDIA_LIST: "/db/WEB/ixtla01_c_media.php",
    MEDIA_UPLOAD: "/db/WEB/ixtla01_in_media.php",
  };

  const DEPT_ASSETS_DIR = "/ASSETS/departamentos/";
  const DEPT_PLACEHOLDER = `${DEPT_ASSETS_DIR}placeholder_icon.png`;

  const state = {
    items: [],
    filteredItems: [],
    pagedItems: [],
    query: "",
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
    activeDepartamentoId: 0,
    departamentos: [],
    isLoading: false,
    searchTimer: null,
    mediaVersion: {},

    // State for the department filter bar para los departamentos
    deptbar: {
      chunkSize: 14,
      visibleCount: 14,
      isLoadingMore: false,
    },

    drawer: {
      isOpen: false,
      mode: "view", // view | edit | create
      selectedId: null,
      draft: null,
      original: null,
      errors: {},
      confirmDelete: false,
      isSaving: false,

      // Media state for the drawer
      media: {
        isLoading: false,
        isUploading: false,
        icon: null,
        card: null,
      },
    },
  };

  // Initialization
  async function init() {
    state.isLoading = true;

    // REINICIAR DEPTBAR AL ENTRAR AL MÓDULO
    state.deptbar.visibleCount = state.deptbar.chunkSize;

    try {
      await loadDepartamentos();
      await refreshRemoteList();
    } catch (error) {
      err("Error inicializando módulo:", error);
      toast("No se pudo cargar el módulo de trámites.", "error");
    } finally {
      state.isLoading = false;
    }
  }

  // Helpers

  function bindDeptbarScroll(root) {
    const deptbar = root.querySelector("#admin-tramites-deptbar");
    const btnPrev = root.querySelector("#admin-tramites-dept-prev");
    const btnNext = root.querySelector("#admin-tramites-dept-next");

    if (!deptbar) return;

    const STEP = 560;
    const LOAD_THRESHOLD = 140;

    function updateNavState() {
      const maxScrollLeft = deptbar.scrollWidth - deptbar.clientWidth;
      const atStart = deptbar.scrollLeft <= 4;
      const atEnd = deptbar.scrollLeft >= maxScrollLeft - 4;

      if (btnPrev) btnPrev.disabled = atStart;
      if (btnNext) btnNext.disabled = atEnd && !canLoadMoreDeptChips();
    }

    function maybeLoadMore() {
      const remaining =
        deptbar.scrollWidth - deptbar.clientWidth - deptbar.scrollLeft;

      if (remaining <= LOAD_THRESHOLD) {
        loadMoreDeptChips();
      }
    }

    if (btnPrev) {
      btnPrev.addEventListener("click", () => {
        deptbar.scrollBy({
          left: -STEP,
          behavior: "smooth",
        });
      });
    }

    if (btnNext) {
      btnNext.addEventListener("click", () => {
        deptbar.scrollBy({
          left: STEP,
          behavior: "smooth",
        });

        setTimeout(() => {
          maybeLoadMore();
          updateNavState();
        }, 220);
      });
    }

    deptbar.addEventListener(
      "wheel",
      (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          deptbar.scrollLeft += e.deltaY;
          maybeLoadMore();
          updateNavState();
        }
      },
      { passive: false }
    );

    deptbar.addEventListener(
      "scroll",
      () => {
        maybeLoadMore();
        updateNavState();
      },
      { passive: true }
    );

    updateNavState();
  }

  function canLoadMoreDeptChips() {
    return state.deptbar.visibleCount < state.departamentos.length;
  }

  function loadMoreDeptChips() {
    if (state.deptbar.isLoadingMore) return;
    if (!canLoadMoreDeptChips()) return;

    state.deptbar.isLoadingMore = true;

    state.deptbar.visibleCount = Math.min(
      state.deptbar.visibleCount + state.deptbar.chunkSize,
      state.departamentos.length
    );

    refreshView(false);
    state.deptbar.isLoadingMore = false;
  }

  async function sendJSON(url, body, method = "POST") {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body || {}),
    });

    const txt = await res.text();
    let json;

    try {
      json = JSON.parse(txt);
    } catch {
      json = { raw: txt };
    }

    if (!res.ok || json?.ok === false) {
      throw new Error(
        json?.error || json?.message || json?.raw || `HTTP ${res.status}`
      );
    }

    return json;
  }

  function getErrorMessage(error, fallback = "Ocurrió un error.") {
    return error?.message || fallback;
  }

  function readCookiePayload() {
    try {
      const name = "ix_emp=";
      const pair = document.cookie.split("; ").find((c) => c.startsWith(name));
      if (!pair) return null;
      const raw = decodeURIComponent(pair.slice(name.length));
      return JSON.parse(decodeURIComponent(escape(atob(raw))));
    } catch {
      return null;
    }
  }

  function getSessionLike() {
    try {
      return window.Session?.get?.() || readCookiePayload() || null;
    } catch {
      return readCookiePayload() || null;
    }
  }

  function getEmpleadoIdFromSession() {
    const s = getSessionLike() || {};
    const id = s?.empleado_id ?? s?.id_empleado ?? null;
    return Number.isFinite(Number(id)) ? Number(id) : null;
  }

  function getDepartamentoImageCandidates(id) {
    const safeId = Number(id) || 0;

    if (!safeId) {
      return [DEPT_PLACEHOLDER];
    }

    return [
      `${DEPT_ASSETS_DIR}dep_img${safeId}.webp`,
      `${DEPT_ASSETS_DIR}dep_img${safeId}.png`,
      `${DEPT_ASSETS_DIR}dep_img${safeId}.jpg`,
      `${DEPT_ASSETS_DIR}dep_img${safeId}.jpeg`,
      DEPT_PLACEHOLDER,
    ];
  }

  function renderDepartamentoImage(id, nombre, className = "") {
    const candidates = getDepartamentoImageCandidates(id);
    const safeAlt = escapeHtml(nombre || "Departamento");

    return `
      <img
        src="${escapeAttr(candidates[0])}"
        alt="${safeAlt}"
        class="${className}"
        data-fallback-index="0"
        data-fallbacks='${escapeAttr(JSON.stringify(candidates))}'
      />
    `;
  }

  function wireDepartmentImageFallbacks(scope = document) {
    scope.querySelectorAll("img[data-fallbacks]").forEach((img) => {
      if (img.dataset.fallbackBound === "1") return;
      img.dataset.fallbackBound = "1";

      img.addEventListener("error", () => {
        let list = [];

        try {
          list = JSON.parse(img.dataset.fallbacks || "[]");
        } catch {
          list = [DEPT_PLACEHOLDER];
        }

        let index = Number(img.dataset.fallbackIndex || 0) + 1;

        if (index >= list.length) return;

        img.dataset.fallbackIndex = String(index);
        img.src = list[index];
      });
    });
  }

  async function loadDepartamentos() {
    const json = await sendJSON(API.DEPARTAMENTOS, {
      all: true,
      //status: 1,
    });

    state.departamentos = Array.isArray(json?.data)
      ? json.data
        .map((dept) => ({
          ...dept,
          id: Number(dept.id) || 0,
          nombre: String(dept.nombre || "").trim(),
        }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
      : [];

    state.deptbar.visibleCount = state.deptbar.chunkSize;
  }

  async function refreshRemoteList() {
    const payload = {
      page: state.page,
      per_page: state.limit,
    };

    const q = String(state.query || "").trim();
    if (q) payload.q = q;

    if (Number(state.activeDepartamentoId) > 0) {
      payload.departamento_id = Number(state.activeDepartamentoId);
    }

    state.isLoading = true;

    try {
      const json = await sendJSON(API.LIST, payload);

      state.items = Array.isArray(json?.data) ? json.data : [];
      state.filteredItems = state.items;
      state.pagedItems = state.items;
      state.total = Number(json?.total ?? state.items.length) || 0;
      state.totalPages = Math.max(1, Number(json?.total_pages ?? 1) || 1);
      state.page = Math.max(1, Number(json?.page ?? state.page) || 1);

      hydrateItemsWithDepartments();
    } finally {
      state.isLoading = false;
    }
  }

  function hydrateItemsWithDepartments() {
    state.items = state.items.map((item) => {
      const dept = getDepartamentoById(item.departamento_id);

      return {
        ...item,
        id: Number(item.id) || 0,
        departamento_id: Number(item.departamento_id) || 0,
        estatus: Number(item.estatus ?? 1) || 0,
        status: Number(item.estatus ?? 1) === 0 ? 0 : 1,
        nombre: String(item.nombre || ""),
        descripcion: String(item.descripcion || ""),
        departamento_nombre:
          item.departamento_nombre ||
          dept?.nombre ||
          `Departamento ${Number(item.departamento_id) || 0}`,
        imagen: item.imagen || "",
      };
    });

    state.filteredItems = state.items;
    state.pagedItems = state.items;
  }

  function getDepartamentoById(id) {
    const needle = Number(id || 0);
    if (!needle) return null;
    return state.departamentos.find((dept) => Number(dept.id) === needle) || null;
  }

  function renderPagination() {
    if (state.totalPages <= 1) return "";

    const pages = buildPagination(state.page, state.totalPages);
    const start = state.total === 0 ? 0 : (state.page - 1) * state.limit + 1;
    const end = Math.min(state.page * state.limit, state.total);

    return `
    <div class="admin-pagination">
      <div class="admin-pagination__info">
        Mostrando ${start}-${end} de ${state.total} tipos de trámite
      </div>

      <div class="admin-pagination__controls">
        <button
          type="button"
          class="admin-pagination__btn"
          data-page="${state.page - 1}"
          ${state.page <= 1 ? "disabled" : ""}
        >
          ‹
        </button>

        ${pages
        .map((p) => {
          if (p === "...") {
            return `<span class="admin-pagination__dots">...</span>`;
          }

          return `
              <button
                type="button"
                class="admin-pagination__page ${p === state.page ? "is-active" : ""}"
                data-page="${p}"
              >
                ${p}
              </button>
            `;
        })
        .join("")}

        <button
          type="button"
          class="admin-pagination__btn"
          data-page="${state.page + 1}"
          ${state.page >= state.totalPages ? "disabled" : ""}
        >
          ›
        </button>
      </div>
    </div>
  `;
  }

  function applyFilters() {
    // El backend ya devuelve la página y filtros aplicados.
    // Aqui solo sincronizamos los alias usados por el render actual.
    state.filteredItems = Array.isArray(state.items) ? [...state.items] : [];
    state.pagedItems = Array.isArray(state.items) ? [...state.items] : [];
  }

  function renderDeptFilters() {
    const allClass = state.activeDepartamentoId === 0 ? "is-active" : "";
    const total = state.departamentos.length;
    const visible = state.departamentos.slice(0, state.deptbar.visibleCount);

    return `
    <div class="admin-tramites__deptnav">
      <button
        type="button"
        class="admin-tramites__deptnav-btn is-left"
        id="admin-tramites-dept-prev"
        aria-label="Desplazar departamentos a la izquierda"
      >
        ‹
      </button>

      <div class="admin-tramites__deptbar-shell">
        <div
          class="admin-tramites__deptbar"
          id="admin-tramites-deptbar"
          aria-label="Filtros por departamento"
          data-total="${total}"
        >
          <button
            type="button"
            class="admin-tramites__deptchip admin-tramites__deptchip--all ${allClass}"
            data-dept-id="0"
          >
            <span class="admin-tramites__deptchip-label">Todos</span>
          </button>

          ${visible
        .map((dept) => {
          const activeClass =
            Number(state.activeDepartamentoId) === Number(dept.id)
              ? "is-active"
              : "";

          return `
                <button
                  type="button"
                  class="admin-tramites__deptchip ${activeClass}"
                  data-dept-id="${dept.id}"
                  title="${escapeHtml(dept.nombre)}"
                >
                  <span class="admin-tramites__deptchip-img">
                    ${renderDepartamentoImage(
            dept.id,
            dept.nombre,
            "admin-tramites__deptchip-image"
          )}
                  </span>
                  <span class="admin-tramites__deptchip-label">
                    ${escapeHtml(dept.nombre)}
                  </span>
                </button>
              `;
        })
        .join("")}
        </div>
      </div>

      <button
        type="button"
        class="admin-tramites__deptnav-btn is-right"
        id="admin-tramites-dept-next"
        aria-label="Desplazar departamentos a la derecha"
      >
        ›
      </button>
    </div>
  `;
  }

  function renderRows() {
    if (state.isLoading) {
      return `
        <tr>
          <td colspan="5">
            <div class="muted">Cargando tipos de trámite...</div>
          </td>
        </tr>
      `;
    }

    if (!state.pagedItems.length) {
      return `
        <tr>
          <td colspan="5">
            <div class="muted">No se encontraron tipos de trámite.</div>
          </td>
        </tr>
      `;
    }

    return state.pagedItems
      .map((item) => {
        const status = getStatusMeta(item.estatus);
        const dept = getDepartamentoById(item.departamento_id);

        return `
          <tr data-id="${item.id}">
            <td>
              <strong>${escapeHtml(item.nombre)}</strong>
            </td>

            <td title="${escapeHtml(item.descripcion)}">
              ${escapeHtml(truncate(item.descripcion, 125))}
            </td>

            <td>
              ${renderDepartamentoImage(
          dept?.id || item.departamento_id,
          dept?.nombre || item.departamento_nombre || item.nombre,
          "admin-departamento__thumb"
        )}
            </td>

            <td>
              <span class="badge-status" data-k="${status.key}">
                ${status.label}
              </span>
            </td>

            <td>
              <button
                type="button"
                class="hs-btn js-edit-tramite"
                data-id="${item.id}"
              >
                Editar Tipo de trámite
              </button>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  const TRAMITE_MEDIA_BUCKET = "departamentos_modulos";
  const TRAMITE_MEDIA_DIR_PREFIX = "dep-";
  const TRAMITE_MEDIA_EXTENSIONS = ["webp", "png", "jpg", "jpeg"];

  function getTramiteIdForMedia() {
    return Number(state.drawer.selectedId || state.drawer.draft?.id || 0);
  }

  function getDepartamentoIdForMedia() {
    return Number(
      state.drawer.draft?.departamento_id ||
      state.drawer.original?.departamento_id ||
      0
    );
  }

  function getTramiteMediaTargetDir(departamentoId) {
    const id = Number(departamentoId || 0);
    return id > 0 ? `${TRAMITE_MEDIA_DIR_PREFIX}${id}` : "";
  }

  function getTramiteMediaFileBase(variant, tramiteId) {
    const safeVariant = String(variant || "").trim().toLowerCase();
    const id = Number(tramiteId || 0);
    if (!id) return "";

    if (safeVariant === "card") return `req_card${id}`;
    return `req_icon${id}`;
  }

  function getPlaceholderMediaUrl(variant) {
    if (variant === "card") {
      return "/ASSETS/departamentos/placeholder_card.png";
    }
    return DEPT_PLACEHOLDER;
  }

  function getTramiteMediaVersionKey(variant, tramiteId) {
    const safeVariant = String(variant || "").trim().toLowerCase();
    const safeId = Number(tramiteId || 0);
    if (!safeVariant || !safeId) return "";
    return `tramite-${safeVariant}-${safeId}`;
  }

  function getTramiteMediaVersion(variant, tramiteId) {
    const key = getTramiteMediaVersionKey(variant, tramiteId);
    if (!key) return "";
    return state.mediaVersion[key] || "";
  }

  function setTramiteMediaVersion(variant, tramiteId, version = Date.now()) {
    const key = getTramiteMediaVersionKey(variant, tramiteId);
    if (!key) return;
    state.mediaVersion[key] = version;
  }

  function withMediaVersion(url, version) {
    if (!url || !version) return url;
    if (url.includes("placeholder")) return url;
    return `${url}?v=${version}`;
  }

  function getTramiteMediaCandidates(variant, departamentoId, tramiteId) {
    const dir = getTramiteMediaTargetDir(departamentoId);
    const base = getTramiteMediaFileBase(variant, tramiteId);
    const version = getTramiteMediaVersion(variant, tramiteId);

    if (!dir || !base) {
      return [getPlaceholderMediaUrl(variant)];
    }

    const prefix = `/ASSETS/departamentos/modulosAssets/${dir}/${base}`;
    return [
      ...TRAMITE_MEDIA_EXTENSIONS.map((ext) =>
        withMediaVersion(`${prefix}.${ext}`, version)
      ),
      getPlaceholderMediaUrl(variant),
    ];
  }

  function buildDrawerMediaPreview(variant) {
    const tramiteId = getTramiteIdForMedia();
    const departamentoId = getDepartamentoIdForMedia();

    return {
      name: getTramiteMediaFileBase(variant, tramiteId),
      url: getTramiteMediaCandidates(variant, departamentoId, tramiteId)[0],
      candidates: getTramiteMediaCandidates(variant, departamentoId, tramiteId),
    };
  }

  async function loadDrawerMedia() {
    const tramiteId = getTramiteIdForMedia();
    const departamentoId = getDepartamentoIdForMedia();

    state.drawer.media = {
      isLoading: true,
      isUploading: false,
      icon: null,
      card: null,
    };

    refreshView(false);

    if (!tramiteId || !departamentoId) {
      state.drawer.media.isLoading = false;
      state.drawer.media.icon = {
        name: "",
        url: getPlaceholderMediaUrl("icon"),
        candidates: [getPlaceholderMediaUrl("icon")],
      };
      state.drawer.media.card = {
        name: "",
        url: getPlaceholderMediaUrl("card"),
        candidates: [getPlaceholderMediaUrl("card")],
      };
      refreshView(false);
      return;
    }

    state.drawer.media.icon = buildDrawerMediaPreview("icon");
    state.drawer.media.card = buildDrawerMediaPreview("card");
    state.drawer.media.isLoading = false;
    refreshView(false);
  }

  async function uploadDrawerMedia(variant, file) {
    const tramiteId = getTramiteIdForMedia();
    const departamentoId = getDepartamentoIdForMedia();

    if (!tramiteId) {
      toast("Primero guarda el trámite para poder subir imágenes.", "warning");
      return;
    }

    if (!departamentoId) {
      toast("El trámite no tiene departamento asignado.", "warning");
      return;
    }

    if (!file) return;
    if (state.drawer.media.isUploading || state.drawer.isSaving) return;

    if (!window.MediaUpload || typeof window.MediaUpload.compressImageForUpload !== "function") {
      toast("No se encontró el módulo de compresión de imágenes.", "error");
      return;
    }

    const validation = window.MediaUpload.validateImageBeforeUpload?.(file, {
      showFeedback: true,
    });

    if (validation && !validation.ok) {
      return;
    }

    state.drawer.media.isUploading = true;
    refreshView(false);

    try {
      const fd = new FormData();
      fd.append("bucket", TRAMITE_MEDIA_BUCKET);
      fd.append("target_dir", getTramiteMediaTargetDir(departamentoId));
      fd.append("file_name", getTramiteMediaFileBase(variant, tramiteId));
      fd.append("replace", "1");

      const optimizedFile = await window.MediaUpload.compressImageForUpload(file, {
        profile: variant === "icon" ? "icon" : "card",
        fileNameBase: getTramiteMediaFileBase(variant, tramiteId),
      });

      fd.append("file", optimizedFile);

      const res = await fetch(API.MEDIA_UPLOAD, {
        method: "POST",
        body: fd,
      });

      const txt = await res.text();
      let json;
      try {
        json = JSON.parse(txt);
      } catch {
        json = { raw: txt };
      }

      if (!res.ok || json?.ok === false) {
        throw new Error(json?.error || json?.message || json?.raw || `HTTP ${res.status}`);
      }

      setTramiteMediaVersion(variant, tramiteId);

      toast(
        variant === "icon"
          ? "Icono actualizado correctamente."
          : "Imagen card actualizada correctamente.",
        "success"
      );

      await loadDrawerMedia();
    } catch (error) {
      err(`Error subiendo media "${variant}":`, error);
      state.drawer.media.isUploading = false;
      refreshView(false);
      toast(getErrorMessage(error, "No se pudo subir la imagen."), "error");
    }
  }

  function askAndHandleDrawerMediaReplace(variant) {
    if (state.drawer.media.isUploading || state.drawer.isSaving) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

    input.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      await uploadDrawerMedia(variant, file);
    });

    input.click();
  }

  function renderMediaSlot(variant, item) {
    const media = state.drawer.media?.[variant] || null;
    const isBusy = Boolean(state.drawer.media?.isUploading || state.drawer.isSaving);
    const isCreate = state.drawer.mode === "create";
    const disabled = isBusy || isCreate;
    const title = variant === "icon" ? "Icono" : "Card";
    const replaceLabel = variant === "icon" ? "Reemplazar icono" : "Reemplazar card";
    const previewUrl = media?.url || getPlaceholderMediaUrl(variant);
    const previewAlt = `${title} de ${item?.nombre || "trámite"}`;
    const hasMedia = Boolean(media?.url);

    return `
    <div class="admin-drawer__media-slot admin-drawer__media-slot--${variant}">
      <div class="admin-drawer__media-head">
        <span class="admin-drawer__label">${title}</span>
      </div>

      <div class="admin-drawer__image-wrap ${hasMedia ? "" : "is-empty"}">
        <img
          src="${escapeAttr(previewUrl)}"
          alt="${escapeAttr(previewAlt)}"
          class="admin-drawer__image admin-drawer__image--${variant}"
          data-fallback-index="0"
          data-fallbacks='${escapeAttr(JSON.stringify(media?.candidates || [previewUrl]))}'
        />
      </div>

      <div class="admin-drawer__image-actions">
        <button
          type="button"
          class="admin-drawer__ghost-btn js-media-replace"
          data-variant="${variant}"
          ${disabled ? "disabled" : ""}
          title="${isCreate ? "Primero guarda el trámite" : replaceLabel}"
        >
          ${replaceLabel}
        </button>
      </div>
    </div>
  `;
  }

  function renderDrawer() {
    const isOpen = state.drawer.isOpen;
    const mode = state.drawer.mode;
    const item = state.drawer.draft;

    if (!isOpen || !item) {
      return `
        <div
          class="admin-drawer-overlay"
          id="admin-tramites-drawer-overlay"
          aria-hidden="true"
        ></div>
      `;
    }

    const isEdit = mode === "edit" || mode === "create";
    const isCreate = mode === "create";
    const titleText = isCreate
      ? "Nuevo tipo de trámite"
      : isEdit
        ? "Editar tipo de trámite"
        : "Detalle de tipo de trámite";

    const errors = state.drawer.errors || {};
    const drawerStatusLabel = Number(item.estatus) === 1 ? "Activo" : "Inactivo";
    const saveDisabled =
      state.drawer.isSaving ||
      (isCreate ? !isDrawerValid() : !(isDrawerValid() && hasDrawerChanges()));

    const dept = getDepartamentoById(item.departamento_id);

    return `
      <div
        class="admin-drawer-overlay is-open"
        id="admin-tramites-drawer-overlay"
        aria-hidden="false"
      >
        <aside
          class="admin-drawer admin-drawer--right is-open"
          id="admin-tramites-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-tramites-drawer-title"
        >
          <div class="admin-drawer__head">
            <div>
              <h3 class="admin-drawer__title" id="admin-tramites-drawer-title">
                ${escapeHtml(titleText)}
              </h3>
            </div>

            <button
              type="button"
              class="admin-drawer__close js-drawer-close"
              aria-label="Cerrar drawer"
              title="Cerrar"
              ${state.drawer.isSaving ? "disabled" : ""}
            >
              ×
            </button>
          </div>

          <div class="admin-drawer__body">

            <div class="admin-drawer__image-block admin-drawer__image-block--tramite-media">
  ${state.drawer.media?.isLoading
        ? `
      <div class="admin-drawer__media-loading">
        Cargando media del trámite...
      </div>
    `
        : `
      <div class="admin-drawer__media-grid">
        ${renderMediaSlot("icon", item)}
        ${renderMediaSlot("card", item)}
      </div>
    `
      }
</div>

            <label class="admin-drawer__field">
              <span class="admin-drawer__label">Nombre</span>
              <input
                type="text"
                class="admin-drawer__input js-drawer-input ${errors.nombre ? "is-error" : ""}"
                data-field="nombre"
                value="${escapeAttr(item.nombre || "")}"
                ${isEdit ? "" : "readonly"}
              />
              ${errors.nombre
        ? `<span class="admin-drawer__error">${escapeHtml(errors.nombre)}</span>`
        : ""
      }
            </label>

            <label class="admin-drawer__field">
              <span class="admin-drawer__label">Descripción</span>
              <textarea
                class="admin-drawer__textarea js-drawer-input ${errors.descripcion ? "is-error" : ""
      }"
                data-field="descripcion"
                ${isEdit ? "" : "readonly"}
              >${escapeHtml(item.descripcion || "")}</textarea>
              ${errors.descripcion
        ? `<span class="admin-drawer__error">${escapeHtml(errors.descripcion)}</span>`
        : ""
      }
            </label>

            <label class="admin-drawer__field">
              <span class="admin-drawer__label">Departamento</span>
              ${isEdit
        ? `
                  <select class="admin-drawer__select js-drawer-input ${errors.departamento_id ? "is-error" : ""
        }" data-field="departamento_id">
                    <option value="">Selecciona un departamento</option>
                    ${state.departamentos
          .map(
            (deptItem) => `
                      <option
                        value="${deptItem.id}"
                        ${Number(item.departamento_id) === Number(deptItem.id)
                ? "selected"
                : ""
              }
                      >
                        ${escapeHtml(deptItem.nombre)}
                      </option>
                    `
          )
          .join("")}
                  </select>
                `
        : `
                  <div class="admin-drawer__readonly-pill admin-drawer__readonly-pill--department">
                   ${escapeHtml(item.departamento_nombre || "Sin departamento")}
                  </div>
                `
      }
              ${errors.departamento_id
        ? `<span class="admin-drawer__error">${escapeHtml(errors.departamento_id)}</span>`
        : ""
      }
            </label>

            <label class="admin-drawer__field">
              <span class="admin-drawer__label">Estado</span>
              ${isEdit
        ? `
                  <select class="admin-drawer__select js-drawer-input" data-field="estatus">
                    <option value="1" ${Number(item.estatus) === 1 ? "selected" : ""}>Activo</option>
                    <option value="0" ${Number(item.estatus) === 0 ? "selected" : ""}>Inactivo</option>
                  </select>
                `
        : `
                  <div class="admin-drawer__readonly-pill admin-drawer__readonly-pill--status admin-drawer__readonly-pill--${Number(item.estatus) === 1 ? "activo" : "inactivo"
        }">
                   ${escapeHtml(drawerStatusLabel)}
                  </div>
                `
      }
            </label>

            ${state.drawer.confirmDelete && !isCreate
        ? `
                <div class="admin-drawer__confirm">
                  <p class="admin-drawer__confirm-text">
                    ¿Seguro que deseas eliminar este tipo de trámite?.
                  </p>

                  <div class="admin-drawer__confirm-actions">
                    <button
                      type="button"
                      class="admin-drawer__danger-btn js-confirm-delete"
                      ${state.drawer.isSaving ? "disabled" : ""}
                    >
                      Sí, eliminar
                    </button>
                    <button
                      type="button"
                      class="admin-drawer__secondary-btn js-cancel-delete"
                      ${state.drawer.isSaving ? "disabled" : ""}
                    >
                      No, volver
                    </button>
                  </div>
                </div>
              `
        : ""
      }
          </div>

          <div class="admin-drawer__footer">
            ${renderDrawerFooterButtons(saveDisabled)}
          </div>
        </aside>
      </div>
    `;
  }

  function renderDrawerFooterButtons(saveDisabled) {
    const mode = state.drawer.mode;

    if (mode === "create") {
      return `
        <button
          type="button"
          class="admin-drawer__primary-btn js-save-drawer"
          ${saveDisabled ? "disabled" : ""}
        >
          Guardar tipo de trámite
        </button>
        <button
          type="button"
          class="admin-drawer__secondary-btn js-cancel-edit"
          ${state.drawer.isSaving ? "disabled" : ""}
        >
          Cancelar
        </button>
      `;
    }

    if (mode === "edit") {
      return `
        <button
          type="button"
          class="admin-drawer__primary-btn js-save-drawer"
          ${saveDisabled ? "disabled" : ""}
        >
          Guardar cambios
        </button>
        <button
          type="button"
          class="admin-drawer__secondary-btn js-cancel-edit"
          ${state.drawer.isSaving ? "disabled" : ""}
        >
          Cancelar
        </button>
      `;
    }

    return `
      <button
        type="button"
        class="admin-drawer__primary-btn js-edit-drawer"
        ${state.drawer.isSaving ? "disabled" : ""}
      >
        Editar
      </button>
      <button
        type="button"
        class="admin-drawer__danger-btn js-ask-delete"
        ${state.drawer.isSaving ? "disabled" : ""}
      >
        Eliminar
      </button>
      <button
        type="button"
        class="admin-drawer__secondary-btn js-drawer-close"
        ${state.drawer.isSaving ? "disabled" : ""}
      >
        Cerrar
      </button>
    `;
  }

  function render() {
    return `
      <section class="admin-module admin-module--tramites">
        <div class="admin-module__head">
          <div class="admin-module__titlebox">
            <h2 class="admin-module__title">Gestión de Tipo de trámite</h2>
          </div>

          <div class="admin-module__toolbar">
            <label class="search" aria-label="Buscar tipo de trámite">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
               <path fill="currentColor" d="M10 4a6 6 0 0 1 4.472 9.931l4.298 4.297l-1.414 1.415l-4.297-4.298A6 6 0 1 1 10 4m0 2a4 4 0 1 0 0 8a4 4 0 0 0 0-8"></path>
              </svg>
              <input
               id="admin-tramites-search"
               type="search"
               placeholder="Buscar Tipo de trámite"
               value="${escapeHtml(state.query)}"
              />
            </label>

            <button
              type="button"
              class="hs-btn"
              id="btn-add-tramite"
            >
              + Agregar Tipo de trámite
            </button>
          </div>
        </div>

        <div class="admin-module__body">
          ${renderDeptFilters()}

          <div class="hs-table table-wrap">
            <table class="gc">
              <thead>
                <tr>
                  <th>Tipo de trámite</th>
                  <th>Descripción</th>
                  <th>Departamento</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${renderRows()}
              </tbody>
            </table>
          </div>

          ${renderPagination()}
        </div>

      </section>

      ${renderDrawer()}
    `;
  }

  function bind() {
    const root = document.querySelector("#admin-view-root");
    if (!root) return;

    const inputSearch = root.querySelector("#admin-tramites-search");
    const btnAdd = root.querySelector("#btn-add-tramite");

    if (inputSearch) {
      inputSearch.addEventListener("input", (e) => {
        state.query = e.target.value || "";
        state.page = 1;

        // REINICIAR CHIPS VISIBLES DEL DEPTBAR
        state.deptbar.visibleCount = state.deptbar.chunkSize;

        clearTimeout(state.searchTimer);
        state.searchTimer = setTimeout(async () => {
          try {
            await refreshRemoteList();
            refreshView(true);
          } catch (error) {
            err("Error buscando trámites:", error);
            toast(getErrorMessage(error, "No se pudo buscar."), "error");
          }
        }, 280);
      });
    }

    if (btnAdd) {
      btnAdd.addEventListener("click", openCreateDrawer);
    }

    root.querySelectorAll(".admin-tramites__deptchip").forEach((btn) => {
      btn.addEventListener("click", async () => {
        state.activeDepartamentoId = Number(btn.dataset.deptId || 0);
        state.page = 1;

        try {
          await refreshRemoteList();
          refreshView(false);
        } catch (error) {
          err("Error filtrando trámites:", error);
          toast(getErrorMessage(error, "No se pudo filtrar."), "error");
        }
      });
    });

    root.querySelectorAll("[data-page]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const page = Number(btn.dataset.page);
        if (!page || page < 1 || page > state.totalPages) return;

        state.page = page;

        try {
          await refreshRemoteList();
          refreshView(false);
        } catch (error) {
          err("Error cambiando página:", error);
          toast(getErrorMessage(error, "No se pudo cambiar de página."), "error");
        }
      });
    });

    root.querySelectorAll(".js-edit-tramite").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const item = state.items.find((t) => Number(t.id) === id);
        if (!item) return;
        openDrawer(item);
      });
    });

    bindDrawer(root);
    wireDepartmentImageFallbacks(root);
    bindDeptbarScroll(root);
  }

  function syncDrawerUi(root) {
    if (!root) return;

    const errors = state.drawer.errors || {};
    const mode = state.drawer.mode;
    const isCreate = mode === "create";
    const saveDisabled =
      state.drawer.isSaving ||
      (isCreate ? !isDrawerValid() : !(isDrawerValid() && hasDrawerChanges()));

    root.querySelectorAll(".js-drawer-input").forEach((field) => {
      const key = field.dataset.field;
      if (!key) return;

      const hasError = Boolean(errors[key]);
      field.classList.toggle("is-error", hasError);

      const fieldWrap = field.closest(".admin-drawer__field");
      if (!fieldWrap) return;

      let errorNode = fieldWrap.querySelector(".admin-drawer__error");
      const errorText = errors[key] || "";

      if (errorText) {
        if (!errorNode) {
          errorNode = document.createElement("span");
          errorNode.className = "admin-drawer__error";
          fieldWrap.appendChild(errorNode);
        }
        errorNode.textContent = errorText;
      } else if (errorNode) {
        errorNode.remove();
      }
    });

    const saveBtn = root.querySelector(".js-save-drawer");
    if (saveBtn) {
      saveBtn.disabled = saveDisabled;
    }
  }

  function bindDrawer(root) {
    const overlay = root.querySelector("#admin-tramites-drawer-overlay");

    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay && !state.drawer.isSaving) closeDrawer();
      });
    }

    root.querySelectorAll(".js-drawer-close").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!state.drawer.isSaving) closeDrawer();
      });
    });

    const btnEdit = root.querySelector(".js-edit-drawer");
    if (btnEdit) {
      btnEdit.addEventListener("click", () => {
        state.drawer.mode = "edit";
        state.drawer.confirmDelete = false;
        validateDrawer();
        refreshView();
        focusDrawerField();
      });
    }

    const btnAskDelete = root.querySelector(".js-ask-delete");
    if (btnAskDelete) {
      btnAskDelete.addEventListener("click", () => {
        state.drawer.confirmDelete = true;
        refreshView();
      });
    }

    const btnCancelDelete = root.querySelector(".js-cancel-delete");
    if (btnCancelDelete) {
      btnCancelDelete.addEventListener("click", () => {
        state.drawer.confirmDelete = false;
        refreshView();
      });
    }

    const btnConfirmDelete = root.querySelector(".js-confirm-delete");
    if (btnConfirmDelete) {
      btnConfirmDelete.addEventListener("click", handleDeleteTramite);
    }

    const btnCancelEdit = root.querySelector(".js-cancel-edit");
    if (btnCancelEdit) {
      btnCancelEdit.addEventListener("click", () => {
        if (state.drawer.mode === "create") {
          closeDrawer();
          return;
        }

        state.drawer.mode = "view";
        state.drawer.confirmDelete = false;
        state.drawer.draft = clone(state.drawer.original);
        state.drawer.errors = {};
        refreshView();
      });
    }

    const btnSave = root.querySelector(".js-save-drawer");
    if (btnSave) {
      btnSave.addEventListener("click", handleSaveTramite);
    }

    root.querySelectorAll(".js-drawer-input").forEach((field) => {
      const eventName = field.tagName === "SELECT" ? "change" : "input";

      field.addEventListener(eventName, (e) => {
        const key = e.target.dataset.field;
        if (!key || !state.drawer.draft || state.drawer.isSaving) return;

        const value = e.target.value;

        if (key === "estatus" || key === "departamento_id") {
          state.drawer.draft[key] = Number(value);
        } else {
          state.drawer.draft[key] = value;
        }

        if (key === "departamento_id") {
          const selectedDept = getDepartamentoById(state.drawer.draft.departamento_id);

          state.drawer.draft.departamento_nombre = selectedDept
            ? selectedDept.nombre
            : "";
        }

        validateDrawer();

        if (key === "departamento_id" || key === "estatus") {
          refreshView();
        } else {
          syncDrawerUi(root);
        }
      });
    });

    root.querySelectorAll(".js-media-replace").forEach((btn) => {
      btn.addEventListener("click", () => {
        const variant = String(btn.dataset.variant || "").trim();
        if (!variant) return;
        askAndHandleDrawerMediaReplace(variant);
      });
    });

  }

  function openDrawer(item) {
    state.drawer.isOpen = true;
    state.drawer.mode = "view";
    state.drawer.selectedId = item.id;
    state.drawer.original = clone(item);
    state.drawer.draft = clone(item);
    state.drawer.confirmDelete = false;
    state.drawer.errors = {};
    state.drawer.media = {
      isLoading: false,
      isUploading: false,
      icon: null,
      card: null,
    };
    refreshView(false);
    loadDrawerMedia();
  }

  function openCreateDrawer() {
    const defaultDept = state.departamentos[0] || {
      id: 0,
      nombre: "",
    };

    const blank = {
      id: 0,
      departamento_id: Number(defaultDept.id) || 0,
      departamento_nombre: defaultDept.nombre || "",
      nombre: "",
      descripcion: "",
      estatus: 1,
      status: 1,
      imagen: "",
    };

    state.drawer.isOpen = true;
    state.drawer.mode = "create";
    state.drawer.selectedId = null;
    state.drawer.original = clone(blank);
    state.drawer.draft = clone(blank);
    state.drawer.confirmDelete = false;
    state.drawer.errors = {};
    state.drawer.media = {
      isLoading: false,
      isUploading: false,
      icon: null,
      card: null,
    };
    validateDrawer();
    refreshView();
    setTimeout(focusDrawerField, 0);
  }

  function closeDrawer(options = {}) {
    const { silent = false } = options;

    state.drawer.isOpen = false;
    state.drawer.mode = "view";
    state.drawer.selectedId = null;
    state.drawer.draft = null;
    state.drawer.original = null;
    state.drawer.confirmDelete = false;
    state.drawer.errors = {};
    state.drawer.isSaving = false;
    state.drawer.media = {
      isLoading: false,
      isUploading: false,
      icon: null,
      card: null,
    };

    if (!silent) {
      refreshView(false);
    }
  }

  async function handleSaveTramite() {
    validateDrawer();

    if (!isDrawerValid()) {
      refreshView();
      focusDrawerField();
      return;
    }

    const payload = {
      departamento_id: Number(state.drawer.draft.departamento_id),
      nombre: String(state.drawer.draft.nombre || "").trim(),
      descripcion: String(state.drawer.draft.descripcion || "").trim(),
      estatus: Number(state.drawer.draft.estatus ?? 1),
    };

    const empleadoId = getEmpleadoIdFromSession();

    if (state.drawer.isSaving) return;
    state.drawer.isSaving = true;
    refreshView();

    try {
      if (state.drawer.mode === "create") {
        if (empleadoId) payload.created_by = empleadoId;
        await sendJSON(API.CREATE, payload);
        toast("Tipo de trámite creado correctamente.", "success");
      } else {
        payload.id = Number(state.drawer.selectedId);
        if (empleadoId) payload.updated_by = empleadoId;
        await sendJSON(API.UPDATE, payload);
        toast("Tipo de trámite actualizado correctamente.", "success");
      }

      state.drawer.isSaving = false;
      closeDrawer({ silent: true });
      await refreshRemoteList();
      refreshView(false);
    } catch (error) {
      err("Error guardando trámite:", error);
      state.drawer.isSaving = false;
      refreshView();
      toast(
        getErrorMessage(error, "No se pudo guardar el tipo de trámite."),
        "error"
      );
    }
  }

  async function handleDeleteTramite() {
    if (state.drawer.isSaving) return;

    const id = Number(state.drawer.selectedId || 0);
    if (!id) return;

    state.drawer.isSaving = true;
    refreshView();

    try {
      const current = state.drawer.original || state.drawer.draft || {};
      const payload = {
        id,
        departamento_id: Number(current.departamento_id),
        nombre: String(current.nombre || "").trim(),
        descripcion: String(current.descripcion || "").trim(),
        estatus: 0,
      };

      const empleadoId = getEmpleadoIdFromSession();
      if (empleadoId) payload.updated_by = empleadoId;

      await sendJSON(API.UPDATE, payload);

      toast("Tipo de trámite eliminado correctamente.", "success");
      state.drawer.isSaving = false;
      closeDrawer({ silent: true });
      await refreshRemoteList();
      refreshView(false);
    } catch (error) {
      err("Error eliminando trámite:", error);
      state.drawer.isSaving = false;
      refreshView();
      toast(
        getErrorMessage(error, "No se pudo eliminar el tipo de trámite."),
        "error"
      );
    }
  }

  function refreshView(keepFocus = true) {
    applyFilters();

    const root = document.querySelector("#admin-view-root");
    if (!root) return;

    const active = keepFocus ? document.activeElement : null;
    const focusMeta =
      active && active.dataset
        ? {
          field: active.dataset.field || null,
          id: active.id || null,
          selectionStart:
            typeof active.selectionStart === "number"
              ? active.selectionStart
              : null,
          selectionEnd:
            typeof active.selectionEnd === "number"
              ? active.selectionEnd
              : null,
        }
        : null;

    root.innerHTML = render();
    bind();

    if (!keepFocus || !focusMeta) return;

    let next = null;
    if (focusMeta.field) {
      next = root.querySelector(
        `.js-drawer-input[data-field="${focusMeta.field}"]`
      );
    } else if (focusMeta.id) {
      next = root.querySelector(`#${focusMeta.id}`);
    }

    if (next) {
      next.focus({ preventScroll: true });
      if (
        typeof next.setSelectionRange === "function" &&
        focusMeta.selectionStart !== null &&
        focusMeta.selectionEnd !== null
      ) {
        next.setSelectionRange(
          focusMeta.selectionStart,
          focusMeta.selectionEnd
        );
      }
    }
  }

  function validateDrawer() {
    const draft = state.drawer.draft || {};
    const errors = {};

    if (!String(draft.nombre || "").trim()) {
      errors.nombre = "El nombre del trámite es obligatorio.";
    } else if (String(draft.nombre || "").trim().length < 3) {
      errors.nombre = "El nombre debe tener al menos 3 caracteres.";
    }

    if (!String(draft.descripcion || "").trim()) {
      errors.descripcion = "La descripción es obligatoria.";
    } else if (String(draft.descripcion || "").trim().length < 10) {
      errors.descripcion = "La descripción debe tener al menos 10 caracteres.";
    }

    if (!Number(draft.departamento_id)) {
      errors.departamento_id = "Debes seleccionar un departamento.";
    }

    state.drawer.errors = errors;
    return errors;
  }

  function isDrawerValid() {
    return Object.keys(validateDrawer()).length === 0;
  }

  function hasDrawerChanges() {
    if (!state.drawer.draft || !state.drawer.original) return false;

    const a = normalizeDraftForCompare(state.drawer.original);
    const b = normalizeDraftForCompare(state.drawer.draft);

    return JSON.stringify(a) !== JSON.stringify(b);
  }

  function normalizeDraftForCompare(item) {
    return {
      nombre: String(item?.nombre || "").trim(),
      descripcion: String(item?.descripcion || "").trim(),
      departamento_id: String(item?.departamento_id ?? ""),
      estatus: String(item?.estatus ?? 1),
    };
  }

  function focusDrawerField() {
    const root = document.querySelector("#admin-view-root");
    if (!root) return;

    const target = root.querySelector('.js-drawer-input[data-field="nombre"]');
    if (target) target.focus();
  }

  function getStatusMeta(estatus) {
    if (Number(estatus) === 1) {
      return { label: "Activo", key: "activo" };
    }
    return { label: "Inactivo", key: "inactivo" };
  }

  function buildPagination(current, total) {
    const pages = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (current > 3) pages.push("...");

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) pages.push("...");

    pages.push(total);

    return pages;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll("`", "&#096;");
  }

  function truncate(text, max = 110) {
    const value = String(text || "").trim();
    if (value.length <= max) return value;
    return `${value.slice(0, max).trim()}...`;
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  window.AdminTramites = {
    init,
    render,
    bind,
  };
})();