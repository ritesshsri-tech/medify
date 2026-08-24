export function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  if (typeof window.refreshAppHeaderCart === 'function') window.refreshAppHeaderCart();
}

export function addToCart(medicine) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === medicine.id);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({
      id: medicine.id,
      brandName: medicine.brandName,
      form: medicine.form,
      strength: medicine.strength,
      packSize: medicine.packSize,
      price: medicine.sellingPricePaise,
      mrp: medicine.mrpPaise,
      image: Array.isArray(medicine.image) ? medicine.image[0] : medicine.image,
      requiresPrescription: !!medicine.requiresPrescription,
      rxUploaded: false,
      rxResolution: null,
      qty: 1,
    });
  }
  saveCart(cart);
}

// resolution: 'uploaded' | 'reused' | 'call-to-confirm'
export function setRxUploaded(id, uploaded, resolution) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.rxUploaded = !!uploaded;
  item.rxResolution = uploaded ? resolution || 'uploaded' : null;
  saveCart(cart);
}

export function needsRxUpload() {
  return getCart().some((i) => i.requiresPrescription && !i.rxUploaded);
}

export function cartTotal() {
  return getCart().reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0);
}

export function clearCart() {
  saveCart([]);
}

export function updateQty(id, delta) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, (item.qty || 1) + delta);
  saveCart(cart);
}

export function removeFromCart(id) {
  saveCart(getCart().filter((i) => i.id !== id));
}

export function cartCount() {
  return getCart().reduce((sum, i) => sum + (i.qty || 1), 0);
}
