<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    die(json_encode(["ok" => false, "error" => "No se encontró Conexion.php"]));
}

$input = json_decode(file_get_contents("php://input"), true) ?? [];

$action = $input["action"] ?? "";

$con = conectar();
if (!$con) {
    die(json_encode(["ok" => false, "error" => "Error de conexión a la base de datos."]));
}

switch ($action) {
    case "ranking_noticias_comentarios":
        rankingNoticiasComentarios($con, $input);
        break;

    default:
        echo json_encode([
            "ok" => false,
            "error" => "Acción no válida."
        ]);
        break;
}

$con->close();

function rankingNoticiasComentarios($con, $input) {
    $estatusNoticia = isset($input["estatus_noticia"]) ? (int)$input["estatus_noticia"] : 1;
    $estatusComentario = isset($input["estatus_comentario"]) ? (int)$input["estatus_comentario"] : 1;
    $limit = isset($input["limit"]) ? (int)$input["limit"] : 4;

    if ($limit <= 0) $limit = 4;
    if ($limit > 20) $limit = 20;

    $query = "
        SELECT
            n.id,
            n.titulo,
            n.desc_uno,
            n.fecha_creacion,
            n.estatus,
            COUNT(c.id) AS total_comentarios
        FROM god_code.gc_noticia n
        LEFT JOIN god_code.gc_comentario_noticia c
            ON c.noticia_id = n.id
            AND c.estatus = ?
        WHERE n.estatus = ?
        GROUP BY
            n.id,
            n.titulo,
            n.desc_uno,
            n.fecha_creacion,
            n.estatus
        ORDER BY total_comentarios DESC, n.fecha_creacion DESC
        LIMIT ?
    ";

    $stmt = mysqli_prepare($con, $query);

    if (!$stmt) {
        echo json_encode([
            "ok" => false,
            "error" => "No se pudo preparar la consulta.",
            "detalle" => mysqli_error($con)
        ]);
        return;
    }

    mysqli_stmt_bind_param($stmt, "iii", $estatusComentario, $estatusNoticia, $limit);
    mysqli_stmt_execute($stmt);

    $result = mysqli_stmt_get_result($stmt);
    $data = [];

    while ($row = mysqli_fetch_assoc($result)) {
        $row["id"] = (int)$row["id"];
        $row["estatus"] = (int)$row["estatus"];
        $row["total_comentarios"] = (int)$row["total_comentarios"];
        $data[] = $row;
    }

    mysqli_stmt_close($stmt);

    echo json_encode([
        "ok" => true,
        "data" => $data
    ]);
}
?>