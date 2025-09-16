// /JS/UAT/features/noticias.js
import { NoticiasAPI, UploadsAPI } from '/JS/UAT/admin.api.js';
import { renderTableBody } from '/JS/UAT/admin.ui.js';
import { gcLog, gcToast } from '/JS/UAT/admin.services.js';
import { escapeHtml } from '/JS/UAT/shared/formatters.js';

export const Noticias = {
  async mount(){
    gcLog('Noticias.mount');
    let rows = [];
    try {
      rows = await NoticiasAPI.list();
      if (!Array.isArray(rows)) rows = rows?.data || [];
    } catch(e){ gcToast('No se pudo cargar noticias', 'warn'); }
    const columns = [
      { header:'Título',  cell:r=> escapeHtml(r?.titulo ?? '-') },
      { header:'Resumen', cell:r=> escapeHtml(r?.resumen ?? '-') },
      { header:'Estatus', cell:r=> `<span class="badge gray">${escapeHtml(String(r?.estatus ?? ''))}</span>` },
      { header:'Acciones', cell:r=> `<button class="btn" data-edit-noticia="${r?.id}">Editar</button>` },
    ];
    renderTableBody('#tabla-noticias', rows, columns);
    document.getElementById('n_search_btn')?.addEventListener('click', ()=> this.search());
    document.getElementById('n_guardar')?.closest('form')?.addEventListener('submit', (e)=> this.submit(e));
    document.getElementById('tabla-noticias')?.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-edit-noticia]');
      if (btn){
        const id = btn.getAttribute('data-edit-noticia');
        const item = rows.find(x=> String(x.id) === String(id));
        this.openForm(item);
      }
    });
    document.querySelector('[data-open="drawer-noticias"]')?.addEventListener('click', ()=> this.openForm(null));
  },

  openForm(item){
    const dlg = document.getElementById('drawer-noticias');
    dlg.querySelector('#dn-title').textContent = item ? 'Editar noticia' : 'Nueva noticia';
    dlg.querySelector('#n_id').value = item?.id ?? '';
    dlg.querySelector('#n_titulo').value = item?.titulo ?? '';
    dlg.querySelector('#n_resumen').value = item?.resumen ?? '';
    dlg.querySelector('#n_status').value = String(item?.estatus ?? 1);
    dlg.querySelector('#n_contenido').value = item?.contenido ?? '';
    if (item?.img1) dlg.querySelector('#n_img1_preview').src = item.img1;
    if (item?.img2) dlg.querySelector('#n_img2_preview').src = item.img2;
  },

  async submit(e){
    e.preventDefault();
    const f = e.target;
    const id = f.querySelector('#n_id').value || '';
    const f1 = f.querySelector('#n_img1_file')?.files?.[0] || null;
    const f2 = f.querySelector('#n_img2_file')?.files?.[0] || null;

    const fd = new FormData();
    if (id) fd.append('id', id);
    fd.append('titulo',    f.querySelector('#n_titulo').value);
    fd.append('resumen',   f.querySelector('#n_resumen').value || '');
    fd.append('estatus',   f.querySelector('#n_status').value);
    fd.append('contenido', f.querySelector('#n_contenido').value || '');
    fd.append('tags',      f.querySelector('#n_tags').value || '');
    try {
      const saved = id ? await NoticiasAPI.update(fd) : await NoticiasAPI.insert(fd);
      const noticiaId = (saved && (saved.id || saved.data?.id)) || id;
      if (f1 && noticiaId) { await UploadsAPI.noticiaImg(noticiaId, 1, f1); }
      if (f2 && noticiaId) { await UploadsAPI.noticiaImg(noticiaId, 2, f2); }
      gcToast('Noticia guardada', 'ok');
      location.reload();
    } catch(err){
      gcToast('Error al guardar noticia', 'err');
      gcLog('Noticias.submit', err);
    }
  },

  async search(){
    const q = document.getElementById('n_search').value.trim();
    try {
      const rows = await NoticiasAPI.list(q? { q } : undefined);
      const columns = [
        { header:'Título',  cell:r=> escapeHtml(r?.titulo ?? '-') },
        { header:'Resumen', cell:r=> escapeHtml(r?.resumen ?? '-') },
        { header:'Estatus', cell:r=> `<span class="badge gray">${escapeHtml(String(r?.estatus ?? ''))}</span>` },
        { header:'Acciones', cell:r=> `<button class="btn" data-edit-noticia="${r?.id}">Editar</button>` },
      ];
      renderTableBody('#tabla-noticias', Array.isArray(rows)?rows:(rows?.data||[]), columns);
    } catch(e){ gcToast('No se pudo buscar', 'warn'); }
  }
};
