<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    die(json_encode(["error" => "No se encontró Conexion.php"]));
}

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['comentario_id']) || !isset($input['usuario_id'])) {
    die(json_encode(["error" => "Se requieren comentario_id y usuario_id"]));
}

$comentario_id = (int)$input['comentario_id'];
$usuario_id = (int)$input['usuario_id'];

$con = conectar();
if (!$con) {
    die(json_encode(["error" => "Error al conectar a la base de datos."]));
}

$query = "DELETE FROM god_code.gc_comentario_reaccion 
          WHERE comentario_id = $comentario_id AND usuario_id = $usuario_id";

if (mysqli_query($con, $query)) {
    if (mysqli_affected_rows($con) > 0) {
        echo json_encode(["mensaje" => "Reacción eliminada correctamente."]);
    } else {
        echo json_encode(["mensaje" => "No se encontró una reacción que eliminar."]);
    }
} else {
    echo json_encode(["error" => "Error al eliminar reacción", "detalle" => mysqli_error($con)]);
}

$con->close();
?>
