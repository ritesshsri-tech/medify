(function () {
  'use strict';

  function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  }

  function getUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  }

  function cartCount() {
    return getCart().reduce(function (sum, item) {
      return sum + (item.qty || 1);
    }, 0);
  }

  function render() {
    const user = getUser();
    const count = cartCount();

    const html = `
<nav style="position:fixed;top:0;left:0;right:0;z-index:200;height:76px;background:#fff;box-shadow:0 2px 8px rgba(37,99,235,0.08);display:flex;align-items:center;padding:0 24px;gap:16px;font-family:'Inter',system-ui,sans-serif;">

  <!-- Logo -->
  <a href="../pages/index.html" style="display:flex;align-items:center;gap:8px;text-decoration:none;flex-shrink:0;">
    <img src="../assets/medify-logo.svg" alt="MediFy" style="height:52px;" onerror="this.style.display='none'">
  </a>

  <!-- Search -->
  <form id="headerSearchForm" style="flex:1;max-width:560px;margin:0 auto;position:relative;">
    <input
      id="headerSearchInput"
      type="text"
      placeholder="Search medicines, salts, brands…"
      style="width:100%;padding:10px 44px 10px 16px;border:1.5px solid #BFDBFE;border-radius:999px;font-size:14px;color:#0F172A;background:#F5F8FE;outline:none;transition:border-color 0.2s;"
      onfocus="this.style.borderColor='#2563EB'"
      onblur="this.style.borderColor='#BFDBFE'"
    />
    <button type="submit" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:0;display:flex;align-items:center;">
      <svg width="18" height="18" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    </button>
  </form>

  <!-- Right actions -->
  <div style="display:flex;align-items:center;gap:12px;flex-shrink:0;">

    <!-- Home CTA -->
    <a href="../pages/index.html" style="padding:8px 18px;border:1.5px solid #2563EB;border-radius:999px;background:#2563EB;color:#fff;font-size:13px;font-weight:600;text-decoration:none;transition:background 0.2s;" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563EB'">Home</a>

    <!-- Cart -->
    <a href="../pages/cart.html" style="position:relative;display:flex;align-items:center;text-decoration:none;">
      <svg width="26" height="26" fill="none" stroke="#2563EB" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      <span id="headerCartBadge" style="position:absolute;top:-6px;right:-8px;background:#DC2626;color:#fff;font-size:10px;font-weight:700;border-radius:999px;min-width:18px;height:18px;display:${count > 0 ? 'flex' : 'none'};align-items:center;justify-content:center;padding:0 4px;">${count}</span>
    </a>

    <!-- Auth -->
    ${
      user
        ? `<div style="position:relative;" id="headerUserMenu">
          <button onclick="document.getElementById('headerUserDropdown').style.display=document.getElementById('headerUserDropdown').style.display==='block'?'none':'block'" style="display:flex;align-items:center;gap:6px;padding:7px 14px;border:1.5px solid #BFDBFE;border-radius:999px;background:#fff;cursor:pointer;font-size:13px;font-weight:600;color:#1E3A8A;">
            <svg width="16" height="16" fill="#2563EB" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            ${user.name || 'Account'}
            <svg width="12" height="12" fill="none" stroke="#2563EB" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div id="headerUserDropdown" style="display:none;position:absolute;right:0;top:calc(100% + 8px);background:#fff;border:1px solid #BFDBFE;border-radius:12px;box-shadow:0 8px 24px rgba(30,58,138,0.12);min-width:160px;overflow:hidden;z-index:300;">
            <a href="../pages/account.html" style="display:block;padding:10px 16px;font-size:13px;color:#0F172A;text-decoration:none;hover:background:#F5F8FE;">My Orders</a>
            ${user.role === 'admin' || user.role === 'pharmacist' ? '<a href="../pages/admin.html" style="display:block;padding:10px 16px;font-size:13px;color:#0F172A;text-decoration:none;">Admin Panel</a>' : ''}
            <hr style="margin:4px 0;border:none;border-top:1px solid #E2E9F5;">
            <button onclick="window._headerSignOut && window._headerSignOut()" style="width:100%;text-align:left;padding:10px 16px;font-size:13px;color:#DC2626;background:none;border:none;cursor:pointer;">Sign Out</button>
          </div>
        </div>`
        : `<button onclick="window._headerSignIn && window._headerSignIn()" style="padding:8px 18px;border:1.5px solid #2563EB;border-radius:999px;background:#fff;color:#2563EB;font-size:13px;font-weight:600;cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='#EAF1FE'" onmouseout="this.style.background='#fff'">Sign In</button>`
    }
  </div>
</nav>

`;

    const mount = document.getElementById('appHeader');
    if (mount) mount.innerHTML = html;

    document.body.style.paddingTop = '76px';

    const form = document.getElementById('headerSearchForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const q = document.getElementById('headerSearchInput').value.trim();
        if (q) window.location.href = '../pages/category.html?search=' + encodeURIComponent(q);
      });
    }

    // Close dropdown on outside click
    document.addEventListener('click', function (e) {
      const menu = document.getElementById('headerUserDropdown');
      const btn = document.getElementById('headerUserMenu');
      if (menu && btn && !btn.contains(e.target)) menu.style.display = 'none';
    });
  }

  function refreshCart() {
    const count = cartCount();
    const badge = document.getElementById('headerCartBadge');
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  function refreshAuth() {
    render();
  }

  function signOut() {
    localStorage.removeItem('currentUser');
    window.location.replace('../pages/login.html');
  }

  window._headerSignOut = signOut;

  window._headerSignIn = function () {
    window.location.href = '../pages/login.html';
  };

  window.renderAppHeader = render;
  window.refreshAppHeaderCart = refreshCart;
  window.refreshAppHeaderAuth = refreshAuth;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
