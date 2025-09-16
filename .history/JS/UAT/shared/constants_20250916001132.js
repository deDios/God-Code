// /JS/UAT/shared/constants.js
// Debug, colocar true para ver todos los console logs puestos
export const __ADMIN_DEBUG__ = true;

// API base 
export const API_BASE_URL = 'https://godcode-dqcwaceacpf2bfcd.mexicocentral-01.azurewebsites.net';



/** IDs con permisos de administrador */
export const ADMIN_IDS = [1];
// Endpoints absolutos por entidad ( c = consultar, i = insertar, u = update, las cosas que necesitan estan en sus payloads)
export const ENDPOINTS = {
  usuarios: {
    list:   `${API_BASE_URL}/db/web/c_usuarios.php`,
    insert: `${API_BASE_URL}/db/web/i_usuarios.php`,
    update: `${API_BASE_URL}/db/web/u_usuarios.php`,
  },
  cursos: {
    list:   `${API_BASE_URL}/db/web/c_cursos.php`,
    insert: `${API_BASE_URL}/db/web/i_cursos.php`,
    update: `${API_BASE_URL}/db/web/u_cursos.php`,
  },
  noticias: {
    list:   `${API_BASE_URL}/db/web/c_noticias.php`,
    insert: `${API_BASE_URL}/db/web/i_noticias.php`,
    update: `${API_BASE_URL}/db/web/u_noticias.php`,
  },
  tutores: {
    list:   `${API_BASE_URL}/db/web/c_tutores.php`,
    insert: `${API_BASE_URL}/db/web/i_tutores.php`,
    update: `${API_BASE_URL}/db/web/u_tutores.php`,
  },
  suscripciones: {
    list:   `${API_BASE_URL}/db/web/c_suscripciones.php`,
    insert: `${API_BASE_URL}/db/web/i_suscripciones.php`,
    update: `${API_BASE_URL}/db/web/u_suscripciones.php`,
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
