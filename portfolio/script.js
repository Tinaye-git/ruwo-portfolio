/* ═══════════════════════════════════════════════════════════
   MUNYARADZI TINAYE RUWO — PORTFOLIO SCRIPTS
   Vanilla JavaScript — no frameworks, no libraries
   Well-commented for beginner understanding
   ═══════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────────
   0. THEME SWITCHER — runs first to avoid flash of wrong theme
   Reads the saved theme from localStorage and applies it to
   the <html> element before the rest of the page renders.
adjfbadknbfdkn
   mneww
   ────────────────────────────────────────────────────────── */
(function initTheme() {
  const html = document.documentElement;
  const saved = localStorage.getItem('portfolio-theme') || 'claude';
  const themeBtns = document.querySelectorAll('.theme-btn');

  // Apply the saved (or default) theme immediately
  html.setAttribute('data-theme', saved);

  // Mark the correct button as active
  function updateButtons(activeTheme) {
    themeBtns.forEach(btn => {
      btn.classList.toggle('theme-btn--active', btn.dataset.theme === activeTheme);
    });
  }

  updateButtons(saved);

  // Listen for button clicks and switch theme
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const chosen = btn.dataset.theme;
      html.setAttribute('data-theme', chosen);
      localStorage.setItem('portfolio-theme', chosen);
      updateButtons(chosen);
    });
  });
})();

/* ──────────────────────────────────────────────────────────
   1. NAV — SCROLL BORDER
   Adds a border-bottom to the nav when the page is scrolled
   down past 10px, giving a subtle separation from content.
   ────────────────────────────────────────────────────────── */
(function initNavScroll() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  // Listen for scroll events on the window
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }, { passive: true }); // passive:true improves scroll performance
})();


/* ──────────────────────────────────────────────────────────
   2. NAV — ACTIVE LINK HIGHLIGHT
   Watches which section is currently visible in the viewport
   and highlights the matching nav link in purple.
   ────────────────────────────────────────────────────────── */
