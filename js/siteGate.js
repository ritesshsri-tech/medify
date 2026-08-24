// MVP access boundary — separate from persona identity (currentUser/currentStaff).
// A correct PIN only unlocks visibility of the site; it does not log anyone in.
export function isSiteUnlocked() {
  return localStorage.getItem('siteUnlocked') === '1';
}

export function unlockSite() {
  localStorage.setItem('siteUnlocked', '1');
}
