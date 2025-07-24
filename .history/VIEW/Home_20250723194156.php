<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GodCode</title>
    <link rel="stylesheet" href="../CSS/Hom.css" />
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


    <main id="home-main">

        <!-- sidebar -->
        <section id="sidebar" class="sidebar">
            <div class="user-profile">
                <div class="avatar-circle">
                    <img src="../ASSETS/usuario/usuarioImg/img_user1.png" alt="avatar" id="avatar-img" />
                </div>
                <div class="user-info">
                    <div id="user-name">Luis Enrique Godcode</div>
                    <a href="#" class="edit-profile">Administrar perfil ›</a>
                </div>
            </div>

            <div class="aprender-hoy">
                <h2>¿Qué aprendera hoy?</h2>
                <div class="input-search">
                    <input type="text" id="buscar-curso" placeholder="Buscar" />
                    <span class="icon-search"></span>
                </div>
            </div>

            <div class="bloque-objetivos">
                <div class="tabs">
                    <button class="tab active" id="tab-godcode">{+}GodCode</button>
                    <button class="tab" id="tab-curva">Curva de aprendizaje <span class="arrow">&#9662;</span></button>
                </div>
                <div class="objetivos-content">
                    <div class="objetivo">
                        <span class="objetivo-label">Próximo objetivo:</span>
                        <span class="objetivo-num">10 cursos al año</span>
                    </div>
                    <div class="cursos-completados">
                        <div class="circular-chart">
                            <svg viewBox="0 0 36 36">
                                <path class="circle-bg" d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path class="circle" stroke-dasharray="70, 100" d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <span class="circle-text">7</span>
                        </div>
                        <div>
                            <div class="cursos-label">Cursos completos <br> este año</div>
                        </div>
                    </div>
                    <div class="titulo-recibido">
                        <span>1 Título recibido de uno de tus cursos</span>
                    </div>
                </div>
            </div>

            <div class="mis-cursos">
                <h3>Mis cursos</h3>
                <div class="cursos-seccion">
                    <div class="cursos-list">
                        <div class="cursos-subtitulo">Activos</div>
                        <div id="cursos-activos"></div>
                    </div>
                    <div class="cursos-list">
                        <div class="cursos-subtitulo">Pendientes</div>
                        <div id="cursos-pendientes"></div>
                    </div>
                    <div class="cursos-list">
                        <div class="cursos-subtitulo">Terminados</div>
                        <div id="cursos-terminados"></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- contenido -->
        <section class="main-content">
            <nav class="main-navbar">
                <button class="nav-btn"><span class="nav-icon-recurso"><img src="../ASSETS/Home/recursos/+.png"
                            alt=""></span>Nuevo recurso</button>
                <button class="nav-btn"><span class="nav-icon"><img src="../ASSETS/Home/recursos/boton1.png"
                            alt=""></span>Proyectos</button>
                <button class="nav-btn"><span class="nav-icon"><img src="../ASSETS/Home/recursos/boton2.png"
                            alt=""></span>Coworking</button>
                <button class="nav-btn"><span class="nav-icon"><img src="../ASSETS/Home/recursos/boton3.png"
                            alt=""></span>Cursos</button>
                <button class="nav-btn"><span class="nav-icon"><img src="../ASSETS/Home/recursos/boton4.png"
                            alt=""></span>Cotizar</button>
            </nav>

            <section class="recursos-box">
                <h2>Recursos</h2>
                <div class="recursos-table">
                    <div class="table-header">
                        <div class="col-nombre">Nombre <span class="flecha">&#8593;</span></div>
                        <div class="col-tipo">Tipo</div>
                        <div class="col-fecha">Fecha de solicitado <span class="flecha">&#8593;</span></div>
                    </div>
                    <div class="table-body" id="recursos-list">
                        <!-- se van a insertar las cards, todavia falta hacerlas -->
                    </div>
                </div>
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


    <script src="../JS/JSglobal.js"></script>
</body>

</html>