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

if (!isset($input['noticia_id']) || !isset($input['estatus'])) {
    die(json_encode(["error" => "Se requieren los parámetros 'noticia_id' y 'estatus'"]));
}

$noticia_id = (int)$input['noticia_id'];
$estatus = (int)$input['estatus'];

$con = conectar();
if (!$con) {
    die(json_encode(["error" => "Error al conectar a la base de datos."]));
}

$query = "SELECT 
            c.id,
            c.usuario_id,
            u.nombre AS usuario_nombre,
            c.comentario,
            c.respuesta_a,
            c.estatus,
            c.fecha_creacion,
            c.fecha_modif
          FROM god_code.gc_comentario_noticia c
          JOIN god_code.gc_usuario u ON c.usuario_id = u.id
          WHERE c.noticia_id = $noticia_id AND c.estatus = $estatus
          ORDER BY c.fecha_creacion ASC";

$result = mysqli_query($con, $query);

$comentarios = [];
$respuestas = [];

if ($result && mysqli_num_rows($result) > 0) {
    while ($row = $result->fetch_assoc()) {
        $row['id'] = (int)$row['id'];
        $row['usuario_id'] = (int)$row['usuario_id'];
        $row['respuesta_a'] = $row['respuesta_a'] !== null ? (int)$row['respuesta_a'] : null;
        $row['estatus'] = (int)$row['estatus'];

        if ($row['respuesta_a'] === null) {
            $comentarios[$row['id']] = $row;
            $comentarios[$row['id']]['respuestas'] = [];
        } else {
            $respuestas[] = $row;
        }
    }

    // Asociar respuestas
    foreach ($respuestas as $respuesta) {
        $padre = $respuesta['respuesta_a'];
        if (isset($comentarios[$padre])) {
            $comentarios[$padre]['respuestas'][] = $respuesta;
        }
    }

    echo json_encode(array_values($comentarios));
} else {
    echo json_encode(["mensaje" => "No se encontraron comentarios para esta noticia"]);
}

$con->close();
?>
