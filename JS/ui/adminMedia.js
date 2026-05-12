(function (window) {
  "use strict";

  console.log("[AdminMedia] version canvas-fallback-20260512 cargada");

  const API_MEDIA = "https://godcode.com.mx/db/web/u_media.php";

  const MAX_MB = 1;
  const MAX_BYTES = MAX_MB * 1024 * 1024;

  const INPUT_MAX_MB = 20;
  const INPUT_MAX_BYTES = INPUT_MAX_MB * 1024 * 1024;

  const START_QUALITY = 0.78;
  const MIN_QUALITY = 0.35;
  const QUALITY_STEP = 0.07;

  const MAX_WIDTH = 1200;
  const MAX_HEIGHT = 900;
  const MIN_WIDTH = 360;

  const MIME_WEBP = "image/webp";
  const MIME_JPEG = "image/jpeg";

  async function supportsMimeEncode(mime) {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 2;

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, mime, 0.8);
    });

    return !!blob && blob.type === mime;
  }

  function getExtensionFromMime(mime) {
    if (mime === MIME_WEBP) return "webp";
    if (mime === MIME_JPEG) return "jpg";
    return "jpg";
  }

  function validateImageFile(file) {
    if (!(file instanceof File)) {
      return { ok: false, error: "Archivo inválido." };
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return { ok: false, error: "Formato no permitido. Usa JPG, PNG o WEBP." };
    }

    if (file.size <= 0) {
      return { ok: false, error: "La imagen está vacía." };
    }

    if (file.size > INPUT_MAX_BYTES) {
      return {
        ok: false,
        error: `La imagen original excede ${INPUT_MAX_MB}MB.`,
      };
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

  async function canvasToBlob(canvas, mime, quality) {
    return await new Promise((resolve) => {
      canvas.toBlob(resolve, mime, quality);
    });
  }

  async function imageFileToOptimized(file) {
    if (!(file instanceof File)) {
      throw new Error("Archivo inválido.");
    }

    const canWebp = await supportsMimeEncode(MIME_WEBP);
    const outputMime = canWebp ? MIME_WEBP : MIME_JPEG;
    const outputExt = getExtensionFromMime(outputMime);

    console.log("[AdminMedia] formato de salida:", outputMime);

    const bitmap = await createImageBitmap(file);
    const baseName = file.name.replace(/\.[^.]+$/, "") || "imagen";
    const fileName = `${baseName}.${outputExt}`;

    let maxWidth = MAX_WIDTH;
    let maxHeight = MAX_HEIGHT;
    let lastBlob = null;

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
          const blob = await canvasToBlob(canvas, outputMime, Number(quality.toFixed(2)));

          if (!blob) continue;

          lastBlob = blob;

          console.log("[AdminMedia] imagen procesada:", {
            width: size.width,
            height: size.height,
            quality: Number(quality.toFixed(2)),
            sizeKB: Math.round(blob.size / 1024),
            type: blob.type,
          });

          if (blob.size <= MAX_BYTES) {
            return new File([blob], fileName, {
              type: outputMime,
              lastModified: Date.now(),
            });
          }
        }

        maxWidth = Math.floor(maxWidth * 0.82);
        maxHeight = Math.floor(maxHeight * 0.82);
      }

      if (lastBlob && lastBlob.size <= MAX_BYTES) {
        return new File([lastBlob], fileName, {
          type: outputMime,
          lastModified: Date.now(),
        });
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

    const optimizedFile = await imageFileToOptimized(file);

    if (optimizedFile.size > MAX_BYTES) {
      throw new Error(`La imagen procesada excede ${MAX_MB}MB.`);
    }

    const fd = new FormData();
    fd.append("modulo", String(modulo));
    fd.append("id", String(id));
    fd.append("imagen", optimizedFile);

    if (modulo === "noticias") {
      if (![1, 2].includes(Number(pos))) {
        throw new Error("Para noticias, pos debe ser 1 o 2.");
      }

      fd.append("pos", String(pos));
    }

    console.log("[AdminMedia] subiendo media:", {
      modulo,
      id,
      pos,
      name: optimizedFile.name,
      type: optimizedFile.type,
      sizeKB: Math.round(optimizedFile.size / 1024),
    });

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
    imageFileToOptimized,
    imageFileToWebp: imageFileToOptimized,
  };
})(window);