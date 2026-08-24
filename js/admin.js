import { getOrders, trackingStages, setOrderStage, canDispatch, setRxStatus } from './orders.js';
import { getCurrentStaff, clearCurrentStaff, can, addStaff, getStaff, removeStaff } from './staff.js';
import { fetchMedicines } from './data.js';
import { addMedicine, editMedicine, deleteMedicine, getAdded } from './medicineOverrides.js';
import { getEnquiries, setEnquiryStatus } from './medicalTourism.js';
import { paise } from './utils.js';

const STAGE_LABELS = {
  placed: 'Placed',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};
const ROLE_LABELS = { admin: 'Admin', pharmacist: 'Pharmacist', delivery: 'Delivery' };

const staffUser = getCurrentStaff();
if (!staffUser) {
  window.location.replace('admin-login.html');
}

let allMedicines = [];
let catalogVisibleCount = 20;
let catalogSearchTerm = '';

function init() {
  document.getElementById('staffName').textContent = staffUser.name;
  document.getElementById('staffRole').textContent = ROLE_LABELS[staffUser.role] || staffUser.role;

  document.getElementById('staffSignOutBtn').addEventListener('click', () => {
    clearCurrentStaff();
    window.location.replace('admin-login.html');
  });

  applyRoleVisibility();
  bindTabs();
  renderDispatch();
  renderRxQueue();
  loadCatalog();
  renderStaffTable();
  renderMtTable();

  document.getElementById('catalogSearch').addEventListener('input', (e) => {
    catalogSearchTerm = e.target.value.trim().toLowerCase();
    catalogVisibleCount = 20;
    renderCatalogTable();
  });
  document.getElementById('catalogLoadMoreBtn').addEventListener('click', () => {
    catalogVisibleCount += 20;
    renderCatalogTable();
  });
}

function applyRoleVisibility() {
  const links = document.querySelectorAll('#tabNav .quick-link');
  let firstVisible = null;
  links.forEach((link) => {
    const perm = link.dataset.perm;
    const allowed = can(staffUser, perm);
    link.style.display = allowed ? '' : 'none';
    if (allowed && !firstVisible) firstVisible = link.dataset.tab;
  });
  if (firstVisible) switchTab(firstVisible);
}

function bindTabs() {
  document.querySelectorAll('#tabNav .quick-link').forEach((link) => {
    link.addEventListener('click', () => switchTab(link.dataset.tab));
  });
}

function switchTab(tab) {
  document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
  document.querySelectorAll('#tabNav .quick-link').forEach((l) => l.classList.remove('active'));
  const panel = document.getElementById(`tab-${tab}`);
  if (panel) panel.classList.add('active');
  const link = document.querySelector(`#tabNav .quick-link[data-tab="${tab}"]`);
  if (link) link.classList.add('active');
}

// ============ DISPATCH MANAGEMENT ============
function renderDispatch() {
  const orders = getOrders();
  document.getElementById('dispatchEmpty').classList.toggle('hidden', orders.length > 0);

  document.getElementById('dispatchTableBody').innerHTML = orders
    .map((o) => {
      const dispatchable = canDispatch(o);
      const rxBadge = rxStatusBadge(o.rxStatus);
      const stageOptions = trackingStages()
        .map((s) => `<option value="${s}" ${s === o.stage ? 'selected' : ''}>${STAGE_LABELS[s]}</option>`)
        .join('');

      return `
<tr>
  <td>
    <p class="font-700 text-slate-900">${o.id}</p>
    <p class="text-xs text-slate-500">${new Date(o.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
  </td>
  <td>${o.items.map((i) => `${i.brandName} &times;${i.qty}`).join('<br>')}</td>
  <td>${paise(o.total)}</td>
  <td>${rxBadge}</td>
  <td>
    <select class="stage-select" data-order-id="${o.id}" ${dispatchable ? '' : 'disabled'}>
      ${stageOptions}
    </select>
    ${!dispatchable ? '<p class="text-[10px] text-amber-600 mt-1">Awaiting Rx approval</p>' : ''}
  </td>
</tr>`;
    })
    .join('');

  document.querySelectorAll('#dispatchTableBody select[data-order-id]').forEach((sel) => {
    sel.addEventListener('change', () => {
      setOrderStage(sel.dataset.orderId, sel.value, staffUser.name);
      renderDispatch();
    });
  });
}

