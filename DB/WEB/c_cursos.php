<?php
header('Content-Type: application/json');

include "../DB/conn/Conexion.php";
$con = conectar();

if (!$con) {
    die(json_encode(["error" => "❌ No se pudo conectar a la base de datos"]));
}

// Obtener el parámetro estatus desde GET, si no viene, asignar 1 por default
$estatus = isset($_GET['estatus']) ? intval($_GET['estatus']) : 1;

// Consulta segura usando prepared statements
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
          WHERE estatus = ?
          ORDER BY nombre ASC;";

$stmt = mysqli_prepare($con, $query);
if (!$stmt) {
    die(json_encode(["error" => "Error en la preparación de la consulta: " . mysqli_error($con)]));
}

// Bind del parámetro (i = entero)
mysqli_stmt_bind_param($stmt, "i", $estatus);

mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

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
        
        // Formatear fechas (ya vienen en formato string desde BD)
        $row['fecha_creacion'] = $row['fecha_creacion'];
        $row['fecha_modif'] = $row['fecha_modif'];

        $data[] = $row;
    }

    echo json_encode($data);
} else {
    echo json_encode(["mensaje" => "No se encontraron cursos con estatus = $estatus"]);
}

// Cerrar la conexión y statement
mysqli_stmt_close($stmt);
mysqli_close($con);
