document.addEventListener("DOMContentLoaded", () => {
  const MAX_DIGITOS_TELEFONO = 10; //aca deje esta variable para que sea el limite de digitos que puede escribir el usuario

  const form = document.querySelector("#contacto form");
  const btn = form.querySelector("button[type='submit']");
  const nombre = form.querySelector("input[placeholder='Nombre']");
  const telefono = form.querySelector("input[placeholder='Teléfono']");
  const correo = form.querySelector("input[type='email']");
  const mensaje = form.querySelector("textarea");

  function mostrarTooltip(input, mensaje) {
    let cont = input.closest(".input-alerta-container");
    if (!cont) return;

    cont.querySelector(".form-tooltip")?.remove();

    const tooltip = document.createElement("div");
    tooltip.className = "form-tooltip";
    tooltip.textContent = mensaje;
    cont.appendChild(tooltip);
    cont.classList.add("active");
    setTimeout(() => (tooltip.style.opacity = "1"), 10);
  }

  function quitarTooltip(input) {
    let cont = input.closest(".input-alerta-container");
    if (!cont) return;
    cont.querySelector(".form-tooltip")?.remove();
    cont.classList.remove("active");
  }

  function validarNombre() {
    if (!nombre.value.trim()) {
      mostrarTooltip(nombre, "Por favor ingresa tu nombre.");
      return false;
    }
    quitarTooltip(nombre);
    return true;
  }

  function validarTelefono() {
    telefono.value = telefono.value
      .replace(/\D/g, "")
      .slice(0, MAX_DIGITOS_TELEFONO);

    if (!telefono.value) {
      mostrarTooltip(telefono, "Ingresa tu número telefónico.");
      return false;
    }
    if (telefono.value.length < MAX_DIGITOS_TELEFONO) {
      mostrarTooltip(
        telefono,
        `El teléfono debe tener ${MAX_DIGITOS_TELEFONO} dígitos.`
      );
      return false;
    }
    quitarTooltip(telefono);
    return true;
  }

  function validarCorreo() {
    if (!correo.value.trim()) {
      mostrarTooltip(correo, "Ingresa tu correo electrónico.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value)) {
      mostrarTooltip(correo, "Por favor ingresa un correo válido.");
      return false;
    }
    quitarTooltip(correo);
    return true;
  }

  function validarMensaje() {
    if (!mensaje.value.trim()) {
      mostrarTooltip(mensaje, "Cuéntanos brevemente en qué podemos ayudarte.");
      return false;
    }
    quitarTooltip(mensaje);
    return true;
  }

  [nombre, telefono, correo, mensaje].forEach((input) => {
    input.addEventListener("input", () => {
      if (input === telefono) validarTelefono();
      else if (input === correo) validarCorreo();
      else if (input === nombre) validarNombre();
      else if (input === mensaje) validarMensaje();
      bloquearBtnSiHayErrores();
    });
    input.addEventListener("blur", () => quitarTooltip(input));
  });

  function bloquearBtnSiHayErrores() {
    const valid =
      validarNombre() &&
      validarTelefono() &&
      validarCorreo() &&
      validarMensaje();
    btn.disabled = !valid;
    return valid;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!bloquearBtnSiHayErrores()) {
      gcToast("Revisa los campos marcados.", "warning");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Enviando...";

    setTimeout(() => {
      gcToast(
        "Tu mensaje ha sido enviado con éxito. ¡Gracias por contactarnos!",
        "exito",
        6000
      );
      form.reset();
      [nombre, telefono, correo, mensaje].forEach(quitarTooltip);
      btn.disabled = false;
      btn.textContent = "Enviar";
    }, 900); 
  });

  telefono.addEventListener("paste", (e) => {
    setTimeout(() => validarTelefono(), 5);
  });

  bloquearBtnSiHayErrores();
});
