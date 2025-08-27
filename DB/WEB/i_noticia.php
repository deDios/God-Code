<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["ok" => true]);
    exit;
}

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    http_response_code(500);
    echo json_encode(["error" => "No se encontró Conexion.php"]);
    exit;
}

$raw = file_get_contents("php://input");
$input = json_decode($raw, true);

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(["error" => "JSON inválido"]);
    exit;
}


if (!isset($input['titulo']) || !isset($input['desc_uno']) || !isset($input['desc_dos']) || !isset($input['creado_por'])) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan campos obligatorios (titulo, desc_uno, desc_dos, creado_por)"]);
    exit;
}

$titulo   = (string)$input['titulo'];
$desc_uno = (string)$input['desc_uno'];
$desc_dos = (string)$input['desc_dos'];
$creado_por = (int)$input['creado_por'];
$estatus  = isset($input['estatus']) ? (int)$input['estatus'] : 1;

$con = conectar();
if (!$con) {
    http_response_code(500);
    echo json_encode(["error" => "Error al conectar a la base de datos."]);
    exit;
}

$query = "INSERT INTO god_code.gc_noticia (titulo, desc_uno, desc_dos, creado_por, estatus, fecha_creacion) 
          VALUES (?, ?, ?, ?, ?, NOW())";

$stmt = $con->prepare($query);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Error en prepare()", "detalle" => $con->error]);
    $con->close();
    exit;
}

$stmt->bind_param("sssii", $titulo, $desc_uno, $desc_dos, $creado_por, $estatus);

if ($stmt->execute()) {
    echo json_encode([
        "ok" => true,
        "mensaje" => "Noticia creada correctamente.",
        "id" => $stmt->insert_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error al crear la noticia", "detalle" => $stmt->error]);
}

$stmt->close();
$con->close();