/**
 * Demo-site watermark.
 *
 * Two layers, both purely decorative and non-interactive:
 *   1. A tiled diagonal overlay across the viewport, so any screenshot of
 *      this site identifies itself as a demo even after cropping.
 *   2. A fixed corner badge stating the notice in plain, legible text.
 *
 * Both are pointer-events:none and sit above every other stacking context
 * (modals are 300, chatbot is 350, header is 200) so they are never
 * covered and never swallow a click.
 */
(function () {
  'use strict';

  var NOTICE = 'Demo Site — NOT FOR COMMERCIAL USE';

  // Bail out if a page somehow loads this twice.
  if (document.getElementById('demoWatermarkLayer')) return;

  // The diagonal stripe is drawn once as an SVG data URI and tiled by
  // background-repeat. Doing it as a background rather than hundreds of
  // DOM nodes keeps it free at scroll/repaint time.
  // Base64 rather than a raw inline SVG: url() escaping of quotes, angle
  // brackets and "#" is fragile and silently yields background-image:none.
  var tile = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MjAiIGhlaWdodD0iNDIwIj48dGV4dCB4PSIyMTAiIHk9IjIxMCIgdHJhbnNmb3JtPSJyb3RhdGUoLTMwIDIxMCAyMTApIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iSW50ZXIsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjYiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IiMwRjE3MkEiIGZpbGwtb3BhY2l0eT0iMC4wNyIgbGV0dGVyLXNwYWNpbmc9IjEuNSI+REVNTyDigJQgTk9UIEZPUiBDT01NRVJDSUFMIFVTRTwvdGV4dD48L3N2Zz4=";

  var css =
    '#demoWatermarkLayer{' +
    'position:fixed;inset:0;z-index:2147483646;pointer-events:none;' +
    'background-image:url("' + tile + '");' +
    'background-repeat:repeat;background-position:center;' +
    '}' +
    '#demoWatermarkBadge{' +
    'position:fixed;left:16px;bottom:16px;z-index:2147483647;pointer-events:none;' +
    'display:flex;align-items:center;gap:7px;' +
    'padding:7px 13px;border-radius:999px;' +
    'background:rgba(15,23,42,0.88);color:#fff;' +
    "font-family:'Inter',system-ui,sans-serif;font-size:11.5px;font-weight:700;" +
    'letter-spacing:0.4px;text-transform:uppercase;white-space:nowrap;' +
    'box-shadow:0 4px 14px rgba(15,23,42,0.28);' +
    'border:1px solid rgba(255,255,255,0.18);' +
    '}' +
    '#demoWatermarkBadge .dwm-dot{' +
    'width:7px;height:7px;border-radius:50%;background:#F59E0B;flex-shrink:0;' +
    'animation:dwmPulse 2s ease-in-out infinite;' +
    '}' +
    '@keyframes dwmPulse{0%,100%{opacity:1}50%{opacity:0.35}}' +
    // Small screens: keep the badge readable but out of the way of the FAB.
    '@media (max-width:640px){' +
    '#demoWatermarkBadge{left:10px;bottom:10px;font-size:10px;padding:6px 10px}' +
    '}' +
    // The notice must survive printing and PDF export.
    '@media print{' +
    '#demoWatermarkLayer{position:fixed;display:block!important}' +
    '#demoWatermarkBadge{position:fixed;display:flex!important}' +
    '}' +
    // Respect users who ask for reduced motion.
    '@media (prefers-reduced-motion:reduce){' +
    '#demoWatermarkBadge .dwm-dot{animation:none}' +
    '}';

  function mount() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var layer = document.createElement('div');
    layer.id = 'demoWatermarkLayer';
    layer.setAttribute('aria-hidden', 'true');

    var badge = document.createElement('div');
    badge.id = 'demoWatermarkBadge';
    badge.setAttribute('role', 'note');
    badge.innerHTML = '<span class="dwm-dot"></span><span>' + NOTICE + '</span>';

    document.body.appendChild(layer);
    document.body.appendChild(badge);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
