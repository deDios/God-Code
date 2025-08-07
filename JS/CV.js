document.addEventListener("DOMContentLoaded", () => {
  // Configuración
  const MAX_DIGITOS_TEL = 10;

  // Selecciona los inputs relevantes
  const form = document.querySelector("#trabaja-con-nosotros form");
  const nombre = form.querySelector("input[placeholder='Nombre completo']");
  const correo = form.querySelector("input[type='email']");
  const telefono = form.querySelector("input[type='tel']");
  const puesto = form.querySelector("select");
  const mensaje = form.querySelector("textarea");
  const btn = form.querySelector("button[type='submit']");

  // Función para envolver el input en .input-alerta-container si no existe
  function asegurarContenedor(input) {
    let parent = input.parentElement;
    if (!parent.classList.contains("input-alerta-container")) {
      const wrapper = document.createElement("div");
      wrapper.className = "input-alerta-container";
      parent.replaceChild(wrapper, input);
      wrapper.appendChild(input);
    }
  }

  [nombre, correo, telefono].forEach(input => asegurarContenedor(input));

  // Función para crear el icono y tooltip
  function mostrarIcono(input, tipo, mensajeTooltip) {
    const cont = input.parentElement;
    let icono = cont.querySelector('.icono-alerta');
    if (!icono) {
      icono = document.createElement('span');
      icono.className = 'icono-alerta';
      icono.tabIndex = 0;
      cont.appendChild(icono);
    }
    icono.innerHTML = (tipo === "valido" ? "✅" : "⚠️") +
      `<span class="tooltip-alerta">${mensajeTooltip || ""}</span>`;
    icono.classList.toggle('valido', tipo === "valido");
    // Solo mostrar tooltip en warning, no en valido
    if (tipo !== "valido") {
      cont.classList.add("alerta");
    } else {
      cont.classList.remove("alerta");
    }
    // Accesibilidad: oculta el icono si el campo está vacío
    icono.style.display = input.value.trim() ? "inline-block" : "none";
  }

  function limpiarIcono(input) {
    const cont = input.parentElement;
    const icono = cont.querySelector('.icono-alerta');
    if (icono) icono.remove();
    cont.classList.remove("alerta");
  }

  // Validaciones individuales
  function validarNombre() {
    if (!nombre.value.trim()) {
      mostrarIcono(nombre, "warning", "El nombre es obligatorio.");
      return false;
    }
    mostrarIcono(nombre, "valido", "Campo válido");
    return true;
  }

  function validarCorreo() {
    const valor = correo.value.trim();
    if (!valor) {
      mostrarIcono(correo, "warning", "El correo es obligatorio.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      mostrarIcono(correo, "warning", "El correo debe tener al menos un @ y un dominio válido.");
      return false;
    }
    mostrarIcono(correo, "valido", "Campo válido");
    return true;
  }

  function validarTelefono() {
    let valor = telefono.value.replace(/\D/g, "");
    telefono.value = valor.slice(0, MAX_DIGITOS_TEL); // Limita la longitud
    if (!valor) {
      mostrarIcono(telefono, "warning", "El teléfono es obligatorio.");
      return false;
    }
    if (valor.length !== MAX_DIGITOS_TEL) {
      mostrarIcono(telefono, "warning", `El teléfono debe tener exactamente ${MAX_DIGITOS_TEL} dígitos numéricos.`);
      return false;
    }
    mostrarIcono(telefono, "valido", "Campo válido");
    return true;
  }

  function validarPuesto() {
    if (!puesto.value) {
      puesto.classList.add("input-error");
      return false;
    }
    puesto.classList.remove("input-error");
    return true;
  }

  // Listeners en tiempo real (solo evalúa si el usuario ha escrito algo)
  nombre.addEventListener("input", validarNombre);
  correo.addEventListener("input", validarCorreo);
  telefono.addEventListener("input", validarTelefono);

  // Limpia iconos al perder foco si está vacío
  [nombre, correo, telefono].forEach(input => {
    input.addEventListener("blur", () => {
      if (!input.value.trim()) limpiarIcono(input);
    });
  });

  // Validación al enviar
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valido = true;
    if (!validarNombre()) valido = false;
    if (!validarCorreo()) valido = false;
    if (!validarTelefono()) valido = false;
    if (!validarPuesto()) valido = false;

    if (!valido) {
      gcToast("Por favor completa todos los campos obligatorios.", "warning");
      btn.disabled = false;
      btn.textContent = "Enviar";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Enviando...";
    // Simula éxito
    setTimeout(() => {
      gcToast("Formulario enviado con éxito. ¡Gracias por postularte!", "exito", 6000);
      form.reset();
      [nombre, correo, telefono].forEach(input => limpiarIcono(input));
      btn.disabled = false;
      btn.textContent = "Enviar";
    }, 1200);
  });
});