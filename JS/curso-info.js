function cargarCurso() {
    if (!document.querySelector('.curso-detalle') || !CURSO_ID) return;

    // Datos dummy de cursos
    const cursos = [
        {
            id: "css",
            categoria: "Programación Web",
            titulo: "Curso de CSS",
            descripcion_corta: "Aprende diseño y estilo de páginas web, conoce propiedades y validaciones CSS.",
            descripcion_larga: `En este curso dominarás las técnicas modernas de diseño web. Desde los fundamentos hasta técnicas avanzadas como:
        \n- Diseño responsive con Flexbox y Grid
        \n- Animaciones y transiciones CSS
        \n- Variables CSS y metodologías modernas
        \n- Buenas prácticas de organización de código`,
            imagen_principal: "https://images.unsplash.com/photo-1523437110208-8e4c62276029?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            imagen_miniatura: "https://images.unsplash.com/photo-1523437110208-8e4c62276029?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            precio: 300,
            horas_diarias: "2",
            tipo_actividades: "Prácticas y teóricas",
            frecuencia_evaluacion: "Semanal",
            horarios_disponibles: "Mañana/Tarde",
            certificado: "Incluye certificado digital",
            beneficio_extra: "Acceso a comunidad privada por 1 año",
            nombre_instructor: "Ana López",
            foto_instructor: "https://randomuser.me/api/portraits/women/44.jpg",
            bio_instructor: "Diseñadora web con 10 años de experiencia. Especialista en UI/UX y desarrollo frontend. Ha trabajado para empresas como Google y Airbnb.",
            dirigido_a: "Diseñadores gráficos, desarrolladores frontend y cualquier persona interesada en mejorar la presentación visual de sitios web.",
            competencias: "Creación de diseños responsivos, implementación de animaciones CSS, organización de código CSS escalable, uso de preprocesadores como SASS.",
            duracion: "40",
            url: "CursoInfo.php?id=css"
        },
        {
            id: "javascript",
            categoria: "Programación Web",
            titulo: "Curso de JavaScript",
            descripcion_corta: "Domina el lenguaje de programación más importante para desarrollo web frontend.",
            descripcion_larga: `Este curso te llevará desde cero hasta un nivel avanzado en JavaScript moderno (ES6+). Aprenderás:
        \n- Fundamentos de programación con JS
        \n- Manipulación del DOM
        \n- Async/Await y Promesas
        \n- Programación orientada a objetos
        \n- Patrones de diseño modernos`,
            imagen_principal: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            imagen_miniatura: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            precio: 400,
            horas_diarias: "2.5",
            tipo_actividades: "Proyectos prácticos",
            frecuencia_evaluacion: "Por módulo",
            horarios_disponibles: "Mañana/Noche",
            certificado: "Certificado con validación internacional",
            beneficio_extra: "Acceso a talleres exclusivos",
            nombre_instructor: "Carlos Méndez",
            foto_instructor: "https://randomuser.me/api/portraits/men/32.jpg",
            bio_instructor: "Ingeniero de software con 8 años de experiencia en desarrollo frontend. Creador de varias librerías open source y speaker en conferencias internacionales.",
            dirigido_a: "Desarrolladores web que quieran profundizar en JavaScript, diseñadores que quieran agregar interactividad a sus proyectos.",
            competencias: "Desarrollo de aplicaciones web interactivas, manejo de asincronía, consumo de APIs, fundamentos de React/Vue.",
            duracion: "60",
            url: "CursoInfo.php?id=javascript"
        },
        {
            id: "python",
            categoria: "Programación",
            titulo: "Curso de Python",
            descripcion_corta: "Aprende el lenguaje más versátil para desarrollo web, ciencia de datos e inteligencia artificial.",
            descripcion_larga: `Python es el lenguaje más demandado actualmente. En este curso aprenderás:
        \n- Fundamentos de programación con Python
        \n- Desarrollo web con Django/Flask
        \n- Análisis de datos con Pandas
        \n- Introducción a machine learning
        \n- Automatización de tareas`,
            imagen_principal: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            imagen_miniatura: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            precio: 450,
            horas_diarias: "3",
            tipo_actividades: "Casos prácticos reales",
            frecuencia_evaluacion: "Quincenal",
            horarios_disponibles: "Tarde/Noche",
            certificado: "Certificado con proyectos evaluados",
            beneficio_extra: "Acceso a bolsa de trabajo",
            nombre_instructor: "María González",
            foto_instructor: "https://randomuser.me/api/portraits/women/65.jpg",
            bio_instructor: "Data Scientist con 7 años de experiencia. PhD en Ciencias de la Computación. Ha trabajado en proyectos de IA para empresas Fortune 500.",
            dirigido_a: "Personas interesadas en ciencia de datos, desarrolladores que quieran aprender un lenguaje versátil, profesionales que necesiten automatizar procesos.",
            competencias: "Desarrollo de aplicaciones Python, análisis de datos, fundamentos de IA, creación de APIs REST.",
            duracion: "55",
            url: "CursoInfo.php?id=python"
        },
        {
            id: "react",
            categoria: "Frontend Avanzado",
            titulo: "Curso de React",
            descripcion_corta: "Domina la biblioteca más popular para construir interfaces de usuario modernas.",
            descripcion_larga: `En este curso aprenderás React desde cero hasta nivel avanzado:
        \n- Fundamentos de React y JSX
        \n- Hooks (useState, useEffect, etc.)
        \n- Context API y Redux
        \n- Routing con React Router
        \n- Integración con APIs
        \n- Testing y despliegue`,
            imagen_principal: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            imagen_miniatura: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            precio: 420,
            horas_diarias: "2",
            tipo_actividades: "Proyectos prácticos",
            frecuencia_evaluacion: "Por módulo",
            horarios_disponibles: "Flexible",
            certificado: "Certificado con revisión de portafolio",
            beneficio_extra: "Sesiones de mentoría",
            nombre_instructor: "Javier Ruiz",
            foto_instructor: "https://randomuser.me/api/portraits/men/75.jpg",
            bio_instructor: "Frontend Architect con 10 años de experiencia. Especialista en React y ecosistema JavaScript. Ha liderado equipos en startups y grandes empresas.",
            dirigido_a: "Desarrolladores JavaScript que quieran especializarse en React, diseñadores UI/UX que quieran implementar sus diseños.",
            competencias: "Desarrollo de SPA modernas, gestión de estado, componentes reutilizables, buenas prácticas de React.",
            duracion: "50",
            url: "CursoInfo.php?id=react"
        },
        {
            id: "nodejs",
            categoria: "Backend",
            titulo: "Curso de Node.js",
            descripcion_corta: "Aprende a construir aplicaciones backend escalables con JavaScript.",
            descripcion_larga: `Node.js permite usar JavaScript en el servidor. En este curso aprenderás:
        \n- Fundamentos de Node.js y npm
        \n- Creación de APIs REST
        \n- Autenticación JWT
        \n- Bases de datos (MongoDB, MySQL)
        \n- Websockets
        \n- Despliegue en la nube`,
            imagen_principal: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            imagen_miniatura: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            precio: 380,
            horas_diarias: "2.5",
            tipo_actividades: "Desarrollo de API completa",
            frecuencia_evaluacion: "Por proyecto",
            horarios_disponibles: "Noche",
            certificado: "Certificado con proyecto final evaluado",
            beneficio_extra: "Revisión de CV y perfil LinkedIn",
            nombre_instructor: "Laura Fernández",
            foto_instructor: "https://randomuser.me/api/portraits/women/33.jpg",
            bio_instructor: "Backend Developer con 6 años de experiencia. Especialista en arquitectura de microservicios y APIs escalables. Certificada como AWS Developer.",
            dirigido_a: "Desarrolladores frontend que quieran convertirse en fullstack, profesionales que necesiten construir APIs robustas.",
            competencias: "Creación de APIs RESTful, autenticación y autorización, integración con bases de datos, despliegue en la nube.",
            duracion: "45",
            url: "CursoInfo.php?id=nodejs"
        }
    ];

    const curso = cursos[CURSO_ID];
    if (!curso) {
        window.location.href = '../index.php';
        return;
    }

    document.title = `${curso.titulo} | Academia GodCode`;

    const fill = (selector, text, isHTML = false) => {
        const element = document.querySelector(selector);
        if (element) {
            if (isHTML) element.innerHTML = text;
            else element.textContent = text;
        }
    };

    // Información principal
    fill('.curso-categoria', curso.categoria);
    fill('.curso-titulo', curso.titulo);
    fill('.descripcion-corta', curso.descripcion_corta);
    fill('.texto-descriptivo', curso.descripcion_larga.replace(/\n/g, '<br>'), true);

    // Imágenes
    const cursoImg = document.querySelector('.curso-imagen');
    if (cursoImg) {
        cursoImg.src = curso.imagen_principal;
        cursoImg.alt = curso.titulo;
    }

    // Información lateral
    fill('.precio-curso', `$${curso.precio}`);
    fill('.beneficio-extra', curso.beneficio_extra);

    // Detalles
    fill('.horas-diarias', `${curso.horas_diarias} Horas al día`);
    fill('.tipo-actividades', curso.tipo_actividades);
    fill('.frecuencia-evaluacion', `Evaluación ${curso.frecuencia_evaluacion}`);
    fill('.horarios-disponibles', curso.horarios_disponibles);
    fill('.tipo-certificado', curso.certificado);

    // Instructor
    const instructorImg = document.querySelector('.foto-instructor');
    if (instructorImg) {
        instructorImg.src = curso.foto_instructor;
        instructorImg.alt = `Instructor: ${curso.nombre_instructor}`;
    }

    fill('.nombre-instructor', curso.nombre_instructor);
    fill('.bio-instructor', curso.bio_instructor);

    // Acordeones
    fill('.dirigido-a-texto', curso.dirigido_a);
    fill('.competencias-texto', curso.competencias);

    // Cursos relacionados
    cargarCursosRelacionados(curso.id);
}

