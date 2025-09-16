// /JS/UAT/admin.api.js
import { ENDPOINTS, UPLOAD } from './shared/constants.js';

async function request(pathOrUrl, { method='GET', body, headers } = {}) {
  const url = pathOrUrl;
  const opts = { method, headers: headers || {} };
  if (body && !(body instanceof FormData)) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    opts.body = body; 
  }
  const res = await fetch(url, opts);
  if (!res.ok) {
    const txt = await res.text().catch(()=>'');
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${txt}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return await res.json();
  return await res.text();
}

function makeResourceAPI(resource) {
  const ep = ENDPOINTS[resource];
  return {
    async list(params) {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return await request(ep.list + qs, { method:'GET' });
    },
    async insert(payloadOrFD) { return await request(ep.insert, { method:'POST', body: payloadOrFD }); },
    async update(payloadOrFD) { return await request(ep.update, { method:'POST', body: payloadOrFD }); },
  };
}

export const UsuariosAPI = makeResourceAPI('usuarios');
export const CursosAPI = makeResourceAPI('cursos');
export const NoticiasAPI = makeResourceAPI('noticias');
export const TutoresAPI = makeResourceAPI('tutores');
export const SuscripcionesAPI = makeResourceAPI('suscripciones');

export { request };

export const UploadsAPI = {
  async cursoImg(id, file) {
    const fd = new FormData();
    fd.append('curso_id', id);
    fd.append('imagen', file);
    const res = await fetch(UPLOAD.cursoImg, { method: 'POST', body: fd });
    if (!res.ok) throw new Error('cursoImg upload failed');
    try { return await res.json(); } catch { return {}; }
  },
  async noticiaImg(id, pos, file) {
    const fd = new FormData();
    fd.append('noticia_id', id);
    fd.append('pos', String(pos));
    fd.append('imagen', file);
    const res = await fetch(UPLOAD.noticiaImg, { method: 'POST', body: fd });
    if (!res.ok) throw new Error('noticiaImg upload failed');
    try { return await res.json(); } catch { return {}; }
  },
  async tutorImg(id, file) {
    const fd = new FormData();
    fd.append('tutor_id', id);
    fd.append('imagen', file);
    const res = await fetch(UPLOAD.tutorImg, { method: 'POST', body: fd });
    if (!res.ok) throw new Error('tutorImg upload failed');
    try { return await res.json(); } catch { return {}; }
  },
  async usuarioImg(id, file) {
    const fd = new FormData();
    fd.append('usuario_id', id);
    fd.append('imagen', file);
    const res = await fetch(UPLOAD.usuarioImg, { method: 'POST', body: fd });
    if (!res.ok) throw new Error('usuarioImg upload failed');
    try { return await res.json(); } catch { return {}; }
  },
};

