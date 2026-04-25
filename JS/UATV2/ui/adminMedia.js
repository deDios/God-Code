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