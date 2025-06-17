<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Academia GodCode</title>
    <link rel="stylesheet" href="../CSS/index.css" />
</head>

<body>
    <!-- Tope de pagina -->
    <header id="header">
        <!-- esta barra en el tope de pagina solo renderiza segun la resolucion de las pantallas pequeñas -->
        <div class="social-bar-mobile">
            <div class="icon-mobile">
                <img src="../ASSETS/index/Facebook.png" alt="Facebook" />
            </div>
            <div class="icon-mobile">
                <img src="../ASSETS/index/Instagram.png" alt="Instagram" />
            </div>
            <div class="icon-mobile">
                <img src="../ASSETS/index/Tiktok.png" alt="TikTok" />
            </div>
            <!-- icono de usuario para despues hacer el login pero para la vista mobile-->
            <div class="user-icon-mobile" onclick="window.location.href='../VIEW/Login.php'">
                <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                    alt="Usuario" />
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
                        alt="Usuario" />
                </div>
            </div>

        </div>
        <!-- Barra de navegación pequeña -->
        <div id="mobile-menu" class="subnav">
            <a href="../index.php">Inicio</a>
            <a href="#">Productos</a>
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
        <!-- seccion 1 -->
        <section id="curso" class="curso-detalle">
            <div class="curso-contenido">
                <h4>Habilidades Financieras</h4>
                <h2 class="titulo">Curso Administrativo</h2>
                <p class="descripcion-corta">
                    Desarrolla habilidades clave para organizar, planificar y tomar decisiones efectivas.<br>
                    Aprende a gestionar equipos y recursos con eficiencia en cualquier entorno empresarial.
                </p>
                <img src="../ASSETS/cursoInfo/cursoInfo_img1.png" alt="Curso Administrativo">

                <div class="texto-descriptivo">
                    <p>
                        En el entorno organizacional actual, la administración eficiente de recursos, procesos y equipos
                        se ha convertido en una competencia esencial para el éxito de cualquier empresa...
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
                    <button class="btn-secundario">Solicita más información</button>
                </div>

                <div class="precio-box">
                    <p class="precio">$300</p>
                    <small>Curso más libre acceso a la zona común</small>
                    <button class="btn-principal">Inscribirme al curso</button>

                    <ul class="detalles-lista">
                        <li><img src="../ASSETS/cursoInfo/icono-tiempo.png" alt=""> 2 Horas al día</li>
                        <li><img src="../ASSETS/cursoInfo/icono-actividades.png" alt=""> Diversas actividades</li>
                        <li><img src="../ASSETS/cursoInfo/icono-evaluacion.png" alt=""> Evaluación semanal</li>
                        <li><img src="../ASSETS/cursoInfo/icono-horarios.png" alt=""> Diversos horarios disponibles</li>
                        <li><img src="../ASSETS/cursoInfo/icono-certificado.png" alt=""> Certificado disponible según
                            modalidad</li>
                        <li><img src="../ASSETS/cursoInfo/icono-curriculum.png" alt=""> ¡Empieza tu formación hoy mismo!
                        </li>
                    </ul>
                </div>
            </aside>
        </section>

        <!-- seccion 2 -->
        <section id="curso-detalle-extra">
            <div class="acordeon-box">
                <div class="item">
                    <div class="cabecera" onclick="toggleAcordeon(this)">
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

                <div class="item">
                    <div class="cabecera" onclick="toggleAcordeon(this)">
                        <h4>Dirigido a </h4>
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
                            habilidades
                            en organización, planificación y gestión eficiente de recursos.
                        </p>
                    </div>
                </div>

                <div class="item">
                    <div class="cabecera" onclick="toggleAcordeon(this)">
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

        <!-- seccion 3 -->
        <section id="otros-cursos">
            <h2>Otros cursos que te pueden interesar</h2>
            <div class="cards-cursos">

                <div class="card-curso">
                    <img src="../ASSETS/cursos/cursos_img1.png" alt="Curso de PHP">
                    <div class="card-contenido">
                        <a href="#">Curso de PHP</a>
                        <p>Domina PHP desde cero y aprende a desarrollar sitios web dinámicos y funcionales.</p>
                        <p class="horas">Cant. de horas separadas de duración</p>
                        <p class="precio">Precio: <strong>$300</strong></p>
                    </div>
                </div>

                <div class="card-curso">
                    <img src="../ASSETS/cursos/cursos_img2.png" alt="Gestión Financiera">
                    <div class="card-contenido">
                        <a href="#">Curso de Gestión Financiera</a>
                        <p>Adquiere herramientas clave para tomar decisiones financieras acertadas y mejorar tu salud
                            económica.</p>
                        <p class="horas">Cant. de horas separadas de duración</p>
                        <p class="precio">Precio: <strong>$300</strong></p>
                    </div>
                </div>

                <div class="card-curso">
                    <img src="../ASSETS/cursos/cursos_img3.png" alt="Curso de Economía">
                    <div class="card-contenido">
                        <a href="#">Curso de Economía</a>
                        <p>Comprende cómo funcionan los mercados y cómo se toman decisiones económicas en empresas y
                            gobiernos.</p>
                        <p class="horas">Cant. de horas separadas de duración</p>
                        <p class="precio">Precio: <strong>$300</strong></p>
                    </div>
                </div>

                <div class="card-curso">
                    <img src="../ASSETS/cursos/cursos_img4.png" alt="Curso de Contaduría">
                    <div class="card-contenido">
                        <a href="#">Curso de Contaduría</a>
                        <p>Aprende a registrar, analizar y comunicar información financiera con precisión.</p>
                        <p class="horas">Cant. de horas separadas de duración</p>
                        <p class="precio">Precio: <strong>$300</strong></p>
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

    <script src="../JS/index.js"></script>
</body>

</html>