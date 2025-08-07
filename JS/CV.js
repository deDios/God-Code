document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#trabaja-con-nosotros form");
  const btn = form.querySelector("button[type='submit']");
  const nombre = form.querySelector("input[placeholder='Nombre completo']");
  const correo = form.querySelector("input[type='email']");
  const telefono = form.querySelector("input[type='tel']");
  const puesto = form.querySelector("select");
  const mensaje = form.querySelector("textarea");
  const archivo = form.querySelector("#cv-file");

  // ---- Configuración ----
  const MAX_DIGITOS_TELEFONO = 10; // Puedes cambiarlo

  // --- Helper: Envuelve input en .input-alerta-container si no existe ---
  [nombre, correo, telefono].forEach(input => {
    let cont = input.closest('.input-alerta-container');
    if (!cont) {
      const wrapper = document.createElement('div');
      wrapper.className = 'input-alerta-container';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
    }
  });

  // ---- Iconos y Tooltips ----
  function setAlerta(input, msg, esValido = false) {
    const container = input.closest(".input-alerta-container");
    let icono = container.querySelector(".icono-alerta");
    if (!icono) {
      icono = document.createElement("span");
      icono.className = "icono-alerta";
      container.appendChild(icono);
    }
    if (esValido) {
      icono.textContent = "✅";
      icono.classList.add("valido");
      icono.title = "Campo válido";
      icono.innerHTML = "✅";
    } else if (msg) {
      icono.classList.remove("valido");
      icono.innerHTML = `&#9888; <span class="tooltiptext">${msg}</span>`;
      icono.title = "";
    } else {
      icono.textContent = "";
      icono.classList.remove("valido");
      icono.title = "";
      icono.innerHTML = "";
    }
  }

  // --- Validadores ---
  function validarNombre() {
    const val = nombre.value.trim();
    if (val.length === 0) {
      setAlerta(nombre, "Por favor ingresa tu nombre.");
      return false;
    }
    setAlerta(nombre, "", true);
    return true;
  }

  function validarCorreo() {
    const val = correo.value.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val)) {
      setAlerta(correo, "El correo debe tener al menos un @ y un dominio válido.");
      return false;
    }
    setAlerta(correo, "", true);
    return true;
  }

  function validarTelefono() {
    const val = telefono.value.replace(/\D/g, "");
    if (val.length !== MAX_DIGITOS_TELEFONO) {
      setAlerta(telefono, `El teléfono debe tener exactamente ${MAX_DIGITOS_TELEFONO} dígitos.`);
      return false;
    }
    setAlerta(telefono, "", true);
    return true;
  }

  // Limitar el input a solo números y máximo 10 dígitos
  telefono.addEventListener("input", () => {
    telefono.value = telefono.value.replace(/\D/g, "").slice(0, MAX_DIGITOS_TELEFONO);
    validarTelefono();
  });

  // Validaciones en tiempo real
  nombre.addEventListener("input", validarNombre);
  correo.addEventListener("input", validarCorreo);
  telefono.addEventListener("input", validarTelefono);

  // Inicializar iconos al cargar
  validarNombre();
  validarCorreo();
  validarTelefono();

  // ---- Submit ----
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = "Enviando...";

    const valido =
      validarNombre() &
      validarCorreo() &
      validarTelefono() &
      puesto.value;

    if (!valido) {
      window.gcToast?.("Por favor completa todos los campos obligatorios.", "warning");
      btn.disabled = false;
      btn.textContent = "Enviar";
      return;
    }

    // Aquí pondrías el fetch real si lo necesitas.
    window.gcToast?.("Formulario enviado con éxito. ¡Gracias por postularte!", "exito", 6000);
    form.reset();

    // Limpia los iconos y revalida en vacío
    setTimeout(() => {
      validarNombre();
      validarCorreo();
      validarTelefono();
    }, 100);

    btn.disabled = false;
    btn.textContent = "Enviar";
  });
});
