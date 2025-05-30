<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GodCode</title>
    <link rel="stylesheet" href="CSS/index.css">
</head>

<body>

    <!-- Tope de pagina -->
    <header>
        <div class="top-bar">
            <div class="logo">
                <img src="ASSETS/godcode_icon.png" alt="Logo GodCode" class="logo-icon">
                GodCode
            </div>

            <div class="actions">
                <button class="btn btn-outline" onclick="location.href='#'">Contáctanos!</button>
                <button class="btn btn-outline" onclick="location.href='#'">Cotizar</button>
                <button class="btn btn-primary" onclick="location.href='#'">Registrarse</button>
            </div>
        </div>

        <!--Boton hamburguesa que aparece segun la resolucion-->
        <div class="hamburger" onclick="toggleMenu()">☰</div>

        <!-- Barra de navegación pequeña -->
        <div id="mobile-menu" class="subnav">
            <a href="#" class="active">Inicio</a>
            <a href="#">Productos</a>
            <a href="#">Quiénes somos</a>
            <a href="#">Nosotros</a>
        </div>
    </header>

    <!-- Contenido principal -->
    <main>
        <h1 class="section-title">Somos...</h1>
        <p class="section-subtitle">Creamos proyectos web a la medida para tu negocio.</p>
        <p class="section-subtitle">Contenido.</p>
    </main>

    <!-- Pie de pagina -->
    <footer>
        <div>
            <strong>Contacto</strong>
            <small>Teléfono: 33 3333 3333</small>
            <small>Ubicación: Ixtlahuacán de los membrillos</small>
        </div>
        <div>
            <strong>Horarios de servicio</strong>
            <small>Lunes a Viernes</small>
            <small>De 9:00AM a 8:00PM</small>
        </div>
    </footer>

    <script>
        function toggleMenu() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('show');
        }
    </script>
</body>

</html>