// /JS/UAT/features/suscripciones.js
import { SuscripcionesAPI } from '/JS/UAT/admin.api.js';
import { renderTableBody } from '/JS/UAT/admin.ui.js';
import { gcLog, gcToast } from '/JS/UAT/admin.services.js';
import { escapeHtml } from '/JS/UAT/shared/formatters.js';

export const Suscripciones = {
  async mount(){
    gcLog('Suscripciones.mount');
    let rows = [];
    try {
      rows = await SuscripcionesAPI.list();
      if (!Array.isArray(rows)) rows = rows?.data || [];
    } catch(e){ gcToast('No se pudo cargar suscripciones', 'warn'); }
    const columns = [
      { header:'Curso',   cell:r=> escapeHtml(r?.curso ?? '-') },
      { header:'Usuario', cell:r=> escapeHtml(r?.usuario ?? '-') },
      { header:'Estatus', cell:r=> `<span class="badge gray">${escapeHtml(String(r?.estatus ?? ''))}</span>` },
      { header:'Acciones', cell:r=> `<button class="btn" data-edit-sus="${r?.id}">Editar</button>` },
    ];
    renderTableBody('#tabla-suscripciones', rows, columns);
    document.getElementById('s_guardar')?.closest('form')?.addEventListener('submit', (e)=> this.submit(e));
  },

  async submit(e){
    e.preventDefault();
    const f = e.target;
    const id = f.querySelector('#s_id').value || '';

    const fd = new FormData();
    if (id) fd.append('id', id);
    fd.append('usuario_id', f.querySelector('#s_usuario').value);
    fd.append('curso_id',   f.querySelector('#s_curso').value);
    fd.append('estatus',    f.querySelector('#s_status').value);
    fd.append('notas',      f.querySelector('#s_notas').value || '');

    try {
      if (id) await SuscripcionesAPI.update(fd); else await SuscripcionesAPI.insert(fd);
      gcToast('Suscripción guardada', 'ok');
      location.reload();
    } catch(err){
      gcToast('Error al guardar suscripción', 'err');
      gcLog('Suscripciones.submit', err);
    }
  }
};
