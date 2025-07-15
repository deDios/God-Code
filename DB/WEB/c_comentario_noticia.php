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
    die(json_encode(["error" => "Faltan los parámetros 'noticia_id' y 'estatus'"]));
}

$noticia_id = (int)$input['noticia_id'];
$estatus = (int)$input['estatus'];
$usuario_id = isset($input['usuario_id']) ? (int)$input['usuario_id'] : null;

$con = conectar();
if (!$con) {
    die(json_encode(["error" => "Error al conectar a la base de datos."]));
}

// Obtener comentarios y usuario
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
$comentario_ids = [];

if ($result && mysqli_num_rows($result) > 0) {
    while ($row = $result->fetch_assoc()) {
        $row['id'] = (int)$row['id'];
        $row['usuario_id'] = (int)$row['usuario_id'];
        $row['respuesta_a'] = $row['respuesta_a'] !== null ? (int)$row['respuesta_a'] : null;
        $row['estatus'] = (int)$row['estatus'];
        $row['likes'] = 0;
        $row['dislikes'] = 0;
        $row['mi_reaccion'] = null;  // solo si se pasa usuario_id

        $comentario_ids[] = $row['id'];

        if ($row['respuesta_a'] === null) {
            $comentarios[$row['id']] = $row;
            $comentarios[$row['id']]['respuestas'] = [];
        } else {
            $respuestas[] = $row;
        }
    }

    if (count($comentario_ids) > 0) {
        $ids_str = implode(",", $comentario_ids);

        // Traer todas las reacciones para esos comentarios
        $reacciones_query = "SELECT comentario_id, reaccion, usuario_id
                             FROM god_code.gc_comentario_reaccion
                             WHERE comentario_id IN ($ids_str)";
        $reacciones_result = mysqli_query($con, $reacciones_query);

        if ($reacciones_result && mysqli_num_rows($reacciones_result) > 0) {
            while ($r = mysqli_fetch_assoc($reacciones_result)) {
                $cid = (int)$r['comentario_id'];
                $reaccion = $r['reaccion'];
                $uid = (int)$r['usuario_id'];

                // Aumento de conteo
                if (isset($comentarios[$cid])) {
                    if ($reaccion === 'like') $comentarios[$cid]['likes']++;
                    if ($reaccion === 'dislike') $comentarios[$cid]['dislikes']++;
                    if ($usuario_id && $usuario_id === $uid) $comentarios[$cid]['mi_reaccion'] = $reaccion;
                }

                // Si es una respuesta
                foreach ($respuestas as &$res) {
                    if ($res['id'] === $cid) {
                        if ($reaccion === 'like') $res['likes']++;
                        if ($reaccion === 'dislike') $res['dislikes']++;
                        if ($usuario_id && $usuario_id === $uid) $res['mi_reaccion'] = $reaccion;
                    }
                }
            }
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
