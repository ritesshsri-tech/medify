export function paise(n) {
  return '₹' + (n / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function discount(mrpPaise, sellingPricePaise) {
  if (!mrpPaise || mrpPaise <= sellingPricePaise) return 0;
  return Math.round(((mrpPaise - sellingPricePaise) / mrpPaise) * 100);
}

export function sub(text, brandName) {
  return text.replace(/\[BRAND_NAME\]/g, brandName);
}

export function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
}
