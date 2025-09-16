<?php
?><!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#111">
  <meta name="format-detection" content="telephone=no, date=no, email=no, address=no">
  <title>Godcode UAT</title>
      <link rel="stylesheet" href="../../CSS/plantilla.css" />
    <link rel="stylesheet" href="../../CSS/admin/admin.css" />
</head>
<body>
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
                <button class="btn btn-primary"
                    onclick="location.href='/VIEW/Inscripcion.php'">Registrarse</button>
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
                            <li><a href="/VIEW/DesarrolloWeb.php"><img
                                        src="/ASSETS/ProductosPopUp/DesarrolloWeb.png" alt="Web">Desarrollo Web</a>
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
                            <li><a href="/VIEW/DisenoUXUI.php"><img
                                        src="/ASSETS/ProductosPopUp/DiseñoUXUI.png" alt="UX/UI">Diseño UX/UI</a>
                            </li>
                            <li><a href="/VIEW/ServicioEducativo.php"><img
                                        src="/ASSETS/ProductosPopUp/ServicioEducativo.png">Servicio
                                    educativo</a></li>
                        </ul>
                    </div>
                    <div class="col">
                        <h4>Industrias</h4>
                        <ul>
                            <li><a href="/VIEW/IndustriaEducacion.php"><img
                                        src="/ASSETS/ProductosPopUp/Educacion.png" alt="Educación">Educación</a>
                            </li>
                            <li><a href="/VIEW/IndustriaTecnologia.php"><img
                                        src="/ASSETS/ProductosPopUp/Tecnologia.png" alt="Tecnología">Tecnología</a>
                            </li>
                            <li><a href="/VIEW/IndustriaFinanciera.php"><img
                                        src="/ASSETS/ProductosPopUp/Finanzas.png" alt="Finanzas">Finanzas</a>
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

  <div id="admin-root" role="application">
    <main id="app">
      <!-- =================== Usuarios =================== -->
      <section id="view-usuarios" hidden aria-labelledby="titulo-usuarios">
        <div class="toolbar">
          <h1 id="titulo-usuarios">Usuarios</h1>
          <div class="row grow">
            <div class="search">
              <label for="u_search" class="sr-only">Buscar usuarios</label>
              <input id="u_search" type="search" placeholder="Buscar por nombre o correo" inputmode="search" enterkeyhint="search" autocomplete="off">
              <button class="btn ghost" id="u_search_btn">Buscar</button> <button class="btn primary" id="u_new_btn">Nuevo</button>
            </div>
            <span class="grow"></span>
            <button class="btn primary" data-open="drawer-usuarios">Nuevo usuario</button>
          </div>
        </div>
        <div class="table-wrap card">
          <table aria-describedby="desc-usuarios">
            <caption class="sr-only">Lista de usuarios</caption>
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Correo</th>
                <th scope="col">Teléfono</th>
                <th scope="col">Estatus</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody id="tabla-usuarios">
              <tr class="empty"><td colspan="5"><small class="helper">Sin datos por ahora…</small></td></tr>
            </tbody>
          </table>
          <p id="desc-usuarios" class="sr-only">Tabla con información de usuarios; la última columna contiene acciones.</p>
        </div>
      </section>

      <!-- =================== Cursos =================== -->
      <section id="view-cursos" hidden aria-labelledby="titulo-cursos">
        <div class="toolbar">
          <h1 id="titulo-cursos">Cursos</h1>
          <div class="row grow">
            <div class="search">
              <label for="c_search" class="sr-only">Buscar cursos</label>
              <input id="c_search" type="search" placeholder="Buscar por nombre" inputmode="search" enterkeyhint="search" autocomplete="off">
              <button class="btn ghost" id="c_search_btn">Buscar</button> <button class="btn primary" id="c_new_btn">Nuevo</button>
            </div>
            <span class="grow"></span>
            <button class="btn primary" data-open="drawer-cursos">Nuevo curso</button>
          </div>
        </div>
        <div class="table-wrap card">
          <table aria-describedby="desc-cursos">
            <caption class="sr-only">Lista de cursos</caption>
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Fecha</th>
                <th scope="col">Estatus</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody id="tabla-cursos">
              <tr class="empty"><td colspan="4"><small class="helper">Sin datos por ahora…</small></td></tr>
            </tbody>
          </table>
          <p id="desc-cursos" class="sr-only">Tabla con información de cursos; la última columna contiene acciones.</p>
        </div>
      </section>

      <!-- =================== Noticias =================== -->
      <section id="view-noticias" hidden aria-labelledby="titulo-noticias">
        <div class="toolbar">
          <h1 id="titulo-noticias">Noticias</h1>
          <div class="row grow">
            <div class="search">
              <label for="n_search" class="sr-only">Buscar noticias</label>
              <input id="n_search" type="search" placeholder="Buscar por título" inputmode="search" enterkeyhint="search" autocomplete="off">
              <button class="btn ghost" id="n_search_btn">Buscar</button> <button class="btn primary" id="n_new_btn">Nueva</button>
            </div>
            <span class="grow"></span>
            <button class="btn primary" data-open="drawer-noticias">Nueva noticia</button>
          </div>
        </div>
        <div class="table-wrap card">
          <table aria-describedby="desc-noticias">
            <caption class="sr-only">Lista de noticias</caption>
            <thead>
              <tr>
                <th scope="col">Título</th>
                <th scope="col">Resumen</th>
                <th scope="col">Estatus</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody id="tabla-noticias">
              <tr class="empty"><td colspan="4"><small class="helper">Sin datos por ahora…</small></td></tr>
            </tbody>
          </table>
          <p id="desc-noticias" class="sr-only">Tabla con información de noticias; la última columna contiene acciones.</p>
        </div>
      </section>

      <!-- =================== Tutores =================== -->
      <section id="view-tutores" hidden aria-labelledby="titulo-tutores">
        <div class="toolbar">
          <h1 id="titulo-tutores">Tutores</h1>
          <div class="row grow">
            <div class="search">
              <label for="t_search" class="sr-only">Buscar tutores</label>
              <input id="t_search" type="search" placeholder="Buscar por nombre" inputmode="search" enterkeyhint="search" autocomplete="off">
              <button class="btn ghost" id="t_search_btn">Buscar</button> <button class="btn primary" id="t_new_btn">Nuevo</button>
            </div>
            <span class="grow"></span>
            <button class="btn primary" data-open="drawer-tutores">Nuevo tutor</button>
          </div>
        </div>
        <div class="table-wrap card">
          <table aria-describedby="desc-tutores">
            <caption class="sr-only">Lista de tutores</caption>
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Bio</th>
                <th scope="col">Estatus</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody id="tabla-tutores">
              <tr class="empty"><td colspan="4"><small class="helper">Sin datos por ahora…</small></td></tr>
            </tbody>
          </table>
          <p id="desc-tutores" class="sr-only">Tabla con información de tutores; la última columna contiene acciones.</p>
        </div>
      </section>

      <!-- =================== Suscripciones =================== -->
      <section id="view-suscripciones" hidden aria-labelledby="titulo-suscripciones">
        <div class="toolbar">
          <h1 id="titulo-suscripciones">Suscripciones</h1>
        </div>
        
      <div class="row grow">
        <div class="search">
          <label for="s_search" class="sr-only">Buscar suscripciones</label>
          <input id="s_search" type="search" placeholder="Buscar..." inputmode="search" enterkeyhint="search" autocomplete="off">
          <button class="btn ghost" id="s_search_btn">Buscar</button>
          <button class="btn primary" id="s_new_btn">Nueva</button>
        </div>
      </div>
