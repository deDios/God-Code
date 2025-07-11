<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GodCode</title>
    <link rel="stylesheet" href="../CSS/plantilla.css" />
    <link rel="stylesheet" href="../CSS/noticia.css" />
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
                <a href="../VIEW/ProductosMobile.php" class="btn-contacto">Productos</a>
            </div>

            <a href="../VIEW/Nosotros.php" class="active">Nosotros</a>
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
        <!--------- seccion 1 ----------->
        <section id="noticia-detalle" class="noticia-detalle">
            <div class="imagen-noticia full">
                <img src="../ASSETS/noticia/noticia_img1_1.png" alt="Imagen de noticia">
                <div class="overlay-titulo" id="titulo-noticia"></div>
            </div>
            <div class="limite">
                <div class="contenido-noticia">
                    <p>
                        <!-- ya se inserta desde el js -->
                    </p>
                </div>
            </div>
        </section>

        <!-- seccion 2 -->
        <section id="noticia-bloque2" class="noticia-bloque">
            <div class="limite">
                <div class="imagen-noticia">
                    <img src="../ASSETS/noticia/noticia_img1_2.png" alt="Imagen noticia2">
                </div>
                <div class="contenido-noticia">
                    <p>
                        Aunque la energía nuclear es vista como una solución viable para la demanda energética de los
                        centros de datos, no está exenta de complicaciones. Los problemas geopolíticos relacionados con
                        el suministro de combustible nuclear y los riesgos medioambientales vinculados al manejo de
                        residuos radiactivos son algunas de las preocupaciones que acompañan su uso. Sin embargo,
                        Zuckerberg sigue confiando en el potencial de la energía nuclear. De hecho, se informó que
                        durante una reunión interna, el CEO de Meta destacó que, de haber seguido adelante con el
                        proyecto, la empresa habría sido pionera en el uso de energía nuclear para los centros de datos
                        dedicados a la inteligencia artificial.
                        Es importante señalar que, desde 2020, Meta ha alcanzado la meta de emisiones “netas cero” en
                        sus operaciones, un logro notable en el sector tecnológico. Por el momento, no está claro si
                        Meta retomará el proyecto en su ubicación original o si buscará nuevos terrenos para llevarlo a
                        cabo.
                    </p>
                </div>
            </div>
        </section>

        <!-- seccion 3 -->
        <section id="noticia-comentarios" class="noticia-comentarios">
            <div class="limite">
                <div class="comentarios-box">
                    <h3>Comentarios:</h3>
                    <div class="nuevo-comentario">
                        <div class="nuevo-comentario-wrapper">
                            <img src="../ASSETS/noticia/usuario_icon_1.png" alt="Tu avatar">
                            <textarea placeholder="Añade un comentario..."></textarea>
                        </div>
                    </div>

                    <div class="lista-comentarios" id="lista-comentarios">


                        <div class="comentario">
                            <div class="comentario-usuario">
                                <img src="../ASSETS/noticia/usuario_icon_1.png" alt="Avatar usuario">
                            </div>

                            <div class="comentario-contenido">
                                <div class="comentario-meta">
                                    <strong>Juan Pablo</strong>
                                    <span>Hace 10 horas</span>
                                </div>

                                <p class="comentario-texto">
                                    Me parece impresionante lo rápido que avanza todo esto. Espero que se use para el
                                    bien y se controle de forma ética.
                                </p>

                                <div class="comentario-interacciones">
                                    <div class="reaccion">
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="#1a73e8">
                                            <path
                                                d="M1 21h4V9H1v12zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32
                             c0-.41-.17-.79-.44-1.06L14.17 2 7.59 8.59C7.22 8.95 7 9.45 7 10v9c0
                             1.1.9 2 2 2h9c.78 0 1.48-.45 1.83-1.14l3.02-7.05c.1-.23.15-.47.15-.72v-1.09l-.01-.01L23 10z" />
                                        </svg>
                                        <span class="cantidad">100</span>
                                    </div>

                                    <div class="reaccion">
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="#e53935">
                                            <path
                                                d="M15 3H6c-.78 0-1.48.45-1.83 1.14L1.15 11.2c-.1.23-.15.47-.15.72v1.09l.01.01c0
                             1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06l1.12 1.12 6.59-6.59c.37-.36.59-.86.59-1.41V5c0-1.1-.9-2-2-2z" />
                                        </svg>
                                        <span class="cantidad">2</span>
                                    </div>

                                    <a href="#" class="accion">Responder</a>
                                </div>

                                <div class="comentario-respuestas">
                                    <a href="#" class="ver-respuestas">
                                        <svg class="flecha" viewBox="0 0 24 24" width="16" height="16" fill="#1a73e8">
                                            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
                                        </svg>
                                        Ver 14 respuestas
                                    </a>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>

                <div class="navegacion-noticias">
                    <button id="btn-anterior" class="btn-navegacion">
                        <strong>Anterior</strong>
                        <span id="titulo-anterior">Título de noticia anterior</span>
                    </button>

                    <button id="btn-siguiente" class="btn-navegacion">
                        <strong>Siguiente</strong>
                        <span id="titulo-siguiente">Título de noticia que sigue</span>
                    </button>
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

    <script src="../JS/JSglobal.js"></script>
    <script src="../JS/noticia.js"></script>
</body>

</html>