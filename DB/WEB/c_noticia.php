<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

header('Content-Type: application/json');

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    die(json_encode(["error" => "No se encontró Conexion.php en la ruta $path"]));
}

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['estatus'])) {
    die(json_encode(["error" => "El parámetro 'estatus' es obligatorio."]));
}

$estatus = (int)$input['estatus'];

$con = conectar();
if (!$con) {
    die(json_encode(["error" => "Error de conexión a la base de datos."]));
}

// Construcción del query
if ($estatus === 9999) {
    $query = "SELECT 
                id,
                titulo,
                desc_uno,
                desc_dos,
                creado_por,
                estatus,
                fecha_creacion,
                fecha_modif
              FROM god_code.gc_noticia
              ORDER BY fecha_creacion DESC";
} else {
    $query = "SELECT 
                id,
                titulo,
                desc_uno,
                desc_dos,
                creado_por,
                estatus,
                fecha_creacion,
                fecha_modif
              FROM god_code.gc_noticia
              WHERE estatus = $estatus
              ORDER BY fecha_creacion DESC";
}

$result = mysqli_query($con, $query);

if ($result && mysqli_num_rows($result) > 0) {
    $data = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $row['id'] = (int)$row['id'];
        $row['creado_por'] = (int)$row['creado_por'];
        $row['estatus'] = (int)$row['estatus'];
        $data[] = $row;
    }
    echo json_encode($data);
} else {
    echo json_encode(["mensaje" => "No se encontraron noticias con estatus = $estatus"]);
}

$con->close();
?>
