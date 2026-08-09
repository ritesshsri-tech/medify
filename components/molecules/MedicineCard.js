// Medicine card — ported from buildCard(m) in Legacy pages/category.html.
// Card-level carousel state (cardIndex) stays local to this module so multiple
// grids on the same page don't collide.

import { paise, discount } from '../../js/utils.js';

const MED_IMAGES = [
  '../assets/Medicine1.webp',
  '../assets/Medicine2.avif',
  '../assets/Medicine3.jpeg',
  '../assets/Medicine4.webp',
  '../assets/Medicine5.jpeg',
  '../assets/Medicine6.jpg',
];

const cardIndex = {};

function cardImages(m) {
  return Array.isArray(m.image) && m.image.length ? m.image : MED_IMAGES;
}

function rxBadgeHtml(m) {
  return m.requiresPrescription
    ? `<span class="rx-badge"><span style="font-weight:800;letter-spacing:0.03em;">Rx</span>&thinsp;Prescription Required</span>`
    : `<span class="otc-badge"><svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>OTC</span>`;
}

export function buildCard(m) {
  const price = paise(m.sellingPricePaise);
  const mrp = paise(m.mrpPaise);
  const off = discount(m.mrpPaise, m.sellingPricePaise);

  if (cardIndex[m.id] === undefined) {
    const pool = cardImages(m);
    cardIndex[m.id] = Math.floor(Math.random() * pool.length);
  }
  const imgs = cardImages(m);
  const idx = cardIndex[m.id] % imgs.length;
  const showArrows = imgs.length > 1;

  return `
<div class="bg-white rounded-xl border border-blue-100 card-shadow transition-shadow cursor-pointer group" onclick="window.location.href='medicine-detail.html?id=${m.id}'">
  <div class="relative h-40 rounded-t-xl bg-blue-50 overflow-hidden border-b border-blue-100 card-img-wrap">
    <img
      id="cimg-${m.id}"
      src="${imgs[idx]}"
      alt="${m.brandName}"
      class="w-full h-full object-contain p-2 cursor-zoom-in transition-opacity duration-200"
      onclick="event.stopPropagation(); window.openLightbox('${m.id}')"
    />
    ${
      showArrows
        ? `<button type="button" class="carousel-arrow carousel-arrow-left" onclick="event.stopPropagation(); window.carouselPrev('${m.id}')">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button type="button" class="carousel-arrow carousel-arrow-right" onclick="event.stopPropagation(); window.carouselNext('${m.id}')">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <div class="carousel-dots" id="cdots-${m.id}">
        ${imgs.map((_, i) => `<span class="carousel-dot${i === idx ? ' active' : ''}"></span>`).join('')}
      </div>`
        : ''
    }
  </div>
  <div class="p-4">
    <div class="mb-1">
      <h3 class="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">${m.brandName}</h3>
    </div>
    <p class="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Salt · Strength</p>
    <p class="text-xs text-slate-600 font-medium mb-2">${m.saltName} · ${m.strength}</p>
    <p class="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Form · Pack</p>
    <p class="text-xs text-slate-600 font-medium mb-2">${m.form} · ${m.packSize}</p>
    <p class="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Manufacturer</p>
    <p class="text-xs text-slate-600 font-medium mb-3">${m.manufacturer}</p>
    <div class="flex items-center gap-2 mb-3 flex-wrap">
      ${rxBadgeHtml(m)}
      <span class="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">${m.diseaseCategory}</span>
    </div>
    <div class="flex items-center gap-2 flex-wrap mb-3">
      <span class="text-lg font-bold text-slate-900">${price}</span>
      ${off > 0 ? `<span class="text-xs text-slate-500 line-through">${mrp}</span><span class="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">${off}% off</span>` : ''}
    </div>
    <div class="flex items-center justify-between gap-2">
      <button
        type="button"
        onclick="event.stopPropagation(); window.openQueryModal('${m.id}')"
        class="flex items-center gap-1 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-full transition-colors"
      >
        <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Send Query
      </button>
      <div class="flex items-center gap-1.5">
        <a
          href="https://wa.me/911800123456?text=${encodeURIComponent('Hi, I want to order ' + m.brandName)}"
          target="_blank"
          rel="noopener noreferrer"
          onclick="event.stopPropagation()"
          class="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-full transition-colors"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.528 5.845L.057 23.882l6.186-1.444A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.793 9.793 0 0 1-5.006-1.374l-.36-.213-3.67.857.885-3.567-.234-.375A9.818 9.818 0 0 1 2.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z"/></svg>
          WhatsApp
        </a>
        <button
          type="button"
          onclick="event.stopPropagation(); window.addMedicineToCart('${m.id}')"
          class="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full transition-colors"
        >
          + Add
        </button>
      </div>
    </div>
  </div>
</div>`;
}

export function getCardImages(m) {
  return cardImages(m);
}

export function getCardIndex(id) {
  return cardIndex[id];
}

export function setCardIndex(id, index) {
  cardIndex[id] = index;
}
