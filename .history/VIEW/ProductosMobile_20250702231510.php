<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GodCode</title>
    <link rel="stylesheet" href="../CSS/ProductosMobile.css" />
    <link rel="stylesheet" href="../CSS/plantilla.css" />
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
            <a href="../index.php">Inicio</a>
            <div class="nav-item has-megamenu desktop-only" id="submenu-productos">
                <a href="#" class="active">Productos</a>
                <div class="megamenu">
                    <div class="col">
                        <h4>Lo que hacemos</h4>
                        <ul>
                            <li><a href="../VIEW/DesarrolloWeb.php"><img
                                        src="../ASSETS/ProductosPopUp/DesarrolloWeb.png" alt="Web">Desarrollo Web</a>
                            </li>
                            <li><a href="../VIEW/DesarrolloMobile.php"><img
                                        src="../ASSETS/ProductosPopUp/DesarrolloMobile.png" alt="Mobile">Desarrollo
                                    Mobile</a></li>
                        </ul>
                    </div>
                    <div class="col">
                        <h4>Servicios</h4>
                        <ul>
                            <li><a href="../VIEW/ServiciosEnLaNube.php"><img
                                        src="../ASSETS/ProductosPopUp/ServiciosEnLaNube.png" alt="Nube">Servicios
                                    en la Nube</a></li>
                            <li><a href="../VIEW/DisenoUXUI.php"><img src="../ASSETS/ProductosPopUp/DiseñoUXUI.png"
                                        alt="UX/UI">Diseño UX/UI</a>
                            </li>
                            <li><a href="../VIEW/ServicioEducativo.php"><img
                                        src="../ASSETS/ProductosPopUp/ServicioEducativo.png">Servicio
                                    educativo</a></li>
                        </ul>
                    </div>
                    <div class="col">
                        <h4>Industrias</h4>
                        <ul>
                            <li><a href="../VIEW/IndustriaEducacion.php"><img
                                        src="../ASSETS/ProductosPopUp/Educacion.png" alt="Educación">Educación</a>
                            </li>
                            <li><a href="../VIEW/IndustriaTecnologia.php"><img
                                        src="../ASSETS/ProductosPopUp/Tecnologia.png" alt="Tecnología">Tecnología</a>
                            </li>
                            <li><a href="../VIEW/IndustriaFinanciera.php"><img
                                        src="../ASSETS/ProductosPopUp/Finanzas.png" alt="Finanzas">Finanzas</a>
                            </li>
                        </ul>
                    </div>
                    <div class="col tecnologias full-width">
                        <h4>Tecnologías</h4>
                        <div class="tech-icons">
                            <span><img src="../ASSETS/ProductosPopUp/Tecnologias/Azure.png" alt="Azure"> Azure</span>
                            <span><img src="../ASSETS/ProductosPopUp/Tecnologias/Php.png" alt="PHP"> PHP</span>
                            <span><img src="../ASSETS/ProductosPopUp/Tecnologias/Kotlin.png" alt="Kotlin"> Kotlin</span>
                            <span><img src="../ASSETS/ProductosPopUp/Tecnologias/SwiftUI.png" alt="SwiftUI">
                                SwiftUI</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="nav-item mobile-only">
                <a href="../VIEW/ProductosMobile.php" class="btn-contacto active">Productos</a>
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


    <main>
        <section class="productos-mobile">
            <h1 style="color: #1a73e8;">Productos</h1>
            <h2>Lo que hacemos</h2>

            <!-- Productos -->
            <div class="card-producto">
                <a href="../VIEW/DesarrolloWeb.php" class="card-body-producto">
                    <img src="../ASSETS/ProductosPopUp/DesarrolloWeb.png" alt="Desarrollo Web">
                    <h3>Desarrollo Web</h3>
                    <p>Diseñamos y desarrollamos sitios web que atraen, funcionan y convierten. Impulsa tu presencia
                        digital con soluciones a medida enfocadas en resultados reales.</p>
                </a>
            </div>

            <div class="card-producto">
                <a href="../VIEW/DesarrolloMobile.php" class="card-body-producto">
                    <img src="../ASSETS/ProductosPopUp/DesarrolloMobile.png" alt="Desarrollo Mobile">
                    <h3>Desarrollo Mobile</h3>
                    <p>Creamos apps móviles intuitivas, rápidas y efectivas. Lleva tu idea al siguiente nivel con
                        soluciones que conectan y generan resultados.</p>
                </a>
            </div>

            <h2>Servicios</h2>

            <!-- Servicios -->
            <div class="card-producto">
                <a href="../VIEW/ServiciosEnLaNube.php" class="card-body-producto">
                    <img src="../ASSETS/ProductosPopUp/ServiciosEnLaNube.png" alt="Servicios en la Nube">
                    <h3>Servicios en la Nube</h3>
                    <p>Escala tu negocio con servicios en la nube seguros, flexibles y de alto rendimiento. Optimiza tus
                        sistemas, automatiza procesos y mantén todo disponible en cualquier momento y lugar.</p>
                </a>
            </div>

            <div class="card-producto">
                <a href="../VIEW/DisenoUXUI.php" class="card-body-producto">
                    <img src="../ASSETS/ProductosPopUp/DiseñoUXUI.png" alt="Diseño UX/UI">
                    <h3>Diseño UX/UI</h3>
                    <p>Diseñamos experiencias digitales intuitivas, atractivas y centradas en el usuario. Conecta con tu
                        audiencia desde el primer clic y convierte diseño en resultados.</p>
                </a>
            </div>

            <div class="card-producto">
                <a href="../VIEW/ServicioEducativo.php" class="card-body-producto">
                    <img src="../ASSETS/ProductosPopUp/ServicioEducativo.png" alt="Servicio educativo">
                    <h3>Servicio educativo</h3>
                    <p>Transforma el aprendizaje con experiencias educativas dinámicas, accesibles y personalizadas.
                        Ofrecemos soluciones que inspiran, forman y potencian el crecimiento real.</p>
                </a>
            </div>

            <h2>Industrias</h2>

            <!-- Industrias -->
            <div class="card-producto">
                <a href="../VIEW/ServicioEducativo.php" class="card-body-producto">
                    <img src="../ASSETS/ProductosPopUp/Educacion.png" alt="Educación">
                    <h3>Educación</h3>
                    <p>Impulsa el conocimiento con propuestas educativas innovadoras, inclusivas y de calidad. Formamos
                        mentes preparadas para enfrentar los retos del presente y del futuro.</p>
                </a>
            </div>

            <div class="card-producto">
                <a href="../VIEW/IndustriaTecnologia.php" class="card-body-producto">
                    <img src="../ASSETS/ProductosPopUp/Tecnologia.png" alt="Tecnología">
                    <h3>Tecnología</h3>
                    <p>Impulsa tu negocio con soluciones tecnológicas innovadoras, seguras y escalables. Conecta
                        procesos, personas y datos para avanzar hacia un futuro digital más inteligente.</p>
                </a>
            </div>

            <div class="card-producto">
                <a href="../VIEW/IndustriaFinanciera.php" class="card-body-producto">
                    <img src="../ASSETS/ProductosPopUp/Finanzas.png" alt="Finanzas">
                    <h3>Finanzas</h3>
                    <p>Optimiza la gestión financiera con soluciones precisas, seguras y adaptadas a tus necesidades.
                        Toma decisiones informadas que impulsen el crecimiento y la estabilidad de tu negocio.</p>
                </a>
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