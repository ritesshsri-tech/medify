// Reusable image carousel: covers card carousels, the medicine popup carousel,
// and the lightbox gallery from Legacy pages/category.html — same goTo/prev/next/
// dots logic, previously copy-pasted 4 times.
//
// Usage: new Carousel(images, { imgEl, dotsEl, dotClass, activeDotClass }).goTo(0)

export class Carousel {
  constructor(images, el) {
    this.images = images;
    this.imgEl = el.imgEl;
    this.dotsEl = el.dotsEl || null;
    this.dotClass = el.dotClass || 'carousel-dot';
    this.activeDotClass = el.activeDotClass || 'active';
    this.onChange = el.onChange || null;
    this.index = 0;
  }

  goTo(index) {
    if (!this.images.length) return;
    this.index = ((index % this.images.length) + this.images.length) % this.images.length;
    this._render();
  }

  prev() {
    this.goTo(this.index - 1);
  }

  next() {
    this.goTo(this.index + 1);
  }

  renderDots() {
    if (!this.dotsEl) return;
    this.dotsEl.innerHTML = this.images
      .map((_, i) => `<span class="${this.dotClass}${i === this.index ? ' ' + this.activeDotClass : ''}"></span>`)
      .join('');
  }

  _render() {
    if (this.imgEl) this.imgEl.src = this.images[this.index];
    this.renderDots();
    if (this.onChange) this.onChange(this.index);
  }
}
