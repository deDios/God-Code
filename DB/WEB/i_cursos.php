<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    die(json_encode(["error" => "No se encontró Conexion.php"]));
}

$input = json_decode(file_get_contents("php://input"), true);

$campos_obligatorios = [
    'nombre', 'descripcion_breve', 'descripcion_curso', 'descripcion_media',
    'actividades', 'tipo_evaluacion', 'calendario', 'certificado',
    'dirigido', 'competencias', 'tutor', 'horas', 'precio',
    'estatus', 'creado_por', 'fecha_inicio', 'categoria', 'prioridad'
];

foreach ($campos_obligatorios as $campo) {
    if (!isset($input[$campo])) {
        die(json_encode(["error" => "Falta el campo requerido: $campo"]));
    }
}

// Asignar valores
$valores = [];
foreach ($campos_obligatorios as $campo) {
    $valores[$campo] = $input[$campo];
}

$con = conectar();
if (!$con) {
    die(json_encode(["error" => "Error al conectar a la base de datos."]));
}

$query = "INSERT INTO god_code.gc_cursos (
    nombre, descripcion_breve, descripcion_curso, descripcion_media,
    actividades, tipo_evaluacion, calendario, certificado,
    dirigido, competencias, tutor, horas, precio,
    estatus, creado_por, fecha_inicio, categoria, prioridad
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $con->prepare($query);
$stmt->bind_param(
    "ssssiiiisssiidiiisi",
    $valores['nombre'],
    $valores['descripcion_breve'],
    $valores['descripcion_curso'],
    $valores['descripcion_media'],
    $valores['actividades'],
    $valores['tipo_evaluacion'],
    $valores['calendario'],
    $valores['certificado'],
    $valores['dirigido'],
    $valores['competencias'],
    $valores['tutor'],
    $valores['horas'],
    $valores['precio'],
    $valores['estatus'],
    $valores['creado_por'],
    $valores['fecha_inicio'],
    $valores['categoria'],
    $valores['prioridad']
);

if ($stmt->execute()) {
    echo json_encode(["mensaje" => "Curso insertado correctamente", "id" => $stmt->insert_id]);
} else {
    echo json_encode(["error" => "Error al insertar curso", "detalle" => $stmt->error]);
}

$stmt->close();
$con->close();
?>
