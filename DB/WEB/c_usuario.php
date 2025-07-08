<?php
header('Content-Type: application/json');

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    die(json_encode(["error" => "No se encontró Conexion.php en la ruta $path"]));
}

$input = json_decode(file_get_contents("php://input"), true);
$condiciones = [];

if (!empty($input['correo'])) {
    $correo = mysqli_real_escape_string(conectar(), $input['correo']);
    $condiciones[] = "correo = '$correo'";
}

if (!empty($input['telefono'])) {
    $telefono = mysqli_real_escape_string(conectar(), $input['telefono']);
    $condiciones[] = "telefono = '$telefono'";
}

if (empty($condiciones)) {
    die(json_encode(["error" => "Debe proporcionar al menos 'correo' o 'telefono' para buscar."]));
}

$con = conectar();
if (!$con) {
    die(json_encode(["error" => "Error de conexión a la base de datos."]));
}

$where = implode(" OR ", $condiciones);

$query = "SELECT * FROM god_code.gc_usuario WHERE $where AND estatus = 1";
$result = mysqli_query($con, $query);

$data = [];
if ($result && mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    echo json_encode($data);
} else {
    echo json_encode(["mensaje" => "No se encontraron usuarios con los parámetros proporcionados."]);
}

$con->close();
?>
