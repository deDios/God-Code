import { encode } from "https://cdn.jsdelivr.net/npm/@jsquash/webp@1.5.0/+esm";

(function (window) {
  "use strict";

  const API_MEDIA = "https://godcode.com.mx/db/web/u_media.php";

  const MAX_MB = 1;
  const MAX_BYTES = MAX_MB * 1024 * 1024;

  const INPUT_MAX_MB = 20;
  const INPUT_MAX_BYTES = INPUT_MAX_MB * 1024 * 1024;

  const OUTPUT_MIME = "image/webp";
  const OUTPUT_EXT = "webp";

  const START_QUALITY = 75;
  const MIN_QUALITY = 42;
  const QUALITY_STEP = 8;

  const MAX_WIDTH = 1600;
  const MAX_HEIGHT = 1200;
  const MIN_WIDTH = 560;

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

    if (file.size > INPUT_MAX_BYTES) {
      return { ok: false, error: `La imagen excede ${INPUT_MAX_MB}MB.` };
    }

    return { ok: true };
  }

  function getTargetSize(width, height, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height, 1);

    return {
      width: Math.max(1, Math.round(width * ratio)),
      height: Math.max(1, Math.round(height * ratio)),
    };
  }

  function bufferToFile(buffer, fileName) {
    const blob = new Blob([buffer], { type: OUTPUT_MIME });

    return new File([blob], fileName, {
      type: OUTPUT_MIME,
      lastModified: Date.now(),
    });
  }

  async function encodeCanvasToWebpFile(canvas, fileName, quality) {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) {
      throw new Error("No se pudo procesar la imagen.");
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const webpBuffer = await encode(imageData, {
      quality,
    });

    return bufferToFile(webpBuffer, fileName);
  }

  async function imageFileToWebp(file) {
    if (!(file instanceof File)) {
      throw new Error("Archivo inválido.");
    }

    const bitmap = await createImageBitmap(file);
    const baseName = file.name.replace(/\.[^.]+$/, "") || "imagen";
    const fileName = `${baseName}.${OUTPUT_EXT}`;

    let maxWidth = MAX_WIDTH;
    let maxHeight = MAX_HEIGHT;
    let lastFile = null;

    try {
      while (maxWidth >= MIN_WIDTH) {
        const size = getTargetSize(bitmap.width, bitmap.height, maxWidth, maxHeight);

        const canvas = document.createElement("canvas");
        canvas.width = size.width;
        canvas.height = size.height;

        const ctx = canvas.getContext("2d", { alpha: false });

        if (!ctx) {
          throw new Error("No se pudo preparar la imagen.");
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size.width, size.height);
        ctx.drawImage(bitmap, 0, 0, size.width, size.height);

        for (
          let quality = START_QUALITY;
          quality >= MIN_QUALITY;
          quality -= QUALITY_STEP
        ) {
          const webpFile = await encodeCanvasToWebpFile(canvas, fileName, quality);
          lastFile = webpFile;

          console.log("[AdminMedia] WEBP generado:", {
            width: size.width,
            height: size.height,
            quality,
            sizeKB: Math.round(webpFile.size / 1024),
            type: webpFile.type,
          });

          if (webpFile.size <= MAX_BYTES) {
            return webpFile;
          }
        }

        maxWidth = Math.floor(maxWidth * 0.82);
        maxHeight = Math.floor(maxHeight * 0.82);
      }

      if (lastFile && lastFile.size <= MAX_BYTES) {
        return lastFile;
      }

      throw new Error(`No se pudo comprimir la imagen por debajo de ${MAX_MB}MB.`);
    } finally {
      bitmap.close?.();
    }
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

    if (webpFile.type !== OUTPUT_MIME) {
      throw new Error("La imagen procesada no es WEBP.");
    }

    if (webpFile.size > MAX_BYTES) {
      throw new Error(`La imagen procesada excede ${MAX_MB}MB.`);
    }

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
    INPUT_MAX_MB,
    validateImageFile,
    pickImageFile,
    uploadAdminMedia,
    createObjectPreview,
    revokeObjectPreview,
    imageFileToWebp,
  };
})(window);