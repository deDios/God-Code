document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#trabaja-con-nosotros form");
  const btn = form.querySelector("button[type='submit']");
  const nombre = form.querySelector("input[placeholder='Nombre completo']");
  const correo = form.querySelector("input[type='email']");
  const telefono = form.querySelector("input[type='tel']");
  const puesto = form.querySelector("select");
  const mensaje = form.querySelector("textarea");
  const archivo = form.querySelector("#cv-file");

  const MAX_DIGITOS_TELEFONO = 10;

  // Para que solo valide tras el primer input
  let touched = {
    nombre: false,
    correo: false,
    telefono: false
  };

  // Helper para iconos/tooltip
  function setAlerta(input, msg, esValido = false) {
    const container = input.closest(".input-alerta-container") || wrapInput(input);
    let icono = container.querySelector(".icono-alerta");
    if (!icono) {
      icono = document.createElement("span");
      icono.className = "icono-alerta";
      container.appendChild(icono);
    }

    // Solo muestra icono si hay algo escrito (touched)
    if (!input.value.trim()) {
      icono.textContent = "";
      icono.classList.remove("valido");
      icono.title = "";
      icono.innerHTML = "";
      return;
    }

    if (esValido) {
      icono.textContent = "✅";
      icono.classList.add("valido");
      icono.title = "Campo válido";
      icono.innerHTML = "✅";
    } else if (msg) {
      icono.classList.remove("valido");
      icono.innerHTML = `&#9888;<span class="tooltiptext">${msg}</span>`;
      icono.title = "";
    } else {
      icono.textContent = "";
      icono.classList.remove("valido");
      icono.title = "";
      icono.innerHTML = "";
    }
  }

  // Auto-wrap para asegurar la estructura
  function wrapInput(input) {
    const wrapper = document.createElement("div");
    wrapper.className = "input-alerta-container";
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    return wrapper;
  }

  // --- Validadores ---
  function validarNombre() {
    if (!touched.nombre) return;
    const val = nombre.value.trim();
    if (val.length === 0) {
      setAlerta(nombre, "Por favor ingresa tu nombre.");
      return false;
    }
    setAlerta(nombre, "", true);
    return true;
  }

  function validarCorreo() {
    if (!touched.correo) return;
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
    if (!touched.telefono) return;
    const val = telefono.value.replace(/\D/g, "");
    if (val.length !== MAX_DIGITOS_TELEFONO) {
      setAlerta(telefono, `El teléfono debe tener exactamente ${MAX_DIGITOS_TELEFONO} dígitos numéricos.`);
      return false;
    }
    setAlerta(telefono, "", true);
    return true;
  }

  // Limitar el input de teléfono
  telefono.addEventListener("input", () => {
    telefono.value = telefono.value.replace(/\D/g, "").slice(0, MAX_DIGITOS_TELEFONO);
    touched.telefono = true;
    validarTelefono();
  });

  nombre.addEventListener("input", () => {
    touched.nombre = true;
    validarNombre();
  });

  correo.addEventListener("input", () => {
    touched.correo = true;
    validarCorreo();
  });

  // --- Submit ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = "Enviando...";

    // Marca todos como tocados
    touched.nombre = true;
    touched.correo = true;
    touched.telefono = true;

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

    // Aquí iría el fetch real
    window.gcToast?.("Formulario enviado con éxito. ¡Gracias por postularte!", "exito", 6000);
    form.reset();

    // Reinicia iconos tras reset (sin mostrar iconos en vacíos)
    touched = { nombre: false, correo: false, telefono: false };
    setTimeout(() => {
      setAlerta(nombre, "");
      setAlerta(correo, "");
      setAlerta(telefono, "");
    }, 100);

    btn.disabled = false;
    btn.textContent = "Enviar";
  });
});
