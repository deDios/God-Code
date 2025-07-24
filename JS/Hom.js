function getUsuarioFromCookie() {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("usuario="));
  if (!cookie) return null;

  try {
    const json = decodeURIComponent(cookie.split("=")[1]);
    return JSON.parse(json);
  } catch (err) {
    console.warn("Cookie “usuario” malformada:", err);
    return null;
  }
}

function renderPerfil(usuario) {
  const profileContainer = document.querySelector(".user-profile");
  if (!profileContainer) return;

  profileContainer.innerHTML = "";

  const avatarCircle = document.createElement("div");
  avatarCircle.className = "avatar-circle";
  const img = document.createElement("img");
  img.id = "avatar-img";
  img.src = usuario.avatarUrl || "../ASSETS/usuario/usuarioImg/img_user1.png";
  img.alt = usuario.nombre;
  avatarCircle.appendChild(img);

  const userInfo = document.createElement("div");
  userInfo.className = "user-info";

  const nameDiv = document.createElement("div");
  nameDiv.id = "user-name";
  nameDiv.textContent = usuario.nombre;

  const editLink = document.createElement("a");
  editLink.className = "edit-profile";
  editLink.href = `VIEW/Perfil.php?id=${usuario.id}`;
  editLink.textContent = "Administrar perfil ›";

  userInfo.append(nameDiv, editLink);

  profileContainer.append(avatarCircle, userInfo);
}

document.addEventListener("DOMContentLoaded", () => {
  const usuario = getUsuarioFromCookie();
  if (!usuario) {
    console.warn("No hay usuario en cookie, redirigiendo a login.");
    window.location.href = "../VIEW/Login.php";
    return;
  }
  renderPerfil(usuario);
});
