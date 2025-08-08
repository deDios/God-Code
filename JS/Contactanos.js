document.addEventListener("DOMContentLoaded", () => {
  const LONGITUD_MAX_TEL = 10;

  const form = document.querySelector("#contacto form");
  const nombre = form.querySelector("input[placeholder='Nombre']");
  const telefono = form.querySelector("input[placeholder='Teléfono']");
  const correo = form.querySelector("input[type='email']");
  const mensaje = form.querySelector("textarea");
  const btn = form.querySelector("button[type='submit']");

  function asegurarContenedor(input) {
    let parent = input.parentElement;
    if (!parent.classList.contains("input-alerta-container")) {
      const wrapper = document.createElement("div");
      wrapper.className = "input-alerta-container";
      parent.replaceChild(wrapper, input);
      wrapper.appendChild(input);
    }
  }
  [telefono, correo].forEach((input) => asegurarContenedor(input));

  function limpiarIcono(input) {
    const cont = input.parentElement;
    cont.querySelectorAll(".icono-alerta").forEach((el) => el.remove());
    // También eliminamos tooltips flotantes del body
    document
      .querySelectorAll(".tooltip-alerta.flotante")
      .forEach((el) => el.remove());
    cont.classList.remove("alerta");
  }

  function mostrarIconoConTooltip(input, tipo, mensajeTooltip = "") {
    limpiarIcono(input);
    const cont = input.parentElement;

    let icono = document.createElement("span");
    icono.className = "icono-alerta";
    icono.textContent = tipo === "valido" ? "✅" : "⚠️";
    icono.tabIndex = 0;
    cont.appendChild(icono);

    icono.classList.toggle("valido", tipo === "valido");
    icono.style.display = input.value.trim() ? "inline-block" : "none";

    if (tipo === "warning" && mensajeTooltip) {
      cont.classList.add("alerta");

      // Crear tooltip como flotante en body
      let tooltip = document.createElement("span");
      tooltip.className = "tooltip-alerta flotante";
      tooltip.textContent = mensajeTooltip;
      tooltip.style.position = "absolute";
      tooltip.style.display = "none";
      tooltip.style.zIndex = "999999"; // prioridad máxima
      document.body.appendChild(tooltip);

      // Eventos para mostrar tooltip al pasar sobre el ícono
      icono.addEventListener("mouseenter", () => {
        const rect = icono.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX}px`;
        tooltip.style.top = `${rect.bottom + 6 + window.scrollY}px`;
        tooltip.style.display = "block";
      });

      icono.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
      });

      icono.addEventListener("focus", () => {
        const rect = icono.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX}px`;
        tooltip.style.top = `${rect.bottom + 6 + window.scrollY}px`;
        tooltip.style.display = "block";
      });

      icono.addEventListener("blur", () => {
        tooltip.style.display = "none";
      });
    }
  }

  // Validaciones en input
  telefono.addEventListener("input", function () {
    let val = telefono.value.replace(/\D/g, "");
    if (val.length > LONGITUD_MAX_TEL) val = val.slice(0, LONGITUD_MAX_TEL);
    telefono.value = val;

    if (val.length === 0) {
      limpiarIcono(telefono);
      return;
    }

    if (!/^\d{10}$/.test(val)) {
      mostrarIconoConTooltip(
        telefono,
        "warning",
        "El teléfono debe tener exactamente 10 dígitos numéricos."
      );
    } else {
      mostrarIconoConTooltip(telefono, "valido");
    }
  });

  correo.addEventListener("input", function () {
    const valor = correo.value.trim();
    if (valor.length === 0) {
      limpiarIcono(correo);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      mostrarIconoConTooltip(
        correo,
        "warning",
        "El correo debe tener al menos un @ y un dominio válido."
      );
    } else {
      mostrarIconoConTooltip(correo, "valido");
    }
  });

  [telefono, correo].forEach((input) => {
    input.addEventListener("blur", () => {
      if (!input.value.trim()) limpiarIcono(input);
    });
  });

  form.addEventListener("submit", function (e) {
    telefono.dispatchEvent(new Event("input"));
    correo.dispatchEvent(new Event("input"));

    const hayErrores =
      form.querySelectorAll(".input-alerta-container.alerta").length > 0;
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
      limpiarIcono(telefono);
      limpiarIcono(correo);
      btn.disabled = false;
      btn.textContent = "Enviar";
    }, 1200);
  });

  form.addEventListener("reset", () => {
    limpiarIcono(telefono);
    limpiarIcono(correo);
  });
});
