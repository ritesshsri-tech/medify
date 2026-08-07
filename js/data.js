let _medicines = null;
let _siteConfig = null;
let _manufacturers = null;

export async function fetchMedicines() {
  if (_medicines) return _medicines;
  const res = await fetch('../data/medicines.json');
  if (!res.ok) throw new Error('Failed to load medicines.json');
  _medicines = await res.json();
  return _medicines;
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
