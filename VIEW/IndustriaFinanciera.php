<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GodCode</title>
    <link rel="stylesheet" href="../CSS/IndustriaFinanciera.css" />
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
                <button class="btn btn-primary" onclick="location.href='../VIEW/Inscripcion.php'">Registrarse</button>
                <!-- icono de usuario para despues hacer el login -->
                <div class="user-icon" onclick="window.location.href='../VIEW/Login.php'">
                    <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                        alt="Usuario" href="../VIEW/Login.php" />
                </div>
            </div>
        </div>

        <!-- Barra de navegación pequeña -->
        <div id="mobile-menu" class="subnav">
            <a href="../index.php" >Inicio</a>
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
        <!-- seccion 1 -->
        <section id="industria-financiera" class="industria-financiera seccion">
            <div class="contenedor-industria">
                <div class="texto">
                    <h2>Finanzas</h2>
                    <p>
                        Nuestros programas de formación están diseñados para responder a los desafíos reales tanto de
                        las industrias tecnológicas como del sector financiero, ofreciendo contenidos actualizados,
                        metodologías ágiles y herramientas prácticas que impulsan el desarrollo de habilidades técnicas,
                        analíticas y estratégicas.
                    </p>
                    <p>
                        Formamos profesionales capaces de enfrentar entornos complejos, altamente digitalizados y en
                        constante evolución, preparados para innovar, adaptarse y liderar en sectores cada vez más
                        competitivos y regulados.
                    </p>
                    <p>
                        Desde el desarrollo de software, la gestión de datos y la inteligencia artificial, hasta la
                        administración financiera, el análisis de riesgos y la planificación estratégica, nuestros
                        programas están alineados con las demandas actuales del mercado.
                    </p>
                    <p>
                        Diseñamos nuestras formaciones para aportar valor real a empresas, instituciones financieras,
                        startups y equipos multidisciplinarios que buscan mejorar su eficiencia operativa y su capacidad
                        de respuesta.
                    </p>
                    <p>
                        Creemos que la educación especializada no solo transforma carreras individuales, sino que
                        acelera el crecimiento y la transformación digital de las organizaciones.
                    </p>
                    <p>
                        Haz crecer tu capital humano con formación de calidad, actualizada y adaptada a las tendencias
                        que están redefiniendo el futuro de la industria. <a>GodCode</a>
                    </p>
                </div>

                <div class="imagen">
                    <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/IndustriaFinanciera_seccion1_img1.png" alt="Finanzas y tecnología">
                </div>
            </div>
        </section>

        <!-- seccion 2 -->
        <section class="industria-financiera-2">
            <div class="contenedor-industria">
                <div class="imagen">
                    <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/IndustriaFinanciera_seccion2_img1.png"
                        alt="Soluciones tecnológicas financieras">
                </div>

                <div class="texto">
                    <p>
                        Ofrecemos una propuesta integral orientada a las industrias tecnológica y financiera, en la que
                        utilizamos diversas tecnologías para desarrollar soluciones innovadoras, eficientes y alineadas
                        a las necesidades del entorno digital y económico actual.
                    </p>
                    <p>
                        Aplicamos herramientas modernas, entornos de desarrollo actualizados y metodologías ágiles que
                        nos permiten crear productos y servicios de alto valor, adaptados a distintos contextos,
                        sectores y desafíos del mercado.
                    </p>
                    <p>
                        Desde programación avanzada, gestión de datos, automatización y seguridad informática, hasta
                        sistemas de análisis financiero, plataformas de gestión contable y soluciones para fintech,
                        trabajamos con tecnologías versátiles que garantizan resultados sólidos, escalables y
                        sostenibles.
                    </p>
                    <p>
                        Ya sea que se trate de crear, optimizar o transformar procesos digitales y financieros, nuestras
                        soluciones están diseñadas para ofrecer calidad, flexibilidad e impacto real en cada proyecto.
                    </p>
                </div>
            </div>
        </section>

        <!-- seccion 3 -->
        <section id="industria-financiera">
            <div class="industria-financiera__contenido">
                <p>
                    En GodCode, utilizamos una amplia gama de tecnologías para desarrollar soluciones modernas,
                    escalables y adaptadas a las exigencias de las industrias tecnológica y financiera.<br><br>

                    Ya sea que necesites construir una plataforma digital desde cero, implementar sistemas de análisis
                    financiero, optimizar procesos administrativos o integrar herramientas inteligentes en tus
                    operaciones, contamos con la experiencia y los recursos para hacerlo realidad.<br><br>

                    Aplicamos metodologías ágiles, frameworks actualizados, infraestructura en la nube y tecnologías de
                    vanguardia que nos permiten crear productos eficientes, seguros y orientados a resultados concretos,
                    tanto en el ámbito digital como en la gestión financiera.<br><br>

                    Solicita más información sobre nuestros servicios tecnológicos y financieros, agenda una asesoría
                    con nuestro equipo o descubre cómo podemos ayudarte a impulsar la transformación digital de tu
                    empresa.
                </p>
            </div>

            <div class="contenedor-boton">
                <button class="btn-contacto" onclick="location.href='../VIEW/Contacto.php'">
                    <span>¡Contáctanos!</span>
                </button>
            </div>
        </section>


        <!-- Seccion otros productos  -->
        <section id="otros-productos">
            <h2>Otros Productos</h2>
            <div class="productos-random"></div>
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
    <script src="../JS/JSglobal.js"></script>
</body>

</html>