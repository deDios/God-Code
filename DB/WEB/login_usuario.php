<?php
header("Access-Control-Allow-Origin: https://godcode.com.mx");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$path = realpath("/home/site/wwwroot/db/conn/Conexion.php");
if ($path && file_exists($path)) {
    include $path;
} else {
    die(json_encode(["error" => "No se encontró Conexion.php"]));
}

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['usuario']) || !isset($input['password'])) {
    die(json_encode(["error" => "Debe enviar 'usuario' y 'password'"]));
}

$usuario = trim($input['usuario']);
$password = trim($input['password']);

$con = conectar();
if (!$con) {
    die(json_encode(["error" => "Error al conectar a la base de datos."]));
}

// Validar por correo o teléfono
$query = "SELECT id, nombre, correo, telefono, password, tipo_contacto, estatus
          FROM god_code.gc_usuario
          WHERE (correo = ? OR telefono = ?) AND estatus = 1
          LIMIT 1";

$stmt = $con->prepare($query);
$stmt->bind_param("ss", $usuario, $usuario);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();

    //if ($row['password'] === $password) { // Sin hashing
    if (password_verify($password, $row['password'])) { // con el hashing
        unset($row['password']); // No regresamos la contraseña
        echo json_encode(["mensaje" => "Acceso correcto", "usuario" => $row]);
    } else {
        echo json_encode(["error" => "Contraseña incorrecta"]);
    }
} else {
    echo json_encode(["error" => "Usuario no encontrado o inactivo"]);
}

$stmt->close();
$con->close();
