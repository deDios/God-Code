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
        <!-- Barra social móvil (solo visible en pantallas pequeñas) -->
        <div class="social-bar-mobile">
            <div class="social-icons">
                <div class="icon-mobile">
                    <img src="../ASSETS/index/Facebook.png" alt="Facebook" />
                </div>
                <div class="icon-mobile">
                    <img src="../ASSETS/index/Instagram.png" alt="Instagram" />
                </div>
                <div class="icon-mobile">
                    <img src="../ASSETS/index/Tiktok.png" alt="TikTok" />
                </div>
                <!-- Icono de usuario para login en vista mobile -->
                <div class="user-icon-mobile" onclick="window.location.href='../VIEW/Login.php'">
                    <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                        alt="Usuario" />
                </div>
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
                <div class="user-icon" onclick="window.location.href='../VIEW/Login.php'">
                    <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                        alt="Usuario" href="../VIEW/Login.php" />
                </div>
            </div>
        </div>

        <!-- Barra de navegación pequeña -->
        <div id="mobile-menu" class="subnav">
            <a href="../index.php" class="active">Inicio</a>
            <div class="nav-item has-megamenu" id="submenu-productos">
                <a href="#">Productos</a>
                <div class="megamenu">
                    <div class="col">
                        <h4>Lo que hacemos</h4>
                        <ul>
                            <li><a href="../VIEW/DesarrolloWeb.php"><img src="../ASSETS/ProductosPopUp/DesarrolloWeb.png" alt="Web">Desarrollo Web</a></li>
                            <li><a href="../VIEW/DesarrolloMobile.php"><img src="../ASSETS/ProductosPopUp/DesarrolloMobile.png" alt="Mobile">Desarrollo Mobile</a></li>
                            <li><a href="#"><img src="../ASSETS/ProductosPopUp/DesarrolloNearshore.png">Desarrollo
                                    Nearshore</a></li>
                            <li><a href="#"><img src="../ASSETS/ProductosPopUp/DesarrolloOffshore.png" alt="Offshore">Desarrollo Offshore</a>
                            </li>
                        </ul>
                    </div>
                    <div class="col">
                        <h4>Servicios</h4>
                        <ul>
                            <li><a href="../VIEW/ServiciosEnLaNube.php"><img src="../ASSETS/ProductosPopUp/ServiciosEnLaNube.png" alt="Nube">Servicios en la Nube</a></li>
                            <li><a href="#"><img src="../ASSETS/ProductosPopUp/DiseñoUXUI.png" alt="UX/UI">Diseño UX/UI</a></li>
                            <li><a href="#"><img src="../ASSETS/ProductosPopUp/ServicioEducativo.png">Servicio educativo</a></li>
                        </ul>
                    </div>
                    <div class="col">
                        <h4>Industrias</h4>
                        <ul>
                            <li><a href="#"><img src="../ASSETS/ProductosPopUp/Educacion.png" alt="Educación">Educación</a></li>
                            <li><a href="#"><img src="../ASSETS/ProductosPopUp/Tecnologia.png" alt="Tecnología">Tecnología</a></li>
                            <li><a href="#"><img src="../ASSETS/ProductosPopUp/Finanzas.png" alt="Finanzas">Finanzas</a></li>
                        </ul>
                    </div>
                    <div class="col tecnologias full-width">
                        <h4>Tecnologías</h4>
                        <div class="tech-icons">
                            <span><img src="../ASSETS/ProductosPopUp/Tecnologias/Azure.png" alt="Azure"> Azure</span>
                            <span><img src="../ASSETS/ProductosPopUp/Tecnologias/Php.png" alt="PHP"> PHP</span>
                            <span><img src="../ASSETS/ProductosPopUp/Tecnologias/Kotlin.png" alt="Kotlin"> Kotlin</span>
                            <span><img src="../ASSETS/ProductosPopUp/Tecnologias/SwiftUI.png" alt="SwiftUI"> SwiftUI</span>
                        </div>
                    </div>
                </div>
            </div>
            <a href="../VIEW/Nosotros.php">Nosotros</a>
            <a href="../VIEW/Blog.php">Blog</a>

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

    
    <main class="animado">
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

    <script src="../JS/index.js"></script>
</body>

</html>