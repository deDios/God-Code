<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    die(json_encode(["error" => "No se encontró Conexion.php"]));
}

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['comentario_id'])) {
    die(json_encode(["error" => "Falta el parámetro 'comentario_id'"]));
}

$comentario_id = (int)$input['comentario_id'];

$con = conectar();
if (!$con) {
    die(json_encode(["error" => "Error al conectar a la base de datos."]));
}

$query = "SELECT 
            r.usuario_id,
            u.nombre AS usuario_nombre,
            r.reaccion,
            r.estatus,
            r.fecha_creacion
          FROM god_code.gc_comentario_reaccion r
          JOIN god_code.gc_usuario u ON r.usuario_id = u.id
          WHERE r.comentario_id = $comentario_id";

$result = mysqli_query($con, $query);

$likes = 0;
$dislikes = 0;
$detalles = [];

if ($result && mysqli_num_rows($result) > 0) {
    while ($row = $result->fetch_assoc()) {
        if ($row['reaccion'] === 'like') {
            $likes++;
        } elseif ($row['reaccion'] === 'dislike') {
            $dislikes++;
        }

        $detalles[] = $row;
    }

    echo json_encode([
        "comentario_id" => $comentario_id,
        "likes" => $likes,
        "dislikes" => $dislikes,
        "reacciones" => $detalles
    ]);
} else {
    echo json_encode(["mensaje" => "No se encontraron reacciones para este comentario"]);
}

$con->close();
?>
