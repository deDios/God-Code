document.addEventListener("DOMContentLoaded", () => {
  const MAX_DIGITOS_TELEFONO = 10; // variable para cambiar la cantidad de numeros en el input de telefono

  const form = document.querySelector("#trabaja-con-nosotros form");
  const btn = form.querySelector("button[type='submit']");
  const nombre = form.querySelector("input[placeholder='Nombre completo']");
  const correo = form.querySelector("input[type='email']");
  const telefono = form.querySelector("input[type='tel']");
  const puesto = form.querySelector("select");
  const mensaje = form.querySelector("textarea");

  function ensureInputContainer(input) {
    let container = input.parentElement;
    if (!container.classList.contains('input-alerta-container')) {
      // Crear el wrapper solo si aún no existe
      container = document.createElement('div');
      container.className = 'input-alerta-container';
      input.replaceWith(container);
      container.appendChild(input);

      // Insertar icono
      const icono = document.createElement('span');
      icono.className = 'icono-alerta';
      container.appendChild(icono);

      // Insertar tooltip
      const tooltip = document.createElement('span');
      tooltip.className = 'tooltiptext';
      icono.appendChild(tooltip);
    }
    return container;
  }

  function prepararWrappers() {
    form.querySelectorAll('.input-doble input').forEach(ensureInputContainer);
  }
  prepararWrappers();

  // Validar formato
  function validarFormato(input) {
    const container = input.closest('.input-alerta-container');
    const icono = container.querySelector('.icono-alerta');
    const tooltip = icono.querySelector('.tooltiptext');
    let esValido = true;
    let tooltipText = "";
    let value = input.value.trim();

    // Validar según que esta mal en el contenido del input
    if (input.type === "email") {
      esValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      tooltipText = esValido
        ? "Correo válido."
        : "El correo debe tener al menos un @ y un dominio válido.";
    } else if (input.type === "tel") {
      esValido = /^\d{10,}$/.test(value) && value.length === MAX_DIGITOS_TELEFONO;
      if (value.length > MAX_DIGITOS_TELEFONO) input.value = value.slice(0, MAX_DIGITOS_TELEFONO);
      tooltipText = esValido
        ? "Teléfono válido."
        : `El teléfono debe tener exactamente ${MAX_DIGITOS_TELEFONO} dígitos numéricos.`;
    } else {
      esValido = !!value;
      tooltipText = esValido ? "Campo válido." : "Este campo es obligatorio.";
    }

    // Actualizar icono y tooltip
    if (!esValido) {
      container.classList.add("alerta");
      icono.textContent = "⚠️";
      icono.classList.remove("valido");
      tooltip.textContent = tooltipText;
      tooltip.style.display = "block";
    } else {
      container.classList.remove("alerta");
      icono.textContent = "✅";
      icono.classList.add("valido");
      tooltip.textContent = tooltipText;
      tooltip.style.display = "block";
    }
    icono.onmouseenter = () => tooltip.style.visibility = "visible";
    icono.onmouseleave = () => tooltip.style.visibility = "hidden";
    tooltip.style.visibility = "hidden";
  }

  [correo, telefono, nombre].forEach((input) => {
    input.addEventListener("input", () => validarFormato(input));
    input.addEventListener("blur", () => validarFormato(input));
  });

  telefono.addEventListener("input", (e) => {
    let value = telefono.value.replace(/\D/g, "");
    if (value.length > MAX_DIGITOS_TELEFONO) value = value.slice(0, MAX_DIGITOS_TELEFONO);
    telefono.value = value;
    validarFormato(telefono);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = "Enviando...";

    [correo, telefono, nombre].forEach(validarFormato);

    const hayAlertas = form.querySelectorAll(".input-alerta-container.alerta").length > 0;
    if (
      !nombre.value.trim() ||
      !correo.value.trim() ||
      !telefono.value.trim() ||
      !puesto.value ||
      hayAlertas
    ) {
      gcToast("Por favor completa todos los campos obligatorios correctamente.", "warning");
      btn.disabled = false;
      btn.textContent = "Enviar";
      return;
    }

    gcToast(
      "Formulario enviado con éxito. ¡Gracias por postularte!",
      "exito",
      6000
    );
    form.reset();
    form.querySelectorAll(".icono-alerta").forEach(i => {
      i.textContent = "";
      i.classList.remove("valido");
      i.querySelector(".tooltiptext").textContent = "";
    });
    btn.disabled = false;
    btn.textContent = "Enviar";
  });
});
