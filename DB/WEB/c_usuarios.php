<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    die(json_encode(["error" => "No se encontró Conexion.php en la ruta $path"]));
}

$input = json_decode(file_get_contents("php://input"), true) ?: [];

$con = conectar();
if (!$con) {
    die(json_encode(["error" => "Error de conexión a la base de datos."]));
}

$correo   = isset($input['correo'])   ? trim($input['correo']) : '';
$telefono = isset($input['telefono']) ? preg_replace('/\D+/', '', (string)$input['telefono']) : '';
$estatus  = null;
if (isset($input['estatus'])) {
    $estatus = (int)$input['estatus'];
} elseif (isset($input['status'])) {
    $estatus = (int)$input['status'];
}

$whereParts = [];
$types = "";
$params = [];

if ($estatus !== null && $estatus !== '') {
    $whereParts[] = "estatus = ?";
    $types .= "i";
    $params[] = $estatus;
}

$or = [];
if ($correo !== '')   { $or[] = "correo = ?";   $types .= "s"; $params[] = $correo; }
if ($telefono !== '') { $or[] = "telefono = ?"; $types .= "s"; $params[] = $telefono; }
if (!empty($or)) {
    $whereParts[] = "(".implode(" OR ", $or).")";
}

if (empty($whereParts)) {
    $whereParts[] = "estatus = 1";
}

$sql = "SELECT * FROM god_code.gc_usuario WHERE ".implode(" AND ", $whereParts)." ORDER BY id DESC";
$stmt = $con->prepare($sql);
if (!$stmt) {
    die(json_encode(["error" => "Error en prepare: ".$con->error]));
}

if ($types !== "") {
    $stmt->bind_param($types, ...$params);
}

if (!$stmt->execute()) {
    die(json_encode(["error" => "Error en execute: ".$stmt->error]));
}

$res = $stmt->get_result();
$data = [];
while ($row = $res->fetch_assoc()) { $data[] = $row; }

echo json_encode($data);

$stmt->close();
$con->close();
