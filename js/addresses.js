export function getAddresses() {
  return JSON.parse(localStorage.getItem('addresses') || '[]');
}

function saveAddresses(addresses) {
  localStorage.setItem('addresses', JSON.stringify(addresses));
}

export function addAddress(address) {
  const addresses = getAddresses();
  const isFirst = addresses.length === 0;
  const entry = { id: 'addr' + Date.now().toString().slice(-8), ...address, isDefault: isFirst };
  addresses.push(entry);
  saveAddresses(addresses);
  return entry;
}

export function updateAddress(id, updates) {
  const addresses = getAddresses();
  const addr = addresses.find((a) => a.id === id);
  if (!addr) return;
  Object.assign(addr, updates);
  saveAddresses(addresses);
}

export function removeAddress(id) {
  let addresses = getAddresses().filter((a) => a.id !== id);
  if (addresses.length && !addresses.some((a) => a.isDefault)) {
    addresses[0].isDefault = true;
  }
  saveAddresses(addresses);
}

export function setDefaultAddress(id) {
  const addresses = getAddresses();
  addresses.forEach((a) => {
    a.isDefault = a.id === id;
  });
  saveAddresses(addresses);
}

export function getDefaultAddress() {
  const addresses = getAddresses();
  return addresses.find((a) => a.isDefault) || addresses[0] || null;
}
