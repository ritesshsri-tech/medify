import { applyOverrides } from './medicineOverrides.js';

let _baseMedicines = null;
let _siteConfig = null;
let _manufacturers = null;

export async function fetchMedicines() {
  if (!_baseMedicines) {
    const res = await fetch('../data/medicines.json');
    if (!res.ok) throw new Error('Failed to load medicines.json');
    _baseMedicines = await res.json();
  }
  // Overrides are re-applied on every call (cheap in-memory merge) so
  // admin catalog edits show up immediately without a page reload.
  return applyOverrides(_baseMedicines);
}

export async function fetchSiteConfig() {
  if (_siteConfig) return _siteConfig;
  const res = await fetch('../data/site-config.json');
  if (!res.ok) throw new Error('Failed to load site-config.json');
  _siteConfig = await res.json();
  return _siteConfig;
}

export async function fetchManufacturers() {
  if (_manufacturers) return _manufacturers;
  const res = await fetch('../data/manufacturers.json');
  if (!res.ok) throw new Error('Failed to load manufacturers.json');
  _manufacturers = await res.json();
  return _manufacturers;
}
