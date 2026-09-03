export const AD_SLOTS = ['left', 'middle'];

/**
 * Bundled fallback banners, shown when a slot has nothing in localStorage.
 *
 * Admin uploads live in localStorage, which is per-browser: they are only
 * ever visible to the person who uploaded them. These repo-hosted images
 * are what every visitor sees on a fresh browser, so the demo is never
 * missing its banners. An Admin upload still overrides them locally.
 *
 * Paths are relative to the site root; callers on pages/ prefix '../'.
 */
export const DEFAULT_BANNERS = {
  left: [{ imageDataUrl: 'assets/ads/left-default.jpg', linkUrl: '', altText: 'Up to 20% off on medicines' }],
  middle: [{ imageDataUrl: 'assets/ads/middle-default.jpg', linkUrl: '', altText: 'Free delivery on orders above Rs 499' }],
};

/**
 * Banners to render for a slot: the admin-uploaded ones when present,
 * otherwise the bundled defaults. `pathPrefix` is prepended to default
 * image paths so pages outside the site root resolve them correctly.
 */
export function getDisplayBanners(slot, pathPrefix = '') {
  const stored = getBannersForSlot(slot, true);
  if (stored.length > 0) return stored;
  return (DEFAULT_BANNERS[slot] || []).map((b) => ({
    ...b,
    id: 'default-' + slot,
    isDefault: true,
    imageDataUrl: pathPrefix + b.imageDataUrl,
  }));
}
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB accepted from the user

// Banners never display wider than ~1200px (middle) or ~440px (left @2x), so
// storing full-resolution art wastes the ~5MB localStorage budget for no
// visible gain. Downscale to these caps before storing.
const MAX_STORED_WIDTH = { left: 440, middle: 1200 };
const JPEG_QUALITY = 0.82;

/**
 * Downscale an image file and return a compressed data URL.
 * Falls back to the original data URL if the browser cannot decode it.
 */
export function compressImage(file, slot) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that image file.'));
    reader.onload = () => {
      const original = reader.result;
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a readable image.'));
      img.onload = () => {
        const cap = MAX_STORED_WIDTH[slot] || 1200;
        const scale = Math.min(1, cap / img.naturalWidth);
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          // JPEG has no alpha, so flatten onto white to avoid black fringing.
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          const out = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
          resolve(out.length < original.length ? out : original);
        } catch (err) {
          resolve(original);
        }
      };
      img.src = original;
    };
    reader.readAsDataURL(file);
  });
}

export function getBanners() {
  return JSON.parse(localStorage.getItem('adBanners') || '[]');
}

function saveBanners(list) {
  // localStorage is ~5MB per origin and base64 inflates images by ~33%, so a
  // couple of large banners can exhaust it. Surface the failure instead of
  // letting the exception escape and leave the caller thinking it saved.
  try {
    localStorage.setItem('adBanners', JSON.stringify(list));
    return true;
  } catch (err) {
    return false;
  }
}

/** Approximate bytes currently used by stored banners. */
export function getStorageBytes() {
  return (localStorage.getItem('adBanners') || '').length;
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
  if (!saveBanners(list)) {
    throw new Error(
      'Not enough browser storage to save this banner. Delete an existing ' +
      'banner or use a smaller image, then try again.'
    );
  }
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
