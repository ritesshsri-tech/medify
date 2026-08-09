// Shared helpers for SaltModal.js and MfrModal.js — ported from
// Legacy pages/medicine-detail.html (medicineCardHtml, sortMedicines,
// filterByQuery), which were duplicated verbatim for both modals.

import { paise } from '../../js/utils.js';

export function medicineCardHtml(m) {
  return `
<div class="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl p-3 gap-3">
  <div class="min-w-0">
    <p class="text-sm font-semibold text-slate-800 truncate">${m.brandName}</p>
    <p class="text-xs text-slate-500">${m.manufacturer}</p>
    <p class="text-xs text-slate-500">${m.form} · ${m.strength} · ${m.packSize}</p>
  </div>
  <div class="text-right flex-shrink-0">
    <p class="text-sm font-bold text-slate-900">${paise(m.sellingPricePaise)}</p>
    <a href="medicine-detail.html?id=${m.id}" class="text-xs text-blue-600 hover:underline">View →</a>
  </div>
</div>`;
}

export function sortMedicines(list, sort) {
  return [...list].sort((a, b) => {
    if (sort === 'alpha') return a.brandName.localeCompare(b.brandName);
    if (sort === 'alpha-desc') return b.brandName.localeCompare(a.brandName);
    if (sort === 'price-asc') return a.sellingPricePaise - b.sellingPricePaise;
    if (sort === 'price-desc') return b.sellingPricePaise - a.sellingPricePaise;
    return 0;
  });
}

export function filterByQuery(list, query) {
  if (!query) return list;
  const q = query.toLowerCase();
  return list.filter(
    (m) =>
      m.brandName.toLowerCase().includes(q) ||
      m.manufacturer.toLowerCase().includes(q) ||
      m.form.toLowerCase().includes(q) ||
      m.strength.toLowerCase().includes(q)
  );
}

export function setModalSortBtns(prefix, active) {
  document.querySelectorAll(`[id^="${prefix}Sort-"]`).forEach((btn) => {
    btn.classList.remove('active');
    btn.style.background = '';
    btn.style.color = '';
    btn.style.borderColor = '';
  });
  const activeBtn = document.getElementById(`${prefix}Sort-${active}`);
  if (activeBtn) activeBtn.classList.add('active');
}
