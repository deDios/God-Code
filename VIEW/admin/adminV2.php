<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>GodCode</title>

    <link rel="stylesheet" href="/CSS/plantilla.css" />
    <link rel="stylesheet" href="/CSS/admin/adminUATV2.css" />
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

    <main class="home-samapa admin-dashboard">
        <div class="hs-wrap">

            <!-- SIDEBAR -->
            <aside class="hs-sidebar admin-sidebar">
                <section class="admin-panel" aria-label="Panel de Administrador">
                    <div class="admin-panel__head">Panel de Administrador</div>

                    <nav class="admin-panel__menu" aria-label="Menú de administración">
                        <a href="#" class="admin-panel__item is-active" data-admin-view="noticias">
                            <span class="admin-panel__icon">🖼️</span>
                            <span class="admin-panel__text">Noticias</span>
                        </a>

                        <a href="#" class="admin-panel__item" data-admin-view="cursos">
                            <span class="admin-panel__icon">🏢</span>
                            <span class="admin-panel__text">Cursos</span>
                        </a>

                        <a href="#" class="admin-panel__item" data-admin-view="tutores">
                            <span class="admin-panel__icon">🧾</span>
                            <span class="admin-panel__text">Tutores</span>
                        </a>
                    </nav>
                </section>
            </aside>

            <!-- MAIN -->
            <section class="hs-main">
                <div id="admin-view-root"></div>
            </section>
        </div>
    </main>


    <script src="/JS/JSglobal.js"></script>

    <!-- Carga de modulos -->
    <script src="/JS/UATV2/ui/adminMedia.js"></script>
    
    <script src="/JS/UATV2/ui/adminNoticias.js"></script>
    <script src="/JS/UATV2/ui/adminCursos.js"></script>
    <script src="/JS/UATV2/ui/adminTutores.js"></script>

    <!-- Router -->
    <script src="/JS/UATV2/ui/adminRouter.js"></script>
    <script src="/JS/UATV2/admin.js"></script>

</body>

</html>