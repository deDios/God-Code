// /JS/UAT/features/cuenta.js
// Panel de Cuenta (solo lectura mínima; puedes expandirlo luego)
export const Cuenta = {
  mount(){
    let view = document.getElementById('view-cuenta');
    if (!view){
      // crear contenedor si no existe
      const wrap = document.querySelector('.wrap') || document.body;
      view = document.createElement('section');
      view.id = 'view-cuenta';
      view.className = 'view';
      view.innerHTML = `<h2>Mi cuenta</h2><div id="cuenta-body"></div>`;
      wrap.prepend(view);
    }
    // Render info básica
    const user = (window.Admin && window.Admin.user) || { id: 0, name: 'Invitado' };
    const body = view.querySelector('#cuenta-body');
    body.innerHTML = `
      <div class="card" style="padding:12px;border:1px solid #eee;border-radius:12px;background:#fff;max-width:640px">
        <div class="field"><label>ID de usuario</label><input type="text" value="${String(user.id||'')}" readonly></div>
        <div class="field"><label>Nombre</label><input type="text" value="${String(user.name||'')}" readonly></div>
        <p style="color:#666;margin-top:8px">Si necesitas cambios de perfil, contacta a un administrador.</p>
      </div>
    `;
  }
};
