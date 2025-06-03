<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GodCode</title>
    <link rel="stylesheet" href="CSS/index.css">
</head>

<body>
    <!-- esta barra en el tope de pagina solo renderiza segun la resolucion de las pantallas -->
    <div class="social-bar-mobile">
        <div class="circle-icon-mobile">
            <img src="ASSETS/index/facebook_icon.png" alt="Facebook" />
        </div>
        <div class="circle-icon-mobile">
            <img src="ASSETS/index/facebook_icon.png" alt="Instagram" />
        </div>
        <div class="circle-icon-mobile">
            <img src="ASSETS/index/facebook_icon.png" alt="TikTok" />
        </div>
        <!-- icono de usuario para despues hacer el login pero para la vista mobile-->
        <div class="user-icon-mobile">
            <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                alt="Usuario" />
        </div>
    </div>

    <!-- Tope de pagina -->
    <header>
        <div class="top-bar">
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
                <div class="user-icon">
                    <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                        alt="Usuario" />
                </div>
            </div>

        </div>
        <!-- Barra de navegación pequeña -->
        <div id="mobile-menu" class="subnav">
            <a href="#" class="active">Inicio</a>
            <a href="#">Productos</a>
            <a href="#">Quiénes somos</a>
            <a href="#">Ubicación</a>

            <div class="social-icons">
                <div class="circle-icon">
                    <img src="ASSETS/index/facebook_icon.png" alt="Facebook" />
                </div>
                <div class="circle-icon">
                    <img src="ASSETS/index/facebook_icon.png" alt="Instagram" />
                </div>
                <div class="circle-icon">
                    <img src="ASSETS/index/facebook_icon.png" alt="TikTok" />
                </div>
            </div>
        </div>
    </header>

    <main>
        <!-- Contenido principal -->
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
                <div id="lista-noticias"></div>
                <div id="paginacion" class="paginacion"></div>
            </div>
        </section>


        <!-- Siguiente seccion del contenido -->
        <section class="recuadros-section">

            <div class="fila-recuadros fila-3">

                <div class="recuadro recuadro-azul">
                    <img src="ASSETS/index/calendario.png" alt="Azul" />
                </div>

                <div class="recuadro recuadro-verde">
                    <img src="ASSETS/index/barras.png" alt="Azul" />
                </div>

                <div class="recuadro recuadro-rojo">
                    <img src="ASSETS/index/tienda.png" alt="Rojo" />
                </div>
            </div>

            <div class="fila-recuadros fila-2">

                <div class="recuadro recuadro-amarillo">
                    <img src="ASSETS/index/planeta.png" alt="Azul" />
                </div>

                <div class="recuadro recuadro-morado">
                    <img src="ASSETS/index/celular.png" alt="Azul" />
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