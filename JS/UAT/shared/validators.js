// /JS/UAT/shared/validators.js
export const isNonEmpty = v => typeof v === 'string' && v.trim().length > 0;
export const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v||'').trim());
export const isPhone = v => /^\d{10,13}$/.test(String(v||'').trim());
export const clampLen = (v, max) => (String(v||'').slice(0, max));
