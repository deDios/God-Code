<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GodCode</title>
    <link rel="stylesheet" href="../CSS/index.css" />
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
            <div class="nav-item has-megamenu" id="submenu-productos">
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
                                        src="../ASSETS/ProductosPopUp/ServiciosEnLaNube.png" alt="Nube">Servicios en la
                                    Nube</a></li>
                            <li><a href="../VIEW/DisenoUXUI.php"><img src="../ASSETS/ProductosPopUp/DiseñoUXUI.png" alt="UX/UI">Diseño
                                    UX/UI</a></li>
                            <li><a href="#"><img src="../ASSETS/ProductosPopUp/ServicioEducativo.png">Servicio
                                    educativo</a></li>
                        </ul>
                    </div>
                    <div class="col">
                        <h4>Industrias</h4>
                        <ul>
                            <li><a href="#"><img src="../ASSETS/ProductosPopUp/Educacion.png"
                                        alt="Educación">Educación</a></li>
                            <li><a href="#"><img src="../ASSETS/ProductosPopUp/Tecnologia.png"
                                        alt="Tecnología">Tecnología</a></li>
                            <li><a href="#"><img src="../ASSETS/ProductosPopUp/Finanzas.png" alt="Finanzas">Finanzas</a>
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

        <section class="nosotros">
            <h2 class="nosotros-titulo">En <span>GOD CODE</span> desarrollamos proyectos web para tu negocio</h2>

            <!-- Acerca de nosotros -->
            <div class="bloque-nosotros fila normal animado">
                <div class="decoracion"></div>
                <img src="../ASSETS/Nosotros/seccion1_img1.png" alt="Acerca de nosotros" class="imagen-nosotros">
                <div class="texto-nosotros">
                    <h3>Acerca de nosotros.</h3>
                    <p>En GodCode creamos soluciones tecnológicas personalizadas que se
                        adaptan a las necesidades de cada empresa. Desarrollamos plataformas
                        web, apps móviles, sistemas inteligentes y procesos conectados que
                        ayudan a nuestros clientes a alcanzar sus objetivos y crecer de forma
                        sostenible.</p>
                </div>
            </div>

            <!-- Nuestra misión -->
            <div class="bloque-nosotros fila invertida animado">
                <div class="decoracion"></div>
                <img src="../ASSETS/Nosotros/seccion1_img2.png" alt="Nuestra misión" class="imagen-nosotros">
                <div class="texto-nosotros">
                    <h3>Nuestra misión.</h3>
                    <p>Convertirnos en un referente del desarrollo tecnológico a nivel
                        global, creando experiencias digitales innovadoras, integradas
                        y accesibles, que transformen la manera en que las empresas
                        se conectan con su audiencia, sin importar el canal o el
                        dispositivo.</p>
                </div>

            </div>

            <!-- Nuestra historia -->
            <div class="bloque-nosotros fila normal animado">
                <div class="decoracion"></div>
                <img src="../ASSETS/Nosotros/seccion1_img3.png" alt="Nuestra historia" class="imagen-nosotros">
                <div class="texto-nosotros">
                    <h3>Nuestra historia.</h3>
                    <p>GodCode nació como una solución interna para Luna Café, un
                        emprendimiento que necesitaba digitalizar sus procesos y conectar
                        mejor con sus clientes. El éxito de esa primera experiencia nos mostró
                        que muchas otras empresas enfrentaban los mismos desafíos.
                        Así comenzó nuestro camino: ayudando a negocios reales a lograr su
                        transformación digital.</p>
                </div>
            </div>

        </section>

        <section class="testimonios">
            <h2>La imagen del éxito</h2>
            <div class="carrusel">
                <div class="slide activo">
                    <div class="texto">
                        <p>“Aún sigo invirtiendo en mi Perfil de Google y me ha funcionado bien en lo que cabe de esta
                            pandemia.”</p>
                        <span>Cerrautho - Medellín de Bravo, México</span>
                    </div>
                    <div class="imagen">
                        <img src="https://www.gstatic.com/marketing-cms/assets/images/ads/68/fa/ffd1460f46bc84a5b9e1b54d9fe2/overview1.png=s538-fcrop64=1,00000000ffffffff-rw"
                            alt="Cliente 1">
                    </div>
                </div>

                <div class="slide">
                    <div class="texto">
                        <p>“Gracias a nuestra visibilidad en línea, hemos recibido muchos más clientes que antes.”</p>
                        <span>Tienda XYZ - Veracruz, México</span>
                    </div>
                    <div class="imagen">
                        <img src="https://www.gstatic.com/marketing-cms/assets/images/ads/20/ba/763dc59e453e8cbf4956919888d1/overview2.png=s538-fcrop64=1,00000000ffffffff-rw"
                            alt="Cliente 2">
                    </div>
                </div>

                <div class="slide">
                    <div class="texto">
                        <p>“Invertir en Google Perfil ha sido una de las mejores decisiones para crecer mi negocio.”</p>
                        <span>Ferretería Delta - Córdoba, México</span>
                    </div>
                    <div class="imagen">
                        <img src="https://www.gstatic.com/marketing-cms/assets/images/ads/df/d3/dba78fab4937a64e9c550c7640e7/overview3.png=s538-fcrop64=1,00000000ffffffff-rw"
                            alt="Cliente 3">
                    </div>
                </div>
            </div>

            <div class="controles">
                <button class="carousel-btn prev" onclick="moverCarrusel(-1)" aria-label="Anterior">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                </button>
                <span id="indicador">1 / 3</span>
                <button class="carousel-btn next" onclick="moverCarrusel(1)" aria-label="Siguiente">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                    </svg>
                </button>
            </div>
        </section>

        <section class="proyectos">
            <h2>Proyectos de <span>GodCode</span></h2>

            <div class="proyecto fila invertida2 animado">
                <div class="texto">
                    <h3>Mobility Solutions –
                        Plataforma web empresarial</h3>
                    <p>Diseñamos y desarrollamos una plataforma web completa para
                        la empresa Mobility Solutions, con un enfoque integral:
                        Catálogo dinámico de productos y servicios.
                        Módulo de gestión y actualización del catálogo.
                        Apartado operativo para atender requerimientos internos,gestionar autorizaciones y cargar nuevas
                        imágenes de forma ágil.
                        Como resultado, una herramienta flexible y profesional que mejora
                        la experiencia del usuario y optimiza la gestión operativa de la empresa.
                    </p>
                </div>
                <div class="imagenNosotros">
                    <img src="../ASSETS/Nosotros/seccion1_img1.png" alt="Mobility Solutions">
                </div>
            </div>

            <div class="proyecto animado">
                <div class="imagenNosotros">
                    <img src="../ASSETS/Nosotros/seccion1_img2.png" alt="Luna Cafe">
                </div>
                <div class="texto">
                    <h3>Luna Café – Punto de venta inteligente
                    </h3>
                    <p>Creamos un sistema POS personalizado, diseñado para facilitar y automatizar
                        la operación diaria del negocio:
                        Punto de venta amigable y totalmente gestionable.
                        Módulos de control de gastos, asistencia del personal y promociones.
                        Dashboard con métricas en tiempo real sobre ventas y comportamiento de
                        clientes.
                        Seguimiento de clientes frecuentes y campañas de fidelización.
                        Como resultado, una herramienta clave para la operación eficiente del negocio
                        y la toma de decisiones basada en datos.</p>
                </div>
            </div>
        </section>

        <section id="creciendoJuntos" class="creciendoJuntos">
            <h2>Creciendo juntos <span>#GodCode</span></h2>

            <div class="creciendoJuntos-contenido fila-horizontal">
                <div class="bloque">
                    <h3>Careers en GodCode</h3>
                    <p>
                        En GodCode, creemos que el talento humano es el motor que impulsa la innovación. Buscamos
                        personas apasionadas por la tecnología, la creatividad y el desarrollo de soluciones que
                        transformen la forma en que las empresas operan y se conectan con sus usuarios.
                        Si te apasiona el desarrollo de software, el diseño UX/UI, la arquitectura de soluciones, la
                        inteligencia
                        artificial o simplemente tienes una mente inquieta que quiere construir el futuro, queremos
                        conocerte.
                    </p>
                </div>

                <div class="contenedor-boton">
                    <a href="#contacto" class="btn-contacto">Deja tus datos y CV aquí</a>
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

    <script src="../JS/index.js"></script>
</body>

</html>