<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GodCode</title>
    <link rel="stylesheet" href="../CSS/ServicioEducativo.css" />
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
        <!-- Seccion 1 -->
        <section id="servicio-educativo">
            <div class="educativo-contenido">
                <div class="educativo-texto">
                    <h3>Servicio educativo</h3>
                    <p>
                        Las grandes oportunidades profesionales comienzan con una formación integral en tecnología,
                        administración y lenguas extranjeras.
                        En un mundo cada vez más globalizado y digital, estudiar en estas áreas te brinda las
                        herramientas necesarias para destacar en el mercado laboral y adaptarte a los constantes cambios
                        del entorno profesional.
                    </p>
                    <p>
                        Adquiere habilidades tecnológicas que te permitirán dominar el uso de software, análisis de
                        datos, desarrollo de sistemas y herramientas digitales esenciales en cualquier industria.
                    </p>
                    <p>
                        Complementa tu perfil con conocimientos administrativos sólidos en gestión, liderazgo,
                        planificación estratégica y optimización de procesos organizacionales.
                    </p>
                    <p>
                        Y potencia aún más tu desarrollo aprendiendo lenguas extranjeras, clave para comunicarte con el
                        mundo, acceder a mejores oportunidades y participar activamente en entornos multiculturales.
                        Estudiar estas disciplinas no solo fortalece tu perfil profesional, sino que te convierte en un
                        talento versátil, preparado para afrontar los desafíos del presente y construir el futuro con
                        visión global. <a class="link-godcode">GodCode</a>
                    </p>
                </div>
                <div class="educativo-imagen">
                    <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/ServicioEducativo_seccion1_img1.png"
                        alt="Servicio educativo">
                </div>
            </div>
        </section>

        <!-- Seccion 2 cursos disponibles -->
        <section id="cursos-servicio-educativo">
            <h3>Esta es la variedad de estudios que manejamos en las instalaciones.</h3>

            <div class="carousel-container-servicio">
                <button class="carousel-btn-servicio prev" aria-label="Anterior">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                </button>

                <div class="carousel-track-container-servicio">
                    <div class="carousel-track-servicio" id="cursos-servicio-container">
                        <!-- Las cards se insertan desde JS -->
                    </div>
                </div>

                <button class="carousel-btn-servicio next" aria-label="Siguiente">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                    </svg>
                </button>
            </div>
        </section>

        <!-- Seccion 3 -->
        <section id="educacion-digital">
            <div class="educacion-bloque">
                <div class="educacion-texto">
                    <p>
                        No te pierdas la oportunidad de transformar tu oferta educativa con soluciones innovadoras y
                        centradas en el aprendizaje. Mejora la experiencia de estudiantes y docentes, fortalece tu
                        propuesta académica y amplía tu alcance con herramientas diseñadas para educar de forma
                        efectiva, dinámica y accesible.
                    </p>
                    <p>
                        Al aplicar metodologías pedagógicas modernas y recursos digitales estratégicos, tu servicio
                        educativo se adapta a las nuevas demandas del entorno digital y potencia el aprendizaje real.
                    </p>
                    <p>
                        Desde la planificación de contenidos hasta la evaluación del progreso, trabajamos cada etapa
                        para que tu plataforma o programa no solo transmita conocimiento, sino que también motive,
                        conecte y forme con propósito.
                    </p>
                    <p>
                        Evita barreras de acceso, mejora la participación y transforma cada sesión en una experiencia de
                        valor.
                    </p>
                    <p>
                        Nuestro equipo de expertos en educación digital te acompaña en todo el proceso: diseño
                        instruccional, creación de materiales, implementación tecnológica y mejoras continuas.
                    </p>
                    <p>
                        Desarrollamos soluciones adaptables a distintos niveles educativos, dispositivos y contextos,
                        pensadas para lograr un aprendizaje significativo y medible.
                    </p>
                    <p>
                        Haz que tu proyecto educativo evolucione con herramientas que inspiran, transforman y dejan
                        huella en cada estudiante.
                    </p>
                </div>
                <div class="educacion-imagen">
                    <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/ServicioEducativo_seccion3_img1.png"
                        alt="Educación digital">
                </div>
            </div>

            <div class="educacion-bloque reverse">
                <div class="educacion-texto">
                    <h3>Únete a alguno de nuestros cursos</h3>
                    <p>
                        ¿Apasionado por aprender y desarrollar nuevas habilidades?<br>
                        En nuestra comunidad educativa te ofrecemos formación integral en Administración, Programación y
                        Lengua, tres áreas clave para crecer personal y profesionalmente en un mundo cada vez más
                        conectado y competitivo.
                    </p>
                    <p>
                        Aquí no solo adquieres las competencias prácticas y aplicables a la vida real. Nuestros
                        programas están diseñados para que participes activamente en tu proceso de aprendizaje desde la
                        comprensión de conceptos fundamentales hasta el dominio de herramientas y técnicas actualizadas.
                    </p>
                    <p>
                        Aprender con el apoyo de docentes comprometidos, materiales dinámicos y entornos colaborativos
                        donde podrás resolver problemas, proponer ideas y crecer junto a otros estudiantes.
                    </p>
                    <p>
                        Ya sea que busques avanzar en tu carrera, iniciar un nuevo camino profesional o simplemente
                        reforzar tus conocimientos, este espacio es para ti.<br>
                        Haz que tu futuro comience hoy. Capacítate con nosotros y transforma tu potencial en
                        oportunidades reales.
                    </p>
                </div>
                <div class="educacion-imagen">
                    <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/ServicioEducativo_seccion4_img1.png"
                        alt="Cursos GodCode">
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