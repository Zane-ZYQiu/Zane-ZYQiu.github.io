/* Single-page homepage behaviour: theme toggle, scroll reveal, active nav
   link, collapsible abstracts, BibTeX blocks and the click fireworks.
   Adapted from Ruihong Shen's homepage (https://github.com/ruihong04/ruihong04.github.io). */
(function () {
  var root = document.documentElement;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
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

  /* --- Click fireworks (2D canvas port of the original WebGL version) ---- */

  var FIREWORK_PALETTES = {
    light: { colors: ['#18336d', '#1a44a2', '#2259bc', '#3570cb', '#558bd5'], blend: 'source-over' },
    dark: { colors: ['#eaf1fb', '#d0e1f5', '#9ec3f2', '#6ea2e5', '#4b80d6'], blend: 'lighter' }
  };

  function bindFireworks() {
    if (reducedMotion.matches) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'fireworks-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var bursts = [];
    var width = 0;
    var height = 0;
    var running = false;
    var last = 0;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function rand(min, max) {
      return min + Math.random() * (max - min);
    }

    function spawn(x, y) {
      var palette = FIREWORK_PALETTES[root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'];
      var count = width <= 820 ? 36 : 54;
      var particles = [];
      for (var i = 0; i < count; i += 1) {
        var angle = Math.random() * Math.PI * 2;
        var glow = i >= count - 6;
        var speed = glow ? rand(30, 70) : rand(100, 230);
        var radius = glow ? rand(3, 8) : rand(6, 14);
        particles.push({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + rand(-20, 20),
          size: glow ? rand(3.5, 5.5) : rand(1.4, 2.8),
          alpha: glow ? rand(0.18, 0.3) : rand(0.5, 0.85),
          color: palette.colors[Math.floor(Math.random() * palette.colors.length)]
        });
      }
      bursts.push({ particles: particles, age: 0, life: rand(0.85, 1.2), blend: palette.blend });
      if (bursts.length > 10) bursts.shift();
      if (!running) {
        running = true;
        last = performance.now();
        window.requestAnimationFrame(frame);
      }
    }

    function frame(now) {
      var dt = Math.min((now - last) / 1000, 1 / 24);
      last = now;
      ctx.clearRect(0, 0, width, height);

      for (var b = bursts.length - 1; b >= 0; b -= 1) {
        var burst = bursts[b];
        burst.age += dt;
        var progress = Math.min(burst.age / burst.life, 1);
        var fade = (1 - progress) * (1 - progress);
        var drag = Math.pow(0.93, dt * 60);
        ctx.globalCompositeOperation = burst.blend;

        burst.particles.forEach(function (p) {
          p.vx *= drag;
          p.vy = p.vy * drag + 520 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          ctx.globalAlpha = p.alpha * fade;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.6 + 0.4 * (1 - progress)), 0, Math.PI * 2);
          ctx.fill();
        });

        if (progress >= 1) bursts.splice(b, 1);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      if (bursts.length) {
        window.requestAnimationFrame(frame);
      } else {
        running = false;
        ctx.clearRect(0, 0, width, height);
      }
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('click', function (event) {
      if (event.button !== 0) return;
      spawn(event.clientX, event.clientY);
    }, { passive: true });
  }

  /* --- Init -------------------------------------------------------------- */

  updateNavMetrics();
  window.addEventListener('resize', updateNavMetrics);
  bindThemeToggle();
  bindReveals();
  bindActiveNav();
  bindAbstracts();
  bindBibtex();
  bindFireworks();
})();
