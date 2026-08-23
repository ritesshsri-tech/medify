// Admin-side medicine edits layered on top of the static data/medicines.json,
// since there is no backend to persist writes to the JSON file itself.

export function getAdded() {
  return JSON.parse(localStorage.getItem('medicinesAdded') || '[]');
}

export function getEdited() {
  return JSON.parse(localStorage.getItem('medicinesEdited') || '{}');
}

export function getDeletedIds() {
  return JSON.parse(localStorage.getItem('medicinesDeletedIds') || '[]');
}

function saveAdded(list) {
  localStorage.setItem('medicinesAdded', JSON.stringify(list));
}

function saveEdited(map) {
  localStorage.setItem('medicinesEdited', JSON.stringify(map));
}

function saveDeletedIds(ids) {
  localStorage.setItem('medicinesDeletedIds', JSON.stringify(ids));
}

export function addMedicine(medicine) {
  const added = getAdded();
  const id = 'med_local_' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);
  const entry = { ...medicine, id, status: 'published' };
  added.push(entry);
  saveAdded(added);
  return entry;
}

export function editMedicine(id, updates) {
  const added = getAdded();
  const addedIdx = added.findIndex((m) => m.id === id);
  if (addedIdx !== -1) {
    added[addedIdx] = { ...added[addedIdx], ...updates };
    saveAdded(added);
    return;
  }
  const edited = getEdited();
  edited[id] = { ...(edited[id] || {}), ...updates };
  saveEdited(edited);
}

export function deleteMedicine(id) {
  const added = getAdded().filter((m) => m.id !== id);
  saveAdded(added);

  const deleted = getDeletedIds();
  if (!deleted.includes(id)) {
    deleted.push(id);
    saveDeletedIds(deleted);
  }
}

// Merge base catalog with admin additions/edits/deletions.
export function applyOverrides(baseMedicines) {
  const edited = getEdited();
  const deletedIds = new Set(getDeletedIds());
  const added = getAdded();

  const merged = baseMedicines
    .filter((m) => !deletedIds.has(m.id))
    .map((m) => (edited[m.id] ? { ...m, ...edited[m.id] } : m));

  return [...added, ...merged];
}
