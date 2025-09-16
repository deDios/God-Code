// /JS/UAT/shared/constants.js
// Debug, colocar true para ver todos los console logs puestos
export const __ADMIN_DEBUG__ = true;

// API base 
export const API_BASE_URL = 'https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net';

export const UPLOAD = {
  cursoImg:   `${API_BASE_URL}/db/web/u_cursoImg.php`,
  noticiaImg: `${API_BASE_URL}/db/web/u_noticiaImagenes.php`,
  tutorImg:   `${API_BASE_URL}/db/web/u_tutorImg.php`,
  usuarioImg: `${API_BASE_URL}/db/web/u_avatar.php`,
};

/** IDs con permisos de administrador */
export const ADMIN_IDS = [1, 12, 13, 17, 18];
// Endpoints absolutos por entidad ( c = consultar, i = insertar, u = update, las cosas que necesitan estan en sus payloads)
export const ENDPOINTS = {
  usuarios: {
    list:   `${API_BASE_URL}/db/web/c_usuarios.php`,
    insert: `${API_BASE_URL}/db/web/i_usuario.php`,
    update: `${API_BASE_URL}/db/web/u_usuario.php`,
  },
  cursos: {
    list:   `${API_BASE_URL}/db/web/c_cursos.php`,
    insert: `${API_BASE_URL}/db/web/i_cursos.php`,
    update: `${API_BASE_URL}/db/web/u_cursos.php`,
  },
  noticias: {
    list:   `${API_BASE_URL}/db/web/c_noticia.php`,
    insert: `${API_BASE_URL}/db/web/i_noticia.php`,
    update: `${API_BASE_URL}/db/web/u_noticia.php`,
  },
  tutores: {
    list:   `${API_BASE_URL}/db/web/c_tutor.php`,
    insert: `${API_BASE_URL}/db/web/i_tutor.php`,
    update: `${API_BASE_URL}/db/web/u_tutor.php`,
  },
  suscripciones: {
    list:   `${API_BASE_URL}/db/web/c_suscripciones.php`,
    insert: `${API_BASE_URL}/db/web/i_inscripcion.php`,
    update: `${API_BASE_URL}/db/web/u_inscripcion.php`,
  }
};

// Limitadores (a lo mejor lo quito)
export const MAXLEN = {
  usuarios: { nombre: 255 },
  cursos:   { nombre: 255, descripcion: 1000, descripcion_larga: 20000 },
  noticias: { titulo: 255, resumen: 500, contenido: 20000, tags: 255 },
  tutores:  { nombre: 255, bio: 1000 },
  suscripciones: { notas: 500 },
};
