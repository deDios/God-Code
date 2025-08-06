document.addEventListener("DOMContentLoaded", () => {
  const MAX_DIGITOS_TELEFONO = 10; // Cambia aquí si necesitas otro límite

  const form = document.querySelector("#contacto form");
  const btn = form.querySelector("button[type='submit']");
  const nombre = form.querySelector("input[placeholder='Nombre']");
  const telefono = form.querySelector("input[placeholder='Teléfono']");
  const correo = form.querySelector("input[type='email']");
  const mensaje = form.querySelector("textarea");

  // --- Función para envolver y crear spans de alerta y tooltip automáticamente ---
  function wrapWithAlert(input) {
    if (input.parentElement.classList.contains('input-alerta-container')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'input-alerta-container';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    // Icono de alerta/validación
    const icon = document.createElement('span');
    icon.className = 'icono-alerta';
    wrapper.appendChild(icon);
    // Tooltip
    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip-alerta';
    wrapper.appendChild(tooltip);
  }
  wrapWithAlert(telefono);
  wrapWithAlert(correo);

  // --- Función para mostrar icono y tooltip, asegura que solo haya uno por campo ---
  function mostrarIcono(input, tipo, mensaje = "") {
    const cont = input.parentElement;
    const icono = cont.querySelector(".icono-alerta");
    const tooltip = cont.querySelector(".tooltip-alerta");

    if (tipo === "ok") {
      icono.textContent = "✅";
      icono.classList.add("valido");
      icono.classList.remove("alerta");
      tooltip.textContent = "Campo válido.";
      tooltip.style.display = "none";
      cont.classList.remove("alerta");
    } else if (tipo === "warn") {
      icono.textContent = "⚠️";
      icono.classList.remove("valido");
      icono.classList.add("alerta");
      tooltip.textContent = mensaje;
      tooltip.style.display = "block";
      cont.classList.add("alerta");
    } else {
      icono.textContent = "";
      icono.classList.remove("valido", "alerta");
      tooltip.textContent = "";
      tooltip.style.display = "none";
      cont.classList.remove("alerta");
    }
  }

  // --- Validadores ---
  function validarTelefono() {
    let val = telefono.value.trim();
    if (!val) {
      mostrarIcono(telefono, "");
      return false;
    }
    if (!/^\d+$/.test(val) || val.length < 10) {
      mostrarIcono(telefono, "warn", `Teléfono debe ser solo números y mínimo 10 dígitos.`);
      return false;
    }
    if (val.length > MAX_DIGITOS_TELEFONO) {
      telefono.value = val.slice(0, MAX_DIGITOS_TELEFONO);
    }
    if (val.length === MAX_DIGITOS_TELEFONO) {
      mostrarIcono(telefono, "ok");
      return true;
    }
    mostrarIcono(telefono, "warn", `Debe tener ${MAX_DIGITOS_TELEFONO} dígitos.`);
    return false;
  }

  function validarCorreo() {
    let val = correo.value.trim();
    if (!val) {
      mostrarIcono(correo, "");
      return false;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!emailOk) {
      mostrarIcono(correo, "warn", "Coloca un correo válido.");
      return false;
    }
    mostrarIcono(correo, "ok");
    return true;
  }

  // --- Eventos de input en tiempo real ---
  telefono.addEventListener("input", validarTelefono);
  correo.addEventListener("input", validarCorreo);
  telefono.addEventListener("blur", validarTelefono);
  correo.addEventListener("blur", validarCorreo);

  // --- Submit del formulario ---
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let okTelefono = validarTelefono();
    let okCorreo = validarCorreo();
    let okNombre = nombre.value.trim().length > 0;
    let okMensaje = mensaje.value.trim().length > 0;

    if (!okNombre || !okTelefono || !okCorreo || !okMensaje) {
      gcToast("Por favor completa todos los campos correctamente.", "warning");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Enviando...";

    // Aquí iría el fetch si vas a enviar info a backend

    gcToast("Tu mensaje ha sido enviado con éxito. ¡Gracias por contactarnos!", "exito", 6000);
    form.reset();
    mostrarIcono(telefono, "");
    mostrarIcono(correo, "");
    btn.disabled = false;
    btn.textContent = "Enviar";
  });
});
