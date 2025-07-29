<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GodCode</title>
    <link rel="stylesheet" href="../CSS/IndustriaTecnologia.css" />
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
            <div id="logo-btn" class="logo">
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
        <!-- seccion 1 -->
        <section id="industria-tecnologia-1">
            <h2>Tecnología</h2>
            <div class="contenido-seccion">
                <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/IndustriaTecnologiaSeccion1_img1.png"
                    alt="Industria 4.0">
                <div class="texto">
                    <p>
                        Nuestros programas de formación están diseñados para responder a los desafíos reales de las
                        industrias tecnológicas, ofreciendo contenidos actualizados, metodologías ágiles y herramientas
                        prácticas que impulsan el desarrollo de habilidades técnicas y estratégicas.
                    </p>
                    <p>
                        Formamos profesionales capaces de enfrentar entornos digitales en constante evolución,
                        preparados para innovar, adaptarse y liderar en sectores altamente competitivos. Desde el
                        desarrollo de software y la gestión de datos, hasta la ciberseguridad, inteligencia artificial y
                        diseño de experiencias digitales, nuestros cursos están alineados con las exigencias del mercado
                        actual y pensados para aportar valor real a empresas, startups y sectores de tecnología.
                    </p>
                </div>
            </div>
            <div class="contenido-seccion">
                <div class="texto">
                    <p>
                    <p>
                        Creemos que la educación tecnológica no solo transforma carreras, sino que también acelera el
                        progreso de las organizaciones. Por eso, cada uno de nuestros programas se enfoca en construir
                        talento especializado, preparado para tomar decisiones, crear soluciones eficientes y generar
                        impacto en el ecosistema digital. Haz crecer tu capital humano con formación de calidad,
                        relevante y alineada a las tendencias tecnológicas globales. <a>GodCode</a>.
                    </p>
                </div>
            </div>
        </section>

        <!-- seccion 2 -->
        <section id="industria-tecnologia-2">
            <div class="contenido-seccion">
                <div class="texto">
                    <p>
                        Ofrecemos una propuesta integral orientada a la industria tecnológica, en la que utilizamos
                        diversas tecnologías para desarrollar soluciones innovadoras, eficientes y alineadas a las
                        necesidades del entorno digital actual.
                    </p>
                    <p>
                        Aplicamos herramientas modernas, y entornos de desarrollo actualizados que nos permiten crear
                        productos y servicios de alto valor, como sistemas basados en arquitectura de microservicios,
                        plataformas móviles y web interactivas, hasta interfaces inteligentes y sistemas de
                        automatización. Nuestros especialistas trabajan con tecnologías vérsatiles y escalables que
                        garantizan resultados eficientes.
                    </p>
                    <p>
                        Ya sea que se trate de crear, optimizar o transformar procesos digitales, ofrecemos soluciones
                        personalizadas para alcanzar mayor calidad, flexibilidad e impacto real.
                    </p>
                </div>
                <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/IndustriaTecnologiaSeccion2_img1.png"
                    alt="Soluciones tecnológicas">
            </div>
        </section>

        <!-- seccion 3 -->
        <section id="cta-tecnologia">
            <div class="contenido">
                <h3>
                    ¿Estás listo para llevar tus proyectos digitales al siguiente nivel o potenciar las
                    capacidades tecnológicas de tu equipo?
                </h3>

                <p>
                    En GodCode, utilizamos una amplia gama de tecnologías para desarrollar soluciones modernas,
                    escalables y
                    adaptadas a las exigencias de la industria tecnológica actual.
                </p>
                <p>
                    Ya sea que necesites construir una plataforma digital desde cero, optimizar tus sistemas existentes
                    o
                    integrar herramientas inteligentes en tus procesos, contamos con la experiencia y los recursos para
                    hacerlo
                    realidad.
                </p>
                <p>
                    Aplicamos metodologías ágiles, frameworks actualizados, infraestructura en la nube y tecnologías de
                    vanguardia que nos permiten crear productos eficientes, seguros y orientados a resultados concretos.
                </p>
                <p>
                    Solicita más información sobre nuestros servicios tecnológicos, agenda una asesoría con nuestro
                    equipo o
                    descubre cómo podemos ayudarte a impulsar la transformación digital de tu empresa.
                </p>
            </div>
        </section>

        <section id="cta-tecnologia">
            <div class="contenedor-boton">
                <button class="btn-contacto" onclick="location.href='../VIEW/Contacto.php'">
                    <span style="margin-left: 8px;">¡Contáctanos!</span>
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