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
    const cont = document.querySelector(".toast-container");
    if (!cont) return;
    const t = document.createElement("div");
    t.className = `toast ${tipo}`;
    t.textContent = mensaje;
    cont.appendChild(t);
    setTimeout(() => t.classList.add("mostrar"), 10);
    setTimeout(() => {
      t.classList.remove("mostrar");
      setTimeout(() => cont.removeChild(t), 400);
    }, duracion);
  }

  // valida FORMATO y marca alerta si falla
  function validarFormato(input) {
    const cont = input.closest(".input-alerta-container");
    const icono = cont.querySelector(".icono-alerta");
    const val = input.value.trim();
    let ok = true;
    if (input === telefonoInput) {
      ok = /^\d{10}$/.test(val);
    } else if (input === correoInput) {
      ok = val.includes("@");
    }
    if (!ok) {
      console.log(`Error de formato en ${input.name}: "${val}"`);
      cont.classList.add("alerta");
      cont.dataset.origen = "formato";
      icono.textContent = "⚠️";
      icono.classList.remove("valido");
    } else {
      console.log(`Formato OK en ${input.name}: "${val}"`);
      if (cont.dataset.origen === "formato") {
        // solo quitamos alerta de formato, no otras
        delete cont.dataset.origen;
        cont.classList.remove("alerta");
      }
      // ponemos check si hay algo escrito
      if (val) {
        icono.textContent = "✅";
        icono.classList.add("valido");
      } else {
        icono.textContent = "";
        icono.classList.remove("valido");
      }
    }
  }

  // valida DUPLICADOS *solo si* no hay alerta de formato
  async function validarDuplicado(input) {
    const cont = input.closest(".input-alerta-container");
    if (cont.dataset.origen === "formato") {
      console.log(`Omitiendo duplicados en ${input.name} por formato inválido`);
      return;
    }

    const correo = correoInput.value.trim().toLowerCase();
    const telefono = telefonoInput.value.trim();
    console.log(`Chequeando duplicado para ${input.name}:`, input.value);

    // limpiamos alerta previa de duplicado
    if (cont.dataset.origen === "duplicado") {
      delete cont.dataset.origen;
      cont.classList.remove("alerta");
    }

    try {
      const res = await fetch(ENDPOINT_CONSULTA, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, telefono }),
      });
      const data = await res.json();
      console.log("Respuesta c_usuario:", data);
      if (Array.isArray(data) && data.length > 0) {
        const field = input === correoInput ? "correo" : "telefono";
        const val = input.value.trim().toLowerCase();
        const existe = data.some(u => u[field] === val);
        if (existe) {
          console.log(`Duplicado encontrado en ${field}: "${val}"`);
          cont.classList.add("alerta");
          cont.dataset.origen = "duplicado";
          cont.querySelector(".icono-alerta").textContent = "⚠️";
          mostrarToast(`Ya existe una cuenta con ese ${field}.`, "warning");
        } else {
          console.log(`No hay duplicado en ${field}`);
        }
      }
    } catch (err) {
      console.warn("Error al consultar duplicados:", err);
    }
  }

  async function validarCampo(input) {
    validarFormato(input);
    await validarDuplicado(input);
    const tot = document.querySelectorAll(
      ".input-alerta-container.alerta"
    ).length;
    console.log("Total alertas tras validar", input.name, ":", tot);
    btn.disabled = tot > 0;
  }

  // Listeners
  [correoInput, telefonoInput].forEach(input => {
    input.addEventListener("blur", () => validarCampo(input));
    input.addEventListener("input", () => validarCampo(input));
  });

  // Submit
  form.addEventListener("submit", async e => {
    console.log("Intento de submit...");
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = "Registrando...";

    const nombre = form.nombre.value.trim();
    const correo = correoInput.value.trim().toLowerCase();
    const telefono = telefonoInput.value.trim();
    const pass = form.password.value.trim();
    const conf = form.confirmarPassword.value.trim();
    const fecha = form.fecha_nacimiento.value;

    // campos vacios
    if (!nombre || !correo || !telefono || !pass || !conf || !fecha) {
      console.log("Error: hay campos vacíos");
      mostrarToast("Por favor, completa todos los campos.", "warning");
      btn.disabled = false;
      btn.textContent = "Registrarse";
      return;
    }
    // contraseñas
    if (pass !== conf) {
      console.log("Error: contraseñas no coinciden");
      mostrarToast("Las contraseñas no coinciden.", "warning");
      btn.disabled = false;
      btn.textContent = "Registrarse";
      return;
    }
    // últimas alertas
    const finalAlerts = document.querySelectorAll(
      ".input-alerta-container.alerta"
    ).length;
    console.log("Alertas antes de enviar:", finalAlerts);
    if (finalAlerts) {
      mostrarToast(
        "Corrige los campos en rojo antes de continuar.",
        "warning"
      );
      btn.disabled = false;
      btn.textContent = "Registrarse";
      return;
    }

    try {
      console.log("Enviando datos de registro:", { nombre, correo, telefono });
      const res = await fetch(ENDPOINT_INSERTAR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          correo,
          telefono,
          fecha_nacimiento: fecha,
          tipo_contacto: 3,
          password: pass
        })
      });
      const json = await res.json();
      console.log("Respuesta i_usuario.php:", json);
      if (json.mensaje === "Usuario registrado correctamente") {
        mostrarToast("Registro exitoso. ¡Bienvenido!", "exito", 6000);
        form.reset();
        document
          .querySelectorAll(".icono-alerta")
          .forEach(el => (el.textContent = ""));
      } else {
        console.log("Error al registrar:", json);
        mostrarToast("No se pudo completar el registro.", "error");
      }
    } catch (err) {
      console.error("Error en fetch registro:", err);
      mostrarToast("Error de conexión. Intenta más tarde.", "error");
    }

    btn.disabled = false;
    btn.textContent = "Registrarse";
  });
});
