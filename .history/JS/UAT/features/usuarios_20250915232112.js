// /JS/UAT/features/usuarios.js
import { UsuariosAPI } from '/JS/UAT/admin.api.js';
import { renderTableBody } from '/JS/UAT/admin.ui.js';
import { gcLog, gcToast } from '/JS/UAT/admin.services.js';
import { escapeHtml } from '/JS/UAT/shared/formatters.js';

export const Usuarios = {
  async mount(){
    gcLog('Usuarios.mount');
    let rows = [];
    try {
      rows = await UsuariosAPI.list();
      if (!Array.isArray(rows)) rows = rows?.data || [];
    } catch(e){
      gcToast('No se pudo cargar usuarios', 'warn');
      gcLog('Usuarios.mount error', e);
    }
    const columns = [
      { header:'Nombre', cell:r=> escapeHtml(r?.nombre ?? '-') },
      { header:'Correo', cell:r=> escapeHtml(r?.correo ?? '-') },
      { header:'Teléfono', cell:r=> escapeHtml(r?.telefono ?? '-') },
      { header:'Estatus', cell:r=> (r?.estatus==1?'<span class="badge ok">Activo</span>':'<span class="badge gray">Inactivo</span>') },
      { header:'Acciones', cell:r=> `<button class="btn" data-edit-usuario="${r?.id}">Editar</button>` },
    ];
    renderTableBody('#tabla-usuarios', rows, columns);
    document.getElementById('u_search_btn')?.addEventListener('click', ()=> this.search());
    document.getElementById('u_guardar')?.closest('form')?.addEventListener('submit', (e)=> this.submit(e));
    document.getElementById('tabla-usuarios')?.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-edit-usuario]');
      if (btn){
        const id = btn.getAttribute('data-edit-usuario');
        const item = rows.find(x=> String(x.id) === String(id));
        this.openForm(item);
      }
    });
    document.querySelector('[data-open="drawer-usuarios"]')?.addEventListener('click', ()=> this.openForm(null));
  },

  openForm(item){
    const dlg = document.getElementById('drawer-usuarios');
    dlg.querySelector('#du-title').textContent = item ? 'Editar usuario' : 'Nuevo usuario';
    dlg.querySelector('#u_id').value = item?.id ?? '';
    dlg.querySelector('#u_nombre').value = item?.nombre ?? '';
    dlg.querySelector('#u_correo').value = item?.correo ?? '';
    dlg.querySelector('#u_tel').value = item?.telefono ?? '';
    dlg.querySelector('#u_status').value = String(item?.estatus ?? 1);
    if (item?.avatar) dlg.querySelector('#u_avatar_preview').src = item.avatar;
  },

  async submit(e){
    e.preventDefault();
    const f = e.target;
    const id = f.querySelector('#u_id').value || '';
    const file = f.querySelector('#u_avatar_file')?.files?.[0] || null;

    const fd = new FormData();
    if (id) fd.append('id', id);
    fd.append('nombre',   f.querySelector('#u_nombre').value);
    fd.append('correo',   f.querySelector('#u_correo').value);
    fd.append('telefono', f.querySelector('#u_tel').value);
    fd.append('estatus',  f.querySelector('#u_status').value);
    if (file) fd.append('imagen', file);

    try {
      if (id) await UsuariosAPI.update(fd); else await UsuariosAPI.insert(fd);
      gcToast('Usuario guardado', 'ok');
      location.reload();
    } catch(err){
      gcToast('Error al guardar usuario', 'err');
      gcLog('Usuarios.submit', err);
    }
  },

  async search(){
    const q = document.getElementById('u_search').value.trim();
    try {
      const rows = await UsuariosAPI.list(q? { q } : undefined);
      const columns = [
        { header:'Nombre', cell:r=> escapeHtml(r?.nombre ?? '-') },
        { header:'Correo', cell:r=> escapeHtml(r?.correo ?? '-') },
        { header:'Teléfono', cell:r=> escapeHtml(r?.telefono ?? '-') },
        { header:'Estatus', cell:r=> (r?.estatus==1?'<span class="badge ok">Activo</span>':'<span class="badge gray">Inactivo</span>') },
        { header:'Acciones', cell:r=> `<button class="btn" data-edit-usuario="${r?.id}">Editar</button>` },
      ];
      renderTableBody('#tabla-usuarios', Array.isArray(rows)?rows:(rows?.data||[]), columns);
    } catch(e){
      gcToast('No se pudo buscar', 'warn');
    }
  }
};
