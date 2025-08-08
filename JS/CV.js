document.addEventListener("DOMContentLoaded", () => {
  const MAX_DIGITOS_TEL = 10; //el limite de caracteres para el input de telefono

  // Seleccion de los inputs
  const form = document.querySelector("#trabaja-con-nosotros form");
  const correo = form.querySelector("input[type='email']");
  const telefono = form.querySelector("input[type='tel']");
  const btn = form.querySelector("button[type='submit']");
  const puesto = form.querySelector("select");

  function asegurarContenedor(input) {
    let parent = input.parentElement;
    if (!parent.classList.contains("input-alerta-container")) {
      const wrapper = document.createElement("div");
      wrapper.className = "input-alerta-container";
      parent.replaceChild(wrapper, input);
      wrapper.appendChild(input);
    }
  }

  [correo, telefono].forEach((input) => asegurarContenedor(input));

  function mostrarIcono(input, tipo, mensajeTooltip) {
    const cont = input.parentElement;
    let icono = cont.querySelector(".icono-alerta");
    if (!icono) {
      icono = document.createElement("span");
      icono.className = "icono-alerta";
      icono.tabIndex = 0;
      cont.appendChild(icono);
    }
    icono.innerHTML =
      (tipo === "valido" ? "✅" : "⚠️") +
      `<span class="tooltip-alerta">${mensajeTooltip || ""}</span>`;
    icono.classList.toggle("valido", tipo === "valido");
    if (tipo !== "valido") {
      cont.classList.add("alerta");
    } else {
      cont.classList.remove("alerta");
    }
    icono.style.display = input.value.trim() ? "inline-block" : "none";
  }

  function limpiarIcono(input) {
    const cont = input.parentElement;
    const icono = cont.querySelector(".icono-alerta");
    if (icono) icono.remove();
    cont.classList.remove("alerta");
  }

  // Validaciones individuales
  function validarCorreo() {
    const valor = correo.value.trim();
    if (!valor) {
      mostrarIcono(correo, "warning", "El correo es obligatorio.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      mostrarIcono(
        correo,
        "warning",
        "El correo debe tener al menos un @ y un dominio válido."
      );
      return false;
    }
    mostrarIcono(correo, "valido", "Campo válido");
    return true;
  }

  function validarTelefono() {
    let valor = telefono.value.replace(/\D/g, "");
    valor = valor.slice(0, MAX_DIGITOS_TEL); 
    telefono.value = valor; 
    if (!valor) {
      mostrarIcono(telefono, "warning", "El teléfono es obligatorio.");
      return false;
    }
    if (valor.length !== MAX_DIGITOS_TEL) {
      mostrarIcono(
        telefono,
        "warning",
        `El teléfono debe tener exactamente ${MAX_DIGITOS_TEL} dígitos numéricos.`
      );
      return false;
    }
    mostrarIcono(telefono, "valido", "Campo válido");
    return true;
  }

  correo.addEventListener("input", validarCorreo);
  telefono.addEventListener("input", validarTelefono);

  [correo, telefono].forEach((input) => {
    input.addEventListener("blur", () => {
      if (!input.value.trim()) limpiarIcono(input);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valido = true;
    if (!validarCorreo()) valido = false;
    if (!validarTelefono()) valido = false;
    if (!puesto.value) valido = false;

    if (!valido) {
      gcToast("Por favor completa todos los campos obligatorios.", "warning");
      btn.disabled = false;
      btn.textContent = "Enviar";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Enviando...";
    // mensaje de que se mando el CV
    setTimeout(() => {
      gcToast(
        "Formulario enviado con éxito. ¡Gracias por postularte!",
        "exito",
        6000
      );
      form.reset();
      [correo, telefono].forEach((input) => limpiarIcono(input));
      btn.disabled = false;
      btn.textContent = "Enviar";
    }, 1200);
  });
});
