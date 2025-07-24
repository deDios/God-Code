<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GodCode</title>

    <link rel="stylesheet" href="../CSS/plantilla.css" />
    <link rel="stylesheet" href="../CSS/Hom.css" />
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
<<<<<<< HEAD

        <!-- sidebar -->
        <section id="sidebar" class="sidebar">
=======
        <!-- Sidebar Izquierdo -->
        <aside class="sidebar-godcode">
>>>>>>> 335cd26d8cb01900f45570d20e61ccc68f407a33
            <div class="user-profile">
                <div class="avatar-circle">
                    <img src="../ASSETS/usuario/usuarioImg/img_user1.png" alt="avatar" id="avatar-img" />
                </div>
                <div class="user-info">
                    <div id="user-name">Luis Enrique Godcode</div>
                    <a href="#" class="edit-profile">Administrar perfil ›</a>
                </div>
            </div>
            <h2 class="aprender-hoy-titulo">¿Qué aprendera hoy?</h2>
            <div class="input-search">
                <input type="text" id="buscar-curso" placeholder="🔍 Buscar" />
            </div>
            <div class="bloque-objetivos">
                <div class="objetivos-tabs">
                    <button class="tab active">
                        <span class="tab-icon">
                            <img src="../ASSETS/godcode_icon.png" alt="GodCode">
                        </span>
                        GodCode
                    </button>
                    <button class="tab">Curva de aprendizaje <span class="tab-arrow">›</span></button>
                </div>
                <div class="objetivos-box">
                    <div class="objetivo">
                        <span class="objetivo-label">Próximo objetivo:</span>
                        <span class="objetivo-num">10 cursos al año</span>
                    </div>
                    <div class="objetivo">
                        <div class="objetivo-circular">
                            <svg class="circular-chart" viewBox="0 0 36 36">
                                <path class="circle-bg" d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path class="circle" stroke-dasharray="70, 100" d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <span class="circle-text">7</span>
                        </div>
                        <div class="objetivo-txt">
                            <div class="objetivo-sub">Cursos completos este año</div>
                        </div>
                    </div>
                    <div class="objetivo">
                        <span class="objetivo-titulo">1</span>
                        <span class="objetivo-desc">Título recibido de uno de tus cursos</span>
                    </div>
                </div>
            </div>

            <!-- Mis cursos -->
            <div class="cursos-titulo">Mis cursos</div>

            <div class="cursos-seccion-titulo">Activos</div>
            <div class="cursos-listado">
                <div class="curso-card">
                    <strong>Aprendizaje en Marketing</strong>
                    <div class="fecha-inicio">Fecha inicio: 20/10/2025</div>
                </div>
                <div class="curso-card">
                    <strong>Gestión de Proyectos</strong>
                    <div class="fecha-inicio">Fecha inicio: 02/11/2025</div>
                </div>
            </div>

<<<<<<< HEAD
        <!-- contenido -->
        <section class="main-content">
            <nav class="main-navbar">
                <button class="nav-btn">
                    <span class="nav-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon-plus" viewBox="0 0 24 24" fill="none">
                            <path d="M12 3v18M3 12h18" stroke="currentColor" stroke-width="3" stroke-linecap="square" />
                        </svg>
                    </span>
                    Nuevo recurso
                </button>
                <button class="nav-btn"><span class="nav-icon"><img src="../ASSETS/Home/recursos/boton1.png"
                            alt=""></span>Proyectos</button>
                <button class="nav-btn"><span class="nav-icon"><img src="../ASSETS/Home/recursos/boton2.png"
                            alt=""></span>Coworking</button>
                <button class="nav-btn"><span class="nav-icon"><img src="../ASSETS/Home/recursos/boton3.png"
                            alt=""></span>Cursos</button>
                <button class="nav-btn"><span class="nav-icon"><img src="../ASSETS/Home/recursos/boton4.png"
                            alt=""></span>Cotizar</button>
=======
            <div class="cursos-seccion-titulo">Pendientes</div>
            <div class="cursos-listado">
                <div class="curso-card">
                    <strong>Lenguas extranjeras (Inglés)</strong>
                    <div class="fecha-inicio">Fecha inicio: 22/11/2025</div>
                </div>
                <div class="curso-card">
                    <strong>Lenguas extranjeras (Francés)</strong>
                    <div class="fecha-inicio">Fecha inicio: 01/12/2025</div>
                </div>
                <div class="curso-card">
                    <strong>Finanzas Personales</strong>
                    <div class="fecha-inicio">Fecha inicio: 09/12/2025</div>
                </div>
                <div class="curso-card">
                    <strong>Desarrollo Personal</strong>
                    <div class="fecha-inicio">Fecha inicio: 14/12/2025</div>
                </div>
            </div>

            <div class="cursos-seccion-titulo">Terminados</div>
            <div class="cursos-listado">
                <div class="curso-card">
                    <strong>Desarrollo Web con Javascript</strong>
                    <div class="fecha-inicio">Fecha inicio: 02/01/2025</div>
                </div>
                <div class="curso-card">
                    <strong>Machine Learning con Python</strong>
                    <div class="fecha-inicio">Fecha inicio: 02/01/2025</div>
                </div>
                <div class="curso-card">
                    <strong>Introducción a Python</strong>
                    <div class="fecha-inicio">Fecha inicio: 19/03/2025</div>
                </div>
                <div class="curso-card">
                    <strong>Fundamentos de Bases de Datos</strong>
                    <div class="fecha-inicio">Fecha inicio: 02/01/2025</div>
                </div>
                <div class="curso-card">
                    <strong>Desarrollo de Apps Móviles con Flutter</strong>
                    <div class="fecha-inicio">Fecha inicio: 02/01/2025</div>
                </div>
                <div class="curso-card">
                    <strong>Curso Administrativo</strong>
                    <div class="fecha-inicio">Fecha inicio: 02/01/2025</div>
                </div>
            </div>
        </aside>

        <!-- Contenido principal -->
        <section class="contenido">

            <!-- Botones de navegación -->
            <nav class="botones">
                <button class="nav-btn active">
                    <span class="nav-icon"><img src="../ASSETS/navbar/plus.png" alt="Nuevo recurso"></span>
                    <span>Nuevo<br>recurso</span>
                </button>
                <button class="nav-btn">
                    <span class="nav-icon"><img src="../ASSETS/navbar/proyectos.png" alt="Proyectos"></span>
                    <span>Proyectos</span>
                </button>
                <button class="nav-btn">
                    <span class="nav-icon"><img src="../ASSETS/navbar/coworking.png" alt="Coworking"></span>
                    <span>Coworking</span>
                </button>
                <button class="nav-btn">
                    <span class="nav-icon"><img src="../ASSETS/navbar/cursos.png" alt="Cursos"></span>
                    <span>Cursos</span>
                </button>
                <button class="nav-btn">
                    <span class="nav-icon"><img src="../ASSETS/navbar/cotizar.png" alt="Cotizar"></span>
                    <span>Cotizar</span>
                </button>