(function initActiveLink() {
  const navLinks = document.querySelectorAll('.nav__link');

  // Map href values to section IDs
  // e.g. href="#about" → section id="about"
  const sectionIds = Array.from(navLinks).map(link => link.getAttribute('href').replace('#', ''));
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  if (!sections.length) return;

  // IntersectionObserver fires a callback whenever a section
  // enters or leaves the viewport. We use it to detect which
  // section the user is currently reading.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;

        // Remove active class from all links
        navLinks.forEach(link => link.classList.remove('active'));

        // Add active class to the matching link
        const activeLink = document.querySelector(`.nav__link[href="#${id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, {
    // Trigger when section top is between 0% and 20% from viewport top
    rootMargin: '-10% 0px -80% 0px',
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));
})();


/* ──────────────────────────────────────────────────────────
   3. NAV — MOBILE HAMBURGER MENU
   Toggles the mobile navigation drawer open/closed.
   Also closes the menu when a link is clicked (single-page).
   ────────────────────────────────────────────────────────── */
(function initHamburger() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');
  if (!hamburgerBtn || !navLinks) return;

  function toggleMenu() {
    const isOpen = navLinks.classList.toggle('nav__links--open');
    hamburgerBtn.classList.toggle('nav__hamburger--open', isOpen);
    // Update aria-expanded for screen readers
    hamburgerBtn.setAttribute('aria-expanded', isOpen.toString());
  }

  hamburgerBtn.addEventListener('click', toggleMenu);

  // Close mobile menu when any nav link is clicked
  // (user has navigated to a section — menu should hide)
  navLinks.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('nav__links--open');
      hamburgerBtn.classList.remove('nav__hamburger--open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    });
  });
})();


/* ──────────────────────────────────────────────────────────
   4. HERO — TYPING / CYCLING SUBTITLE ANIMATION
   Cycles through an array of phrases, typing them character
   by character then deleting before moving to the next one.
   This gives the hero a lively, animated subtitle.
   ────────────────────────────────────────────────────────── */
(function initTypingAnimation() {
  const el = document.getElementById('typing-text');
  if (!el) return;

  // Phrases to cycle through
  const phrases = [
    'Computer Science student',
    'AI/ML enthusiast',
    'Philomath',
    'Poet',
    'Builder of things'
  ];

  let phraseIndex = 0;  // which phrase we're on
  let charIndex = 0;  // how many characters typed so far
  let isDeleting = false;
  let isPaused = false;

  // Typing speed (ms per character)
  const TYPE_SPEED = 70;
  const DELETE_SPEED = 40;
  const PAUSE_AFTER = 1800; // how long to pause after full phrase
  const PAUSE_BEFORE = 300;  // pause before typing next phrase

  function tick() {
    const currentPhrase = phrases[phraseIndex];

    if (isPaused) {
      isPaused = false;
      setTimeout(tick, PAUSE_BEFORE);
      return;
    }

    if (!isDeleting) {
      // Type the next character
      charIndex++;
      el.textContent = currentPhrase.slice(0, charIndex);

      if (charIndex === currentPhrase.length) {
        // Finished typing — pause before deleting
        isDeleting = true;
        setTimeout(tick, PAUSE_AFTER);
        return;
      }
    } else {
      // Delete a character
      charIndex--;
      el.textContent = currentPhrase.slice(0, charIndex);

      if (charIndex === 0) {
        // Finished deleting — move to next phrase
        isDeleting = false;
        isPaused = true;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }

    // Schedule the next tick
    setTimeout(tick, isDeleting ? DELETE_SPEED : TYPE_SPEED);
  }

  // Start the animation after a short delay
  setTimeout(tick, 800);
})();


/* ──────────────────────────────────────────────────────────
   5. POEMS — ACCORDION EXPAND / COLLAPSE
   Each poem card has a "Read full poem" toggle button.
   Clicking it expands the full poem in place using a smooth
   CSS max-height transition (no height: auto jump).
   ────────────────────────────────────────────────────────── */
(function initPoemAccordion() {
  // Find all poem toggle buttons
  const toggleBtns = document.querySelectorAll('.poem-toggle');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Get the full poem panel this button controls
      const panelId = btn.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);
      if (!panel) return;

      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      if (isExpanded) {
        // Collapse: remove open class, update ARIA
        panel.classList.remove('poem-card__full--open');
        panel.setAttribute('aria-hidden', 'true');
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = 'Read full poem';
      } else {
        // Expand: add open class, update ARIA
        panel.classList.add('poem-card__full--open');
        panel.setAttribute('aria-hidden', 'false');
        btn.setAttribute('aria-expanded', 'true');
        btn.textContent = 'Collapse poem';
      }
    });
  });
})();


/* ──────────────────────────────────────────────────────────
   6. CONTACT FORM — SUBMIT FEEDBACK
   Prevents the default form submission (no backend), then
   shows a friendly success message inline below the button.
   The form fields are cleared after submission.
   ────────────────────────────────────────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const success = document.getElementById('contact-success');
  if (!form || !success) return;

  form.addEventListener('submit', (e) => {
    // Prevent the page from reloading
    e.preventDefault();

    // Simple validation — check all required fields have values
    const name = form.querySelector('#contact-name').value.trim();
    const email = form.querySelector('#contact-email').value.trim();
    const message = form.querySelector('#contact-message').value.trim();

    if (!name || !email || !message) {
      // Don't show success if fields are empty
      return;
    }

    // Show success message
    success.removeAttribute('hidden');

    // Clear the form
    form.reset();

    // After 8 seconds, hide the message again
    setTimeout(() => {
      success.setAttribute('hidden', '');
    }, 8000);
  });
})();


/* ──────────────────────────────────────────────────────────
   7. SCROLL REVEAL
   Elements with class "reveal" gently fade up into view
   as the user scrolls down the page. The IntersectionObserver
   watches for them entering the viewport and adds the
   "reveal--visible" class to trigger the CSS transition.
   ────────────────────────────────────────────────────────── */
(function initScrollReveal() {
  // Which elements should animate in?
  const targets = document.querySelectorAll(
    '.achievement-card, .project-card, .poem-card, .stat-card, .mantra-block, .skill-group'
  );

  // Add the starting class to each target
  targets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        // Once revealed, stop watching this element
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08 // trigger when 8% of element is visible
  });

  targets.forEach(el => observer.observe(el));
})();
