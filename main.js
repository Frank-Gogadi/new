// OSHI website — shared behaviour
document.addEventListener('DOMContentLoaded', function () {

  /* Header shadow on scroll — subtle, purely cosmetic, no layout impact */
  var siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    var onHeaderScroll = function () {
      siteHeader.classList.toggle('scrolled', window.scrollY > 8);
    };
    onHeaderScroll();
    window.addEventListener('scroll', onHeaderScroll, { passive: true });
  }

  /* Scroll-reveal — progressive enhancement only.
     Elements start fully visible; we only ADD the .reveal class (which sets
     opacity:0 until .is-visible lands) once JS confirms it can also observe
     and reveal them. If prefers-reduced-motion is set, or IntersectionObserver
     isn't available, we skip this entirely and everything just stays visible. */
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    var revealSelector = [
      '.section-head', '.card', '.involve-card', '.news-card', '.location-item',
      '.stat', '.donate-option', '.partner-logo', '.story-steps li',
      '.split > div', '.newsletter-box', '.callout'
    ].join(', ');
    var revealTargets = document.querySelectorAll(revealSelector);
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(function (el, i) {
      el.classList.add('reveal');
      // Small staggered delay within each grid/parent for a natural cascade,
      // without needing to touch any HTML markup.
      var siblings = el.parentElement ? Array.prototype.slice.call(el.parentElement.children) : [];
      var idx = siblings.indexOf(el);
      if (idx > -1 && idx < 6) {
        el.style.transitionDelay = (idx * 0.07) + 's';
      }
      revealObs.observe(el);
    });
  }

  /* Footer year */
  document.querySelectorAll('.js-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* Mobile nav toggle */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');
  var scrim = document.querySelector('.nav-scrim');
  function closeNav () {
    nav && nav.classList.remove('open');
    scrim && scrim.classList.remove('open');
    toggle && toggle.setAttribute('aria-expanded', 'false');
  }
  function openNav () {
    nav && nav.classList.add('open');
    scrim && scrim.classList.add('open');
    toggle && toggle.setAttribute('aria-expanded', 'true');
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      nav.classList.contains('open') ? closeNav() : openNav();
    });
  }
  scrim && scrim.addEventListener('click', closeNav);

  /* Dropdown menus — desktop uses CSS :hover/:focus-within; this handles
     click/tap (mobile + touch laptops) and keyboard (Enter/Space) toggling,
     plus closing an open dropdown when clicking elsewhere. */
  document.querySelectorAll('.has-dropdown > a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var isMobile = window.innerWidth <= 980;
      var isTouch = matchMedia('(hover: none)').matches;
      if (isMobile || isTouch) {
        e.preventDefault();
        var parent = link.parentElement;
        var wasOpen = parent.classList.contains('open');
        document.querySelectorAll('.has-dropdown.open').forEach(function (li) {
          li.classList.remove('open');
          li.querySelector('a').setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          parent.classList.add('open');
          link.setAttribute('aria-expanded', 'true');
        }
      }
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-dropdown')) {
      document.querySelectorAll('.has-dropdown.open').forEach(function (li) {
        li.classList.remove('open');
        li.querySelector('a').setAttribute('aria-expanded', 'false');
      });
    }
  });

  /* Close mobile nav when a plain (non-dropdown-toggle) link is clicked */
  document.querySelectorAll('.main-nav a:not(.has-dropdown > a)').forEach(function (a) {
    a.addEventListener('click', closeNav);
  });

  /* Back to top */
  var backBtn = document.getElementById('backToTop');
  if (backBtn) {
    window.addEventListener('scroll', function () {
      backBtn.classList.toggle('show', window.scrollY > 500);
    });
    backBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* Animated counters — triggers once when in view */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 1400;
        var start = null;
        function step (ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased).toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { obs.observe(c); });
  } else {
    counters.forEach(function (el) {
      el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
    });
  }

  /* Generic front-end form handling (no backend wired up — demo validation + success state) */
  document.querySelectorAll('form[data-demo-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.form-msg');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (msg) {
        msg.textContent = form.getAttribute('data-success-text') || 'Thank you — your submission has been received.';
        msg.classList.remove('error');
        msg.classList.add('success', 'show');
        msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      form.reset();
    });
  });

  /* Donation option picker */
  document.querySelectorAll('.donate-options').forEach(function (group) {
    group.addEventListener('change', function (e) {
      group.querySelectorAll('.donate-option').forEach(function (opt) {
        opt.classList.toggle('picked', opt.contains(e.target) || opt.querySelector('input') === e.target && e.target.checked);
      });
      group.querySelectorAll('.donate-option').forEach(function (opt) {
        var input = opt.querySelector('input');
        opt.classList.toggle('picked', input && input.checked);
      });
    });
  });

  /* Active nav state — matches the current page against each link's
     data-page attribute (falls back to comparing hrefs), so both
     top-level items and items tucked inside the "About Us" dropdown
     (e.g. What We Do, Where We Work, Our Partners) get marked active. */
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.main-nav a[href]').forEach(function (a) {
    var target = a.getAttribute('data-page') || a.getAttribute('href').split('/').pop().split('#')[0];
    if (target === currentPage) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
      var parentDropdown = a.closest('.has-dropdown');
      if (parentDropdown && !a.parentElement.classList.contains('has-dropdown')) {
        var topLink = parentDropdown.querySelector(':scope > a');
        if (topLink) topLink.classList.add('active');
      }
    }
  });
});
