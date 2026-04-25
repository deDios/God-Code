(function (window) {
  "use strict";

  const API_MEDIA = "https://godcode.com.mx/db/web/u_media.php";

  const MAX_MB = 1;
  const MAX_BYTES = MAX_MB * 1024 * 1024;

  const OUTPUT_MIME = "image/webp";
  const OUTPUT_EXT = "webp";
  const OUTPUT_QUALITY = 0.82;

  async function imageFileToWebp(file) {
    if (!(file instanceof File)) {
      throw new Error("Archivo inválido.");
    }

    const bitmap = await createImageBitmap(file);

    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0);

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, OUTPUT_MIME, OUTPUT_QUALITY);
    });

    bitmap.close?.();

    if (!blob) {
      throw new Error("No se pudo convertir la imagen a WEBP.");
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "imagen";

    return new File([blob], `${baseName}.${OUTPUT_EXT}`, {
      type: OUTPUT_MIME,
      lastModified: Date.now(),
    });
  }

  function validateImageFile(file) {
    if (!(file instanceof File)) {
      return { ok: false, error: "Archivo inválido." };
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return { ok: false, error: "Formato no permitido. Usa JPG, PNG o WEBP." };
    }

    if (file.size <= 0) {
      return { ok: false, error: "La imagen está vacía." };
    }

    if (file.size > MAX_BYTES) {
      return { ok: false, error: `La imagen excede ${MAX_MB}MB.` };
    }

    return { ok: true };
  }

  function pickImageFile() {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/jpeg,image/png,image/webp";
      input.hidden = true;

      document.body.appendChild(input);

      input.addEventListener(
        "change",
        () => {
          const file = input.files && input.files[0] ? input.files[0] : null;
          input.remove();
          resolve(file);
        },
        { once: true }
      );

      input.click();
    });
  }

  async function uploadAdminMedia({ modulo, id, pos = null, file }) {
    const validation = validateImageFile(file);

    if (!validation.ok) {
      throw new Error(validation.error);
    }

    if (!modulo) {
      throw new Error("Falta el módulo de media.");
    }

    if (!id || Number(id) <= 0) {
      throw new Error("Falta el ID del registro.");
    }

    const webpFile = await imageFileToWebp(file);

    const fd = new FormData();
    fd.append("modulo", String(modulo));
    fd.append("id", String(id));
    fd.append("imagen", webpFile);

    if (modulo === "noticias") {
      if (![1, 2].includes(Number(pos))) {
        throw new Error("Para noticias, pos debe ser 1 o 2.");
      }

      fd.append("pos", String(pos));
    }

    const res = await fetch(API_MEDIA, {
      method: "POST",
      body: fd,
    });

    const text = await res.text().catch(() => "");

    let json = null;

    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(text || "Respuesta inválida del servidor.");
    }

    if (!res.ok || json.ok === false) {
      throw new Error(json.error || `HTTP ${res.status}`);
    }

    return json;
  }

  function createObjectPreview(file) {
    if (!(file instanceof File)) return null;
    return URL.createObjectURL(file);
  }

  function revokeObjectPreview(url) {
    if (url && typeof url === "string" && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }

  window.AdminMedia = {
    API_MEDIA,
    MAX_MB,
    validateImageFile,
    pickImageFile,
    uploadAdminMedia,
    createObjectPreview,
    revokeObjectPreview,
    imageFileToWebp,
  };
})(window);