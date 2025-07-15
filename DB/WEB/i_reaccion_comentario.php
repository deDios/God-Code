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

$campos = ['comentario_id', 'usuario_id', 'reaccion', 'estatus'];
foreach ($campos as $campo) {
    if (!isset($input[$campo])) {
        die(json_encode(["error" => "Falta el campo requerido: $campo"]));
    }
}

$comentario_id = (int)$input['comentario_id'];
$usuario_id = (int)$input['usuario_id'];
$reaccion = $input['reaccion']; // like o dislike
$estatus = (int)$input['estatus'];

$con = conectar();
if (!$con) {
    die(json_encode(["error" => "Error al conectar a la base de datos."]));
}

// Validar si ya reaccionó
$verifica = "SELECT id FROM god_code.gc_comentario_reaccion WHERE comentario_id = $comentario_id AND usuario_id = $usuario_id";
$res = mysqli_query($con, $verifica);

if ($res && mysqli_num_rows($res) > 0) {
    echo json_encode(["mensaje" => "El usuario ya reaccionó a este comentario."]);
} else {
    $query = "INSERT INTO god_code.gc_comentario_reaccion (comentario_id, usuario_id, reaccion, estatus)
              VALUES ($comentario_id, $usuario_id, ?, $estatus)";
    $stmt = $con->prepare($query);
    $stmt->bind_param("s", $reaccion);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Reacción registrada correctamente", "id" => $stmt->insert_id]);
    } else {
        echo json_encode(["error" => "Error al insertar la reacción", "detalle" => $stmt->error]);
    }

    $stmt->close();
}

$con->close();
?>
