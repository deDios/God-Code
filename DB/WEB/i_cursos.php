<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Metodo no permitido."]);
    exit;
}

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    http_response_code(500);
    die(json_encode(["error" => "No se encontró Conexion.php"]));
}

// Leer JSON
$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    http_response_code(400);
    die(json_encode(["error" => "No se recibió entrada JSON válida."]));
}

// Campos requeridos
$requeridos = [
    'nombre', 'descripcion_breve', 'descripcion_curso', 'descripcion_media',
    'actividades', 'tipo_evaluacion', 'calendario', 'certificado',
    'dirigido', 'competencias', 'tutor', 'horas', 'precio',
    'estatus', 'creado_por', 'fecha_inicio', 'categoria', 'prioridad'
];

foreach ($requeridos as $campo) {
    if (!isset($input[$campo])) {
        http_response_code(422);
        die(json_encode(["error" => "Falta el campo requerido: $campo"]));
    }
}

// Conectar
$con = conectar();
if (!$con) {
    http_response_code(500);
    die(json_encode(["error" => "No se pudo conectar a la base de datos."]));
}

// Preparar query
$query = "INSERT INTO god_code.gc_cursos (
    nombre, descripcion_breve, descripcion_curso, descripcion_media,
    actividades, tipo_evaluacion, calendario, certificado,
    dirigido, competencias, tutor, horas, precio,
    estatus, creado_por, fecha_inicio, categoria, prioridad
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $con->prepare($query);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Error al preparar consulta", "detalle" => $con->error]);
    $con->close();
    exit;
}

// Asegurar casting correcto
$nombre = $input['nombre'];
$descripcion_breve = $input['descripcion_breve'];
$descripcion_curso = $input['descripcion_curso'];
$descripcion_media = $input['descripcion_media'];
$actividades = (int)$input['actividades'];
$tipo_evaluacion = (int)$input['tipo_evaluacion'];
$calendario = (int)$input['calendario'];
$certificado = (int)$input['certificado'];
$dirigido = $input['dirigido'];
$competencias = $input['competencias'];
$tutor = (int)$input['tutor'];
$horas = (float)$input['horas'];
$precio = (float)$input['precio'];
$estatus = (int)$input['estatus'];
$creado_por = (int)$input['creado_por'];
$fecha_inicio = $input['fecha_inicio'];
$categoria = (int)$input['categoria'];
$prioridad = (int)$input['prioridad'];

// Vincular y verificar errores
if (!$stmt->bind_param(
    "ssssiiiissiddiisii",
    $nombre, $descripcion_breve, $descripcion_curso, $descripcion_media,
    $actividades, $tipo_evaluacion, $calendario, $certificado,
    $dirigido, $competencias, $tutor, $horas, $precio,
    $estatus, $creado_por, $fecha_inicio, $categoria, $prioridad
)) {
    http_response_code(500);
    echo json_encode(["error" => "Error al vincular parámetros", "detalle" => $stmt->error]);
    $stmt->close();
    $con->close();
    exit;
}

// Ejecutar
if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode(["ok" => true, "mensaje" => "Curso insertado correctamente", "id" => $stmt->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error al ejecutar el insert", "detalle" => $stmt->error]);
}

$stmt->close();
$con->close();
?>

