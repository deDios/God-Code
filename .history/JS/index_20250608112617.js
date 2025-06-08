//menu hamburguesa
function toggleMenu() {
  const menu = document.getElementById("mobile-menu");
  menu.classList.toggle("show");
}

//subnav sticky que no se vea feo
document.addEventListener('DOMContentLoaded', () => { 
  const header = document.getElementById('header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
});

//seccion de noticias 
const noticias = [
  {
    id: 1,
    titulo: "IBM acelera la revolución de la IA Generativa empresarial con...",
    url: "#",
  },
  {
    id: 2,
    titulo: "IBM z17: El primer Mainframe totalmente diseñado para la...",
    url: "#",
  },
  {
    id: 3,
    titulo: "IBM lanza soluciones de ciberseguridad para la nueva era digital",
    url: "#",
  },
  {
    id: 4,
    titulo: "IBM Watsonx transforma el uso de datos en empresas medianas",
    url: "#",
  },
  {
    id: 5,
    titulo: "Nuevos centros de datos verdes impulsados por IA de IBM",
    url: "#",
  },
  {
    id: 6,
    titulo: "IBM y NASA colaboran en IA para predicción climática",
    url: "#",
  },
];

const noticiasPorPagina = 2;
let paginaActual = 1;

function mostrarNoticias(pagina) {
  const contenedor = document.getElementById("lista-noticias");
  contenedor.innerHTML = "";

  const inicio = (pagina - 1) * noticiasPorPagina;
  const noticiasPagina = noticias.slice(inicio, inicio + noticiasPorPagina);

  noticiasPagina.forEach((noticia) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = noticia.url;
    a.textContent = noticia.titulo;
    li.appendChild(a);
    contenedor.appendChild(li);
  });
}

function crearPaginacion() {
  const contenedor = document.getElementById("paginacion");
  contenedor.innerHTML = "";

  const totalPaginas = Math.ceil(noticias.length / noticiasPorPagina);

  for (let i = 1; i <= totalPaginas; i++) {
    const enlace = document.createElement("a");
    enlace.textContent = i;
    enlace.href = "#";
    if (i === paginaActual) enlace.classList.add("activo");

    enlace.addEventListener("click", (e) => {
      e.preventDefault();
      paginaActual = i;
      mostrarNoticias(paginaActual);
      crearPaginacion();
    });

    contenedor.appendChild(enlace);
  }
}

//mostrar noticias al cargar la pagina
mostrarNoticias(paginaActual);
crearPaginacion();

//seccion 4 ayuda
function toggleItem(btn) {
  const respuesta = btn.nextElementSibling;
  respuesta.style.display = respuesta.style.display === 'block' ? 'none' : 'block';
}


//seccion 2 Nosotros carrusel
 let indice = 0;
  const slides = document.querySelectorAll('.slide');
  const indicador = document.getElementById('indicador');

  function mostrarSlide(nuevoIndice) {
    slides[indice].classList.remove('activo');
    indice = (nuevoIndice + slides.length) % slides.length;
    slides[indice].classList.add('activo');
    indicador.textContent = `${indice + 1} / ${slides.length}`;
  }

  function moverCarrusel(direccion) {
    mostrarSlide(indice + direccion);
  }