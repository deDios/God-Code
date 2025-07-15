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

$campos = ['noticia_id', 'usuario_id', 'comentario', 'estatus'];
foreach ($campos as $campo) {
    if (!isset($input[$campo])) {
        die(json_encode(["error" => "Falta el campo requerido: $campo"]));
    }
}

$noticia_id = (int)$input['noticia_id'];
$usuario_id = (int)$input['usuario_id'];
$comentario = trim($input['comentario']);
$respuesta_a = isset($input['respuesta_a']) ? (int)$input['respuesta_a'] : "NULL";
$estatus = (int)$input['estatus'];

$con = conectar();
if (!$con) {
    die(json_encode(["error" => "Error al conectar a la base de datos."]));
}

$query = "INSERT INTO god_code.gc_comentario_noticia (noticia_id, usuario_id, comentario, respuesta_a, estatus) 
          VALUES ($noticia_id, $usuario_id, ?, $respuesta_a, $estatus)";
$stmt = $con->prepare($query);
$stmt->bind_param("s", $comentario);

if ($stmt->execute()) {
    echo json_encode(["mensaje" => "Comentario registrado correctamente", "id" => $stmt->insert_id]);
} else {
    echo json_encode(["error" => "Error al insertar el comentario", "detalle" => $stmt->error]);
}

$stmt->close();
$con->close();
?>
