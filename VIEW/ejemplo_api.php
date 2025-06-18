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
        th, td {
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

            const response = await fetch('https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net/db/web/c_cursos.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estatus: parseInt(estatus) })
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
</body>
</html>
