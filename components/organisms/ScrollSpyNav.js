// Scroll-spy navigation — ported from Legacy pages/medicine-detail.html
// (setupScrollSpy). Highlights the active section link in both the desktop
// sidebar nav and the mobile bottom tab bar as the user scrolls.

export function setupScrollSpy(sectionIds, desktopNav, mobileNav) {
  const links = desktopNav ? desktopNav.querySelectorAll('.quick-link') : [];
  const mobTabs = mobileNav ? mobileNav.querySelectorAll('.mob-section-tab') : [];

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        links.forEach((l) => l.classList.remove('active'));
        mobTabs.forEach((t) => t.classList.remove('active'));

        const active = desktopNav && desktopNav.querySelector(`a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');

        const mobActive = mobileNav && mobileNav.querySelector(`a[href="#${entry.target.id}"]`);
        if (mobActive) {
          mobActive.classList.add('active');
          mobActive.scrollIntoView({ inline: 'center', behavior: 'smooth' });
        }
      });
    },
    { rootMargin: '-20% 0px -70% 0px' }
  );

  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  return observer;
}
