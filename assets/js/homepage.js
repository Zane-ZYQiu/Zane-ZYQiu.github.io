/* Single-page homepage behaviour: theme toggle, scroll reveal, active nav
   link, collapsible abstracts and author lists, and BibTeX blocks.
   Adapted from Ruihong Shen's homepage (https://github.com/ruihong04/ruihong04.github.io). */
(function () {
  var root = document.documentElement;
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function storedTheme() {
    try {
      return localStorage.getItem('theme');
    } catch (e) {
      return null;
    }
  }

  function updateNavMetrics() {
    var nav = document.querySelector('.site-nav');
    if (!nav) return;
    var rect = nav.getBoundingClientRect();
    root.style.setProperty('--nav-height', Math.ceil(rect.height) + 'px');
    root.style.setProperty('--nav-offset-top', Math.max(Math.round(rect.top), 0) + 'px');
  }

  /* --- Theme ------------------------------------------------------------- */

  function bindThemeToggle() {
    var toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) return;

    function label() {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      toggle.setAttribute('aria-label', 'Switch to ' + next + ' mode');
      toggle.setAttribute('title', 'Switch to ' + next + ' mode');
    }

    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem('theme', next);
      } catch (e) {}
      label();
    });

    systemDark.addEventListener('change', function (event) {
      if (storedTheme()) return;
      root.setAttribute('data-theme', event.matches ? 'dark' : 'light');
      label();
    });

    label();
  }

  /* --- Scroll reveal & active section ------------------------------------ */

  function bindReveals() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    items.forEach(function (el) { observer.observe(el); });
  }

  function bindActiveNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
    var sections = links
      .map(function (link) { return document.getElementById(link.getAttribute('href').slice(1)); })
      .filter(Boolean);
    if (!sections.length) return;

    var ticking = false;

    function update() {
      ticking = false;
      var marker = window.innerHeight * 0.3;
      var current = sections[0];
      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= marker) current = section;
      });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = sections[sections.length - 1];
      }
      links.forEach(function (link) {
        link.classList.toggle('is-active', link.getAttribute('href') === '#' + current.id);
      });
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  /* --- Abstracts & BibTeX ----------------------------------------------- */

  function bindAbstracts() {
    var containers = document.querySelectorAll('[data-abstract]');

    function measure() {
      containers.forEach(function (container) {
        var copy = container.querySelector('.paper-abstract-copy');
        var button = container.querySelector('.abstract-toggle');
        if (container.classList.contains('is-expanded')) return;
        button.hidden = copy.scrollHeight <= copy.clientHeight + 2;
      });
    }

    containers.forEach(function (container) {
      var button = container.querySelector('.abstract-toggle');
      button.addEventListener('click', function () {
        var expanded = container.classList.toggle('is-expanded');
        button.textContent = expanded ? 'Show less' : 'Show more';
        button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      });
    });

    measure();
    window.addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  }

  function bindBibtex() {
    document.querySelectorAll('[data-bibtex-toggle]').forEach(function (button) {
      var block = document.getElementById(button.getAttribute('aria-controls'));
      if (!block) return;

      button.addEventListener('click', function () {
        block.hidden = !block.hidden;
        button.setAttribute('aria-expanded', block.hidden ? 'false' : 'true');
      });

      var copy = block.querySelector('.bibtex-copy');
      var code = block.querySelector('code');
      if (!copy || !code) return;
      copy.addEventListener('click', function () {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(code.textContent.trim()).then(function () {
          copy.textContent = 'Copied';
          window.setTimeout(function () { copy.textContent = 'Copy'; }, 1400);
        });
      });
    });
  }

  function bindAuthorLists() {
    document.querySelectorAll('[data-authors]').forEach(function (list) {
      var short = list.querySelector('.authors-short');
      var full = list.querySelector('.authors-full');
      var button = list.querySelector('.authors-toggle');
      button.addEventListener('click', function () {
        var expand = full.hidden;
        full.hidden = !expand;
        short.hidden = expand;
        button.setAttribute('aria-expanded', expand ? 'true' : 'false');
        button.textContent = expand ? 'Show fewer' : 'Show all ' + button.dataset.count + ' authors';
      });
    });
  }

  /* --- Init -------------------------------------------------------------- */

  updateNavMetrics();
  window.addEventListener('resize', updateNavMetrics);
  bindThemeToggle();
  bindReveals();
  bindActiveNav();
  bindAbstracts();
  bindBibtex();
  bindAuthorLists();
})();
