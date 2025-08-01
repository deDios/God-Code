document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#trabaja-con-nosotros form");
  const btn = form.querySelector("button[type='submit']");
  const nombre = form.querySelector("input[placeholder='Nombre completo']");
  const correo = form.querySelector("input[type='email']");
  const telefono = form.querySelector("input[type='tel']");
  const puesto = form.querySelector("select");
  const mensaje = form.querySelector("textarea");
  const archivo = form.querySelector("#cv-file");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = "Enviando...";

    if (
      !nombre.value.trim() ||
      !correo.value.trim().includes("@") ||
      !telefono.value.trim().match(/^\d{10}$/) ||
      !puesto.value
    ) {
      gcToast("Por favor completa todos los campos obligatorios.", "warning");
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
    btn.disabled = false;
    btn.textContent = "Enviar";

    // esto se va a poder descomentar cuando se tenga listo el endpoint de momento nomas esta de adorno
    /*
    const formData = new FormData();
    formData.append("nombre", nombre.value.trim());
    formData.append("correo", correo.value.trim());
    formData.append("telefono", telefono.value.trim());
    formData.append("puesto", puesto.value);
    formData.append("mensaje", mensaje.value.trim());
    if (archivo.files[0]) {
      formData.append("cv", archivo.files[0]);
    }

    try {
      const res = await fetch("ENDPOINT.CV", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data?.mensaje) {
        gcToast(data.mensaje, "exito");
        form.reset();
      } else {
        gcToast("Enviado, pero no hubo respuesta del servidor.", "warning");
      }
    } catch (err) {
      console.error("Error al enviar:", err);
      gcToast("Error al enviar el formulario. Intenta más tarde.", "error");
    }

    btn.disabled = false;
    btn.textContent = "Enviar";
    */
  });
});
