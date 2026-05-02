<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>GodCode</title>

    <link rel="stylesheet" href="/CSS/plantilla.css" />
    <link rel="stylesheet" href="/CSS/blogV2.css" />
</head>

<body>
    <!-- Header global -->
    <header id="header">
        <!-- Barra mobile -->
        <div class="social-bar-mobile">
            <div class="social-icons">
                <div class="icon-mobile">
                    <img src="/ASSETS/index/Facebook.png" alt="Facebook" />
                </div>
                <div class="icon-mobile">
                    <img src="/ASSETS/index/Instagram.png" alt="Instagram" />
                </div>
                <div class="icon-mobile">
                    <img src="/ASSETS/index/Tiktok.png" alt="TikTok" />
                </div>

                <div class="user-icon-mobile" onclick="window.location.href='/VIEW/Login.php'">
                    <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                        alt="Usuario" />
                </div>
            </div>
        </div>

        <!-- Top bar -->
        <div class="top-bar" id="top-bar">
            <div id="logo-btn" class="logo">
                <img src="/ASSETS/godcode_icon.png" alt="Logo GodCode" class="logo-icon">
                GodCode
            </div>

            <div class="hamburger" onclick="toggleMenu()">☰</div>

            <div class="actions">
                <button class="btn btn-outline" onclick="location.href='#'">Cotizar</button>
                <button class="btn btn-primary" onclick="location.href='/VIEW/Inscripcion.php'">Registrarse</button>

                <div class="user-icon" onclick="window.location.href='/VIEW/Login.php'">
                    <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                        alt="Usuario" />
                </div>
            </div>
        </div>

        <!-- Subnav -->
        <div id="mobile-menu" class="subnav">
            <a href="/index.php">Inicio</a>

            <div class="nav-item has-megamenu desktop-only" id="submenu-productos">
                <a href="#">Productos</a>

                <div class="megamenu">
                    <div class="col">
                        <h4>Lo que hacemos</h4>
                        <ul>
                            <li>
                                <a href="/VIEW/DesarrolloWeb.php">
                                    <img src="/ASSETS/ProductosPopUp/DesarrolloWeb.png" alt="Web">
                                    Desarrollo Web
                                </a>
                            </li>
                            <li>
                                <a href="/VIEW/DesarrolloMobile.php">
                                    <img src="/ASSETS/ProductosPopUp/DesarrolloMobile.png" alt="Mobile">
                                    Desarrollo Mobile
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div class="col">
                        <h4>Servicios</h4>
                        <ul>
                            <li>
                                <a href="/VIEW/ServiciosEnLaNube.php">
                                    <img src="/ASSETS/ProductosPopUp/ServiciosEnLaNube.png" alt="Nube">
                                    Servicios en la Nube
                                </a>
                            </li>
                            <li>
                                <a href="/VIEW/DisenoUXUI.php">
                                    <img src="/ASSETS/ProductosPopUp/DiseñoUXUI.png" alt="UX/UI">
                                    Diseño UX/UI
                                </a>
                            </li>
                            <li>
                                <a href="/VIEW/ServicioEducativo.php">
                                    <img src="/ASSETS/ProductosPopUp/ServicioEducativo.png" alt="Servicio educativo">
                                    Servicio educativo
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div class="col">
                        <h4>Industrias</h4>
                        <ul>
                            <li>
                                <a href="/VIEW/IndustriaEducacion.php">
                                    <img src="/ASSETS/ProductosPopUp/Educacion.png" alt="Educación">
                                    Educación
                                </a>
                            </li>
                            <li>
                                <a href="/VIEW/IndustriaTecnologia.php">
                                    <img src="/ASSETS/ProductosPopUp/Tecnologia.png" alt="Tecnología">
                                    Tecnología
                                </a>
                            </li>
                            <li>
                                <a href="/VIEW/IndustriaFinanciera.php">
                                    <img src="/ASSETS/ProductosPopUp/Finanzas.png" alt="Finanzas">
                                    Finanzas
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div class="col tecnologias full-width">
                        <h4>Tecnologías</h4>
                        <div class="tech-icons">
                            <span><img src="/ASSETS/ProductosPopUp/Tecnologias/Azure.png" alt="Azure"> Azure</span>
                            <span><img src="/ASSETS/ProductosPopUp/Tecnologias/Php.png" alt="PHP"> PHP</span>
                            <span><img src="/ASSETS/ProductosPopUp/Tecnologias/Kotlin.png" alt="Kotlin"> Kotlin</span>
                            <span><img src="/ASSETS/ProductosPopUp/Tecnologias/SwiftUI.png" alt="SwiftUI">
                                SwiftUI</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="nav-item mobile-only">
                <a href="/VIEW/ProductosMobile.php" class="btn-contacto active">Productos</a>
            </div>

            <a href="/VIEW/Nosotros.php">Nosotros</a>
            <a href="/VIEW/Blog.php">Blog</a>

            <div class="social-icons">
                <div class="circle-icon">
                    <img src="/ASSETS/index/Facebook.png" alt="Facebook" />
                </div>
                <div class="circle-icon">
                    <img src="/ASSETS/index/Instagram.png" alt="Instagram" />
                </div>
                <div class="circle-icon">
                    <img src="/ASSETS/index/Tiktok.png" alt="TikTok" />
                </div>
            </div>
        </div>
    </header>

    <!-- Contenido principal -->
    <main class="blog-v2-main">
        <!-- Section 1 modulo de noticias, casi igual que antes (Blog godcode) -->
        <section id="blog-v2-hero" class="blog-v2-section">
            <div class="blog-v2-limit">
                <header class="blog-v2-header">
                    <h1>Blog GodCode</h1>
                    <h2>Lo Nuevo, lo importante,<br>lo que viene</h2>
                    <p>
                        Explora el futuro hoy<br>
                        Descubre las últimas noticias en tecnología, innovación y avances que están transformando el
                        mundo.<br>
                        Explora las últimas noticias en tecnología y avances que están transformando el mundo
                    </p>
                </header>

                <div class="blog-v2-carousel">
                    <div class="blog-v2-viewport">
                        <div class="blog-v2-track" id="blog-v2-noticias-track">
                            <!-- Noticias dinamicas -->
                        </div>
                    </div>

                    <div class="blog-v2-dots" id="blog-v2-dots"></div>
                </div>
            </div>
        </section>

        <!-- Section 2 noticias de la comunidad -->
        <section id="blog-v2-community">
            <div class="blog-v2-community-limit">
                <header class="blog-v2-community-title">
                    <img src="/ASSETS/icons/icon_tag.png" alt="" aria-hidden="true">
                    <h2>Noticias de la comunidad</h2>
                </header>

                <div class="blog-v2-community-grid">
                    <article class="blog-v2-ranking">
                        <h3>Lo mas leído esta semana</h3>

                        <div class="blog-v2-ranking-list">
                            <div class="blog-v2-ranking-item">
                                <strong>1.</strong>
                                <img src="/ASSETS/Blog/blog_img1.png" alt="">
                                <p>Microsoft anuncia Windows 12: Todo lo que sabemos</p>
                            </div>

                            <div class="blog-v2-ranking-item">
                                <strong>2.</strong>
                                <img src="/ASSETS/Blog/blog_img2.png" alt="">
                                <p>OpenAI presenta GPT-4o: Más rápido y potente</p>
                            </div>

                            <div class="blog-v2-ranking-item">
                                <strong>3.</strong>
                                <img src="/ASSETS/Blog/blog_img3.png" alt="">
                                <p>Android 15: Novedades y dispositivos compatibles.</p>
                            </div>

                            <div class="blog-v2-ranking-item">
                                <strong>4.</strong>
                                <img src="/ASSETS/Blog/blog_img1.png" alt="">
                                <p>Apple Vision Pro 2 en camino: Nuevas filtraciones</p>
                            </div>
                        </div>

                        <a href="#" class="blog-v2-ranking-link">Ver ranking completo <span>→</span></a>
                    </article>

                    <article class="blog-v2-submit">
                        <img class="blog-v2-submit-icon" src="/ASSETS/icons/icon_email.png" alt="" aria-hidden="true">

                        <h3>Envíanos noticias interesantes</h3>
                        <p>
                            Envía tus mejores noticias, nosotros las aprobaremos y las publicaremos en nuestra página,
                            dándole los créditos en nuestras redes.
                        </p>

                        <form class="blog-v2-submit-form">
                            <input type="text" name="titulo" placeholder="Título o URL">
                            <textarea name="descripcion" placeholder="Descripción"></textarea>
                            <button type="submit">Enviar</button>
                        </form>

                        <div class="blog-v2-spam-note">
                            <img src="/ASSETS/icons/icon_spam.png" alt="" aria-hidden="true">
                            <span>Sin Spam. Envía noticias interesantes</span>
                        </div>
                    </article>
                </div>
            </div>
        </section>

    </main>

    <!-- JS global debe estar en todas las views -->
    <script src="/JS/JSglobal.js"></script>

    <!-- Carga de modulos -->
    <script src="/JS/blogV2.js"></script>


</body>

</html>