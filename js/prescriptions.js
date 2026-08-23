export function getPrescriptions() {
  return JSON.parse(localStorage.getItem('prescriptions') || '[]');
}

function savePrescriptions(list) {
  localStorage.setItem('prescriptions', JSON.stringify(list));
}

export function addPrescription({ fileName, forMedicineId, forMedicineName }) {
  const list = getPrescriptions();
  const entry = {
    id: 'rx' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000),
    fileName,
    forMedicineId: forMedicineId || null,
    forMedicineName: forMedicineName || null,
    uploadedAt: new Date().toISOString(),
  };
  list.unshift(entry);
  savePrescriptions(list);
  return entry;
}

export function removePrescription(id) {
  savePrescriptions(getPrescriptions().filter((p) => p.id !== id));
}
