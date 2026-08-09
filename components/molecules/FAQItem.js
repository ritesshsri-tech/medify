// FAQ accordion item — ported from faqAnswerHtml()/toggleFaq()/renderFaqs()
// in Legacy pages/medicine-detail.html. Only one FAQ stays open at a time.

import { sub } from '../../js/utils.js';

export function faqAnswerHtml(text) {
  return text
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('•')) {
        return `<p class="flex gap-2 mt-1"><span class="flex-shrink-0">•</span><span>${trimmed.slice(1).trim()}</span></p>`;
      }
      if (trimmed === '') return '';
      return `<p class="mt-1.5">${trimmed}</p>`;
    })
    .join('');
}

export function renderFaqList(faqs, brandName) {
  return faqs
    .map(
      (faq, i) => `
<div class="border border-blue-100 rounded-xl overflow-hidden">
  <button type="button" aria-expanded="false" class="faq-btn w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-blue-50 text-sm font-semibold text-slate-800 transition-colors text-left" onclick="window.toggleFaq(${i})">
    <span>${sub(faq.q, brandName)}</span>
    <svg class="w-4 h-4 text-blue-400 flex-shrink-0 transition-transform ml-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
  </button>
  <div id="faq-${i}" class="faq-answer px-4 py-3 bg-blue-50/40 text-sm text-slate-600 border-t border-blue-100 leading-relaxed">
    ${faqAnswerHtml(sub(faq.a, brandName))}
  </div>
</div>`
    )
    .join('');
}

export function toggleFaq(i) {
  const answer = document.getElementById(`faq-${i}`);
  if (!answer) return;
  const btn = answer.previousElementSibling;
  const isOpen = answer.classList.contains('open');
  answer.classList.toggle('open', !isOpen);
  if (btn) btn.setAttribute('aria-expanded', String(!isOpen));
}
