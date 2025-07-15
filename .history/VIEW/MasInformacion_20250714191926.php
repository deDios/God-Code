<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GodCode</title>
    <link rel="stylesheet" href="../CSS/MasInformacion.css" />
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
            <a href="../index.php" class="active">Inicio</a>
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


    <main id="soluciones-negocio">
        <section class="intro">
            <h1>Alcanza tus objetivos con las soluciones que tenemos para ti o tu negocio.</h1>
        </section>

        <section class="bloque fila">
            <div class="imagen">
                <img src="../ASSETS/MasInformacion/img1.png" alt="Ventas con tecnología" />
            </div>
            <div class="texto">
                <h2>Aumenta tus ventas con tecnología</h2>
                <p>Automatiza tus procesos, analiza tus datos en tiempo real y ofrece experiencias digitales que
                    convierten. En GodCode, diseñamos y desarrollamos soluciones tecnológicas pensadas para transformar
                    la forma en que operas, conectas con tus clientes y generas valor. Nuestro enfoque se basa en la
                    integración de herramientas digitales avanzadas que permiten automatizar tareas operativas, reducir
                    la carga manual, mejorar la precisión de los datos y aumentar la eficiencia de los equipos.<br><br>

                    Mediante el análisis de datos en tiempo real, obtienes información relevante y accionable para tomar
                    decisiones estratégicas más rápidas y acertadas. No solo te ayudamos a visualizar el desempeño de
                    tus operaciones, sino también a identificar oportunidades de mejora continua, anticipar riesgos y
                    optimizar recursos.<br><br>

                    Además, creamos experiencias digitales centradas en el usuario: intuitivas, funcionales y adaptadas
                    a múltiples dispositivos. Ya sea a través de plataformas web, apps móviles o sistemas
                    personalizados, nuestras soluciones están diseñadas para maximizar la conversión, fidelizar a tus
                    clientes y potenciar el crecimiento de tu negocio.<br><br>

                    Cada plataforma que construimos tiene un objetivo claro: impactar directamente en tus resultados.
                    Desde la optimización de procesos internos hasta la mejora de la experiencia del cliente, trabajamos
                    contigo para que la tecnología se convierta en un verdadero aliado estratégico para escalar y
                    destacar en un entorno digital competitivo.</p>
            </div>
        </section>

        <section class="bloque fila invertida">
            <div class="imagen">
                <img src="../ASSETS/MasInformacion/img2.png" alt="Impulsa tu negocio" />
            </div>
            <div class="texto">
                <h2>Impulsa tu negocio</h2>
                <p>Desarrollamos soluciones a la medida para escalar tu empresa. En GodCode, entendemos que cada
                    organización tiene retos, procesos y objetivos únicos. Por eso, creamos soluciones digitales
                    personalizadas que se adaptan exactamente a tus necesidades operativas, técnicas y
                    estratégicas.<br><br>

                    Desde herramientas internas de gestión hasta sistemas robustos y escalables, nuestras soluciones
                    están diseñadas para ayudarte a operar con mayor agilidad, seguridad y eficiencia. Utilizamos
                    metodologías ágiles, tecnologías actualizadas y buenas prácticas en experiencia de usuario para
                    garantizar plataformas funcionales, intuitivas y sostenibles en el tiempo.<br><br>

                    Además, nos enfocamos en que cada desarrollo no solo resuelva un problema puntual, sino que también
                    contribuya al crecimiento de tu empresa, permitiéndote escalar de forma ordenada y preparada para
                    nuevos desafíos. Con GodCode, transforma tus procesos en ventajas competitivas reales y lleva tu
                    operación al siguiente nivel.</p>
            </div>
        </section>

        <section class="bloque fila">
            <div class="imagen">
                <img src="../ASSETS/MasInformacion/img3.png" alt="Muestra tu marca" />
            </div>
            <div class="texto">
                <h2>Muestra tu marca</h2>
                <p>Haz que tu marca hable por ti. En GodCode, diseñamos sitios web y experiencias digitales visualmente
                    poderosas que elevan el valor de tu marca y comunican con claridad lo que te hace único.<br><br>

                    Creamos interfaces atractivas, funcionales y adaptadas a distintos dispositivos, con una estructura
                    estratégica que guía al usuario hacia la acción. Nuestro enfoque combina diseño visual de alto
                    impacto, experiencia de usuario (UX/UI) optimizada y contenidos alineados con tus objetivos
                    comerciales.<br><br>

                    Ya sea que busques posicionarte como un referente, fortalecer tu credibilidad o generar
                    oportunidades de negocio, nuestros desarrollos están pensados para ayudarte a destacar en el entorno
                    digital. Deja que tu sitio web sea una herramienta activa para lograr resultados.</p>
            </div>
        </section>

        <section class="bloque fila invertida">
            <div class="imagen">
                <img src="../ASSETS/MasInformacion/img4.png" alt="Soluciones móviles" />
            </div>
            <div class="texto">
                <h2>De un móvil, a tus clientes</h2>
                <p>Tus clientes viven en su celular, y tu negocio también debe estar ahí. En GodCode, desarrollamos
                    aplicaciones móviles modernas, rápidas y seguras que llevan tu marca, productos o servicios
                    directamente al dispositivo de tus usuarios.<br><br>

                    Nuestras apps están pensadas para ofrecer una experiencia fluida, intuitiva y atractiva. Desde
                    aplicaciones nativas hasta soluciones híbridas o multiplataforma, te acompañamos en todo el proceso:
                    diseño, desarrollo, pruebas, publicación y mantenimiento.<br><br>

                    Ya sea que busques una herramienta para mejorar la comunicación con tus usuarios, facilitar ventas o
                    brindar servicios personalizados, nuestras soluciones móviles están creadas para generar valor real.
                    Integramos funcionalidades como notificaciones push, geolocalización, pagos seguros, autenticación
                    social y análisis de comportamiento. Haz que tu app represente lo mejor de tu marca.</p>
            </div>
        </section>

        <section class="bloque fila">
            <div class="imagen">
                <img src="../ASSETS/MasInformacion/img5.png" alt="Maximiza tus clientes" />
            </div>
            <div class="texto">
                <h2>Maximiza tus clientes potenciales</h2>
                <p>Utilizamos tecnología para atraer, segmentar y convertir leads en clientes reales. En GodCode,
                    desarrollamos soluciones digitales estratégicas que te ayudan a conectar con las personas correctas,
                    en el momento adecuado.<br><br>

                    Combinamos desarrollo web, automatización de marketing, análisis de datos y diseño UX/UI enfocado en
                    conversión para ofrecerte sistemas que transforman el tráfico en oportunidades reales de negocio.
                    Implementamos formularios inteligentes, segmentación dinámica, integraciones con CRM y contenido
                    personalizado.<br><br>

                    Ya sea que estés construyendo tu presencia digital desde cero o escalando tu estrategia actual,
                    nuestras soluciones están pensadas para impulsar tu crecimiento con base en datos y decisiones
                    inteligentes. Haz que la tecnología trabaje para ti y convierte cada visita en una oportunidad de
                    venta.</p>
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