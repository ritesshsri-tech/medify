// Self-mounting floating chatbot — a scripted decision-tree FAQ/help widget.
// No AI/API calls: every answer is pre-written content within this file,
// with optional deep-link buttons into the app (Orders, Cart, Rx Upload, etc.).
// Drop `<script src=".../js/chatbot.js"></script>` on any customer-facing page.

(function () {
  'use strict';

  function pageRoot() {
    // index.html at site root uses 'pages/...' links; pages/*.html use '../pages/...' and '../index.html'.
    const inPagesDir = /\/pages\//.test(window.location.pathname);
    return inPagesDir ? '../' : '';
  }

  function link(path) {
    return pageRoot() + path;
  }

  // --- Decision tree -----------------------------------------------------
  // Each node: { title, options: [{ label, goto }] } for a menu,
  // or { title, body, links: [{label, href}], back } for an answer leaf.
  const ROOT = 'root';

  const TREE = {
    root: {
      title: 'How may I help you?',
      options: [
        { label: 'Track my order', goto: 'orders' },
        { label: 'Prescription (Rx) help', goto: 'rx' },
        { label: 'Payments & pricing', goto: 'payments' },
        { label: 'More options', goto: 'more' },
      ],
    },
    'no-match': {
      title: "I couldn't find an exact match",
      body: "I'm a scripted help bot, so I work best with the topics below. Pick one, or talk to a real person for anything else.",
      options: [
        { label: 'Track my order', goto: 'orders' },
        { label: 'Prescription (Rx) help', goto: 'rx' },
        { label: 'Payments & pricing', goto: 'payments' },
        { label: 'More options', goto: 'more' },
        { label: 'Talk to a human', goto: 'contact' },
      ],
    },
    more: {
      title: 'More options',
      options: [
        { label: 'Returns & cancellations', goto: 'returns' },
        { label: 'Account & login', goto: 'account' },
        { label: 'Medical Tourism', goto: 'medtourism' },
        { label: 'Talk to a human', goto: 'contact' },
        { label: '⬅ Back', goto: ROOT },
      ],
    },

    orders: {
      title: 'Orders',
      options: [
        { label: 'Where is my order?', goto: 'orders-track' },
        { label: 'Cancel an order', goto: 'orders-cancel' },
        { label: 'Order stuck / not moving', goto: 'orders-stuck' },
        { label: '⬅ Back to main menu', goto: ROOT },
      ],
    },
    'orders-track': {
      title: 'Where is my order?',
      body: 'You can track every order — including live delivery stage (Placed, Packed, Shipped, Out for Delivery, Delivered) — under My Orders in your account.',
      links: [{ label: 'Go to My Orders', href: link('pages/account.html#orders') }],
      back: 'orders',
      keywords: ['track', 'order status', 'where is my order', 'delivery status', 'shipment', 'shipped', 'tracking'],
    },
    'orders-cancel': {
      title: 'Cancel an order',
      body: "Cancellations aren't self-service in this app yet. Open the order under My Orders and use \"Talk to a human\" below, or call/WhatsApp us with your Order ID and we'll cancel it for you.",
      links: [{ label: 'Go to My Orders', href: link('pages/account.html#orders') }],
      back: 'orders',
      keywords: ['cancel', 'cancellation', 'cancel order', 'cancel my order'],
    },
    'orders-stuck': {
      title: 'Order stuck / not moving',
      body: "If an order contains a prescription medicine, it stays at \"Placed\" until our pharmacist approves the prescription — this is expected and shows as a banner on the order. Once approved, dispatch continues automatically. If it's been more than 24 hours since approval with no movement, contact support.",
      links: [{ label: 'Go to My Orders', href: link('pages/account.html#orders') }],
      back: 'orders',
      keywords: ['stuck', 'not moving', 'delayed', 'delay', 'order pending', 'not shipped'],
    },

    rx: {
      title: 'Prescription (Rx) Help',
      options: [
        { label: 'How do I upload a prescription?', goto: 'rx-upload' },
        { label: "I don't have a prescription yet", goto: 'rx-none' },
        { label: 'My prescription was rejected', goto: 'rx-rejected' },
        { label: '⬅ Back to main menu', goto: ROOT },
      ],
    },
    'rx-upload': {
      title: 'How do I upload a prescription?',
      body: 'You can upload a prescription in two ways: from the Rx Upload page anytime, or directly on the Cart page when a prescription-required medicine is in your cart — one prescription can cover multiple medicines, and you can attach more than one file.',
      links: [
        { label: 'Go to Rx Upload', href: link('pages/rx-upload.html') },
        { label: 'Go to Cart', href: link('pages/cart.html') },
      ],
      back: 'rx',
      keywords: ['upload prescription', 'upload rx', 'how to upload', 'add prescription', 'submit prescription'],
    },
    'rx-none': {
      title: "I don't have a prescription yet",
      body: 'No problem — on the Cart page, choose "No Rx — Doctor Will Call" for prescription-required items. Our doctor will call to confirm before your order ships, so you can still place the order now.',
      links: [{ label: 'Go to Cart', href: link('pages/cart.html') }],
      back: 'rx',
      keywords: ["don't have", 'no prescription', 'no rx', 'without prescription', 'dont have'],
    },
    'rx-rejected': {
      title: 'My prescription was rejected',
      body: "If a prescription is rejected, you'll see the reason on that order under My Orders. Common reasons: unclear/blurry image, or the prescription doesn't cover the medicine ordered. Upload a fresh prescription from the Cart or Rx Upload page to resolve it.",
      links: [
        { label: 'Go to My Orders', href: link('pages/account.html#orders') },
        { label: 'Go to Rx Upload', href: link('pages/rx-upload.html') },
      ],
      back: 'rx',
      keywords: ['rejected', 'rx rejected', 'prescription rejected', 'declined'],
    },

    payments: {
      title: 'Payments & Pricing',
      options: [
        { label: 'What payment methods are supported?', goto: 'payments-methods' },
        { label: 'Is Cash on Delivery available?', goto: 'payments-cod' },
        { label: 'Why is the price different from MRP?', goto: 'payments-price' },
        { label: '⬅ Back to main menu', goto: ROOT },
      ],
    },
    'payments-methods': {
      title: 'Payment methods',
      body: 'At checkout you can pay via UPI, Credit/Debit Card, Net Banking, or Cash on Delivery. This is a demo checkout, so no real payment is processed.',
      links: [],
      back: 'payments',
      keywords: ['payment method', 'how to pay', 'upi', 'card', 'net banking', 'pay'],
    },
    'payments-cod': {
      title: 'Cash on Delivery',
      body: 'Yes — select "Cash on Delivery" as the payment method at checkout, and pay in cash when your order is delivered to your doorstep.',
      links: [],
      back: 'payments',
      keywords: ['cash on delivery', 'cod', 'pay cash'],
    },
    'payments-price': {
      title: 'Why is the price different from MRP?',
      body: 'The price you pay (selling price) is usually lower than the printed MRP — the discount is shown on every medicine card and at checkout under "Items MRP" vs "Discount".',
      links: [],
      back: 'payments',
      keywords: ['price', 'mrp', 'discount', 'cost', 'expensive', 'cheap'],
    },

    returns: {
      title: 'Returns & Cancellations',
      options: [
        { label: 'Can I return a medicine?', goto: 'returns-policy' },
        { label: 'How do I cancel an order?', goto: 'orders-cancel' },
        { label: '⬅ Back', goto: 'more' },
      ],
    },
    'returns-policy': {
      title: 'Return policy',
      body: 'For safety reasons, medicines generally cannot be returned once dispatched, unless the item received is damaged, expired, or incorrect. Contact support with your Order ID and photos of the issue, and our team will help.',
      links: [],
      back: 'returns',
      keywords: ['return', 'refund', 'exchange', 'damaged', 'wrong item', 'expired'],
    },

    account: {
      title: 'Account & Login',
      options: [
        { label: 'How do I sign in?', goto: 'account-signin' },
        { label: 'Update my profile', goto: 'account-profile' },
        { label: 'Manage saved addresses', goto: 'account-address' },
        { label: '⬅ Back', goto: 'more' },
      ],
    },
    'account-signin': {
      title: 'How do I sign in?',
      body: 'Click "Sign In" at the top right of the homepage and choose your account. If this is your first time, use Sign Up from the same screen.',
      links: [],
      back: 'account',
      keywords: ['sign in', 'login', 'log in', 'signin'],
    },
    'account-profile': {
      title: 'Update my profile',
      body: 'Go to My Profile from the account menu (top right) to update your name, phone number, or email.',
      links: [{ label: 'Go to My Profile', href: link('pages/account.html#profile') }],
      back: 'account',
      keywords: ['profile', 'update profile', 'edit profile', 'change name', 'change email'],
    },
    'account-address': {
      title: 'Manage saved addresses',
      body: 'You can add, edit, or set a default delivery address under My Account → Addresses, or directly during checkout.',
      links: [{ label: 'Go to Addresses', href: link('pages/account.html#addresses') }],
      back: 'account',
      keywords: ['address', 'delivery address', 'saved address', 'change address'],
    },

    medtourism: {
      title: 'Medical Tourism',
      body: 'For international patients seeking treatment in India, fill out the Medical Tourism enquiry form from the homepage banner. Our care team will review it and contact you — you can track the status of your enquiry under My Orders.',
      links: [{ label: 'Go to My Orders', href: link('pages/account.html#orders') }],
      back: 'more',
      keywords: ['medical tourism', 'treatment', 'international patient', 'travel for treatment'],
    },

    contact: {
      title: 'Talk to a human',
      body: 'Our support team is available on call or WhatsApp: \n📞 +91 1800-123-456 \n💬 WhatsApp: +91 99991 56233',
      links: [
        { label: 'Call Us', href: 'tel:+911800123456' },
        { label: 'WhatsApp Us', href: 'https://wa.me/919999156233', external: true },
      ],
      back: 'more',
      keywords: ['human', 'agent', 'support', 'call', 'whatsapp', 'contact', 'talk to someone', 'representative'],
    },
  };

  // --- State -----------------------------------------------------------------
  let currentNodeId = ROOT;

  function isOpen() {
    return localStorage.getItem('chatbotOpen') === '1';
  }
  function setOpen(open) {
    localStorage.setItem('chatbotOpen', open ? '1' : '0');
  }
  function intakeDone() {
    return localStorage.getItem('chatbotIntakeDone') === '1';
  }
  function setIntakeDone() {
    localStorage.setItem('chatbotIntakeDone', '1');
  }
  function getVisitorName() {
    return localStorage.getItem('chatbotVisitorName') || '';
  }
  function getVisitorPhone() {
    return localStorage.getItem('chatbotVisitorPhone') || '';
  }

  // --- Free-text matching ------------------------------------------------
  // No AI/API — just keyword overlap scoring against each leaf node's
  // `keywords` list (and its title as a fallback signal).
  function matchQuery(text) {
    const q = text.toLowerCase().trim();
    if (!q) return null;

    let best = null;
    let bestScore = 0;

    Object.keys(TREE).forEach((nodeId) => {
      const node = TREE[nodeId];
      if (!node.keywords) return;
      let score = 0;
      node.keywords.forEach((kw) => {
        if (q.includes(kw)) score += kw.length;
      });
      if (node.title && q.includes(node.title.toLowerCase())) score += node.title.length;
      if (score > bestScore) {
        bestScore = score;
        best = nodeId;
      }
    });

    return bestScore > 0 ? best : null;
  }

  // --- Intake (name -> phone -> menu) -----------------------------------------
  function renderIntakeStep(step) {
    const body = document.getElementById('chatbotBody');
    if (!body) return;

    if (step === 'name') {
      body.innerHTML = `
        <p class="chatbot-node-title">Hi! I'm the MediFy Help Bot 👋</p>
        <p class="chatbot-node-body">Before we start, what's your name?</p>
        <input type="text" id="chatbotIntakeInput" class="chatbot-text-input" placeholder="Your name" autocomplete="name" />
        <div class="chatbot-intake-row">
          <button type="button" id="chatbotIntakeSend" class="chatbot-send-btn">Send</button>
          <button type="button" id="chatbotIntakeSkip" class="chatbot-skip-btn">Skip</button>
        </div>
      `;
      const input = document.getElementById('chatbotIntakeInput');
      const submit = () => {
        const val = input.value.trim();
        if (val) localStorage.setItem('chatbotVisitorName', val);
        renderIntakeStep('phone');
      };
      document.getElementById('chatbotIntakeSend').addEventListener('click', submit);
      document.getElementById('chatbotIntakeSkip').addEventListener('click', () => renderIntakeStep('phone'));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submit();
      });
      input.focus();
      return;
    }

    if (step === 'phone') {
      const name = getVisitorName();
      body.innerHTML = `
        <p class="chatbot-node-title">${name ? `Thanks, ${name}!` : 'Got it!'}</p>
        <p class="chatbot-node-body">And your phone number, in case we need to follow up?</p>
        <input type="tel" id="chatbotIntakeInput" class="chatbot-text-input" placeholder="Your phone number" autocomplete="tel" />
        <div class="chatbot-intake-row">
          <button type="button" id="chatbotIntakeSend" class="chatbot-send-btn">Send</button>
          <button type="button" id="chatbotIntakeSkip" class="chatbot-skip-btn">Skip</button>
        </div>
      `;
      const input = document.getElementById('chatbotIntakeInput');
      const finish = () => {
        const val = input.value.trim();
        if (val) localStorage.setItem('chatbotVisitorPhone', val);
        setIntakeDone();
        setQueryBarVisible(true);
        renderNode(ROOT);
      };
      document.getElementById('chatbotIntakeSend').addEventListener('click', finish);
      document.getElementById('chatbotIntakeSkip').addEventListener('click', () => {
        setIntakeDone();
        setQueryBarVisible(true);
        renderNode(ROOT);
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') finish();
      });
      input.focus();
      return;
    }
  }

  // --- Rendering ---------------------------------------------------------------
  function renderNode(nodeId) {
    const node = TREE[nodeId];
    if (!node) return;
    currentNodeId = nodeId;

    const body = document.getElementById('chatbotBody');
    if (!body) return;

    const name = getVisitorName();
    let html = '';
    if (nodeId === ROOT && name) {
      html += `<p class="chatbot-node-title">${node.title.replace('How may I help you?', `Hi ${name}, how may I help you?`)}</p>`;
    } else {
      html += `<p class="chatbot-node-title">${node.title}</p>`;
    }

    if (node.body) {
      html += `<p class="chatbot-node-body">${node.body.replace(/\n/g, '<br>')}</p>`;
    }

    if (node.links && node.links.length) {
      html += `<div class="chatbot-link-row">`;
      html += node.links
        .map(
          (l) =>
            `<a href="${l.href}" ${l.external ? 'target="_blank" rel="noopener noreferrer"' : ''} class="chatbot-link-btn">${l.label}</a>`
        )
        .join('');
      html += `</div>`;
    }

    if (node.options && node.options.length) {
      html += `<div class="chatbot-option-list">`;
      html += node.options.map((o) => `<button type="button" class="chatbot-option-btn" data-goto="${o.goto}">${o.label}</button>`).join('');
      html += `</div>`;
    } else if (node.back) {
      html += `<div class="chatbot-option-list"><button type="button" class="chatbot-option-btn" data-goto="${node.back}">⬅ Back</button></div>`;
    }

    body.innerHTML = html;

    body.querySelectorAll('[data-goto]').forEach((btn) => {
      btn.addEventListener('click', () => {
        renderNode(btn.dataset.goto);
        body.scrollTop = 0;
      });
    });
  }

  function setQueryBarVisible(visible) {
    const bar = document.getElementById('chatbotQueryBar');
    if (bar) bar.classList.toggle('hidden', !visible);
  }

  function openChat() {
    if (!intakeDone()) {
      setQueryBarVisible(false);
      renderIntakeStep('name');
    } else {
      setQueryBarVisible(true);
      renderNode(ROOT);
    }
  }

  function toggleWindow(forceOpen) {
    const win = document.getElementById('chatbotWindow');
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : win.classList.contains('hidden');
    win.classList.toggle('hidden', !shouldOpen);
    setOpen(shouldOpen);
    hideLabel();
    if (shouldOpen) {
      openChat();
    }
  }

  // --- Animated "AI Support" label -------------------------------------------
  function hideLabel() {
    const label = document.getElementById('chatbotLabel');
    if (label) label.classList.add('chatbot-label-hidden');
  }

  function mount() {
    const style = document.createElement('style');
    style.textContent = `
      .chatbot-fab-wrap {
        position: fixed;
        bottom: 28px;
        right: 96px;
        z-index: 350;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .chatbot-label {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        padding: 8px 14px;
        border-radius: 999px;
        white-space: nowrap;
        box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4);
        animation: chatbot-bounce 2.2s ease-in-out infinite;
      }
      .chatbot-label.chatbot-label-hidden {
        display: none;
      }
      @keyframes chatbot-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
      .chatbot-fab {
        position: relative;
        flex-shrink: 0;
        width: 54px;
        height: 54px;
        border-radius: 50%;
        background: #2563eb;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 16px rgba(37, 99, 235, 0.45);
        transition: transform 0.15s;
        animation: chatbot-pulse-ring 2.2s ease-in-out infinite;
      }
      .chatbot-fab:hover { transform: scale(1.08); }
      @keyframes chatbot-pulse-ring {
        0% { box-shadow: 0 4px 16px rgba(37, 99, 235, 0.45), 0 0 0 0 rgba(37, 99, 235, 0.45); }
        70% { box-shadow: 0 4px 16px rgba(37, 99, 235, 0.45), 0 0 0 12px rgba(37, 99, 235, 0); }
        100% { box-shadow: 0 4px 16px rgba(37, 99, 235, 0.45), 0 0 0 0 rgba(37, 99, 235, 0); }
      }
      .chatbot-window {
        position: fixed;
        bottom: 92px;
        right: 28px;
        z-index: 350;
        width: 340px;
        max-width: calc(100vw - 32px);
        max-height: min(520px, calc(100vh - 140px));
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.22);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: 'Inter', system-ui, sans-serif;
      }
      .chatbot-window.hidden { display: none; }
      .chatbot-header {
        background: #2563eb;
        color: #fff;
        padding: 14px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      }
      .chatbot-header-title { font-size: 14px; font-weight: 700; }
      .chatbot-header-sub { font-size: 11px; opacity: 0.85; margin-top: 1px; }
      .chatbot-close-btn {
        background: none;
        border: none;
        color: #fff;
        cursor: pointer;
        padding: 4px;
        opacity: 0.9;
      }
      .chatbot-close-btn:hover { opacity: 1; }
      .chatbot-body {
        padding: 16px;
        overflow-y: auto;
        flex: 1;
        background: #f5f8fe;
      }
      .chatbot-node-title {
        font-size: 13px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 8px;
      }
      .chatbot-node-body {
        font-size: 12.5px;
        line-height: 1.5;
        color: #334155;
        margin: 0 0 12px;
      }
      .chatbot-option-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .chatbot-option-btn {
        text-align: left;
        padding: 9px 12px;
        border: 1.5px solid #bfdbfe;
        border-radius: 10px;
        background: #fff;
        color: #1e3a8a;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
      }
      .chatbot-option-btn:hover { background: #eff6ff; border-color: #93c5fd; }
      .chatbot-link-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 12px;
      }
      .chatbot-link-btn {
        display: inline-flex;
        align-items: center;
        padding: 7px 12px;
        background: #2563eb;
        color: #fff;
        font-size: 12px;
        font-weight: 600;
        border-radius: 999px;
        text-decoration: none;
        transition: background 0.15s;
      }
      .chatbot-link-btn:hover { background: #1d4ed8; }
      .chatbot-text-input {
        width: 100%;
        padding: 9px 12px;
        border: 1.5px solid #bfdbfe;
        border-radius: 10px;
        font-size: 12.5px;
        font-family: inherit;
        outline: none;
        margin-bottom: 8px;
        box-sizing: border-box;
      }
      .chatbot-text-input:focus { border-color: #2563eb; }
      .chatbot-intake-row {
        display: flex;
        gap: 8px;
      }
      .chatbot-send-btn {
        flex: 1;
        padding: 9px 12px;
        background: #2563eb;
        color: #fff;
        border: none;
        border-radius: 10px;
        font-size: 12.5px;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.15s;
      }
      .chatbot-send-btn:hover { background: #1d4ed8; }
      .chatbot-skip-btn {
        padding: 9px 12px;
        background: #fff;
        color: #64748b;
        border: 1.5px solid #e2e8f0;
        border-radius: 10px;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
      }
      .chatbot-skip-btn:hover { background: #f1f5f9; }
      .chatbot-query-bar {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 10px 12px;
        border-top: 1px solid #e2e8f0;
        background: #fff;
        flex-shrink: 0;
      }
      .chatbot-query-bar.hidden { display: none; }
      .chatbot-query-input {
        margin-bottom: 0;
      }
      .chatbot-query-send-btn {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: #dc2626;
        color: #fff;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s;
      }
      .chatbot-query-send-btn:hover { background: #b91c1c; }
      @media (max-width: 480px) {
        .chatbot-fab-wrap { right: 16px; bottom: 20px; }
        .chatbot-window { right: 16px; bottom: 84px; }
        .chatbot-label { display: none; }
      }
    `;
    document.head.appendChild(style);

    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="chatbot-fab-wrap">
        <span id="chatbotLabel" class="chatbot-label">🤖 AI Support</span>
        <button type="button" id="chatbotFab" class="chatbot-fab" aria-label="Open help chat" title="AI Support / Help">
          <svg width="26" height="26" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        </button>
      </div>
      <div id="chatbotWindow" class="chatbot-window hidden" role="dialog" aria-modal="false" aria-label="Help chat">
        <div class="chatbot-header">
          <div>
            <div class="chatbot-header-title">MediFy AI Support</div>
            <div class="chatbot-header-sub">Quick answers, no waiting</div>
          </div>
          <button type="button" id="chatbotCloseBtn" class="chatbot-close-btn" aria-label="Close chat">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div id="chatbotBody" class="chatbot-body"></div>
        <div id="chatbotQueryBar" class="chatbot-query-bar hidden">
          <input type="text" id="chatbotQueryInput" class="chatbot-text-input chatbot-query-input" placeholder="Type your question…" aria-label="Type your question" />
          <button type="button" id="chatbotQuerySend" class="chatbot-query-send-btn" aria-label="Send question">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);

    document.getElementById('chatbotFab').addEventListener('click', () => toggleWindow());
    document.getElementById('chatbotCloseBtn').addEventListener('click', () => toggleWindow(false));

    const queryInput = document.getElementById('chatbotQueryInput');
    const querySend = document.getElementById('chatbotQuerySend');
    const submitQuery = () => {
      const text = queryInput.value.trim();
      if (!text) return;
      const matched = matchQuery(text);
      queryInput.value = '';
      renderNode(matched || 'no-match');
      document.getElementById('chatbotBody').scrollTop = 0;
    };
    querySend.addEventListener('click', submitQuery);
    queryInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitQuery();
    });

    if (isOpen()) {
      toggleWindow(true);
    } else {
      // Auto-hide the animated label after a while so it doesn't nag forever.
      setTimeout(hideLabel, 15000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
