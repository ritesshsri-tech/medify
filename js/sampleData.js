// Selective sample-data seeding/deletion, used by the Admin > Sample Data tab.
// Each category is independent: seeding one never touches another category's keys.

import { createOrder, setOrderStage, setRxStatus } from './orders.js';
import { addAddress } from './addresses.js';
import { addPrescription } from './prescriptions.js';
import { getStaff } from './staff.js';
import { addMedicine, editMedicine } from './medicineOverrides.js';

const RX_MED = {
  id: 'med_00001',
  brandName: 'Veenat 400',
  form: 'Tablet',
  strength: '400 mg',
  packSize: '10 Tablets',
  price: 720000,
  mrp: 850000,
  image: '',
  requiresPrescription: true,
};
const RX_MED_2 = {
  id: 'med_00003',
  brandName: 'Amoxicillin 500',
  form: 'Capsule',
  strength: '500 mg',
  packSize: '10 Capsules',
  price: 72000,
  mrp: 85000,
  image: '',
  requiresPrescription: true,
};
const OTC_MED = {
  id: 'med_00002',
  brandName: 'Aspirin 500',
  form: 'Tablet',
  strength: '500 mg',
  packSize: '10 Tablets',
  price: 28000,
  mrp: 35000,
  image: '',
  requiresPrescription: false,
};

const DEMO_ADDR = { name: 'Demo Patient', phone: '9876500001', line1: '221B Residency Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560025' };

export const SAMPLE_CATEGORIES = [
  {
    key: 'addresses',
    label: 'Saved Addresses',
    description: '2 demo addresses for the Demo Patient identity',
    keys: ['addresses'],
  },
  {
    key: 'prescriptions',
    label: 'Saved Prescriptions',
    description: '2 sample prescription file records',
    keys: ['prescriptions'],
  },
  {
    key: 'orders',
    label: 'Orders & Cart',
    description: '5 demo orders covering every Rx/dispatch state, plus a cart with an unresolved Rx item',
    keys: ['orders', 'cart'],
  },
  {
    key: 'catalog',
    label: 'Catalog Overrides',
    description: '1 admin-added medicine + 1 edited medicine (Aspirin 500)',
    keys: ['medicinesAdded', 'medicinesEdited', 'medicinesDeletedIds'],
  },
  {
    key: 'staff',
    label: 'Staff Accounts',
    description: 'Default Admin / Pharmacist / Dispatch logins',
    keys: ['staff'],
  },
];

export function deleteCategories(categoryKeys) {
  const cats = SAMPLE_CATEGORIES.filter((c) => categoryKeys.includes(c.key));
  cats.forEach((c) => c.keys.forEach((k) => localStorage.removeItem(k)));
  return cats.map((c) => c.label);
}

function seedAddresses() {
  addAddress({ ...DEMO_ADDR });
  addAddress({ name: 'Demo Patient (Office)', phone: '9876500002', line1: '4th Floor, Tech Park', city: 'Bengaluru', state: 'Karnataka', pincode: '560103' });
}

function seedPrescriptions() {
  addPrescription({ fileName: 'veenat-rx-scan.jpg', forMedicineId: RX_MED.id, forMedicineName: RX_MED.brandName });
  addPrescription({ fileName: 'amoxicillin-rx-scan.pdf', forMedicineId: RX_MED_2.id, forMedicineName: RX_MED_2.brandName });
}

function seedOrders() {
  const order1 = createOrder({
    items: [{ ...RX_MED, qty: 1, rxUploaded: true, rxResolution: 'uploaded' }],
    address: DEMO_ADDR,
    paymentMethod: 'upi',
    total: RX_MED.price,
    rxFiles: ['veenat-rx-scan.jpg'],
  });

  const order2 = createOrder({
    items: [{ ...RX_MED_2, qty: 2, rxUploaded: true, rxResolution: 'uploaded' }],
    address: DEMO_ADDR,
    paymentMethod: 'card',
    total: RX_MED_2.price * 2,
    rxFiles: ['amoxicillin-rx-scan.pdf'],
  });
  setRxStatus(order2.id, 'approved', 'Admin');
  setOrderStage(order2.id, 'shipped', 'Admin');

  const order3 = createOrder({
    items: [{ ...RX_MED, qty: 1, rxUploaded: true, rxResolution: 'uploaded' }],
    address: DEMO_ADDR,
    paymentMethod: 'netbanking',
    total: RX_MED.price,
    rxFiles: ['veenat-rx-scan.jpg'],
  });
  setRxStatus(order3.id, 'rejected', 'Admin', 'Prescription image unclear, please re-upload.');

  const order3b = createOrder({
    items: [{ ...RX_MED, qty: 1, rxUploaded: true, rxResolution: 'call-to-confirm' }],
    address: DEMO_ADDR,
    paymentMethod: 'cod',
    total: RX_MED.price,
  });

  const order4 = createOrder({
    items: [{ ...OTC_MED, qty: 3, rxUploaded: false }],
    address: DEMO_ADDR,
    paymentMethod: 'cod',
    total: OTC_MED.price * 3,
  });
  setOrderStage(order4.id, 'delivered', 'Admin');

  const order5 = createOrder({
    items: [{ ...OTC_MED, qty: 1, rxUploaded: false }],
    address: DEMO_ADDR,
    paymentMethod: 'upi',
    total: OTC_MED.price,
  });

  localStorage.setItem(
    'cart',
    JSON.stringify([
      { ...RX_MED, qty: 1, rxUploaded: false },
      { ...OTC_MED, qty: 2, rxUploaded: false },
    ])
  );

  return [order1.id, order2.id, order3.id, order3b.id, order4.id, order5.id];
}

function seedCatalog() {
  addMedicine({
    brandName: 'Metfor-Plus 500',
    saltName: 'Metformin Hydrochloride',
    manufacturer: 'Local Demo Pharma',
    diseaseCategory: 'Endocrine Drugs',
    form: 'Tablet',
    strength: '500 mg',
    packSize: '15 Tablets',
    mrpPaise: 18000,
    sellingPricePaise: 14500,
    requiresPrescription: true,
    description: 'Sample medicine added via the admin Medicine Catalog panel, for testing the "Locally Added" flow.',
  });
  editMedicine('med_00002', {
    sellingPricePaise: 24000,
    description: 'Aspirin 500 — description and price edited via the admin Medicine Catalog panel (demo edit).',
  });
}

const SEEDERS = {
  addresses: seedAddresses,
  prescriptions: seedPrescriptions,
  orders: seedOrders,
  catalog: seedCatalog,
  staff: getStaff,
};

// Seeds only the requested categories. Does NOT reset first — call
// deleteCategories(categoryKeys) beforehand if a clean re-seed is wanted.
export function seedCategories(categoryKeys) {
  const cats = SAMPLE_CATEGORIES.filter((c) => categoryKeys.includes(c.key));
  cats.forEach((c) => SEEDERS[c.key]());
  return cats.map((c) => c.label);
}

export function categoryHasData(categoryKey) {
  const cat = SAMPLE_CATEGORIES.find((c) => c.key === categoryKey);
  if (!cat) return false;
  return cat.keys.some((k) => {
    const raw = localStorage.getItem(k);
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.length > 0 : true;
    } catch (e) {
      return true;
    }
  });
}
