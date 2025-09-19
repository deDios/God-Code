<?php
declare(strict_types=1);

header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

ini_set('display_errors', '0');
error_reporting(E_ALL);

function respond($ok, $payload = []) {
  if (!$ok) {
    $msg = is_string($payload) ? $payload : ($payload['error'] ?? 'Error desconocido');
    echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
  } else {
    echo json_encode(array_merge(['ok' => true], $payload), JSON_UNESCAPED_UNICODE);
  }
  exit;
}

try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Método no permitido');
  }

  //  Parametros 
  $noticiaId = isset($_POST['noticia_id']) ? (int)$_POST['noticia_id'] : 0;
  $pos       = isset($_POST['pos']) ? (int)$_POST['pos'] : 0;
  if ($noticiaId <= 0) respond(false, 'Falta noticia_id');
  if (!in_array($pos, [1, 2], true)) respond(false, 'pos inválida; debe ser 1 o 2');

  if (!isset($_FILES['imagen']) || !is_array($_FILES['imagen'])) {
    respond(false, 'No se recibió el archivo "imagen"');
  }

  $file = $_FILES['imagen'];
  if (!empty($file['error'])) {
    $map = [
      UPLOAD_ERR_INI_SIZE   => 'El archivo excede el tamaño máximo (php.ini).',
      UPLOAD_ERR_FORM_SIZE  => 'El archivo excede el tamaño máximo permitido por el formulario.',
      UPLOAD_ERR_PARTIAL    => 'El archivo se subió parcialmente.',
      UPLOAD_ERR_NO_FILE    => 'No se subió ningún archivo.',
      UPLOAD_ERR_NO_TMP_DIR => 'Falta carpeta temporal en el servidor.',
      UPLOAD_ERR_CANT_WRITE => 'No se pudo escribir el archivo en disco.',
      UPLOAD_ERR_EXTENSION  => 'Una extensión de PHP detuvo la subida.',
    ];
    $msg = $map[$file['error']] ?? ('Error de subida: ' . $file['error']);
    respond(false, $msg);
  }

  //  Limite 10 MB 
  $MAX_UPLOAD_MB = 10;
  $MAX_BYTES = $MAX_UPLOAD_MB * 1024 * 1024;
  if ((int)$file['size'] <= 0) respond(false, 'Archivo vacío o inválido.');
  if ((int)$file['size'] > $MAX_BYTES) respond(false, 'La imagen excede ' . $MAX_UPLOAD_MB . 'MB.');

  $finfo = new finfo(FILEINFO_MIME_TYPE);
  $mime  = $finfo->file($file['tmp_name']);
  $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png'];
  if (!isset($allowed[$mime])) {
    respond(false, 'Formato no permitido. Usa JPG o PNG.');
  }

  //  Paths 
  // Los assets se guardan en /ASSETS/noticia/NoticiasImg/
  $root = dirname(__DIR__, 2);
  $destDir = $root . DIRECTORY_SEPARATOR . 'ASSETS' . DIRECTORY_SEPARATOR . 'noticia' . DIRECTORY_SEPARATOR . 'NoticiasImg';
  if (!is_dir($destDir)) {
    if (!mkdir($destDir, 0775, true) && !is_dir($destDir)) {
      respond(false, 'No se pudo crear el directorio destino.');
    }
  }

  $fileName = "noticia_img{$pos}_{$noticiaId}.png";
  $destPath = $destDir . DIRECTORY_SEPARATOR . $fileName;

  switch ($mime) {
    case 'image/jpeg':
      $src = @imagecreatefromjpeg($file['tmp_name']);
      break;
    case 'image/png':
      $src = @imagecreatefrompng($file['tmp_name']);
      break;
    default:
      $src = false;
  }
  if (!$src) respond(false, 'No se pudo procesar la imagen (GD).');

  $w = imagesx($src);
  $h = imagesy($src);
  $dst = imagecreatetruecolor($w, $h);
  imagealphablending($dst, false);
  imagesavealpha($dst, true);
  $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
  imagefilledrectangle($dst, 0, 0, $w, $h, $transparent);
  imagecopy($dst, $src, 0, 0, 0, 0, $w, $h);

  $okSave = imagepng($dst, $destPath, 6); 
  imagedestroy($src);
  imagedestroy($dst);
  if (!$okSave) respond(false, 'No se pudo guardar la imagen.');
  @chmod($destPath, 0664);

  //  URL publica 
  $publicUrl = "/ASSETS/noticia/NoticiasImg/{$fileName}?v=" . time();

  respond(true, ['url' => $publicUrl]);

} catch (Throwable $e) {
  respond(false, 'Excepción: ' . $e->getMessage());
}
