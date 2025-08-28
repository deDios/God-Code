<?php

header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}
header('Content-Type: application/json');


function respond($arr, $code = 200)
{
  http_response_code($code);
  echo json_encode($arr, JSON_UNESCAPED_UNICODE);
  exit;
}

// --- validaciones de entrada
$noticiaId = isset($_POST['noticia_id']) ? (int)$_POST['noticia_id'] : 0;
$pos       = isset($_POST['pos']) ? (int)$_POST['pos'] : 0;

if ($noticiaId <= 0) respond(["ok" => false, "error" => "Parámetro 'noticia_id' inválido"], 400);
if (!in_array($pos, [1, 2], true)) respond(["ok" => false, "error" => "Parámetro 'pos' debe ser 1 ó 2"], 400);
if (!isset($_FILES['imagen'])) respond(["ok" => false, "error" => "Falta archivo 'imagen'"], 400);

$imgFile = $_FILES['imagen'];
if ($imgFile['error'] !== UPLOAD_ERR_OK) respond(["ok" => false, "error" => "Error al recibir archivo (código " . $imgFile['error'] . ")"], 400);

$maxBytes = 2 * 1024 * 1024; // 4MB lo deje en 4 por si acaso, aunque la imagen mas pesada que tenemos es de apenas casi 2mb
if ($imgFile['size'] > $maxBytes) respond(["ok" => false, "error" => "La imagen excede 2MB"], 400);

$finfo = @getimagesize($imgFile['tmp_name']);
if (!$finfo) respond(["ok" => false, "error" => "Archivo no es una imagen válida"], 400);

$mime = $finfo['mime'];
$allowed = ['image/jpeg', 'image/png'];
if (!in_array($mime, $allowed, true)) {
  respond(["ok" => false, "error" => "Formato no permitido. Usa JPG o PNG"], 400);
}

$baseFs  = "/home/site/wwwroot/ASSETS/noticia/NoticiasImg";
$baseWeb = "/ASSETS/noticia/NoticiasImg";

if (!is_dir($baseFs)) {

  if (!@mkdir($baseFs, 0775, true) && !is_dir($baseFs)) {
    respond(["ok" => false, "error" => "No existe el dir de destino y no se pudo crear"], 500);
  }
}

$targetName = "noticia_img{$pos}_{$noticiaId}.png";
$targetFs   = $baseFs . "/" . $targetName;
$targetWeb  = $baseWeb . "/" . $targetName;

if ($mime === 'image/jpeg') {
  $src = @imagecreatefromjpeg($imgFile['tmp_name']);
} else { // image/png
  $src = @imagecreatefrompng($imgFile['tmp_name']);
}
if (!$src) respond(["ok" => false, "error" => "No se pudo procesar la imagen"], 400);

imagealphablending($src, true);
imagesavealpha($src, true);

$ok = @imagepng($src, $targetFs, 6);
imagedestroy($src);

if (!$ok) respond(["ok" => false, "error" => "No se pudo guardar la imagen"], 500);

@chmod($targetFs, 0664);

$ver = time();
respond([
  "ok" => true,
  "id" => $noticiaId,
  "pos" => $pos,
  "url" => $targetWeb . "?v=" . $ver
], 200);