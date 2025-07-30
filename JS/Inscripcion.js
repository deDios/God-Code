document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-registro");
  const btn = form.querySelector(".btn-registrarse");

  const ENDPOINT_INSERTAR =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/i_usuario.php";
  const ENDPOINT_CONSULTA =
    "https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_usuario.php";

  const correoInput = form.querySelector('input[name="correo"]');
  const telefonoInput = form.querySelector('input[name="telefono"]');

  function mostrarToast(mensaje, tipo = "exito", duracion = 5000) {
    const contenedor = document.querySelector(".toast-container");
    if (!contenedor) return;
    const toast = document.createElement("div");
    toast.className = `toast ${tipo}`;
    toast.textContent = mensaje;
    contenedor.appendChild(toast);
    setTimeout(() => toast.classList.add("mostrar"), 10);
    setTimeout(() => {
      toast.classList.remove("mostrar");
      setTimeout(() => contenedor.removeChild(toast), 400);
    }, duracion);
  }

  async function validarDuplicados() {
    const correo = correoInput.value.trim().toLowerCase();
    const telefono = telefonoInput.value.trim();
    const contCorreo = correoInput.closest(".input-alerta-container");
    const contTel = telefonoInput.closest(".input-alerta-container");
    const iconoCorreo = contCorreo.querySelector(".icono-alerta");
    const iconoTel = contTel.querySelector(".icono-alerta");

    [contCorreo, contTel].forEach((c) => {
      if (c.dataset.origen === "duplicado") {
        c.classList.remove("alerta");
        delete c.dataset.origen;
      }
    });

    if (!correo && !telefono) {
      validarCampoIndividual(correoInput);
      validarCampoIndividual(telefonoInput);
      return;
    }

    try {
      const res = await fetch(ENDPOINT_CONSULTA, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, telefono }),
      });
      const data = await res.json();
      let hayWarning = false;

      if (Array.isArray(data) && data.length > 0) {
        const yaCorreo = data.some((d) => d.correo === correo);
        const yaTelefono = data.some((d) => d.telefono === telefono);

        if (yaCorreo) {
          contCorreo.classList.add("alerta");
          contCorreo.dataset.origen = "duplicado";
          iconoCorreo.textContent = "⚠️";
          hayWarning = true;
        }
        if (yaTelefono) {
          contTel.classList.add("alerta");
          contTel.dataset.origen = "duplicado";
          iconoTel.textContent = "⚠️";
          hayWarning = true;
        }
        if (hayWarning) {
          mostrarToast(
            "Ya existe una cuenta con ese " +
              (yaCorreo && yaTelefono
                ? "correo y teléfono."
                : yaCorreo
                ? "correo."
                : "teléfono."),
            "warning"
          );
        }
      }
    } catch (error) {
      console.warn("Error validando duplicados:", error);
    } finally {
      validarCampoIndividual(correoInput);
      validarCampoIndividual(telefonoInput);
    }
  }

  function validarCampoIndividual(input) {
    const cont = input.closest(".input-alerta-container");
    const icono = cont.querySelector(".icono-alerta");
    const valor = input.value.trim();

    // validación de formato
    let formatoValido = true;
    if (input === telefonoInput) {
      formatoValido = /^\d{10}$/.test(valor);
    } else if (input === correoInput) {
      formatoValido = valor.includes("@");
    }

    if (!formatoValido) {
      cont.classList.add("alerta");
      icono.textContent = "⚠️";
      icono.classList.remove("valido");
    } else if (!cont.classList.contains("alerta")) {
      if (valor) {
        icono.textContent = "✅";
        icono.classList.add("valido");
      } else {
        icono.textContent = "";
        icono.classList.remove("valido");
      }
    }
    const hayAlertas = document.querySelectorAll(
      ".input-alerta-container.alerta"
    ).length;
    btn.disabled = hayAlertas > 0;
  }

  correoInput.addEventListener("blur", () =>
    validarCampoIndividual(correoInput)
  );
  telefonoInput.addEventListener("blur", () =>
    validarCampoIndividual(telefonoInput)
  );

  correoInput.addEventListener("input", validarDuplicados);
  telefonoInput.addEventListener("input", validarDuplicados);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = "Registrando...";

    const nombre = form.nombre.value.trim();
    const correo = correoInput.value.trim().toLowerCase();
    const telefono = telefonoInput.value.trim();
    const password = form.password.value.trim();
    const confirmar = form.confirmarPassword.value.trim();
    const fecha = form.fecha_nacimiento.value;

    if (!nombre || !correo || !telefono || !password || !confirmar || !fecha) {
      mostrarToast("Por favor, completa todos los campos.", "warning");
      btn.disabled = false;
      btn.textContent = "Registrarse";
      return;
    }
    if (password !== confirmar) {
      mostrarToast("Las contraseñas no coinciden.", "warning");
      btn.disabled = false;
      btn.textContent = "Registrarse";
      return;
    }
    const hayAlertasFinal = document.querySelectorAll(
      ".input-alerta-container.alerta"
    ).length;
    if (hayAlertasFinal) {
      mostrarToast("Corrige los campos en rojo antes de continuar.", "warning");
      btn.disabled = false;
      btn.textContent = "Registrarse";
      return;
    }

    try {
      const insertarRes = await fetch(ENDPOINT_INSERTAR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          correo,
          telefono,
          fecha_nacimiento: fecha,
          tipo_contacto: 3,
          password,
        }),
      });
      const insertarData = await insertarRes.json();
      if (insertarData?.mensaje === "Usuario registrado correctamente") {
        mostrarToast("Registro exitoso. ¡Bienvenido!", "exito", 6000);
        form.reset();
        document.querySelectorAll(".icono-alerta").forEach((el) => {
          el.textContent = "";
          el.classList.remove("valido");
        });
      } else {
        mostrarToast("No se pudo completar el registro.", "error");
      }
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      mostrarToast("Error de conexión. Intenta más tarde.", "error");
    }

    btn.disabled = false;
    btn.textContent = "Registrarse";
  });
});
