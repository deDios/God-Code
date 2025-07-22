<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GodCode</title>
    <link rel="stylesheet" href="../CSS/DiseñoUXUI.css" />
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
        <section id="home-dashboard" class="home-dashboard">
            <div class="dashboard-grid">
                <!-- sidebar -->
                <aside class="dashboard-aside">
                    <!-- perfil -->
                    <div class="user-profile">
                        <div class="avatar">
                            <img id="user-avatar" src="../ASSETS/usuarios/avatar-default.svg" alt="Foto de usuario" />
                        </div>
                        <div class="user-info">
                            <h2 id="user-name">Nombre Apellido</h2>
                            <span id="user-role">Rol</span>
                            <a href="#" id="user-profile-link">Administrar perfil &rsaquo;</a>
                        </div>
                    </div>

                    <h3 class="section-title">¿Qué aprendera hoy?</h3>

                    <div class="buscador-box">
                        <input type="text" id="buscador-cursos" placeholder="Buscar" autocomplete="off" />
                    </div>

                    <!-- grafica -->
                    <div class="learning-summary">
                        <div class="summary-header">
                            <span class="logo">✚GodCode</span>
                            <span>Curva de aprendizaje</span>
                            <button class="expand-btn" aria-label="Expandir"><span>&rsaquo;</span></button>
                        </div>
                        <div class="summary-body">
                            <div class="objetivo-rapido">
                                <div class="donut-objetivo">
                                    <!-- Donut chart con JS/CSS -->
                                    <svg width="64" height="64">
                                        <circle r="28" cx="32" cy="32" fill="none" stroke="#dbeafe" stroke-width="8" />
                                        <circle id="objetivo-donut" r="28" cx="32" cy="32" fill="none" stroke="#1565c0"
                                            stroke-width="8" stroke-dasharray="176" stroke-dashoffset="40" />
                                    </svg>
                                    <div class="donut-label">
                                        Próximo objetivo:
                                        <br>
                                        <strong id="meta-anual">10 cursos al año</strong>
                                    </div>
                                </div>
                                <div class="quick-summary">
                                    <div>
                                        <strong id="cursos-completados">7</strong><br>
                                        Cursos completos este año
                                    </div>
                                    <div>
                                        <strong id="titulos-obtenidos">1</strong><br>
                                        Título recibido de uno de tus cursos
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- mis cursos -->
                    <div class="mis-cursos-box">
                        <h3 class="section-title">Mis cursos</h3>
                        <div class="estado-cursos">
                            <div>
                                <h4>Activos</h4>
                                <div id="cursos-activos" class="cursos-list"></div>
                            </div>
                            <div>
                                <h4>Pendientes</h4>
                                <div id="cursos-pendientes" class="cursos-list"></div>
                            </div>
                            <div>
                                <h4>Terminados</h4>
                                <div id="cursos-terminados" class="cursos-list"></div>
                            </div>
                        </div>
                    </div>
                </aside>

                <!-- contenido -->
                <main class="dashboard-main">
                    <div class="acciones-header">
                        <button class="accion-btn" id="btn-nuevo-recurso"><span>+</span><br>Nuevo recurso</button>
                        <button class="accion-btn" id="btn-proyectos"><img src="../ASSETS/home/proyectos.svg"
                                alt="">Proyectos</button>
                        <button class="accion-btn" id="btn-coworking"><img src="../ASSETS/home/coworking.svg"
                                alt="">Coworking</button>
                        <button class="accion-btn" id="btn-cursos"><img src="../ASSETS/home/cursos.svg"
                                alt="">Cursos</button>
                        <button class="accion-btn" id="btn-cotizar"><img src="../ASSETS/home/cotizar.svg"
                                alt="">Cotizar</button>
                    </div>

                    <div class="recursos-box">
                        <table class="tabla-recursos">
                            <thead>
                                <tr>
                                    <th>Nombre <span id="sort-nombre">&#9650;</span></th>
                                    <th>Tipo</th>
                                    <th>Fecha de solicitado <span id="sort-fecha">&#9650;</span></th>
                                </tr>
                            </thead>
                            <tbody id="recursos-lista">
                                <!-- JS llenará los recursos -->
                            </tbody>
                        </table>
                    </div>
                </main>
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
    <script src="../JS/JSglobal.js"></script>
</body>

</html>