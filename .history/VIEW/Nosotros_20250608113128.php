<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="../CSS/index.css">
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
            <div class="user-icon-mobile">
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
                <div class="user-icon">
                    <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                        alt="Usuario" />
                </div>
            </div>

        </div>
        <!-- Barra de navegación pequeña -->
        <div id="mobile-menu" class="subnav">
            <a href="#">Inicio</a>
            <a href="#">Productos</a>
            <a href="#" class="active">Quiénes somos</a>
            <a href="#">Ubicación</a>

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
            <div class="bloque-nosotros fila normal">
                <div class="decoracion"></div>
                <img src="../ASSETS/Nosotros/seccion1_img1.png" alt="Acerca de nosotros" class="imagen-nosotros">
                <div class="texto-nosotros">
                    <h3>Acerca de nosotros.</h3>
                    <p>En GoDCode, somos una startup especializada en desarrollo web que transforma ideas en soluciones
                        digitales funcionales y estéticas. Colaboramos estrechamente con nuestros clientes para ayudar a
                        emprendedores, empresas y proyectos a construir su presencia en línea de forma efectiva.</p>
                </div>
            </div>

            <!-- Nuestra misión -->
            <div class="bloque-nosotros fila invertida">
                <div class="decoracion"></div>
                <img src="../ASSETS/Nosotros/seccion1_img2.png" alt="Nuestra misión" class="imagen-nosotros">
                <div class="texto-nosotros">
                    <h3>Nuestra misión.</h3>
                    <p>En GoDCode, nuestra misión es ofrecer soluciones digitales innovadoras que impulsen el
                        crecimiento de nuestros clientes. Buscamos transformar ideas en herramientas funcionales a
                        través del desarrollo web.</p>
                </div>

            </div>

            <!-- Nuestra historia -->
            <div class="bloque-nosotros fila normal">
                <div class="decoracion"></div>
                <img src="../ASSETS/Nosotros/seccion1_img3.png" alt="Nuestra historia" class="imagen-nosotros">
                <div class="texto-nosotros">
                    <h3>Nuestra historia.</h3>
                    <p>Descripción de nuestra historia.</p>
                </div>
            </div>

        </section>

        <section class="testimonios">
            <h2>Lo que nuestros clientes dicen</h2>
            <p class="subtitulo">
                Inspírate con las historias de éxito de quienes han trabajado con nosotros para hacer crecer su negocio
                y alcanzar resultados increíbles.
            </p>

            <div class="contenedor-carrusel">
                <div class="carrusel">

                    <div class="slide activo">
                        <div class="texto-testimonio">
                            <p>Gracias a GOD CODE pudimos digitalizar nuestro negocio y duplicamos nuestras ventas en
                                solo 3 meses.</p>
                            <strong>Juan Pérez</strong><br>
                            <span>Cerrajería El Rápido | Propietario</span>
                        </div>
                        <img src="../ASSETS/Nosotros/seccion2_imgCliente1.png" alt="Cliente 1" class="img-testimonio">
                    </div>

                    <div class="slide">
                        <div class="texto-testimonio">
                            <p>Con su ayuda logramos automatizar procesos internos. Ahora tenemos un sistema que
                                facilita nuestra gestión diaria.</p>
                            <strong>Laura Gómez</strong><br>
                            <span>AutoPartes Gómez | Administradora</span>
                        </div>
                        <img src="https://www.gstatic.com/marketing-cms/assets/images/ads/20/ba/763dc59e453e8cbf4956919888d1/overview2.png=s538-fcrop64=1,00000000ffffffff-rw" alt="Cliente 2" class="img-testimonio">
                    </div>

                    <div class="slide">
                        <div class="texto-testimonio">
                            <p>El equipo de GOD CODE es profesional y atento. Nos ayudaron a construir una plataforma
                                que ahora usan cientos de usuarios.</p>
                            <strong>Andrés Martínez</strong><br>
                            <span>Grow Beta | Fundador</span>
                        </div>
                        <img src="../ASSETS/Nosotros/" alt="Cliente 3" class="img-testimonio">
                    </div>
                </div>

                <div class="botones-carrusel">
                    <img src="../ASSETS/Nosotros/flechaIzquierda.png" alt="Anterior" class="btn-carrusel" onclick="moverCarrusel(-1)">
                    <span id="indicador">1 / 3</span>
                    <img src="../ASSETS/Nosotros/flechaDerecha.png" alt="Siguiente" class="btn-carrusel" onclick="moverCarrusel(1)">
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