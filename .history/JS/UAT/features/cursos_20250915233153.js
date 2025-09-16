// /JS/UAT/features/cursos.js
import { CursosAPI } from '/JS/UAT/admin.api.js';
import { renderTableBody } from '/JS/UAT/admin.ui.js';
import { gcLog, gcToast } from '/JS/UAT/admin.services.js';
import { escapeHtml, fmtDate } from '/JS/UAT/shared/formatters.js';

export const Cursos = {
  async mount(){
    gcLog('Cursos.mount');
    this.bindGlobalHandlers();
    await this.reload();
  },

  async reload(q){
    let rows = [];
    try {
      rows = await CursosAPI.list(q ? { q } : undefined);
      if (!Array.isArray(rows)) rows = rows?.data || [];
    } catch(e){ gcToast('No se pudo cargar cursos','warn'); }

    const columns = [
      { header:'Nombre', cell:r=> escapeHtml(r?.nombre ?? '-') },
      { header:'Fecha inicio',  cell:r=> fmtDate(r?.fecha_inicio || r?.fecha) },
      { header:'Estatus', cell:r=> `<span class="badge gray">${escapeHtml(String(r?.estatus ?? ''))}</span>` },
      { header:'Acciones', cell:r=> `<button class="btn" data-edit-curso="${r?.id}">Editar</button>` },
    ];
    renderTableBody('#tabla-cursos', Array.isArray(rows)?rows:(rows?.data||[]), columns);
  },

  bindGlobalHandlers(){
    const root = document;

    // Buscar
    root.getElementById('c_search_btn')?.addEventListener('click', async (e)=>{
      e.preventDefault();
      const q = root.getElementById('c_search')?.value?.trim();
      await this.reload(q ? { q } : undefined);
    });

    // Nuevo
    root.getElementById('c_new_btn')?.addEventListener('click', (e)=>{
      e.preventDefault();
      this.openForm(); // crear
    });

    // Editar (delegado)
    root.addEventListener('click', async (e)=>{
      const btn = e.target.closest?.('[data-edit-curso]');
      if (!btn) return;
      const id = Number(btn.getAttribute('data-edit-curso'));
      if (!id) return;
      let row = null;
      try {
        const rs = await CursosAPI.list({ id });
        const data = Array.isArray(rs) ? rs : (rs?.data || []);
        row = data?.[0] || null;
      } catch {}
      this.openForm(row || { id });
    });
  },

  // === Drawer ===
  openForm(item){
    const isEdit = !!(item && item.id);
    const data = item || {};
    const id = data.id || '';
    const nombre = data.nombre || '';
    const fecha_inicio = (data.fecha_inicio || data.fecha || '').slice(0,10);
    const estatus = data.estatus ?? 1;
    const descripcion = data.descripcion_curso || data.descripcion || '';

    // Avanzado: si existen, prellenar; si no, defaults
    const def = (v, d)=> (v===0 || v) ? v : d;
    const tutor = def(data.tutor, 1);
    const horas = def(data.horas, 0);
    const precio = def(data.precio, 0);
    const categoria = def(data.categoria, 1);
    const prioridad = def(data.prioridad, 1);
    const certificado = def(data.certificado, 0) ? 'checked' : '';
    const dirigido = data.dirigido || '';
    const competencias = data.competencias || '';
    const actividades = def(data.actividades, 1);
    const tipo_evaluacion = def(data.tipo_evaluacion, 1);
    const calendario = def(data.calendario, 1);

    const body = `
      <form id="curso_form" class="gc-form">
        <input type="hidden" id="c_id" value="${escapeHtml(String(id))}"/>
        <div class="grid cols-2 gap">
          <div class="field">
            <label>Nombre</label>
            <input id="c_nombre" type="text" value="${escapeHtml(nombre)}" />
          </div>
          <div class="field">
            <label>Fecha inicio</label>
            <input id="c_fecha_inicio" type="date" value="${escapeHtml(fecha_inicio)}" />
          </div>
          <div class="field">
            <label>Estatus</label>
            <select id="c_status">
              <option value="1" ${String(estatus)==='1'?'selected':''}>1</option>
              <option value="0" ${String(estatus)==='0'?'selected':''}>0</option>
            </select>
          </div>
          <div class="field col-span-2">
            <label>Descripción</label>
            <textarea id="c_descripcion" rows="6">${escapeHtml(descripcion)}</textarea>
          </div>
        </div>

        <details class="mt-3">
          <summary>Avanzado</summary>
          <div class="grid cols-3 gap mt-2">
            <div class="field"><label>Horas</label><input id="c_horas" type="number" min="0" step="0.5" value="${escapeHtml(String(horas))}"/></div>
            <div class="field"><label>Precio</label><input id="c_precio" type="number" min="0" step="1" value="${escapeHtml(String(precio))}"/></div>
            <div class="field"><label>Tutor (id)</label><input id="c_tutor" type="number" min="1" step="1" value="${escapeHtml(String(tutor))}"/></div>
            <div class="field"><label>Categoría (id)</label><input id="c_categoria" type="number" min="1" step="1" value="${escapeHtml(String(categoria))}"/></div>
            <div class="field"><label>Prioridad (id)</label><input id="c_prioridad" type="number" min="1" step="1" value="${escapeHtml(String(prioridad))}"/></div>
            <div class="field"><label>Actividades (id)</label><input id="c_actividades" type="number" min="1" step="1" value="${escapeHtml(String(actividades))}"/></div>
            <div class="field"><label>Tipo evaluación (id)</label><input id="c_tipo_eval" type="number" min="1" step="1" value="${escapeHtml(String(tipo_evaluacion))}"/></div>
            <div class="field"><label>Calendario (id)</label><input id="c_calendario" type="number" min="1" step="1" value="${escapeHtml(String(calendario))}"/></div>
            <div class="field"><label><input id="c_certificado" type="checkbox" ${certificado}/> Certificado</label></div>
            <div class="field col-span-3"><label>Dirigido</label><input id="c_dirigido" type="text" value="${escapeHtml(dirigido)}"/></div>
            <div class="field col-span-3"><label>Competencias</label><input id="c_competencias" type="text" value="${escapeHtml(competencias)}"/></div>
          </div>
        </details>

        <div class="mt-3">
          <label>Portada</label>
          <div class="flex items-center gap">
            <img id="c_img" alt="previsualización" style="max-width:180px;max-height:120px;object-fit:cover;border:1px solid #ddd;border-radius:8px"/>
            <input id="c_portada_file" type="file" accept="image/*"/>
          </div>
        </div>

        <div class="mt-4 flex gap">
          <button class="btn primary" id="c_save_btn">${isEdit?'Actualizar':'Crear'}</button>
          <button class="btn" id="c_cancel_btn">Cancelar</button>
        </div>
      </form>
    `;

    const title = isEdit? `Editar curso #${escapeHtml(String(id))}` : 'Nuevo curso';
    // Preferir openDrawer exportado; si no, simple fallback modal
    const open = (window.openDrawer || (async (t, html)=>{
      const host = document.getElementById('gc-drawer-host') || (()=>{
        const d=document.createElement('div'); d.id='gc-drawer-host'; document.body.appendChild(d); return d;
      })();
      host.innerHTML = `<div class="drawer-like"><h3>${t}</h3><div>${html}</div></div>`;
      return host;
    }));
    open(title, body);

    // Bind preview/submit/cancel
    const form = document.getElementById('curso_form');
    const file = form.querySelector('#c_portada_file');
    const img = form.querySelector('#c_img');
    const idNum = Number(id);

    // Cargar preview: si hay seleccionado, objectURL; si no, intenta rutas por id
    const withBust = (u)=> u + (u.includes('?')?'&':'?') + 'v=' + Date.now();
    if (file) {
      file.addEventListener('change', ()=>{
        const f = file.files?.[0];
        if (f) img.src = URL.createObjectURL(f);
      });
    }
    if (idNum && !img.src) {
      const candidates = [
        `/ASSETS/cursos/img${idNum}.png`,
        `/ASSETS/cursos/img${idNum}.jpg`,
        `/ASSETS/cursos/cursos_img${idNum}.png`,
        `/ASSETS/cursos/cursos_img${idNum}.jpg`,
      ];
      let i=0;
      img.onerror = ()=>{ if (++i < candidates.length) img.src = withBust(candidates[i]); };
      img.src = withBust(candidates[i]);
    }

    form.querySelector('#c_cancel_btn')?.addEventListener('click', (e)=>{
      e.preventDefault();
      (window.closeDrawer?.() || (document.getElementById('gc-drawer-host')?.remove()));
    });

    form.querySelector('#c_save_btn')?.addEventListener('click', async (e)=>{
      e.preventDefault();
      try {
        const fd = buildCursoPayloadDDL(form, window?.Admin?.user?.id || 1);
        if (idNum) await CursosAPI.update(fd); else await CursosAPI.insert(fd);
        gcToast(idNum? 'Curso actualizado' : 'Curso creado', 'ok');
        (window.closeDrawer?.() || (document.getElementById('gc-drawer-host')?.remove()));
        await this.reload();
      } catch(err){
        gcToast('No se pudo guardar curso', 'error');
        gcLog(err);
      }
    });
  },
};

