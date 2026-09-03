// Salt modal — "same salt, other manufacturers" — ported from
// Legacy pages/medicine-detail.html (openSaltModal, renderSaltList, setSaltSort).
// Falls back to related-category medicines when no other brand shares the salt.

import { openModal, closeModal } from '../molecules/Modal.js';
import { medicineCardHtml, sortMedicines, filterByQuery, setModalSortBtns } from './medicineListHelpers.js';

let saltList = [];
let saltSort = 'alpha';
let saltIsFallback = false;

export function openSaltModal(medicine, allMedicines) {
  saltIsFallback = false;
  saltSort = 'alpha';
  document.getElementById('saltSearch').value = '';
  setModalSortBtns('salt', 'alpha');

  const sameSalt = allMedicines.filter(
    (m) => m.saltName === medicine.saltName && m.id !== medicine.id && m.status === 'published'
  );
  document.getElementById('saltModalTitle').textContent = `${medicine.saltName} — Other Manufacturers`;

  if (sameSalt.length > 0) {
    saltList = sameSalt;
    renderSaltList();
  } else {
    saltIsFallback = true;
    const related = allMedicines
      .filter((m) => m.id !== medicine.id && m.status === 'published' && m.diseaseCategory === medicine.diseaseCategory)
      .slice(0, 8);
    document.getElementById('saltModalCount').textContent = 'Exact salt not found — showing related';
    document.getElementById('saltModalBody').innerHTML = `
<div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
  <p class="text-sm font-semibold text-amber-800">Exact salt not found</p>
  <p class="text-xs text-amber-700 mt-1">No other brands with <strong>${medicine.saltName}</strong> are listed. Here are related medicines in the same category.</p>
</div>
${related.map(medicineCardHtml).join('')}`;
  }

  openModal('saltModal');
}

export function renderSaltList() {
  if (saltIsFallback) return;
  const query = document.getElementById('saltSearch').value;
  const filtered = filterByQuery(sortMedicines(saltList, saltSort), query);
  document.getElementById('saltModalCount').textContent =
    `${filtered.length} medicine${filtered.length !== 1 ? 's' : ''} found`;
  const body = document.getElementById('saltModalBody');
  body.innerHTML =
    filtered.length === 0
      ? `<p class="text-center text-sm text-slate-500 py-8">No results for "${query}"</p>`
      : filtered.map(medicineCardHtml).join('');
}

export function setSaltSort(sort) {
  saltSort = sort;
  setModalSortBtns('salt', sort);
  renderSaltList();
}

export function closeSaltModal() {
  closeModal('saltModal');
}
