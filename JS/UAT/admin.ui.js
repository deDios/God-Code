// /JS/UAT/admin.ui.js
import { gcLog } from './admin.services.js';

export function openDrawer(id){
  const dlg = document.getElementById(id);
  if (dlg && typeof dlg.showModal === 'function') {
    dlg.showModal();
    const first = dlg.querySelector('input, textarea, select, button');
    if (first) setTimeout(()=> first.focus(), 0);
  }
}
export function closeDrawer(id){
  const dlg = document.getElementById(id);
  if (dlg && typeof dlg.close === 'function') dlg.close();
}

export function bindDrawerButtons(root=document){
  root.addEventListener('click', (e)=>{
    const open = e.target.closest('[data-open]');
    const close = e.target.closest('[data-close]');
    if (open) {
      const id = open.getAttribute('data-open');
      if (id) openDrawer(id);
    }
    if (close) {
      const id = close.getAttribute('data-close');
      if (id) closeDrawer(id);
    }
  });
}

export function bindCharCounters(root=document){
  const counters = Array.from(root.querySelectorAll('.counter[data-for][data-max]'));
  counters.forEach((c)=>{
    const forId = c.getAttribute('data-for');
    const max = parseInt(c.getAttribute('data-max'), 10) || 0;
    const input = root.getElementById(forId);
    if (!input) return;
    const update = () => {
      const len = (input.value || '').length;
      c.textContent = `${len}/${max}`;
      c.dataset.over = String(len > max);
    };
    input.addEventListener('input', update);
    update();
  });
}

export function filePreview(inputEl, imgEl){
  if (!inputEl || !imgEl) return;
  inputEl.addEventListener('change', ()=>{
    const f = inputEl.files && inputEl.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    imgEl.src = url;
    imgEl.dataset.blobUrl = url;
  });
}

export function renderTableBody(tbodySelector, rows, columns){
  const tb = document.querySelector(tbodySelector);
  if (!tb) { gcLog('renderTableBody', 'tbody no encontrado', tbodySelector); return; }
  tb.innerHTML = '';
  if (!rows || !rows.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = String(columns.length || 1);
    td.innerHTML = '<small class="helper">Sin datos por ahora…</small>';
    tr.appendChild(td);
    tb.appendChild(tr);
    return;
  }
  rows.forEach((r)=>{
    const tr = document.createElement('tr');
    columns.forEach(col=>{
      const td = document.createElement('td');
      td.innerHTML = col.cell(r);
      tr.appendChild(td);
    });
    tb.appendChild(tr);
  });
}
