(function () {
  'use strict';

  var STORAGE_KEY = 'akk_cookie_consent';
  var GA_ID = 'G-E782S147EQ';

  /* ── Consent state ─────────────────────────────────────── */

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; }
  }

  function saveConsent(analytics) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: analytics, ts: Date.now() }));
  }

  /* ── Google Analytics loader ───────────────────────────── */

  function loadGA() {
    if (window._gaLoaded) return;
    window._gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  /* ── Render ────────────────────────────────────────────── */

  function createBanner() {
    var el = document.createElement('div');
    el.id = 'cc-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'false');
    el.setAttribute('aria-label', 'Cookie-Einstellungen');
    el.innerHTML =
      '<div class="cc-inner">' +
        '<div class="cc-text">' +
          '<p class="cc-title">Diese Website verwendet Cookies</p>' +
          '<p class="cc-body">Wir setzen Analyse-Cookies (Google Analytics) ein, um zu verstehen, wie Besucher unsere Website nutzen. Sie k&ouml;nnen der Nutzung zustimmen oder sie ablehnen &ndash; Ihre Auswahl wird gespeichert.</p>' +
        '</div>' +
        '<div class="cc-actions">' +
          '<button class="cc-btn cc-btn--ghost" id="cc-settings-btn">Einstellungen</button>' +
          '<button class="cc-btn cc-btn--outline" id="cc-decline-btn">Ablehnen</button>' +
          '<button class="cc-btn cc-btn--accent" id="cc-accept-btn">Alle akzeptieren</button>' +
        '</div>' +
      '</div>';
    return el;
  }

  function createModal() {
    var el = document.createElement('div');
    el.id = 'cc-modal-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Cookie-Einstellungen verwalten');
    el.innerHTML =
      '<div class="cc-modal">' +
        '<div class="cc-modal__header">' +
          '<p class="cc-modal__title">Cookie-Einstellungen</p>' +
          '<button class="cc-modal__close" id="cc-modal-close" aria-label="Schlie&szlig;en">' +
            '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="cc-modal__body">' +
          '<div class="cc-category">' +
            '<div class="cc-category__info">' +
              '<p class="cc-category__name">Notwendig</p>' +
              '<p class="cc-category__desc">Erm&ouml;glichen grundlegende Funktionen wie Seitennavigation. Ohne diese Cookies kann die Website nicht richtig funktionieren.</p>' +
            '</div>' +
            '<div class="cc-toggle cc-toggle--locked" aria-label="Immer aktiv"><span class="cc-toggle__label">Immer aktiv</span></div>' +
          '</div>' +
          '<div class="cc-category">' +
            '<div class="cc-category__info">' +
              '<p class="cc-category__name">Analyse (Google Analytics)</p>' +
              '<p class="cc-category__desc">Helfen uns zu verstehen, wie Besucher mit der Website interagieren. Alle Daten werden anonymisiert erfasst.</p>' +
            '</div>' +
            '<label class="cc-toggle" aria-label="Analyse-Cookies">' +
              '<input type="checkbox" id="cc-analytics-toggle" class="cc-toggle__input">' +
              '<span class="cc-toggle__track"><span class="cc-toggle__thumb"></span></span>' +
            '</label>' +
          '</div>' +
        '</div>' +
        '<div class="cc-modal__footer">' +
          '<button class="cc-btn cc-btn--outline" id="cc-save-btn">Auswahl speichern</button>' +
          '<button class="cc-btn cc-btn--accent" id="cc-accept-all-btn">Alle akzeptieren</button>' +
        '</div>' +
      '</div>';
    return el;
  }

  /* ── Logic ─────────────────────────────────────────────── */

  function hideBanner(banner) {
    banner.classList.add('cc-banner--hidden');
    setTimeout(function () { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 400);
  }

  function showModal(banner) {
    var overlay = createModal();
    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('cc-modal-overlay--visible'); });

    var analyticsToggle = overlay.querySelector('#cc-analytics-toggle');
    var consent = getConsent();
    if (consent && consent.analytics) analyticsToggle.checked = true;

    overlay.querySelector('#cc-modal-close').addEventListener('click', function () { closeModal(overlay); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(overlay); });

    overlay.querySelector('#cc-save-btn').addEventListener('click', function () {
      var allow = analyticsToggle.checked;
      saveConsent(allow);
      if (allow) loadGA();
      closeModal(overlay);
      hideBanner(banner);
    });

    overlay.querySelector('#cc-accept-all-btn').addEventListener('click', function () {
      saveConsent(true);
      loadGA();
      closeModal(overlay);
      hideBanner(banner);
    });
  }

  function closeModal(overlay) {
    overlay.classList.remove('cc-modal-overlay--visible');
    setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
  }

  /* ── Init ──────────────────────────────────────────────── */

  function init() {
    var consent = getConsent();

    if (consent !== null) {
      if (consent.analytics) loadGA();
      return;
    }

    var banner = createBanner();
    document.body.appendChild(banner);
    requestAnimationFrame(function () { banner.classList.add('cc-banner--visible'); });

    banner.querySelector('#cc-accept-btn').addEventListener('click', function () {
      saveConsent(true);
      loadGA();
      hideBanner(banner);
    });

    banner.querySelector('#cc-decline-btn').addEventListener('click', function () {
      saveConsent(false);
      hideBanner(banner);
    });

    banner.querySelector('#cc-settings-btn').addEventListener('click', function () {
      showModal(banner);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
