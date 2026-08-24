const ROLES = ['admin', 'pharmacist', 'delivery'];

const ROLE_PERMISSIONS = {
  admin: ['dispatch', 'rx-approval', 'catalog', 'staff', 'medical-tourism'],
  pharmacist: ['rx-approval', 'catalog'],
  delivery: ['dispatch'],
};

const SEED_STAFF = [
  {
    id: 'staff00000001',
    name: 'Admin',
    email: 'admin@medify.local',
    password: 'admin123',
    role: 'admin',
    createdAt: new Date(0).toISOString(),
  },
  {
    id: 'staff00000002',
    name: 'Pharmacist',
    email: 'pharmacist@medify.local',
    password: 'pharma123',
    role: 'pharmacist',
    createdAt: new Date(0).toISOString(),
  },
  {
    id: 'staff00000003',
    name: 'Dispatch',
    email: 'dispatch@medify.local',
    password: 'dispatch123',
    role: 'delivery',
    createdAt: new Date(0).toISOString(),
  },
];

export function roles() {
  return ROLES;
}

export function permissionsFor(role) {
  return ROLE_PERMISSIONS[role] || [];
}

export function can(user, permission) {
  return !!user && permissionsFor(user.role).includes(permission);
}

export function getStaff() {
  const raw = localStorage.getItem('staff');
  if (!raw) {
    const seeded = SEED_STAFF.slice();
    localStorage.setItem('staff', JSON.stringify(seeded));
    return seeded;
  }
  return JSON.parse(raw);
}

function saveStaff(staff) {
  localStorage.setItem('staff', JSON.stringify(staff));
}

export function addStaff({ name, email, password, role }) {
  const staff = getStaff();
  const entry = {
    id: 'staff' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000),
    name,
    email,
    password,
    role,
    createdAt: new Date().toISOString(),
  };
  staff.push(entry);
  saveStaff(staff);
  return entry;
}

export function removeStaff(id) {
  saveStaff(getStaff().filter((s) => s.id !== id));
}

export function findStaffByCredentials(email, password) {
  return getStaff().find((s) => s.email.toLowerCase() === email.toLowerCase() && s.password === password) || null;
}

export function getCurrentStaff() {
  return JSON.parse(localStorage.getItem('currentStaff') || 'null');
}

export function setCurrentStaff(staff) {
  localStorage.setItem('currentStaff', JSON.stringify(staff));
}

export function clearCurrentStaff() {
  localStorage.removeItem('currentStaff');
}