function cargarCursosRelacionados(cursoActualId) {
    const container = document.getElementById('cursos-relacionados');
    if (!container) return;

    // Datos dummy (reemplazar por fetch después)
    // Datos dummy de cursos
    const cursos = [
        {
            id: "css",
            categoria: "Programación Web",
            titulo: "Curso de CSS",
            descripcion_corta: "Aprende diseño y estilo de páginas web, conoce propiedades y validaciones CSS.",
            descripcion_larga: `En este curso dominarás las técnicas modernas de diseño web. Desde los fundamentos hasta técnicas avanzadas como:
        \n- Diseño responsive con Flexbox y Grid
        \n- Animaciones y transiciones CSS
        \n- Variables CSS y metodologías modernas
        \n- Buenas prácticas de organización de código`,
            imagen_principal: "https://images.unsplash.com/photo-1523437110208-8e4c62276029?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            imagen_miniatura: "https://images.unsplash.com/photo-1523437110208-8e4c62276029?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            precio: 300,
            horas_diarias: "2",
            tipo_actividades: "Prácticas y teóricas",
            frecuencia_evaluacion: "Semanal",
            horarios_disponibles: "Mañana/Tarde",
            certificado: "Incluye certificado digital",
            beneficio_extra: "Acceso a comunidad privada por 1 año",
            nombre_instructor: "Ana López",
            foto_instructor: "https://randomuser.me/api/portraits/women/44.jpg",
            bio_instructor: "Diseñadora web con 10 años de experiencia. Especialista en UI/UX y desarrollo frontend. Ha trabajado para empresas como Google y Airbnb.",
            dirigido_a: "Diseñadores gráficos, desarrolladores frontend y cualquier persona interesada en mejorar la presentación visual de sitios web.",
            competencias: "Creación de diseños responsivos, implementación de animaciones CSS, organización de código CSS escalable, uso de preprocesadores como SASS.",
            duracion: "40",
            url: "CursoInfo.php?id=css"
        },
        {
            id: "javascript",
            categoria: "Programación Web",
            titulo: "Curso de JavaScript",
            descripcion_corta: "Domina el lenguaje de programación más importante para desarrollo web frontend.",
            descripcion_larga: `Este curso te llevará desde cero hasta un nivel avanzado en JavaScript moderno (ES6+). Aprenderás:
        \n- Fundamentos de programación con JS
        \n- Manipulación del DOM
        \n- Async/Await y Promesas
        \n- Programación orientada a objetos
        \n- Patrones de diseño modernos`,
            imagen_principal: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            imagen_miniatura: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            precio: 400,
            horas_diarias: "2.5",
            tipo_actividades: "Proyectos prácticos",
            frecuencia_evaluacion: "Por módulo",
            horarios_disponibles: "Mañana/Noche",
            certificado: "Certificado con validación internacional",
            beneficio_extra: "Acceso a talleres exclusivos",
            nombre_instructor: "Carlos Méndez",
            foto_instructor: "https://randomuser.me/api/portraits/men/32.jpg",
            bio_instructor: "Ingeniero de software con 8 años de experiencia en desarrollo frontend. Creador de varias librerías open source y speaker en conferencias internacionales.",
            dirigido_a: "Desarrolladores web que quieran profundizar en JavaScript, diseñadores que quieran agregar interactividad a sus proyectos.",
            competencias: "Desarrollo de aplicaciones web interactivas, manejo de asincronía, consumo de APIs, fundamentos de React/Vue.",
            duracion: "60",
            url: "CursoInfo.php?id=javascript"
        },
        {
            id: "python",
            categoria: "Programación",
            titulo: "Curso de Python",
            descripcion_corta: "Aprende el lenguaje más versátil para desarrollo web, ciencia de datos e inteligencia artificial.",
            descripcion_larga: `Python es el lenguaje más demandado actualmente. En este curso aprenderás:
        \n- Fundamentos de programación con Python
        \n- Desarrollo web con Django/Flask
        \n- Análisis de datos con Pandas
        \n- Introducción a machine learning
        \n- Automatización de tareas`,
            imagen_principal: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            imagen_miniatura: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            precio: 450,
            horas_diarias: "3",
            tipo_actividades: "Casos prácticos reales",
            frecuencia_evaluacion: "Quincenal",
            horarios_disponibles: "Tarde/Noche",
            certificado: "Certificado con proyectos evaluados",
            beneficio_extra: "Acceso a bolsa de trabajo",
            nombre_instructor: "María González",
            foto_instructor: "https://randomuser.me/api/portraits/women/65.jpg",
            bio_instructor: "Data Scientist con 7 años de experiencia. PhD en Ciencias de la Computación. Ha trabajado en proyectos de IA para empresas Fortune 500.",
            dirigido_a: "Personas interesadas en ciencia de datos, desarrolladores que quieran aprender un lenguaje versátil, profesionales que necesiten automatizar procesos.",
            competencias: "Desarrollo de aplicaciones Python, análisis de datos, fundamentos de IA, creación de APIs REST.",
            duracion: "55",
            url: "CursoInfo.php?id=python"
        },
        {
            id: "react",
            categoria: "Frontend Avanzado",
            titulo: "Curso de React",
            descripcion_corta: "Domina la biblioteca más popular para construir interfaces de usuario modernas.",
            descripcion_larga: `En este curso aprenderás React desde cero hasta nivel avanzado:
        \n- Fundamentos de React y JSX
        \n- Hooks (useState, useEffect, etc.)
        \n- Context API y Redux
        \n- Routing con React Router
        \n- Integración con APIs
        \n- Testing y despliegue`,
            imagen_principal: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            imagen_miniatura: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            precio: 420,
            horas_diarias: "2",
            tipo_actividades: "Proyectos prácticos",
            frecuencia_evaluacion: "Por módulo",
            horarios_disponibles: "Flexible",
            certificado: "Certificado con revisión de portafolio",
            beneficio_extra: "Sesiones de mentoría",
            nombre_instructor: "Javier Ruiz",
            foto_instructor: "https://randomuser.me/api/portraits/men/75.jpg",
            bio_instructor: "Frontend Architect con 10 años de experiencia. Especialista en React y ecosistema JavaScript. Ha liderado equipos en startups y grandes empresas.",
            dirigido_a: "Desarrolladores JavaScript que quieran especializarse en React, diseñadores UI/UX que quieran implementar sus diseños.",
            competencias: "Desarrollo de SPA modernas, gestión de estado, componentes reutilizables, buenas prácticas de React.",
            duracion: "50",
            url: "CursoInfo.php?id=react"
        },
        {
            id: "nodejs",
            categoria: "Backend",
            titulo: "Curso de Node.js",
            descripcion_corta: "Aprende a construir aplicaciones backend escalables con JavaScript.",
            descripcion_larga: `Node.js permite usar JavaScript en el servidor. En este curso aprenderás:
        \n- Fundamentos de Node.js y npm
        \n- Creación de APIs REST
        \n- Autenticación JWT
        \n- Bases de datos (MongoDB, MySQL)
        \n- Websockets
        \n- Despliegue en la nube`,
            imagen_principal: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            imagen_miniatura: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            precio: 380,
            horas_diarias: "2.5",
            tipo_actividades: "Desarrollo de API completa",
            frecuencia_evaluacion: "Por proyecto",
            horarios_disponibles: "Noche",
            certificado: "Certificado con proyecto final evaluado",
            beneficio_extra: "Revisión de CV y perfil LinkedIn",
            nombre_instructor: "Laura Fernández",
            foto_instructor: "https://randomuser.me/api/portraits/women/33.jpg",
            bio_instructor: "Backend Developer con 6 años de experiencia. Especialista en arquitectura de microservicios y APIs escalables. Certificada como AWS Developer.",
            dirigido_a: "Desarrolladores frontend que quieran convertirse en fullstack, profesionales que necesiten construir APIs robustas.",
            competencias: "Creación de APIs RESTful, autenticación y autorización, integración con bases de datos, despliegue en la nube.",
            duracion: "45",
            url: "CursoInfo.php?id=nodejs"
        }
    ];

    const relacionados = Object.values(todosCursos)
        .filter(curso => curso.id !== cursoActualId)
        .slice(0, 4);

    container.innerHTML = relacionados.map(curso => `
        <div class="card-curso">
            <a href="CursoInfo.php?id=${curso.id}">
                <img src="${curso.imagen_principal}" alt="${curso.titulo}">
                <div class="card-contenido">
                    <h3>${curso.titulo}</h3>
                    <p>${curso.descripcion_corta}</p>
                    <p class="horas">${curso.duracion} horas</p>
                    <p class="precio">Precio: <strong>$${curso.precio}</strong></p>
                </div>
            </a>
        </div>
    `).join('');
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarCurso);