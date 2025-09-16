// /JS/UAT/shared/formatters.js
export const escapeHtml = (s='') => String(s)
 .replaceAll('&','&amp;').replaceAll('<','&lt;')
 .replaceAll('>','&gt;').replaceAll('"','&quot;')
 .replaceAll("'",'&#39;');

export const fmtDate = (s) => {
  if(!s) return '-';
  try { const d = new Date(s); return d.toLocaleDateString(); } catch { return s; }
};
