<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    echo json_encode(["error" => "No se encontró Conexion.php en la ruta $path"]);
    exit;
}

$raw = file_get_contents("php://input");
$input = json_decode($raw, true) ?: [];

$con = conectar();
if (!$con) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a la base de datos."]);
    exit;
}
if (method_exists($con, 'set_charset')) {
    $con->set_charset('utf8mb4');
} else {
    @mysqli_query($con, "SET NAMES 'utf8mb4'");
}

$status = 1;
if (isset($input['status']))      $status = (int)$input['status'];
elseif (isset($input['estatus'])) $status = (int)$input['estatus'];
elseif (isset($_GET['status']))   $status = (int)$_GET['status'];
elseif (isset($_GET['estatus']))  $status = (int)$_GET['estatus'];

$schema = "god_code"; //por si acaso no le atinamos aca hay varios nombres para la tabla 
$candidates = [
    'gc_inscripciones',
    'gc_inscripcion',
    'inscripciones',
    'inscripcion',
    'gc_suscripciones',
    'gc_suscripcion'
];

$in = "'" . implode("','", array_map(function ($t) {
    return addslashes($t);
}, $candidates)) . "'";
$sqlDetect = "SELECT table_name
              FROM information_schema.tables
              WHERE table_schema = '{$schema}' AND table_name IN ({$in})
              LIMIT 1";

$found = null;
$qr = $con->query($sqlDetect);
if ($qr && $qr->num_rows > 0) {
    $row = $qr->fetch_assoc();
    $found = $row['table_name'];
}
if (!$found) {
    header("X-SQL-Error: tabla no encontrada en {$schema} (probadas: " . implode(", ", $candidates) . ")");
    echo json_encode(["error" => "No se encontró la tabla de inscripciones en el schema {$schema}"]);
    $con->close();
    exit;
}
$table = "{$schema}.{$found}";
header("X-Table-Used: {$table}");

$sql = "SELECT id, curso, usuario, comentario, estatus, fecha_creacion, fecha_modif
        FROM {$table}
        WHERE estatus = ?
        ORDER BY id DESC";

$stmt = $con->prepare($sql);
if (!$stmt) {
    header("X-SQL-Error: " . $con->error);
    echo json_encode(["error" => "Error en prepare"]);
    $con->close();
    exit;
}
$stmt->bind_param("i", $status);

if (!$stmt->execute()) {
    header("X-SQL-Error: " . $stmt->error);
    echo json_encode(["error" => "Error en execute"]);
    $stmt->close();
    $con->close();
    exit;
}

$data = [];
if (method_exists($stmt, 'get_result')) {
    $res = $stmt->get_result();
    if ($res) {
        while ($r = $res->fetch_assoc()) {
            $r['id']             = (int)$r['id'];
            $r['curso']          = (int)$r['curso'];
            $r['usuario']        = (int)$r['usuario'];
            $r['estatus']        = (int)$r['estatus'];
            $data[] = $r;
        }
    }
} else {
    $stmt->store_result();
    $stmt->bind_result($id, $curso, $usuario, $comentario, $estatus, $fecha_creacion, $fecha_modif);
    while ($stmt->fetch()) {
        $data[] = [
            "id"             => (int)$id,
            "curso"          => (int)$curso,
            "usuario"        => (int)$usuario,
            "comentario"     => $comentario,
            "estatus"        => (int)$estatus,
            "fecha_creacion" => $fecha_creacion,
            "fecha_modif"    => $fecha_modif
        ];
    }
}

header("X-Row-Count: " . count($data));
echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);

$stmt->close();
$con->close();