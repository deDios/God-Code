<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

// OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if (!$path || !file_exists($path)) {
  http_response_code(500);
  echo json_encode(["ok"=>false,"error"=>"No se encontró Conexion.php en $path"]);
  exit;
}
include $path;

$input_raw = file_get_contents("php://input");
$input = json_decode($input_raw, true);
if (!is_array($input)) {
  http_response_code(400);
  echo json_encode(["ok"=>false,"error"=>"Cuerpo inválido. Use JSON."]);
  exit;
}

// Validaciones mínimas
$nombre = isset($input['nombre']) ? trim($input['nombre']) : "";
$descripcion = isset($input['descripcion']) ? trim($input['descripcion']) : "";
$estatus = isset($input['estatus']) ? (int)$input['estatus'] : 1;

if ($nombre === "") {
  http_response_code(422);
  echo json_encode(["ok"=>false,"error"=>"El campo 'nombre' es obligatorio"]);
  exit;
}

$con = conectar();
if (!$con) {
  http_response_code(500);
  echo json_encode(["ok"=>false,"error"=>"No se pudo conectar a la base de datos"]);
  exit;
}

mysqli_set_charset($con, "utf8mb4");

// Inserta (usa columnas que ya tienes en gc_tutor)
$sql = "INSERT INTO god_code.gc_tutor (nombre, descripcion, estatus, fecha_creacion)
        VALUES (?, ?, ?, NOW())";

$stmt = mysqli_prepare($con, $sql);
if (!$stmt) {
  http_response_code(500);
  echo json_encode(["ok"=>false,"error"=>"Error en prepare: ".mysqli_error($con)]);
  mysqli_close($con);
  exit;
}

mysqli_stmt_bind_param($stmt, "ssi", $nombre, $descripcion, $estatus);
$ok = mysqli_stmt_execute($stmt);

if (!$ok) {
  http_response_code(500);
  echo json_encode(["ok"=>false,"error"=>"Error al insertar: ".mysqli_stmt_error($stmt)]);
  mysqli_stmt_close($stmt);
  mysqli_close($con);
  exit;
}

$new_id = mysqli_insert_id($con);
mysqli_stmt_close($stmt);
mysqli_close($con);

echo json_encode([
  "ok"=>true,
  "id"=>$new_id,
  "data"=>[
    "id"=>$new_id,
    "nombre"=>$nombre,
    "descripcion"=>$descripcion,
    "estatus"=>$estatus
  ]
], JSON_UNESCAPED_UNICODE);
