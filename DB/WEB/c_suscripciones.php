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

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['estatus'])) {
    die(json_encode([
        "error" => "El parámetro 'estatus' es obligatorio en el cuerpo JSON (ej. { \"estatus\": 1 })"
    ]));
}
$estatus = (int)$input['estatus'];

$con = conectar();
if (!$con) {
    die(json_encode(["error" => "No se pudo conectar a la base de datos"]));
}

$query = "SELECT *
          FROM god_code.gc_inscripcion
          WHERE estatus = $estatus
          ORDER BY id DESC";

$result = mysqli_query($con, $query);

if ($result && $result->num_rows > 0) {
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
} else {
    echo json_encode(["mensaje" => "No se encontraron inscripciones con estatus = $estatus"]);
}

$con->close();