(() => {
  //JS/UATV2/ui/adminNoticias.js
  "use strict";

  const TAG = "[AdminDepartamentos]";
  const log = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err = (...a) => console.error(TAG, ...a);
  const toast = (m, t = "info") =>
    window.gcToast ? window.gcToast(m, t) : console.log("[toast]", t, m);

  const API = {
    LIST: "/db/WEB/ixtla01_c_departamentoV2.php",
    CREATE: "/db/WEB/ixtla01_i_departamento.php",
    UPDATE: "/db/WEB/ixtla01_u_departamento.php",
    EMPLEADOS: "/db/WEB/ixtla01_c_empleado.php",
    MEDIA_UPLOAD: "/db/WEB/ixtla01_in_media.php",
  };

  const DEFAULT_IMAGE = "/ASSETS/main_logo_shield.png";

  const state = {
    items: [],
    filteredItems: [],
    pagedItems: [],
    query: "",
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
    employees: [],
    isLoading: false,
    mediaVersion: {},
    drawer: {
      isOpen: false,
      mode: "view", // view | edit | create
      selectedId: null,
      draft: null,
      original: null,
      errors: {},
      confirmDelete: false,
      isSaving: false,
    },
  };

  async function init() {
    state.isLoading = true;

    try {
      await Promise.all([loadEmployees(), loadDepartamentos()]);
    } catch (error) {
      err("Error inicializando módulo:", error);
      toast("No se pudo cargar el módulo de departamentos.", "error");
    } finally {
      state.isLoading = false;
    }
  }

  //--------------- helpers
  const DEPT_ASSETS_DIR = "/ASSETS/departamentos/";
  const DEPT_PLACEHOLDER = `${DEPT_ASSETS_DIR}placeholder_icon.png`;

  const DEPT_MEDIA_BUCKET = "departamentos";
  const DEPT_MEDIA_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "heic", "heif"];

  function getDepartamentoMediaFileBase(id) {
    const safeId = Number(id) || 0;
    return safeId ? `dep_img${safeId}` : "";
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

  // apartado para agregar timestamps a las urls de las imagenes
  // de departamentos para forzar el refresh de las iamgenes cuando se suba 
  // una nueva imagen.

  function getDepartamentoMediaVersion(id) {
    const safeId = Number(id) || 0;
    if (!safeId) return "";
    return state.mediaVersion[`departamento-${safeId}`] || "";
  }

  function setDepartamentoMediaVersion(id, version = Date.now()) {
    const safeId = Number(id) || 0;
    if (!safeId) return;
    state.mediaVersion[`departamento-${safeId}`] = version;
  }

  function withMediaVersion(url, version) {
    if (!url || !version) return url;
    if (url.includes("placeholder")) return url;
    return `${url}?v=${version}`;
  }

  function getDepartamentoMediaCandidates(id) {
    const baseName = getDepartamentoMediaFileBase(id);
    const version = getDepartamentoMediaVersion(id);

    if (!baseName) {
      return [DEPT_PLACEHOLDER];
    }

    return [
      ...DEPT_MEDIA_EXTENSIONS.map((ext) =>
        withMediaVersion(`${DEPT_ASSETS_DIR}${baseName}.${ext}`, version)
      ),
      DEPT_PLACEHOLDER,
    ];
  }

  async function uploadDepartamentoImage(file) {
    const id = Number(state.drawer.selectedId || state.drawer.draft?.id || 0);

    if (!id) {
      toast("Primero guarda el departamento para poder subir la imagen.", "warning");
      return;
    }

    if (!file) return;

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
      state.drawer.isSaving = true;
      refreshView(false);

      const fd = new FormData();
      fd.append("bucket", DEPT_MEDIA_BUCKET);
      fd.append("target_dir", "");
      fd.append("file_name", getDepartamentoMediaFileBase(id));
      fd.append("replace", "1");

      const optimizedFile = await window.MediaUpload.compressImageForUpload(file, {
        profile: "logo",
        fileNameBase: getDepartamentoMediaFileBase(id),
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

      setDepartamentoMediaVersion(id);

      toast("Imagen del departamento actualizada correctamente.", "success");

      state.drawer.isSaving = false;
      refreshView(false);
    } catch (error) {
      err("Error subiendo imagen del departamento:", error);
      state.drawer.isSaving = false;
      refreshView(false);
      toast(getErrorMessage(error, "No se pudo subir la imagen."), "error");
    }
  }

  function getDepartamentoImageCandidates(id) {
    return getDepartamentoMediaCandidates(id);
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

  async function confirmDeleteDepartamento() {
    if (state.drawer.isSaving) return;

    const id = Number(state.drawer.selectedId || 0);
    if (!id) return;

    state.drawer.isSaving = true;
    refreshView();

    try {
      const current = state.drawer.original || state.drawer.draft || {};

      await sendJSON(API.UPDATE, {
        id,
        nombre: String(current.nombre || "").trim(),
        descripcion: String(current.descripcion || "").trim(),
        director: Number(current.director),
        primera_linea: Number(current.primera_linea),
        status: 0,
        updated_by: getEmpleadoIdFromSession(),
      });

      toast("Departamento eliminado correctamente.", "success");
      closeDrawer({ silent: true });
      await refreshRemoteList();
    } catch (error) {
      err("Error eliminando departamento:", error);
      toast("No se pudo eliminar el departamento.", "error");
      state.drawer.isSaving = false;
      refreshView();
    }
  }

  function render() {
    return `
      <section class="admin-module admin-module--departamentos">
        <div class="admin-module__head">
          <div class="admin-module__titlebox">
            <h2 class="admin-module__title">Gestión de departamentos</h2>
          </div>

          <div class="admin-module__toolbar">
            <label class="search" aria-label="Buscar departamento">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M10 4a6 6 0 0 1 4.472 9.931l4.298 4.297l-1.414 1.415l-4.297-4.298A6 6 0 1 1 10 4m0 2a4 4 0 1 0 0 8a4 4 0 0 0 0-8"></path>
              </svg>
              <input
                id="admin-departamentos-search"
                type="search"
                placeholder="Buscar departamento"
                value="${escapeHtml(state.query)}"
              />
            </label>

            <button
              type="button"
              class="hs-btn"
              id="btn-add-departamento"
            >
              + Agregar Departamento
            </button>
          </div>
        </div>

        <div class="admin-module__body">
          <div class="hs-table table-wrap">
            <table class="gc">
              <thead>
                <tr>
                  <th>Departamento</th>
                  <th>Descripción</th>
                  <th>Imagen</th>
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

  function renderRows() {
    if (state.isLoading) {
      return `
        <tr>
          <td colspan="5">
            <div class="muted">Cargando departamentos...</div>
          </td>
        </tr>
      `;
    }

    if (!state.pagedItems.length) {
      return `
        <tr>
          <td colspan="5">
            <div class="muted">No se encontraron departamentos.</div>
          </td>
        </tr>
      `;
    }

    return state.pagedItems
      .map((item) => {
        const status = getStatusMeta(item.status);

        return `
          <tr data-id="${item.id}">
            <td>
              <strong>${escapeHtml(item.nombre)}</strong>
            </td>

            <td title="${escapeHtml(item.descripcion)}">
              ${escapeHtml(truncate(item.descripcion, 145))}
            </td>

            <td>
              ${renderDepartamentoImage(
          item.id,
          item.nombre,
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
                class="hs-btn js-edit-departamento"
                data-id="${item.id}"
              >
                Editar Departamento
              </button>
            </td>
          </tr>
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
          Mostrando ${start}-${end} de ${state.total} departamentos
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
        id="admin-departamentos-drawer-overlay"
        aria-hidden="true"
      ></div>
    `;
    }

    const isEdit = mode === "edit" || mode === "create";
    const isCreate = mode === "create";
    const titleText = isCreate
      ? "Nuevo departamento"
      : isEdit
        ? "Editar departamento"
        : "Detalle de departamento";

    const errors = state.drawer.errors || {};
    const statusLabel = Number(item.status) === 1 ? "Activo" : "Inactivo";
    const saveDisabled =
      state.drawer.isSaving ||
      (isCreate ? !isDrawerValid() : !(isDrawerValid() && hasDrawerChanges()));

    return `
  <div
    class="admin-drawer-overlay is-open"
    id="admin-departamentos-drawer-overlay"
    aria-hidden="false"
  >
    <aside
      class="admin-drawer admin-drawer--right is-open"
      id="admin-departamentos-drawer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-departamentos-drawer-title"
    >
      <div class="admin-drawer__head">
        <div>
          <h3 class="admin-drawer__title" id="admin-departamentos-drawer-title">
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
          <section class="admin-drawer__media-slot admin-drawer__media-slot--departamento">
            <div class="admin-drawer__media-head">
              <span class="admin-drawer__label">Imagen</span>
            </div>

            <div class="admin-drawer__image-wrap ${item.id ? "" : "is-empty"}">
              ${renderDepartamentoImage(
      item.id,
      item.nombre || "Vista previa",
      "admin-drawer__image admin-drawer__image--departamento"
    )}
            </div>

            <input
              type="file"
              id="admin-departamento-image-input"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              hidden
              ${!item.id || state.drawer.isSaving ? "disabled" : ""}
            />

            <div class="admin-drawer__image-actions">
              <button
                type="button"
                class="admin-drawer__ghost-btn js-change-departamento-image"
                ${!item.id || state.drawer.isSaving ? "disabled" : ""}
                title="${item.id ? "Seleccionar nueva imagen" : "Primero guarda el departamento"}"
              >
                Reemplazar imagen
              </button>
            </div>
          </section>
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
          ${errors.nombre ? `<span class="admin-drawer__error">${escapeHtml(errors.nombre)}</span>` : ""}
        </label>

        <label class="admin-drawer__field">
          <span class="admin-drawer__label">Descripción</span>
          <textarea
            class="admin-drawer__textarea js-drawer-input ${errors.descripcion ? "is-error" : ""}"
            data-field="descripcion"
            ${isEdit ? "" : "readonly"}
          >${escapeHtml(item.descripcion || "")}</textarea>
          ${errors.descripcion ? `<span class="admin-drawer__error">${escapeHtml(errors.descripcion)}</span>` : ""}
        </label>

        <label class="admin-drawer__field">
          <span class="admin-drawer__label">Estado</span>
          ${isEdit
        ? `
                <select class="admin-drawer__select js-drawer-input" data-field="status">
                  <option value="1" ${Number(item.status) === 1 ? "selected" : ""}>Activo</option>
                  <option value="0" ${Number(item.status) === 0 ? "selected" : ""}>Inactivo</option>
                </select>
              `
        : `
                <div class="admin-drawer__readonly-pill admin-drawer__readonly-pill--status admin-drawer__readonly-pill--${Number(item.status) === 1 ? "activo" : "inactivo"}">
                  ${escapeHtml(statusLabel)}
                </div>
              `
      }
        </label>

        <label class="admin-drawer__field">
          <span class="admin-drawer__label">Director</span>
          ${isEdit
        ? `
                <select
                  class="admin-drawer__select js-drawer-input ${errors.director ? "is-error" : ""}"
                  data-field="director"
                >
                  <option value="">Selecciona un director</option>
                  ${renderEmployeeOptions(item.director)}
                </select>
              `
        : `
                <div class="admin-drawer__readonly-pill">
                  ${escapeHtml(getEmployeeLabelById(item.director) || "—")}
                </div>
              `
      }
          ${errors.director ? `<span class="admin-drawer__error">${escapeHtml(errors.director)}</span>` : ""}
        </label>

        <label class="admin-drawer__field">
          <span class="admin-drawer__label">Primera línea</span>
          ${isEdit
        ? `
                <select
                  class="admin-drawer__select js-drawer-input ${errors.primera_linea ? "is-error" : ""}"
                  data-field="primera_linea"
                >
                  <option value="">Selecciona primera línea</option>
                  ${renderEmployeeOptions(item.primera_linea)}
                </select>
              `
        : `
                <div class="admin-drawer__readonly-pill">
                  ${escapeHtml(getEmployeeLabelById(item.primera_linea) || "—")}
                </div>
              `
      }
          ${errors.primera_linea ? `<span class="admin-drawer__error">${escapeHtml(errors.primera_linea)}</span>` : ""}
        </label>

        ${state.drawer.confirmDelete && !isCreate
        ? `
              <div class="admin-drawer__confirm">
                <p class="admin-drawer__confirm-text">
                  ¿Seguro que deseas desactivar este departamento?.
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
        ${state.drawer.isSaving ? "Guardando..." : "Guardar departamento"}
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
        ${state.drawer.isSaving ? "Guardando..." : "Guardar cambios"}
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
      class="admin-drawer__primary-btn js-switch-edit"
      ${state.drawer.isSaving ? "disabled" : ""}
    >
      Editar
    </button>
    <button
      type="button"
      class="admin-drawer__danger-btn js-delete-departamento"
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

  function renderEmployeeOptions(selectedId) {
    return state.employees
      .map((emp) => {
        const id = Number(emp.id) || 0;
        return `
          <option value="${id}" ${Number(selectedId) === id ? "selected" : ""}>
            ${escapeHtml(getEmployeeFullName(emp) || `Empleado ${id}`)}
          </option>
        `;
      })
      .join("");
  }

  function bind() {

    const cancelEditBtn = document.querySelector(".js-cancel-edit");
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener("click", () => {
        if (state.drawer.isSaving) return;

        if (state.drawer.mode === "create") {
          closeDrawer();
          return;
        }

        state.drawer.mode = "view";
        state.drawer.draft = clone(state.drawer.original);
        state.drawer.errors = {};
        state.drawer.confirmDelete = false;
        refreshView();
      });
    }

    const confirmDeleteBtn = document.querySelector(".js-confirm-delete");
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener("click", async () => {
        if (state.drawer.isSaving) return;
        await confirmDeleteDepartamento();
      });
    }

    const cancelDeleteBtn = document.querySelector(".js-cancel-delete");
    if (cancelDeleteBtn) {
      cancelDeleteBtn.addEventListener("click", () => {
        if (state.drawer.isSaving) return;
        state.drawer.confirmDelete = false;
        refreshView();
      });
    }

    const root = document.querySelector("#admin-view-root");
    if (!root) return;

    const search = root.querySelector("#admin-departamentos-search");
    if (search) {
      search.addEventListener("input", handleSearchInput);
    }

    root.querySelectorAll(".admin-pagination__btn, .admin-pagination__page").forEach((btn) => {
      btn.addEventListener("click", handlePageClick);
    });

    const btnAdd = root.querySelector("#btn-add-departamento");
    if (btnAdd) {
      btnAdd.addEventListener("click", handleCreateClick);
    }

    root.querySelectorAll(".js-edit-departamento").forEach((btn) => {
      btn.addEventListener("click", handleEditClick);
    });

    const overlay = document.querySelector("#admin-departamentos-drawer-overlay");
    if (overlay) {
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay && !state.drawer.isSaving) {
          closeDrawer();
        }
      });
    }

    document.querySelectorAll(".js-drawer-close").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!state.drawer.isSaving) closeDrawer();
      });
    });

    const switchEdit = document.querySelector(".js-switch-edit");
    if (switchEdit) {
      switchEdit.addEventListener("click", () => {
        state.drawer.mode = "edit";
        state.drawer.errors = {};
        refreshView();
      });
    }

    document.querySelectorAll(".js-drawer-input").forEach((field) => {
      field.addEventListener("input", handleDrawerFieldChange);
      field.addEventListener("change", handleDrawerFieldChange);
    });

    const saveBtn = document.querySelector(".js-save-drawer");
    if (saveBtn) {
      saveBtn.addEventListener("click", handleSaveDrawer);
    }

    const deleteBtn = document.querySelector(".js-delete-departamento");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", handleDeleteDepartamento);
    }

    // aqui va el apartado para el bind de los  botones para subida de media de 
    // departamentos.
    const changeImageBtn = document.querySelector(".js-change-departamento-image");
    const imageInput = document.querySelector("#admin-departamento-image-input");

    if (changeImageBtn && imageInput) {
      changeImageBtn.addEventListener("click", () => {
        if (state.drawer.isSaving) return;
        imageInput.click();
      });

      imageInput.addEventListener("change", async (event) => {
        const file = event.target?.files?.[0];
        event.target.value = "";

        if (!file) return;

        await uploadDepartamentoImage(file);
      });
    }



    wireDepartmentImageFallbacks(document.querySelector("#admin-view-root"));
  }
  //--------------- fin del render y bind

  async function handleSearchInput(event) {
    state.query = String(event.target.value || "");
    state.page = 1;
    await refreshRemoteList();
  }

  async function handlePageClick(event) {
    const btn = event.currentTarget;
    if (!btn || btn.disabled) return;

    const nextPage = Number(btn.dataset.page || 1);
    if (!Number.isFinite(nextPage) || nextPage < 1 || nextPage === state.page) return;

    state.page = nextPage;
    await refreshRemoteList();
  }

  function handleCreateClick() {
    state.drawer = {
      isOpen: true,
      mode: "create",
      selectedId: null,
      draft: {
        id: null,
        nombre: "",
        descripcion: "",
        director: "",
        primera_linea: "",
        status: 1,
        imagen: "",
      },
      original: null,
      errors: {},
      confirmDelete: false,
      isSaving: false,
    };

    refreshView();
  }

  function handleEditClick(event) {
    const id = Number(event.currentTarget?.dataset?.id || 0);
    if (!id) return;

    const item = state.items.find((row) => Number(row.id) === id);
    if (!item) {
      toast("No se encontró el departamento seleccionado.", "warning");
      return;
    }

    state.drawer = {
      isOpen: true,
      mode: "view",
      selectedId: id,
      draft: clone(item),
      original: clone(item),
      errors: {},
      confirmDelete: false,
      isSaving: false,
    };

    refreshView();
  }

  function handleDrawerFieldChange(event) {
    const field = event.currentTarget;
    const key = field?.dataset?.field;
    if (!key || !state.drawer.draft) return;

    state.drawer.draft[key] = field.value;

    if (state.drawer.errors[key]) {
      delete state.drawer.errors[key];
    }

    syncDrawerUi(document.querySelector("#admin-departamentos-drawer"));
  }

  async function handleSaveDrawer() {
    if (state.drawer.isSaving) return;

    const errors = validateDrawer(state.drawer.draft);
    state.drawer.errors = errors;
    syncDrawerUi(document.querySelector("#admin-departamentos-drawer"));

    if (Object.keys(errors).length) {
      toast("Revisa los campos marcados en el formulario.", "warning");
      return;
    }

    try {
      state.drawer.isSaving = true;
      refreshView();

      if (state.drawer.mode === "create") {
        await createDepartamento();
        toast("Departamento creado correctamente.", "success");
      } else {
        await updateDepartamento();
        toast("Departamento actualizado correctamente.", "success");
      }

      closeDrawer({ silent: true });
      await refreshRemoteList();
    } catch (error) {
      err("Error guardando departamento:", error);
      toast(getErrorMessage(error, "No se pudo guardar el departamento."), "error");
      state.drawer.isSaving = false;
      refreshView();
    }
  }

  function handleDeleteDepartamento() {
    if (state.drawer.isSaving) return;
    state.drawer.confirmDelete = true;
    refreshView();
  }

  async function createDepartamento() {
    const draft = state.drawer.draft || {};
    const payload = {
      nombre: String(draft.nombre || "").trim(),
      descripcion: String(draft.descripcion || "").trim(),
      director: Number(draft.director),
      primera_linea: Number(draft.primera_linea),
      status: Number(draft.status ?? 1),
      created_by: getEmpleadoIdFromSession(),
    };

    const json = await sendJSON(API.CREATE, payload);

    if (!json?.ok) {
      throw new Error(json?.error || json?.message || "No se pudo crear el departamento.");
    }

    return json;
  }

  async function updateDepartamento() {
    const draft = state.drawer.draft || {};
    const payload = {
      id: Number(draft.id),
      nombre: String(draft.nombre || "").trim(),
      descripcion: String(draft.descripcion || "").trim(),
      director: Number(draft.director),
      primera_linea: Number(draft.primera_linea),
      status: Number(draft.status ?? 1),
      updated_by: getEmpleadoIdFromSession(),
    };

    const json = await sendJSON(API.UPDATE, payload);

    if (!json?.ok) {
      throw new Error(json?.error || json?.message || "No se pudo actualizar el departamento.");
    }

    return json;
  }

  async function refreshRemoteList() {
    state.isLoading = true;
    refreshView();

    try {
      await loadDepartamentos();
    } catch (error) {
      err("Error refrescando listado:", error);
      toast("No se pudo actualizar el listado de departamentos.", "error");
    } finally {
      state.isLoading = false;
      refreshView();
    }
  }

  async function loadDepartamentos() {
    const payload = {
      q: String(state.query || "").trim(),
      page: state.page,
      per_page: state.limit,
    };

    log("Consultando departamentos:", payload);

    const json = await sendJSON(API.LIST, payload);

    if (!json?.ok) {
      throw new Error(json?.error || json?.message || "No se pudo consultar departamentos.");
    }

    state.items = Array.isArray(json.data) ? json.data.map(normalizeDepartamento) : [];
    state.filteredItems = clone(state.items);
    state.pagedItems = clone(state.items);
    state.total = Number(json.total || 0);
    state.totalPages = Math.max(1, Number(json.total_pages || 1));
    state.page = clamp(Number(json.page || state.page || 1), 1, state.totalPages);

    applyDerivedLabels();
  }

  async function loadEmployees() {
    const all = [];
    let page = 1;
    let totalPages = 1;

    do {
      const payload = {
        status: 1,
        page,
        per_page: 100,
      };

      const json = await sendJSON(API.EMPLEADOS, payload);

      if (!json?.ok) {
        throw new Error(json?.error || json?.message || "No se pudo consultar empleados.");
      }

      const rows = Array.isArray(json.data) ? json.data : [];
      all.push(...rows.map(normalizeEmployee));

      const metaTotalPages =
        Number(json?.meta?.total_pages || 0) ||
        Number(json?.total_pages || 0) ||
        1;

      totalPages = Math.max(1, metaTotalPages);
      page += 1;
    } while (page <= totalPages);

    state.employees = all.sort((a, b) =>
      getEmployeeFullName(a).localeCompare(getEmployeeFullName(b), "es")
    );

    log("Empleados cargados:", state.employees.length);
  }

  function normalizeDepartamento(item) {
    return {
      ...item,
      id: Number(item?.id || 0),
      nombre: String(item?.nombre || ""),
      descripcion: String(item?.descripcion || ""),
      director: toNullableNumber(item?.director),
      primera_linea: toNullableNumber(item?.primera_linea),
      status: Number(item?.status ?? 1),
      created_by: toNullableNumber(item?.created_by),
      updated_by: toNullableNumber(item?.updated_by),
      imagen: item?.imagen || "",
      director_nombre: String(item?.director_nombre || ""),
      director_apellidos: String(item?.director_apellidos || ""),
      primera_nombre: String(item?.primera_nombre || ""),
      primera_apellidos: String(item?.primera_apellidos || ""),
    };
  }

  function normalizeEmployee(emp) {
    return {
      ...emp,
      id: Number(emp?.id || 0),
      nombre: String(emp?.nombre || ""),
      apellidos: String(emp?.apellidos || ""),
      puesto: String(emp?.puesto || ""),
      status: Number(emp?.status ?? 1),
    };
  }

  function applyDerivedLabels() {
    state.items = state.items.map((item) => {
      const director = getEmployeeById(item.director);
      const primeraLinea = getEmployeeById(item.primera_linea);

      return {
        ...item,
        director_nombre: director?.nombre || item.director_nombre || "",
        director_apellidos: director?.apellidos || item.director_apellidos || "",
        primera_nombre: primeraLinea?.nombre || item.primera_nombre || "",
        primera_apellidos: primeraLinea?.apellidos || item.primera_apellidos || "",
      };
    });

    state.filteredItems = clone(state.items);
    state.pagedItems = clone(state.items);
  }

  function closeDrawer(options = {}) {
    const { silent = false } = options;

    state.drawer = {
      isOpen: false,
      mode: "view",
      selectedId: null,
      draft: null,
      original: null,
      errors: {},
      confirmDelete: false,
      isSaving: false,
    };

    if (!silent) refreshView();
  }

  function syncDrawerUi(root) {
    if (!root) return;

    const errors = state.drawer.errors || {};
    const mode = state.drawer.mode;
    const isCreate = mode === "create";
    const saveBtn = root.querySelector(".js-save-drawer");
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

    if (saveBtn) {
      saveBtn.disabled = saveDisabled;
    }
  }

  function validateDrawer(draft) {
    const next = {};
    const nombre = String(draft?.nombre || "").trim();
    const descripcion = String(draft?.descripcion || "").trim();
    const director = Number(draft?.director || 0);
    const primera = Number(draft?.primera_linea || 0);

    if (!nombre) next.nombre = "El nombre es obligatorio.";
    else if (nombre.length < 3) next.nombre = "Escribe un nombre más descriptivo.";

    if (!descripcion) next.descripcion = "La descripción es obligatoria.";
    else if (descripcion.length < 10) next.descripcion = "La descripción es demasiado corta.";

    if (!director) next.director = "Selecciona un director.";
    if (!primera) next.primera_linea = "Selecciona primera línea.";

    return next;
  }

  function isDrawerValid() {
    return Object.keys(validateDrawer(state.drawer.draft)).length === 0;
  }

  function hasDrawerChanges() {
    if (!state.drawer.original || !state.drawer.draft) return false;

    const a = normalizeDraftForCompare(state.drawer.original);
    const b = normalizeDraftForCompare(state.drawer.draft);

    return JSON.stringify(a) !== JSON.stringify(b);
  }

  function normalizeDraftForCompare(item) {
    return {
      nombre: String(item?.nombre || "").trim(),
      descripcion: String(item?.descripcion || "").trim(),
      director: String(item?.director ?? ""),
      primera_linea: String(item?.primera_linea ?? ""),
      status: String(item?.status ?? 1),
    };
  }

  function getEmployeeById(id) {
    const needle = Number(id || 0);
    if (!needle) return null;
    return state.employees.find((emp) => Number(emp.id) === needle) || null;
  }

  function getEmployeeFullName(emp) {
    if (!emp) return "";
    return [emp.nombre, emp.apellidos].filter(Boolean).join(" ").trim();
  }

  function getEmployeeLabelById(id) {
    const emp = getEmployeeById(id);
    if (!emp) return "";
    return getEmployeeFullName(emp);
  }

  function getStatusMeta(value) {
    const code = Number(value);

    if (code === 1) {
      return { key: "activo", label: "Activo" };
    }

    if (code === 0) {
      return { key: "inactivo", label: "Inactivo" };
    }

    return { key: "inactivo", label: "Inactivo" };
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

    if (!res.ok) {
      throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
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

  function truncate(text, max = 120) {
    const value = String(text || "").trim();
    if (value.length <= max) return value;
    return `${value.slice(0, max).trim()}...`;
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
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

  function toNullableNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
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

  window.AdminDepartamentos = {
    init,
    render,
    bind,
  };
})();