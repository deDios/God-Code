// /JS/UAT/admin.services.js
import { __ADMIN_DEBUG__ } from './shared/constants.js';

export const state = { images: new Map() };

const w = window;
function debugOn() { return w.__ADMIN_DEBUG__ ?? __ADMIN_DEBUG__; }

export function gcLog(scope, ...args){ if(debugOn()) console.log(`[ADMIN] ${scope}`, ...args); }
export function gcWarn(scope, ...args){ if(debugOn()) console.warn(`[ADMIN] ${scope}`, ...args); }
export function gcError(scope, ...args){ console.error(`[ADMIN] ${scope}`, ...args); }

export function gcToast(msg, level='info'){
  const prefix = { info:'ℹ️', ok:'✅', warn:'⚠️', err:'⛔' }[level] || 'ℹ️';
  alert(`${prefix} ${msg}`);
}

export function todayYYYYMMDD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
