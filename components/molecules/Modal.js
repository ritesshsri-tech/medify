// Generic modal open/close with body scroll lock and a single shared Escape listener.
// Consolidates the query/call/salt/mfr modal open-close logic duplicated across
// Legacy pages/category.html and Legacy pages/medicine-detail.html.

const openModals = new Set();
let escapeListenerBound = false;

function ensureEscapeListener() {
  if (escapeListenerBound) return;
  escapeListenerBound = true;
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || openModals.size === 0) return;
    // Close the most recently opened modal only.
    const lastId = [...openModals].pop();
    closeModal(lastId);
  });
}

export function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  ensureEscapeListener();

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  if (openModals.size === 0) {
    document.body.style.overflow = 'hidden';
  }
  openModals.add(id);
}

export function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  modal.classList.add('hidden');
  modal.classList.remove('flex');
  openModals.delete(id);
  if (openModals.size === 0) {
    document.body.style.overflow = '';
  }
}
