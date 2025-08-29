<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

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

$status = 1;
if (isset($input['status'])) {
    $status = (int)$input['status'];
} elseif (isset($input['estatus'])) {
    $status = (int)$input['estatus'];
}

$table = "god_code.gc_suscripcion";

$sql = "SELECT id, curso, usuario, comentario, estatus, fecha_creacion, fecha_modif
        FROM $table
        WHERE estatus = ?
        ORDER BY id DESC";

$stmt = $con->prepare($sql);
if (!$stmt) {
    die(json_encode(["error" => "Error en prepare: " . $con->error]));
}

$stmt->bind_param("i", $status);

if (!$stmt->execute()) {
    die(json_encode(["error" => "Error en execute: " . $stmt->error]));
}

$res = $stmt->get_result();
$data = [];
while ($row = $res->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);

$stmt->close();
$con->close();