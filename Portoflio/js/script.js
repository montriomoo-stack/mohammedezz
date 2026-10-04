/* ═══════════════════════════════════════════════════
   MONTRIO — PORTFOLIO JAVASCRIPT
   Mohammed Ezz | Video Editor
   ═══════════════════════════════════════════════════ */
'use strict';

/* ─── Utilities ─────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ═══════════════════════════════════════════════════
   1. THEME TOGGLE
   ═══════════════════════════════════════════════════ */
(function initTheme() {
  const html   = document.documentElement;
  const btn    = $('#themeToggle');

  // Apply saved theme immediately (before paint)
  const saved  = localStorage.getItem('montrio-theme') || 'dark';
  html.setAttribute('data-theme', saved);
  if (btn) updateAriaLabel(btn, saved);

  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('montrio-theme', next);
    updateAriaLabel(btn, next);
  });

  function updateAriaLabel(el, theme) {
    el.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
})();


/* ═══════════════════════════════════════════════════
   2. NAVBAR — scroll state + active link
   ═══════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar = $('#navbar');
  if (!navbar) return;

  // Scroll state
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 44);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active link on scroll
  const sections = $$('section[id]');
  const links    = $$('.nav-link');
  const navH     = () => navbar.offsetHeight;

  function updateActiveLink() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - navH() - 60) {
        current = sec.id;
      }
    });
    links.forEach(a => {
      const match = a.getAttribute('href') === '#' + current;
      a.classList.toggle('active', match);
      a.setAttribute('aria-current', match ? 'page' : 'false');
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
})();


/* ═══════════════════════════════════════════════════
   3. MOBILE NAVIGATION
   ═══════════════════════════════════════════════════ */
(function initMobileNav() {
  const hamburger = $('#hamburger');
  const navLinks  = $('#navLinks');
  const overlay   = $('#mobOverlay');

  if (!hamburger || !navLinks) return;

  let isOpen = false;

  function open() {
    isOpen = true;
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    navLinks.classList.add('open');
    document.body.classList.add('nav-open');
    if (overlay) {
      overlay.style.display = 'block';
      // Force reflow before transition
      overlay.getBoundingClientRect();
      overlay.classList.add('show');
      overlay.removeAttribute('aria-hidden');
    }
  }

  function close() {
    isOpen = false;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    navLinks.classList.remove('open');
    document.body.classList.remove('nav-open');
    if (overlay) {
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden', 'true');
      // Hide after transition
      setTimeout(() => {
        if (!overlay.classList.contains('show')) overlay.style.display = '';
      }, 300);
    }
  }

  hamburger.addEventListener('click', () => isOpen ? close() : open());

  // Close on overlay click
  if (overlay) overlay.addEventListener('click', close);

  // Close on nav link click (mobile only)
  $$('.nav-link', navLinks).forEach(a => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 768) close();
    });
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) {
      close();
      hamburger.focus();
    }
  });

  // Close on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && isOpen) close();
  });
})();


/* ═══════════════════════════════════════════════════
   4. SMOOTH ANCHOR SCROLL
   ═══════════════════════════════════════════════════ */
(function initSmoothScroll() {
  const navbar = $('#navbar');

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute('href').slice(1);
    if (!id) return;

    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    const offset = (navbar ? navbar.offsetHeight : 72);
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    if (reducedMotion()) {
      window.scrollTo(0, top);
    } else {
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
})();


/* ═══════════════════════════════════════════════════
   5. SCROLL REVEAL
   ═══════════════════════════════════════════════════ */
(function initReveal() {
  const items = $$('.reveal');
  if (!items.length) return;

  // Reduced motion → show everything instantly
  if (reducedMotion()) {
    items.forEach(el => el.classList.add('in-view'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;

      // Stagger siblings in grid/flex containers
      const siblings = $$('.reveal', el.parentElement);
      const idx      = siblings.indexOf(el);
      const isGrided = ['grid', 'flex'].includes(
        getComputedStyle(el.parentElement).display
      );
      const delay = isGrided ? Math.min(idx * 75, 280) : 0;

      setTimeout(() => el.classList.add('in-view'), delay);
      io.unobserve(el);
    });
  }, {
    threshold: 0.10,
    rootMargin: '0px 0px -36px 0px'
  });

  items.forEach(el => io.observe(el));
})();


