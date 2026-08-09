// Manufacturer modal — "all medicines by this manufacturer" — ported from
// Legacy pages/medicine-detail.html (openMfrModal, renderMfrList, setMfrSort).
// Falls back to a sample of other manufacturers when this one has no other
// medicines listed.

import { openModal, closeModal } from '../molecules/Modal.js';
import { medicineCardHtml, sortMedicines, filterByQuery, setModalSortBtns } from './medicineListHelpers.js';

let mfrList = [];
let mfrSort = 'alpha';
let mfrIsFallback = false;

export function openMfrModal(medicine, allMedicines) {
  mfrIsFallback = false;
  mfrSort = 'alpha';
  document.getElementById('mfrSearch').value = '';
  setModalSortBtns('mfr', 'alpha');

  const sameMfr = allMedicines.filter(
    (m) => m.manufacturerId === medicine.manufacturerId && m.id !== medicine.id && m.status === 'published'
  );
  document.getElementById('mfrModalTitle').textContent = `${medicine.manufacturer} — All Medicines`;

  if (sameMfr.length > 0) {
    mfrList = sameMfr;
    renderMfrList();
  } else {
    mfrIsFallback = true;
    const otherMfrs = [
      ...new Map(
        allMedicines
          .filter((m) => m.manufacturerId !== medicine.manufacturerId && m.status === 'published')
          .map((m) => [m.manufacturerId, m])
      ).values(),
    ].slice(0, 6);
    document.getElementById('mfrModalCount').textContent = 'No medicines listed — showing other manufacturers';
    document.getElementById('mfrModalBody').innerHTML = `
<div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
  <p class="text-sm font-semibold text-amber-800">No medicines listed for this manufacturer</p>
  <p class="text-xs text-amber-700 mt-1"><strong>${medicine.manufacturer}</strong> has no other medicines in our catalog. Here are medicines from other manufacturers.</p>
</div>
${otherMfrs
  .map(
    (m) => `
<div class="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl p-3 gap-3">
  <div>
    <p class="text-sm font-semibold text-slate-800">${m.manufacturer}</p>
    <p class="text-xs text-slate-500">${m.brandName} · ${m.form} · ${m.strength}</p>
  </div>
  <a href="medicine-detail.html?id=${m.id}" class="text-xs text-blue-600 hover:underline flex-shrink-0">View →</a>
</div>`
  )
  .join('')}`;
  }

  openModal('mfrModal');
}

export function renderMfrList() {
  if (mfrIsFallback) return;
  const query = document.getElementById('mfrSearch').value;
  const filtered = filterByQuery(sortMedicines(mfrList, mfrSort), query);
  document.getElementById('mfrModalCount').textContent = `${filtered.length} medicine${filtered.length !== 1 ? 's' : ''} found`;
  const body = document.getElementById('mfrModalBody');
  body.innerHTML =
    filtered.length === 0
      ? `<p class="text-center text-sm text-slate-500 py-8">No results for "${query}"</p>`
      : filtered.map(medicineCardHtml).join('');
}

export function setMfrSort(sort) {
  mfrSort = sort;
  setModalSortBtns('mfr', sort);
  renderMfrList();
}

export function closeMfrModal() {
  closeModal('mfrModal');
}
