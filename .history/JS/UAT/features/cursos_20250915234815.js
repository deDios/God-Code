// /JS/UAT/features/cursos.js
import { CursosAPI, UploadsAPI } from '/JS/UAT/admin.api.js';
import { renderTableBody } from '/JS/UAT/admin.ui.js';
import { gcLog, gcToast, todayYYYYMMDD } from '/JS/UAT/admin.services.js';
import { escapeHtml, fmtDate } from '/JS/UAT/shared/formatters.js';

export const Cursos = {
  async mount(){
    gcLog('Cursos.mount');
    let rows = [];
    try {
      rows = await CursosAPI.list();
      if (!Array.isArray(rows)) rows = rows?.data || [];
    } catch(e){ gcToast('No se pudo cargar cursos','warn'); }
    const columns = [
      { header:'Nombre', cell:r=> escapeHtml(r?.nombre ?? '-') },
      { header:'Fecha',  cell:r=> fmtDate(r?.fecha) },
      { header:'Estatus', cell:r=> `<span class="badge gray">${escapeHtml(String(r?.estatus ?? ''))}</span>` },
      { header:'Acciones', cell:r=> `<button class="btn" data-edit-curso="${r?.id}">Editar</button>` },
    ];
    renderTableBody('#tabla-cursos', rows, columns);
    document.getElementById('c_search_btn')?.addEventListener('click', ()=> this.search());
    document.getElementById('c_guardar')?.closest('form')?.addEventListener('submit', (e)=> this.submit(e));
    document.getElementById('tabla-cursos')?.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-edit-curso]');
      if (btn){
        const id = btn.getAttribute('data-edit-curso');
        const item = rows.find(x=> String(x.id) === String(id));
        this.openForm(item);
      }
    });
    document.querySelector('[data-open="drawer-cursos"]')?.addEventListener('click', ()=> this.openForm(null));
  },

  openForm(item){
    const dlg = document.getElementById('drawer-cursos');
    dlg.querySelector('#dc-title').textContent = item ? 'Editar curso' : 'Nuevo curso';
    dlg.querySelector('#c_id').value = item?.id ?? '';
    dlg.querySelector('#c_nombre').value = item?.nombre ?? '';
    dlg.querySelector('#c_fecha_inicio').value = item?.fecha_inicio || item?.fecha || todayYYYYMMDD();
    dlg.querySelector('#c_fecha_fin').value = item?.fecha_fin || '';
    dlg.querySelector('#c_status').value = String(item?.estatus ?? 1);
    if (item?.portada) dlg.querySelector('#c_portada_preview').src = item.portada;
    dlg.querySelector('#c_desc').value = item?.descripcion ?? '';
  },

  async submit(e){
    e.preventDefault();
    const f = e.target;
    const id = f.querySelector('#c_id').value || '';
    const portada = f.querySelector('#c_portada_file')?.files?.[0] || null;

    const fd = new FormData();
    if (id) fd.append('id', id);
    fd.append('nombre',  f.querySelector('#c_nombre').value);
    // Compat: el API actual usa 'fecha' (tomamos la de inicio)
    fd.append('fecha',   f.querySelector('#c_fecha_inicio')?.value || '');
    fd.append('estatus', f.querySelector('#c_status').value);
    fd.append('descripcion', f.querySelector('#c_desc').value || '');
    try {
      const saved = id ? await CursosAPI.update(fd) : await CursosAPI.insert(fd);
      const cursoId = (saved && (saved.id || saved.data?.id)) || id;
      if (portada && cursoId) { await UploadsAPI.cursoImg(cursoId, portada); }
      gcToast('Curso guardado', 'ok');
      location.reload();
    } catch(err){
      gcToast('Error al guardar curso', 'err');
      gcLog('Cursos.submit', err);
    }
  },

  async search(){
    const q = document.getElementById('c_search').value.trim();
    try {
      const rows = await CursosAPI.list(q? { q } : undefined);
      const columns = [
        { header:'Nombre', cell:r=> escapeHtml(r?.nombre ?? '-') },
        { header:'Fecha',  cell:r=> fmtDate(r?.fecha) },
        { header:'Estatus', cell:r=> `<span class="badge gray">${escapeHtml(String(r?.estatus ?? ''))}</span>` },
        { header:'Acciones', cell:r=> `<button class="btn" data-edit-curso="${r?.id}">Editar</button>` },
      ];
      renderTableBody('#tabla-cursos', Array.isArray(rows)?rows:(rows?.data||[]), columns);
    } catch(e){ gcToast('No se pudo buscar','warn'); }
  }
};
