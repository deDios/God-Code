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
                <button onclick="moverCarrusel(-1)">
                    <img src="../ASSETS/Nosotros/flechaIzquierda.png" alt="Anterior">
                </button>
                <span id="indicador">1 / 3</span>
                <button onclick="moverCarrusel(1)">
                    <img src="../ASSETS/Nosotros/flechaDerecha.png" alt="Siguiente">
                </button>
            </div>
        </section>

        <section class="proyectos">
            <h2>Proyectos de <span>GodCode</span></h2>

            <div class="proyecto">
                <div class="texto">
                    <h3>Mobility solutions</h3>
                    <p>Desarrollamos el sitio web de Mobility Solutions Corp, una empresa especializada en soluciones de
                        movilidad eléctrica y sustentable. Nuestro objetivo fue crear una plataforma moderna, intuitiva
                        y totalmente responsive que reflejara su compromiso con la innovación y el medio
                        ambiente.<br><br>
                        El sitio ofrece una navegación fluida, integración de formularios de contacto personalizados y
                        un diseño limpio que resalta la identidad de la marca. Este proyecto demuestra cómo GodCode
                        transforma ideas en soluciones digitales sólidas, escalables y enfocadas en el usuario final.
                    </p>
                </div>
                <div class="imagen">
                    <img src="../ASSETS/Nosotros/seccion3_img1.png" alt="Mobility Solutions">
                </div>
            </div>

            <div class="proyecto">
                <div class="imagen">
                    <img src="../ASSETS/Nosotros/seccion3_img2.png" alt="Luna Cafe">
                </div>
                <div class="texto">
                    <h3>Luna cafe</h3>
                    <p>Diseñamos y desarrollamos una aplicación de punto de venta (POS) exclusiva para Luna Café,
                        pensada para dispositivos iOS. El sistema permite gestionar ventas, controlar inventario,
                        generar reportes diarios y agilizar el proceso de atención al cliente con una interfaz amigable
                        y táctil.</p>
                </div>
            </div>
        </section>

        <section class="creciendoJuntos">
  <h2>Creciendo juntos <span>#GodCode</span></h2>
  <div class="creciendoJuntos-contenido">
    <div class="bloque">
      <h3>Careers en GodCode</h3>
      <p>Inspírate con las historias de éxito de quienes han trabajado con nosotros para hacer crecer sus negocios y alcanzar resultados increíbles.</p>
    </div>
    <div class="bloque">
      <h3>Conecta con nosotros.</h3>
      <p>
        <strong>nuestros contactos:</strong><br>
        Celular:<br>
        +52 33 3333 3333<br>
        +52 33 3333 3333<br><br>
        Email:<br>
        correo@gmail.com<br>
        correo@gmail.com
      </p>
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