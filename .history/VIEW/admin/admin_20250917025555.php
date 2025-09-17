<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>GodCode</title>
    <link rel="stylesheet" href="../../CSS/plantilla.css" />
    <link rel="stylesheet" href="../../CSS/admin/admin.css" />
</head>

<body>
    <!-- Tope de pagina -->
    <header id="header">
        <!-- esta barra en el tope de pagina solo renderiza segun la resolucion de las pantallas pequeñas -->
        <div class="social-bar-mobile">
            <div class="social-icons">
                <div class="icon-mobile">
                    <img src="../../ASSETS/index/Facebook.png" alt="Facebook" />
                </div>
                <div class="icon-mobile">
                    <img src="../../ASSETS/index/Instagram.png" alt="Instagram" />
                </div>
                <div class="icon-mobile">
                    <img src="../../ASSETS/index/Tiktok.png" alt="TikTok" />
                </div>
                <!-- Icono de usuario para login en vista mobile -->
                <div class="user-icon-mobile" onclick="window.location.href='../../VIEW/Login.php'">
                    <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                        alt="Usuario" />
                </div>
            </div>
        </div>

        <div class="top-bar" id="top-bar">
            <div id="logo-btn" class="logo">
                <img src="../../ASSETS/godcode_icon.png" alt="Logo GodCode" class="logo-icon">
                GodCode
            </div>

            <!--Boton hamburguesa que aparece segun la resolucion-->
            <div class="hamburger" onclick="toggleMenu()">☰</div>

            <div class="actions">
                <button class="btn btn-outline" onclick="location.href='#'">Cotizar</button>
                <button class="btn btn-primary"
                    onclick="location.href='../../VIEW/Inscripcion.php'">Registrarse</button>
                <!-- icono de usuario para despues hacer el login -->
                <div class="user-icon" onclick="window.location.href='../../VIEW/Login.php'">
                    <img src="https://img.freepik.com/premium-vector/free-vector-user-icon-simple-line_901408-588.jpg"
                        alt="Usuario" href="../../VIEW/Login.php" />
                </div>
            </div>
        </div>

        <!-- Barra de navegación pequeña -->
        <div id="mobile-menu" class="subnav">
            <a href="../../index.php">Inicio</a>
            <div class="nav-item has-megamenu desktop-only" id="submenu-productos">
                <a href="#" class="active">Productos</a>
                <div class="megamenu">
                    <div class="col">
                        <h4>Lo que hacemos</h4>
                        <ul>
                            <li><a href="../../VIEW/DesarrolloWeb.php"><img
                                        src="../../ASSETS/ProductosPopUp/DesarrolloWeb.png" alt="Web">Desarrollo Web</a>
                            </li>
                            <li><a href="../../VIEW/DesarrolloMobile.php"><img
                                        src="../../ASSETS/ProductosPopUp/DesarrolloMobile.png" alt="Mobile">Desarrollo
                                    Mobile</a></li>
                        </ul>
                    </div>
                    <div class="col">
                        <h4>Servicios</h4>
                        <ul>
                            <li><a href="../../VIEW/ServiciosEnLaNube.php"><img
                                        src="../../ASSETS/ProductosPopUp/ServiciosEnLaNube.png" alt="Nube">Servicios
                                    en la Nube</a></li>
                            <li><a href="../../VIEW/DisenoUXUI.php"><img
                                        src="../../ASSETS/ProductosPopUp/DiseñoUXUI.png" alt="UX/UI">Diseño UX/UI</a>
                            </li>
                            <li><a href="../../VIEW/ServicioEducativo.php"><img
                                        src="../../ASSETS/ProductosPopUp/ServicioEducativo.png">Servicio
                                    educativo</a></li>
                        </ul>
                    </div>
                    <div class="col">
                        <h4>Industrias</h4>
                        <ul>
                            <li><a href="../../VIEW/IndustriaEducacion.php"><img
                                        src="../../ASSETS/ProductosPopUp/Educacion.png" alt="Educación">Educación</a>
                            </li>
                            <li><a href="../../VIEW/IndustriaTecnologia.php"><img
                                        src="../../ASSETS/ProductosPopUp/Tecnologia.png" alt="Tecnología">Tecnología</a>
                            </li>
                            <li><a href="../../VIEW/IndustriaFinanciera.php"><img
                                        src="../../ASSETS/ProductosPopUp/Finanzas.png" alt="Finanzas">Finanzas</a>
                            </li>
                        </ul>
                    </div>
                    <div class="col tecnologias full-width">
                        <h4>Tecnologías</h4>
                        <div class="tech-icons">
                            <span><img src="../../ASSETS/ProductosPopUp/Tecnologias/Azure.png" alt="Azure"> Azure</span>
                            <span><img src="../../ASSETS/ProductosPopUp/Tecnologias/Php.png" alt="PHP"> PHP</span>
                            <span><img src="../../ASSETS/ProductosPopUp/Tecnologias/Kotlin.png" alt="Kotlin">
                                Kotlin</span>
                            <span><img src="../../ASSETS/ProductosPopUp/Tecnologias/SwiftUI.png" alt="SwiftUI">
                                SwiftUI</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="nav-item mobile-only">
                <a href="../../VIEW/ProductosMobile.php" class="btn-contacto active">Productos</a>
            </div>

            <a href="../../VIEW/Nosotros.php">Nosotros</a>
            <a href="../../VIEW/Blog.php">Blog</a>

            <div class="social-icons">
                <div class="circle-icon">
                    <img src="../../ASSETS/index/Facebook.png" alt="Facebook" />
                </div>
                <div class="circle-icon">
                    <img src="../../ASSETS/index/Instagram.png" alt="Instagram" />
                </div>
                <div class="circle-icon">
                    <img src="../../ASSETS/index/Tiktok.png" alt="TikTok" />
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
                    <span class="icon"><img src="../../ASSETS/Admin/cursos.png" alt="" aria-hidden="true"></span>
                    <span class="label">Cursos</span>
                </a>

                <a class="nav-item" href="#/noticias" data-route="#/noticias">
                    <span class="icon"><img src="../../ASSETS/Admin/noticias.png" alt="" aria-hidden="true"></span>
                    <span class="label">Noticias</span>
                </a>

                <!-- NUEVO: Tutores -->
                <a class="nav-item" href="#/tutores" data-route="#/tutores">
                    <span class="icon"><img src="../../ASSETS/Admin/tutores.png" alt="" aria-hidden="true"></span>
                    <span class="label">Tutores</span>
                </a>

                <!-- NUEVO: Suscripciones -->
                <a class="nav-item" href="#/suscripciones" data-route="#/suscripciones">
                    <span class="icon"><img src="../../ASSETS/Admin/suscripciones.png" alt="" aria-hidden="true"></span>
                    <span class="label">Suscripciones</span>
                </a>
            </div>

            <div class="nav-group">
                <div class="group-label">Contacto y reclutamiento</div>

                <a class="nav-item" href="#/contacto" data-route="#/contacto">
                    <span class="icon"><img src="../../ASSETS/Admin/contacto.png" alt="" aria-hidden="true"></span>
                    <span class="label">Contacto</span>
                </a>

                <a class="nav-item" href="#/reclutamiento" data-route="#/reclutamiento">
                    <span class="icon"><img src="../../ASSETS/Admin/reclutamiento.png" alt="" aria-hidden="true"></span>
                    <span class="label">Reclutamiento</span>
                </a>
            </div>

            <div class="nav-group">
                <div class="group-label">Usuarios y cuenta</div>

                <a class="nav-item" href="#/usuarios" data-route="#/usuarios">
                    <span class="icon"><img src="../../ASSETS/Admin/usuarios.png" alt="" aria-hidden="true"></span>
                    <span class="label">Usuarios</span>
                </a>

                <a class="nav-item" href="#/cuentas" data-route="#/cuentas">
                    <span class="icon"><img src="../../ASSETS/Admin/cuentas.png" alt="" aria-hidden="true"></span>
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


        <!-- Drawer · TUTOR -->
        <aside id="drawer-tutor" class="drawer gc-dash" aria-hidden="true" hidden>
            <div class="drawer-header">
                <div class="drawer-title" id="drawer-tutor-title">Tutor · —</div>
                <div class="drawer-actions">
                    <button class="btn" id="drawer-tutor-close">Cerrar</button>
                </div>
            </div>

            <div class="drawer-body" id="drawer-tutor-body">
                <!-- Acciones (modo vista) -->
                <div class="gc-actions" id="tutor-actions-view">
                    <button class="gc-btn" id="t-btn-edit">Editar</button>
                    <button class="gc-btn gc-btn--danger" id="t-btn-delete" data-step="1">Eliminar</button>
                </div>

                <!-- ===== MODO VISTA ===== -->
                <section id="tutor-view" class="mode-view">
                    <div class="field">
                        <div class="label">Nombre <span class="req">*</span></div>
                        <div class="value" id="tv_nombre">—</div>
                    </div>

                    <div class="grid-3">
                        <div class="field">
                            <div class="label">Correo <span class="req">*</span></div>
                            <div class="value" id="tv_correo">—</div>
                        </div>
                        <div class="field">
                            <div class="label">Teléfono</div>
                            <div class="value" id="tv_telefono">—</div>
                        </div>
                        <div class="field">
                            <div class="label">Estatus</div>
                            <div class="value" id="tv_estatus">—</div>
                        </div>
                    </div>

                    <div class="field">
                        <div class="label">Resumen</div>
                        <div class="value" id="tv_resumen">—</div>
                    </div>

                    <div class="field">
                        <div class="label">Descripción</div>
                        <div class="value" id="tv_descripcion">—</div>
                    </div>

                    <!-- Foto (solo lectura) -->
                    <div class="field">
                        <div class="label">Foto</div>
                        <div class="value">
                            <div id="media-tutor">
                                <!-- mountTutorMediaView(...) -->
                            </div>
                            <div class="hint" style="color:#666;margin-top:.35rem;">JPG/PNG recomendado 1:1.</div>
                        </div>
                    </div>

                    <!-- JSON Dev -->
                    <details class="dev-json" id="tutor-json-box" open style="margin-top:16px;">
                        <summary style="cursor:pointer;font-weight:600;">JSON · Tutor</summary>
                        <div style="display:flex;gap:.5rem;margin:.5rem 0;">
                            <button class="gc-btn" id="t-btn-copy-json">Copiar JSON</button>
                        </div>
                        <pre id="json-tutor" class="value"
                            style="white-space:pre-wrap;max-height:260px;overflow:auto;">{}</pre>
                    </details>
                </section>

                <!-- ===== MODO EDICIÓN ===== -->
                <section id="tutor-edit" class="mode-edit" hidden>
                    <div class="field">
                        <label for="t_nombre">Nombre <span class="req">*</span></label>
                        <input id="t_nombre" type="text" maxlength="120" data-max="120" />
                        <small class="char-counter" data-for="t_nombre"></small>
                    </div>

                    <div class="grid-3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
                        <div class="field">
                            <label for="t_correo">Correo <span class="req">*</span></label>
                            <input id="t_correo" type="email" maxlength="160" data-max="160" />
                            <small class="char-counter" data-for="t_correo"></small>
                        </div>
                        <div class="field">
                            <label for="t_telefono">Teléfono</label>
                            <input id="t_telefono" type="tel" maxlength="32" data-max="32" />
                            <small class="char-counter" data-for="t_telefono"></small>
                        </div>
                        <div class="field">
                            <label for="t_estatus">Estatus</label>
                            <select id="t_estatus"></select>
                        </div>
                    </div>

                    <div class="field">
                        <label for="t_resumen">Resumen</label>
                        <textarea id="t_resumen" rows="3" maxlength="300" data-max="300"></textarea>
                        <small class="char-counter" data-for="t_resumen"></small>
                    </div>

                    <div class="field">
                        <label for="t_descripcion">Descripción</label>
                        <textarea id="t_descripcion" rows="6" maxlength="4000" data-max="4000"></textarea>
                        <small class="char-counter" data-for="t_descripcion"></small>
                    </div>

                    <!-- Foto (editable con lápiz) -->
                    <div class="field">
                        <label>Foto</label>
                        <div class="value">
                            <div id="media-tutor-edit">
                                <!-- mountTutorMediaEdit(..., editable:true) -->
                            </div>
                            <div class="hint" style="color:#666;margin-top:.35rem;">JPG/PNG · Máx 2MB</div>
                        </div>
                    </div>

                    <div class="drawer-actions-row">
                        <div class="row-right">
                            <button class="gc-btn gc-btn--ghost" id="t-btn-cancel">Cancelar</button>
                            <button class="gc-btn gc-btn--success" id="t-btn-save">Guardar</button>
                        </div>
                    </div>
                </section>
            </div>
        </aside>


    </main>




    <!-- Drawer -->
    <aside id="gc-drawer" class="drawer gc-dash" aria-hidden="true">
        <div class="drawer-header">
            <div class="drawer-title" id="drawer-title">Detalle</div>
            <div class="drawer-actions">
                <button class="btn" id="drawer-close">Cerrar</button>
            </div>
        </div>
        <div class="drawer-body" id="drawer-body">
            <!-- contenido dinámico -->
        </div>
    </aside>
    <div class="gc-dash-overlay" id="gc-dash-overlay"></div>

    <script src="../../JS/JSglobal.js"></script>
    <script src="../../JS/admin/admin.js"></script>

</body>

</html>