>>>>>>> 335cd26d8cb01900f45570d20e61ccc68f407a33
            </nav>

            <!-- Título y tabla de recursos -->
            <div class="recursos-box">
                <h2 style="margin-top: 20px; font-size: 1.35rem; font-weight: 600;">Recursos</h2>
                <div class="recursos-table">
                    <div class="table-header">
                        <div class="col-nombre">Nombre <span class="flecha">&#8593;</span></div>
                        <div class="col-tipo">Tipo</div>
                        <div class="col-fecha">Fecha de solicitado <span class="flecha">&#8593;</span></div>
                    </div>
                    <div class="table-body" id="recursos-list">
                        <div class="table-row">
                            <div class="col-nombre">
                                <img src="../ASSETS/resource-icons/proyecto.png" class="icon-recurso" alt="icono">
                                <a href="#" class="recurso-link">Mobility Solutions</a>
                            </div>
                            <div class="col-tipo">Proyecto</div>
                            <div class="col-fecha">01 de Abril del 2025</div>
                        </div>
                        <div class="table-row">
                            <div class="col-nombre">
                                <img src="../ASSETS/resource-icons/coworking.png" class="icon-recurso" alt="icono">
                                <a href="#" class="recurso-link">WorkLabs</a>
                            </div>
                            <div class="col-tipo">Coworking</div>
                            <div class="col-fecha">15 de Junio del 2025</div>
                        </div>
                        <div class="table-row">
                            <div class="col-nombre">
                                <img src="../ASSETS/resource-icons/cursos.png" class="icon-recurso" alt="icono">
                                <a href="#" class="recurso-link">Introducción a Python</a>
                            </div>
                            <div class="col-tipo">Cursos</div>
                            <div class="col-fecha">31 de agosto del 2025</div>
                        </div>
                        <div class="table-row">
                            <div class="col-nombre">
                                <img src="../ASSETS/resource-icons/proyecto.png" class="icon-recurso" alt="icono">
                                <a href="#" class="recurso-link">Find the color App</a>
                            </div>
                            <div class="col-tipo">Proyecto</div>
                            <div class="col-fecha">10 de Septiembre del 2025</div>
                        </div>
                        <div class="table-row">
                            <div class="col-nombre">
                                <img src="../ASSETS/resource-icons/proyecto.png" class="icon-recurso" alt="icono">
                                <a href="#" class="recurso-link">GodCoode Page</a>
                            </div>
                            <div class="col-tipo">Proyecto</div>
                            <div class="col-fecha">12 de Agosto del 2025</div>
                        </div>
                        <div class="table-row">
                            <div class="col-nombre">
                                <img src="../ASSETS/resource-icons/cursos.png" class="icon-recurso" alt="icono">
                                <a href="#" class="recurso-link">Desarrollo Web con JavaScript</a>
                            </div>
                            <div class="col-tipo">Cursos</div>
                            <div class="col-fecha">02 de Enero del 2025</div>
                        </div>
                        <div class="table-row">
                            <div class="col-nombre">
                                <img src="../ASSETS/resource-icons/cursos.png" class="icon-recurso" alt="icono">
                                <a href="#" class="recurso-link">Fundamentos de Bases de Datos</a>
                            </div>
                            <div class="col-tipo">Cursos</div>
                            <div class="col-fecha">30 de Marzo del 2025</div>
                        </div>
                        <div class="table-row">
                            <div class="col-nombre">
                                <img src="../ASSETS/resource-icons/cursos.png" class="icon-recurso" alt="icono">
                                <a href="#" class="recurso-link">Machine Learning con Python</a>
                            </div>
                            <div class="col-tipo">Cursos</div>
                            <div class="col-fecha">01 de Febrero del 2025</div>
                        </div>
                        <div class="table-row">
                            <div class="col-nombre">
                                <img src="../ASSETS/resource-icons/cursos.png" class="icon-recurso" alt="icono">
                                <a href="#" class="recurso-link">Desarrollo de Apps Móviles con Flutter</a>
                            </div>
                            <div class="col-tipo">Cursos</div>
                            <div class="col-fecha">01 de Julio del 2025</div>
                        </div>
                        <div class="table-row">
                            <div class="col-nombre">
                                <img src="../ASSETS/resource-icons/cursos.png" class="icon-recurso" alt="icono">
                                <a href="#" class="recurso-link">Curso Administrativo</a>
                            </div>
                            <div class="col-tipo">Cursos</div>
                            <div class="col-fecha">12 de Abril del 2025</div>
                        </div>
                        <div class="table-row">
                            <div class="col-nombre">
                                <img src="../ASSETS/resource-icons/cursos.png" class="icon-recurso" alt="icono">
                                <a href="#" class="recurso-link">Curso Financiero</a>
                            </div>
                            <div class="col-tipo">Cursos</div>
                            <div class="col-fecha">08 de Octubre del 2025</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>



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