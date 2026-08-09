// Office contact card — ported from sideContactHtml() in
// Legacy pages/medicine-detail.html. Used for head office, branch offices, and
// vendor partner listings in the sidebar.

export function sideContactHtml(o) {
  return `<div>
  <p class="text-xs font-semibold text-slate-700 leading-tight">${o.company}</p>
  ${o.contactPerson ? `<p class="text-[10px] text-slate-500 mt-0.5">${o.contactPerson}</p>` : ''}
  <p class="text-[10px] text-slate-500 mt-0.5 leading-snug">${o.address}</p>
  <div class="flex flex-wrap gap-x-2 mt-1">
    ${o.mobile ? `<a href="tel:${o.mobile}" class="text-[10px] text-blue-600 hover:underline">📞 Call</a>` : ''}
    ${o.whatsapp ? `<a href="https://wa.me/${o.whatsapp.replace(/[^0-9]/g, '')}" target="_blank" class="text-[10px] text-teal-600 hover:underline">💬 WhatsApp</a>` : ''}
  </div>
</div>`;
}

export function renderContactList(offices) {
  return offices.map(sideContactHtml).join('<hr class="border-blue-50 my-2">');
}
