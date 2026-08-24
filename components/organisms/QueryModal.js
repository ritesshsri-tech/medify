// Shared "Send a Query" modal — unifies the two near-duplicate implementations
// in Legacy pages/category.html (per-card, no user prefill) and
// Legacy pages/medicine-detail.html (prefills from currentUser + qty).
//
// Requires DOM ids: queryModal, queryModalForm, queryModalSuccess,
// qfMedicineList, qfAddMedicineBtn, qfAddMedicinePicker, qfName, qfEmail,
// qfPhone, qfCity, qfMessage, qfError.

import { openModal, closeModal } from '../molecules/Modal.js';

let queryItems = [];
let catalog = [];

function medicineLabel(med) {
  return `${med.brandName} (${med.saltName} ${med.strength})`;
}

function renderMedicineList() {
  const list = document.getElementById('qfMedicineList');
  if (!list) return;
  list.innerHTML = queryItems
    .map(
      (item, idx) => `
<div class="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
  <span class="text-sm text-slate-700 flex-1 truncate">${medicineLabel(item.medicine)}</span>
  <input
    type="number"
    min="1"
    value="${item.qty}"
    aria-label="Quantity for ${item.medicine.brandName}"
    data-qty-idx="${idx}"
    class="w-16 px-2 py-1 text-sm border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
  />
  ${
    queryItems.length > 1
      ? `<button type="button" data-remove-idx="${idx}" aria-label="Remove ${item.medicine.brandName}" class="text-slate-400 hover:text-red-500 p-1 flex-shrink-0">
    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  </button>`
      : ''
  }
</div>`
    )
    .join('');

  list.querySelectorAll('[data-qty-idx]').forEach((input) => {
    input.addEventListener('input', () => {
      const idx = Number(input.dataset.qtyIdx);
      queryItems[idx].qty = Math.max(1, Number(input.value) || 1);
    });
  });
  list.querySelectorAll('[data-remove-idx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      queryItems.splice(Number(btn.dataset.removeIdx), 1);
      renderMedicineList();
    });
  });
}

function closeAddMedicinePicker() {
  const picker = document.getElementById('qfAddMedicinePicker');
  if (picker) picker.classList.add('hidden');
}

function openAddMedicinePicker() {
  const picker = document.getElementById('qfAddMedicinePicker');
  if (!picker) return;
  const search = document.getElementById('qfAddMedicineSearch');
  if (search) search.value = '';
  renderAddMedicineOptions('');
  picker.classList.remove('hidden');
  if (search) search.focus();
}

function renderAddMedicineOptions(term) {
  const picker = document.getElementById('qfAddMedicinePicker');
  if (!picker) return;
  const list = document.getElementById('qfAddMedicineOptions');
  const usedIds = new Set(queryItems.map((i) => i.medicine.id));
  const q = term.trim().toLowerCase();
  const matches = catalog
    .filter((m) => !usedIds.has(m.id))
    .filter((m) => !q || m.brandName.toLowerCase().includes(q) || (m.saltName || '').toLowerCase().includes(q))
    .slice(0, 8);

  list.innerHTML = matches.length
    ? matches
        .map(
          (m) => `
<button type="button" data-pick-med="${m.id}" class="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 rounded-lg transition-colors">
  ${medicineLabel(m)}
</button>`
        )
        .join('')
    : `<p class="px-3 py-2 text-xs text-slate-400">No matching medicines</p>`;

  list.querySelectorAll('[data-pick-med]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const med = catalog.find((m) => m.id === btn.dataset.pickMed);
      if (med) {
        queryItems.push({ medicine: med, qty: 1 });
        renderMedicineList();
      }
      closeAddMedicinePicker();
    });
  });
}

function bindAddMedicineControls() {
  const addBtn = document.getElementById('qfAddMedicineBtn');
  const search = document.getElementById('qfAddMedicineSearch');
  if (addBtn && !addBtn.dataset.bound) {
    addBtn.dataset.bound = '1';
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openAddMedicinePicker();
    });
  }
  if (search && !search.dataset.bound) {
    search.dataset.bound = '1';
    search.addEventListener('input', () => renderAddMedicineOptions(search.value));
    search.addEventListener('click', (e) => e.stopPropagation());
  }
  if (!document.body.dataset.qfPickerOutsideBound) {
    document.body.dataset.qfPickerOutsideBound = '1';
    document.addEventListener('click', closeAddMedicinePicker);
  }
}

export function openQueryModal(medicine, { qty = 1, prefillUser = null, allMedicines = [] } = {}) {
  const user = prefillUser || JSON.parse(localStorage.getItem('currentUser') || 'null');

  catalog = allMedicines;
  queryItems = [{ medicine, qty }];
  renderMedicineList();
  bindAddMedicineControls();
  closeAddMedicinePicker();

  document.getElementById('qfName').value = user ? user.name || '' : '';
  document.getElementById('qfEmail').value = user ? user.email || '' : '';
  document.getElementById('qfPhone').value = user ? user.phone || '' : '';
  const cityEl = document.getElementById('qfCity');
  if (cityEl) cityEl.value = '';
  document.getElementById('qfMessage').value = '';
  document.getElementById('qfError').classList.add('hidden');
  document.querySelectorAll('input[name="qfRx"]').forEach((r) => (r.checked = false));

  document.getElementById('queryModalForm').classList.remove('hidden');
  document.getElementById('queryModalSuccess').classList.add('hidden');

  openModal('queryModal');
  setTimeout(() => document.getElementById('qfName').focus(), 100);
}

export function closeQueryModal() {
  closeModal('queryModal');
  closeAddMedicinePicker();
}

export function submitQuery() {
  const name = document.getElementById('qfName').value.trim();
  const email = document.getElementById('qfEmail').value.trim();
  const phone = document.getElementById('qfPhone').value.trim();
  const errEl = document.getElementById('qfError');

  if (!name) {
    errEl.textContent = 'Please enter your name.';
    errEl.classList.remove('hidden');
    return false;
  }
  if (!email && !phone) {
    errEl.textContent = 'Please provide at least an email or phone number.';
    errEl.classList.remove('hidden');
    return false;
  }

  errEl.classList.add('hidden');
  document.getElementById('queryModalForm').classList.add('hidden');
  document.getElementById('queryModalSuccess').classList.remove('hidden');
  return true;
}
