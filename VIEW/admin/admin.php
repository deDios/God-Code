<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <title>GodCode</title>
    <link rel="stylesheet" href="../../CSS/plantilla.css" />
    <link rel="stylesheet" href="../../CSS/admin/admin.css" />
</head>

<body>
    <!-- Tope de pagina -->
    <header id="header">
        <!-- esta barra en el tope de pagina solo renderiza segun la resolucion de las pantallas pequeñas -->
        <div class="social-bar-mobile">
            <div class="social-icons">
                <div class="icon-mobile">
                    <img src="../../ASSETS/index/Facebook.png" alt="Facebook" />
                </div>
                <div class="icon-mobile">
                    <img src="../../ASSETS/index/Instagram.png" alt="Instagram" />
                </div>
                <div class="icon-mobile">
                    <img src="../../ASSETS/index/Tiktok.png" alt="TikTok" />
                </div>
                <!-- Icono de usuario para login en vista mobile -->
                <div class="user-icon-mobile" onclick="window.location.href='../../VIEW/Login.php'">
                    <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                        alt="Usuario" />
                </div>
            </div>
        </div>

        <div class="top-bar" id="top-bar">
            <div id="logo-btn" class="logo">
                <img src="../../ASSETS/godcode_icon.png" alt="Logo GodCode" class="logo-icon">
                GodCode
            </div>

            <!--Boton hamburguesa que aparece segun la resolucion-->
            <div class="hamburger" onclick="toggleMenu()">☰</div>

            <div class="actions">
                <button class="btn btn-outline" onclick="location.href='#'">Cotizar</button>
                <button class="btn btn-primary"
                    onclick="location.href='../../VIEW/Inscripcion.php'">Registrarse</button>
                <!-- icono de usuario para despues hacer el login -->
                <div class="user-icon" onclick="window.location.href='../../VIEW/Login.php'">
                    <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                        alt="Usuario" href="../../VIEW/Login.php" />
                </div>
            </div>
        </div>

        <!-- Barra de navegación pequeña -->
        <div id="mobile-menu" class="subnav">
            <a href="../../index.php">Inicio</a>
            <div class="nav-item has-megamenu desktop-only" id="submenu-productos">
                <a href="#" class="active">Productos</a>
                <div class="megamenu">
                    <div class="col">
                        <h4>Lo que hacemos</h4>
                        <ul>
                            <li><a href="../../VIEW/DesarrolloWeb.php"><img
                                        src="../../ASSETS/ProductosPopUp/DesarrolloWeb.png" alt="Web">Desarrollo Web</a>
                            </li>
                            <li><a href="../../VIEW/DesarrolloMobile.php"><img
                                        src="../../ASSETS/ProductosPopUp/DesarrolloMobile.png" alt="Mobile">Desarrollo
                                    Mobile</a></li>
                        </ul>
                    </div>
                    <div class="col">
                        <h4>Servicios</h4>
                        <ul>
                            <li><a href="../../VIEW/ServiciosEnLaNube.php"><img
                                        src="../../ASSETS/ProductosPopUp/ServiciosEnLaNube.png" alt="Nube">Servicios
                                    en la Nube</a></li>
                            <li><a href="../../VIEW/DisenoUXUI.php"><img
                                        src="../../ASSETS/ProductosPopUp/DiseñoUXUI.png" alt="UX/UI">Diseño UX/UI</a>
                            </li>
                            <li><a href="../../VIEW/ServicioEducativo.php"><img
                                        src="../../ASSETS/ProductosPopUp/ServicioEducativo.png">Servicio
                                    educativo</a></li>
                        </ul>
                    </div>
                    <div class="col">
                        <h4>Industrias</h4>
                        <ul>
                            <li><a href="../../VIEW/IndustriaEducacion.php"><img
                                        src="../../ASSETS/ProductosPopUp/Educacion.png" alt="Educación">Educación</a>
                            </li>
                            <li><a href="../../VIEW/IndustriaTecnologia.php"><img
                                        src="../../ASSETS/ProductosPopUp/Tecnologia.png" alt="Tecnología">Tecnología</a>
                            </li>
                            <li><a href="../../VIEW/IndustriaFinanciera.php"><img
                                        src="../../ASSETS/ProductosPopUp/Finanzas.png" alt="Finanzas">Finanzas</a>
                            </li>
                        </ul>
                    </div>
                    <div class="col tecnologias full-width">
                        <h4>Tecnologías</h4>
                        <div class="tech-icons">
                            <span><img src="../../ASSETS/ProductosPopUp/Tecnologias/Azure.png" alt="Azure"> Azure</span>
                            <span><img src="../../ASSETS/ProductosPopUp/Tecnologias/Php.png" alt="PHP"> PHP</span>
                            <span><img src="../../ASSETS/ProductosPopUp/Tecnologias/Kotlin.png" alt="Kotlin">
                                Kotlin</span>
                            <span><img src="../../ASSETS/ProductosPopUp/Tecnologias/SwiftUI.png" alt="SwiftUI">
                                SwiftUI</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="nav-item mobile-only">
                <a href="../../VIEW/ProductosMobile.php" class="btn-contacto active">Productos</a>
            </div>

            <a href="../../VIEW/Nosotros.php">Nosotros</a>
            <a href="../../VIEW/Blog.php">Blog</a>

            <div class="social-icons">
                <div class="circle-icon">
                    <img src="../../ASSETS/index/Facebook.png" alt="Facebook" />
                </div>
                <div class="circle-icon">
                    <img src="../../ASSETS/index/Instagram.png" alt="Instagram" />
                </div>
                <div class="circle-icon">
                    <img src="../../ASSETS/index/Tiktok.png" alt="TikTok" />
                </div>
            </div>
        </div>

    </header>


    <main id="home-main" class="gc-dash">

        <!-- Sidebar -->
        <nav class="gc-side" aria-label="Configuración y administración">
            <h3 class="side-title">Configuración y<br>Administración</h3>

            <div class="nav-group">
                <div class="group-label">Cursos y Noticias</div>

                <a class="nav-item" href="#/cursos" data-route="#/cursos" aria-current="page">
                    <span class="icon"><img src="icons/cursos.svg" alt="" aria-hidden="true"></span>
                    <span class="label">Cursos</span>
                </a>

                <a class="nav-item" href="#/noticias" data-route="#/noticias">
                    <span class="icon"><img src="icons/noticias.svg" alt="" aria-hidden="true"></span>
                    <span class="label">Noticias</span>
                </a>
            </div>

            <div class="nav-group">
                <div class="group-label">Contacto y reclutamiento</div>

                <a class="nav-item" href="#/contacto" data-route="#/contacto">
                    <span class="icon"><img src="icons/contacto.svg" alt="" aria-hidden="true"></span>
                    <span class="label">Contacto</span>
                </a>

                <a class="nav-item" href="#/reclutamiento" data-route="#/reclutamiento">
                    <span class="icon"><img src="icons/reclutamiento.svg" alt="" aria-hidden="true"></span>
                    <span class="label">Reclutamiento</span>
                </a>
            </div>

            <div class="nav-group">
                <div class="group-label">Usuarios y cuentas</div>

                <a class="nav-item" href="#/usuarios" data-route="#/usuarios">
                    <span class="icon"><img src="icons/usuarios.svg" alt="" aria-hidden="true"></span>
                    <span class="label">Usuarios</span>
                </a>

                <a class="nav-item" href="#/cuentas" data-route="#/cuentas">
                    <span class="icon"><img src="icons/cuentas.svg" alt="" aria-hidden="true"></span>
                    <span class="label">Cuentas</span>
                </a>
            </div>
        </nav>

        <!-- Contenido principal -->
        <section class="main-content">

            <header class="dash-toolbar">
                <div class="left">
                    <h2 id="mod-title">Cursos</h2>
                    <span id="mod-count" class="module-sub">—</span>
                </div>
                <div class="right">
                    <!-- El boton de "Modo desarrollador" se inyecta aquí con el JS -->
                    <button id="btn-refresh" class="btn blue">Refrescar</button>
                </div>
            </header>

            <!-- Tabla Desktop -->
            <section class="recursos-box desktop-only">
                <h2>Recursos</h2>
                <div class="recursos-table">
                    <div class="table-header">
                        <div class="col-nombre">Nombre</div>
                        <div class="col-tipo">Tipo</div>
                        <div class="col-fecha">Fecha</div>
                        <div class="col-fecha">Fecha</div>
                    </div>
                    <div class="table-body" id="recursos-list">
                        <!-- filas por JS -->
                    </div>
                </div>
                <div id="pagination-controls" class="pagination-controls"></div>
            </section>

            <!-- Tabla Mobile  -->
            <section class="recursos-box mobile-only">
                <h2>Recursos</h2>
                <div class="recursos-table-mobile">
                    <div class="table-header">
                        <div class="col-nombre">Nombre</div>
                    </div>
                    <div class="table-body" id="recursos-list-mobile">
                        <!-- filas por JS -->
                    </div>
                </div>
                <div id="pagination-mobile" class="pagination-controls"></div>
            </section>

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

    <!-- Drawer -->
    <aside id="gc-drawer" class="drawer gc-dash" aria-hidden="true">
        <div class="drawer-header">
            <div class="drawer-title" id="drawer-title"></div>
            <div class="drawer-actions">
                <button class="btn" id="drawer-close">Cerrar</button>
            </div>
        </div>
        <div class="drawer-body" id="drawer-body">
            <!-- Contenido dinámico -->
        </div>
    </aside>
    <div class="gc-dash-overlay" id="gc-dash-overlay"></div>

    <script src="../../JS/JSglobal.js"></script>
    <script src="../../JS/admin/admin.js"></script>

</body>

</html>