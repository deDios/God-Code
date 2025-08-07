document.addEventListener("DOMContentLoaded", () => {
  // Cambia aquí si quieres más o menos dígitos
  const LONGITUD_MAX_TEL = 10;

  const form = document.querySelector("#contacto form");
  const nombre = form.querySelector("input[placeholder='Nombre']");
  const telefono = form.querySelector("input[placeholder='Teléfono']");
  const correo = form.querySelector("input[type='email']");
  const mensaje = form.querySelector("textarea");
  const btn = form.querySelector("button[type='submit']");

  // --- Crea wrappers para los campos que lo necesiten ---
  function wrapInput(input) {
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
      icono.tabIndex = 0; // para accesibilidad
      container.appendChild(icono);
    }
    return { container, icono };
  }

  const { container: telCont, icono: telIcono } = wrapInput(telefono);
  const { container: correoCont, icono: correoIcono } = wrapInput(correo);

  // ---- TOOLTIP ----
  function setIcon(input, icon, tooltipText = "", isValid = false) {
    const { container, icono } = wrapInput(input);
    icono.innerHTML = icon + (tooltipText ? `<span class="tooltip-alerta">${tooltipText}</span>` : "");
    icono.classList.toggle("valido", isValid);
    if (tooltipText) {
      container.classList.add("alerta");
    } else {
      container.classList.remove("alerta");
    }
    // Tooltip solo aparece cuando hay mensaje y hover
    // (El CSS ya lo controla)
  }

  function limpiarIcono(input) {
    const { container, icono } = wrapInput(input);
    icono.innerHTML = "";
    icono.classList.remove("valido");
    container.classList.remove("alerta");
  }

  // --- Validaciones en input ---
  telefono.addEventListener("input", function () {
    let val = telefono.value.replace(/\D/g, '');
    if (val.length > LONGITUD_MAX_TEL) val = val.slice(0, LONGITUD_MAX_TEL);
    telefono.value = val;

    if (val.length === 0) {
      limpiarIcono(telefono);
      return;
    }

    if (!/^\d{10}$/.test(val)) {
      setIcon(telefono, "⚠️", "El teléfono debe tener exactamente 10 dígitos numéricos.", false);
    } else {
      setIcon(telefono, "✅", "", true);
    }
  });

  correo.addEventListener("input", function () {
    const valor = correo.value.trim();
    if (valor.length === 0) {
      limpiarIcono(correo);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      setIcon(correo, "⚠️", "El correo debe tener al menos un @ y un dominio válido.", false);
    } else {
      setIcon(correo, "✅", "", true);
    }
  });

  // --- Validar al enviar ---
  form.addEventListener("submit", function (e) {
    // Forzar validación por si no han tocado campos
    telefono.dispatchEvent(new Event("input"));
    correo.dispatchEvent(new Event("input"));

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
      limpiarIcono(telefono);
      limpiarIcono(correo);
    }, 1200);
  });

  // --- Accesibilidad: limpiar al resetear el form
  form.addEventListener("reset", () => {
    limpiarIcono(telefono);
    limpiarIcono(correo);
  });
});
