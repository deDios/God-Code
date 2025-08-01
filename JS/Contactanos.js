document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#contacto form");
  const btn = form.querySelector("button[type='submit']");
  const nombre = form.querySelector("input[placeholder='Nombre']");
  const telefono = form.querySelector("input[placeholder='Teléfono']");
  const correo = form.querySelector("input[type='email']");
  const mensaje = form.querySelector("textarea");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = "Enviando...";

    // validación rapida
    if (
      !nombre.value.trim() ||
      !telefono.value.trim().match(/^\d{10}$/) ||
      !correo.value.trim().includes("@") ||
      !mensaje.value.trim()
    ) {
      gcToast("Por favor completa todos los campos correctamente.", "warning");
      btn.disabled = false;
      btn.textContent = "Enviar";
      return;
    }

    // envio de exito
    gcToast(
      "Tu mensaje ha sido enviado con éxito. ¡Gracias por contactarnos!",
      "exito",
      6000
    );
    form.reset();
    btn.disabled = false;
    btn.textContent = "Enviar";

    // lo mismo que el endpoint de CV igual esto esta de adorno y de base
    /*
    try {
      const res = await fetch("ENDPOINT.Contactanos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.value.trim(),
          telefono: telefono.value.trim(),
          correo: correo.value.trim(),
          mensaje: mensaje.value.trim()
        })
      });
      const data = await res.json();
      if (data?.mensaje) {
        gcToast(data.mensaje, "exito");
        form.reset();
      } else {
        gcToast("Mensaje enviado, pero sin respuesta del servidor.", "warning");
      }
    } catch (err) {
      console.error("Error al enviar:", err);
      gcToast("Ocurrió un error al enviar el mensaje.", "error");
    }

    btn.disabled = false;
    btn.textContent = "Enviar";
    */
  });
});
