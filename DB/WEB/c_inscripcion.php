<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    die(json_encode(["error" => "No se encontró Conexion.php"]));
}

$input = json_decode(file_get_contents("php://input"), true);

// Validar que se reciba el campo usuario
if (!isset($input['usuario'])) {
    die(json_encode(["error" => "El campo 'usuario' es obligatorio."]));
}

$usuario = (int)$input['usuario'];

$con = conectar();
if (!$con) {
    die(json_encode(["error" => "Error al conectar a la base de datos."]));
}

$query = "SELECT 
            id,
            curso,
            usuario,
            comentario,
            estatus,
            fecha_creacion,
            fecha_modif
          FROM god_code.gc_inscripcion
          WHERE usuario = $usuario";

$result = mysqli_query($con, $query);

if ($result && $result->num_rows > 0) {
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $row['id'] = (int)$row['id'];
        $row['curso'] = (int)$row['curso'];
        $row['usuario'] = (int)$row['usuario'];
        $row['estatus'] = (int)$row['estatus'];
        $data[] = $row;
    }

    echo json_encode($data);
} else {
    echo json_encode(["mensaje" => "No se encontraron inscripciones para el usuario ID = $usuario"]);
}

$con->close();
?>
