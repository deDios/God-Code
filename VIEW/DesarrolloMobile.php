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
            <a href="index.php">Inicio</a>
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

            <a href="../VIEW/Nosotros.php" >Nosotros</a>
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
                        engagement y resultados medibles. GodCode
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
                            <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DesarrolloWeb_Img1.png" alt="img">
                        </div>

                        <div class="simple-card">
                            <div class="card-body">
                                <h4>Diseño de App</h4>
                            </div>
                            <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DesarrolloWeb_Img2.png" alt="img">
                        </div>

                        <div class="simple-card">
                            <div class="card-body">
                                <h4>Compatibilidad y adaptabilidad</h4>
                            </div>
                            <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DesarrolloWeb_Img3.png" alt="img">
                        </div>

                        <div class="simple-card">
                            <div class="card-body">
                                <h4>Actualizaciones regulares</h4>
                            </div>
                            <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DesarrolloWeb_Img4.png" alt="img">
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
                    <h2><span>Diseña, construye y lanza aplicaciones mobiles que marcan la diferenciaDesde ideas
                            simples</span></h2>
                    <p>
                        hasta soluciones móviles complejas, planifica cada fase del desarrollo con precisión.Define
                        funcionalidades clave, diseña interfaces intuitivas, establece objetivos claros y colabora con
                        diseñadores,
                        programadores y testers en un flujo de trabajo unificado. Asigna tareas, gestiona prioridades,
                        realiza pruebas en
                        tiempo real y asegúrate de que cada interacción sea fluida y centrada en el usuario.Lanza apps
                        que no solo funcionan, sino que también cautivan, fidelizan y generan resultados reales.
                    </p>
                </div>

                <div class="descripcion-pagina-Productos__bloque">
                    <h2><span>Lleva el control total del desarrollo de tu app móvil</span></h2>
                    <p> Visualiza cada etapa del proyecto con tableros, listas y cronogramas adaptados a tus procesos.
                        Desde la arquitectura
                        inicial hasta la publicación final, crea flujos de trabajo personalizados para diseño,
                        desarrollo, contenido y pruebas. Integra tus herramientas favoritas —como editores de código,
                        gestores de contenido y plataformas de análisis y
                        mantén todo centralizado para que tu equipo avance con claridad y sin perder el rumbo.</p>
                    <div class="descripcion-pagina-Productos__imagen">
                        <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DesarrolloWeb_Descripcion_Img1.png"
                            alt="Diseño de app móvil" />
                    </div>
                </div>

                <div class="descripcion-pagina-Productos__bloque">
                    <h2><span>Optimiza tu app móvil con datos que importanSupervisa el progreso de cada etapa del
                            desarrollo en tiempo real: diseño de interfaz, desarrollo de funcionalidades,
                            pruebas y despliegue.</span></h2>
                    <p> Detecta cuellos de botella, identifica errores antes del lanzamiento y toma decisiones
                        informadas
                        basadas en datos reales. Evalúa el rendimiento de tu equipo y de la aplicación, anticipa riesgos
                        y mejora continuamente
                        tus procesos para lanzar apps móviles de mayor calidad, en menos tiempo.</p>
                    <div class="descripcion-pagina-Productos__imagen">
                        <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DesarrolloWeb_Descripcion_Img2.png"
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