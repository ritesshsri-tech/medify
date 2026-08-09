// Infinite scroll for the medicine grid — ported from Legacy pages/category.html
// (loadNextBatch + setupIntersectionObserver). Sentinel/IntersectionObserver
// behavior is identical across breakpoints; only the parent grid's CSS
// (grid-cols-1/2/3) changes the visual layout.

const PAGE_SIZE = 24;

export function setup(sentinel, onLoad) {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) onLoad();
    },
    { rootMargin: '200px' }
  );
  observer.observe(sentinel);
  return observer;
}

export function loadNextBatch(state, { onBatch, onDone }) {
  if (state.isLoading || state.visibleCount >= state.filteredList.length) return;
  state.isLoading = true;

  setTimeout(() => {
    const batch = state.filteredList.slice(state.visibleCount, state.visibleCount + PAGE_SIZE);
    onBatch(batch);
    state.visibleCount += batch.length;
    state.isLoading = false;

    if (state.visibleCount >= state.filteredList.length) onDone();
  }, 120);
}

export { PAGE_SIZE };
