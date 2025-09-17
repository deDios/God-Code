<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>GodCode</title>
    <link rel="stylesheet" href="/CSS/plantilla.css" />
    <link rel="stylesheet" href="/CSS/admin/drawers.admin.css" />
    <link rel="stylesheet" href="/CSS/admin/admin.css" />
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
    <aside id="drawer-curso" class="drawer gc-dash" aria-hidden="true" hidden>
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









    <!-- ------------------------------------------ Drawer  Noticias ----------------------------- -->
    <aside id="drawer-curso" class="drawer gc-dash" hidden aria-hidden="true">
        <!-- Header -->
        <header class="drawer-head">
            <h3 id="drawer-curso-title">Noticia · —</h3>
            <button id="drawer-curso-close" class="icon-btn" title="Cerrar" aria-label="Cerrar">
                ✕
            </button>
        </header>

        <!-- Contenido scroll -->
        <div class="drawer-body">
            <!-- ===== Vista (read-only) ===== -->
            <section id="curso-view">
                <!-- Acciones (editar / eliminar o reactivar) -->
                <div class="gc-actions" id="curso-actions-view">
                    <button class="gc-btn" id="btn-edit">Editar</button>
                    <button class="gc-btn gc-btn--danger" id="btn-delete" data-step="1">Eliminar</button>
                </div>

                <!-- Grid principal -->
                <div class="grid-two">
                    <!-- Columna izquierda -->
                    <div class="card">
                        <h4 class="card-title">Contenido</h4>
                        <div class="kv">
                            <div class="k">Título</div>
                            <div class="v" id="v_nombre">—</div>
                        </div>
                        <div class="kv">
                            <div class="k">Resumen</div>
                            <div class="v" id="v_desc_breve">—</div>
                        </div>
                        <div class="kv">
                            <div class="k">Cuerpo</div>
                            <div class="v" id="v_desc_media">—</div>
                        </div>

                        <!-- Campos “compat” (no usados en noticias pero los dejamos para que el JS no truene) -->
                        <div class="kv" style="display:none">
                            <div class="k">Descripción curso</div>
                            <div class="v" id="v_desc_curso">—</div>
                        </div>
                        <div class="kv" style="display:none">
                            <div class="k">Dirigido</div>
                            <div class="v" id="v_dirigido">—</div>
                        </div>
                        <div class="kv" style="display:none">
                            <div class="k">Competencias</div>
                            <div class="v" id="v_competencias">—</div>
                        </div>

                        <div class="sep"></div>

                        <div class="kv">
                            <div class="k">Fecha</div>
                            <div class="v" id="v_fecha">—</div>
                        </div>
                        <div class="kv">
                            <div class="k">Estatus</div>
                            <div class="v" id="v_estatus">—</div>
                        </div>

                        <!-- Más “compat” ocultos -->
                        <div class="kv" style="display:none">
                            <div class="k">Tutor</div>
                            <div class="v" id="v_tutor">—</div>
                        </div>
                        <div class="kv" style="display:none">
                            <div class="k">Categoría</div>
                            <div class="v" id="v_categoria">—</div>
                        </div>
                        <div class="kv" style="display:none">
                            <div class="k">Prioridad</div>
                            <div class="v" id="v_prioridad">—</div>
                        </div>
                        <div class="kv" style="display:none">
                            <div class="k">Tipo evaluación</div>
                            <div class="v" id="v_tipo_eval">—</div>
                        </div>
                        <div class="kv" style="display:none">
                            <div class="k">Actividades</div>
                            <div class="v" id="v_actividades">—</div>
                        </div>
                        <div class="kv" style="display:none">
                            <div class="k">Calendario</div>
                            <div class="v" id="v_calendario">—</div>
                        </div>
                        <div class="kv" style="display:none">
                            <div class="k">Horas</div>
                            <div class="v" id="v_horas">—</div>
                        </div>
                        <div class="kv" style="display:none">
                            <div class="k">Precio</div>
                            <div class="v" id="v_precio">—</div>
                        </div>
                        <div class="kv" style="display:none">
                            <div class="k">Certificado</div>
                            <div class="v" id="v_certificado">—</div>
                        </div>
                    </div>

                    <!-- Columna derecha: Imágenes -->
                    <div class="card">
                        <div id="media-curso">
                            <!-- lo rellena JS: 2 imágenes (pos 1 y 2) -->
                        </div>
                    </div>
                </div>

                <!-- Debug JSON -->
                <div class="card" style="margin-top:12px">
                    <h4 class="card-title">Debug</h4>
                    <pre id="json-curso" class="debug-pre">—</pre>
                </div>
            </section>

            <!-- ===== Edición (form) ===== -->
            <section id="curso-edit" hidden>
                <form class="form-grid" onsubmit="return false;">
                    <div class="card">
                        <h4 class="card-title">Editar noticia</h4>

                        <label class="f">
                            <span class="l">Título</span>
                            <input type="text" id="f_nombre" placeholder="Título de la noticia" />
                        </label>

                        <label class="f">
                            <span class="l">Resumen</span>
                            <textarea id="f_desc_breve" rows="3" placeholder="Resumen corto"></textarea>
                        </label>

                        <label class="f">
                            <span class="l">Cuerpo</span>
                            <textarea id="f_desc_media" rows="6" placeholder="Contenido principal"></textarea>
                        </label>

                        <!-- Campos compat ocultos (el JS los setea pero no se usan) -->
                        <input id="f_desc_curso" type="hidden" />

                        <label class="f">
                            <span class="l">Estatus</span>
                            <select id="f_estatus">
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                            </select>
                        </label>
                    </div>

                    <div class="card">
                        <h4 class="card-title">Imágenes</h4>
                        <div id="media-curso-edit">
                            <!-- lo rellena JS con 2 tarjetas editables -->
                        </div>
                    </div>
                </form>

                <!-- Acciones edición -->
                <div class="gc-actions">
                    <button class="gc-btn gc-btn--primary" id="btn-save">Guardar</button>
                    <button class="gc-btn gc-btn--ghost" id="btn-cancel">Cancelar</button>
                </div>
            </section>
        </div>
    </aside>









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


    <script src="/JS/JSglobal.js" defer></script>
    <script src="/JS/UAT/admin.router.js" defer></script>
    <script src="/JS/UAT/admin.cursos.js" defer></script>

    <!--
        <script src="/JS/UAT/admin.noticias.js" defer></script>
    <script src="/JS/UAT/admin.tutores.js" defer></script>

    <script src="/JS/UAT/admin.suscripciones.js"></script>
    <script src="/JS/UAT/admin.usuarios.js"></script>

      -->

</body>

</html>