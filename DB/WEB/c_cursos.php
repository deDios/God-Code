<?php
header('Content-Type: application/json');

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    die(json_encode(["error" => "No se encontró Conexion.php en la ruta $path"]));
}

// Obtener datos JSON del cuerpo de la solicitud
$input = json_decode(file_get_contents("php://input"), true);

// Validar parámetro obligatorio
if (!isset($input['estatus'])) {
    die(json_encode(["error" => "El parámetro 'estatus' es obligatorio en el cuerpo JSON (ej. { \"estatus\": 1 })"]));
}
$estatus = (int)$input['estatus'];

// Conexión a la base de datos
$con = conectar();
if (!$con) {
    die(json_encode(["error" => "No se pudo conectar a la base de datos"]));
}

$query = "SELECT 
            id,
            nombre,
            descripcion_breve,
            descripcion_curso,
            descripcion_media,
            actividades,
            tipo_evaluacion,
            calendario,
            certificado,
            dirigido,
            competencias,
            tutor,
            horas,
            precio,
            estatus,
            creado_por,
            fecha_creacion,
            fecha_modif,
            fecha_inicio,
            categoria,
            prioridad
          FROM god_code.GC_Cursos
          WHERE estatus = $estatus
          ORDER BY nombre ASC";

$result = mysqli_query($con, $query);

// Procesar resultados
if ($result && $result->num_rows > 0) {
    $data = [];

    while ($row = $result->fetch_assoc()) {
        $row['id'] = (int)$row['id'];
        $row['actividades'] = (int)$row['actividades'];
        $row['tipo_evaluacion'] = (int)$row['tipo_evaluacion'];
        $row['calendario'] = (int)$row['calendario'];
        $row['certificado'] = (bool)$row['certificado'];
        $row['tutor'] = (int)$row['tutor'];
        $row['horas'] = (float)$row['horas'];
        $row['precio'] = (int)$row['precio'];
        $row['estatus'] = (int)$row['estatus'];
        $row['creado_por'] = (int)$row['creado_por'];
        $row['categoria'] = (int)$row['categoria'];
        $row['prioridad'] = (int)$row['prioridad'];
        $row['fecha_creacion'] = $row['fecha_creacion'];
        $row['fecha_modif'] = $row['fecha_modif'];
        $row['fecha_inicio'] = $row['fecha_inicio']; 
        $data[] = $row;
    }

    echo json_encode($data);
} else {
    echo json_encode(["mensaje" => "No se encontraron cursos con estatus = $estatus"]);
}

// Cerrar conexión
$con->close();
?>
