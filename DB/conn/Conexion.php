
<?php
function conectar() {
    $con = mysqli_init();
    mysqli_ssl_set($con, NULL, NULL, "/home/site/wwwroot/db/conn/DigiCertGlobalRootCA.crt.pem", NULL, NULL);

    if (!mysqli_real_connect(
        $con,
        "mobilitysolutions-server.mysql.database.azure.com",
        "btdonyajwn",
        "Llaverito_4855797'?",
        "god_code",
        3306,
        NULL,
        MYSQLI_CLIENT_SSL
    )) {
        return null; // Retorna null si falla
    }

    return $con;
}
?>
