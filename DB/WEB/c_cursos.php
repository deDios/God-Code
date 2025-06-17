<?php
header('Content-Type: application/json');

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    die(json_encode(["error" => "❌ No se encontró Conexion.php en la ruta $path"]));
}

if (!isset($_POST['estatus'])) {
    die(json_encode(["error" => "❌ El parámetro 'estatus' es obligatorio (por POST)"]));
}

$estatus = (int) $_POST['estatus'];

$con = conectar();
if (!$con) {
    die(json_encode(["error" => "❌ No se pudo conectar a la base de datos"]));
}

$query = "SELECT 
            id,
            nombre,
            descripcion_breve,
            descripcion_curso,
            tutor,
            horas,
            precio,
            estatus,
            creado_por,
            fecha_creacion,
            fecha_modif
          FROM god_code.GC_Cursos
          WHERE estatus = $estatus
          ORDER BY nombre ASC";

$result = mysqli_query($con, $query);

if ($result && $result->num_rows > 0) {
    $data = array();
    
    while ($row = $result->fetch_assoc()) {
        $row['id'] = (int)$row['id'];
        $row['tutor'] = (int)$row['tutor'];
        $row['horas'] = (float)$row['horas'];
        $row['precio'] = (int)$row['precio'];
        $row['estatus'] = (int)$row['estatus'];
        $row['creado_por'] = (int)$row['creado_por'];
        $row['fecha_creacion'] = $row['fecha_creacion'];
        $row['fecha_modif'] = $row['fecha_modif'];
        $data[] = $row;
    }

    echo json_encode($data);
} else {
    echo json_encode(["mensaje" => "No se encontraron cursos con estatus = $estatus"]);
}

$con->close();
?>
