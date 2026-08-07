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
    cart.push({ id: medicine.id, brandName: medicine.brandName, price: medicine.sellingPricePaise, qty: 1 });
  }
  saveCart(cart);
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
