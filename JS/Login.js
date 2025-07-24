document.addEventListener("DOMContentLoaded", () => {

  const usuarioCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("usuario="));
  if (usuarioCookie) {
    try {
      const datos = JSON.parse(decodeURIComponent(usuarioCookie.split("=")[1]));
      if (datos?.id) {
        window.location.href = "../VIEW/testLogin.php"; //---redirecciona si hay una cookie de algun usuario logeado
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

  // ENDPOINT LOGIN
  const ENDPOINT_LOGIN =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/login_usuario.php";

  // notificaciones
  const mostrarToast =
    window.mostrarToast ||
    function (msg, tipo = "exito", duracion = 5000) {
      console.log(`[${tipo.toUpperCase()}] ${msg}`);
    };

  // se eliminan cookies antiguas individuales (si existen) 
  function limpiarCookiesAntiguas() {
    const cookiesAntiguas = [
      "usuario_id",
      "nombre",
      "correo",
      "telefono",
      "tipo_contacto",
      "estatus",
    ];
    cookiesAntiguas.forEach((clave) => {
      document.cookie = `${clave}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    });
  }

  // se guardan las cookies
  function guardarEnCookies(usuario) {
    limpiarCookiesAntiguas(); // primero borramos las antiguas

    const dias = 1;
    const fechaExp = new Date();
    fechaExp.setTime(fechaExp.getTime() + dias * 24 * 60 * 60 * 1000);
    const expira = "expires=" + fechaExp.toUTCString();

    // se guardan los datos en una sola cookie con JSON codificado
    const datosJSON = encodeURIComponent(JSON.stringify(usuario));
    document.cookie = `usuario=${datosJSON}; ${expira}; path=/`;
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
          window.location.href = "../VIEW/Home.php"; //--------------------------------------------- redireccion
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


  [inputUsuario, inputPassword].forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        btnLogin.click();
      }
    });
  });
});
