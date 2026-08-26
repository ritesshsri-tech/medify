export const AD_SLOTS = ['left', 'middle'];
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB per banner image

export function getBanners() {
  return JSON.parse(localStorage.getItem('adBanners') || '[]');
}

function saveBanners(list) {
  localStorage.setItem('adBanners', JSON.stringify(list));
}

export function getBannersForSlot(slot, activeOnly) {
  return getBanners()
    .filter((b) => b.slot === slot)
    .filter((b) => !activeOnly || b.active);
}

export function addBanner({ slot, imageDataUrl, linkUrl, altText }) {
  const list = getBanners();
  const entry = {
    id: 'AD' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 900 + 100),
    slot,
    imageDataUrl,
    linkUrl: linkUrl || '',
    altText: altText || '',
    active: true,
    createdAt: new Date().toISOString(),
  };
  list.unshift(entry);
  saveBanners(list);
  return entry;
}

export function setBannerActive(id, active) {
  const list = getBanners();
  const b = list.find((x) => x.id === id);
  if (!b) return;
  b.active = active;
  saveBanners(list);
}

export function removeBanner(id) {
  saveBanners(getBanners().filter((b) => b.id !== id));
}
