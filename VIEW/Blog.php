<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GodCode</title>
    <link rel="stylesheet" href="../CSS/plantilla.css" />
    <link rel="stylesheet" href="../CSS/Blog.css">
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

            <a href="../VIEW/Nosotros.php">Nosotros</a>
            <a href="../VIEW/Blog.php" class="active">Blog</a>

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
        <section id="blog-godcode" class="animado">
            <div class="limite">
                <h2>Blog GodCode</h2>
                <h3>Lo Nuevo</h3>
                <p class="descripcion">
                    Explora el futuro hoy<br>
                    Descubre las últimas noticias en tecnología, innovación y avances que están transformando el
                    mundo.<br>
                    Mantente al día con lo más relevante, todo en un solo lugar.
                </p>
                <div class="grid-cards">
                    <div class="card" data-id="meta">
                        <img src="../ASSETS/Blog/blog_img1.png" alt="Meta AI">
                        <div class="contenido">
                            <p>Meta recluta una “superinteligencia”: Zuckerberg al frente...</p>
                            <button onclick="abrirNoticia(event, this)">Leer más...</button>
                        </div>
                    </div>

                    <div class="card" data-id="apple">
                        <img src="../ASSETS/Blog/blog_img2.png" alt="Apple Liquid Glass">
                        <div class="contenido">
                            <p>Apple presenta “Liquid Glass” y rediseña todos sus sistemas...</p>
                            <button onclick="abrirNoticia(event, this)">Leer más...</button>
                        </div>
                    </div>

                    <div class="card" data-id="nato">
                        <img src="../ASSETS/Blog/blog_img3.png" alt="NATO ciencia">
                        <div class="contenido">
                            <p>NATO lanza nueva estrategia para investigación científica...</p>
                            <button onclick="abrirNoticia(event, this)">Leer más...</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- seccion 2 -->
        <section id="filtros-cursos">
            <div class="limite">
                <div class="filtros-cursos__contenido">
                    <h2>Cursos destacados</h2>
                    <h3>Explora nuestras mejores opciones</h3>
                    <p class="descripcion">
                        Accede a nuestros cursos más buscados y con mayor impacto. Aprende a tu ritmo, con contenido
                        actualizado y práctico.
                    </p>
                </div>

                <div class="contenedor-filtros">

                    <div class="filtro">
                        <label for="categoria">Categoría</label>
                        <select id="categoria" name="categoria">
                            <option value="">Selecciona una categoría</option>
                            <!-- Se llenara con JS -->
                        </select>
                    </div>

                    <div class="filtro">
                        <label for="explorar">Explorar</label>
                        <select id="explorar" name="explorar">
                            <option value="">Selecciona una opción</option>
                        </select>
                    </div>

                    <div class="filtro limpiar">
                        <label>&nbsp;</label>
                        <button id="limpiar-filtros" class="btn-limpiar">Limpiar filtros</button>
                    </div>
                </div>
            </div>
        </section>

        <!-- seccion 3 -->
        <section id="cursos-destacados">
            <h3>Cursos disponibles</h3>

            <div class="carousel-container" id="carousel-container">
                <button class="carousel-btn prev" aria-label="Anterior">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                </button>

                <div class="carousel-track-container">
                    <div class="carousel-track grid-cards-cursos" id="cursos-container">
                        <!-- Las cards se insertan desde JS -->
                    </div>
                </div>

                <button class="carousel-btn next" aria-label="Siguiente">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                    </svg>
                </button>
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