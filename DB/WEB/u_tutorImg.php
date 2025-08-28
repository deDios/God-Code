<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if (!$path || !file_exists($path)) {
  http_response_code(500);
  echo json_encode(["ok"=>false,"error"=>"No se encontró Conexion.php en $path"]);
  exit;
}
include $path;

if (!isset($_POST['tutor_id'])) {
  http_response_code(422);
  echo json_encode(["ok"=>false,"error"=>"Falta 'tutor_id' (POST)"]);
  exit;
}

$tutor_id = (int)$_POST['tutor_id'];
if ($tutor_id <= 0) {
  http_response_code(422);
  echo json_encode(["ok"=>false,"error"=>"'tutor_id' inválido"]);
  exit;
}

if (!isset($_FILES['imagen']) || !is_uploaded_file($_FILES['imagen']['tmp_name'])) {
  http_response_code(400);
  echo json_encode(["ok"=>false,"error"=>"No se recibió archivo en 'imagen'"]);
  exit;
}

$file = $_FILES['imagen'];
$maxBytes = 2 * 1024 * 1024; // 2MB
if ($file['size'] > $maxBytes) {
  http_response_code(413);
  echo json_encode(["ok"=>false,"error"=>"La imagen excede 2MB"]);
  exit;
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);
$allowed = [
  'image/png'  => 'png',
  'image/jpeg' => 'jpg',
  'image/webp' => 'webp'
];

if (!isset($allowed[$mime])) {
  http_response_code(415);
  echo json_encode(["ok"=>false,"error"=>"Formato no permitido. Use PNG/JPG/WebP"]);
  exit;
}

$ext = $allowed[$mime];

$root = "/home/site/wwwroot";
$dirRel = "/ASSETS/tutor";
$dirAbs = $root . $dirRel;

if (!is_dir($dirAbs)) {
  if (!mkdir($dirAbs, 0775, true)) {
    http_response_code(500);
    echo json_encode(["ok"=>false,"error"=>"No se pudo crear el directorio destino"]);
    exit;
  }
}

$baseName = "tutor_" . $tutor_id;
$oldGlobs = glob($dirAbs . "/" . $baseName . ".*");
if ($oldGlobs && is_array($oldGlobs)) {
  foreach ($oldGlobs as $g) {
    @unlink($g);
  }
}

$targetAbs = $dirAbs . "/" . $baseName . "." . $ext;
if (!move_uploaded_file($file['tmp_name'], $targetAbs)) {
  http_response_code(500);
  echo json_encode(["ok"=>false,"error"=>"No se pudo mover el archivo"]);
  exit;
}

@chmod($targetAbs, 0644);

$targetRel = $dirRel . "/" . $baseName . "." . $ext;

$con = conectar();
if ($con) {
  mysqli_set_charset($con, "utf8mb4");
  $q = mysqli_prepare($con, "UPDATE god_code.gc_tutor SET fecha_modif = NOW() WHERE id = ?");
  if ($q) {
    mysqli_stmt_bind_param($q, "i", $tutor_id);
    mysqli_stmt_execute($q);
    mysqli_stmt_close($q);
  }
  mysqli_close($con);
}

echo json_encode([
  "ok"   => true,
  "id"   => $tutor_id,
  "url"  => $targetRel,         
  "mime" => $mime,
  "size" => (int)$file['size'],
  "ts"   => time()               
], JSON_UNESCAPED_UNICODE);
