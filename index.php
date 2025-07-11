<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GodCode</title>
    <link rel="stylesheet" href="CSS/index.css">
</head>

<body>
    <!-- Tope de pagina -->
    <header id="header">
        <!-- esta barra en el tope de pagina solo renderiza segun la resolucion de las pantallas pequeñas -->
        <!-- Barra social móvil (solo visible en pantallas pequeñas) -->
        <div class="social-bar-mobile">
            <div class="social-icons">
                <div class="icon-mobile">
                    <img src="ASSETS/index/Facebook.png" alt="Facebook" />
                </div>
                <div class="icon-mobile">
                    <img src="ASSETS/index/Instagram.png" alt="Instagram" />
                </div>
                <div class="icon-mobile">
                    <img src="ASSETS/index/Tiktok.png" alt="TikTok" />
                </div>
                <!-- Icono de usuario para login en vista mobile -->
                <div class="user-icon-mobile" onclick="window.location.href='VIEW/Login.php'">
                    <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                        alt="Usuario" />
                </div>
            </div>
        </div>

        <div class="top-bar" id="top-bar">
            <div class="logo">
                <img src="ASSETS/godcode_icon.png" alt="Logo GodCode" class="logo-icon">
                GodCode
            </div>

            <!--Boton hamburguesa que aparece segun la resolucion-->
            <div class="hamburger" onclick="toggleMenu()">☰</div>

            <div class="actions">
                <button class="btn btn-outline" onclick="location.href='#'">Cotizar</button>
                <button class="btn btn-primary" onclick="location.href='#'">Registrarse</button>
                <!-- icono de usuario para despues hacer el login -->
                <div class="user-icon" onclick="window.location.href='VIEW/Login.php'">
                    <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                        alt="Usuario" href="VIEW/Login.php" />
                </div>
            </div>
        </div>

        <!-- Barra de navegación pequeña -->
        <div id="mobile-menu" class="subnav">
            <a href="index.php" class="active">Inicio</a>
            <div class="nav-item has-megamenu desktop-only" id="submenu-productos">
                <a href="#">Productos</a>
                <div class="megamenu">
                    <div class="col">
                        <h4>Lo que hacemos</h4>
                        <ul>
                            <li><a href="VIEW/DesarrolloWeb.php"><img src="ASSETS/ProductosPopUp/DesarrolloWeb.png"
                                        alt="Web">Desarrollo Web</a></li>
                            <li><a href="VIEW/DesarrolloMobile.php"><img
                                        src="ASSETS/ProductosPopUp/DesarrolloMobile.png" alt="Mobile">Desarrollo
                                    Mobile</a></li>
                        </ul>
                    </div>
                    <div class="col">
                        <h4>Servicios</h4>
                        <ul>
                            <li><a href="VIEW/ServiciosEnLaNube.php"><img
                                        src="ASSETS/ProductosPopUp/ServiciosEnLaNube.png" alt="Nube">Servicios
                                    en la Nube</a></li>
                            <li><a href="VIEW/DisenoUXUI.php"><img src="ASSETS/ProductosPopUp/DiseñoUXUI.png"
                                        alt="UX/UI">Diseño UX/UI</a>
                            </li>
                            <li><a href="VIEW/ServicioEducativo.php"><img
                                        src="ASSETS/ProductosPopUp/ServicioEducativo.png">Servicio
                                    educativo</a></li>
                        </ul>
                    </div>
                    <div class="col">
                        <h4>Industrias</h4>
                        <ul>
                            <li><a href="VIEW/ServicioEducativo.php"><img src="ASSETS/ProductosPopUp/Educacion.png"
                                        alt="Educación">Educación</a>
                            </li>
                            <li><a href="VIEW/IndustriaTecnologia.php"><img src="ASSETS/ProductosPopUp/Tecnologia.png"
                                        alt="Tecnología">Tecnología</a></li>
                            <li><a href="VIEW/IndustriaFinanciera.php"><img src="ASSETS/ProductosPopUp/Finanzas.png"
                                        alt="Finanzas">Finanzas</a>
                            </li>
                        </ul>
                    </div>
                    <div class="col tecnologias full-width">
                        <h4>Tecnologías</h4>
                        <div class="tech-icons">
                            <span><img src="ASSETS/ProductosPopUp/Tecnologias/Azure.png" alt="Azure"> Azure</span>
                            <span><img src="ASSETS/ProductosPopUp/Tecnologias/Php.png" alt="PHP"> PHP</span>
                            <span><img src="ASSETS/ProductosPopUp/Tecnologias/Kotlin.png" alt="Kotlin"> Kotlin</span>
                            <span><img src="ASSETS/ProductosPopUp/Tecnologias/SwiftUI.png" alt="SwiftUI"> SwiftUI</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="nav-item mobile-only">
                <a href="VIEW/ProductosMobile.php" class="btn-contacto">Productos</a>
            </div>

            <a href="VIEW/Nosotros.php">Nosotros</a>
            <a href="VIEW/Blog.php">Blog</a>

            <div class="social-icons">
                <div class="circle-icon">
                    <img src="ASSETS/index/Facebook.png" alt="Facebook" />
                </div>
                <div class="circle-icon">
                    <img src="ASSETS/index/Instagram.png" alt="Instagram" />
                </div>
                <div class="circle-icon">
                    <img src="ASSETS/index/Tiktok.png" alt="TikTok" />
                </div>
            </div>
        </div>
    </header>

    <main>
        <!-------------------------- Seccion 1  --------------------------->
        <section id="seccion-innovacion" class="innovacion-section">
            <!-- Columna izquierda -->
            <div class="columna texto">
                <h1>Tecnología unificada. Experiencias conectadasV9</h1>
                <p>
                    V9En GodCode impulsamos el desarrollo de tecnologías inteligentes y escalables que integran todos los
                    canales y dispositivos de tu negocio.
                    Desde aplicaciones móviles hasta plataformas web, sistemas de gestión y puntos de contacto físicos,
                    conectamos cada parte de tu negocio para brindar experiencias consistentes, fluidas y personalizadas
                    a tus usuarios. Innovación real para empresas que buscan eficiencia, escalabilidad y una presencia
                    360°.
                </p>
                <div class="botones">
                    <a href="#" class="btn btn-primary">Ver más detalles</a>
                    <a href="#" class="btn btn-outline">Servicios</a>
                </div>
            </div>

            <!-- Columna central -->
            <div class="columna imagen">
                <img src="ASSETS/index/Seccion1_img1.png" />
            </div>

            <!-- Columna derecha -->
            <div class="columna noticias">
                <h3>Noticias sobre tecnología</h3>
                <div id="lista-noticias">
                    <div class="contenido-noticias"></div>
                </div>
                <div id="paginacion" class="paginacion"></div>
            </div>
        </section>


        <!-------------------------- seccion 2 ---------------------------------->
        <section class="objetivos">
            <h2>Alcanza tus objetivos con las soluciones que tenemos para ti o tu negocio.</h2>
            <div class="cards">
                <div class="card">
                    <img src="ASSETS/index/seccion2_img1.png" alt="Conversión">
                    <h3>Aumenta tus ventas
                        con tecnología</h3>
                    <p>Automatiza tus procesos, analiza tus datos en tiempo real y ofrece experiencias digitales que
                        convierten. Creamos plataformas y herramientas que impactan directamente en tus resultados de
                        venta.</p>
                </div>
                <div class="card">
                    <img src="ASSETS/index/seccion2_img2.png" alt="Ventas en línea">
                    <h3>Impulsa tu negocio</h3>
                    <p>Desarrollamos soluciones a la medida para escalar tu empresa. Desde sistemas internos hasta
                        plataformas integrales, te ayudamos a operar de manera más ágil, segura y eficiente.</p>
                </div>
                <div class="card">
                    <img src="ASSETS/index/seccion2_img3.png" alt="Tráfico en tienda">
                    <h3>Muestra tu marca</h3>
                    <p>Haz que tu marca hable por ti. Diseñamos sitios web y experiencias digitales visualmente
                        poderosas, que transmiten confianza, profesionalismo y un mensaje claro para tu audiencia.</p>
                </div>
                <div class="card">
                    <img src="ASSETS/index/seccion2_img4.png" alt="Marca">
                    <h3>De un móvil a
                        tus clientes</h3>
                    <p>Tus clientes viven en su celular, y tu negocio también debe estar ahí. Creamos apps móviles
                        modernas, rápidas y seguras para que tus productos o servicios estén siempre al alcance de la
                        mano.</p>
                </div>
                <div class="card">
                    <img src="ASSETS/index/seccion2_img5.png" alt="Aplicación">
                    <h3>Maximiza tus clientes
                        potenciales</h3>
                    <p>Utilizamos tecnología para atraer, segmentar y convertir leads en clientes reales. Conecta con
                        las personas correctas, en el momento adecuado, con soluciones digitales pensadas para crecer tu
                        base de clientes.</p>
                </div>
            </div>
            <div class="info-button">
                <button>Más información</button>
            </div>
        </section>

        <!-------------- seccion 3  ------------------>
        <section class="potencial">
            <h2>El potencial de GodCode <span>para tu negocio</span></h2>

            <div class="bloque">
                <div class="imagen">
                    <img src="ASSETS/index/seccion3_img1.png" alt="Clientes img">
                </div>
                <div class="texto">
                    <h3>Llega a tus clientes estén donde estén</h3>
                    <p>
                        Desarrollamos soluciones tecnológicas omnicanal que permiten interactuar con tus clientes desde
                        cualquier dispositivo o plataforma.Ya sea en redes sociales, apps móviles, sitios web o sistemas
                        físicos, conectamos todos los canales para que tu negocio esté presente donde tus clientes te
                        necesiten.
                    </p>
                </div>
            </div>

            <div class="bloque">
                <div class="imagen">
                    <img src="ASSETS/index/seccion3_img2.png" alt="Optimiza ROI">
                </div>
                <div class="texto">
                    <h3>Administra y controla tus herramientas</h3>
                    <p>
                        Centraliza y automatiza tus procesos en un solo panel de control.GodCode crea soluciones que
                        integran tus sistemas actuales, brindándote visibilidad total y control sobre las herramientas
                        que usas día a día para operar tu negocio de forma más eficiente y segura.
                    </p>
                </div>
            </div>

            <div class="bloque">
                <div class="imagen">
                    <img src="ASSETS/index/seccion3_img3.png" alt="Controla tu presupuesto">
                </div>
                <div class="texto">
                    <h3>Gestiona tus costos y hazte de nuevas herramientas</h3>
                    <p>
                        Optimiza tus recursos y maximiza el retorno de tu inversión tecnológica.Te ayudamos a
                        identificar oportunidades de ahorro, reducir gastos operativos y adoptar nuevas soluciones que
                        potencien tu crecimiento, sin perder el control financiero.
                    </p>
                </div>
            </div>
        </section>

        <!-------------- seccion 4  ------------------>

        <section class="ayuda-faq">
            <div class="limite">
                <div class="ayuda-contenido">
                    <h2>Permítenos ayudarte.</h2>
                    <p>
                        Recibe asesoría personalizada sin costo. Te ayudamos a identificar las soluciones tecnológicas
                        ideales
                        para tu empresa, ya sea que necesites una app, una plataforma web, automatización de procesos o
                        una
                        experiencia omnicanal completa. Creamos tu plan tecnológico a medida, guiado por expertos en
                        desarrollo e innovación.
                    </p>
                    <a href="VIEW/Contacto.php" class="btn-contacto">Contáctanos</a>
                </div>

                <div class="faq">
                    <h2>Preguntas frecuentes</h2>

                    <div class="acordeon">
                        <!-- Primeras 4 visibles -->
                        <div class="item">
                            <button class="pregunta" onclick="toggleItem(this)">
                                ¿Qué tipo de soluciones desarrollan en GodCode?
                            </button>
                            <div class="respuesta">
                                Desarrollamos soluciones web, móviles, de automatización, integración de sistemas y
                                plataformas a la medida, enfocadas en la eficiencia y la conexión omnicanal.
                            </div>
                        </div>

                        <div class="item">
                            <button class="pregunta" onclick="toggleItem(this)">
                                ¿Puedo contratar solo una parte del desarrollo, como una app o solo el sitio web?
                            </button>
                            <div class="respuesta">
                                Sí. Desarrollamos integraciones con plataformas existentes como Salesforce, HubSpot,
                                SAP,
                                Zoho, etc., para que todo funcione en un mismo entorno.
                            </div>
                        </div>

                        <div class="item">
                            <button class="pregunta" onclick="toggleItem(this)">
                                ¿GodCode trabaja con empresas pequeñas o solo grandes corporativos?
                            </button>
                            <div class="respuesta">
                                Trabajamos con todo tipo de clientes: desde emprendedores y pymes hasta grandes
                                empresas.
                                Diseñamos soluciones escalables que crecen contigo.
                            </div>
                        </div>

                        <div class="item">
                            <button class="pregunta" onclick="toggleItem(this)">
                                ¿Qué es una solución omnicanal y cómo puede ayudar a mi negocio?
                            </button>
                            <div class="respuesta">
                                Es una estrategia que conecta todos los puntos de contacto con tus clientes (web, móvil,
                                redes, sistemas físicos, etc.). Mejora la experiencia del cliente y la eficiencia de tu
                                negocio.
                            </div>
                        </div>

                        <div class="item extra">
                            <button class="pregunta" onclick="toggleItem(this)">
                                ¿Ofrecen consultoría antes de comenzar un proyecto?
                            </button>
                            <div class="respuesta">
                                Sí. Nuestra primera asesoría es gratuita y te ayudamos a identificar la solución
                                tecnológica
                                ideal para tu negocio.
                            </div>
                        </div>

                        <div class="item extra">
                            <button class="pregunta" onclick="toggleItem(this)">
                                ¿Los desarrollos son personalizados o trabajan con plantillas?
                            </button>
                            <div class="respuesta">
                                Todos nuestros desarrollos son personalizados y hechos desde cero, alineados con tus
                                objetivos, procesos y marca.
                            </div>
                        </div>

                        <div class="item extra">
                            <button class="pregunta" onclick="toggleItem(this)">
                                ¿Qué tecnologías utilizan en sus proyectos?
                            </button>
                            <div class="respuesta">
                                Trabajamos con tecnologías modernas como React, Flutter, Laravel, Node.js, Python,
                                Swift, y
                                bases de datos escalables como PostgreSQL, Firebase, y MongoDB, entre otras.
                            </div>
                        </div>

                        <div class="item extra">
                            <button class="pregunta" onclick="toggleItem(this)">
                                ¿Qué tiempo toma un proyecto típico?
                            </button>
                            <div class="respuesta">
                                Depende de la complejidad. Un sistema simple puede tomar entre 2 y 4 semanas; soluciones
                                más
                                completas pueden requerir entre 2 y 4 meses. Siempre damos un cronograma claro al
                                inicio.
                            </div>
                        </div>

                        <div class="item extra">
                            <button class="pregunta" onclick="toggleItem(this)">
                                ¿Ofrecen soporte o mantenimiento después de terminar el desarrollo?
                            </button>
                            <div class="respuesta">
                                Sí, ofrecemos soporte técnico, actualizaciones, mejoras y mantenimiento mensual o por
                                evento
                                según tus necesidades.
                            </div>
                        </div>

                        <div class="item extra">
                            <button class="pregunta" onclick="toggleItem(this)">
                                ¿Puedo integrar sus soluciones con sistemas que ya uso (como CRM o ERP)?
                            </button>
                            <div class="respuesta">
                                Sí. Desarrollamos integraciones con plataformas existentes como Salesforce, HubSpot,
                                SAP,
                                Zoho, etc., para que todo funcione en un mismo entorno.
                            </div>
                        </div>

                        <div class="item extra">
                            <button class="pregunta" onclick="toggleItem(this)">
                                ¿Qué costos manejan y cómo se cotiza un proyecto?
                            </button>
                            <div class="respuesta">
                                Cada proyecto se cotiza según alcance, funcionalidades y tiempos. La primera reunión es
                                gratuita y te entregamos una propuesta clara, sin compromiso.
                            </div>
                        </div>

                        <div class="item extra">
                            <button class="pregunta" onclick="toggleItem(this)">
                                ¿Ofrecen opciones de pago flexibles?
                            </button>
                            <div class="respuesta">
                                Sí. Tenemos opciones por fases, mensualidades o contratos por mantenimiento para
                                facilitarte
                                el acceso a nuestras soluciones.
                            </div>
                        </div>

                        <div class="item extra">
                            <button class="pregunta" onclick="toggleItem(this)">
                                ¿GodCode puede ayudarme a digitalizar procesos internos de mi empresa?
                            </button>
                            <div class="respuesta">
                                Por supuesto. Diseñamos plataformas internas, automatizaciones, dashboards y flujos que
                                reducen tareas manuales y aumentan tu productividad.
                            </div>
                        </div>

                        <div class="item extra">
                            <button class="pregunta" onclick="toggleItem(this)">
                                ¿Puedo monitorear el avance de mi proyecto?
                            </button>
                            <div class="respuesta">
                                Sí. Usamos herramientas colaborativas dentro de godcode o podemos trabajar con Trello y
                                Monday para que estés al tanto de cada avance, entregable y fecha clave.
                            </div>
                        </div>

                        <div class="item extra">
                            <button class="pregunta" onclick="toggleItem(this)">
                                ¿Dónde están ubicados y en qué zonas ofrecen servicio?
                            </button>
                            <div class="respuesta">
                                Estamos en Ixtlahuacán de los Membrillos, pero trabajamos con clientes en todo el mundo
                                de
                                forma remota. Nuestra tecnología no tiene fronteras.
                            </div>
                        </div>

                        <div class="contenedor-boton">
                            <button id="ver-mas-preguntas" class="btn-contacto">Más preguntas</button>
                        </div>

                    </div>
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

    <script src="JS/Home.js"></script>
    <script src="JS/JSglobal.js"></script>
</body>

</html>