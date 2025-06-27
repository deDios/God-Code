<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GodCode</title>
    <link rel="stylesheet" href="../CSS/ServiciosEnLaNube.css" />
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
            <a href="index.php">Inicio</a>
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
                            <li><a href="../VIEW/ServicioEducativo.php"><img
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
        <!-- Seccion 1  -->
        <section id="servicios-nube">
            <div class="servicios-nube__contenedor">
                <div class="servicios-nube__texto">
                    <h2>Servicios en la Nube</h2>
                    <p>
                        Las grandes soluciones digitales comienzan con una estrategia sólida en la nube. Desde la
                        planificación de la infraestructura hasta la implementación y escalabilidad, cada etapa es clave
                        para construir entornos seguros, flexibles y eficientes.
                        Aprovecha el poder del cómputo en la nube para alojar tus aplicaciones, gestionar datos,
                        automatizar procesos y optimizar el rendimiento de tus sistemas. Desarrolla soluciones que no
                        solo funcionan bien, sino que evolucionan contigo, impulsan la innovación y logran resultados
                        reales.
                        <a href="#" class="link-godcode">GodCode</a>
                    </p>
                </div>

                <div class="servicios-nube__imagen">
                    <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/ServiciosEnLaNubeSeccion1_img1.png"
                        alt="Servicios en la nube" />
                </div>
            </div>
        </section>

        <!-- Seccion 2  -->
        <section id="ventajas-nube">
            <p class="ventajas-nube__intro">
                Estas son las ventajas estratégicas que su producto puede alcanzar mediante la adopción<br>
                de soluciones basadas en la nube.
            </p>

            <div class="ventajas-nube__contenedor">
                <button class="ventajas-nube__btn prev" aria-label="Anterior">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                </button>

                <div class="ventajas-nube__carousel" id="ventajas-carousel">

                    <div class="ventaja">
                        <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/ServiciosEnLaNubeSeccion2_img1.png"
                            alt="Ventaja" />
                        <div class="ventaja__texto">
                            <h3>Escalabilidad inmediata</h3>
                            <p>Puedes aumentar o reducir recursos (almacenamiento, procesamiento, usuarios) según la
                                demanda, sin necesidad de infraestructura física adicional.</p>
                        </div>
                    </div>

                    <div class="ventaja">
                        <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/ServiciosEnLaNubeSeccion2_img1.png"
                            alt="Ventaja" />
                        <div class="ventaja__texto">
                            <h3>Escalabilidad inmediata</h3>
                            <p>Puedes aumentar o reducir recursos (almacenamiento, procesamiento, usuarios) según la
                                demanda, sin necesidad de infraestructura física adicional.</p>
                        </div>
                    </div>

                    <div class="ventaja">
                        <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/ServiciosEnLaNubeSeccion2_img1.png"
                            alt="Ventaja" />
                        <div class="ventaja__texto">
                            <h3>Escalabilidad inmediata</h3>
                            <p>Puedes aumentar o reducir recursos (almacenamiento, procesamiento, usuarios) según la
                                demanda, sin necesidad de infraestructura física adicional.</p>
                        </div>
                    </div>
                </div>

                <button class="ventajas-nube__btn next" aria-label="Siguiente">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                    </svg>
                </button>
            </div>
        </section>

        <!-- Seccion 3  -->
        <section id="nube-final">
            <div class="nube-final__contenido">
                <p>
                    No te pierdas la oportunidad de tener tus páginas y apps alojadas en nuestro servicio en la nube.
                    Optimiza el rendimiento, la seguridad y la escalabilidad de tus soluciones digitales con una
                    infraestructura moderna, confiable y diseñada para acompañar el crecimiento de tu negocio. Al migrar
                    tus aplicaciones y sitios web a nuestra nube, disfrutarás de disponibilidad continua, tiempos de
                    carga rápidos, respaldo automático de datos y protección avanzada contra amenazas.
                    <br><br>
                    Además, podrás realizar despliegues más ágiles, mantener el control total sobre tus recursos y
                    reducir significativamente los costos operativos. Nuestro equipo técnico te acompaña en cada etapa:
                    desde la configuración inicial hasta el monitoreo y mantenimiento, garantizando un entorno estable y
                    adaptado a tus necesidades. Haz que tu proyecto digital evolucione con la flexibilidad y potencia
                    que solo la nube puede ofrecer.
                </p>
                <div class="nube-final__imagen">
                    <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/ServiciosEnLaNubeSeccion3_img1.png"
                        alt="Servicios en la nube">
                </div>
            </div>
        </section>

        <!-- Seccion 4  -->
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
</body>

</html>