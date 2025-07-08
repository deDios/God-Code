<?php
header('Content-Type: application/json');

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    die(json_encode(["error" => "No se encontró Conexion.php en la ruta $path"]));
}

$input = json_decode(file_get_contents("php://input"), true);

// Validar parámetros obligatorios
if (!isset($input['curso']) || !isset($input['usuario'])) {
    die(json_encode(["error" => "Los campos 'curso' y 'usuario' son obligatorios"]));
}

$curso = (int)$input['curso'];
$usuario = (int)$input['usuario'];
$comentario = isset($input['comentario']) ? trim($input['comentario']) : null;
$estatus = 1;

$con = conectar();
if (!$con) {
    die(json_encode(["error" => "No se pudo conectar a la base de datos"]));
}

// Verificar si ya existe la inscripción
$check_query = "SELECT id FROM god_code.gc_inscripcion WHERE curso = $curso AND usuario = $usuario AND estatus = 1";
$check_result = mysqli_query($con, $check_query);

if ($check_result && mysqli_num_rows($check_result) > 0) {
    echo json_encode(["mensaje" => "El usuario ya se encuentra registrado en el curso"]);
    $con->close();
    exit;
}

// Insertar nueva inscripción
$comentario_sql = is_null($comentario) ? "NULL" : "'" . mysqli_real_escape_string($con, $comentario) . "'";

$insert_query = "
    INSERT INTO god_code.gc_inscripcion (curso, usuario, comentario, estatus)
    VALUES ($curso, $usuario, $comentario_sql, $estatus)
";

if (mysqli_query($con, $insert_query)) {
    echo json_encode(["mensaje" => "Inscripción realizada correctamente"]);
} else {
    echo json_encode(["error" => "Error al registrar la inscripción: " . mysqli_error($con)]);
}

$con->close();
?>
