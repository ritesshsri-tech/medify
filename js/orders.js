const TRACKING_STAGES = ['placed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
const RX_STATUSES = ['pending', 'approved', 'rejected'];

export function getOrders() {
  return JSON.parse(localStorage.getItem('orders') || '[]');
}

function saveOrders(orders) {
  localStorage.setItem('orders', JSON.stringify(orders));
}

function generateOrderId(existingOrders) {
  let id;
  do {
    id = 'ORD' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 900 + 100);
  } while (existingOrders.some((o) => o.id === id));
  return id;
}

export function createOrder({ items, address, paymentMethod, total, rxFiles }) {
  const orders = getOrders();
  const hasRxItem = items.some((i) => i.requiresPrescription);
  const order = {
    id: generateOrderId(orders),
    placedAt: new Date().toISOString(),
    items,
    address,
    paymentMethod,
    total,
    stage: 'placed',
    stageUpdatedAt: new Date().toISOString(),
    rxStatus: hasRxItem ? 'pending' : null,
    rxFiles: hasRxItem ? rxFiles || [] : [],
    rxReviewedBy: null,
    rxReviewedAt: null,
    rxRejectReason: null,
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

export function rxStatuses() {
  return RX_STATUSES;
}

// Stage is admin-controlled (set via Dispatch Management); this simply
// reads the stored value rather than deriving it, now that a real
// operator drives progression instead of elapsed time.
export function currentStage(order) {
  return order.stage || 'placed';
}

// An order with pending Rx approval cannot move past 'placed' — dispatch
// is blocked until the pharmacist/admin approves the prescription.
export function canDispatch(order) {
  return order.rxStatus !== 'pending';
}

export function setOrderStage(id, stage, updatedBy) {
  const orders = getOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) return;
  if (stage !== 'placed' && !canDispatch(order)) return;
  order.stage = stage;
  order.stageUpdatedAt = new Date().toISOString();
  order.stageUpdatedBy = updatedBy || null;
  saveOrders(orders);
}

export function setRxStatus(id, status, reviewedBy, rejectReason) {
  const orders = getOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) return;
  order.rxStatus = status;
  order.rxReviewedBy = reviewedBy || null;
  order.rxReviewedAt = new Date().toISOString();
  order.rxRejectReason = status === 'rejected' ? rejectReason || null : null;
  saveOrders(orders);
}
