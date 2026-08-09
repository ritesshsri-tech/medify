// "Request a Call" modal — ported from Legacy pages/medicine-detail.html
// (openCallModal, submitCallRequest). Requires DOM ids: callModal,
// callModalForm, callModalSuccess, callMedicineName, callPhone,
// callPhoneError, callCountryCode, callConfirmNumber.

import { openModal, closeModal } from '../molecules/Modal.js';

export function openCallModal(medicine) {
  document.getElementById('callMedicineName').textContent = medicine ? medicine.brandName : '';
  document.getElementById('callPhone').value = '';
  document.getElementById('callPhoneError').classList.add('hidden');
  document.getElementById('callModalForm').classList.remove('hidden');
  document.getElementById('callModalSuccess').classList.add('hidden');

  openModal('callModal');
  setTimeout(() => document.getElementById('callPhone').focus(), 100);
}

export function closeCallModal() {
  closeModal('callModal');
}

export function submitCallRequest() {
  const code = document.getElementById('callCountryCode').value;
  const num = document.getElementById('callPhone').value.trim();
  const errorEl = document.getElementById('callPhoneError');

  if (!num || num.replace(/\D/g, '').length < 7) {
    errorEl.classList.remove('hidden');
    return false;
  }

  errorEl.classList.add('hidden');
  document.getElementById('callConfirmNumber').textContent = `${code} ${num}`;
  document.getElementById('callModalForm').classList.add('hidden');
  document.getElementById('callModalSuccess').classList.remove('hidden');
  return true;
}
