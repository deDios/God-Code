<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GodCode</title>
    <link rel="stylesheet" href="../CSS/DesarrolloWeb.css" />
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
            <a href="../index.php">Inicio</a>
            <div class="nav-item has-megamenu desktop-only" id="submenu-productos">
                <a href="#">Productos</a>
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
        <!-- Seccion 1  -->
        <section id="desarrollo-web-carrusel" class="animado">

            <!-- Texto informativo y llamado a la acción -->
            <div class="info-section">
                <div class="info-text">
                    <h2>Desarrollo Mobile</h2>
                    <p>
                        Las grandes apps comienzan con una buena
                        estrategia de desarrollo. Desde la conceptualización
                        hasta el diseño y la programación, cada etapa
                        es clave para crear experiencias mobiles intuitivas,
                        funcionales y alineadas con las necesidades reales
                        de tus usuarios. Desarrolla aplicaciones que no
                        solo se ven bien, sino que generan impacto,
                        engagement y resultados medibles. <a>GodCode</a>
                    </p>
                </div>
                <div class="cta-box">
                    <h3>Crea tu App Mobile</h3>
                    <button onclick="location.href='#'">Contáctanos</button>
                </div>
            </div>

            <!-- Carrusel de cursos -->
            <div class="carousel-container">
                <button class="carousel-btn prev" aria-label="Anterior">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                </button>

                <div class="carousel-track-container">
                    <div class="carousel-track">
                        <!-- Cards-->
                        <div class="simple-card">
                            <div class="card-body">
                                <h4>Desarrollo de App Mobile</h4>
                            </div>
                            <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DesarrolloMobile_Img1.png" alt="img">
                        </div>

                        <div class="simple-card">
                            <div class="card-body">
                                <h4>Diseño de App</h4>
                            </div>
                            <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DesarrolloMobile_Img2.png" alt="img">
                        </div>

                        <div class="simple-card">
                            <div class="card-body">
                                <h4>Compatibilidad y adaptabilidad</h4>
                            </div>
                            <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DesarrolloMobile_Img3.png" alt="img">
                        </div>

                        <div class="simple-card">
                            <div class="card-body">
                                <h4>Actualizaciones regulares</h4>
                            </div>
                            <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DesarrolloMobile_Img4.png" alt="img">
                        </div>
                    </div>
                </div>

                <button class="carousel-btn next" aria-label="Siguiente">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                    </svg>
                </button>
            </div>
        </section>

        <!-- seccion 2 -->
        <section id="descripcion-pagina-Productos" class="animado">
            <div class="descripcion-pagina-Productos__wrapper">
                <div class="descripcion-pagina-Productos__bloque">
                    <h2><span>Diseña, construye y lanza aplicaciones móviles que marcan la diferencia</span></h2>
                    <p>
                        Desde ideas simples hasta soluciones móviles robustas y escalables, planifica cada etapa del
                        desarrollo con visión estratégica y atención al detalle. Define funcionalidades clave que
                        respondan a las verdaderas necesidades de tus usuarios, diseña interfaces intuitivas que
                        ofrezcan una experiencia fluida, y establece objetivos claros que orienten cada decisión del
                        proyecto. Colabora de forma integrada con diseñadores UI/UX, desarrolladores front y back-end,
                        testers y gestores de producto en un flujo de trabajo bien estructurado, que favorezca la
                        comunicación, la agilidad y la eficiencia. Asigna tareas según prioridades, gestiona los tiempos
                        de entrega, realiza pruebas en tiempo real y ajusta cada componente para lograr una aplicación
                        estable, rápida y centrada en la experiencia del usuario. Aprovecha herramientas modernas de
                        desarrollo, análisis, control de calidad y despliegue continuo para acelerar el proceso sin
                        comprometer la calidad. Lanza aplicaciones móviles que no solo funcionan correctamente, sino que
                        conectan emocionalmente con los usuarios, generan fidelización, fortalecen tu marca y entregan
                        resultados medibles. Transforma tus ideas en soluciones móviles funcionales, atractivas y
                        preparadas para competir en un mercado digital cada vez más exigente.
                    </p>
                </div>

                <div class="descripcion-pagina-Productos__bloque">
                    <h2><span>Lleva el control total del desarrollo de tu app móvil</span></h2>
                    <p> Gestiona cada etapa de tu proyecto de forma organizada, visual y eficiente con tableros, listas,
                        cronogramas y flujos de trabajo adaptados a tus procesos. Desde la concepción de la idea hasta
                        el despliegue en las tiendas de aplicaciones, mantén todo bajo control con una metodología
                        estructurada y colaborativa. Diseña flujos personalizados para cada fase: conceptualización,
                        prototipado, diseño de interfaz, desarrollo de funcionalidades, pruebas de calidad, optimización
                        de rendimiento y publicación final. Asigna tareas con claridad, define prioridades, establece
                        fechas clave y asegúrate de que cada integrante del equipo conozca su rol y objetivos en tiempo
                        real .Integra tus herramientas preferidas como entornos de desarrollo (IDE), sistemas de control
                        de versiones como Git, gestores de tareas, plataformas de analítica y testing en un solo entorno
                        centralizado que facilite la comunicación y evite errores.
                        Optimiza el trabajo en equipo, reduce retrabajos y acelera los tiempos de entrega sin
                        comprometer la calidad. Con una gestión clara y estructurada, tu app no solo llegará a tiempo,
                        sino que será más estable, intuitiva y lista para destacar en el mercado.</p>
                    <div class="descripcion-pagina-Productos__imagen">
                        <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DesarrolloMobile_Descripcion_Img1.png"
                            alt="Diseño de app móvil" />
                    </div>
                </div>

                <div class="descripcion-pagina-Productos__bloque">
                    <h2><span>Optimiza tu app mobile con datos que realmente importan.</span></h2>
                    <p> Gestiona tu proceso de desarrollo con información precisa, actualizada y accionable. Supervisa
                        el avance de cada etapa —desde el diseño de la interfaz y la experiencia del usuario, hasta la
                        programación de funcionalidades, pruebas internas y despliegue en tiendas— con total visibilidad
                        en tiempo real. Identifica cuellos de botella en los flujos de trabajo, detecta errores antes de
                        que impacten al usuario final y toma decisiones respaldadas por datos reales, no suposiciones.
                        Evalúa el rendimiento individual y colectivo de tu equipo, mide la eficiencia de cada fase del
                        proyecto y ajusta las estrategias según métricas claras y objetivos definidos. Además, analiza
                        el comportamiento de los usuarios dentro de tu app una vez publicada: tasa de retención, caídas,
                        errores, interacciones y conversiones. Esta retroalimentación continua te permitirá iterar,
                        mejorar y escalar tu aplicación de forma más ágil y precisa. Con un enfoque basado en datos, no
                        solo reduces tiempos de desarrollo, sino que aseguras una entrega de mayor calidad, alineada a
                        las necesidades del mercado y preparada para crecer de forma sostenible.</p>
                    <div class="descripcion-pagina-Productos__imagen">
                        <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DesarrolloMobile_Descripcion_Img2.png"
                            alt="Datos de aplicación móvil" />
                    </div>
                </div>
            </div>
        </section>

        <!-- seccion 3  los productos aparecen en grupso de 3 y lo hacen aleactoreamente -->
        <section id="otros-productos">
            <h2>Otros Productos</h2>
            <div class="productos-random"></div>
        </section>

    </main>

    <script src="../JS/index.js"></script>
</body>

</html>