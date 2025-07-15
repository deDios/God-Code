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
        <section class="seccion-uxui">
            <div class="uxui-contenido">
                <div class="uxui-imagen">
                    <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DiseñoUX-UI_seccion1_img1.png"
                        alt="Diseño UX/UI">
                </div>
                <div class="uxui-texto">
                    <h3>Diseño <span>UX/UI</span></h3>
                    <p>
                        Las grandes experiencias digitales comienzan con una estrategia sólida de UX/UI. Desde la
                        investigación del usuario hasta el diseño visual y la interacción final, cada etapa es
                        fundamental para crear interfaces intuitivas, accesibles y centradas en las personas.
                    </p>
                    <p>
                        Aprovecha el poder del diseño centrado en el usuario para construir productos digitales que no
                        solo se ven bien, sino que se sienten naturales de usar, guiando a los usuarios de forma clara,
                        fluida y significativa.
                    </p>
                    <p>
                        Con un enfoque estratégico en UX/UI, defines flujos de navegación eficientes, jerarquías
                        visuales coherentes y sistemas de diseño escalables que se adaptan a múltiples dispositivos y
                        contextos.
                    </p>
                    <p>
                        Diseña experiencias que conectan emocionalmente con el usuario, eliminan fricciones, generan
                        confianza y convierten la interacción en valor.
                    </p>
                    <p>
                        Crea soluciones digitales que no solo destacan visualmente, sino que también impulsan la
                        retención, mejoran los indicadores clave y fortalecen la percepción de tu marca. <a>GodCode</a>
                    </p>
                </div>
            </div>
        </section>

        <!-- Sección 2 -->
        <section id="ventajas-uxui">
            <p class="ventajas-uxui__intro">
                Descubre los beneficios de aplicar diseño UX/UI a tus productos digitales.
            </p>

            <div class="ventajas-uxui__contenedor">
                <button class="ventajas-uxui__btn prev" aria-label="Anterior">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M15.41 7.41L14 6 8 12l6 6 1.41-1.41L10.83 12z" />
                    </svg>
                </button>

                <div class="ventajas-uxui__carousel" id="ventajas-uxui-carousel">


                    <div class="ventaja">
                        <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DiseñoUX-UI_seccion2_img1.png" alt="img" />
                        <div class="ventaja__texto">
                            <h3>Investigación de Negocio</h3>
                            <p>Comprendemos las necesidades de los usuarios para crear soluciones efectivas.</p>
                        </div>
                    </div>

                    <div class="ventaja">
                        <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DiseñoUX-UI_seccion2_img2.png" alt="img" />
                        <div class="ventaja__texto">
                            <h3>Mejora la satisfacción del cliente</h3>
                            <p>Diseños intuitivos y centrados en el usuario crean experiencias agradables que fortalecen
                                la percepción de tu marca.</p>
                        </div>
                    </div>

                    <div class="ventaja">
                        <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DiseñoUX-UI_seccion2_img3.png" alt="img" />
                        <div class="ventaja__texto">
                            <h3>Incrementa la conversión</h3>
                            <p>Guía a los usuarios de forma clara hacia tus objetivos clave y aumenta tus tasas de
                                conversión.</p>
                        </div>
                    </div>

                    <div class="ventaja">
                        <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DiseñoUX-UI_seccion2_img4.png" alt="img" />
                        <div class="ventaja__texto">
                            <h3>Reduce los costos de soporte</h3>
                            <p>Interfaces bien diseñadas evitan errores comunes y disminuyen la carga de atención
                                técnica.</p>
                        </div>
                    </div>

                    <div class="ventaja">
                        <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DiseñoUX-UI_seccion2_img5.png" alt="img" />
                        <div class="ventaja__texto">
                            <h3>Aumenta la retención de usuarios</h3>
                            <p>Una experiencia fluida y atractiva motiva a los usuarios a volver y seguir usando tu
                                producto.</p>
                        </div>
                    </div>

                    <div class="ventaja">
                        <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DiseñoUX-UI_seccion2_img6.png" alt="img" />
                        <div class="ventaja__texto">
                            <h3>Diferencia frente a la competencia</h3>
                            <p>Un diseño profesional destaca tu producto en mercados competitivos y saturados.</p>
                        </div>
                    </div>

                    <div class="ventaja">
                        <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DiseñoUX-UI_seccion2_img7.png" alt="img" />
                        <div class="ventaja__texto">
                            <h3>Optimiza el tiempo de desarrollo</h3>
                            <p>Una estrategia UX/UI desde el inicio evita retrabajos y acelera el proceso de desarrollo.
                            </p>
                        </div>
                    </div>

                    <div class="ventaja">
                        <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DiseñoUX-UI_seccion2_img8.png" alt="img" />
                        <div class="ventaja__texto">
                            <h3>Impulsa la imagen de marca</h3>
                            <p>Un diseño coherente transmite profesionalismo, confianza y calidad en cada interacción.
                            </p>
                        </div>
                    </div>

                    <div class="ventaja">
                        <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DiseñoUX-UI_seccion2_img9.png" alt="img" />
                        <div class="ventaja__texto">
                            <h3>Favorece la escalabilidad</h3>
                            <p>Diseños bien estructurados permiten crecer sin perder eficiencia ni coherencia visual.
                            </p>
                        </div>
                    </div>

                    <div class="ventaja">
                        <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DiseñoUX-UI_seccion2_img10.png" alt="img" />
                        <div class="ventaja__texto">
                            <h3>Apoya decisiones basadas en datos</h3>
                            <p>Las métricas y pruebas de usuario permiten mejorar el diseño con base en evidencia real.
                            </p>
                        </div>
                    </div>

                    <div class="ventaja">
                        <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DiseñoUX-UI_seccion2_img11" alt="img" />
                        <div class="ventaja__texto">
                            <h3>Conecta con las emociones del usuario</h3>
                            <p>Una experiencia bien diseñada genera vínculos emocionales con tu marca.</p>
                        </div>
                    </div>



                </div>

                <button class="ventajas-uxui__btn next" aria-label="Siguiente">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                    </svg>
                </button>
            </div>
        </section>

        <!-- Seccion 3 -->
        <section class="seccion-uxui">

            <div class="uxui-contenido">
                <div class="uxui-texto">
                    <p>
                        No te pierdas la oportunidad de transformar tus páginas y apps con una estrategia sólida de
                        UX/UI.
                        Mejora la experiencia de tus usuarios, fortalece tu marca y aumenta tus conversiones con diseños
                        funcionales,
                        intuitivos y visualmente atractivos. Al aplicar principios de experiencia y diseño de usuario,
                        tu producto digital
                        se vuelve más accesible, eficiente y alineado con las necesidades reales de tu audiencia.
                    </p>
                    <p>
                        Desde la arquitectura de la información hasta la interacción final, trabajamos cada detalle para
                        que tus interfaces
                        no solo se vean bien, sino que también ofrezcan una navegación fluida, coherente y orientada a
                        resultados.
                        Evita fricciones innecesarias, reduce la tasa de abandono y convierte cada visita en una
                        oportunidad de conexión real.
                    </p>
                    <p>
                        Nuestro equipo de especialistas en UX/UI te acompaña en todo el proceso: investigación de
                        usuario, diseño de prototipos,
                        pruebas de usabilidad y mejoras continuas. Creamos soluciones centradas en las personas,
                        adaptadas a múltiples dispositivos
                        y optimizadas para el éxito de tu negocio.
                    </p>
                    <p>
                        Haz que tu proyecto digital evolucione con una experiencia que cautive, fidelice y genere
                        impacto desde el primer clic.
                    </p>
                </div>
                <div class="uxui-imagen">
                    <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DiseñoUX-UI_seccion3_img1.png"
                        alt="Diseño UX/UI estrategia">
                </div>
            </div>

            <div class="uxui-contenido" style="margin-top: 60px;">
                <div class="uxui-imagen">
                    <img src="../ASSETS/ProductosPopUp/AssetsParaVistas/DiseñoUX-UI_seccion4_img1.png"
                        alt="Equipo UX/UI">
                </div>
                <div class="uxui-texto">
                    <h3>Únete a nuestro equipo como diseñador <span>UX/UI</span></h3>
                    <p>
                        ¿Apasionado por crear experiencias digitales memorables?<br>
                        En nuestro equipo buscamos un diseñador UX/UI con visión estratégica, creatividad y enfoque en
                        el usuario.
                        Serás parte de un entorno colaborativo donde podrás participar en todas las etapas del proceso:
                        desde la investigación de usuario y prototipado, hasta la entrega de interfaces funcionales y
                        visualmente impactantes.
                    </p>
                    <p>
                        Trabajarás junto a desarrolladores, project managers y otros diseñadores para construir
                        productos digitales que no solo se vean bien,
                        sino que realmente conecten con las personas. Si te encantan los problemas de forma creativa,
                        diseñar con intención y aprender continuamente, este lugar es para ti.
                    </p>
                    <p>
                        Que tus ideas cobren vida y marca la diferencia con nosotros. <a
                            href="../VIEW/ContactoCV.php">Deja tus datos
                            y CV aquí </a>
                    </p>
                </div>
            </div>

        </section>

        <!-- Seccion 4  -->
        <section id="otros-productos">
            <h2>Otros Productos</h2>
            <div class="productos-random"></div>
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