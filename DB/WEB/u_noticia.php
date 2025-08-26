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
    echo json_encode(["error" => "JSON inválido o cuerpo vacío"]);
    exit;
}
if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Se requiere el ID de la noticia para editar."]);
    exit;
}

$id = (int)$input['id'];

// campos de noticia 
$campos_validos = [
    'titulo',       // string
    'desc_uno',     // string
    'desc_dos',     // string
    'estatus'       
];

$updates = [];
$valores = [];
$tipos   = ""; 

foreach ($campos_validos as $campo) {
    if (array_key_exists($campo, $input)) {
        $updates[] = "$campo = ?";
        if ($campo === 'estatus') {
            $valores[] = (int)$input[$campo];
            $tipos    .= "i";
        } else {
            $valores[] = (string)$input[$campo];
            $tipos    .= "s";
        }
    }
}

if (empty($updates)) {
    http_response_code(400);
    echo json_encode(["error" => "No se proporcionó ningún campo válido para actualizar."]);
    exit;
}

$updates[] = "fecha_modif = NOW()";

$con = conectar();
if (!$con) {
    http_response_code(500);
    echo json_encode(["error" => "Error al conectar a la base de datos."]);
    exit;
}

$query = "UPDATE god_code.gc_noticia SET " . implode(", ", $updates) . " WHERE id = ?";
$stmt = $con->prepare($query);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Error preparando sentencia", "detalle" => $con->error]);
    $con->close();
    exit;
}

$valores[] = $id;
$tipos    .= "i";

$stmt->bind_param($tipos, ...$valores);

if ($stmt->execute()) {
    // salio bien
    echo json_encode(["mensaje" => "Noticia actualizada correctamente."]);
} else {
    //algo salio mal
    http_response_code(500);
    echo json_encode(["error" => "Error al actualizar la noticia", "detalle" => $stmt->error]);
}

$stmt->close();
$con->close();
