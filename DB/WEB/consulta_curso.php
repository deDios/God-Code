<?php
header('Content-Type: application/json');

include "../db/conn/Conexion.php";
$con = conectar();

if (!$con) {
    die(json_encode(["error" => "❌ No se pudo conectar a la base de datos"]));
}

$query = 'SELECT 
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
          WHERE estatus = 1
          ORDER BY nombre ASC;';

$result = mysqli_query($con, $query);

if ($result && $result->num_rows > 0) {
    $data = array();
    
    while ($row = $result->fetch_assoc()) {
        // Convertir campos numéricos a enteros o float según corresponda
        $row['id'] = (int)$row['id'];
        $row['tutor'] = (int)$row['tutor'];
        $row['horas'] = (float)$row['horas'];
        $row['precio'] = (int)$row['precio'];
        $row['estatus'] = (int)$row['estatus'];
        $row['creado_por'] = (int)$row['creado_por'];
        
        // Formatear fechas
        $row['fecha_creacion'] = $row['fecha_creacion'];
        $row['fecha_modif'] = $row['fecha_modif'];

        $data[] = $row;
    }

    echo json_encode($data);
} else {
    echo json_encode(["mensaje" => "No se encontraron cursos activos"]);
}

// Cerrar la conexión
$con->close();
?>
