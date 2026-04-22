(() => {
  //JS/UATV2/ui/adminCursos.js
  "use strict";

  const TAG = "[AdminCarrusel]";
  const log = (...a) => console.log(TAG, ...a);
  const err = (...a) => console.error(TAG, ...a);
  const toast = (m, t = "info") =>
    window.gcToast ? window.gcToast(m, t) : console.log("[toast]", t, m);

  const API = {
    LIST: "/db/WEB/ixtla01_c_noticia_inicio.php",
    CREATE: "/db/WEB/ixtla01_i_noticia_inicio.php",
    UPDATE: "/db/WEB/ixtla01_u_noticia_inicio.php",

    // Media
    MEDIA_UPLOAD: "/db/WEB/ixtla01_in_media.php",
  };

  const NEWS_ASSETS_DIR = "/ASSETS/noticiasImg/";
  const NEWS_PLACEHOLDER = "/ASSETS/main_logo_shield.png";
  const NEWS_MEDIA_BUCKET = "noticias";
  const NEWS_MEDIA_EXTENSIONS = ["webp", "png", "jpg", "jpeg"];

  const state = {
    items: [],
    query: "",
    page: 1,
    limit: 4,
    total: 0,
    totalPages: 1,
    isLoading: false,
    isReady: false,
    mediaVersion: {},
    pendingStatusIds: {},

    drawer: {
      isOpen: false,
      mode: "view", // view | edit | create
      selectedId: null,
      draft: null,
      original: null,
      confirmDelete: false,
      errors: {},
      isSaving: false,
      media: {
        isUploading: false,
      },
    },
  };

  // Initialization
  async function init() {
    state.isLoading = true;

    try {
      await refreshRemoteList();
      state.isReady = true;
    } catch (error) {
      err("Error inicializando módulo:", error);
      toast("No se pudo cargar el módulo de carrusel.", "error");
    } finally {
      state.isLoading = false;
    }
  }

  // Helpers
  function getNoticiaMediaTargetDir(id) {
    const safeId = Number(id) || 0;
    return safeId ? `noticia${safeId}` : "";
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

  function cloneItem(item) {
    return JSON.parse(JSON.stringify(item || null));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
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
    return escapeHtml(value).replaceAll("\n", "&#10;");
  }

  function formatText(value) {
    return escapeHtml(value).replace(/\n/g, "<br>");
  }

  function getNoticiaMediaFileBase(id) {
    const safeId = Number(id) || 0;
    return safeId ? `img${safeId}` : "";
  }

  function getNoticiaMediaVersion(id) {
    const safeId = Number(id) || 0;
    if (!safeId) return "";
    return state.mediaVersion[`noticia-${safeId}`] || "";
  }

  function setNoticiaMediaVersion(id, version = Date.now()) {
    const safeId = Number(id) || 0;
    if (!safeId) return;
    state.mediaVersion[`noticia-${safeId}`] = version;
  }

  function isStatusPending(id) {
    return state.pendingStatusIds[Number(id)] === true;
  }

  function setStatusPending(id, pending) {
    const safeId = Number(id) || 0;
    if (!safeId) return;

    if (pending) {
      state.pendingStatusIds[safeId] = true;
      return;
    }

    delete state.pendingStatusIds[safeId];
  }

  function withMediaVersion(url, version) {
    if (!url || !version) return url;
    if (url.includes("placeholder")) return url;
    return `${url}?v=${version}`;
  }

  function getNoticiaImageCandidates(id) {
    const safeId = Number(id) || 0;
    const version = getNoticiaMediaVersion(safeId);

    if (!safeId) return [NEWS_PLACEHOLDER];

    const dir = `noticia${safeId}`;
    const file = `img${safeId}`;

    return [
      ...NEWS_MEDIA_EXTENSIONS.map((ext) =>
        withMediaVersion(`${NEWS_ASSETS_DIR}${dir}/${file}.${ext}`, version)
      ),
      NEWS_PLACEHOLDER,
    ];
  }

  function getNoticiaImageUrl(id) {
    return getNoticiaImageCandidates(id)[0] || NEWS_PLACEHOLDER;
  }

  function wireImageFallbacks(scope = document) {
    scope.querySelectorAll("img[data-fallbacks]").forEach((img) => {
      if (img.dataset.fallbackBound === "1") return;
      img.dataset.fallbackBound = "1";

      img.addEventListener("error", () => {
        let list = [];
        try {
          list = JSON.parse(img.dataset.fallbacks || "[]");
        } catch {
          list = [NEWS_PLACEHOLDER];
        }

        let index = Number(img.dataset.fallbackIndex || 0) + 1;
        if (index >= list.length) return;

        img.dataset.fallbackIndex = String(index);
        img.src = list[index];
      });
    });
  }

  function normalizeItem(item) {
    const id = Number(item?.id) || 0;
    const status = Number(item?.status ?? 1) === 0 ? 0 : 1;

    return {
      ...item,
      id,
      titulo: String(item?.titulo || ""),
      pie_de_pagina: String(item?.pie_de_pagina || ""),
      pie_pagina: String(item?.pie_de_pagina || ""),
      descripcion: String(item?.descripcion || ""),
      status,
      estatus: status,
      creado_por: item?.creado_por != null ? Number(item.creado_por) || 0 : null,
      updated_by: item?.updated_by != null ? Number(item.updated_by) || 0 : null,
      imagen: getNoticiaImageUrl(id),
    };
  }

  async function refreshRemoteList() {
    const payload = {
      page: state.page,
      per_page: state.limit,
    };

    const q = String(state.query || "").trim();
    if (q) payload.q = q;

    state.isLoading = true;

    try {
      const json = await sendJSON(API.LIST, payload);

      state.items = Array.isArray(json?.data)
        ? json.data.map(normalizeItem)
        : [];
      state.total = Number(json?.total ?? state.items.length) || 0;
      state.totalPages = Math.max(1, Number(json?.total_pages ?? 1) || 1);
      state.page = Math.max(1, Number(json?.page ?? state.page) || 1);
    } finally {
      state.isLoading = false;
    }
  }

  function refreshView(keepFocus = true) {
    const root = document.querySelector("#admin-view-root");
    if (!root) return;

    const active = keepFocus ? document.activeElement : null;
    const focusMeta =
      active
        ? {
          field: active.dataset?.field || null,
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

  function syncDrawerUi(root) {
    if (!root) return;

    const errors = state.drawer.errors || {};
    const mode = state.drawer.mode;
    const isCreate = mode === "create";
    const canSave = isDrawerValid();
    const hasChanges = hasDrawerChanges();
    const saveDisabled =
      state.drawer.isSaving ||
      state.drawer.media.isUploading ||
      (isCreate ? !canSave : !(canSave && hasChanges));

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
    if (saveBtn) saveBtn.disabled = saveDisabled;

    const deleteBtn = root.querySelector(".js-delete-drawer");
    if (deleteBtn) {
      deleteBtn.disabled = state.drawer.isSaving || state.drawer.media.isUploading;
    }
  }

  function createEmptyDraft() {
    return normalizeItem({
      id: null,
      titulo: "",
      pie_de_pagina: "",
      descripcion: "",
      status: 1,
      imagen: "",
    });
  }

  function openCreateDrawer() {
    state.drawer.isOpen = true;
    state.drawer.mode = "create";
    state.drawer.selectedId = null;
    state.drawer.original = null;
    state.drawer.draft = createEmptyDraft();
    state.drawer.confirmDelete = false;
    state.drawer.errors = {};
    state.drawer.isSaving = false;
    state.drawer.media.isUploading = false;

    validateDrawer();
    refreshView();
    focusDrawerField();
  }

  function openItemDrawer(id) {
    const item = state.items.find((x) => Number(x.id) === Number(id));
    if (!item) return;

    state.drawer.isOpen = true;
    state.drawer.mode = "view";
    state.drawer.selectedId = Number(id);
    state.drawer.original = cloneItem(item);
    state.drawer.draft = cloneItem(item);
    state.drawer.confirmDelete = false;
    state.drawer.errors = {};
    state.drawer.isSaving = false;
    state.drawer.media.isUploading = false;

    validateDrawer();
    refreshView();
  }

  function focusDrawerField() {
    requestAnimationFrame(() => {
      const root = document.querySelector("#admin-view-root");
      if (!root) return;

      const firstField = root.querySelector(
        '.js-drawer-input[data-field="titulo"]'
      );
      if (firstField) firstField.focus();
    });
  }

  function closeDrawer({ silent = false } = {}) {
    state.drawer.isOpen = false;
    state.drawer.mode = "view";
    state.drawer.selectedId = null;
    state.drawer.original = null;
    state.drawer.draft = null;
    state.drawer.confirmDelete = false;
    state.drawer.errors = {};
    state.drawer.isSaving = false;
    state.drawer.media.isUploading = false;

    if (!silent) refreshView();
  }

  function enterEditMode() {
    if (!state.drawer.draft) return;
    state.drawer.mode = "edit";
    state.drawer.confirmDelete = false;
    validateDrawer();
    refreshView();
    focusDrawerField();
  }

  function cancelDrawerEdition() {
    if (state.drawer.mode === "create") {
      closeDrawer();
      return;
    }

    state.drawer.mode = "view";
    state.drawer.confirmDelete = false;
    state.drawer.draft = cloneItem(state.drawer.original);
    state.drawer.errors = {};
    state.drawer.isSaving = false;
    state.drawer.media.isUploading = false;

    validateDrawer();
    refreshView();
  }

  function updateDraftField(field, value) {
    if (!state.drawer.draft) return;

    if (field === "status") {
      const nextStatus = Number(value) === 0 ? 0 : 1;
      state.drawer.draft.status = nextStatus;
      state.drawer.draft.estatus = nextStatus;
    } else {
      state.drawer.draft[field] = value;
    }

    validateDrawer();

    const root = document.querySelector("#admin-view-root");
    syncDrawerUi(root);
  }

  function toggleDraftStatus(checked) {
    if (!state.drawer.draft) return;

    const nextStatus = checked ? 1 : 0;
    state.drawer.draft.status = nextStatus;
    state.drawer.draft.estatus = nextStatus;

    validateDrawer();
    const root = document.querySelector("#admin-view-root");
    syncDrawerUi(root);
  }

  function handleDocumentKeydown(event) {
    if (event.key === "Escape" && state.drawer.isOpen) {
      closeDrawer();
    }
  }

  async function saveDrawer() {
    const draft = state.drawer.draft;
    if (!draft || state.drawer.isSaving) return;

    validateDrawer();

    if (!isDrawerValid()) {
      refreshView();
      focusDrawerField();
      return;
    }

    const empleadoId = getEmpleadoIdFromSession();
    if (!empleadoId) {
      toast("No se pudo identificar al empleado en sesión.", "warning");
      return;
    }

    state.drawer.isSaving = true;
    refreshView();

    try {
      if (state.drawer.mode === "create") {
        const payload = {
          titulo: String(draft.titulo || "").trim(),
          pie_de_pagina: normalizeNullableText(draft.pie_de_pagina),
          descripcion: String(draft.descripcion || "").trim(),
          status: Number(draft.status ?? 1) === 0 ? 0 : 1,
          creado_por: empleadoId,
        };

        const json = await sendJSON(API.CREATE, payload);
        const newItem = normalizeItem(json?.data || {});

        toast("Noticia agregada correctamente.", "success");

        closeDrawer({ silent: true });
        state.page = 1;
        await refreshRemoteList();
        refreshView();

        if (newItem?.id) {
          log("Noticia creada:", newItem.id);
        }
        return;
      }

      const payload = {
        id: Number(state.drawer.selectedId),
        titulo: String(draft.titulo || "").trim(),
        pie_de_pagina: normalizeNullableText(draft.pie_de_pagina),
        descripcion: String(draft.descripcion || "").trim(),
        status: Number(draft.status ?? 1) === 0 ? 0 : 1,
        updated_by: empleadoId,
      };

      const json = await sendJSON(API.UPDATE, payload);
      const updated = normalizeItem(json?.data || {});

      state.drawer.original = cloneItem(updated);
      state.drawer.draft = cloneItem(updated);
      state.drawer.mode = "view";
      state.drawer.confirmDelete = false;
      state.drawer.errors = {};
      state.drawer.isSaving = false;

      await refreshRemoteList();

      const current = state.items.find((x) => Number(x.id) === Number(updated.id));
      if (current) {
        state.drawer.original = cloneItem(current);
        state.drawer.draft = cloneItem(current);
      }

      refreshView();
      toast("Noticia actualizada correctamente.", "success");
    } catch (error) {
      err("Error guardando noticia:", error);
      state.drawer.isSaving = false;
      refreshView();
      toast(getErrorMessage(error, "No se pudo guardar la noticia."), "error");
    }
  }

  async function deleteCurrentItem() {
    if (state.drawer.isSaving || state.drawer.media.isUploading) return;

    const id = Number(state.drawer.selectedId || 0);
    if (!id) return;

    const empleadoId = getEmpleadoIdFromSession();
    if (!empleadoId) {
      toast("No se pudo identificar al empleado en sesión.", "warning");
      return;
    }

    state.drawer.isSaving = true;
    refreshView();

    try {
      await sendJSON(API.UPDATE, {
        id,
        status: 0,
        updated_by: empleadoId,
      });

      toast("Noticia eliminada correctamente.", "success");
      closeDrawer({ silent: true });

      const expectedTotal = Math.max(0, state.total - 1);
      const expectedPages = Math.max(1, Math.ceil(expectedTotal / state.limit));
      state.page = clamp(state.page, 1, expectedPages);

      await refreshRemoteList();
      refreshView();
    } catch (error) {
      err("Error eliminando noticia:", error);
      state.drawer.isSaving = false;
      refreshView();
      toast(getErrorMessage(error, "No se pudo eliminar la noticia."), "error");
    }
  }

  function validateDrawer() {
    const draft = state.drawer.draft || {};
    const errors = {};

    if (!String(draft.titulo || "").trim()) {
      errors.titulo = "El título es obligatorio.";
    } else if (String(draft.titulo || "").trim().length < 3) {
      errors.titulo = "El título debe tener al menos 3 caracteres.";
    }

    if (!String(draft.descripcion || "").trim()) {
      errors.descripcion = "La descripción es obligatoria.";
    } else if (String(draft.descripcion || "").trim().length < 10) {
      errors.descripcion = "La descripción debe tener al menos 10 caracteres.";
    }

    state.drawer.errors = errors;
    return errors;
  }

  function isDrawerValid() {
    return Object.keys(state.drawer.errors || {}).length === 0;
  }

  function hasDrawerChanges() {
    if (state.drawer.mode === "create") return true;
    if (!state.drawer.original || !state.drawer.draft) return false;

    return JSON.stringify({
      titulo: String(state.drawer.original.titulo || "").trim(),
      pie_de_pagina: normalizeNullableText(state.drawer.original.pie_de_pagina),
      descripcion: String(state.drawer.original.descripcion || "").trim(),
      status: Number(state.drawer.original.status ?? 1) === 0 ? 0 : 1,
    }) !==
      JSON.stringify({
        titulo: String(state.drawer.draft.titulo || "").trim(),
        pie_de_pagina: normalizeNullableText(state.drawer.draft.pie_de_pagina),
        descripcion: String(state.drawer.draft.descripcion || "").trim(),
        status: Number(state.drawer.draft.status ?? 1) === 0 ? 0 : 1,
      });
  }

  function normalizeNullableText(value) {
    const v = String(value ?? "").trim();
    return v ? v : null;
  }

  async function toggleCardStatus(id, checked) {
    const item = state.items.find((x) => Number(x.id) === Number(id));
    if (!item) return;
    if (isStatusPending(id) || state.drawer.isSaving || state.drawer.media.isUploading) {
      return;
    }

    const empleadoId = getEmpleadoIdFromSession();
    if (!empleadoId) {
      toast("No se pudo identificar al empleado en sesión.", "warning");
      refreshView(false);
      return;
    }

    try {
      setStatusPending(id, true);
      refreshView(false);

      await sendJSON(API.UPDATE, {
        id: Number(id),
        status: checked ? 1 : 0,
        updated_by: empleadoId,
      });

      const isDrawerItem =
        state.drawer.isOpen && Number(state.drawer.selectedId) === Number(id);

      if (isDrawerItem) {
        state.drawer.draft.status = checked ? 1 : 0;
        state.drawer.draft.estatus = checked ? 1 : 0;
        state.drawer.original.status = checked ? 1 : 0;
        state.drawer.original.estatus = checked ? 1 : 0;
      }

      if (!checked && state.drawer.isOpen && Number(state.drawer.selectedId) === Number(id)) {
        closeDrawer({ silent: true });
      }

      const expectedTotal = checked ? state.total : Math.max(0, state.total - 1);
      const expectedPages = Math.max(1, Math.ceil(expectedTotal / state.limit));
      state.page = clamp(state.page, 1, expectedPages);

      await refreshRemoteList();
      refreshView(false);

      toast(
        checked ? "Noticia activada correctamente." : "Noticia desactivada correctamente.",
        "success"
      );
    } catch (error) {
      err("Error cambiando estatus:", error);
      refreshView(false);
      toast(getErrorMessage(error, "No se pudo actualizar el estatus."), "error");
    } finally {
      setStatusPending(id, false);
      refreshView(false);
    }
  }

  async function uploadDrawerImage(file) {
    const id = Number(state.drawer.selectedId || state.drawer.draft?.id || 0);

    if (!id) {
      toast("Primero guarda la noticia para poder subir la imagen.", "warning");
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

    try {
      state.drawer.media.isUploading = true;
      refreshView(false);

      const fd = new FormData();
      fd.append("bucket", NEWS_MEDIA_BUCKET);
      fd.append("target_dir", getNoticiaMediaTargetDir(id));
      fd.append("file_name", getNoticiaMediaFileBase(id));
      fd.append("replace", "1");

      const optimizedFile = await window.MediaUpload.compressImageForUpload(file, {
        profile: "photo",
        fileNameBase: getNoticiaMediaFileBase(id),
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
        throw new Error(
          json?.error || json?.message || json?.raw || `HTTP ${res.status}`
        );
      }

      setNoticiaMediaVersion(id);

      const newUrl = getNoticiaImageUrl(id);

      if (state.drawer.draft) state.drawer.draft.imagen = newUrl;
      if (state.drawer.original) state.drawer.original.imagen = newUrl;

      toast("Imagen actualizada correctamente.", "success");

      await refreshRemoteList();

      const current = state.items.find((x) => Number(x.id) === Number(id));
      if (current && state.drawer.draft) {
        state.drawer.draft = cloneItem(current);
        state.drawer.original = cloneItem(current);
      }

      state.drawer.media.isUploading = false;
      refreshView(false);
    } catch (error) {
      err("Error subiendo imagen:", error);
      state.drawer.media.isUploading = false;
      refreshView(false);
      toast(
        getErrorMessage(
          error,
          "No se pudo subir la imagen. Revisa bucket/ruta de media."
        ),
        "error"
      );
    }
  }

  function clearDrawerImageInput() {
    const input = document.querySelector("#admin-carrusel-image-input");
    if (input) input.value = "";
  }

  function render() {
    return `
      <section class="admin-module admin-module--carrusel">
        <div class="admin-module__head">
          <div class="admin-module__titlebox">
            <h2 class="admin-module__title">Gestión de carrusel de noticias.</h2>
            <p class="admin-module__subtitle">Administra las noticias visibles en el carrusel principal.</p>
          </div>
        </div>

        <div class="admin-module__body">
          <div class="admin-carousel">
            <div class="admin-carousel__grid">
              ${renderCards()}
            </div>

            ${renderPagination()}

            <button
              type="button"
              class="admin-carousel-fab"
              id="btn-add-carrusel"
              aria-label="Agregar noticia"
              title="Agregar noticia"
            >
              <span class="admin-carousel-fab__icon">+</span>
              <span class="admin-carousel-fab__tooltip">Agregar noticia</span>
            </button>
          </div>
        </div>
      </section>

      ${renderDrawer()}
    `;
  }

  function renderCards() {
    if (state.isLoading && !state.isReady) {
      return `
        <div class="admin-placeholder">
          <div class="admin-placeholder__inner">
            <h3 class="admin-placeholder__title">Cargando noticias…</h3>
            <p class="admin-placeholder__text">
              Espera un momento mientras se consulta la información.
            </p>
          </div>
        </div>
      `;
    }

    if (!state.items.length) {
      return `
        <div class="admin-placeholder">
          <div class="admin-placeholder__inner">
            <h3 class="admin-placeholder__title">No hay noticias en el carrusel</h3>
            <p class="admin-placeholder__text">
              Cuando existan registros, aparecerán aquí.
            </p>
          </div>
        </div>
      `;
    }

    return state.items
      .map((item) => {
        const statusLabel = Number(item.status) === 1 ? "Activo" : "Inactivo";
        const checked = Number(item.status) === 1 ? "checked" : "";
        const statusDisabled =
          isStatusPending(item.id) || state.drawer.isSaving || state.drawer.media.isUploading;

        return `
          <article
            class="admin-carousel-card admin-carousel-card--readonly js-carrusel-card"
            data-id="${item.id}"
            role="button"
            tabindex="0"
            aria-label="Abrir noticia ${escapeHtml(item.titulo)}"
          >
            <div class="admin-carousel-card__head">
              <h3 class="admin-carousel-card__title">${escapeHtml(item.titulo || "Título")}</h3>

              <div class="admin-carousel-card__actions">
                <span class="admin-carousel-card__status-label">${statusLabel}</span>

                <label class="admin-switch" title="Cambiar estatus">
                  <input
                    type="checkbox"
                    class="js-toggle-status"
                    data-id="${item.id}"
                    ${checked}
                    ${statusDisabled ? "disabled" : ""}
                  />
                  <span class="admin-switch__track">
                    <span class="admin-switch__text admin-switch__text--off"></span>
                    <span class="admin-switch__text admin-switch__text--on"></span>
                    <span class="admin-switch__thumb"></span>
                  </span>
                </label>
              </div>
            </div>

            <div class="admin-carousel-card__top">
              <div class="admin-carousel-card__image-wrap ${!item.imagen ? "is-empty" : ""}">
                <img
                  src="${escapeAttr(getNoticiaImageCandidates(item.id)[0])}"
                  alt="${escapeHtml(item.titulo || "Imagen de noticia")}"
                  class="admin-carousel-card__image"
                  data-fallback-index="0"
                  data-fallbacks='${escapeAttr(JSON.stringify(getNoticiaImageCandidates(item.id)))}'
                />
              </div>

              <div class="admin-carousel-card__fields">
                <div class="admin-carousel-field">
                  <span class="admin-carousel-field__label">Título</span>
                  <div class="admin-carousel-field__readonly">
                    ${escapeHtml(item.titulo || "Título")}
                  </div>
                </div>

                <div class="admin-carousel-field">
                  <span class="admin-carousel-field__label">Pie de pagina</span>
                  <div class="admin-carousel-field__readonly">
                    ${escapeHtml(item.pie_de_pagina || "Pie de pagina")}
                  </div>
                </div>
              </div>
            </div>

            <div class="admin-carousel-field admin-carousel-field--full">
              <span class="admin-carousel-field__label">Descripción</span>
              <div class="admin-carousel-field__readonly admin-carousel-field__readonly--textarea">
                ${formatText(item.descripcion || "Descripción")}
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderPagination() {
    if (state.totalPages <= 1) return "";

    const pages = buildPagination(state.page, state.totalPages);
    const start = state.total === 0 ? 0 : (state.page - 1) * state.limit + 1;
    const end = Math.min(state.page * state.limit, state.total);

    return `
      <div class="admin-pagination">
        <div class="admin-pagination__info">
          Mostrando ${start}-${end} de ${state.total} noticias
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

  function renderDrawer() {
    const isOpen = state.drawer.isOpen;
    const mode = state.drawer.mode;
    const item = state.drawer.draft;

    if (!isOpen || !item) {
      return `
      <div
        class="admin-drawer-overlay"
        id="admin-carrusel-drawer-overlay"
        aria-hidden="true"
      ></div>
    `;
    }

    const isEdit = mode === "edit" || mode === "create";
    const isCreate = mode === "create";
    const titleText = isCreate
      ? "Nueva noticia"
      : isEdit
        ? "Editar noticia"
        : "Detalle de noticia";

    const errors = state.drawer.errors || {};
    const statusLabel = Number(item.status) === 1 ? "Activo" : "Inactivo";
    const saveDisabled =
      state.drawer.isSaving ||
      state.drawer.media.isUploading ||
      (isCreate ? !isDrawerValid() : !(isDrawerValid() && hasDrawerChanges()));

    const imageCandidates = getNoticiaImageCandidates(item.id);
    const imageUrl = imageCandidates[0];

    return `
    <div
      class="admin-drawer-overlay is-open"
      id="admin-carrusel-drawer-overlay"
      aria-hidden="false"
    >
      <aside
        class="admin-drawer admin-drawer--right is-open"
        id="admin-carrusel-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-carrusel-drawer-title"
      >
        <div class="admin-drawer__head">
          <div>
            <h3 class="admin-drawer__title" id="admin-carrusel-drawer-title">
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
          <div class="admin-drawer__media-grid admin-drawer__media-grid--single">
            <section class="admin-drawer__media-slot admin-drawer__media-slot--noticia">
              <div class="admin-drawer__media-head">
                <span class="admin-drawer__label">Imagen</span>
              </div>

              <div class="admin-drawer__image-wrap ${item.id ? "" : "is-empty"}">
                <img
                  src="${escapeAttr(imageUrl)}"
                  alt="${escapeHtml(item.titulo || "Vista previa")}"
                  class="admin-drawer__image"
                  data-fallback-index="0"
                  data-fallbacks='${escapeAttr(JSON.stringify(imageCandidates))}'
                />
              </div>

              <button
                type="button"
                class="admin-drawer__ghost-btn js-change-image"
                ${!item.id || isCreate || state.drawer.media.isUploading ? "disabled" : ""}
                title="${!item.id || isCreate ? "Primero guarda la noticia" : "Cambiar imagen"}"
              >
                ${state.drawer.media.isUploading ? "Subiendo..." : "Reemplazar imagen"}
              </button>

              <input
                type="file"
                id="admin-carrusel-image-input"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif"
                hidden
              />
            </section>
          </div>

          <div class="admin-drawer__grid">

            <div class="admin-drawer__field">
              <label class="admin-drawer__label" for="admin-carrusel-titulo">Título</label>
              ${isEdit ? `
                <input
                  id="admin-carrusel-titulo"
                  type="text"
                  class="admin-drawer__input js-drawer-input ${errors.titulo ? "is-error" : ""}"
                  data-field="titulo"
                  value="${escapeAttr(item.titulo || "")}"
                  maxlength="180"
                />
              ` : `
                <div class="admin-drawer__readonly-value">
                  ${escapeHtml(item.titulo || "Sin título")}
                </div>
              `}
            </div>

            <div class="admin-drawer__field">
              <label class="admin-drawer__label" for="admin-carrusel-pie">Pie de pagina</label>
              ${isEdit ? `
                <input
                  id="admin-carrusel-pie"
                  type="text"
                  class="admin-drawer__input js-drawer-input"
                  data-field="pie_de_pagina"
                  value="${escapeAttr(item.pie_de_pagina || "")}"
                  maxlength="180"
                />
              ` : `
                <div class="admin-drawer__readonly-value">
                  ${escapeHtml(item.pie_de_pagina || "Sin pie de pagina")}
                </div>
              `}
            </div>

            <div class="admin-drawer__field admin-drawer__field--full">
              <label class="admin-drawer__label" for="admin-carrusel-descripcion">Descripción</label>
              ${isEdit ? `
                <textarea
                  id="admin-carrusel-descripcion"
                  class="admin-drawer__textarea js-drawer-input ${errors.descripcion ? "is-error" : ""}"
                  data-field="descripcion"
                  rows="8"
                >${escapeHtml(item.descripcion || "")}</textarea>
              ` : `
                <div class="admin-drawer__readonly-value admin-drawer__readonly-value--textarea">
                  ${formatText(item.descripcion || "Sin descripción")}
                </div>
              `}
            </div>

            <div class="admin-drawer__field">
               <label class="admin-drawer__label" for="admin-carrusel-status">Estado</label>
                  ${isEdit ? `
                  <select
                    id="admin-carrusel-status"
                    class="admin-drawer__select js-drawer-input"
                    data-field="status"
                >
                <option value="1" ${Number(item.status) === 1 ? "selected" : ""}>Activo</option>
                <option value="0" ${Number(item.status) === 0 ? "selected" : ""}>Inactivo</option>
              </select>
              ` : `
              <div class="admin-drawer__readonly-value">
              ${escapeHtml(statusLabel)}
              </div>
              `}
            </div>
          </div>
        </div>

        <div class="admin-drawer__footer">
          <div class="admin-drawer__footer-actions">
            ${mode === "view" ? `
              <button type="button" class="admin-drawer__primary-btn js-edit-drawer">
                Editar
              </button>
            ` : `
              <button
                type="button"
                class="admin-drawer__primary-btn js-save-drawer"
                ${saveDisabled ? "disabled" : ""}
              >
                ${state.drawer.isSaving ? "Guardando..." : isCreate ? "Crear" : "Guardar"}
              </button>
            `}

            ${!isCreate ? `
              <button type="button" class="admin-drawer__danger-btn js-delete-drawer">
                ${state.drawer.confirmDelete ? "Confirmar eliminación" : "Eliminar"}
              </button>
            ` : ""}

            <button
              type="button"
              class="admin-drawer__secondary-btn ${mode === "view" ? "js-drawer-close" : "js-cancel-drawer"}"
            >
              ${mode === "view" ? "Cerrar" : "Cancelar"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  `;
  }

  function bind() {
    const root = document.querySelector("#admin-view-root");
    if (!root) return;

    document.removeEventListener("keydown", handleDocumentKeydown);
    document.addEventListener("keydown", handleDocumentKeydown);

    wireImageFallbacks(root);
    syncDrawerUi(root);

    const btnAdd = root.querySelector("#btn-add-carrusel");
    if (btnAdd) {
      btnAdd.addEventListener("click", () => {
        openCreateDrawer();
      });
    }

    root.querySelectorAll(".js-carrusel-card").forEach((card) => {
      const id = Number(card.dataset.id || 0);
      if (!id) return;

      card.addEventListener("click", (event) => {
        if (event.target.closest(".js-toggle-status")) return;
        openItemDrawer(id);
      });

      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          if (event.target.closest(".js-toggle-status")) return;
          event.preventDefault();
          openItemDrawer(id);
        }
      });
    });

    root.querySelectorAll(".js-toggle-status").forEach((input) => {
      input.addEventListener("click", (event) => {
        event.stopPropagation();
      });

      input.addEventListener("change", async (event) => {
        const id = Number(event.currentTarget.dataset.id || 0);
        if (!id) return;
        await toggleCardStatus(id, Boolean(event.currentTarget.checked));
      });
    });

    root.querySelectorAll("[data-page]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const nextPage = Number(btn.dataset.page || 1);
        if (!nextPage || nextPage === state.page) return;

        state.page = clamp(nextPage, 1, state.totalPages);
        refreshView(false);

        try {
          await refreshRemoteList();
          refreshView(false);
        } catch (error) {
          err("Error cambiando página:", error);
          toast("No se pudo cambiar de página.", "error");
        }
      });
    });

    const overlay = root.querySelector("#admin-carrusel-drawer-overlay");
    if (overlay) {
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeDrawer();
      });
    }

    const btnClose = root.querySelector(".js-drawer-close");
    if (btnClose) btnClose.addEventListener("click", () => closeDrawer());

    const btnEdit = root.querySelector(".js-edit-drawer");
    if (btnEdit) btnEdit.addEventListener("click", () => enterEditMode());

    const btnCancel = root.querySelector(".js-cancel-drawer");
    if (btnCancel) btnCancel.addEventListener("click", () => cancelDrawerEdition());

    const btnSave = root.querySelector(".js-save-drawer");
    if (btnSave) btnSave.addEventListener("click", () => saveDrawer());

    const btnDelete = root.querySelector(".js-delete-drawer");
    if (btnDelete) {
      btnDelete.addEventListener("click", async () => {
        if (!state.drawer.confirmDelete) {
          state.drawer.confirmDelete = true;
          refreshView(false);
          toast("Presiona de nuevo para confirmar la eliminación.", "warning");
          return;
        }

        await deleteCurrentItem();
      });
    }

    root.querySelectorAll(".js-drawer-input").forEach((field) => {
      const handler = (event) => {
        const key = event.currentTarget.dataset.field;
        if (!key) return;

        updateDraftField(key, event.currentTarget.value);
      };

      field.addEventListener("input", handler);
      field.addEventListener("change", handler);
    });

    const btnChangeImage = root.querySelector(".js-change-image");
    const imageInput = root.querySelector("#admin-carrusel-image-input");

    if (btnChangeImage && imageInput) {
      btnChangeImage.addEventListener("click", () => {
        imageInput.click();
      });

      imageInput.addEventListener("change", async (event) => {
        const file = event.target.files?.[0];
        try {
          await uploadDrawerImage(file);
        } finally {
          clearDrawerImageInput();
        }
      });
    }
  }

  window.AdminCarrusel = {
    init,
    render,
    bind,
  };
})();
