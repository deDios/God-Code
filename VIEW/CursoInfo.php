<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Academia GodCode</title>
    <link rel="stylesheet" href="../CSS/CursoInfo.css" />
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
                <a href="../VIEW/ProductosMobile.php" class="btn-contacto">Productos</a>
            </div>

            <a href="../VIEW/Nosotros.php">Nosotros</a>
            <a href="../VIEW/Blog.php" class="active">Blog</a>

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
        <!-- Sección 1 -->
        <section id="curso" class="curso-detalle">
            <div class="curso-contenido">
                <h4>
                    Habilidades Financieras
                </h4>
                <h2 class="titulo">Curso Administrativo</h2>

                <p class="descripcion-corta" style="display: none;">
                    <!-- ya no se mostrara pero por si acaso aca esta -->
                    Desarrolla habilidades clave para organizar, planificar y tomar decisiones efectivas.
                    Aprende a gestionar equipos y recursos con eficiencia en cualquier entorno empresarial.
                </p>

                <p class="descripcion-media">
                    <!-- se llena con el js -->
                </p>

                <img src="../ASSETS/cursoInfo/cursoInfo_img1.png" alt="Curso Administrativo">

                <div class="texto-descriptivo">
                    <p>
                        En el entorno organizacional actual, la administración eficiente de recursos, procesos y equipos
                        se ha convertido en una competencia esencial para el éxito de cualquier empresa.
                    </p>
                    <p>
                        Este curso administrativo está diseñado para brindarte una formación integral en las principales
                        funciones de administración moderna...
                    </p>
                    <p>
                        Al finalizar el curso, contarás con las habilidades necesarias para gestionar áreas
                        administrativas...
                    </p>
                </div>
            </div>

            <aside class="curso-info">
                <div class="info-box">
                    <p class="pregunta">¿Tienes alguna duda?<br><strong>No dudes en contactarnos.</strong></p>
                    <button class="btn-secundario-centrado" onclick="location.href='../VIEW/Contacto.php'">Solicita más
                        información</button>
                </div>

                <div class="precio-box">
                    <div class="info-curso-vertical">
                        <p class="precio">$300</p>
                        <small>Inscríbete al curso y obtén acceso al área común.</small>
                        <button class="btn-principal" id="abrir-modal-inscripcion">Inscribirme al curso</button>
                    </div>

                    <ul class="detalles-lista">
                        <li><img src="../ASSETS/cursoInfo/icono-tiempo.png" alt=""> <span class="horas">2 Horas al
                                día</span></li>
                        <li><img src="../ASSETS/cursoInfo/icono-actividades.png" alt=""> <span
                                class="actividades">Diversas actividades</span></li>
                        <li><img src="../ASSETS/cursoInfo/icono-evaluacion.png" alt=""> <span
                                class="evaluacion">Evaluación semanal</span></li>
                        <li><img src="../ASSETS/cursoInfo/icono-horarios.png" alt=""> <span class="calendario">Diversos
                                horarios disponibles</span></li>
                        <li><img src="../ASSETS/cursoInfo/icono-certificado.png" alt=""> <span
                                class="certificado">Certificado disponible según modalidad</span></li>
                        <li><img src="../ASSETS/cursoInfo/icono-curriculum.png" alt=""> <span>¡Empieza tu formación hoy
                                mismo!</span></li>
                    </ul>
                </div>
            </aside>
        </section>

        <!-- Sección 2 -->
        <section id="curso-detalle-extra">
            <div class="acordeon-box">

                <div class="item">
                    <div class="cabecera">
                        <h4>Impartido por</h4>
                        <button class="arrow-btn" aria-label="Mostrar/Ocultar sección">
                            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
                            </svg>
                        </button>
                    </div>
                    <div class="contenido">
                        <div class="instructor">
                            <img src="../ASSETS/cursoInfo/perfil_img.png" alt="Foto del instructor">
                            <div>
                                <p><strong>Luis Enrique Méndez Fernández</strong></p>
                                <p>(Insertar Biografía y descripción de los maestros)</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="item dirigido">
                    <div class="cabecera">
                        <h4>Dirigido a</h4>
                        <button class="arrow-btn" aria-label="Mostrar/Ocultar sección">
                            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
                            </svg>
                        </button>
                    </div>
                    <div class="contenido">
                        <p>
                            Este curso está dirigido a profesionales, asistentes, coordinadores, supervisores y líderes
                            de áreas administrativas en empresas públicas y privadas que deseen fortalecer sus
                            habilidades en organización, planificación y gestión eficiente de recursos.
                        </p>
                    </div>
                </div>

                <div class="item competencias">
                    <div class="cabecera">
                        <h4>¿Qué competencias vas a adquirir?</h4>
                        <button class="arrow-btn" aria-label="Mostrar/Ocultar sección">
                            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
                            </svg>
                        </button>
                    </div>
                    <div class="contenido">
                        <p>
                            Aplicar estrategias de gestión administrativa según las necesidades específicas del entorno
                            organizacional para optimizar procesos y mejorar el desempeño general.
                        </p>
                    </div>
                </div>

            </div>
        </section>

        <!-- Sección 3 -->
        <section id="otros-cursos">
            <h2>Cursos similares</h2>
            <div class="cards-cursos" id="otros-cursos-container">

                <!-- Las cards se inyectan aquí vía JS -->
                <a href="cursoInfo.php?id=1" class="curso-link">
                    <div class="card-curso">
                        <img src="../ASSETS/cursos/img1.png" alt="Curso de PHP">
                        <div class="card-contenido">
                            <h4>Curso de PHP</h4>
                            <p>Domina PHP desde cero y aprende a desarrollar sitios web dinámicos y funcionales.</p>
                            <p class="info-curso">40 hrs | $300.00</p>
                        </div>
                    </div>
                </a>

                <a href="cursoInfo.php?id=2" class="curso-link">
                    <div class="card-curso">
                        <img src="../ASSETS/cursos/img2.png" alt="Gestión Financiera">
                        <div class="card-contenido">
                            <h4>Curso de Gestión Financiera</h4>
                            <p>Adquiere herramientas clave para tomar decisiones financieras acertadas y mejorar tu
                                salud económica.</p>
                            <p class="info-curso">36 hrs | $300.00</p>
                        </div>
                    </div>
                </a>

                <a href="cursoInfo.php?id=3" class="curso-link">
                    <div class="card-curso">
                        <img src="../ASSETS/cursos/img3.png" alt="Curso de Economía">
                        <div class="card-contenido">
                            <h4>Curso de Economía</h4>
                            <p>Comprende cómo funcionan los mercados y cómo se toman decisiones económicas en empresas y
                                gobiernos.</p>
                            <p class="info-curso">30 hrs | $300.00</p>
                        </div>
                    </div>
                </a>

                <a href="cursoInfo.php?id=4" class="curso-link">
                    <div class="card-curso">
                        <img src="../ASSETS/cursos/img4.png" alt="Curso de Contaduría">
                        <div class="card-contenido">
                            <h4>Curso de Contaduría</h4>
                            <p>Aprende a registrar, analizar y comunicar información financiera con precisión.</p>
                            <p class="info-curso">32 hrs | $300.00</p>
                        </div>
                    </div>
                </a>

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

    <!--- esto es la pestaña emergente para suscribirse al curso --->
    <div id="modal-inscripcion">
        <div class="modal-contenido">
            <button class="cerrar-modal">&times;</button>

            <h2>Inscribirme al Curso</h2>

            <div class="form-group">
                <label>
                    <input type="checkbox" id="ya-tengo-cuenta" /> Ya tengo cuenta
                </label>
            </div>

            <!-- 📌 NUEVO CONTENEDOR PARA APILAR LOS FORMULARIOS -->
            <div class="form-contenedor">
                <!-- LOGIN -->
                <div class="campos-login">
                    <div class="form-group fila-buscar align-left-container">
                        <label for="login-identificador" class="label-align-left">Correo o Teléfono</label>
                        <div class="input-contenedor">
                            <input type="text" id="login-identificador" placeholder="Ingresa tu correo o teléfono"
                                class="input-size-control" />
                            <button type="button" id="buscar-cuenta" class="btn-buscar-cuenta">Buscar</button>
                        </div>
                    </div>

                    <div id="error-cuenta" class="alerta-error">
                        Lo sentimos, no pudimos encontrar tu cuenta. Verifica que el correo o número de teléfono estén
                        escritos correctamente o regístrate para crear una nueva cuenta.
                    </div>

                    <p class="volver-a-registro">
                        ¿No tienes cuenta? <a href="#" id="volver-a-registro">Regístrate</a>
                    </p>
                </div>

                <!-- REGISTRO -->
                <form id="form-inscripcion">
                    <div class="campos-registro">
                        <div class="registro-header">
                            <label class="titulo-modal">Datos de Inscripción</label>
                        </div>

                        <div class="form-group">
                            <label for="nombre">Nombre</label>
                            <input type="text" id="nombre" />
                        </div>
                        <div class="form-group">
                            <label for="telefono">Teléfono</label>
                            <input type="text" id="telefono" />
                        </div>
                        <div class="form-group">
                            <label for="correo">Correo</label>
                            <input type="email" id="correo" />
                        </div>
                        <div class="form-group">
                            <label for="fecha-nacimiento">Fecha de Nacimiento</label>
                            <input type="date" id="fecha-nacimiento" />
                        </div>
                        <div class="form-group">
                            <label>Medio de contacto preferido</label>
                            <div style="display: flex; flex-direction: column; gap: 0.3rem;">
                                <label>
                                    <input type="checkbox" name="medios-contacto" value="telefono" />
                                    Teléfono
                                </label>
                                <label>
                                    <input type="checkbox" name="medios-contacto" value="correo" />
                                    Correo electrónico
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="curso-nombre">Curso seleccionado</label>
                            <input type="text" id="curso-nombre" readonly />
                        </div>
                        <button type="submit" class="btn-inscribirme">Enviar Inscripción</button>
                        <p class="aviso">
                            Al enviar tu inscripción, aceptas nuestras políticas de privacidad y autorizas el uso de tus
                            datos para fines académicos y administrativos. Pronto nos pondremos en contacto contigo para
                            confirmar tu registro.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </div>


    <script src="../JS/cursoInfo.js"></script>
    <script src="../JS/JSglobal.js"></script>
</body>

</html>