/* ═══════════════════════════════════════════════════
   6. HERO — reveal on load
   ═══════════════════════════════════════════════════ */
window.addEventListener('load', () => {
  const heroItems = $$('#home .reveal');
  if (reducedMotion()) {
    heroItems.forEach(el => el.classList.add('in-view'));
    return;
  }
  heroItems.forEach((el, i) => {
    setTimeout(() => el.classList.add('in-view'), 80 + i * 110);
  });
});


/* ═══════════════════════════════════════════════════
   7. CONTACT FORM
   ═══════════════════════════════════════════════════ */
(function initContactForm() {
  const form    = $('#contactForm');
  const success = $('#formSuccess');
  const btn     = $('#formSubmit');

  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const fields = [
      $('#fName',  form),
      $('#fEmail', form),
      $('#fType',  form),
      $('#fMsg',   form)
    ].filter(Boolean);

    // Clear previous errors
    fields.forEach(f => f.classList.remove('error'));

    // Validate
    let valid = true;

    fields.forEach(f => {
      if (!f.value.trim()) {
        f.classList.add('error');
        valid = false;
        // Remove error on next input
        f.addEventListener('input', () => f.classList.remove('error'), { once: true });
      }
    });

    const emailField = $('#fEmail', form);
    if (emailField && emailField.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim())) {
      emailField.classList.add('error');
      valid = false;
    }

    if (!valid) return;

    // Loading state
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'SENDING…';
    }

    setTimeout(() => {
      // Success
      if (success) {
        success.removeAttribute('hidden');
        success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      form.reset();

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `SEND PROJECT DETAILS
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>`;
      }

      // Auto-hide after 7s
      if (success) {
        setTimeout(() => success.setAttribute('hidden', ''), 7000);
      }
    }, 650);
  });
})();


/* ═══════════════════════════════════════════════════
   8. BACK TO TOP
   ═══════════════════════════════════════════════════ */
(function initBackToTop() {
  const btn = $('#backTop');
  if (!btn) return;

  btn.addEventListener('click', e => {
    e.preventDefault();
    reducedMotion()
      ? window.scrollTo(0, 0)
      : window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ═══════════════════════════════════════════════════
   9. KEYBOARD ACCESSIBILITY
   ═══════════════════════════════════════════════════ */
(function initKeyboardNav() {
  document.addEventListener('mousedown', () =>
    document.body.classList.remove('keyboard-nav')
  );
  document.addEventListener('keydown', e => {
    if (e.key === 'Tab') document.body.classList.add('keyboard-nav');
  });
})();


/* ═══════════════════════════════════════════════════
   10. DEV — overflow warning
   ═══════════════════════════════════════════════════ */
if (['localhost', '127.0.0.1', ''].includes(location.hostname)) {
  window.addEventListener('load', () => {
    if (document.documentElement.scrollWidth > document.documentElement.clientWidth) {
      $$('*').forEach(el => {
        if (el.offsetWidth > document.documentElement.clientWidth) {
          console.warn('[MONTRIO] Overflow:', el);
        }
      });
    }

    /* Brand console */
    console.log(
      '%c MONTRIO %c Video Editor Portfolio ',
      'background:#c8a86b;color:#080808;font-weight:800;padding:4px 8px;border-radius:3px 0 0 3px;',
      'background:#111;color:#c8a86b;padding:4px 8px;border-radius:0 3px 3px 0;border:1px solid #c8a86b;border-left:none;'
    );
  });
}
