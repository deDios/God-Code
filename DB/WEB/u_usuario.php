<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    die(json_encode(["error" => "No se encontró Conexion.php"]));
}

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['id'])) {
    die(json_encode(["error" => "Se requiere el ID del usuario para editar."]));
}

$id = (int)$input['id'];
$campos_validos = ['nombre', 'correo', 'telefono', 'fecha_nacimiento', 'tipo_contacto', 'password', 'estatus'];
$updates = [];
$valores = [];

foreach ($campos_validos as $campo) {
    if (isset($input[$campo])) {
        $updates[] = "$campo = ?";
        $valores[] = $input[$campo];
    }
}

if (empty($updates)) {
    die(json_encode(["error" => "No se proporcionó ningún campo para actualizar."]));
}

// Agregamos campo de control
$updates[] = "fecha_modif = NOW()";

$con = conectar();
if (!$con) {
    die(json_encode(["error" => "Error al conectar a la base de datos."]));
}

$query = "UPDATE god_code.gc_usuario SET " . implode(", ", $updates) . " WHERE id = ?";
$stmt = $con->prepare($query);

// Vincular parámetros
$tipos = str_repeat("s", count($valores)) . "i";
$valores[] = $id;
$stmt->bind_param($tipos, ...$valores);

if ($stmt->execute()) {
    echo json_encode(["mensaje" => "Usuario actualizado correctamente."]);
} else {
    echo json_encode(["error" => "Error al actualizar el usuario", "detalle" => $stmt->error]);
}

$stmt->close();
$con->close();
?>
