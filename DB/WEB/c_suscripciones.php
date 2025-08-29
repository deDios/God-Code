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

$inputRaw = file_get_contents("php://input");
$input = json_decode($inputRaw, true) ?: [];

$con = conectar();
if (!$con) {
    die(json_encode(["error" => "Error de conexión a la base de datos."]));
}

if (method_exists($con, 'set_charset')) {
    $con->set_charset('utf8mb4');
} else {
    @mysqli_query($con, "SET NAMES 'utf8mb4'");
}

$status = 1;
if (isset($input['status']))        $status = (int)$input['status'];
elseif (isset($input['estatus']))   $status = (int)$input['estatus'];
elseif (isset($_GET['status']))     $status = (int)$_GET['status'];
elseif (isset($_GET['estatus']))    $status = (int)$_GET['estatus'];

$table = "god_code.gc_inscripciones";

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
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $data[] = $row;
    }
}

header("X-Row-Count: " . count($data));

$out = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
if ($out === false) {
    header("X-JSON-Error: " . json_last_error_msg());
    $out = "[]";
}
echo $out;

$stmt->close();
$con->close();