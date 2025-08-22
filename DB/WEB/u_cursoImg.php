<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Método no permitido"]);
    exit;
}

// validar curso_id
if (!isset($_POST['curso_id'])) {
    echo json_encode(["error" => "Falta 'curso_id'"]);
    exit;
}
$curso_id = (int)$_POST['curso_id'];

// validar archivo subido
if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["error" => "No se recibió el archivo o hubo un error en la carga"]);
    exit;
}

if (!class_exists('finfo')) {
    echo json_encode(["error" => "Extensión fileinfo no disponible en el servidor"]);
    exit;
}
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($_FILES['imagen']['tmp_name']);
$allowed = ["image/jpeg" => "jpg", "image/png" => "png"];
if (!isset($allowed[$mime])) {
    echo json_encode(["error" => "Formato no permitido. Solo JPG o PNG."]);
    exit;
}

// tamaño max 2MB 
if ($_FILES['imagen']['size'] > 2 * 1024 * 1024) {
    echo json_encode(["error" => "La imagen excede 2MB"]);
    exit;
}

// directirio
$baseDir = realpath(__DIR__ . "/../../ASSETS/cursos");
if ($baseDir === false) {
    echo json_encode(["error" => "Directorio de destino no encontrado"]);
    exit;
}
if (!is_writable($baseDir)) {
    echo json_encode(["error" => "El directorio de destino no es escribible"]);
    exit;
}

$ext = $allowed[$mime];

// como va a quedar img{ID}.{ext}
$filename = "img" . $curso_id . "." . $ext;
$destPath = $baseDir . DIRECTORY_SEPARATOR . $filename;

// limpiar lo que estaba antes 
foreach (["jpg", "png"] as $oldExt) {
    $old = $baseDir . DIRECTORY_SEPARATOR . "img" . $curso_id . "." . $oldExt;
    if (file_exists($old) && $old !== $destPath) {
        @unlink($old);
    }
}

if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $destPath)) {
    echo json_encode(["error" => "No se pudo guardar la imagen"]);
    exit;
}

$publicBase = "/ASSETS/curso";
$url = $publicBase . "/" . $filename;

echo json_encode([
    "mensaje" => "Imagen de curso actualizada correctamente",
    "url" => $url
]);