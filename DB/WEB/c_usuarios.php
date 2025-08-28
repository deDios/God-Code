<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    die(json_encode(["error" => "No se encontró Conexion.php en $path"]));
}

$input = json_decode(file_get_contents("php://input"), true) ?: [];
$con = conectar();
if (!$con) die(json_encode(["error" => "No se pudo conectar a la base de datos"]));

$estatus = isset($input['estatus']) ? (int)$input['estatus'] : null;
$id      = isset($input['id']) ? (int)$input['id'] : null;
$q       = isset($input['q']) ? trim($input['q']) : '';
$limit   = isset($input['limit']) ? max(1, (int)$input['limit']) : 100;
$offset  = isset($input['offset']) ? max(0, (int)$input['offset']) : 0;

$where = [];
$params = [];
$types  = "";

if (!is_null($estatus)) {
    $where[] = "u.estatus = ?";
    $params[] = $estatus;
    $types .= "i";
}
if (!is_null($id)) {
    $where[] = "u.id = ?";
    $params[] = $id;
    $types .= "i";
}
if ($q !== '') {
    $like = "%" . $q . "%";
    $where[] = "(u.nombre LIKE ? OR u.correo LIKE ? OR u.telefono LIKE ?)";
    array_push($params, $like, $like, $like);
    $types .= "sss";
}

$w = $where ? ("WHERE " . implode(" AND ", $where)) : "";
$sql = "SELECT u.id, u.nombre, u.correo, u.telefono, u.rol, u.estatus, 
               u.fecha_creacion, u.fecha_modif, u.creado_por, u.modificado_por
        FROM god_code.gc_usuario u
        $w
        ORDER BY u.nombre ASC
        LIMIT ? OFFSET ?";

$params[] = $limit;
$types .= "i";
$params[] = $offset;
$types .= "i";

$stmt = $con->prepare($sql);
if (!$stmt) die(json_encode(["error" => "Error en prepare: " . $con->error]));
$stmt->bind_param($types, ...$params);
$stmt->execute();
$res = $stmt->get_result();

$data = [];
while ($row = $res->fetch_assoc()) {
    $data[] = $row;
}
echo json_encode($data);

$stmt->close();
$con->close();