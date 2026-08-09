// Shared "Send a Query" modal — unifies the two near-duplicate implementations
// in Legacy pages/category.html (per-card, no user prefill) and
// Legacy pages/medicine-detail.html (prefills from currentUser + qty).
//
// Requires DOM ids: queryModal, queryModalForm, queryModalSuccess, qfMedicine,
// qfQty, qfName, qfEmail, qfPhone, qfCity, qfMessage, qfError.

import { openModal, closeModal } from '../molecules/Modal.js';

export function openQueryModal(medicine, { qty = 1, prefillUser = null } = {}) {
  const user = prefillUser || JSON.parse(localStorage.getItem('currentUser') || 'null');

  document.getElementById('qfMedicine').value = `${medicine.brandName} (${medicine.saltName} ${medicine.strength})`;
  document.getElementById('qfQty').value = qty;
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
