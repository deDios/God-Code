<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>GodCode</title>
    <link rel="stylesheet" href="/CSS/plantilla.css" />
    <link rel="stylesheet" href="/CSS/admin/drawers.admin.css" />
    <link rel="stylesheet" href="/CSS/admin/adminUAT.css" />
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












    <!-- Drawer: Curso -->
    <aside id="drawer-curso" class="drawer gc-dash" data-module="" aria-hidden="true" hidden>
        <div class="drawer-header">
            <div class="drawer-title" id="drawer-curso-title">Curso · —</div>
            <div class="drawer-actions">
                <button class="btn" id="drawer-curso-close">Cerrar</button>
            </div>
        </div>

        <div class="drawer-body" id="drawer-curso-body">
            <!-- Acciones  -->
            <div class="gc-actions" id="curso-actions-view">
                <!-- aquí inyectamos el botón dinamicamente -->
            </div>











            <!----------------------------------  MODO VISTA  ---------------------------------------------->
            <section id="curso-view" class="mode-view">
                <div class="field">
                    <div class="label">Nombre <span class="req">*</span></div>
                    <div class="value" id="v_nombre">—</div>
                </div>

                <div class="field">
                    <div class="label">Descripción breve <span class="req">*</span></div>
                    <div class="value" id="v_desc_breve">—</div>
                </div>

                <div class="field">
                    <div class="label">Descripción media <span class="req">*</span></div>
                    <div class="value" id="v_desc_media">—</div>
                </div>

                <div class="field">
                    <div class="label">Descripción del curso <span class="req">*</span></div>
                    <div class="value" id="v_desc_curso">—</div>
                </div>

                <div class="field">
                    <div class="label">Dirigido a <span class="req">*</span></div>
                    <div class="value" id="v_dirigido">—</div>
                </div>

                <div class="field">
                    <div class="label">Competencias <span class="req">*</span></div>
                    <div class="value" id="v_competencias">—</div>
                </div>

                <div class="grid-3">
                    <div class="field">
                        <div class="label">Tutor <span class="req">*</span></div>
                        <div class="value" id="v_tutor">—</div>
                    </div>
                    <div class="field">
                        <div class="label">Categoría <span class="req">*</span></div>
                        <div class="value" id="v_categoria">—</div>
                    </div>
                    <div class="field">
                        <div class="label">Prioridad <span class="req">*</span></div>
                        <div class="value" id="v_prioridad">—</div>
                    </div>
                </div>

                <div class="grid-3">
                    <div class="field">
                        <div class="label">Tipo de evaluación <span class="req">*</span></div>
                        <div class="value" id="v_tipo_eval">—</div>
                    </div>
                    <div class="field">
                        <div class="label">Actividades <span class="req">*</span></div>
                        <div class="value" id="v_actividades">—</div>
                    </div>
                    <div class="field">
                        <div class="label">Calendario <span class="req">*</span></div>
                        <div class="value" id="v_calendario">—</div>
                    </div>
                </div>

                <div class="grid-3">
                    <div class="field">
                        <div class="label">Horas <span class="req">*</span></div>
                        <div class="value" id="v_horas">—</div>
                    </div>
                    <div class="field">
                        <div class="label">Precio</div>
                        <div class="value" id="v_precio">—</div>
                    </div>
                    <div class="field">
                        <div class="label">Certificado</div>
                        <div class="value" id="v_certificado">—</div>
                    </div>
                </div>

                <div class="field">
                    <div class="label">Fecha de inicio <span class="req">*</span></div>
                    <div class="value" id="v_fecha">—</div>
                </div>

                <div class="field">
                    <div class="label">Estatus</div>
                    <div class="value" id="v_estatus">—</div>
                </div>

                <!-- Bloque de imágenes  -->
                <div class="field">
                    <div class="label">Imágenes existentes <span class="req">*</span></div>
                    <div class="value">
                        <div id="media-curso">
                            <!-- mountReadOnlyMedia({ type:'curso', id, editable }) -->
                        </div>
                        <div class="hint" style="color:#666;margin-top:.35rem;">Debe existir una portada válida.</div>
                    </div>
                </div>

                <!-- JSON Dev tools (opcional) -->
                <details class="dev-json" id="curso-json-box" open style="margin-top:16px;">
                    <summary style="cursor:pointer;font-weight:600;">JSON · Curso</summary>
                    <div style="display:flex;gap:.5rem;margin:.5rem 0;">
                        <button class="gc-btn" id="btn-copy-json-curso">Copiar JSON</button>
                    </div>
                    <pre id="json-curso" class="value"
                        style="white-space:pre-wrap;max-height:260px;overflow:auto;">{}</pre>
                </details>
            </section>










            <!-------------------------------------------- MODO EDICIÓN  ---------------------------------->
            <section id="curso-edit" class="mode-edit" hidden>
                <!-- Nombre -->
                <div class="field">
                    <label for="f_nombre">Nombre <span class="req">*</span></label>
                    <input id="f_nombre" type="text" maxlength="100" data-max="100" />
                    <small class="char-counter" data-for="f_nombre"></small>
                </div>

                <!-- Descripción breve -->
                <div class="field">
                    <label for="f_desc_breve">Descripción breve <span class="req">*</span></label>
                    <textarea id="f_desc_breve" rows="3" maxlength="250" data-max="250"></textarea>
                    <small class="char-counter" data-for="f_desc_breve"></small>
                </div>

                <!-- Descripción media -->
                <div class="field">
                    <label for="f_desc_media">Descripción media <span class="req">*</span></label>
                    <textarea id="f_desc_media" rows="4" maxlength="350" data-max="350"></textarea>
                    <small class="char-counter" data-for="f_desc_media"></small>
                </div>

                <!-- Descripción del curso -->
                <div class="field">
                    <label for="f_desc_curso">Descripción del larga <span class="req">*</span></label>
                    <textarea id="f_desc_curso" rows="6" maxlength="2000" data-max="2000"></textarea>
                    <small class="char-counter" data-for="f_desc_curso"></small>
                </div>

                <!-- Dirigido a -->
                <div class="field">
                    <label for="f_dirigido">Dirigido a <span class="req">*</span></label>
                    <textarea id="f_dirigido" rows="3" maxlength="250" data-max="250"></textarea>
                    <small class="char-counter" data-for="f_dirigido"></small>
                </div>

                <!-- Competencias -->
                <div class="field">
                    <label for="f_competencias">Competencias <span class="req">*</span></label>
                    <textarea id="f_competencias" rows="3" maxlength="250" data-max="250"></textarea>
                    <small class="char-counter" data-for="f_competencias"></small>
                </div>

                <!-- Tutor / Categoría / Prioridad -->
                <div class="grid-3">
                    <div class="field">
                        <label for="f_tutor">Tutor <span class="req">*</span></label>
                        <select id="f_tutor"></select>
                    </div>
                    <div class="field">
                        <label for="f_categoria">Categoría <span class="req">*</span></label>
                        <select id="f_categoria"></select>
                    </div>
                    <div class="field">
                        <label for="f_prioridad">Prioridad <span class="req">*</span></label>
                        <select id="f_prioridad"></select>
                    </div>
                </div>

                <!-- Tipo de evaluación / Actividades / Calendario -->
                <div class="grid-3">
                    <div class="field">
                        <label for="f_tipo_eval">Tipo de evaluación <span class="req">*</span></label>
                        <select id="f_tipo_eval"></select>
                    </div>
                    <div class="field">
                        <label for="f_actividades">Actividades <span class="req">*</span></label>
                        <select id="f_actividades"></select>
                    </div>
                    <div class="field">
                        <label for="f_calendario">Calendario <span class="req">*</span></label>
                        <select id="f_calendario"></select>
                    </div>
                </div>

                <!-- Horas / Precio / Certificado -->
                <div class="grid-3">
                    <div class="field">
                        <label for="f_horas">Horas <span class="req">*</span></label>
                        <input id="f_horas" type="number" min="1" step="1" />
                    </div>
                    <div class="field">
                        <label for="f_precio">Precio</label>
                        <input id="f_precio" type="number" min="0" step="0.01" />
                    </div>
                    <div class="field checkbox">
                        <label><input id="f_certificado" type="checkbox" /> Certificado</label>
                    </div>
                </div>

                <!-- Fecha de inicio -->
                <div class="field">
                    <label for="f_fecha">Fecha de inicio <span class="req">*</span></label>
                    <input id="f_fecha" type="date" />
                </div>

                <!-- Estatus -->
                <div class="field">
                    <label for="f_estatus">Estatus</label>
                    <select id="f_estatus"></select>
                </div>

                <!-- Imágenes (igual que en vista, antes del JSON) -->
                <div class="field">
                    <label>Imágenes existentes <span class="req">*</span></label>
                    <div class="value">
                        <div id="media-curso-edit">
                            <!-- mountCursoMedia(..., editable:true) -->
                        </div>
                        <div class="hint gc-soft">Solo archivos PNG/JPG que pesen hasta 2MB.</div>
                    </div>
                </div>

                <!-- Acciones -->
                <div class="drawer-actions-row">
                    <div class="row-right">
                        <button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button>
                        <button class="gc-btn gc-btn--success" id="btn-save">Guardar</button>
                    </div>
                </div>
            </section>
        </div>
    </aside>









    <!-- Drawer: Noticia -->
    <aside id="drawer-noticia" class="drawer gc-dash" aria-hidden="true" hidden>
        <div class="drawer-header">
            <div class="drawer-title" id="drawer-noticia-title">Noticia · —</div>
            <div class="drawer-actions">
                <button class="btn" id="drawer-noticia-close">Cerrar</button>
            </div>
        </div>

        <div class="drawer-body" id="drawer-noticia-body">

            <!-- Acciones (Editar / Eliminar / Reactivar) -->
            <div class="gc-actions" id="noticia-actions-view"></div>

            <!-- =================== MODO VISTA =================== -->
            <section id="noticia-view" class="mode-view">
                <div class="field">
                    <div class="label">Título <span class="req">*</span></div>
                    <div class="value" id="nv_titulo">—</div>
                </div>

                <div class="field">
                    <div class="label">Descripción 1 <span class="req">*</span></div>
                    <div class="value" id="nv_desc_uno">—</div>
                </div>

                <div class="field">
                    <div class="label">Descripción 2</div>
                    <div class="value" id="nv_desc_dos">—</div>
                </div>

                <div class="grid-3">
                    <div class="field">
                        <div class="label">Estatus</div>
                        <div class="value" id="nv_estatus">—</div>
                    </div>
                    <div class="field">
                        <div class="label">Creado por (id)</div>
                        <div class="value" id="nv_creado_por">—</div>
                    </div>
                    <div class="field">
                        <div class="label">Fecha creación</div>
                        <div class="value" id="nv_fecha_creacion">—</div>
                    </div>
                </div>

                <!-- Imágenes (solo lectura) -->
                <div class="field">
                    <div class="label">Imágenes</div>
                    <div class="value">
                        <div id="media-noticia">
                            <!-- mountNoticiaMediaView -->
                        </div>
                        <div class="hint" style="color:#666;margin-top:.35rem;">
                            Portada (pos 1) y secundaria (pos 2), si existen.
                        </div>
                    </div>
                </div>

                <!-- JSON Dev -->
                <details class="dev-json" id="noticia-json-box" open style="margin-top:16px;">
                    <summary style="cursor:pointer;font-weight:600;">JSON · Noticia</summary>
                    <div style="display:flex;gap:.5rem;margin:.5rem 0;">
                        <button class="gc-btn" id="btn-copy-json-noticia">Copiar JSON</button>
                    </div>
                    <pre id="json-noticia" class="value"
                        style="white-space:pre-wrap;max-height:260px;overflow:auto;">{}</pre>
                </details>
            </section>

            <!-- =================== MODO EDICIÓN =================== -->
            <section id="noticia-edit" class="mode-edit" hidden>
                <div class="field">
                    <label for="nf_titulo">Título <span class="req">*</span></label>
                    <input id="nf_titulo" type="text" maxlength="150" data-max="100" />
                    <small class="char-counter" data-for="nf_titulo"></small>
                </div>

                <div class="field">
                    <label for="nf_desc_uno">Descripción 1 <span class="req">*</span></label>
                    <textarea id="nf_desc_uno" rows="5" maxlength="2000" data-max="2000"></textarea>
                    <small class="char-counter" data-for="nf_desc_uno"></small>
                </div>

                <div class="field">
                    <label for="nf_desc_dos">Descripción 2</label>
                    <textarea id="nf_desc_dos" rows="6" maxlength="4000" data-max="2000"></textarea>
                    <small class="char-counter" data-for="nf_desc_dos"></small>
                </div>

                <!-- Estatus -->
                <div class="field">
                    <label for="nf_estatus">Estatus</label>
                    <select id="nf_estatus"></select>
                </div>

                <!-- Imágenes (editable) -->
                <div class="field">
                    <label>Imágenes</label>
                    <div class="value">
                        <div id="media-noticia-edit">
                            <!-- mountNoticiaMediaEdit -->
                        </div>
                        <div class="hint gc-soft">Formatos: JPG/PNG · Máx 2MB.</div>
                    </div>
                </div>

                <!-- Acciones -->
                <div class="drawer-actions-row">
                    <div class="row-right">
                        <button class="gc-btn gc-btn--ghost" id="btn-cancel-noticia">Cancelar</button>
                        <button class="gc-btn gc-btn--success" id="btn-save-noticia">Guardar</button>
                    </div>
                </div>
            </section>
        </div>
    </aside>









    <!-- Drawer: Tutor -->
    <aside id="drawer-tutor" class="drawer gc-dash" aria-hidden="true" hidden>
        <div class="drawer-header">
            <div class="drawer-title" id="drawer-tutor-title">Tutor · —</div>
            <div class="drawer-actions">
                <button class="btn" id="drawer-tutor-close">Cerrar</button>
            </div>
        </div>

        <div class="drawer-body" id="drawer-tutor-body">

            <!-- Acciones (Editar / Eliminar / Reactivar) -->
            <div class="gc-actions" id="tutor-actions-view"></div>

            <!-- =================== MODO VISTA =================== -->
            <section id="tutor-view" class="mode-view">
                <div class="field">
                    <div class="label">Nombre <span class="req">*</span></div>
                    <div class="value" id="tv_nombre">—</div>
                </div>

                <div class="field">
                    <div class="label">Descripción <span class="req">*</span></div>
                    <div class="value" id="tv_descripcion">—</div>
                </div>

                <div class="grid-3">
                    <div class="field">
                        <div class="label">Estatus</div>
                        <div class="value" id="tv_estatus">—</div>
                    </div>
                    <div class="field">
                        <div class="label">ID</div>
                        <div class="value" id="tv_id">—</div>
                    </div>
                    <div class="field">
                        <div class="label">Fecha creación</div>
                        <div class="value" id="tv_fecha_creacion">—</div>
                    </div>
                </div>

                <!-- Imagen (solo lectura) -->
                <div class="field">
                    <div class="label">Imagen</div>
                    <div class="value">
                        <div id="media-tutor" data-id="">
                            <!-- mountReadOnlyMedia({ type:"tutor", id }) -->
                        </div>
                        <div class="hint" style="color:#666;margin-top:.35rem;">Foto del tutor si existe.</div>
                    </div>
                </div>

                <!-- Cursos ligados (chips) -->
                <div class="field">
                    <div class="label">Cursos ligados</div>
                    <div class="value">
                        <div class="tutor-cursos" id="tutor-cursos">
                            <!-- renderTutorCursosChips(tutorId) -->
                        </div>
                        <div class="hint gc-soft" style="margin-top:.35rem;">Toca una imagen para abrir el curso en modo
                            solo lectura.</div>
                    </div>
                </div>

                <!-- JSON Dev -->
                <details class="dev-json" id="tutor-json-box" open style="margin-top:16px;">
                    <summary style="cursor:pointer;font-weight:600;">JSON · Tutor</summary>
                    <div style="display:flex;gap:.5rem;margin:.5rem 0;">
                        <button class="gc-btn" id="btn-copy-json-tutor">Copiar JSON</button>
                    </div>
                    <pre id="json-tutor" class="value"
                        style="white-space:pre-wrap;max-height:260px;overflow:auto;">{}</pre>
                </details>
            </section>

            <!-- =================== MODO EDICIÓN / CREAR =================== -->
            <section id="tutor-edit" class="mode-edit" hidden>
                <div class="field">
                    <label for="tf_nombre">Nombre <span class="req">*</span></label>
                    <input id="tf_nombre" type="text" maxlength="120" data-max="120" />
                    <small class="char-counter" data-for="tf_nombre"></small>
                </div>

                <div class="field">
                    <label for="tf_descripcion">Descripción <span class="req">*</span></label>
                    <textarea id="tf_descripcion" rows="8" maxlength="400" data-max="400"></textarea>
                    <small class="char-counter" data-for="tf_descripcion"></small>
                </div>

                <!-- Estatus -->
                <div class="field">
                    <label for="tf_estatus">Estatus</label>
                    <select id="tf_estatus"></select>
                </div>

                <!-- Imagen (editable en editar / selector en crear) -->
                <div class="field">
                    <label>Imagen</label>
                    <div class="value">
                        <!-- En crear, el JS pinta un preview/selector aqui -->
                        <div id="media-tutor-edit">
                            <!-- en edicion -->
                        </div>
                        <div class="hint gc-soft">Formatos: JPG/PNG · Máx 2MB.</div>
                    </div>
                </div>

                <!-- Cursos ligados -->
                <div class="field">
                    <label>Cursos ligados</label>
                    <div class="value">
                        <div class="tutor-cursos" id="tutor-cursos-edit">
                        </div>
                    </div>
                </div>

                <!-- Acciones -->
                <div class="drawer-actions-row">
                    <div class="row-right">
                        <button class="gc-btn gc-btn--ghost" id="btn-cancel-tutor">Cancelar</button>
                        <button class="gc-btn gc-btn--success" id="btn-save-tutor">Guardar</button>
                    </div>
                </div>
            </section>
        </div>
    </aside>















    <!-- Drawer: Suscripción -->
    <aside id="drawer-suscripcion" class="drawer gc-dash" aria-hidden="true" hidden>
        <div class="drawer-header">
            <div class="drawer-title" id="drawer-suscripcion-title">Suscripción · —</div>
            <div class="drawer-actions">
                <button class="btn" id="drawer-suscripcion-close">Cerrar</button>
            </div>
        </div>

        <div class="drawer-body" id="drawer-suscripcion-body">

            <!-- Acciones (Editar / Eliminar / Reactivar) – se inyectan por JS -->
            <div class="gc-actions" id="sus-actions-view"></div>

            <!-- =================== MODO VISTA =================== -->
            <section id="sus-view" class="mode-view" hidden>
                <div class="field">
                    <div class="label">Alumno</div>
                    <div class="value" id="sv_alumno">—</div>
                </div>

                <div class="field">
                    <div class="label">Curso</div>
                    <div class="value" id="sv_curso">—</div>
                </div>

                <div class="grid-3">
                    <div class="field">
                        <div class="label">Estatus</div>
                        <div class="value" id="sv_estatus">—</div>
                    </div>
                    <div class="field">
                        <div class="label">Creación</div>
                        <div class="value" id="sv_fecha_creacion">—</div>
                    </div>
                    <div class="field">
                        <div class="label">Inicio</div>
                        <div class="value" id="sv_inicio">—</div>
                    </div>
                </div>

                <div class="grid-3">
                    <div class="field">
                        <div class="label">Fin</div>
                        <div class="value" id="sv_fin">—</div>
                    </div>
                    <div class="field">
                        <div class="label">Monto</div>
                        <div class="value" id="sv_monto">—</div>
                    </div>
                    <div class="field">
                        <div class="label">Moneda</div>
                        <div class="value" id="sv_moneda">—</div>
                    </div>
                </div>

                <div class="field">
                    <div class="label">Comentario</div>
                    <div class="value" id="sv_comentario">—</div>
                </div>

                <!-- JSON Dev -->
                <details class="dev-json" id="sus-json-box" open style="margin-top:16px;">
                    <summary style="cursor:pointer;font-weight:600;">JSON · Suscripción</summary>
                    <div style="display:flex;gap:.5rem;margin:.5rem 0;">
                        <button class="gc-btn" id="btn-copy-json-sus">Copiar JSON</button>
                    </div>
                    <pre id="json-sus" class="value"
                        style="white-space:pre-wrap;max-height:260px;overflow:auto;">{}</pre>
                </details>
            </section>

            <!-- =================== MODO EDICIÓN (editar suscripción existente) =================== -->
            <section id="sus-edit" class="mode-edit" hidden>
                <div class="grid-3">
                    <div class="field">
                        <label>Alumno</label>
                        <div class="value" id="se_alumno">—</div>
                    </div>
                    <div class="field">
                        <label>Curso</label>
                        <div class="value" id="se_curso">—</div>
                    </div>
                    <div class="field">
                        <label for="se_estatus">Estatus</label>
                        <select id="se_estatus"></select>
                    </div>
                </div>

                <div class="field">
                    <label for="se_comentario">Comentario</label>
                    <textarea id="se_comentario" rows="4" maxlength="200" data-max="200"></textarea>
                </div>

                <!-- Acciones -->
                <div class="drawer-actions-row">
                    <div class="row-right">
                        <button class="gc-btn gc-btn--ghost" id="se_cancel">Cancelar</button>
                        <button class="gc-btn gc-btn--success" id="se_save">Guardar</button>
                    </div>
                </div>
            </section>

            <!-- =================== MODO CREAR (Inscribir) =================== -->
            <section id="sus-create" class="mode-edit" hidden>
                <!-- Acciones arriba -->
                <div class="drawer-actions-row" style="justify-content:flex-start; gap:8px; margin-top:-8px;">
                    <button class="gc-btn gc-btn--ghost" id="sc_cancel_head">Cancelar</button>
                    <button class="gc-btn gc-btn--success" id="sc_inscribir" disabled>Inscribir</button>
                </div>

                <!-- Selección de curso -->
                <div class="field">
                    <label for="sc_curso">Curso <span class="req">*</span></label>
                    <select id="sc_curso">
                        <option value="">— Selecciona un curso —</option>
                        <!-- opciones se inyectan por JS -->
                    </select>
                </div>

                <!-- Búsqueda de usuario -->
                <div class="field">
                    <label for="sc_ident">Buscar cuenta (teléfono o correo) <span class="req">*</span></label>
                    <div style="display:flex;gap:8px;align-items:center;">
                        <input id="sc_ident" type="text" placeholder="3322… o correo@dominio">
                        <button class="gc-btn" id="sc_buscar">Buscar</button>
                        <button class="gc-btn gc-btn--ghost" id="sc_cambiar" disabled>Cambiar usuario</button>
                    </div>
                </div>

                <!-- Panel de datos del usuario encontrado -->
                <div id="sc_user_panel" style="display:none;">
                    <div class="field">
                        <label>Nombre</label>
                        <input id="sc_nombre" type="text" disabled>
                    </div>
                    <div class="field">
                        <label>Correo</label>
                        <input id="sc_correo" type="email" disabled>
                    </div>
                    <div class="field">
                        <label>Teléfono</label>
                        <input id="sc_tel" type="text" disabled>
                    </div>
                    <div class="field">
                        <label>Fecha de nacimiento</label>
                        <input id="sc_fnac" type="date" disabled>
                    </div>

                    <div class="field">
                        <label>Medios de contacto</label>
                        <div class="value" style="display:flex;gap:18px;">
                            <label><input id="sc_mc_tel" type="checkbox" disabled> Teléfono</label>
                            <label><input id="sc_mc_mail" type="checkbox" disabled> Correo</label>
                        </div>
                    </div>
                </div>

                <!-- Comentario -->
                <div class="field">
                    <label for="sc_comentario">Comentario</label>
                    <textarea id="sc_comentario" rows="3" placeholder="Opcional"></textarea>
                </div>

                <!-- Acciones abajo -->
                <div class="drawer-actions-row">
                    <div class="row-right">
                        <button class="gc-btn gc-btn--ghost" id="sc_cancel">Cancelar</button>
                        <button class="gc-btn gc-btn--success" id="sc_inscribir_b" disabled>Inscribir</button>
                    </div>
                </div>
            </section>

        </div>
    </aside>


















    <!-- Contadores de caracteres -->
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
    <script src="/JS/UAT/ui/utils.admin.js"></script>
    <script src="/JS/JSglobal.js" defer></script>
    <script src="/JS/UAT/ui/admin.guard.js"></script>
    <script src="/JS/UAT/admin.router.js" defer></script>

    <script src="/JS/UAT/admin.cursos.js" defer></script>

</body>

</html>