function rxStatusBadge(status) {
  if (!status) return '<span class="badge badge-slate">No Rx</span>';
  if (status === 'pending') return '<span class="badge badge-amber">Pending Review</span>';
  if (status === 'approved') return '<span class="badge badge-green">Approved</span>';
  return '<span class="badge badge-red">Rejected</span>';
}

// ============ PRESCRIPTION APPROVAL ============
const RX_RESOLUTION_BADGE = {
  uploaded: '<span class="badge badge-blue">New Upload</span>',
  reused: '<span class="badge badge-slate">Reused Rx</span>',
  'call-to-confirm': '<span class="badge badge-amber">Call to Confirm</span>',
};

function renderRxQueue() {
  const orders = getOrders().filter((o) => o.rxStatus === 'pending');
  document.getElementById('rxQueueEmpty').classList.toggle('hidden', orders.length > 0);

  document.getElementById('rxQueue').innerHTML = orders
    .map((o) => {
      const rxItems = o.items.filter((i) => i.requiresPrescription);
      const resolution = rxItems[0] ? rxItems[0].rxResolution : null;
      const badge = RX_RESOLUTION_BADGE[resolution] || '';
      const files = o.rxFiles || [];

      const filesBlock =
        resolution === 'call-to-confirm'
          ? `<p class="text-xs text-amber-700 mt-2">Patient has no prescription — call to confirm before approving.</p>`
          : files.length
            ? files
                .map(
                  (f) => `
<div class="flex items-center gap-2 border border-slate-100 rounded-lg px-3 py-2 mt-2">
  <svg width="15" height="15" fill="none" stroke="#2563EB" stroke-width="2" viewBox="0 0 24 24" class="flex-shrink-0"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
  <p class="text-xs font-medium text-slate-800 truncate">${f}</p>
</div>`
                )
                .join('')
            : `<p class="text-xs text-slate-500 mt-2">No prescription file found</p>`;

      const rxItemNames = rxItems.map((i) => i.brandName).join(', ');

      return `
<div class="border border-slate-200 rounded-xl p-4">
  <div class="flex items-start justify-between gap-3 flex-wrap mb-1">
    <div>
      <p class="font-700 text-slate-900 text-sm">${o.id}</p>
      <p class="text-xs text-slate-500">Placed ${new Date(o.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} &middot; ${paise(o.total)}</p>
    </div>
    <span class="badge badge-amber">Pending Review</span>
  </div>
  <p class="text-xs text-slate-600 mt-2">Rx items: <span class="font-medium text-slate-800">${rxItemNames}</span> ${badge}</p>
  ${filesBlock}
  <div class="flex items-center gap-2 mt-4">
    <button type="button" class="btn-sm btn-approve" data-approve="${o.id}">Approve</button>
    <button type="button" class="btn-sm btn-reject" data-reject="${o.id}">Reject</button>
  </div>
</div>`;
    })
    .join('');

  document.querySelectorAll('[data-approve]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setRxStatus(btn.dataset.approve, 'approved', staffUser.name);
      renderRxQueue();
      renderDispatch();
    });
  });
  document.querySelectorAll('[data-reject]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const reason = window.prompt('Reason for rejecting this prescription?') || 'Not specified';
      setRxStatus(btn.dataset.reject, 'rejected', staffUser.name, reason);
      renderRxQueue();
      renderDispatch();
    });
  });
}

