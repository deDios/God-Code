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


    <main>
        <!-- Seccion 1 -->
        <section id="dashboard-home">
            <div class="dashboard-grid">

                <!-- LADO IZQUIERDO -->
                <aside class="sidebar">
                    <div class="user-profile">
                        <div class="avatar-container">
                            <img src="../ASSETS/user-default.png" alt="Avatar" class="avatar">
                        </div>
                        <div class="user-info">
                            <h2 id="user-nombre">Luis Enrique Godcode</h2>
                            <a href="#" class="editar-perfil">Administrar perfil »</a>
                        </div>
                    </div>

                    <div class="user-bienvenida">
                        <h3>¿Qué aprendera hoy?</h3>
                        <input type="text" class="buscador" placeholder="🔍 Buscar">
                    </div>

                    <div class="box-aprendizaje">
                        <div class="tabs-aprendizaje">
                            <button class="tab active">+GodCode</button>
                            <button class="tab">Curva de aprendizaje</button>
                        </div>
                        <div class="contenedor-aprendizaje">
                            <div class="proximo-objetivo">
                                <span class="objetivo-titulo">Próximo objetivo:</span>
                                <span class="objetivo-meta">10 cursos al año</span>
                            </div>
                            <div class="aprendizaje-estadisticas">
                                <div class="donut-container">
                                    <!-- Donut o circulo de progreso -->
                                    <canvas id="donut-aprendizaje" width="56" height="56"></canvas>
                                </div>
                                <div>
                                    <div class="estadistica"><strong>7</strong><span>Cursos completos este año</span>
                                    </div>
                                    <div class="estadistica"><strong>1</strong><span>Título recibido de uno de tus
                                            cursos</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tarjetas de cursos del usuario -->
                    <div class="mis-cursos">
                        <h4>Mis cursos</h4>
                        <div class="estado-cursos">
                            <div>
                                <span class="estado-titulo">Activos</span>
                                <div class="cursos-lista" id="cursos-activos">
                                    <!-- Cards de cursos activos aquí -->
                                    <!-- Ejemplo: -->
                                    <!--
              <div class="curso-card">
                <span class="curso-nombre">Aprendizaje en Marketing</span>
                <span class="curso-fecha">Fecha inicio: 21/03/2025</span>
              </div>
              -->
                                </div>
                            </div>
                            <div>
                                <span class="estado-titulo">Pendientes</span>
                                <div class="cursos-lista" id="cursos-pendientes">
                                    <!-- Cards de cursos pendientes -->
                                </div>
                            </div>
                            <div>
                                <span class="estado-titulo">Terminados</span>
                                <div class="cursos-lista" id="cursos-terminados">
                                    <!-- Cards de cursos terminados -->
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <!-- LADO DERECHO -->
                <main class="dashboard-main">
                    <!-- Botones principales -->
                    <div class="dashboard-actions">
                        <button class="btn-action">
                            <img src="../ASSETS/icons/plus.svg" alt="Nuevo"> Nuevo recurso
                        </button>
                        <button class="btn-action">
                            <img src="../ASSETS/icons/project.svg" alt="Proyectos"> Proyectos
                        </button>
                        <button class="btn-action">
                            <img src="../ASSETS/icons/cowork.svg" alt="Coworking"> Coworking
                        </button>
                        <button class="btn-action">
                            <img src="../ASSETS/icons/cursos.svg" alt="Cursos"> Cursos
                        </button>
                        <button class="btn-action">
                            <img src="../ASSETS/icons/cotizar.svg" alt="Cotizar"> Cotizar
                        </button>
                    </div>

                    <!-- Tabla de recursos -->
                    <div class="recursos-section">
                        <h3>Recursos</h3>
                        <div class="tabla-filtros">
                            <span>Nombre <span class="flecha">&#9650;</span></span>
                            <span>Tipo</span>
                            <span>Fecha de solicitado <span class="flecha">&#9650;</span></span>
                        </div>
                        <div class="tabla-recursos" id="tabla-recursos">
                            <!-- Ejemplo de fila:
          <div class="recurso-row">
            <span><img src="../ASSETS/icons/project.svg" alt="Tipo" class="icono-tabla"> Mobility Solutions</span>
            <span>Proyecto</span>
            <span>01 de Abril del 2025</span>
          </div>
          -->
                        </div>
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


    <script src="../JS/JSglobal.js"></script>
</body>

</html>