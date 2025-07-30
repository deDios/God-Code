document.addEventListener("DOMContentLoaded", () => {
  const usuarioCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("usuario="));
  if (usuarioCookie) {
    try {
      const datos = JSON.parse(decodeURIComponent(usuarioCookie.split("=")[1]));
      if (datos?.id) {
        window.location.href = "../VIEW/testLogin.php";
        return;
      }
    } catch (err) {
      console.warn("Cookie malformada o inválida:", err);
    }
  }

  const btnLogin = document.querySelector(".login-form button");
  const inputUsuario = document.querySelector(".login-form input[type='text']");
  const inputPassword = document.querySelector(
    ".login-form input[type='password']"
  );

  const ENDPOINT_LOGIN =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/login_usuario.php";
  const ENDPOINT_CONSULTA =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_usuario.php";

  // Limpia cookies antiguas
  function limpiarCookiesAntiguas() {
    [
      "usuario_id",
      "nombre",
      "correo",
      "telefono",
      "tipo_contacto",
      "estatus",
    ].forEach((clave) => {
      document.cookie = `${clave}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    });
  }

  // Guarda usuario en cookie
  function guardarEnCookies(usuario) {
    limpiarCookiesAntiguas();
    const fechaExp = new Date();
    fechaExp.setTime(fechaExp.getTime() + 24 * 60 * 60 * 1000); // 1 día
    const expira = "expires=" + fechaExp.toUTCString();
    const datosJSON = encodeURIComponent(JSON.stringify(usuario));
    document.cookie = `usuario=${datosJSON}; ${expira}; path=/`;
  }

  btnLogin.addEventListener("click", async () => {
    const usuario = inputUsuario.value.trim();
    const password = inputPassword.value.trim();

    if (!usuario || !password) {
      gcToast("Por favor, completa todos los campos.", "warning");
      return;
    }

    btnLogin.disabled = true;
    btnLogin.textContent = "Iniciando...";

    try {
      const res = await fetch(ENDPOINT_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });
      const data = await res.json();

      if (data.mensaje === "Acceso correcto" && data.usuario) {
        const consultaRes = await fetch(ENDPOINT_CONSULTA, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correo: data.usuario.correo,
            telefono: data.usuario.telefono,
            estatus: "1",
          }),
        });
        const arr = await consultaRes.json();

        if (Array.isArray(arr) && arr[0]) {
          gcToast("¡Bienvenido! Acceso concedido.", "exito", 4000);
          guardarEnCookies(arr[0]);
          setTimeout(() => {
            window.location.href = "../VIEW/Home.php";
          }, 1500);
        } else {
          gcToast("Error al obtener tus datos.", "error", 4000);
          btnLogin.disabled = false;
          btnLogin.textContent = "Iniciar sesión";
        }
      } else if (data.error) {
        gcToast(data.error, "error", 5000);
        btnLogin.disabled = false;
        btnLogin.textContent = "Iniciar sesión";
      } else {
        gcToast("Ocurrió algo raro... intenta más tarde.", "warning", 4000);
        btnLogin.disabled = false;
        btnLogin.textContent = "Iniciar sesión";
      }
    } catch (err) {
      console.error("Error en login:", err);
      gcToast("Error de conexión. Intenta más tarde.", "error", 5000);
      btnLogin.disabled = false;
      btnLogin.textContent = "Iniciar sesión";
    }
  });

  [inputUsuario, inputPassword].forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        btnLogin.click();
      }
    });
  });
});
