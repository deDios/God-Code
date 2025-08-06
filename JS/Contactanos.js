document.addEventListener("DOMContentLoaded", () => {
  // Cambia aquí si quieres más o menos dígitos
  const LONGITUD_MAX_TEL = 10;

  const form = document.querySelector("#contacto form");
  const nombre = form.querySelector("input[placeholder='Nombre']");
  const telefono = form.querySelector("input[placeholder='Teléfono']");
  const correo = form.querySelector("input[type='email']");
  const mensaje = form.querySelector("textarea");
  const btn = form.querySelector("button[type='submit']");

  function prepararInput(input) {
    let container = input.closest('.input-alerta-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'input-alerta-container';
      input.parentNode.insertBefore(container, input);
      container.appendChild(input);
    }

    let icono = container.querySelector('.icono-alerta');
    if (!icono) {
      icono = document.createElement('span');
      icono.className = 'icono-alerta';
      container.appendChild(icono);
    }

    let tooltip = container.querySelector('.tooltip-alerta');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'tooltip-alerta';
      container.appendChild(tooltip);
    }

    // Limpia listeners previos
    icono.onmouseenter = null;
    icono.onmouseleave = null;

    // Tooltip solo aparece con hover en warning
    icono.addEventListener("mouseenter", function () {
      if (container.classList.contains("alerta") && icono.textContent === "⚠️") {
        tooltip.style.display = "block";
      }
    });
    icono.addEventListener("mouseleave", function () {
      tooltip.style.display = "none";
    });

    // Por si acaso, oculta el tooltip si no está en warning
    container.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });

    return container;
  }

  // --- Prepara campos
  const telCont = prepararInput(telefono);
  const correoCont = prepararInput(correo);

  function validarTelefono() {
    let val = telefono.value.replace(/\D/g, '');
    if (val.length > LONGITUD_MAX_TEL) val = val.slice(0, LONGITUD_MAX_TEL);
    telefono.value = val;

    const icono = telCont.querySelector('.icono-alerta');
    const tooltip = telCont.querySelector('.tooltip-alerta');

    let valido = /^\d{10}$/.test(val);

    if (!valido && val.length > 0) {
      telCont.classList.add("alerta");
      icono.textContent = "⚠️";
      icono.classList.remove("valido");
      tooltip.textContent = "El teléfono debe tener exactamente 10 dígitos numéricos.";
      tooltip.style.display = "none";
    } else if (valido) {
      telCont.classList.remove("alerta");
      icono.textContent = "✅";
      icono.classList.add("valido");
      tooltip.textContent = "";
      tooltip.style.display = "none";
    } else {
      telCont.classList.remove("alerta");
      icono.textContent = "";
      icono.classList.remove("valido");
      tooltip.textContent = "";
      tooltip.style.display = "none";
    }
  }

  function validarCorreo() {
    const valor = correo.value.trim();
    const icono = correoCont.querySelector('.icono-alerta');
    const tooltip = correoCont.querySelector('.tooltip-alerta');
    let valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

    if (!valido && valor.length > 0) {
      correoCont.classList.add("alerta");
      icono.textContent = "⚠️";
      icono.classList.remove("valido");
      tooltip.textContent = "El correo debe tener al menos un @ y un dominio válido.";
      tooltip.style.display = "none";
    } else if (valido) {
      correoCont.classList.remove("alerta");
      icono.textContent = "✅";
      icono.classList.add("valido");
      tooltip.textContent = "";
      tooltip.style.display = "none";
    } else {
      correoCont.classList.remove("alerta");
      icono.textContent = "";
      icono.classList.remove("valido");
      tooltip.textContent = "";
      tooltip.style.display = "none";
    }
  }

  telefono.addEventListener("input", validarTelefono);
  correo.addEventListener("input", validarCorreo);

  form.addEventListener("submit", function (e) {
    validarTelefono();
    validarCorreo();

    const hayErrores = form.querySelectorAll('.input-alerta-container.alerta').length > 0;
    if (
      !nombre.value.trim() ||
      !telefono.value.match(/^\d{10}$/) ||
      !correo.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) ||
      !mensaje.value.trim() ||
      hayErrores
    ) {
      e.preventDefault();
      gcToast("Por favor completa todos los campos correctamente.", "warning");
      return false;
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
      btn.disabled = false;
      btn.textContent = "Enviar";
      // Limpia validaciones visuales
      [telCont, correoCont].forEach(c => {
        c.classList.remove("alerta");
        c.querySelector('.icono-alerta').textContent = "";
        c.querySelector('.icono-alerta').classList.remove("valido");
        c.querySelector('.tooltip-alerta').textContent = "";
        c.querySelector('.tooltip-alerta').style.display = "none";
      });
    }, 1200);
  });
});
