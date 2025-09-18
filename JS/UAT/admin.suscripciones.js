/* ==================== SUSCRIPCIONES (UAT) — Listado + Drawer ==================== */
(() => {
  "use strict";
  const TAG = "[Suscripciones]";

  /* ---------- API ---------- */
  const API_BASE =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/";
  const API = {
    suscripciones:
      window.API?.suscripciones || API_BASE + "c_suscripciones.php",
    iInscripcion: window.API?.iInscripcion || API_BASE + "i_inscripcion.php",
    uInscripcion: window.API?.uInscripcion || API_BASE + "u_inscripcion.php",
    cursos: window.API?.cursos || API_BASE + "c_cursos.php",
    usuarios: window.API?.usuarios || API_BASE + "c_usuarios.php",
  };

  /* ---------- Estado ---------- */
  const S = {
    page: 1,
    pageSize: 7,
    search: "",
    data: [],
    raw: [],
    maps: { cursos: null, usuarios: {} },
    current: null,
    create: { cursoId: null, usuario: null },
  };
  window.__SuscripcionesState = S;

  /* ---------- Utils ---------- */
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [].slice.call(r.querySelectorAll(s));
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[c])
    );
  const norm = (s) =>
    String(s || "")
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .trim();
  const fmtDateTime = (dt) => {
    if (!dt) return "-";
    try {
      const [d, t = ""] = String(dt).split(" ");
      const [y, m, da] = d.split("-");
      return `${da}/${m}/${y} ${t}`.trim();
    } catch {
      return dt;
    }
  };
  function toast(msg, type = "info", ms = 2200) {
    if (window.gcToast) return window.gcToast(msg, type, ms);
    console.log(`${TAG} toast[${type}]:`, msg);
  }

  async function postJSON(url, body) {
    console.log(TAG, "POST", url, { body });
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    const text = await r.text().catch(() => "");
    console.log(TAG, "HTTP", r.status, "raw:", text);
    if (!r.ok) throw new Error(`HTTP ${r.status} ${text}`);
    try {
      const j = JSON.parse(text);
      console.log(TAG, "JSON OK:", j);
      return j;
    } catch {}
    const fb = text.indexOf("{"),
      lb = text.lastIndexOf("}");
    const fb2 = text.indexOf("["),
      lb2 = text.lastIndexOf("]");
    let c = "";
    if (fb !== -1 && lb !== -1 && lb > fb) c = text.slice(fb, lb + 1);
    else if (fb2 !== -1 && lb2 !== -1 && lb2 > fb2)
      c = text.slice(fb2, lb2 + 1);
    if (c) {
      try {
        const j2 = JSON.parse(c);
        console.warn(TAG, "JSON trimmed:", j2);
        return j2;
      } catch {}
    }
    console.warn(TAG, "JSON parse failed; returning _raw");
    return { _raw: text };
  }

  function getCreatorId() {
    try {
      const raw = document.cookie
        .split("; ")
        .find((r) => r.startsWith("usuario="));
      if (!raw) return null;
      const json = decodeURIComponent(raw.split("=")[1] || "");
      const u = JSON.parse(json);
      const n = Number(u?.id);
      return Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  }

  function arrToMap(arr) {
    const m = {};
    (Array.isArray(arr) ? arr : []).forEach((x) => {
      if (x && x.id != null) m[x.id] = x.nombre || x.titulo || `#${x.id}`;
    });
    return m;
  }
  function mapCursosLabel(id) {
    const m = S.maps.cursos || {};
    const k = String(id ?? "");
    return k in m ? m[k] || `#${id}` : `#${id}`;
  }
  function mapUserLabel(id) {
    const m = S.maps.usuarios || {};
    const k = String(id ?? "");
    return k in m ? m[k] || `#${id}` : `#${id}`;
  }

  async function resolveUserName(id) {
    if (!id) return null;
    const k = String(id);
    if (k in S.maps.usuarios) return S.maps.usuarios[k];
    const candidates = [
      { id },
      { usuario: id },
      { usuario_id: id },
      { alumno: id },
      { alumno_id: id },
    ];
    for (const body of candidates) {
      try {
        const res = await postJSON(API.usuarios, body);
        const arr = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.usuarios)
          ? res.usuarios
          : res && typeof res === "object"
          ? [res]
          : [];
        const u = arr[0];
        if (u) {
          const nombre =
            u.nombre_completo ||
            u.nombre ||
            [u.nombre1, u.nombre2, u.apellido_paterno, u.apellido_materno]
              .filter(Boolean)
              .join(" ") ||
            `#${id}`;
          S.maps.usuarios[k] = nombre;
          return nombre;
        }
      } catch (e) {
        console.warn(TAG, "resolveUserName falló:", body, e);
      }
    }
    S.maps.usuarios[k] = `#${id}`;
    return S.maps.usuarios[k];
  }

  const STATUS_LABEL = { 1: "Activo", 0: "Inactivo", 2: "Pausado" };
  function statusBadge(tipo, s) {
    if (window.statusBadge) return window.statusBadge(tipo, s);
    const label = STATUS_LABEL[Number(s)] || String(s);
    return `<span class="gc-chip">${label}</span>`;
  }
  function statusSelect(id, val) {
    const v = Number(val);
    const opts = Object.entries(STATUS_LABEL)
      .map(
        ([k, lab]) =>
          `<option value="${k}"${
            Number(k) === v ? " selected" : ""
          }>${lab}</option>`
      )
      .join("");
    return `<select id="${id}">${opts}</select>`;
  }

  /* ---------- Drawer helpers ---------- */
  function ensureDrawerDOM() {
    // sólo crea si no existe
    if (qs("#drawer-suscripcion")) {
      // asegura que el botón cerrar funcione aunque el drawer exista en HTML estático
      const btn = qs("#drawer-suscripcion-close");
      if (btn && !btn._b) {
        btn._b = true;
        btn.addEventListener("click", closeDrawer);
      }
      return;
    }
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <aside id="drawer-suscripcion" class="drawer gc-dash" aria-hidden="true" hidden>
        <div class="drawer-header">
          <div class="drawer-title" id="drawer-suscripcion-title">Suscripción · —</div>
          <div class="drawer-actions"><button class="btn" id="drawer-suscripcion-close">Cerrar</button></div>
        </div>
        <div class="drawer-body" id="drawer-suscripcion-body"></div>
      </aside>`;
    document.body.appendChild(wrap.firstElementChild);
    qs("#drawer-suscripcion-close")?.addEventListener("click", closeDrawer);
  }
  function openDrawer(title, html) {
    ensureDrawerDOM();
    const aside = qs("#drawer-suscripcion");
    const overlay = qs("#gc-dash-overlay");
    const t = qs("#drawer-suscripcion-title");
    const b = qs("#drawer-suscripcion-body");
    if (t) t.textContent = title || "Suscripción · —";
    if (b) b.innerHTML = html || "";
    aside.classList.add("open");
    aside.removeAttribute("hidden");
    aside.setAttribute("aria-hidden", "false");
    if (overlay) {
      overlay.classList.add("open");
      overlay.hidden = false;
      overlay.setAttribute("aria-hidden", "false");
    }
  }
  function closeDrawer() {
    const aside = qs("#drawer-suscripcion");
    const overlay = qs("#gc-dash-overlay");
    if (!aside) return;
    try {
      const ae = document.activeElement;
      if (ae && aside.contains(ae)) ae.blur();
    } catch {}
    aside.classList.remove("open");
    aside.setAttribute("hidden", "");
    aside.setAttribute("aria-hidden", "true");
    if (overlay) {
      overlay.classList.remove("open");
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden", "true");
    }
  }
  // Cerrar por overlay/Escape + delegación global para el botón Cerrar (robusto)
  (function bindOnce() {
    const ov = qs("#gc-dash-overlay");
    if (ov && !ov._sub_b) {
      ov._sub_b = true;
      ov.addEventListener("click", closeDrawer);
    }
    if (!window._gc_subs_esc) {
      window._gc_subs_esc = true;
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeDrawer();
      });
    }
    if (!window._gc_subs_closebtn) {
      window._gc_subs_closebtn = true;
      document.addEventListener("click", (e) => {
        const t = e.target;
        if (!t) return;
        if (
          t.id === "drawer-suscripcion-close" ||
          t.closest?.("#drawer-suscripcion-close")
        )
          closeDrawer();
      });
    }
  })();

  /* ---------- Catálogos ---------- */
  async function loadCatalogos() {
    try {
      const stsList = [1, 2, 4];
      const chunks = await Promise.all(
        stsList.map((st) =>
          postJSON(API.cursos, { estatus: st }).catch(() => [])
        )
      );
      const flat = chunks.flat().filter(Boolean);
      S.maps.cursos = arrToMap(flat);
      console.log(TAG, "Catálogo cursos:", S.maps.cursos);
    } catch (e) {
      console.warn(TAG, "No se pudieron cargar catálogos de cursos:", e);
    }
  }

  /* ---------- Listado ---------- */
  async function load() {
    console.log(TAG, "load()…");
    try {
      const sts = [1, 0, 2];
      const chunks = await Promise.all(
        sts.map((st) =>
          postJSON(API.suscripciones, { estatus: st }).catch(() => [])
        )
      );
      const flat = chunks.flat().filter(Boolean);
      S.raw = flat;
      S.data = flat.map((x) => {
        const id = Number(x.id ?? x.suscripcion_id ?? x.inscripcion_id ?? 0);
        const usuario_id =
          Number(
            x.usuario_id ??
              x.user_id ??
              x.alumno ??
              x.alumno_id ??
              x.usuario ??
              0
          ) || null;
        const curso_id =
          Number(x.curso ?? x.curso_id ?? x.id_curso ?? 0) || null;
        const nombreInline =
          x.alumno_nombre ||
          x.usuario_nombre ||
          x.suscriptor ||
          x.usuario ||
          x.user ||
          null;
        return {
          id,
          usuario_id,
          curso: curso_id,
          estatus: Number(x.estatus ?? x.status ?? 0),
          fecha_creacion: x.fecha_creacion ?? x.creado ?? x.created_at ?? null,
          comentario: x.comentario ?? x.nota ?? "",
          alumnoNombre: nombreInline,
          _all: x,
        };
      });
      const missing = [
        ...new Set(
          S.data
            .filter((r) => !r.alumnoNombre && r.usuario_id)
            .map((r) => r.usuario_id)
        ),
      ].filter((id) => !(String(id) in S.maps.usuarios));
      for (const id of missing) await resolveUserName(id);
      S.data.forEach((r) => {
        if (!r.alumnoNombre && r.usuario_id)
          r.alumnoNombre = mapUserLabel(r.usuario_id);
      });
      S.page = 1;
      render();
    } catch (e) {
      console.error(TAG, "load ERROR:", e);
      const hostD = qs("#recursos-list");
      if (hostD)
        hostD.innerHTML = `<div class="table-row"><div class="col-nombre">Error cargando suscripciones</div></div>`;
    }
  }

  function render() {
    const hostD = qs("#recursos-list"),
      hostM = qs("#recursos-list-mobile");
    if (hostD) hostD.innerHTML = "";
    if (hostM) hostM.innerHTML = "";
    const term = norm(S.search);
    const filtered = term
      ? S.data.filter((r) =>
          norm(
            `${r.alumnoNombre || ""} ${mapCursosLabel(
              r.curso
            )} ${JSON.stringify(r._all || {})}`
          ).includes(term)
        )
      : S.data;
    const modCount = qs("#mod-count");
    if (modCount)
      modCount.textContent = `${filtered.length} ${
        filtered.length === 1 ? "elemento" : "elementos"
      }`;
    const totalPages = Math.max(1, Math.ceil(filtered.length / S.pageSize));
    if (S.page > totalPages) S.page = totalPages;
    const start = (S.page - 1) * S.pageSize;
    const pageRows = filtered.slice(start, start + S.pageSize);

    if (hostD) {
      if (!pageRows.length) {
        hostD.insertAdjacentHTML(
          "beforeend",
          `<div class="table-row"><div class="col-nombre">Sin resultados</div></div>`
        );
      } else {
        pageRows.forEach((it) => {
          hostD.insertAdjacentHTML(
            "beforeend",
            `
            <div class="table-row" role="row" data-mod="suscripcion" data-id="${
              it.id
            }">
              <div class="col-nombre" role="cell">${esc(
                String(it.alumnoNombre || "—")
              )}</div>
              <div class="col-curso"  role="cell">${esc(
                mapCursosLabel(it.curso)
              )}</div>
              <div class="col-fecha"  role="cell">${esc(
                fmtDateTime(it.fecha_creacion)
              )}</div>
              <div class="col-status" role="cell">${statusBadge(
                "suscripciones",
                it.estatus
              )}</div>
            </div>
          `
          );
        });
        qsa('.table-row[data-mod="suscripcion"]', hostD).forEach((row) => {
          row.addEventListener("click", () => {
            const id = Number(row.dataset.id);
            const it = S.data.find((x) => +x.id === +id);
            if (it) openView(it);
          });
        });
      }
    }

    if (hostM) {
      if (!pageRows.length) {
        hostM.insertAdjacentHTML(
          "beforeend",
          `<div class="table-row"><div class="col-nombre">Sin resultados</div></div>`
        );
      } else {
        pageRows.forEach((it) => {
          hostM.insertAdjacentHTML(
            "beforeend",
            `
            <div class="table-row-mobile" data-mod="suscripcion" data-id="${
              it.id
            }">
              <div class="row-head">
                <div class="title">${esc(String(it.alumnoNombre || "—"))}</div>
                <button class="open-drawer gc-btn" type="button">Ver</button>
              </div>
            </div>
          `
          );
        });
        qsa(
          '.table-row-mobile[data-mod="suscripcion"] .open-drawer',
          hostM
        ).forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = Number(
              btn.closest('.table-row-mobile[data-mod="suscripcion"]')?.dataset
                .id || 0
            );
            const it = S.data.find((x) => +x.id === +id);
            if (it) openView(it);
          });
        });
      }
    }

    renderPagination(filtered.length);
  }

  function renderPagination(total) {
    const totalPages = Math.max(1, Math.ceil(total / S.pageSize));
    [qs("#pagination-controls"), qs("#pagination-mobile")].forEach((cont) => {
      if (!cont) return;
      cont.innerHTML = "";
      if (totalPages <= 1) return;
      const mk = (txt, dis, cb, cls = "page-btn") => {
        const b = document.createElement("button");
        b.textContent = txt;
        b.className = cls + (dis ? " disabled" : "");
        if (dis) b.disabled = true;
        else b.onclick = cb;
        return b;
      };
      cont.appendChild(
        mk(
          "‹",
          S.page === 1,
          () => {
            S.page = Math.max(1, S.page - 1);
            render();
          },
          "arrow-btn"
        )
      );
      for (let p = 1; p <= totalPages && p <= 7; p++) {
        const b = mk(String(p), false, () => {
          S.page = p;
          render();
        });
        if (p === S.page) b.classList.add("active");
        cont.appendChild(b);
      }
      cont.appendChild(
        mk(
          "›",
          S.page === totalPages,
          () => {
            S.page = Math.min(totalPages, S.page + 1);
            render();
          },
          "arrow-btn"
        )
      );
    });
  }

  /* ---------- Drawer: Ver ---------- */
  function openView(row) {
    S.current = { id: row.id, _all: row._all };
    const cursoLabel = mapCursosLabel(row.curso);
    openDrawer(
      `Suscripción · ${cursoLabel}`,
      renderDrawerView({
        ...row._all,
        _cursoLabel: cursoLabel,
        _alumnoNombre: row.alumnoNombre || mapUserLabel(row.usuario_id),
      })
    );
    bindViewActions(row);
  }

  function renderDrawerView(data) {
    const jsonPretty = `
      <details class="dev-json" open style="margin-top:12px;">
        <summary style="cursor:pointer;font-weight:600;">JSON · Suscripción</summary>
        <div style="display:flex;gap:.5rem;margin:.5rem 0;"><button class="gc-btn" id="btn-copy-json-sus">Copiar JSON</button></div>
        <pre id="json-sus" class="value" style="white-space:pre-wrap;max-height:260px;overflow:auto;">${esc(
          JSON.stringify(data || {}, null, 2)
        )}</pre>
      </details>`;
    return `
      <section id="sus-view" class="mode-view">
        <div class="gc-actions" id="sus-actions-view">
          <button class="gc-btn" id="sus-edit">Editar</button>
          ${
            Number(data?.estatus) === 0
              ? `<button class="gc-btn gc-btn--success" id="sus-reactivar">Reactivar</button>`
              : `<button class="gc-btn gc-btn--danger" id="sus-eliminar" data-step="1">Eliminar</button>`
          }
        </div>
        <div class="field"><div class="label">Suscriptor</div><div class="value" id="sv_alumno">${esc(
          String(data?._alumnoNombre || "—")
        )}</div></div>
        <div class="field"><div class="label">Curso</div><div class="value" id="sv_curso">${esc(
          String(data?._cursoLabel || "—")
        )}</div></div>
        <div class="field"><div class="label">Estatus</div><div class="value" id="sv_estatus">${esc(
          STATUS_LABEL[Number(data?.estatus)] || String(data?.estatus ?? "—")
        )}</div></div>
        <div class="field"><div class="label">Fecha y hora de suscripción</div><div class="value" id="sv_fecha_creacion">${esc(
          fmtDateTime(data?.fecha_creacion)
        )}</div></div>
        <div class="field"><div class="label">Comentario</div><div class="value" id="sv_comentario">${esc(
          String(data?.comentario ?? data?.nota ?? "")
        )}</div></div>
        ${jsonPretty}
      </section>`;
  }

  function bindViewActions(row) {
    qs("#sus-edit")?.addEventListener("click", () => {
      openDrawer(
        `Suscripción · ${mapCursosLabel(row.curso)}`,
        renderDrawerEdit({
          ...row._all,
          _cursoLabel: mapCursosLabel(row.curso),
          _alumnoNombre: row.alumnoNombre || mapUserLabel(row.usuario_id),
        })
      );
      bindEditActions(row._all, row.id);
    });
    const btnDel = qs("#sus-eliminar");
    if (btnDel) {
      btnDel.addEventListener("click", async () => {
        if (btnDel.dataset.step !== "2") {
          btnDel.dataset.step = "2";
          btnDel.textContent = "¿Confirmar?";
          setTimeout(() => {
            btnDel.dataset.step = "1";
            btnDel.textContent = "Eliminar";
          }, 3000);
          return;
        }
        try {
          await postJSON(API.uInscripcion, { id: row.id, estatus: 0 });
          toast("Suscripción movida a Inactivo", "exito");
          closeDrawer();
          await load();
        } catch (e) {
          console.error(TAG, "delete", e);
          toast("No se pudo eliminar", "error");
        }
      });
    }
    qs("#sus-reactivar")?.addEventListener("click", async () => {
      try {
        await postJSON(API.uInscripcion, { id: row.id, estatus: 1 });
        toast("Reactivada", "exito");
        closeDrawer();
        await load();
      } catch (e) {
        console.error(TAG, "reactivar", e);
        toast("No se pudo reactivar", "error");
      }
    });
    if (window.bindCopyFromPre)
      window.bindCopyFromPre("#json-sus", "#btn-copy-json-sus");
  }

  /* ---------- Drawer: Editar ---------- */
  function renderDrawerEdit(data) {
    return `
      <section id="sus-edit" class="mode-edit">
        <div class="grid-3">
          <div class="field"><label>Suscriptor</label><div class="value">${esc(
            String(data?._alumnoNombre || "—")
          )}</div></div>
          <div class="field"><label>Curso</label><div class="value">${esc(
            String(data?._cursoLabel || "—")
          )}</div></div>
          <div class="field"><label for="se_estatus">Estatus</label>${statusSelect(
            "se_estatus",
            data?.estatus ?? 1
          )}</div>
        </div>
        <div class="field"><label for="se_comentario">Comentario</label><textarea id="se_comentario" rows="4" maxlength="1000">${esc(
          String(data?.comentario ?? data?.nota ?? "")
        )}</textarea></div>
        <div class="drawer-actions-row">
          <div class="row-right">
            <button class="gc-btn gc-btn--ghost" id="se_cancel">Cancelar</button>
            <button class="gc-btn gc-btn--success" id="se_save">Guardar</button>
          </div>
        </div>
      </section>`;
  }

  function bindEditActions(data, id) {
    qs("#se_cancel")?.addEventListener("click", () => {
      openView(S.data.find((x) => x.id === id));
    });
    qs("#se_save")?.addEventListener("click", async () => {
      const body = {
        id: Number(id),
        estatus: Number(qs("#se_estatus")?.value || data?.estatus || 1),
        comentario: (qs("#se_comentario")?.value || "").trim(),
      };
      try {
        await postJSON(API.uInscripcion, body);
        toast("Cambios guardados", "exito");
        closeDrawer();
        await load();
        const re = S.data.find((x) => x.id === body.id);
        if (re) openView(re);
      } catch (e) {
        console.error(TAG, "update ERROR:", e);
        toast("No se pudo guardar", "error");
      }
    });
  }

  /* ---------- Drawer: Crear (Inscribir) ---------- */
  function openCreate() {
    S.create = { cursoId: null, usuario: null };
    openDrawer("Suscripción · Crear", renderDrawerCreate());
    bindCreateActions();
  }

  function renderDrawerCreate() {
    const cursoOptions = Object.entries(S.maps.cursos || {})
      .map(([id, name]) => `<option value="${id}">${esc(name)}</option>`)
      .join("");
    return `
      <section id="sus-create" class="mode-edit">
        <div class="field">
          <label for="sc_curso">Curso <span class="req">*</span></label>
          <select id="sc_curso">
            <option value="">— Selecciona un curso —</option>
            ${cursoOptions}
          </select>
        </div>

        <div class="field">
          <label for="sc_ident">Buscar cuenta (teléfono o correo) <span class="req">*</span></label>
          <div style="display:flex;gap:8px;align-items:center;">
            <input id="sc_ident" type="text" placeholder="3322… o correo@dominio">
            <button class="gc-btn" id="sc_buscar">Buscar</button>
            <button class="gc-btn gc-btn--ghost" id="sc_cambiar" disabled>Cambiar usuario</button>
          </div>
        </div>

        <div id="sc_user_panel" style="display:none;">
          <div class="field"><label>Nombre</label><input id="sc_nombre" type="text" disabled></div>
          <div class="field"><label>Correo</label><input id="sc_correo" type="email" disabled></div>
          <div class="field"><label>Teléfono</label><input id="sc_tel" type="text" disabled></div>
          <div class="field"><label>Fecha de nacimiento</label><input id="sc_fnac" type="date" disabled></div>

          <div class="field">
            <label>Medios de contacto</label>
            <div class="value" style="display:flex;gap:18px;">
              <label><input id="sc_mc_tel" name="medios-contacto" value="telefono" type="checkbox" disabled> Teléfono</label>
              <label><input id="sc_mc_mail" name="medios-contacto" value="correo"   type="checkbox" disabled> Correo</label>
            </div>
          </div>
        </div>

        <div class="field">
          <label for="sc_comentario">Comentario</label>
          <textarea id="sc_comentario" rows="3" placeholder="Opcional"></textarea>
        </div>

        <!-- Acciones SOLO abajo -->
        <div class="drawer-actions-row">
          <div class="row-right">
            <button class="gc-btn gc-btn--ghost" id="sc_cancel">Cancelar</button>
            <button class="gc-btn gc-btn--success" id="sc_inscribir_b" disabled>Inscribir</button>
          </div>
        </div>
      </section>`;
  }

  function bindCreateActions() {
    const bCancelBot = qs("#sc_cancel");
    const bInsBot = qs("#sc_inscribir_b");
    const setInscribirEnabled = (on) => {
      if (bInsBot) bInsBot.disabled = !on;
    };

    const selectCurso = qs("#sc_curso");
    const identInput = qs("#sc_ident");
    const btnBuscar = qs("#sc_buscar");
    const btnCambiar = qs("#sc_cambiar");

    function checkReady() {
      setInscribirEnabled(!!S.create.cursoId && !!S.create.usuario);
    }

    if (bCancelBot) bCancelBot.onclick = closeDrawer;

    if (selectCurso) {
      selectCurso.addEventListener("change", () => {
        S.create.cursoId = Number(selectCurso.value || 0) || null;
        checkReady();
      });
    }

    if (btnBuscar) {
      btnBuscar.addEventListener("click", async () => {
        const ident = (identInput?.value || "").trim();
        if (!ident)
          return toast("Ingresa teléfono o correo para buscar.", "warning");
        try {
          const user = await buscarUsuario(ident);
          if (!user) {
            toast("No se encontró usuario con ese dato.", "warning");
            return;
          }
          S.create.usuario = user;
          pintarUsuario(user); // setea checks correctamente (1/2/3)
          btnCambiar.disabled = false;
          checkReady();
          toast("Usuario encontrado", "exito");
        } catch (e) {
          console.error(TAG, "buscar usuario ERROR", e);
          toast("No se pudo buscar usuario", "error");
        }
      });
    }

    if (btnCambiar) {
      btnCambiar.addEventListener("click", () => {
        S.create.usuario = null;
        const pnl = qs("#sc_user_panel");
        if (pnl) pnl.style.display = "none";
        identInput.value = "";
        btnCambiar.disabled = true;
        // limpia checks
        const tel = qs("#sc_mc_tel"),
          mail = qs("#sc_mc_mail");
        if (tel) tel.checked = false;
        if (mail) mail.checked = false;
        checkReady();
      });
    }

    async function doInscribir() {
      if (!S.create.cursoId || !S.create.usuario) return;
      const uid = Number(
        S.create.usuario.id ??
          S.create.usuario.usuario_id ??
          S.create.usuario.alumno_id ??
          S.create.usuario.user_id ??
          0
      );
      if (!uid) return toast("ID de usuario inválido", "error");
      const body = {
        curso: S.create.cursoId,
        usuario: uid,
        comentario: (qs("#sc_comentario")?.value || "").trim(),
        creado_por: getCreatorId() ?? undefined,
        // Si deseas enviar tipo_contacto, descomenta:
        // tipo_contacto: (typeof window.obtenerTipoContacto === "function") ? window.obtenerTipoContacto() : undefined,
      };
      try {
        const res = await postJSON(API.iInscripcion, body);
        const newId = Number(
          res?.id || res?.inscripcion_id || res?.insert_id || res?.data?.id || 0
        );
        toast("Inscripción creada", "exito");
        closeDrawer();
        await load();
        const re = S.data.find((x) => x.id === newId);
        if (re) openView(re);
      } catch (e) {
        console.error(TAG, "inscribir ERROR", e);
        toast("No se pudo inscribir", "error");
      }
    }
    if (bInsBot) bInsBot.onclick = doInscribir;
  }

  async function buscarUsuario(ident) {
    const body = { telefono: ident, correo: ident };
    const res = await postJSON(API.usuarios, body);
    const arr = Array.isArray(res)
      ? res
      : Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res?.usuarios)
      ? res.usuarios
      : res && typeof res === "object"
      ? [res]
      : [];
    return arr[0] || null;
  }

  function pintarUsuario(u) {
    const pnl = qs("#sc_user_panel");
    if (!pnl) return;
    pnl.style.display = "";
    const nombre =
      u.nombre_completo ||
      u.nombre ||
      [u.nombre1, u.nombre2, u.apellido_paterno, u.apellido_materno]
        .filter(Boolean)
        .join(" ") ||
      "";
    const tel = u.telefono || u.celular || u.tel || "";
    const mail = u.correo || u.email || "";
    const fnac = (u.fecha_nacimiento || u.fnac || "").slice(0, 10);
    qs("#sc_nombre").value = nombre;
    qs("#sc_correo").value = mail;
    qs("#sc_tel").value = tel;
    qs("#sc_fnac").value = fnac;

    // === medios de contacto (1=tel, 2=correo, 3=ambos) ===
    const tipoRaw =
      u.tipo_contacto ?? u.medio_contacto ?? u.preferencias_contacto ?? 0;
    const tipo = Number(tipoRaw);
    const cTel = qs("#sc_mc_tel");
    const cMail = qs("#sc_mc_mail");
    if (cTel) cTel.checked = tipo === 1 || tipo === 3;
    if (cMail) cMail.checked = tipo === 2 || tipo === 3;

    // fallback textual si no viene numérico
    if (!Number.isFinite(tipo)) {
      const pref = String(tipoRaw || "").toLowerCase();
      if (cTel) cTel.checked = /tel|phone/.test(pref);
      if (cMail) cMail.checked = /mail|correo|email/.test(pref);
    }
  }

  /* ---------- Búsqueda global ---------- */
  const searchInput = qs("#search-input");
  if (searchInput && !searchInput._b) {
    searchInput._b = true;
    searchInput.addEventListener("input", (e) => {
      S.search = e.target.value || "";
      S.page = 1;
      render();
    });
  }

  /* ---------- API pública ---------- */
  async function mount() {
    console.log(TAG, "mount() INICIO");
    window.__activeModule = "suscripciones";
    try {
      const hostD = qs("#recursos-list");
      if (hostD)
        hostD.innerHTML = `<div class="table-row"><div class="col-nombre">Cargando…</div></div>`;
      await loadCatalogos();
      await load();
      if (!window._search_cursos_wired) {
        window._search_cursos_wired = true;
        gcSearch.register(
          "#/cursos",
          (q) => {
            S.search = q;
            S.page = 1;
            renderCursos(); // tu render normal
          },
          { placeholder: "Buscar cursos…" }
        );
      }
      console.log(TAG, "mount() OK");
    } catch (e) {
      console.error(TAG, "mount ERROR:", e);
      const hostD = qs("#recursos-list");
      if (hostD)
        hostD.innerHTML = `<div class="table-row"><div class="col-nombre">Error al cargar</div></div>`;
    }
  }
  function openCreateExposed() {
    openCreate();
  }

  globalThis.suscripciones = { mount, openCreate: openCreateExposed };
  console.log(TAG, "Módulo suscripciones cargado.");
})();
