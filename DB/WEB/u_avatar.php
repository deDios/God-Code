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
// variables de control para el tamaño del archivo
$MAX_BYTES = 10 * 1024 * 1024;

$allowed = ["image/jpeg" => "jpg", "image/png" => "png"];
if (!isset($allowed[$mime])) {
    echo json_encode(["error" => "Formato no permitido. Solo JPG o PNG."]);
    exit;
}

if ($_FILES['avatar']['size'] > $MAX_BYTES) {
  respond(["ok" => false, "error" => "La imagen excede 10MB"], 400);
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

$filename = "user_" . $usuario_id . "." . $ext;
$destPath = $baseDir . DIRECTORY_SEPARATOR . $filename;

// Limpiar archivos previos 
foreach (["jpg", "png"] as $oldExt) {
    $old = $baseDir . DIRECTORY_SEPARATOR . "user_" . $usuario_id . "." . $oldExt;
    if (file_exists($old) && $old !== $destPath) {
        @unlink($old);
    }
}

// Guardar archivo
if (!move_uploaded_file($_FILES['avatar']['tmp_name'], $destPath)) {
    echo json_encode(["error" => "No se pudo guardar la imagen"]);
    exit;
}

// URL publica
$publicBase = "/ASSETS/usuario/usuarioImg";
$url = $publicBase . "/" . $filename;

echo json_encode([
    "mensaje" => "Imagen actualizada correctamente",
    "url" => $url
]);
