<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>GodCode</title>
    <link rel="stylesheet" href="/CSS/plantilla.css" />
    <link rel="stylesheet" href="/CSS/admin/admin.css" />
    <link rel="stylesheet" href="/CSS/admin/drawers.admin.css" />
</head>

<body>
    <!-- Tope de pagina -->
    <header id="header">
        <!-- esta barra en el tope de pagina solo renderiza segun la resolucion de las pantallas pequeñas -->
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
                <!-- Icono de usuario para login en vista mobile -->
                <div class="user-icon-mobile" onclick="window.location.href='/VIEW/Login.php'">
                    <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                        alt="Usuario" />
                </div>
            </div>
        </div>

        <div class="top-bar" id="top-bar">
            <div id="logo-btn" class="logo">
                <img src="/ASSETS/godcode_icon.png" alt="Logo GodCode" class="logo-icon">
                GodCode
            </div>

            <!--Boton hamburguesa que aparece segun la resolucion-->
            <div class="hamburger" onclick="toggleMenu()">☰</div>

            <div class="actions">
                <button class="btn btn-outline" onclick="location.href='#'">Cotizar</button>
                <button class="btn btn-primary" onclick="location.href='/VIEW/Inscripcion.php'">Registrarse</button>
                <!-- icono de usuario para despues hacer el login -->
                <div class="user-icon" onclick="window.location.href='/VIEW/Login.php'">
                    <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                        alt="Usuario" href="/VIEW/Login.php" />
                </div>
            </div>
        </div>

        <!-- Barra de navegación pequeña -->
        <div id="mobile-menu" class="subnav">
            <a href="/index.php">Inicio</a>
            <div class="nav-item has-megamenu desktop-only" id="submenu-productos">
                <a href="#" class="active">Productos</a>
                <div class="megamenu">
                    <div class="col">
                        <h4>Lo que hacemos</h4>
                        <ul>
                            <li><a href="/VIEW/DesarrolloWeb.php"><img src="/ASSETS/ProductosPopUp/DesarrolloWeb.png"
                                        alt="Web">Desarrollo Web</a>
                            </li>
                            <li><a href="/VIEW/DesarrolloMobile.php"><img
                                        src="/ASSETS/ProductosPopUp/DesarrolloMobile.png" alt="Mobile">Desarrollo
                                    Mobile</a></li>
                        </ul>
                    </div>
                    <div class="col">
                        <h4>Servicios</h4>
                        <ul>
                            <li><a href="/VIEW/ServiciosEnLaNube.php"><img
                                        src="/ASSETS/ProductosPopUp/ServiciosEnLaNube.png" alt="Nube">Servicios
                                    en la Nube</a></li>
                            <li><a href="/VIEW/DisenoUXUI.php"><img src="/ASSETS/ProductosPopUp/DiseñoUXUI.png"
                                        alt="UX/UI">Diseño UX/UI</a>
                            </li>
                            <li><a href="/VIEW/ServicioEducativo.php"><img
                                        src="/ASSETS/ProductosPopUp/ServicioEducativo.png">Servicio
                                    educativo</a></li>
                        </ul>
                    </div>
                    <div class="col">
                        <h4>Industrias</h4>
                        <ul>
                            <li><a href="/VIEW/IndustriaEducacion.php"><img src="/ASSETS/ProductosPopUp/Educacion.png"
                                        alt="Educación">Educación</a>
                            </li>
                            <li><a href="/VIEW/IndustriaTecnologia.php"><img src="/ASSETS/ProductosPopUp/Tecnologia.png"
                                        alt="Tecnología">Tecnología</a>
                            </li>
                            <li><a href="/VIEW/IndustriaFinanciera.php"><img src="/ASSETS/ProductosPopUp/Finanzas.png"
                                        alt="Finanzas">Finanzas</a>
                            </li>
                        </ul>
                    </div>
                    <div class="col tecnologias full-width">
                        <h4>Tecnologías</h4>
                        <div class="tech-icons">
                            <span><img src="/ASSETS/ProductosPopUp/Tecnologias/Azure.png" alt="Azure"> Azure</span>
                            <span><img src="/ASSETS/ProductosPopUp/Tecnologias/Php.png" alt="PHP"> PHP</span>
                            <span><img src="/ASSETS/ProductosPopUp/Tecnologias/Kotlin.png" alt="Kotlin">
                                Kotlin</span>
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


    <main id="home-main" class="gc-dash">

        <!-- Sidebar -->
        <nav class="gc-side" aria-label="Configuración y administración">
            <h3 class="side-title">Configuración y<br>Administración</h3>

            <div class="nav-group">
                <div class="group-label">Cursos y Noticias</div>

                <a class="nav-item" href="#/cursos" data-route="#/cursos" aria-current="page">
                    <span class="icon"><img src="/ASSETS/Admin/cursos.png" alt="" aria-hidden="true"></span>
                    <span class="label">Cursos</span>
                </a>

                <a class="nav-item" href="#/noticias" data-route="#/noticias">
                    <span class="icon"><img src="/ASSETS/Admin/noticias.png" alt="" aria-hidden="true"></span>
                    <span class="label">Noticias</span>
                </a>

                <!-- Tutores -->
                <a class="nav-item" href="#/tutores" data-route="#/tutores">
                    <span class="icon"><img src="/ASSETS/Admin/tutores.png" alt="" aria-hidden="true"></span>
                    <span class="label">Tutores</span>
                </a>

                <!-- Suscripciones -->
                <a class="nav-item" href="#/suscripciones" data-route="#/suscripciones">
                    <span class="icon"><img src="/ASSETS/Admin/suscripciones.png" alt="" aria-hidden="true"></span>
                    <span class="label">Suscripciones</span>
                </a>
            </div>

            <div class="nav-group">
                <div class="group-label">Contacto y reclutamiento</div>

                <a class="nav-item" href="#/contacto" data-route="#/contacto">
                    <span class="icon"><img src="/ASSETS/Admin/contacto.png" alt="" aria-hidden="true"></span>
                    <span class="label">Contacto</span>
                </a>

                <a class="nav-item" href="#/reclutamiento" data-route="#/reclutamiento">
                    <span class="icon"><img src="/ASSETS/Admin/reclutamiento.png" alt="" aria-hidden="true"></span>
                    <span class="label">Reclutamiento</span>
                </a>
            </div>

            <div class="nav-group">
                <div class="group-label">Usuarios y cuenta</div>

                <a class="nav-item" href="#/usuarios" data-route="#/usuarios">
                    <span class="icon"><img src="/ASSETS/Admin/usuarios.png" alt="" aria-hidden="true"></span>
                    <span class="label">Usuarios</span>
                </a>

                <a class="nav-item" href="#/cuentas" data-route="#/cuentas">
                    <span class="icon"><img src="/ASSETS/Admin/cuentas.png" alt="" aria-hidden="true"></span>
                    <span class="label">Cuenta</span>
                </a>
            </div>
        </nav>

        <!-- Contenido principal -->
        <section class="main-content">

            <!-- Toolbar -->
            <header class="dash-toolbar">
                <div class="left">
                    <h2 id="mod-title" class="sr-only" aria-live="polite">—</h2>

                    <div class="searchbox">
                        <input id="search-input" type="search" placeholder="Buscar" autocomplete="off" />
                    </div>

                    <div class="tt-meta">
                        <span class="tt-title">Cursos:</span>
                        <span id="mod-count" aria-live="polite">—</span>
                        <span class="tt-sep">·</span>
                        <span class="tt-title">Estado:</span>
                        <!-- se actualiza por JS según el filtro/endpoint -->
                        <span id="tt-status" class="badge-activo">Activo</span>
                    </div>
                </div>

                <div class="right">
                    <!-- Boton crear nuevo recurso  -->
                    <button id="btn-add" class="icon-btn blue" type="button" aria-label="Crear nuevo" title="Crear">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
            </header>

            <!-- Tabla Desktop -->
            <section class="recursos-box desktop-only">
                <div class="recursos-table" role="table" aria-label="Listado">
                    <div class="table-header" role="rowgroup">
                        <div class="col-nombre" role="columnheader">Nombre</div>
                        <div class="col-tutor" role="columnheader">Tutor</div>
                        <div class="col-fecha" role="columnheader">Fecha de inicio</div>
                        <div class="col-status" role="columnheader">Status</div>
                    </div>
                    <div class="table-body" id="recursos-list" role="rowgroup">
                        <!-- filas por JS -->
                    </div>
                </div>
                <div id="pagination-controls" class="pagination-controls"></div>
            </section>

            <!-- Tabla Mobile -->
            <section class="recursos-box mobile-only">
                <div class="recursos-table-mobile">
                    <div class="table-header">
                        <div class="col-nombre">Nombre</div>
                    </div>
                    <div class="table-body" id="recursos-list-mobile">
                        <!-- filas por JS -->
                    </div>
                </div>
                <div id="pagination-mobile" class="pagination-controls"></div>
            </section>

        </section>

    </main>

    <!-- Drawers para cada modulo (cursos,noticias,tutores,usuarios,suscripciones de momento son esos solamente) -->

    <!-- Drawer: Curso -->
    <aside class="gc-drawer" id="drawer-curso" role="dialog" aria-modal="true" aria-labelledby="drawer-curso-title"
        aria-hidden="true" hidden>
        <div class="drawer-header">
            <h2 class="drawer-title" id="drawer-curso-title">Curso</h2>
            <div class="drawer-actions">
                <button class="btn" id="drawer-curso-close" aria-label="Cerrar">Cerrar</button>
            </div>
        </div>

        <div class="drawer-body" id="drawer-curso-body">
            <section class="form-grid">
                <div id="media-curso" class="media-zone" aria-label="Imágenes"></div>

                <div class="fields">
                    <div class="field">
                        <label for="f_nombre">Nombre</label>
                        <input id="f_nombre" type="text" maxlength="120" data-max="120" />
                        <small class="char-counter" data-for="f_nombre"></small>
                    </div>

                    <div class="field">
                        <label for="f_desc_breve">Descripción breve</label>
                        <textarea id="f_desc_breve" rows="3" maxlength="240" data-max="240"></textarea>
                        <small class="char-counter" data-for="f_desc_breve"></small>
                    </div>

                    <div class="field">
                        <label for="f_desc_curso">Descripción del larga</label>
                        <textarea id="f_desc_curso" rows="6" maxlength="2000" data-max="2000"></textarea>
                        <small class="char-counter" data-for="f_desc_curso"></small>
                    </div>

                    <div class="field">
                        <label for="f_desc_media">Descripción media</label>
                        <textarea id="f_desc_media" rows="4" maxlength="1000" data-max="1000"></textarea>
                        <small class="char-counter" data-for="f_desc_media"></small>
                    </div>

                    <div class="field">
                        <label for="f_dirigido">Dirigido a</label>
                        <textarea id="f_dirigido" rows="3" maxlength="600" data-max="600"></textarea>
                        <small class="char-counter" data-for="f_dirigido"></small>
                    </div>

                    <div class="field">
                        <label for="f_competencias">Competencias</label>
                        <textarea id="f_competencias" rows="3" maxlength="800" data-max="800"></textarea>
                        <small class="char-counter" data-for="f_competencias"></small>
                    </div>

                    <div class="field checkbox">
                        <label><input id="f_certificado" type="checkbox" /> Certificado</label>
                    </div>

                    <div class="grid-3">
                        <div class="field">
                            <label for="f_tutor">Tutor</label>
                            <select id="f_tutor"></select>
                        </div>
                        <div class="field">
                            <label for="f_horas">Horas</label>
                            <input id="f_horas" type="number" min="1" step="1" />
                        </div>
                        <div class="field">
                            <label for="f_precio">Precio</label>
                            <input id="f_precio" type="number" min="0" step="0.01" />
                        </div>
                    </div>

                    <div class="grid-3">
                        <div class="field">
                            <label for="f_estatus">Estatus</label>
                            <select id="f_estatus"></select>
                        </div>
                        <div class="field">
                            <label for="f_fecha">Fecha inicio</label>
                            <input id="f_fecha" type="date" />
                        </div>
                        <div class="field">
                            <label for="f_prioridad">Prioridad</label>
                            <select id="f_prioridad"></select>
                        </div>
                    </div>

                    <div class="grid-3">
                        <div class="field">
                            <label for="f_categoria">Categoría</label>
                            <select id="f_categoria"></select>
                        </div>
                        <div class="field">
                            <label for="f_calendario">Calendario</label>
                            <select id="f_calendario"></select>
                        </div>
                        <div class="field">
                            <label for="f_tipo_eval">Tipo evaluación</label>
                            <select id="f_tipo_eval"></select>
                        </div>
                    </div>

                    <div class="field">
                        <label for="f_actividades">Actividades</label>
                        <select id="f_actividades"></select>
                    </div>
                </div>
            </section>

            <footer class="drawer-footer">
                <button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button>
                <button class="gc-btn gc-btn--primary" id="btn-edit">Editar</button>
                <button class="gc-btn gc-btn--success" id="btn-save">Guardar</button>
            </footer>
        </div>
    </aside>

    <!-- Drawer: Noticia (IDs según admin.js: f_tit, f_desc1, f_desc2, f_estatus) -->
    <aside class="gc-drawer" id="drawer-noticia" role="dialog" aria-modal="true" aria-labelledby="drawer-noticia-title"
        aria-hidden="true" hidden>
        <div class="drawer-header">
            <h2 class="drawer-title" id="drawer-noticia-title">Noticia</h2>
            <div class="drawer-actions">
                <button class="btn" id="drawer-noticia-close" aria-label="Cerrar">Cerrar</button>
            </div>
        </div>

        <div class="drawer-body" id="drawer-noticia-body">
            <section class="form-grid">
                <div id="media-noticia" class="media-zone" aria-label="Imágenes"></div>

                <div class="fields">
                    <div class="field">
                        <label for="f_tit">Título</label>
                        <input id="f_tit" type="text" maxlength="160" data-max="160" />
                        <small class="char-counter" data-for="f_tit"></small>
                    </div>

                    <div class="field">
                        <label for="f_desc1">Descripción (1)</label>
                        <textarea id="f_desc1" rows="4" maxlength="1000" data-max="1000"></textarea>
                        <small class="char-counter" data-for="f_desc1"></small>
                    </div>

                    <div class="field">
                        <label for="f_desc2">Descripción (2)</label>
                        <textarea id="f_desc2" rows="4" maxlength="1000" data-max="1000"></textarea>
                        <small class="char-counter" data-for="f_desc2"></small>
                    </div>

                    <div class="field">
                        <label for="f_estatus">Estatus</label>
                        <select id="f_estatus"></select>
                    </div>
                </div>
            </section>

            <footer class="drawer-footer">
                <button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button>
                <button class="gc-btn gc-btn--primary" id="btn-edit">Editar</button>
                <button class="gc-btn gc-btn--success" id="btn-save">Guardar</button>
            </footer>
        </div>
    </aside>

    <!-- Drawer: Tutor (IDs según admin.js: f_nombre, f_desc, f_estatus) -->
    <aside class="gc-drawer" id="drawer-tutor" role="dialog" aria-modal="true" aria-labelledby="drawer-tutor-title"
        aria-hidden="true" hidden>
        <div class="drawer-header">
            <h2 class="drawer-title" id="drawer-tutor-title">Tutor</h2>
            <div class="drawer-actions">
                <button class="btn" id="drawer-tutor-close" aria-label="Cerrar">Cerrar</button>
            </div>
        </div>

        <div class="drawer-body" id="drawer-tutor-body">
            <section class="form-grid">
                <div id="media-tutor" class="media-zone" aria-label="Imágenes"></div>

                <div class="fields">
                    <div class="field">
                        <label for="f_nombre">Nombre</label>
                        <input id="f_nombre" type="text" maxlength="120" data-max="120" />
                        <small class="char-counter" data-for="f_nombre"></small>
                    </div>

                    <div class="field">
                        <label for="f_desc">Descripción</label>
                        <textarea id="f_desc" rows="4" maxlength="1000" data-max="1000"></textarea>
                        <small class="char-counter" data-for="f_desc"></small>
                    </div>

                    <div class="field">
                        <label for="f_estatus">Estatus</label>
                        <select id="f_estatus"></select>
                    </div>
                </div>
            </section>

            <footer class="drawer-footer">
                <button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button>
                <button class="gc-btn gc-btn--primary" id="btn-edit">Editar</button>
                <button class="gc-btn gc-btn--success" id="btn-save">Guardar</button>
            </footer>
        </div>
    </aside>

    <!-- Drawer: Usuario (IDs según admin.js: u_* + media-usuario) -->
    <aside class="gc-drawer" id="drawer-usuario" role="dialog" aria-modal="true" aria-labelledby="drawer-usuario-title"
        aria-hidden="true" hidden>
        <div class="drawer-header">
            <h2 class="drawer-title" id="drawer-usuario-title">Usuario</h2>
            <div class="drawer-actions">
                <button class="btn" id="drawer-usuario-close" aria-label="Cerrar">Cerrar</button>
            </div>
        </div>

        <div class="drawer-body" id="drawer-usuario-body">
            <section class="form-grid">
                <div id="media-usuario" class="media-zone" aria-label="Avatar"></div>

                <div class="fields">
                    <div class="field">
                        <label for="u_nombre">Nombre</label>
                        <input id="u_nombre" type="text" maxlength="120" data-max="120" />
                        <small class="char-counter" data-for="u_nombre"></small>
                    </div>

                    <div class="field">
                        <label for="u_correo">Correo</label>
                        <input id="u_correo" type="email" maxlength="160" data-max="160" />
                        <small class="char-counter" data-for="u_correo"></small>
                    </div>

                    <div class="field">
                        <label for="u_telefono">Teléfono</label>
                        <input id="u_telefono" type="tel" maxlength="20" data-max="20" />
                        <small class="char-counter" data-for="u_telefono"></small>
                    </div>

                    <div class="grid-3">
                        <div class="field">
                            <label for="u_fnac">Fecha de nacimiento</label>
                            <input id="u_fnac" type="date" />
                        </div>
                        <div class="field">
                            <label for="u_tcontacto">Tiempo de contacto</label>
                            <input id="u_tcontacto" type="text" maxlength="60" data-max="60" />
                            <small class="char-counter" data-for="u_tcontacto"></small>
                        </div>
                        <div class="field">
                            <label for="u_estatus">Estatus</label>
                            <select id="u_estatus"></select>
                        </div>
                    </div>
                </div>
            </section>

            <footer class="drawer-footer">
                <button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button>
                <button class="gc-btn gc-btn--primary" id="btn-edit">Editar</button>
                <button class="gc-btn gc-btn--success" id="btn-save">Guardar</button>
            </footer>
        </div>
    </aside>

    <!-- Drawer: Suscripción (IDs según admin.js: s_comentario, s_estatus) -->
    <aside class="gc-drawer" id="drawer-suscripcion" role="dialog" aria-modal="true"
        aria-labelledby="drawer-suscripcion-title" aria-hidden="true" hidden>
        <div class="drawer-header">
            <h2 class="drawer-title" id="drawer-suscripcion-title">Suscripción</h2>
            <div class="drawer-actions">
                <button class="btn" id="drawer-suscripcion-close" aria-label="Cerrar">Cerrar</button>
            </div>
        </div>

        <div class="drawer-body" id="drawer-suscripcion-body">
            <section class="form-grid">
                <div id="media-suscripcion" class="media-zone" aria-label="Imágenes"></div>

                <div class="fields">
                    <div class="field">
                        <label for="s_comentario">Comentario</label>
                        <textarea id="s_comentario" rows="3" maxlength="500" data-max="500"></textarea> 
                        <small class="char-counter" data-for="s_comentario"></small>
                    </div>

                    <div class="field">
                        <label for="s_estatus">Estatus</label>
                        <select id="s_estatus"></select>
                    </div>
                </div>
            </section>

            <footer class="drawer-footer">
                <button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button>
                <button class="gc-btn gc-btn--primary" id="btn-edit">Editar</button>
                <button class="gc-btn gc-btn--success" id="btn-save">Guardar</button>
            </footer>
        </div>
    </aside>
    
    <!-- Contadores de caracteres sencillo -->
    <script>
    (function() {
        function updateOne(el) {
            var max = Number(el.getAttribute('data-max') || 0);
            if (!max) return;
            var id = el.id;
            var cc = document.querySelector('.char-counter[data-for="' + id + '"]');
            if (!cc) return;
            var v = (el.value || "");
            cc.textContent = v.length + "/" + max;
            if (v.length > max) cc.classList.add('over');
            else cc.classList.remove('over');
        }

        function bind(el) {
            if (!el) return;
            updateOne(el);
            el.addEventListener('input', function() {
                updateOne(el);
            });
        }
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('[data-max]').forEach(bind);
        });
    })();
    </script>


    <div class="gc-dash-overlay" id="gc-dash-overlay"></div>

    <script src="/JS/JSglobal.js"></script>
    <script src="/JS/UAT/admin.cursos.js"></script>

</body>

</html>