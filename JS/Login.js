document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.querySelector(".login-form button");
  const inputUsuario = document.querySelector(".login-form input[type='text']");
  const inputPassword = document.querySelector(
    ".login-form input[type='password']"
  );

  // ENDPOINT LOGIN
  const ENDPOINT_LOGIN =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/login_usuario.php";

  // notificaciones
  const mostrarToast =
    window.mostrarToast ||
    function (msg, tipo = "exito", duracion = 5000) {
      console.log(`[${tipo.toUpperCase()}] ${msg}`);
    };

  // se guardan las cookies
  function guardarEnCookies(usuario) {
    const dias = 1;
    const fechaExp = new Date();
    fechaExp.setTime(fechaExp.getTime() + dias * 24 * 60 * 60 * 1000);
    const expira = "expires=" + fechaExp.toUTCString();

    // se guardan los datos y aparte expiracion la cual deberia ser 1 dia
    document.cookie = `usuario_id=${usuario.id}; ${expira}; path=/`;
    document.cookie = `nombre=${encodeURIComponent(
      usuario.nombre
    )}; ${expira}; path=/`;
    document.cookie = `correo=${usuario.correo}; ${expira}; path=/`;
    document.cookie = `telefono=${usuario.telefono}; ${expira}; path=/`;
    document.cookie = `tipo_contacto=${usuario.tipo_contacto}; ${expira}; path=/`;
    document.cookie = `estatus=${usuario.estatus}; ${expira}; path=/`;
  }

  // login al click
  btnLogin.addEventListener("click", async () => {
    const usuario = inputUsuario.value.trim();
    const password = inputPassword.value.trim();

    // validacion para evitar mandar algo vacio
    if (!usuario || !password) {
      mostrarToast("Por favor, completa todos los campos.", "warning");
      return;
    }

    // desactivar boton en lo que carga
    btnLogin.disabled = true;
    btnLogin.textContent = "Iniciando...";

    try {
      const res = await fetch(ENDPOINT_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await res.json();

      // mensaje de todo bien
      if (data.mensaje === "Acceso correcto" && data.usuario) {
        mostrarToast("¡Bienvenido! Acceso concedido.", "exito", 4000);
        guardarEnCookies(data.usuario);

        // redirigir
        setTimeout(() => {
          window.location.href = "../VIEW/testLogin.php"; //--------------------------------------------- redireccion
        }, 1500);
      } else if (data.error) {
        // mensaje de error
        mostrarToast(data.error, "error", 5000);
      } else {
        // si no es ninguno de los anteriores
        mostrarToast("Ocurrió algo raro... intenta más tarde.", "warning");
      }
    } catch (err) {
      console.error("Error en login:", err);
      mostrarToast("Error de conexión. Intenta más tarde.", "error");
    }

    // reactivar boton
    btnLogin.disabled = false;
    btnLogin.textContent = "Iniciar sesión";
  });
});
