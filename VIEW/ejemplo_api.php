<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Cursos disponibles</title>
    <style>
    table {
        border-collapse: collapse;
        width: 100%;
        margin-top: 1rem;
    }

    th,
    td {
        border: 1px solid #ddd;
        padding: 0.6rem;
        text-align: left;
    }

    th {
        background-color: #f2f2f2;
    }

    #resultado {
        margin-top: 1rem;
    }
    </style>
    <link rel="stylesheet" href="../CSS/index.css">
</head>

<body>
    <h2>Consultar cursos por estatus</h2>

    <label for="estatus">Estatus:</label>
    <input type="number" id="estatus" value="1" min="0">
    <button onclick="consultarCursos()">Buscar</button>

    <div id="resultado"></div>

    <script>
    async function consultarCursos() {
        const estatus = document.getElementById("estatus").value;

        const response = await fetch(
            'https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_cursos.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    estatus: parseInt(estatus)
                })
            });

        const data = await response.json();

        const divResultado = document.getElementById("resultado");
        divResultado.innerHTML = "";

        if (data.mensaje) {
            divResultado.innerHTML = `<p>${data.mensaje}</p>`;
            return;
        }

        let tabla = `<table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Descripción Breve</th>
                                    <th>Horas</th>
                                    <th>Precio</th>
                                    <th>Categoría</th>
                                    <th>Prioridad</th>
                                </tr>
                            </thead>
                            <tbody>`;

        data.forEach(curso => {
            tabla += `<tr>
                            <td>${curso.id}</td>
                            <td>${curso.nombre}</td>
                            <td>${curso.descripcion_breve}</td>
                            <td>${curso.horas}</td>
                            <td>$${curso.precio}</td>
                            <td>${curso.categoria}</td>
                            <td>${curso.prioridad}</td>
                          </tr>`;
        });

        tabla += `</tbody></table>`;
        divResultado.innerHTML = tabla;
    }
    </script>

    <h2>Consultar categorías</h2>

    <button onclick="consultarCategorias()">Buscar categorías</button>

    <div id="resultado-categorias"></div>

    <script>
    async function consultarCategorias() {
        try {
            const response = await fetch(
                'https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_categorias.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        estatus: 1
                    })
                });

            const data = await response.json();

            const divResultado = document.getElementById("resultado-categorias");
            divResultado.innerHTML = "";

            if (data.mensaje) {
                divResultado.innerHTML = `<p>${data.mensaje}</p>`;
                return;
            }

            let tabla = `<table border="1" cellpadding="8" cellspacing="0" style="margin-top:1rem">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Estatus</th>
                        <th>Creado por</th>
                        <th>Fecha creación</th>
                      </tr>
                    </thead>
                    <tbody>`;

            data.forEach(cat => {
                tabla += `<tr>
                    <td>${cat.id}</td>
                    <td>${cat.nombre}</td>
                    <td>${cat.estatus}</td>
                    <td>${cat.creado_por}</td>
                    <td>${cat.fecha_creacion}</td>
                  </tr>`;
            });

            tabla += `</tbody></table>`;
            divResultado.innerHTML = tabla;

        } catch (error) {
            document.getElementById("resultado-categorias").innerHTML = `<p>Error al consultar categorías</p>`;
            console.error(error);
        }
    }
    </script>

    
    <!-- seccion 3 -->
    <section id="cursos-destacados">
        <h3>Cursos disponibles</h3>

        <div class="carousel-container">
            <button class="carousel-btn prev" aria-label="Anterior">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
            </button>

            <div class="carousel-track-container">
                <div class="carousel-track grid-cards-cursos" id="cursos-container">
                    <!-- Las cards se insertan desde JS -->
                </div>
            </div>

            <button class="carousel-btn next" aria-label="Siguiente">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                </svg>
            </button>
        </div>
    </section>



    <script src="../JS/index.js"></script>
</body>

</html>