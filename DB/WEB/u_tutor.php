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

$raw = file_get_contents("php://input");
$input = json_decode($raw, true);
if (!is_array($input)) {
  http_response_code(400);
  echo json_encode(["ok"=>false,"error"=>"Cuerpo inválido. Enviar JSON."]);
  exit;
}

$id = isset($input['id']) ? (int)$input['id'] : 0;
if ($id <= 0) {
  http_response_code(422);
  echo json_encode(["ok"=>false,"error"=>"El campo 'id' es obligatorio (numérico > 0)"]);
  exit;
}

// Campos para actualizar
$nombre      = array_key_exists('nombre', $input)      ? trim((string)$input['nombre']) : null;
$descripcion = array_key_exists('descripcion', $input) ? trim((string)$input['descripcion']) : null;
$estatus     = array_key_exists('estatus', $input)     ? (int)$input['estatus'] : null;

$sets = [];
$params = [];
$types = "";

if ($nombre !== null) {
  if ($nombre === "") {
    http_response_code(422);
    echo json_encode(["ok"=>false,"error"=>"El campo 'nombre' no puede ser vacío"]);
    exit;
  }
  $sets[] = "nombre = ?";
  $params[] = $nombre;
  $types .= "s";
}
if ($descripcion !== null) {
  $sets[] = "descripcion = ?";
  $params[] = $descripcion;
  $types .= "s";
}
if ($estatus !== null) {
  $sets[] = "estatus = ?";
  $params[] = $estatus;
  $types .= "i";
}

if (empty($sets)) {
  http_response_code(400);
  echo json_encode(["ok"=>false,"error"=>"No hay campos para actualizar"]);
  exit;
}

$sets[] = "fecha_modif = NOW()";

$con = conectar();
if (!$con) {
  http_response_code(500);
  echo json_encode(["ok"=>false,"error"=>"No se pudo conectar a la base de datos"]);
  exit;
}
mysqli_set_charset($con, "utf8mb4");

$sql = "UPDATE god_code.gc_tutor SET ".implode(", ", $sets)." WHERE id = ?";
$stmt = mysqli_prepare($con, $sql);
if (!$stmt) {
  http_response_code(500);
  echo json_encode(["ok"=>false,"error"=>"Error en prepare: ".mysqli_error($con)]);
  mysqli_close($con);
  exit;
}

$types .= "i";
$params[] = $id;

$bind_params = [];
$bind_params[] = &$types;
for ($i=0; $i<count($params); $i++) {
  $bind_params[] = &$params[$i];
}
call_user_func_array([$stmt, 'bind_param'], $bind_params);

$ok = mysqli_stmt_execute($stmt);
if (!$ok) {
  http_response_code(500);
  echo json_encode(["ok"=>false,"error"=>"Error al actualizar: ".mysqli_stmt_error($stmt)]);
  mysqli_stmt_close($stmt);
  mysqli_close($con);
  exit;
}

$affected = mysqli_stmt_affected_rows($stmt);
mysqli_stmt_close($stmt);

$out = ["ok"=>true,"id"=>$id,"affected"=>$affected];

$q = mysqli_prepare($con, "SELECT id,nombre,descripcion,estatus,fecha_creacion,fecha_modif FROM god_code.gc_tutor WHERE id=?");
if ($q) {
  mysqli_stmt_bind_param($q, "i", $id);
  if (mysqli_stmt_execute($q)) {
    $res = mysqli_stmt_get_result($q);
    if ($res && $row = mysqli_fetch_assoc($res)) {
      $row['id'] = (int)$row['id'];
      $row['estatus'] = (int)$row['estatus'];
      $out["data"] = $row;
    }
  }
  mysqli_stmt_close($q);
}

mysqli_close($con);
echo json_encode($out, JSON_UNESCAPED_UNICODE);
