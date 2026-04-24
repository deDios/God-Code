<?php
//DBWEB/u_media.php
declare(strict_types=1);

header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

ini_set("display_errors", "0");
error_reporting(E_ALL);

const MAX_MB = 1;
const MAX_BYTES = MAX_MB * 1024 * 1024;

function respond(bool $ok, array|string $payload = [], int $status = 200): void
{
    http_response_code($status);

    if (!$ok) {
        $msg = is_string($payload) ? $payload : ($payload["error"] ?? "Error desconocido");
        echo json_encode(["ok" => false, "error" => $msg], JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo json_encode(array_merge(["ok" => true], is_array($payload) ? $payload : []), JSON_UNESCAPED_UNICODE);
    exit;
}

function cleanModulo(string $modulo): string
{
    $modulo = strtolower(trim($modulo));
    return preg_replace('/[^a-z0-9_-]/', '', $modulo) ?? "";
}

function getDocRoot(): string
{
    $root = $_SERVER["DOCUMENT_ROOT"] ?? "";
    if ($root && is_dir($root)) {
        return rtrim($root, "/\\");
    }

    return rtrim(dirname(__DIR__, 2), "/\\");
}

function getMediaConfig(string $modulo, int $id, int $pos): array
{
    if ($modulo === "noticias") {
        if (!in_array($pos, [1, 2], true)) {
            respond(false, "Para noticias, pos debe ser 1 o 2.", 400);
        }

        return [
            "dir" => "ASSETS/noticia/NoticiasImg",
            "base" => "noticia_img{$pos}_{$id}",
        ];
    }

    if ($modulo === "cursos") {
        return [
            "dir" => "ASSETS/cursos",
            "base" => "img{$id}",
        ];
    }

    if ($modulo === "tutores") {
        return [
            "dir" => "ASSETS/tutor",
            "base" => "tutor_{$id}",
        ];
    }

    respond(false, "Módulo no permitido. Usa noticias, cursos o tutores.", 400);
    return [
        "dir" => "",
        "base" => "",
    ];
}

function createImageFromUpload(string $tmpPath, string $mime)
{
    if ($mime === "image/jpeg") {
        return @imagecreatefromjpeg($tmpPath);
    }

    if ($mime === "image/png") {
        return @imagecreatefrompng($tmpPath);
    }

    if ($mime === "image/webp" && function_exists("imagecreatefromwebp")) {
        return @imagecreatefromwebp($tmpPath);
    }

    return false;
}

function saveAsWebp($src, string $destPath, int $quality = 82): bool
{
    if (!function_exists("imagewebp")) {
        return false;
    }

    $w = imagesx($src);
    $h = imagesy($src);

    $dst = imagecreatetruecolor($w, $h);

    imagealphablending($dst, false);
    imagesavealpha($dst, true);

    $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
    imagefilledrectangle($dst, 0, 0, $w, $h, $transparent);

    imagecopy($dst, $src, 0, 0, 0, 0, $w, $h);

    $ok = imagewebp($dst, $destPath, $quality);

    imagedestroy($dst);

    return $ok;
}

function deleteOldVariants(string $destDir, string $base): array
{
    $deleted = [];
    $exts = ["webp", "png", "jpg", "jpeg"];

    foreach ($exts as $ext) {
        $path = $destDir . DIRECTORY_SEPARATOR . $base . "." . $ext;

        if (is_file($path)) {
            if (@unlink($path)) {
                $deleted[] = basename($path);
            }
        }
    }

    return $deleted;
}

try {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        respond(false, "Método no permitido.", 405);
    }

    $modulo = cleanModulo((string)($_POST["modulo"] ?? ""));
    $id = isset($_POST["id"]) ? (int)$_POST["id"] : 0;
    $pos = isset($_POST["pos"]) ? (int)$_POST["pos"] : 0;

    if ($modulo === "") {
        respond(false, "Falta el parámetro modulo.", 400);
    }

    if ($id <= 0) {
        respond(false, "El parámetro id es obligatorio y debe ser mayor a 0.", 400);
    }

    if (!isset($_FILES["imagen"]) || !is_array($_FILES["imagen"])) {
        respond(false, 'No se recibió el archivo "imagen".', 400);
    }

    $file = $_FILES["imagen"];

    if (($file["error"] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        $map = [
            UPLOAD_ERR_INI_SIZE => "El archivo excede el tamaño máximo del servidor.",
            UPLOAD_ERR_FORM_SIZE => "El archivo excede el tamaño máximo permitido por el formulario.",
            UPLOAD_ERR_PARTIAL => "El archivo se subió parcialmente.",
            UPLOAD_ERR_NO_FILE => "No se subió ningún archivo.",
            UPLOAD_ERR_NO_TMP_DIR => "Falta carpeta temporal en el servidor.",
            UPLOAD_ERR_CANT_WRITE => "No se pudo escribir el archivo en disco.",
            UPLOAD_ERR_EXTENSION => "Una extensión de PHP detuvo la subida.",
        ];

        $code = (int)$file["error"];
        respond(false, $map[$code] ?? ("Error de subida: " . $code), 400);
    }

    if (!is_uploaded_file($file["tmp_name"])) {
        respond(false, "Archivo no válido.", 400);
    }

    if ((int)$file["size"] <= 0) {
        respond(false, "Archivo vacío o inválido.", 400);
    }

    if ((int)$file["size"] > MAX_BYTES) {
        respond(false, "La imagen excede " . MAX_MB . "MB.", 400);
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file["tmp_name"]);

    $allowed = [
        "image/jpeg" => "jpg",
        "image/png" => "png",
        "image/webp" => "webp",
    ];

    if (!isset($allowed[$mime])) {
        respond(false, "Formato no permitido. Usa JPG, PNG o WEBP.", 400);
    }

    $config = getMediaConfig($modulo, $id, $pos);

    $docRoot = getDocRoot();
    $relativeDir = $config["dir"];
    $baseName = $config["base"];

    $destDir = $docRoot . DIRECTORY_SEPARATOR . str_replace(["/", "\\"], DIRECTORY_SEPARATOR, $relativeDir);

    if (!is_dir($destDir)) {
        if (!mkdir($destDir, 0775, true) && !is_dir($destDir)) {
            respond(false, "No se pudo crear el directorio destino.", 500);
        }
    }

    $src = createImageFromUpload($file["tmp_name"], $mime);

    if (!$src) {
        respond(false, "No se pudo procesar la imagen en el servidor.", 400);
    }

    $deleted = deleteOldVariants($destDir, $baseName);

    $fileName = $baseName . ".webp";
    $destPath = $destDir . DIRECTORY_SEPARATOR . $fileName;

    $saved = saveAsWebp($src, $destPath, 82);

    imagedestroy($src);

    if (!$saved) {
        respond(false, "No se pudo guardar la imagen como WEBP. Verifica que GD tenga soporte WebP.", 500);
    }

    @chmod($destPath, 0664);

    $publicUrl = "/" . trim($relativeDir, "/") . "/" . $fileName . "?v=" . time();

    respond(true, [
        "mensaje" => "Media subida correctamente.",
        "url" => $publicUrl,
        "path" => "/" . trim($relativeDir, "/") . "/" . $fileName,
        "filename" => $fileName,
        "modulo" => $modulo,
        "id" => $id,
        "pos" => $modulo === "noticias" ? $pos : null,
        "deleted" => $deleted,
    ]);
} catch (Throwable $e) {
    respond(false, "Excepción: " . $e->getMessage(), 500);
}