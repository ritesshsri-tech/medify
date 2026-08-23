const TRACKING_STAGES = ['placed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

export function getOrders() {
  return JSON.parse(localStorage.getItem('orders') || '[]');
}

function saveOrders(orders) {
  localStorage.setItem('orders', JSON.stringify(orders));
}

export function createOrder({ items, address, paymentMethod, total }) {
  const orders = getOrders();
  const order = {
    id: 'ORD' + Date.now().toString().slice(-8),
    placedAt: new Date().toISOString(),
    items,
    address,
    paymentMethod,
    total,
    stage: 'placed',
    stageUpdatedAt: new Date().toISOString(),
  };
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

export function getOrder(id) {
  return getOrders().find((o) => o.id === id) || null;
}

export function trackingStages() {
  return TRACKING_STAGES;
}

// Deterministically derive a display stage from elapsed time since placement,
// so orders visibly "progress" on repeat visits without needing a backend.
export function currentStage(order) {
  const elapsedMin = (Date.now() - new Date(order.placedAt).getTime()) / 60000;
  const idx = Math.min(TRACKING_STAGES.length - 1, Math.floor(elapsedMin / 2));
  return TRACKING_STAGES[idx];
}
