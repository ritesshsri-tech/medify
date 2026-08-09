// Category page filter bar — ported from Legacy pages/category.html (search input,
// category/indication/manufacturer dropdowns, sort buttons). applyFilters() is
// pure: it reads current filter state + a medicines array and returns a new
// sorted/filtered array rather than touching the DOM directly.

let currentSort = 'alpha';

export function getSort() {
  return currentSort;
}

export function setSort(sort) {
  currentSort = sort;
}

export function populateFilterOptions(medicines, { categorySelect, indicationSelect, manufacturerSelect }) {
  const cats = [...new Set(medicines.map((m) => m.diseaseCategory).filter(Boolean))].sort();
  cats.forEach((c) => categorySelect.appendChild(new Option(c, c)));

  const indications = [...new Set(medicines.flatMap((m) => m.treatmentFor || []).filter(Boolean))].sort();
  indications.forEach((ind) => indicationSelect.appendChild(new Option(ind, ind)));

  const mfrs = [...new Set(medicines.map((m) => m.manufacturer).filter(Boolean))].sort();
  mfrs.forEach((mfr) => manufacturerSelect.appendChild(new Option(mfr, mfr)));
}

export function applyFilters(medicines, { search = '', category = '', indication = '', manufacturer = '', sort = currentSort } = {}) {
  const q = search.toLowerCase().trim();

  const filtered = medicines.filter((m) => {
    if (q) {
      const hay = (
        m.brandName +
        ' ' +
        m.saltName +
        ' ' +
        m.diseaseCategory +
        ' ' +
        m.manufacturer +
        ' ' +
        (m.treatmentFor || []).join(' ')
      ).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (category && m.diseaseCategory !== category) return false;
    if (indication && !(m.treatmentFor || []).includes(indication)) return false;
    if (manufacturer && m.manufacturer !== manufacturer) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (sort === 'price-asc') return a.sellingPricePaise - b.sellingPricePaise;
    if (sort === 'price-desc') return b.sellingPricePaise - a.sellingPricePaise;
    if (sort === 'indication') return (a.treatmentFor[0] || '').localeCompare(b.treatmentFor[0] || '');
    if (sort === 'manufacturer') return (a.manufacturer || '').localeCompare(b.manufacturer || '');
    return a.brandName.localeCompare(b.brandName);
  });

  return filtered;
}

export function clearFilters({ searchInput, categorySelect, indicationSelect, manufacturerSelect }) {
  searchInput.value = '';
  categorySelect.value = '';
  indicationSelect.value = '';
  manufacturerSelect.value = '';
  setSort('alpha');
}
