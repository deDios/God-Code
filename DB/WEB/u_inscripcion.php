<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    die(json_encode(["error" => "No se encontró Conexion.php"]));
}

$input = json_decode(file_get_contents("php://input"), true);

// Validar que se reciba el ID
if (!isset($input['id'])) {
    die(json_encode(["error" => "El campo 'id' es obligatorio."]));
}

$id = (int)$input['id'];

// Lista de campos permitidos para actualizar
$campos_permitidos = ['curso', 'usuario', 'comentario', 'estatus'];
$campos_set = [];
$valores = [];

foreach ($campos_permitidos as $campo) {
    if (isset($input[$campo])) {
        $campos_set[] = "$campo = ?";
        $valores[] = $input[$campo];
    }
}

// Verificar que haya campos para actualizar
if (empty($campos_set)) {
    die(json_encode(["error" => "No se proporcionó ningún campo para actualizar."]));
}

// Agregar la columna de fecha_modif
$campos_set[] = "fecha_modif = NOW()";

$con = conectar();
if (!$con) {
    die(json_encode(["error" => "Error al conectar a la base de datos."]));
}

// Preparar consulta
$sql = "UPDATE god_code.gc_inscripcion SET " . implode(', ', $campos_set) . " WHERE id = ?";
$stmt = $con->prepare($sql);

if (!$stmt) {
    echo json_encode(["error" => "Error al preparar la consulta", "detalle" => $con->error]);
    exit;
}

// Agregar id a la lista de valores
$valores[] = $id;

// Preparar tipos dinámicamente
$tipos = str_repeat('s', count($valores)); // por defecto todos string
foreach ($valores as $i => $v) {
    if (is_int($v)) $tipos[$i] = 'i';
}

// Vincular parámetros
$stmt->bind_param($tipos, ...$valores);

// Ejecutar
if ($stmt->execute()) {
    echo json_encode(["mensaje" => "Inscripción actualizada correctamente"]);
} else {
    echo json_encode(["error" => "Error al actualizar la inscripción", "detalle" => $stmt->error]);
}

$stmt->close();
$con->close();
?>
