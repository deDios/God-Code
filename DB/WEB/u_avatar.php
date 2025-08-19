<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path; // opcional
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Método no permitido"]);
    exit;
}

if (!isset($_POST['usuario_id'])) {
    echo json_encode(["error" => "Falta 'usuario_id'"]);
    exit;
}
$usuario_id = (int)$_POST['usuario_id'];

if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["error" => "No se recibió el archivo o hubo un error en la carga"]);
    exit;
}

// Validar MIME real
if (!class_exists('finfo')) {
    echo json_encode(["error" => "Extensión fileinfo no disponible en el servidor"]);
    exit;
}
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($_FILES['avatar']['tmp_name']);
$allowed = ["image/jpeg" => "jpg", "image/png" => "png"];
if (!isset($allowed[$mime])) {
    echo json_encode(["error" => "Formato no permitido. Solo JPG o PNG."]);
    exit;
}

// (Opcional) tamaño máx 2MB
if ($_FILES['avatar']['size'] > 2 * 1024 * 1024) {
    echo json_encode(["error" => "La imagen excede 2MB"]);
    exit;
}

// Directorio de almacenamiento
$baseDir = realpath(__DIR__ . "/../../ASSETS/usuario/usuarioImg");
if ($baseDir === false) {
    echo json_encode(["error" => "Directorio de destino no encontrado"]);
    exit;
}
if (!is_writable($baseDir)) {
    echo json_encode(["error" => "El directorio de destino no es escribible"]);
    exit;
}

$ext = $allowed[$mime];

// ✅ NUEVO patrón de nombre: img_user{ID}.{ext}
$filename = "img_user" . $usuario_id . "." . $ext;
$destPath = $baseDir . DIRECTORY_SEPARATOR . $filename;

// Limpiar archivos previos (ambos patrones y ambas extensiones)
$patterns = [
    "user_" . $usuario_id . ".jpg",
    "user_" . $usuario_id . ".png",
    "img_user" . $usuario_id . ".jpg",
    "img_user" . $usuario_id . ".png",
];
foreach ($patterns as $p) {
    $full = $baseDir . DIRECTORY_SEPARATOR . $p;
    if (file_exists($full) && $full !== $destPath) {
        @unlink($full);
    }
}

// Guardar archivo
if (!move_uploaded_file($_FILES['avatar']['tmp_name'], $destPath)) {
    echo json_encode(["error" => "No se pudo guardar la imagen"]);
    exit;
}

// URL pública
$publicBase = "/ASSETS/usuario/usuarioImg";
$url = $publicBase . "/" . $filename;

echo json_encode([
    "mensaje" => "Imagen actualizada correctamente",
    "url" => $url
]);
