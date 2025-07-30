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
    console.log(`[TOAST] tipo=${tipo} msg="${mensaje}"`);
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
    console.log("validarDuplicados → correo:", correo, "telefono:", telefono);

    const contCorreo = correoInput.closest(".input-alerta-container");
    const contTel = telefonoInput.closest(".input-alerta-container");

    // Limpiamos sólo alertas de duplicado
    [contCorreo, contTel].forEach((c) => {
      if (c.dataset.origen === "duplicado") {
        console.log("  limpiando alerta duplicado en:", c);
        c.classList.remove("alerta");
        delete c.dataset.origen;
      }
    });

    if (!correo && !telefono) {
      console.log("  nada que validar (vacío)");
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
      console.log("  respuesta c_usuario:", data);

      let hayWarning = false;
      if (Array.isArray(data) && data.length > 0) {
        const yaCorreo = data.some((d) => d.correo === correo);
        const yaTelefono = data.some((d) => d.telefono === telefono);
        console.log("  yaCorreo?", yaCorreo, "yaTelefono?", yaTelefono);

        if (yaCorreo) {
          console.log("    marcado duplicado → correo");
          contCorreo.classList.add("alerta");
          contCorreo.dataset.origen = "duplicado";
          contCorreo.querySelector(".icono-alerta").textContent = "⚠️";
          hayWarning = true;
        }
        if (yaTelefono) {
          console.log("    marcado duplicado → telefono");
          contTel.classList.add("alerta");
          contTel.dataset.origen = "duplicado";
          contTel.querySelector(".icono-alerta").textContent = "⚠️";
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
      console.warn("  Error durante validarDuplicados:", error);
    } finally {
      console.log("  finalizando validarDuplicados, validando formato");
      validarCampoIndividual(correoInput);
      validarCampoIndividual(telefonoInput);
    }
  }

  function validarCampoIndividual(input) {
    const cont = input.closest(".input-alerta-container");
    const icono = cont.querySelector(".icono-alerta");
    const valor = input.value.trim();

    let formatoValido = true;
    if (input === telefonoInput) {
      formatoValido = /^\d{10}$/.test(valor);
      console.log("validarFormato telefono:", valor, "→", formatoValido);
    } else if (input === correoInput) {
      formatoValido = valor.includes("@");
      console.log("validarFormato correo:", valor, "→", formatoValido);
    }

    if (!formatoValido) {
      console.log("  formato inválido en:", input.name);
      cont.classList.add("alerta");
      icono.textContent = "⚠️";
      icono.classList.remove("valido");
    } else if (!cont.classList.contains("alerta")) {
      // solo dibujamos el check si no hay ya alerta
      if (valor) {
        console.log("  formato válido, mostrando check en:", input.name);
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
    console.log("  alertas totales en form:", hayAlertas);
    btn.disabled = hayAlertas > 0;
  }

  // eventos
  correoInput.addEventListener("blur", () => {
    console.log("blur correo");
    validarCampoIndividual(correoInput);
  });
  telefonoInput.addEventListener("blur", () => {
    console.log("blur telefono");
    validarCampoIndividual(telefonoInput);
  });

  correoInput.addEventListener("input", () => {
    console.log("input correo");
    validarDuplicados();
  });
  telefonoInput.addEventListener("input", () => {
    console.log("input telefono");
    validarDuplicados();
  });

  form.addEventListener("submit", async (e) => {
    console.log("Submit form-registro");
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
      console.log("  error: campos vacíos");
      mostrarToast("Por favor, completa todos los campos.", "warning");
      btn.disabled = false;
      btn.textContent = "Registrarse";
      return;
    }
    if (password !== confirmar) {
      console.log("  error: contraseñas no coinciden");
      mostrarToast("Las contraseñas no coinciden.", "warning");
      btn.disabled = false;
      btn.textContent = "Registrarse";
      return;
    }
    const hayAlertasFinal = document.querySelectorAll(
      ".input-alerta-container.alerta"
    ).length;
    console.log("  alertas antes de enviar:", hayAlertasFinal);
    if (hayAlertasFinal) {
      mostrarToast("Corrige los campos en rojo antes de continuar.", "warning");
      btn.disabled = false;
      btn.textContent = "Registrarse";
      return;
    }

    try {
      console.log("  enviando POST a i_usuario.php", {
        nombre,
        correo,
        telefono,
      });
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
      console.log("  respuesta i_usuario.php:", insertarData);
      if (insertarData?.mensaje === "Usuario registrado correctamente") {
        mostrarToast("Registro exitoso. ¡Bienvenido!", "exito", 6000);
        form.reset();
        document.querySelectorAll(".icono-alerta").forEach((el) => {
          el.textContent = "";
          el.classList.remove("valido");
        });
      } else {
        console.log("  error al registrar:", insertarData);
        mostrarToast("No se pudo completar el registro.", "error");
      }
    } catch (error) {
      console.error("  excepción al registrar usuario:", error);
      mostrarToast("Error de conexión. Intenta más tarde.", "error");
    }

    btn.disabled = false;
    btn.textContent = "Registrarse";
  });
});
