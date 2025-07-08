<?php
header('Content-Type: application/json');

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    die(json_encode(["error" => "No se encontró Conexion.php en la ruta $path"]));
}

$input = json_decode(file_get_contents("php://input"), true);

// Validación de campos obligatorios
$requeridos = ['nombre', 'correo', 'telefono', 'tipo_contacto'];
foreach ($requeridos as $campo) {
    if (empty($input[$campo])) {
        die(json_encode(["error" => "El campo '$campo' es obligatorio."]));
    }
}

$nombre = trim($input['nombre']);
$correo = trim($input['correo']);
$telefono = trim($input['telefono']);
$tipo_contacto = (int)$input['tipo_contacto'];
$fecha_nacimiento = !empty($input['fecha_nacimiento']) ? "'" . mysqli_real_escape_string(conectar(), $input['fecha_nacimiento']) . "'" : "NULL";
$password = isset($input['password']) ? "'" . mysqli_real_escape_string(conectar(), $input['password']) . "'" : "NULL";
$estatus = 1;

$con = conectar();
if (!$con) {
    die(json_encode(["error" => "Error de conexión a la base de datos."]));
}

$query = "
    INSERT INTO god_code.gc_usuario
    (nombre, correo, telefono, fecha_nacimiento, tipo_contacto, password, estatus)
    VALUES
    ('$nombre', '$correo', '$telefono', $fecha_nacimiento, $tipo_contacto, $password, $estatus)
";

if (mysqli_query($con, $query)) {
    echo json_encode(["mensaje" => "Usuario registrado correctamente"]);
} else {
    echo json_encode(["error" => "Error al insertar: " . mysqli_error($con)]);
}

$con->close();
?>
