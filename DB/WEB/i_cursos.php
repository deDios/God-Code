<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    echo json_encode(["error" => "No se encontró Conexion.php"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
if (!$input) {
    echo json_encode(["error" => "No se recibió un cuerpo JSON válido."]);
    exit;
}

$campos_obligatorios = [
    'nombre', 'descripcion_breve', 'descripcion_curso', 'descripcion_media',
    'actividades', 'tipo_evaluacion', 'calendario', 'certificado',
    'dirigido', 'competencias', 'tutor', 'horas', 'precio',
    'estatus', 'creado_por', 'fecha_inicio', 'categoria', 'prioridad'
];

foreach ($campos_obligatorios as $campo) {
    if (!isset($input[$campo])) {
        echo json_encode(["error" => "Falta el campo requerido: $campo"]);
        exit;
    }
}

// Sanitización
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
$precio = (int)$input['precio'];
$estatus = (int)$input['estatus'];
$creado_por = (int)$input['creado_por'];
$fecha_inicio = $input['fecha_inicio'];
$categoria = (int)$input['categoria'];
$prioridad = (int)$input['prioridad'];

$con = conectar();
if (!$con) {
    echo json_encode(["error" => "Error al conectar a la base de datos."]);
    exit;
}

$query = "INSERT INTO god_code.gc_cursos (
    nombre, descripcion_breve, descripcion_curso, descripcion_media,
    actividades, tipo_evaluacion, calendario, certificado,
    dirigido, competencias, tutor, horas, precio,
    estatus, creado_por, fecha_inicio, categoria, prioridad
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $con->prepare($query);
if (!$stmt) {
    echo json_encode(["error" => "Error en prepare(): " . $con->error]);
    $con->close();
    exit;
}

// Tipos: s = string, i = int, d = double (float)
$stmt->bind_param(
    "ssssiiiisssiidiiisi",
    $nombre,
    $descripcion_breve,
    $descripcion_curso,
    $descripcion_media,
    $actividades,
    $tipo_evaluacion,
    $calendario,
    $certificado,
    $dirigido,
    $competencias,
    $tutor,
    $horas,
    $precio,
    $estatus,
    $creado_por,
    $fecha_inicio,
    $categoria,
    $prioridad
);

if ($stmt->execute()) {
    echo json_encode(["mensaje" => "Curso insertado correctamente", "id" => $stmt->insert_id]);
} else {
    echo json_encode(["error" => "Error en ejecución: " . $stmt->error]);
}

$stmt->close();
$con->close();
?>
