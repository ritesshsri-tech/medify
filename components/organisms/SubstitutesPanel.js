// Substitutes panel — same salt/strength/form alternatives — ported from
// Legacy pages/medicine-detail.html (renderSubstitutes, loadMoreSubs,
// renderMobileInlineBlocks). Desktop shows a sidebar with load-more paging;
// mobile inlines a compact block (top 3) plus an office contact summary after
// the side-effects section, since there's no sidebar on small screens.

import { paise } from '../../js/utils.js';

const SUBS_PAGE = 5;

let allSubs = [];
let subsShown = 0;

function subsCardHtml(s) {
  return `
<div class="border border-blue-100 rounded-lg p-2.5 hover:bg-blue-50 cursor-pointer transition-colors" data-substitute-id="${s.id}">
  <p class="text-xs font-semibold text-slate-800 leading-tight">${s.brandName}</p>
  <p class="text-xs text-slate-500 mt-0.5 truncate">${s.manufacturer}</p>
  <p class="text-xs font-bold text-blue-700 mt-1">${paise(s.sellingPricePaise)}</p>
</div>`;
}

export function renderSubstitutes(medicine, allMedicines, siteConfig) {
  allSubs = allMedicines.filter(
    (m) =>
      m.saltName === medicine.saltName &&
      m.strength === medicine.strength &&
      m.form === medicine.form &&
      m.id !== medicine.id &&
      m.status === 'published'
  );
  subsShown = 0;
  renderSubsSidebar();
  renderMobileInlineBlocks(siteConfig);
}

export function renderSubsSidebar() {
  const sidebar = document.getElementById('subsSidebar');
  const container = document.getElementById('subsCards');
  const loadMoreBtn = document.getElementById('subsLoadMore');
  const noneEl = document.getElementById('subsNone');
  if (!sidebar) return;

  if (allSubs.length === 0) {
    sidebar.style.display = 'none';
    return;
  }

  sidebar.style.display = 'block';
  subsShown = Math.min(SUBS_PAGE, allSubs.length);
  container.innerHTML = allSubs.slice(0, subsShown).map(subsCardHtml).join('');

  loadMoreBtn.classList.toggle('hidden', allSubs.length <= SUBS_PAGE);
  if (noneEl) noneEl.classList.add('hidden');
}

export function loadMoreSubs() {
  const container = document.getElementById('subsCards');
  const loadMoreBtn = document.getElementById('subsLoadMore');
  const next = allSubs.slice(subsShown, subsShown + SUBS_PAGE);
  next.forEach((s) => container.insertAdjacentHTML('beforeend', subsCardHtml(s)));
  subsShown += next.length;
  if (subsShown >= allSubs.length) loadMoreBtn.classList.add('hidden');
}

// Mobile-only inline blocks (substitutes + office contacts), injected after
// #sideeffects since mobile has no persistent sidebar to host this content.
export function renderMobileInlineBlocks(siteConfig) {
  const existing = document.getElementById('mobInlineBlocks');
  if (existing) existing.remove();

  const sideEffectsSection = document.getElementById('sideeffects');
  if (!sideEffectsSection) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'mobInlineBlocks';
  wrapper.className = 'lg:hidden';

  if (allSubs.length > 0) {
    wrapper.innerHTML += `
<div class="bg-white border border-blue-100 rounded-xl p-4 shadow-sm mb-5">
  <p class="text-xs font-700 text-slate-500 uppercase tracking-wider mb-1">Substitute Options</p>
  <p class="text-xs text-slate-500 mb-3">Same salt · Same strength</p>
  <div class="space-y-2">${allSubs.slice(0, 3).map(subsCardHtml).join('')}</div>
  ${allSubs.length > 3 ? `<p class="text-xs text-slate-500 text-center mt-2">+${allSubs.length - 3} more substitutes</p>` : ''}
</div>`;
  }

  if (siteConfig) {
    wrapper.innerHTML += `
<div class="bg-white border border-blue-100 rounded-xl p-4 shadow-sm mb-5">
  <p class="text-xs font-700 text-slate-500 uppercase tracking-wider mb-3">Our Offices</p>
  ${[siteConfig.headOffice, ...(siteConfig.branchOffices || [])]
    .map(
      (o) => `
  <div class="mb-3 pb-3 border-b border-blue-50 last:border-0 last:mb-0 last:pb-0">
    <p class="text-xs font-semibold text-slate-700">${o.label} — ${o.company}</p>
    <div class="flex gap-3 mt-1">
      ${o.mobile ? `<a href="tel:${o.mobile}" class="text-[11px] text-blue-600 hover:underline">📞 Call</a>` : ''}
      ${o.whatsapp ? `<a href="https://wa.me/${o.whatsapp.replace(/[^0-9]/g, '')}" target="_blank" class="text-[11px] text-teal-600 hover:underline">💬 WhatsApp</a>` : ''}
    </div>
  </div>`
    )
    .join('')}
</div>`;
  }

  sideEffectsSection.insertAdjacentElement('afterend', wrapper);
}
