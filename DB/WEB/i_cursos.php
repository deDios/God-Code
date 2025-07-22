<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    die(json_encode(["error" => "No se encontró Conexion.php"]));
}

// Leer datos JSON del body
$input = json_decode(file_get_contents("php://input"), true);
if (!$input) {
    die(json_encode(["error" => "No se recibió entrada JSON válida."]));
}

// Validar campos obligatorios
$requeridos = [
    'nombre', 'descripcion_breve', 'descripcion_curso', 'descripcion_media',
    'actividades', 'tipo_evaluacion', 'calendario', 'certificado',
    'dirigido', 'competencias', 'tutor', 'horas', 'precio',
    'estatus', 'creado_por', 'fecha_inicio', 'categoria', 'prioridad'
];

foreach ($requeridos as $campo) {
    if (!isset($input[$campo])) {
        die(json_encode(["error" => "Falta el campo requerido: $campo"]));
    }
}

// Conexión
$con = conectar();
if (!$con) {
    die(json_encode(["error" => "No se pudo conectar a la base de datos."]));
}

// Insertar
$query = "INSERT INTO god_code.gc_cursos (
    nombre, descripcion_breve, descripcion_curso, descripcion_media,
    actividades, tipo_evaluacion, calendario, certificado,
    dirigido, competencias, tutor, horas, precio,
    estatus, creado_por, fecha_inicio, categoria, prioridad
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $con->prepare($query);
if (!$stmt) {
    echo json_encode(["error" => "Error al preparar la consulta", "detalle" => $con->error]);
    $con->close();
    exit;
}

// Vincular parámetros
$stmt->bind_param(
    "ssssiiiiiissiiiiss",
    $input['nombre'],
    $input['descripcion_breve'],
    $input['descripcion_curso'],
    $input['descripcion_media'],
    $input['actividades'],
    $input['tipo_evaluacion'],
    $input['calendario'],
    $input['certificado'],
    $input['dirigido'],
    $input['competencias'],
    $input['tutor'],
    $input['horas'],
    $input['precio'],
    $input['estatus'],
    $input['creado_por'],
    $input['fecha_inicio'],
    $input['categoria'],
    $input['prioridad']
);

// Ejecutar
if ($stmt->execute()) {
    echo json_encode(["mensaje" => "Curso insertado correctamente", "id" => $stmt->insert_id]);
} else {
    echo json_encode(["error" => "Error al insertar el curso", "detalle" => $stmt->error]);
}

$stmt->close();
$con->close();
?>
