<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>GodCode</title>

    <link rel="stylesheet" href="/CSS/plantilla.css" />
    <link rel="stylesheet" href="/CSS/cursos.css" />
</head>

<body>
    <!-- Header global -->
    <header id="header">
        <!-- Barra mobile -->
        <div class="social-bar-mobile">
            <div class="social-icons">
                <div class="icon-mobile">
                    <img src="/ASSETS/index/Facebook.png" alt="Facebook" />
                </div>
                <div class="icon-mobile">
                    <img src="/ASSETS/index/Instagram.png" alt="Instagram" />
                </div>
                <div class="icon-mobile">
                    <img src="/ASSETS/index/Tiktok.png" alt="TikTok" />
                </div>

                <div class="user-icon-mobile" onclick="window.location.href='/VIEW/Login.php'">
                    <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                        alt="Usuario" />
                </div>
            </div>
        </div>

        <!-- Top bar -->
        <div class="top-bar" id="top-bar">
            <div id="logo-btn" class="logo">
                <img src="/ASSETS/godcode_icon.png" alt="Logo GodCode" class="logo-icon">
                GodCode
            </div>

            <div class="hamburger" onclick="toggleMenu()">☰</div>

            <div class="actions">
                <button class="btn btn-outline" onclick="location.href='#'">Cotizar</button>
                <button class="btn btn-primary" onclick="location.href='/VIEW/Inscripcion.php'">Registrarse</button>

                <div class="user-icon" onclick="window.location.href='/VIEW/Login.php'">
                    <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                        alt="Usuario" />
                </div>
            </div>
        </div>

        <!-- Subnav -->
        <div id="mobile-menu" class="subnav">
            <a href="/index.php">Inicio</a>

            <div class="nav-item has-megamenu desktop-only" id="submenu-productos">
                <a href="#">Productos</a>

                <div class="megamenu">
                    <div class="col">
                        <h4>Lo que hacemos</h4>
                        <ul>
                            <li>
                                <a href="/VIEW/DesarrolloWeb.php">
                                    <img src="/ASSETS/ProductosPopUp/DesarrolloWeb.png" alt="Web">
                                    Desarrollo Web
                                </a>
                            </li>
                            <li>
                                <a href="/VIEW/DesarrolloMobile.php">
                                    <img src="/ASSETS/ProductosPopUp/DesarrolloMobile.png" alt="Mobile">
                                    Desarrollo Mobile
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div class="col">
                        <h4>Servicios</h4>
                        <ul>
                            <li>
                                <a href="/VIEW/ServiciosEnLaNube.php">
                                    <img src="/ASSETS/ProductosPopUp/ServiciosEnLaNube.png" alt="Nube">
                                    Servicios en la Nube
                                </a>
                            </li>
                            <li>
                                <a href="/VIEW/DisenoUXUI.php">
                                    <img src="/ASSETS/ProductosPopUp/DiseñoUXUI.png" alt="UX/UI">
                                    Diseño UX/UI
                                </a>
                            </li>
                            <li>
                                <a href="/VIEW/ServicioEducativo.php">
                                    <img src="/ASSETS/ProductosPopUp/ServicioEducativo.png" alt="Servicio educativo">
                                    Servicio educativo
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div class="col">
                        <h4>Industrias</h4>
                        <ul>
                            <li>
                                <a href="/VIEW/IndustriaEducacion.php">
                                    <img src="/ASSETS/ProductosPopUp/Educacion.png" alt="Educación">
                                    Educación
                                </a>
                            </li>
                            <li>
                                <a href="/VIEW/IndustriaTecnologia.php">
                                    <img src="/ASSETS/ProductosPopUp/Tecnologia.png" alt="Tecnología">
                                    Tecnología
                                </a>
                            </li>
                            <li>
                                <a href="/VIEW/IndustriaFinanciera.php">
                                    <img src="/ASSETS/ProductosPopUp/Finanzas.png" alt="Finanzas">
                                    Finanzas
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div class="col tecnologias full-width">
                        <h4>Tecnologías</h4>
                        <div class="tech-icons">
                            <span><img src="/ASSETS/ProductosPopUp/Tecnologias/Azure.png" alt="Azure"> Azure</span>
                            <span><img src="/ASSETS/ProductosPopUp/Tecnologias/Php.png" alt="PHP"> PHP</span>
                            <span><img src="/ASSETS/ProductosPopUp/Tecnologias/Kotlin.png" alt="Kotlin"> Kotlin</span>
                            <span><img src="/ASSETS/ProductosPopUp/Tecnologias/SwiftUI.png" alt="SwiftUI">
                                SwiftUI</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="nav-item mobile-only">
                <a href="/VIEW/ProductosMobile.php" class="btn-contacto active">Productos</a>
            </div>

            <a href="/VIEW/Nosotros.php">Nosotros</a>
            <a href="/VIEW/Blog.php">Blog</a>

            <div class="social-icons">
                <div class="circle-icon">
                    <img src="/ASSETS/index/Facebook.png" alt="Facebook" />
                </div>
                <div class="circle-icon">
                    <img src="/ASSETS/index/Instagram.png" alt="Instagram" />
                </div>
                <div class="circle-icon">
                    <img src="/ASSETS/index/Tiktok.png" alt="TikTok" />
                </div>
            </div>
        </div>
    </header>

    <main class="cursos-main">

        <!-- secction 1 - carrusel y busqueda de cursos -->
        <section id="cursos-view" class="cursos-view">
            <div class="cursos-view__limite">

                <div class="cursos-view__header">
                    <h1>Cursos destacados</h1>
                    <h2>Explora nuestras mejores opciones</h2>
                    <p>
                        Accede a nuestros cursos más buscados y con mayor impacto. Aprende a tu ritmo,
                        con contenido actualizado y práctico.
                    </p>
                </div>

                <div class="cursos-view__filtros">
                    <div class="cursos-view__busqueda">
                        <div class="cursos-view__searchbox">
                            <span class="cursos-view__search-icon">⌕</span>
                            <input type="search" id="buscar-curso" placeholder="Buscar curso..." autocomplete="off" />
                        </div>

                        <button type="button" id="btn-buscar-curso" class="cursos-view__btn-primary">
                            Buscar
                        </button>
                    </div>

                    <div class="cursos-view__selects">
                        <div class="cursos-view__campo">
                            <label for="categoria">Categoria de cursos</label>
                            <select id="categoria" name="categoria">
                                <option value="">Selecciona una categoría</option>
                            </select>
                        </div>

                        <div class="cursos-view__campo">
                            <label for="explorar">Explorar</label>
                            <select id="explorar" name="explorar">
                                <option value="">Selecciona un Opción</option>
                            </select>
                        </div>

                        <div class="cursos-view__limpiar">
                            <button type="button" id="limpiar-filtros" class="cursos-view__btn-outline">
                                Limpiar filtros
                            </button>
                        </div>
                    </div>
                </div>

                <div class="cursos-view__subheader">
                    <h3>Cursos disponibles</h3>
                    <button type="button" id="ver-todos-cursos" class="cursos-view__ver-todos">
                        Ver todos los cursos
                    </button>
                </div>

                <div class="cursos-view__carousel" id="carousel-container">
                    <button class="carousel-btn prev" aria-label="Anterior">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                        </svg>
                    </button>

                    <div class="carousel-track-container">
                        <div class="carousel-track" id="cursos-container">
                            <!-- Cards insertadas desde JS -->
                        </div>
                    </div>

                    <button class="carousel-btn next" aria-label="Siguiente">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                        </svg>
                    </button>
                </div>

            </div>
        </section>

        <!-- section 2 - cursos finalizados -->
        <section id="cursos-finalizados" class="cursos-finalizados">
            <h2>Cursos finalizados</h2>

            <div class="cursos-finalizados__carrusel" id="cursos-finalizados-carrusel">
                <!-- Slides insertados desde JS -->
            </div>

            <div class="cursos-finalizados__controles">
                <button class="cursos-finalizados__btn prev" type="button" aria-label="Curso anterior">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                </button>

                <span id="cursos-finalizados-indicador">1 / 1</span>

                <button class="cursos-finalizados__btn next" type="button" aria-label="Curso siguiente">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                    </svg>
                </button>
            </div>
        </section>

    </main>


    <script src="/JS/JSglobal.js"></script>

    <!-- Carga de modulos -->
    <script src="/JS/cursos.js"></script>

</body>

</html>