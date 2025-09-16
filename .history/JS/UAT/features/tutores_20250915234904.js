// /JS/UAT/features/tutores.js
import { TutoresAPI, UploadsAPI } from '/JS/UAT/admin.api.js';
import { renderTableBody } from '/JS/UAT/admin.ui.js';
import { gcLog, gcToast } from '/JS/UAT/admin.services.js';
import { escapeHtml } from '/JS/UAT/shared/formatters.js';

export const Tutores = {
  async mount(){
    gcLog('Tutores.mount');
    let rows = [];
    try {
      rows = await TutoresAPI.list();
      if (!Array.isArray(rows)) rows = rows?.data || [];
    } catch(e){ gcToast('No se pudo cargar tutores', 'warn'); }
    const columns = [
      { header:'Nombre',  cell:r=> escapeHtml(r?.nombre ?? '-') },
      { header:'Bio',     cell:r=> escapeHtml(r?.bio ?? '-') },
      { header:'Estatus', cell:r=> `<span class="badge gray">${escapeHtml(String(r?.estatus ?? ''))}</span>` },
      { header:'Acciones', cell:r=> `<button class="btn" data-edit-tutor="${r?.id}">Editar</button>` },
    ];
    renderTableBody('#tabla-tutores', rows, columns);
    document.getElementById('t_search_btn')?.addEventListener('click', ()=> this.search());
    document.getElementById('t_guardar')?.closest('form')?.addEventListener('submit', (e)=> this.submit(e));
    document.getElementById('tabla-tutores')?.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-edit-tutor]');
      if (btn){
        const id = btn.getAttribute('data-edit-tutor');
        const item = rows.find(x=> String(x.id) === String(id));
        this.openForm(item);
      }
    });
    document.querySelector('[data-open="drawer-tutores"]')?.addEventListener('click', ()=> this.openForm(null));
  },

  openForm(item){
    const dlg = document.getElementById('drawer-tutores');
    dlg.querySelector('#dt-title').textContent = item ? 'Editar tutor' : 'Nuevo tutor';
    dlg.querySelector('#t_id').value = item?.id ?? '';
    dlg.querySelector('#t_nombre').value = item?.nombre ?? '';
    dlg.querySelector('#t_status').value = String(item?.estatus ?? 1);
    dlg.querySelector('#t_bio').value = item?.bio ?? '';
    if (item?.avatar) dlg.querySelector('#t_avatar_preview').src = item.avatar;
  },

  async submit(e){
    e.preventDefault();
    const f = e.target;
    const id = f.querySelector('#t_id').value || '';
    const file = f.querySelector('#t_avatar_file')?.files?.[0] || null;

    const fd = new FormData();
    if (id) fd.append('id', id);
    fd.append('nombre',  f.querySelector('#t_nombre').value);
    fd.append('estatus', f.querySelector('#t_status').value);
    fd.append('bio',     f.querySelector('#t_bio').value || '');
    try {
      const saved = id ? await TutoresAPI.update(fd) : await TutoresAPI.insert(fd);
      const tutorId = (saved && (saved.id || saved.data?.id)) || id;
      if (file && tutorId) { await UploadsAPI.tutorImg(tutorId, file); }
      gcToast('Tutor guardado', 'ok');
      location.reload();
    } catch(err){
      gcToast('Error al guardar tutor', 'err');
      gcLog('Tutores.submit', err);
    }
  },

  async search(){
    const q = document.getElementById('t_search').value.trim();
    try {
      const rows = await TutoresAPI.list(q? { q } : undefined);
      const columns = [
        { header:'Nombre',  cell:r=> escapeHtml(r?.nombre ?? '-') },
        { header:'Bio',     cell:r=> escapeHtml(r?.bio ?? '-') },
        { header:'Estatus', cell:r=> `<span class="badge gray">${escapeHtml(String(r?.estatus ?? ''))}</span>` },
        { header:'Acciones', cell:r=> `<button class="btn" data-edit-tutor="${r?.id}">Editar</button>` },
      ];
      renderTableBody('#tabla-tutores', Array.isArray(rows)?rows:(rows?.data||[]), columns);
    } catch(e){ gcToast('No se pudo buscar', 'warn'); }
  }
};
