function getUsuarioFromCookie() {
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('usuario='));
  if (!cookie) return null;

  try {
    const json = decodeURIComponent(cookie.split('=')[1]);
    return JSON.parse(json);
  } catch (err) {
    console.warn('Cookie “usuario” malformada:', err);
    return null;
  }
}

function renderPerfil(usuario) {
  const avatarImg    = document.getElementById('avatar-img');
  const userNameElem = document.getElementById('user-name');
  const editLink     = document.querySelector('.edit-profile');

  avatarImg.src         = usuario.avatarUrl || '../ASSETS/usuario/usuarioImg/img_user1.png';
  avatarImg.alt         = usuario.nombre;
  userNameElem.textContent = usuario.nombre;
  editLink.href         = `VIEW/Perfil.php?id=${usuario.id}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const usuario = getUsuarioFromCookie();
  if (!usuario) {
    console.warn('No hay usuario en cookie, redirigiendo a login.');
    window.location.href = '../VIEW/Login.php';
    return;
  }
  renderPerfil(usuario);
});
