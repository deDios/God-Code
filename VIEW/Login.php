<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GodCode</title>
    <link rel="stylesheet" href="../CSS/index.css" />
</head>

<body>
    <!-- Tope de pagina -->
    <header id="header">
        <!-- esta barra en el tope de pagina solo renderiza segun la resolucion de las pantallas pequeñas -->
        <div class="social-bar-mobile">
            <div class="icon-mobile">
                <img src="../ASSETS/index/Facebook.png" alt="Facebook" />
            </div>
            <div class="icon-mobile">
                <img src="../ASSETS/index/Instagram.png" alt="Instagram" />
            </div>
            <div class="icon-mobile">
                <img src="../ASSETS/index/Tiktok.png" alt="TikTok" />
            </div>
            <!-- icono de usuario para despues hacer el login pero para la vista mobile-->
            <div class="user-icon-mobile">
                <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                    alt="Usuario" />
            </div>
        </div>

        <div class="top-bar" id="top-bar">
            <div class="logo">
                <img src="../ASSETS/godcode_icon.png" alt="Logo GodCode" class="logo-icon">
                GodCode
            </div>

            <!--Boton hamburguesa que aparece segun la resolucion-->
            <div class="hamburger" onclick="toggleMenu()">☰</div>

            <div class="actions">
                <button class="btn btn-outline" onclick="location.href='#'">Cotizar</button>
                <button class="btn btn-primary" onclick="location.href='#'">Registrarse</button>
                <!-- icono de usuario para despues hacer el login -->
                <div class="user-icon">
                    <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                        alt="Usuario" />
                </div>
            </div>

        </div>
        <!-- Barra de navegación pequeña -->
        <div id="mobile-menu" class="subnav">
            <a href="../index.php">Inicio</a>
            <a href="#">Productos</a>
            <a href="../VIEW/Nosotros.php">Nosotros</a>
            <a href="#">Ubicación</a>

            <div class="social-icons">
                <div class="circle-icon">
                    <img src="../ASSETS/index/Facebook.png" alt="Facebook" />
                </div>
                <div class="circle-icon">
                    <img src="../ASSETS/index/Instagram.png" alt="Instagram" />
                </div>
                <div class="circle-icon">
                    <img src="../ASSETS/index/Tiktok.png" alt="TikTok" />
                </div>
            </div>
        </div>
    </header>

    
    <main>
        <div class="login-wrapper">
            <section class="login-container">
                <div class="login-visual">
                    <img src="../ASSETS/Login/imagen_login.png" alt="Collage de tecnología">
                </div>
                <div class="login-form">
                    <h1>GodCode</h1>
                    <input type="text" placeholder="Teléfono, Usuario o correo electrónico">
                    <input type="password" placeholder="Contraseña">
                    <button>Iniciar sesión</button>

                    <div class="divider">o</div>

                    <a href="#">¿Olvidaste tu contraseña?</a>
                    <div class="footer-links">
                        ¿No tienes una cuenta? <a href="#">Regístrate</a>
                    </div>
                </div>
            </section>
        </div>
        <section class="footer2">
            <div class="footer2-content">
                <div class="footer2-links">
                    <a href="#">Ubicación</a>
                    <a href="#">Galería</a>
                    <a href="#">Productos</a>
                    <a href="#">Información</a>
                </div>
                <div class="footer2-copyright">
                    <p>©2025 God Code</p>
                </div>
            </div>
        </section>
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

    <script src="../JS/index.js"></script>
</body>

</html>