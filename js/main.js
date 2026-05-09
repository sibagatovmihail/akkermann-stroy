/* ========================================
   AkkermanStroy — Main JavaScript
   ======================================== */

(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var spacer = document.getElementById('header-spacer');
  var hamburger = document.getElementById('hamburger-btn');
  var nav = document.getElementById('main-nav');
  var contactForm = document.getElementById('contact-form');
  var navLinks = document.querySelectorAll('.navbar__link');
  var iso = null;

  /* --- Header height sync --- */
  function syncHeaderHeight() {
    if (!header || !spacer) return;
    var h = header.offsetHeight;
    spacer.style.height = h + 'px';
    document.documentElement.style.setProperty('--header-height', h + 'px');
  }

  /* --- Scroll class on header --- */
  function handleScroll() {
    if (!header) return;
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  /* --- Hamburger toggle --- */
  function toggleMenu() {
    if (!hamburger || !nav) return;
    var isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!isOpen));
    nav.classList.toggle('open');
  }

  /* --- Close mobile menu --- */
  function closeMenu() {
    if (!hamburger || !nav) return;
    hamburger.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
  }

  /* --- Smooth scroll for nav links --- */
  function handleNavClick(e) {
    var href = this.getAttribute('href');
    if (!href || href.charAt(0) !== '#') return;
    var target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    closeMenu();
    target.scrollIntoView({ behavior: 'smooth' });
  }

  /* --- Outside click closes mobile menu --- */
  function handleOutsideClick(e) {
    if (!header || !nav) return;
    if (!header.contains(e.target) && nav.classList.contains('open')) {
      closeMenu();
    }
  }

  /* --- Equal-height service cards (mobile only) --- */
  var serviceCards = document.querySelectorAll('.service-card');

  function equalizeServiceCards() {
    if (!serviceCards.length) return;

    // Reset so natural heights can be measured
    serviceCards.forEach(function (card) {
      card.style.minHeight = '';
    });

    if (window.innerWidth > 600 || window.innerWidth <= 400) return;

    var max = 0;
    serviceCards.forEach(function (card) {
      max = Math.max(max, card.offsetHeight);
    });

    serviceCards.forEach(function (card) {
      card.style.minHeight = max + 'px';
    });
  }

  /* --- Resize handler --- */
  /* iOS Safari fires resize on scroll as the address bar shows/hides —
     viewport height changes but width stays the same. Guarding on width
     prevents the hero-offset from updating mid-scroll and shifting the hero. */
  var lastWidth = window.innerWidth;
  function handleResize() {
    var newWidth = window.innerWidth;
    if (newWidth !== lastWidth) {
      lastWidth = newWidth;
      syncHeaderHeight();
      document.documentElement.style.setProperty('--initial-vh', window.innerHeight + 'px');
      document.documentElement.style.setProperty('--hero-offset', header.offsetHeight + 'px');
      equalizeServiceCards();
      if (iso) iso.layout();
      if (newWidth > 768) {
        closeMenu();
      }
    }
  }

  /* --- Form handling — Web3Forms AJAX submit --- */
  function resetServiceSelect() {
    var wrapper = document.getElementById('service-select');
    if (!wrapper) return;
    var valueEl = wrapper.querySelector('.form-select__value');
    var hidden  = wrapper.querySelector('input[type="hidden"]');
    var options = wrapper.querySelectorAll('.form-select__option');
    if (valueEl) {
      valueEl.textContent = 'Bitte wählen...';
      valueEl.classList.add('form-select__value--placeholder');
    }
    if (hidden) hidden.value = '';
    options.forEach(function (o) { o.removeAttribute('aria-selected'); });
  }

  function showSuccessModal() {
    var overlay = document.getElementById('form-success-overlay');
    if (!overlay) return;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
  }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function showFieldError(input, errorEl) {
    if (input)   input.classList.add('form-group__input--error');
    if (errorEl) errorEl.hidden = false;
  }
  function clearFieldError(input, errorEl) {
    if (input)   input.classList.remove('form-group__input--error');
    if (errorEl) errorEl.hidden = true;
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    var firstname = document.getElementById('contact-firstname');
    var name      = document.getElementById('contact-name');
    var phone     = document.getElementById('contact-phone');
    var phoneErr  = document.getElementById('contact-phone-error');
    var email     = document.getElementById('contact-email');
    var emailErr  = document.getElementById('contact-email-error');
    var message   = document.getElementById('contact-message');
    var service   = document.getElementById('contact-service');

    var valid = true;

    if (!firstname.value.trim() || !name.value.trim() || !message.value.trim() || !service.value) {
      valid = false;
    }

    /* Email: required + valid format */
    var emailVal = email.value.trim();
    if (!emailVal || !EMAIL_RE.test(emailVal)) {
      showFieldError(email, emailErr);
      valid = false;
    } else {
      clearFieldError(email, emailErr);
    }

    /* Phone: optional, but if filled must be 7-15 digits */
    var phoneVal = phone.value.trim();
    if (phoneVal) {
      var digits = phoneVal.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) {
        showFieldError(phone, phoneErr);
        valid = false;
      } else {
        clearFieldError(phone, phoneErr);
      }
    } else {
      clearFieldError(phone, phoneErr);
    }

    if (!valid) return;

    var submitBtn = contactForm.querySelector('.contact__form-submit');
    var label     = submitBtn.querySelector('.btn__label span');
    var original  = label.textContent;
    label.textContent = 'Wird gesendet...';
    submitBtn.disabled = true;

    fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { 'Accept': 'application/json' }
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.success) {
          contactForm.reset();
          resetServiceSelect();
          showSuccessModal();
        }
      })
      .catch(function () { /* silent */ })
      .then(function () {
        label.textContent = original;
        submitBtn.disabled = false;
      });
  }

  function initSuccessModal() {
    var overlay  = document.getElementById('form-success-overlay');
    var closeBtn = document.getElementById('form-success-close');
    if (!overlay) return;

    function closeModal() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });
  }

  /* --- Accordion --- */
  function initAccordion() {
    var items = document.querySelectorAll('.accordion-item');
    items.forEach(function (item) {
      var trigger = item.querySelector('.accordion-item__trigger');
      if (!trigger) return;
      trigger.addEventListener('click', function () {
        var isOpen = item.classList.contains('accordion-item--open');
        // Close all items
        items.forEach(function (i) {
          i.classList.remove('accordion-item--open');
          var t = i.querySelector('.accordion-item__trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
        // Open clicked item if it was closed
        if (!isOpen) {
          item.classList.add('accordion-item--open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* --- Nav dropdown --- */
  function initNavDropdown() {
    var navDropdown    = document.querySelector('.nav-dropdown');
    var navDropTrigger = document.querySelector('.nav-dropdown__trigger');
    var navDropMenu    = document.querySelector('.nav-dropdown__menu');

    if (!navDropdown || !navDropTrigger || !navDropMenu) return;

    function isMobileNav() { return window.innerWidth <= 768; }

    navDropTrigger.addEventListener('click', function (e) {
      if (isMobileNav()) {
        e.stopPropagation();
        var isOpen = navDropMenu.classList.toggle('open');
        navDropTrigger.setAttribute('aria-expanded', String(isOpen));
      }
    });

    document.addEventListener('click', function (e) {
      if (!navDropdown.contains(e.target)) {
        navDropMenu.classList.remove('open');
        navDropTrigger.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        navDropMenu.classList.remove('open');
        navDropTrigger.setAttribute('aria-expanded', 'false');
      }
    });

    if (hamburger) {
      hamburger.addEventListener('click', function () {
        navDropMenu.classList.remove('open');
        navDropTrigger.setAttribute('aria-expanded', 'false');
      });
    }
  }

  /* --- Custom form select (mirrors nav-dropdown behaviour) --- */
  function initFormSelect() {
    var wrapper = document.getElementById('service-select');
    if (!wrapper) return;

    var trigger = wrapper.querySelector('.form-select__trigger');
    var menu    = wrapper.querySelector('.form-select__menu');
    var valueEl = wrapper.querySelector('.form-select__value');
    var hidden  = wrapper.querySelector('input[type="hidden"]');
    var options = wrapper.querySelectorAll('.form-select__option');

    function open() {
      menu.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function close() {
      menu.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = menu.classList.contains('open');
      if (isOpen) { close(); } else { open(); }
    });

    options.forEach(function (opt) {
      opt.addEventListener('click', function () {
        options.forEach(function (o) { o.removeAttribute('aria-selected'); });
        opt.setAttribute('aria-selected', 'true');
        valueEl.textContent = opt.textContent;
        valueEl.classList.remove('form-select__value--placeholder');
        hidden.value = opt.getAttribute('data-value');
        close();
      });
    });

    document.addEventListener('click', function (e) {
      if (!wrapper.contains(e.target)) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  /* --- Smooth scroll for all anchor links --- */
  function initSmoothScroll() {
    var anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (!href || href === '#') return;
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          closeMenu();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /* --- Initial viewport height capture (prevents iOS URL bar resize jank) --- */
  function captureInitialVh() {
    document.documentElement.style.setProperty('--initial-vh', window.innerHeight + 'px');
  }

  /* --- Gallery Slider (mobile ≤ 48rem) --- */
  var sliderViewport = document.getElementById('slider-viewport');
  var sliderTrack   = document.getElementById('slider-track');
  var sliderPrevBtn = document.getElementById('slider-prev');
  var sliderNextBtn = document.getElementById('slider-next');
  var sliderCurrent     = 1;
  var sliderRealCount   = 0;
  var sliderInitialized = false;

  function sliderSlideWidth() {
    var ratio = window.innerWidth <= 539 ? 0.74 : 0.60;
    return Math.round(sliderViewport.offsetWidth * ratio);
  }

  function sliderGetOffset(idx) {
    var sw = sliderSlideWidth();
    var vw = sliderViewport.offsetWidth;
    return Math.round((vw - sw) / 2) - idx * sw;
  }

  function sliderSetWidths() {
    var sw = sliderSlideWidth() + 'px';
    var slides = sliderTrack.children;
    for (var i = 0; i < slides.length; i++) {
      slides[i].style.width = sw;
    }
  }

  function sliderUpdateStyles() {
    var slides = sliderTrack.children;
    for (var i = 0; i < slides.length; i++) {
      var dist = Math.abs(i - sliderCurrent);
      if (dist === 0) {
        slides[i].style.transform = 'scale(1)';
        slides[i].style.opacity   = '1';
      } else if (dist === 1) {
        slides[i].style.transform = 'scale(0.85)';
        slides[i].style.opacity   = '0.7';
      } else {
        slides[i].style.transform = 'scale(0.72)';
        slides[i].style.opacity   = '0.4';
      }
    }
  }

  function sliderGoTo(idx, animate) {
    var total = sliderRealCount + 2;
    sliderCurrent = ((idx % total) + total) % total;
    sliderTrack.style.transition = animate
      ? 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)'
      : 'none';
    sliderTrack.style.transform = 'translateX(' + sliderGetOffset(sliderCurrent) + 'px)';
    sliderUpdateStyles();
  }

  function initGallerySlider() {
    if (sliderInitialized || !sliderTrack || !sliderViewport) return;
    sliderInitialized = true;

    /* Populate track from grid items */
    var items = Array.prototype.slice.call(
      document.querySelectorAll('#gallery-grid .gallery__item')
    );
    var slideRealIdx = 0;
    items.forEach(function (item) {
      var src = item.querySelector('img');
      if (!src) return;
      var slide = document.createElement('div');
      slide.className = 'gallery__slide';
      slide.setAttribute('data-real-idx', slideRealIdx++);
      var img = document.createElement('img');
      img.src = src.src;
      img.alt = src.alt;
      img.loading = 'lazy';
      slide.appendChild(img);
      sliderTrack.appendChild(slide);
    });

    sliderRealCount = sliderTrack.children.length;
    if (sliderRealCount < 1) return;

    /* Clone last and first slide for seamless infinite loop */
    var realSlides = Array.prototype.slice.call(sliderTrack.children);
    sliderTrack.insertBefore(realSlides[sliderRealCount - 1].cloneNode(true), realSlides[0]);
    sliderTrack.appendChild(realSlides[0].cloneNode(true));
    /* Layout: [clone-last, real-0 … real-n, clone-first] */

    sliderSetWidths();
    sliderGoTo(1, false);

    /* After the track's own transform finishes, silently reposition from clone to real.
       Guard e.target === sliderTrack so bubbled transitionend from child slides
       (their scale/opacity transitions) don't fire the jump prematurely. */
    sliderTrack.addEventListener('transitionend', function (e) {
      if (e.target !== sliderTrack || e.propertyName !== 'transform') return;
      var total = sliderRealCount + 2;
      if (sliderCurrent === 0) {
        sliderGoTo(sliderRealCount, false);
      } else if (sliderCurrent === total - 1) {
        sliderGoTo(1, false);
      }
    });

    sliderPrevBtn.addEventListener('click', function () {
      sliderGoTo(sliderCurrent - 1, true);
    });
    sliderNextBtn.addEventListener('click', function () {
      sliderGoTo(sliderCurrent + 1, true);
    });

    /* Swipe + tap-to-open */
    var touchStartX   = 0;
    var touchBaseOffset = 0;
    var touchMoved    = false;
    var isDragging    = false;

    sliderViewport.addEventListener('touchstart', function (e) {
      touchStartX    = e.touches[0].clientX;
      touchBaseOffset = sliderGetOffset(sliderCurrent);
      touchMoved     = false;
      isDragging     = true;
      sliderTrack.style.transition = 'none';
    }, { passive: true });

    sliderViewport.addEventListener('touchmove', function (e) {
      if (!isDragging) return;
      var dx = e.touches[0].clientX - touchStartX;
      if (Math.abs(dx) > 5) touchMoved = true;
      sliderTrack.style.transform = 'translateX(' + (touchBaseOffset + dx) + 'px)';
    }, { passive: true });

    sliderViewport.addEventListener('touchend', function (e) {
      isDragging = false;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        sliderGoTo(sliderCurrent + (dx < 0 ? 1 : -1), true);
      } else {
        sliderGoTo(sliderCurrent, true);
      }
    }, { passive: true });
    sliderViewport.addEventListener('click', function (e) {
      if (touchMoved) { touchMoved = false; return; }
      var slide = e.target.closest('.gallery__slide');
      if (!slide || !slide.hasAttribute('data-real-idx')) return;
      openAllImagesLightbox(parseInt(slide.getAttribute('data-real-idx'), 10));
    });

    /* Recalculate widths and position on resize */
    window.addEventListener('resize', function () {
      sliderSetWidths();
      sliderGoTo(sliderCurrent, false);
    }, { passive: true });
  }

  /* Activate only at the tablet-portrait breakpoint */
  var sliderMQ = window.matchMedia('(max-width: 48rem)');
  sliderMQ.addEventListener('change', function (e) {
    if (e.matches) initGallerySlider();
  });
  if (sliderMQ.matches) initGallerySlider();

  /* --- Gallery: CSS Grid + GLightbox --- */
  var galleryGrid = document.getElementById('gallery-grid');
  var lightbox = null;
  var visibleGalleryLinks = [];

  function rebuildLightbox() {
    if (lightbox) {
      lightbox.destroy();
      lightbox = null;
    }

    visibleGalleryLinks = Array.prototype.filter.call(
      galleryGrid.querySelectorAll('a.glightbox'),
      function (a) { return !a.closest('.gallery__item[hidden]'); }
    );

    if (!visibleGalleryLinks.length) return;

    lightbox = GLightbox({
      elements: visibleGalleryLinks.map(function (a) {
        return { href: a.getAttribute('href'), type: 'image' };
      }),
      touchNavigation: true,
      loop: true,
      closeOnOutsideClick: true,
      openEffect: 'fade',
      closeEffect: 'fade',
      slideEffect: 'fade'
    });
  }

  /* --- "View all" lightbox — all 10 images including the hidden extras --- */
  var allImagesLightbox = null;

  function openAllImagesLightbox(startIdx) {
    if (!allImagesLightbox) {
      var slides = [];

      Array.prototype.forEach.call(
        galleryGrid.querySelectorAll('a.glightbox'),
        function (a) { slides.push({ href: a.getAttribute('href'), type: 'image' }); }
      );
      Array.prototype.forEach.call(
        document.querySelectorAll('#gallery-extra a'),
        function (a) { slides.push({ href: a.getAttribute('href'), type: 'image' }); }
      );

      allImagesLightbox = GLightbox({
        elements: slides,
        touchNavigation: true,
        loop: true,
        closeOnOutsideClick: true,
        openEffect: 'fade',
        closeEffect: 'fade',
        slideEffect: 'fade'
      });
    }

    if (typeof startIdx === 'number') {
      allImagesLightbox.openAt(startIdx);
    } else {
      allImagesLightbox.open();
    }
  }

  function initGallery() {
    if (!galleryGrid) return;

    var viewAllBtn = document.getElementById('gallery-view-all');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', openAllImagesLightbox);
    }

    /* Clicking any visible grid image opens the full-gallery lightbox so the
       user can arrow through every photo, not only the 7 currently shown. */
    galleryGrid.addEventListener('click', function (e) {
      var link = e.target.closest('a.glightbox');
      if (!link) return;
      e.preventDefault();
      var allLinks = Array.prototype.slice.call(galleryGrid.querySelectorAll('a.glightbox'));
      var idx = allLinks.indexOf(link);
      openAllImagesLightbox(idx >= 0 ? idx : 0);
    });

    rebuildLightbox();
  }

  function initGalleryFilters() {
    var filterBtns = document.querySelectorAll('.gallery__filter');
    if (!filterBtns.length) return;

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('gallery__filter--active'); });
        btn.classList.add('gallery__filter--active');

        /* Show only the first 7 items matching the filter — the rest stay
           hidden but remain accessible via the full-gallery lightbox. */
        var filterValue = btn.getAttribute('data-filter');
        var shown = 0;
        Array.prototype.forEach.call(
          galleryGrid.querySelectorAll('.gallery__item'),
          function (item) {
            var match = filterValue === '*' || item.getAttribute('data-category') === filterValue;
            if (match && shown < 7) {
              item.hidden = false;
              shown++;
            } else {
              item.hidden = true;
            }
          }
        );

        rebuildLightbox();
      });
    });
  }

  /* ==========================================
     Reviews Slider & Modal
     ========================================== */

  /* --- Config: fill in your Place ID and Maps JS API key before going live --- */
  var REVIEWS_PLACE_ID = '';
  var REVIEWS_API_KEY  = '';

  var REVIEWS_STATIC = [
    {
      author_name: 'Sarah Jenkins',
      rating: 5,
      text: 'Absolute handwerkliche Spitzenklasse! Das Team war super zuverlässig und das Endergebnis hat alle unsere Erwartungen übertroffen. Wir können die Firma uneingeschränkt weiterempfehlen.',
      relative_time_description: 'vor 2 Wochen',
      profile_photo_url: 'assets/images/avatar-sarah.jpg',
      author_url: ''
    },
    {
      author_name: 'Michael Chen',
      rating: 5,
      text: 'Sehr professionell und angenehm in der Zusammenarbeit. Sie haben sich die Zeit genommen, unsere Wünsche genau zu verstehen. Alles wurde pünktlich geliefert.',
      relative_time_description: 'vor einem Monat',
      profile_photo_url: 'assets/images/avatar-michael.jpg',
      author_url: ''
    },
    {
      author_name: 'David Roberts',
      rating: 4,
      text: 'Toller Service insgesamt. Es gab anfangs ein kleines Missverständnis, das aber schnell aus dem Weg geräumt wurde. Die Ausführung war makellos. Würde sie wieder beauftragen.',
      relative_time_description: 'vor 2 Monaten',
      profile_photo_url: 'assets/images/avatar-david.jpg',
      author_url: ''
    },
    {
      author_name: 'Anna Becker',
      rating: 5,
      text: 'Wir haben unser komplettes Badezimmer renovieren lassen und sind absolut begeistert. Von der ersten Beratung bis zur finalen Abnahme war alles tadellos organisiert. Das Team hat auf jeden unserer Wünsche eingegangen, selbst als wir kurzfristig die Fliesenauswahl geändert haben. Der Zeitplan wurde eingehalten, die Baustelle täglich sauber hinterlassen und das Ergebnis übertrifft unsere Erwartungen bei Weitem. Wir werden Akkermann Stroy auf jeden Fall wieder beauftragen.',
      relative_time_description: 'vor 3 Wochen',
      profile_photo_url: '',
      author_url: ''
    },
    {
      author_name: 'Klaus Hartmann',
      rating: 5,
      text: 'Schnelle Terminvereinbarung, faire Preise, saubere Arbeit. Mehr braucht man nicht zu sagen.',
      relative_time_description: 'vor 5 Wochen',
      profile_photo_url: '',
      author_url: ''
    },
    {
      author_name: 'Julia Hoffmann',
      rating: 5,
      text: 'Ich habe mich lange nach einem verlässlichen Handwerksbetrieb für unsere Altbauwohnung umgesehen. Nach mehreren enttäuschenden Erfahrungen mit anderen Firmen bin ich durch eine Empfehlung auf Akkermann Stroy gestoßen – und das war die beste Entscheidung. Das Team hat nicht nur die Fliesenarbeiten im Bad und in der Küche perfekt ausgeführt, sondern auch proaktiv auf eine undichte Stelle im Unterputz hingewiesen, die uns sonst langfristig teuer zu stehen gekommen wäre. Handwerklich auf höchstem Niveau, kommunikativ und immer erreichbar. Absolute Empfehlung!',
      relative_time_description: 'vor 6 Wochen',
      profile_photo_url: '',
      author_url: ''
    },
    {
      author_name: 'Markus Schneider',
      rating: 5,
      text: 'Parkett verlegt, Wände gestrichen, Sockelleisten neu – alles in einer Woche erledigt. Saubere Handwerksarbeit zu einem fairen Preis. Gerne wieder.',
      relative_time_description: 'vor 2 Monaten',
      profile_photo_url: '',
      author_url: ''
    }
  ];

  var reviewsData       = [];
  var reviewsCurrentIdx = 0;
  var reviewsModalIdx   = 0;

  var rvTrack    = document.getElementById('reviews-track');
  var rvViewport = document.getElementById('reviews-viewport');
  var rvPrev     = document.getElementById('reviews-prev');
  var rvNext     = document.getElementById('reviews-next');
  var rvDots     = document.getElementById('reviews-dots');

  var rvModal         = document.getElementById('review-modal');
  var rvModalBody     = document.getElementById('review-modal-body');
  var rvModalClose    = document.getElementById('review-modal-close');
  var rvModalBackdrop = document.getElementById('review-modal-backdrop');

  /* --- Helpers --- */
  var STAR_PATH = 'm8 1.333 2.06 4.174 4.607.674-3.334 3.248.787 4.588L8 11.513l-4.12 2.504.787-4.588L1.333 6.18l4.607-.674L8 1.333Z';

  function buildStars(rating) {
    var html = '<div class="rating-stars" aria-label="' + rating + ' von 5 Sternen">';
    for (var i = 1; i <= 5; i++) {
      var op = i <= rating ? '1' : '0.25';
      html += '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="' + STAR_PATH + '" fill="#f8b600" opacity="' + op + '"/></svg>';
    }
    return html + '</div>';
  }

  function buildAvatar(review) {
    if (review.profile_photo_url) {
      return '<img src="' + review.profile_photo_url + '" alt="' + review.author_name + '" class="review-card__avatar" loading="lazy" onerror="this.parentNode.innerHTML=\'<div class=\\\'review-card__avatar review-card__avatar--initials\\\'>' + review.author_name.charAt(0) + '</div>\'">';
    }
    return '<div class="review-card__avatar review-card__avatar--initials">' + review.author_name.charAt(0) + '</div>';
  }

  function buildAuthorBlock(review) {
    return '<div class="review-card__author">'
      + buildAvatar(review)
      + '<div class="review-card__author-info">'
      +   '<div class="review-card__name-cover"><span class="review-card__name">' + review.author_name + '</span></div>'
      +   '<div class="review-card__date-cover"><span class="review-card__date">' + review.relative_time_description + '</span></div>'
      + '</div>'
      + '</div>';
  }

  var CARD_PREVIEW_LEN = 160;

  function buildReviewCard(review, idx) {
    var preview = review.text.length > CARD_PREVIEW_LEN
      ? review.text.slice(0, CARD_PREVIEW_LEN).replace(/\s\S+$/, '') + '…'
      : review.text;

    return '<article class="review-card">'
      + '<div class="review-card__header">'
      +   buildAuthorBlock(review)
      +   '<div class="review-card__google-icon"><img src="assets/images/google-icon.svg" alt="Google" width="20" height="20"></div>'
      + '</div>'
      + '<div class="review-card__stars">' + buildStars(review.rating) + '</div>'
      + '<div class="review-card__text-cover"><p>„' + preview + '“</p></div>'
      + '<div class="review-card__link-cover">'
      +   '<button type="button" class="review-card__link js-open-review" data-idx="' + idx + '">Ganze Bewertung lesen</button>'
      + '</div>'
      + '</article>';
  }

  /* --- Slider geometry --- */
  function rvVisibleCount() {
    if (window.innerWidth > 1024) return 3;
    if (window.innerWidth > 640)  return 2;
    return 1;
  }

  function rvMaxIndex() {
    return Math.max(0, reviewsData.length - rvVisibleCount());
  }

  function rvSlideWidth() {
    if (!rvViewport) return 0;
    var gap   = 16;
    var count = rvVisibleCount();
    return (rvViewport.offsetWidth - gap * (count - 1)) / count;
  }

  function rvApplyWidths() {
    var sw = rvSlideWidth() + 'px';
    Array.prototype.forEach.call(rvTrack.querySelectorAll('.reviews__slide'), function (s) {
      s.style.width = sw;
    });
  }

  function rvGoTo(idx, animate) {
    var max = rvMaxIndex();
    /* Wrap-around for infinite loop */
    if (idx < 0)   idx = max;
    if (idx > max) idx = 0;
    reviewsCurrentIdx = idx;
    var sw  = rvSlideWidth();
    var gap = 16;
    rvTrack.style.transition = animate === false ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)';
    rvTrack.style.transform  = 'translateX(-' + (reviewsCurrentIdx * (sw + gap)) + 'px)';
    rvUpdateUI();
  }

  function rvUpdateUI() {
    Array.prototype.forEach.call(rvDots.querySelectorAll('.reviews__dot'), function (dot, i) {
      dot.classList.toggle('reviews__dot--active', i === reviewsCurrentIdx);
    });
    /* Buttons always enabled — slider is looped */
    if (rvPrev) rvPrev.disabled = false;
    if (rvNext) rvNext.disabled = false;
  }

  /* --- Render --- */
  function rvRender() {
    if (!rvTrack) return;

    var html = '';
    reviewsData.forEach(function (r, i) {
      html += '<div class="reviews__slide">' + buildReviewCard(r, i) + '</div>';
    });
    rvTrack.innerHTML = html;
    rvApplyWidths();

    /* Dots */
    var maxIdx   = rvMaxIndex();
    var dotsHtml = '';
    for (var i = 0; i <= maxIdx; i++) {
      dotsHtml += '<button class="reviews__dot" aria-label="Bewertung ' + (i + 1) + '"></button>';
    }
    rvDots.innerHTML = dotsHtml;
    Array.prototype.forEach.call(rvDots.querySelectorAll('.reviews__dot'), function (dot, i) {
      (function (idx) {
        dot.addEventListener('click', function () { rvGoTo(idx, true); });
      }(i));
    });

    /* Delegate "read full" clicks */
    rvTrack.addEventListener('click', function (e) {
      var link = e.target.closest('.js-open-review');
      if (!link) return;
      e.preventDefault();
      rvModalOpen(parseInt(link.getAttribute('data-idx'), 10));
    });

    rvGoTo(Math.min(reviewsCurrentIdx, rvMaxIndex()), false);
  }

  /* --- Modal --- */
  function rvLockScroll()   { document.body.classList.add('scroll-locked'); }
  function rvUnlockScroll() { document.body.classList.remove('scroll-locked'); }

  function rvModalRender() {
    if (!rvModalBody) return;
    var html = '';
    var total = reviewsData.length;
    for (var j = 0; j < total; j++) {
      var i = (reviewsModalIdx + j) % total;
      var r = reviewsData[i];
      html += '<article class="review-card" data-idx="' + i + '">'
        + '<div class="review-card__header">'
        +   buildAuthorBlock(r)
        +   '<div class="review-card__google-icon"><img src="assets/images/google-icon.svg" alt="Google" width="20" height="20"></div>'
        + '</div>'
        + '<div class="review-card__stars">' + buildStars(r.rating) + '</div>'
        + '<div class="review-card__text-cover"><p>„' + r.text + '"</p></div>'
        + (r.author_url ? '<div class="review-card__link-cover"><a href="' + r.author_url + '" target="_blank" rel="noopener" class="review-card__link">Bewertung auf Google ansehen →</a></div>' : '')
        + '</article>';
    }
    rvModalBody.innerHTML = html;
  }

  function rvModalOpen(idx) {
    if (!rvModal || !reviewsData.length) return;
    reviewsModalIdx = Math.max(0, Math.min(idx, reviewsData.length - 1));

    rvModalRender();
    rvLockScroll();
    rvModal.hidden = false;

    if (rvModalClose) rvModalClose.focus();
  }

  function rvModalDismiss() {
    if (!rvModal) return;
    rvModal.hidden = true;
    rvUnlockScroll();
  }

  /* --- Google Places API --- */
  function rvLoadData() {
    if (!REVIEWS_PLACE_ID || !REVIEWS_API_KEY) {
      reviewsData = REVIEWS_STATIC;
      rvRender();
      return;
    }

    window._rvMapsReady = function () {
      var dummy   = document.createElement('div');
      var service = new google.maps.places.PlacesService(dummy);
      service.getDetails({
        placeId: REVIEWS_PLACE_ID,
        fields: ['reviews', 'rating', 'user_ratings_total']
      }, function (place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK && place.reviews && place.reviews.length) {
          reviewsData = place.reviews.map(function (r) {
            return {
              author_name:               r.author_name,
              rating:                    r.rating,
              text:                      r.text,
              relative_time_description: r.relative_time_description,
              profile_photo_url:         r.profile_photo_url,
              author_url:                r.author_url
            };
          });
          var scoreEl = document.querySelector('.google-badge__score');
          var countEl = document.querySelector('.google-badge__count');
          if (scoreEl && place.rating)              scoreEl.textContent = place.rating.toFixed(1);
          if (countEl && place.user_ratings_total)  countEl.textContent = place.user_ratings_total + ' Bewertungen';
          var writeBtn = document.querySelector('.reviews__cta-cover .btn');
          if (writeBtn) writeBtn.setAttribute('href', 'https://search.google.com/local/writereview?placeid=' + REVIEWS_PLACE_ID);
        } else {
          reviewsData = REVIEWS_STATIC;
        }
        rvRender();
      });
    };

    var s  = document.createElement('script');
    s.src  = 'https://maps.googleapis.com/maps/api/js?key=' + REVIEWS_API_KEY + '&libraries=places&callback=_rvMapsReady';
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }

  /* --- Areas expand/collapse --- */
  function initAreasExpand() {
    var btn = document.getElementById('areas-expand-btn');
    var list = document.querySelector('.areas__locations');
    var labelEl = btn ? btn.querySelector('.btn__label span') : null;
    var iconEl  = btn ? btn.querySelector('svg') : null;
    if (!btn || !list || !labelEl || !iconEl) return;

    btn.addEventListener('click', function () {
      var expanded = list.classList.toggle('expanded');
      btn.setAttribute('aria-expanded', String(expanded));
      labelEl.textContent = expanded ? 'Weniger anzeigen' : 'Alle Städte anzeigen';
      iconEl.style.transform = expanded ? 'rotate(180deg)' : '';
    });
  }

  /* --- Init Reviews --- */
  function initReviews() {
    if (!rvTrack) return;

    /* Slider nav */
    if (rvPrev) rvPrev.addEventListener('click', function () { rvGoTo(reviewsCurrentIdx - 1, true); });
    if (rvNext) rvNext.addEventListener('click', function () { rvGoTo(reviewsCurrentIdx + 1, true); });

    /* Touch */
    var rvTouchX = 0;
    if (rvViewport) {
      rvViewport.addEventListener('touchstart', function (e) { rvTouchX = e.changedTouches[0].clientX; }, { passive: true });
      rvViewport.addEventListener('touchend',   function (e) {
        var dx = e.changedTouches[0].clientX - rvTouchX;
        if (Math.abs(dx) > 40) rvGoTo(reviewsCurrentIdx + (dx < 0 ? 1 : -1), true);
      }, { passive: true });
    }

    /* Resize */
    window.addEventListener('resize', function () {
      rvApplyWidths();
      var newMax = rvMaxIndex();
      if (rvDots.querySelectorAll('.reviews__dot').length !== newMax + 1) {
        rvRender();
      } else {
        rvGoTo(Math.min(reviewsCurrentIdx, newMax), false);
      }
    }, { passive: true });

    /* Modal events */
    if (rvModalClose)    rvModalClose.addEventListener('click',   rvModalDismiss);
    if (rvModalBackdrop) rvModalBackdrop.addEventListener('click', rvModalDismiss);

    document.addEventListener('keydown', function (e) {
      if (!rvModal || rvModal.hidden) return;
      if (e.key === 'Escape') rvModalDismiss();
    });

    rvLoadData();
  }

  /* --- Stats ticker (mobile single-row loop) --- */
  function initStatsTicker() {
    if (!window.matchMedia('(max-width: 37.5rem)').matches) return;
    var container = document.querySelector('.stats__container');
    if (!container) return;

    var items = Array.prototype.slice.call(container.querySelectorAll('.stats__item'));
    if (!items.length) return;

    var track = document.createElement('div');
    track.className = 'stats__ticker-track';
    items.forEach(function (item) { track.appendChild(item); });
    items.forEach(function (item) { track.appendChild(item.cloneNode(true)); });
    container.appendChild(track);
  }

  /* --- Stats count-up animation --- */
  function initStatsCountUp() {
    var items = document.querySelectorAll('.stats__number');
    if (!items.length) return;

    var DURATION = 1500;

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animateItem(el, target, suffix) {
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / DURATION, 1);
        el.textContent = Math.floor(easeOut(progress) * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    var targets = [];
    items.forEach(function (el) {
      var raw    = el.textContent.trim();
      var suffix = raw.replace(/[0-9]/g, '');
      var target = parseInt(raw, 10);
      targets.push({ el: el, target: target, suffix: suffix });
      el.textContent = isNaN(target) ? raw : '0' + suffix;
    });

    function runAll() {
      targets.forEach(function (item) {
        if (isNaN(item.target)) return;
        animateItem(item.el, item.target, item.suffix);
      });
    }

    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        runAll();
      }
    }, { threshold: 0.5 });

    var section = document.querySelector('.stats');
    if (section) observer.observe(section);
  }

  /* --- Process section scroll-driven animation (Apple-style sticky) ---
     DISABLED: commented out in favour of initProcessScrollReveal below.
     To re-enable: uncomment this block and swap the initProcessScrollReveal
     call for initProcessAnimation in init(). Also remove the .is-visible CSS
     rule and the CSS transition on .process__step.
  function initProcessAnimation() {
    var steps   = document.querySelectorAll('.process__step');
    var section = document.querySelector('.process');
    var pin     = document.querySelector('.process-pin');
    if (!steps.length || !section || !pin) return;

    var RANGE_PX = 300;
    var done = false;

    function headerH() {
      return parseFloat(getComputedStyle(document.documentElement)
        .getPropertyValue('--header-height')) || 0;
    }

    function setup() {
      if (done) return;
      pin.style.height = (section.offsetHeight + steps.length * RANGE_PX) + 'px';
    }

    function finish() {
      done = true;
      window.removeEventListener('scroll', onScroll, false);
      steps.forEach(function (step) {
        step.style.opacity   = '1';
        step.style.transform = 'translateY(0)';
      });

      var io = new IntersectionObserver(function (entries) {
        var entry = entries[0];
        if (entry.isIntersecting) return;
        if (entry.boundingClientRect.bottom > 0) return;
        io.disconnect();
        pin.style.height  = '';
        section.style.top = '-9999px';
      }, { threshold: 0 });
      io.observe(section);
    }

    function onScroll() {
      var scrolled = headerH() - pin.getBoundingClientRect().top;
      steps.forEach(function (step, i) {
        var progress = Math.max(0, Math.min(1, (scrolled - i * RANGE_PX) / RANGE_PX));
        step.style.opacity   = progress;
        step.style.transform = 'translateY(' + ((1 - progress) * 2).toFixed(2) + 'rem)';
      });
      if (scrolled >= steps.length * RANGE_PX) finish();
    }

    setup();
    window.addEventListener('load', function () { setup(); if (!done) onScroll(); });
    window.addEventListener('scroll', onScroll,  { passive: true });
    window.addEventListener('resize', function () { if (!done) setup(); }, { passive: true });
    onScroll();
  }
  */

  /* --- Process section scroll-reveal ---
     Each step fades in and slides up via CSS transition when it enters
     the viewport. Replaces the sticky scroll-driven animation above. */
  function initProcessScrollReveal() {
    var steps = document.querySelectorAll('.process__step');
    if (!steps.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.2 });

    steps.forEach(function (step, i) {
      step.style.transitionDelay = (i * 0.12) + 's';
      observer.observe(step);
    });
  }

  /* --- Init --- */
  function init() {
    captureInitialVh();
    syncHeaderHeight();
    document.documentElement.style.setProperty('--hero-offset', header.offsetHeight + 'px');

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    if (hamburger) {
      hamburger.addEventListener('click', toggleMenu);
    }

    navLinks.forEach(function (link) {
      link.addEventListener('click', handleNavClick);
    });

    equalizeServiceCards();
    initAccordion();
    initSmoothScroll();
    initNavDropdown();
    initFormSelect();
    initGallery();
    initGalleryFilters();
    initReviews();
    initStatsTicker();
    initStatsCountUp();
    // initProcessAnimation(); /* DISABLED — use initProcessScrollReveal instead */
    initProcessScrollReveal();
    initAreasExpand();

    document.addEventListener('click', handleOutsideClick);

    if (contactForm) {
      contactForm.addEventListener('submit', handleFormSubmit);

      var phoneInput = document.getElementById('contact-phone');
      var phoneErr   = document.getElementById('contact-phone-error');
      if (phoneInput) {
        phoneInput.addEventListener('input', function () {
          clearFieldError(phoneInput, phoneErr);
        });
      }
      var emailInput = document.getElementById('contact-email');
      var emailErr   = document.getElementById('contact-email-error');
      if (emailInput) {
        emailInput.addEventListener('input', function () {
          clearFieldError(emailInput, emailErr);
        });
      }
    }
    initSuccessModal();

    handleScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', function () {
    syncHeaderHeight();
    document.documentElement.style.setProperty('--hero-offset', header.offsetHeight + 'px');
    equalizeServiceCards();
  });
})();
