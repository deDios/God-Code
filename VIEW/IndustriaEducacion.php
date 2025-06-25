<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GodCode</title>
    <link rel="stylesheet" href="../CSS/IndustriaEducacion.css" />
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
            <a href="../index.php" class="active">Inicio</a>
            <div class="nav-item has-megamenu" id="submenu-productos">
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
                            </li>
                        </ul>
                    </div>
                    <div class="col">
                        <h4>Servicios</h4>
                        <ul>
                            <li><a href="../VIEW/ServiciosEnLaNube.php"><img
                                        src="../ASSETS/ProductosPopUp/ServiciosEnLaNube.png" alt="Nube">Servicios en la
                                    Nube</a></li>
                            <li><a href="#"><img src="../ASSETS/ProductosPopUp/DiseñoUXUI.png" alt="UX/UI">Diseño
                                    UX/UI</a></li>
                            <li><a href="#"><img src="../ASSETS/ProductosPopUp/ServicioEducativo.png">Servicio
                                    educativo</a></li>
                        </ul>
                    </div>
                    <div class="col">
                        <h4>Industrias</h4>
                        <ul>
                            <li><a href="#"><img src="../ASSETS/ProductosPopUp/Educacion.png"
                                        alt="Educación">Educación</a></li>
                            <li><a href="#"><img src="../ASSETS/ProductosPopUp/Tecnologia.png"
                                        alt="Tecnología">Tecnología</a></li>
                            <li><a href="#"><img src="../ASSETS/ProductosPopUp/Finanzas.png" alt="Finanzas">Finanzas</a>
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
        <!-- Seccion 1 -->
        <section id="industria-educacion">
            <h2>Educación</h2>

            <div class="industria-educacion__contenido">
                <div class="industria-educacion__texto">
                    <p>
                        Nuestros programas de formación están cuidadosamente diseñados para adaptarse a las demandas
                        reales de múltiples industrias, ofreciendo contenidos actualizados, metodologías efectivas y
                        herramientas prácticas que fortalecen el desempeño profesional de cada participante.
                    </p>
                    <p>
                        Creemos que la educación debe ser un motor de transformación y crecimiento, por eso enfocamos
                        cada programa en el desarrollo de competencias clave que aporten valor directo al entorno
                        laboral, fomenten la innovación y aumenten la competitividad en cada sector.
                    </p>
                    <p>
                        Desde el ámbito tecnológico hasta el administrativo, pasando por áreas lingüísticas, educativas
                        y de desarrollo personal, nuestras soluciones formativas están alineadas con los retos actuales
                        del mercado y preparadas para responder a las necesidades específicas de cada organización,
                        equipo o individuo.
                    </p>
                    <p>
                        Impulsa el crecimiento de tu talento humano con una formación relevante, dinámica y aplicada. <a
                            href="#" class="link-godcode">GodCode</a>
                    </p>
                </div>

                <div class="industria-educacion__imagen">
                    <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/IndustriaEducacion_seccion1_img1.png"
                        alt="Educación industria" />
                </div>
            </div>
        </section>

        <!-- Seccion 2 -->
        <section class="seccion-educacion">
            <div class="educacion-contenido">
                <div class="educacion-imagen">
                    <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/IndustriaEducacion_seccion2_img1.png"
                        alt="Educación digital">
                </div>
                <div class="educacion-texto">
                    <p>
                        Ofrecemos una propuesta educativa integral con cursos especializados en Programación,
                        Administración y Lenguas,
                        diseñados para fortalecer habilidades clave en entornos académicos y profesionales.
                    </p>
                    <p>
                        Nuestros programas combinan teoría actualizada, práctica guiada y recursos digitales para que
                        cada estudiante pueda
                        aplicar lo aprendido de forma efectiva y alcanzar sus objetivos.
                    </p>
                    <p>
                        Ya sea que busques desarrollar competencias técnicas, mejorar tu gestión organizacional o
                        perfeccionar tus habilidades
                        comunicativas, encontrarás en nuestros cursos una formación de calidad, flexible y orientada a
                        resultados.
                    </p>
                </div>
            </div>
        </section>

        <!-- Seccion 3 -->
        <section class="seccion-educacion-cta">
            <div class="educacion-cta-contenido">
                <h3>¿Estás listo para dar el siguiente paso en tu desarrollo profesional o impulsar las habilidades de
                    tu equipo?</h3>
                <p>
                    Descubre nuestros programas de formación en Programación, Administración y Lenguas, diseñados para
                    adaptarse a diferentes
                    niveles de experiencia y necesidades del mercado actual. Ya sea que busques adquirir nuevas
                    competencias, actualizar tus
                    conocimientos o capacitar a tu organización, contamos con opciones flexibles, prácticas y orientadas
                    a resultados.
                </p>
                <p>
                    Solicita más información, descarga nuestro catálogo completo de cursos o agenda una asesoría
                    personalizada con nuestro
                    equipo académico. Estamos aquí para ayudarte a construir un camino de aprendizaje efectivo,
                    accesible y alineado con tus metas.
                </p>
                <a href="../VIEW/Blog.php" class="educacion-cta-boton">
                    Haz clic aquí y comienza a transformar tu formación con GodCode.
                </a>
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