// ============ MEDICINE CATALOG ============
async function loadCatalog() {
  allMedicines = await fetchMedicines();
  renderCatalogTable();
}

function renderCatalogTable() {
  let list = allMedicines;
  if (catalogSearchTerm) {
    list = list.filter((m) => (m.brandName || '').toLowerCase().includes(catalogSearchTerm));
  }
  const visible = list.slice(0, catalogVisibleCount);
  const addedIds = new Set(getAdded().map((m) => m.id));

  document.getElementById('catalogTableBody').innerHTML = visible
    .map(
      (m) => `
<tr>
  <td>
    <p class="font-600 text-slate-900">${m.brandName}</p>
    <p class="text-xs text-slate-500">${m.saltName || ''}</p>
    ${addedIds.has(m.id) ? '<span class="badge badge-blue mt-1">Locally Added</span>' : ''}
  </td>
  <td>${m.diseaseCategory || ''}</td>
  <td>${m.manufacturer || ''}</td>
  <td>${paise(m.sellingPricePaise || 0)}</td>
  <td>${m.requiresPrescription ? '<span class="badge badge-red">Rx</span>' : '<span class="badge badge-green">OTC</span>'}</td>
  <td>
    <div class="flex gap-1.5">
      <button type="button" class="btn-sm btn-edit" data-edit-med="${m.id}">Edit</button>
      <button type="button" class="btn-sm btn-delete" data-delete-med="${m.id}">Delete</button>
    </div>
  </td>
</tr>`
    )
    .join('');

  document.getElementById('catalogLoadMoreWrap').classList.toggle('hidden', visible.length >= list.length);

  document.querySelectorAll('[data-edit-med]').forEach((btn) => {
    btn.addEventListener('click', () => window.openMedForm(btn.dataset.editMed));
  });
  document.querySelectorAll('[data-delete-med]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!window.confirm('Delete this medicine from the catalog?')) return;
      deleteMedicine(btn.dataset.deleteMed);
      allMedicines = await fetchMedicines();
      renderCatalogTable();
    });
  });
}

window.openMedForm = function (id) {
  const form = document.getElementById('medForm');
  form.classList.remove('hidden');
  document.getElementById('medFormId').value = id || '';

  const med = id ? allMedicines.find((m) => m.id === id) : null;
  document.getElementById('medBrandName').value = med ? med.brandName || '' : '';
  document.getElementById('medSaltName').value = med ? med.saltName || '' : '';
  document.getElementById('medManufacturer').value = med ? med.manufacturer || '' : '';
  document.getElementById('medCategory').value = med ? med.diseaseCategory || '' : '';
  document.getElementById('medForm2').value = med ? med.form || '' : '';
  document.getElementById('medStrength').value = med ? med.strength || '' : '';
  document.getElementById('medPackSize').value = med ? med.packSize || '' : '';
  document.getElementById('medMrp').value = med ? (med.mrpPaise || 0) / 100 : '';
  document.getElementById('medSellingPrice').value = med ? (med.sellingPricePaise || 0) / 100 : '';
  document.getElementById('medRequiresRx').checked = med ? !!med.requiresPrescription : false;
  document.getElementById('medDescription').value = med ? med.description || '' : '';

  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.closeMedForm = function () {
  document.getElementById('medForm').classList.add('hidden');
};

window.saveMedicine = async function () {
  const id = document.getElementById('medFormId').value;
  const data = {
    brandName: document.getElementById('medBrandName').value.trim(),
    saltName: document.getElementById('medSaltName').value.trim(),
    manufacturer: document.getElementById('medManufacturer').value.trim(),
    diseaseCategory: document.getElementById('medCategory').value.trim(),
    form: document.getElementById('medForm2').value.trim(),
    strength: document.getElementById('medStrength').value.trim(),
    packSize: document.getElementById('medPackSize').value.trim(),
    mrpPaise: Math.round(parseFloat(document.getElementById('medMrp').value || '0') * 100),
    sellingPricePaise: Math.round(parseFloat(document.getElementById('medSellingPrice').value || '0') * 100),
    requiresPrescription: document.getElementById('medRequiresRx').checked,
    description: document.getElementById('medDescription').value.trim(),
  };

  if (!data.brandName) return;

  if (id) {
    editMedicine(id, data);
  } else {
    addMedicine(data);
  }

  window.closeMedForm();
  allMedicines = await fetchMedicines();
  renderCatalogTable();
};

// ============ STAFF MANAGEMENT ============
function renderStaffTable() {
  const staff = getStaff();
  document.getElementById('staffTableBody').innerHTML = staff
    .map(
      (s) => `
<tr>
  <td class="font-600 text-slate-900">${s.name}</td>
  <td>${s.email}</td>
  <td><span class="badge badge-blue">${ROLE_LABELS[s.role] || s.role}</span></td>
  <td class="text-xs text-slate-500">${new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
  <td>
    ${s.id !== staffUser.id ? `<button type="button" class="btn-sm btn-delete" data-delete-staff="${s.id}">Remove</button>` : '<span class="text-xs text-slate-400">You</span>'}
  </td>
</tr>`
    )
    .join('');

  document.querySelectorAll('[data-delete-staff]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!window.confirm('Remove this staff member?')) return;
      removeStaff(btn.dataset.deleteStaff);
      renderStaffTable();
    });
  });
}

