<?php
// u_cursoImg.php
declare(strict_types=1);

// --- Config ---
const MAX_MB     = 10;
const MAX_BYTES  = MAX_MB * 1024 * 1024;
const ALLOWED    = ['image/jpeg' => 'jpg', 'image/png' => 'png'];

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('Access-Control-Allow-Origin: *'); 

function respond(array $data, int $status = 200): void {
  http_response_code($status);
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  respond(['ok' => false, 'error' => 'Método no permitido'], 405);
}

$cursoId = isset($_POST['curso_id']) ? (int)$_POST['curso_id'] : 0;
if ($cursoId <= 0) {
  respond(['ok' => false, 'error' => 'curso_id inválido'], 400);
}

if (!isset($_FILES['imagen'])) {
  respond(['ok' => false, 'error' => 'Falta archivo `imagen`'], 400);
}

$f = $_FILES['imagen'];

// Errores en general solo por si acaso
$errMap = [
  UPLOAD_ERR_INI_SIZE   => 'Archivo excede límite del servidor',
  UPLOAD_ERR_FORM_SIZE  => 'Archivo excede límite del formulario',
  UPLOAD_ERR_PARTIAL    => 'Subida incompleta',
  UPLOAD_ERR_NO_FILE    => 'No se subió archivo',
  UPLOAD_ERR_NO_TMP_DIR => 'Falta carpeta temporal',
  UPLOAD_ERR_CANT_WRITE => 'No se pudo escribir el archivo',
  UPLOAD_ERR_EXTENSION  => 'Extensión bloqueada por el servidor',
];
if ($f['error'] !== UPLOAD_ERR_OK) {
  $msg = $errMap[$f['error']] ?? ('Error de subida (código '.$f['error'].')');
  respond(['ok' => false, 'error' => $msg], 400);
}

if (!is_uploaded_file($f['tmp_name'])) {
  respond(['ok' => false, 'error' => 'Archivo no válido'], 400);
}
if ((int)$f['size'] > MAX_BYTES) {
  respond(['ok' => false, 'error' => 'La imagen excede '.MAX_MB.'MB'], 400);
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime  = $finfo ? finfo_file($finfo, $f['tmp_name']) : null;
if ($finfo) finfo_close($finfo);

if (!$mime || !isset(ALLOWED[$mime])) {
  respond(['ok' => false, 'error' => 'Formato no permitido. Usa JPG o PNG.'], 400);
}

$ext = ALLOWED[$mime];

// Ruta de destino
$docRoot = rtrim($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__), '/');
$destDir = $docRoot . '/ASSETS/cursos';
if (!is_dir($destDir)) {
  if (!mkdir($destDir, 0775, true) && !is_dir($destDir)) {
    respond(['ok' => false, 'error' => 'No se pudo crear el directorio de destino'], 500);
  }
}

// como queda guardado =  /ASSETS/cursos/img{ID}.{ext}
$filename = 'img' . $cursoId . '.' . $ext;
$destPath = $destDir . '/' . $filename;

// Mover archivo
if (!move_uploaded_file($f['tmp_name'], $destPath)) {
  respond(['ok' => false, 'error' => 'No se pudo guardar el archivo'], 500);
}

@chmod($destPath, 0644);

// borra el anterior
$otherExt = $ext === 'png' ? 'jpg' : 'png';
$otherPath = $destDir . '/img' . $cursoId . '.' . $otherExt;
if (is_file($otherPath)) { @unlink($otherPath); }

// URL publica 
$url = '/ASSETS/cursos/' . $filename . '?v=' . time();

respond(['ok' => true, 'url' => $url]);