<div class="table-wrap card">
          <table aria-describedby="desc-sus">
            <caption class="sr-only">Lista de suscripciones</caption>
            <thead>
              <tr>
                <th scope="col">Curso</th>
                <th scope="col">Usuario</th>
                <th scope="col">Estatus</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody id="tabla-suscripciones">
              <tr class="empty"><td colspan="4"><small class="helper">Sin datos por ahora…</small></td></tr>
            </tbody>
          </table>
          <p id="desc-sus" class="sr-only">Tabla con información de suscripciones; la última columna contiene acciones.</p>
        </div>
      </section>
    </main>

    <!-- =================== Drawers =================== -->
    <section aria-hidden="true">
      <!-- los drawers se activan/desactivan desde el js -->
    </section>
  </div>
    <!-- =================== Drawers =================== -->
    <section aria-hidden="true">
    <!-- Drawer Usuarios -->
      <dialog id="drawer-usuarios" class="drawer" aria-labelledby="du-title" aria-modal="true">
        <form method="dialog">
          <div class="head"><h2 id="du-title">Usuario</h2></div>
          <div class="body">
            <input type="hidden" id="u_id" name="id">
            <div class="grid-2">
              <div class="field">
                <div class="row" style="justify-content: space-between;">
                  <label for="u_nombre">Nombre</label>
                  <span class="counter" id="u_nombre_count" data-for="u_nombre" data-max="80">0/80</span>
                </div>
                <input id="u_nombre" name="nombre" maxlength="80" required autocomplete="name" autocapitalize="words">
              </div>
              <div class="field">
                <label for="u_correo">Correo</label>
                <input id="u_correo" name="correo" type="email" required autocomplete="email" inputmode="email">
              </div>
            </div>
            <div class="grid-2">
              <div class="field">
                <label for="u_tel">Teléfono</label>
                <input id="u_tel" name="telefono" inputmode="numeric" pattern="\d{10,13}" maxlength="13" autocomplete="tel">
                <small class="helper">10–13 dígitos</small>
              </div>
              <div class="field">
                <label for="u_status">Estatus</label>
                <select id="u_status" name="estatus">
                  <option value="1">Activo</option>
                  <option value="0">Inactivo</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label>Avatar</label>
              <div class="row">
                <div class="thumb" id="media-usuario">
                  <img id="u_avatar_preview" alt="Avatar del usuario">
                  <span class="placeholder" aria-hidden="true">Sin imagen</span>
                </div>
                <div>
                  <input id="u_avatar_file" type="file" accept="image/*">
                  <small class="helper">PNG/JPG, máx 5MB</small>
                </div>
              </div>
            </div>
          </div>
          <div class="foot">
            <button type="button" class="btn" data-close="drawer-usuarios">Cancelar</button>
            <button type="submit" class="btn primary" id="u_guardar">Guardar</button>
          </div>
        </form>
      </dialog>

      <!-- Drawer Cursos -->
      <dialog id="drawer-cursos" class="drawer" aria-labelledby="dc-title" aria-modal="true">
        <form method="dialog">
          <div class="head"><h2 id="dc-title">Curso</h2></div>
          <div class="body">
            <input type="hidden" id="c_id" name="id">
            <div class="field">
              <div class="row" style="justify-content: space-between;">
                <label for="c_nombre">Nombre</label>
                <span class="counter" id="c_nombre_count" data-for="c_nombre" data-max="100">0/100</span>
              </div>
              <input id="c_nombre" name="nombre" maxlength="100" required>
            </div>
            <div class="grid-2">
              <div class="field">
                <label for="c_fecha">Fecha</label>
                <input id="c_fecha" name="fecha" type="date" required inputmode="none" autocomplete="off">
                <small class="helper">Se prellenará con hoy en iOS/Android</small>
              </div>
              <div class="field">
                <label for="c_status">Estatus</label>
                <select id="c_status" name="estatus">
                  <option value="1">Activo</option>
                  <option value="2">Pausado</option>
                  <option value="3">En curso</option>
                  <option value="4">Terminado</option>
                  <option value="5">Cancelado</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label>Portada</label>
              <div class="row">
                <div class="thumb" id="media-curso">
                  <img id="c_portada_preview" alt="Portada del curso">
                  <span class="placeholder" aria-hidden="true">Sin imagen</span>
                </div>
                <div>
                  <input id="c_portada_file" type="file" accept="image/*">
                  <small class="helper">PNG/JPG, máx 5MB</small>
                </div>
              </div>
            </div>
            <div class="field">
              <div class="row" style="justify-content: space-between;">
                <label for="c_desc">Descripción</label>
                <span class="counter" id="c_desc_count" data-for="c_desc" data-max="2000">0/2000</span>
              </div>
              <textarea id="c_desc" name="descripcion" maxlength="500" placeholder="Descripción corta del curso"></textarea>
            </div>
          </div>
          <div class="foot">
            <button type="button" class="btn" data-close="drawer-cursos">Cancelar</button>
            <button type="submit" class="btn primary" id="c_guardar">Guardar</button>
          </div>
        </form>
      </dialog>

      <!-- Drawer Noticias -->
      <dialog id="drawer-noticias" class="drawer" aria-labelledby="dn-title" aria-modal="true">
        <form method="dialog">
          <div class="head"><h2 id="dn-title">Noticia</h2></div>
          <div class="body">
            <input type="hidden" id="n_id" name="id">
            <div class="field">
              <div class="row" style="justify-content: space-between;">
                <label for="n_titulo">Título</label>
                <span class="counter" id="n_titulo_count" data-for="n_titulo" data-max="120">0/120</span>
              </div>
              <input id="n_titulo" name="titulo" maxlength="120" required>
            </div>
            <div class="field">
              <div class="row" style="justify-content: space-between;">
                <label for="n_resumen">Resumen</label>
                <span class="counter" id="n_resumen_count" data-for="n_resumen" data-max="160">0/160</span>
              </div>
              <textarea id="n_resumen" name="resumen" maxlength="160" placeholder="Resumen para listados y SEO"></textarea>
            </div>
            <div class="field">
              <label>Imágenes (2 requeridas)</label>
              <div class="row">
                <div class="thumb" id="media-noticia">
                  <img id="n_img1_preview" alt="Imagen 1 de la noticia">
                  <span class="placeholder" aria-hidden="true">Imagen 1</span>
                </div>
                <div class="thumb">
                  <img id="n_img2_preview" alt="Imagen 2 de la noticia">
                  <span class="placeholder" aria-hidden="true">Imagen 2</span>
                </div>
                <div class="grow"></div>
                <div class="field">
                  <input id="n_img1_file" type="file" accept="image/*">
                  <input id="n_img2_file" type="file" accept="image/*">
                  <small class="helper">Ambas obligatorias al crear</small>
                </div>
              </div>
            </div>
            <div class="field">
              <div class="row" style="justify-content: space-between;">
                <label for="n_contenido">Contenido</label>
                <span class="counter" id="n_contenido_count" data-for="n_contenido" data-max="5000">0/5000</span>
              </div>
              <textarea id="n_contenido" name="contenido" maxlength="5000" placeholder="Cuerpo de la noticia…"></textarea>
            </div>
            <div class="grid-2">
              <div class="field">
                <div class="row" style="justify-content: space-between;">
                  <label for="n_tags">Tags</label>
                  <span class="counter" id="n_tags_count" data-for="n_tags" data-max="120">0/120</span>
                </div>
                <input id="n_tags" name="tags" maxlength="120" placeholder="educación, programación, ...">
              </div>
              <div class="field">
                <label for="n_status">Estatus</label>
                <select id="n_status" name="estatus">
                  <option value="1">Activo</option>
                  <option value="2">En pausa</option>
                  <option value="4">Temporal</option>
                  <option value="5">Cancelado</option>
                  <option value="0">Inactivo</option>
                </select>
              </div>
            </div>
          </div>
          <div class="foot">
            <button type="button" class="btn" data-close="drawer-noticias">Cancelar</button>
            <button type="submit" class="btn primary" id="n_guardar">Guardar</button>
          </div>
        </form>
      </dialog>

      <!-- Drawer Tutores -->
      <dialog id="drawer-tutores" class="drawer" aria-labelledby="dt-title" aria-modal="true">
        <form method="dialog">
          <div class="head"><h2 id="dt-title">Tutor</h2></div>
          <div class="body">
            <input type="hidden" id="t_id" name="id">
            <div class="grid-2">
              <div class="field">
                <div class="row" style="justify-content: space-between;">
                  <label for="t_nombre">Nombre</label>
                  <span class="counter" id="t_nombre_count" data-for="t_nombre" data-max="80">0/80</span>
                </div>
                <input id="t_nombre" name="nombre" maxlength="80" required autocapitalize="words">
              </div>
              <div class="field">
                <label for="t_status">Estatus</label>
                <select id="t_status" name="estatus">
                  <option value="1">Activo</option>
                  <option value="2">Pausado</option>
                  <option value="0">Inactivo</option>
                </select>
              </div>
            </div>
            <div class="field">
              <div class="row" style="justify-content: space-between;">
                <label for="t_bio">Bio</label>
                <span class="counter" id="t_bio_count" data-for="t_bio" data-max="500">0/500</span>
              </div>
              <textarea id="t_bio" name="bio" maxlength="500" placeholder="Resumen de experiencia…"></textarea>
            </div>
            <div class="field">
              <label>Foto</label>
              <div class="row">
                <div class="thumb" id="media-tutor">
                  <img id="t_avatar_preview" alt="Foto del tutor">
                  <span class="placeholder" aria-hidden="true">Sin imagen</span>
                </div>
                <div>
                  <input id="t_avatar_file" type="file" accept="image/*">
                  <small class="helper">PNG/JPG, máx 5MB</small>
                </div>
              </div>
            </div>
          </div>
          <div class="foot">
            <button type="button" class="btn" data-close="drawer-tutores">Cancelar</button>
            <button type="submit" class="btn primary" id="t_guardar">Guardar</button>
          </div>
        </form>
      </dialog>

      <!-- Drawer Suscripciones -->
      <dialog id="drawer-suscripciones" class="drawer" aria-labelledby="ds-title" aria-modal="true">
        <form method="dialog">
          <div class="head"><h2 id="ds-title">Suscripción</h2></div>
          <div class="body">
            <input type="hidden" id="s_id" name="id">
            <div class="grid-2">
              <div class="field">
                <label for="s_usuario">Usuario</label>
                <select id="s_usuario" name="usuario_id"><option value="">—</option></select>
              </div>
              <div class="field">
                <label for="s_curso">Curso</label>
                <select id="s_curso" name="curso_id"><option value="">—</option></select>
              </div>
            </div>
            <div class="field">
              <label for="s_status">Estatus</label>
              <select id="s_status" name="estatus">
                <option value="1">Suscrito</option>
                <option value="2">Activo</option>
                <option value="4">Terminado</option>
                <option value="5">Cancelado</option>
              </select>
            </div>
            <div class="field">
              <div class="row" style="justify-content: space-between;">
                <label for="s_notas">Notas</label>
                <span class="counter" id="s_notas_count" data-for="s_notas" data-max="200">0/200</span>
              </div>
              <textarea id="s_notas" name="notas" maxlength="200" placeholder="Notas internas…"></textarea>
            </div>
          </div>
          <div class="foot">
            <button type="button" class="btn" data-close="drawer-suscripciones">Cancelar</button>
            <button type="submit" class="btn primary" id="s_guardar">Guardar</button>
          </div>
        </form>
      </dialog>
    </section>

  <div id="gc-drawer-host"></div>

  <script type="module" src="/JS/UAT/admin.boot.js"></script>
  <script src="/JS/JSglobal.js"></script>


</body>
</html>
