<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    die(json_encode(["error" => "No se encontró Conexion.php"]));
}

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['id'])) {
    die(json_encode(["error" => "Se requiere el ID del curso para editar."]));
}

$id = (int)$input['id'];

$campos_validos = [
    'nombre', 'descripcion_breve', 'descripcion_curso', 'descripcion_media',
    'actividades', 'tipo_evaluacion', 'calendario', 'certificado', 'dirigido',
    'competencias', 'tutor', 'horas', 'precio', 'estatus', 'creado_por',
    'fecha_inicio', 'categoria', 'prioridad'
];

$updates = [];
$valores = [];

foreach ($campos_validos as $campo) {
    if (isset($input[$campo])) {
        $updates[] = "$campo = ?";
        $valores[] = $input[$campo];
    }
}

if (empty($updates)) {
    die(json_encode(["error" => "No se proporcionó ningún campo para actualizar."]));
}

// Agregar columna de control
$updates[] = "fecha_modif = NOW()";

$con = conectar();
if (!$con) {
    die(json_encode(["error" => "Error al conectar a la base de datos."]));
}

$query = "UPDATE god_code.gc_cursos SET " . implode(", ", $updates) . " WHERE id = ?";
$stmt = $con->prepare($query);

// Tipos dinámicos: todo se trata como string, excepto algunos enteros y flotantes
$tipos = str_repeat("s", count($valores)) . "i";
$valores[] = $id;

$stmt->bind_param($tipos, ...$valores);

if ($stmt->execute()) {
    echo json_encode(["mensaje" => "Curso actualizado correctamente."]);
} else {
    echo json_encode(["error" => "Error al actualizar el curso", "detalle" => $stmt->error]);
}

$stmt->close();
$con->close();
?>
