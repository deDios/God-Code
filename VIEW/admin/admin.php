<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GodCode</title>
    <link rel="stylesheet" href="../../CSS/plantilla.css" />
    <link rel="stylesheet" href="../../CSS/admin/admin.css" />
</head>

<body>
    <!-- Tope de pagina -->
    <header id="header">
        <!-- esta barra en el tope de pagina solo renderiza segun la resolucion de las pantallas pequeñas -->
        <!-- Barra social móvil (solo visible en pantallas pequeñas) -->
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

        <!-- Header / título del módulo -->
        <div class="module-header">
            <div class="module-title" id="mod-title">
                Cursos
            </div>
            <div class="toolbar">
                <div class="search">
                    <input type="search" id="search-input" placeholder="Buscar...">
                </div>
                <button class="btn btn-primary" id="btn-nuevo">Nuevo</button>
            </div>
        </div>

        <!-- Sidebar -->
        <section id="sidebar" class="sidebar">
            <div class="mis-cursos">
                <h3>Menú</h3>
                <div class="cursos-seccion">
                    <div class="cursos-list">
                        <div class="cursos-subtitulo">Cursos y noticias</div>
                        <div id="cursos-subscritos"></div>
                    </div>
                    <div class="cursos-list">
                        <div class="cursos-subtitulo">Contactos y reclutamiento</div>
                        <div id="cursos-activos"></div>
                    </div>
                    <div class="cursos-list">
                        <div class="cursos-subtitulo">Administrar usuarios</div>
                        <div id="cursos-cancelados"></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Contenido principal -->
        <section class="main-content">

            <!-- Tabla de recursos Desktop -->
            <section class="recursos-box desktop-only">
                <h2>Recursos</h2>
                <div class="recursos-table">
                    <div class="table-header">
                        <div class="col-nombre">Nombre</div>
                        <div class="col-tipo">Tipo</div>
                        <div class="col-fecha">Fecha</div>
                    </div>
                    <div class="table-body" id="recursos-list">
                        <!-- Filas generadas por JS -->
                    </div>
                </div>
                <!-- Paginación -->
                <div id="pagination-controls" class="pagination-controls"></div>
            </section>

            <!-- Tabla de recursos Mobile -->
            <section class="recursos-box mobile-only">
                <h2>Recursos</h2>
                <div class="recursos-table-mobile">
                    <div class="table-header">
                        <div class="col-nombre">Nombre</div>
                    </div>
                    <div class="table-body" id="recursos-list-mobile">
                        <!-- Filas generadas por JS -->
                    </div>
                </div>
                <!-- Paginación -->
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