window.openStaffForm = () => document.getElementById('staffForm').classList.remove('hidden');
window.closeStaffForm = () => document.getElementById('staffForm').classList.add('hidden');

window.saveStaff = function () {
  const name = document.getElementById('newStaffName').value.trim();
  const email = document.getElementById('newStaffEmail').value.trim();
  const password = document.getElementById('newStaffPassword').value.trim();
  const role = document.getElementById('newStaffRole').value;

  if (!name || !email || !password) return;

  addStaff({ name, email, password, role });
  ['newStaffName', 'newStaffEmail', 'newStaffPassword'].forEach((id) => (document.getElementById(id).value = ''));
  window.closeStaffForm();
  renderStaffTable();
};

// ============ MEDICAL TOURISM ============
const MT_STATUS_LABELS = { new: 'Under Review', contacted: 'Contacted', closed: 'Closed' };
const MT_STATUS_BADGE = { new: 'badge-amber', contacted: 'badge-blue', closed: 'badge-slate' };

function renderMtTable() {
  const enquiries = getEnquiries();
  document.getElementById('mtEmpty').classList.toggle('hidden', enquiries.length > 0);

  document.getElementById('mtTableBody').innerHTML = enquiries
    .map(
      (e) => `
<tr>
  <td class="font-600 text-slate-900">${e.id}</td>
  <td>${e.name}</td>
  <td class="text-xs text-slate-600">${e.phone}<br>${e.email}</td>
  <td>${e.country}</td>
  <td>${e.treatment}</td>
  <td>${e.preferredDates || '—'}</td>
  <td class="text-xs text-slate-500">${new Date(e.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
  <td><span class="badge ${MT_STATUS_BADGE[e.status] || 'badge-slate'}">${MT_STATUS_LABELS[e.status] || e.status}</span></td>
  <td>
    <select class="field-input" style="padding:4px 8px;font-size:12px;" data-mt-status="${e.id}">
      <option value="new" ${e.status === 'new' ? 'selected' : ''}>Under Review</option>
      <option value="contacted" ${e.status === 'contacted' ? 'selected' : ''}>Contacted</option>
      <option value="closed" ${e.status === 'closed' ? 'selected' : ''}>Closed</option>
    </select>
  </td>
</tr>`
    )
    .join('');

  document.querySelectorAll('[data-mt-status]').forEach((sel) => {
    sel.addEventListener('change', () => {
      setEnquiryStatus(sel.dataset.mtStatus, sel.value);
      renderMtTable();
    });
  });
}

init();
