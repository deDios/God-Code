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
            <a href="index.html" class="active">Inicio</a>
            <div class="nav-item has-megamenu" id="submenu-productos">
                <a href="#">Productos</a>
                <div class="megamenu">
                    <div class="col">
                        <h4>Lo que hacemos</h4>
                        <ul>
                            <li><a href="VIEW/DesarrolloWeb.php"><img src="ASSETS/ProductosPopUp/DesarrolloWeb.png" alt="Web">Desarrollo Web</a></li>
                            <li><a href="VIEW/DesarrolloMobile.php"><img src="ASSETS/ProductosPopUp/DesarrolloMobile.png" alt="Mobile">Desarrollo Mobile</a></li>
                            <li><a href="#"><img src="ASSETS/ProductosPopUp/DesarrolloNearshore.png">Desarrollo
                                    Nearshore</a></li>
                            <li><a href="#"><img src="ASSETS/ProductosPopUp/DesarrolloOffshore.png" alt="Offshore">Desarrollo Offshore</a>
                            </li>
                        </ul>
                    </div>
                    <div class="col">
                        <h4>Servicios</h4>
                        <ul>
                            <li><a href="#"><img src="ASSETS/ProductosPopUp/ServiciosEnLaNube.png" alt="Nube">Servicios en la Nube</a></li>
                            <li><a href="#"><img src="ASSETS/ProductosPopUp/DiseñoUXUI.png" alt="UX/UI">Diseño UX/UI</a></li>
                            <li><a href="#"><img src="ASSETS/ProductosPopUp/ServicioEducativo.png">Servicio educativo</a></li>
                        </ul>
                    </div>
                    <div class="col">
                        <h4>Industrias</h4>
                        <ul>
                            <li><a href="#"><img src="ASSETS/ProductosPopUp/Educacion.png" alt="Educación">Educación</a></li>
                            <li><a href="#"><img src="ASSETS/ProductosPopUp/Tecnologia.png" alt="Tecnología">Tecnología</a></li>
                            <li><a href="#"><img src="ASSETS/ProductosPopUp/Finanzas.png" alt="Finanzas">Finanzas</a></li>
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
        <section class="innovacion-section">
            <!-- Columna izquierda -->
            <div class="columna texto">
                <h1>Desbloquee la innovación,<br> acelere el crecimiento</h1>
                <p>
                    IBM LinuxONE Emperor 5 combina Linux e inteligencia artificial para ofrecer seguridad,
                    rendimiento y eficiencia en la inferencia de IA.
                </p>
                <div class="botones">
                    <a href="#" class="btn btn-primary">Descubra IBM LinuxONE 5</a>
                    <a href="#" class="btn btn-outline">Explore el conjunto de herramientas de IA</a>
                </div>
            </div>

            <!-- Columna central -->
            <div class="columna imagen">
                <img src="https://blob.udgtv.com/images/uploads/2017/07/inbox3-focus-0-0-608-342.jpg" />
            </div>

            <!-- Columna derecha -->
            <div class="columna noticias">
                <h3>Noticias</h3>

                <div id="lista-noticias">
                    <div class="contenido-noticias"></div> <!-- Este es el que usaremos para las animaciones -->
                </div>

                <div id="paginacion" class="paginacion"></div>
            </div>
        </section>


        <!-------------------------- seccion 2 ---------------------------------->
        <section class="objetivos">
            <h2>Alcanza tus objetivos con las soluciones que tenemos para ti o tu negocio.</h2>
            <div class="cards">
                <div class="card">
                    <img src="ASSETS/index/calendario.png" alt="Conversión">
                    <h3>Maximiza los clientes potenciales y las conversiones</h3>
                    <p>Consigue clientes potenciales de mayor calidad y mejora las conversiones.</p>
                </div>
                <div class="card">
                    <img src="ASSETS/index/barras.png" alt="Ventas en línea">
                    <h3>Aumenta las ventas en línea</h3>
                    <p>Llega a los compradores donde se encuentren y aumenta el tráfico y las ventas de tu sitio.</p>
                </div>
                <div class="card">
                    <img src="ASSETS/index/tienda.png" alt="Tráfico en tienda">
                    <h3>Impulsa el tráfico presencial en la tienda</h3>
                    <p>Atrae a los consumidores a tu tienda y aumenta las ventas tradicionales.</p>
                </div>
                <div class="card">
                    <img src="ASSETS/index/planeta.png" alt="Marca">
                    <h3>Muestra tu marca a más personas</h3>
                    <p>Muestra tu marca para aumentar el alcance y la participación.</p>
                </div>
                <div class="card">
                    <img src="ASSETS/index/celular.png" alt="Aplicación">
                    <h3>Promociona tu aplicación para los usuarios nuevos</h3>
                    <p>Promociona tu aplicación entre los usuarios adecuados para impulsar las descargas y la
                        participación.</p>
                </div>
            </div>
            <div class="info-button">
                <button>Más información</button>
            </div>
        </section>

        <!-------------- seccion 3  ------------------>
        <section class="potencial">
            <h2>El potencial de Google <span>para tu negocio</span></h2>

            <div class="bloque">
                <div class="imagen">
                    <img src="ASSETS/index/mapa.png" alt="Clientes img">
                </div>
                <div class="texto">
                    <h3>Llega a tus clientes estén donde estén</h3>
                    <p>
                        Muestra tus anuncios en el lugar y momento adecuados gracias a Google Ads.
                        Deja que la automatización de Google encuentre los formatos de anuncio
                        en YouTube, Discover, la Búsqueda y más para maximizar las conversiones
                        de tu negocio.
                    </p>
                </div>
            </div>

            <div class="bloque">
                <div class="imagen">
                    <img src="ASSETS/index/clipboard.png" alt="Optimiza ROI">
                </div>
                <div class="texto">
                    <h3>Registra, aprende y optimiza el ROI</h3>
                    <p>
                        Registra las conversiones para obtener información de tu público objetivo.
                        La optimización automática del presupuesto de Google te permite captar clientes nuevos
                        con el ROI más alto.
                    </p>
                </div>
            </div>

            <div class="bloque">
                <div class="imagen">
                    <img src="ASSETS/index/dinero.png" alt="Controla tu presupuesto">
                </div>
                <div class="texto">
                    <h3>Controla tu presupuesto</h3>
                    <p>
                        Obtén recomendaciones, realiza ajustes y decide tu presupuesto mensual.
                        La tecnología de Google te permite medir resultados y aprovechar tu inversión
                        publicitaria de la mejor manera.
                    </p>
                </div>
            </div>
        </section>

        <!-------------- seccion 4  ------------------>

        <section class="ayuda-faq">
            <div class="ayuda-contenido">
                <h2>Permítenos ayudarte.</h2>
                <p>Recibe asistencia personalizada sin cargo. Crea tu plan de anuncios personalizados con un experto en
                    Google Ads.</p>
                <a href="#contacto" class="btn-contacto">Contáctanos pero ya está el contacto abajo</a>
            </div>

            <div class="faq">
                <h2>Preguntas frecuentes</h2>

                <div class="acordeon">
                    <div class="item">
                        <button class="pregunta" onclick="toggleItem(this)">¿Cuáles son los diferentes tipos de campañas
                            de Google Ads que puedo ejecutar?</button>
                        <div class="respuesta">Existen campañas de búsqueda, display, video, shopping, apps y más, según
                            tu objetivo.</div>
                    </div>
                    <div class="item">
                        <button class="pregunta" onclick="toggleItem(this)">¿Qué tipo de campaña de Google Ads es
                            adecuada para mi negocio?</button>
                        <div class="respuesta">Depende de tu objetivo: ventas, tráfico, leads o reconocimiento de marca.
                        </div>
                    </div>
                    <div class="item">
                        <button class="pregunta" onclick="toggleItem(this)">¿Google Ads usa IA?</button>
                        <div class="respuesta">Sí, Google Ads utiliza IA para automatizar pujas, segmentación y
                            personalización de anuncios.</div>
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

    <script src="JS/index.js"></script>
</body>

</html>