// === Helpers de payload alineado al DDL ===
function to250(s){ return (s || '').trim().slice(0, 250); }
function to350(s){ return (s || '').trim().slice(0, 350); }
function onlyNum(v, def=0){ const n = Number(v); return Number.isFinite(n) ? n : def; }
function bool01(v){ return v ? 1 : 0; }

export function buildCursoPayloadDDL(formEl, userId){
  const f = formEl;

  const nombre   = f.querySelector('#c_nombre')?.value || '';
  const descFull = f.querySelector('#c_descripcion')?.value || '';
  const status   = f.querySelector('#c_status')?.value || '1';
  const fInicio  = f.querySelector('#c_fecha_inicio')?.value || '';

  // Avanzado / defaults seguros
  const actividades      = Number(f.querySelector('#c_actividades')?.value)     || 1;
  const tipo_evaluacion  = Number(f.querySelector('#c_tipo_eval')?.value)       || 1;
  const calendario       = Number(f.querySelector('#c_calendario')?.value)      || 1;
  const categoria        = Number(f.querySelector('#c_categoria')?.value)       || 1;
  const prioridad        = Number(f.querySelector('#c_prioridad')?.value)       || 1;
  const tutor            = Number(f.querySelector('#c_tutor')?.value)           || 1;

  const horas            = onlyNum(f.querySelector('#c_horas')?.value, 0);
  const precio           = onlyNum(f.querySelector('#c_precio')?.value, 0);
  const certificado      = bool01(f.querySelector('#c_certificado')?.checked);
  const dirigido         = f.querySelector('#c_dirigido')?.value || 'Público general';
  const competencias     = f.querySelector('#c_competencias')?.value || 'Competencias básicas';

  const descripcion_curso  = (descFull || '').slice(0, 2000);
  const descripcion_breve  = to250(descFull.split('\n')[0] || descFull);
  const descripcion_media  = to350(descFull);

  const fd = new FormData();
  const id = f.querySelector('#c_id')?.value;
  if (id) fd.append('id', id);

  fd.append('nombre', nombre);
  fd.append('descripcion_breve', descripcion_breve);
  fd.append('descripcion_curso', descripcion_curso);
  fd.append('descripcion_media', descripcion_media);

  fd.append('actividades', String(actividades));
  fd.append('tipo_evaluacion', String(tipo_evaluacion));
  fd.append('calendario', String(calendario));
  fd.append('certificado', String(certificado));
  fd.append('dirigido', dirigido);
  fd.append('competencias', competencias);
  fd.append('tutor', String(tutor));
  fd.append('horas', String(horas));
  fd.append('precio', String(precio));

  fd.append('estatus', String(status));
  const fecha_inicio = fInicio || '2025-01-01';
  fd.append('fecha_inicio', fecha_inicio);
  fd.append('fecha', fecha_inicio); 

  fd.append('categoria', String(categoria));
  fd.append('prioridad', String(prioridad));

  fd.append('creado_por', String(userId || 1));

  const file = f.querySelector('#c_portada_file')?.files?.[0];
  if (file) fd.append('imagen', file);

  return fd;
}
